'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/lib/auth';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  subdomain: z.string().min(1, 'ادخل معرف المؤسسة'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(1, 'ادخل كلمة المرور'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      await login(data);
      router.push('/dashboard');
    } catch {
      setError('بيانات الدخول غير صحيحة، تحقق من المعرف والبريد وكلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-[8px] mb-4 shadow-md">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-600 font-ibm">لومي</h1>
          <p className="text-gray-500 text-sm mt-1">نظام إدارة المدارس والسنترات</p>
        </div>

        {/* Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">تسجيل الدخول</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">معرف المؤسسة (Subdomain)</label>
              <input
                {...register('subdomain')}
                className="input"
                placeholder="مثال: alnoor"
                dir="ltr"
              />
              {errors.subdomain && (
                <p className="text-danger text-xs mt-1">{errors.subdomain.message}</p>
              )}
            </div>

            <div>
              <label className="label">البريد الإلكتروني</label>
              <input
                {...register('email')}
                type="email"
                className="input"
                placeholder="admin@school.com"
                dir="ltr"
              />
              {errors.email && (
                <p className="text-danger text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-danger text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-danger text-sm p-3 rounded-[4px]">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              مؤسستك مش مسجلة؟{' '}
              <Link href="/register" className="text-primary-600 font-medium hover:underline">
                سجّل مجاناً
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
