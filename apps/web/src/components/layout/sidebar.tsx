'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { logout, getTenant, getUser } from '@/lib/auth';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  DollarSign,
  GraduationCap,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/students', label: 'الطلاب', icon: Users },
  { href: '/attendance', label: 'الحضور والغياب', icon: CheckSquare },
  { href: '/finance', label: 'المالية', icon: DollarSign },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [tenant, setTenant] = useState<{ name: string } | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    setTenant(getTenant());
    setUser(getUser());
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-primary-600 text-white rounded-[8px] shadow-md"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-64 bg-primary-600 text-white z-50 flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-ibm font-bold text-xl text-accent">لومي</h1>
              <p className="text-primary-200 text-xs mt-0.5">{tenant?.name || 'نظام إدارة المدارس'}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-primary-200 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-primary-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'المسؤول'}</p>
              <p className="text-xs text-primary-200">مدير النظام</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary-200 hover:text-white hover:bg-white/10 rounded-[8px] transition-colors"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
