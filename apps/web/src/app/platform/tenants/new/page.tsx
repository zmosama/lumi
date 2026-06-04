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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  tenantName: z.string().min(2, 'اسم المؤسسة مطلوب'),
  subdomain: z
    .string()
    .min(3, 'الـ subdomain 3 أحرف على الأقل')
    .max(30, 'الـ subdomain 30 حرف كحد أقصى')
    .regex(/^[a-z0-9-]+$/, 'أحرف إنجليزية صغيرة وأرقام وشرطة فقط'),
  orgType: z.enum(['SCHOOL', 'CENTER', 'PRIVATE_TUTOR']),
  branchName: z.string().min(1, 'اسم الفرع مطلوب'),
  branchArea: z.string().optional(),
  adminName: z.string().min(2, 'اسم الأدمن مطلوب'),
  adminEmail: z.string().email('بريد إلكتروني غير صالح'),
  adminPassword: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
});

type FormData = z.infer<typeof schema>;

const orgTypeOptions = [
  { value: 'SCHOOL', label: 'مدرسة' },
  { value: 'CENTER', label: 'سنتر تعليمي' },
  { value: 'PRIVATE_TUTOR', label: 'مدرس خصوصي' },
];

export default function NewTenantPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { orgType: 'SCHOOL' },
  });

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
      setError(typeof message === 'string' ? message : 'حدث خطأ أثناء إنشاء المؤسسة');
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
            إضافة مؤسسة جديدة
          </h1>
          <p className="text-muted-foreground text-sm mt-1">أنشئ مؤسسة للعميل مع حساب الأدمن الأساسي</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Tenant info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">بيانات المؤسسة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اسم المؤسسة</Label>
              <Input
                {...register('tenantName')}
                placeholder="مدرسة النور الدولية"
              />
              {errors.tenantName && <p className="text-destructive text-xs">{errors.tenantName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>المجال الفرعي (Subdomain)</Label>
              <Input
                {...register('subdomain')}
                placeholder="alnoor"
                dir="ltr"
                className="text-left"
              />
              {errors.subdomain && <p className="text-destructive text-xs">{errors.subdomain.message}</p>}
              <p className="text-muted-foreground text-xs">
                رابط الدخول سيكون: <span dir="ltr" className="font-mono text-primary">[subdomain].lumi.app</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>نوع المؤسسة</Label>
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
            <CardTitle className="text-base font-semibold">الفرع الأول</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اسم الفرع</Label>
              <Input
                {...register('branchName')}
                placeholder="الفرع الرئيسي"
              />
              {errors.branchName && <p className="text-destructive text-xs">{errors.branchName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>المنطقة (اختياري)</Label>
              <Input
                {...register('branchArea')}
                placeholder="المعادي"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Admin account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">بيانات حساب الأدمن</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input
                {...register('adminName')}
                placeholder="أحمد محمد"
              />
              {errors.adminName && <p className="text-destructive text-xs">{errors.adminName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
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
              <Label>كلمة المرور</Label>
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
            {isLoading ? 'جاري الإنشاء...' : 'إنشاء المؤسسة'}
          </Button>
          <Button
            type="button"
            variant="outline"
            asChild
            className="sm:w-32"
          >
            <Link href="/platform/tenants">
              إلغاء
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
