import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Star,
  Clock,
  Briefcase,
  User,
  Filter,
  MoreVertical,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { toast } from '../../context/ToastContext';

export interface StaffSalaryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: {
    id: string;
    code: string;
    name: string;
    role?: string;
    specialty?: string;
    avatar?: string;
    salaryBase?: number;
    allowance?: number;
    commission?: number;
    commissionRate?: number;
    kpiBonus?: number;
    rating?: number;
    totalCases?: number;
    workHours?: number;
    status?: 'approved' | 'pending';
  };
  onApproveToggle?: (staffId: string) => void;
}

interface CaseItem {
  id: string;
  date: string;
  code: string;
  patientName: string;
  service: string;
  assistant?: string;
  labo?: string;
  revenue: number;
  rate: number;
  commission: number;
  status: 'completed' | 'pending_payment';
}

const MOCK_CASES: CaseItem[] = [
  {
    id: 'c-1',
    date: '05/08/2026',
    code: '#LH-8021',
    patientName: 'Trần Thị Bé',
    service: 'Cấy ghép Implant Straumann SLA',
    assistant: 'Trợ thủ: Nguyễn N.V.',
    revenue: 43000000,
    rate: 10,
    commission: 4300000,
    status: 'completed',
  },
  {
    id: 'c-2',
    date: '08/08/2026',
    code: '#LH-8045',
    patientName: 'Lê Hoàng Nam',
    service: 'Bọc 4 răng sứ Cercon HT',
    labo: 'Labo trong nước',
    revenue: 24000000,
    rate: 15,
    commission: 3600000,
    status: 'completed',
  },
  {
    id: 'c-3',
    date: '12/08/2026',
    code: '#LH-8089',
    patientName: 'Phạm Thị Mai',
    service: 'Nhổ răng khôn mọc ngầm (R8)',
    revenue: 3500000,
    rate: 20,
    commission: 700000,
    status: 'pending_payment',
  },
  {
    id: 'c-4',
    date: '15/08/2026',
    code: '#LH-8120',
    patientName: 'Đặng Quốc Huy',
    service: 'Phục hình toàn hàm All-on-4',
    assistant: 'Trợ thủ: Lê Hoàng M.',
    revenue: 85000000,
    rate: 12,
    commission: 10200000,
    status: 'completed',
  },
  {
    id: 'c-5',
    date: '18/08/2026',
    code: '#LH-8155',
    patientName: 'Vũ Thanh Thảo',
    service: 'Dán sứ Veneer Emax (6 răng)',
    revenue: 36000000,
    rate: 15,
    commission: 5400000,
    status: 'completed',
  },
];

