'use client';
import { useActivityStats } from "../../hooks/useActivityStats"
import { StatsCalendar } from "./StatsCalendar"
import { DogStatsCard } from "./DogStatsCard"
import { Dog } from "../../types/Dog"
import { ActivityFilter } from "../../types/ActivityFilter";
import { format } from 'date-fns';

interface SidebarProps {
  dogs: Map<number, Dog>;
  filters: ActivityFilter;
  setFilters: React.Dispatch<React.SetStateAction<ActivityFilter>>
}

export function RightSidebar({ dogs, filters, setFilters }: SidebarProps) {

  const {
    selectedDate,
    setSelectedDate,
    visibleMonth,
    setVisibleMonth,
    weeklyStats,
    monthlyDogDay
  } = useActivityStats();

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
      <StatsCalendar
        data={monthlyDogDay}
        dogColors={dogColors}
        selectedDate={
          filters.start_date
            ? new Date(filters.start_date + 'T00:00:00') // convert back to Date in local time
            : selectedDate
        }
        onDateChange={(date) => {
          const start = format(new Date(date.getFullYear(), date.getMonth(), date.getDate()), 'yyyy-MM-dd');
          const end = format(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1), 'yyyy-MM-dd');
          console.log(start)
          setFilters(f => ({
            ...f,
            start_date: start,
            end_date: end,
            __trigger: 'calendar', // set meta data
          }));
          setSelectedDate(date);
        }}
        visibleMonth={visibleMonth}
        onMonthChange={setVisibleMonth}
      />
      {weeklyStats?.map((stat) => {
        const dog = dogs.get(stat.dog_id)
        return dog ? (
          <DogStatsCard key={stat.dog_id} data={stat} dog={dog} />
        ) : null
      })}
    </div>
  )
}
