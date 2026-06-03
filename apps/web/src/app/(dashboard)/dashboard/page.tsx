'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DashboardStats } from '@/types';
import { Users, CheckCircle, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

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
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-[8px] ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 font-ibm">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-1">{today}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="إجمالي الطلاب"
          value={isLoading ? '...' : (stats?.totalStudents ?? 0)}
          icon={Users}
          color="bg-primary-600"
          sub="طالب نشط"
        />
        <StatCard
          label="حضور اليوم"
          value={isLoading ? '...' : `${stats?.presentToday ?? 0} (${attendanceRate}%)`}
          icon={CheckCircle}
          color="bg-success"
          sub={`نسبة الحضور ${attendanceRate}%`}
        />
        <StatCard
          label="إيرادات الشهر"
          value={isLoading ? '...' : formatCurrency(stats?.monthlyRevenue ?? 0)}
          icon={DollarSign}
          color="bg-accent"
          sub="هذا الشهر"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance summary card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">ملخص الحضور</h2>
            <TrendingUp size={18} className="text-gray-400" />
          </div>
          {isLoading ? (
            <div className="h-24 bg-gray-100 animate-pulse rounded-[8px]" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">حاضرون</span>
                <span className="font-semibold text-success">{stats?.presentToday ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">غائبون</span>
                <span className="font-semibold text-danger">
                  {(stats?.totalStudents ?? 0) - (stats?.presentToday ?? 0)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div
                  className="bg-success h-2 rounded-full transition-all duration-500"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">تنبيهات</h2>
            <AlertCircle size={18} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {attendanceRate < 80 && stats?.totalStudents ? (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-[8px]">
                <AlertCircle size={16} className="text-danger mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">نسبة غياب مرتفعة</p>
                  <p className="text-xs text-gray-500">{100 - attendanceRate}% من الطلاب غائبون اليوم</p>
                </div>
              </div>
            ) : null}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-[8px]">
              <CheckCircle size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">النظام يعمل بشكل طبيعي</p>
                <p className="text-xs text-gray-500">آخر تحديث: الآن</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
