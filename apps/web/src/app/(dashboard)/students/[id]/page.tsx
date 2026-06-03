'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Student } from '@/types';
import { formatDate } from '@/lib/utils';
import { ArrowRight, User, Phone, GraduationCap, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: { id: string };
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 text-sm w-32 flex-shrink-0">{label}</span>
      <span className="text-gray-800 text-sm font-medium">{value || '—'}</span>
    </div>
  );
}

export default function StudentDetailPage({ params }: Props) {
  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ['student', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/students/${params.id}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 animate-pulse rounded" />
        <div className="card h-64 animate-pulse" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">الطالب غير موجود</p>
        <Link href="/students" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
          العودة لقائمة الطلاب
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/students"
          className="flex items-center gap-1 text-gray-400 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={18} />
          <span className="text-sm">الطلاب</span>
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-800">{student.name}</h1>
        <span
          className={
            student.status === 'active' ? 'badge-success' : 'badge-gray'
          }
        >
          {student.status === 'active' ? 'نشط' : 'غير نشط'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={24} className="text-primary-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">{student.name}</h2>
                <p className="text-sm text-gray-500">{student.grade || 'لم يحدد الصف'}</p>
              </div>
            </div>

            <div>
              <InfoRow label="الصف الدراسي" value={student.grade} />
              <InfoRow label="المجموعة" value={student.class_name} />
              <InfoRow label="رقم الهاتف" value={student.phone} />
              <InfoRow label="البريد الإلكتروني" value={student.email} />
              <InfoRow label="ملاحظات" value={student.notes} />
              <InfoRow label="تاريخ الإضافة" value={formatDate(student.created_at)} />
            </div>
          </div>
        </div>

        {/* Side info */}
        <div className="space-y-4">
          {/* Parent info */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              بيانات ولي الأمر
            </h3>
            <div>
              <InfoRow label="الاسم" value={student.parent_name} />
              <InfoRow label="الهاتف" value={student.parent_phone} />
            </div>
          </div>

          {/* Quick stats */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              ملخص سريع
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-[8px]">
                <p className="text-lg font-bold text-success">—</p>
                <p className="text-xs text-gray-500">أيام الحضور</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-[8px]">
                <p className="text-lg font-bold text-danger">—</p>
                <p className="text-xs text-gray-500">أيام الغياب</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
