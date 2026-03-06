'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Flag,
  AlignLeft,
  CheckSquare,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AddTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialStatus: string;
  onAdd: (task: any) => void;
};

export default function AddTaskModal({ isOpen, onClose, initialStatus, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium Priority');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState(initialStatus);

  // Update status when initialStatus changes
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('Cũng hơi căng đấy');
      setDeadline('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title,
      description,
      priority,
      deadline,
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 max-h-[95vh] sm:max-h-[85vh] mt-auto sm:mt-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-base font-bold tracking-tight">Hứa là sẽ làm đấy nhé?</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </header>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Lại bày trò gì đây? <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên đống nợ mới..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              required
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-500" />
              Kể khổ đi (Mô tả)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi vào cho lắm rồi có làm không?..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm resize-none"
            />
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flag className="w-4 h-4 text-slate-500" />
              Độ "cháy" của nợ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'Low Priority', label: 'Thoải mái đi' },
                { value: 'Medium Priority', label: 'Cũng hơi căng' },
                { value: 'High Priority', label: 'Cháy nhà rồi!' }
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.label === 'Cháy nhà rồi!' ? 'Gấp như cháy nhà!' : p.label === 'Cũng hơi căng' ? 'Cũng hơi căng đấy' : 'Để sau cũng được')}
                  className={cn(
                    "py-2 px-2 rounded-lg text-xs font-bold border transition-all",
                    (priority === 'Gấp như cháy nhà!' && p.value === 'High Priority') ||
                      (priority === 'Cũng hơi căng đấy' && p.value === 'Medium Priority') ||
                      (priority === 'Để sau cũng được' && p.value === 'Low Priority')
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                Hạn chót thăng thiên
              </label>
              <div className="relative">
                <input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-slate-500" />
                Vứt vào đâu?
              </label>
              <div className="relative">
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm appearance-none"
                >
                  <option value="col-1">Lo mà làm đi!</option>
                  <option value="col-5">Lại định ngâm à?</option>
                  <option value="col-2">Bớt chơi, làm tiếp đi</option>
                  <option value="col-3">Xong thật không đấy?</option>
                  <option value="col-4">Bỏ cuộc chứ gì?</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Ghi nợ vào đây
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
