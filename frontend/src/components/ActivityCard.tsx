import { Activity } from '../types/Activity'
import { Comment } from '../types/Comment';
import { Menu } from '@headlessui/react'
import { useState, useEffect } from 'react';
import { useGlobalCache } from '../context/GlobalCacheContext'
import { MessageCircle, MoreHorizontal } from 'lucide-react';
import { formatActivityDate } from '../functions/helpers/FormatDate';
import { getRatingColor } from '../functions/helpers/GetRatingColor';
import { getComments } from '../api/comment';

export default function ActivityCard({
  activity,
  onDelete,
  onSuccess,
  onEdit
}: {
  activity: Activity;
  onDelete: (activity_id: number) => void;
  onSuccess?: () => void | Promise<void>;
  onEdit: (activity: Activity) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await getComments(activity.id)
        setComments(res); // expect: Comment[]
      } catch (err) {
        console.error('Failed to load comments', err);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(prev => !prev);
  };


  //activity.dogs.dog.forEach(dog => console.log('Dog:', dog));

  const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp';
  const { runners, dogs, sports } = useGlobalCache();
  const date = formatActivityDate(activity.timestamp);
  const capitalizedLocation = activity.location.charAt(0).toUpperCase() + activity.location.slice(1);

  //const dogNames = activity.dogs.map((d) => d.name).join(', ');

  const sport = [...sports.values()].find(s => s.name === activity.sport.name);
  const speedOrPace =
    sport?.display_mode === 'pace' ? `${activity.pace} min/km` : `${activity.speed.toFixed(1)} km/h`;
  const runnerImageUrl = runners.get(activity.runner.id)
    ? `/profile_picture/runners/${runners.get(activity.runner.id)?.image_url}`
    : DEFAULT_AVATAR;

  const dogElements = activity.dogs.map((dog) => {
    const cachedDog = dogs.get(dog.dog.id);
    const dogImageUrl = cachedDog
      ? `/profile_picture/dogs/${cachedDog.image_url}`
      : DEFAULT_AVATAR;
    return (
      <div key={dog.dog.id} className="flex items-center gap-2">
        <img
          src={dogImageUrl}
          alt={dog.dog.name}
          className="w-14 h-14 rounded-full object-cover border"
        />
        <div>
          <div className="font-semibold text-charcoal text-base text-left">{dog.dog.name}</div>
          <div className={`font-semibold ${getRatingColor(dog.rating)}`}>{dog.rating}</div>
        </div>
      </div>
    );
  });

  return (
    <div className="flex flex-col bg-white border border-stone rounded-2xl shadow-md p-4 gap-1">

      {/* Top-right: Edit Icon */}
      <Menu as="div" className="flex justify-end bg-white">

        <Menu.Button>
          <MoreHorizontal className="w-6 h-6 text-stone cursor-pointer bg-white" />
        </Menu.Button>

        <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onEdit(activity)}
                  className={`${active ? 'bg-gray-100' : 'bg-white'
                    } w-full text-left px-4 py-2 text-sm text-charcoal`}
                >
                  Edit
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onDelete(activity.id)}
                  className={`${active ? 'bg-gray-100' : 'bg-white'
                    } w-full text-left px-4 py-2 text-sm text-red-600`}
                >
                  Delete
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>
      {/* Runner + Dogs + Weather */}
      <div className="flex justify-between gap-4 items-center flex-wrap">
        {/* Runner */}
        <div className="flex items-center gap-3">
          <img
            src={runnerImageUrl}
            alt={activity.runner.name}
            className="w-14 h-14 rounded-full object-cover border"
          />
          <div>
            <div className="font-semibold text-charcoal text-left">{activity.runner.name}</div>
            <div className="text-xs text-stone whitespace-nowrap">{date}</div>
            <div className="text-xs text-stone text-left whitespace-nowrap">{capitalizedLocation}</div>
          </div>
        </div>

        {/* Dogs */}
        <div className={`flex gap-8 ${activity.dogs.length === 1 ? 'mx-auto' : ''}`}>
          {dogElements}
        </div>


        {/* Weather */}
        <div className="text-right min-w-[140px]">
          <div className="text-xs uppercase tracking-wide text-stone">Weather</div>
          <div>{activity.weather.temperature}°C, {activity.weather.humidity * 100}%, {activity.weather.condition}</div>
        </div>
      </div>

      {/* Sport / Distance / Pace */}
      <div className="flex justify-around w-full mt-6 text-center gap-4">
        <div>
          <div className="text-xs text-stone uppercase tracking-wide">Sport</div>
          <div className="text-xl font-bold text-charcoal">{activity.sport.name}</div>
        </div>
        <div>
          <div className="text-xs text-stone uppercase tracking-wide">Distance</div>
          <div className="text-xl font-bold text-charcoal">{activity.distance} km</div>
        </div>
        <div>
          <div className="text-xs text-stone uppercase tracking-wide">
            {sport?.display_mode === 'pace' ? 'Pace' : 'Speed'}
          </div>
          <div className="text-xl font-bold text-charcoal">{speedOrPace}</div>
        </div>

      </div>
      {/* Comment bottom right */}
      {activity.comment_count !== undefined && activity.comment_count > 0 && (
        <div onClick={handleToggleComments}
          className="flex items-center justify-end text-charcoal">
          <MessageCircle className="w-4 h-4" />
          <span>{activity.comment_count}</span>
        </div>
      )}
      {showComments && (
        <div className="mt-2 px-4 pt-2 border-t text-sm text-charcoal space-y-2">
          {loadingComments ? (
            <div className="italic text-stone">Loading comments...</div>
          ) : comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <span className="font-semibold">{comment.user_id}:</span>
                <span>{comment.comment}</span>
              </div>
            ))
          ) : (
            <div className="italic text-stone">No comments yet.</div>
          )}
        </div>
      )}

    </div>
  );
}