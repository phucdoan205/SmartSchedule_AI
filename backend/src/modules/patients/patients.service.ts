import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { patientCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.patient.findMany({
      where,
      include: {
        _count: {
          select: {
            appointments: true,
            treatmentPlans: true,
            medicalRecords: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            doctor: true,
            branch: true,
            services: { include: { service: true } },
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
      throw new NotFoundException(`Bệnh nhân ID ${id} không tồn tại`);
    }

    return patient;
  }

  async create(data: {
    fullName: string;
    phone: string;
    email?: string;
    birthYear?: number;
    gender?: string;
    medicalAlerts?: string;
  }) {
    const count = await this.prisma.patient.count();
    const patientCode = `BN-${1000 + count + 1}`;

    return this.prisma.patient.create({
      data: {
        patientCode,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        birthYear: data.birthYear || 1990,
        gender: data.gender || 'Nam',
        medicalAlerts: data.medicalAlerts,
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
    },
  ) {
    return this.prisma.patient.update({
      where: { id },
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
