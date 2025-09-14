import axios from 'axios';
import { baseURL } from '../axios';

export const AUTH_BASE =
  import.meta.env.VITE_AUTH_URL ||
  (import.meta.env.PROD ? "/auth" : "http://localhost:8001/auth");


export default axios.create({
  baseURL: AUTH_BASE,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  withCredentials: true
});