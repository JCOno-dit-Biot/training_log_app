import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import type { WeeklyStats } from '@entities/activity-stats/model';
import type { Dog } from '@entities/dogs/model';
import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function DogStatsCard({ data, dog }: { data: WeeklyStats; dog: Dog }) {
  //const { dog_id, total_distance_km, average_rating, trend_distance, trend_rating } = data

  return (
    <Card className="mb-4 pt-4 pb-2 gap-2">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="flex items-center gap-3 text-sm font-semibold">
          <Avatar className="h-14 w-14 border">
            <AvatarImage src={`/profile_picture/dogs/${dog.image_url}`} alt={dog.name} />
            <AvatarFallback>{dog.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-neutral-900">{dog.name}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">Weekly distance</span>
          <span className="text-right text-neutral-900">
            {data.total_distance_km.toFixed(1)} km{" "}
            <TrendIcon trend={data.trend_distance} className="ml-1 align-[-2px]" />
            <span className="ml-2 text-xs text-muted-foreground">
              (prev. {data.previous_week_distance_km.toFixed(1)})
            </span>
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">Avg rating</span>
          <span className="text-right text-neutral-900">
            {data.average_rating != null ? (
              <>
                {data.average_rating.toFixed(1)}{" "}
                <TrendIcon trend={data.trend_rating} className="ml-1 align-[-2px]" />
              </>
            ) : (
              <span className="text-xs text-muted-foreground">(no rating)</span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendIcon({
  trend,
  className,
}: {
  trend?: string;
  className?: string;
}) {
  const size = 14;

  switch (trend) {
    case "up":
      return <TrendingUp className={cn("inline-block text-emerald-600", className)} size={size} />;
    case "down":
      return <TrendingDown className={cn("inline-block text-rose-600", className)} size={size} />;
    default:
      return <Minus className={cn("inline-block text-muted-foreground", className)} size={size} />;
  }
}