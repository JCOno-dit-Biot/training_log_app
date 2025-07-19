import axios from '../axios';
import { WeeklyStats } from '../../types/WeeklyStats';


export const getWeeklyStats = async (date: Date): Promise<WeeklyStats[]> => {
  const res = await axios.get(`/analytic/weekly-stats?date=${date.toISOString()}`);
  return res.data;
};  