import { api } from './api';

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'SALES';
}

export async function platformLogin(email: string, password: string) {
  const { data } = await api.post('/platform/auth/login', { email, password });
  if (typeof window !== 'undefined') {
    localStorage.setItem('platform_token', data.accessToken);
    localStorage.setItem('platform_user', JSON.stringify(data.user));
  }
  return data;
}

export function platformLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('platform_token');
    localStorage.removeItem('platform_user');
    window.location.href = '/platform/login';
  }
}

export function getPlatformUser(): PlatformUser | null {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('platform_user');
  return u ? JSON.parse(u) : null;
}

export function getPlatformToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('platform_token');
}

export function isPlatformAuthenticated(): boolean {
  return !!getPlatformToken();
}

// Axios instance with platform token injected
import axios from 'axios';

export const platformApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

platformApi.interceptors.request.use((config) => {
  const token = getPlatformToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
