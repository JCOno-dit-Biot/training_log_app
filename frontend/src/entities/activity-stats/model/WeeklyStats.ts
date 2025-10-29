export interface WeeklyStats {
  dog_id: number;
  week_start: Date;
  total_distance_km: number;
  previous_week_distance_km: number;
  average_rating?: number;
  previous_week_average_rating?: number;
  trend_distance: Trend;
  trend_rating?: Trend;
}

export enum Trend {
  Up = 'up',
  Down = 'down',
  Same = 'same',
}
