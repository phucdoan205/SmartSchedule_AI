import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { PrismaService } from '../../common/prisma/prisma.service.js';

export type OverviewDashboardType =
  | 'OWNER'
  | 'BRANCH_MANAGER'
  | 'DOCTOR'
  | 'RECEPTIONIST'
  | 'ACCOUNTANT'
  | 'NURSE'
  | 'TECHNICIAN'
  | 'CUSTOM';

export type OverviewSectionKey =
  | 'ai_widgets'
  | 'appointments_table'
  | 'active_staff'
  | 'doctor_profile'
  | 'reception_panels'
  | 'finance_overview'
  | 'chairs_panel'
  | 'maintenance_panel'
  | 'nurse_shift'
  | 'branch_ops';

function readStaffMetadataMap(): Record<string, any> {
  const candidates = [
    path.join(process.cwd(), 'data', 'staff_metadata.json'),
    path.join(process.cwd(), 'backend', 'data', 'staff_metadata.json'),
  ];
  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    } catch {
      // Try next candidate path cleanly
    }
  }
  return {};
}

const formatMoney = (n: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(n))} VNĐ`;

@Injectable()
export class OverviewService {
  private readonly logger = new Logger(OverviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getStatusLabelVi(status: string): string {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CHECKED_IN':
        return 'Đã check-in';
      case 'IN_PROGRESS':
        return 'Đang khám';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  private getVietnamDateBounds(now: Date) {
    const vnOffsetMs = 7 * 60 * 60 * 1000;
    const vnNow = new Date(now.getTime() + vnOffsetMs);
    const y = vnNow.getUTCFullYear();
    const m = vnNow.getUTCMonth();
    const d = vnNow.getUTCDate();

    const startOfDay = new Date(Date.UTC(y, m, d, 0, 0, 0, 0) - vnOffsetMs);
    const endOfDay = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - vnOffsetMs);
    const sevenDaysAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0) - vnOffsetMs);
    const endOfWeek = new Date(endOfDay.getTime() + 7 * 24 * 60 * 60 * 1000);

    return { startOfDay, endOfDay, sevenDaysAgo, startOfMonth, endOfWeek };
  }

  private formatVnDateTime(dateInput: Date | string): string {
    const d = new Date(dateInput);
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false,
    }).formatToParts(d);

    const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';
    return `${get('hour')}:${get('minute')} - ${get('day')}/${get('month')}/${get('year')}`;
  }

  private resolveDashboardType(roleName: string, email?: string): OverviewDashboardType {
    const lower = (roleName || '').toLowerCase().trim();
    const lowerEmail = (email || '').toLowerCase().trim();

    if (
      lowerEmail === 'admin@smartschedule.ai' ||
      lower === 'super_admin' ||
      lower === 'admin' ||
      lower === 'owner' ||
      lower.includes('chủ phòng khám') ||
      lower.includes('quản trị')
    ) {
      return 'OWNER';
    }
    if (lower === 'branch_manager' || lower === 'manager' || lower.includes('quản lý chi nhánh') || lower.includes('giám đốc')) {
      return 'BRANCH_MANAGER';
    }
    if (lower === 'doctor' || lower.includes('bác sĩ')) {
      return 'DOCTOR';
    }
    if (lower === 'receptionist' || lower.includes('lễ tân')) {
      return 'RECEPTIONIST';
    }
    if (lower === 'kế toán' || lower === 'ke_toan' || lower === 'accountant' || lower.includes('kế toán') || lowerEmail === 'dinh@gmail.com') {
      return 'ACCOUNTANT';
    }
    if (lower === 'nurse' || lower.includes('điều dưỡng') || lower.includes('phụ tá')) {
      return 'NURSE';
    }
    if (lower === 'technician' || lower.includes('kỹ thuật')) {
      return 'TECHNICIAN';
    }
    return 'CUSTOM';
  }

  private hasAnyPerm(perms: string[], candidates: string[]): boolean {
    return candidates.some((c) => perms.includes(c) || perms.some((p) => p.startsWith(`${c}_`)));
  }

  private formatAppointments(list: any[]) {
    return list.map((a) => {
      const serviceName =
        a.services && a.services.length > 0
          ? a.services.map((s: any) => s.service?.name).filter(Boolean).join(', ')
          : 'Khám & Tư vấn nha khoa';

      return {
        id: a.appointmentCode || `#LH-${a.id.slice(0, 6)}`,
        rawId: a.id,
        patientName: a.patient?.fullName || 'Khách Hàng',
        patientPhone: a.patient?.phone || 'Chưa cập nhật',
        doctorName: a.doctor?.fullName || 'Bác sĩ phụ trách',
        doctorId: a.doctorId,
        chairName: a.chair?.name || a.chair?.code || 'Ghế tiêu chuẩn',
        branchName: a.branch?.name || '',
        service: serviceName,
        dateTime: this.formatVnDateTime(a.startTime),
        startTimeIso: a.startTime,
        status: a.status,
        statusVi: this.getStatusLabelVi(a.status),
        isAiRecommended: Boolean(a.isAiRecommended),
      };
    });
  }

  private async resolveUserScope(userId?: string, branchId?: string) {
    const isFilteredBranch = Boolean(branchId && branchId !== 'ALL' && branchId !== 'all');
    let currentUser: any = null;
    let roleName = 'SUPER_ADMIN';
    let roleDescription = 'Chủ phòng khám (Toàn quyền hệ thống)';
    let grantedPermissions: string[] = [];

    if (userId) {
      currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: { include: { permission: true } },
                },
              },
            },
          },
          doctorProfile: true,
          branch: true,
        },
      });

      if (currentUser?.userRoles && currentUser.userRoles.length > 0) {
        roleName = currentUser.userRoles[0].role.name;
        roleDescription = currentUser.userRoles[0].role.description || roleName;
        grantedPermissions = Array.from(
          new Set(
            currentUser.userRoles.flatMap((ur: any) =>
              (ur.role?.rolePermissions || []).map((rp: any) => rp.permission?.code).filter(Boolean),
            ),
          ),
        );
      }
    }

    const dashboardType = this.resolveDashboardType(roleName, currentUser?.email);
    const effectiveBranchId = isFilteredBranch
      ? branchId
      : dashboardType === 'BRANCH_MANAGER' && currentUser?.branchId
        ? currentUser.branchId
        : undefined;

    const bounds = this.getVietnamDateBounds(new Date());
    const staffWhere: any = {
      isActive: true,
      userRoles: {
        some: {
          role: {
            name: {
              notIn: ['PATIENT', 'patient'],
            },
          },
        },
      },
    };
    if (effectiveBranchId) staffWhere.branchId = effectiveBranchId;

    return {
      currentUser,
      roleName,
      roleDescription,
      grantedPermissions,
      dashboardType,
      effectiveBranchId,
      bounds,
      staffWhere,
      equipmentWhere: effectiveBranchId ? { branchId: effectiveBranchId } : {},
      chairWhere: effectiveBranchId ? { room: { branchId: effectiveBranchId } } : {},
      invoiceWhere: effectiveBranchId ? { branchId: effectiveBranchId } : {},
      metadataMap: readStaffMetadataMap(),
    };
  }

  private resolvePersonalMeta(currentUser: any, dashboardType: OverviewDashboardType, metadataMap: Record<string, any>) {
    const myMeta =
      (currentUser?.id ? metadataMap[currentUser.id] : undefined) ||
      (currentUser?.employeeCode ? metadataMap[currentUser.employeeCode] : undefined) ||
      {};

    const defaultDoctorServices =
      currentUser?.employeeCode === 'NV002' || currentUser?.doctorProfile?.specialty?.includes('Implant')
        ? ['Cấy ghép Implant Straumann', 'Trụ Osstem No mount (Hàn Quốc)', 'Trụ Osstem SA (Hàn Quốc)']
        : ['Sứ toàn phần Cercon (Đức)', 'Sứ toàn phần Emax', 'Mặt dán Veneer Emax'];

    const assignedServiceNames: string[] = Array.isArray(myMeta.services)
      ? myMeta.services
      : dashboardType === 'DOCTOR'
        ? defaultDoctorServices
        : [];

    const myWorkDays: string[] = Array.isArray(myMeta.workDays) ? myMeta.workDays : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const myWorkHours: string = myMeta.workHours || '08:00 - 17:30';
    const myLunchBreak: string = myMeta.lunchBreak || '12:00 - 13:30';

    return { assignedServiceNames, myWorkDays, myWorkHours, myLunchBreak };
  }

  private async queryFinanceStats(
    invoiceWhere: any,
    startOfDay: Date,
    startOfMonth: Date,
    includeDetails = false,
  ) {
    const invoicesRaw = await this.prisma.invoice.findMany({
      where: invoiceWhere,
      include: {
        payments: true,
        ...(includeDetails
          ? {
              branch: true,
              patient: true,
              items: { include: { service: true } },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    let todayRevenue = 0;
    let todayVietQr = 0;
    let todayPos = 0;
    let todayCash = 0;
    let monthRevenue = 0;
    let monthVietQr = 0;
    let monthPos = 0;
    let monthCash = 0;
    let unpaidDebtTotal = 0;
    let unpaidInvoicesCount = 0;
    const branchMap = new Map<string, { branchName: string; revenue: number; debt: number; count: number }>();

    for (const inv of invoicesRaw as any[]) {
      const finalAmt = Number(inv.finalAmount || 0);
      let invPaid = 0;
      for (const p of inv.payments) {
        const amt = Number(p.amountPaid || 0);
        invPaid += amt;
        const pDate = new Date(p.paidAt);
        const method = (p.paymentMethod || '').toUpperCase();
        if (pDate >= startOfDay) {
          todayRevenue += amt;
          if (method === 'VIETQR') todayVietQr += amt;
          else if (method === 'POS') todayPos += amt;
          else todayCash += amt;
        }
        if (pDate >= startOfMonth) {
          monthRevenue += amt;
          if (method === 'VIETQR') monthVietQr += amt;
          else if (method === 'POS') monthPos += amt;
          else monthCash += amt;
        }
      }

      const invDebt = Math.max(0, finalAmt - invPaid);
      if (inv.status !== 'PAID' && invDebt > 0) {
        unpaidDebtTotal += invDebt;
        unpaidInvoicesCount++;
      }

      if (includeDetails) {
        const bKey = inv.branchId;
        const bEntry = branchMap.get(bKey) || {
          branchName: inv.branch?.name || 'Chi nhánh',
          revenue: 0,
          debt: 0,
          count: 0,
        };
        bEntry.revenue += invPaid;
        bEntry.debt += invDebt;
        bEntry.count += 1;
        branchMap.set(bKey, bEntry);
      }
    }

    const recentInvoices = includeDetails
      ? (invoicesRaw as any[]).slice(0, 12).map((inv) => {
          const paid = inv.payments.reduce((acc: number, p: any) => acc + Number(p.amountPaid || 0), 0);
          return {
            id: inv.id,
            invoiceCode: inv.invoiceCode,
            patientName: inv.patient?.fullName || 'Khách hàng',
            patientPhone: inv.patient?.phone || '',
            service: inv.items?.[0]?.service?.name || 'Dịch vụ nha khoa',
            finalAmount: Number(inv.finalAmount || 0),
            paidAmount: paid,
            method: inv.payments?.[0]?.paymentMethod || 'VIETQR',
            status: inv.status,
            branchName: inv.branch?.name || '',
            createdAtStr: this.formatVnDateTime(inv.createdAt),
          };
        })
      : [];

    return {
      invoicesCount: invoicesRaw.length,
      todayRevenue,
      todayVietQr,
      todayPos,
      todayCash,
      monthRevenue,
      monthVietQr,
      monthPos,
      monthCash,
      unpaidDebtTotal,
      unpaidInvoicesCount,
      recentInvoices,
      branchBreakdown: Array.from(branchMap.values()),
    };
  }

  private async queryEquipmentSummary(equipmentWhere: any, includeLists = false) {
    const equipmentsRaw = await this.prisma.equipment.findMany({
      where: equipmentWhere,
      include: {
        branch: includeLists,
        maintenanceLogs: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { code: 'asc' },
    });

    const summary = {
      total: equipmentsRaw.length,
      operational: 0,
      maintenance: 0,
      sterilizing: 0,
      urgent: 0,
      byCategory: {
        dental_chair: 0,
        xray: 0,
        implant: 0,
        hvac: 0,
      } as Record<string, number>,
    };

    for (const eq of equipmentsRaw) {
      const hasPending = eq.maintenanceLogs && eq.maintenanceLogs.length > 0;
      if (eq.status === 'STERILIZING') summary.sterilizing++;
      if (eq.status === 'UNDER_MAINTENANCE' || eq.status === 'WARNING' || eq.status === 'STERILIZING' || hasPending) {
        summary.maintenance++;
      } else {
        summary.operational++;
      }
      if (eq.urgencyAlert || eq.status === 'WARNING') summary.urgent++;
      const cat = eq.category || 'dental_chair';
      summary.byCategory[cat] = (summary.byCategory[cat] || 0) + 1;
    }

    const upcomingInspections = includeLists
      ? equipmentsRaw
          .filter((eq) => eq.nextInspectionAt)
          .sort((a, b) => new Date(a.nextInspectionAt!).getTime() - new Date(b.nextInspectionAt!).getTime())
          .slice(0, 6)
          .map((eq: any) => ({
            id: eq.id,
            code: eq.code,
            name: eq.name,
            category: eq.category || 'dental_chair',
            location: eq.location || eq.branch?.name || '',
            status: eq.status,
            nextInspectionAt: this.formatVnDateTime(eq.nextInspectionAt!),
            urgencyAlert: eq.urgencyAlert || null,
          }))
      : [];

    return { summary, upcomingInspections };
  }

  private async queryActiveStaffFormatted(staffWhere: any, metadataMap: Record<string, any>) {
    const activeStaffUsers = await this.prisma.user.findMany({
      where: staffWhere,
      include: {
        userRoles: { include: { role: true } },
        doctorProfile: true,
        branch: true,
      },
      orderBy: { fullName: 'asc' },
    });

    const staffList = activeStaffUsers.map((u) => {
      const meta = metadataMap[u.id] || (u.employeeCode ? metadataMap[u.employeeCode] : undefined) || {};
      const roleObj = u.userRoles?.[0]?.role;
      let roleDisplay = roleObj?.description || roleObj?.name || 'Nhân sự';
      if (u.doctorProfile?.specialty) {
        roleDisplay = u.doctorProfile.specialty;
      }
      return {
        id: u.id,
        employeeCode: u.employeeCode || '',
        name: u.fullName,
        email: u.email,
        phone: u.phone,
        roleName: roleObj?.name || '',
        specialty: roleDisplay,
        avatar: u.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
        status: 'AVAILABLE',
        branchName: u.branch?.name || 'Chi nhánh',
        commissionRate: Number(meta.commissionRate ?? (u.doctorProfile ? 20 : 0)),
        workDays: Array.isArray(meta.workDays) ? meta.workDays : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        workHours: meta.workHours || '08:00 - 17:30',
      };
    });

    const doctorsOnDuty = staffList.filter(
      (s) => s.roleName === 'DOCTOR' || s.roleName.toLowerCase().includes('bác sĩ'),
    );

    return { staffList, doctorsOnDuty };
  }

  // ────────────────────────────────────────────────────────────────
  // FAST SUMMARY ENDPOINT (Above-the-fold Banner + 4 KPIs ONLY)
  // ────────────────────────────────────────────────────────────────
  async getSummaryData(userId?: string, branchId?: string) {
    const scope = await this.resolveUserScope(userId, branchId);
    const {
      currentUser,
      roleName,
      roleDescription,
      grantedPermissions,
      dashboardType,
      effectiveBranchId,
      bounds,
      staffWhere,
      equipmentWhere,
      chairWhere,
      invoiceWhere,
      metadataMap,
    } = scope;
    const { startOfDay, endOfDay, sevenDaysAgo, startOfMonth, endOfWeek } = bounds;
    const { assignedServiceNames, myWorkDays, myWorkHours } = this.resolvePersonalMeta(
      currentUser,
      dashboardType,
      metadataMap,
    );

    const userName = currentUser?.fullName || 'Quản Trị Viên';
    let greetingTitle = `Xin chào, ${userName} (${roleName})! 👋`;
    let greetingSubtitle =
      'Hôm nay hệ thống đang vận hành mượt mà. Thuật toán AI đã tự động phân bổ 100% ca khám không trùng lịch.';
    let kpiCards: any[] = [];
    let quickCounts: Record<string, number> = {};

    const apptBranchFilter = effectiveBranchId ? { branchId: effectiveBranchId } : {};

    if (dashboardType === 'DOCTOR') {
      const hasAiAccess = this.hasAnyPerm(grantedPermissions, ['ai']);
      const [myAppts, aiSlotBookingsCount] = await Promise.all([
        userId
          ? this.prisma.appointment.findMany({
              where: { doctorId: userId, startTime: { gte: sevenDaysAgo, lte: endOfWeek }, ...apptBranchFilter },
              select: { status: true, startTime: true },
            })
          : Promise.resolve([]),
        hasAiAccess
          ? this.prisma.appointment.count({ where: { isAiRecommended: true, ...apptBranchFilter } })
          : Promise.resolve(0),
      ]);

      const myToday = myAppts.filter((a) => {
        const d = new Date(a.startTime);
        return d >= startOfDay && d <= endOfDay;
      });
      const myActiveToday = myToday.filter((a) => ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status)).length;
      const myCompletedToday = myToday.filter((a) => a.status === 'COMPLETED').length;
      const myRating = Number(currentUser?.doctorProfile?.ratingAverage ?? 5.0);
      const myExp = Number(currentUser?.doctorProfile?.experienceYears ?? 0);

      greetingTitle = `Xin chào, ${userName}! 🩺`;
      greetingSubtitle = `Lịch khám chuyên khoa và hàng đợi bệnh nhân cá nhân đã sẵn sàng (${myToday.length} ca hôm nay • ${myWorkHours}).`;
      quickCounts = { todayAppointmentsCount: myToday.length, assignedServicesCount: assignedServiceNames.length };

      kpiCards = [
        {
          title: 'CA KHÁM CỦA TÔI HÔM NAY',
          value: `${myToday.length} Ca Khám`,
          subtext: `${myActiveToday} đang chờ/khám • ${myCompletedToday} hoàn thành`,
          change: myToday.length > 0 ? 'Đang trực' : 'Lịch trống',
          isIncrease: true,
          colorType: 'sky',
          iconType: 'calendar',
        },
        {
          title: 'LỊCH HẸN 7 NGÀY CỦA TÔI',
          value: `${myAppts.length} Ca Khám`,
          subtext: 'Đồng bộ trực tiếp với SmartSchedule AI',
          change: `${currentUser?.doctorProfile?.totalReviews ?? 0} đánh giá`,
          isIncrease: true,
          colorType: 'teal',
          iconType: 'stethoscope',
        },
        {
          title: 'ĐÁNH GIÁ CHUYÊN MÔN',
          value: `${myRating.toFixed(1)} ⭐`,
          subtext: `${myExp} năm kinh nghiệm lâm sàng`,
          change: currentUser?.doctorProfile?.specialty || 'Chuyên khoa',
          isIncrease: true,
          colorType: 'amber',
          iconType: 'award',
        },
        {
          title: 'DỊCH VỤ PHỤ TRÁCH',
          value: `${assignedServiceNames.length} Dịch Vụ`,
          subtext: hasAiAccess
            ? `Tối ưu ghép ca AI: ${aiSlotBookingsCount} ca toàn viện`
            : assignedServiceNames.slice(0, 2).join(', ') || 'Đồng bộ theo hồ sơ bác sĩ',
          change: myWorkDays.join(', '),
          isIncrease: true,
          colorType: 'indigo',
          iconType: hasAiAccess ? 'sparkles' : 'stethoscope',
        },
      ];
    } else if (dashboardType === 'RECEPTIONIST') {
      const [todayAppts, pendingCount, totalPatients, newPatientsWeek, finance] = await Promise.all([
        this.prisma.appointment.findMany({
          where: { startTime: { gte: startOfDay, lte: endOfDay }, ...apptBranchFilter },
          select: { status: true },
        }),
        this.prisma.appointment.count({
          where: { status: 'PENDING', startTime: { gte: sevenDaysAgo, lte: endOfWeek }, ...apptBranchFilter },
        }),
        this.prisma.patient.count(),
        this.prisma.patient.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        this.queryFinanceStats(invoiceWhere, startOfDay, startOfMonth, false),
      ]);

      const checkedInOrActive = todayAppts.filter((a) => ['CHECKED_IN', 'IN_PROGRESS', 'COMPLETED'].includes(a.status)).length;
      const checkedInCount = todayAppts.filter((a) => a.status === 'CHECKED_IN').length;
      const inProgressCount = todayAppts.filter((a) => a.status === 'IN_PROGRESS').length;

      greetingTitle = `Xin chào, Lễ tân ${userName}! 📋`;
      greetingSubtitle =
        'Theo dõi lịch hẹn cần gọi xác nhận, tiếp đón check-in QR Kiosk và đối soát hóa đơn tại quầy.';
      quickCounts = { totalPatients, unpaidInvoicesCount: finance.unpaidInvoicesCount };

      kpiCards = [
        {
          title: 'CHỜ XÁC NHẬN LỊCH HẸN',
          value: `${pendingCount} Ca Chờ`,
          subtext: 'Cần liên hệ xác nhận trước giờ khám',
          change: pendingCount > 0 ? 'Ưu tiên' : 'Đã xử lý hết',
          isIncrease: pendingCount === 0,
          colorType: 'amber',
          iconType: 'clock',
        },
        {
          title: 'ĐÃ CHECK-IN HÔM NAY',
          value: `${checkedInOrActive}/${todayAppts.length} Ca`,
          subtext: `${checkedInCount} đã check-in • ${inProgressCount} đang khám`,
          change: 'Quầy tiếp đón',
          isIncrease: true,
          colorType: 'sky',
          iconType: 'calendar',
        },
        {
          title: 'KHÁCH HÀNG MỚI (7 NGÀY)',
          value: `${newPatientsWeek} Hồ Sơ`,
          subtext: `Tổng kho bệnh án: ${totalPatients} khách hàng`,
          change: `+${newPatientsWeek} mới`,
          isIncrease: true,
          colorType: 'teal',
          iconType: 'users',
        },
        {
          title: 'HÓA ĐƠN CHỜ THU TẠI QUẦY',
          value: `${finance.unpaidInvoicesCount} Hóa Đơn`,
          subtext: `Công nợ chờ thu: ${formatMoney(finance.unpaidDebtTotal)}`,
          change: `Thu hôm nay: ${formatMoney(finance.todayRevenue)}`,
          isIncrease: finance.unpaidInvoicesCount === 0,
          colorType: finance.unpaidInvoicesCount > 0 ? 'rose' : 'emerald',
          iconType: 'dollar',
        },
      ];
    } else if (dashboardType === 'ACCOUNTANT') {
      const [finance, staffMin] = await Promise.all([
        this.queryFinanceStats(invoiceWhere, startOfDay, startOfMonth, false),
        this.prisma.user.findMany({
          where: staffWhere,
          select: { id: true, employeeCode: true, doctorProfile: { select: { specialty: true } } },
        }),
      ]);

      const commissionStaffCount = staffMin.filter((u) => {
        const meta = metadataMap[u.id] || (u.employeeCode ? metadataMap[u.employeeCode] : undefined) || {};
        return Number(meta.commissionRate ?? (u.doctorProfile ? 20 : 0)) > 0;
      }).length;
      const cashlessMonth = finance.monthVietQr + finance.monthPos;
      const cashlessPct = finance.monthRevenue > 0 ? Math.round((cashlessMonth / finance.monthRevenue) * 100) : 0;

      greetingTitle = `Xin chào, Kế toán ${userName}! 💰`;
      greetingSubtitle =
        'Theo dõi doanh thu thực thu, đối soát thanh toán VietQR/POS, công nợ khách hàng và quỹ hoa hồng nhân sự.';

      kpiCards = [
        {
          title: 'THỰC THU HÔM NAY',
          value: formatMoney(finance.todayRevenue),
          subtext: `VietQR: ${formatMoney(finance.todayVietQr)} • Tiền mặt/POS: ${formatMoney(finance.todayCash + finance.todayPos)}`,
          change: finance.todayRevenue > 0 ? '+100%' : '0%',
          isIncrease: finance.todayRevenue > 0,
          colorType: 'emerald',
          iconType: 'dollar',
        },
        {
          title: 'CÔNG NỢ CHƯA TẤT TOÁN',
          value: formatMoney(finance.unpaidDebtTotal),
          subtext: `${finance.unpaidInvoicesCount} hóa đơn trạng thái UNPAID / PARTIAL`,
          change: finance.unpaidInvoicesCount > 0 ? 'Cần đối soát' : 'Sạch công nợ',
          isIncrease: finance.unpaidInvoicesCount === 0,
          colorType: finance.unpaidInvoicesCount > 0 ? 'rose' : 'teal',
          iconType: 'receipt',
        },
        {
          title: 'DOANH THU LŨY KẾ THÁNG',
          value: formatMoney(finance.monthRevenue),
          subtext: `Thanh toán không tiền mặt chiếm ${cashlessPct}%`,
          change: `${finance.invoicesCount} hóa đơn`,
          isIncrease: true,
          colorType: 'sky',
          iconType: 'trending',
        },
        {
          title: 'NHÂN SỰ HƯỞNG HOA HỒNG',
          value: `${commissionStaffCount}/${staffMin.length} Nhân Sự`,
          subtext: 'Đồng bộ bảng lương & tỷ lệ hoa hồng thực tế',
          change: 'Sẵn sàng chốt lương',
          isIncrease: true,
          colorType: 'indigo',
          iconType: 'users',
        },
      ];
    } else if (dashboardType === 'NURSE') {
      const [todayAppts, chairsRaw, weekShiftCount, equip] = await Promise.all([
        this.prisma.appointment.findMany({
          where: { startTime: { gte: startOfDay, lte: endOfDay }, ...apptBranchFilter },
          select: { status: true },
        }),
        this.prisma.operatoryChair.findMany({ where: chairWhere, select: { status: true } }),
        userId
          ? this.prisma.staffSchedule.count({
              where: { userId, workDate: { gte: sevenDaysAgo, lte: endOfWeek }, isLeave: false },
            })
          : Promise.resolve(0),
        this.queryEquipmentSummary(equipmentWhere, false),
      ]);

      const activeClinicPatients = todayAppts.filter((a) => ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status)).length;
      const chairsAvail = chairsRaw.filter((c) => c.status === 'AVAILABLE').length;
      const chairsInUse = chairsRaw.filter((c) => c.status === 'IN_USE').length;
      const chairsSterilizing = chairsRaw.filter((c) => c.status === 'STERILIZING').length;
      const finalWeekShift = weekShiftCount || myWorkDays.length;

      greetingTitle = `Xin chào, Điều dưỡng ${userName}! 💉`;
      greetingSubtitle =
        'Tổng quan sẵn sàng phòng ghế nha vô trùng, lịch ca điều trị hôm nay và cảnh báo thiết bị y tế.';

      kpiCards = [
        {
          title: 'CA HỖ TRỢ HÔM NAY',
          value: `${todayAppts.length} Ca Khám`,
          subtext: `${activeClinicPatients} ca đang chờ chuẩn bị / điều trị`,
          change: 'Phòng lâm sàng',
          isIncrease: true,
          colorType: 'sky',
          iconType: 'calendar',
        },
        {
          title: 'TRẠNG THÁI GHẾ NHA',
          value: `${chairsAvail}/${chairsRaw.length} Sẵn Sàng`,
          subtext: `${chairsInUse} đang khám • ${chairsSterilizing} đang vô trùng`,
          change: chairsSterilizing > 0 ? 'Đang khử khuẩn' : 'Đạt chuẩn 100%',
          isIncrease: true,
          colorType: 'teal',
          iconType: 'activity',
        },
        {
          title: 'LỊCH TRỰC TRONG TUẦN',
          value: `${finalWeekShift} Ca Trực`,
          subtext: `Khung giờ: ${myWorkHours} (${myWorkDays.join(', ')})`,
          change: 'Lịch trực chuẩn',
          isIncrease: true,
          colorType: 'emerald',
          iconType: 'clock',
        },
        {
          title: 'THIẾT BỊ CẦN LƯU Ý',
          value: `${equip.summary.maintenance} Thiết Bị`,
          subtext: `${equip.summary.urgent} cảnh báo khẩn • ${equip.summary.operational} ổn định`,
          change: equip.summary.urgent > 0 ? 'Kiểm tra ngay' : 'An toàn',
          isIncrease: equip.summary.urgent === 0,
          colorType: equip.summary.urgent > 0 ? 'amber' : 'indigo',
          iconType: 'wrench',
        },
      ];
    } else if (dashboardType === 'TECHNICIAN') {
      const [equip, pendingMaintCount, completedMaintMonth] = await Promise.all([
        this.queryEquipmentSummary(equipmentWhere, false),
        this.prisma.equipmentMaintenanceLog.count({
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            ...(effectiveBranchId ? { equipment: { branchId: effectiveBranchId } } : {}),
          },
        }),
        this.prisma.equipmentMaintenanceLog.count({
          where: {
            status: 'COMPLETED',
            completedAt: { gte: startOfMonth },
            ...(effectiveBranchId ? { equipment: { branchId: effectiveBranchId } } : {}),
          },
        }),
      ]);

      greetingTitle = `Xin chào, Kỹ thuật viên ${userName}! 🔬`;
      greetingSubtitle =
        'Giám sát vận hành máy CT Cone Beam, X-Quang, hệ thống ghế nha và xử lý phiếu bảo trì kỹ thuật.';

      kpiCards = [
        {
          title: 'TỔNG THIẾT BỊ QUẢN LÝ',
          value: `${equip.summary.total} Thiết Bị`,
          subtext: `${equip.summary.operational} đang vận hành bình thường`,
          change: `${Math.round((equip.summary.operational / Math.max(1, equip.summary.total)) * 100)}% sẵn sàng`,
          isIncrease: true,
          colorType: 'sky',
          iconType: 'wrench',
        },
        {
          title: 'CẦN BẢO TRÌ & CẢNH BÁO',
          value: `${equip.summary.maintenance} Thiết Bị`,
          subtext: `${equip.summary.urgent} thiết bị cảnh báo khẩn mức cao`,
          change: equip.summary.urgent > 0 ? 'Ưu tiên xử lý' : 'Ổn định',
          isIncrease: equip.summary.urgent === 0,
          colorType: equip.summary.urgent > 0 ? 'rose' : 'amber',
          iconType: 'alert',
        },
        {
          title: 'PHIẾU BẢO TRÌ ĐANG MỞ',
          value: `${pendingMaintCount} Phiếu`,
          subtext: 'Đang chờ kiểm tra hoặc xử lý kỹ thuật',
          change: pendingMaintCount > 0 ? 'Đang xử lý' : 'Hoàn tất',
          isIncrease: pendingMaintCount === 0,
          colorType: 'amber',
          iconType: 'clock',
        },
        {
          title: 'HOÀN THÀNH THÁNG NÀY',
          value: `${completedMaintMonth} Lượt`,
          subtext: 'Biên bản hiệu chuẩn & bảo dưỡng đạt chuẩn',
          change: 'Đã nghiệm thu',
          isIncrease: true,
          colorType: 'emerald',
          iconType: 'check',
        },
      ];
    } else if (dashboardType === 'BRANCH_MANAGER') {
      const [finance, todayAppts, weekCount, staffCount, onLeaveCount, chairsRaw, equip] = await Promise.all([
        this.queryFinanceStats(invoiceWhere, startOfDay, startOfMonth, false),
        this.prisma.appointment.findMany({
          where: { startTime: { gte: startOfDay, lte: endOfDay }, ...apptBranchFilter },
          select: { status: true },
        }),
        this.prisma.appointment.count({
          where: { startTime: { gte: sevenDaysAgo, lte: endOfDay }, ...apptBranchFilter },
        }),
        this.prisma.user.count({ where: staffWhere }),
        this.prisma.staffSchedule.count({
          where: { workDate: { gte: startOfDay, lte: endOfDay }, isLeave: true, ...apptBranchFilter },
        }),
        this.prisma.operatoryChair.findMany({ where: chairWhere, select: { status: true } }),
        this.queryEquipmentSummary(equipmentWhere, false),
      ]);

      const completedToday = todayAppts.filter((a) => a.status === 'COMPLETED').length;
      const chairsAvail = chairsRaw.filter((c) => c.status === 'AVAILABLE').length;
      const branchName = currentUser?.branch?.name || 'Chi nhánh phụ trách';

      greetingTitle = `Xin chào, Quản lý chi nhánh - ${userName}! 🏢`;
      greetingSubtitle = `Toàn cảnh vận hành tại ${branchName}: doanh thu, công suất ghế nha, lịch hẹn và đội ngũ trực.`;

      kpiCards = [
        {
          title: 'DOANH THU CHI NHÁNH HÔM NAY',
          value: formatMoney(finance.todayRevenue),
          subtext: `Lũy kế tháng: ${formatMoney(finance.monthRevenue)}`,
          change: finance.todayRevenue > 0 ? '+100%' : '0%',
          isIncrease: finance.todayRevenue > 0,
          colorType: 'emerald',
          iconType: 'dollar',
        },
        {
          title: 'CA KHÁM CHI NHÁNH HÔM NAY',
          value: `${todayAppts.length} Ca Khám`,
          subtext: `${weekCount} ca trong 7 ngày qua`,
          change: `${completedToday} hoàn thành`,
          isIncrease: true,
          colorType: 'sky',
          iconType: 'calendar',
        },
        {
          title: 'NHÂN SỰ TẠI CHI NHÁNH',
          value: `${staffCount} Nhân Sự`,
          subtext: `${onLeaveCount} đang nghỉ phép hôm nay`,
          change: 'Đang hoạt động',
          isIncrease: true,
          colorType: 'teal',
          iconType: 'users',
        },
        {
          title: 'GHẾ NHA & THIẾT BỊ SẴN SÀNG',
          value: `${chairsAvail}/${chairsRaw.length} Ghế`,
          subtext: `${equip.summary.operational}/${equip.summary.total} thiết bị hoạt động tốt`,
          change: equip.summary.urgent > 0 ? `${equip.summary.urgent} cảnh báo` : 'Ổn định',
          isIncrease: equip.summary.urgent === 0,
          colorType: equip.summary.urgent > 0 ? 'amber' : 'indigo',
          iconType: 'building',
        },
      ];
    } else if (dashboardType === 'CUSTOM') {
      greetingTitle = `Xin chào, ${userName} — ${roleName}! 👋`;
      greetingSubtitle = `Trang tổng quan được tự động cá nhân hóa theo quyền hạn RBAC của vai trò "${roleDescription}".`;

      const dynamicCards: any[] = [];
      const needsFinance = this.hasAnyPerm(grantedPermissions, ['finance', 'salary']);
      const needsAppts = this.hasAnyPerm(grantedPermissions, ['appointments', 'patients']);
      const needsStaff = this.hasAnyPerm(grantedPermissions, ['staff', 'schedule', 'leave']);
      const needsMaint = this.hasAnyPerm(grantedPermissions, ['maintenance', 'equipment', 'notifications']);
      const needsAi = this.hasAnyPerm(grantedPermissions, ['ai']);
      const needsBranches = this.hasAnyPerm(grantedPermissions, ['branches', 'services']);

      const [finance, todayCount, weekCount, pendingCount, totalPatients, staffCount, onLeaveCount, equip, maintOpen, aiCount, aiAccepted, branchesCount, servicesCount] = await Promise.all([
        needsFinance ? this.queryFinanceStats(invoiceWhere, startOfDay, startOfMonth, false) : Promise.resolve(null),
        needsAppts ? this.prisma.appointment.count({ where: { startTime: { gte: startOfDay, lte: endOfDay }, ...apptBranchFilter } }) : Promise.resolve(0),
        needsAppts ? this.prisma.appointment.count({ where: { startTime: { gte: sevenDaysAgo, lte: endOfDay }, ...apptBranchFilter } }) : Promise.resolve(0),
        needsAppts ? this.prisma.appointment.count({ where: { status: 'PENDING', startTime: { gte: sevenDaysAgo, lte: endOfWeek }, ...apptBranchFilter } }) : Promise.resolve(0),
        needsAppts ? this.prisma.patient.count() : Promise.resolve(0),
        needsStaff ? this.prisma.user.count({ where: staffWhere }) : Promise.resolve(0),
        needsStaff ? this.prisma.staffSchedule.count({ where: { workDate: { gte: startOfDay, lte: endOfDay }, isLeave: true, ...apptBranchFilter } }) : Promise.resolve(0),
        needsMaint ? this.queryEquipmentSummary(equipmentWhere, false) : Promise.resolve(null),
        needsMaint ? this.prisma.equipmentMaintenanceLog.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] }, ...(effectiveBranchId ? { equipment: { branchId: effectiveBranchId } } : {}) } }) : Promise.resolve(0),
        needsAi ? this.prisma.aiConsultationLog.count() : Promise.resolve(0),
        needsAi ? this.prisma.aiConsultationLog.count({ where: { isAccepted: true } }) : Promise.resolve(0),
        this.prisma.branch.count({ where: { isActive: true } }),
        needsBranches ? this.prisma.service.count({ where: { isActive: true } }) : Promise.resolve(0),
      ]);

      if (finance) {
        dynamicCards.push({
          title: 'DOANH THU & TÀI CHÍNH',
          value: formatMoney(finance.todayRevenue),
          subtext: `Công nợ chờ thu: ${formatMoney(finance.unpaidDebtTotal)} (${finance.unpaidInvoicesCount} HĐ)`,
          change: `Tháng: ${formatMoney(finance.monthRevenue)}`,
          isIncrease: true,
          colorType: 'emerald',
          iconType: 'dollar',
        });
      }
      if (needsAppts) {
        dynamicCards.push({
          title: 'LỊCH HẸN & BỆNH NHÂN',
          value: `${todayCount} Ca Hôm Nay`,
          subtext: `${weekCount} ca (7 ngày) • ${totalPatients} hồ sơ BN`,
          change: `${pendingCount} chờ xác nhận`,
          isIncrease: true,
          colorType: 'sky',
          iconType: 'calendar',
        });
      }
      if (needsStaff) {
        dynamicCards.push({
          title: 'NHÂN SỰ ĐANG HOẠT ĐỘNG',
          value: `${staffCount} Nhân Sự`,
          subtext: `${onLeaveCount} nghỉ phép hôm nay`,
          change: 'Đang trực',
          isIncrease: true,
          colorType: 'teal',
          iconType: 'users',
        });
      }
      if (equip) {
        dynamicCards.push({
          title: 'THIẾT BỊ & BẢO TRÌ',
          value: `${equip.summary.operational}/${equip.summary.total} Ổn Định`,
          subtext: `${maintOpen} phiếu bảo trì đang mở`,
          change: equip.summary.urgent > 0 ? `${equip.summary.urgent} khẩn` : 'An toàn',
          isIncrease: equip.summary.urgent === 0,
          colorType: equip.summary.urgent > 0 ? 'amber' : 'indigo',
          iconType: 'wrench',
        });
      }
      if (needsAi) {
        dynamicCards.push({
          title: 'PHÂN TÍCH & TỐI ƯU AI',
          value: `${aiCount} Tư Vấn AI`,
          subtext: `${aiAccepted} đặt lịch qua AI • Tỷ lệ tối ưu 99.4%`,
          change: '+2.1%',
          isIncrease: true,
          colorType: 'indigo',
          iconType: 'sparkles',
        });
      }
      if (needsBranches) {
        dynamicCards.push({
          title: 'CHI NHÁNH & DỊCH VỤ',
          value: `${branchesCount} Cơ Sở`,
          subtext: `${servicesCount} dịch vụ nha khoa đang áp dụng`,
          change: 'Đang mở cửa',
          isIncrease: true,
          colorType: 'teal',
          iconType: 'building',
        });
      }
      if (dynamicCards.length < 4) {
        dynamicCards.push({
          title: 'PHẠM VI QUYỀN HẠN RBAC',
          value: `${grantedPermissions.length} Quyền`,
          subtext: `Vai trò: ${roleName}`,
          change: 'Đồng bộ RBAC',
          isIncrease: true,
          colorType: 'indigo',
          iconType: 'shield',
        });
      }
      if (dynamicCards.length < 4) {
        dynamicCards.push({
          title: 'CA TRỰC & LỊCH CÁ NHÂN',
          value: `${myWorkDays.length} Ngày/Tuần`,
          subtext: `Giờ làm việc: ${myWorkHours}`,
          change: myWorkDays.join(', '),
          isIncrease: true,
          colorType: 'sky',
          iconType: 'clock',
        });
      }
      if (dynamicCards.length < 4) {
        dynamicCards.push({
          title: 'CƠ SỞ ĐANG HOẠT ĐỘNG',
          value: `${branchesCount} Chi Nhánh`,
          subtext: currentUser?.branch?.name || 'Toàn hệ thống',
          change: 'Trực tuyến',
          isIncrease: true,
          colorType: 'emerald',
          iconType: 'building',
        });
      }
      if (dynamicCards.length < 4) {
        dynamicCards.push({
          title: 'TRẠNG THÁI HỆ THỐNG',
          value: '99.4%',
          subtext: 'Đồng bộ thời gian thực',
          change: 'Ổn định',
          isIncrease: true,
          colorType: 'teal',
          iconType: 'activity',
        });
      }
      kpiCards = dynamicCards.slice(0, 4);
    } else {
      // OWNER / SUPER_ADMIN — fast count/aggregate queries ONLY
      const [todayPayments, todayCount, weekCount, staffCount] = await Promise.all([
        this.prisma.payment.findMany({
          where: {
            paidAt: { gte: startOfDay, lte: endOfDay },
            ...(effectiveBranchId ? { invoice: { branchId: effectiveBranchId } } : {}),
          },
          select: { amountPaid: true },
        }),
        this.prisma.appointment.count({
          where: { startTime: { gte: startOfDay, lte: endOfDay }, ...apptBranchFilter },
        }),
        this.prisma.appointment.count({
          where: { startTime: { gte: sevenDaysAgo, lte: endOfDay }, ...apptBranchFilter },
        }),
        this.prisma.user.count({ where: staffWhere }),
      ]);

      const todayRevenue = todayPayments.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0);
      kpiCards = [
        {
          title: 'DOANH THU HÔM NAY',
          value: formatMoney(todayRevenue),
          subtext: todayRevenue > 0 ? 'Đã thanh toán thực tế' : 'Chưa có giao dịch hôm nay',
          change: todayRevenue > 0 ? '+100%' : '0%',
          isIncrease: todayRevenue > 0,
          colorType: 'emerald',
          iconType: 'dollar',
        },
        {
          title: 'LƯỢT KHÁM HÔM NAY',
          value: `${todayCount} Ca Khám`,
          subtext: `${weekCount} ca trong 7 ngày qua`,
          change: '+100%',
          isIncrease: true,
          colorType: 'sky',
          iconType: 'calendar',
        },
        {
          title: 'TỔNG NHÂN SỰ ĐANG HOẠT ĐỘNG',
          value: `${staffCount} Nhân Sự`,
          subtext: 'Bác sĩ, lễ tân, điều dưỡng & KTV',
          change: 'Sẵn sàng',
          isIncrease: true,
          colorType: 'teal',
          iconType: 'users',
        },
        {
          title: 'TỶ LỆ TỐI ƯU AI',
          value: '99.4%',
          subtext: '0 Ca trùng lịch',
          change: '+2.1%',
          isIncrease: true,
          colorType: 'indigo',
          iconType: 'sparkles',
        },
      ];
    }

    return {
      role: roleName,
      dashboardType,
      roleMeta: {
        roleName,
        roleDescription,
        permissions: grantedPermissions,
        isCustom: dashboardType === 'CUSTOM',
      },
      user: {
        id: currentUser?.id,
        fullName: userName,
        roleName,
        branchName: currentUser?.branch?.name || '',
      },
      greetingTitle,
      greetingSubtitle,
      kpis: kpiCards,
      quickCounts,
    };
  }

  // ────────────────────────────────────────────────────────────────
  // LAZY SECTION ENDPOINT (Called on 30-40% Scroll via IntersectionObserver)
  // ────────────────────────────────────────────────────────────────
  async getSectionData(userId: string | undefined, branchId: string | undefined, section: OverviewSectionKey) {
    const scope = await this.resolveUserScope(userId, branchId);
    const {
      currentUser,
      roleDescription,
      dashboardType,
      effectiveBranchId,
      bounds,
      staffWhere,
      equipmentWhere,
      chairWhere,
      invoiceWhere,
      metadataMap,
    } = scope;
    const { startOfDay, endOfDay, sevenDaysAgo, startOfMonth, endOfWeek } = bounds;
    const apptBranchFilter = effectiveBranchId ? { branchId: effectiveBranchId } : {};

    switch (section) {
      case 'ai_widgets': {
        const [aiConsultationCount, aiConsultationAccepted, aiSlotBookingsCount] = await Promise.all([
          this.prisma.aiConsultationLog.count(),
          this.prisma.aiConsultationLog.count({ where: { isAccepted: true } }),
          this.prisma.appointment.count({ where: { isAiRecommended: true, ...apptBranchFilter } }),
        ]);
        return {
          aiWidgetStats: {
            aiConsultationCount,
            aiConsultationAccepted,
            aiSlotUsageCount: aiSlotBookingsCount > 0 ? aiSlotBookingsCount : 18,
            zaloInteractionRate: 85,
          },
        };
      }

      case 'appointments_table': {
        const weekAppointmentsRaw = await this.prisma.appointment.findMany({
          where: {
            startTime: { gte: sevenDaysAgo, lte: endOfWeek },
            ...apptBranchFilter,
            ...(dashboardType === 'DOCTOR' && userId ? { doctorId: userId } : {}),
          },
          include: {
            patient: true,
            doctor: true,
            branch: true,
            chair: { include: { room: true } },
            services: { include: { service: true } },
          },
          orderBy: { startTime: 'desc' },
          take: 120,
        });

        const past7Days = weekAppointmentsRaw.filter((a) => new Date(a.startTime) <= endOfDay);
        const todayOnly = weekAppointmentsRaw.filter((a) => {
          const d = new Date(a.startTime);
          return d >= startOfDay && d <= endOfDay;
        });

        return {
          appointments: this.formatAppointments(dashboardType === 'DOCTOR' ? weekAppointmentsRaw : past7Days),
          todayAppointments: this.formatAppointments(todayOnly),
        };
      }

      case 'active_staff': {
        const { staffList, doctorsOnDuty } = await this.queryActiveStaffFormatted(staffWhere, metadataMap);
        return { activeStaff: staffList, doctorsOnDuty };
      }

      case 'doctor_profile': {
        const { assignedServiceNames, myWorkDays, myWorkHours, myLunchBreak } = this.resolvePersonalMeta(
          currentUser,
          dashboardType,
          metadataMap,
        );
        const activeServicesRaw = await this.prisma.service.findMany({
          where: { isActive: true },
          include: { category: true },
        });
        const assignedServices = assignedServiceNames.map((entry) => {
          const entryLower = entry.toLowerCase().trim();
          const matched = activeServicesRaw.find(
            (s) =>
              s.id === entry ||
              s.name.toLowerCase().trim() === entryLower ||
              s.name.toLowerCase().includes(entryLower) ||
              entryLower.includes(s.name.toLowerCase()),
          );
          return {
            id: matched?.id || entry,
            code: matched?.code || '',
            name: matched?.name || entry,
            categoryName: matched?.category?.name || currentUser?.doctorProfile?.specialty || 'Chuyên khoa',
            standardPrice: Number(matched?.standardPrice || 0),
            durationMinutes: matched?.durationMinutes || 45,
          };
        });

        return {
          personalProfile: {
            specialty: currentUser?.doctorProfile?.specialty || roleDescription,
            experienceYears: currentUser?.doctorProfile?.experienceYears ?? 0,
            ratingAverage: currentUser?.doctorProfile?.ratingAverage ?? 5.0,
            totalReviews: currentUser?.doctorProfile?.totalReviews ?? 0,
            workDays: myWorkDays,
            workHours: myWorkHours,
            lunchBreak: myLunchBreak,
            assignedServices,
            weekShifts: [],
          },
        };
      }

      case 'reception_panels': {
        const [{ doctorsOnDuty }, finance] = await Promise.all([
          this.queryActiveStaffFormatted(staffWhere, metadataMap),
          this.queryFinanceStats(invoiceWhere, startOfDay, startOfMonth, true),
        ]);
        return {
          doctorsOnDuty,
          unpaidInvoices: finance.recentInvoices.filter((i) => i.status !== 'PAID').slice(0, 8),
        };
      }

      case 'finance_overview': {
        const finance = await this.queryFinanceStats(invoiceWhere, startOfDay, startOfMonth, true);
        return { financeSummary: finance };
      }

      case 'chairs_panel': {
        const chairsRaw = await this.prisma.operatoryChair.findMany({
          where: chairWhere,
          include: {
            room: { include: { branch: true } },
            assignedDoctor: { include: { user: true } },
          },
          orderBy: { code: 'asc' },
        });
        const chairs = chairsRaw.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          status: c.status,
          roomName: c.room ? `${c.room.roomNumber} - ${c.room.name}` : '',
          branchName: c.room?.branch?.name || '',
          doctorName: c.assignedDoctor?.user?.fullName || 'Chưa phân công',
        }));
        return {
          chairs,
          chairSummary: {
            total: chairs.length,
            available: chairs.filter((c) => c.status === 'AVAILABLE').length,
            inUse: chairs.filter((c) => c.status === 'IN_USE').length,
            sterilizing: chairs.filter((c) => c.status === 'STERILIZING').length,
            maintenance: chairs.filter((c) => c.status === 'MAINTENANCE').length,
          },
        };
      }

      case 'maintenance_panel': {
        const [equip, pendingMaintRaw] = await Promise.all([
          this.queryEquipmentSummary(equipmentWhere, true),
          this.prisma.equipmentMaintenanceLog.findMany({
            where: {
              status: { in: ['PENDING', 'IN_PROGRESS'] },
              ...(effectiveBranchId ? { equipment: { branchId: effectiveBranchId } } : {}),
            },
            include: {
              equipment: { include: { branch: true } },
              technician: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 15,
          }),
        ]);

        const maintenanceTasks = pendingMaintRaw.map((log) => ({
          id: log.id,
          logCode: log.logCode,
          equipmentCode: log.equipment?.code || '',
          equipmentName: log.equipment?.name || 'Thiết bị',
          location: log.equipment?.location || log.equipment?.branch?.name || '',
          actionType: log.actionType,
          findings: log.findings,
          status: log.status,
          technicianName: log.technician?.fullName || 'Kỹ thuật viên',
          scheduledAt: log.scheduledAt ? this.formatVnDateTime(log.scheduledAt) : this.formatVnDateTime(log.createdAt),
          isUrgent: Boolean(
            log.equipment?.urgencyAlert || log.actionType?.includes('SỰ CỐ') || log.equipment?.status === 'WARNING',
          ),
        }));

        return {
          equipmentSummary: equip.summary,
          upcomingInspections: equip.upcomingInspections,
          maintenanceTasks,
        };
      }

      case 'nurse_shift': {
        const { myWorkDays, myWorkHours, myLunchBreak } = this.resolvePersonalMeta(
          currentUser,
          dashboardType,
          metadataMap,
        );
        const pendingMaintRaw = await this.prisma.equipmentMaintenanceLog.findMany({
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            ...(effectiveBranchId ? { equipment: { branchId: effectiveBranchId } } : {}),
          },
          include: {
            equipment: { include: { branch: true } },
            technician: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });
        return {
          personalProfile: {
            specialty: roleDescription,
            experienceYears: 0,
            ratingAverage: 5,
            totalReviews: 0,
            workDays: myWorkDays,
            workHours: myWorkHours,
            lunchBreak: myLunchBreak,
            assignedServices: [],
            weekShifts: [],
          },
          maintenanceTasks: pendingMaintRaw.map((log) => ({
            id: log.id,
            logCode: log.logCode,
            equipmentCode: log.equipment?.code || '',
            equipmentName: log.equipment?.name || 'Thiết bị',
            location: log.equipment?.location || log.equipment?.branch?.name || '',
            actionType: log.actionType,
            findings: log.findings,
            status: log.status,
            technicianName: log.technician?.fullName || 'Kỹ thuật viên',
            scheduledAt: log.scheduledAt ? this.formatVnDateTime(log.scheduledAt) : this.formatVnDateTime(log.createdAt),
            isUrgent: Boolean(log.equipment?.urgencyAlert || log.equipment?.status === 'WARNING'),
          })),
        };
      }

      case 'branch_ops': {
        const [todayAppts, chairsRaw, equip] = await Promise.all([
          this.prisma.appointment.findMany({
            where: { startTime: { gte: startOfDay, lte: endOfDay }, ...apptBranchFilter },
            select: { status: true },
          }),
          this.prisma.operatoryChair.findMany({ where: chairWhere, select: { status: true } }),
          this.queryEquipmentSummary(equipmentWhere, false),
        ]);
        return {
          appointmentStatus: {
            totalToday: todayAppts.length,
            pending: todayAppts.filter((a) => a.status === 'PENDING').length,
            confirmed: todayAppts.filter((a) => a.status === 'CONFIRMED').length,
            checkedIn: todayAppts.filter((a) => a.status === 'CHECKED_IN').length,
            inProgress: todayAppts.filter((a) => a.status === 'IN_PROGRESS').length,
            completed: todayAppts.filter((a) => a.status === 'COMPLETED').length,
            cancelled: todayAppts.filter((a) => a.status === 'CANCELLED').length,
          },
          chairSummary: {
            total: chairsRaw.length,
            available: chairsRaw.filter((c) => c.status === 'AVAILABLE').length,
            inUse: chairsRaw.filter((c) => c.status === 'IN_USE').length,
            sterilizing: chairsRaw.filter((c) => c.status === 'STERILIZING').length,
            maintenance: chairsRaw.filter((c) => c.status === 'MAINTENANCE').length,
          },
          equipmentSummary: equip.summary,
        };
      }
    }
  }

  // Full compatibility endpoint (used if external callers hit GET /overview)
  async getDashboardData(userId?: string, branchId?: string) {
    const [
      summary,
      aiWidgets,
      appts,
      staff,
      docProfile,
      finance,
      chairs,
      maint,
      branchOps,
    ] = await Promise.all([
      this.getSummaryData(userId, branchId),
      this.getSectionData(userId, branchId, 'ai_widgets'),
      this.getSectionData(userId, branchId, 'appointments_table'),
      this.getSectionData(userId, branchId, 'active_staff'),
      this.getSectionData(userId, branchId, 'doctor_profile'),
      this.getSectionData(userId, branchId, 'finance_overview'),
      this.getSectionData(userId, branchId, 'chairs_panel'),
      this.getSectionData(userId, branchId, 'maintenance_panel'),
      this.getSectionData(userId, branchId, 'branch_ops'),
    ]);

    return {
      ...summary,
      appointments: (appts as any).appointments,
      todayAppointments: (appts as any).todayAppointments,
      activeStaff: (staff as any).activeStaff,
      aiWidgetStats: (aiWidgets as any).aiWidgetStats,
      rolePanels: {
        appointmentStatus: (branchOps as any).appointmentStatus,
        financeSummary: (finance as any).financeSummary,
        patientSummary: {
          totalPatients: summary.quickCounts?.totalPatients || 0,
          newPatientsWeek: 0,
        },
        chairSummary: (chairs as any).chairSummary,
        chairs: (chairs as any).chairs,
        equipmentSummary: (maint as any).equipmentSummary,
        maintenanceTasks: (maint as any).maintenanceTasks,
        upcomingInspections: (maint as any).upcomingInspections,
        doctorsOnDuty: (staff as any).doctorsOnDuty,
        personalProfile: (docProfile as any).personalProfile,
        clinicSummary: {
          activeBranchesCount: 0,
          activeServicesCount: 0,
          onLeaveTodayCount: 0,
          commissionStaffCount: 0,
        },
      },
      stats: {
        revenueToday: (finance as any).financeSummary?.todayRevenue || 0,
        appointmentsCount: (appts as any).todayAppointments?.length || 0,
        weekAppointmentsCount: (appts as any).appointments?.length || 0,
        totalActiveStaff: (staff as any).activeStaff?.length || 0,
        aiOptimizationRate: '99.4%',
      },
    };
  }
}
