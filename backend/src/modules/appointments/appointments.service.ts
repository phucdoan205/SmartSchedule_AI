import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { generatePatientCode, generateAppointmentCode } from '../../common/utils/code-generator.util.js';
import crypto from 'crypto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async bookAppointment(data: {
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    birthYear?: number;
    dateOfBirth?: string;
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
        throw new NotFoundException(`Ghế điều trị ID ${data.chairId} không tồn tại`);
      }

      if (chair.status === 'MAINTENANCE') {
        throw new BadRequestException(
          `Ghế ${chair.name} đang bảo trì, không thể xếp lịch`,
        );
      }

      // 2. Kiểm tra xung đột lịch của Ghế điều trị (bao gồm cả đệm vô trùng 15p)
      const chairConflict = await tx.appointment.findFirst({
        where: {
          chairId: data.chairId,
          status: { notIn: ['CANCELLED'] },
          AND: [
            { startTime: { lt: bufferEnd } },
            { bufferEndTime: { gt: start } },
          ],
        },
      });

      if (chairConflict) {
        throw new BadRequestException(
          `Ghế ${chair.name} đã bận hoặc đang trong thời gian đệm vô trùng 15 phút. Vui lòng chọn khung giờ khác.`,
        );
      }

      // 3. Kiểm tra xung đột lịch của Bác sĩ
      const doctorConflict = await tx.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          status: { notIn: ['CANCELLED'] },
          AND: [
            { startTime: { lt: end } },
            { endTime: { gt: start } },
          ],
        },
      });

      if (doctorConflict) {
        throw new BadRequestException(
          'Bác sĩ đã có lịch hẹn trùng giờ khám này. Vui lòng chọn thời gian khác.',
        );
      }

      // 4. Tìm hoặc tạo hồ sơ bệnh nhân
      let patient = await tx.patient.findUnique({
        where: { phone: data.patientPhone },
      });

      const calculatedBirthYear = data.birthYear
        ? Number(data.birthYear)
        : (data.dateOfBirth ? parseInt(data.dateOfBirth.split('-')[0], 10) : 1990);
      const dobAlert = data.dateOfBirth ? `DOB:${data.dateOfBirth}` : '';

      if (!patient) {
        const patientCode = await generatePatientCode(tx);
        patient = await tx.patient.create({
          data: {
            patientCode,
            fullName: data.patientName,
            phone: data.patientPhone,
            email: data.patientEmail,
            birthYear: calculatedBirthYear,
            gender: data.gender || 'Nam',
            medicalAlerts: dobAlert || undefined,
          },
        });
      } else {
        // Cập nhật thông tin ngày sinh và họ tên cho hồ sơ bệnh nhân hiện có
        const existingAlerts = patient.medicalAlerts || '';
        let updatedAlerts = existingAlerts;
        if (data.dateOfBirth) {
          if (updatedAlerts.includes('DOB:')) {
            updatedAlerts = updatedAlerts.replace(/DOB:\d{4}-\d{2}-\d{2}/, `DOB:${data.dateOfBirth}`);
          } else {
            updatedAlerts = updatedAlerts ? `${updatedAlerts} | DOB:${data.dateOfBirth}` : `DOB:${data.dateOfBirth}`;
          }
        }

        patient = await tx.patient.update({
          where: { id: patient.id },
          data: {
            fullName: data.patientName || patient.fullName,
            birthYear: calculatedBirthYear,
            medicalAlerts: updatedAlerts || undefined,
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

      // 6. Sinh mã lịch hẹn theo ngày giờ hiện tại & mã QR Pass Code
      const appointmentCode = await generateAppointmentCode(tx);
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
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [
          { id },
          { appointmentCode: id },
        ],
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Lịch hẹn ${id} không tồn tại`);
    }

    return this.prisma.appointment.update({
      where: { id: appointment.id },
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
