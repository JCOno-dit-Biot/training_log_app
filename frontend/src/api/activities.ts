import axios from './axios';
import { Activity } from '../types/Activity'
import { ActivityForm } from '../components/AddActivityForm';

export const getActivities = async (): Promise<Activity[]> => {
  const res = await axios.get('/activities');
  return res.data;
};

export const postActivity = async (formData: ActivityForm) : Promise<Activity> => {
  const payload = {
    ...formData
  }
  console.log(payload)
  const response = await axios.post('/activities', payload);
  return response.data; 
}