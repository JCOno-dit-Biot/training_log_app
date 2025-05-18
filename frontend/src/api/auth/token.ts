// src/api/dogs.js
import axios from './authAxios';
import { Token } from '../../types/Token'

export const getToken = async (formData: URLSearchParams): Promise<Token> => {
  const res = await axios.post(
    '/token',
    formData
  );

  return res.data;
};
