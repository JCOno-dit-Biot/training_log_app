import { format, isToday, isYesterday } from 'date-fns';

export function formatActivityDate(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  return `${format(date, 'MMMM d, yyyy')} at ${format(date, 'h:mm a')}`;
}
