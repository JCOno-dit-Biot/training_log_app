import axios from '../axios';
import { WeeklyStats } from '../../types/WeeklyStats';


export const getWeeklyStats = async (): Promise<WeeklyStats[]> => {
  const res = await axios.get(`/analytic/weekly-stats`);
  return res.data;
};