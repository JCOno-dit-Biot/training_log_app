import axios from 'axios';

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});