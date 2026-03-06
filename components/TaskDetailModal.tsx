'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  MoreHorizontal,
  Share2,
  CheckCircle2,
  Calendar,
  Clock,
  Edit2,
  Link as LinkIcon,
  FileCode,
  PlusCircle,
  Send,
  Paperclip,
  GripVertical,
  Check,
  ExternalLink,
  Trash2,
  AlertTriangle,
  XCircle,
  Archive
} from 'lucide-react';
import { cn, formatRelativeDate } from '@/lib/utils';

type TaskDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onDelete: (taskId: string) => void;
  onUpdate: (updatedTask: any) => void;
  onMove?: (taskId: string, targetColId: string) => void;
  columns?: any;
};

export default function TaskDetailModal({ isOpen, onClose, task, onDelete, onUpdate, onMove, columns }: TaskDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<any>(null);
  const checklistInputRef = useRef<HTMLInputElement>(null);

  // Reset states when modal opens/closes or task changes
  useEffect(() => {
    setShowDeleteConfirm(false);
    setIsEditing(false);
    setEditedTask(task);
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleSave = () => {
    let updated = { ...editedTask };
    if (updated.dueDate) {
      updated.deadline = formatRelativeDate(updated.dueDate);
    }
    onUpdate(updated);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: any) => {
    setEditedTask((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 max-h-[95vh] sm:max-h-[90vh] mt-auto sm:mt-0">

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Đống nợ này định xóa thật à?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
              Định trốn việc à? Xóa là coi như chưa bao giờ hứa đấy nhé! Bạn có chắc là muốn xóa "{task.title}" không?
            </p>
            <div className="flex gap-3 w-full max-w-xs">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy (Em làm ngay!)
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 transition-colors"
              >
                Xóa (Trốn nợ)
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h2 className="text-base font-bold tracking-tight">
            {isEditing ? 'Sửa nợ' : 'Soi nợ'}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                {!(task.isCompleted || task.isCancelled || task.isArchived) ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                    title="Sửa nợ"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 mr-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 border border-slate-200 dark:border-slate-800 rounded px-2 py-1">Đã khóa</span>
                    {(task.isCompleted || task.isCancelled) && (
                      <button
                        onClick={() => onUpdate({ ...task, isCompleted: false, isCancelled: false, progress: 0 })}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
                      >
                        Làm lại?
                      </button>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"
                  title="Xóa nợ"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2"
              >
                Thôi không sửa nữa
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isEditing ? (
            // EDIT MODE
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Tiêu đề (Lại định đổi tên nợ à?)</label>
                <input
                  type="text"
                  value={editedTask?.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Độ cháy của nợ</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'Low Priority', label: 'Thoải mái đi' },
                    { value: 'Medium Priority', label: 'Hơi căng đấy' },
                    { value: 'High Priority', label: 'Cháy nhà!' }
                  ].map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        let priorityClass = 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
                        let actualPriority = 'Để sau cũng được';
                        if (p.value === 'High Priority') {
                          priorityClass = 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400';
                          actualPriority = 'Gấp như cháy nhà!';
                        } else if (p.value === 'Medium Priority') {
                          priorityClass = 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
                          actualPriority = 'Cũng hơi căng đấy';
                        }

                        handleChange('priority', actualPriority);
                        handleChange('priorityClass', priorityClass);
                      }}
                      className={cn(
                        "py-2 px-2 rounded-lg text-xs font-bold border transition-all",
                        (editedTask?.priority === 'Gấp như cháy nhà!' && p.value === 'High Priority') ||
                          (editedTask?.priority === 'Cũng hơi căng đấy' && p.value === 'Medium Priority') ||
                          (editedTask?.priority === 'Để sau cũng được' && p.value === 'Low Priority')
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Hạn chót thăng thiên</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={editedTask?.dueDate ? new Date(editedTask.dueDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Progress is now auto-calculated based on checklist */}
              <div className="space-y-2 opacity-60 pointer-events-none grayscale">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Tiến độ (Tự động theo checklist)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editedTask?.progress || 0}
                    readOnly
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-not-allowed accent-blue-600"
                  />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 w-8 text-right">{editedTask?.progress || 0}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Kể khổ đi (Mô tả)</label>
                <textarea
                  rows={5}
                  value={editedTask?.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Ghi vào cho lắm rồi có làm không?..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                <Check className="w-5 h-5" />
                Cập nhật nợ
              </button>
            </div>
          ) : (
            // VIEW MODE
            <>
              {/* Tags & Title */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider",
                    task.priorityClass || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}>
                    {task.priority}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
                    {task.title}
                  </h2>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {!(task.isCompleted || task.isCancelled || task.isArchived) ? (
                    <>
                      <button
                        onClick={() => onUpdate({ ...task, progress: 100, isCompleted: true, isCancelled: false })}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                        <CheckCircle2 className="w-5 h-5" />
                        Thoát nợ!
                      </button>
                      <button
                        onClick={() => onUpdate({ ...task, isCancelled: true, isCompleted: false })}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95">
                        <XCircle className="w-5 h-5" />
                        Bỏ cuộc (Yếu đuối)
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center">
                      <p className="text-xs font-bold text-slate-500 italic">
                        {task.isArchived
                          ? "Món nợ này đã xuống mồ. Hãy 'Bốc mộ' để hồi sinh trước khi sửa."
                          : "Trạng thái nợ đã chốt. Muốn sửa thì nhấn 'Làm lại' ở góc trên."}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => onUpdate({ ...task, isArchived: !task.isArchived })}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all active:scale-95",
                      task.isArchived
                        ? "border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}>
                    <Archive className="w-5 h-5" />
                    {task.isArchived ? 'Bốc mộ (Khôi phục)' : 'Lò thiêu (Lưu trữ)'}
                  </button>
                  <button className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>

                {/* Move Column Section (Mobile Friendly) */}
                {columns && onMove && !task.isArchived && !task.isCompleted && !task.isCancelled && (
                  <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chuyển hộ khẩu (Dành cho mobile)</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(columns).map((colId) => {
                        const isCurrent = columns[colId].taskIds.includes(task.id);
                        if (isCurrent) return null;
                        return (
                          <button
                            key={colId}
                            onClick={() => onMove(task.id, colId)}
                            className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                          >
                            ➜ {columns[colId].title}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* Meta Info Grid */}
              <section className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 shadow-sm">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tình trạng nợ</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                      Vẫn đang ngâm
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hạn thăng thiên</p>
                  <p className={cn("text-sm font-bold flex items-center justify-end gap-1", task.deadlineClass)}>
                    <Clock className="w-4 h-4" />
                    {task.deadline}
                  </p>
                </div>
              </section>

              {/* Progress Bar Display */}
              <section className="space-y-2">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-slate-900 dark:text-slate-100">Tiến độ thoát nợ</span>
                  <span className="text-slate-500">{task.progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", task.progressClass)}
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </section>

              {/* Description */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Kể khổ (Mô tả)</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Sửa nợ
                  </button>
                </div>
                <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {task.description || `Không thèm ghi mô tả à? Lười vừa thôi!`}
                </div>
              </section>

              {/* Checklist */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Chia nhỏ nợ ra mà làm</h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    {(task.checklist || []).filter((i: any) => i.completed).length}/{(task.checklist || []).length} xong rồi đấy
                  </span>
                </div>

                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(task.checklist || []).length > 0
                        ? ((task.checklist || []).filter((i: any) => i.completed).length / (task.checklist || []).length) * 100
                        : 0}%`
                    }}
                  ></div>
                </div>

                <div className="space-y-3">
                  {(task.checklist || []).map((item: any) => (
                    <div
                      key={item.id}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl border p-3 transition-all",
                        item.completed
                          ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 opacity-75"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                      )}
                    >
                      <GripVertical className="text-slate-300 w-5 h-5 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button
                        onClick={() => {
                          const newChecklist = (task.checklist || []).map((i: any) =>
                            i.id === item.id ? { ...i, completed: !i.completed } : i
                          );
                          const completedCount = newChecklist.filter((i: any) => i.completed).length;
                          const totalCount = newChecklist.length;
                          const newProgress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

                          onUpdate({ ...task, checklist: newChecklist, progress: newProgress });
                        }}
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                          item.completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-transparent hover:border-emerald-500"
                        )}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium transition-all",
                          item.completed ? "line-through text-slate-400 decoration-slate-400" : "text-slate-800 dark:text-slate-200"
                        )}>
                          {item.text}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const newChecklist = (task.checklist || []).filter((i: any) => i.id !== item.id);
                          const completedCount = newChecklist.filter((i: any) => i.completed).length;
                          const totalCount = newChecklist.length;
                          const newProgress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

                          onUpdate({ ...task, checklist: newChecklist, progress: newProgress });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add New Item Input */}
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/20 hover:bg-white dark:hover:bg-slate-900 transition-colors group focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <PlusCircle className="text-slate-400 w-5 h-5 group-hover:text-blue-500 transition-colors" />
                    <input
                      ref={checklistInputRef}
                      type="text"
                      placeholder="Thêm nợ nhỏ nhặt..."
                      className="flex-1 bg-transparent text-sm outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          if (!target.value.trim()) return;

                          const newItem = {
                            id: `cl-${Date.now()}`,
                            text: target.value,
                            completed: false
                          };
                          const newChecklist = [...(task.checklist || []), newItem];
                          const completedCount = newChecklist.filter((i: any) => i.completed).length;
                          const totalCount = newChecklist.length;
                          const newProgress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

                          onUpdate({ ...task, checklist: newChecklist, progress: newProgress });
                          target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (!checklistInputRef.current || !checklistInputRef.current.value.trim()) return;

                        const newItem = {
                          id: `cl-${Date.now()}`,
                          text: checklistInputRef.current.value,
                          completed: false
                        };
                        const newChecklist = [...(task.checklist || []), newItem];
                        const completedCount = newChecklist.filter((i: any) => i.completed).length;
                        const totalCount = newChecklist.length;
                        const newProgress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

                        onUpdate({ ...task, checklist: newChecklist, progress: newProgress });
                        checklistInputRef.current.value = '';
                        checklistInputRef.current.focus();
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors opacity-0 group-focus-within:opacity-100"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer / Comment Input */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <input
                className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-slate-100 outline-none transition-all"
                placeholder="Ghi chú vào cho vui hay có làm không?..."
                type="text"
              />
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
