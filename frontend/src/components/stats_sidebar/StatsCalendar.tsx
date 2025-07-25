import Calendar from 'react-calendar'
import { useState } from 'react'
import { parseISO, format } from 'date-fns'
import { DogCalendarDay } from '../../types/DogCalendarDay'
import 'react-calendar/dist/Calendar.css'
import './DogCalendar.css';

type Props = {
  data: DogCalendarDay[]
  onDayClick?: (date: Date) => void
  dogColors: Map<number, string>
  selectedDate: Date
  onDateChange: (date: Date) => void
  visibleMonth: Date
  onMonthChange: (month: Date) => void
}

export function StatsCalendar({
  data,
  onDayClick,
  dogColors,
  selectedDate,
  onDateChange,
  visibleMonth,
  onMonthChange,
}: Props) {
  //const activeDates = new Set(data.map(d => d.date)) // 'YYYY-MM-DD'


  const activeMap = new Map<string, number[]>()
  data?.forEach(({ date, dog_ids }) => {
    const iso = format(parseISO(date), 'yyyy-MM-dd')  // normalize
    activeMap.set(iso, dog_ids)
  })

  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view !== 'month') return ''
    const iso = format(date, 'yyyy-MM-dd')
    return activeMap.has(iso)
      ? 'circled_day'
      : ''
  }

  return (
    <div className="rounded-lg p-2 bg-white shadow-sm mb-4">
      <Calendar
        calendarType="iso8601"
        value={selectedDate}
        onChange={(date) => {
          onDateChange(date as Date); // Cast if needed
          onDayClick?.(date as Date);
        }}
        activeStartDate={visibleMonth}
        onActiveStartDateChange={({ activeStartDate, view }) => {
          if (view === 'month' && activeStartDate) {
            onMonthChange(activeStartDate);
          }
        }}
        tileClassName={tileClassName}
        formatShortWeekday={(locale, date) => {
          const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
          return weekday.charAt(0); // Returns M, T, W, etc.
        }}
        className="w-full border-none text-sm"
        tileContent={({ date, view }) => {
          if (view !== 'month') return null;

          const iso = format(date, 'yyyy-MM-dd');
          const dogs = activeMap.get(iso);
          
          if (!dogs) return null;

          const visibleDots = dogs.slice(0, 2);
          const extra = dogs.length > 2;

          return (
            <div className="custom-day-content">
              <span className="day-number">{date.getDate()}</span>
              {dogs.length === 1 && (
                <span
                  className={`dog-dot centered ${dogColors.get(dogs[0]) ?? 'bg-gray-400'}`}
                />
              )}
              {dogs.length > 1 && (
                <div className="dog-dot-group">
                  {visibleDots.map((id) => (
                    <span
                      key={id}
                      className={`dog-dot ${dogColors.get(id) ?? 'bg-gray-400'}`}
                    />
                  ))}{extra && <span className="dog-count">+</span>}
                  
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  )
}
