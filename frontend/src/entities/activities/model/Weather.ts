export interface WeatherForm {
  id?: number;
  temperature: string;
  humidity: string;
  condition: string;
}

export interface Weather {
  id?: number;
  temperature: number | null;
  humidity: number | null;
  condition: string | null;
}