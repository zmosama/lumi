'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { logout, getTenant, getUser } from '@/lib/auth';
import { OrgType, ORG_TYPE_LABELS, BRANCH_TERM } from '@/types';
import {
  LayoutDashboard, Users, CheckSquare, DollarSign,
  GraduationCap, LogOut, Menu, X, GitBranch,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

function buildNavItems(orgType: OrgType) {
  const branchLabel = BRANCH_TERM[orgType].plural;
  return [
    { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { href: '/branches', label: branchLabel, icon: GitBranch },
    { href: '/students', label: 'الطلاب', icon: Users },
    { href: '/attendance', label: 'الحضور والغياب', icon: CheckSquare },
    { href: '/finance', label: 'المالية', icon: DollarSign },
  ];
}

const ORG_TYPE_BADGE_COLOR: Record<OrgType, string> = {
  SCHOOL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CENTER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  PRIVATE_TUTOR: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [tenant, setTenant] = useState<{ name: string; orgType?: OrgType } | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    setTenant(getTenant());
    setUser(getUser());
  }, []);

  const orgType = (tenant?.orgType || 'SCHOOL') as OrgType;
  const navItems = buildNavItems(orgType);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-primary text-primary-foreground rounded-lg shadow-md"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-64 bg-card border-l border-border text-card-foreground z-50 flex flex-col transition-transform duration-300 shadow-xl',
          'lg:translate-x-0 lg:static lg:z-auto lg:shadow-none',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-inner">
                <GraduationCap size={20} className="text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-ibm font-bold text-xl text-primary">Lumi</h1>
                <p className="text-muted-foreground text-xs mt-0.5 truncate">{tenant?.name || 'نظام الإدارة'}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground flex-shrink-0">
              <X size={20} />
            </button>
          </div>
          {tenant?.orgType && (
            <div className="mt-4">
              <span className={cn('inline-block text-[11px] px-2.5 py-1 rounded-md font-semibold', ORG_TYPE_BADGE_COLOR[orgType])}>
                {ORG_TYPE_LABELS[orgType]}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon size={18} className={cn("transition-transform group-hover:scale-110", isActive && "text-primary-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
              <span className="text-sm font-bold text-primary">{user?.name?.charAt(0) || 'م'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'المسؤول'}</p>
              <p className="text-xs text-muted-foreground">مدير النظام</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut size={16} className="ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>
    </>
  );
}
