import type { Dog } from './Dog';

export type FetchWeightsParams = {
  dogId?: number; // filter
  start_date?: string; // yyyy-MM-dd
  end_date?: string; // yyyy-MM-dd
};

export type WeightEntry = {
  id: number;
  dog_id: number;
  date: string; // ISO date string (yyyy-MM-dd)
  weight: number; // by default weight is in kg. UI takes care of conversion
  age?: number;
  dog?: Dog; // optional expanded
};
