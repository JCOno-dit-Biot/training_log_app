import { Activity } from '../types/Activity'

export default function ActivityCard({ activity }: { activity: Activity }) {

  const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp';
  const date = new Date(activity.timestamp).toLocaleString();
  const dogNames = activity.dogs.map((d) => d.dog.name).join(', ');
  const sport = activity.sport.name;
  const speedOrPace =
    activity.sport.type === 'on-snow' ? `${activity.speed.toFixed(1)} km/h` : `${activity.pace}`;

  return (
    <div className="bg-white border border-stone rounded p-4 shadow-sm space-y-2">
      <div className="flex items-center gap-3">
        <img
          src={activity.runner.image_url || DEFAULT_AVATAR}
          alt={activity.runner.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold text-charcoal">{activity.runner.name}</div>
          <div className="text-xs text-stone">{date}</div>
        </div>
      </div>

      <div className="text-charcoal text-sm">
        Ran with <strong>{dogNames}</strong>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-stone">
        <span className="capitalize">Sport: {sport}</span>
        <span>Distance: {activity.distance} km</span>
        <span>Speed/Pace: {speedOrPace}</span>
        <span>
          Weather: {activity.weather.temperature}°C, {activity.weather.condition}
        </span>
      </div>

      {activity.notes && (
        <div className="text-sm text-charcoal italic border-t pt-2">{activity.notes}</div>
      )}
    </div>
  );
}