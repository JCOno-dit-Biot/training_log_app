import { WeeklyStats, Trend } from "../../types/WeeklyStats"

export function DogStatsCard({ data }: {data: WeeklyStats}) {
  //const { dog_id, total_distance_km, average_rating, trend_distance, trend_rating } = data

  return (
    <div className="border rounded-lg p-3 mb-3 shadow-sm bg-gray-50">
      <h4 className="text-sm font-medium mb-1">{data.dog_id}</h4>
      <p className="text-xs">Distance: {data.total_distance_km.toFixed(1)} km {renderTrend(data.trend_distance)}</p>
      <p className="text-xs">Rating: {data.average_rating.toFixed(1)} {renderTrend(data.trend_rating)}</p>
    </div>
  )
}

function renderTrend(trend: Trend) {
  if (trend === "up") return "up"
  if (trend === "down") return "down"
  return "same"
}
