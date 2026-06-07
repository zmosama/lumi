'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Branch } from '@/types';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

const useStudentSchema = () => {
  const t = useTranslations('Validation');
  return z.object({
    branchId: z.string().min(1, t('select_branch')),
    name: z.string().min(2, t('required_name')),
    phone: z.string().optional(),
    parentName: z.string().optional(),
    parentPhone: z.string().optional(),
    grade: z.string().optional(),
    className: z.string().optional(),
    notes: z.string().optional(),
  });
};

type FormData = z.infer<ReturnType<typeof useStudentSchema>>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultBranchId?: string;
}

export function AddStudentModal({ isOpen, onClose, onSuccess, defaultBranchId }: Props) {
  const t = useTranslations('Students');
  const tCommon = useTranslations('Common');
  
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => { const { data } = await api.get('/branches'); return data; },
    enabled: isOpen,
  });

  const schema = useStudentSchema();
  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { branchId: defaultBranchId || '' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/students', data),
    onSuccess: () => { reset(); onSuccess(); },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{t('add_new_student')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          <div>
            <label className="label">{t('branch_group')} *</label>
            <select {...register('branchId')} className="input">
              <option value="">{t('select_branch_placeholder')}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}{b.area ? ` — ${b.area}` : ''}
                </option>
              ))}
            </select>
            {errors.branchId && <p className="text-danger text-xs mt-1">{errors.branchId.message}</p>}
          </div>

          <div>
            <label className="label">{t('student_name')} *</label>
            <input {...register('name')} className="input" placeholder={t('placeholder_name')} />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('parent_name')}</label>
              <input {...register('parentName')} className="input" placeholder={t('placeholder_parent_name')} />
            </div>
            <div>
              <label className="label">{t('parent_phone')}</label>
              <input {...register('parentPhone')} className="input" placeholder="010xxxxxxxx" dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('grade')}</label>
              <input {...register('grade')} className="input" placeholder={t('placeholder_grade')} />
            </div>
            <div>
              <label className="label">{t('class_group')}</label>
              <input {...register('className')} className="input" placeholder={t('placeholder_class')} />
            </div>
          </div>

          <div>
            <label className="label">{t('notes')}</label>
            <textarea {...register('notes')} className="input h-20 resize-none" placeholder={t('placeholder_notes')} />
          </div>

          {mutation.error && (
            <div className="bg-red-50 text-danger text-sm p-3 rounded-[4px]">{t('error_try_again')}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 disabled:opacity-60">
              {mutation.isPending ? t('saving') : tCommon('save')}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">{tCommon('cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
