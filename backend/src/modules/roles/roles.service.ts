import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

export interface RoleDto {
  id?: string;
  name: string;
  code?: string;
  description?: string;
  permissions?: string[];
}

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultRoles();
  }

  // Initial seed of default system roles if they do not exist
  public async ensureDefaultRoles() {
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

    // Đảm bảo tài khoản admin luôn có vai trò SUPER_ADMIN
    const superAdminRole = await this.prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (superAdminRole) {
      const adminUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: 'admin@smartschedule.ai' },
            { employeeCode: 'NV-ADMIN' },
          ],
        },
      });

      if (adminUser) {
        await this.prisma.userRole.upsert({
          where: {
            userId_roleId: {
              userId: adminUser.id,
              roleId: superAdminRole.id,
            },
          },
          update: {},
          create: {
            userId: adminUser.id,
            roleId: superAdminRole.id,
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

  async createRole(data: { name: string; description?: string }, operatorUserId?: string) {
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

    const finalUserId = operatorUserId || undefined;

    await this.auditLogsService.log({
      userId: finalUserId,
      module: 'RBAC_SECURITY',
      action: `Tạo chức danh / vai trò mới: ${role.name}`,
      details: `Đã thêm vai trò mới "${role.name}" (${role.description || 'Không có mô tả'}).`,
      targetEntity: role.name,
      status: 'SUCCESS',
    });

    if (finalUserId) {
      await this.notificationsService.create({
        userId: finalUserId,
        title: 'Tạo vai trò thành công',
        content: `Bạn đã tạo vai trò "${role.name}" trong hệ thống phân quyền.`,
        type: 'ROLE_CHANGE',
        link: '/admin/settings',
      });
    }

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

  async updateRole(id: string, data: { name?: string; description?: string }, operatorUserId?: string) {
    let targetId = id;
    const role = await this.prisma.role.findUnique({
      where: { id: targetId },
      include: {
        _count: { select: { userRoles: true } },
      },
    });

    if (!role) {
      // Try finding by name if id passed was name
      const roleByName = await this.prisma.role.findUnique({
        where: { name: id },
        include: {
          _count: { select: { userRoles: true } },
        },
      });
      if (!roleByName) {
        throw new BadRequestException('Không tìm thấy vai trò / chức vụ cần cập nhật');
      }
      targetId = roleByName.id;
    }

    const updateData: any = {};
    if (data.name && data.name.trim()) {
      const cleanName = data.name.trim();
      const existing = await this.prisma.role.findFirst({
        where: {
          name: cleanName,
          NOT: { id: targetId },
        },
      });
      if (existing) {
        throw new BadRequestException(`Chức vụ "${cleanName}" đã tồn tại trên hệ thống`);
      }
      updateData.name = cleanName;
    }

    if (data.description !== undefined) {
      updateData.description = data.description ? data.description.trim() : null;
    }

    const updated = await this.prisma.role.update({
      where: { id: targetId },
      data: updateData,
      include: {
        _count: { select: { userRoles: true } },
        rolePermissions: { include: { permission: true } },
      },
    });

    const finalUserId = operatorUserId || undefined;

    await this.auditLogsService.log({
      userId: finalUserId,
      module: 'RBAC_SECURITY',
      action: `Cập nhật vai trò hệ thống: ${updated.name}`,
      details: `Thay đổi thông tin vai trò ${updated.name}. Số nhân sự trực thuộc: ${updated._count.userRoles}.`,
      targetEntity: updated.name,
      status: 'SUCCESS',
    });

    if (finalUserId) {
      await this.notificationsService.create({
        userId: finalUserId,
        title: 'Cập nhật vai trò hệ thống',
        content: `Vai trò "${updated.name}" đã được cập nhật thành công.`,
        type: 'ROLE_CHANGE',
        link: '/admin/settings',
      });
    }

    return {
      success: true,
      message: 'Cập nhật chức vụ thành công! Các nhân sự thuộc chức vụ này đã được đồng bộ tự động.',
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        userCount: updated._count.userRoles,
        permissions: updated.rolePermissions.map((rp) => rp.permission.code),
      },
    };
  }

  async saveMatrix(matrix: Record<string, string[]>, operatorUserId?: string) {
    const codeToRoleName: Record<string, string> = {
      owner: 'SUPER_ADMIN',
      doctor: 'DOCTOR',
      receptionist: 'RECEPTIONIST',
      nurse: 'NURSE',
      technician: 'TECHNICIAN',
      manager: 'BRANCH_MANAGER',
      ke_toan: 'Kế Toán',
    };

    // matrix is a map: roleCodeOrName -> array of permission/module codes
    for (const [roleCodeOrName, permCodes] of Object.entries(matrix)) {
      const canonicalName = codeToRoleName[roleCodeOrName] || roleCodeOrName;
      let role = await this.prisma.role.findFirst({
        where: {
          OR: [
            { name: canonicalName },
            { name: roleCodeOrName },
          ],
        },
      });

      if (!role) {
        role = await this.prisma.role.create({
          data: { name: canonicalName, description: `Chức vụ ${canonicalName}` },
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

    const finalUserId = operatorUserId || undefined;

    await this.auditLogsService.log({
      userId: finalUserId,
      module: 'RBAC_SECURITY',
      action: 'Cập nhật ma trận phân quyền RBAC hệ thống',
      details: `Đã thiết lập lại ma trận quyền truy cập cho ${Object.keys(matrix).length} vai trò nghiệp vụ.`,
      targetEntity: 'RBAC_MATRIX',
      status: 'SUCCESS',
    });

    if (finalUserId) {
      await this.notificationsService.create({
        userId: finalUserId,
        title: 'Phân quyền RBAC đã được cập nhật',
        content: 'Ma trận phân quyền hệ thống vừa được lưu và áp dụng cho toàn bộ nhân sự.',
        type: 'ROLE_CHANGE',
        link: '/admin/settings',
      });
    }

    return {
      success: true,
      message: 'Lưu ma trận phân quyền RBAC thành công',
    };
  }
}
