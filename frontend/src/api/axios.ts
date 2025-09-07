import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ||           // explicit override (e.g. http://192.168.2.31:8000)
  (import.meta.env.PROD ? "/api" : "http://localhost:8000"); // prod: via Nginx proxy; dev: local


const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];
// Add a retry limiter
let refreshAttemptCount = 0;
const MAX_REFRESH_ATTEMPTS = 1;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    refreshAttemptCount = 0;
    return response
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // If 401 and not already retrying
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      refreshAttemptCount++;

      const expiredToken = localStorage.getItem('access_token');

      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: string) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          `${import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8001/auth'}/refresh-token`,
          null,
          { withCredentials: true ,
            headers: {Authorization: `Bearer ${expiredToken}`}
          }
        );

        const newToken = refreshRes.data.access_token;
        localStorage.setItem('access_token', newToken);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('access_token');
        window.location.href = '/'; // Redirect to login
        return Promise.reject(refreshErr);
      }
       finally {
        isRefreshing = false;
      }
    }

    // Optional: Handle server errors globally
    if (status === 500) {
      console.error('Server error:', error);
    }


    return Promise.reject(error);
  }
);


export default api;