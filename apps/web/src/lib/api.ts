import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const tenant = localStorage.getItem('tenant_subdomain');
    if (tenant) config.headers['x-tenant-id'] = tenant;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('tenant_subdomain');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
