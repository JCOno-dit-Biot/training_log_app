// src/api/dogs.js
import { authAxios } from '@shared/api/authAxios';
import { Token } from '../model/Token'

export const getToken = async (formData: URLSearchParams): Promise<Token> => {
  const res = await authAxios.post(
    '/token',
    formData
  );

  return res.data;
};
