'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MoreVertical,
  Calendar,
  CheckCircle2,
  Flag,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Layout,
  Clock
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import TaskDetailModal from '@/components/TaskDetailModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Define Task type to match page.tsx
interface Task {
  id: string;
  title: string;
  priority: string;
  priorityClass: string;
  deadline: string;
  dueDate: string;
  createdAt: string;
  progress: number;
  isCompleted?: boolean;
  isCancelled?: boolean;
  isArchived?: boolean;
  description?: string;
  checklist?: { id: string; text: string; completed: boolean }[];
}

export default function TimelinePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const callApi = async (action: string, payload: any) => {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      if (!response.ok) throw new Error('API call failed');
      return await response.json();
    } catch (error) {
      console.error(`API Error (${action}):`, error);
      toast.error('Có lỗi xảy ra khi đồng bộ.');
      throw error;
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    // Basic local update
    setData((prev: any) => ({
      ...prev,
      tasks: { ...prev.tasks, [updatedTask.id]: updatedTask }
    }));
    setSelectedTask(updatedTask);

    // Sync to backend
    try {
      await callApi('update_task', { task: updatedTask });
      toast.success('Đã cập nhật nợ đời!');
    } catch (e) {
      // Revert or show error
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setData((prev: any) => {
      const newTasks = { ...prev.tasks };
      delete newTasks[taskId];
      return { ...prev, tasks: newTasks };
    });
    setSelectedTask(null);

    try {
      // For timeline, we just need to delete the task. 
      // Simplified: column updates not strictly necessary for timeline fetch but good for consistency
      await callApi('delete_task', { taskId });
      toast.info('Nợ đã bị xóa sổ.');
    } catch (e) { }
  };

  useEffect(() => {
    setIsBrowser(true);
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

  const totalDays = viewMode === 'week' ? 14 : 30;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 3);

  const timelineDays = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  // +30% size: 60 → 78, 30 → 40
  const DAY_WIDTH = viewMode === 'week' ? 78 : 40;
  const LABEL_WIDTH = 220; // increased from 180

  // Calculate bar position
  const getTaskBar = (task: any) => {
    const dueDate = new Date(task.dueDate);
    const dueDateNorm = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    let taskStart: Date;
    if (task.createdAt) {
      const dl = new Date(task.createdAt);
      taskStart = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
    } else {
      taskStart = new Date(dueDateNorm);
      taskStart.setDate(taskStart.getDate() - 3);
    }

    if (taskStart > dueDateNorm) {
      taskStart = new Date(dueDateNorm);
      taskStart.setDate(taskStart.getDate() - 1);
    }

    const startOffset = Math.round((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const endOffset = Math.round((dueDateNorm.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const left = Math.max(0, startOffset) * DAY_WIDTH;
    const totalWidth = Math.max(1, endOffset - Math.max(0, startOffset) + 1) * DAY_WIDTH;
    const progressWidth = Math.max(DAY_WIDTH * 0.5, totalWidth * (task.progress / 100));

    // Calculate remaining percentage for color
    const totalDuration = dueDateNorm.getTime() - taskStart.getTime();
    const elapsed = now.getTime() - taskStart.getTime();
    const remainingPercent = totalDuration > 0
      ? Math.max(0, Math.min(100, ((totalDuration - elapsed) / totalDuration) * 100))
      : 0;

    return {
      left,
      totalWidth,
      progressWidth,
      startDate: taskStart,
      remainingPercent,
    };
  };

  // Today marker position
  const todayOffset = Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const todayLeft = todayOffset * DAY_WIDTH + LABEL_WIDTH;

  // Color based on remaining % of time
  const getBarColors = (task: any, remainingPercent: number) => {
    const isDone = task.isCompleted || task.progress === 100;
    const progressColor = isDone ? 'bg-emerald-500' : 'bg-blue-500 dark:bg-blue-400';

    if (isDone) {
      return {
        solid: 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-500/30',
        trail: 'bg-emerald-400/20',
        border: 'border-emerald-500/30',
        progressColor,
      };
    }
    if (task.isCancelled) {
      return {
        solid: 'bg-gradient-to-r from-slate-400 to-slate-500 shadow-slate-500/20',
        trail: 'bg-slate-400/15',
        border: 'border-slate-400/20',
        progressColor: 'bg-slate-400',
      };
    }
    // Overdue
    const dueDate = new Date(task.dueDate);
    if (dueDate < now) {
      return {
        solid: 'bg-gradient-to-r from-rose-500 to-red-600 shadow-red-500/40',
        trail: 'bg-red-400/20',
        border: 'border-red-500/30',
        progressColor,
      };
    }
    // <= 20% remaining → RED warning
    if (remainingPercent <= 20) {
      return {
        solid: 'bg-gradient-to-r from-orange-500 to-red-500 shadow-red-500/30',
        trail: 'bg-red-400/15',
        border: 'border-red-400/25',
        progressColor,
      };
    }
    // <= 40% remaining → YELLOW warning
    if (remainingPercent <= 40) {
      return {
        solid: 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-500/30',
        trail: 'bg-amber-400/15',
        border: 'border-amber-400/25',
        progressColor,
      };
    }
    // > 40% → comfortable (blue/purple cool tones)
    return {
      solid: 'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-indigo-500/30',
      trail: 'bg-blue-400/15',
      border: 'border-blue-400/20',
      progressColor,
    };
  };

  // Status icon derived from task status (matches Kanban board)
  const getStatusIcon = (task: any, remainingPercent: number) => {
    if (task.isCompleted || task.progress === 100) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (task.isCancelled) return <XCircle className="w-4 h-4 text-slate-400" />;
    const dueDate = new Date(task.dueDate);
    if (dueDate < now) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (remainingPercent <= 20) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (remainingPercent <= 40) return <AlertCircle className="w-4 h-4 text-amber-500" />;
    return <Layout className="w-4 h-4 text-blue-500" />;
  };

  // Format day header (+30% bigger)
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
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-5" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 italic">Đợi tí, đang vẽ bùa nợ đời...</h2>
        <p className="text-slate-500 dark:text-slate-400 text-base italic">"Nợ nhiều quá vẽ mãi không xong =]]]"</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="flex items-center bg-white dark:bg-slate-900 px-5 py-5 justify-between border-b border-slate-200 dark:border-slate-800 shadow-sm z-30">
          <Link href="/" className="text-slate-700 dark:text-slate-300 flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
            <ArrowLeft className="w-7 h-7" />
          </Link>
          <div className="flex flex-col items-center flex-1 px-4">
            <h2 className="text-lg font-extrabold leading-tight tracking-tight">Sắp thăng thiên chưa?</h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Nhìn lại nợ đời</p>
          </div>
          <div className="flex w-12 items-center justify-end">
            <button className="flex size-12 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Time Scale Tabs */}
        <div className="bg-white dark:bg-slate-900 px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {[
              { key: 'week', label: 'Tuần' },
              { key: 'month', label: 'Tháng' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key as 'week' | 'month')}
                className={cn(
                  "flex flex-col items-center justify-center border-b-3 pb-4 pt-5 whitespace-nowrap text-sm font-bold transition-colors",
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
        <div className="flex items-center gap-3 p-4 overflow-x-auto no-scrollbar bg-slate-50 dark:bg-slate-950">
          <div className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-white dark:bg-slate-900 px-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold">{tasks.length} Nợ đời</span>
          </div>
          <div className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-4 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{tasks.filter((t: any) => t.isCompleted || t.progress === 100).length} xong</span>
          </div>
          <div className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-red-50 dark:bg-red-900/20 px-4 border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400">{tasks.filter((t: any) => !t.isCompleted && new Date(t.dueDate) < now).length} trễ</span>
          </div>
        </div>

        {/* Gantt Chart Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {/* Timeline Header - Day columns */}
          <div className="flex bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 z-20">
            <div
              className="shrink-0 border-r border-slate-200 dark:border-slate-800 p-3 flex items-center justify-center text-xs font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900"
              style={{ width: `${LABEL_WIDTH}px` }}
            >
              Nợ đời
            </div>
            <div className="flex-1 overflow-x-auto no-scrollbar flex">
              {timelineDays.map((day, i) => {
                const info = formatDay(day);
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 border-r border-slate-100 dark:border-slate-800",
                      info.isToday && "bg-blue-50 dark:bg-blue-900/20",
                      info.isWeekend && !info.isToday && "bg-slate-100/50 dark:bg-slate-800/30"
                    )}
                    style={{ minWidth: `${DAY_WIDTH}px` }}
                  >
                    <span className={cn(
                      "text-[10px] font-bold uppercase",
                      info.isToday ? "text-blue-600 dark:text-blue-400" : info.isWeekend ? "text-slate-400" : "text-slate-500"
                    )}>
                      {info.dayName}
                    </span>
                    <span className={cn(
                      "text-sm font-black mt-0.5",
                      info.isToday
                        ? "text-white bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center"
                        : info.isWeekend ? "text-slate-400" : "text-slate-600 dark:text-slate-300"
                    )}>
                      {info.dayNum}
                    </span>
                    {i === 0 || day.getDate() === 1 ? (
                      <span className="text-[9px] font-bold text-slate-400 mt-0.5">Th{info.monthNum}</span>
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
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500/50 z-10 pointer-events-none"
                style={{ left: `${todayLeft}px` }}
              >
                <div className="absolute -top-1.5 -left-1.5 size-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow-lg shadow-blue-500/50"></div>
              </div>
            )}

            <div className="flex flex-col">
              {tasks.length > 0 ? tasks.map((task: any) => {
                const bar = getTaskBar(task);
                const barColors = getBarColors(task, bar.remainingPercent);
                const dueDate = new Date(task.dueDate);
                const icon = getStatusIcon(task, bar.remainingPercent);

                // Format remaining percent as label
                const remainLabel = bar.remainingPercent <= 0
                  ? 'Hết hạn'
                  : `${Math.round(bar.remainingPercent)}% thời gian còn`;

                return (
                  <div key={task.id} className="flex border-b border-slate-100 dark:border-slate-800 items-center group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors" style={{ height: '72px' }}>
                    {/* Task Label - 30% bigger */}
                    <div
                      className="shrink-0 px-3 flex flex-col justify-center border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 h-full"
                      style={{ width: `${LABEL_WIDTH}px` }}
                    >
                      <div className="flex flex-col min-w-0 flex-1 justify-center">
                        <span className="text-sm font-bold whitespace-normal line-clamp-2 leading-tight mb-1">{task.title}</span>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {dueDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-slate-500">{task.progress}%</span>
                        </div>
                        {/* Progress bar in label column */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-500", barColors.progressColor)}
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Gantt Bar Area - clean, no text inside bars */}
                    <div
                      className="flex-1 relative h-full"
                      style={{
                        backgroundImage: `repeating-linear-gradient(to right, rgb(226 232 240 / 0.3) 0px, rgb(226 232 240 / 0.3) 1px, transparent 1px, transparent ${DAY_WIDTH}px)`,
                      }}
                    >
                      {/* Vệt mờ: full range từ ngày tạo → deadline */}
                      <div
                        className={cn(
                          "absolute top-6 h-8 rounded-full opacity-10 border border-current",
                          barColors.trail.replace('bg-', 'text-')
                        )}
                        style={{ left: `${bar.left}px`, width: `${Math.max(bar.totalWidth, DAY_WIDTH)}px` }}
                      >
                        <div className={cn("w-full h-full rounded-full", barColors.trail)} />
                      </div>

                      {/* Thanh Gantt chính: CÓ icon ở đầu, FULL WIDTH */}
                      <div
                        className={cn(
                          "absolute top-5 h-10 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-y-110 hover:shadow-xl flex items-center px-2",
                          barColors.solid, barColors.border, "border"
                        )}
                        style={{
                          left: `${bar.left}px`,
                          width: `${Math.max(bar.totalWidth, DAY_WIDTH * 0.8)}px`
                        }}
                        onClick={() => setSelectedTask(task)}
                        title={`${task.title}\nBắt đầu: ${bar.startDate.toLocaleDateString('vi-VN')}\nHạn: ${dueDate.toLocaleDateString('vi-VN')}\nTiến độ: ${task.progress}%\n${remainLabel}`}
                      >
                        <div className="shrink-0 text-white drop-shadow-sm bg-black/10 rounded-full p-0.5">
                          {getStatusIcon(task, bar.remainingPercent)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center p-24 text-center opacity-50 italic">
                  <p className="text-lg font-bold">"Chả có nợ nào để vẽ timeline cả =]]]"</p>
                  <p className="text-sm mt-2">Vào bảng chính mà thêm nợ đi!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend - 30% bigger */}
        <div className="p-4 flex flex-wrap gap-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <span className="text-xs font-bold">&gt;40% thời gian</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"></div>
            <span className="text-xs font-bold">≤40% thời gian</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
            <span className="text-xs font-bold">≤20% thời gian</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded-full bg-gradient-to-r from-rose-500 to-red-600"></div>
            <span className="text-xs font-bold">Quá hạn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <span className="text-xs font-bold">Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded-full bg-gradient-to-r from-slate-400 to-slate-500"></div>
            <span className="text-xs font-bold">Đã hủy</span>
          </div>
        </div>

        <BottomNav />

        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        )}
      </div>
    </div>
  );
}
