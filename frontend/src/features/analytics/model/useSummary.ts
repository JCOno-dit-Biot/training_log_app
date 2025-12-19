import { analyticsKeys } from '@entities/activity-stats/model/analytics.keys';
import type { summaryRow } from '@entities/activity-stats/model/analytics.types';
import { fetchSummary } from '@/entities/activity-stats/api/analytics';
import type { DateRangeParams } from '@/shared/types/DateRangeParams';

import { useQuery } from '@tanstack/react-query';

export function useWeeklySummary(range: DateRangeParams) {
    return useQuery<summaryRow>({
        queryKey: analyticsKeys.summary(range),
        queryFn: () => fetchSummary(range),
        placeholderData: (prev) => prev,
    });
}