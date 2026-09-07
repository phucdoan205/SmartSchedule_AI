import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Phone,
  Mail,
  Calendar,
  Edit,
  Printer,
  Download,
  Plus,
  Clock,
  Users,
  DollarSign,
  ThumbsUp,
  Search,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { MOCK_DOCTORS, MOCK_SERVICES } from '../../services/mockData';
import { ShiftModal } from './ShiftModal';

// ─── Mock data for tabs ─────────────────────────────────────────────────────
const WEEK_DAYS = [
  { label: 'THỨ 2', date: '17/08' },
  { label: 'THỨ 3', date: '18/08' },
  { label: 'THỨ 4', date: '19/08' },
  { label: 'THỨ 5', date: '20/08', isToday: true },
  { label: 'THỨ 6', date: '21/08' },
  { label: 'THỨ 7', date: '22/08' },
  { label: 'CN', date: '23/08' },
];

type ShiftType = 'morning' | 'afternoon' | 'fullday' | 'off' | null;

interface DayShift {
  type: ShiftType;
  time?: string;
  room?: string;
  patients?: number;
  isToday?: boolean;
  badge?: string;
  extra?: ShiftType;
  extraTime?: string;
}

const DOCTOR_SHIFTS: DayShift[] = [
  { type: 'morning', time: '08:00 - 12:00', room: 'Ghế 02', patients: 3 },
  { type: null },
  { type: 'morning', time: '08:00 - 12:00', room: 'Ghế 02', patients: 0 },
  { type: 'afternoon', time: '13:30 - 18:00', room: 'Ghế 01', isToday: true, patients: 2, badge: 'Hôm nay', extra: 'morning', extraTime: '2 ca hôm nay' },
  { type: 'morning', time: '08:00 - 12:00', room: 'Ghế 02', patients: 0 },
  { type: 'fullday', time: 'Ca Sáng & Ca Chiều', room: 'Ghế 02', patients: 0 },
  { type: 'off', time: 'Nghỉ hàng tuần (OFF)' },
];

const MOCK_TREATMENT_HISTORY = [
  {
    id: '#CA-2026-845',
    date: '18/08/2026',
    patient: 'Trần Thị Cẩm Tú',
    phone: '0933 *** 123',
    service: 'Mặt dán Veneer Emax (4 răng)',
    duration: 90,
    revenue: 32000000,
    commission: 4800000,
  },
  {
    id: '#CA-2026-831',
    date: '15/08/2026',
    patient: 'Lê Hoàng Long',
    phone: '0912 *** 678',
    service: 'Bọc 2 răng sứ Cercon (Đức)',
    duration: 60,
    revenue: 12000000,
    commission: 1800000,
  },
  {
    id: '#CA-2026-799',
    date: '12/08/2026',
    patient: 'Phạm Minh Anh',
    phone: '0908 *** 999',
    service: 'Sứ toàn phần Emax (Khám & Lấy dấu)',
    duration: 45,
    revenue: 7000000,
    commission: 1050000,
  },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    initials: 'TC',
    patient: 'Trần Thị Cẩm Tú',
    patientCode: '#BN-2026-088',
    date: '18/08/2026',
    rating: 5,
    service: 'Mặt dán Veneer Emax',
    comment:
      'Bác sĩ An làm rất nhẹ nhàng, không hề bị ê buốt. Form răng thiết kế tự nhiên và khớp cắn ăn nhai rất thoải mái. Cảm ơn bác sĩ nhiều!',
    verified: true,
    branch: 'Cơ sở Biên Hòa',
    showOnWeb: true,
  },
  {
    id: 2,
    initials: 'HL',
    patient: 'Lê Hoàng Long',
    patientCode: '#BN-2026-071',
    date: '15/08/2026',
    rating: 5,
    service: 'Sứ toàn phần Cercon (Đức)',
    comment:
      'Rất hài lòng với màu răng sứ BS. An tư vấn, nhìn y hệt răng thật. Bác sĩ dặn dò chu đáo sau khi lắp răng.',
    verified: false,
    branch: '',
    showOnWeb: true,
  },
];

