import type { DateRangeParams } from '@/shared/types/DateRangeParams';

export const analyticsKeys = {
    all: ['analytics'] as const,

    summary: (range: DateRangeParams) =>
        [...analyticsKeys.all, 'weeklySummary', range.startDate, range.endDate] as const,

    weeklyMileage: (range: DateRangeParams) =>
        [...analyticsKeys.all, 'weeklyMileage', range.startDate, range.endDate] as const,

    locationHeatmap: (range: DateRangeParams) =>
        [...analyticsKeys.all, 'locationHeatmap', range.startDate, range.endDate] as const,

    sportDistribution: (range: DateRangeParams) =>
        [...analyticsKeys.all, 'sportDistribution', range.startDate, range.endDate] as const,
};
