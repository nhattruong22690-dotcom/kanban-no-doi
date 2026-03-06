'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  MoreHorizontal,
  Calendar,
  Archive,
  Paperclip,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layout,
  FileText,
  Activity,
  ChevronDown,
  CheckSquare,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import BottomNav from '@/components/BottomNav';
import TaskDetailModal from '@/components/TaskDetailModal';
import AddTaskModal from '@/components/AddTaskModal';
import { cn, formatRelativeDate } from '@/lib/utils';

// Types
type Task = {
  id: string;
  title: string;
  priority: string;
  priorityClass: string;
  iconName?: string;
  deadline: string; // Display string
  dueDate?: string; // ISO Date string for calculation
  deadlineIconName?: string;
  deadlineClass: string;
  statusText: string;
  statusClass: string;
  progress: number;
  progressClass: string;
  attachments?: number;
  lateText?: string;
  isCompleted?: boolean;
  isCancelled?: boolean;
  isArchived?: boolean;
  description?: string;
  createdAt?: string;
  checklist?: { id: string; text: string; completed: boolean }[];
};

type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

export type Notification = {
  id: string;
  type: 'mention' | 'deadline' | 'system' | 'comment' | 'complete';
  title: string;
  description: string;
  time: string;
  timestamp: string;
  read: boolean;
  user?: { name: string; avatar: string; initials: string; };
};

type Data = {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
  notifications?: Notification[];
};

// Helper to calculate status based on due date
const calculateTaskStatus = (dueDateStr: string | undefined, isCompleted: boolean) => {
  if (!dueDateStr || isCompleted) return { text: '', class: '', lateText: '' };

  const now = new Date();
  const dueDate = new Date(dueDateStr);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffHours = diffTime / (1000 * 60 * 60);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffTime < 0) {
    // Overdue
    const daysLate = Math.abs(diffDays);
    return {
      text: 'Lười thối thây!',
      class: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 uppercase text-[9px] sm:text-[10px] sm:px-2.5 px-2 py-0.5 font-black rounded-full animate-pulse shadow-sm shadow-red-500/10',
      lateText: `Trễ ${daysLate} ngày rồi đấy!`
    };
  } else if (diffHours <= 24) {
    // Due soon (within 24h)
    return {
      text: 'Vắt chân lên cổ mà chạy!',
      class: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm',
      lateText: ''
    };
  } else {
    // On track
    return {
      text: 'Tạm chấp nhận',
      class: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 text-[9px] sm:text-[10px] font-medium px-2 sm:px-2.5 py-0.5 rounded-full',
      lateText: ''
    };
  }
};

// Helper to get priority class
const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'Gấp như cháy nhà!':
      return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    case 'Cũng hơi căng đấy':
      return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    case 'Để sau cũng được':
      return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
    default:
      return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
  }
};

// Helpers to render icons from names (since JSX can't be saved in localStorage)
const renderTaskIcon = (iconName: string | undefined) => {
  switch (iconName) {
    case 'layout': return <Layout className="w-5 h-5 text-blue-500" />;
    case 'alert-circle': return <AlertCircle className="w-5 h-5 text-amber-500" />;
    case 'alert-triangle': return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'check-circle': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case 'x-circle': return <XCircle className="w-5 h-5 text-slate-400" />;
    default: return null;
  }
};

const renderDeadlineIcon = (iconName: string | undefined) => {
  switch (iconName) {
    case 'clock': return <Clock className="w-3.5 h-3.5" />;
    case 'check': return <CheckCircle2 className="w-3.5 h-3.5" />;
    case 'calendar':
    default: return <Calendar className="w-3.5 h-3.5" />;
  }
};

const initialData: Data = {
  tasks: {},
  columns: {
    'col-1': { id: 'col-1', title: 'Sắp ăn hành', taskIds: [] },
    'col-5': { id: 'col-5', title: 'Đang ngâm giấm', taskIds: [] },
    'col-2': { id: 'col-2', title: 'Đang bị hành', taskIds: [] },
    'col-3': { id: 'col-3', title: 'Tu thành chính quả', taskIds: [] },
    'col-4': { id: 'col-4', title: 'Nằm thẳng (Bỏ cuộc)', taskIds: [] }
  },
  columnOrder: ['col-1', 'col-5', 'col-2', 'col-3', 'col-4']
};

