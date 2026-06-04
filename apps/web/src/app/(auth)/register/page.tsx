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

// ─── Step 1: اختيار نوع المؤسسة ────────────────────────────────────────────

const orgTypes: { type: OrgType; label: string; desc: string; icon: React.ElementType }[] = [
  { type: 'SCHOOL', label: 'مدرسة', desc: 'مدرسة حكومية أو خاصة بفروع ومراحل دراسية', icon: School },
  { type: 'CENTER', label: 'سنتر تعليمي', desc: 'سنتر تقوية أو مراجعة بفروع وفصول', icon: BookOpen },
  { type: 'PRIVATE_TUTOR', label: 'مدرس خصوصي', desc: 'مدرس خصوصي يدير مجموعات ومناطق', icon: User },
];

// ─── Schemas ────────────────────────────────────────────────────────────────

const step2Schema = z.object({
  tenantName: z.string().min(2, 'الاسم مطلوب'),
  subdomain: z
    .string()
    .min(3, 'المعرف لازم 3 أحرف على الأقل')
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'حروف إنجليزية صغيرة وأرقام وشرطة فقط'),
});

const step3Schema = z.object({
  branchName: z.string().min(2, 'الاسم مطلوب'),
  branchArea: z.string().optional(),
  curriculums: z.array(z.string()).optional(),
  ownership: z.string().optional(),
});

const step4Schema = z.object({
  adminName: z.string().min(2, 'الاسم مطلوب'),
  adminEmail: z.string().email('بريد إلكتروني غير صالح'),
  adminPassword: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
});

type Step2Form = z.infer<typeof step2Schema>;
type Step3Form = z.infer<typeof step3Schema>;
type Step4Form = z.infer<typeof step4Schema>;

const CURRICULUM_OPTIONS: { value: Curriculum; label: string }[] = [
  { value: 'ARABIC', label: 'عربي' },
  { value: 'LANGUAGES', label: 'لغات' },
  { value: 'IG', label: 'IG' },
];

