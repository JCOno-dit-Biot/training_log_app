import axios from './axios';
import { Location } from '../types/Activity';

export const getLocations = async (): Promise<Location[]> => {
  const res = await axios.get(`/locations`);
  return res.data;
};

