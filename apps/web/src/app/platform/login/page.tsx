'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { platformLogin } from '@/lib/platform-auth';
import { GraduationCap, Lock } from 'lucide-react';

export default function PlatformLoginPage() {
  const router = useRouter();
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
      setError('بريد إلكتروني أو كلمة مرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-accent rounded-[10px] mb-3">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-ibm">لومي</h1>
          <p className="text-gray-400 text-sm mt-1">لوحة إدارة المنصة</p>
        </div>

        <div className="bg-gray-800 rounded-[10px] p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-gray-400" />
            <h2 className="text-gray-200 font-medium">دخول مشرفي المنصة</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="mohammedosama@gmail.com"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-[6px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2.5 rounded-[6px] text-sm transition-colors disabled:opacity-60"
            >
              {isLoading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