const OWNERSHIP_OPTIONS: { value: Ownership; label: string }[] = [
  { value: 'PRIVATE', label: 'خاصة' },
  { value: 'GOVERNMENT', label: 'حكومية / عامة' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orgType, setOrgType] = useState<OrgType>('SCHOOL');
  const [step2Data, setStep2Data] = useState<Step2Form | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Form | null>(null);
  const [selectedCurriculums, setSelectedCurriculums] = useState<Curriculum[]>([]);
  const [selectedOwnership, setSelectedOwnership] = useState<Ownership | ''>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form2 = useForm<Step2Form>({ resolver: zodResolver(step2Schema) });
  const form3 = useForm<Step3Form>({ resolver: zodResolver(step3Schema) });
  const form4 = useForm<Step4Form>({ resolver: zodResolver(step4Schema) });

  const subdomain = form2.watch('subdomain', '');
  const isSchool = orgType === 'SCHOOL';

  const toggleCurriculum = (c: Curriculum) => {
    setSelectedCurriculums((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const branchTermSingular =
    orgType === 'PRIVATE_TUTOR' ? 'مجموعة' : 'فرع';

  const handleStep4Submit = async (data: Step4Form) => {
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
      setError(msg || 'حدث خطأ في الاتصال. برجاء التأكد من تشغيل قاعدة البيانات (Docker).');
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
            <CardTitle className="text-xl font-bold text-foreground">تم التسجيل بنجاح!</CardTitle>
            <CardDescription className="mt-2">سيتم تحويلك لصفحة الدخول...</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Step indicator ──────────────────────────────────────────────────────────
  const steps = ['نوع المؤسسة', 'بيانات المؤسسة', isSchool ? 'الفرع الأول' : branchTermSingular + ' الأول', 'حساب المسؤول'];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-3 shadow-lg shadow-primary/20">
            <GraduationCap size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary font-ibm">Lumi</h1>
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
              {step === 1 && 'اختر نوع المؤسسة'}
              {step === 2 && 'بيانات المؤسسة'}
              {step === 3 && (isSchool ? 'بيانات الفرع الأول' : `بيانات ${branchTermSingular} الأول`)}
              {step === 4 && 'حساب المسؤول'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* ── Step 1: Org Type ──────────────────────────────────────────── */}
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
                  التالي <ChevronLeft size={18} className="ml-2" />
                </Button>
              </div>
            )}

            {/* ── Step 2: Org Details ───────────────────────────────────────── */}
            {step === 2 && (
              <form
                onSubmit={form2.handleSubmit((d) => { setStep2Data(d); setStep(3); })}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="tenantName">اسم المؤسسة</Label>
                  <Input id="tenantName" {...form2.register('tenantName')} placeholder="مثال: مدرسة النور" />
                  {form2.formState.errors.tenantName && (
                    <p className="text-destructive text-xs">{form2.formState.errors.tenantName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain">المعرف الإلكتروني (Subdomain)</Label>
                  <Input id="subdomain" {...form2.register('subdomain')} placeholder="alnoor" dir="ltr" className="text-left" />
                  {subdomain && (
                    <p className="text-xs text-muted-foreground" dir="ltr">{subdomain}.lumi.app</p>
                  )}
                  {form2.formState.errors.subdomain && (
                    <p className="text-destructive text-xs">{form2.formState.errors.subdomain.message}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ChevronRight size={18} className="mr-2" /> رجوع
                  </Button>
                  <Button type="submit" className="flex-[2]">
                    التالي <ChevronLeft size={18} className="ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {/* ── Step 3: Branch / Group Details ───────────────────────────── */}
            {step === 3 && (
              <form
                onSubmit={form3.handleSubmit((d) => { setStep3Data(d); setStep(4); })}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="branchName">
                    {isSchool ? 'اسم الفرع' : orgType === 'PRIVATE_TUTOR' ? 'اسم المجموعة' : 'اسم الفرع'}
                  </Label>
                  <Input
                    id="branchName"
                    {...form3.register('branchName')}
                    placeholder={isSchool ? 'مثال: فرع المعادي' : orgType === 'PRIVATE_TUTOR' ? 'مثال: مجموعة الصباح' : 'فرع رئيسي'}
                  />
                  {form3.formState.errors.branchName && (
                    <p className="text-destructive text-xs">{form3.formState.errors.branchName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchArea">المنطقة / الموقع</Label>
                  <Input id="branchArea" {...form3.register('branchArea')} placeholder="مثال: المعادي، القاهرة" />
                </div>

                {/* School-only fields */}
                {isSchool && (
                  <>
                    <div className="space-y-2">
                      <Label>نوع المنهج (ممكن أكتر من اختيار)</Label>
                      <div className="flex flex-wrap gap-2">
                        {CURRICULUM_OPTIONS.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => toggleCurriculum(value)}
                            className={cn(
                              'px-4 py-2 rounded-md text-sm font-medium border transition-all',
                              selectedCurriculums.includes(value)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-muted',
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>نوع الملكية</Label>
                      <div className="flex gap-2">
                        {OWNERSHIP_OPTIONS.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedOwnership(selectedOwnership === value ? '' : value)}
                            className={cn(
                              'flex-1 py-2 rounded-md text-sm font-medium border transition-all',
                              selectedOwnership === value
                                ? 'bg-accent text-accent-foreground border-accent'
                                : 'bg-background text-muted-foreground border-border hover:border-accent/50 hover:bg-muted',
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ChevronRight size={18} className="mr-2" /> رجوع
                  </Button>
                  <Button type="submit" className="flex-[2]">
                    التالي <ChevronLeft size={18} className="ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {/* ── Step 4: Admin Account ─────────────────────────────────────── */}
            {step === 4 && (
              <form onSubmit={form4.handleSubmit(handleStep4Submit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="adminName">اسمك</Label>
                  <Input id="adminName" {...form4.register('adminName')} placeholder="أحمد محمد" />
                  {form4.formState.errors.adminName && (
                    <p className="text-destructive text-xs">{form4.formState.errors.adminName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">البريد الإلكتروني</Label>
                  <Input id="adminEmail" {...form4.register('adminEmail')} type="email" placeholder="admin@school.com" dir="ltr" className="text-left" />
                  {form4.formState.errors.adminEmail && (
                    <p className="text-destructive text-xs">{form4.formState.errors.adminEmail.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">كلمة المرور</Label>
                  <Input id="adminPassword" {...form4.register('adminPassword')} type="password" placeholder="8 أحرف على الأقل" dir="ltr" className="text-left" />
                  {form4.formState.errors.adminPassword && (
                    <p className="text-destructive text-xs">{form4.formState.errors.adminPassword.message}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md font-medium">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">
                    <ChevronRight size={18} className="mr-2" /> رجوع
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-[2]">
                    {isLoading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            عندك حساب؟{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              سجل دخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
