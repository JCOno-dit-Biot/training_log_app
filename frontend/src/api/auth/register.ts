// src/api/dogs.js
import axios from './authAxios';


export const register = async (payload: Object): Promise<string>=> {
  const res = await axios.post(
    '/register',
    payload,
    {headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    }}
  );

  return res.data;
};
