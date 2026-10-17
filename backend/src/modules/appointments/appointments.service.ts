import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { generatePatientCode, generateAppointmentCode } from '../../common/utils/code-generator.util.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import crypto from 'crypto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private getStatusLabelVi(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Chờ khám & Check-in',
      CHECKED_IN: 'Đã Check-in tại phòng khám',
      CONFIRMED: 'Đã xác nhận lịch hẹn',
      IN_PROGRESS: 'Đang thực hiện điều trị',
      COMPLETED: 'Hoàn thành & Thanh toán',
      CANCELLED: 'Đã hủy lịch hẹn',
      NO_SHOW: 'Không đến hẹn',
    };
    return map[status] || status;
  }


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
  }, operatorUserId?: string) {
    const start = new Date(data.startTime);
    if (isNaN(start.getTime())) {
      throw new BadRequestException('Thời gian bắt đầu không hợp lệ');
    }

    const duration = data.durationMinutes || 60;
    const end = new Date(start.getTime() + duration * 60 * 1000);
    // Buffer vô trùng: thêm đúng 15 phút sau khi kết thúc
    const bufferEnd = new Date(end.getTime() + 15 * 60 * 1000);

    // 0. Lấy thông tin các dịch vụ trước khi mở transaction để tối ưu thời gian giao dịch
    const services = await this.prisma.service.findMany({
      where: { id: { in: data.serviceIds } },
    });

    if (services.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một dịch vụ hợp lệ');
    }

    const created = await this.prisma.$transaction(
      async (tx) => {
        // 1. Kiểm tra trạng thái của ghế khám (Operatory Chair)
        let allocatedChair: any = null;
        if (data.chairId) {
          allocatedChair = await tx.operatoryChair.findUnique({
            where: { id: data.chairId },
            include: { room: true },
          });
        }

        // Kiểm tra xem ghế chỉ định có khả dụng (không bảo trì và không trùng lịch đệm 15p) hay không
        let isAllocatedChairBusy = false;
        if (!allocatedChair || allocatedChair.status === 'MAINTENANCE') {
          isAllocatedChairBusy = true;
        } else {
          const chairConflict = await tx.appointment.findFirst({
            where: {
              chairId: allocatedChair.id,
              status: { notIn: ['CANCELLED'] },
              AND: [
                { startTime: { lt: bufferEnd } },
                { bufferEndTime: { gt: start } },
              ],
            },
          });
          if (chairConflict) {
            isAllocatedChairBusy = true;
          }
        }

        // Nếu ghế ban đầu bị bận hoặc bảo trì hoặc chưa có:
        // Tự động tìm ghế khả dụng khác trong cùng chi nhánh
        if (isAllocatedChairBusy) {
          const branchChairs = await tx.operatoryChair.findMany({
            where: {
              room: { branchId: data.branchId },
              status: 'AVAILABLE',
            },
            include: { room: true },
          });

          const candidateChairIds = branchChairs.map((c) => c.id);
          const busyAppointments = await tx.appointment.findMany({
            where: {
              chairId: { in: candidateChairIds },
              status: { notIn: ['CANCELLED'] },
              AND: [
                { startTime: { lt: bufferEnd } },
                { bufferEndTime: { gt: start } },
              ],
            },
            select: { chairId: true },
          });
          const busyChairIdSet = new Set(busyAppointments.map((a) => a.chairId));
          const foundFreeChair = branchChairs.find((c) => !busyChairIdSet.has(c.id));

          if (foundFreeChair) {
            allocatedChair = foundFreeChair;
          } else {
            throw new BadRequestException(
              `Tất cả ghế điều trị tại cơ sở đều đang bận hoặc trong thời gian đệm vô trùng 15 phút tại khung giờ này. Vui lòng chọn khung giờ khác.`,
            );
          }
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

        // 5. Sinh mã lịch hẹn theo ngày giờ hiện tại & mã QR Pass Code
        const appointmentCode = await generateAppointmentCode(tx);
        const qrPassCode = `QR-PASS-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

        // 6. Tạo bản ghi Appointment
        const appointment = await tx.appointment.create({
          data: {
            appointmentCode,
            patientId: patient.id,
            branchId: data.branchId,
            doctorId: data.doctorId,
            chairId: allocatedChair.id,
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
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'APPOINTMENTS',
      action: `Đặt mới lịch hẹn khám: ${created.appointmentCode} (${created.patient?.fullName || 'Bệnh nhân'})`,
      details: `Lịch hẹn mới mã ${created.appointmentCode} cho bệnh nhân ${created.patient?.fullName}. Bác sĩ: ${created.doctor?.fullName || 'Chưa chỉ định'}. Thời gian khám: ${new Date(created.startTime).toLocaleString('vi-VN')}.`,
      targetEntity: created.appointmentCode,
      status: 'SUCCESS',
    });

    return created;
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

  async checkInByQr(qrPassCode: string, operatorUserId?: string) {
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

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'APPOINTMENTS',
      action: `Bệnh nhân Check-in QR: ${updated.appointmentCode} (${updated.patient?.fullName || 'Bệnh nhân'})`,
      details: `Bệnh nhân quét mã QR Pass Code tại Kiosk thành công, chuyển sang trạng thái [Đã Check-in tại phòng khám].`,
      targetEntity: updated.appointmentCode,
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: 'Check-in thành công tại Kiosk',
      appointment: updated,
    };
  }

  async updateStatus(
    id: string,
    status: string,
    reason?: string,
    changedBy?: string,
    operatorUserId?: string,
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [
          { id },
          { appointmentCode: id },
        ],
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Lịch hẹn ${id} không tồn tại`);
    }

    const fromLabel = this.getStatusLabelVi(appointment.status);
    const toLabel = this.getStatusLabelVi(status);

    const now = new Date();
    const updatePayload: any = {
      status,
      statusHistory: {
        create: {
          fromStatus: appointment.status,
          toStatus: status,
          reason: reason || `Cập nhật trạng thái sang ${toLabel}`,
          changedBy,
        },
      },
    };

    if (status === 'COMPLETED') {
      updatePayload.endTime = now;
      updatePayload.bufferEndTime = new Date(now.getTime() + 15 * 60 * 1000);
      if (appointment.chairId) {
        await this.prisma.operatoryChair
          .update({
            where: { id: appointment.chairId },
            data: { status: 'AVAILABLE' },
          })
          .catch(() => {});
      }
    } else if (status === 'CANCELLED') {
      if (appointment.chairId) {
        await this.prisma.operatoryChair
          .update({
            where: { id: appointment.chairId },
            data: { status: 'AVAILABLE' },
          })
          .catch(() => {});
      }
    } else if (status === 'IN_PROGRESS') {
      if (appointment.chairId) {
        await this.prisma.operatoryChair
          .update({
            where: { id: appointment.chairId },
            data: { status: 'IN_USE' },
          })
          .catch(() => {});
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: updatePayload,
      include: {
        patient: true,
        doctor: true,
        chair: true,
      },
    });

    const patientName = updated.patient?.fullName || 'Bệnh nhân';
    const actionByText = changedBy ? `Người thực hiện: ${changedBy}.` : '';

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'APPOINTMENTS',
      action: `Chuyển trạng thái lịch hẹn [${fromLabel} ➔ ${toLabel}]: ${updated.appointmentCode} (${patientName})`,
      details: `Chuyển trạng thái lịch hẹn từ [${fromLabel}] sang [${toLabel}]. Lý do: ${reason || 'Thao tác cập nhật từ bảng điều phối lịch hẹn'}. ${actionByText}`.trim(),
      targetEntity: updated.appointmentCode,
      status: 'SUCCESS',
    });

    if (operatorUserId) {
      await this.notificationsService.create({
        userId: operatorUserId,
        title: 'Cập nhật trạng thái lịch hẹn',
        content: `Lịch hẹn ${updated.appointmentCode} của bệnh nhân ${patientName} đã chuyển sang trạng thái "${toLabel}".`,
        type: 'APPOINTMENT',
        link: '/admin/appointments',
      });
    }

    return updated;
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

  async getSmartAiAvailableSlots(
    branchId: string,
    dateStr?: string,
    durationMinutes: number = 60,
    doctorId?: string,
  ) {
    const targetDateStr = dateStr || new Date().toISOString().split('T')[0];

    // 1. Get all chairs at branch
    const chairs = await this.prisma.operatoryChair.findMany({
      where: {
        room: { branchId },
        status: 'AVAILABLE',
      },
      include: {
        room: true,
        assignedDoctor: { include: { user: true } },
      },
    });

    // 2. Query existing appointments on this date
    const startOfDay = new Date(`${targetDateStr}T00:00:00+07:00`);
    const endOfDay = new Date(`${targetDateStr}T23:59:59+07:00`);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        branchId,
        status: { notIn: ['CANCELLED'] },
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        chair: true,
        doctor: true,
      },
    });

    // Standard Clinic Slot Candidates
    const slotTimes: string[] = [
      '08:00', '08:45', '09:30', '10:15', '11:00',
      '14:00', '14:45', '15:30', '16:15',
    ];

    // IF DOCTOR ID IS PROVIDED: Check availability for this specific doctor
    if (doctorId) {
      const selectedDoctor = await this.prisma.user.findFirst({
        where: {
          id: doctorId,
          isActive: true,
          userRoles: {
            some: {
              role: {
                name: { in: ['DOCTOR', 'Doctor'] },
              },
            },
          },
        },
        include: { doctorProfile: true },
      });

      const slots: any[] = [];

      for (const timeStr of slotTimes) {
        const [h] = timeStr.split(':').map(Number);
        const slotStart = new Date(`${targetDateStr}T${timeStr}:00+07:00`);
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
        const slotBufferEnd = new Date(slotEnd.getTime() + 15 * 60 * 1000); // 15m sterilization buffer

        let isAvailable = true;
        let conflictReason: string | null = null;
        let matchedChair: any = null;

        // A. Check if the doctor has an overlapping appointment
        const doctorDirectConflict = existingAppointments.find((a) => {
          if (a.doctorId !== doctorId) return false;
          return a.startTime < slotEnd && a.endTime > slotStart;
        });

        // B. Check if doctor or chair is in 15-minute sterilization buffer from previous appointment
        const doctorBufferConflict = existingAppointments.find((a) => {
          if (a.doctorId !== doctorId) return false;
          // Sterilization buffer before or after ca khám
          return a.startTime < slotBufferEnd && a.bufferEndTime > slotStart;
        });

        if (doctorDirectConflict) {
          isAvailable = false;
          conflictReason = `Bác sĩ ${selectedDoctor?.fullName || ''} đã có lịch hẹn ở khung giờ này`;
        } else if (doctorBufferConflict) {
          isAvailable = false;
          conflictReason = `Bác sĩ ${selectedDoctor?.fullName || ''} đang trong 15 phút đệm khử trùng vô trùng`;
        } else {
          // C. Find an available chair
          const freeChair = chairs.find((c) => {
            const chairConflict = existingAppointments.find((a) => {
              if (a.chairId !== c.id) return false;
              return a.startTime < slotBufferEnd && a.bufferEndTime > slotStart;
            });
            return !chairConflict;
          });

          if (!freeChair) {
            isAvailable = false;
            conflictReason = 'Tất cả ghế điều trị tại cơ sở đều đang bận';
          } else {
            matchedChair = freeChair;
          }
        }

        // Calculate AI Recommendation Score
        let aiScore = 50;
        let reason = 'Khung giờ trống tiêu chuẩn phòng khám';

        if (isAvailable) {
          // Bonus 1: Buffer Adjacency (+30)
          const adjacentApp = existingAppointments.find((a) => {
            if (matchedChair && a.chairId !== matchedChair.id) return false;
            const diffMin = Math.abs((slotStart.getTime() - a.bufferEndTime.getTime()) / (60 * 1000));
            return diffMin <= 15;
          });

          if (adjacentApp) {
            aiScore += 30;
            reason = 'Tối ưu liền sau đệm vô trùng 15p của ca trước - Giảm thời gian chờ';
          }

          // Bonus 2: Off-Peak load balancing (+20)
          if ((h >= 9 && h <= 10) || (h >= 14 && h <= 15)) {
            aiScore += 20;
            if (!adjacentApp) {
              reason = 'Khung giờ vàng lưu lượng chuẩn AI - Giảm tải áp lực phòng khám';
            }
          }
        } else {
          aiScore = 0;
          reason = conflictReason || 'Khung giờ không khả dụng';
        }

        const isAiRecommended = isAvailable && aiScore >= 70;

        slots.push({
          time: timeStr,
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          bufferEndTime: slotBufferEnd.toISOString(),
          durationMinutes,
          isAvailable,
          conflictReason,
          chairId: matchedChair?.id || null,
          chairName: matchedChair?.name || null,
          doctorId: doctorId,
          doctorName: selectedDoctor?.fullName || 'Bác sĩ chuyên khoa',
          doctorSpecialty: selectedDoctor?.doctorProfile?.specialty || 'Răng Hàm Mặt',
          aiScore,
          isAiRecommended,
          reason,
        });
      }

      return {
        success: true,
        branchId,
        date: targetDateStr,
        durationMinutes,
        doctorId,
        doctorName: selectedDoctor?.fullName,
        totalSlots: slots.length,
        availableCount: slots.filter((s) => s.isAvailable).length,
        aiRecommendedCount: slots.filter((s) => s.isAiRecommended).length,
        slots,
      };
    }

    // IF DOCTOR ID IS NOT PROVIDED: Recommend best slots across all real doctors at branch
    const doctors = await this.prisma.user.findMany({
      where: {
        branchId,
        doctorProfile: { isNot: null },
        isActive: true,
        userRoles: {
          some: {
            role: {
              name: { in: ['DOCTOR', 'Doctor'] },
            },
          },
        },
      },
      include: { doctorProfile: true },
    });

    const recommendedSlots: any[] = [];

    for (const timeStr of slotTimes) {
      const [h] = timeStr.split(':').map(Number);
      const slotStart = new Date(`${targetDateStr}T${timeStr}:00+07:00`);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
      const slotBufferEnd = new Date(slotEnd.getTime() + 15 * 60 * 1000); // 15m sterilization buffer

      for (const chair of chairs) {
        // Check if chair is occupied or in 15m sterilization buffer
        const chairConflict = existingAppointments.find((a) => {
          if (a.chairId !== chair.id) return false;
          return a.startTime < slotBufferEnd && a.bufferEndTime > slotStart;
        });

        if (chairConflict) continue;

        // Prioritize chair's assigned doctor if free
        const assignedDocId = chair.assignedDoctor?.userId;
        const candidateDocs = assignedDocId
          ? doctors.filter((d) => d.id === assignedDocId).concat(doctors.filter((d) => d.id !== assignedDocId))
          : doctors;

        for (const doc of candidateDocs) {
          const docConflict = existingAppointments.find((a) => {
            if (a.doctorId !== doc.id) return false;
            return a.startTime < slotBufferEnd && a.bufferEndTime > slotStart;
          });

          if (docConflict) continue;

          // Calculate AI Score
          let aiScore = 50;
          let reason = 'Khung giờ trống tiêu chuẩn phòng khám';

          const adjacentApp = existingAppointments.find((a) => {
            if (a.chairId !== chair.id) return false;
            const diffMin = Math.abs((slotStart.getTime() - a.bufferEndTime.getTime()) / (60 * 1000));
            return diffMin <= 15;
          });

          if (adjacentApp) {
            aiScore += 30;
            reason = 'Tối ưu liền sau đệm vô trùng 15p của ca trước - Giảm thời gian chờ';
          }

          if ((h >= 9 && h <= 10) || (h >= 14 && h <= 15)) {
            aiScore += 20;
            if (!adjacentApp) {
              reason = 'Khung giờ vàng lưu lượng chuẩn AI - Giảm tải áp lực phòng khám';
            }
          }

          const isAiRecommended = aiScore >= 70;

          recommendedSlots.push({
            time: timeStr,
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            bufferEndTime: slotBufferEnd.toISOString(),
            durationMinutes,
            isAvailable: true,
            conflictReason: null,
            chairId: chair.id,
            chairName: chair.name,
            doctorId: doc.id,
            doctorName: doc.fullName,
            doctorSpecialty: doc.doctorProfile?.specialty || 'Chuyên khoa Răng Hàm Mặt',
            aiScore,
            isAiRecommended,
            reason,
          });

          break; // Match 1 doctor per chair & time
        }
      }
    }

    // Sort by AI Score descending
    recommendedSlots.sort((a, b) => b.aiScore - a.aiScore);

    return {
      success: true,
      branchId,
      date: targetDateStr,
      durationMinutes,
      totalAvailableSlots: recommendedSlots.length,
      aiRecommendedCount: recommendedSlots.filter((s) => s.isAiRecommended).length,
      slots: recommendedSlots.slice(0, 12),
    };
  }

  async updateAppointment(
    id: string,
    data: {
      patientName?: string;
      patientPhone?: string;
      patientEmail?: string;
      dateOfBirth?: string;
      birthYear?: number;
      gender?: string;
      medicalAlerts?: string;
      branchId?: string;
      doctorId?: string;
      chairId?: string;
      serviceIds?: string[];
      startTime?: string | Date;
      durationMinutes?: number;
      notes?: string;
      status?: string;
      editReason?: string;
      changedBy?: string;
    },
    operatorUserId?: string,
  ) {
    const existing = await this.prisma.appointment.findFirst({
      where: {
        OR: [{ id }, { appointmentCode: id }],
      },
      include: {
        patient: true,
        chair: {
          include: { room: true },
        },
        services: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Lịch hẹn ${id} không tồn tại`);
    }

    if (existing.status === 'COMPLETED' && data.startTime) {
      throw new BadRequestException('Lịch hẹn đã hoàn thành điều trị, không thể thay đổi thời gian khám');
    }

    let start = existing.startTime;
    let end = existing.endTime;
    let bufferEnd = existing.bufferEndTime;

    if (data.startTime) {
      const parsedStart = new Date(data.startTime);
      if (isNaN(parsedStart.getTime())) {
        throw new BadRequestException('Thời gian bắt đầu không hợp lệ');
      }
      start = parsedStart;
      const duration = data.durationMinutes || Math.round((existing.endTime.getTime() - existing.startTime.getTime()) / (60 * 1000)) || 60;
      end = new Date(start.getTime() + duration * 60 * 1000);
      bufferEnd = new Date(end.getTime() + 15 * 60 * 1000);
    }

    const targetDoctorId = data.doctorId || existing.doctorId;
    const targetBranchId = data.branchId || existing.branchId;
    let targetChairId = data.chairId || existing.chairId;

    // Kiểm tra ghế có thuộc chi nhánh chỉ định không, nếu không tìm ghế phù hợp trong chi nhánh
    const chairInBranch = await this.prisma.operatoryChair.findFirst({
      where: {
        id: targetChairId,
        room: { branchId: targetBranchId },
      },
      include: { room: true },
    });

    if (!chairInBranch) {
      const fallbackChair = await this.prisma.operatoryChair.findFirst({
        where: {
          room: { branchId: targetBranchId },
          status: { not: 'MAINTENANCE' },
        },
      });
      if (fallbackChair) {
        targetChairId = fallbackChair.id;
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra ghế điều trị (nếu có thay đổi giờ hoặc ghế hoặc chi nhánh)
      if (data.startTime || data.chairId || data.branchId) {
        const chair = await tx.operatoryChair.findUnique({
          where: { id: targetChairId },
        });

        if (chair && chair.status === 'MAINTENANCE') {
          throw new BadRequestException(`Ghế ${chair.name} đang bảo trì, không thể xếp lịch`);
        }

        const chairConflict = await tx.appointment.findFirst({
          where: {
            id: { not: existing.id },
            chairId: targetChairId,
            status: { notIn: ['CANCELLED'] },
            AND: [
              { startTime: { lt: bufferEnd } },
              { bufferEndTime: { gt: start } },
            ],
          },
        });

        if (chairConflict) {
          throw new BadRequestException(
            'Ghế điều trị đã có lịch hẹn hoặc đang trong đệm vô trùng 15 phút tại khung giờ này. Vui lòng chọn khung giờ khác.',
          );
        }
      }

      // 2. Kiểm tra xung đột bác sĩ (nếu thay đổi giờ hoặc bác sĩ)
      if (data.startTime || data.doctorId) {
        const doctorConflict = await tx.appointment.findFirst({
          where: {
            id: { not: existing.id },
            doctorId: targetDoctorId,
            status: { notIn: ['CANCELLED'] },
            AND: [
              { startTime: { lt: end } },
              { endTime: { gt: start } },
            ],
          },
        });

        if (doctorConflict) {
          throw new BadRequestException(
            'Bác sĩ đã có lịch hẹn khám khác trong khung giờ này. Vui lòng chọn khung giờ hoặc bác sĩ khác.',
          );
        }
      }

      // 3. Cập nhật hồ sơ bệnh nhân nếu có thay đổi
      if (
        data.patientName ||
        data.patientPhone ||
        data.dateOfBirth ||
        data.birthYear !== undefined ||
        data.medicalAlerts !== undefined
      ) {
        const patientUpdateData: any = {};
        if (data.patientName) patientUpdateData.fullName = data.patientName;
        if (data.patientPhone) patientUpdateData.phone = data.patientPhone;
        if (data.patientEmail) patientUpdateData.email = data.patientEmail;
        if (data.gender) patientUpdateData.gender = data.gender;

        if (data.birthYear !== undefined) {
          patientUpdateData.birthYear = Number(data.birthYear);
        } else if (data.dateOfBirth) {
          patientUpdateData.birthYear = parseInt(data.dateOfBirth.split('-')[0], 10);
        }

        let updatedAlerts = existing.patient.medicalAlerts || '';
        if (data.dateOfBirth) {
          if (updatedAlerts.includes('DOB:')) {
            updatedAlerts = updatedAlerts.replace(/DOB:\d{4}-\d{2}-\d{2}/, `DOB:${data.dateOfBirth}`);
          } else {
            updatedAlerts = updatedAlerts ? `${updatedAlerts} | DOB:${data.dateOfBirth}` : `DOB:${data.dateOfBirth}`;
          }
        }
        if (data.medicalAlerts !== undefined) {
          if (data.dateOfBirth && !data.medicalAlerts.includes('DOB:')) {
            updatedAlerts = `${data.medicalAlerts} | DOB:${data.dateOfBirth}`;
          } else {
            updatedAlerts = data.medicalAlerts;
          }
        }
        patientUpdateData.medicalAlerts = updatedAlerts || undefined;

        await tx.patient.update({
          where: { id: existing.patientId },
          data: patientUpdateData,
        });
      }

      // 4. Cập nhật dịch vụ nếu có danh sách mới
      if (data.serviceIds && data.serviceIds.length > 0) {
        const services = await tx.service.findMany({
          where: { id: { in: data.serviceIds } },
        });

        if (services.length > 0) {
          await tx.appointmentService.deleteMany({
            where: { appointmentId: existing.id },
          });

          await tx.appointmentService.createMany({
            data: services.map((s) => ({
              appointmentId: existing.id,
              serviceId: s.id,
              price: s.standardPrice,
            })),
          });
        }
      }

      // 5. Cập nhật bản ghi Appointment
      const appointmentUpdateData: any = {
        branchId: targetBranchId,
        doctorId: targetDoctorId,
        chairId: targetChairId,
        startTime: start,
        endTime: end,
        bufferEndTime: bufferEnd,
      };

      if (data.notes !== undefined) {
        appointmentUpdateData.notes = data.notes;
      }

      if (data.status) {
        appointmentUpdateData.status = data.status;
      }

      const updated = await tx.appointment.update({
        where: { id: existing.id },
        data: appointmentUpdateData,
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

      // 6. Ghi vết lịch sử chỉnh sửa
      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: existing.id,
          fromStatus: existing.status,
          toStatus: data.status || existing.status,
          reason: data.editReason || 'Cập nhật/điều chỉnh thông tin lịch hẹn',
          changedBy: data.changedBy || 'Lễ tân / Quản trị viên',
        },
      });

      return updated;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    const patientName = updated.patient?.fullName || 'Bệnh nhân';
    const actionByText = data.changedBy ? `Người cập nhật: ${data.changedBy}.` : '';

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'APPOINTMENTS',
      action: `Điều chỉnh thông tin lịch hẹn: ${updated.appointmentCode} (${patientName})`,
      details: `Cập nhật chi tiết lịch hẹn ${updated.appointmentCode}. Lý do: ${data.editReason || 'Cập nhật thông tin dịch vụ / thời gian'}. ${actionByText}`.trim(),
      targetEntity: updated.appointmentCode,
      status: 'SUCCESS',
    });

    if (operatorUserId) {
      await this.notificationsService.create({
        userId: operatorUserId,
        title: 'Cập nhật lịch hẹn thành công',
        content: `Thông tin lịch hẹn ${updated.appointmentCode} của bệnh nhân ${patientName} đã được lưu thành công.`,
        type: 'APPOINTMENT',
        link: '/admin/appointments',
      });
    }

    return updated;
  }
}

