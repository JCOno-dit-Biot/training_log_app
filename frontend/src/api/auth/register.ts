// src/api/dogs.js
import axios from './authAxios';


export const register = async (payload: URLSearchParams): Promise<{data: string, status_code: number}>=> {
  const res = await axios.post(
    '/register',
    payload,
    {headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    }}
  );

  return {data: res.data, status_code: res.status};
};
