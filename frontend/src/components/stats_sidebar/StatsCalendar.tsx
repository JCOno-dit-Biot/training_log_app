import { DogCalendarDay } from "../../types/DogCalendarDay"

export function StatsCalendar({ data }: {data: DogCalendarDay}) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2">Training Calendar</h3>
      {/* Replace with calendar UI (e.g. react-calendar or custom grid) */}
      <div className="text-xs text-muted-foreground">[Calendar here]</div>
    </div>
  )
}
