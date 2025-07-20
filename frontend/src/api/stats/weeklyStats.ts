import axios from '../axios';
import { WeeklyStats } from '../../types/WeeklyStats';


export const getWeeklyStats = async (ts: Date): Promise<WeeklyStats[]> => {
  console.log('requesting stats')
  const res = await axios.get(`/analytic/weekly-stats?ts=${ts.toISOString()}`);
  return res.data;
};  