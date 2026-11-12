export type OverviewDashboardType =
  | 'OWNER'
  | 'BRANCH_MANAGER'
  | 'DOCTOR'
  | 'RECEPTIONIST'
  | 'ACCOUNTANT'
  | 'NURSE'
  | 'TECHNICIAN'
  | 'CUSTOM';

export interface OverviewAppointment {
  id: string;
  rawId?: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorId?: string;
  chairName?: string;
  branchName?: string;
  service: string;
  dateTime: string;
  startTimeIso?: string;
  status: string;
  statusVi?: string;
  isAiRecommended?: boolean;
}

export interface ActiveStaffMember {
  id: string;
  employeeCode?: string;
  name: string;
  email: string;
  phone: string;
  roleName?: string;
  specialty: string;
  avatar: string;
  status: string;
  branchName: string;
  commissionRate?: number;
  workDays?: string[];
  workHours?: string;
}

export interface OverviewKpiItem {
  title: string;
  value: string;
  subtext: string;
  change?: string;
  isIncrease?: boolean;
  colorType?: string;
  iconType?: string;
}

export interface RecentInvoiceItem {
  id: string;
  invoiceCode: string;
  patientName: string;
  patientPhone: string;
  service: string;
  finalAmount: number;
  paidAmount: number;
  method: string;
  status: string;
  branchName: string;
  createdAtStr: string;
}

export interface OperatoryChairItem {
  id: string;
  code: string;
  name: string;
  status: string;
  roomName: string;
  branchName: string;
  doctorName: string;
}

export interface MaintenanceTaskItem {
  id: string;
  logCode: string;
  equipmentCode: string;
  equipmentName: string;
  location: string;
  actionType: string;
  findings: string;
  status: string;
  technicianName: string;
  scheduledAt: string;
  isUrgent: boolean;
}

export interface UpcomingInspectionItem {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  status: string;
  nextInspectionAt: string;
  urgencyAlert: string | null;
}

export interface AssignedServiceItem {
  id: string;
  code: string;
  name: string;
  categoryName: string;
  standardPrice: number;
  durationMinutes: number;
}

export interface OverviewData {
  role: string;
  dashboardType: OverviewDashboardType;
  roleMeta?: {
    roleName: string;
    roleDescription: string;
    permissions: string[];
    isCustom: boolean;
  };
  user: {
    id: string;
    fullName: string;
    roleName: string;
    branchName?: string;
  };
  greetingTitle: string;
  greetingSubtitle: string;
  kpis: OverviewKpiItem[];
  quickCounts?: Record<string, number>;
  appointments?: OverviewAppointment[];
  todayAppointments?: OverviewAppointment[];
  activeStaff?: ActiveStaffMember[];
  aiWidgetStats?: {
    aiConsultationCount: number;
    aiConsultationAccepted: number;
    aiSlotUsageCount: number;
    zaloInteractionRate: number;
  };
  rolePanels?: {
    appointmentStatus: {
      totalToday: number;
      pending: number;
      confirmed: number;
      checkedIn: number;
      inProgress: number;
      completed: number;
      cancelled: number;
    };
    financeSummary: {
      todayRevenue: number;
      todayVietQr: number;
      todayPos: number;
      todayCash: number;
      monthRevenue: number;
      monthVietQr: number;
      monthPos: number;
      monthCash: number;
      unpaidDebtTotal: number;
      unpaidInvoicesCount: number;
      recentInvoices: RecentInvoiceItem[];
      branchBreakdown: Array<{
        branchName: string;
        revenue: number;
        debt: number;
        count: number;
      }>;
    };
    patientSummary: {
      totalPatients: number;
      newPatientsWeek: number;
    };
    chairSummary: {
      total: number;
      available: number;
      inUse: number;
      sterilizing: number;
      maintenance: number;
    };
    chairs: OperatoryChairItem[];
    equipmentSummary: {
      total: number;
      operational: number;
      maintenance: number;
      sterilizing: number;
      urgent: number;
      byCategory: Record<string, number>;
    };
    maintenanceTasks: MaintenanceTaskItem[];
    upcomingInspections: UpcomingInspectionItem[];
    doctorsOnDuty: ActiveStaffMember[];
    personalProfile: {
      specialty: string;
      experienceYears: number;
      ratingAverage: number;
      totalReviews: number;
      workDays: string[];
      workHours: string;
      lunchBreak: string;
      assignedServices: AssignedServiceItem[];
      weekShifts: Array<{
        id: string;
        workDate: string;
        branchName: string;
        isLeave: boolean;
        notes: string;
      }>;
    };
    clinicSummary: {
      activeBranchesCount: number;
      activeServicesCount: number;
      onLeaveTodayCount: number;
      commissionStaffCount: number;
    };
  };
  stats: {
    revenueToday: number;
    appointmentsCount: number;
    weekAppointmentsCount: number;
    totalActiveStaff: number;
    aiOptimizationRate: string;
  };
}
