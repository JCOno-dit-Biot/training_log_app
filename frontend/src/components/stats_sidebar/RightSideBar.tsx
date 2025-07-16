import { StatsCalendar } from "./StatsCalendar"
import { DogStatsCard } from "./DogStatsCard"

import { DogCalendarDay } from "../../types/DogCalendarDay"
import { WeeklyStats } from "../../types/WeeklyStats"
import { Dog } from "../../types/Dog"

export function RightSidebar(
  { calendarData, weeklyStats, dogs }:
  {calendarData: DogCalendarDay[],
    weeklyStats: WeeklyStats[],
    dogs: Map<number, Dog>}) {
    
  // temporary map for development
  const dogColors = new Map<number, string>([
    [1, "bg-red-500"],
    [2, "bg-cyan-400"],
    [3, "bg-blue-700"],
    [4, "bg-orange-500"]
  ])
  console.log(weeklyStats)
  return (
    <div className="fixed right-0 top-0 h-screen w-[350px] border-l bg-primary p-4 shadow-md overflow-y-auto">
      <StatsCalendar data={calendarData} dogColors={dogColors} />
      {weeklyStats.map((stat) => {
        const dog = dogs.get(stat.dog_id)
        return dog ? (
          <DogStatsCard key={stat.dog_id} data={stat} dog={dog} />
        ) : null
    })}
    </div>
  )
}
