export interface WeatherForm {
  id?: number;
  temperature: string | null;
  humidity: string | null;
  condition: string | null;
}

export interface Weather {
  id?: number;
  temperature: number | null;
  humidity: number | null;
  condition: string | null;
}