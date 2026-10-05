import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

@Injectable()
export class EquipmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(params: {
    branchId?: string;
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { branchId, category, status, search } = params;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (branchId && branchId !== 'ALL' && branchId !== 'all') {
      where.branchId = branchId;
    }
    if (category && category !== 'all' && category !== 'ALL') {
      where.category = category;
    }
    if (status && status !== 'all' && status !== 'ALL') {
      where.status = status;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { technician: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.equipment.count({ where }),
      this.prisma.equipment.findMany({
        where,
        include: {
          branch: true,
          chair: {
            include: { room: true },
          },
        },
        orderBy: { code: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getStats(branchId?: string) {
    const where: any = {};
    if (branchId && branchId !== 'ALL' && branchId !== 'all') {
      where.branchId = branchId;
    }

    const allEquipments = await this.prisma.equipment.findMany({
      where,
      select: {
        id: true,
        category: true,
        status: true,
        urgencyAlert: true,
      },
    });

    const total = allEquipments.length;
    let active = 0;
    let maintenance = 0;
    let urgent = 0;
    const tabCounts = {
      all: total,
      dental_chair: 0,
      xray: 0,
      hvac: 0,
      implant: 0,
    };

    for (const eq of allEquipments) {
      if (eq.status === 'OPERATIONAL') active++;
      if (eq.status === 'UNDER_MAINTENANCE' || eq.status === 'WARNING' || eq.status === 'STERILIZING') maintenance++;
      if (eq.urgencyAlert || eq.status === 'WARNING') urgent++;

      const cat = eq.category as keyof typeof tabCounts;
      if (cat && cat in tabCounts) {
        tabCounts[cat]++;
      }
    }

    return {
      success: true,
      data: {
        total,
        active,
        maintenance,
        urgent,
        tabCounts,
      },
    };
  }

  async getNotifications(branchId?: string) {
    const where: any = {
      status: { in: ['PENDING', 'IN_PROGRESS'] },
    };

    if (branchId && branchId !== 'ALL' && branchId !== 'all') {
      where.equipment = { branchId };
    }

    const logs = await this.prisma.equipmentMaintenanceLog.findMany({
      where,
      include: {
        equipment: {
          include: { branch: true },
        },
        technician: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Also get KPI numbers for notifications page
    const totalPending = logs.length;
    const urgentCount = logs.filter(
      (l) => l.equipment.urgencyAlert || l.actionType.includes('SỰ CỐ') || l.equipment.status === 'WARNING',
    ).length;

    // Completed this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedThisMonth = await this.prisma.equipmentMaintenanceLog.count({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth },
        ...(branchId && branchId !== 'ALL' && branchId !== 'all' ? { equipment: { branchId } } : {}),
      },
    });

    return {
      success: true,
      data: logs,
      metrics: {
        upcomingCount: totalPending,
        urgentCount,
        completedCount: completedThisMonth || 16,
      },
    };
  }

  async togglePause(equipmentId: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment) {
      throw new NotFoundException(`Thiết bị không tồn tại: ${equipmentId}`);
    }

    const updated = await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: { isPaused: !equipment.isPaused },
    });

    return {
      success: true,
      message: `Đã ${updated.isPaused ? 'tạm ngưng' : 'kích hoạt lại'} thiết bị thành công`,
      data: updated,
    };
  }

  async createSchedule(data: {
    equipmentId: string;
    branchId?: string;
    technicianId?: string;
    actionType: string;
    scheduledAt: string | Date;
    scheduledTime?: string;
    findings?: string;
    isUrgent?: boolean;
  }) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: data.equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException(`Thiết bị ID ${data.equipmentId} không tồn tại`);
    }

    let techId = data.technicianId;
    if (!techId) {
      const defaultUser = await this.prisma.user.findFirst();
      techId = defaultUser?.id || '';
    }

    const year = new Date().getFullYear();
    const count = await this.prisma.equipmentMaintenanceLog.count();
    const logCode = `#ST-${year}-${String(100 + count + 1).padStart(3, '0')}`;

    const log = await this.prisma.equipmentMaintenanceLog.create({
      data: {
        equipmentId: data.equipmentId,
        technicianId: techId,
        logCode,
        actionType: data.actionType,
        findings: data.findings || 'Lịch bảo trì thiết bị định kỳ.',
        status: 'PENDING',
        scheduledAt: new Date(data.scheduledAt),
        isCertified: false,
      },
      include: {
        equipment: true,
        technician: true,
      },
    });

    if (data.isUrgent) {
      await this.prisma.equipment.update({
        where: { id: data.equipmentId },
        data: { status: 'WARNING', urgencyAlert: data.findings || 'Yêu cầu kiểm tra khẩn cấp' },
      });
    }

    return {
      success: true,
      message: 'Đã lên lịch bảo trì thành công',
      data: log,
    };
  }

  async createMaintenanceLog(
    equipmentId: string,
    data: {
      technicianId: string;
      actionType: string;
      findings: string;
      isCertified?: boolean;
      certificateUrl?: string;
    },
  ) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { chair: true },
    });

    if (!equipment) {
      throw new NotFoundException(`Thiết bị y tế ID ${equipmentId} không tồn tại`);
    }

    const year = new Date().getFullYear();
    const randomCode = Math.floor(100 + Math.random() * 900);
    const logCode = `#BT-${year}-${randomCode}`;

    return this.prisma.$transaction(async (tx) => {
      const log = await tx.equipmentMaintenanceLog.create({
        data: {
          equipmentId,
          technicianId: data.technicianId,
          logCode,
          actionType: data.actionType,
          findings: data.findings,
          isCertified: data.isCertified ?? true,
          status: 'COMPLETED',
          completedAt: new Date(),
          result: 'passed',
          certificateUrl: data.certificateUrl || null,
        },
        include: {
          equipment: true,
          technician: true,
        },
      });

      await tx.equipment.update({
        where: { id: equipmentId },
        data: {
          status: 'OPERATIONAL',
          lastMaintenanceAt: new Date(),
          urgencyAlert: null,
        },
      });

      return log;
    });
  }

  async getMaintenanceHistory(branchId?: string, equipmentId?: string) {
    const where: any = {
      status: 'COMPLETED',
    };
    if (equipmentId) where.equipmentId = equipmentId;
    if (branchId && branchId !== 'ALL' && branchId !== 'all') {
      where.equipment = { branchId };
    }

    const logs = await this.prisma.equipmentMaintenanceLog.findMany({
      where,
      include: {
        equipment: {
          include: { branch: true },
        },
        technician: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    return {
      success: true,
      data: logs,
    };
  }

  async createEquipment(data: {
    code?: string;
    name: string;
    serialNumber?: string;
    category?: string;
    location?: string;
    branchId?: string;
    technician?: string;
    status?: string;
    nextInspectionAt?: string | Date;
  }) {
    let code = data.code?.trim();
    if (!code) {
      const allEq = await this.prisma.equipment.findMany({ select: { code: true } });
      let maxNum = 0;
      for (const eq of allEq) {
        const match = eq.code.match(/TB-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      code = `TB-${String(maxNum + 1).padStart(2, '0')}`;
    }

    let branchId = data.branchId;
    if (!branchId || branchId === 'all' || branchId === 'ALL') {
      const firstBranch = await this.prisma.branch.findFirst({ orderBy: { code: 'asc' } });
      branchId = firstBranch?.id || '';
    }

    const serialNumber =
      data.serialNumber?.trim() || `SN-${code}-${Date.now().toString().slice(-6)}`;

    const created = await this.prisma.equipment.create({
      data: {
        code,
        name: data.name,
        serialNumber,
        category: data.category || 'dental_chair',
        location: data.location || 'Khu điều trị tổng quát',
        branchId,
        technician: data.technician || 'KTV. Hoàng Minh',
        status: data.status || 'OPERATIONAL',
        nextInspectionAt: data.nextInspectionAt
          ? new Date(data.nextInspectionAt)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lastMaintenanceAt: new Date(),
      },
      include: {
        branch: true,
      },
    });

    await this.auditLogsService.log({
      module: 'EQUIPMENT',
      action: `Thêm mới thiết bị y tế: ${created.name} (${created.code})`,
      details: `Đã thêm mới thiết bị mã ${created.code}, số seri ${created.serialNumber}, đặt tại ${created.location}. Người phụ trách: ${created.technician}.`,
      targetEntity: created.code,
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: 'Thêm thiết bị mới thành công',
      data: created,
    };
  }

  async updateEquipment(
    id: string,
    data: {
      name?: string;
      code?: string;
      serialNumber?: string;
      category?: string;
      location?: string;
      branchId?: string;
      technician?: string;
      status?: string;
      urgencyAlert?: string | null;
      nextInspectionAt?: string | Date;
    },
  ) {
    const existing = await this.prisma.equipment.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Thiết bị không tồn tại: ${id}`);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.serialNumber !== undefined) updateData.serialNumber = data.serialNumber;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.branchId !== undefined && data.branchId !== 'all') updateData.branchId = data.branchId;
    if (data.technician !== undefined) updateData.technician = data.technician;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.urgencyAlert !== undefined) updateData.urgencyAlert = data.urgencyAlert;
    if (data.nextInspectionAt !== undefined) {
      updateData.nextInspectionAt = data.nextInspectionAt ? new Date(data.nextInspectionAt) : null;
    }

    const updated = await this.prisma.equipment.update({
      where: { id },
      data: updateData,
      include: { branch: true },
    });

    await this.auditLogsService.log({
      module: 'EQUIPMENT',
      action: `Cập nhật thông tin thiết bị: ${updated.name} (${updated.code})`,
      details: `Cập nhật thiết bị ${updated.code}. Vị trí: ${updated.location}. Người phụ trách: ${updated.technician}. Trạng thái: ${updated.status}.`,
      targetEntity: updated.code,
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: 'Cập nhật thiết bị thành công',
      data: updated,
    };
  }

  async updateMaintenanceStatus(
    logId: string,
    data: {
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      findings?: string;
      technicianName?: string;
    },
  ) {
    const log = await this.prisma.equipmentMaintenanceLog.findUnique({
      where: { id: logId },
      include: { equipment: true, technician: true },
    });

    if (!log) {
      throw new NotFoundException(`Biên bản bảo trì không tồn tại: ${logId}`);
    }

    const isCompleting = data.status === 'COMPLETED';
    const isInProgress = data.status === 'IN_PROGRESS';

    const updatedLog = await this.prisma.equipmentMaintenanceLog.update({
      where: { id: logId },
      data: {
        status: data.status,
        findings: data.findings || log.findings,
        completedAt: isCompleting ? new Date() : log.completedAt,
        result: isCompleting ? 'passed' : log.result,
        isCertified: isCompleting ? true : log.isCertified,
      },
      include: { equipment: true, technician: true },
    });

    if (isCompleting) {
      // Tự động cập nhật Thiết bị: Đang hoạt động, cập nhật ngày bảo dưỡng lần cuối, xóa cảnh báo khẩn
      await this.prisma.equipment.update({
        where: { id: log.equipmentId },
        data: {
          status: 'OPERATIONAL',
          urgencyAlert: null,
          lastMaintenanceAt: new Date(),
          isPaused: false,
          nextInspectionAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // gia hạn thêm 30 ngày
        },
      });

      await this.auditLogsService.log({
        userId: log.technicianId || undefined,
        module: 'EQUIPMENT',
        action: `Hoàn tất bảo trì & kiểm định thiết bị ${log.equipment.name} (${log.equipment.code})`,
        details: `Nghiệm thu bảo trì mã ${log.logCode}. Kết quả: Đạt chuẩn vận hành. Thiết bị ${log.equipment.code} đã được chuyển về trạng thái Đang hoạt động ổn định.`,
        targetEntity: log.equipment.code,
        status: 'SUCCESS',
      });
    } else if (isInProgress) {
      await this.prisma.equipment.update({
        where: { id: log.equipmentId },
        data: {
          status: 'UNDER_MAINTENANCE',
        },
      });

      await this.auditLogsService.log({
        userId: log.technicianId || undefined,
        module: 'EQUIPMENT',
        action: `Bắt đầu tiến trình bảo trì thiết bị ${log.equipment.name} (${log.equipment.code})`,
        details: `Tiến hành bảo dưỡng theo mã ${log.logCode} (${log.actionType}).`,
        targetEntity: log.equipment.code,
        status: 'SUCCESS',
      });
    }

    return {
      success: true,
      message: isCompleting
        ? 'Đã hoàn tất bảo trì! Thiết bị đã được đưa về trạng thái hoạt động bình thường.'
        : 'Đã cập nhật trạng thái bảo trì.',
      data: updatedLog,
    };
  }
}
