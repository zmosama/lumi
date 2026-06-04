'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/lib/auth';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'حدث خطأ في الاتصال. برجاء التأكد من تشغيل قاعدة البيانات (Docker).');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4 shadow-lg shadow-primary/20">
          <GraduationCap size={32} className="text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-primary font-ibm">Lumi</h1>
        <p className="text-muted-foreground text-sm mt-2">نظام إدارة المدارس والسنترات</p>
      </div>

      {/* Form */}
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بيانات مؤسستك للدخول إلى لوحة التحكم</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="subdomain">معرف المؤسسة (Subdomain)</Label>
              <Input
                id="subdomain"
                {...register('subdomain')}
                placeholder="مثال: alnoor"
                dir="ltr"
                className="text-left"
              />
              {errors.subdomain && (
                <p className="text-destructive text-xs">{errors.subdomain.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                {...register('email')}
                type="email"
                placeholder="admin@school.com"
                dir="ltr"
                className="text-left"
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? 'جاري الدخول...' : 'دخول'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t p-6 mt-2">
          <p className="text-sm text-muted-foreground text-center">
            مؤسستك غير مسجلة؟{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              سجّل مجاناً
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
