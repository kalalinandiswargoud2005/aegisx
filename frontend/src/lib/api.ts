import axios from 'axios';
import { toast } from 'sonner';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const baseURL = rawApiUrl.includes('/api/v1') 
  ? rawApiUrl 
  : `${rawApiUrl.replace(/\/+$/, '')}/api/v1`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('astra-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout if 401 Unauthorized
      localStorage.removeItem('astra-token');
      localStorage.removeItem('astra-user');
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    } else {
      toast.error(`API Error: ${error.response?.data?.message || error.message || 'An unexpected error occurred.'}`);
    }
    return Promise.reject(error);
  }
);

export default api;
