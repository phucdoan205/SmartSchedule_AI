import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Plane,
  Plus,
  FileSpreadsheet,
  Star,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  Search,
} from 'lucide-react';
import { MOCK_DOCTORS } from '../../services/mockData';
import type { DoctorStaff } from '../../types/admin';
import { ShiftModal } from './ShiftModal';
import { StaffModal } from './StaffModal';

export const StaffListPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctorsList, setDoctorsList] = useState<DoctorStaff[]>(MOCK_DOCTORS);
  const [roleFilter, setRoleFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('Chi nhánh Biên Hòa');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [selectedStaffIdForShift, setSelectedStaffIdForShift] = useState<string | undefined>(undefined);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Filter staff list
  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
      // Role filter
      if (roleFilter !== 'All') {
        if (roleFilter === 'Doctor' && doc.role !== 'Doctor') return false;
        if (roleFilter === 'Nurse' && doc.role !== 'Nurse') return false;
        if (roleFilter === 'Receptionist' && doc.role !== 'Receptionist') return false;
      }
      // Branch filter
      if (branchFilter !== 'All' && doc.branch !== branchFilter) {
        // allow matching if 'All' or specific
      }
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(query);
        const matchCode = doc.code.toLowerCase().includes(query);
        const matchPhone = doc.phone.toLowerCase().includes(query);
        const matchSpecialty = doc.specialty.toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchPhone && !matchSpecialty) return false;
      }
      return true;
    });
  }, [doctorsList, roleFilter, branchFilter, searchTerm]);

  const handleAddStaff = (newStaff: DoctorStaff) => {
    setDoctorsList([newStaff, ...doctorsList]);
  };

  const handleExportExcel = () => {
    // Generate CSV export
    const headers = ['Mã NV,Họ và tên,Chức vụ & Chuyên khoa,Số điện thoại,Tỷ lệ hoa hồng,Đánh giá,Lượt khám,Trạng thái\n'];
    const rows = filteredDoctors.map(
      (d) =>
        `"${d.code}","${d.name}","${d.specialty}","${d.phone}","${d.commissionRate || 15}%","${d.rating}","${d.totalAppointments}","${d.status === 'Active' ? 'Đang hoạt động' : 'Nghỉ phép'}"`
    );
    const blob = new Blob([headers.join('') + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Danh_sach_bac_si_nhan_su.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenCreateShift = (staffId: string) => {
    setSelectedStaffIdForShift(staffId);
    setIsShiftModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Badge, Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-block">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              ĐANG ĐĂNG NHẬP: BÁC SĨ ĐIỀU TRỊ
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Danh sách Bác sĩ & Nhân sự
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsStaffModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm bác sĩ & nhân sự mới</span>
        </button>
      </div>

      {/* 3 KPI Summary Cards matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Tổng số nhân sự */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">Tổng số nhân sự</p>
              <h3 className="text-2xl font-black text-slate-900">24 nhân viên</h3>
              <div className="flex items-center gap-3 pt-2 text-xs font-medium text-slate-500">
                <span><strong className="text-slate-700">10</strong> Bác sĩ</span>
                <span><strong className="text-slate-700">8</strong> Phụ tá</span>
                <span><strong className="text-slate-700">6</strong> Lễ tân</span>
              </div>
            </div>
            <div className="text-slate-200">
              <Users className="w-12 h-12 stroke-1" />
            </div>
          </div>
        </div>

        {/* Card 2: Đang trong ca trực hôm nay */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 border-l-4 border-l-emerald-500 bg-white p-5 shadow-xs transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-500">Đang trong ca trực hôm nay</p>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">18 người</h3>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin/staff/schedule')}
                  className="text-xs font-medium text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  Xem danh sách trực
                </button>
              </div>
            </div>
            <div className="text-slate-200">
              <CalendarCheck className="w-12 h-12 stroke-1" />
            </div>
          </div>
        </div>

        {/* Card 3: Đang nghỉ phép */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 border-l-4 border-l-amber-500 bg-white p-5 shadow-xs transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">Đang nghỉ phép</p>
              <h3 className="text-2xl font-black text-slate-900">2 người</h3>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin/staff/leave')}
                  className="text-xs font-medium text-slate-500 hover:text-amber-700 transition-colors cursor-pointer"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
            <div className="text-slate-200">
              <Plane className="w-12 h-12 stroke-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Export Bar matching Image 1 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Chức danh filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 pr-8 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs transition-all"
            >
              <option value="All">Tất cả chức danh</option>
              <option value="Doctor">Bác sĩ chuyên khoa</option>
              <option value="Nurse">Phụ tá / Điều dưỡng</option>
              <option value="Receptionist">Lễ tân</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Chi nhánh filter */}
          <div className="relative">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 pr-8 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs transition-all"
            >
              <option value="Chi nhánh Biên Hòa">Chi nhánh Biên Hòa</option>
              <option value="Cơ sở Quận 1">Cơ sở Quận 1</option>
              <option value="Cơ sở Thủ Đức">Cơ sở Thủ Đức</option>
              <option value="Cơ sở Phú Mỹ Hưng">Cơ sở Phú Mỹ Hưng</option>
              <option value="All">Tất cả chi nhánh</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Quick search input */}
          <div className="relative hidden md:flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân sự..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 pl-8.5 pr-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-sky-500 focus:bg-white transition-all w-52"
            />
          </div>
        </div>

        {/* Nút Xuất Excel */}
        <button
          type="button"
          onClick={handleExportExcel}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* Main Staff Data Table matching Image 1 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">MÃ NV</th>
                <th className="px-5 py-3.5">Họ và tên</th>
                <th className="px-5 py-3.5">Chức vụ & Chuyên khoa</th>
                <th className="px-5 py-3.5">Số điện thoại</th>
                <th className="px-5 py-3.5">Tỷ lệ hoa hồng</th>
                <th className="px-5 py-3.5">Đánh giá trung bình</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-center">Thao tác</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Mã NV */}
                  <td className="px-5 py-3.5 font-semibold text-slate-600 whitespace-nowrap">
                    {doc.code}
                  </td>

                  {/* Họ và tên */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {doc.initials ? (
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center border border-sky-200/60 shrink-0">
                          {doc.initials}
                        </div>
                      ) : (
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <span className="font-bold text-slate-900 block leading-snug">
                          {doc.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Chức vụ & Chuyên khoa */}
                  <td className="px-5 py-3.5 font-medium text-slate-600">
                    {doc.specialty}
                  </td>

                  {/* Số điện thoại */}
                  <td className="px-5 py-3.5 font-medium text-slate-600 whitespace-nowrap">
                    {doc.phone}
                  </td>

                  {/* Tỷ lệ hoa hồng */}
                  <td className="px-5 py-3.5 font-bold text-slate-700">
                    {doc.commissionRate ?? 15}%
                  </td>

                  {/* Đánh giá trung bình */}
                  <td className="px-5 py-3.5">
                    {doc.role === 'Receptionist' || doc.rating === 0 ? (
                      <span className="text-slate-400 italic">Không áp dụng</span>
                    ) : (
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <span className="font-bold">{doc.rating}</span>
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400 inline" />
                        <span className="text-slate-500 font-normal">
                          - {doc.totalAppointments} lượt khám
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {doc.status === 'Active' || doc.status === 'Busy' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-2xs bg-emerald-500"></span>
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Nghỉ phép
                      </span>
                    )}
                  </td>

                  {/* Thao tác (Xem chi tiết & Tạo ca) */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/staff/${doc.id}`)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCreateShift(doc.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer active:scale-95"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tạo ca</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination matching Image 1 */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <p className="text-slate-500 font-medium">
            Hiển thị 1-8 trong 24 kết quả
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                currentPage === 1
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              1
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                currentPage === 2
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              2
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(3)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                currentPage === 3
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              3
            </button>

            <button
              type="button"
              disabled={currentPage === 3}
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Shift Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        initialStaffId={selectedStaffIdForShift}
      />

      {/* Staff Modal */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSave={handleAddStaff}
      />
    </div>
  );
};
