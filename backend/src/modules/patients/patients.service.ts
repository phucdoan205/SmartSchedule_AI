import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { generatePatientCode } from '../../common/utils/code-generator.util.js';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, page?: string | number, limit?: string | number, branchId?: string) {
    const where: any = {};
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { patientCode: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (branchId && branchId !== 'ALL' && branchId !== 'all') {
      where.appointments = { some: { branchId } };
    }

    const pageNum = page !== undefined ? Math.max(1, parseInt(page as any, 10) || 1) : 1;
    const limitNum = limit !== undefined ? Math.max(1, parseInt(limit as any, 10) || 10) : 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, items] = await Promise.all([
      this.prisma.patient.count({ where }),
      this.prisma.patient.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          _count: {
            select: {
              appointments: true,
              treatmentPlans: true,
              medicalRecords: true,
            },
          },
          appointments: {
            orderBy: { startTime: 'desc' },
            take: 1,
            include: {
              doctor: {
                select: { fullName: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  async findById(id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        OR: [{ id }, { patientCode: id }],
      },
      include: {
        appointments: {
          include: {
            doctor: true,
            branch: true,
            chair: {
              include: { room: true },
            },
            services: { include: { service: true } },
            invoices: { include: { payments: true } },
          },
          orderBy: { startTime: 'desc' },
        },
        treatmentPlans: {
          include: {
            steps: {
              include: { medicalRecords: true },
            },
          },
        },
        medicalRecords: {
          include: {
            prescriptions: {
              include: { items: true },
            },
          },
          orderBy: { performedAt: 'desc' },
        },
        dentalCharts: {
          orderBy: { toothNumber: 'asc' },
        },
        invoices: {
          include: { items: { include: { service: true } }, payments: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Bệnh nhân ID hoặc mã ${id} không tồn tại`);
    }

    return patient;
  }

  async create(data: {
    fullName: string;
    phone: string;
    email?: string;
    birthYear?: number;
    dateOfBirth?: string;
    gender?: string;
    medicalAlerts?: string;
  }) {
    const patientCode = await generatePatientCode(this.prisma);
    const calculatedBirthYear = data.birthYear
      ? Number(data.birthYear)
      : (data.dateOfBirth ? parseInt(data.dateOfBirth.split('-')[0], 10) : 1990);
    const dobAlert = data.dateOfBirth ? `DOB:${data.dateOfBirth}` : '';
    let alerts = data.medicalAlerts || '';
    if (dobAlert) {
      alerts = alerts ? `${alerts} | ${dobAlert}` : dobAlert;
    }

    return this.prisma.patient.create({
      data: {
        patientCode,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        birthYear: calculatedBirthYear,
        gender: data.gender || 'Nam',
        medicalAlerts: alerts || undefined,
      },
    });
  }

  async update(
    id: string,
    data: {
      fullName?: string;
      phone?: string;
      email?: string;
      birthYear?: number;
      gender?: string;
      medicalAlerts?: string;
      avatarUrl?: string;
    },
  ) {
    const existing = await this.prisma.patient.findFirst({
      where: {
        OR: [{ id }, { patientCode: id }],
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Bệnh nhân ID hoặc mã ${id} không tồn tại`);
    }

    return this.prisma.patient.update({
      where: { id: existing.id },
      data,
    });
  }

  async updateDentalChart(
    patientId: string,
    toothNumber: number,
    condition: string,
    colorStatus?: string,
  ) {
    return this.prisma.dentalChart.upsert({
      where: {
        patientId_toothNumber: {
          patientId,
          toothNumber,
        },
      },
      update: {
        condition,
        colorStatus,
      },
      create: {
        patientId,
        toothNumber,
        condition,
        colorStatus,
      },
    });
  }

  async addMedicalRecord(
    patientId: string,
    data: {
      diagnosis: string;
      treatmentGiven: string;
      xrayImageUrls?: string[];
      stepId?: string;
    },
  ) {
    return this.prisma.medicalRecord.create({
      data: {
        patientId,
        diagnosis: data.diagnosis,
        treatmentGiven: data.treatmentGiven,
        xrayImageUrls: data.xrayImageUrls || [],
        stepId: data.stepId,
      },
    });
  }
}
