import { Activity } from '../types/Activity'
import { useGlobalCache } from '../context/GlobalCacheContext'
import { MessageCircle, MoreHorizontal } from 'lucide-react';
import { act } from 'react';
import { formatActivityDate } from '../functions/helpers/FormatDate';
import { getRatingColor } from '../functions/helpers/GetRatingColor';

export default function ActivityCard({ activity }: { activity: Activity }) {
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
      <div key={dog.id} className="flex items-center gap-2">
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
      <div className="flex justify-end">
        <MoreHorizontal className="w-5 h-5 text-stone cursor-pointer" />
      </div>
      
      {/* Runner + Dogs + Weather */}
      <div className="flex justify-between gap-4 items-center flex-wrap">
          {/* Runner */}
          <div className="flex items-center gap-3">
            <img
              src={runnerImageUrl}
              alt={activity.runner.name }
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
          <div>{activity.weather.temperature}°C, {activity.weather.humidity*100}%, {activity.weather.condition}</div>
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
        {activity.comment_count !== undefined && (
          <div className="flex items-center justify-end text-charcoal">
            <MessageCircle className="w-4 h-4" />
            <span>{activity.comment_count}</span>
          </div>
        )}
      </div>
  );
}