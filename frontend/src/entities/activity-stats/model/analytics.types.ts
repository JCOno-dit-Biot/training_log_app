import type { SportType } from "@/entities/sports/model/Sport";

export interface summaryDogRow {
    dog_id: number;
    name: string;
    total_distance_km: number;
    total_duration_hours: number;
    avg_frequency_per_week: number;
    avg_rating: number;
}

export interface summaryRow {
    total_distance_km: number;
    total_duration_hours: number;
    avg_frequency_per_week: number;
    avg_rating: number;
    per_dog: summaryDogRow[];
}

export interface WeeklyMileageRow {
    week_start: string; // ISO yyyy-mm-dd
    dog_id: number;
    dog_name: string;
    weekly_distance_km: number;
}

export interface LocationHeatmapPoint {
    latitude: number;
    longitude: number;
    location_name: string;
    day_count: number;
}

export interface SportDistributionRow {
    sport_name: string;
    sport_type: SportType;      // dryland or on-snow
    activity_count: number;
}
