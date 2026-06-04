export type OrgType = 'SCHOOL' | 'CENTER' | 'PRIVATE_TUTOR';

export type Curriculum = 'ARABIC' | 'LANGUAGES' | 'IG';
export type Ownership = 'PRIVATE' | 'GOVERNMENT';

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  area: string | null;
  isMain: boolean;
  curriculums: Curriculum[];
  ownership: Ownership | null;
  isActive: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  branch_id: string;
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
  branch_id: string | null;
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
  orgType: OrgType;
}

// Labels for org types in Arabic
export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  SCHOOL: 'مدرسة',
  CENTER: 'سنتر تعليمي',
  PRIVATE_TUTOR: 'مدرس خصوصي',
};

export const CURRICULUM_LABELS: Record<Curriculum, string> = {
  ARABIC: 'عربي',
  LANGUAGES: 'لغات',
  IG: 'IG',
};

export const OWNERSHIP_LABELS: Record<Ownership, string> = {
  PRIVATE: 'خاصة',
  GOVERNMENT: 'حكومية',
};

// What to call "branch" per org type
export const BRANCH_TERM: Record<OrgType, { singular: string; plural: string }> = {
  SCHOOL: { singular: 'فرع', plural: 'الفروع' },
  CENTER: { singular: 'فرع', plural: 'الفروع' },
  PRIVATE_TUTOR: { singular: 'مجموعة', plural: 'المجموعات' },
};
