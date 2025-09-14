export function combineLocalDateTimeToUTCISO(dateStr?: string, timeStr?: string): string | null {
  if (!dateStr || !timeStr) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return null;


  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm, ss] = timeStr.split(":").map(Number);
  const date = new Date(y, m - 1, d, hh, mm, isNaN(ss) ? 0 : ss, 0); // LOCAL time
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;        // ISO in UTC
}