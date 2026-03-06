'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MoreVertical,
  Filter,
  Users,
  GitMerge,
  Flag,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';

export default function TimelinePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  useEffect(() => {
    setIsBrowser(true);
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const fetchedData = await response.json();
          setData(fetchedData);
        }
      } catch (error) {
        console.error('Failed to fetch timeline data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get all non-archived tasks with due dates
  const tasks: any[] = data
    ? Object.values(data.tasks)
      .filter((t: any) => !t.isArchived && t.dueDate)
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    : [];

  // Calculate date range for the timeline
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // For week view: show 2 weeks (14 days), for month view: show 30 days
  const totalDays = viewMode === 'week' ? 14 : 30;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 3); // Start 3 days before today

  const timelineDays = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const DAY_WIDTH = viewMode === 'week' ? 60 : 30;

  // Calculate bar position for a task
  const getTaskBar = (task: any) => {
    const dueDate = new Date(task.dueDate);
    const dueDateNorm = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    // Estimate start date: if checklist exists, spread work over checklist items
    const estimatedDays = task.checklist && task.checklist.length > 0
      ? Math.max(task.checklist.length, 2)
      : 3; // Default 3 days duration

    const taskStart = new Date(dueDateNorm);
    taskStart.setDate(taskStart.getDate() - estimatedDays);

    const startOffset = Math.round((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const endOffset = Math.round((dueDateNorm.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const left = Math.max(0, startOffset) * DAY_WIDTH;
    const width = Math.max(1, endOffset - Math.max(0, startOffset) + 1) * DAY_WIDTH;

    return { left, width, isOverdue: dueDateNorm < today && !task.isCompleted };
  };

  // Today marker position
  const todayOffset = Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const todayLeft = todayOffset * DAY_WIDTH + 120; // 120 = task label column width

  // Get task status color
  const getBarColor = (task: any) => {
    if (task.isCompleted || task.progress === 100) return 'bg-emerald-500 border-emerald-600';
    if (task.isCancelled) return 'bg-slate-400 border-slate-500';
    const dueDate = new Date(task.dueDate);
    if (dueDate < now) return 'bg-red-500 border-red-600';
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 24) return 'bg-amber-500 border-amber-600';
    return 'bg-blue-500 border-blue-600';
  };

  const getBarTextColor = (task: any) => {
    if (task.isCompleted || task.progress === 100) return 'text-emerald-50';
    if (task.isCancelled) return 'text-slate-100';
    return 'text-white';
  };

  const getStatusIcon = (task: any) => {
    if (task.isCompleted || task.progress === 100) return <CheckCircle2 className="w-3 h-3" />;
    if (task.isCancelled) return <XCircle className="w-3 h-3" />;
    const dueDate = new Date(task.dueDate);
    if (dueDate < now) return <Flag className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  // Format day header
  const formatDay = (d: Date) => {
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return {
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      monthNum: d.getMonth() + 1,
      isToday: d.getTime() === today.getTime(),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 italic">Đợi tí, đang vẽ bùa nợ đời...</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm italic">"Nợ nhiều quá vẽ mãi không xong =]]]"</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-[1400px] mx-auto flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="flex items-center bg-white dark:bg-slate-900 p-4 pb-2 justify-between border-b border-slate-200 dark:border-slate-800 shadow-sm z-30">
          <Link href="/" className="text-slate-700 dark:text-slate-300 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex flex-col items-center flex-1 px-3">
            <h2 className="text-base font-bold leading-tight tracking-tight">Sắp thăng thiên chưa?</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Nhìn lại nợ đời</p>
          </div>
          <div className="flex w-10 items-center justify-end">
            <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Time Scale Tabs */}
        <div className="bg-white dark:bg-slate-900 px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {[
              { key: 'week', label: 'Tuần' },
              { key: 'month', label: 'Tháng' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key as 'week' | 'month')}
                className={cn(
                  "flex flex-col items-center justify-center border-b-2 pb-3 pt-4 whitespace-nowrap text-xs font-bold transition-colors",
                  viewMode === tab.key
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-2 p-3 overflow-x-auto no-scrollbar bg-slate-50 dark:bg-slate-950">
          <div className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-white dark:bg-slate-900 px-3 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-bold">{tasks.length} công việc</span>
          </div>
          <div className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{tasks.filter((t: any) => t.isCompleted || t.progress === 100).length} xong</span>
          </div>
          <div className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/20 px-3 border border-red-200 dark:border-red-800">
            <Flag className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400">{tasks.filter((t: any) => !t.isCompleted && new Date(t.dueDate) < now).length} trễ</span>
          </div>
        </div>

        {/* Gantt Chart Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {/* Timeline Header - Day columns */}
          <div className="flex bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 z-20">
            <div className="w-[120px] shrink-0 border-r border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900">
              Công việc
            </div>
            <div className="flex-1 overflow-x-auto no-scrollbar flex">
              {timelineDays.map((day, i) => {
                const info = formatDay(day);
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800",
                      info.isToday && "bg-blue-50 dark:bg-blue-900/20",
                      info.isWeekend && !info.isToday && "bg-slate-100/50 dark:bg-slate-800/30"
                    )}
                    style={{ minWidth: `${DAY_WIDTH}px` }}
                  >
                    <span className={cn(
                      "text-[8px] font-bold uppercase",
                      info.isToday ? "text-blue-600 dark:text-blue-400" : info.isWeekend ? "text-slate-400" : "text-slate-500"
                    )}>
                      {info.dayName}
                    </span>
                    <span className={cn(
                      "text-[11px] font-black",
                      info.isToday
                        ? "text-white bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center"
                        : info.isWeekend ? "text-slate-400" : "text-slate-600 dark:text-slate-300"
                    )}>
                      {info.dayNum}
                    </span>
                    {i === 0 || day.getDate() === 1 ? (
                      <span className="text-[7px] font-bold text-slate-400">Th{info.monthNum}</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {/* Today Line */}
            {todayOffset >= 0 && todayOffset < totalDays && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500/40 z-10 pointer-events-none"
                style={{ left: `${todayLeft}px` }}
              >
                <div className="absolute -top-1 -left-1 size-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900"></div>
              </div>
            )}

            <div className="flex flex-col">
              {tasks.length > 0 ? tasks.map((task: any, idx: number) => {
                const bar = getTaskBar(task);
                const barColor = getBarColor(task);
                const barText = getBarTextColor(task);
                const dueDate = new Date(task.dueDate);

                return (
                  <div key={task.id} className="flex h-16 border-b border-slate-100 dark:border-slate-800 items-center group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Task Label */}
                    <div className="w-[120px] shrink-0 px-2 flex flex-col justify-center border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 h-full">
                      <span className="text-[10px] font-bold truncate leading-tight">{task.title}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[8px] text-slate-400 font-medium">
                          {dueDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <span className="text-[8px] text-slate-300">•</span>
                        <span className="text-[8px] font-bold text-slate-500">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 mt-1 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", barColor)}
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Gantt Bar */}
                    <div
                      className="flex-1 relative h-full"
                      style={{
                        backgroundImage: `repeating-linear-gradient(to right, var(--border-color) 0px, var(--border-color) 1px, transparent 1px, transparent ${DAY_WIDTH}px)`,
                        // @ts-ignore
                        '--border-color': 'rgb(226 232 240 / 0.5)',
                      } as any}
                    >
                      <div
                        className={cn(
                          "absolute top-3 h-9 rounded-lg flex items-center gap-1.5 px-2 shadow-sm border cursor-pointer transition-transform hover:scale-[1.02]",
                          barColor, barText
                        )}
                        style={{ left: `${bar.left}px`, width: `${Math.max(bar.width, DAY_WIDTH)}px` }}
                        title={`${task.title}\nHạn: ${dueDate.toLocaleDateString('vi-VN')}\nTiến độ: ${task.progress}%`}
                      >
                        {getStatusIcon(task)}
                        <span className="text-[9px] font-bold truncate">{task.title}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center p-20 text-center opacity-50 italic">
                  <p className="text-sm font-bold">"Chả có nợ nào để vẽ timeline cả =]]]"</p>
                  <p className="text-xs">Vào bảng chính mà thêm nợ đi!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="p-3 flex flex-wrap gap-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-blue-500"></div>
            <span className="text-[9px] font-bold">Đang làm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-amber-500"></div>
            <span className="text-[9px] font-bold">Sắp tới hạn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-red-500"></div>
            <span className="text-[9px] font-bold">Quá hạn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-[9px] font-bold">Hoàn thành</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-slate-400"></div>
            <span className="text-[9px] font-bold">Đã hủy</span>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
