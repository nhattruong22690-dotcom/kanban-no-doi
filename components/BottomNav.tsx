'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Timer, Bell, Settings, Calendar, ListTodo, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Sào huyệt',
      icon: LayoutDashboard,
      href: '/',
      active: pathname === '/',
    },
    {
      label: 'Sắp thăng?',
      icon: Timer,
      href: '/timeline',
      active: pathname === '/timeline',
      badge: true,
    },
    {
      label: 'Nghĩa địa',
      icon: Archive,
      href: '/archive',
      active: pathname === '/archive',
    },
    {
      label: 'Nợ réo',
      icon: Bell,
      href: '/notifications',
      active: pathname === '/notifications',
    },
    {
      label: 'Mông má',
      icon: Settings,
      href: '/settings',
      active: pathname === '/settings',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors relative p-2",
              item.active
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            <item.icon size={24} strokeWidth={item.active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.badge && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </Link>
        ))}
      </div>
      {/* Home Indicator area for iOS */}
      <div className="h-5 w-full" />
    </nav>
  );
}
