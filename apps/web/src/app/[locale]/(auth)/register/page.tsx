'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerTenant } from '@/lib/auth';
import { OrgType, CURRICULUM_LABELS, Curriculum, Ownership } from '@/types';
import { GraduationCap, CheckCircle, ChevronRight, ChevronLeft, School, BookOpen, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

// ─── Component ──────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('Register');
  const tCommon = useTranslations('Common');
  const tVal = useTranslations('Validation');
  
  const [step, setStep] = useState(1);
  const [orgType, setOrgType] = useState<OrgType>('SCHOOL');
  const [step2Data, setStep2Data] = useState<any>(null);
  const [step3Data, setStep3Data] = useState<any>(null);
  const [selectedCurriculums, setSelectedCurriculums] = useState<Curriculum[]>([]);
  const [selectedOwnership, setSelectedOwnership] = useState<Ownership | ''>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const step2Schema = z.object({
    tenantName: z.string().min(2, tVal('required_name')),
    subdomain: z
      .string()
      .min(3, tVal('subdomain_min_3'))
      .max(30)
      .regex(/^[a-z0-9-]+$/, tVal('subdomain_regex')),
  });
  
  const step3Schema = z.object({
    branchName: z.string().min(2, tVal('required_name')),
    branchArea: z.string().optional(),
    curriculums: z.array(z.string()).optional(),
    ownership: z.string().optional(),
  });
  
  const step4Schema = z.object({
    adminName: z.string().min(2, tVal('required_name')),
    adminEmail: z.string().email(tVal('invalid_email')),
    adminPassword: z.string().min(8, tVal('password_min_8')),
  });

  const form2 = useForm<z.infer<typeof step2Schema>>({ resolver: zodResolver(step2Schema) });
  const form3 = useForm<z.infer<typeof step3Schema>>({ resolver: zodResolver(step3Schema) });
  const form4 = useForm<z.infer<typeof step4Schema>>({ resolver: zodResolver(step4Schema) });

  const subdomain = form2.watch('subdomain', '');
  const isSchool = orgType === 'SCHOOL';

  const orgTypes = [
    { type: 'SCHOOL' as OrgType, label: t('org_school'), desc: t('org_school_desc'), icon: School },
    { type: 'CENTER' as OrgType, label: t('org_center'), desc: t('org_center_desc'), icon: BookOpen },
    { type: 'PRIVATE_TUTOR' as OrgType, label: t('org_tutor'), desc: t('org_tutor_desc'), icon: User },
  ];

  const toggleCurriculum = (c: Curriculum) => {
    setSelectedCurriculums((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const handleStep4Submit = async (data: z.infer<typeof step4Schema>) => {
    if (!step2Data || !step3Data) return;
    setIsLoading(true);
    setError('');
    try {
      await registerTenant({
        tenantName: step2Data.tenantName,
        subdomain: step2Data.subdomain,
        orgType,
        initialBranch: {
          name: step3Data.branchName,
          area: step3Data.branchArea,
          curriculums: isSchool ? selectedCurriculums : [],
          ownership: isSchool && selectedOwnership ? selectedOwnership : undefined,
        },
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        adminName: data.adminName,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || t('connection_error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="text-center max-w-sm shadow-xl border-border/50">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-success" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-foreground">{t('success_title')}</CardTitle>
            <CardDescription className="mt-2">{t('success_desc')}</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  const branchTermSingular = orgType === 'PRIVATE_TUTOR' ? t('group') : t('branch');
  const steps = [t('step1_title'), t('step2_title'), isSchool ? t('step3_school') : `${branchTermSingular} ${t('first')}`, t('step4_title')];

  const CURRICULUM_OPTIONS: { value: Curriculum; label: string }[] = [
    { value: 'ARABIC', label: t('curriculum_arabic') },
    { value: 'LANGUAGES', label: t('curriculum_languages') },
    { value: 'IG', label: 'IG' },
  ];
  
  const OWNERSHIP_OPTIONS: { value: Ownership; label: string }[] = [
    { value: 'PRIVATE', label: t('ownership_private') },
    { value: 'GOVERNMENT', label: t('ownership_government') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-3 shadow-lg shadow-primary/20">
            <GraduationCap size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary font-ibm">{tCommon('lumi')}</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm',
                  step > i + 1
                    ? 'bg-success text-white'
                    : step === i + 1
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn('w-8 h-0.5 transition-all rounded-full', step > i + 1 ? 'bg-success' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold">
              {step === 1 && t('step1_title')}
              {step === 2 && t('step2_title')}
              {step === 3 && (isSchool ? t('step3_school_title') : `${t('step3_generic_title')} ${branchTermSingular}`)}
              {step === 4 && t('step4_title')}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-3">
                {orgTypes.map(({ type, label, desc, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setOrgType(type)}
                    className={cn(
                      'w-full flex items-start gap-4 p-4 rounded-xl border-2 text-right transition-all',
                      orgType === type
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-border/80 hover:bg-muted/50',
                    )}
                  >
                    <div className={cn('p-2.5 rounded-lg transition-colors', orgType === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <p className={cn("font-semibold", orgType === type ? "text-primary" : "text-foreground")}>{label}</p>
                      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                    </div>
                  </button>
                ))}
                <Button onClick={() => setStep(2)} className="w-full mt-4" size="lg">
                  {tCommon('next')} <ChevronLeft size={18} className="ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={form2.handleSubmit((d) => { setStep2Data(d); setStep(3); })} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="tenantName">{t('tenant_name_label')}</Label>
                  <Input id="tenantName" {...form2.register('tenantName')} placeholder={t('tenant_name_placeholder')} />
                  {form2.formState.errors.tenantName && (
                    <p className="text-destructive text-xs">{form2.formState.errors.tenantName.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain">{t('subdomain_label')}</Label>
                  <Input id="subdomain" {...form2.register('subdomain')} placeholder="alnoor" dir="ltr" className="text-left" />
                  {subdomain && <p className="text-xs text-muted-foreground" dir="ltr">{subdomain}.lumi.app</p>}
                  {form2.formState.errors.subdomain && (
                    <p className="text-destructive text-xs">{form2.formState.errors.subdomain.message as string}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ChevronRight size={18} className="mr-2" /> {tCommon('back')}
                  </Button>
                  <Button type="submit" className="flex-[2]">
                    {tCommon('next')} <ChevronLeft size={18} className="ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={form3.handleSubmit((d) => { setStep3Data(d); setStep(4); })} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="branchName">
                    {isSchool ? t('branch_name_school') : orgType === 'PRIVATE_TUTOR' ? t('group_name') : t('branch_name')}
                  </Label>
                  <Input id="branchName" {...form3.register('branchName')} placeholder={isSchool ? t('branch_placeholder_school') : orgType === 'PRIVATE_TUTOR' ? t('group_placeholder') : t('branch_placeholder')} />
                  {form3.formState.errors.branchName && (
                    <p className="text-destructive text-xs">{form3.formState.errors.branchName.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchArea">{t('branch_area')}</Label>
                  <Input id="branchArea" {...form3.register('branchArea')} placeholder={t('branch_area_placeholder')} />
                </div>
                {isSchool && (
                  <>
                    <div className="space-y-2">
                      <Label>{t('curriculum_type')}</Label>
                      <div className="flex flex-wrap gap-2">
                        {CURRICULUM_OPTIONS.map(({ value, label }) => (
                          <button key={value} type="button" onClick={() => toggleCurriculum(value)} className={cn('px-4 py-2 rounded-md text-sm font-medium border transition-all', selectedCurriculums.includes(value) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-muted')}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('ownership_type')}</Label>
                      <div className="flex gap-2">
                        {OWNERSHIP_OPTIONS.map(({ value, label }) => (
                          <button key={value} type="button" onClick={() => setSelectedOwnership(selectedOwnership === value ? '' : value)} className={cn('flex-1 py-2 rounded-md text-sm font-medium border transition-all', selectedOwnership === value ? 'bg-accent text-accent-foreground border-accent' : 'bg-background text-muted-foreground border-border hover:border-accent/50 hover:bg-muted')}>{label}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ChevronRight size={18} className="mr-2" /> {tCommon('back')}
                  </Button>
                  <Button type="submit" className="flex-[2]">
                    {tCommon('next')} <ChevronLeft size={18} className="ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {step === 4 && (
              <form onSubmit={form4.handleSubmit(handleStep4Submit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="adminName">{t('admin_name')}</Label>
                  <Input id="adminName" {...form4.register('adminName')} placeholder={t('admin_name_placeholder')} />
                  {form4.formState.errors.adminName && (
                    <p className="text-destructive text-xs">{form4.formState.errors.adminName.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">{t('admin_email')}</Label>
                  <Input id="adminEmail" {...form4.register('adminEmail')} type="email" placeholder="admin@school.com" dir="ltr" className="text-left" />
                  {form4.formState.errors.adminEmail && (
                    <p className="text-destructive text-xs">{form4.formState.errors.adminEmail.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">{t('admin_password')}</Label>
                  <Input id="adminPassword" {...form4.register('adminPassword')} type="password" placeholder={t('admin_password_placeholder')} dir="ltr" className="text-left" />
                  {form4.formState.errors.adminPassword && (
                    <p className="text-destructive text-xs">{form4.formState.errors.adminPassword.message as string}</p>
                  )}
                </div>
                {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md font-medium">{error}</div>}
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">
                    <ChevronRight size={18} className="mr-2" /> {tCommon('back')}
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-[2]">
                    {isLoading ? t('registering') : t('create_account')}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('have_account')}{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              {t('login_here')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
