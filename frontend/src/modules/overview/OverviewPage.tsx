import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  DollarSign,
  Sparkles,
  TrendingUp,
  Stethoscope,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MOCK_APPOINTMENTS, MOCK_DOCTORS } from '../../services/mockData';
import type { Appointment } from '../../types/admin';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const appointmentColumns: Column<Appointment>[] = [
    {
      header: 'MÃ LỊCH HẸN',
      cell: (row) => (
        <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-xs">
          {row.id}
        </span>
      ),
    },
    {
      header: 'BỆNH NHÂN',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.patientName}</p>
          <p className="text-[11px] text-slate-400">{row.patientPhone}</p>
        </div>
      ),
    },
    {
      header: 'BÁC SĨ PHỤ TRÁCH',
      cell: (row) => <span className="font-medium text-slate-700">{row.doctorName}</span>,
    },
    {
      header: 'DỊCH VỤ KHÁM',
      accessorKey: 'service',
    },
    {
      header: 'THỜI GIAN',
      cell: (row) => (
        <span className="flex items-center gap-1 text-slate-600 font-semibold">
          <Clock className="w-3.5 h-3.5 text-sky-500" />
          {row.dateTime}
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
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-teal-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 transform pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wide uppercase inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 ai-glow" /> SmartSchedule AI Clinic Engine v3.2
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Xin chào, Bác sĩ Quản lý! 👋
          </h1>
          <p className="text-xs md:text-sm text-sky-100 leading-relaxed">
            Hôm nay hệ thống đang vận hành mượt mà tại 3 chi nhánh. Thuật toán AI đã tự động phân bổ 100% ca khám không trùng lịch.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="DOANH THU HÔM NAY"
          value="48.500.000 VNĐ"
          subtext="Mục tiêu ngày: 50Tr"
          change="+18.4%"
          isIncrease={true}
          icon={DollarSign}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="LƯỢT KHÁM HÔM NAY"
          value="128 Ca Khám"
          subtext="85 ca hoàn tất"
          change="+12.5%"
          isIncrease={true}
          icon={CalendarCheck}
          iconBgColor="bg-sky-50"
          iconTextColor="text-sky-600"
        />
        <StatCard
          title="BÁC SĨ ĐANG TRỰC"
          value="14 Bác Sĩ"
          subtext="3 Chi nhánh"
          icon={Stethoscope}
          iconBgColor="bg-teal-50"
          iconTextColor="text-teal-600"
        />
        <StatCard
          title="TỶ LỆ TỐI ƯU AI"
          value="99.4%"
          subtext="0 Ca trùng lịch"
          change="+2.1%"
          isIncrease={true}
          icon={Sparkles}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
        />
      </div>

      {/* AI Insights Hub Summary Widgets (Khớp Ảnh 1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        {/* Widget 1: Dự báo giờ vắng & Khuyến nghị */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-600" /> TỐI ƯU CÔNG SUẤT
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">T3 vắng 78%</span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Giảm 15% gói Răng sứ Katana</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Khung giờ 09:00 - 12:00 Thứ Ba. Dự kiến tăng 45% tỷ lệ lấp đầy khung giờ vắng.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/ai-insights')}
            className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-colors flex items-center justify-center gap-1"
          >
            <span>Đến Trung Tâm AI</span> <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Widget 2: Rủi ro No-Show */}
        <div className="bg-white p-5 rounded-3xl border border-rose-200/90 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                RỦI RO NO-SHOW
              </span>
              <span className="text-[10px] text-rose-600 font-bold">78% Nguy cơ</span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">2 Ca hẹn nguy cơ hủy &gt; 75%</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Đã tự động gửi yêu cầu cọc VietQR 2.000.000đ để bảo đảm lịch hẹn.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/ai-insights')}
            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1"
          >
            <span>Quản Lý Rủi Ro</span> <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Widget 3: Phân tích cảm xúc & Zalo CSKH */}
        <div className="bg-white p-5 rounded-3xl border border-amber-200/90 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                CẢM XÚC (4.8 / 5.0)
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">91% Hài lòng</span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Kịch bản Zalo xin lỗi KH</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Đã tự động gửi voucher cạo vôi răng cho KH Trần Văn A giải quyết phản hồi chờ lâu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/ai-insights')}
            className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1"
          >
            <span>Xem Phân Tích Cảm Xúc</span> <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tables & Doctor Quick Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <DataTable
            data={MOCK_APPOINTMENTS}
            columns={appointmentColumns}
            title="Lịch Hẹn Khám Bệnh Trong Ngày"
            searchPlaceholder="Tìm lịch hẹn bệnh nhân..."
          />
        </div>

        {/* Right 1 Col: Doctors on Duty */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" /> Bác Sĩ Đang Trực
            </h3>
            <button
              type="button"
              onClick={() => navigate('/admin/staff')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
            >
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_DOCTORS.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/admin/staff/${doc.id}`)}
                className="p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/40 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{doc.name}</h4>
                    <p className="text-[11px] text-teal-600 font-semibold">{doc.specialty}</p>
                  </div>
                </div>

                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