// ─── Utility ────────────────────────────────────────────────────────────────
const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const ShiftBadge: React.FC<{ type: ShiftType; time?: string; room?: string; patients?: number; isToday?: boolean }> = ({
  type,
  time,
  room,
  patients,
  isToday,
}) => {
  if (!type) return <span className="text-xs text-slate-300 italic">—</span>;
  if (type === 'off') return <span className="text-xs text-slate-400 italic">{time}</span>;

  const isMorning = type === 'morning';
  const isAfternoon = type === 'afternoon';
  const isFullday = type === 'fullday';

  const bg = isToday
    ? 'bg-sky-100 border-sky-300 text-sky-900'
    : isMorning
    ? 'bg-slate-100 border-slate-200 text-slate-700'
    : isAfternoon
    ? 'bg-slate-800 border-slate-700 text-white'
    : 'bg-slate-100 border-slate-200 text-slate-700';

  const label = isMorning ? 'Ca Sáng' : isAfternoon ? 'Ca Chiều' : 'Ca Sáng & Ca Chiều';

  return (
    <div className={`rounded-xl border px-2.5 py-2 text-[11px] font-bold ${bg}`}>
      <div className="font-extrabold">{label}</div>
      <div className={`font-normal text-[10px] mt-0.5 ${isAfternoon && !isToday ? 'text-slate-300' : 'text-slate-500'}`}>
        {isFullday ? '08:00 - 18:00' : time}
      </div>
      {room && <div className={`text-[10px] font-medium mt-0.5 ${isAfternoon && !isToday ? 'text-slate-400' : 'text-slate-400'}`}>{room}</div>}
      {patients !== undefined && patients > 0 && (
        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-sky-600">
          <Users className="w-2.5 h-2.5" /> {patients} bệnh nhân
        </div>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'services' | 'schedule' | 'history' | 'reviews'>('services');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');
  const [showWebToggle, setShowWebToggle] = useState(true);

  const doctor = MOCK_DOCTORS.find((d) => d.id === id) || MOCK_DOCTORS[0];

  // Star distribution mock
  const starDist = [
    { star: 5, pct: 92, count: 118 },
    { star: 4, pct: 6, count: 6 },
    { star: 3, pct: 2, count: 4 },
    { star: 2, pct: 0, count: 0 },
    { star: 1, pct: 0, count: 0 },
  ];

  const tabs = [
    { id: 'services', label: 'Dịch vụ phụ trách' },
    { id: 'schedule', label: 'Lịch trực tuần này' },
    { id: 'history', label: 'Lịch sử ca điều trị' },
    { id: 'reviews', label: 'Đánh giá từ bệnh nhân' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-5">
        <button type="button" onClick={() => navigate('/admin/staff')} className="hover:text-sky-600 transition-colors">
          Bác sĩ &amp; Nhân sự
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <button type="button" onClick={() => navigate('/admin/staff')} className="hover:text-sky-600 transition-colors">
          Danh sách nhân viên
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-800 font-semibold">Chi tiết: {doctor.name} ({doctor.code})</span>
      </nav>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            Chỉnh sửa hồ sơ
          </button>
          <button
            type="button"
            onClick={() => setIsShiftModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            Thêm ca trực
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Left Sidebar ─────────────────────────────────────────────── */}
        <div className="w-64 shrink-0 space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col items-center text-center">
            <div className="relative mb-3">
              {doctor.avatar ? (
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-sky-100 text-sky-700 font-black text-2xl flex items-center justify-center border-4 border-white shadow-md">
                  {doctor.initials}
                </div>
              )}
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Đang hoạt động
              </span>
            </div>

            <h2 className="text-sm font-black text-slate-900 mt-2">{doctor.name}</h2>
            <p className="text-[11px] font-bold text-sky-600 mt-0.5">#{doctor.code}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">{doctor.specialty}</p>
            <p className="text-xs text-slate-400 mt-0.5">{doctor.branch}</p>

            <div className="w-full h-px bg-slate-100 my-4" />

            <div className="w-full space-y-2.5 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium truncate text-[11px]">{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">Gia nhập: 12/05/2021</span>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100 my-4" />

            {/* Performance */}
            <div className="w-full text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Hiệu suất &amp; đánh giá</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold mb-1">Mức hoa hồng</p>
                  <p className="text-base font-black text-slate-800">{doctor.commissionRate ?? 15}%</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold mb-1">Đánh giá ({doctor.totalAppointments})</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-base font-black text-slate-800">{doctor.rating}</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Content ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs mb-4 overflow-hidden">
            <div className="flex border-b border-slate-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3.5 text-xs font-bold transition-all relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-sky-600 bg-sky-50/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── TAB 1: Dịch vụ phụ trách ─────────────────────────────── */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
              {/* AI tip banner */}
              <div className="flex items-start gap-3 bg-sky-50 border border-sky-200/70 rounded-xl p-3.5 mb-5">
                <TrendingUp className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <p className="text-xs text-sky-700 font-medium leading-relaxed">
                  ✦&nbsp; BS. An có tỷ lệ đặt lịch cao nhất cho dịch vụ{' '}
                  <span className="font-bold">Veneer Emax</span> tại chi nhánh{' '}
                  <span className="font-bold">Biên Hòa (85%).</span>
                </p>
              </div>

              {/* Services table header */}
              <div className="grid grid-cols-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 px-1">
                <span>Tên dịch vụ</span>
                <span className="text-center">Thời gian</span>
                <span className="text-right">Đơn giá</span>
              </div>

              {/* Service rows */}
              <div className="divide-y divide-slate-50">
                {MOCK_SERVICES.slice(0, 4).map((srv, i) => {
                  const icons = ['🦷', '🔩', '✨', '💎'];
                  const durations = [60, 90, 90, 120];
                  const prices = [6000000, 7000000, 8000000, 5500000];
                  return (
                    <div key={srv.id || i} className="grid grid-cols-3 items-center py-3.5 px-1 hover:bg-slate-50/50 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-base">{icons[i] || '🦷'}</span>
                        <span className="text-sm font-semibold text-slate-800">{srv.name}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {durations[i] || srv.durationMinutes}p
                      </div>
                      <div className="text-right text-sm font-bold text-slate-800">
                        {fmtVND(prices[i] || srv.price)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Work schedule section */}
              <div className="mt-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Khung giờ làm việc tiêu chuẩn
                </p>
                <div className="flex flex-wrap gap-2">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
                    <span key={d} className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white">{d}</span>
                  ))}
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-400">CN: OFF</span>
                  <span className="ml-2 px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200">
                    08:00 - 17:30
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: Lịch trực tuần này ────────────────────────────── */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Tổng ca trực tuần này', value: '9 ca', icon: Calendar, color: 'text-sky-600' },
                  { label: 'Tổng giờ làm việc', value: '40.5 giờ', icon: Clock, color: 'text-emerald-600' },
                  { label: 'Ca hẹn đã gần', value: '14 ca khám', icon: Users, color: 'text-amber-600' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-slate-50 ${s.color}`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">{s.label}</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly calendar */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                {/* Calendar header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-slate-800">Tuần: 17/08/2026 – 23/08/2026</span>
                    <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      <Printer className="w-3.5 h-3.5" />
                      In lịch
                    </button>
                    <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Xuất Excel
                    </button>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {WEEK_DAYS.map((d) => (
                          <th
                            key={d.date}
                            className={`px-3 py-3 text-center font-bold w-[13%] ${
                              d.isToday ? 'text-sky-600 bg-sky-50/50' : 'text-slate-500'
                            }`}
                          >
                            <div className={`font-extrabold ${d.isToday ? 'text-sky-600' : 'text-slate-500'}`}>
                              {d.label}
                            </div>
                            <div className={`text-base font-black mt-0.5 ${d.isToday ? 'text-sky-600' : 'text-slate-800'}`}>
                              {d.date}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {DOCTOR_SHIFTS.map((shift, i) => (
                          <td key={i} className={`px-2 py-3 align-top ${shift.isToday ? 'bg-sky-50/30' : ''}`}>
                            <div className="flex flex-col gap-1.5">
                              {shift.type && (
                                <ShiftBadge
                                  type={shift.type}
                                  time={shift.time}
                                  room={shift.room}
                                  patients={shift.patients}
                                  isToday={shift.isToday}
                                />
                              )}
                              {!shift.type && shift.type !== 'off' && <span className="text-slate-300 text-xs">—</span>}
                              {shift.type === 'off' && (
                                <span className="text-slate-400 text-[11px] italic">{shift.time}</span>
                              )}
                              {shift.isToday && (
                                <div className="rounded-xl border border-sky-200 bg-sky-600 text-white px-2.5 py-2 text-[11px] font-bold">
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                                    HÔM NAY
                                  </div>
                                  <div className="text-[10px] text-sky-200 font-normal mt-0.5">2 ca hôm nay</div>
                                </div>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add shift button
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm ca trực
                </button>
              </div> */}
            </div>
          )}

          {/* ── TAB 3: Lịch sử ca điều trị ───────────────────────────── */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Tổng ca đã thực hiện', value: '128 ca', color: 'text-sky-600', bg: 'bg-sky-50', icon: Calendar },
                  { label: 'Tỷ lệ thành công', value: '99.2%', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
                  { label: 'Doanh thu tháng này', value: '192.000.000', suffix: 'VNĐ', color: 'text-amber-600', bg: 'bg-amber-50', icon: DollarSign },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4">
                    <p className="text-[10px] text-slate-400 font-semibold">{s.label}</p>
                    <div className="flex items-end gap-1 mt-1.5">
                      <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                      {s.suffix && <p className="text-xs text-slate-500 font-bold mb-0.5">{s.suffix}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {[
                    { id: 'all', label: 'Tất cả ca khám' },
                    { id: 'cercon', label: 'Bọc răng sứ Cercon/Emax' },
                    { id: 'veneer', label: 'Mặt dán Veneer' },
                    { id: 'revisit', label: 'Tái khám định kỳ' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setHistoryFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        historyFilter === f.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <div className="ml-auto relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm ca, bệnh nhân..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 w-52 transition-all"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50/60">
                        {['Mã ca / Ngày', 'Bệnh nhân & SĐT', 'Dịch vụ kỹ thuật', 'Thời lượng', 'Doanh thu', 'Hoa hồng (15%)'].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {MOCK_TREATMENT_HISTORY.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-sky-600">{row.id}</p>
                            <p className="text-slate-400 font-medium mt-0.5">{row.date}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-slate-800">{row.patient}</p>
                            <p className="text-slate-400 font-medium mt-0.5">{row.phone}</p>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-700 max-w-[200px]">{row.service}</td>
                          <td className="px-4 py-3.5 font-semibold text-slate-600">{row.duration} phút</td>
                          <td className="px-4 py-3.5 font-bold text-slate-800">{fmtVND(row.revenue)}</td>
                          <td className="px-4 py-3.5 font-bold text-emerald-600">{fmtVND(row.commission)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">Hiện thị 1-3 trong 128 ca điều trị</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Xuất danh sách ca khám (Excel)
                    </button>
                    <div className="flex items-center gap-1">
                      <button type="button" className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button type="button" className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold">1</button>
                      <button type="button" className="px-2.5 py-1 rounded-lg text-slate-500 text-xs font-semibold hover:bg-slate-100">2</button>
                      <button type="button" className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: Đánh giá từ bệnh nhân ─────────────────────────── */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {/* Rating summary */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
                <div className="flex items-start gap-8">
                  {/* Overall score */}
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-black text-slate-900">4.9</p>
                    <div className="flex items-center justify-center gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= 5 ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1.5">/ 5.0</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Dựa trên 128 lượt đánh giá trực tiếp từ bệnh nhân</p>
                  </div>

                  {/* Star distribution */}
                  <div className="flex-1 space-y-2">
                    {starDist.map(({ star, pct, count }) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="w-3 text-[11px] font-bold text-slate-600 text-right shrink-0">{star}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 w-8 shrink-0">{pct}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Notable tags */}
                  <div className="shrink-0 w-40 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Điểm nổi bật</p>
                    {[
                      { label: 'Tay nghề nhẹ nhàng', count: 88 },
                      { label: 'Tư vấn tận tâm', count: 85 },
                      { label: 'Răng sứ tự nhiên', count: 74 },
                      { label: 'Đúng giờ', count: 60 },
                    ].map((tag) => (
                      <span
                        key={tag.label}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 border border-sky-200/70 text-xs font-semibold text-sky-700 w-full"
                      >
                        <ThumbsUp className="w-3 h-3 shrink-0" />
                        {tag.label} ({tag.count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews list */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Đánh giá gần đây</h3>
                  <div className="flex items-center gap-2">
                    <select className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-400 bg-white">
                      <option>Tất cả sao</option>
                      <option>5 sao</option>
                      <option>4 sao</option>
                    </select>
                    <select className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-400 bg-white">
                      <option>Mới nhất</option>
                      <option>Cũ nhất</option>
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-slate-50">
                  {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {review.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-slate-900 text-sm">{review.patient}</span>
                              <span className="text-[11px] text-slate-400 font-medium ml-2">{review.patientCode}</span>
                              <p className="text-[11px] text-slate-400 mt-0.5">{review.date}</p>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-xs font-semibold text-sky-600 mt-1.5">Dịch vụ: {review.service}</p>
                          <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">"{review.comment}"</p>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                              {review.verified && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Đã xác thực điều trị tại cơ sở {review.branch}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <button type="button" className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold transition-colors">
                                Phản hồi đánh giá
                              </button>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-500 font-medium">Hiển thị đánh giá này trên Website</span>
                                <button
                                  type="button"
                                  onClick={() => setShowWebToggle(!showWebToggle)}
                                  className={`relative w-9 h-5 rounded-full transition-all ${showWebToggle ? 'bg-sky-500' : 'bg-slate-200'}`}
                                >
                                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${showWebToggle ? 'left-4' : 'left-0.5'}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add review button */}
                <div className="px-5 py-4 border-t border-slate-100 flex justify-center">
                  <button type="button" className="text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors">
                    Tải thêm đánh giá
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shift Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        initialStaffId={doctor.id}
      />
    </div>
  );
};
