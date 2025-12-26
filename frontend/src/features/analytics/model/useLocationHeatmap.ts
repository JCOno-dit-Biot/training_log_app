import { analyticsKeys } from '@entities/activity-stats/model/analytics.keys';
import type { LocationHeatmapPoint } from '@entities/activity-stats/model/analytics.types';
import { fetchLocationHeatmap } from '@/entities/activity-stats/api/analytics';
import type { DateRangeParams } from '@/shared/types/DateRangeParams';

import { useQuery } from '@tanstack/react-query';


export interface HeatmapPoint {
    lat: number;
    lng: number;
    weight: number;
    label: string;
}

function toHeatmapPoints(rows: LocationHeatmapPoint[]): HeatmapPoint[] {
    return rows.map((row) => ({
        lat: row.latitude,
        lng: row.longitude,
        weight: row.day_count,
        label: row.location_name,
    }));
}

export function useLocationHeatmap(range: DateRangeParams) {
    return useQuery<HeatmapPoint[]>({
        queryKey: analyticsKeys.locationHeatmap(range),
        queryFn: async () => {
            const raw = await fetchLocationHeatmap(range);
            return toHeatmapPoints(raw);
        },
    });
}
