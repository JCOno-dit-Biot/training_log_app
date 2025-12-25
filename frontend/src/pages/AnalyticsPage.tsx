
import { useLocationHeatmap, useSportDistribution, useWeeklyMileage, useWeeklySummary } from "@/features/analytics/model";
import { AnalyticsHeader } from "@/features/analytics/ui/AnalyticsHeader";
import { SportDistributionDonut } from "@/features/analytics/ui/charts/DistributionSportDonut";
import { WeeklyMileageStackedArea } from "@/features/analytics/ui/charts/WeeklyMileageStackedArea";
import { LocationBubbleClusterMap } from "@/features/analytics/ui/maps/LocationBubbleClusterMap";
import { DateRangeProvider } from "@/features/dateRangeFilter/model/DateRangeProvider";
import { useDateRange } from "@/features/dateRangeFilter/model/useDateRange";
import { useDogs } from "@/features/dogs/model/useDogs";
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
    const { data: dogs } = useDogs();
    const { data: Summary, isLoading: isSummaryLoading } = useWeeklySummary(queryParams);
    const { data: weeklyMileage, isLoading: isMileageLoading } = useWeeklyMileage(queryParams);
    const { data: locationPoints, isLoading: isMapLoading } = useLocationHeatmap(queryParams);
    const { data: sportDistribution, isLoading: sportLoading } = useSportDistribution(queryParams);

    return (
        <div className="flex flex-col gap-4 p-4">
            <AnalyticsHeader crumbs={[{ label: 'Analytics', to: '/analytics' }]} scopeLabel="Kennel" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Kennel summary</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <StatCard title="Total distance (km)" value={Summary?.total_distance_km?.toFixed(0) ?? '—'} loading={isSummaryLoading} compact />
                            <StatCard title="Total duration (hours)" value={Summary?.total_duration_hours?.toFixed(1) ?? '—'} loading={isSummaryLoading} compact />
                            <StatCard title="Average rating" value={Summary?.avg_rating?.toFixed(1) ?? '—'} loading={isSummaryLoading} compact />
                            <StatCard title="Training per week" value={Summary?.avg_frequency_per_week?.toFixed(1) ?? '—'} loading={isSummaryLoading} compact />
                        </div>
                    </CardContent>
                </Card>
                <div className="lg:col-span-2">
                    {isMapLoading ? (
                        <div className="h-[360px] rounded-md border bg-neutral-50" />
                    ) : (
                        <LocationBubbleClusterMap data={locationPoints} height={280} />
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Sport distribution takes 1/3 */}
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Sport distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[230px]">
                        <SportDistributionDonut data={sportDistribution} loading={sportLoading} />
                    </CardContent>
                </Card>
                {/* Weekly mileage chart takes 2/3 */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Weekly mileage (km)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[230px]">
                        <WeeklyMileageStackedArea data={weeklyMileage} loading={isMileageLoading} dogsData={dogs} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
