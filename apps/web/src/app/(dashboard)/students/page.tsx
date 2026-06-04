'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Student, PaginatedResponse, Branch } from '@/types';
import { formatDate } from '@/lib/utils';
import { Search, Plus, Eye, Trash2, ChevronRight, ChevronLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { AddStudentModal } from './add-student-modal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusLabels: Record<string, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  archived: 'محذوف',
};
const statusClass: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-700',
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

  const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer pr-8';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-ibm">الطلاب</h1>
          <p className="text-muted-foreground text-sm mt-1">{meta?.total ?? 0} طالب مسجل</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
          <Plus size={18} /> إضافة طالب
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pr-9"
              placeholder="بحث باسم الطالب أو رقم الهاتف..."
            />
          </div>
          {branches.length > 1 && (
            <div className="relative sm:w-64">
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select
                value={branchId}
                onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
                className={selectClass}
              >
                <option value="">كل الفروع</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right hidden sm:table-cell">الفرع</TableHead>
              <TableHead className="text-right">الصف</TableHead>
              <TableHead className="text-right hidden md:table-cell">هاتف ولي الأمر</TableHead>
              <TableHead className="text-right hidden lg:table-cell">تاريخ الإضافة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {search || branchId ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد طلاب بعد'}
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const branch = branches.find((b) => b.id === student.branch_id);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-foreground">{student.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">
                      {branch?.name || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{student.grade || '—'}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell" dir="ltr">
                      {student.parent_phone || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell text-xs">
                      {formatDate(student.created_at)}
                    </TableCell>
                    <TableCell>
                      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium inline-block', statusClass[student.status] || 'bg-gray-100 text-gray-700')}>
                        {statusLabels[student.status] || student.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Link href={`/students/${student.id}`}>
                            <Eye size={16} />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { if (confirm('تأكيد أرشفة الطالب؟')) archiveMutation.mutate(student.id); }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              عرض {(page - 1) * 20 + 1}–{Math.min(page * 20, meta.total)} من {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8"
              >
                <ChevronRight size={16} />
              </Button>
              <span className="text-sm text-foreground font-medium">{page} / {meta.totalPages}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="h-8 w-8"
              >
                <ChevronLeft size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

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
