'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { platformApi } from '@/lib/platform-auth';
import { ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

const useNewTenantSchema = () => {
  const tVal = useTranslations('Validation');
  return z.object({
    tenantName: z.string().min(2, tVal('required_name')),
    subdomain: z
      .string()
      .min(3, tVal('subdomain_min_3'))
      .max(30, tVal('subdomain_max_30'))
      .regex(/^[a-z0-9-]+$/, tVal('subdomain_regex')),
    orgType: z.enum(['SCHOOL', 'CENTER', 'PRIVATE_TUTOR']),
    branchName: z.string().min(1, tVal('required_name')),
    branchArea: z.string().optional(),
    adminName: z.string().min(2, tVal('required_name')),
    adminEmail: z.string().email(tVal('invalid_email')),
    adminPassword: z.string().min(8, tVal('password_min_8')),
  });
};

type FormData = z.infer<ReturnType<typeof useNewTenantSchema>>;

export default function NewTenantPage() {
  const router = useRouter();
  const t = useTranslations('PlatformTenants');
  const tCommon = useTranslations('Common');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const schema = useNewTenantSchema();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { orgType: 'SCHOOL' },
  });

  const orgTypeOptions = [
    { value: 'SCHOOL', label: t('org_type_school') },
    { value: 'CENTER', label: t('org_type_center') },
    { value: 'PRIVATE_TUTOR', label: t('org_type_private_tutor') },
  ];

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');
    try {
      await platformApi.post('/platform/tenants', {
        tenantName: data.tenantName,
        subdomain: data.subdomain,
        orgType: data.orgType,
        initialBranch: {
          name: data.branchName,
          area: data.branchArea || undefined,
        },
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        adminName: data.adminName,
      });
      router.push('/platform/tenants');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof message === 'string' ? message : t('error_creating_tenant'));
    } finally {
      setIsLoading(false);
    }
  };

  const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/platform/tenants" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 size={24} className="text-primary" />
            {t('add_tenant')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t('add_tenant_desc')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Tenant info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('tenant_data')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('tenant_name')}</Label>
              <Input
                {...register('tenantName')}
                placeholder={t('placeholder_tenant_name')}
              />
              {errors.tenantName && <p className="text-destructive text-xs">{errors.tenantName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('subdomain')}</Label>
              <Input
                {...register('subdomain')}
                placeholder="alnoor"
                dir="ltr"
                className="text-left"
              />
              {errors.subdomain && <p className="text-destructive text-xs">{errors.subdomain.message}</p>}
              <p className="text-muted-foreground text-xs">
                {t('login_link_will_be')}: <span dir="ltr" className="font-mono text-primary">[subdomain].lumi.app</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t('org_type')}</Label>
              <select {...register('orgType')} className={selectClass}>
                {orgTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.orgType && <p className="text-destructive text-xs">{errors.orgType.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Initial branch */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('first_branch')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('branch_name')}</Label>
              <Input
                {...register('branchName')}
                placeholder={t('placeholder_main_branch')}
              />
              {errors.branchName && <p className="text-destructive text-xs">{errors.branchName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('area_optional')}</Label>
              <Input
                {...register('branchArea')}
                placeholder={t('placeholder_area')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Admin account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('admin_account_data')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('name')}</Label>
              <Input
                {...register('adminName')}
                placeholder={t('placeholder_admin_name')}
              />
              {errors.adminName && <p className="text-destructive text-xs">{errors.adminName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('email')}</Label>
              <Input
                {...register('adminEmail')}
                type="email"
                placeholder="admin@alnoor.com"
                dir="ltr"
                className="text-left"
              />
              {errors.adminEmail && <p className="text-destructive text-xs">{errors.adminEmail.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('password')}</Label>
              <Input
                {...register('adminPassword')}
                type="password"
                placeholder="••••••••"
                dir="ltr"
                className="text-left"
              />
              {errors.adminPassword && (
                <p className="text-destructive text-xs">{errors.adminPassword.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? t('creating') : t('create_tenant')}
          </Button>
          <Link
            href="/platform/tenants"
            className={`${buttonVariants({ variant: 'outline' })} sm:w-32`}
          >
            {tCommon('cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
