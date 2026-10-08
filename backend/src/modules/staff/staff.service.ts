import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const METADATA_FILE = path.join(process.cwd(), 'data', 'staff_metadata.json');

function getStaffMetadataMap(): Record<string, any> {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const content = fs.readFileSync(METADATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading staff_metadata.json:', e);
  }
  return {};
}

function saveStaffMetadata(key: string, data: any) {
  try {
    const dir = path.dirname(METADATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const map = getStaffMetadataMap();
    map[key] = { ...(map[key] || {}), ...data };
    fs.writeFileSync(METADATA_FILE, JSON.stringify(map, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving staff_metadata.json:', e);
  }
}

@Injectable()
export class StaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findDoctors(branchId?: string, specialty?: string) {
    const where: any = {
      doctorProfile: { isNot: null },
      isActive: true,
    };

    if (branchId) where.branchId = branchId;
    if (specialty) {
      where.doctorProfile.specialty = { contains: specialty, mode: 'insensitive' };
    }

    const doctors = await this.prisma.user.findMany({
      where,
      include: {
        branch: true,
        doctorProfile: {
          include: {
            assignedChairs: {
              include: { room: true },
            },
          },
        },
        userRoles: {
          include: { role: true },
        },
        _count: {
          select: {
            doctorAppointments: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return doctors.map((d) => ({
      id: d.id,
      code: d.employeeCode,
      name: d.fullName,
      email: d.email,
      phone: d.phone,
      avatar: d.avatarUrl,
      role: 'Doctor',
      specialty: d.doctorProfile?.specialty || 'Bác sĩ chuyên khoa',
      department: d.doctorProfile?.specialty ? `Khoa ${d.doctorProfile.specialty}` : 'Nha khoa',
      branch: d.branch.name,
      branchId: d.branchId,
      status: 'Active',
      rating: d.doctorProfile?.ratingAverage || 5.0,
      totalAppointments: d._count.doctorAppointments,
      experienceYears: d.doctorProfile?.experienceYears || 5,
      bio: d.doctorProfile?.bio,
      licenseNumber: d.doctorProfile?.licenseNumber,
    }));
  }

  async findAllStaff(branchId?: string) {
    const where: any = {
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
    if (branchId && branchId !== 'ALL') where.branchId = branchId;

    const staff = await this.prisma.user.findMany({
      where,
      include: {
        branch: true,
        doctorProfile: true,
        userRoles: {
          include: { role: true },
        },
        _count: {
          select: {
            doctorAppointments: true,
          },
        },
      },
      orderBy: { employeeCode: 'asc' },
    });

    const metadataMap = getStaffMetadataMap();
    return staff.map((s) => {
      const meta = metadataMap[s.id] || metadataMap[s.employeeCode] || {};
      const roleName = s.userRoles[0]?.role?.name || 'STAFF';
      const roleDesc = s.userRoles[0]?.role?.description;
      const rLower = roleName.toLowerCase();

      let displayRole = 'Bác sĩ chuyên khoa';
      if (roleName === 'SUPER_ADMIN' || rLower.includes('admin') || rLower.includes('quản trị')) displayRole = 'Quản trị viên';
      else if (roleName === 'BRANCH_MANAGER' || rLower.includes('quản lý') || rLower.includes('giám đốc') || rLower === 'manager') displayRole = 'Quản lý chi nhánh';
      else if (rLower.includes('kế toán') || rLower.includes('accountant') || rLower.includes('ketoan')) displayRole = 'Kế toán';
      else if (roleName === 'NURSE' || rLower.includes('điều dưỡng') || rLower.includes('phụ tá')) displayRole = 'Điều dưỡng';
      else if (roleName === 'TECHNICIAN' || rLower.includes('kỹ thuật')) displayRole = 'Kỹ thuật viên';
      else if (roleName === 'RECEPTIONIST' || rLower.includes('lễ tân') || rLower.includes('tiếp tân')) displayRole = 'Lễ tân';
      else if (rLower.includes('bác sĩ') || roleName === 'DOCTOR') displayRole = 'Bác sĩ chuyên khoa';
      else if (roleDesc) displayRole = roleDesc;
      else displayRole = roleName;

      const isAccountant = rLower.includes('kế toán') || rLower.includes('accountant') || rLower.includes('ketoan');
      const isNurse = roleName === 'NURSE' || rLower.includes('điều dưỡng') || rLower.includes('phụ tá');
      const isTech = roleName === 'TECHNICIAN' || rLower.includes('kỹ thuật');
      const isRecep = roleName === 'RECEPTIONIST' || rLower.includes('lễ tân') || rLower.includes('tiếp tân');
      const isAdmin = roleName === 'SUPER_ADMIN' || roleName === 'BRANCH_MANAGER' || rLower.includes('quản');
      const isClinicalRole = (roleName === 'DOCTOR' || rLower.includes('bác sĩ')) && !isAccountant && !isNurse && !isTech && !isRecep && !isAdmin;

      const specialty =
        s.doctorProfile?.specialty ||
        (isAccountant ? 'Kế toán & Quản lý Lương'
        : isRecep ? 'Lễ tân & Điều phối'
        : isNurse ? 'Điều dưỡng & Phụ tá'
        : isTech ? 'Vô trùng & Kỹ thuật'
        : isAdmin ? 'Quản lý vận hành'
        : 'Nha khoa chuyên sâu');

      const department =
        s.doctorProfile?.specialty ? `Khoa ${s.doctorProfile.specialty}`
        : isAccountant ? 'Phòng Tài chính - Kế toán'
        : isRecep ? 'Bộ phận Tiếp tân & CSKH'
        : isNurse ? 'Bộ phận Điều dưỡng'
        : isTech ? 'Phòng Mổ & Tiệt khuẩn'
        : isAdmin ? 'Ban Quản trị Cơ sở'
        : 'Nha khoa tổng quát';

      const defaultServices = isClinicalRole
        ? (s.employeeCode === 'NV002' || s.doctorProfile?.specialty?.includes('Implant')
          ? ['Cấy ghép Implant Straumann', 'Trụ Osstem No mount (Hàn Quốc)', 'Trụ Osstem SA (Hàn Quốc)']
          : ['Sứ toàn phần Cercon (Đức)', 'Sứ toàn phần Emax', 'Mặt dán Veneer Emax'])
        : [];

      const commissionRate = meta.commissionRate !== undefined
        ? Number(meta.commissionRate)
        : (isClinicalRole ? (s.doctorProfile?.specialty?.includes('Implant') ? 20 : 15) : 0);

      const rating = isClinicalRole || isNurse ? (s.doctorProfile?.ratingAverage || 4.9) : 0;
      const totalAppointments = isClinicalRole || isNurse
        ? (s._count?.doctorAppointments || (s.doctorProfile?.totalReviews ? Math.round(s.doctorProfile.totalReviews * 1.2) : 50))
        : 0;

      const salaryBase = isClinicalRole
        ? 25000000
        : isAccountant
        ? 18000000
        : isTech
        ? 15000000
        : isNurse
        ? 12000000
        : 10000000;

      const allowance = isClinicalRole
        ? 5000000
        : isAccountant
        ? 3000000
        : isTech || isNurse
        ? 2500000
        : 2000000;

      return {
        id: s.id,
        code: s.employeeCode || `NV-${s.id.slice(0, 4)}`,
        employeeCode: s.employeeCode || `NV-${s.id.slice(0, 4)}`,
        name: s.fullName,
        fullName: s.fullName,
        email: s.email,
        phone: s.phone || '0901234567',
        avatar: s.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
        avatarUrl: s.avatarUrl,
        role: displayRole,
        roleRaw: roleName,
        specialty,
        department,
        branch: s.branch?.name || 'Chi nhánh Biên Hòa',
        branchId: s.branchId,
        status: s.isActive ? 'Active' : 'Inactive',
        rating,
        totalAppointments,
        commissionRate,
        services: meta.services || defaultServices,
        workDays: meta.workDays || ['T2', 'T3', 'T4', 'T5', 'T6'],
        workHours: meta.workHours || '08:00 - 17:30',
        lunchBreak: meta.lunchBreak || '12:00 - 13:30',
        salaryBase,
        allowance,
        experienceYears: s.doctorProfile?.experienceYears || 5,
        bio: s.doctorProfile?.bio,
        licenseNumber: s.doctorProfile?.licenseNumber,
        doctorProfile: s.doctorProfile,
      };
    });
  }

  async getDoctorById(id: string) {
    const doctor = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id },
          { employeeCode: id },
          { email: id },
        ],
      },
      include: {
        branch: true,
        doctorProfile: {
          include: {
            assignedChairs: {
              include: { room: true },
            },
          },
        },
        userRoles: {
          include: { role: true },
        },
        doctorAppointments: {
          include: {
            patient: true,
            services: { include: { service: true } },
          },
          take: 20,
          orderBy: { startTime: 'desc' },
        },
        staffSchedules: {
          include: { branch: true },
          orderBy: { workDate: 'asc' },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Nhân sự ${id} không tồn tại`);
    }

    const roleName = doctor.userRoles[0]?.role?.name || 'DOCTOR';
    const roleDesc = doctor.userRoles[0]?.role?.description;
    const rLower = roleName.toLowerCase();

    let displayRole = 'Bác sĩ chuyên khoa';
    if (roleName === 'SUPER_ADMIN' || rLower.includes('admin') || rLower.includes('quản trị')) displayRole = 'Quản trị viên';
    else if (roleName === 'BRANCH_MANAGER' || rLower.includes('quản lý') || rLower.includes('giám đốc') || rLower === 'manager') displayRole = 'Quản lý chi nhánh';
    else if (rLower.includes('kế toán') || rLower.includes('accountant') || rLower.includes('ketoan')) displayRole = 'Kế toán';
    else if (roleName === 'NURSE' || rLower.includes('điều dưỡng') || rLower.includes('phụ tá')) displayRole = 'Điều dưỡng';
    else if (roleName === 'TECHNICIAN' || rLower.includes('kỹ thuật')) displayRole = 'Kỹ thuật viên';
    else if (roleName === 'RECEPTIONIST' || rLower.includes('lễ tân') || rLower.includes('tiếp tân')) displayRole = 'Lễ tân';
    else if (rLower.includes('bác sĩ') || roleName === 'DOCTOR') displayRole = 'Bác sĩ chuyên khoa';
    else if (roleDesc) displayRole = roleDesc;
    else displayRole = roleName;

    const isAccountant = rLower.includes('kế toán') || rLower.includes('accountant') || rLower.includes('ketoan');
    const isNurse = roleName === 'NURSE' || rLower.includes('điều dưỡng') || rLower.includes('phụ tá');
    const isTech = roleName === 'TECHNICIAN' || rLower.includes('kỹ thuật');
    const isRecep = roleName === 'RECEPTIONIST' || rLower.includes('lễ tân') || rLower.includes('tiếp tân');
    const isAdmin = roleName === 'SUPER_ADMIN' || roleName === 'BRANCH_MANAGER' || rLower.includes('quản');
    const isClinicalRole = (roleName === 'DOCTOR' || rLower.includes('bác sĩ')) && !isAccountant && !isNurse && !isTech && !isRecep && !isAdmin;

    const metadataMap = getStaffMetadataMap();
    const meta = metadataMap[doctor.id] || metadataMap[doctor.employeeCode] || {};

    const defaultServices = isClinicalRole
      ? (doctor.employeeCode === 'NV002' || doctor.doctorProfile?.specialty?.includes('Implant')
        ? ['Cấy ghép Implant Straumann', 'Trụ Osstem No mount (Hàn Quốc)', 'Trụ Osstem SA (Hàn Quốc)']
        : ['Sứ toàn phần Cercon (Đức)', 'Sứ toàn phần Emax', 'Mặt dán Veneer Emax'])
      : [];

    const commissionRate = meta.commissionRate !== undefined
      ? Number(meta.commissionRate)
      : (isClinicalRole ? (doctor.doctorProfile?.specialty?.includes('Implant') ? 20 : 15) : 0);

    const specialty =
      doctor.doctorProfile?.specialty ||
      (isAccountant ? 'Kế toán & Quản lý Lương'
      : isRecep ? 'Lễ tân & Điều phối'
      : isNurse ? 'Điều dưỡng & Phụ tá'
      : isTech ? 'Vô trùng & Kỹ thuật'
      : isAdmin ? 'Ban Quản trị & Vận hành'
      : 'Nha khoa chuyên sâu');

    const department =
      doctor.doctorProfile?.specialty ? `Khoa ${doctor.doctorProfile.specialty}`
      : isAccountant ? 'Phòng Tài chính - Kế toán'
      : isRecep ? 'Bộ phận Tiếp tân & CSKH'
      : isNurse ? 'Bộ phận Điều dưỡng'
      : isTech ? 'Phòng Mổ & Tiệt khuẩn'
      : isAdmin ? 'Ban Giám Đốc'
      : 'Nha khoa tổng quát';

    const rating = isClinicalRole || isNurse ? (doctor.doctorProfile?.ratingAverage || 4.9) : 0;
    const totalAppointments = isClinicalRole || isNurse ? (doctor.doctorAppointments.length || 128) : 0;

    return {
      id: doctor.id,
      code: doctor.employeeCode,
      employeeCode: doctor.employeeCode,
      name: doctor.fullName,
      fullName: doctor.fullName,
      email: doctor.email,
      phone: doctor.phone,
      avatar: doctor.avatarUrl,
      avatarUrl: doctor.avatarUrl,
      role: displayRole,
      roleRaw: roleName,
      specialty,
      department,
      branch: doctor.branch?.name || 'Chi nhánh Biên Hòa',
      branchId: doctor.branchId,
      status: doctor.isActive ? 'Active' : 'Inactive',
      rating,
      totalAppointments,
      commissionRate,
      services: meta.services || defaultServices,
      workDays: meta.workDays || ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      workHours: meta.workHours || '08:00 - 17:30',
      lunchBreak: meta.lunchBreak || '12:00 - 13:30',
      salaryBase: 25000000,
      allowance: 3000000,
      experienceYears: doctor.doctorProfile?.experienceYears || 10,
      bio: doctor.doctorProfile?.bio,
      licenseNumber: doctor.doctorProfile?.licenseNumber || '004589/ĐNAI-CCHN',
      doctorProfile: doctor.doctorProfile,
      doctorAppointments: doctor.doctorAppointments,
      staffSchedules: doctor.staffSchedules,
    };
  }

  async updateStaff(
    id: string,
    data: {
      fullName?: string;
      email?: string;
      phone?: string;
      branchId?: string;
      roleName?: string;
      specialty?: string;
      experienceYears?: number;
      bio?: string;
      avatarUrl?: string;
      isActive?: boolean;
      commissionRate?: number;
      services?: string[];
      workDays?: string[];
      workHours?: string;
      lunchBreak?: string;
    },
    operatorUserId?: string,
  ) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ id }, { employeeCode: id }, { email: id }],
      },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Nhân sự ${id} không tồn tại`);
    }

    const finalUserId = operatorUserId || undefined;

    if (
      data.commissionRate !== undefined ||
      data.services !== undefined ||
      data.workDays !== undefined ||
      data.workHours !== undefined ||
      data.lunchBreak !== undefined
    ) {
      saveStaffMetadata(existing.id, {
        commissionRate: data.commissionRate !== undefined ? Number(data.commissionRate) : undefined,
        services: data.services,
        workDays: data.workDays,
        workHours: data.workHours,
        lunchBreak: data.lunchBreak,
      });
      if (existing.employeeCode) {
        saveStaffMetadata(existing.employeeCode, {
          commissionRate: data.commissionRate !== undefined ? Number(data.commissionRate) : undefined,
          services: data.services,
          workDays: data.workDays,
          workHours: data.workHours,
          lunchBreak: data.lunchBreak,
        });
      }

      if (data.workDays && Array.isArray(data.workDays)) {
        try {
          const dayKeysMap: Record<number, string> = {
            0: 'CN',
            1: 'T2',
            2: 'T3',
            3: 'T4',
            4: 'T5',
            5: 'T6',
            6: 'T7',
          };
          const allUserSchedules = await this.prisma.staffSchedule.findMany({
            where: { userId: existing.id },
          });
          for (const sc of allUserSchedules) {
            const d = new Date(sc.workDate);
            const dayKey = dayKeysMap[d.getUTCDay()];
            if (dayKey && !data.workDays.includes(dayKey)) {
              await this.prisma.staffSchedule.delete({ where: { id: sc.id } });
            }
          }
        } catch (e) {
          console.warn('Error clearing non-workday schedules:', e);
        }
      }
    }

    const oldRoleName = existing.userRoles?.[0]?.role?.name || 'Chưa phân quyền';

    const result = await this.prisma.$transaction(async (tx) => {
      const userUpdateData: any = {};
      if (data.fullName) userUpdateData.fullName = data.fullName.trim();
      if (data.email) userUpdateData.email = data.email.trim();
      if (data.phone) userUpdateData.phone = data.phone.trim();
      if (data.branchId) userUpdateData.branchId = data.branchId;
      if (data.avatarUrl !== undefined) userUpdateData.avatarUrl = data.avatarUrl;
      if (data.isActive !== undefined) userUpdateData.isActive = data.isActive;

      const updatedUser = await tx.user.update({
        where: { id: existing.id },
        data: userUpdateData,
      });

      // Xử lý thay đổi chức vụ / vai trò nếu có
      if (data.roleName && data.roleName.trim()) {
        const cleanRoleName = data.roleName.trim();
        let targetRole = await tx.role.findFirst({
          where: {
            OR: [
              { name: cleanRoleName },
              { name: { equals: cleanRoleName, mode: 'insensitive' } },
              { description: { equals: cleanRoleName, mode: 'insensitive' } },
            ],
          },
        });

        if (!targetRole) {
          targetRole = await tx.role.create({
            data: {
              name: cleanRoleName,
              description: `Chức vụ ${cleanRoleName}`,
            },
          });
        }

        if (targetRole) {
          await tx.userRole.deleteMany({ where: { userId: existing.id } });
          await tx.userRole.create({
            data: {
              userId: existing.id,
              roleId: targetRole.id,
            },
          });
        }
      }

      if (data.specialty || data.bio || data.experienceYears !== undefined) {
        await tx.doctorProfile.upsert({
          where: { userId: existing.id },
          update: {
            specialty: data.specialty || undefined,
            bio: data.bio || undefined,
            experienceYears: data.experienceYears !== undefined ? Number(data.experienceYears) : undefined,
          },
          create: {
            userId: existing.id,
            specialty: data.specialty || 'Nha khoa chuyên sâu',
            licenseNumber: `CCHN-${Math.floor(100000 + Math.random() * 900000)}`,
            experienceYears: data.experienceYears ? Number(data.experienceYears) : 5,
            bio: data.bio,
          },
        });
      }

      return updatedUser;
    });

    // 1. Nếu có thay đổi vai trò: Ghi AuditLog và gửi thông báo 2 chiều
    if (data.roleName && data.roleName.trim() && data.roleName !== oldRoleName) {
      await this.auditLogsService.log({
        userId: finalUserId,
        module: 'RBAC_SECURITY',
        action: `Thay đổi chức vụ của nhân sự ${existing.fullName}: từ "${oldRoleName}" sang "${data.roleName}"`,
        details: `Cập nhật quyền hạn và vai trò cho nhân sự mã ${existing.employeeCode}. Chức vụ cũ: ${oldRoleName}, chức vụ mới: ${data.roleName}.`,
        targetEntity: existing.employeeCode,
        status: 'SUCCESS',
      });

      // Thông báo cho nhân sự được đổi vai trò
      await this.notificationsService.create({
        userId: existing.id,
        title: 'Cập nhật chức vụ tài khoản',
        content: `Chức vụ tài khoản của bạn đã được Quản trị viên cập nhật thành: "${data.roleName}". Vui lòng đăng nhập lại hoặc tải lại trang để áp dụng phân quyền mới.`,
        type: 'ROLE_CHANGE',
        link: '/admin/profile',
      });

      // Thông báo cho Quản trị viên thực hiện
      if (finalUserId && finalUserId !== existing.id) {
        await this.notificationsService.create({
          userId: finalUserId,
          title: 'Thay đổi chức vụ nhân sự thành công',
          content: `Bạn đã thay đổi chức vụ của nhân sự ${existing.fullName} (${existing.employeeCode}) từ "${oldRoleName}" sang "${data.roleName}".`,
          type: 'ROLE_CHANGE',
          link: `/admin/staff/${existing.id}`,
        });
      }
    } else if (data.isActive !== undefined && data.isActive !== existing.isActive) {
      // Ghi log trạng thái khóa / mở tài khoản khi có thay đổi thực tế
      const actionText = data.isActive ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
      const fromStatus = existing.isActive ? 'Đang hoạt động' : 'Đã khóa';
      const toStatus = data.isActive ? 'Đang hoạt động' : 'Đã khóa';
      await this.auditLogsService.log({
        userId: finalUserId,
        module: 'STAFF',
        action: `${actionText} nhân sự: ${existing.fullName} (${existing.employeeCode}) [${fromStatus} ➔ ${toStatus}]`,
        details: `Trạng thái hoạt động của tài khoản đã được chuyển từ [${fromStatus}] sang [${toStatus}].`,
        targetEntity: existing.employeeCode,
        status: 'SUCCESS',
      });
    } else {
      // Ghi log cập nhật thông tin hồ sơ chung
      await this.auditLogsService.log({
        userId: finalUserId,
        module: 'STAFF',
        action: `Cập nhật hồ sơ nhân sự: ${existing.fullName} (${existing.employeeCode})`,
        details: `Đã cập nhật thông tin chuyên môn, lịch làm việc hoặc tỷ lệ hoa hồng cho nhân sự ${existing.fullName}.`,
        targetEntity: existing.employeeCode,
        status: 'SUCCESS',
      });
    }

    return result;
  }

  // --- QUẢN LÝ LỊCH TRỰC (STAFF SCHEDULES) ---

  async getStaffSchedules(query?: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }) {
    const where: any = {};
    if (query?.branchId && query.branchId !== 'ALL') {
      where.branchId = query.branchId;
    }
    if (query?.userId) {
      where.userId = query.userId;
    }
    if (query?.startDate || query?.endDate) {
      where.workDate = {};
      if (query.startDate) where.workDate.gte = new Date(query.startDate);
      if (query.endDate) where.workDate.lte = new Date(query.endDate);
    }

    const schedules = await this.prisma.staffSchedule.findMany({
      where,
      include: {
        user: {
          include: {
            branch: true,
            doctorProfile: true,
            userRoles: { include: { role: true } },
          },
        },
        branch: true,
      },
      orderBy: [{ workDate: 'asc' }, { shiftStart: 'asc' }],
    });

    return schedules.map((sc) => {
      const d = new Date(sc.workDate);
      const dateStr = d.toISOString().split('T')[0];
      const startH = sc.shiftStart.getUTCHours().toString().padStart(2, '0');
      const startM = sc.shiftStart.getUTCMinutes().toString().padStart(2, '0');
      const endH = sc.shiftEnd.getUTCHours().toString().padStart(2, '0');
      const endM = sc.shiftEnd.getUTCMinutes().toString().padStart(2, '0');
      const startTime = `${startH}:${startM}`;
      const endTime = `${endH}:${endM}`;

      let shiftType: 'morning' | 'afternoon' | 'fullday' | 'leave' | 'overtime' = 'fullday';
      if (sc.isLeave) shiftType = 'leave';
      else if (parseInt(startH, 10) >= 18) shiftType = 'overtime';
      else if (parseInt(startH, 10) <= 9 && parseInt(endH, 10) >= 16) shiftType = 'fullday';
      else if (parseInt(startH, 10) >= 12) shiftType = 'afternoon';
      else if (parseInt(endH, 10) <= 13) shiftType = 'morning';

      return {
        id: sc.id,
        staffId: sc.userId,
        staffCode: sc.user.employeeCode,
        staffName: sc.user.fullName,
        staffRole: sc.user.userRoles[0]?.role?.name || 'DOCTOR',
        staffAvatar: sc.user.avatarUrl,
        specialty: sc.user.doctorProfile?.specialty || 'Nha khoa',
        branchId: sc.branchId,
        branchName: sc.branch.name,
        date: dateStr,
        shiftType,
        startTime,
        endTime,
        isLeave: sc.isLeave,
        notes: sc.notes,
        room: sc.notes?.includes('Ghế') ? sc.notes : undefined,
      };
    });
  }

  async createStaffSchedule(data: {
    userId?: string;
    staffId?: string;
    branchId?: string;
    workDate?: string;
    date?: string;
    shiftType: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }) {
    const rawUserId = data.userId || data.staffId;
    if (!rawUserId) {
      throw new NotFoundException('userId hoặc staffId là bắt buộc');
    }

    // Resolve user to ensure valid foreign key
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: rawUserId }, { employeeCode: rawUserId }],
      },
    });

    const targetUserId = user ? user.id : rawUserId;
    let targetBranchId = data.branchId || user?.branchId;
    if (!targetBranchId) {
      const defaultBranch = await this.prisma.branch.findFirst();
      targetBranchId = defaultBranch?.id || '';
    }

    const dateStr = data.workDate || data.date || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr.split('T')[0] + 'T00:00:00.000Z');

    let start = '08:00';
    let end = '12:00';
    let isLeave = false;
    const normShift = (data.shiftType || 'morning').toLowerCase();

    if (normShift === 'morning' || normShift === 'ca sáng') {
      start = data.startTime || '08:00';
      end = data.endTime || '12:00';
    } else if (normShift === 'afternoon' || normShift === 'ca chiều') {
      start = data.startTime || '13:30';
      end = data.endTime || '17:30';
    } else if (normShift === 'fullday' || normShift === 'full_day' || normShift === 'cả ngày' || normShift === 'ca tiêu chuẩn' || normShift === 'standard') {
      start = data.startTime || '08:00';
      end = data.endTime || '17:30';
    } else if (normShift === 'overtime' || normShift === 'tăng ca') {
      start = data.startTime || '18:00';
      end = data.endTime || '20:30';
    } else if (normShift === 'leave' || normShift === 'nghỉ phép') {
      isLeave = true;
      start = '00:00';
      end = '23:59';
    }

    const defaultNote = isLeave
      ? 'Nghỉ phép'
      : (normShift.includes('fullday') || normShift.includes('tiêu chuẩn') || normShift.includes('standard'))
      ? 'Ca tiêu chuẩn (08:00 - 17:30)'
      : `Ca ${normShift}`;

    if (isLeave) {
      await this.prisma.staffSchedule.deleteMany({
        where: {
          userId: targetUserId,
          workDate: date,
        },
      });
    }

    return this.prisma.staffSchedule.create({
      data: {
        userId: targetUserId,
        branchId: targetBranchId,
        workDate: date,
        shiftStart: new Date(`1970-01-01T${start}:00.000Z`),
        shiftEnd: new Date(`1970-01-01T${end}:00.000Z`),
        isLeave,
        notes: data.notes || defaultNote,
      },
    });
  }

  async autoGenerateWeekSchedule(branchId?: string, weekStart?: string) {
    const monday = weekStart ? new Date(weekStart) : (() => {
      const now = new Date();
      const currentDay = now.getDay();
      const dist = currentDay === 0 ? -6 : 1 - currentDay;
      const m = new Date(now);
      m.setDate(now.getDate() + dist);
      return m;
    })();

    const where: any = {};
    if (branchId && branchId !== 'ALL') where.branchId = branchId;

    const staff = await this.prisma.user.findMany({
      where,
      include: { branch: true },
    });

    const created: any[] = [];
    const metadataMap = getStaffMetadataMap();
    const dayKeys = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    // Sinh ca tiêu chuẩn cho các ngày làm việc trong tuần (Full-time: 08:00 - 17:30)
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const shiftDate = new Date(monday);
      shiftDate.setDate(monday.getDate() + dayOffset);
      const dateOnly = new Date(shiftDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
      const currentDayKey = dayKeys[dayOffset];

      for (const u of staff) {
        const meta = metadataMap[u.id] || metadataMap[u.employeeCode] || {};
        const docWorkDays: string[] = meta.workDays || ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        if (!docWorkDays.includes(currentDayKey)) {
          // Bác sĩ không làm việc vào ngày này theo cấu hình cá nhân (OFF)
          continue;
        }

        // Kiểm tra xem đã có ca trực chưa
        const exists = await this.prisma.staffSchedule.findFirst({
          where: {
            userId: u.id,
            workDate: dateOnly,
          },
        });

        if (!exists) {
          const hours = meta.workHours || '08:00 - 17:30';
          const [startRaw, endRaw] = hours.includes('-') ? hours.split('-') : ['08:00', '17:30'];
          const start = (startRaw || '08:00').trim();
          const end = (endRaw || '17:30').trim();

          const item = await this.prisma.staffSchedule.create({
            data: {
              userId: u.id,
              branchId: u.branchId,
              workDate: dateOnly,
              shiftStart: new Date(`1970-01-01T${start}:00.000Z`),
              shiftEnd: new Date(`1970-01-01T${end}:00.000Z`),
              isLeave: false,
              notes: `Ca tiêu chuẩn (${start} - ${end})`,
            },
          });
          created.push(item);
        }
      }
    }

    return {
      success: true,
      message: `Đã tự động tạo ${created.length} ca trực chuẩn cho tuần!`,
      count: created.length,
    };
  }

  async deleteStaffSchedule(id: string) {
    return this.prisma.staffSchedule.delete({
      where: { id },
    });
  }

  async clearWeekSchedules(query: {
    branchId?: string;
    startDate: string;
    endDate: string;
    userId?: string;
  }) {
    const where: any = {};
    if (query.branchId && query.branchId !== 'ALL' && query.branchId !== 'all') {
      where.branchId = query.branchId;
    }
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.startDate && query.endDate) {
      const start = new Date(query.startDate.split('T')[0] + 'T00:00:00.000Z');
      const end = new Date(query.endDate.split('T')[0] + 'T23:59:59.999Z');
      where.workDate = {
        gte: start,
        lte: end,
      };
    }

    const result = await this.prisma.staffSchedule.deleteMany({
      where,
    });

    return {
      success: true,
      message: `Đã xóa sạch ${result.count} ca trực trong tuần!`,
      count: result.count,
    };
  }

  async createStaff(
    data: {
      employeeCode: string;
      fullName: string;
      email: string;
      phone: string;
      branchId: string;
      roleName: string;
      avatarUrl?: string;
      specialty?: string;
      licenseNumber?: string;
      experienceYears?: number;
      bio?: string;
    },
    operatorUserId?: string,
  ) {
    const defaultPassword = await bcrypt.hash('123456', 10);

    // Employee codes are unique; advance safely when the client sends an existing code.
    let employeeCode = data.employeeCode.trim();
    const existingCode = await this.prisma.user.findUnique({ where: { employeeCode } });
    if (existingCode) {
      const existingUsers = await this.prisma.user.findMany({
        where: { employeeCode: { startsWith: 'NV' } },
        select: { employeeCode: true },
      });
      const maxNumber = existingUsers.reduce((max, item) => {
        const match = item.employeeCode.match(/^NV-?(\d+)$/i);
        return match ? Math.max(max, Number(match[1])) : max;
      }, 0);
      employeeCode = `NV${String(maxNumber + 1).padStart(3, '0')}`;
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          employeeCode,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          passwordHash: defaultPassword,
          branchId: data.branchId,
          avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
        },
      });

      let role = await tx.role.findFirst({
        where: {
          OR: [
            { name: data.roleName },
            { name: { equals: data.roleName, mode: 'insensitive' } },
            { description: { equals: data.roleName, mode: 'insensitive' } },
          ],
        },
      });

      if (!role && data.roleName) {
        const lower = data.roleName.toLowerCase();
        if (lower.includes('kế toán') || lower.includes('accountant')) {
          role = await tx.role.findFirst({ where: { name: { contains: 'Kế', mode: 'insensitive' } } });
        } else if (lower.includes('bác sĩ') || lower.includes('doctor')) {
          role = await tx.role.findFirst({ where: { name: 'DOCTOR' } });
        }
      }

      if (role) {
        await tx.userRole.create({
          data: {
            userId: newUser.id,
            roleId: role.id,
          },
        });
      }

      const roleUpper = (role?.name || data.roleName || '').toUpperCase();
      const isClinicalDoctor =
        roleUpper === 'DOCTOR' ||
        role?.name?.toLowerCase().includes('bác sĩ') ||
        data.roleName?.toLowerCase().includes('bác sĩ');

      if (isClinicalDoctor && data.specialty) {
        await tx.doctorProfile.create({
          data: {
            userId: newUser.id,
            specialty: data.specialty,
            licenseNumber: data.licenseNumber || `CCHN-${Math.floor(100000 + Math.random() * 900000)}`,
            experienceYears: data.experienceYears || 3,
            bio: data.bio,
          },
        });
      }

      return newUser;
    });

    const finalUserId = operatorUserId || undefined;

    // Ghi AuditLog
    await this.auditLogsService.log({
      userId: finalUserId,
      module: 'STAFF',
      action: `Thêm mới nhân sự: ${user.fullName} (${user.employeeCode})`,
      details: `Đã thêm mới nhân sự ${user.fullName}, chức vụ "${data.roleName}", mã nhân sự ${user.employeeCode}, email ${user.email}.`,
      targetEntity: user.employeeCode,
      status: 'SUCCESS',
    });

    // Thông báo cho Quản trị viên
    if (finalUserId) {
      await this.notificationsService.create({
        userId: finalUserId,
        title: 'Thêm mới nhân sự thành công',
        content: `Nhân sự ${user.fullName} (${user.employeeCode}) với chức vụ "${data.roleName}" đã được tạo vào hệ thống.`,
        type: 'STAFF',
        link: `/admin/staff/${user.id}`,
      });
    }

    return user;
  }
}
