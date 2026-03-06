'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Bell,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';

type Notification = {
  id: string;
  type: 'mention' | 'deadline' | 'system' | 'comment' | 'complete';
  title: string;
  description: string;
  time: string;
  timestamp: string;
  read: boolean;
  user?: {
    name: string;
    avatar: string; // Color class for avatar placeholder
    initials: string;
  };
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);

  // Helper: gọi API action-based
  const callApi = async (action: string, payload: any) => {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      if (!response.ok) {
        console.error(`API ${action} failed`);
      }
    } catch (error) {
      console.error(`API ${action} network error:`, error);
    }
  };

  useEffect(() => {
    setIsBrowser(true);
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const fetchedData = await response.json();
          if (fetchedData && fetchedData.notifications) {
            setNotifications(fetchedData.notifications);
          }
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    callApi('mark_all_read', {});
    toast.success('Hết nợ thông báo rồi!', {
      description: 'Đã đánh dấu đọc hết tất cả.'
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    callApi('mark_notification_read', { notifId: id });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    callApi('delete_notification', { notifId: id });
    toast.success('Xóa nợ thành công!', {
      description: 'Thông báo đã biến mất không dấu vết.'
    });
  };

  const filteredNotifications = notifications
    .filter(n => {
      if (filter === 'unread') return !n.read;
      if (filter === 'mentions') return n.type === 'mention';
      return true;
    })
    .sort((a, b) => {
      // Prioritize unread
      if (a.read !== b.read) return a.read ? 1 : -1;
      // Then by time descending
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const getIcon = (type: string) => {
    switch (type) {
      case 'mention': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'deadline': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'system': return <AlertTriangle className="w-4 h-4 text-slate-500" />;
      case 'complete': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 italic">Đợi tí, đang lôi đống nợ lỗ tai ra...</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm italic">"Nợ réo nhiều quá, đang lọc bớt =]]]"</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-[1200px] mx-auto flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </Link>
          <h1 className="text-base font-bold tracking-tight">Nợ réo lỗ tai</h1>
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(['all', 'unread', 'mentions'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-colors capitalize",
                      filter === f
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    )}
                  >
                    {f === 'all' ? 'Hố nợ' : f === 'unread' ? 'Mới toanh' : 'Bị réo'}
                  </button>
                ))}
              </div>
              <button
                onClick={markAllRead}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:opacity-80"
              >
                <Check className="w-3.5 h-3.5" /> Biết rồi, khổ lắm!
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Bell className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Không có thông báo nào</p>
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex gap-3 p-4 rounded-2xl border transition-colors",
                      item.read
                        ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                        : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30"
                    )}
                  >
                    <div className="shrink-0 relative">
                      {item.user ? (
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold", item.user.avatar)}>
                          {item.user.initials}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {getIcon(item.type)}
                        </div>
                      )}
                      {!item.read && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                      )}
                      {item.user && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                          {getIcon(item.type)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-snug", item.read ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-slate-100 font-semibold")}>
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        <div className="hidden md:block">
          <BottomNav />
        </div>
        {/* Mobile Bottom Nav is fixed in the component itself */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
