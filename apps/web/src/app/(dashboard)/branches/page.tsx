'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { getTenant } from '@/lib/auth';
import {
  Branch, OrgType, Curriculum, Ownership,
  CURRICULUM_LABELS, OWNERSHIP_LABELS, BRANCH_TERM,
} from '@/types';
import { cn } from '@/lib/utils';
import { Plus, MapPin, X, Star, Pencil } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  area: z.string().optional(),
  ownership: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const CURRICULUM_OPTIONS: Curriculum[] = ['ARABIC', 'LANGUAGES', 'IG'];
const OWNERSHIP_OPTIONS: Ownership[] = ['PRIVATE', 'GOVERNMENT'];

function BranchCard({
  branch,
  isSchool,
  onEdit,
  onDeactivate,
}: {
  branch: Branch;
  isSchool: boolean;
  onEdit: (b: Branch) => void;
  onDeactivate: (id: string) => void;
}) {
  return (
    <div className="card relative group">
      {branch.isMain && (
        <div className="absolute top-3 left-3">
          <span className="badge-success flex items-center gap-1">
            <Star size={10} /> رئيسي
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{branch.name}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(branch)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
          >
            <Pencil size={14} />
          </button>
          {!branch.isMain && (
            <button
              onClick={() => onDeactivate(branch.id)}
              className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {branch.area && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <MapPin size={14} />
          {branch.area}
        </div>
      )}

      {isSchool && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {branch.curriculums.map((c) => (
            <span key={c} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full font-medium">
              {CURRICULUM_LABELS[c]}
            </span>
          ))}
          {branch.ownership && (
            <span className="px-2 py-0.5 bg-accent/10 text-accent-700 text-xs rounded-full font-medium">
              {OWNERSHIP_LABELS[branch.ownership]}
            </span>
          )}
          {branch.curriculums.length === 0 && !branch.ownership && (
            <span className="text-xs text-gray-400">لم يحدد نوع</span>
          )}
        </div>
      )}
    </div>
  );
}

function BranchModal({
  isOpen,
  onClose,
  orgType,
  editBranch,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  orgType: OrgType;
  editBranch?: Branch | null;
  onSaved: () => void;
}) {
  const isSchool = orgType === 'SCHOOL';
  const [selectedCurriculums, setSelectedCurriculums] = useState<Curriculum[]>([]);
  const [selectedOwnership, setSelectedOwnership] = useState<Ownership | ''>('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (editBranch) {
      reset({ name: editBranch.name, area: editBranch.area ?? '' });
      setSelectedCurriculums(editBranch.curriculums as Curriculum[]);
      setSelectedOwnership((editBranch.ownership as Ownership) || '');
    } else {
      reset({ name: '', area: '' });
      setSelectedCurriculums([]);
      setSelectedOwnership('');
    }
  }, [editBranch, reset]);

  const toggleCurriculum = (c: Curriculum) => {
    setSelectedCurriculums((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        name: data.name,
        area: data.area || undefined,
        curriculums: isSchool ? selectedCurriculums : [],
        ownership: isSchool && selectedOwnership ? selectedOwnership : undefined,
      };
      return editBranch
        ? api.patch(`/branches/${editBranch.id}`, payload)
        : api.post('/branches', payload);
    },
    onSuccess: () => { onSaved(); onClose(); },
  });

  if (!isOpen) return null;

  const branchTerm = BRANCH_TERM[orgType].singular;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            {editBranch ? `تعديل ${branchTerm}` : `إضافة ${branchTerm} جديد`}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-5 space-y-4">
          <div>
            <label className="label">اسم {branchTerm}</label>
            <input {...register('name')} className="input" placeholder={`مثال: ${orgType === 'PRIVATE_TUTOR' ? 'مجموعة الصباح' : 'فرع المعادي'}`} />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">المنطقة / الموقع</label>
            <input {...register('area')} className="input" placeholder="المعادي، القاهرة" />
          </div>

          {isSchool && (
            <>
              <div>
                <label className="label">نوع المنهج</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CURRICULUM_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCurriculum(c)}
                      className={cn(
                        'px-3 py-1.5 rounded-[4px] text-sm border transition-all',
                        selectedCurriculums.includes(c)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'text-gray-600 border-gray-300 hover:border-primary-300',
                      )}
                    >
                      {CURRICULUM_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">نوع الملكية</label>
                <div className="flex gap-2 mt-1">
                  {OWNERSHIP_OPTIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setSelectedOwnership(selectedOwnership === o ? '' : o)}
                      className={cn(
                        'flex-1 py-2 rounded-[4px] text-sm border transition-all',
                        selectedOwnership === o
                          ? 'bg-accent text-white border-accent'
                          : 'text-gray-600 border-gray-300 hover:border-accent-300',
                      )}
                    >
                      {OWNERSHIP_LABELS[o]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {mutation.error && (
            <p className="text-danger text-sm bg-red-50 p-3 rounded-[4px]">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'حدث خطأ'}
            </p>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 disabled:opacity-60">
              {mutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const [tenant, setTenant] = useState<{ orgType: OrgType; name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);

  useEffect(() => { setTenant(getTenant()); }, []);

  const orgType = (tenant?.orgType || 'SCHOOL') as OrgType;
  const branchTerm = BRANCH_TERM[orgType];

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => { const { data } = await api.get('/branches'); return data; },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/branches/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'لا يمكن حذف هذا الفرع');
    },
  });

  const isSchool = orgType === 'SCHOOL';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-ibm">{branchTerm.plural}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{branches.length} {branchTerm.singular}</p>
        </div>
        <button
          onClick={() => { setEditBranch(null); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة {branchTerm.singular}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-32 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400">لا يوجد {branchTerm.plural} بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              isSchool={isSchool}
              onEdit={(b) => { setEditBranch(b); setIsModalOpen(true); }}
              onDeactivate={(id) => { if (confirm('تأكيد حذف هذا الفرع؟')) deactivateMutation.mutate(id); }}
            />
          ))}
        </div>
      )}

      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orgType={orgType}
        editBranch={editBranch}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['branches'] })}
      />
    </div>
  );
}
