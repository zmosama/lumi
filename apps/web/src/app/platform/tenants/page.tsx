'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformApi, getPlatformUser } from '@/lib/platform-auth';
import { OrgType, ORG_TYPE_LABELS } from '@/types';
import { Plus, ToggleLeft, ToggleRight, Building2, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  orgType: OrgType;
  plan: string;
  isActive: boolean;
  createdAt: string;
  _count: { users: number };
}

export default function PlatformTenantsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const u = getPlatformUser();
    setIsOwner(u?.role === 'OWNER');
  }, []);

  const { data: tenants = [], isLoading } = useQuery<Tenant[]>({
    queryKey: ['platform-tenants'],
    queryFn: async () => {
      const { data } = await platformApi.get('/platform/tenants');
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => platformApi.patch(`/platform/tenants/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-tenants'] }),
  });

  const filtered = tenants.filter(
    (t) =>
      t.name.includes(search) ||
      t.subdomain.toLowerCase().includes(search.toLowerCase()),
  );

  const planBadge: Record<string, string> = {
    trial: 'bg-yellow-100 text-yellow-700',
    basic: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">المؤسسات المشتركة</h1>
          <p className="text-gray-500 text-sm mt-0.5">{tenants.length} مؤسسة</p>
        </div>
        <Link href="/platform/tenants/new" className="btn-primary flex items-center gap-2 text-sm px-4 py-2 bg-accent text-white rounded-[6px] hover:bg-accent/90 transition-colors">
          <Plus size={16} /> إضافة مؤسسة
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'إجمالي', value: tenants.length, color: 'text-gray-800' },
          { label: 'نشطة', value: tenants.filter((t) => t.isActive).length, color: 'text-green-600' },
          { label: 'تجريبية', value: tenants.filter((t) => t.plan === 'trial').length, color: 'text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-[8px] border border-gray-200 p-4 text-center">
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-[6px] px-3 py-2 pr-9 text-sm focus:outline-none focus:border-accent"
          placeholder="بحث باسم المؤسسة أو الـ subdomain..."
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-right font-medium text-gray-500 px-4 py-3">المؤسسة</th>
              <th className="text-right font-medium text-gray-500 px-4 py-3 hidden md:table-cell">النوع</th>
              <th className="text-right font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">الباقة</th>
              <th className="text-right font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">تاريخ الانضمام</th>
              <th className="text-right font-medium text-gray-500 px-4 py-3">الحالة</th>
              {isOwner && <th className="text-right font-medium text-gray-500 px-4 py-3">تفعيل</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <Building2 size={32} className="mx-auto mb-2 opacity-30" />
                  {search ? 'لا توجد نتائج' : 'لا توجد مؤسسات بعد'}
                </td>
              </tr>
            ) : (
              filtered.map((tenant) => (
                <tr key={tenant.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{tenant.name}</p>
                    <p className="text-gray-400 text-xs" dir="ltr">{tenant.subdomain}.lumi.app</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {ORG_TYPE_LABELS[tenant.orgType]}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', planBadge[tenant.plan] || 'bg-gray-100 text-gray-600')}>
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                    {new Date(tenant.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      tenant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
                    )}>
                      {tenant.isActive ? 'نشطة' : 'موقوفة'}
                    </span>
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleMutation.mutate(tenant.id)}
                        disabled={toggleMutation.isPending}
                        className="text-gray-400 hover:text-accent transition-colors disabled:opacity-40"
                        title={tenant.isActive ? 'إيقاف' : 'تفعيل'}
                      >
                        {tenant.isActive
                          ? <ToggleRight size={22} className="text-green-500" />
                          : <ToggleLeft size={22} />
                        }
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
