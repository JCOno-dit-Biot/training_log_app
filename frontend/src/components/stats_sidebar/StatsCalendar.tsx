import { DogCalendarDay } from "../../types/DogCalendarDay"
import { useMemo } from "react"
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth } from "date-fns"


export function StatsCalendar({ data }: {data: DogCalendarDay[]}) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const firstDayOfMonth = startOfMonth(today)
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 }) // Monday start

  const activeDates = useMemo(() => new Set(data.map(d => d.date)), [data])

  const days = Array.from({ length: 42 }, (_, i) => {
    const day = addDays(startDate, i)
    const iso = format(day, "yyyy-MM-dd")
    const isActive = activeDates.has(iso)

    return (
      <div
        key={i}
        className={`flex items-center justify-center w-8 h-8 text-sm rounded-full ${
          isActive ? "border-2 border-gray-500 text-black font-semibold" : "text-gray-900"
        } ${!isSameMonth(day, today) ? "opacity-30" : ""}`}
      >
        {day.getDate()}
      </div>
    )
  })

  return (
    <div className="text-cream mb-4">
      <h3 className="text-sm font-semibold mb-2">Training Calendar</h3>
      <div className="grid grid-cols-7 gap-1 bg-cream border rounded-lg">
        {days}
      </div>
    </div>
  )
}
