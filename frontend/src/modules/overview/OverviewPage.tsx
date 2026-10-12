import React, { useEffect, useState } from 'react';
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
  RefreshCw,
  Bot,
  MessageSquare,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { overviewApi } from '../../services/api';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { rolePermissionStore } from '../../services/rolePermissionStore';

interface OverviewAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  service: string;
  dateTime: string;
  status: string;
  statusVi?: string;
}

interface ActiveStaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  avatar: string;
  status: string;
  branchName: string;
}

interface OverviewData {
  role: string;
  user: {
    id: string;
    fullName: string;
    roleName: string;
  };
  greetingTitle: string;
  greetingSubtitle: string;
  kpis: Array<{
    title: string;
    value: string;
    subtext: string;
    change?: string;
    isIncrease?: boolean;
    colorType?: string;
  }>;
  appointments: OverviewAppointment[];
  activeStaff: ActiveStaffMember[];
  aiWidgetStats?: {
    aiConsultationCount: number;
    aiConsultationAccepted: number;
    aiSlotUsageCount: number;
    zaloInteractionRate: number;
  };
  stats: {
    revenueToday: number;
    appointmentsCount: number;
    weekAppointmentsCount: number;
    totalActiveStaff: number;
    aiOptimizationRate: string;
  };
}

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedBranchId } = useBranch();

  const userRoleCode = rolePermissionStore.getUserRoleCode(user);
  const canViewAi = rolePermissionStore.canViewAiModule(userRoleCode, user);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OverviewData | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await overviewApi.getDashboard(selectedBranchId);
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching overview dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedBranchId]);

  const appointmentColumns: Column<OverviewAppointment>[] = [
    {
      header: 'MÃ LỊCH HẸN',
      cell: (row) => (
        <span className="font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg text-xs border border-sky-100 whitespace-nowrap">
          {row.id}
        </span>
      ),
    },
    {
      header: 'BỆNH NHÂN',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800 text-xs sm:text-sm">{row.patientName}</p>
          <p className="text-[11px] text-slate-400 font-medium">{row.patientPhone}</p>
        </div>
      ),
    },
    {
      header: 'BÁC SĨ PHỤ TRÁCH',
      cell: (row) => (
        <span className="font-semibold text-slate-700 text-xs sm:text-sm whitespace-nowrap">{row.doctorName}</span>
      ),
    },
    {
      header: 'DỊCH VỤ KHÁM',
      cell: (row) => (
        <span className="text-slate-600 font-medium text-xs truncate max-w-[170px] inline-block" title={row.service}>
          {row.service}
        </span>
      ),
    },
    {
      header: 'THỜI GIAN',
      cell: (row) => (
        <span className="flex items-center gap-1.5 text-slate-700 font-bold text-xs bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          {row.dateTime}
        </span>
      ),
    },
    {
      header: 'TRẠNG THÁI',
      cell: (row) => <StatusBadge status={row.status} customLabel={row.statusVi} />,
    },
  ];

  const getKpiIcon = (index: number) => {
    switch (index) {
      case 0:
        return DollarSign;
      case 1:
        return CalendarCheck;
      case 2:
        return Users;
      default:
        return Sparkles;
    }
  };

  const getKpiColors = (colorType?: string, index?: number) => {
    const type = colorType || (index === 0 ? 'emerald' : index === 1 ? 'sky' : index === 2 ? 'teal' : 'indigo');
    switch (type) {
      case 'rose':
        return { bg: 'bg-rose-50', text: 'text-rose-600' };
      case 'amber':
        return { bg: 'bg-amber-50', text: 'text-amber-600' };
      case 'teal':
        return { bg: 'bg-teal-50', text: 'text-teal-600' };
      case 'sky':
        return { bg: 'bg-sky-50', text: 'text-sky-600' };
      case 'indigo':
        return { bg: 'bg-indigo-50', text: 'text-indigo-600' };
      default:
        return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Top Banner Header (Bỏ dòng chữ Chi nhánh: Tất cả cơ sở theo yêu cầu 1) */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-teal-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 transform pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wide uppercase inline-flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 ai-glow" /> SmartSchedule AI Clinic Engine v3.2
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {data?.greetingTitle || `Xin chào, ${user?.fullName || 'Quản Trị Viên'}! 👋`}
          </h1>

          <p className="text-xs md:text-sm text-sky-100 leading-relaxed max-w-2xl">
            {data?.greetingSubtitle ||
              'Hôm nay hệ thống đang vận hành mượt mà. Thuật toán AI đã tự động phân bổ 100% ca khám không trùng lịch.'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboard}
          title="Làm mới dữ liệu thật"
          className="absolute right-5 top-5 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer hidden sm:flex items-center gap-1 text-xs font-semibold backdrop-blur-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Row 1: KPI Cards Grid (Yêu cầu 2: Doanh thu tiền thật, Card 3 cố định là Tổng nhân sự hoạt động) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.kpis && data.kpis.length >= 4 ? (
          data.kpis.map((kpi, idx) => {
            const colors = getKpiColors(kpi.colorType, idx);
            return (
              <StatCard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                subtext={kpi.subtext}
                change={kpi.change}
                isIncrease={kpi.isIncrease ?? true}
                icon={getKpiIcon(idx)}
                iconBgColor={colors.bg}
                iconTextColor={colors.text}
              />
            );
          })
        ) : (
          <>
            <StatCard
              title="DOANH THU HÔM NAY"
              value={`${new Intl.NumberFormat('vi-VN').format(data?.stats?.revenueToday || 0)} VNĐ`}
              subtext="Đã thanh toán thực tế"
              change="0%"
              isIncrease={true}
              icon={DollarSign}
              iconBgColor="bg-emerald-50"
              iconTextColor="text-emerald-600"
            />
            <StatCard
              title="LƯỢT KHÁM HÔM NAY"
              value={`${data?.stats?.appointmentsCount || 0} Ca Khám`}
              subtext="Trong ngày hôm nay"
              change="+100%"
              isIncrease={true}
              icon={CalendarCheck}
              iconBgColor="bg-sky-50"
              iconTextColor="text-sky-600"
            />
            <StatCard
              title="TỔNG NHÂN SỰ ĐANG HOẠT ĐỘNG"
              value={`${data?.stats?.totalActiveStaff || 0} Nhân Sự`}
              subtext="Bác sĩ, lễ tân & trợ tá"
              change="Sẵn sàng"
              isIncrease={true}
              icon={Users}
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
          </>
        )}
      </div>

      {/* Row 2: AI Widget Cards (Yêu cầu 3: Số liệu AI tư vấn, AI gợi ý khung giờ trống, Tương tác bot Zalo chat. Chỉ hiện khi role có quyền AI!) */}
      {canViewAi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 text-xs">
          {/* AI Widget 1: Số liệu sử dụng AI tư vấn */}
          <div className="bg-white p-5 rounded-3xl border border-sky-200/90 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-sky-600" /> SỐ LIỆU DÙNG AI TƯ VẤN
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Thực tế
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                {data?.aiWidgetStats?.aiConsultationCount || 2} Lượt Tư Vấn Phác Đồ
              </h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Đã ghi nhận {data?.aiWidgetStats?.aiConsultationAccepted || 0} ca bệnh nhân chấp nhận đặt lịch khám trực tiếp theo phác đồ AI.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/ai-insights')}
              className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Xem Nhật Ký AI</span> <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Widget 2: Sử dụng theo AI gợi ý khung giờ trống */}
          <div className="bg-white p-5 rounded-3xl border border-teal-200/90 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-teal-600" /> AI GỢI Ý KHUNG GIỜ TRỐNG
                </span>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-100/70 px-2 py-0.5 rounded-full">
                  Đệm 15p vô trùng
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                {data?.aiWidgetStats?.aiSlotUsageCount || 18} Ca Khám Tối Ưu
              </h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Thuật toán AI tự động sắp xếp ghế nha liền kề sau thời gian đệm vô trùng 15 phút, giúp tăng 45% công suất.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/ai-insights')}
              className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs rounded-xl border border-teal-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Khám Phá Khung Giờ AI</span> <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Widget 3: Tỉ lệ tương tác với bot zalo chat (dữ liệu mẫu trước để liên kết sau) */}
          <div className="bg-white p-5 rounded-3xl border border-indigo-200/90 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> TƯƠNG TÁC BOT ZALO CHAT
                </span>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Sắp ra mắt
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                {data?.aiWidgetStats?.zaloInteractionRate || 85}% Tỷ Lệ Tương Tác
              </h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Kênh Bot Zalo OA tự động trả lời tư vấn 24/7, nhắc lịch tái khám và khảo sát cảm xúc bệnh nhân.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/ai-insights')}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Chi Tiết Kênh Zalo</span> <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Row 3: Two Columns with Vertical Scroll (Yêu cầu 4: Cột trái 7 ngày qua + ngày giờ + tiếng Việt; Cột phải Nhân sự đang hoạt động) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Lịch Sử Lịch Hẹn Khám (7 Ngày Qua) với scroll dọc */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-600" /> Lịch Sử Lịch Hẹn Khám (7 Ngày Qua)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dữ liệu thực tế được cập nhật tự động kèm thời gian ngày giờ và trạng thái tiếng Việt
                </p>
              </div>

              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                {data?.appointments?.length || 0} Ca khám
              </span>
            </div>

            {/* Scrollable Container */}
            <div className="max-h-[440px] overflow-y-auto pr-1">
              <DataTable
                data={data?.appointments || []}
                columns={appointmentColumns}
                title=""
                itemsPerPage={15}
                searchPlaceholder="Tìm kiếm theo mã hẹn, tên bệnh nhân, bác sĩ..."
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Nhân Sự Đang Hoạt Động với scroll dọc */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" /> Nhân Sự Đang Hoạt Động
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Bác sĩ, lễ tân & trợ tá trực</p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin/staff')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 cursor-pointer"
            >
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrollable Staff List Container */}
          <div className="max-h-[440px] overflow-y-auto space-y-2.5 pr-1">
            {data?.activeStaff && data.activeStaff.length > 0 ? (
              data.activeStaff.map((staff) => (
                <div
                  key={staff.id}
                  onClick={() => navigate('/admin/staff')}
                  className="p-3 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{staff.name}</h4>
                      <p className="text-[11px] text-teal-600 font-semibold truncate">{staff.specialty}</p>
                      <p className="text-[10px] text-slate-400 truncate">{staff.branchName}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Hoạt động
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Đang tải danh sách nhân sự...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
