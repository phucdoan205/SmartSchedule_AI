import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

@Injectable()
export class BranchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll() {
    const branches = await this.prisma.branch.findMany({
      include: {
        rooms: {
          include: {
            chairs: true,
          },
        },
        users: {
          where: {
            doctorProfile: { isNot: null },
          },
          include: {
            doctorProfile: true,
          },
        },
        _count: {
          select: {
            rooms: true,
            users: true,
            appointments: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return branches.map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      address: b.address,
      phone: b.phone,
      imageUrl: b.imageUrl,
      isActive: b.isActive,
      roomCount: b.rooms.length,
      chairCount: b.rooms.reduce((acc, r) => acc + r.chairs.length, 0),
      doctorCount: b.users.length,
      createdAt: b.createdAt,
    }));
  }

  async findById(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            chairs: {
              include: {
                assignedDoctor: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        users: {
          include: {
            doctorProfile: true,
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Chi nhánh với ID ${id} không tồn tại`);
    }

    return branch;
  }

  async create(
    data: {
      code: string;
      name: string;
      address: string;
      phone: string;
      imageUrl?: string;
    },
    operatorUserId?: string,
  ) {
    const created = await this.prisma.branch.create({
      data: {
        code: data.code,
        name: data.name,
        address: data.address,
        phone: data.phone,
        imageUrl: data.imageUrl,
      },
    });

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'BRANCHES',
      action: `Thêm mới chi nhánh phòng khám: ${created.name} (${created.code})`,
      details: `Khởi tạo chi nhánh cơ sở mới tại ${created.address}. Hotline: ${created.phone}.`,
      targetEntity: created.code,
      status: 'SUCCESS',
    });

    return created;
  }

  async update(
    id: string,
    data: {
      name?: string;
      address?: string;
      phone?: string;
      imageUrl?: string;
      isActive?: boolean;
      status?: string;
    },
    operatorUserId?: string,
  ) {
    const { status, ...prismaData } = data;
    const existing = await this.prisma.branch.findUnique({ where: { id } });
    const isStatusChanged = Boolean(prismaData.isActive !== undefined && existing && prismaData.isActive !== existing.isActive);

    const updated = await this.prisma.branch.update({
      where: { id },
      data: prismaData,
    });

    const statusLabels: Record<string, string> = {
      Active: 'Đang hoạt động',
      active: 'Đang hoạt động',
      Maintenance: 'Bảo trì tạm thời',
      maintenance: 'Bảo trì tạm thời',
      Closed: 'Tạm ngưng',
      closed: 'Tạm ngưng',
      Inactive: 'Tạm ngưng',
      inactive: 'Tạm ngưng',
    };

    const prevLabel = existing?.isActive ? 'Đang hoạt động' : 'Tạm ngưng';
    const newStatusLabel = status ? (statusLabels[status] || status) : (updated.isActive ? 'Đang hoạt động' : 'Tạm ngưng');

    let actionText = '';
    if (status || isStatusChanged) {
      actionText = `Chuyển trạng thái chi nhánh: ${updated.name} (${updated.code}) [${prevLabel} ➔ ${newStatusLabel}]`;
    } else {
      actionText = `Cập nhật thông tin chi nhánh: ${updated.name} (${updated.code})`;
    }

    const detailsText = `Chi nhánh ${updated.name} (${updated.code}) đã được cập nhật sang trạng thái [${newStatusLabel}].`;

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'BRANCHES',
      action: actionText,
      details: detailsText,
      targetEntity: updated.code,
      status: 'SUCCESS',
    });

    return updated;
  }

  async createRoom(
    branchId: string,
    data: {
      name: string;
      roomNumber?: string;
      floor?: number;
      category?: string;
      chairName?: string;
      chairCode?: string;
      status?: string;
      assignedDoctorId?: string;
      doctorName?: string;
      equipments?: string[];
      equipmentIds?: string[];
    },
    operatorUserId?: string,
  ) {
    const branch = await this.prisma.branch.findFirst({
      where: {
        OR: [{ id: branchId }, { code: branchId }, { name: { contains: branchId, mode: 'insensitive' } }],
      },
    });

    if (!branch) {
      throw new NotFoundException(`Chi nhánh ${branchId} không tồn tại`);
    }

    const currentRoomCount = await this.prisma.room.count({
      where: { branchId: branch.id },
    });

    const nextIndex = currentRoomCount + 1;
    const floor = Number(data.floor) || 1;
    const roomNumber = data.roomNumber || `P.${floor}0${nextIndex}`;
    const isMaintenance = data.status === 'MAINTENANCE' || data.status === 'maintenance';

    // Find DoctorProfile if assignedDoctorId or doctorName is passed
    let assignedDoctorId: string | null = null;
    const doctorSearch = data.assignedDoctorId || data.doctorName;
    if (doctorSearch) {
      const doc = await this.prisma.doctorProfile.findFirst({
        where: {
          OR: [
            { id: doctorSearch },
            { userId: doctorSearch },
            { user: { fullName: { contains: doctorSearch, mode: 'insensitive' } } },
          ],
        },
      });
      if (doc) {
        assignedDoctorId = doc.id;
      }
    }

    // Create Room
    const room = await this.prisma.room.create({
      data: {
        branchId: branch.id,
        name: data.name,
        roomNumber,
        floor,
        isSterilized: !isMaintenance,
      },
    });

    // Create Operatory Chair for this Room
    const chairCode = data.chairCode || `GHE-${branch.code}-${String(nextIndex).padStart(2, '0')}`;
    const chairName = data.chairName || `Ghế ${data.name}`;

    const chair = await this.prisma.operatoryChair.create({
      data: {
        roomId: room.id,
        code: chairCode,
        name: chairName,
        status: isMaintenance ? 'MAINTENANCE' : 'AVAILABLE',
        assignedDoctorId,
      },
      include: {
        assignedDoctor: {
          include: { user: true },
        },
      },
    });

    // Link existing equipments to chair
    if (Array.isArray(data.equipmentIds) && data.equipmentIds.length > 0) {
      await this.prisma.equipment.updateMany({
        where: { id: { in: data.equipmentIds } },
        data: { chairId: chair.id },
      });
    } else if (Array.isArray(data.equipments) && data.equipments.length > 0) {
      await this.prisma.equipment.updateMany({
        where: {
          name: { in: data.equipments },
          branchId: branch.id,
        },
        data: { chairId: chair.id },
      });
    }

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'BRANCHES',
      action: `Thêm phòng khám mới: ${room.name} (${room.roomNumber}) tại ${branch.name}`,
      details: `Đã kích hoạt phòng khám ${room.name} kèm ghế nha khoa ${chair.name} (${chair.code}).`,
      targetEntity: room.roomNumber,
      status: 'SUCCESS',
    });

    return {
      ...room,
      chair,
    };
  }
}

