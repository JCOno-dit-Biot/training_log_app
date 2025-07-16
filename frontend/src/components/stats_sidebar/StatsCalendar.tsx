import Calendar from 'react-calendar'
import { format } from 'date-fns'
import { DogCalendarDay } from '../../types/DogCalendarDay'
import 'react-calendar/dist/Calendar.css'


type Props = {
  data: DogCalendarDay[]
  onDayClick?: (date: Date) => void
  dogColors: Map<number, string>
}

export function StatsCalendar({ data, onDayClick, dogColors }: Props) {
  //const activeDates = new Set(data.map(d => d.date)) // 'YYYY-MM-DD'

  const activeMap = new Map<string, number[]>()
  data.forEach(({ date, dog_ids }) => {
    activeMap.set(date, dog_ids)
  })


  return (
    <div className="rounded-lg p-2 bg-white shadow-sm">
      <Calendar
        onClickDay={onDayClick}
        tileClassName={({ date, view }) => {
          if (view !== 'month') return ''
          const iso = format(date, 'yyyy-MM-dd')
          return activeMap.has(iso) ? 'bg-gray-100 rounded-full border border-gray-400' : ''
        }}
        tileContent={({ date, view }) => {
          if (view !== "month") return null
          const iso = format(date, "yyyy-MM-dd")
          const dogs = activeMap.get(iso)
          if (!dogs) return null

          const visibleDots = dogs.slice(0, 2)
          const extra = dogs.length > 2

          return (
            <div className="flex justify-center gap-[2px]">
              {visibleDots.map((id) => (
                <div
                  key={id}
                  className={`w-1.5 h-1.5 rounded-full ${dogColors.get(id) ?? "bg-gray-400"}`}
                />
              ))}
              {extra && <span className="text-[10px] text-gray-500 font-bold ml-1">+</span>}
            </div>
          )
        }}

        className="w-full border-none"
      />
    </div>
  )
}
