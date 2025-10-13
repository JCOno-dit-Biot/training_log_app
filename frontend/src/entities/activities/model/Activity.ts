import { Dog, SelectedDog} from "./Dog"
import { Runner } from "./Runner"
import { Weather } from "./Weather";
import { Sport } from "./Sport";
import { Lap } from "./Lap";

interface DogActivityRead {
  dog: Dog,
  id? : number
  rating: number
}

export interface Location {
  id: number,
  name: string
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
  __trigger?: string
  dog_id?: number;
  runner_id?: number;
  sport_id?: number;
  start_date?: string; // ISO format
  end_date?: string;
};

export interface ActivityForm {
  timestamp: string
  runner_id: number | null;
  sport_id: number | null;
  dogs: SelectedDog[];
  distance: number;
  speed?: number;
  pace?: string;
  weather: Weather
  workout: boolean;
  laps: Lap[];
  location_id: number | null;
}