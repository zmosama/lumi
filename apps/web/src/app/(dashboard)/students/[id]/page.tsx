'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Student } from '@/types';
import { formatDate } from '@/lib/utils';
import { ArrowRight, User, Phone, GraduationCap, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  params: { id: string };
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm w-32 flex-shrink-0">{label}</span>
      <span className="text-foreground text-sm font-medium">{value || '—'}</span>
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
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
        <Card className="h-64 animate-pulse" />
      </div>
    );
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <p className="text-muted-foreground mb-4">الطالب غير موجود</p>
          <Button asChild variant="outline">
            <Link href="/students">
              العودة لقائمة الطلاب
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/students"
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowRight size={18} />
          <span className="text-sm font-medium">الطلاب</span>
        </Link>
        <span className="text-border">/</span>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{student.name}</h1>
        <span
          className={cn(
            'text-xs px-2.5 py-1 rounded-full font-medium',
            student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
          )}
        >
          {student.status === 'active' ? 'نشط' : 'غير نشط'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={28} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-foreground">{student.name}</h2>
                  <p className="text-sm text-muted-foreground">{student.grade || 'لم يحدد الصف'}</p>
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
            </CardContent>
          </Card>
        </div>

        {/* Side info */}
        <div className="space-y-6">
          {/* Parent info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone size={18} className="text-muted-foreground" />
                بيانات ولي الأمر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="الاسم" value={student.parent_name} />
              <InfoRow label="الهاتف" value={student.parent_phone} />
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar size={18} className="text-muted-foreground" />
                ملخص سريع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold text-green-600">—</p>
                  <p className="text-xs text-muted-foreground mt-1">أيام الحضور</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold text-destructive">—</p>
                  <p className="text-xs text-muted-foreground mt-1">أيام الغياب</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
