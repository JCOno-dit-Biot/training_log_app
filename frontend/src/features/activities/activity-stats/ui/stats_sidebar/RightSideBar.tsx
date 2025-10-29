'use client';
import { format } from 'date-fns';

import type { ActivityFilter } from '@entities/activities/model';
import type { Dog } from '@entities/dogs/model';
import { useActivityStats } from '@features/activities/activity-stats/model/useActivityStats';

import { DogStatsCard } from './DogStatsCard';
import { StatsCalendar } from './StatsCalendar';
//import { useGlobalCache } from "../../context/GlobalCacheContext";

interface SidebarProps {
  dogs: Map<number, Dog>;
  filters: ActivityFilter;
  setFilters: React.Dispatch<React.SetStateAction<ActivityFilter>>;
}

export function RightSidebar({ dogs, filters, setFilters }: SidebarProps) {
  const {
    selectedDate,
    setSelectedDate,
    visibleMonth,
    setVisibleMonth,
    weeklyStats,
    monthlyDogDay,
  } = useActivityStats();

  const dogColors = new Map(Array.from(dogs.entries()).map(([id, dog]) => [id, dog.color]));

  return (
    <div className="bg-primary fixed top-0 right-0 h-screen w-[350px] overflow-y-auto border-l p-4 shadow-md">
      <StatsCalendar
        data={monthlyDogDay}
        dogColors={dogColors}
        selectedDate={
          filters.start_date
            ? new Date(filters.start_date + 'T00:00:00') // convert back to Date in local time
            : selectedDate
        }
        onDateChange={(date) => {
          const start = format(
            new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            'yyyy-MM-dd',
          );
          const end = format(
            new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
            'yyyy-MM-dd',
          );
          console.log(start);
          setFilters((f) => ({
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
        const dog = dogs.get(stat.dog_id);
        return dog ? <DogStatsCard key={stat.dog_id} data={stat} dog={dog} /> : null;
      })}
    </div>
  );
}
