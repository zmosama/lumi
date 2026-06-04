'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { platformApi } from '@/lib/platform-auth';
import { ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';

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

  const inputClass =
    'w-full border border-gray-200 rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'text-red-500 text-xs mt-1';

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/platform/tenants" className="text-gray-400 hover:text-gray-600">
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 size={20} />
            إضافة مؤسسة جديدة
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">أنشئ مؤسسة للعميل مع حساب الأدمن</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Tenant info */}
        <div className="bg-white border border-gray-200 rounded-[8px] p-5">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
            بيانات المؤسسة
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>اسم المؤسسة</label>
              <input
                {...register('tenantName')}
                className={inputClass}
                placeholder="مدرسة النور الدولية"
              />
              {errors.tenantName && <p className={errorClass}>{errors.tenantName.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Subdomain</label>
              <input
                {...register('subdomain')}
                className={inputClass}
                placeholder="alnoor"
                dir="ltr"
              />
              {errors.subdomain && <p className={errorClass}>{errors.subdomain.message}</p>}
              <p className="text-gray-400 text-xs mt-1">
                الرابط سيكون: <span dir="ltr">[subdomain].lumi.app</span>
              </p>
            </div>

            <div>
              <label className={labelClass}>نوع المؤسسة</label>
              <select {...register('orgType')} className={inputClass}>
                {orgTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.orgType && <p className={errorClass}>{errors.orgType.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Initial branch */}
        <div className="bg-white border border-gray-200 rounded-[8px] p-5">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
            الفرع الأول
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>اسم الفرع</label>
              <input
                {...register('branchName')}
                className={inputClass}
                placeholder="الفرع الرئيسي"
              />
              {errors.branchName && <p className={errorClass}>{errors.branchName.message}</p>}
            </div>

            <div>
              <label className={labelClass}>المنطقة (اختياري)</label>
              <input
                {...register('branchArea')}
                className={inputClass}
                placeholder="المعادي"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Admin account */}
        <div className="bg-white border border-gray-200 rounded-[8px] p-5">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
            حساب الأدمن
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>الاسم</label>
              <input
                {...register('adminName')}
                className={inputClass}
                placeholder="أحمد محمد"
              />
              {errors.adminName && <p className={errorClass}>{errors.adminName.message}</p>}
            </div>

            <div>
              <label className={labelClass}>البريد الإلكتروني</label>
              <input
                {...register('adminEmail')}
                type="email"
                className={inputClass}
                placeholder="admin@alnoor.com"
                dir="ltr"
              />
              {errors.adminEmail && <p className={errorClass}>{errors.adminEmail.message}</p>}
            </div>

            <div>
              <label className={labelClass}>كلمة المرور</label>
              <input
                {...register('adminPassword')}
                type="password"
                className={inputClass}
                placeholder="••••••••"
              />
              {errors.adminPassword && (
                <p className={errorClass}>{errors.adminPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-[6px]">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-[6px] text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري الإنشاء...' : 'إنشاء المؤسسة'}
          </button>
          <Link
            href="/platform/tenants"
            className="px-6 py-2.5 border border-gray-200 rounded-[6px] text-sm text-gray-600 hover:bg-gray-50 transition-colors text-center"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
