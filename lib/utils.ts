import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  
  // Reset hours to compare just the days
  const d = new Date(date); d.setHours(0,0,0,0);
  const n = new Date(now); n.setHours(0,0,0,0);
  
  const diffTime = d.getTime() - n.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  
  if (diffDays === 0) return `Hôm nay lúc ${timeStr}`;
  if (diffDays === 1) return `Ngày mai lúc ${timeStr}`;
  if (diffDays === -1) return `Hôm qua lúc ${timeStr}`;
  
  // Future dates within a week
  if (diffDays > 1 && diffDays < 7) {
     return `${days[date.getDay()]} lúc ${timeStr}`;
  }
  
  // Past dates within a week
  if (diffDays < -1 && diffDays > -7) {
      return `${days[date.getDay()]} trước lúc ${timeStr}`;
  }

  // Fallback
  const datePart = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${days[date.getDay()]}, ${datePart} lúc ${timeStr}`;
}
