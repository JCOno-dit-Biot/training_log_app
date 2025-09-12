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
  return {id: res.data};
} 

export const deleteComment = async(activity_id: number, comment_id: number): Promise<{success: boolean}> => {
  const res = await axios.delete(`/activities/${activity_id}/comments/${comment_id}`);
  return {success: res.data}
}


export const editComment = async(activity_id: number, comment_id: number, content: Comment): Promise<{success: boolean}> => {
  const payload = {
    ...content
  }
  const res = await axios.put(`/activities/${activity_id}/comments/${comment_id}`, payload);
  console.log(res)
  return {success: res.data}
}