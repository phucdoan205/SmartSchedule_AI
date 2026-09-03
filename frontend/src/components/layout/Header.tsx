import React, { useState } from 'react';
import {
  Search,
  Bell,
  Building,
  Sparkles,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [selectedBranch, setSelectedBranch] = useState('CN1 - Cơ sở Quận 1 (Trung tâm)');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-6 flex items-center justify-between shadow-xs">
      {/* Branch Selector & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Branch selection */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
            <Building className="w-4 h-4 text-sky-600" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-2 font-medium"
            >
              <option value="CN1 - Cơ sở Quận 1 (Trung tâm)">CN1 - Cơ sở Q1 (Trung tâm)</option>
              <option value="CN2 - Cơ sở Quận 7 (Phú Mỹ Hưng)">CN2 - Cơ sở Q7 (Phú Mỹ Hưng)</option>
              <option value="CN3 - Cơ sở TP. Thủ Đức">CN3 - Cơ sở TP. Thủ Đức</option>
            </select>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative flex-1 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm bác sĩ, lịch hẹn, hồ sơ bệnh nhân (Ctrl + K)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* AI Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200/60 text-[11px] font-bold text-sky-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>AI SmartSchedule: Tối ưu 99.4%</span>
        </div>

        {/* Notifications Bell */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              AD
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800">Bs. Nguyễn Văn Quản Lý</p>
              <p className="text-[10px] text-slate-400 font-medium">Giám Đốc Y Khoa</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 text-xs animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800">Nguyễn Văn Quản Lý</p>
                <p className="text-[10px] text-slate-400">System Administrator</p>
              </div>
              <a
                href="#profile"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-sky-600 font-medium"
              >
                <User className="w-3.5 h-3.5" />
                Hồ sơ cá nhân
              </a>
              <a
                href="#settings"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-sky-600 font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Bảo mật & Quyền hạn
              </a>
              <div className="border-t border-slate-100 my-1" />
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