export const StaffSalaryDetailModal: React.FC<StaffSalaryDetailModalProps> = ({
  isOpen,
  onClose,
  staff,
  onApproveToggle,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Tháng 08/2026');
  const [currentPage, setCurrentPage] = useState(1);
  const [isApproved, setIsApproved] = useState(staff.status === 'approved');

  if (!isOpen) return null;

  const salaryBase = staff.salaryBase || 18000000;
  const commission = staff.commission || 22850000;
  const kpiBonus = staff.kpiBonus || 5000000;
  const totalIncome = salaryBase + commission + kpiBonus;
  const totalCases = staff.totalCases || 45;
  const workHours = staff.workHours || 184;

  const handleToggleApprove = () => {
    const nextApproved = !isApproved;
    setIsApproved(nextApproved);
    if (onApproveToggle) {
      onApproveToggle(staff.id);
    }
    toast(
      nextApproved
        ? `Đã duyệt bảng lương tháng cho ${staff.name}!`
        : `Đã hủy duyệt bảng lương của ${staff.name}.`,
      nextApproved ? 'success' : 'info'
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        role="dialog"
        aria-modal
      >
        <div
          className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-slate-100"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'modalSlideIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* ─── Header ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Chi Tiết Bảng Lương &amp; Báo Cáo Hoa Hồng
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Kỳ lương:</span>
                <div className="relative inline-flex items-center">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 pr-6 rounded-lg border border-sky-200 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Tháng 08/2026">Tháng 08/2026 (Hiện tại)</option>
                    <option value="Tháng 07/2026">Tháng 07/2026</option>
                    <option value="Tháng 06/2026">Tháng 06/2026</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-sky-600 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toast('Đang xuất phiếu lương định dạng PDF thành công!')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Xuất phiếu (PDF)</span>
              </button>

              <button
                type="button"
                onClick={handleToggleApprove}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer ${
                  isApproved
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isApproved ? 'ĐÃ DUYỆT LƯƠNG' : 'CHỐT BẢNG LƯƠNG'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ml-auto sm:ml-1"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ─── Scrollable Body ────────────────────────────────────────── */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {/* Staff Info & 4 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              {/* Doctor Profile Brief */}
              <div className="md:col-span-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3">
                {staff.avatar ? (
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 font-extrabold text-base flex items-center justify-center shrink-0">
                    {staff.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-extrabold text-slate-800 text-sm truncate" title={staff.name}>
                    {staff.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {staff.specialty || staff.role || 'Chuyên gia Phục hình & Implant'}
                  </div>
                </div>
              </div>

              {/* 4 Financial Stat Cards */}
              <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Tổng thu nhập ước tính */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-slate-400">
                    Tổng thu nhập ước tính
                  </div>
                  <div className="text-lg font-black text-sky-600 mt-1">
                    {totalIncome.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                {/* 2. Lương cứng cơ bản */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-slate-400">
                    Lương cứng cơ bản
                  </div>
                  <div className="text-base font-extrabold text-slate-800 mt-1">
                    {salaryBase.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                {/* 3. Tổng hoa hồng thủ thuật */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">Tổng hoa hồng</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      TB 15%
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-slate-800 mt-1">
                    {commission.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                {/* 4. Thưởng KPI & Đánh giá */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">Thưởng KPI</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ★ 4.95
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-slate-800 mt-1">
                    {kpiBonus.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Reward Pill Banner */}
            <div className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Thưởng KPI &amp; Đánh giá chất lượng dịch vụ:{' '}
                <strong className="font-extrabold">2.000.000đ</strong> (Đạt điểm hài lòng 4.95 ★ từ 128 bệnh nhân)
              </span>
            </div>

            {/* Detailed Cases Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="text-sm font-extrabold text-slate-800">
                  Bảng kê chi tiết ca điều trị hưởng hoa hồng
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">NGÀY</th>
                      <th className="py-3 px-4">MÃ LH / BỆNH NHÂN</th>
                      <th className="py-3 px-4">DỊCH VỤ KỸ THUẬT</th>
                      <th className="py-3 px-4 text-right">DOANH THU CA</th>
                      <th className="py-3 px-4 text-center">TỶ LỆ</th>
                      <th className="py-3 px-4 text-right">HOA HỒNG NHẬN</th>
                      <th className="py-3 px-4 text-center">TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_CASES.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* NGÀY */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          {item.date}
                        </td>

                        {/* MÃ LH / BỆNH NHÂN */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-extrabold text-slate-800">{item.code}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{item.patientName}</div>
                        </td>

                        {/* DỊCH VỤ KỸ THUẬT */}
                        <td className="py-3.5 px-4 min-w-[200px]">
                          <div className="font-bold text-slate-800">{item.service}</div>
                          {item.assistant && (
                            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              {item.assistant}
                            </div>
                          )}
                          {item.labo && (
                            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              {item.labo}
                            </div>
                          )}
                        </td>

                        {/* DOANH THU CA */}
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-800 whitespace-nowrap">
                          {item.revenue.toLocaleString('vi-VN')}đ
                        </td>

                        {/* TỶ LỆ */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-600 whitespace-nowrap">
                          {item.rate}%
                        </td>

                        {/* HOA HỒNG NHẬN */}
                        <td className="py-3.5 px-4 text-right font-extrabold text-sky-600 whitespace-nowrap">
                          {item.commission.toLocaleString('vi-VN')}đ
                        </td>

                        {/* TRẠNG THÁI */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {item.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Đã hoàn thành
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Chờ KH TT
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Info */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium bg-white">
                <div>Hiển thị 1-5 trên tổng {totalCases} ca điều trị</div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    &lt;
                  </button>
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                        currentPage === page
                          ? 'bg-slate-900 text-white'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Dark Navy Fixed Bottom Bar (As in Reference Image) ── */}
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0">
            {/* Left Metrics */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  TỔNG CA THỰC HIỆN
                </div>
                <div className="text-base font-extrabold text-white mt-0.5">
                  {totalCases} Ca
                </div>
              </div>

              <div className="h-8 w-px bg-slate-700 hidden sm:block" />

              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  GIỜ LÀM VIỆC
                </div>
                <div className="text-base font-extrabold text-white mt-0.5">
                  {workHours}h
                </div>
              </div>

              <div className="h-8 w-px bg-slate-700 hidden sm:block" />

              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  TRẠNG THÁI BẢNG LƯƠNG
                </div>
                <div className="text-xs font-bold mt-1 flex items-center gap-1.5">
                  {isApproved ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã phê duyệt chốt số
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Chờ kế toán duyệt
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Total Net Income */}
            <div className="bg-slate-800/90 border border-slate-700 px-4 sm:px-5 py-2.5 rounded-xl flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <div className="text-left sm:text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  TỔNG THỰC LĨNH DỰ KIẾN
                </div>
                <div className="text-lg sm:text-xl font-black text-sky-400 mt-0.5">
                  {totalIncome.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
