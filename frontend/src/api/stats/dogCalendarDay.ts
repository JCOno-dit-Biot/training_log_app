import axios from '../axios';
import { DogCalendarDay } from '../../types/DogCalendarDay';


export const getWeeklyStats = async (): Promise<DogCalendarDay[]> => {
  const res = await axios.get(`/analytics/dog-calendar`);
  return res.data;
};