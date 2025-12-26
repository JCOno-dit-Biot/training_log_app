import { daysInclusive, parseYMD, toYMD } from "@/shared/util/dates";

import { type DateRange, type PresetKey, shiftRange } from "../model/DateRangeContext";

export function getPreviousPeriod(range: DateRange): DateRange {
    const len = daysInclusive(range);
    // previous period ends the day before current starts
    // so shift back by len days
    return shiftRange(range, -len);
}

function addYears(d: Date, years: number) {
    const x = new Date(d);
    x.setFullYear(x.getFullYear() + years);
    return x;
}

// special case for YTD, compare the same period over previous year: "YTD up to same day last year"
// otherwise just same len of time before start of current
export function getComparisonRange(range: DateRange, preset: PresetKey): DateRange {
    if (preset === 'ytd') {
        const start = parseYMD(range.startDate);
        const end = parseYMD(range.endDate);
        return {
            startDate: toYMD(addYears(start, -1)),
            endDate: toYMD(addYears(end, -1)),
        };
    }
    return getPreviousPeriod(range);
}
