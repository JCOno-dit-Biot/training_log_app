import axios from '@shared/api/axios';
import type { ImageResponse } from '@/shared/types/ImageResponse';

import type { Runner } from '../model';

export const getRunners = async (): Promise<Runner[]> => {
  const res = await axios.get('/runners');
  return res.data;
};

export const updateRunner = async (
  id: number,
  changes: Partial<Runner>,
): Promise<{ success: boolean }> => {
  const res = await axios.put(`/runners/${id}`, changes);
  return res.data;
};

export const uploadRunnerImage = async (
  id: number,
  file: File
): Promise<ImageResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`/runners/${id}/image`, formData);

  return response.data;
}