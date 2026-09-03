import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarDays,
  Star,
  Plus,
  LayoutGrid,
  List,
  Filter,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';
import { MOCK_DOCTORS } from '../../services/mockData';
import type { DoctorStaff } from '../../types/admin';
import { StatCard } from '../../components/common/StatCard';
import { DoctorCard } from '../../components/common/DoctorCard';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ShiftModal } from './ShiftModal';
import { StaffModal } from './StaffModal';

export const StaffListPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctorsList, setDoctorsList] = useState<DoctorStaff[]>(MOCK_DOCTORS);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const filteredDoctors = doctorsList.filter((doc) => {
    if (roleFilter !== 'All' && doc.role !== roleFilter) return false;
    return true;
  });

  const handleAddStaff = (newStaff: DoctorStaff) => {
    setDoctorsList([newStaff, ...doctorsList]);
  };

  // Table Column Definitions
  const columns: Column<DoctorStaff>[] = [
    {
      header: 'BÁC SĨ / NHÂN SỰ',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{row.name}</span>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                {row.code}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'CHUYÊN KHOA & PHÒNG BAN',
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-700">{row.specialty}</p>
          <p className="text-[11px] text-slate-400">{row.department}</p>
        </div>
      ),
    },
    {
      header: 'CHI NHÁNH',
      accessorKey: 'branch',
    },
    {
      header: 'TRẠNG THÁI',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'ĐÁNH GIÁ',
      cell: (row) => (
        <div className="flex items-center text-amber-500 font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
          {row.rating}
        </div>
      ),
    },
    {
      header: 'THAO TÁC',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/staff/${row.id}`)}
            className="px-2.5 py-1 text-xs font-semibold text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
          >
            Chi tiết
          </button>
          <button
            type="button"
            onClick={() => setIsShiftModalOpen(true)}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Tạo ca
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản Lý Bác Sĩ & Nhân Sự Y Tế
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Điều hành danh sách y bác sĩ, phân công ca trực thông minh & quản lý lương thưởng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/staff/salary')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Lương thưởng
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/staff/leave')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            Đơn nghỉ phép
          </button>

          <button
            type="button"
            onClick={() => setIsShiftModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CalendarDays className="w-4 h-4 text-sky-600" />
            Tạo ca trực
          </button>

          <button
            type="button"
            onClick={() => setIsStaffModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Thêm nhân sự mới
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TỔNG NHÂN SỰ"
          value={doctorsList.length}
          subtext="Toàn hệ thống clinic"
          change="+2 nhân sự mới"
          isIncrease={true}
          icon={Users}
          iconBgColor="bg-sky-50"
          iconTextColor="text-sky-600"
        />
        <StatCard
          title="BÁC SĨ ĐANG ĐĂNG TRỰC"
          value={doctorsList.filter((d) => d.status === 'Active' || d.status === 'Busy').length}
          subtext="Ca trực hôm nay"
          change="100% đúng giờ"
          isIncrease={true}
          icon={UserCheck}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="NGHỈ PHÉP / NGHỈ CA"
          value={doctorsList.filter((d) => d.status === 'OnLeave' || d.status === 'OffDuty').length}
          subtext="Đã duyệt phê duyệt"
          icon={CalendarDays}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <StatCard
          title="ĐÁNH GIÁ HÀI LÒNG"
          value="4.88 / 5.0"
          subtext="Từ 3.400+ lượt khám"
          change="+0.12 điểm"
          isIncrease={true}
          icon={Star}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
      </div>

      {/* Filters & View Switcher Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-sky-600" />
            Lọc vai trò:
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-medium"
          >
            <option value="All">Tất cả vai trò</option>
            <option value="Doctor">Bác sĩ chuyên khoa</option>
            <option value="Nurse">Điều dưỡng viên</option>
          </select>
        </div>

        {/* Grid vs Table View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Thẻ Bác Sĩ
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Danh Sách Bảng
          </button>
        </div>
      </div>

      {/* Main Content Area: Cards or Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onViewDetail={(d) => navigate(`/admin/staff/${d.id}`)}
              onAssignShift={() => setIsShiftModalOpen(true)}
            />
          ))}
        </div>
      ) : (
        <DataTable
          data={filteredDoctors}
          columns={columns}
          searchPlaceholder="Tìm tên bác sĩ, chuyên khoa..."
          searchField="name"
        />
      )}

      {/* Modals */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
      />
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSave={handleAddStaff}
      />
    </div>
  );
};
