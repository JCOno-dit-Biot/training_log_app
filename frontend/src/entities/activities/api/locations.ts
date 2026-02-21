import axios from '@shared/api/axios';

import type { Location, LocationCreate } from '../model';

export const getLocations = async (): Promise<Location[]> => {
  const res = await axios.get(`/locations`);
  return res.data;
};

export const createLocation = async (input: LocationCreate): Promise<Location> => {
  console.log(input)
  const res = await axios.post(`/locations`, input);
  return res.data;
};
