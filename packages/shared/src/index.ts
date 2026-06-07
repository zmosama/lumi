// Shared types between API and Web

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'staff';

export type TenantPlan = 'trial' | 'basic' | 'pro' | 'enterprise';

export type StudentStatus = 'active' | 'inactive' | 'archived';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export * from './als';