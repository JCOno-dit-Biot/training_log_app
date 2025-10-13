import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import { authStorage } from '@app/auth/auth-storage';

export const baseURL =
  import.meta.env.VITE_API_URL ||           // explicit override (e.g. http://192.168.2.31:8000)
  (import.meta.env.PROD ? "/api" : "http://localhost:8000"); // prod: via Nginx proxy; dev: local


const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token on every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { access_token } = authStorage.get();
  if (access_token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${access_token}`;
  } 
  return config;
});

export async function refreshAccessToken(expiredToken: string): Promise<string | null> {
  // Adjust endpoint & payload to your API
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8001/auth'}/refresh-token`,
          null,
          { withCredentials: true ,
            headers: {Authorization: `Bearer ${expiredToken}`}
          }
    );
    const newAccess = res.data?.access_token as string | undefined;
    if (newAccess) authStorage.set({ access_token: newAccess });
    return newAccess ?? null;
  } catch {
    authStorage.clear();
    return null;
  }
}

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  r => r,
  async (error: AxiosError) => {
    const expiredToken = authStorage.get()
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!original || original._retry) throw error;

    if (error.response?.status === 401) {
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken(expiredToken.access_token);
        isRefreshing = false;
        queue.forEach(cb => cb(newToken));
        queue = [];
        if (!newToken) throw error; // refresh failed
      } else {
        // Wait for the ongoing refresh
        const token = await new Promise<string | null>(resolve => queue.push(resolve));
        if (!token) throw error;
      }

      // Re-attach new token & retry
      const { access_token } = authStorage.get();
      original.headers = original.headers ?? {};
      if (access_token) (original.headers as any).Authorization = `Bearer ${access_token}`;
      return api(original);
    }

    throw error;
  }
);

export default api;
// Add a retry limiter
// let refreshAttemptCount = 0;
// const MAX_REFRESH_ATTEMPTS = 1;

// const processQueue = (error: any, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });

//   failedQueue = [];
// };

// api.interceptors.response.use(
//   (response) => {
//     refreshAttemptCount = 0;
//     return response
//   },
//   async (error) => {
//     const originalRequest = error.config;
//     const status = error.response?.status;

//     // If 401 and not already retrying
//     if (status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       refreshAttemptCount++;

//       const expiredToken = localStorage.getItem('access_token');

//       if (isRefreshing) {
//         // If already refreshing, queue the request
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token: string) => {
//             originalRequest.headers.Authorization = 'Bearer ' + token;
//             return api(originalRequest);
//           })
//           .catch(Promise.reject);
//       }

//       isRefreshing = true;

//       try {
//         const refreshRes = await axios.post(
//           `${import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8001/auth'}/refresh-token`,
//           null,
//           { withCredentials: true ,
//             headers: {Authorization: `Bearer ${expiredToken}`}
//           }
//         );

//         const newToken = refreshRes.data.access_token;
//         localStorage.setItem('access_token', newToken);

//         processQueue(null, newToken);

//         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//         return api(originalRequest);
//       } catch (refreshErr) {
//         processQueue(refreshErr, null);
//         localStorage.removeItem('access_token');
//         window.location.href = '/'; // Redirect to login
//         return Promise.reject(refreshErr);
//       }
//        finally {
//         isRefreshing = false;
//       }
//     }

//     // Optional: Handle server errors globally
//     if (status === 500) {
//       console.error('Server error:', error);
//     }


//     return Promise.reject(error);
//   }
// );


