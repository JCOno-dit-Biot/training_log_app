import axios from '@shared/api/axios'
import { Sport } from '../model'

export const getSports = async (): Promise<Sport[]> => {
  const res = await axios.get('/sports');
  return res.data;
};
