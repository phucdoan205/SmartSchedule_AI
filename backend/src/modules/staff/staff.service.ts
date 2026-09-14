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
    const where: any = {};
    if (branchId) where.branchId = branchId;

    const staff = await this.prisma.user.findMany({
      where,
      include: {
        branch: true,
        doctorProfile: true,
        userRoles: {
          include: { role: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return staff.map((s) => ({
      id: s.id,
      code: s.employeeCode,
      name: s.fullName,
      email: s.email,
      phone: s.phone,
      avatar: s.avatarUrl,
      role: s.userRoles[0]?.role?.name || 'STAFF',
      branch: s.branch.name,
      branchId: s.branchId,
      status: s.isActive ? 'Active' : 'Inactive',
      doctorProfile: s.doctorProfile,
    }));
  }

  async getDoctorById(id: string) {
    const doctor = await this.prisma.user.findUnique({
      where: { id },
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
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Bác sĩ ID ${id} không tồn tại`);
    }

    return doctor;
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
          avatarUrl: data.avatarUrl,
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
