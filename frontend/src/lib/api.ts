import axios from 'axios';
import { toast } from 'sonner';

const defaultDevUrl = 'http://localhost:8080/api/v1';
const defaultProdUrl = 'https://aegisx-backend-2k67.onrender.com/api/v1';

const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If accessed on localhost or direct local network IP (WiFi / Hotspot / LAN)
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      /^192\.168\./.test(host) ||
      /^10\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      window.location.protocol === 'http:'
    ) {
      return `http://${host}:8080/api/v1`;
    }
  }
  return defaultProdUrl;
};

const rawApiUrl = getBaseUrl();
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
