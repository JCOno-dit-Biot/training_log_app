import { useWeeklySummary } from "@/features/analytics/model";
import { AnalyticsHeader } from "@/features/analytics/ui/AnalyticsHeader";
import { DateRangeProvider } from "@/features/dateRangeFilter/model/DateRangeProvider";
import { useDateRange } from "@/features/dateRangeFilter/model/useDateRange";
import { StatCard } from "@/shared/ui/StatCard";

export default function AnalyticsPage() {
    return (
        <DateRangeProvider defaultPreset="ytd">
            <AnalyticsPageInner />
        </DateRangeProvider>
    );
}

function AnalyticsPageInner() {
    const { queryParams, range } = useDateRange();

    const { data: Summary, isLoading: isSummaryLoading } = useWeeklySummary(queryParams);
    console.log(isSummaryLoading)
    // const { data: weeklyMileage } = useWeeklyMileage(queryParams);
    // const { data: heatmapPoints } = useLocationHeatmap(queryParams);
    // const { data: sportDistribution } = useSportDistribution(queryParams);

    console.log(Summary)
    return (
        <div className="flex flex-col gap-4 p-4">
            <AnalyticsHeader crumbs={[{ label: 'Analytics', to: '/analytics' }]} scopeLabel="Kennel" />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total distance (km)"
                    value={Summary?.total_distance_km}
                    subtitle=""
                    loading={isSummaryLoading}
                />
                <StatCard
                    title="Total duration (hours)"
                    value={Summary?.total_duration_hours.toFixed(1)}
                />
                <StatCard
                    title="Average rating"
                    value={Summary?.avg_rating.toFixed(1)}
                    loading={isSummaryLoading}
                />
                <StatCard
                    title="Training per week"
                    value={Summary?.avg_frequency_per_week.toFixed(1)}
                    loading={isSummaryLoading}
                />
            </div>
        </div>
    )
}
