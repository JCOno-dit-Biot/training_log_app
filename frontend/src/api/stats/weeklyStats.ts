import axios from '../axios';
import { WeeklyStats } from '../../types/WeeklyStats';


export const getWeeklyStats = async (): Promise<WeeklyStats[]> => {
  const res = await axios.get(`/analytics/weekly-stats`);
  return res.data;
};