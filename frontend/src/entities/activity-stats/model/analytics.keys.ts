import type { DateRangeParams } from '@shared/types/DateRangeParams';

export const analyticsKeys = {
    all: ['analytics'] as const,

    summary: (range: DateRangeParams) =>
        [...analyticsKeys.all, 'weeklySummary', range] as const,

    weeklyMileage: (range: DateRangeParams) =>
        [...analyticsKeys.all, 'weeklyMileage', range] as const,

    locationHeatmap: (range: DateRangeParams) =>
        [...analyticsKeys.all, 'locationHeatmap', range] as const,

    sportDistribution: (range: DateRangeParams) =>
        [...analyticsKeys.all, 'sportDistribution', range] as const,
};
