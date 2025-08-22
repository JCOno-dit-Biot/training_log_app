import axios from './axios';
import { Location } from '../types/Activity';

export const getLocations = async (): Promise<Location[]> => {
  const res = await axios.get(`/locations`);
  return res.data;
};


export const createLocation = async(content: string): Promise<number> => {
  const res = await axios.post(`/locations`, {name: content});
  return res.data
}

