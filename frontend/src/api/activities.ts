import axios from './axios';
import { Activity, PaginatedActivities} from '../types/Activity'
import { ActivityFilter } from '../types/ActivityFilter';
import { Sport } from '../types/Sport';
import { ActivityForm } from '../components/AddActivityForm';


type FetchActivitiesOptions = {
  sports: Map<number, Sport>;
  limit: number;
  offset: number;
  filters?: ActivityFilter; 
};


export const getActivities = async ({ sports, limit = 10, offset = 0, filters = {} }:  FetchActivitiesOptions): Promise<PaginatedActivities> => {

  const params = new URLSearchParams();

  params.append('limit', String(limit));
  params.append('offset', String(offset));

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const res = await axios.get(`/activities?${params.toString()}`);
  const items = res.data.data.map((activity: Activity) => {
    const matchedSport = [...sports.values()].find(s => s.name === activity.sport.name);
    return { ...activity, sport: matchedSport ?? activity.sport };
  });

  return {
    data: items,
    total_count: res.data.total_count,
    limit: res.data.limit,
    offset: res.data.offset,
    next: res.data.next,
    previous: res.data.previous,
  };
};

export const postActivity = async (formData: ActivityForm) : Promise<{id: number}> => {
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

export const updateActivity = async (id: number, changes: Partial<ActivityForm>) => {
  const response = await axios.put(`/activities/${id}`, changes);
  return response.data;
}