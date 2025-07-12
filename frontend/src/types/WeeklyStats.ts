export interface WeeklyStats {
    dog_id: number;
    week_start: Date
    total_distance_km: number
    previous_week_distance_km: number
    average_rating: number
    previous_week_average_rating: number
    trend_distance: string
    trend_rating: string
}