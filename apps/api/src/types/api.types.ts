export interface StudentRecord {
  id: string;
  branch_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  grade: string | null;
  class_name: string | null;
  status: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AttendanceEntry {
  id: string;
  student_id: string;
  date: Date;
  status: string;
  notes: string | null;
  student_name?: string;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PageMeta;
}
