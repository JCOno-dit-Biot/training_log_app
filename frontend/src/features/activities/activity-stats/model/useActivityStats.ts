import { useEffect, useState } from 'react';

import { getCalendarDay } from '@entities/activity-stats/api/dogCalendarDay';
import { getWeeklyStats } from '@entities/activity-stats/api/weeklyStats';
import type { DogCalendarDay, WeeklyStats } from '@entities/activity-stats/model';

import { getFirstDayOfMonth } from '../util/getFirstDayOfMonth';

export function useActivityStats(initialDate = new Date()) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [visibleMonth, setVisibleMonth] = useState(getFirstDayOfMonth(initialDate));
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[] | null>(null);
  const [monthlyDogDay, setMonthlyDogDay] = useState<DogCalendarDay[] | null>(null);

  useEffect(() => {
    getWeeklyStats(selectedDate)
      .then((data) => {
        setWeeklyStats(data);
      })
      .catch((err) => console.error('[ActivityStats] Weekly stats error:', err));
  }, [selectedDate]);

  useEffect(() => {
    getCalendarDay({
      month: visibleMonth.getMonth() + 1,
      year: visibleMonth.getFullYear(),
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
