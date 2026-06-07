'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AttendanceRecord } from '@/types';
import { CheckCircle, XCircle, Clock, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type AttendanceStatus = 'present' | 'absent' | 'late';

function formatArabicDate(date: Date, locale: string = 'ar-EG'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export default function AttendancePage() {
  const t = useTranslations('Attendance');
  const tCommon = useTranslations('Common');
  
  const statusConfig: Record<AttendanceStatus, { label: string; icon: React.ElementType; class: string }> = {
    present: { label: t('present'), icon: CheckCircle, class: 'text-success' },
    absent: { label: t('absent'), icon: XCircle, class: 'text-danger' },
    late: { label: t('late'), icon: Clock, class: 'text-accent' },
  };

  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [overrides, setOverrides] = useState<Record<string, AttendanceStatus>>({});

  const { data: records = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', selectedDate],
    queryFn: async () => {
      const { data } = await api.get('/attendance', { params: { date: selectedDate } });
      return data;
    },
    select: (data) => data,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { date: string; records: { studentId: string; status: string }[] }) =>
      api.post('/attendance', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedDate] });
      setOverrides({});
    },
  });

  const setStatus = useCallback((studentId: string, status: AttendanceStatus) => {
    setOverrides((prev) => ({ ...prev, [studentId]: status }));
  }, []);

  const getStatus = (record: AttendanceRecord): AttendanceStatus => {
    return overrides[record.student_id] || (record.status as AttendanceStatus) || 'present';
  };

  const handleSave = () => {
    if (Object.keys(overrides).length === 0) return;
    const recordsToSave = Object.entries(overrides).map(([studentId, status]) => ({
      studentId,
      status,
    }));
    saveMutation.mutate({ date: selectedDate, records: recordsToSave });
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
    setOverrides({});
  };

  const presentCount = records.filter((r) => getStatus(r) === 'present').length;
  const absentCount = records.filter((r) => getStatus(r) === 'absent').length;
  const lateCount = records.filter((r) => getStatus(r) === 'late').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-ibm">{t('title')}</h1>
          {/* We assume locale from context could be passed to formatArabicDate, but for now we default it */}
          <p className="text-gray-500 text-sm mt-0.5">{formatArabicDate(new Date(selectedDate + 'T00:00:00'))}</p>
        </div>
        {Object.keys(overrides).length > 0 && (
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={16} />
            {saveMutation.isPending ? t('saving') : t('save_changes')}
          </button>
        )}
      </div>

      {/* Date navigation */}
      <div className="card mb-4 p-4">
        <div className="flex items-center gap-4">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-[4px] transition-colors">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setOverrides({}); }}
            className="input flex-1 text-center"
            dir="ltr"
          />
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-[4px] transition-colors">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-success">{presentCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('present')}</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-danger">{absentCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('absent')}</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-accent">{lateCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('late')}</p>
          </div>
        </div>
      )}

      {/* Attendance list */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-[8px]" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">{t('no_records')}</p>
            <p className="text-gray-300 text-xs mt-1">{t('make_sure_students_added')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map((record) => {
              const currentStatus = getStatus(record);
              const hasOverride = !!overrides[record.student_id];

              return (
                <div
                  key={record.student_id}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 transition-colors',
                    hasOverride && 'bg-blue-50/50',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {record.student_name?.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-800 text-sm">{record.student_name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
                      const { label, icon: Icon, class: cls } = statusConfig[status];
                      const isActive = currentStatus === status;
                      return (
                        <button
                          key={status}
                          onClick={() => setStatus(record.student_id, status)}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all',
                            isActive
                              ? `bg-current text-white ${cls} bg-opacity-10 ring-1 ring-current`
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                          )}
                          style={isActive ? { backgroundColor: 'rgba(0,0,0,0.06)' } : {}}
                        >
                          <Icon size={14} className={isActive ? cls : ''} />
                          <span className={isActive ? cls : ''}>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
