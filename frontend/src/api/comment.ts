import axios from './axios';
import { Comment } from '../types/Comment';

export const getComments = async (activity_id: number): Promise<Comment[]> => {
  const res = await axios.get(`/activities/${activity_id}/comments`);
  return res.data;
};

export const postComment = async(content: Comment): Promise<{id: number}> => {
  const payload = {
    ...content
  }
  const res = await axios.post(`/activities/${content.activity_id}/comments`, payload);
  return res.data;
} 
