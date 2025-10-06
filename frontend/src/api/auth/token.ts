// src/api/dogs.js
import { authAxios } from './authAxios';
import { Token } from '../../types/Token'

export const getToken = async (formData: URLSearchParams): Promise<Token> => {
  const res = await authAxios.post(
    '/token',
    formData
  );

  return res.data;
};
