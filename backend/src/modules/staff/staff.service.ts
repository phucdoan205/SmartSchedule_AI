import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

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

    return staff.map((s) => {
      const roleName = s.userRoles[0]?.role?.name || 'STAFF';
      let displayRole = 'Bác sĩ chuyên khoa';
      if (roleName === 'SUPER_ADMIN') displayRole = 'Quản trị viên';
      else if (roleName === 'BRANCH_MANAGER') displayRole = 'Quản lý chi nhánh';
      else if (roleName === 'NURSE') displayRole = 'Điều dưỡng';
      else if (roleName === 'TECHNICIAN') displayRole = 'Kỹ thuật viên';
      else if (roleName === 'RECEPTIONIST') displayRole = 'Lễ tân';

      const specialty =
        s.doctorProfile?.specialty ||
        (roleName === 'RECEPTIONIST' ? 'Lễ tân & Điều phối'
        : roleName === 'NURSE' ? 'Điều dưỡng & Phụ tá'
        : roleName === 'TECHNICIAN' ? 'Vô trùng & Kỹ thuật'
        : 'Nha khoa chuyên sâu');

      const department =
        s.doctorProfile?.specialty ? `Khoa ${s.doctorProfile.specialty}`
        : roleName === 'RECEPTIONIST' ? 'Bộ phận Tiếp tân & CSKH'
        : roleName === 'NURSE' ? 'Bộ phận Điều dưỡng'
        : roleName === 'TECHNICIAN' ? 'Phòng Mổ & Tiệt khuẩn'
        : 'Nha khoa tổng quát';

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
        rating: s.doctorProfile?.ratingAverage || 4.9,
        totalAppointments:
          s._count?.doctorAppointments ||
          (s.doctorProfile?.totalReviews ? Math.round(s.doctorProfile.totalReviews * 1.2) : 50),
        commissionRate: s.doctorProfile?.specialty?.includes('Implant') ? 20 : 15,
        salaryBase: 25000000,
        allowance: 3000000,
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
    let displayRole = 'Bác sĩ chuyên khoa';
    if (roleName === 'SUPER_ADMIN') displayRole = 'Quản trị viên';
    else if (roleName === 'BRANCH_MANAGER') displayRole = 'Quản lý chi nhánh';
    else if (roleName === 'NURSE') displayRole = 'Điều dưỡng';
    else if (roleName === 'TECHNICIAN') displayRole = 'Kỹ thuật viên';
    else if (roleName === 'RECEPTIONIST') displayRole = 'Lễ tân';

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
      specialty: doctor.doctorProfile?.specialty || 'Phục hình Răng sứ & Thẩm mỹ',
      department: doctor.doctorProfile?.specialty ? `Khoa ${doctor.doctorProfile.specialty}` : 'Nha khoa',
      branch: doctor.branch?.name || 'Chi nhánh Biên Hòa',
      branchId: doctor.branchId,
      status: doctor.isActive ? 'Active' : 'Inactive',
      rating: doctor.doctorProfile?.ratingAverage || 4.9,
      totalAppointments: doctor.doctorAppointments.length || 128,
      commissionRate: doctor.doctorProfile?.specialty?.includes('Implant') ? 20 : 15,
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
      specialty?: string;
      experienceYears?: number;
      bio?: string;
      avatarUrl?: string;
    },
  ) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ id }, { employeeCode: id }, { email: id }],
      },
    });

    if (!existing) {
      throw new NotFoundException(`Nhân sự ${id} không tồn tại`);
    }

    return this.prisma.$transaction(async (tx) => {
      const userUpdateData: any = {};
      if (data.fullName) userUpdateData.fullName = data.fullName.trim();
      if (data.email) userUpdateData.email = data.email.trim();
      if (data.phone) userUpdateData.phone = data.phone.trim();
      if (data.branchId) userUpdateData.branchId = data.branchId;
      if (data.avatarUrl !== undefined) userUpdateData.avatarUrl = data.avatarUrl;

      const updatedUser = await tx.user.update({
        where: { id: existing.id },
        data: userUpdateData,
      });

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

      let shiftType: 'morning' | 'afternoon' | 'leave' | 'overtime' = 'morning';
      if (sc.isLeave) shiftType = 'leave';
      else if (parseInt(startH, 10) >= 18) shiftType = 'overtime';
      else if (parseInt(startH, 10) >= 12) shiftType = 'afternoon';

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
    userId: string;
    branchId: string;
    workDate: string;
    shiftType: 'morning' | 'afternoon' | 'fullday' | 'leave' | 'overtime';
    startTime?: string;
    endTime?: string;
    notes?: string;
  }) {
    const date = new Date(data.workDate + 'T00:00:00.000Z');
    let start = '08:00';
    let end = '12:00';
    let isLeave = false;

    if (data.shiftType === 'morning') {
      start = data.startTime || '08:00';
      end = data.endTime || '12:00';
    } else if (data.shiftType === 'afternoon') {
      start = data.startTime || '13:30';
      end = data.endTime || '17:30';
    } else if (data.shiftType === 'overtime') {
      start = data.startTime || '18:00';
      end = data.endTime || '20:30';
    } else if (data.shiftType === 'leave') {
      isLeave = true;
      start = '00:00';
      end = '23:59';
    }

    return this.prisma.staffSchedule.create({
      data: {
        userId: data.userId,
        branchId: data.branchId,
        workDate: date,
        shiftStart: new Date(`1970-01-01T${start}:00.000Z`),
        shiftEnd: new Date(`1970-01-01T${end}:00.000Z`),
        isLeave,
        notes: data.notes || (isLeave ? 'Nghỉ phép' : `Ca ${data.shiftType}`),
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

    // Sinh ca từ T2 đến T7
    for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
      const shiftDate = new Date(monday);
      shiftDate.setDate(monday.getDate() + dayOffset);
      const dateOnly = new Date(shiftDate.toISOString().split('T')[0] + 'T00:00:00.000Z');

      for (const u of staff) {
        // Kiểm tra xem đã có ca trực chưa
        const exists = await this.prisma.staffSchedule.findFirst({
          where: {
            userId: u.id,
            workDate: dateOnly,
          },
        });

        if (!exists) {
          const isMorning = dayOffset % 2 === 0;
          const start = isMorning ? '08:00' : '13:30';
          const end = isMorning ? '12:00' : '17:30';

          const item = await this.prisma.staffSchedule.create({
            data: {
              userId: u.id,
              branchId: u.branchId,
              workDate: dateOnly,
              shiftStart: new Date(`1970-01-01T${start}:00.000Z`),
              shiftEnd: new Date(`1970-01-01T${end}:00.000Z`),
              isLeave: false,
              notes: isMorning ? 'Ca Sáng (08:00 - 12:00)' : 'Ca Chiều (13:30 - 17:30)',
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

  async createStaff(data: {
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
  }) {
    const defaultPassword = await bcrypt.hash('123456', 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          employeeCode: data.employeeCode,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          passwordHash: defaultPassword,
          branchId: data.branchId,
          avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
        },
      });

      const role = await tx.role.findUnique({
        where: { name: data.roleName },
      });

      if (role) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
      }

      if (data.roleName === 'DOCTOR' && data.specialty) {
        await tx.doctorProfile.create({
          data: {
            userId: user.id,
            specialty: data.specialty,
            licenseNumber: data.licenseNumber || `CCHN-${Math.floor(100000 + Math.random() * 900000)}`,
            experienceYears: data.experienceYears || 3,
            bio: data.bio,
          },
        });
      }

      return user;
    });
  }
}
