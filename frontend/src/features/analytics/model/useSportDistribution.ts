import { analyticsKeys } from '@entities/activity-stats/model/analytics.keys';
import type { SportDistributionRow } from '@entities/activity-stats/model/analytics.types';
import { fetchSportDistribution } from '@/entities/activity-stats/api/analytics';
import type { SportType } from '@/entities/sports/model/Sport';
import type { DateRangeParams } from '@/shared/types/DateRangeParams';

import { useQuery } from '@tanstack/react-query';

export interface DonutSlice {
    name: string;
    value: number;
}

export interface SportDistribution {
    outer: (DonutSlice & { type: SportType })[]; // per sport
    inner: DonutSlice[];                          // per sport type
}

// parse raw data from api to be easily displayed in Donut
function buildSportDistribution(rows: SportDistributionRow[]): SportDistribution {
    const outer = rows
        .slice()
        .sort((a, b) => {
            // group by type first so the donuts align visually
            if (a.sport_type === b.sport_type) return a.sport_name.localeCompare(b.sport_name);
            return a.sport_type.localeCompare(b.sport_type);
        })
        .map((row) => ({
            name: row.sport_name,
            type: row.sport_type,
            value: row.activity_count,
        }));

    const typeTotals: Record<SportType, number> = {
        'dryland': 0,
        'on-snow': 0,
    };

    for (const row of rows) {
        typeTotals[row.sport_type] += row.activity_count;
    }

    const inner: DonutSlice[] = [
        { name: 'dryland', value: typeTotals['dryland'] },
        { name: 'on-snow', value: typeTotals['on-snow'] },
    ];

    return { outer, inner };
}

export function useSportDistribution(range: DateRangeParams) {
    return useQuery<SportDistribution>({
        queryKey: analyticsKeys.sportDistribution(range),
        queryFn: async () => {
            const raw = await fetchSportDistribution(range);
            return buildSportDistribution(raw);
        },
    });
}