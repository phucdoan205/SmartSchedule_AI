import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  CalendarCheck,
  Users,
  Building2,
  Receipt,
  BarChart3,
  Wrench,
  Sparkles,
  ScrollText,
  Settings,
  CalendarDays,
  DollarSign,
  FileSpreadsheet,
  Bell,
  ChevronRight,
  X,
  ChevronLeft,
  User,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Mobile: đóng sidebar drawer */
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  onClose,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Đóng popup khi bấm ra bất kỳ vị trí nào bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);
  const menuGroups = [
    {
      groupTitle: 'VẬN HÀNH CHÍNH',
      items: [
        { path: '/admin/overview', label: 'Trang tổng quan', icon: LayoutDashboard },
        { path: '/admin/appointments', label: 'Lịch hẹn thông minh', icon: CalendarCheck },
        { path: '/admin/patients', label: 'Khách hàng & Bệnh án', icon: Users },
      ],
    },
    {
      groupTitle: 'BÁC SĨ & NHÂN SỰ',
      items: [
        { path: '/admin/staff', label: 'Danh sách nhân sự', icon: UserCheck },
        { path: '/admin/staff/schedule', label: 'Lịch làm việc', icon: CalendarDays },
        { path: '/admin/staff/salary', label: 'Quản lý lương thưởng', icon: DollarSign },
        { path: '/admin/staff/leave', label: 'Đăng ký nghỉ phép', icon: FileSpreadsheet },
      ],
    },
    {
      groupTitle: 'QUẢN LÝ DỊCH VỤ & THIẾT BỊ',
      items: [
        { path: '/admin/branches', label: 'Quản lý chi nhánh', icon: Building2 },
        { path: '/admin/services', label: 'Dịch vụ & Bảng giá', icon: Receipt },
        { path: '/admin/finance', label: 'Báo cáo tài chính', icon: BarChart3 },
        { path: '/admin/maintenance', label: 'Danh sách thiết bị', icon: Wrench },
        { path: '/admin/maintenance/notifications', label: 'Thông báo & Bảo trì', icon: Bell },
      ],
    },
    {
      groupTitle: 'AI & HỆ THỐNG',
      items: [
        { path: '/admin/ai-insights', label: 'AI Insights & Schedule', icon: Sparkles, highlight: true },
        { path: '/admin/audit-logs', label: 'Nhật ký hệ thống', icon: ScrollText },
        { path: '/admin/settings', label: 'Cấu hình hệ thống', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`
        bg-slate-900 text-slate-300 h-full shrink-0 flex flex-col
        shadow-xl border-r border-slate-800 z-50
        transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={logoImg}
            alt="Logo"
            className="w-9 h-9 object-contain rounded-xl bg-white/10 p-1 shrink-0"
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white tracking-wide truncate">Răng Hàm Mặt</h1>
              <span className="text-[10px] font-semibold text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
                Quản Trị Viên
              </span>
            </div>
          )}
        </div>

        {/* Desktop: collapse toggle — Mobile: close button */}
        <div className="flex items-center gap-1">
          {/* Mobile close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Desktop collapse */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {group.groupTitle}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={true}
                    onClick={onClose} // mobile: close drawer khi chọn menu
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                          : item.highlight
                          ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-900/60'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.highlight && (
                      <Sparkles className="w-3.5 h-3.5 ml-auto text-amber-400 animate-pulse" />
                    )}

                    {/* Tooltip khi collapsed */}
                    {collapsed && (
                      <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-slate-700">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Backdrop overlay khi popup mở: bấm vào bất kỳ đâu trên màn hình đều đóng popup */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Footer Profile Mini (Bấm vào hiển thị popup menu như ảnh 1) */}
      <div ref={profileMenuRef} className="relative shrink-0 z-50">
        {!collapsed ? (
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`
              p-3 m-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all group select-none
              ${
                showProfileMenu
                  ? 'bg-slate-800 border-sky-500/60 shadow-lg ring-1 ring-sky-500/30'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/50'
              }
            `}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-sky-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                AD
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-white truncate">Bs. Nguyễn Quản Lý</p>
                <p className="text-[10px] text-slate-400 truncate">admin@smartschedule.ai</p>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 shrink-0 ${
                showProfileMenu ? '-rotate-90 text-sky-400' : ''
              }`}
            />
          </div>
        ) : (
          <div className="p-3 flex justify-center">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center transition-colors shadow-xs"
              title="Bs. Nguyễn Quản Lý - admin@smartschedule.ai"
            >
              AD
            </button>
          </div>
        )}

        {/* Profile Popup Menu (Nổi lên trên thẻ như ảnh 1) */}
        {showProfileMenu && (
          <div
            className={`
              absolute bg-white rounded-2xl border border-slate-100 shadow-2xl py-2 text-xs animate-fadeIn text-slate-800 z-50
              ${
                collapsed
                  ? 'left-full ml-3 bottom-2 w-56'
                  : 'bottom-full mb-1 left-3 right-3'
              }
            `}
          >
            {/* Header thông tin tài khoản đồng bộ */}
            <div className="px-4 py-2.5 border-b border-slate-100">
              <p className="font-bold text-slate-900 truncate">Bs. Nguyễn Quản Lý</p>
              <p className="text-[10px] text-slate-400 truncate font-medium">Quản trị viên • admin@smartschedule.ai</p>
            </div>

            {/* Các tùy chọn menu */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/admin/settings');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-sky-600 font-medium text-left transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Hồ sơ cá nhân</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/admin/settings');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-sky-600 font-medium text-left transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Bảo mật & Quyền hạn</span>
              </button>
            </div>

            <div className="border-t border-slate-100 my-1" />

            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(false);
                navigate('/auth/login');
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-left transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
