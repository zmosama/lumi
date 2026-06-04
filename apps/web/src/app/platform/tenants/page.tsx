'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformApi, getPlatformUser } from '@/lib/platform-auth';
import { OrgType, ORG_TYPE_LABELS } from '@/types';
import { Plus, ToggleLeft, ToggleRight, Building2, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    pro: 'bg-primary/10 text-primary',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">المؤسسات المشتركة</h1>
          <p className="text-muted-foreground text-sm mt-1">{tenants.length} مؤسسة مسجلة في المنصة</p>
        </div>
        <Button asChild>
          <Link href="/platform/tenants/new" className="flex items-center gap-2">
            <Plus size={16} /> إضافة مؤسسة
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'إجمالي', value: tenants.length, color: 'text-foreground' },
          { label: 'نشطة', value: tenants.filter((t) => t.isActive).length, color: 'text-green-600' },
          { label: 'تجريبية', value: tenants.filter((t) => t.plan === 'trial').length, color: 'text-yellow-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6 text-center">
              <p className={cn('text-3xl font-bold', s.color)}>{s.value}</p>
              <p className="text-muted-foreground text-sm mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9"
          placeholder="بحث باسم المؤسسة أو الـ subdomain..."
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-right">المؤسسة</TableHead>
              <TableHead className="text-right hidden md:table-cell">النوع</TableHead>
              <TableHead className="text-right hidden lg:table-cell">الباقة</TableHead>
              <TableHead className="text-right hidden lg:table-cell">تاريخ الانضمام</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              {isOwner && <TableHead className="text-right">تفعيل</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <Building2 size={32} className="mx-auto mb-2 opacity-30" />
                  {search ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد مؤسسات بعد'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{tenant.name}</p>
                    <p className="text-muted-foreground text-xs" dir="ltr">{tenant.subdomain}.lumi.app</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {ORG_TYPE_LABELS[tenant.orgType]}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium inline-block', planBadge[tenant.plan] || 'bg-muted text-muted-foreground')}>
                      {tenant.plan === 'trial' ? 'تجريبية' : tenant.plan === 'basic' ? 'أساسية' : 'برو'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                    {new Date(tenant.createdAt).toLocaleDateString('ar-EG')}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium inline-block',
                      tenant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
                    )}>
                      {tenant.isActive ? 'نشطة' : 'موقوفة'}
                    </span>
                  </TableCell>
                  {isOwner && (
                    <TableCell>
                      <button
                        onClick={() => toggleMutation.mutate(tenant.id)}
                        disabled={toggleMutation.isPending}
                        className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
                        title={tenant.isActive ? 'إيقاف' : 'تفعيل'}
                      >
                        {tenant.isActive
                          ? <ToggleRight size={22} className="text-green-500" />
                          : <ToggleLeft size={22} />
                        }
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
