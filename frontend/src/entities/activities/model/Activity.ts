import type { Dog, SelectedDog } from '@entities/dogs/model';
import type { Runner } from '@entities/runners/model';
import type { Sport } from '@entities/sports/model';

import type { Lap } from './Lap';
import type { Weather, WeatherForm } from './Weather';

interface DogActivityRead {
  dog: Dog;
  id?: number;
  rating: number;
}

export interface Location {
  id: number;
  name: string;
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
  weather: Weather;
  comment_count: number;
}

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
  start_date?: string; // ISO format
  end_date?: string;
}

export interface ActivityForm {
  timestamp: string;
  runner_id: number | null;
  sport_id: number | null;
  dogs: SelectedDog[];
  distance: number;
  speed?: number;
  pace?: string;
  weather: WeatherForm;
  workout: boolean;
  laps: Lap[];
  location_id: number | null;
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
  weather: Weather;
  workout: boolean;
  laps: Lap[];
  location_id: number | null;
}

