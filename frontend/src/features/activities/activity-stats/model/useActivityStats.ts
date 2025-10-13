import { useEffect, useState } from 'react';
import { getWeeklyStats } from '../api/stats/weeklyStats';
import { getCalendarDay } from '../api/stats/dogCalendarDay';
import { WeeklyStats } from '../types/WeeklyStats';
import { DogCalendarDay } from '../types/DogCalendarDay';

import { getFirstDayOfMonth } from '../functions/helpers/getFirstDayOfMonth';

export function useActivityStats(initialDate = new Date()) {

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [visibleMonth, setVisibleMonth] = useState(getFirstDayOfMonth(initialDate));
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[] | null>(null);
  const [monthlyDogDay, setMonthlyDogDay] = useState<DogCalendarDay[] | null>(null);

  useEffect(() => {
    getWeeklyStats(selectedDate).then((data) => {
      setWeeklyStats(data);
    }).catch((err) => console.error('[ActivityStats] Weekly stats error:', err));
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
    monthlyDogDay
  }
}
