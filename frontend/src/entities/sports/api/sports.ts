// src/api/dogs.js
import axios from './axios';
import { Sport } from '../types/Sport'

export const getSports = async (): Promise<Sport[]> => {
  const res = await axios.get('/sports');
  return res.data;
};
