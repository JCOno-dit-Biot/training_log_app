import { useEffect, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';

import { useDateRange } from '../model/useDateRange';

type Preset = 'last4w' | 'last12w' | 'ytd' | 'last365';

const PRESETS: { key: Preset; label: string }[] = [
    { key: 'last4w', label: 'Last 4 weeks' },
    { key: 'last12w', label: 'Last 12 weeks' },
    { key: 'ytd', label: 'YTD' },
    { key: 'last365', label: 'Last 365 days' },
];

function clampRange(startDate: string, endDate: string) {
    // ensure start <= end
    if (startDate && endDate && startDate > endDate) {
        return { startDate: endDate, endDate: startDate };
    }
    return { startDate, endDate };
}

export function DateRangePicker({
    title = 'Date range',
    compact = false,
}: {
    title?: string;
    compact?: boolean;
}) {
    const { range, setRange, preset, setPreset } = useDateRange();

    // local draft state so typing doesn’t refetch until Apply
    const [draftStart, setDraftStart] = useState(range.startDate);
    const [draftEnd, setDraftEnd] = useState(range.endDate);

    useEffect(() => {
        setDraftStart(range.startDate);
        setDraftEnd(range.endDate);
    }, [range.startDate, range.endDate]);

    const apply = () => {
        const next = clampRange(draftStart, draftEnd);
        setRange(next);
    };

    const resetToPreset = (p: Preset) => {
        setPreset(p);
        // provider will update range; effect will sync drafts
    };

    return (
        <Card className={compact ? 'p-3' : 'p-4'}>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">{title}</div>

                    <div className="flex flex-wrap items-center gap-2">
                        {PRESETS.map((p) => (
                            <Button
                                key={p.key}
                                type="button"
                                size="sm"
                                variant={preset === p.key ? 'default' : 'outline'}
                                onClick={() => resetToPreset(p.key)}
                            >
                                {p.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="analytics-start">Start</Label>
                        <input
                            id="analytics-start"
                            type="date"
                            value={draftStart}
                            onChange={(e) => setDraftStart(e.target.value)}
                            className="h-9 rounded-md border px-3 text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="analytics-end">End</Label>
                        <input
                            id="analytics-end"
                            type="date"
                            value={draftEnd}
                            onChange={(e) => setDraftEnd(e.target.value)}
                            className="h-9 rounded-md border px-3 text-sm"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button type="button" onClick={apply} className="w-full md:w-auto">
                            Apply
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setDraftStart(range.startDate);
                                setDraftEnd(range.endDate);
                            }}
                            className="w-full md:w-auto"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
