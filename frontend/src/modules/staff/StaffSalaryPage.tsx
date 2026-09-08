import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Download,
  CreditCard,
  TrendingUp,
  Calendar,
  ChevronDown,
  Sparkles,
  Search,
  Eye,
  CheckCheck,
  Sliders,
  MoreHorizontal,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Mail,
  RotateCcw,
  Star,
  Wallet,
} from 'lucide-react';
import { MOCK_DOCTORS } from '../../services/mockData';
import { StaffSalaryDetailModal } from './StaffSalaryDetailModal';
import { SalaryAdjustmentModal, type SalaryAdjustmentData } from './SalaryAdjustmentModal';

interface StaffSalaryRecord {
  id: string;
  code: string;
  name: string;
  avatar: string;
  role: string;
  specialty: string;
  department: string;
  salaryBase: number;
  allowance: number;
  caseCountInfo: string;
  commission: number;
  commissionRate: number;
  kpiBonus: number;
  rating: number;
  totalAppointments: number;
  totalCases: number;
  workHours: number;
  status: 'approved' | 'pending';
}

export const StaffSalaryPage: React.FC = () => {
  const navigate = useNavigate();

  // Initial enriched salary records matching "giao diện trang quản lí lương thưởng.png"
  const [salaryRecords, setSalaryRecords] = useState<StaffSalaryRecord[]>([
    {
      id: 'nv-001',
      code: 'NV001',
      name: 'BS.CKI Nguyễn Văn Tuấn',
      avatar: MOCK_DOCTORS[0]?.avatar,
      role: 'Bác sĩ',
      specialty: 'Trưởng khoa Implant',
      department: 'Khoa Implant',
      salaryBase: 25000000,
      allowance: 5000000,
      caseCountInfo: '18 ca Implant',
      commission: 36000000,
      commissionRate: 20,
      kpiBonus: 5000000,
      rating: 4.95,
      totalAppointments: 128,
      totalCases: 45,
      workHours: 184,
      status: 'approved',
    },
    {
      id: 'nv-002',
      code: 'NV002',
      name: 'BS. Nguyễn Thị An',
      avatar: MOCK_DOCTORS[1]?.avatar,
      role: 'Bác sĩ',
      specialty: 'Phục hình Răng sứ',
      department: 'Khoa Phục Hình',
      salaryBase: 20000000,
      allowance: 4000000,
      caseCountInfo: '24 ca Sứ Cercon',
      commission: 28800000,
      commissionRate: 15,
      kpiBonus: 3500000,
      rating: 4.9,
      totalAppointments: 110,
      totalCases: 38,
      workHours: 176,
      status: 'approved',
    },
    {
      id: 'nv-003',
      code: 'NV003',
      name: 'PT. Lê Văn Bình',
      avatar: MOCK_DOCTORS[2]?.avatar || MOCK_DOCTORS[0]?.avatar,
      role: 'Phụ tá',
      specialty: 'Vô trùng & Phụ mổ',
      department: 'Phụ tá & Khử trùng',
      salaryBase: 9000000,
      allowance: 2000000,
      caseCountInfo: '42 ca phụ mổ',
      commission: 4200000,
      commissionRate: 5,
      kpiBonus: 1000000,
      rating: 4.8,
      totalAppointments: 140,
      totalCases: 42,
      workHours: 190,
      status: 'pending',
    },
    {
      id: 'nv-004',
      code: 'NV004',
      name: 'BS. Trần Đức Cường',
      avatar: MOCK_DOCTORS[0]?.avatar,
      role: 'Bác sĩ',
      specialty: 'Chỉnh Nha - Niềng Răng',
      department: 'Khoa Chỉnh Nha',
      salaryBase: 22000000,
      allowance: 4500000,
      caseCountInfo: '30 ca Chỉnh nha',
      commission: 21000000,
      commissionRate: 15,
      kpiBonus: 3000000,
      rating: 4.85,
      totalAppointments: 95,
      totalCases: 30,
      workHours: 168,
      status: 'approved',
    },
    {
      id: 'nv-005',
      code: 'NV005',
      name: 'PT. Hoàng Minh Anh',
      avatar: MOCK_DOCTORS[1]?.avatar,
      role: 'Phụ tá',
      specialty: 'Phụ tá Chỉnh nha & CSKH',
      department: 'Phụ tá & Khử trùng',
      salaryBase: 8500000,
      allowance: 1500000,
      caseCountInfo: '35 ca hỗ trợ',
      commission: 3500000,
      commissionRate: 5,
      kpiBonus: 800000,
      rating: 4.75,
      totalAppointments: 88,
      totalCases: 35,
      workHours: 172,
      status: 'pending',
    },
  ]);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'doctor' | 'assistant'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Tháng 08/2026');

  // Modals state
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<StaffSalaryRecord | null>(null);
  const [selectedStaffForAdjustment, setSelectedStaffForAdjustment] = useState<StaffSalaryRecord | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Filtered staff records
  const filteredRecords = useMemo(() => {
    return salaryRecords.filter((rec) => {
      const matchSearch =
        rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTab =
        activeTab === 'all'
          ? true
          : activeTab === 'doctor'
          ? rec.role === 'Bác sĩ'
          : rec.role === 'Phụ tá';

      return matchSearch && matchTab;
    });
  }, [salaryRecords, searchQuery, activeTab]);

  // Totals
  const totalPayroll = useMemo(() => {
    return salaryRecords.reduce(
      (acc, d) => acc + d.salaryBase + d.allowance + d.commission + d.kpiBonus,
      0
    );
  }, [salaryRecords]);

  const totalCommissions = useMemo(() => {
    return salaryRecords.reduce((acc, d) => acc + d.commission, 0);
  }, [salaryRecords]);

  const totalKpiBonus = useMemo(() => {
    return salaryRecords.reduce((acc, d) => acc + d.kpiBonus, 0);
  }, [salaryRecords]);

  // Toggle approval ("Oke lương thưởng")
  const handleToggleApproval = (staffId: string) => {
    setSalaryRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === staffId) {
          const nextStatus = rec.status === 'approved' ? 'pending' : 'approved';
          showToast(
            nextStatus === 'approved'
              ? `✓ Đã phê duyệt và chốt số lương cho ${rec.name}!`
              : `Đã mở lại trạng thái chờ duyệt cho ${rec.name}!`
          );
          return { ...rec, status: nextStatus };
        }
        return rec;
      })
    );
  };

  // Batch approve all
  const handleBatchApprove = () => {
    setSalaryRecords((prev) =>
      prev.map((rec) => ({ ...rec, status: 'approved' }))
    );
    showToast('✓ Đã phê duyệt chốt toàn bộ bảng lương tháng thành công!');
  };

  // Save adjustment
  const handleSaveAdjustment = (data: SalaryAdjustmentData) => {
    setSalaryRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === data.staffId) {
          const delta =
            data.type === 'bonus' || data.type === 'allowance'
              ? data.amount
              : -data.amount;

          showToast(
            `Đã điều chỉnh ${delta > 0 ? '+' : ''}${delta.toLocaleString('vi-VN')}đ cho ${rec.name}!`
          );

          if (data.type === 'bonus') {
            return { ...rec, kpiBonus: Math.max(0, rec.kpiBonus + delta) };
          } else {
            return { ...rec, allowance: Math.max(0, rec.allowance + delta) };
          }
        }
        return rec;
      })
    );
  };

  return (
    <div className="space-y-5 pb-8 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/admin/staff')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Bác sĩ &amp; Nhân sự
      </button>

      {/* ─── Header: Matching "giao diện trang quản lí lương thưởng.png" ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Bảng Tổng Hợp Lương &amp; Hoa Hồng Thủ Thuật
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Tự động tính toán lương cứng, hoa hồng theo ca điều trị (Implant, Răng sứ) và thưởng KPI chất lượng.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Kỳ lương:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="font-bold text-sky-600 bg-transparent focus:outline-none cursor-pointer"
            >
              <option>Tháng 08/2026</option>
              <option>Tháng 07/2026</option>
              <option>Tháng 06/2026</option>
            </select>
          </div>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={() => showToast('Đang tạo và tải xuống bảng lương Excel/PDF...')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất phiếu lương (Excel/PDF)</span>
          </button>

          {/* Batch Approve Button */}
          <button
            type="button"
            onClick={handleBatchApprove}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chốt bảng lương tháng</span>
          </button>
        </div>
      </div>

      {/* ─── 3 KPI Statistic Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Tổng quỹ lương tháng này */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              TỔNG QUỸ LƯƠNG THÁNG NÀY
            </span>
            <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-slate-900">
              {totalPayroll.toLocaleString('vi-VN')}đ
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> +5.2% so với tháng trước
            </span>
          </div>
        </div>

        {/* 2. Tổng hoa hồng thủ thuật phát sinh */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              TỔNG HOA HỒNG THỦ THUẬT PHÁT SINH
            </span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-emerald-600">
              {totalCommissions.toLocaleString('vi-VN')}đ
            </h3>
            <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">
              Dựa trên 3.490 lượt khám &amp; thủ thuật hoàn tất
            </span>
          </div>
        </div>

        {/* 3. Thưởng KPI & Tỷ lệ đánh giá 5★ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              THƯỞNG KPI &amp; TỶ LỆ ĐÁNH GIÁ 5★
            </span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-slate-900">
              {totalKpiBonus.toLocaleString('vi-VN')}đ
            </h3>
            <span className="text-[11px] text-amber-600 font-bold mt-1.5 flex items-center gap-1">
              ★ 98.6% tỷ lệ hài lòng bệnh nhân
            </span>
          </div>
        </div>
      </div>

      {/* ─── AI Insight Banner ────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl border border-sky-100 bg-sky-50/60 flex items-center gap-3 text-xs text-sky-900">
        <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-extrabold text-sky-950">Trợ lý AI Phân Tích Hiệu Suất:</span>{' '}
          Bác sĩ Tuấn và Bác sĩ An đóng góp 62% tổng doanh thu thủ thuật toàn viện. Khuyến nghị áp dụng thưởng vượt định mức cho ca phục hình sứ Cercon tháng này.
        </div>
      </div>

      {/* ─── Data Section: Tabs, Search & Table ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả nhân sự ({salaryRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('doctor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'doctor'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bác sĩ chuyên khoa ({salaryRecords.filter((s) => s.role === 'Bác sĩ').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'assistant'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Phụ tá ({salaryRecords.filter((s) => s.role === 'Phụ tá').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bác sĩ, mã NV..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-sky-400 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Main Salary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-extrabold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 w-20">Mã NV</th>
                <th className="py-3 px-4">Nhân sự</th>
                <th className="py-3 px-4 text-right">Lương cứng</th>
                <th className="py-3 px-4">Chi tiết ca</th>
                <th className="py-3 px-4 text-right">Hoa hồng (%)</th>
                <th className="py-3 px-4 text-right">Thưởng KPI</th>
                <th className="py-3 px-4 text-right">Tổng thực lĩnh</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                {/* ── CỘT THAO TÁC (Action Column) ── */}
                <th className="py-3 px-4 text-center w-36 bg-slate-100/50 font-black text-slate-700">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((row) => {
                const total = row.salaryBase + row.allowance + row.commission + row.kpiBonus;
                const isApproved = row.status === 'approved';

                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Mã NV */}
                    <td className="py-3.5 px-4 font-bold text-slate-500">
                      {row.code}
                    </td>

                    {/* Nhân sự */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.avatar}
                          alt={row.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p
                            className="font-extrabold text-slate-800 text-xs hover:text-sky-600 cursor-pointer truncate"
                            onClick={() => setSelectedStaffForDetail(row)}
                            title="Xem chi tiết bảng lương"
                          >
                            {row.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium truncate">
                            {row.specialty}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Lương cứng */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-700 whitespace-nowrap">
                      {row.salaryBase.toLocaleString('vi-VN')}đ
                    </td>

                    {/* Chi tiết ca */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {row.caseCountInfo}
                      </span>
                    </td>

                    {/* Hoa hồng (%) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-extrabold text-emerald-600">
                        {row.commission.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        ({row.commissionRate}%)
                      </div>
                    </td>

                    {/* Thưởng KPI */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800 whitespace-nowrap">
                      {row.kpiBonus.toLocaleString('vi-VN')}đ
                    </td>

                    {/* Tổng thực lĩnh */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-black text-slate-900 text-sm">
                        {total.toLocaleString('vi-VN')}đ
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Đã phê duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Chờ chốt công
                        </span>
                      )}
                    </td>

                    {/* ── CỘT THAO TÁC (Action Column Buttons) ── */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap bg-slate-50/30">
                      <div className="flex items-center justify-center gap-1">
                        {/* 1. Xem chi tiết */}
                        <button
                          type="button"
                          onClick={() => setSelectedStaffForDetail(row)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-colors shadow-2xs cursor-pointer"
                          title="Xem chi tiết ca điều trị & hoa hồng"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. Oke lương thưởng / Duyệt chốt nhanh */}
                        <button
                          type="button"
                          onClick={() => handleToggleApproval(row.id)}
                          className={`p-1.5 rounded-lg border transition-colors shadow-2xs cursor-pointer ${
                            isApproved
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                              : 'border-slate-200 bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                          }`}
                          title={isApproved ? 'Đã duyệt (Bấm để hủy duyệt)' : 'Duyệt & Oke lương nhân sự'}
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. Điều chỉnh thưởng / phạt */}
                        <button
                          type="button"
                          onClick={() => setSelectedStaffForAdjustment(row)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-amber-600 hover:border-amber-300 transition-colors shadow-2xs cursor-pointer"
                          title="Điều chỉnh thưởng nóng / phạt vi phạm"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium bg-slate-50/50">
          <div>Hiển thị {filteredRecords.length} trong số {salaryRecords.length} nhân sự</div>
          <div className="flex items-center gap-1.5">
            <button type="button" className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold">
              Trước
            </button>
            <button type="button" className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs">
              1
            </button>
            <button type="button" className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* ─── Detail Modal (Chi Tiết Lương Thưởng) ────────────────────────── */}
      {selectedStaffForDetail && (
        <StaffSalaryDetailModal
          isOpen={!!selectedStaffForDetail}
          onClose={() => setSelectedStaffForDetail(null)}
          staff={selectedStaffForDetail}
          onApproveToggle={handleToggleApproval}
        />
      )}

      {/* ─── Adjustment Modal (Điều Chỉnh Thưởng Phạt) ───────────────────── */}
      {selectedStaffForAdjustment && (
        <SalaryAdjustmentModal
          isOpen={!!selectedStaffForAdjustment}
          onClose={() => setSelectedStaffForAdjustment(null)}
          staff={selectedStaffForAdjustment}
          onSave={handleSaveAdjustment}
        />
      )}
    </div>
  );
};
