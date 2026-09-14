import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import crypto from 'crypto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async bookAppointment(data: {
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    birthYear?: number;
    gender?: string;
    branchId: string;
    doctorId: string;
    chairId: string;
    serviceIds: string[];
    startTime: string | Date;
    durationMinutes?: number;
    notes?: string;
    isAiRecommended?: boolean;
  }) {
    const start = new Date(data.startTime);
    if (isNaN(start.getTime())) {
      throw new BadRequestException('Thời gian bắt đầu không hợp lệ');
    }

    const duration = data.durationMinutes || 60;
    const end = new Date(start.getTime() + duration * 60 * 1000);
    // Buffer vô trùng: thêm đúng 15 phút sau khi kết thúc
    const bufferEnd = new Date(end.getTime() + 15 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra trạng thái của ghế khám (Operatory Chair)
      const chair = await tx.operatoryChair.findUnique({
        where: { id: data.chairId },
        include: { room: true },
      });

      if (!chair) {
        throw new NotFoundException(`Ghế khám ID ${data.chairId} không tồn tại`);
      }

      if (chair.status === 'MAINTENANCE') {
        throw new ConflictException(
          `Ghế khám ${chair.name} (${chair.code}) hiện đang trong quá trình bảo trì kỹ thuật, không thể xếp lịch`,
        );
      }

      // 2. Kiểm tra xung đột lịch của Bác sĩ trong khoảng [start, end]
      const doctorConflict = await tx.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          status: { notIn: ['CANCELLED'] },
          startTime: { lt: end },
          endTime: { gt: start },
        },
        include: { doctor: true },
      });

      if (doctorConflict) {
        throw new ConflictException(
          `Bác sĩ đã có lịch khám giao thoa trong khoảng thời gian này (Lịch: ${doctorConflict.appointmentCode})`,
        );
      }

      // 3. Kiểm tra xung đột ghế khám có tính đệm vô trùng [start, bufferEnd]
      const chairConflict = await tx.appointment.findFirst({
        where: {
          chairId: data.chairId,
          status: { notIn: ['CANCELLED'] },
          startTime: { lt: bufferEnd },
          bufferEndTime: { gt: start },
        },
      });

      if (chairConflict) {
        throw new ConflictException(
          `Ghế điều trị ${chair.name} đang bận hoặc đang trong thời gian khử khuẩn vô trùng 15 phút (Lịch: ${chairConflict.appointmentCode})`,
        );
      }

      // 4. Tìm hoặc tạo hồ sơ bệnh nhân
      let patient = await tx.patient.findUnique({
        where: { phone: data.patientPhone },
      });

      if (!patient) {
        const countPatients = await tx.patient.count();
        const patientCode = `BN-${1000 + countPatients + 1}`;
        patient = await tx.patient.create({
          data: {
            patientCode,
            fullName: data.patientName,
            phone: data.patientPhone,
            email: data.patientEmail,
            birthYear: data.birthYear || 1990,
            gender: data.gender || 'Nam',
          },
        });
      }

      // 5. Lấy thông tin các dịch vụ
      const services = await tx.service.findMany({
        where: { id: { in: data.serviceIds } },
      });

      if (services.length === 0) {
        throw new BadRequestException('Vui lòng chọn ít nhất một dịch vụ hợp lệ');
      }

      // 6. Sinh mã lịch hẹn & mã QR Pass Code
      const year = new Date().getFullYear();
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const appointmentCode = `#LH-${year}-${randomCode}`;
      const qrPassCode = `QR-PASS-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

      // 7. Tạo bản ghi Appointment
      const appointment = await tx.appointment.create({
        data: {
          appointmentCode,
          patientId: patient.id,
          branchId: data.branchId,
          doctorId: data.doctorId,
          chairId: data.chairId,
          startTime: start,
          endTime: end,
          bufferEndTime: bufferEnd,
          status: 'CONFIRMED',
          qrPassCode,
          notes: data.notes,
          isAiRecommended: data.isAiRecommended ?? false,
          services: {
            create: services.map((s) => ({
              serviceId: s.id,
              price: s.standardPrice,
            })),
          },
          statusHistory: {
            create: {
              fromStatus: 'INITIAL',
              toStatus: 'CONFIRMED',
              reason: 'Bệnh nhân đặt lịch thành công qua hệ thống',
            },
          },
        },
        include: {
          patient: true,
          branch: true,
          doctor: true,
          chair: {
            include: { room: true },
          },
          services: {
            include: { service: true },
          },
        },
      });

      return appointment;
    });
  }

  async findAll(query?: {
    branchId?: string;
    doctorId?: string;
    status?: string;
    date?: string;
  }) {
    const where: any = {};

    if (query?.branchId) where.branchId = query.branchId;
    if (query?.doctorId) where.doctorId = query.doctorId;
    if (query?.status) where.status = query.status;

    if (query?.date) {
      const startOfDay = new Date(`${query.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${query.date}T23:59:59.999Z`);
      where.startTime = { gte: startOfDay, lte: endOfDay };
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        branch: true,
        doctor: true,
        chair: {
          include: { room: true },
        },
        services: {
          include: { service: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        branch: true,
        doctor: true,
        chair: {
          include: { room: true },
        },
        services: {
          include: { service: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Lịch hẹn ID ${id} không tồn tại`);
    }

    return appointment;
  }

  async checkInByQr(qrPassCode: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { qrPassCode },
      include: {
        patient: true,
        doctor: true,
        chair: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Mã QR Pass Code không hợp lệ hoặc không tìm thấy lịch hẹn');
    }

    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException('Lịch hẹn này đã bị hủy');
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'CHECKED_IN',
        statusHistory: {
          create: {
            fromStatus: appointment.status,
            toStatus: 'CHECKED_IN',
            reason: 'Quét mã QR Check-in tự động tại Kiosk',
          },
        },
      },
      include: {
        patient: true,
        doctor: true,
        chair: true,
      },
    });

    return {
      success: true,
      message: 'Check-in thành công tại Kiosk',
      appointment: updated,
    };
  }

  async updateStatus(id: string, status: string, reason?: string, changedBy?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Lịch hẹn ID ${id} không tồn tại`);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: {
            fromStatus: appointment.status,
            toStatus: status,
            reason: reason || `Cập nhật trạng thái sang ${status}`,
            changedBy,
          },
        },
      },
      include: {
        patient: true,
        doctor: true,
        chair: true,
      },
    });
  }

  async getAvailableSlots(branchId: string, dateStr: string, durationMinutes: number = 60) {
    const chairs = await this.prisma.operatoryChair.findMany({
      where: {
        room: { branchId },
        status: 'AVAILABLE',
      },
      include: {
        room: true,
        assignedDoctor: {
          include: { user: true },
        },
      },
    });

    const doctors = await this.prisma.user.findMany({
      where: {
        branchId,
        doctorProfile: { isNot: null },
      },
      include: {
        doctorProfile: true,
      },
    });

    const startOfDay = new Date(`${dateStr}T08:00:00+07:00`);
    const endOfDay = new Date(`${dateStr}T18:00:00+07:00`);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        branchId,
        status: { notIn: ['CANCELLED'] },
        startTime: { gte: startOfDay, lte: endOfDay },
      },
    });

    return {
      branchId,
      date: dateStr,
      totalChairs: chairs.length,
      availableChairs: chairs,
      doctors,
      existingAppointmentsCount: existingAppointments.length,
    };
  }
}
