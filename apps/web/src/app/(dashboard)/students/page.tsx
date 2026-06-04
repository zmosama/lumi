'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Student, PaginatedResponse, Branch } from '@/types';
import { formatDate } from '@/lib/utils';
import { Search, Plus, Eye, Trash2, ChevronRight, ChevronLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { AddStudentModal } from './add-student-modal';

const statusLabels: Record<string, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  archived: 'محذوف',
};
const statusClass: Record<string, string> = {
  active: 'badge-success',
  inactive: 'badge-warning',
  archived: 'badge-gray',
};

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchId, setBranchId] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => { const { data } = await api.get('/branches'); return data; },
  });

  const { data, isLoading } = useQuery<PaginatedResponse<Student>>({
    queryKey: ['students', search, page, branchId],
    queryFn: async () => {
      const { data } = await api.get('/students', {
        params: {
          search: search || undefined,
          branchId: branchId || undefined,
          page,
          limit: 20,
        },
      });
      return data;
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/students/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });

  const students = data?.data || [];
  const meta = data?.meta;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-ibm">الطلاب</h1>
          <p className="text-gray-500 text-sm mt-0.5">{meta?.total ?? 0} طالب</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> إضافة طالب
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pr-9"
              placeholder="بحث باسم الطالب أو رقم الهاتف..."
            />
          </div>
          {branches.length > 1 && (
            <div className="relative sm:w-52">
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={branchId}
                onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
                className="input pr-8 appearance-none cursor-pointer"
              >
                <option value="">كل الفروع</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-right font-semibold text-gray-600 px-4 py-3">الاسم</th>
                <th className="text-right font-semibold text-gray-600 px-4 py-3 hidden sm:table-cell">الفرع</th>
                <th className="text-right font-semibold text-gray-600 px-4 py-3">الصف</th>
                <th className="text-right font-semibold text-gray-600 px-4 py-3 hidden md:table-cell">هاتف ولي الأمر</th>
                <th className="text-right font-semibold text-gray-600 px-4 py-3 hidden lg:table-cell">تاريخ الإضافة</th>
                <th className="text-right font-semibold text-gray-600 px-4 py-3">الحالة</th>
                <th className="text-right font-semibold text-gray-600 px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    {search || branchId ? 'لا توجد نتائج للبحث' : 'لا يوجد طلاب بعد'}
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const branch = branches.find((b) => b.id === student.branch_id);
                  return (
                    <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{student.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                        {branch?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{student.grade || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell" dir="ltr">
                        {student.parent_phone || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                        {formatDate(student.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={statusClass[student.status] || 'badge-gray'}>
                          {statusLabels[student.status] || student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/students/${student.id}`}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => { if (confirm('تأكيد أرشفة الطالب؟')) archiveMutation.mutate(student.id); }}
                            className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              عرض {(page - 1) * 20 + 1}–{Math.min(page * 20, meta.total)} من {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-40">
                <ChevronRight size={18} />
              </button>
              <span className="text-sm text-gray-600">{page} / {meta.totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-40">
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        defaultBranchId={branchId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['students'] });
          setIsAddOpen(false);
        }}
      />
    </div>
  );
}
