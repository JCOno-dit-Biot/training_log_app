import { Activity } from '../types/Activity'
import { Comment } from '../types/Comment';
import { Menu } from '@headlessui/react'
import { useState, useEffect } from 'react';
import React from 'react';
import { useGlobalCache } from '../context/GlobalCacheContext'
import { MessageCircle, MoreHorizontal, Trash2, Rocket } from 'lucide-react';
import { formatActivityDate } from '../functions/helpers/FormatDate';
import { getRatingColor } from '../functions/helpers/GetRatingColor';
import { getComments, postComment, deleteComment } from '../api/comment';

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
  const [newComment, setNewComment] = useState('');
  const [showLaps, setShowLaps] = useState(false);

  const currentUsername = localStorage.getItem("email");

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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const comment: Comment = {
        username: currentUsername,
        activity_id: activity.id,
        comment: newComment
      }
      const saved = await postComment(
        comment
      );

      const savedComment = { ...comment, id: saved.id };

      console.log(savedComment)
      setComments(prev => [...prev, savedComment]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(activity.id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
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
          <div className="flex items-center gap-2 text-xl font-bold text-charcoal">{activity.sport.name}
            {activity.workout && (
              <button
                onClick={() => setShowLaps(prev => !prev)}
                className="group"
                title="Toggle Laps"
              >
                <Rocket
                  className={`w-5 h-5 transition-transform duration-150 text-primary group-hover:scale-110 group-hover:text-accent cursor-pointer ${showLaps ? 'rotate-12' : ''
                    }`}
                />
              </button>
            )}
          </div>
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
      {showLaps && activity.laps.length > 0 && (
      <div className="mt-3 px-4 py-2 rounded-md bg-secondary border border-primary">
        <div className="grid grid-cols-3 gap-2 text-center text-sm text-charcoal">
          <div className="font-bold text-primary">Lap</div>
          <div className="font-bold text-primary">Distance</div>
          <div className="font-bold text-primary">Time</div>

          {activity.laps.map((lap) => (
            <React.Fragment key={lap.lap_number}>
              <div>Lap {lap.lap_number + 1}</div>
              <div>{lap.lap_distance} km</div>
              <div>{lap.lap_time}</div>
            </React.Fragment>
          ))}
        </div>
        </div>
      )}

      {/* Comment bottom right */}
      {activity.comment_count !== undefined && (
        <div onClick={handleToggleComments}
          className="flex items-center justify-end text-charcoal gap-1 cursor-pointer">
          <MessageCircle className="w-4 h-4 hover:text-primary hover:scale-110 transition-transform duration-150" />
          <span>{activity.comment_count}</span>
        </div>
      )}
      {showComments && (
        <div className="mt-2 px-4 pt-2 border-t text-sm text-charcoal space-y-2">
          {loadingComments ? (
            <div className="italic text-stone">Loading comments...</div>
          ) : comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="flex justify-between item-center gap-2">
                <span>{comment.comment}</span>
                {currentUsername === comment.username && (
                  <Trash2 className="w-4 h-4 text-red-500 text-xs" onClick={() => handleDeleteComment(comment.id)} />
                )}
              </div>
            ))
          ) : (
            <div className="italic text-stone">No comments yet.</div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="flex-1 bg-gray-200 rounded px-2 py-1 text-sm"
            />
            <button
              onClick={handleAddComment}
              className="px-3 py-1 bg-primary text-white cursor-pointer rounded hover:bg-opacity-90 text-sm"
              disabled={!newComment.trim()}
            >
              Post
            </button>
          </div>
        </div>
      )}

    </div>
  );
}