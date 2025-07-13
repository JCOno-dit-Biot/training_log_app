import { StatsCalendar } from "./StatsCalendar"
import { DogStatsCard } from "./DogStatsCard"

export function RightSidebar({ calendarData, weeklyStats }) {
  return (
    <div className="fixed right-0 top-0 h-screen w-[300px] border-l bg-white p-4 shadow-md overflow-y-auto">
      <StatsCalendar data={calendarData} />
      {weeklyStats.map((stat) => (
        <DogStatsCard key={stat.dog_id} data={stat} />
      ))}
    </div>
  )
}