// Helper to get tooltip text
const getTooltipText = (task: Task) => {
  if (!task.dueDate) return '';
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffHours = Math.abs(Math.round(diffTime / (1000 * 60 * 60)));
  const diffDays = Math.abs(Math.round(diffTime / (1000 * 60 * 60 * 24)));

  if (task.statusText === 'Lười thối thây!') {
    return `Đã nợ đời được ${diffDays} ngày ${diffHours % 24} giờ rồi đấy!`;
  } else if (task.statusText === 'Vắt chân lên cổ mà chạy!') {
    return `Chỉ còn ${diffHours} giờ để sống sót thôi!`;
  } else {
    return `Hạn chót: ${dueDate.toLocaleString('vi-VN')}`;
  }
};

export default function KanbanPage() {
  const [data, setData] = useState<Data>(initialData);
  const [isBrowser, setIsBrowser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [addTaskColumnId, setAddTaskColumnId] = useState('col-1');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'idle'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const pendingSyncs = useRef(0);

  // Load data from Google Sheets instead of localStorage
  const [filterPriority, setFilterPriority] = useState('all');
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch data function (reusable for polling + focus refresh)
  const fetchData = useCallback(async (silent = false) => {
    try {
      const response = await fetch('/api/data');
      if (response.ok) {
        const fetchedData = await response.json();
        if (fetchedData && fetchedData.tasks) {
          setData(fetchedData);
          setIsDataLoaded(true);
          setLastSyncTime(new Date());
          if (pendingSyncs.current === 0) {
            setSyncStatus('synced');
          }
        }
      } else if (!silent) {
        toast.error('Máy chủ đang đình công!', {
          description: 'Nó bảo nợ nhiều quá không muốn làm việc nữa. Thử reload xem sao!',
        });
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      if (!silent) {
        toast.error('Kết nối mạng như... hạch!', {
          description: 'Không tải được nợ đời rồi. Kiểm tra lại mạng nhé!',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setIsBrowser(true);
    fetchData();
  }, [fetchData]);

  // ⏰ Auto-polling every 60 seconds
  useEffect(() => {
    if (!isBrowser) return;
    const interval = setInterval(() => {
      fetchData(true); // silent refresh, no toast on error
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [isBrowser, fetchData]);

  // 👁️ Refresh when user returns to tab
  useEffect(() => {
    if (!isBrowser) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isBrowser, fetchData]);

  // Helper: gọi API action-based (không bao giờ gửi toàn bộ state)
  const callApi = async (action: string, payload: any) => {
    pendingSyncs.current += 1;
    setSyncStatus('syncing');
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      if (!response.ok) {
        const err = await response.json();
        console.error(`API ${action} failed:`, err);
        setSyncStatus('error');
        toast.error('Lưu nợ thất bại!', {
          description: `Thao tác "${action}" bị lỗi. Google đang dỗi!`,
        });
      } else {
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error(`API ${action} network error:`, error);
      setSyncStatus('error');
      toast.error('Mất kết nối!', {
        description: 'Kiểm tra lại wifi/4G đi, không là mất hết nợ đấy!',
      });
    } finally {
      pendingSyncs.current -= 1;
      if (pendingSyncs.current === 0 && syncStatus !== 'error') {
        setSyncStatus('synced');
      }
    }
  };

  // Check for overdue tasks on load
  useEffect(() => {
    if (isLoading || !isBrowser) return;

    const overdueTasks = Object.values(data.tasks).filter(task => {
      const status = calculateTaskStatus(task.dueDate, task.isCompleted || false);
      return status.text === 'Lười thối thây!';
    });

    if (overdueTasks.length > 0) {
      toast.error(`Trời ơi! Có ${overdueTasks.length} đống nợ đang đợi bạn kìa!`, {
        description: 'Lười vừa thôi, vào mà dọn dẹp đi!',
        duration: 5 * 1000,
      });
    }
  }, [isLoading, isBrowser]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    // Moving within the same column
    if (start === finish) {
      if (filterPriority !== 'all' || filterStatus !== 'all') {
        toast.error('Thao tác không được phép!', {
          description: 'Không thể kéo thả sắp xếp trong lúc đang dùng bộ lọc. Vui lòng tắt bộ lọc để sắp xếp nhé.',
          duration: 3000,
        });
        return;
      }

      const newTaskIds = Array.from(start.taskIds);

      // Safety check to ensure we are grabbing the exact item (avoids index mismatch if archived items exist)
      const rawSourceIndex = start.taskIds.indexOf(draggableId);
      if (rawSourceIndex === -1) return;

      newTaskIds.splice(rawSourceIndex, 1);

      // Since filters are off, destination.index is safe to use directly (assuming no archived items mixed in, but this is the best effort)
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));

      // 🔄 Sync to Google Sheets: chỉ cập nhật thứ tự trong 1 cột
      callApi('reorder_task', {
        columnId: newColumn.id,
        columnTaskIds: newTaskIds,
      });
      return;
    }

    // Moving between different columns
    const startTaskIds = Array.from(start.taskIds);
    // Safety check just like above
    const startRawSourceIndex = start.taskIds.indexOf(draggableId);
    if (startRawSourceIndex === -1) return;

    startTaskIds.splice(startRawSourceIndex, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    // Auto-update task status flags based on the column dropped into
    const task = data.tasks[draggableId];
    if (task) {
      if (destination.droppableId === 'col-3') {
        task.isCompleted = true;
        task.isCancelled = false;
        task.progress = 100;
        // set all checklist items to complete
        if (task.checklist) {
          task.checklist.forEach((item: any) => item.completed = true);
        }
      } else if (destination.droppableId === 'col-4') {
        task.isCompleted = false;
        task.isCancelled = true;
      } else {
        task.isCompleted = false;
        task.isCancelled = false;
        if (task.progress === 100) {
          task.progress = 99; // Revert slightly if moved out of completed
          // Uncheck the last checklist item to reflect progress drop if any
          if (task.checklist && task.checklist.length > 0) {
            const lastCompletedIndex = [...task.checklist].reverse().findIndex((i: any) => i.completed);
            if (lastCompletedIndex !== -1) {
              const actualIndex = task.checklist.length - 1 - lastCompletedIndex;
              task.checklist[actualIndex].completed = false;
            }
          }
        }
      }
    }

    setData((prev) => {
      let newLogs = prev.notifications || [];
      if (start.id !== finish.id) {
        newLogs = [{
          id: `log-${Date.now()}`,
          type: task.isCompleted ? 'complete' : 'system',
          title: 'Nợ đã được luân chuyển',
          description: `"${task.title}" vừa bị đá từ "${start.title}" sang "${finish.title}"`,
          time: 'Vừa xong',
          timestamp: new Date().toISOString(),
          read: false,
        }, ...newLogs];
      }

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
        tasks: {
          ...prev.tasks,
          [draggableId]: task
        },
        notifications: newLogs
      };
    });

    // 🔄 Sync to Google Sheets: di chuyển task giữa cột
    const moveNotification = (start.id !== finish.id) ? {
      id: `log-${Date.now()}`,
      type: task.isCompleted ? 'complete' : 'system',
      title: 'Nợ đã được luân chuyển',
      description: `"${task.title}" vừa bị đá từ "${start.title}" sang "${finish.title}"`,
      time: 'Vừa xong',
      timestamp: new Date().toISOString(),
      read: false,
    } : undefined;

    callApi('move_task', {
      taskId: draggableId,
      task: task,
      fromColId: start.id,
      fromColTaskIds: startTaskIds,
      toColId: finish.id,
      toColTaskIds: finishTaskIds,
      notification: moveNotification,
    });
  };

  const handleAddTaskClick = (columnId: string = 'col-1') => {
    setAddTaskColumnId(columnId);
    setIsAddTaskOpen(true);
  };

  const handleAddTask = (taskData: any) => {
    const newTaskId = `task-${Date.now()}`;
    const targetColumnId = taskData.status || 'col-1';

    // Calculate status based on deadline
    const status = calculateTaskStatus(taskData.deadline, false);

    // Determine priority class
    const priorityClass = getPriorityClass(taskData.priority);

    const newTask: Task = {
      id: newTaskId,
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority,
      priorityClass: priorityClass,
      iconName: 'layout',
      deadline: formatRelativeDate(taskData.deadline),
      dueDate: taskData.deadline,
      deadlineIconName: 'calendar',
      deadlineClass: 'text-slate-500 dark:text-slate-400',
      statusText: status.text,
      statusClass: status.class,
      progress: 0,
      progressClass: 'bg-blue-500',
      lateText: status.lateText,
      checklist: [],
      createdAt: new Date().toISOString(),
    };

    setData(prev => {
      const newTasks = { ...prev.tasks, [newTaskId]: newTask };
      const newColumn = {
        ...prev.columns[targetColumnId],
        taskIds: [...prev.columns[targetColumnId].taskIds, newTaskId]
      };

      const newLog: Notification = {
        id: `log-${Date.now()}`,
        type: 'system',
        title: 'Nợ mới được khai sinh',
        description: `"${newTask.title}" vừa được ném vào kho nợ.`,
        time: 'Vừa xong',
        timestamp: new Date().toISOString(),
        read: false,
      };

      return {
        ...prev,
        tasks: newTasks,
        columns: {
          ...prev.columns,
          [targetColumnId]: newColumn
        },
        notifications: [newLog, ...(prev.notifications || [])]
      };
    });

    // 🔄 Sync to Google Sheets: thêm task mới
    callApi('add_task', {
      task: newTask,
      columnId: targetColumnId,
      columnTaskIds: [...data.columns[targetColumnId].taskIds, newTaskId],
      notification: {
        id: `log-${Date.now()}`,
        type: 'system',
        title: 'Nợ mới được khai sinh',
        description: `"${newTask.title}" vừa được ném vào kho nợ.`,
        time: 'Vừa xong',
        timestamp: new Date().toISOString(),
        read: false,
      },
    });

    // Auto-open modal after creation
    setSelectedTask(newTask);

    toast.success('Lại thêm nợ đời à? Chúc may mắn nhé!', {
      description: 'Ghi vào đây rồi thì lo mà làm đi!'
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setData(prev => {
      const deletedTask = prev.tasks[taskId];
      // Remove from tasks
      const newTasks = { ...prev.tasks };
      delete newTasks[taskId];

      // Remove from columns
      const newColumns = { ...prev.columns };
      Object.keys(newColumns).forEach(colId => {
        newColumns[colId] = {
          ...newColumns[colId],
          taskIds: newColumns[colId].taskIds.filter(id => id !== taskId)
        };
      });

      const newLog: Notification = {
        id: `log-${Date.now()}`,
        type: 'system',
        title: 'Nợ đã bị xóa sổ',
        description: `"${deletedTask?.title || 'Một nợ bí ẩn'}" đã không cánh mà bay khỏi bảng.`,
        time: 'Vừa xong',
        timestamp: new Date().toISOString(),
        read: false,
      };

      return {
        ...prev,
        tasks: newTasks,
        columns: newColumns,
        notifications: [newLog, ...(prev.notifications || [])]
      };
    });

    // 🔄 Sync to Google Sheets: xóa task
    const columnUpdates = Object.keys(data.columns).map(colId => ({
      colId,
      taskIds: data.columns[colId].taskIds.filter((id: string) => id !== taskId),
    }));
    const deletedTitle = data.tasks[taskId]?.title || 'Một nợ bí ẩn';
    callApi('delete_task', {
      taskId,
      columnUpdates,
      notification: {
        id: `log-${Date.now()}`,
        type: 'system',
        title: 'Nợ đã bị xóa sổ',
        description: `"${deletedTitle}" đã không cánh mà bay khỏi bảng.`,
        time: 'Vừa xong',
        timestamp: new Date().toISOString(),
        read: false,
      },
    });
    setSelectedTask(null);
    toast.info('Trốn tránh trách nhiệm thành công!', {
      description: 'Xóa đi là coi như chưa bao giờ nợ nhé!'
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setData(prev => {
      let newColumns = { ...prev.columns };

      // Automate status based on progress or cancellation
      let targetColId = null;
      if (updatedTask.isCancelled) targetColId = 'col-4'; // Nằm thẳng
      else if (updatedTask.progress === 100) targetColId = 'col-3'; // Thành quả
      else if (updatedTask.progress > 0) targetColId = 'col-2'; // Đang bị hành
      else targetColId = 'col-1'; // Sắp ăn hành

      // Find current column
      let currentColId = null;
      Object.keys(newColumns).forEach(colId => {
        if (newColumns[colId].taskIds.includes(updatedTask.id)) {
          currentColId = colId;
        }
      });

      // Move task if needed and target is valid
      if (currentColId && targetColId && currentColId !== targetColId) {
        // Remove from current
        newColumns[currentColId] = {
          ...newColumns[currentColId],
          taskIds: newColumns[currentColId].taskIds.filter(id => id !== updatedTask.id)
        };
        // Add to target (at the top)
        newColumns[targetColId] = {
          ...newColumns[targetColId],
          taskIds: [updatedTask.id, ...newColumns[targetColId].taskIds]
        };
      }

      const newTasks = { ...prev.tasks, [updatedTask.id]: updatedTask };

      const newLog: Notification = {
        id: `log-${Date.now()}`,
        type: updatedTask.isCompleted ? 'complete' : 'system',
        title: 'Nợ đã có biến đổi',
        description: `"${updatedTask.title}" vừa được cập nhật nội dung trạng thái.`,
        time: 'Vừa xong',
        timestamp: new Date().toISOString(),
        read: false,
      };

      return {
        ...prev,
        columns: newColumns,
        tasks: newTasks,
        notifications: [newLog, ...(prev.notifications || [])]
      };
    });

    // 🔄 Sync to Google Sheets: cập nhật task
    // Tình toán lại cột đích và cột nguồn để gửi payload đúng
    let apiCurrentColId: string | null = null;
    let apiTargetColId: string | null = null;
    if (updatedTask.isCancelled) apiTargetColId = 'col-4';
    else if (updatedTask.progress === 100) apiTargetColId = 'col-3';
    else if (updatedTask.progress > 0) apiTargetColId = 'col-2';
    else apiTargetColId = 'col-1';

    Object.keys(data.columns).forEach(colId => {
      if (data.columns[colId].taskIds.includes(updatedTask.id)) {
        apiCurrentColId = colId;
      }
    });

    const updatePayload: any = {
      taskId: updatedTask.id,
      task: updatedTask,
      notification: {
        id: `log-${Date.now()}`,
        type: updatedTask.isCompleted ? 'complete' : 'system',
        title: 'Nợ đã có biến đổi',
        description: `"${updatedTask.title}" vừa được cập nhật nội dung trạng thái.`,
        time: 'Vừa xong',
        timestamp: new Date().toISOString(),
        read: false,
      },
    };

    if (apiCurrentColId && apiTargetColId && apiCurrentColId !== apiTargetColId) {
      updatePayload.fromColId = apiCurrentColId;
      updatePayload.toColId = apiTargetColId;
      updatePayload.fromColTaskIds = data.columns[apiCurrentColId].taskIds.filter((id: string) => id !== updatedTask.id);
      updatePayload.toColTaskIds = [updatedTask.id, ...data.columns[apiTargetColId].taskIds];
    }

    callApi('update_task', updatePayload);

    // Update the selected task to keep the modal open and reflect new changes
    if (selectedTask && selectedTask.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }

    if (updatedTask.isArchived) {
      toast.success('Đã đưa vào Nghĩa địa!', {
        description: `Tạm biệt: ${updatedTask.title}`,
      });
    } else if (updatedTask.progress === 100) {
      toast.success('Tu thành chính quả rồi à?', {
        description: `Đã dọn xong: ${updatedTask.title}`,
      });
    } else if (updatedTask.isCancelled) {
      toast.error('Nằm thẳng thật đấy à?', {
        description: `Đã buông xuôi: ${updatedTask.title}`,
      });
    }
  };

  const handleMoveTask = (taskId: string, targetColId: string) => {
    setData(prev => {
      const newColumns = { ...prev.columns };

      // Find current column
      let currentColId = null;
      Object.keys(newColumns).forEach(colId => {
        if (newColumns[colId].taskIds.includes(taskId)) {
          currentColId = colId;
        }
      });

      if (!currentColId || currentColId === targetColId) return prev;

      // Remove from current
      newColumns[currentColId] = {
        ...newColumns[currentColId],
        taskIds: newColumns[currentColId].taskIds.filter(id => id !== taskId)
      };

      // Add to target
      newColumns[targetColId] = {
        ...newColumns[targetColId],
        taskIds: [taskId, ...newColumns[targetColId].taskIds]
      };

      return { ...prev, columns: newColumns };
    });
    setSelectedTask(null);
    toast.success('Chuyển hộ khẩu thành công!', {
      description: 'Món nợ đã được sang tên đổi chủ.'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 italic">Đợi tí, đang bới nợ trong Google Sheets...</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm italic">"Nợ nhiều quá bới mãi không xong =]]]"</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
        <div className="max-w-full mx-auto flex flex-col min-h-screen relative">
          <Toaster richColors position="top-right" />
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Đống Nợ Đời
              </h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sào huyệt của bạn</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sync Status Indicator */}
              <button
                onClick={() => fetchData(false)}
                title={lastSyncTime ? `Lần đồng bộ cuối: ${lastSyncTime.toLocaleTimeString('vi-VN')}` : 'Đang tải...'}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                  syncStatus === 'synced' && "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
                  syncStatus === 'syncing' && "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse",
                  syncStatus === 'error' && "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800",
                  syncStatus === 'idle' && "bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                )}
              >
                {syncStatus === 'synced' && <><Wifi className="w-3 h-3" /> Đã đồng bộ</>}
                {syncStatus === 'syncing' && <><RefreshCw className="w-3 h-3 animate-spin" /> Đang lưu...</>}
                {syncStatus === 'error' && <><WifiOff className="w-3 h-3" /> Lỗi đồng bộ</>}
                {syncStatus === 'idle' && <><RefreshCw className="w-3 h-3" /> Đang tải...</>}
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md border-2 border-white dark:border-slate-800">
                ME
              </div>
            </div>
          </header>

          <main className="flex flex-col p-4 gap-6">
            {/* Actions & Filters */}
            <section className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="Lại định bày trò gì nữa?"
                  type="text"
                />
                <button
                  onClick={() => handleAddTaskClick('col-1')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ôm Nợ Mới
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* Desktop Tabs */}
                <div className="hidden sm:flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-colors",
                      filterStatus === 'all'
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setFilterStatus('due_soon')}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
                      filterStatus === 'due_soon'
                        ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                        : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                    )}
                  >
                    Sắp thăng thiên
                  </button>
                  <button
                    onClick={() => setFilterStatus('overdue')}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
                      filterStatus === 'overdue'
                        ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                        : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30"
                    )}
                  >
                    Nợ chồng nợ
                  </button>
                  <button
                    onClick={() => setFilterStatus('completed')}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
                      filterStatus === 'completed'
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                    )}
                  >
                    Tu thành chính quả
                  </button>
                  <button
                    onClick={() => setFilterStatus('cancelled')}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
                      filterStatus === 'cancelled'
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                        : "bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    Nằm thẳng (Bỏ cuộc)
                  </button>
                  <button
                    onClick={() => setFilterStatus('doing')}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
                      filterStatus === 'doing'
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    )}
                  >
                    Đang bị hành
                  </button>
                </div>

                {/* Mobile Dropdown */}
                <div className="relative sm:hidden">
                  <button
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-bold shadow-sm",
                      filterStatus === 'all' && "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white",
                      filterStatus === 'due_soon' && "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-400",
                      filterStatus === 'overdue' && "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400",
                      filterStatus === 'completed' && "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400",
                      filterStatus === 'cancelled' && "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300",
                      filterStatus === 'doing' && "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Layout className="w-4 h-4 opacity-50" />
                      {filterStatus === 'all' && 'Bộ lọc: Tất cả'}
                      {filterStatus === 'due_soon' && 'Bộ lọc: Sắp thăng thiên'}
                      {filterStatus === 'overdue' && 'Bộ lọc: Nợ chồng nợ'}
                      {filterStatus === 'completed' && 'Bộ lọc: Tu thành chính quả'}
                      {filterStatus === 'cancelled' && 'Bộ lọc: Nằm thẳng (Bỏ cuộc)'}
                      {filterStatus === 'doing' && 'Bộ lọc: Đang bị hành'}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isStatusDropdownOpen && "rotate-180")} />
                  </button>

                  {isStatusDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsStatusDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {[
                          { id: 'all', label: 'Tất cả', color: 'text-slate-900 dark:text-white' },
                          { id: 'due_soon', label: 'Sắp thăng thiên', color: 'text-orange-600' },
                          { id: 'overdue', label: 'Nợ chồng nợ', color: 'text-red-600' },
                          { id: 'completed', label: 'Tu thành chính quả', color: 'text-emerald-600' },
                          { id: 'cancelled', label: 'Nằm thẳng (Bỏ cuộc)', color: 'text-slate-500' },
                          { id: 'doing', label: 'Đang bị hành', color: 'text-blue-600' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setFilterStatus(item.id as any);
                              setIsStatusDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between",
                              filterStatus === item.id ? "bg-slate-50 dark:bg-slate-800" : "bg-transparent",
                              item.color
                            )}
                          >
                            {item.label}
                            {filterStatus === item.id && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Priority Filter */}
                  <div className="relative">
                    <button
                      onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                      className={cn(
                        "flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                        filterPriority !== 'all' ? getPriorityClass(filterPriority) : "text-slate-600 dark:text-slate-400"
                      )}
                    >
                      <span>
                        {filterPriority === 'all' ? 'Đủ loại ưu tiên' :
                          filterPriority === 'Gấp như cháy nhà!' ? 'Cháy nhà rồi!' :
                            filterPriority === 'Cũng hơi căng đấy' ? 'Hơi căng' :
                              filterPriority === 'Để sau cũng được' ? 'Thoải mái đi' : filterPriority}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform", isPriorityOpen ? "rotate-180" : "")}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>

                    {isPriorityOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsPriorityOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-20 overflow-hidden flex flex-col p-1">
                          {[
                            { value: 'all', label: 'Đủ loại ưu tiên', class: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' },
                            { value: 'Gấp như cháy nhà!', label: 'Cháy nhà rồi!', class: getPriorityClass('Gấp như cháy nhà!') + ' hover:brightness-95' },
                            { value: 'Cũng hơi căng đấy', label: 'Hơi căng', class: getPriorityClass('Cũng hơi căng đấy') + ' hover:brightness-95' },
                            { value: 'Để sau cũng được', label: 'Thoải mái đi', class: getPriorityClass('Để sau cũng được') + ' hover:brightness-95' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setFilterPriority(option.value);
                                setIsPriorityOpen(false);
                              }}
                              className={cn(
                                "text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors",
                                option.class,
                                filterPriority === option.value && "ring-1 ring-inset ring-black/10 dark:ring-white/10"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Kanban Columns */}
            {isBrowser ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <section className="flex flex-col sm:flex-row gap-8 sm:gap-6 overflow-y-auto sm:overflow-x-auto no-scrollbar pb-24 px-4 min-h-[500px]">
                  {data.columnOrder.map((columnId) => {
                    // Filter columns based on selected status
                    if (filterStatus !== 'all') {
                      if ((filterStatus === 'due_soon' || filterStatus === 'overdue') && columnId !== 'col-1') return null;
                      if (filterStatus === 'completed' && columnId !== 'col-3') return null;
                      if (filterStatus === 'cancelled' && columnId !== 'col-4') return null;
                      if (filterStatus === 'doing' && columnId !== 'col-2' && columnId !== 'col-5') return null;
                    }

                    const column = data.columns[columnId];
                    const tasks = column.taskIds.map((taskId) => data.tasks[taskId]).filter(task => {
                      if (!task) return false;

                      // Filter by Archival status
                      if (task.isArchived) return false;

                      // Filter by Priority
                      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

                      // Filter by Status (Due Date)
                      if (filterStatus === 'due_soon') {
                        if (task.statusText !== 'Vắt chân lên cổ mà chạy!') return false;
                      }
                      if (filterStatus === 'overdue') {
                        if (task.statusText !== 'Lười thối thây!') return false;
                      }
                      if (filterStatus === 'completed') {
                        if (!task.isCompleted) return false;
                      }
                      if (filterStatus === 'cancelled') {
                        if (!task.isCancelled) return false;
                      }
                      if (filterStatus === 'doing') {
                        if (task.isCompleted || task.isCancelled) return false;
                      }

                      return true;
                    });

                    return (
                      <div
                        key={column.id}
                        className="w-full sm:flex-1 sm:min-w-[160px] flex flex-col gap-4 sm:gap-3"
                      >
                        <div className="flex items-center justify-between px-2 mb-1">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "p-1.5 rounded-lg",
                              column.id === 'col-1' && "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                              column.id === 'col-5' && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                              column.id === 'col-2' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                              column.id === 'col-3' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
                              column.id === 'col-4' && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                            )}>
                              {column.id === 'col-1' && <AlertTriangle className="w-4 h-4" />}
                              {column.id === 'col-5' && <Clock className="w-4 h-4" />}
                              {column.id === 'col-2' && <Activity className="w-4 h-4" />}
                              {column.id === 'col-3' && <CheckCircle2 className="w-4 h-4" />}
                              {column.id === 'col-4' && <XCircle className="w-4 h-4" />}
                            </div>
                            <h3 className={cn(
                              "text-sm font-black tracking-tight",
                              column.id === 'col-1' && "text-orange-700 dark:text-orange-400",
                              column.id === 'col-5' && "text-slate-600 dark:text-slate-400",
                              column.id === 'col-2' && "text-blue-700 dark:text-blue-400",
                              column.id === 'col-3' && "text-emerald-700 dark:text-emerald-400",
                              column.id === 'col-4' && "text-red-700 dark:text-red-400",
                            )}>
                              {column.title}
                            </h3>
                          </div>
                          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white dark:bg-slate-800 text-[10px] font-black border border-slate-200 dark:border-slate-700 text-slate-500 shadow-sm">
                            {tasks.length}
                          </span>
                        </div>

                        <Droppable droppableId={column.id}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={cn(
                                "bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-2 flex flex-col gap-3 min-h-[200px] transition-colors",
                                snapshot.isDraggingOver && "bg-slate-200/50 dark:bg-slate-800/50"
                              )}
                            >
                              {tasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={provided.draggableProps.style}
                                      className="outline-none"
                                    >
                                      {(() => {
                                        const status = calculateTaskStatus(task.dueDate, task.isCompleted || false);
                                        return (
                                          <div
                                            onClick={() => setSelectedTask(task)}
                                            className={cn(
                                              "bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all duration-200 cursor-pointer",
                                              task.isCompleted && "opacity-60 grayscale-[0.3]",
                                              status.lateText && "animate-shake",
                                              snapshot.isDragging && "shadow-xl rotate-2 ring-2 ring-blue-500 z-50 scale-105"
                                            )}
                                          >
                                            <div className="flex justify-between items-start">
                                              <div className="flex items-center gap-1.5 sm:gap-2">
                                                <span className={cn("inline-block text-center leading-tight px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-bold rounded uppercase tracking-tight break-words", getPriorityClass(task.priority))}>
                                                  {task.priority}
                                                </span>
                                                {task.iconName && renderTaskIcon(task.iconName)}
                                              </div>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedTask(task);
                                                }}
                                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                                title="Nhìn gì?"
                                              >
                                                <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                              </button>
                                            </div>
                                            <h4 className={cn("text-sm font-bold leading-snug text-slate-800 dark:text-slate-100", task.isCompleted && "line-through text-slate-500 dark:text-slate-400")}>
                                              {task.title}
                                            </h4>

                                            {task.description && (
                                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-2 whitespace-pre-wrap break-words">
                                                {task.description}
                                              </p>
                                            )}

                                            <div className="space-y-2 pt-1 border-t border-slate-50 dark:border-slate-800/50">
                                              <div className="flex flex-wrap items-center justify-between text-[11px] gap-2">
                                                <span className={cn("font-medium flex items-center gap-1 flex-shrink max-w-full break-words leading-tight", task.deadlineClass)}>
                                                  {renderDeadlineIcon(task.deadlineIconName)}
                                                  <span className="line-clamp-2 break-all">{task.deadline}</span>
                                                </span>
                                                {status.text && (
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <span className={cn("cursor-help shadow-sm text-center leading-tight break-words max-w-full flex-shrink", status.class)}>{status.text}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>{getTooltipText(task)}</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                )}
                                              </div>

                                              {/* Checklist & Progress */}
                                              {task.checklist && task.checklist.length > 0 && (
                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                                                  <div className="flex items-center gap-1.5">
                                                    <CheckSquare className="w-3 h-3" />
                                                    <span>{task.checklist.filter((i: any) => i.completed).length}/{task.checklist.length}</span>
                                                  </div>
                                                  <span>{task.progress}%</span>
                                                </div>
                                              )}

                                              {(!task.checklist || task.checklist.length === 0) && task.progress > 0 && (
                                                <div className="flex items-center justify-end text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                                                  <span>{task.progress}%</span>
                                                </div>
                                              )}

                                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden mt-1.5">
                                                <div
                                                  className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    task.progress === 100 ? "bg-emerald-500" : "bg-blue-500 dark:bg-blue-400"
                                                  )}
                                                  style={{ width: `${task.progress}%` }}
                                                ></div>
                                              </div>
                                            </div>
                                            {(task.attachments || status.lateText) && (
                                              <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                                <div className="flex items-center gap-2">
                                                  {task.attachments && (
                                                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                                                      <Paperclip className="w-3.5 h-3.5" />
                                                      <span>{task.attachments}</span>
                                                    </div>
                                                  )}
                                                  {status.lateText && (
                                                    <div className="text-[10px] font-bold text-red-500">{status.lateText}</div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}

                              <button
                                onClick={() => handleAddTaskClick(column.id)}
                                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white dark:hover:bg-slate-800/50 transition-colors group w-full mt-2"
                              >
                                <Plus className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                                <span className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-blue-500 font-medium transition-colors">
                                  Quăng thêm nợ vào {column.title}
                                </span>
                              </button>
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                  <div className="hidden sm:block min-w-[20px] h-full" aria-hidden="true" />
                </section>
              </DragDropContext>
            ) : (
              // Server-side / Loading skeleton to prevent layout shift
              <section className="flex flex-col sm:flex-row gap-8 sm:gap-6 overflow-x-auto no-scrollbar pb-24 px-4 snap-x">
                {/* Skeleton columns matching initial layout */}
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex-1 min-w-[160px] flex flex-col gap-3">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-2 h-[300px] animate-pulse"></div>
                  </div>
                ))}
              </section>
            )}
          </main>

          {/* Floating Action Button */}
          <button
            onClick={() => handleAddTaskClick('col-1')}
            className="fixed right-6 bottom-24 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-600/40 flex items-center justify-center active:scale-95 transition-transform hover:bg-blue-700 z-40">
            <Plus className="w-8 h-8" />
          </button>

          <BottomNav />

          <TaskDetailModal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            task={selectedTask}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
            onMove={handleMoveTask}
            columns={data?.columns}
          />

          <AddTaskModal
            isOpen={isAddTaskOpen}
            onClose={() => setIsAddTaskOpen(false)}
            initialStatus={addTaskColumnId}
            onAdd={handleAddTask}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
