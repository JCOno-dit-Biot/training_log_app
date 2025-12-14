// grouping all analytics api calls into 1 file for convinience as they will be called together 
// in most cases

import type {
    LocationHeatmapPoint,
    SportDistributionRow,
    summaryRow,
    WeeklyMileageRow,
} from '@entities/activity-stats/model/analytics.types'
import axios from '@/shared/api/axios'
import type {
    DateRangeParams
} from '@/shared/types/DateRangeParams';


export async function fetchSummary(params: DateRangeParams) {
    const res = await axios.get<summaryRow[]>('/analytics/summary', {
        params: {
            start_date: params.startDate,
            end_date: params.endDate,
        },
    });
    return res.data;
}

export async function fetchWeeklyMileage(params: DateRangeParams) {
    const res = await axios.get<WeeklyMileageRow[]>('/analytics/activities/weekly-distance', {
        params: {
            start_date: params.startDate,
            end_date: params.endDate,
        },
    });
    return res.data;
}

export async function fetchLocationHeatmap(params: DateRangeParams) {
    const res = await axios.get<LocationHeatmapPoint[]>('/analytics/locations/heatmap', {
        params: {
            start_date: params.startDate,
            end_date: params.endDate,
        },
    });
    return res.data;
}

export async function fetchSportDistribution(params: DateRangeParams) {
    const res = await axios.get<SportDistributionRow[]>('/analytics/activities/sport-distribution', {
        params: {
            start_date: params.startDate,
            end_date: params.endDate,
        },
    });
    return res.data;
}
