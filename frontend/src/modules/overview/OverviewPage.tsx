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
import { AiInsightCard } from '../../components/common/AiInsightCard';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MOCK_APPOINTMENTS, MOCK_AI_INSIGHTS, MOCK_DOCTORS } from '../../services/mockData';
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

      {/* AI Smart Schedule Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {MOCK_AI_INSIGHTS.map((insight) => (
          <AiInsightCard
            key={insight.id}
            insight={insight}
            onApplyAction={() => navigate('/admin/ai-insights')}
          />
        ))}
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
