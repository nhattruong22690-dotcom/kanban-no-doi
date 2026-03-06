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
  Calendar
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';

export default function TimelinePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);

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

  const days = Array.from({ length: 9 }, (_, i) => 12 + i);
  const tasks = data ? Object.values(data.tasks).filter((t: any) => !t.isArchived) : [];

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
            {['Ngày', 'Tuần', 'Tháng', 'Quý'].map((tab, i) => (
              <button
                key={tab}
                className={cn(
                  "flex flex-col items-center justify-center border-b-2 pb-3 pt-4 whitespace-nowrap text-xs font-bold transition-colors",
                  i === 1
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 overflow-x-auto no-scrollbar bg-slate-50 dark:bg-slate-950">
          <button className="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-white dark:bg-slate-900 px-3 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold">Bộ lọc</span>
          </button>
          <button className="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3">
            <GitMerge className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">Đường găng</span>
            <div className="w-6 h-3.5 bg-blue-600 dark:bg-blue-500 rounded-full relative ml-0.5">
              <div className="absolute right-0.5 top-0.5 size-2.5 bg-white rounded-full"></div>
            </div>
          </button>
          <button className="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-white dark:bg-slate-900 px-3 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold">Nhóm</span>
          </button>
        </div>

        {/* Gantt Chart Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {/* Timeline Header */}
          <div className="flex bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 z-20">
            <div className="w-24 shrink-0 border-r border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900">
              Công việc
            </div>
            <div className="flex-1 overflow-x-auto no-scrollbar flex bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px)] bg-[size:40px_100%]">
              {days.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "min-w-[40px] h-8 flex items-center justify-center text-[10px] font-medium",
                    day === 14
                      ? "text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/20 border-x border-blue-100 dark:border-blue-800"
                      : "text-slate-500"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {/* Today Line */}
            <div className="absolute left-[120px] top-0 bottom-0 w-0.5 bg-blue-500/40 z-10 pointer-events-none">
              <div className="absolute -top-1 -left-1 size-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900"></div>
            </div>

            <div className="flex flex-col">
              {tasks.length > 0 ? tasks.map((task: any, idx: number) => {
                const offset = (task.id.length % 5) * 40;
                const width = 80 + (idx % 3) * 40;

                return (
                  <div key={task.id} className="flex h-20 border-b border-slate-200 dark:border-slate-800 items-center group">
                    <div className="w-24 shrink-0 px-2 flex flex-col justify-center border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 h-full">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("size-5 rounded-full flex items-center justify-center text-[8px] font-bold",
                          idx % 2 === 0 ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600")}>
                          {task.title.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-bold truncate">{task.title}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 mt-1.5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", idx % 2 === 0 ? "bg-indigo-600" : "bg-blue-600")} style={{ width: `${task.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex-1 relative h-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px)] bg-[size:40px_100%] bg-slate-50/50 dark:bg-slate-900/50">
                      <div
                        className={cn("absolute top-4 h-11 border shadow-lg rounded-lg flex items-center px-3 z-30 cursor-grab transform -rotate-1 transition-transform hover:scale-105 hover:rotate-0",
                          idx % 2 === 0 ? "bg-white dark:bg-slate-800 border-indigo-600" : "bg-white dark:bg-slate-800 border-blue-600"
                        )}
                        style={{ left: `${offset + 40}px`, width: `${width}px` }}
                      >
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black truncate leading-none mb-1 uppercase opacity-60">
                            {task.progress === 100 ? 'Tu thành chính quả' : task.isCancelled ? 'Nằm thẳng rồi' : 'Đang bơi trong nợ'}
                          </span>
                          <span className="text-[10px] font-bold truncate">{task.title}</span>
                        </div>
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
        <div className="p-4 flex gap-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-blue-600"></div>
            <span className="text-[10px] font-bold">Nợ ngắn hạn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-indigo-600"></div>
            <span className="text-[10px] font-bold">Nợ truyền kiếp</span>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
