import { analyticsKeys } from '@entities/activity-stats/model/analytics.keys';
import type { WeeklyMileageRow } from '@entities/activity-stats/model/analytics.types';
import { fetchWeeklyMileage } from '@/entities/activity-stats/api/analytics';
import type { DateRangeParams } from '@/shared/types/DateRangeParams';

import { useQuery } from '@tanstack/react-query';

export interface WeeklyMileagePoint {
    week_start: string;
    distance_km: number;
}

export interface WeeklyMileageSeries {
    allDogs: WeeklyMileagePoint[];
    byDog: Record<
        number,
        {
            dog_id: number;
            dog_name: string;
            points: WeeklyMileagePoint[];
        }
    >;
}

// Build parsing function to return data series that can be passed to chart directly
function buildMileageSeries(rows: WeeklyMileageRow[]): WeeklyMileageSeries {
    const byWeekTotal = new Map<string, number>();
    const byDog: WeeklyMileageSeries['byDog'] = {};

    for (const row of rows) {
        // all dogs per week
        const total = byWeekTotal.get(row.week_start) ?? 0;
        byWeekTotal.set(row.week_start, total + row.weekly_distance_km);

        // per dog
        if (!byDog[row.dog_id]) {
            byDog[row.dog_id] = {
                dog_id: row.dog_id,
                dog_name: row.dog_name,
                points: [],
            };
        }
        byDog[row.dog_id].points.push({
            week_start: row.week_start,
            distance_km: row.weekly_distance_km,
        });
    }

    const allDogs: WeeklyMileagePoint[] = Array.from(byWeekTotal.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([week_start, distance_km]) => ({ week_start, distance_km }));

    // sort each dog's series
    for (const s of Object.values(byDog)) {
        s.points.sort((a, b) => (a.week_start < b.week_start ? -1 : 1));
    }

    return { allDogs, byDog };
}

// TODO: Could add the moving avg here to keep all logic in one place

export function useWeeklyMileage(range: DateRangeParams) {
    return useQuery<WeeklyMileageSeries>({
        queryKey: analyticsKeys.weeklyMileage(range),
        queryFn: async () => {
            const rawData = await fetchWeeklyMileage(range);
            return buildMileageSeries(rawData);
        }
    });
}