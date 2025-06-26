import { Activity } from '../types/Activity'
import { useGlobalCache } from '../context/GlobalCacheContext'
import { MessageCircle } from 'lucide-react';
import { act } from 'react';
import { formatActivityDate } from '../functions/helpers/FormatDate';
import { getRatingColor } from '../functions/helpers/GetRatingColor';

export default function ActivityCard({ activity }: { activity: Activity }) {
  const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp';
  const { runners, dogs, sports } = useGlobalCache();
  const date = formatActivityDate(activity.timestamp);
  const capitalizedLocation = activity.location.charAt(0).toUpperCase() + activity.location.slice(1);

  //const dogNames = activity.dogs.map((d) => d.name).join(', ');

  const dogElement = activity.dogs.map((dog) => {
    const cachedDog = dogs.get(dog.dog.id);
    const dogImageUrl = cachedDog
    ? `/profile_picture/dogs/${cachedDog.image_url}`
    : DEFAULT_AVATAR;

    return (
    <div key={dog.id} className="flex items-center gap-3">
      <img
        src={dogImageUrl}
        alt={dog.dog.name}
        className="w-14 h-14 rounded-full object-cover border"
      />
      <div>
        <div className='font-semibold text-charcoal text-base text-left'>{dog.dog.name}</div>
        <div className={`font-semibold ${getRatingColor(dog.rating)}`}>{dog.rating}</div>
      </div>
    </div>
  );
  })
  
  const sport = [...sports.values()].find(s => s.name === activity.sport.name);
  const speedOrPace =
    sport?.display_mode === 'pace' ? `${activity.pace}` : `${activity.speed.toFixed(1)} km/h`;
  const runnerImageUrl = runners.get(activity.runner.id)
    ? `/profile_picture/runners/${runners.get(activity.runner.id)?.image_url}`
    : DEFAULT_AVATAR; 

  const dogImageUrl = dogs.get(activity.runner.id)
    ? `/profile_picture/dogs/${dogs.get(activity.dogs.id)?.image_url}`
    : DEFAULT_AVATAR; 

  return (
    <div className="bg-white border border-stone rounded-2xl shadow-md p-4 flex justify-between items-start gap-4">
      {/* Left Column */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={runnerImageUrl}
            alt={activity.runner.name}
            className="w-14 h-14 rounded-full object-cover border"
          />
          <div>
            <div className="font-semibold text-charcoal text-left">{activity.runner.name}</div>
            <div className="text-xs text-stone">{date}</div>
            <div className="text-xs text-stone text-left">{capitalizedLocation}</div>
          </div>
        </div>

        <div className="text-sm text-charcoal">
          <div className="flex gap-2 mt-1">
            {dogElement}
          </div>
        </div>

        <div className="text-sm text-stone capitalize">Sport: {sport?.name}</div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col items-end gap-2 text-sm text-stone min-w-[120px] text-right">
        <div>Distance: {activity.distance} km</div>
        {sport?.display_mode === 'pace' ? (
          <div>Pace: {speedOrPace}</div>
        ) : activity.speed !== undefined ? (
          <div>Speed: {speedOrPace}</div>
        ) : null}
        <div>
          Weather: {activity.weather.temperature}°C,{' '}
          {activity.weather.condition}
        </div>
        {activity.comment_count !== undefined && (
          <div className="flex items-center justify-end gap-1 text-charcoal">
            <MessageCircle className="w-4 h-4" />
            <span>{activity.comment_count}</span>
          </div>
        )}
      </div>
    </div>
  );
}