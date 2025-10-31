import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import type { WeeklyStats } from '@entities/activity-stats/model';
import type { Dog } from '@entities/dogs/model';

export function DogStatsCard({ data, dog }: { data: WeeklyStats; dog: Dog }) {
  //const { dog_id, total_distance_km, average_rating, trend_distance, trend_rating } = data

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <img
          src={`/profile_picture/dogs/${dog.image_url}`}
          alt={dog.name}
          className="h-10 w-10 rounded-full border object-cover"
        />
        <h4 className="text-sm font-semibold text-gray-800">{dog.name}</h4>
      </div>

      <div className="text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Weekly Distance:</span>
          <span>
            {data.total_distance_km.toFixed(1)} km {renderTrend(data.trend_distance)}
            <span className="text-xs text-gray-500">
              {' '}
              (prev. {data.previous_week_distance_km.toFixed(1)})
            </span>
          </span>
        </div>
        <div className="flex justify-between">
          <span>Avg Rating:</span>
          <span>
            {data.average_rating != null ? (
              <>
                {data.average_rating.toFixed(1)} {renderTrend(data.trend_rating)}
              </>
            ) : (
              <span className="text-xs text-gray-400">(no rating)</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function renderTrend(trend?: string) {
  const size = 14;
  switch (trend) {
    case 'up':
      return <TrendingUp className="inline-block text-green-600" size={size} />;
    case 'down':
      return <TrendingDown className="inline-block text-red-500" size={size} />;
    default:
      return <Minus className="inline-block text-gray-500" size={size} />;
  }
}
