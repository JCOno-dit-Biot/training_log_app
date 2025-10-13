import axios from 'axios';

export type User = {
  id: number; 
  username: string;
  kennel_id: number;
}

export const AUTH_BASE =
  import.meta.env.VITE_AUTH_URL ||
  (import.meta.env.PROD ? "/auth" : "http://localhost:8001/auth");


export const authAxios = axios.create({
  baseURL: AUTH_BASE,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  withCredentials: true
});

export async function validateToken(jwt_token: string): Promise<User> {
  
  //API expects { token: "..." } not the raw string.
  const payload = {
    token: jwt_token
  }
  const headers = {
  'Content-Type': 'application/json',
  }
  const { data } = await axios.post(`${AUTH_BASE}/validate`,
    payload,
    {headers: headers}

  );
  return data as User;
}
