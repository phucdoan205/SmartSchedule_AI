import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class OperatoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getBranchOperatories(branchId: string) {
    const rooms = await this.prisma.room.findMany({
      where: { branchId },
      include: {
        chairs: {
          include: {
            assignedDoctor: {
              include: { user: true },
            },
            equipments: true,
          },
        },
      },
      orderBy: { floor: 'asc' },
    });

    return rooms;
  }

  async updateChairStatus(
    chairId: string,
    status: string,
    assignedDoctorId?: string,
  ) {
    const chair = await this.prisma.operatoryChair.findUnique({
      where: { id: chairId },
    });

    if (!chair) {
      throw new NotFoundException(`Ghế khám ID ${chairId} không tồn tại`);
    }

    return this.prisma.operatoryChair.update({
      where: { id: chairId },
      data: {
        status,
        assignedDoctorId: assignedDoctorId !== undefined ? assignedDoctorId : chair.assignedDoctorId,
      },
      include: {
        room: true,
        assignedDoctor: {
          include: { user: true },
        },
      },
    });
  }
}
