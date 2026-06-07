'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { platformLogin } from '@/lib/platform-auth';
import { GraduationCap, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function PlatformLoginPage() {
  const router = useRouter();
  const t = useTranslations('PlatformLogin');
  const tCommon = useTranslations('Common');
  const tVal = useTranslations('Validation');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await platformLogin(email, password);
      router.replace('/platform/tenants');
    } catch {
      setError(t('invalid_credentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-3 shadow-lg shadow-primary/20">
            <GraduationCap size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary font-ibm">{tCommon('lumi')}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t('platform_admin')}</p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Lock size={18} className="text-primary" />
              {t('login_title')}
            </CardTitle>
            <CardDescription>
              {t('login_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mohammedosama@gmail.com"
                  dir="ltr"
                  className="text-left"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="text-left"
                  required
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2"
              >
                {isLoading ? t('loading') : t('login_button')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
