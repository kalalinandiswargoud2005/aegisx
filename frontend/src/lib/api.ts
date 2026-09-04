import axios from 'axios';
import { toast } from 'sonner';

const defaultDevUrl = 'http://localhost:8080/api/v1';
const defaultProdUrl = 'https://aegisx-backend-2k67.onrender.com/api/v1';

const rawApiUrl = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
    ? defaultProdUrl 
    : defaultDevUrl);

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
    } else if (error.response) {
      toast.error(`API Error: ${error.response.data?.message || error.message || 'An unexpected error occurred.'}`);
    } else {
      // Silently log network connection refusal when backend server is offline
      console.warn('ASTRA Backend Server Offline (http://localhost:8080)');
    }
    return Promise.reject(error);
  }
);

export default api;
