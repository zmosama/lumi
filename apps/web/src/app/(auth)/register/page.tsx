'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerTenant } from '@/lib/auth';
import { GraduationCap, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
  tenantName: z.string().min(2, 'اسم المؤسسة مطلوب'),
  subdomain: z
    .string()
    .min(3, 'المعرف لازم يكون 3 أحرف على الأقل')
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'حروف إنجليزية صغيرة وأرقام وشرطة فقط'),
  adminName: z.string().min(2, 'اسم المسؤول مطلوب'),
  adminEmail: z.string().email('بريد إلكتروني غير صالح'),
  adminPassword: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const subdomain = watch('subdomain', '');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    try {
      await registerTenant(data);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-success" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">تم التسجيل بنجاح!</h2>
          <p className="text-gray-500 text-sm mt-2">سيتم تحويلك لصفحة الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-[8px] mb-4 shadow-md">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-600 font-ibm">لومي</h1>
          <p className="text-gray-500 text-sm mt-1">سجّل مؤسستك مجاناً</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">إنشاء حساب جديد</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">اسم المدرسة / السنتر</label>
              <input {...register('tenantName')} className="input" placeholder="مثال: سنتر النور التعليمي" />
              {errors.tenantName && <p className="text-danger text-xs mt-1">{errors.tenantName.message}</p>}
            </div>

            <div>
              <label className="label">معرف المؤسسة (Subdomain)</label>
              <input
                {...register('subdomain')}
                className="input"
                placeholder="alnoor"
                dir="ltr"
              />
              {subdomain && (
                <p className="text-xs text-gray-400 mt-1 dir-ltr" dir="ltr">
                  {subdomain}.lumi.app
                </p>
              )}
              {errors.subdomain && <p className="text-danger text-xs mt-1">{errors.subdomain.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">اسم المسؤول</label>
                <input {...register('adminName')} className="input" placeholder="أحمد محمد" />
                {errors.adminName && <p className="text-danger text-xs mt-1">{errors.adminName.message}</p>}
              </div>
              <div>
                <label className="label">البريد الإلكتروني</label>
                <input {...register('adminEmail')} type="email" className="input" placeholder="admin@school.com" dir="ltr" />
                {errors.adminEmail && <p className="text-danger text-xs mt-1">{errors.adminEmail.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">كلمة المرور</label>
              <input {...register('adminPassword')} type="password" className="input" placeholder="8 أحرف على الأقل" />
              {errors.adminPassword && <p className="text-danger text-xs mt-1">{errors.adminPassword.message}</p>}
            </div>

            {error && <div className="bg-red-50 text-danger text-sm p-3 rounded-[4px]">{error}</div>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-60">
              {isLoading ? 'جاري التسجيل...' : 'إنشاء الحساب مجاناً'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              عندك حساب؟{' '}
              <Link href="/login" className="text-primary-600 font-medium hover:underline">
                سجل دخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
