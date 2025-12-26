
import { useMemo } from "react";

import { useLocationHeatmap, useSportDistribution, useWeeklyMileage, useWeeklySummary } from "@/features/analytics/model";
import { AnalyticsHeader } from "@/features/analytics/ui/AnalyticsHeader";
import { SportDistributionDonut } from "@/features/analytics/ui/charts/DistributionSportDonut";
import { WeeklyMileageStackedArea } from "@/features/analytics/ui/charts/WeeklyMileageStackedArea";
import { LocationBubbleClusterMap } from "@/features/analytics/ui/maps/LocationBubbleClusterMap";
import { computeMetricTrend } from "@/features/analytics/utils/computeMetricTrend";
import { DateRangeProvider } from "@/features/dateRangeFilter/model/DateRangeProvider";
import { useDateRange } from "@/features/dateRangeFilter/model/useDateRange";
import { getComparisonRange } from "@/features/dateRangeFilter/utils/getComparisonRange";
import { useDogs } from "@/features/dogs/model/useDogs";
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { StatCard } from "@/shared/ui/StatCard";
import { InlineTrend } from "@/shared/ui/StatCard";


export default function AnalyticsPage() {
    return (
        <DateRangeProvider defaultPreset="ytd">
            <AnalyticsPageInner />
        </DateRangeProvider>
    );
}

function AnalyticsPageInner() {
    const { queryParams, preset } = useDateRange();
    const { data: dogs } = useDogs();
    const { data: Summary, isLoading: isSummaryLoading } = useWeeklySummary(queryParams);
    const { data: weeklyMileage, isLoading: isMileageLoading } = useWeeklyMileage(queryParams);
    const { data: locationPoints, isLoading: isMapLoading } = useLocationHeatmap(queryParams);
    const { data: sportDistribution, isLoading: sportLoading } = useSportDistribution(queryParams);

    const comparisonRange = useMemo(
        () => getComparisonRange(queryParams, preset),
        [queryParams, preset]
    );

    const { data: prevSummary, isLoading: isPrevSummaryLoading } = useWeeklySummary(comparisonRange);

    const distanceTrend = useMemo(
        () => computeMetricTrend(Summary?.total_distance_km, prevSummary?.total_distance_km),
        [Summary?.total_distance_km, prevSummary?.total_distance_km]
    );

    const ratingTrend = useMemo(
        () => computeMetricTrend(Summary?.avg_rating, prevSummary?.avg_rating),
        [Summary?.avg_rating, prevSummary?.avg_rating]
    );

    const freqTrend = useMemo(
        () => computeMetricTrend(Summary?.avg_frequency_per_week, prevSummary?.avg_frequency_per_week),
        [Summary?.avg_frequency_per_week, prevSummary?.avg_frequency_per_week]
    );
    const trendLabel = preset === 'ytd' ? 'vs last year' : 'vs prev period';
    const trendLoading = isSummaryLoading || isPrevSummaryLoading;

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
                            <StatCard
                                title="Distance (km)"
                                value={<div className="inline-flex items-baseline gap-2">
                                    <span>{Summary?.total_distance_km?.toFixed(0) ?? '—'}</span>
                                    <InlineTrend className="relative top-[1px]" trend={distanceTrend} label={trendLabel} loading={trendLoading} />
                                </div>
                                }
                                loading={isSummaryLoading}
                                compact />
                            <StatCard
                                title="Sessions/week"
                                value={<div className="inline-flex items-baseline gap-2">
                                    <span>{Summary?.avg_frequency_per_week?.toFixed(1) ?? '—'}</span>
                                    <InlineTrend className="relative top-[1px]" trend={freqTrend} label={trendLabel} loading={trendLoading} />
                                </div>
                                }
                                loading={isSummaryLoading}
                                compact />
                            <StatCard
                                title="Avg training rating"
                                value={<div className="inline-flex items-baseline gap-2">
                                    <span>{Summary?.avg_rating?.toFixed(1) ?? '—'}</span>
                                    <InlineTrend className="relative top-[1px]" trend={ratingTrend} label={trendLabel} loading={trendLoading} />
                                </div>
                                }
                                loading={isSummaryLoading}
                                compact />
                            <StatCard
                                title="Rest days"
                                value={<div className="inline-flex items-baseline gap-2">
                                    <span>{Summary?.time_since_last_training?.toFixed(0) ?? '—'}</span>
                                </div>
                                }
                                loading={isSummaryLoading}
                                compact />
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
