'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Flag, 
  AlignLeft, 
  CheckSquare,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

function AddTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'col-1';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium Priority');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState(initialStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to an API
    console.log({ title, description, priority, deadline, status });
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      {/* Title Input */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Tiêu đề công việc
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tên công việc..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
          required
        />
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-slate-500" />
          Mô tả
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Thêm chi tiết về công việc này..."
          rows={4}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm resize-none"
        />
      </div>

      {/* Priority Selection */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Flag className="w-4 h-4 text-slate-500" />
          Mức độ ưu tiên
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['Low Priority', 'Medium Priority', 'High Priority'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={cn(
                "py-2.5 px-2 rounded-xl text-xs font-bold border transition-all",
                priority === p
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {p === 'Low Priority' && 'Thấp'}
              {p === 'Medium Priority' && 'Trung bình'}
              {p === 'High Priority' && 'Cao'}
            </button>
          ))}
        </div>
      </div>

      {/* Deadline & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="deadline" className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Hạn chót
          </label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-slate-500" />
            Trạng thái
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm appearance-none"
          >
            <option value="col-1">Cần làm</option>
            <option value="col-2">Đang xử lý</option>
            <option value="col-3">Hoàn thành</option>
            <option value="col-4">Hủy</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Lưu công việc
        </button>
      </div>
    </form>
  );
}

export default function NewTaskPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </Link>
        <h1 className="text-lg font-bold tracking-tight">Thêm công việc mới</h1>
      </header>

      <main className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full">
        <Suspense fallback={<div className="p-4">Đang tải...</div>}>
          <AddTaskForm />
        </Suspense>
      </main>
    </div>
  );
}
