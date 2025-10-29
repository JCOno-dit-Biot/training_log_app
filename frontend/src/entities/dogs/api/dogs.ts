import axios from '@shared/api/axios';

import type { Dog } from '../model';

export const getDogs = async (): Promise<Dog[]> => {
  const res = await axios.get('/dogs');
  return res.data;
};

export const updateDog = async (
  id: number,
  changes: Partial<Dog>,
): Promise<{ success: boolean }> => {
  const res = await axios.put(`/dogs/${id}`, changes);
  return res.data;
};
