import { useWeeklySummary } from "@/features/analytics/model";
import { AnalyticsHeader } from "@/features/analytics/ui/AnalyticsHeader";
import { DateRangeProvider } from "@/features/dateRangeFilter/model/DateRangeProvider";
import { useDateRange } from "@/features/dateRangeFilter/model/useDateRange";
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Kennel summary</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <StatCard title="Total distance (km)" value={Summary?.total_distance_km ?? '—'} loading={isSummaryLoading} compact />
                            <StatCard title="Total duration (hours)" value={Summary?.total_duration_hours?.toFixed(1) ?? '—'} loading={isSummaryLoading} compact />
                            <StatCard title="Average rating" value={Summary?.avg_rating?.toFixed(1) ?? '—'} loading={isSummaryLoading} compact />
                            <StatCard title="Training per week" value={Summary?.avg_frequency_per_week?.toFixed(1) ?? '—'} loading={isSummaryLoading} compact />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
