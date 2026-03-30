import axios from '@shared/api/axios';
import type { ImageResponse } from '@/shared/types/ImageResponse';

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

export const uploadDogImage = async (
  id: number,
  file: File
): Promise<ImageResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`/dogs/${id}/image`, formData);

  return response.data;
}