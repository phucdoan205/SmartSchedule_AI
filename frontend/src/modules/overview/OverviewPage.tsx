import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Award,
  Bot,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  MessageSquare,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { overviewApi } from '../../services/api';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { rolePermissionStore } from '../../services/rolePermissionStore';
import type { OverviewData, OverviewDashboardType, OverviewKpiItem } from './types';
import { LazyDashboardSection } from './components/LazyDashboardSection';
import {
  buildOverviewCacheKey,
  clearOverviewCache,
  getCachedSummary,
  setCachedSummary,
} from './utils/overviewCache';
import {
  AccountantOverviewView,
  BranchManagerOverviewView,
  CustomRoleOverviewView,
  DoctorOverviewView,
  NurseOverviewView,
  OwnerOverviewView,
  ReceptionistOverviewView,
  TechnicianOverviewView,
} from './components/RoleOverviewViews';

const BANNER_THEME_BY_TYPE: Record<
  OverviewDashboardType,
  { gradient: string; badge: string }
> = {
  OWNER: {
    gradient: 'from-sky-700 via-sky-600 to-teal-600',
    badge: 'Chủ Phòng Khám • Quản Trị Toàn Hệ Thống',
  },
  BRANCH_MANAGER: {
    gradient: 'from-blue-700 via-sky-600 to-cyan-600',
    badge: 'Quản Lý Chi Nhánh • Điều Hành Cơ Sở',
  },
  DOCTOR: {
    gradient: 'from-emerald-700 via-teal-600 to-sky-600',
    badge: 'Bác Sĩ Chuyên Khoa • Lâm Sàng & EMR',
  },
  RECEPTIONIST: {
    gradient: 'from-indigo-700 via-sky-600 to-cyan-600',
    badge: 'Lễ Tân Phòng Khám • Tiếp Đón & Check-in',
  },
  ACCOUNTANT: {
    gradient: 'from-slate-800 via-emerald-700 to-teal-600',
    badge: 'Kế Toán Toàn Viện • Tài Chính & Lương Thưởng',
  },
  NURSE: {
    gradient: 'from-teal-700 via-emerald-600 to-cyan-600',
    badge: 'Điều Dưỡng Viên • Hỗ Trợ Điều Trị & Vô Trùng',
  },
  TECHNICIAN: {
    gradient: 'from-amber-700 via-orange-600 to-slate-700',
    badge: 'Kỹ Thuật Viên • Thiết Bị & Chẩn Đoán Hình Ảnh',
  },
  CUSTOM: {
    gradient: 'from-indigo-700 via-violet-600 to-sky-600',
    badge: 'Vai Trò Tùy Chỉnh RBAC • Tự Động Thích Ứng',
  },
};

