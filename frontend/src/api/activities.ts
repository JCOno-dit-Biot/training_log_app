import axios from './axios';
import { Activity } from '../types/Activity'
import { ActivityFilter } from '../types/ActivityFilter';
import { ActivityForm } from '../components/AddActivityForm';

type FetchActivitiesOptions = {
  limit: number;
  offset: number;
  filters?: ActivityFilter;
};

export const getActivities = async ({ limit = 10, offset = 0, filters = {} }: FetchActivitiesOptions): Promise<Activity[]> => {
  const params = new URLSearchParams();

  params.append('limit', String(limit));
  params.append('offset', String(offset));

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const res = await axios.get(`/activities?${params.toString()}`);
  return res.data.data;
};

export const postActivity = async (formData: ActivityForm) : Promise<Activity> => {
  const payload = {
    ...formData
  }
  console.log(payload)
  const response = await axios.post('/activities', payload);
  return response.data; 
}

export const deleteActivity = async (activity_id: number): Promise<{ success: boolean }> => {
  const response = await axios.delete(`/activities/${activity_id}`);
  return response.data;
}