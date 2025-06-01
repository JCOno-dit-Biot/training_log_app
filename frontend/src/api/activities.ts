import axios from './axios';
import { Activity } from '../types/Activity'

export const getActivities = async (): Promise<Activity[]> => {
  const res = await axios.get('/activities');
  console.log(res.data)
  return res.data;
};
