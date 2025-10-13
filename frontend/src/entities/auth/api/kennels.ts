// src/api/dogs.js
import { authAxios } from '@shared/api/authAxios';
import { Kennel } from '../../types/Kennel'

export const getKennels = async (): Promise<Kennel[]> => {
  const res = await authAxios.get('/kennels');
  return res.data;
};
