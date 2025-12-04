/**
 * API client with authentication and automatic token refresh
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) {
          // No refresh token, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: new_refresh_token } = response.data;

        // Save new tokens
        Cookies.set('access_token', access_token, { expires: 1 / 48 }); // 30 min
        Cookies.set('refresh_token', new_refresh_token, { expires: 7 }); // 7 days

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API functions
export const authAPI = {
  signup: async (name: string, email: string, password: string) => {
    const response = await api.post('/api/auth/signup', {
      full_name: name,
      email,
      password,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
};

// Session API functions
export const sessionAPI = {
  get: async () => {
    const response = await api.get('/api/session');
    return response.data;
  },

  save: async (sessionData: any) => {
    const response = await api.post('/api/session', {
      session_data: sessionData,
    });
    return response.data;
  },

  delete: async () => {
    await api.delete('/api/session');
  },
};

// Peer API functions
export const peerAPI = {
  getAll: async () => {
    const response = await api.get('/api/peers');
    return response.data;
  },

  create: async (peerData: any) => {
    const response = await api.post('/api/peers', peerData);
    return response.data;
  },

  delete: async (peerId: string) => {
    await api.delete(`/api/peers/${peerId}`);
  },
};
