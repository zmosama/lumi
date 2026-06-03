'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  grade: z.string().optional(),
  className: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStudentModal({ isOpen, onClose, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/students', data),
    onSuccess: () => {
      reset();
      onSuccess();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">إضافة طالب جديد</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="p-6 space-y-4"
        >
          <div>
            <label className="label">اسم الطالب *</label>
            <input {...register('name')} className="input" placeholder="محمد أحمد" />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">اسم ولي الأمر</label>
              <input {...register('parentName')} className="input" placeholder="أحمد محمد" />
            </div>
            <div>
              <label className="label">هاتف ولي الأمر</label>
              <input {...register('parentPhone')} className="input" placeholder="010xxxxxxxx" dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">الصف الدراسي</label>
              <input {...register('grade')} className="input" placeholder="الصف الثالث الإعدادي" />
            </div>
            <div>
              <label className="label">المجموعة</label>
              <input {...register('className')} className="input" placeholder="مجموعة أ" />
            </div>
          </div>

          <div>
            <label className="label">ملاحظات</label>
            <textarea {...register('notes')} className="input h-20 resize-none" placeholder="أي ملاحظات..." />
          </div>

          {mutation.error && (
            <div className="bg-red-50 text-danger text-sm p-3 rounded-[4px]">
              حدث خطأ، حاول مرة أخرى
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 disabled:opacity-60">
              {mutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
