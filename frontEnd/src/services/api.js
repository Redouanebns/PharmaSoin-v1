import axios from 'axios';
import { clearAuthSession, getAuthToken } from '../utils/auth';

export const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
export const backendBaseURL = baseURL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const lang = localStorage.getItem('pharmacy_language') || 'fr';
  const token = getAuthToken();

  config.headers['Accept-Language'] = lang;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hasActiveToken = Boolean(getAuthToken());
    const shouldCloseSession = hasActiveToken && (!error?.response || error?.response?.status === 401);

    if (shouldCloseSession) {
      clearAuthSession();

      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/authentification') &&
        !window.location.pathname.startsWith('/auth/callback')
      ) {
        window.location.assign('/authentification');
      }
    }

    return Promise.reject(error);
  },
);

export const buildParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''));

export default api;
