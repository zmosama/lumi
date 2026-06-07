'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DashboardStats } from '@/types';
import { Users, CheckCircle, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 flex items-start gap-4">
        <div className={cn('p-3 rounded-xl shadow-sm', color)}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data;
    },
  });

  const today = formatDate(new Date());
  const attendanceRate =
    stats && stats.totalStudents > 0
      ? Math.round((stats.presentToday / stats.totalStudents) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-ibm">{t('title')}</h1>
        <p className="text-muted-foreground text-sm mt-2">{today}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          label={t('total_students')}
          value={isLoading ? '...' : (stats?.totalStudents ?? 0)}
          icon={Users}
          color="bg-primary"
          sub={t('registered_student')}
        />
        <StatCard
          label={t('attendance_today')}
          value={isLoading ? '...' : `${stats?.presentToday ?? 0} (${attendanceRate}%)`}
          icon={CheckCircle}
          color="bg-green-500"
          sub={`${t('attendance_rate')} ${attendanceRate}%`}
        />
        <StatCard
          label={t('monthly_revenue')}
          value={isLoading ? '...' : formatCurrency(stats?.monthlyRevenue ?? 0)}
          icon={DollarSign}
          color="bg-amber-500"
          sub={t('this_month')}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance summary card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              {t('attendance_summary')}
              <TrendingUp size={18} className="text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-24 bg-muted animate-pulse rounded-lg" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('present')}</span>
                  <span className="font-semibold text-green-600">{stats?.presentToday ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('absent')}</span>
                  <span className="font-semibold text-destructive">
                    {(stats?.totalStudents ?? 0) - (stats?.presentToday ?? 0)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              {t('alerts')}
              <AlertCircle size={18} className="text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceRate < 80 && stats?.totalStudents ? (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertCircle size={18} className="text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">{t('high_absence_rate')}</p>
                    <p className="text-xs text-destructive/80 mt-1">{100 - attendanceRate}% {t('students_absent_today')}</p>
                  </div>
                </div>
              ) : null}
              <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <CheckCircle size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary">{t('system_normal')}</p>
                  <p className="text-xs text-primary/80 mt-1">{t('last_update_now')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
