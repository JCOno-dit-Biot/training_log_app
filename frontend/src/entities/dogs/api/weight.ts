import axios from '@shared/api/axios';

import type { FetchWeightsParams, WeightEntry } from '../model';

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
