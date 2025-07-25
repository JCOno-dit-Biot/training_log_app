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

export interface Activity {
  id: number;
  timestamp: string;
  runner: Runner;
  dogs: DogActivityRead[];
  sport: Sport;
  distance: number;
  speed: number;
  pace: string;
  location: string;
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