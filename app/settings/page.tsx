'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Bell,
  Moon,
  Globe,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Smartphone
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">{title}</h3>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {children}
      </div>
    </div>
  );

  const SettingItem = ({
    icon: Icon,
    label,
    value,
    onClick,
    toggle,
    isDestructive = false
  }: {
    icon: any,
    label: string,
    value?: string,
    onClick?: () => void,
    toggle?: { checked: boolean, onChange: (v: boolean) => void },
    isDestructive?: boolean
  }) => (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors",
        onClick && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          isDestructive ? "bg-red-50 dark:bg-red-900/20 text-red-600" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={cn("text-sm font-medium", isDestructive ? "text-red-600" : "text-slate-900 dark:text-slate-100")}>
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-slate-500 font-medium">{value}</span>}
        {toggle ? (
          <button
            onClick={(e) => { e.stopPropagation(); toggle.onChange(!toggle.checked); }}
            className={cn(
              "w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              toggle.checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
            )}
          >
            <span
              className={cn(
                "absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ease-in-out",
                toggle.checked ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-[1000px] mx-auto flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </Link>
          <h1 className="text-base font-bold tracking-tight">Mông má nhân phẩm</h1>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                ME
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">Kẻ Lười Biếng</h2>
                <p className="text-sm text-slate-500 truncate">nghien.lam.nhung.luoi@nợ.đời</p>
                <button className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>

            {/* General Settings */}
            <SettingSection title="Sương sương">
              <SettingItem
                icon={Moon}
                label="Mắt cú đêm (Dark mode)"
                toggle={{ checked: darkMode, onChange: setDarkMode }}
              />
              <SettingItem
                icon={Globe}
                label="Tiếng người / Tiếng thú"
                value="Tiếng Việt"
                onClick={() => { }}
              />
            </SettingSection>

            {/* Notifications */}
            <SettingSection title="Réo nợ">
              <SettingItem
                icon={Bell}
                label="Cho phép réo (Push)"
                toggle={{ checked: notifications, onChange: setNotifications }}
              />
              <SettingItem
                icon={Smartphone}
                label="Cài đặt thiết bị"
                onClick={() => { }}
              />
            </SettingSection>

            {/* Privacy & Security */}
            <SettingSection title="Che giấu tội lỗi">
              <SettingItem
                icon={Lock}
                label="Đổi mật khẩu trốn nợ"
                onClick={() => { }}
              />
              <SettingItem
                icon={Shield}
                label="Quyền riêng tư"
                onClick={() => { }}
              />
            </SettingSection>

            {/* Support */}
            <SettingSection title="Phao cứu sinh">
              <SettingItem
                icon={HelpCircle}
                label="Trung tâm cứu vớt"
                onClick={() => { }}
              />
              <SettingItem
                icon={LogOut}
                label="Chuồn lẹ (Logout)"
                isDestructive
                onClick={() => { }}
              />
            </SettingSection>

            <div className="text-center py-4">
              <p className="text-[10px] text-slate-400 font-medium">
                Phiên bản 1.0.2 (Build 20231025)
              </p>
            </div>
          </div>
        </main>

        <div className="hidden md:block">
          <BottomNav />
        </div>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
