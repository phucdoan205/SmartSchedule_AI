import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(branchId?: string) {
    const where = branchId ? { branchId } : {};
    return this.prisma.equipment.findMany({
      where,
      include: {
        branch: true,
        chair: {
          include: { room: true },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async createMaintenanceLog(
    equipmentId: string,
    data: {
      technicianId: string;
      actionType: string;
      findings: string;
      isCertified?: boolean;
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
      // 1. Tạo bản ghi biên bản bảo trì
      const log = await tx.equipmentMaintenanceLog.create({
        data: {
          equipmentId,
          technicianId: data.technicianId,
          logCode,
          actionType: data.actionType,
          findings: data.findings,
          isCertified: data.isCertified ?? false,
          completedAt: new Date(),
        },
        include: {
          equipment: true,
          technician: true,
        },
      });

      // 2. Cập nhật trạng thái thiết bị sang UNDER_MAINTENANCE
      await tx.equipment.update({
        where: { id: equipmentId },
        data: { status: 'UNDER_MAINTENANCE' },
      });

      // 3. Tự động chuyển ghế liên đới sang MAINTENANCE để khóa lịch khám
      if (equipment.chairId) {
        await tx.operatoryChair.update({
          where: { id: equipment.chairId },
          data: { status: 'MAINTENANCE' },
        });
      }

      return log;
    });
  }

  async getMaintenanceHistory(equipmentId?: string) {
    const where = equipmentId ? { equipmentId } : {};
    return this.prisma.equipmentMaintenanceLog.findMany({
      where,
      include: {
        equipment: true,
        technician: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
