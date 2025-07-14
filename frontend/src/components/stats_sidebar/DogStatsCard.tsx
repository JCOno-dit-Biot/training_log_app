import { WeeklyStats, Trend } from "../../types/WeeklyStats"
import { Dog } from "../../types/Dog"

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'


export function DogStatsCard({ data, dog }: {data: WeeklyStats, dog: Dog}) {
  //const { dog_id, total_distance_km, average_rating, trend_distance, trend_rating } = data

  return (
    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={`/profile_picture/dogs/${dog.image_url}`}
          alt={dog.name}
          className="w-10 h-10 rounded-full object-cover border"
        />
        <h4 className="text-sm font-semibold text-gray-800">{dog.name}</h4>
      </div>

      <div className="text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Weekly Distance:</span>
          <span>{data.total_distance_km.toFixed(1)} km {renderTrend(data.trend_distance)}</span>
        </div>
        <div className="flex justify-between">
          <span>Avg Rating:</span>
          <span>{data.average_rating.toFixed(1)} {renderTrend(data.trend_rating)}</span>
        </div>
      </div>
    </div>
  )
}

function renderTrend(trend?: string) {
  const size = 14;
  switch (trend) {
    case "up":
      return <TrendingUp className="text-green-600 inline-block" size={size} />
    case "down":
      return <TrendingDown className="text-red-600 inline-block" size={size} />
    default:
      return <Minus className="text-gray-500 inline-block" size={size} />
  }
}
