import { Trend } from "@/entities/activity-stats/model/WeeklyStats";

export type MetricTrend = {
    delta: number | null;
    pct: number | null; // 0.18 => 18%
    direction: Trend | 'none';
};

export function computeMetricTrend(current?: number | null, previous?: number | null): MetricTrend {
    if (current == null || previous == null) {
        return { delta: null, pct: null, direction: 'none' };
    }
    const delta = current - previous;

    // Percent only meaningful if previous > 0
    const pct = previous > 0 ? delta / previous : null;

    const direction =
        delta === 0 ? Trend.SAME : delta > 0 ? Trend.UP : Trend.DOWN;

    return { delta, pct, direction };
}
