import { Dog } from "./Dog"
import { Runner } from "./Runner"
import { Weather } from "./Weather";
import { Sport } from "./Sport";
import { Lap } from "./Lap";

export interface Activity {
id: number;
  timestamp: string;
  runner: Runner;
  dogs: Dog[];
  sport: Sport;
  distance: number;
  speed: number;
  pace: string;
  workout: boolean;
  laps: Lap[];
  weather: Weather;
  notes: string;
}