const getKpiIcon = (kpi: OverviewKpiItem, index: number) => {
  switch (kpi.iconType) {
    case 'dollar':
      return DollarSign;
    case 'calendar':
      return CalendarCheck;
    case 'users':
      return Users;
    case 'sparkles':
      return Sparkles;
    case 'stethoscope':
      return Stethoscope;
    case 'award':
      return Award;
    case 'clock':
      return Clock;
    case 'receipt':
      return Receipt;
    case 'trending':
      return TrendingUp;
    case 'activity':
      return Activity;
    case 'wrench':
      return Wrench;
    case 'alert':
      return AlertTriangle;
    case 'check':
      return CheckCircle2;
    case 'building':
      return Building2;
    case 'shield':
      return ShieldCheck;
    default:
      if (index === 0) return DollarSign;
      if (index === 1) return CalendarCheck;
      if (index === 2) return Users;
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

const inferFrontendDashboardType = (roleCode: string, roleName?: string): OverviewDashboardType => {
  const lower = `${roleCode} ${roleName || ''}`.toLowerCase();
  if (lower.includes('owner') || lower.includes('super_admin') || lower.includes('chủ phòng khám')) return 'OWNER';
  if (lower.includes('manager') || lower.includes('quản lý')) return 'BRANCH_MANAGER';
  if (lower.includes('doctor') || lower.includes('bác sĩ')) return 'DOCTOR';
  if (lower.includes('receptionist') || lower.includes('lễ tân')) return 'RECEPTIONIST';
  if (lower.includes('ke_toan') || lower.includes('accountant') || lower.includes('kế toán')) return 'ACCOUNTANT';
  if (lower.includes('nurse') || lower.includes('điều dưỡng')) return 'NURSE';
  if (lower.includes('technician') || lower.includes('kỹ thuật')) return 'TECHNICIAN';
  return 'CUSTOM';
};

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedBranchId } = useBranch();

  const userRoleCode = rolePermissionStore.getUserRoleCode(user);
  const canViewAi = rolePermissionStore.canViewAiModule(userRoleCode, user);
  const cacheKey = buildOverviewCacheKey(user?.id, userRoleCode, selectedBranchId);

  const [, setRbacVersion] = useState(0);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [loading, setLoading] = useState<boolean>(() => !getCachedSummary<OverviewData>(cacheKey));
  const [data, setData] = useState<OverviewData | null>(() => {
    const cached = getCachedSummary<OverviewData>(cacheKey);
    return cached ? cached.data : null;
  });

  useEffect(() => {
    const unsubscribe = rolePermissionStore.subscribe(() => {
      setRbacVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  const fetchSummary = useCallback(
    async (force = false) => {
      const cached = !force ? getCachedSummary<OverviewData>(cacheKey) : null;
      if (cached) {
        setData(cached.data);
        if (!cached.isStale) {
          setLoading(false);
          return;
        }
      }

      try {
        if (!cached) setLoading(true);
        const res = await overviewApi.getSummary(selectedBranchId);
        if (res) {
          setCachedSummary(cacheKey, res);
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching overview summary:', err);
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, selectedBranchId],
  );

  useEffect(() => {
    fetchSummary(false);
  }, [fetchSummary]);

  const handleManualRefresh = () => {
    clearOverviewCache(cacheKey);
    setRefreshNonce((n) => n + 1);
    fetchSummary(true);
  };

  const dashboardType: OverviewDashboardType =
    data?.dashboardType || inferFrontendDashboardType(userRoleCode, user?.roles?.[0]);

  const bannerTheme = BANNER_THEME_BY_TYPE[dashboardType] || BANNER_THEME_BY_TYPE.CUSTOM;
  const roleDisplayBadge =
    dashboardType === 'CUSTOM'
      ? `${data?.role || user?.roles?.[0] || 'Nhân sự'} • Trang Tổng Quan RBAC`
      : bannerTheme.badge;

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Row 0: Above-the-fold Banner (Instant via Summary / Cache) */}
      <div
        className={`bg-gradient-to-r ${bannerTheme.gradient} rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-xl relative overflow-hidden`}
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 transform pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wide uppercase inline-flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 ai-glow" /> SmartSchedule AI Clinic Engine v3.2
            </span>
            <span className="px-3 py-1 bg-slate-900/25 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wide">
              {roleDisplayBadge}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {data?.greetingTitle || `Xin chào, ${user?.fullName || 'Nhân sự'}! 👋`}
          </h1>

          <p className="text-xs md:text-sm text-sky-100 leading-relaxed max-w-2xl">
            {data?.greetingSubtitle ||
              'Đang đồng bộ dữ liệu tổng quan phù hợp với vai trò và quyền hạn của bạn.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          title="Xóa cache và làm mới dữ liệu thực tế"
          className="absolute right-5 top-5 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer hidden sm:flex items-center gap-1 text-xs font-semibold backdrop-blur-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Row 1: Above-the-fold Role KPIs (Instant via Summary / Cache) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.kpis && data.kpis.length > 0 ? (
          data.kpis.map((kpi, idx) => {
            const colors = getKpiColors(kpi.colorType, idx);
            return (
              <StatCard
                key={`${kpi.title}-${idx}`}
                title={kpi.title}
                value={kpi.value}
                subtext={kpi.subtext}
                change={kpi.change}
                isIncrease={kpi.isIncrease ?? true}
                icon={getKpiIcon(kpi, idx)}
                iconBgColor={colors.bg}
                iconTextColor={colors.text}
              />
            );
          })
        ) : (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-32 rounded-3xl bg-white border border-slate-200/80 p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="h-3 w-1/2 bg-slate-200 rounded" />
              <div className="h-7 w-2/3 bg-slate-200 rounded" />
              <div className="h-3 w-3/4 bg-slate-100 rounded" />
            </div>
          ))
        )}
      </div>

      {/* Row 2: Lazy AI Widget Cards (Only when AI module checked in RBAC & scrolled >=35%) */}
      {canViewAi && (
        <LazyDashboardSection<{
          aiWidgetStats?: {
            aiConsultationCount: number;
            aiConsultationAccepted: number;
            aiSlotUsageCount: number;
            zaloInteractionRate: number;
          };
        }>
          sectionKey="ai_widgets"
          cacheKey={cacheKey}
          branchId={selectedBranchId}
          refreshNonce={refreshNonce}
          minHeightClass="min-h-[180px]"
          loadingLabel="Cuộn để tải số liệu AI Insights..."
        >
          {(sec) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 text-xs">
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
                    {sec?.aiWidgetStats?.aiConsultationCount ?? 0} Lượt Tư Vấn Phác Đồ
                  </h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Đã ghi nhận {sec?.aiWidgetStats?.aiConsultationAccepted ?? 0} ca bệnh nhân chấp nhận đặt lịch khám trực tiếp theo phác đồ AI.
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
                    {sec?.aiWidgetStats?.aiSlotUsageCount ?? 0} Ca Khám Tối Ưu
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
                    {sec?.aiWidgetStats?.zaloInteractionRate ?? 85}% Tỷ Lệ Tương Tác
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
        </LazyDashboardSection>
      )}

      {/* Row 3+: Role-Specific Workspace (Scroll-Triggered 35% + Two-Tier SWR Cache) */}
      {data && (
        <>
          {dashboardType === 'DOCTOR' && (
            <DoctorOverviewView
              data={data}
              cacheKey={cacheKey}
              branchId={selectedBranchId}
              refreshNonce={refreshNonce}
            />
          )}
          {dashboardType === 'RECEPTIONIST' && (
            <ReceptionistOverviewView
              data={data}
              cacheKey={cacheKey}
              branchId={selectedBranchId}
              refreshNonce={refreshNonce}
            />
          )}
          {dashboardType === 'ACCOUNTANT' && (
            <AccountantOverviewView
              data={data}
              cacheKey={cacheKey}
              branchId={selectedBranchId}
              refreshNonce={refreshNonce}
            />
          )}
          {dashboardType === 'NURSE' && (
            <NurseOverviewView
              data={data}
              cacheKey={cacheKey}
              branchId={selectedBranchId}
              refreshNonce={refreshNonce}
            />
          )}
          {dashboardType === 'TECHNICIAN' && (
            <TechnicianOverviewView
              data={data}
              cacheKey={cacheKey}
              branchId={selectedBranchId}
              refreshNonce={refreshNonce}
            />
          )}
          {dashboardType === 'BRANCH_MANAGER' && (
            <BranchManagerOverviewView
              data={data}
              cacheKey={cacheKey}
              branchId={selectedBranchId}
              refreshNonce={refreshNonce}
            />
          )}
          {dashboardType === 'CUSTOM' && (
            <CustomRoleOverviewView
              data={data}
              userRoleCode={userRoleCode}
              user={user}
              cacheKey={cacheKey}
              branchId={selectedBranchId}
              refreshNonce={refreshNonce}
            />
          )}
          {dashboardType === 'OWNER' && (
            <OwnerOverviewView
              data={data}
              cacheKey={cacheKey}
              branchId={selectedBranchId}
              refreshNonce={refreshNonce}
            />
          )}
        </>
      )}
    </div>
  );
};
