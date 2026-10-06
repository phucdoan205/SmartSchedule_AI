import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { generatePatientCode } from '../../common/utils/code-generator.util.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

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

  async create(
    data: {
      fullName: string;
      phone: string;
      email?: string;
      birthYear?: number;
      dateOfBirth?: string;
      gender?: string;
      medicalAlerts?: string;
    },
    operatorUserId?: string,
  ) {
    const patientCode = await generatePatientCode(this.prisma);
    const calculatedBirthYear = data.birthYear
      ? Number(data.birthYear)
      : (data.dateOfBirth ? parseInt(data.dateOfBirth.split('-')[0], 10) : 1990);
    const dobAlert = data.dateOfBirth ? `DOB:${data.dateOfBirth}` : '';
    let alerts = data.medicalAlerts || '';
    if (dobAlert) {
      alerts = alerts ? `${alerts} | ${dobAlert}` : dobAlert;
    }

    const created = await this.prisma.patient.create({
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

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'EMR',
      action: `Tạo mới hồ sơ bệnh án: ${created.patientCode} (${created.fullName})`,
      details: `Khởi tạo hồ sơ bệnh nhân mã ${created.patientCode}, SĐT ${created.phone}, năm sinh ${created.birthYear}.`,
      targetEntity: created.patientCode,
      status: 'SUCCESS',
    });

    return created;
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
    operatorUserId?: string,
  ) {
    const existing = await this.prisma.patient.findFirst({
      where: {
        OR: [{ id }, { patientCode: id }],
      },
      select: { id: true, patientCode: true, fullName: true },
    });

    if (!existing) {
      throw new NotFoundException(`Bệnh nhân ID hoặc mã ${id} không tồn tại`);
    }

    const updated = await this.prisma.patient.update({
      where: { id: existing.id },
      data,
    });

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'EMR',
      action: `Cập nhật hồ sơ bệnh án: ${existing.patientCode} (${existing.fullName})`,
      details: `Cập nhật thông tin y tế / liên hệ cho bệnh nhân mã ${existing.patientCode}.`,
      targetEntity: existing.patientCode,
      status: 'SUCCESS',
    });

    return updated;
  }

  async updateDentalChart(
    patientId: string,
    toothNumber: number,
    condition: string,
    colorStatus?: string,
    operatorUserId?: string,
  ) {
    const patient = await this.prisma.patient.findFirst({
      where: { OR: [{ id: patientId }, { patientCode: patientId }] },
      select: { id: true, patientCode: true, fullName: true },
    });

    const targetPatientId = patient ? patient.id : patientId;
    const targetCode = patient ? patient.patientCode : patientId;
    const targetName = patient ? patient.fullName : 'Bệnh nhân';

    const chart = await this.prisma.dentalChart.upsert({
      where: {
        patientId_toothNumber: {
          patientId: targetPatientId,
          toothNumber,
        },
      },
      update: {
        condition,
        colorStatus,
      },
      create: {
        patientId: targetPatientId,
        toothNumber,
        condition,
        colorStatus,
      },
    });

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'EMR',
      action: `Cập nhật sơ đồ răng: ${targetCode} (${targetName}) - Răng #${toothNumber}`,
      details: `Chẩn đoán răng #${toothNumber}: ${condition}. Trạng thái màu: ${colorStatus || 'Mặc định'}.`,
      targetEntity: targetCode,
      status: 'SUCCESS',
    });

    return chart;
  }

  async addMedicalRecord(
    patientId: string,
    data: {
      diagnosis: string;
      treatmentGiven: string;
      xrayImageUrls?: string[];
      stepId?: string;
    },
    operatorUserId?: string,
  ) {
    const patient = await this.prisma.patient.findFirst({
      where: { OR: [{ id: patientId }, { patientCode: patientId }] },
      select: { id: true, patientCode: true, fullName: true },
    });

    const targetPatientId = patient ? patient.id : patientId;
    const targetCode = patient ? patient.patientCode : patientId;
    const targetName = patient ? patient.fullName : 'Bệnh nhân';

    const record = await this.prisma.medicalRecord.create({
      data: {
        patientId: targetPatientId,
        diagnosis: data.diagnosis,
        treatmentGiven: data.treatmentGiven,
        xrayImageUrls: data.xrayImageUrls || [],
        stepId: data.stepId,
      },
    });

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'EMR',
      action: `Ghi nhận bệnh án điều trị: ${targetCode} (${targetName})`,
      details: `Chẩn đoán: ${data.diagnosis}. Phương pháp điều trị: ${data.treatmentGiven}.`,
      targetEntity: targetCode,
      status: 'SUCCESS',
    });

    return record;
  }
}

