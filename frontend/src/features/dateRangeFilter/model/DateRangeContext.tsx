import { createContext } from 'react';

export type DateRange = {
  startDate: string; // yyyy-mm-dd
  endDate: string;   // yyyy-mm-dd
};

export type PresetKey = 'last4w' | 'last12w' | 'ytd' | 'last365' | 'custom';

export type DateRangeContextValue = {
  range: DateRange;
  setRange: (next: DateRange) => void;

  // convenient setters
  setStartDate: (startDate: string) => void;
  setEndDate: (endDate: string) => void;

  // optional: presets
  preset: PresetKey;
  setPreset: (preset: PresetKey) => void;

  // useful for react-query query keys
  queryParams: DateRange;
};

export const DateRangeContext = createContext<DateRangeContextValue | null>(null);

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function getPresetRange(preset: PresetKey, now = new Date()): DateRange {
  const endDate = toYMD(now);

  if (preset === 'ytd') {
    return { startDate: toYMD(startOfYear(now)), endDate };
  }
  if (preset === 'last4w') {
    return { startDate: toYMD(addDays(now, -28)), endDate };
  }
  if (preset === 'last12w') {
    return { startDate: toYMD(addDays(now, -84)), endDate };
  }
  // last365
  return { startDate: toYMD(addDays(now, -365)), endDate };
}

