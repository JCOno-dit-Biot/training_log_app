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
    <div className="relative bg-white border border-stone rounded-2xl shadow-md p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      {/* Left Column: Runner & Dogs */}
      <div className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4 justify-items-start min-h-[72px]">
          {activity.dogs.map((dog) => {
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
          })}
        </div>
      </div>

      {/* Middle Column: Distance / Speed */}
      <div className="flex flex-col justify-center items-center text-center space-y-2 mt-6">
        <div className="grid grid-cols-2 gap-4">
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
      </div>

      {/* Right Column: Weather (top) + Comment (bottom) */}
      <div className="flex flex-col justify-between h-full items-end text-sm text-stone text-right min-w-[120px]">
        {/* Weather top right */}
        <div>
          <div className="text-xs uppercase tracking-wide text-stone">Weather</div>
          <div>{activity.weather.temperature}°C, {activity.weather.condition}</div>
        </div>

        {/* Comment bottom right */}
        {activity.comment_count !== undefined && (
          <div className="flex items-center justify-end gap-1 text-charcoal mt-4">
            <MessageCircle className="w-4 h-4" />
            <span>{activity.comment_count}</span>
          </div>
        )}
      </div>
    </div>
  );
}