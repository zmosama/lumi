export interface Student {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  grade: string | null;
  class_name: string | null;
  status: 'active' | 'inactive' | 'archived';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes: string | null;
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  description: string | null;
  status: 'paid' | 'pending' | 'overdue';
  paid_at: string | null;
  due_date: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  monthlyRevenue: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}
