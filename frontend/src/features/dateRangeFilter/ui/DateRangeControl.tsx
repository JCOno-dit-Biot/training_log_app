import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

import { type DateRange, type PresetKey } from '../model/DateRangeContext';
import { getPresetRange } from '../model/DateRangeContext';
import { useDateRange } from '../model/useDateRange';

const PRESETS: Array<{ key: PresetKey; label: string }> = [
    { key: 'last4w', label: 'Last 4 weeks' },
    { key: 'last12w', label: 'Last 12 weeks' },
    { key: 'ytd', label: 'YTD' },
    { key: 'last365', label: 'Last 365 days' },
];

function parseYMD(s: string) {
    // safe parse YYYY-MM-DD in local time
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
}

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
            to: parseYMD(range.endDate),
        };
    }, [range.startDate, range.endDate]);

    const triggerLabel = labelForRange(preset, range);

    function applyPreset(next: PresetKey) {
        setPreset(next);
        setRange(getPresetRange(next));
        setOpen(false);
        setMode('presets');
    }
    return (
        <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setMode('presets'); }}>
            <PopoverTrigger asChild>
                <Button variant="default" className="h-9 gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="truncate max-w-[220px]">{triggerLabel}</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-[320px] p-2">
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
                            {format(parseYMD(range.startDate), 'MMM d, yyyy')} –{' '}
                            {format(parseYMD(range.endDate), 'MMM d, yyyy')}
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
                                onClick={() => setOpen(false)}
                                className={cn(
                                    // disabled if invalid
                                    !range.startDate || !range.endDate ? 'pointer-events-none opacity-50' : ''
                                )}
                            >
                                Done
                            </Button>
                        </div>

                        <Calendar
                            mode="range"
                            selected={calendarValue}
                            onSelect={(val) => {
                                if (!val?.from) return;

                                const from = val.from;
                                const to = val.to ?? val.from;

                                setPreset('custom');
                                setRange({
                                    startDate: `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`,
                                    endDate: `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}`,
                                });
                            }}
                            numberOfMonths={2}
                        />

                        <div className="px-2 pt-2 text-xs text-muted-foreground">
                            {format(parseYMD(range.startDate), 'MMM d, yyyy')} –{' '}
                            {format(parseYMD(range.endDate), 'MMM d, yyyy')}
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}