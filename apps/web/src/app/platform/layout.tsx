'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isPlatformAuthenticated, getPlatformUser, platformLogout } from '@/lib/platform-auth';
import { GraduationCap, LogOut, Users, LayoutDashboard, Building2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/platform/tenants', label: 'المؤسسات', icon: Building2 },
  { href: '/platform/users', label: 'فريق المبيعات', icon: Users, ownerOnly: true },
];

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    if (!isPlatformAuthenticated() && pathname !== '/platform/login') {
      router.replace('/platform/login');
      return;
    }
    setUser(getPlatformUser());
  }, [pathname, router]);

  if (pathname === '/platform/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col fixed h-full">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
              <p className="font-bold text-sm font-ibm text-accent-foreground">Lumi</p>
            </div>
            <div>
              <p className="font-bold text-sm font-ibm text-accent">Lumi</p>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems
            .filter((item) => !item.ownerOnly || user?.role === 'OWNER')
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm transition-colors',
                    isActive ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10',
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-1 truncate">{user?.name}</p>
          <span className={cn(
            'inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-3',
            user?.role === 'OWNER' ? 'bg-accent/20 text-accent' : 'bg-blue-500/20 text-blue-300',
          )}>
            {user?.role === 'OWNER' ? 'مالك المنصة' : 'مبيعات'}
          </span>
          <button
            onClick={platformLogout}
            className="flex items-center gap-2 w-full text-gray-400 hover:text-white text-sm"
          >
            <LogOut size={14} /> خروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 mr-56 p-6">{children}</main>
    </div>
  );
}
