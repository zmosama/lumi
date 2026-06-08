import { api } from './api';
import type { OrgType } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
  subdomain: string;
}

export interface RegisterPayload {
  tenantName: string;
  subdomain: string;
  orgType: OrgType;
  initialBranch: {
    name: string;
    area?: string;
    curriculums?: string[];
    ownership?: string;
  };
  adminEmail: string;
  adminPassword: string;
  adminName: string;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post('/auth/login', payload);
  if (typeof window !== 'undefined') {
    localStorage.setItem('tenant_subdomain', payload.subdomain);
    localStorage.setItem('user', JSON.stringify(data.user));
    // data.tenant might not be returned in all endpoints, check if needed
    if (data.tenant) {
      localStorage.setItem('tenant', JSON.stringify(data.tenant));
    }
  }
  return data;
}

export async function registerTenant(payload: RegisterPayload) {
  const { data } = await api.post('/auth/register-tenant', payload);
  return data;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    window.location.href = '/login';
  }
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function getTenant() {
  if (typeof window === 'undefined') return null;
  const tenant = localStorage.getItem('tenant');
  return tenant ? JSON.parse(tenant) : null;
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('user');
}
