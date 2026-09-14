import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(data: {
    code: string;
    name: string;
    address: string;
    phone: string;
    imageUrl?: string;
  }) {
    return this.prisma.branch.create({
      data: {
        code: data.code,
        name: data.name,
        address: data.address,
        phone: data.phone,
        imageUrl: data.imageUrl,
      },
    });
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
  ) {
    return this.prisma.branch.update({
      where: { id },
      data,
    });
  }
}
