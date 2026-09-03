import React, { useState } from 'react';
import { ScrollText, ShieldCheck, Filter, Download, Search, Calendar, User, Laptop } from 'lucide-react';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Tabs, type TabItem } from '../../components/common/Tabs';
import type { SystemAuditLog } from '../../types/admin';

export const AuditLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const tabs: TabItem[] = [
    { id: 'all', label: 'Tất Cả Nhật Ký' },
    { id: 'appointments', label: 'Lịch Hẹn & Ca Khám' },
    { id: 'medical_records', label: 'Hồ Sơ & Bệnh Án' },
    { id: 'finance', label: 'Tài Chính & Thu Chi' },
    { id: 'staff_auth', label: 'Bác Sĩ & Phân Quyền' },
  ];

  const mockLogs: SystemAuditLog[] = [
    {
      id: 'LOG-8801',
      timestamp: '2026-09-03 14:20:15',
      user: 'BS. TS. Nguyễn Minh Anh',
      action: 'Cập nhật hồ sơ bệnh án & sơ đồ răng R26',
      module: 'medical_records',
      ipAddress: '192.168.1.45',
      status: 'Success',
    },
    {
      id: 'LOG-8802',
      timestamp: '2026-09-03 13:55:00',
      user: 'Thu ngân Lê Thị Mai',
      action: 'Lập phiếu thu 2.500.000 VNĐ cho bệnh nhân BN-889021',
      module: 'finance',
      ipAddress: '192.168.1.12',
      status: 'Success',
    },
    {
      id: 'LOG-8803',
      timestamp: '2026-09-03 12:10:30',
      user: 'Hệ thống SmartSchedule AI Engine',
      action: 'Tự động sắp xếp 15 ca hẹn khung giờ 14:00',
      module: 'appointments',
      ipAddress: '127.0.0.1 (Local AI Core)',
      status: 'Success',
    },
    {
      id: 'LOG-8804',
      timestamp: '2026-09-03 10:45:22',
      user: 'Quản trị viên Admin Root',
      action: 'Cập nhật phân quyền tài khoản Bác sĩ Trần Thị Thu Hương',
      module: 'staff_auth',
      ipAddress: '192.168.1.1',
      status: 'Success',
    },
    {
      id: 'LOG-8805',
      timestamp: '2026-09-03 09:30:18',
      user: 'Lễ tân Phạm Hoàng Yến',
      action: 'Đổi lịch hẹn từ 10:00 sang 15:30 cho bệnh nhân Nguyễn Văn An',
      module: 'appointments',
      ipAddress: '192.168.1.18',
      status: 'Success',
    },
    {
      id: 'LOG-8806',
      timestamp: '2026-09-03 08:15:05',
      user: 'Tài khoản vô danh (Khách)',
      action: 'Thử đăng nhập sai mật khẩu 3 lần',
      module: 'staff_auth',
      ipAddress: '113.161.45.99',
      status: 'Error',
    },
  ];

  const filteredLogs = mockLogs.filter((log) => {
    if (activeTab !== 'all' && log.module !== activeTab) return false;
    return true;
  });

  const columns: Column<SystemAuditLog>[] = [
    {
      header: 'MÃ LOG / THỜI GIAN',
      cell: (row) => (
        <div>
          <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-[11px]">
            {row.id}
          </span>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">{row.timestamp}</p>
        </div>
      ),
    },
    {
      header: 'NGƯỜI DÙNG / TÀI KHOẢN',
      cell: (row) => (
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" /> {row.user}
        </span>
      ),
    },
    {
      header: 'HÀNH ĐỘNG THỰC HIỆN',
      cell: (row) => <span className="font-medium text-slate-700">{row.action}</span>,
    },
    {
      header: 'PHÂN LOẠI MÔ-ĐUN',
      cell: (row) => (
        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 uppercase">
          {row.module}
        </span>
      ),
    },
    {
      header: 'TRẠNG THÁI',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-indigo-600" /> Nhật Ký Truy Cập & Thao Tác Hệ Thống (Audit Logs)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi lại toàn bộ lịch sử thao tác của bác sĩ, nhân viên, thay đổi bệnh án & tiến trình AI
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Đã xuất file log nhật ký hệ thống (.CSV)!')}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4 text-sky-600" /> Xuất File Nhật Ký Log
        </button>
      </div>

      {/* Tabs Switcher & Time Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log Data Table */}
      <DataTable
        data={filteredLogs}
        columns={columns}
        searchPlaceholder="Tìm theo Mã log, tên người dùng, địa chỉ IP hoặc hành động..."
      />
    </div>
  );
};
