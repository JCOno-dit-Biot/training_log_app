import type { Dog } from '@entities/dogs/model';
import type { Runner } from '@entities/runners/model';
import type { Sport } from '@entities/sports/model';

import type { Lap } from './Lap';
import type { Weather, WeatherForm } from './Weather';

interface DogActivityRead {
  dog: Dog;
  id?: number;
  rating: number;
}

export interface SelectedDog {
  dog_id: number;
  rating: number;
  cooling_method?: string | null;
  temperatures?: DogTemperaturePayload[];
}

export interface Location {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationCreate {
  name: string;
  latitude?: number;
  longitude?: number;
}
export interface Activity {
  id: number;
  timestamp: string;
  runner: Runner;
  dogs: DogActivityRead[];
  sport: Sport;
  distance: number;
  speed: number;
  pace: string;
  location: Location;
  workout: boolean;
  laps: Lap[];
  weather?: Weather;
  comment_count: number;
  has_heat_data: boolean;
}

export type TemperaturePhase = "before" | "after" | "recovery";

export interface DogTemperaturePayload {
  phase: TemperaturePhase;
  recovery_minute?: number | null;
  temperature_c: number;
  measurement_method?: string | null;
}

export interface ActivityDogTemperature {
  id: number;
  phase: TemperaturePhase;
  recovery_minute: number | null;
  temperature_c: number;
  measurement_method: string | null;
};

export interface ActivityDogHeat {
  activity_dog_id: number;
  dog_id: number;
  dog_name: string;
  rating: number | null;
  cooling_method: string | null;
  temperatures: ActivityDogTemperature[];
};

export interface ActivityHeatData {
  activity_id: number;
  dogs: ActivityDogHeat[];
};

export interface PaginatedActivities {
  data: Activity[];
  total_count: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
}

export interface ActivityFilter {
  __trigger?: string;
  dog_id?: number;
  runner_id?: number;
  sport_id?: number;
  location_id?: number;
  start_date?: string; // ISO format
  end_date?: string;
}

export interface ActivityForm {
  timestamp: string;
  runner_id: number | null;
  sport_id: number | null;
  dogs: ActivityDogForm[];
  distance: number;
  speed?: number;
  pace?: string;
  weather: WeatherForm;
  workout: boolean;
  laps: Lap[];
  location_id: number | null;
  measurement_method?: string;
}

export interface ActivityDogForm {
  dog_id: number;
  rating: number;

  cooling_method?: string;

  temperature_before?: string;
  temperature_after?: string;
  temperature_recovery?: string;
  recovery_minute?: string;
}

// Only difference is the weather has temperature and humidity as number
// otherwise lead to 422 from backend
export interface ActivityPayload {
  timestamp: string;
  runner_id: number | null;
  sport_id: number | null;
  dogs: SelectedDog[];
  distance: number;
  speed?: number;
  pace?: string;
  weather: Weather | null;
  workout: boolean;
  laps: Lap[];
  location_id: number | null;
}

