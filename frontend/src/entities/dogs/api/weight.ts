import axios from '@shared/api/axios';

import type { FetchWeightsParams, LatestWeight, WeightEntry } from '../model';

export function normalizeParams(p: FetchWeightsParams) {
  const out: Record<string, string | number> = {};
  if (p.dogId != null) out.dog_id = p.dogId; // map UI->API
  if (p.start_date) out.start_date = p.start_date;
  if (p.end_date) out.end_date = p.end_date;
  return out;
}

// Stable, canonical string for cache keys
export function serializeKey(p: FetchWeightsParams) {
  const n = normalizeParams(p);
  return Object.keys(n).sort().map(k => `${k}:${(n as any)[k]}`).join('|');
}

export const fetchWeights = async (params: FetchWeightsParams): Promise<WeightEntry[]> => {
  const search = new URLSearchParams();
  if (params.dogId) {
    search.append('dog_id', params.dogId.toString()); // only supports filter for one dog
  }
  if (params.start_date) search.append('start_date', params.start_date);
  if (params.end_date) search.append('end_date', params.end_date);
  const res = await axios.get(`/dogs/weights?${search.toString()}`);
  return res.data?.data ?? res.data ?? [];
};

export async function fetchLatest(): Promise<LatestWeight[]> {
  const res = await axios.get('/dogs/weights/latest');
  return res.data?.data ?? res.data ?? [];
}

export const createWeight = async (entry: Omit<WeightEntry, 'id'>): Promise<WeightEntry> => {
  const res = await axios.post(`/dogs/${entry.dog_id}/weights`, entry);
  return res.data?.data ?? res.data;
};

export const updateWeight = async (
  id: number,
  changes: Partial<WeightEntry>,
): Promise<WeightEntry> => {
  const res = await axios.put(`/dogs/weights/${id}`, changes);
  return res.data?.data ?? res.data;
};

export const deleteWeight = async (id: number): Promise<void> => {
  await axios.delete(`/dogs/weights/${id}`);
};
