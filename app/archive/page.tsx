'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search,
    ArrowLeft,
    Calendar,
    Archive,
    MoreHorizontal,
    LayoutDashboard,
    CheckCircle2
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import BottomNav from '@/components/BottomNav';
import TaskDetailModal from '@/components/TaskDetailModal';
import { cn, formatRelativeDate } from '@/lib/utils';

// Types (shorthand for demo)
type Task = {
    id: string;
    title: string;
    priority: string;
    priorityClass: string;
    iconName?: string;
    deadline: string;
    dueDate?: string;
    deadlineIconName?: string;
    deadlineClass: string;
    statusText: string;
    statusClass: string;
    progress: number;
    progressClass: string;
    isArchived?: boolean;
};

type Data = {
    tasks: Record<string, Task>;
    columns: any;
    columnOrder: any;
};

// Helpers to render icons from names
const renderTaskIcon = (iconName: string | undefined) => {
    switch (iconName) {
        case 'layout': return <LayoutDashboard className="w-5 h-5 text-blue-500" />;
        case 'alert-circle': return <Search className="w-5 h-5 text-amber-500" />; // Fallback icons since others are similar
        case 'alert-triangle': return <Search className="w-5 h-5 text-red-500" />;
        case 'check-circle': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        default: return null;
    }
};

export default function ArchivePage() {
    const [data, setData] = useState<Data | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBrowser, setIsBrowser] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setIsBrowser(true);
        const fetchData = async () => {
            try {
                const response = await fetch('/api/data');
                if (response.ok) {
                    const fetchedData = await response.json();
                    if (fetchedData && fetchedData.tasks) {
                        setData(fetchedData);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Save back to server if updated via modal
    useEffect(() => {
        if (!isBrowser || isLoading || !data) return;

        const saveData = async () => {
            try {
                await fetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            } catch (error) {
                console.error('Failed to save data', error);
            }
        };

        const timer = setTimeout(saveData, 1000);
        return () => clearTimeout(timer);
    }, [data, isBrowser, isLoading]);

    const handleUpdateTask = (updatedTask: Task) => {
        if (!data) return;
        setData({
            ...data,
            tasks: {
                ...data.tasks,
                [updatedTask.id]: updatedTask
            }
        });

        if (!updatedTask.isArchived) {
            toast.success('Đã bốc mộ thành công!', {
                description: `Đã đưa ${updatedTask.title} trở lại bảng nợ.`,
            });
            setSelectedTask(null);
        }
    };

    const handleDeleteTask = (taskId: string) => {
        if (!data) return;
        const newTasks = { ...data.tasks };
        delete newTasks[taskId];

        const newColumns = { ...data.columns };
        Object.keys(newColumns).forEach(colId => {
            newColumns[colId].taskIds = newColumns[colId].taskIds.filter((id: string) => id !== taskId);
        });

        setData({
            ...data,
            tasks: newTasks,
            columns: newColumns
        });
        setSelectedTask(null);
        toast.info('Hỏa táng nợ nần thành công!');
    };

    if (!isBrowser || !data) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Đang lục lọi nghĩa địa...</div>
            </div>
        );
    }

    const archivedTasks = Object.values(data.tasks).filter(task =>
        task.isArchived &&
        (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.priority.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
                <div className="max-w-[1200px] mx-auto flex flex-col min-h-screen relative">
                    <Toaster richColors position="top-right" />

                    {/* Header */}
                    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </Link>
                            <h1 className="text-lg font-bold tracking-tight">Nghĩa Địa Nợ Nần</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Archive className="w-5 h-5 text-slate-400" />
                        </div>
                    </header>

                    <main className="p-4 flex flex-col gap-6">
                        {/* Search */}
                        <section>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                    placeholder="Tìm kiếm nợ cũ trong mồ..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </section>

                        {/* Archived Tasks List */}
                        <section className="flex flex-col gap-3">
                            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                                Danh sách nợ đã chôn ({archivedTasks.length})
                            </h3>

                            {archivedTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
                                        <Archive className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Nghĩa địa trống huơ trống hoác...</p>
                                        <p className="text-xs text-slate-400 mt-1">Chưa có ai thăng thiên vào đây cả.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {archivedTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            onClick={() => setSelectedTask(task)}
                                            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-3 hover:shadow-lg transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tight", task.priorityClass)}>
                                                        {task.priority}
                                                    </span>
                                                    {task.iconName && renderTaskIcon(task.iconName)}
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">ĐÃ CHÔN</span>
                                                </div>
                                                <MoreHorizontal className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                {task.title}
                                            </h4>
                                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Hạn cũ: {task.deadline}
                                                </span>
                                                <span className="font-bold text-blue-500">Xem lại</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>

                    <BottomNav />

                    <TaskDetailModal
                        isOpen={!!selectedTask}
                        onClose={() => setSelectedTask(null)}
                        task={selectedTask}
                        onDelete={handleDeleteTask}
                        onUpdate={handleUpdateTask}
                    />
                </div>
            </div>
        </TooltipProvider>
    );
}
