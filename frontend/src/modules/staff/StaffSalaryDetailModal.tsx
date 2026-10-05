import React, { useState, useEffect, useMemo } from 'react';
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
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { toast } from '../../context/ToastContext';
import { appointmentApi, staffApi } from '../../services/api';
import { exportToExcel } from '../../utils/excelExport';

export interface StaffSalaryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: {
    id: string;
    code: string;
    name: string;
    role?: string;
    specialty?: string;
    department?: string;
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

interface ShiftAttendanceItem {
  id: string;
  date: string;
  dayOfWeek: string;
  shiftName: string;
  workingHours: string;
  duty: string;
  hours: number;
  status: 'completed' | 'leave';
}

export const StaffSalaryDetailModal: React.FC<StaffSalaryDetailModalProps> = ({
  isOpen,
  onClose,
  staff,
  onApproveToggle,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Tháng 10/2026');
  const [currentPage, setCurrentPage] = useState(1);
  const [isApproved, setIsApproved] = useState(staff.status === 'approved');
  const [realCases, setRealCases] = useState<CaseItem[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  useEffect(() => {
    setIsApproved(staff.status === 'approved');
  }, [staff.status]);

  const isClinical = useMemo(() => {
    const r = (staff.role || '').toLowerCase();
    const name = (staff.name || '').toLowerCase();
    return (
      r.includes('bác sĩ') ||
      name.startsWith('bs.') ||
      name.startsWith('ts.bs.') ||
      name.startsWith('th.s') ||
      name.startsWith('bs.cki')
    );
  }, [staff.role, staff.name]);

  const isAccountant = useMemo(() => {
    const r = (staff.role || '').toLowerCase();
    const name = (staff.name || '').toLowerCase();
    return r.includes('kế toán') || name.includes('dinh');
  }, [staff.role, staff.name]);

  // Load real appointments if clinical doctor
  useEffect(() => {
    if (!isOpen) return;

    const loadTreatments = async () => {
      try {
        setIsLoadingCases(true);
        const res = await appointmentApi.getAppointments();
        const allAppts = Array.isArray(res) ? res : res?.data || [];

        // Filter for this doctor
        const matched = allAppts.filter((a: any) => {
          const docId = a.doctorId || a.doctor?.id;
          const docCode = a.doctor?.employeeCode || a.doctor?.code;
          const docName = a.doctor?.fullName || a.doctor?.name;
          return (
            docId === staff.id ||
            docCode === staff.code ||
            (docName && docName.toLowerCase() === staff.name.toLowerCase())
          );
        });

        const activeRate = staff.commissionRate || (staff.code === 'NV002' ? 20 : 15);

        if (matched.length > 0) {
          const formatted: CaseItem[] = matched.map((a: any, idx: number) => {
            const srv = a.services?.[0]?.service;
            const rev = Number(srv?.standardPrice ?? srv?.price ?? 5500000);
            const rawDate = a.startTime ? new Date(a.startTime) : new Date();
            const dateStr = `${String(rawDate.getDate()).padStart(2, '0')}/${String(
              rawDate.getMonth() + 1
            ).padStart(2, '0')}/${rawDate.getFullYear()}`;

            const comm = Math.round((rev * activeRate) / 100);

            return {
              id: a.id || `c-${idx}`,
              date: dateStr,
              code: a.appointmentCode || `#LH-2026-${String(845 - idx).padStart(3, '0')}`,
              patientName: a.patient?.fullName || 'Bệnh nhân',
              service: srv?.name || a.notes || 'Khám & Phục hình chuyên sâu',
              revenue: rev,
              rate: activeRate,
              commission: comm,
              status: 'completed',
            };
          });
          setRealCases(formatted);
        } else {
          // If no appointments recorded yet in DB for this doctor, provide standard clinical sample
          const samplePrices = [8000000, 5500000, 18000000, 5500000, 8000000];
          const sampleServices = [
            'Mặt Dán Sứ Veneer Emax Siêu Mỏng',
            'Tẩy Trắng Răng Chuyên Sâu Laser Whitening',
            'Cấy ghép Trụ Implant Straumann SLA',
            'Bọc Răng Sứ Toàn Phần Cercon HT',
            'Phục hình răng sứ thẩm mỹ Emax',
          ];
          const samplePatients = [
            'Trần Minh Tâm',
            'Lê Trần Tiến Luật',
            'Đoàn Văn Phúc',
            'Nguyễn Thị Hồng',
            'Phạm Hữu Nghĩa',
          ];

          const generated: CaseItem[] = sampleServices.map((srv, idx) => {
            const rev = samplePrices[idx];
            const comm = Math.round((rev * activeRate) / 100);
            return {
              id: `gen-${idx}`,
              date: `${String(12 + idx * 3).padStart(2, '0')}/10/2026`,
              code: `#LH-2026-${String(900 + idx)}`,
              patientName: samplePatients[idx],
              service: srv,
              revenue: rev,
              rate: activeRate,
              commission: comm,
              status: 'completed',
            };
          });
          setRealCases(generated);
        }
      } catch (err) {
        console.warn('Lỗi khi tải chi tiết lịch hẹn:', err);
      } finally {
        setIsLoadingCases(false);
      }
    };

    if (isClinical) {
      loadTreatments();
    }
  }, [isOpen, staff.id, staff.code, staff.commissionRate, isClinical]);

  // Attendance log for non-clinical staff
  const attendanceLogs: ShiftAttendanceItem[] = useMemo(() => {
    const days = [
      { d: '04/10/2026', dow: 'Chủ Nhật', shift: 'Ca Sáng (08:00 - 12:00)', h: 4 },
      { d: '03/10/2026', dow: 'Thứ 7', shift: 'Ca Cả Ngày (08:00 - 17:30)', h: 8 },
      { d: '02/10/2026', dow: 'Thứ 6', shift: 'Ca Cả Ngày (08:00 - 17:30)', h: 8 },
      { d: '01/10/2026', dow: 'Thứ 5', shift: 'Ca Cả Ngày (08:00 - 17:30)', h: 8 },
      { d: '30/09/2026', dow: 'Thứ 4', shift: 'Ca Cả Ngày (08:00 - 17:30)', h: 8 },
      { d: '29/09/2026', dow: 'Thứ 3', shift: 'Ca Cả Ngày (08:00 - 17:30)', h: 8 },
      { d: '28/09/2026', dow: 'Thứ 2', shift: 'Ca Cả Ngày (08:00 - 17:30)', h: 8 },
      { d: '26/09/2026', dow: 'Thứ 7', shift: 'Ca Cả Ngày (08:00 - 17:30)', h: 8 },
      { d: '25/09/2026', dow: 'Thứ 6', shift: 'Ca Cả Ngày (08:00 - 17:30)', h: 8 },
      { d: '24/09/2026', dow: 'Thứ 5', shift: 'Ca Cả Ngày (08:00 - 17:30)', h: 8 },
    ];

    const dutyName = isAccountant
      ? 'Quyết toán viện phí & Lập bảng lương'
      : (staff.role || 'Vận hành phòng khám');

    return days.map((item, idx) => ({
      id: `att-${idx}`,
      date: item.d,
      dayOfWeek: item.dow,
      shiftName: item.shift,
      workingHours: '08:00 - 17:30',
      duty: dutyName,
      hours: item.h,
      status: 'completed',
    }));
  }, [isAccountant, staff.role]);

  if (!isOpen) return null;

  const salaryBase = staff.salaryBase || (isAccountant ? 18000000 : 15000000);
  const allowance = staff.allowance || (isAccountant ? 3000000 : 2500000);
  const kpiBonus = staff.kpiBonus || (isAccountant ? 2000000 : 3500000);

  // If clinical: commission calculated from cases or passed
  const calculatedCommission = isClinical
    ? realCases.reduce((acc, c) => acc + c.commission, 0) || (staff.commission || 0)
    : 0;

  const insuranceDeduction = Math.round(salaryBase * 0.08); // 8% BHXH/BHYT
  const totalNet = salaryBase + allowance + calculatedCommission + kpiBonus - (isClinical ? 0 : insuranceDeduction);
  const totalCases = isClinical ? realCases.length : 24;
  const workHours = staff.workHours || (isClinical ? 176 : 192);

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

  const handleExportSlipExcel = () => {
    if (isClinical) {
      const data = realCases.map((c) => ({
        'Ngày thực hiện': c.date,
        'Mã ca khám': c.code,
        'Bệnh nhân': c.patientName,
        'Dịch vụ kỹ thuật': c.service,
        'Doanh thu ca (VNĐ)': c.revenue,
        'Tỷ lệ hoa hồng (%)': `${c.rate}%`,
        'Hoa hồng nhận (VNĐ)': c.commission,
        'Trạng thái': 'Đã hoàn thành',
      }));
      exportToExcel(data, `Phieu_Luong_${staff.code}_${staff.name.replace(/\s+/g, '_')}`, 'Chi tiết hoa hồng');
    } else {
      const data = attendanceLogs.map((a) => ({
        'Ngày': a.date,
        'Thứ': a.dayOfWeek,
        'Ca làm việc': a.shiftName,
        'Nhiệm vụ': a.duty,
        'Số giờ': a.hours,
        'Trạng thái': 'Đã hoàn thành',
      }));
      exportToExcel(data, `Bang_Cham_Cong_${staff.code}_${staff.name.replace(/\s+/g, '_')}`, 'Chấm công');
    }
    toast('Đã xuất phiếu lương thành công sang định dạng Excel!');
  };

  // Pagination for table (10 items per page)
  const itemsPerPage = 10;
  const listToPaginate = isClinical ? realCases : attendanceLogs;
  const totalPages = Math.ceil(listToPaginate.length / itemsPerPage) || 1;
  const paginatedItems = listToPaginate.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                Chi Tiết Bảng Lương &amp; Thu Nhập Nhân Sự
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
                    <option value="Tháng 10/2026">Tháng 10/2026 (Hiện tại)</option>
                    <option value="Tháng 09/2026">Tháng 09/2026</option>
                    <option value="Tháng 08/2026">Tháng 08/2026</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-sky-600 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportSlipExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Xuất phiếu (Excel)</span>
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
              {/* Profile Brief */}
              <div className="md:col-span-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3">
                {staff.avatar ? (
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center shrink-0">
                    {staff.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-sm truncate">{staff.name}</span>
                    <span className="text-[11px] font-bold text-sky-600">#{staff.code}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {staff.role || 'Nhân sự'} • {staff.specialty || staff.department || 'Phòng khám'}
                  </p>
                </div>
              </div>

              {/* 3 Detail KPI Cards */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Lương cứng */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Lương cơ bản &amp; Phụ cấp</span>
                  <div className="text-base font-extrabold text-slate-800 mt-1">
                    {(salaryBase + allowance).toLocaleString('vi-VN')}đ
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Phụ cấp: {allowance.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* 2. Hoa hồng hoặc Thu nhập theo ca */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">
                      {isClinical ? 'Hoa hồng thủ thuật' : 'Chuyên cần & Trách nhiệm'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {isClinical ? `${staff.commissionRate || 15}%` : '100%'}
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-emerald-600 mt-1">
                    {isClinical ? `${calculatedCommission.toLocaleString('vi-VN')}đ` : 'Đạt định mức'}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {isClinical ? `${realCases.length} ca điều trị` : '24 ngày công hoàn thành'}
                  </span>
                </div>

                {/* 3. Thưởng KPI */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">Thưởng KPI</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ★ {staff.rating || 5.0}
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-slate-800 mt-1">
                    {kpiBonus.toLocaleString('vi-VN')}đ
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    Xuất sắc
                  </span>
                </div>
              </div>
            </div>

            {/* KPI Reward Banner */}
            <div className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isClinical ? (
                  <>
                    Thưởng KPI &amp; Đánh giá chất lượng dịch vụ:{' '}
                    <strong className="font-extrabold">{kpiBonus.toLocaleString('vi-VN')}đ</strong> (Đạt điểm hài lòng {staff.rating || 4.9} ★ từ bệnh nhân điều trị)
                  </>
                ) : isAccountant ? (
                  <>
                    Thưởng KPI Kế toán &amp; Quản trị Tài chính:{' '}
                    <strong className="font-extrabold">{kpiBonus.toLocaleString('vi-VN')}đ</strong> (Hoàn thành đối soát viện phí, quyết toán thuế &amp; chốt lương đúng hạn 100%)
                  </>
                ) : (
                  <>
                    Thưởng hiệu suất &amp; Chuyên cần tháng:{' '}
                    <strong className="font-extrabold">{kpiBonus.toLocaleString('vi-VN')}đ</strong> (Hoàn thành định mức công việc xuất sắc)
                  </>
                )}
              </span>
            </div>

            {/* Detailed Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="text-sm font-extrabold text-slate-800">
                  {isClinical
                    ? 'Bảng kê chi tiết ca điều trị hưởng hoa hồng'
                    : 'Bảng kê ngày công & Nhiệm vụ chuyên môn'}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {isClinical ? `${realCases.length} ca hoàn thành` : '10 ca gần nhất'}
                </span>
              </div>

              <div className="overflow-x-auto">
                {isClinical ? (
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
                      {paginatedItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-extrabold text-slate-800">{item.code}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{item.patientName}</div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            {item.service}
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-800 whitespace-nowrap">
                            {Number(item.revenue).toLocaleString('vi-VN')}đ
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-600 whitespace-nowrap">
                            {item.rate}%
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-600 whitespace-nowrap">
                            {Number(item.commission).toLocaleString('vi-VN')}đ
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Đã hoàn thành
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4">NGÀY</th>
                        <th className="py-3 px-4">THỨ</th>
                        <th className="py-3 px-4">CA LÀM VIỆC</th>
                        <th className="py-3 px-4">NHIỆM VỤ PHỤ TRÁCH</th>
                        <th className="py-3 px-4 text-center">SỐ GIỜ CÔNG</th>
                        <th className="py-3 px-4 text-center">TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedItems.map((att: any) => (
                        <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                            {att.date}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                            {att.dayOfWeek}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                            {att.shiftName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-medium">
                            {att.duty}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-sky-600 whitespace-nowrap">
                            {att.hours} giờ
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Đã hoàn thành
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Table Pagination */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium bg-white">
                <div>
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, listToPaginate.length)} trên tổng {listToPaginate.length} mục
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-6 h-6 rounded-lg text-xs font-bold transition-colors ${
                        currentPage === idx + 1
                          ? 'bg-slate-900 text-white'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
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
                  {isClinical ? 'TỔNG CA THỰC HIỆN' : 'TỔNG NGÀY CÔNG'}
                </div>
                <div className="text-base font-extrabold text-white mt-0.5">
                  {totalCases} {isClinical ? 'Ca' : 'Ngày'}
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
                  {totalNet.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
