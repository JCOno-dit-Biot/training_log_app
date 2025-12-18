import { useContext } from 'react';

import { DateRangeContext } from './DateRangeContext';

export function useDateRange() {
    const ctx = useContext(DateRangeContext);
    if (!ctx) {
        throw new Error('useAnalyticsDateRange must be used within AnalyticsDateRangeProvider');
    }
    return ctx;
}