import { useContext } from 'react';

import { DateRangeContext } from './DateRangeContext';

export function useAnalyticsDateRange() {
    const ctx = useContext(DateRangeContext);
    if (!ctx) {
        throw new Error('useAnalyticsDateRange must be used within AnalyticsDateRangeProvider');
    }
    return ctx;
}