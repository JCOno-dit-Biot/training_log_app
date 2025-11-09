// Returns local date as 'yyyy-MM-dd'
export function toYMD(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatMonthDay(d: string | Date): string {
    let localDate: Date;

    if (typeof d === 'string') {
        // Safe parse: treat "YYYY-MM-DD" as local, not UTC
        const [year, month, day] = d.split('-').map(Number);
        localDate = new Date(year, month - 1, day);
    } else {
        localDate = d;
    }

    const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
    return fmt.format(localDate);
}

export function combineLocalDateTimeToUTCISO(dateStr?: string, timeStr?: string): string | null {
    if (!dateStr || !timeStr) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return null;

    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm, ss] = timeStr.split(':').map(Number);
    const date = new Date(y, m - 1, d, hh, mm, isNaN(ss) ? 0 : ss, 0); // LOCAL time
    return Number.isFinite(date.getTime()) ? date.toISOString() : null; // ISO in UTC
}