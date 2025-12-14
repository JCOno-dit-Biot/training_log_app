import React, { useCallback, useMemo, useState } from 'react';

import {
    type DateRange,
    DateRangeContext,
    type DateRangeContextValue,
    getPresetRange,
    type Preset,
} from './DateRangeContext';

export function DateRangeProvider({
    children,
    defaultPreset = 'ytd',
}: {
    children: React.ReactNode;
    defaultPreset?: Preset;
}) {
    const [preset, setPresetState] = useState<Preset>(defaultPreset);
    const [range, setRangeState] = useState<DateRange>(() => getPresetRange(defaultPreset));

    const setPreset = useCallback((p: Preset) => {
        setPresetState(p);
        setRangeState(getPresetRange(p));
    }, []);

    const setRange = useCallback((next: DateRange) => {
        // When user manually sets dates, we keep preset but you could also set preset to something like 'custom'
        setRangeState(next);
    }, []);

    const setStartDate = useCallback((startDate: string) => {
        setRangeState((r) => ({ ...r, startDate }));
    }, []);

    const setEndDate = useCallback((endDate: string) => {
        setRangeState((r) => ({ ...r, endDate }));
    }, []);

    const value = useMemo<DateRangeContextValue>(() => {
        return {
            range,
            setRange,
            setStartDate,
            setEndDate,
            preset,
            setPreset,
            queryParams: range, // same shape your hooks expect
        };
    }, [range, preset, setPreset, setRange, setStartDate, setEndDate]);

    return (
        <DateRangeContext.Provider value={value}>
            {children}
        </DateRangeContext.Provider>
    );
}
