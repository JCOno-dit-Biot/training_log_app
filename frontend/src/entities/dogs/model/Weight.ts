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

export type LatestWeight = {
  dog_id: number;
  latest_weight: number;
  weight_change: number | null;    // change vs previous, may be null if only one entry
  latest_update: string;         //'yyyy-MM-dd' – we’ll format it for display
};
