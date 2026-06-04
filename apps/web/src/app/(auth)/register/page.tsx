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

  // ── Step indicator ──────────────────────────────────────────────────────────
  const steps = ['نوع المؤسسة', 'بيانات المؤسسة', isSchool ? 'الفرع الأول' : branchTermSingular + ' الأول', 'حساب المسؤول'];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-[8px] mb-3 shadow-md">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary-600 font-ibm">لومي</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step > i + 1
                    ? 'bg-success text-white'
                    : step === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-400',
                )}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn('w-8 h-0.5 transition-all', step > i + 1 ? 'bg-success' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {step === 1 && 'اختر نوع المؤسسة'}
            {step === 2 && 'بيانات المؤسسة'}
            {step === 3 && (isSchool ? 'بيانات الفرع الأول' : `بيانات ${branchTermSingular} الأول`)}
            {step === 4 && 'حساب المسؤول'}
          </h2>

          {/* ── Step 1: Org Type ──────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-3">
              {orgTypes.map(({ type, label, desc, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setOrgType(type)}
                  className={cn(
                    'w-full flex items-start gap-4 p-4 rounded-[8px] border-2 text-right transition-all',
                    orgType === type
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  <div className={cn('p-2 rounded-[8px]', orgType === type ? 'bg-primary-600' : 'bg-gray-100')}>
                    <Icon size={20} className={orgType === type ? 'text-white' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
              <button onClick={() => setStep(2)} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
                <span>التالي</span>
                <ChevronLeft size={18} />
              </button>
            </div>
          )}

          {/* ── Step 2: Org Details ───────────────────────────────────────── */}
          {step === 2 && (
            <form
              onSubmit={form2.handleSubmit((d) => { setStep2Data(d); setStep(3); })}
              className="space-y-4"
            >
              <div>
                <label className="label">اسم المؤسسة</label>
                <input {...form2.register('tenantName')} className="input" placeholder="مثال: مدرسة النور" />
                {form2.formState.errors.tenantName && (
                  <p className="text-danger text-xs mt-1">{form2.formState.errors.tenantName.message}</p>
                )}
              </div>
              <div>
                <label className="label">المعرف الإلكتروني (Subdomain)</label>
                <input {...form2.register('subdomain')} className="input" placeholder="alnoor" dir="ltr" />
                {subdomain && (
                  <p className="text-xs text-gray-400 mt-1" dir="ltr">{subdomain}.lumi.app</p>
                )}
                {form2.formState.errors.subdomain && (
                  <p className="text-danger text-xs mt-1">{form2.formState.errors.subdomain.message}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
                  <ChevronRight size={18} /> رجوع
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  التالي <ChevronLeft size={18} />
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Branch / Group Details ───────────────────────────── */}
          {step === 3 && (
            <form
              onSubmit={form3.handleSubmit((d) => { setStep3Data(d); setStep(4); })}
              className="space-y-4"
            >
              <div>
                <label className="label">
                  {isSchool ? 'اسم الفرع' : orgType === 'PRIVATE_TUTOR' ? 'اسم المجموعة' : 'اسم الفرع'}
                </label>
                <input
                  {...form3.register('branchName')}
                  className="input"
                  placeholder={isSchool ? 'مثال: فرع المعادي' : orgType === 'PRIVATE_TUTOR' ? 'مثال: مجموعة الصباح' : 'فرع رئيسي'}
                />
                {form3.formState.errors.branchName && (
                  <p className="text-danger text-xs mt-1">{form3.formState.errors.branchName.message}</p>
                )}
              </div>

              <div>
                <label className="label">المنطقة / الموقع</label>
                <input {...form3.register('branchArea')} className="input" placeholder="مثال: المعادي، القاهرة" />
              </div>

              {/* School-only fields */}
              {isSchool && (
                <>
                  <div>
                    <label className="label">نوع المنهج (ممكن أكتر من اختيار)</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {CURRICULUM_OPTIONS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleCurriculum(value)}
                          className={cn(
                            'px-4 py-2 rounded-[4px] text-sm font-medium border transition-all',
                            selectedCurriculums.includes(value)
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-primary-300',
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">نوع الملكية</label>
                    <div className="flex gap-2 mt-1">
                      {OWNERSHIP_OPTIONS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSelectedOwnership(selectedOwnership === value ? '' : value)}
                          className={cn(
                            'flex-1 py-2 rounded-[4px] text-sm font-medium border transition-all',
                            selectedOwnership === value
                              ? 'bg-accent text-white border-accent'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-accent-300',
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2">
                  <ChevronRight size={18} /> رجوع
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  التالي <ChevronLeft size={18} />
                </button>
              </div>
            </form>
          )}

          {/* ── Step 4: Admin Account ─────────────────────────────────────── */}
          {step === 4 && (
            <form onSubmit={form4.handleSubmit(handleStep4Submit)} className="space-y-4">
              <div>
                <label className="label">اسمك</label>
                <input {...form4.register('adminName')} className="input" placeholder="أحمد محمد" />
                {form4.formState.errors.adminName && (
                  <p className="text-danger text-xs mt-1">{form4.formState.errors.adminName.message}</p>
                )}
              </div>
              <div>
                <label className="label">البريد الإلكتروني</label>
                <input {...form4.register('adminEmail')} type="email" className="input" placeholder="admin@school.com" dir="ltr" />
                {form4.formState.errors.adminEmail && (
                  <p className="text-danger text-xs mt-1">{form4.formState.errors.adminEmail.message}</p>
                )}
              </div>
              <div>
                <label className="label">كلمة المرور</label>
                <input {...form4.register('adminPassword')} type="password" className="input" placeholder="8 أحرف على الأقل" />
                {form4.formState.errors.adminPassword && (
                  <p className="text-danger text-xs mt-1">{form4.formState.errors.adminPassword.message}</p>
                )}
              </div>

              {error && <div className="bg-red-50 text-danger text-sm p-3 rounded-[4px]">{error}</div>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary flex items-center gap-2">
                  <ChevronRight size={18} /> رجوع
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary flex-1 disabled:opacity-60">
                  {isLoading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                </button>
              </div>
            </form>
          )}
        </div>

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
  );
}
