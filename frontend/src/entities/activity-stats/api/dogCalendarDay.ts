import axios from '@shared/api/axios'
import { DogCalendarDay } from '../model';


export const getCalendarDay = async (
  { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = {}
): Promise<DogCalendarDay[]> => {
  const res = await axios.get(`/analytic/dog-calendar?year=${year}&month=${month}`);
  console.log(res)
  return res.data;
};