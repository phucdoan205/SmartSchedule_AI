import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

export interface RoleDto {
  id?: string;
  name: string;
  code?: string;
  description?: string;
  permissions?: string[];
}

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  // Initial seed of default system roles if they do not exist
  private async ensureDefaultRoles() {
    const defaultRoles = [
      { name: 'SUPER_ADMIN', description: 'Chủ phòng khám (Toàn quyền hệ thống)' },
      { name: 'DOCTOR', description: 'Bác sĩ chuyên khoa (Khám chữa bệnh & EMR)' },
      { name: 'RECEPTIONIST', description: 'Lễ tân phòng khám (Tiếp đón & Lịch hẹn)' },
      { name: 'NURSE', description: 'Điều dưỡng viên (Hỗ trợ điều trị & Chăm sóc)' },
      { name: 'TECHNICIAN', description: 'Kỹ thuật viên xét nghiệm (Chẩn đoán hình ảnh & X-Quang)' },
      { name: 'BRANCH_MANAGER', description: 'Quản lý chi nhánh (Vận hành & Cơ sở)' },
    ];

    for (const r of defaultRoles) {
      const existing = await this.prisma.role.findUnique({ where: { name: r.name } });
      if (!existing) {
        await this.prisma.role.create({
          data: {
            name: r.name,
            description: r.description,
          },
        });
      }
    }
  }

  async findAll() {
    await this.ensureDefaultRoles();

    const roles = await this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      userCount: r._count.userRoles,
      permissions: r.rolePermissions.map((rp) => rp.permission.code),
    }));
  }

  async createRole(data: { name: string; description?: string }) {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestException('Tên chức vụ / vai trò không được để trống');
    }

    const cleanName = data.name.trim();

    // Check if role name already exists
    const existing = await this.prisma.role.findUnique({
      where: { name: cleanName },
    });
    if (existing) {
      throw new BadRequestException(`Chức vụ "${cleanName}" đã tồn tại trong hệ thống`);
    }

    const role = await this.prisma.role.create({
      data: {
        name: cleanName,
        description: data.description?.trim() || null,
      },
    });

    return {
      success: true,
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: [],
      },
    };
  }

  async saveMatrix(matrix: Record<string, string[]>) {
    // matrix is a map: roleName -> array of permission/module codes
    for (const [roleName, permCodes] of Object.entries(matrix)) {
      let role = await this.prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        role = await this.prisma.role.create({
          data: { name: roleName, description: `Chức vụ ${roleName}` },
        });
      }

      // Delete existing role permissions
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: role.id },
      });

      // Ensure permissions exist and link
      for (const code of permCodes) {
        let perm = await this.prisma.permission.findUnique({ where: { code } });
        if (!perm) {
          perm = await this.prisma.permission.create({
            data: {
              code,
              name: code,
              module: code.split('_')[0] || 'SYSTEM',
            },
          });
        }

        await this.prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: perm.id,
          },
        });
      }
    }

    return {
      success: true,
      message: 'Lưu ma trận phân quyền RBAC thành công',
    };
  }
}
