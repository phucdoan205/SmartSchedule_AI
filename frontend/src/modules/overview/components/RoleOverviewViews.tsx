import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  LayoutDashboard,
  QrCode,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCheck,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { rolePermissionStore } from '../../../services/rolePermissionStore';
import { LazyDashboardSection } from './LazyDashboardSection';
import type {
  ActiveStaffMember,
  AssignedServiceItem,
  MaintenanceTaskItem,
  OperatoryChairItem,
  OverviewAppointment,
  OverviewData,
  RecentInvoiceItem,
  UpcomingInspectionItem,
} from '../types';

const formatVnd = (n: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(n || 0))} VNĐ`;

export interface RoleSectionProps {
  data: OverviewData;
  cacheKey: string;
  branchId?: string;
  refreshNonce: number;
}

const MODULE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  CalendarCheck,
  Users,
  UserCheck,
  CalendarDays,
  DollarSign,
  FileSpreadsheet,
  Building2,
  Receipt,
  BarChart3,
  Wrench,
  Bell,
  Sparkles,
  ScrollText,
  Settings,
};

const CHAIR_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  AVAILABLE: { label: 'Sẵn sàng', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  IN_USE: { label: 'Đang khám', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  STERILIZING: { label: 'Đang vô trùng', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  MAINTENANCE: { label: 'Bảo trì', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const INVOICE_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  PAID: { label: 'Đã thanh toán', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PARTIAL: { label: 'Thanh toán 1 phần', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  UNPAID: { label: 'Chưa thanh toán', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const CATEGORY_LABELS: Record<string, string> = {
  dental_chair: 'Ghế nha khoa & Điều trị',
  xray: 'Máy X-Quang & CT Cone Beam',
  implant: 'Thiết bị phẫu thuật Implant',
  hvac: 'Hệ thống vô trùng & HVAC',
};

const buildAppointmentColumns = (hideDoctor = false): Column<OverviewAppointment>[] => {
  const cols: Column<OverviewAppointment>[] = [
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
  ];

  if (!hideDoctor) {
    cols.push({
      header: 'BÁC SĨ PHỤ TRÁCH',
      cell: (row) => (
        <span className="font-semibold text-slate-700 text-xs sm:text-sm whitespace-nowrap">{row.doctorName}</span>
      ),
    });
  }

  cols.push(
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
  );

  return cols;
};

export const AppointmentsTableCard: React.FC<{
  title: string;
  subtitle: string;
  appointments: OverviewAppointment[];
  hideDoctor?: boolean;
  headerAction?: React.ReactNode;
}> = ({ title, subtitle, appointments, hideDoctor = false, headerAction }) => {
  const columns = useMemo(() => buildAppointmentColumns(hideDoctor), [hideDoctor]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-600" /> {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
            {appointments.length} Ca khám
          </span>
          {headerAction}
        </div>
      </div>

      <div className="max-h-[440px] overflow-y-auto pr-1">
        <DataTable
          data={appointments}
          columns={columns}
          title=""
          itemsPerPage={15}
          searchPlaceholder="Tìm kiếm theo mã hẹn, tên bệnh nhân, dịch vụ..."
        />
      </div>
    </div>
  );
};

export const ActiveStaffCard: React.FC<{
  title?: string;
  subtitle?: string;
  staff: ActiveStaffMember[];
  showCommission?: boolean;
}> = ({
  title = 'Nhân Sự Đang Hoạt Động',
  subtitle = 'Bác sĩ, lễ tân, điều dưỡng & KTV',
  staff,
  showCommission = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" /> {title}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/staff')}
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 cursor-pointer"
        >
          Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-[440px] overflow-y-auto space-y-2.5 pr-1">
        {staff.length > 0 ? (
          staff.map((member) => (
            <div
              key={member.id}
              onClick={() => navigate('/admin/staff')}
              className="p-3 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{member.name}</h4>
                  <p className="text-[11px] text-teal-600 font-semibold truncate">{member.specialty}</p>
                  <p className="text-[10px] text-slate-400 truncate">{member.branchName}</p>
                </div>
              </div>

              {showCommission ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                  HH {member.commissionRate ?? 0}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Hoạt động
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            Không có nhân sự phù hợp bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// 1. OWNER OVERVIEW (Lazy Appointments + Lazy Active Staff)
// ────────────────────────────────────────────────────────────
export const OwnerOverviewView: React.FC<RoleSectionProps> = ({
  cacheKey,
  branchId,
  refreshNonce,
}) => (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <LazyDashboardSection<{ appointments?: OverviewAppointment[] }>
      sectionKey="appointments_table"
      cacheKey={cacheKey}
      branchId={branchId}
      refreshNonce={refreshNonce}
      className="xl:col-span-2"
      minHeightClass="min-h-[340px]"
      loadingLabel="Cuộn xuống để tải lịch hẹn 7 ngày..."
    >
      {(sec) => (
        <AppointmentsTableCard
          title="Lịch Sử Lịch Hẹn Khám (7 Ngày Qua)"
          subtitle="Dữ liệu thực tế được cập nhật tự động kèm thời gian ngày giờ và trạng thái tiếng Việt"
          appointments={sec.appointments || []}
        />
      )}
    </LazyDashboardSection>

    <LazyDashboardSection<{ activeStaff?: ActiveStaffMember[] }>
      sectionKey="active_staff"
      cacheKey={cacheKey}
      branchId={branchId}
      refreshNonce={refreshNonce}
      minHeightClass="min-h-[340px]"
      loadingLabel="Cuộn xuống để tải danh sách nhân sự..."
    >
      {(sec) => <ActiveStaffCard staff={sec.activeStaff || []} />}
    </LazyDashboardSection>
  </div>
);

// ────────────────────────────────────────────────────────────
// 2. DOCTOR OVERVIEW
// ────────────────────────────────────────────────────────────
export const DoctorOverviewView: React.FC<RoleSectionProps> = ({
  data,
  cacheKey,
  branchId,
  refreshNonce,
}) => {
  const navigate = useNavigate();
  const todayCount = data.quickCounts?.todayAppointmentsCount ?? 0;
  const assignedServicesCount = data.quickCounts?.assignedServicesCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Quick Action Strip (Uses Summary counts directly) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/appointments')}
          className="p-4 rounded-2xl bg-white border border-sky-200/80 hover:border-sky-400 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">Lịch Hẹn Thông Minh</p>
              <p className="text-[11px] text-slate-500">{todayCount} ca khám của bạn hôm nay</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/patients')}
          className="p-4 rounded-2xl bg-white border border-teal-200/80 hover:border-teal-400 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">Hồ Sơ Bệnh Án & EMR</p>
              <p className="text-[11px] text-slate-500">Cập nhật phác đồ & sơ đồ răng 3D</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/profile')}
          className="p-4 rounded-2xl bg-white border border-indigo-200/80 hover:border-indigo-400 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">Hồ Sơ Chuyên Khoa</p>
              <p className="text-[11px] text-slate-500">{assignedServicesCount} dịch vụ phụ trách</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
        </button>
      </div>

      {/* Lazy 2-Column Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <LazyDashboardSection<{ appointments?: OverviewAppointment[] }>
          sectionKey="appointments_table"
          cacheKey={cacheKey}
          branchId={branchId}
          refreshNonce={refreshNonce}
          className="xl:col-span-2"
          minHeightClass="min-h-[340px]"
          loadingLabel="Cuộn để tải lịch khám của bạn..."
        >
          {(sec) => (
            <AppointmentsTableCard
              title="Lịch Khám & Bệnh Nhân Phụ Trách (7 Ngày)"
              subtitle="Chỉ hiển thị các ca khám được phân công trực tiếp cho bạn"
              appointments={sec.appointments || []}
              hideDoctor={true}
            />
          )}
        </LazyDashboardSection>

        <LazyDashboardSection<{
          personalProfile?: {
            specialty: string;
            workHours: string;
            lunchBreak: string;
            workDays: string[];
            assignedServices: AssignedServiceItem[];
          };
        }>
          sectionKey="doctor_profile"
          cacheKey={cacheKey}
          branchId={branchId}
          refreshNonce={refreshNonce}
          minHeightClass="min-h-[340px]"
          loadingLabel="Cuộn để tải ca trực & dịch vụ phụ trách..."
        >
          {(sec) => {
            const profile = sec.personalProfile;
            return (
              <div className="space-y-5">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" /> Ca Trực & Khung Giờ Chuyên Môn
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chuyên khoa:</span>
                      <span className="font-bold text-slate-800">{profile?.specialty || 'Răng Hàm Mặt'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Giờ làm việc:</span>
                      <span className="font-bold text-sky-700">{profile?.workHours || '08:00 - 17:30'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nghỉ trưa:</span>
                      <span className="font-semibold text-slate-700">{profile?.lunchBreak || '12:00 - 13:30'}</span>
                    </div>
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {(profile?.workDays || []).map((d) => (
                        <span key={d} className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-sky-700 font-bold text-[11px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Dịch Vụ Chuyên Môn Phụ Trách
                    </h3>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      {profile?.assignedServices?.length || 0} dịch vụ
                    </span>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
                    {profile?.assignedServices && profile.assignedServices.length > 0 ? (
                      profile.assignedServices.map((srv) => (
                        <div key={srv.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{srv.name}</p>
                            <p className="text-[10px] text-slate-400">{srv.categoryName} • {srv.durationMinutes} phút</p>
                          </div>
                          <span className="text-[11px] font-bold text-teal-700 shrink-0">
                            {srv.standardPrice > 0 ? formatVnd(srv.standardPrice) : 'Phân công chuẩn'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-4 text-center">Chưa gán dịch vụ cụ thể trong hồ sơ bác sĩ.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
        </LazyDashboardSection>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// 3. RECEPTIONIST OVERVIEW
// ────────────────────────────────────────────────────────────
export const ReceptionistOverviewView: React.FC<RoleSectionProps> = ({
  data,
  cacheKey,
  branchId,
  refreshNonce,
}) => {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'TODAY'>('ALL');
  const totalPatients = data.quickCounts?.totalPatients ?? 0;
  const unpaidCount = data.quickCounts?.unpaidInvoicesCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/appointments')}
          className="p-4 rounded-2xl bg-white border border-sky-200 hover:border-sky-400 shadow-xs flex items-center justify-between cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">Tiếp Đón & Quét QR Kiosk</p>
              <p className="text-[11px] text-slate-500">Check-in & điều phối ghế nha</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/patients')}
          className="p-4 rounded-2xl bg-white border border-teal-200 hover:border-teal-400 shadow-xs flex items-center justify-between cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">Tạo Hồ Sơ Khách Hàng</p>
              <p className="text-[11px] text-slate-500">{totalPatients} khách trên hệ thống</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/finance')}
          className="p-4 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-400 shadow-xs flex items-center justify-between cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">Lập Phiếu Thu & VietQR</p>
              <p className="text-[11px] text-slate-500">{unpaidCount} hóa đơn chờ thu</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <LazyDashboardSection<{
          appointments?: OverviewAppointment[];
          todayAppointments?: OverviewAppointment[];
        }>
          sectionKey="appointments_table"
          cacheKey={cacheKey}
          branchId={branchId}
          refreshNonce={refreshNonce}
          className="xl:col-span-2"
          minHeightClass="min-h-[340px]"
          loadingLabel="Cuộn để tải hàng đợi tiếp đón..."
        >
          {(sec) => {
            const all = sec.appointments || [];
            const todayList = sec.todayAppointments || [];
            const displayed =
              filterTab === 'PENDING'
                ? all.filter((a) => a.status === 'PENDING')
                : filterTab === 'TODAY'
                  ? todayList
                  : all;

            return (
              <AppointmentsTableCard
                title="Hàng Đợi Tiếp Đón & Điều Phối Lịch Hẹn"
                subtitle="Theo dõi ca chờ xác nhận, đã check-in tại quầy và lịch trong 7 ngày"
                appointments={displayed}
                headerAction={
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                    {(['ALL', 'PENDING', 'TODAY'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setFilterTab(tab)}
                        className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                          filterTab === tab ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {tab === 'ALL' ? '7 ngày' : tab === 'PENDING' ? 'Chờ xác nhận' : 'Hôm nay'}
                      </button>
                    ))}
                  </div>
                }
              />
            );
          }}
        </LazyDashboardSection>

        <LazyDashboardSection<{
          doctorsOnDuty?: ActiveStaffMember[];
          unpaidInvoices?: RecentInvoiceItem[];
        }>
          sectionKey="reception_panels"
          cacheKey={cacheKey}
          branchId={branchId}
          refreshNonce={refreshNonce}
          minHeightClass="min-h-[340px]"
          loadingLabel="Cuộn để tải bác sĩ trực & hóa đơn chờ thu..."
        >
          {(sec) => {
            const doctors = sec.doctorsOnDuty || [];
            const unpaidInvoices = sec.unpaidInvoices || [];
            return (
              <div className="space-y-5">
                <ActiveStaffCard
                  title="Bác Sĩ Chuyên Khoa Trực Tuyến"
                  subtitle="Tra cứu nhanh lịch bác sĩ để xếp lịch khách Walk-in"
                  staff={doctors}
                />

                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-rose-500" /> Hóa Đơn Chờ Thu Tại Quầy
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/finance')}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      Thu ngân
                    </button>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                    {unpaidInvoices.length > 0 ? (
                      unpaidInvoices.slice(0, 6).map((inv) => (
                        <div key={inv.id} className="p-3 rounded-2xl border border-rose-100 bg-rose-50/40 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{inv.patientName}</p>
                            <p className="text-[10px] text-slate-500">{inv.invoiceCode} • {inv.service}</p>
                          </div>
                          <span className="text-xs font-extrabold text-rose-600 shrink-0">{formatVnd(inv.finalAmount - inv.paidAmount)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-emerald-600 font-semibold py-4 text-center">Tất cả hóa đơn đã tất toán.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
        </LazyDashboardSection>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// 4. ACCOUNTANT OVERVIEW
// ────────────────────────────────────────────────────────────
export const AccountantOverviewView: React.FC<RoleSectionProps> = ({
  cacheKey,
  branchId,
  refreshNonce,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <LazyDashboardSection<{
        financeSummary?: {
          monthRevenue: number;
          monthVietQr: number;
          monthPos: number;
          monthCash: number;
          recentInvoices: RecentInvoiceItem[];
          branchBreakdown: Array<{ branchName: string; revenue: number; debt: number; count: number }>;
        };
      }>
        sectionKey="finance_overview"
        cacheKey={cacheKey}
        branchId={branchId}
        refreshNonce={refreshNonce}
        minHeightClass="min-h-[300px]"
        loadingLabel="Cuộn để tải dòng tiền & hóa đơn chi tiết..."
      >
        {(sec) => {
          const fin = sec.financeSummary;
          const monthTotal = fin?.monthRevenue || 0;
          const pct = (part: number) => (monthTotal > 0 ? Math.round((part / monthTotal) * 100) : 0);

          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-emerald-600" /> Cơ Cấu Kênh Thanh Toán (Tháng Này)
                      </h3>
                      <p className="text-xs text-slate-400">Đối soát VietQR tự động, máy POS và tiền mặt</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/finance')}
                      className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                    >
                      Sổ kế toán
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {[
                      { label: 'Chuyển khoản VietQR', amount: fin?.monthVietQr || 0, bar: 'bg-sky-500' },
                      { label: 'Thẻ / Máy POS', amount: fin?.monthPos || 0, bar: 'bg-indigo-500' },
                      { label: 'Tiền mặt tại quầy', amount: fin?.monthCash || 0, bar: 'bg-emerald-500' },
                    ].map((item) => {
                      const p = pct(item.amount);
                      return (
                        <div key={item.label} className="space-y-1.5">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>{item.label}</span>
                            <span>{formatVnd(item.amount)} ({p}%)</span>
                          </div>
                          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.bar}`} style={{ width: `${Math.min(100, p)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-sky-600" /> Doanh Thu & Công Nợ Theo Chi Nhánh
                      </h3>
                      <p className="text-xs text-slate-400">Số liệu tổng hợp trực tiếp từ hóa đơn PostgreSQL</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/staff/salary')}
                      className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-100 cursor-pointer"
                    >
                      Bảng lương
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[210px] overflow-y-auto pr-1">
                    {(fin?.branchBreakdown || []).map((b) => (
                      <div key={b.branchName} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{b.branchName}</p>
                          <p className="text-[11px] text-slate-400">{b.count} hóa đơn phát sinh</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-emerald-600">{formatVnd(b.revenue)}</p>
                          <p className="text-[10px] font-semibold text-rose-500">Nợ: {formatVnd(b.debt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-emerald-600" /> Hóa Đơn & Giao Dịch Gần Nhất
                    </h3>
                    <p className="text-xs text-slate-400">Kiểm tra đối soát trạng thái thanh toán thực tế</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    {fin?.recentInvoices?.length || 0} hóa đơn
                  </span>
                </div>

                <div className="max-h-[420px] overflow-y-auto space-y-2.5 pr-1">
                  {(fin?.recentInvoices || []).map((inv) => {
                    const badge = INVOICE_STATUS_BADGE[inv.status] || INVOICE_STATUS_BADGE.UNPAID;
                    return (
                      <div key={inv.id} className="p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                              {inv.invoiceCode}
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate">{inv.patientName}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{inv.service} • {inv.branchName}</p>
                          <p className="text-[10px] text-slate-400">{inv.createdAtStr} • Kênh: {inv.method}</p>
                        </div>

                        <div className="text-right space-y-1 shrink-0">
                          <p className="text-xs font-extrabold text-slate-900">{formatVnd(inv.finalAmount)}</p>
                          <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }}
      </LazyDashboardSection>

      <LazyDashboardSection<{ activeStaff?: ActiveStaffMember[] }>
        sectionKey="active_staff"
        cacheKey={cacheKey}
        branchId={branchId}
        refreshNonce={refreshNonce}
        minHeightClass="min-h-[280px]"
        loadingLabel="Cuộn để tải bảng tỷ lệ hoa hồng nhân sự..."
      >
        {(sec) => (
          <ActiveStaffCard
            title="Nhân Sự & Tỷ Lệ Hoa Hồng"
            subtitle="Dữ liệu đồng bộ trực tiếp với bảng lương"
            staff={sec.activeStaff || []}
            showCommission={true}
          />
        )}
      </LazyDashboardSection>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// 5. NURSE OVERVIEW
// ────────────────────────────────────────────────────────────
export const NurseOverviewView: React.FC<RoleSectionProps> = ({
  cacheKey,
  branchId,
  refreshNonce,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <LazyDashboardSection<{ chairs?: OperatoryChairItem[] }>
        sectionKey="chairs_panel"
        cacheKey={cacheKey}
        branchId={branchId}
        refreshNonce={refreshNonce}
        minHeightClass="min-h-[240px]"
        loadingLabel="Cuộn để tải trạng thái ghế nha..."
      >
        {(sec) => (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" /> Bảng Trạng Thái Ghế Nha & Vô Trùng Phòng Khám
                </h3>
                <p className="text-xs text-slate-400">Giám sát ghế sẵn sàng, ghế đang điều trị và quy trình khử khuẩn vô trùng</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/appointments')}
                className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 hover:bg-teal-100 cursor-pointer"
              >
                Xem điều phối ca khám
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(sec.chairs || []).map((ch) => {
                const st = CHAIR_STATUS_BADGE[ch.status] || CHAIR_STATUS_BADGE.AVAILABLE;
                return (
                  <div key={ch.id} className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-800">{ch.code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 truncate">{ch.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{ch.roomName}</p>
                    <p className="text-[10px] text-teal-700 font-semibold truncate">BS: {ch.doctorName}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </LazyDashboardSection>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <LazyDashboardSection<{ appointments?: OverviewAppointment[] }>
          sectionKey="appointments_table"
          cacheKey={cacheKey}
          branchId={branchId}
          refreshNonce={refreshNonce}
          className="xl:col-span-2"
          minHeightClass="min-h-[340px]"
          loadingLabel="Cuộn để tải danh sách ca khám hỗ trợ..."
        >
          {(sec) => (
            <AppointmentsTableCard
              title="Danh Sách Ca Khám Cần Hỗ Trợ & Chuẩn Bị Dụng Cụ"
              subtitle="Theo dõi bệnh nhân, bác sĩ phụ trách và dịch vụ để chuẩn bị khay vô trùng"
              appointments={sec.appointments || []}
            />
          )}
        </LazyDashboardSection>

        <LazyDashboardSection<{
          personalProfile?: { workHours: string; workDays: string[] };
          maintenanceTasks?: MaintenanceTaskItem[];
        }>
          sectionKey="nurse_shift"
          cacheKey={cacheKey}
          branchId={branchId}
          refreshNonce={refreshNonce}
          minHeightClass="min-h-[340px]"
          loadingLabel="Cuộn để tải ca trực & cảnh báo thiết bị..."
        >
          {(sec) => {
            const profile = sec.personalProfile;
            const maintTasks = sec.maintenanceTasks || [];
            return (
              <div className="space-y-5">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-sky-600" /> Ca Trực Của Bạn
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Giờ trực chuẩn:</span>
                      <span className="font-bold text-teal-800">{profile?.workHours || '08:00 - 17:30'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(profile?.workDays || []).map((d) => (
                        <span key={d} className="px-2 py-0.5 rounded-md bg-white border border-teal-200 text-teal-700 font-bold text-[11px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/staff/schedule')}
                    className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Xem chi tiết lịch làm việc
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-500" /> Thiết Bị Đang Bảo Trì / Lưu Ý
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/maintenance')}
                      className="text-xs font-semibold text-sky-600 cursor-pointer"
                    >
                      Chi tiết
                    </button>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                    {maintTasks.length > 0 ? (
                      maintTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="p-3 rounded-2xl border border-amber-100 bg-amber-50/40 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">{task.equipmentName}</span>
                            <span className="text-[10px] font-bold text-amber-700">{task.equipmentCode}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{task.actionType} • {task.location}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-emerald-600 font-semibold py-4 text-center">Toàn bộ thiết bị sẵn sàng hỗ trợ điều trị.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
        </LazyDashboardSection>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// 6. TECHNICIAN OVERVIEW
// ────────────────────────────────────────────────────────────
export const TechnicianOverviewView: React.FC<RoleSectionProps> = ({
  cacheKey,
  branchId,
  refreshNonce,
}) => {
  const navigate = useNavigate();

  return (
    <LazyDashboardSection<{
      equipmentSummary?: { byCategory: Record<string, number> };
      maintenanceTasks?: MaintenanceTaskItem[];
      upcomingInspections?: UpcomingInspectionItem[];
    }>
      sectionKey="maintenance_panel"
      cacheKey={cacheKey}
      branchId={branchId}
      refreshNonce={refreshNonce}
      minHeightClass="min-h-[340px]"
      loadingLabel="Cuộn để tải phiếu bảo trì & lịch kiểm định thiết bị..."
    >
      {(sec) => {
        const maintTasks = sec.maintenanceTasks || [];
        const equip = sec.equipmentSummary;
        const inspections = sec.upcomingInspections || [];

        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-600" /> Phiếu Bảo Trì & Sự Cố Thiết Bị Đang Mở
                  </h3>
                  <p className="text-xs text-slate-400">Ưu tiên xử lý cảnh báo máy CT Cone Beam, X-Quang & ghế nha khoa</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/maintenance/notifications')}
                    className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 hover:bg-amber-100 cursor-pointer"
                  >
                    Báo sự cố / Cảnh báo
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/maintenance')}
                    className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-100 cursor-pointer"
                  >
                    Kho thiết bị
                  </button>
                </div>
              </div>

              <div className="max-h-[440px] overflow-y-auto space-y-3 pr-1">
                {maintTasks.length > 0 ? (
                  maintTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => navigate('/admin/maintenance')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        t.isUrgent
                          ? 'border-rose-200 bg-rose-50/40 hover:bg-rose-50'
                          : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-extrabold text-sky-700 bg-white px-2 py-0.5 rounded-md border border-sky-200">
                            {t.logCode}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">
                            {t.equipmentCode} — {t.equipmentName}
                          </span>
                          {t.isUrgent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Cảnh báo khẩn
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-700">{t.actionType}: {t.findings}</p>
                        <p className="text-[11px] text-slate-400">{t.location} • Phụ trách: {t.technicianName}</p>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                          {t.status === 'IN_PROGRESS' ? 'Đang xử lý' : 'Chờ xử lý'}
                        </span>
                        <p className="text-[10px] text-slate-400">{t.scheduledAt}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Không có phiếu bảo trì tồn đọng</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" /> Phân Bổ Nhóm Thiết Bị
                </h3>
                <div className="space-y-2 text-xs">
                  {Object.entries(equip?.byCategory || {}).map(([cat, count]) => (
                    <div key={cat} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-700">{CATEGORY_LABELS[cat] || cat}</span>
                      <span className="font-extrabold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                        {count} máy
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" /> Lịch Kiểm Định Sắp Tới
                </h3>
                <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1">
                  {inspections.map((eq) => (
                    <div key={eq.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate">{eq.code} • {eq.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{eq.location}</p>
                      <p className="text-[10px] font-bold text-teal-700">Hạn kiểm định: {eq.nextInspectionAt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </LazyDashboardSection>
  );
};

// ────────────────────────────────────────────────────────────
// 7. BRANCH MANAGER OVERVIEW
// ────────────────────────────────────────────────────────────
export const BranchManagerOverviewView: React.FC<RoleSectionProps> = ({
  cacheKey,
  branchId,
  refreshNonce,
}) => (
  <div className="space-y-6">
    <LazyDashboardSection<{
      appointmentStatus?: { totalToday: number; pending: number; checkedIn: number; completed: number };
      chairSummary?: { available: number; total: number; inUse: number; sterilizing: number; maintenance: number };
      equipmentSummary?: { operational: number; total: number; maintenance: number; urgent: number };
    }>
      sectionKey="branch_ops"
      cacheKey={cacheKey}
      branchId={branchId}
      refreshNonce={refreshNonce}
      minHeightClass="min-h-[150px]"
      loadingLabel="Cuộn để tải trạng thái vận hành cơ sở..."
    >
      {(sec) => {
        const statusBreak = sec.appointmentStatus;
        const chairs = sec.chairSummary;
        const equip = sec.equipmentSummary;
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <p className="text-[11px] font-extrabold text-sky-700 uppercase">Tiến Độ Ca Khám Hôm Nay</p>
              <p className="text-xl font-black text-slate-900">{statusBreak?.totalToday || 0} Ca</p>
              <p className="text-xs text-slate-500">
                Chờ xác nhận: {statusBreak?.pending || 0} • Đã check-in: {statusBreak?.checkedIn || 0} • Hoàn thành: {statusBreak?.completed || 0}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <p className="text-[11px] font-extrabold text-teal-700 uppercase">Công Suất Ghế Nha Chi Nhánh</p>
              <p className="text-xl font-black text-slate-900">{chairs?.available || 0}/{chairs?.total || 0} Sẵn sàng</p>
              <p className="text-xs text-slate-500">
                Đang khám: {chairs?.inUse || 0} • Vô trùng: {chairs?.sterilizing || 0} • Bảo trì: {chairs?.maintenance || 0}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <p className="text-[11px] font-extrabold text-amber-700 uppercase">Tình Trạng Thiết Bị Cơ Sở</p>
              <p className="text-xl font-black text-slate-900">{equip?.operational || 0}/{equip?.total || 0} Ổn định</p>
              <p className="text-xs text-slate-500">
                Cần bảo trì: {equip?.maintenance || 0} • Cảnh báo khẩn: {equip?.urgent || 0}
              </p>
            </div>
          </div>
        );
      }}
    </LazyDashboardSection>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <LazyDashboardSection<{ appointments?: OverviewAppointment[] }>
        sectionKey="appointments_table"
        cacheKey={cacheKey}
        branchId={branchId}
        refreshNonce={refreshNonce}
        className="xl:col-span-2"
        minHeightClass="min-h-[340px]"
        loadingLabel="Cuộn để tải lịch hẹn chi nhánh..."
      >
        {(sec) => (
          <AppointmentsTableCard
            title="Lịch Hẹn Tại Chi Nhánh (7 Ngày)"
            subtitle="Dữ liệu lọc theo cơ sở bạn quản lý"
            appointments={sec.appointments || []}
          />
        )}
      </LazyDashboardSection>

      <LazyDashboardSection<{ activeStaff?: ActiveStaffMember[] }>
        sectionKey="active_staff"
        cacheKey={cacheKey}
        branchId={branchId}
        refreshNonce={refreshNonce}
        minHeightClass="min-h-[340px]"
        loadingLabel="Cuộn để tải đội ngũ chi nhánh..."
      >
        {(sec) => (
          <ActiveStaffCard
            title="Đội Ngũ Nhân Sự Chi Nhánh"
            subtitle="Bác sĩ, lễ tân, điều dưỡng thuộc cơ sở"
            staff={sec.activeStaff || []}
          />
        )}
      </LazyDashboardSection>
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────
// 8. CUSTOM FUTURE ROLE (DYNAMIC RBAC-ADAPTIVE + LAZY SECTIONS)
// ────────────────────────────────────────────────────────────
export const CustomRoleOverviewView: React.FC<
  RoleSectionProps & {
    userRoleCode: string;
    user: any;
  }
> = ({ data, userRoleCode, user, cacheKey, branchId, refreshNonce }) => {
  const navigate = useNavigate();
  const modules = rolePermissionStore.getModules();
  const allowedModules = useMemo(
    () =>
      modules.filter(
        (m) => m.code !== 'overview' && rolePermissionStore.isModuleAllowedForRole(userRoleCode, m.path, user),
      ),
    [modules, userRoleCode, user],
  );

  const hasCode = (codes: string[]) => allowedModules.some((m) => codes.includes(m.code));

  const showAppointments = hasCode(['appointments', 'patients']);
  const showStaff = hasCode(['staff', 'staff_schedule', 'staff_leave']);
  const showFinance = hasCode(['finance', 'staff_salary']);
  const showMaintenance = hasCode(['maintenance', 'maintenance_notifications']);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Chức Năng Được Phân Quyền Cho Vai Trò "{data.role}"
            </h3>
            <p className="text-xs text-slate-400">
              Trang tổng quan tự động thích ứng theo cấu hình trong Bảng phân quyền RBAC Matrix
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
            {allowedModules.length} Module khả dụng
          </span>
        </div>

        {allowedModules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allowedModules.map((mod) => {
              const IconComp = MODULE_ICON_MAP[mod.iconName] || LayoutDashboard;
              const grantedSubs = mod.subPermissions.filter((sp) =>
                rolePermissionStore.hasSubPermission(userRoleCode, sp.code, user),
              ).length;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => navigate(mod.path)}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/40 transition-all text-left flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {mod.name.replace('Module: ', '')}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {grantedSubs}/{mod.subPermissions.length} quyền chi tiết
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            Vai trò này hiện chỉ được cấp quyền xem Trang tổng quan. Hãy cấp thêm module trong Cấu hình hệ thống nếu cần.
          </p>
        )}
      </div>

      {showFinance && (
        <AccountantOverviewView
          data={data}
          cacheKey={cacheKey}
          branchId={branchId}
          refreshNonce={refreshNonce}
        />
      )}

      {showMaintenance && !showFinance && (
        <TechnicianOverviewView
          data={data}
          cacheKey={cacheKey}
          branchId={branchId}
          refreshNonce={refreshNonce}
        />
      )}

      {(showAppointments || showStaff) && !showFinance && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {showAppointments && (
            <LazyDashboardSection<{ appointments?: OverviewAppointment[] }>
              sectionKey="appointments_table"
              cacheKey={cacheKey}
              branchId={branchId}
              refreshNonce={refreshNonce}
              className={showStaff ? 'xl:col-span-2' : 'xl:col-span-3'}
              minHeightClass="min-h-[340px]"
              loadingLabel="Cuộn để tải lịch hẹn..."
            >
              {(sec) => (
                <AppointmentsTableCard
                  title="Lịch Hẹn Khám Gần Đây (7 Ngày)"
                  subtitle="Hiển thị do vai trò được cấp quyền Lịch hẹn / Bệnh nhân"
                  appointments={sec.appointments || []}
                />
              )}
            </LazyDashboardSection>
          )}
          {showStaff && (
            <LazyDashboardSection<{ activeStaff?: ActiveStaffMember[] }>
              sectionKey="active_staff"
              cacheKey={cacheKey}
              branchId={branchId}
              refreshNonce={refreshNonce}
              className={showAppointments ? '' : 'xl:col-span-3'}
              minHeightClass="min-h-[340px]"
              loadingLabel="Cuộn để tải danh sách nhân sự..."
            >
              {(sec) => <ActiveStaffCard staff={sec.activeStaff || []} />}
            </LazyDashboardSection>
          )}
        </div>
      )}
    </div>
  );
};
