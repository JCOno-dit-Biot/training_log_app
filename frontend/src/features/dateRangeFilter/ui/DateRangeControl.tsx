import { useEffect, useMemo, useState } from 'react';
import type { DateRange as DayPickerRange } from "react-day-picker";
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { parseYMD, toYMD } from '@/shared/util/dates';

import { type DateRange, type PresetKey } from '../model/DateRangeContext';
import { getPresetRange } from '../model/DateRangeContext';
import { useDateRange } from '../model/useDateRange';

const PRESETS: Array<{ key: PresetKey; label: string }> = [
    { key: 'last4w', label: 'Last 4 weeks' },
    { key: 'last12w', label: 'Last 12 weeks' },
    { key: 'ytd', label: 'YTD' },
    { key: 'last365', label: 'Last 365 days' },
];

function labelForRange(preset: PresetKey, range: DateRange) {
    const presetLabel = PRESETS.find((p) => p.key === preset)?.label;
    if (presetLabel) return presetLabel;
    const start = parseYMD(range.startDate);
    const end = parseYMD(range.endDate);
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
}

export function DateRangeControl() {
    // Replace these with your actual state/store props
    const { range, setRange, preset, setPreset } = useDateRange();

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'presets' | 'custom'>('presets');


    // Calendar uses Date objects
    const calendarValue = useMemo(() => {
        return {
            from: parseYMD(range.startDate),
            to: range.endDate ? parseYMD(range.endDate) : undefined,
        };
    }, [range.startDate, range.endDate]);

    const [draft, setDraft] = useState<DayPickerRange>(calendarValue);

    useEffect(() => {
        if (mode === "custom") setDraft(calendarValue);
    }, [mode, calendarValue]);

    const triggerLabel = labelForRange(preset, range);

    function applyPreset(next: PresetKey) {
        setPreset(next);
        setRange(getPresetRange(next));
        setOpen(false);
        setMode('presets');
    }

    const draftIsValid = !!draft?.from && !!draft?.to;

    return (
        <Popover
            open={open}
            onOpenChange={(v) => { setOpen(v); if (!v) setMode('presets'); }}
        >
            <PopoverTrigger asChild>
                <Button variant="default" className="h-9 gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="truncate max-w-[220px]">{triggerLabel}</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-[400px] z-10 p-2">
                {mode === 'presets' ? (
                    <div className="flex flex-col">
                        <div className="px-2 py-2 text-sm font-medium text-muted-foreground">
                            Date range
                        </div>

                        <div className="flex flex-col gap-1 px-1">
                            {PRESETS.map((p) => (
                                <Button
                                    key={p.key}
                                    type="button"
                                    variant={preset === p.key ? 'secondary' : 'ghost'}
                                    className="justify-start"
                                    onClick={() => applyPreset(p.key)}
                                >
                                    {p.label}
                                </Button>
                            ))}
                        </div>

                        <div className="my-2 h-px bg-border" />

                        <Button
                            type="button"
                            variant={preset === 'custom' ? 'secondary' : 'ghost'}
                            className="justify-start"
                            onClick={() => {
                                setPreset('custom');
                                setMode('custom');
                            }}
                        >
                            Custom…
                        </Button>
                        <div className="px-2 pt-2 text-xs text-muted-foreground">
                            {range.startDate && range.endDate
                                ? `${format(parseYMD(range.startDate), "MMM d, yyyy")} – ${format(parseYMD(range.endDate), "MMM d, yyyy")}`
                                : "Select a start and end date"}
                        </div>
                    </div>
                ) : (
                    <div className="p-1">
                        <div className="flex items-center justify-between px-1 pb-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setMode('presets')}
                            >
                                ← Presets
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    if (!draft?.from) return;

                                    // If user picked only one day, treat it as a 1-day range
                                    const from = draft.from;
                                    const to = draft.to ?? draft.from;

                                    setPreset("custom");
                                    setRange({ startDate: toYMD(from), endDate: toYMD(to) });
                                    setOpen(false);
                                }}
                                className={cn(!draft?.from ? "pointer-events-none opacity-50" : "")}
                            >
                                Done
                            </Button>
                        </div>

                        <Calendar
                            className="w-full bg-card/95"
                            mode="range"
                            selected={draft}
                            onDayClick={(day) => {
                                if (draft?.from && draft?.to) {
                                    setDraft({ from: day, to: undefined });
                                }
                            }}
                            onSelect={(val) => {
                                if (!val?.from) return;
                                setDraft(val);
                            }}
                            numberOfMonths={2}
                        />
                        <div className="px-2 pt-2 text-xs text-muted-foreground">
                            {draft?.from ? format(draft.from, "MMM d, yyyy") : "—"} –{" "}
                            {draft?.to ? format(draft.to, "MMM d, yyyy") : "—"}
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}