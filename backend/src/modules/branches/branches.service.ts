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
    },
    operatorUserId?: string,
  ) {
    const existing = await this.prisma.branch.findUnique({ where: { id } });
    const isStatusChanged = Boolean(data.isActive !== undefined && existing && data.isActive !== existing.isActive);

    const updated = await this.prisma.branch.update({
      where: { id },
      data,
    });

    let actionText = `Cập nhật thông tin chi nhánh: ${updated.name} (${updated.code})`;
    let detailsText = `Điều chỉnh thông tin hoạt động hoặc liên hệ của cơ sở ${updated.name}. Trạng thái: ${updated.isActive ? 'Đang hoạt động' : 'Tạm dừng'}.`;

    if (isStatusChanged && existing) {
      const fromStatus = existing.isActive ? 'Đang hoạt động' : 'Tạm dừng';
      const toStatus = updated.isActive ? 'Đang hoạt động' : 'Tạm dừng';
      actionText = `Chuyển trạng thái chi nhánh [${fromStatus} ➔ ${toStatus}]: ${updated.name} (${updated.code})`;
      detailsText = `Chi nhánh ${updated.name} đã được chuyển trạng thái từ [${fromStatus}] sang [${toStatus}].`;
    }

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
}

