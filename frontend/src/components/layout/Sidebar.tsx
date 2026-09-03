import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
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
      className={`bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col transition-all duration-300 z-30 shadow-xl border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center gap-3">
        <img
          src={logoImg}
          alt="Logo"
          className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1"
        />
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">Răng Hàm Mặt</h1>
            <span className="text-[10px] font-semibold text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
              Quản Trị Viên
            </span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {group.groupTitle}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={true}
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
                      <Sparkles className="w-3.5 h-3.5 ml-auto text-amber-400 ai-glow" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile Mini */}
      {!collapsed && (
        <div className="p-3 m-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white truncate">Quản trị viên</p>
              <p className="text-[10px] text-slate-400">admin@smartschedule.ai</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      )}
    </aside>
  );
};
