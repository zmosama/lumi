'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/lib/auth';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// We move schema creation into a hook so we can use useTranslations inside
const useLoginSchema = () => {
  const t = useTranslations('Validation');
  return z.object({
    subdomain: z.string().min(1, t('required_subdomain')),
    email: z.string().email(t('invalid_email')),
    password: z.string().min(1, t('required_password')),
  });
};

type LoginForm = z.infer<ReturnType<typeof useLoginSchema>>;

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = useLoginSchema();
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
      setError(msg || t('connection_error'));
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
        <h1 className="text-4xl font-bold text-primary font-ibm">{tCommon('lumi')}</h1>
        <p className="text-muted-foreground text-sm mt-2">{t('subtitle')}</p>
      </div>

      {/* Form */}
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">{t('login_title')}</CardTitle>
          <CardDescription>{t('login_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="subdomain">{t('subdomain_label')}</Label>
              <Input
                id="subdomain"
                {...register('subdomain')}
                placeholder={t('subdomain_placeholder')}
                dir="ltr"
                className="text-left"
              />
              {errors.subdomain && (
                <p className="text-destructive text-xs">{errors.subdomain.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email_label')}</Label>
              <Input
                id="email"
                {...register('email')}
                type="email"
                placeholder="admin@school.com"
                dir="ltr"
                className="text-left"
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password_label')}</Label>
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
                <p className="text-destructive text-xs">{errors.password.message as string}</p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? t('loading') : t('login_button')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t p-6 mt-2">
          <p className="text-sm text-muted-foreground text-center">
            {t('no_account')}{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              {t('register_free')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
