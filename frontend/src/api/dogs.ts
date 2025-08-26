// src/api/dogs.js
import axios from './axios';
import { Dog } from '../types/Dog'

export const getDogs = async (): Promise<Dog[]> => {
  const res = await axios.get('/dogs');
  return res.data;
};

export const updateDog = async (id: number, changes: Partial<Dog>): Promise<{success: boolean}> => {
  const res = await axios.put(`/dogs/${id}`, changes)
  return res.data
}