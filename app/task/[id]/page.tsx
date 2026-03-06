import Link from 'next/link';
import { 
  ArrowLeft, 
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
  Check
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function TaskDetailPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </Link>
        <h1 className="text-base font-bold tracking-tight">Chi tiết công việc</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 transition-colors">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Tags & Title */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                <span className="mr-1 text-lg leading-none">!</span> Khẩn cấp
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                Đang làm
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                Web App Migration
              </span>
            </div>
            
            <div>
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
                Refactor API Authentication Module
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
                Tạo 2 ngày trước
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                <CheckCircle2 className="w-5 h-5" />
                Hoàn thành
              </button>
              <button className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex border-b border-slate-200 dark:border-slate-800">
            <button className="border-b-2 border-blue-600 py-3 px-4 text-sm font-bold text-blue-600 dark:text-blue-400">Tổng quan</button>
            <button className="border-b-2 border-transparent py-3 px-4 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Tài nguyên</button>
            <button className="border-b-2 border-transparent py-3 px-4 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Hoạt động</button>
          </nav>

          {/* Meta Info Grid */}
          <section className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                  Đang làm
                </span>
              </div>
            </div>
            <div className="space-y-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hạn chót</p>
              <p className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center justify-end gap-1">
                <Clock className="w-4 h-4" />
                Còn 2h 15p
              </p>
            </div>
            <div className="col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Thời gian</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>24/10 - 28/10, 2023</span>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Mô tả</h3>
              <button className="text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1">
                <Edit2 className="w-3 h-3" /> Sửa
              </button>
            </div>
            <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Chúng ta cần chuyển đổi việc triển khai JWT hiện tại sang nhà cung cấp OAuth2 không trạng thái. 
              Điều này bao gồm cập nhật middleware để bảo vệ route và đảm bảo rằng các token cũ được vô hiệu hóa đúng cách sau khi chuyển đổi.
            </div>
          </section>

          {/* Checklist */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Danh sách việc cần làm</h3>
              <span className="text-[11px] font-bold text-slate-500">2/5 hoàn thành</span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[40%] rounded-full"></div>
            </div>

            <div className="space-y-3">
              {/* Item 1: Done */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/40 opacity-60">
                <GripVertical className="text-slate-300 w-5 h-5 cursor-grab" />
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-emerald-500 bg-emerald-500 text-white">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-through text-slate-500">Kiểm tra các endpoint JWT hiện tại</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">24/10</span>
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">SJ</div>
                </div>
              </div>

              {/* Item 2: Done */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/40 opacity-60">
                <GripVertical className="text-slate-300 w-5 h-5 cursor-grab" />
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-emerald-500 bg-emerald-500 text-white">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-through text-slate-500">Thiết lập môi trường OAuth2 sandbox</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">25/10</span>
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">MT</div>
                </div>
              </div>

              {/* Item 3: To Do */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 shadow-sm">
                <GripVertical className="text-slate-300 w-5 h-5 cursor-grab" />
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-slate-300 dark:border-slate-600 bg-transparent"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Cập nhật logic xác thực middleware</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-red-500">26/10</span>
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">SJ</div>
                </div>
              </div>

              {/* Item 4: To Do */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 shadow-sm">
                <GripVertical className="text-slate-300 w-5 h-5 cursor-grab" />
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-slate-300 dark:border-slate-600 bg-transparent"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Triển khai xoay vòng refresh token</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">27/10</span>
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">JD</div>
                </div>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-3 text-sm font-bold text-slate-500 hover:border-blue-500/50 hover:text-blue-600 transition-colors mt-2">
              <PlusCircle className="w-5 h-5" />
              Thêm mục mới
            </button>
          </section>

          {/* Resources */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Tài nguyên (4)</h3>
              <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-bold">
                <PlusCircle className="w-4 h-4" /> Thêm
              </button>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">Tài liệu API v2.4</p>
                  <p className="text-xs text-slate-500">docs.company.io/auth-v2</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">auth_middleware.go</p>
                  <p className="text-xs text-slate-500">12.4 KB • Code Snippet</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Bottom Nav Placeholder to prevent overlap */}
      <div className="h-16 w-full md:hidden"></div>
      
      <div className="hidden md:block">
         <BottomNav />
      </div>
    </div>
  );
}
