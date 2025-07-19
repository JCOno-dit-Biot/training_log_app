import { useEffect, useState } from 'react';
import { getWeeklyStats } from '../api/stats/weeklyStats';
import { getCalendarDay } from '../api/stats/dogCalendarDay';
import { WeeklyStats } from '../types/WeeklyStats';
import { DogCalendarDay } from '../types/DogCalendarDay';

export function useActivityStats() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[] | null>(null);
  const [monthlyDogDay, setMonthlyDogDay] = useState<DogCalendarDay[] | null>(null);

  useEffect(() => {
    getWeeklyStats(selectedDate).then(setWeeklyStats);
  }, [selectedDate]);

  useEffect(() => {
    getCalendarDay({
        month: visibleMonth.getMonth() +1,
        year: visibleMonth.getFullYear()
  }).then(setMonthlyDogDay);
  }, [visibleMonth]);

  return {
    selectedDate,
    setSelectedDate,
    visibleMonth,
    setVisibleMonth,
    weeklyStats,
    monthlyDogDay,
  };
}
