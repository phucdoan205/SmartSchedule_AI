import React, { useState } from 'react';
import {
  Search,
  Bell,
  Building,
  Sparkles,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [selectedBranch, setSelectedBranch] = useState('CN1 - Cơ sở Quận 1 (Trung tâm)');

  return (
    <header className="h-14 md:h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-3 md:px-6 flex items-center justify-between shadow-xs gap-3 shrink-0">

      {/* Left: Hamburger (mobile) + Branch selector + Search */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">

        {/* Hamburger — chỉ hiện trên mobile/tablet */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch Selector */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
            <Building className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-medium max-w-[120px] sm:max-w-none truncate"
            >
              <option value="CN1 - Cơ sở Quận 1 (Trung tâm)">CN1 - Q1</option>
              <option value="CN2 - Cơ sở Quận 7 (Phú Mỹ Hưng)">CN2 - Q7</option>
              <option value="CN3 - Cơ sở TP. Thủ Đức">CN3 - Thủ Đức</option>
            </select>
          </div>
        </div>

        {/* Global Search — ẩn trên mobile nhỏ */}
        <div className="relative flex-1 hidden sm:block max-w-sm lg:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm bác sĩ, lịch hẹn, hồ sơ... (Ctrl+K)"
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">

        {/* AI Status — chỉ hiện trên desktop lớn */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200/60 text-[11px] font-bold text-sky-700 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>AI: Tối ưu 99.4%</span>
        </div>

        {/* Notifications Bell */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User Profile Badge (Đồng bộ dữ liệu mẫu với Sidebar, bỏ popup ở Header) */}
        <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-50/60 border border-slate-200/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
            AD
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold text-slate-800 whitespace-nowrap">Bs. Nguyễn Quản Lý</p>
            <p className="text-[10px] text-slate-500 font-medium">admin@smartschedule.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
};
