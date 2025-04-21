// src/api/dogs.js
import axios from './axios';
import { Runner } from '../types/Runner'

export const getRunners = async (): Promise<Runner[]> => {
  const res = await axios.get('/runners');
  return res.data;
};
