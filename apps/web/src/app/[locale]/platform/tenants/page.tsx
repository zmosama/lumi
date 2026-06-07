'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformApi, getPlatformUser } from '@/lib/platform-auth';
import { OrgType } from '@/types';
import { Plus, ToggleLeft, ToggleRight, Building2, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('PlatformTenants');
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{tenants.length} {t('registered_tenants')}</p>
        </div>
        <Link
          href="/platform/tenants/new"
          className={cn(buttonVariants({ variant: 'default' }), 'flex items-center gap-2')}
        >
          <Plus size={16} /> {t('add_tenant')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t('total'), value: tenants.length, color: 'text-foreground' },
          { label: t('active'), value: tenants.filter((x) => x.isActive).length, color: 'text-green-600' },
          { label: t('trial'), value: tenants.filter((x) => x.plan === 'trial').length, color: 'text-yellow-600' },
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
          placeholder={t('search_placeholder')}
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-right">{t('th_tenant')}</TableHead>
              <TableHead className="text-right hidden md:table-cell">{t('th_type')}</TableHead>
              <TableHead className="text-right hidden lg:table-cell">{t('th_plan')}</TableHead>
              <TableHead className="text-right hidden lg:table-cell">{t('th_joined_date')}</TableHead>
              <TableHead className="text-right">{t('th_status')}</TableHead>
              {isOwner && <TableHead className="text-right">{t('th_toggle')}</TableHead>}
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
                  {search ? t('no_search_results') : t('no_tenants_yet')}
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
                    {t(`org_type_${tenant.orgType.toLowerCase()}`)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium inline-block', planBadge[tenant.plan] || 'bg-muted text-muted-foreground')}>
                      {tenant.plan === 'trial' ? t('plan_trial') : tenant.plan === 'basic' ? t('plan_basic') : t('plan_pro')}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                    {/* We format Date natively for simplicity, or use a formatting util */}
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium inline-block',
                      tenant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
                    )}>
                      {tenant.isActive ? t('active_status') : t('inactive_status')}
                    </span>
                  </TableCell>
                  {isOwner && (
                    <TableCell>
                      <button
                        onClick={() => toggleMutation.mutate(tenant.id)}
                        disabled={toggleMutation.isPending}
                        className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
                        title={tenant.isActive ? t('deactivate') : t('activate')}
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
