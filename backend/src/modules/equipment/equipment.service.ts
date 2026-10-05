import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

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
}
