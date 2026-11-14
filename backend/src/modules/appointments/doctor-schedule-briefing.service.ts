import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

interface BriefingState {
  lastDispatchedDate?: string; // YYYY-MM-DD
  lastDispatchedAt?: string;
  totalDoctorsNotified?: number;
  totalAppointments?: number;
}

@Injectable()
export class DoctorScheduleBriefingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DoctorScheduleBriefingService.name);
  private transporter: Transporter | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private stateFilePath: string;
  private state: BriefingState = {};

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogsService: AuditLogsService,
    private readonly configService: ConfigService,
  ) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Ignored
      }
    }
    this.stateFilePath = path.join(dataDir, 'doctor_briefing_state.json');
    this.loadState();
    this.initMailer();
  }

  private loadState() {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf-8');
        this.state = JSON.parse(raw);
      }
    } catch (err: any) {
      this.logger.warn(`Could not read briefing state: ${err.message}`);
      this.state = {};
    }
  }

  private saveState() {
    try {
      fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.warn(`Could not persist briefing state: ${err.message}`);
    }
  }

  private initMailer() {
    const user = this.configService.get<string>('EMAIL_USER') || process.env.EMAIL_USER;
    const pass = this.configService.get<string>('EMAIL_PASS') || process.env.EMAIL_PASS;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
      this.logger.log(`SMTP Mailer initialized successfully with ${user}`);
    } else {
      this.logger.warn('EMAIL_USER or EMAIL_PASS not configured. Doctor briefing emails will be simulated.');
    }
  }

  onModuleInit() {
    this.logger.log('Starting Doctor Schedule Briefing Scheduler (Daily 21:00 - 22:00 auto-dispatch)...');
    // Run an initial check after 10 seconds of startup
    setTimeout(() => {
      this.checkAndDispatchDailyBriefing().catch((err) =>
        this.logger.error(`Initial briefing check failed: ${err.message}`, err.stack),
      );
    }, 10000);

    // Periodic check every 60 seconds
    this.checkInterval = setInterval(() => {
      this.checkAndDispatchDailyBriefing().catch((err) =>
        this.logger.error(`Scheduled briefing check failed: ${err.message}`, err.stack),
      );
    }, 60000);
  }

  onModuleDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private getVietnamTime(): { now: Date; vnDateStr: string; vnHour: number; vnMinute: number } {
    const vnOffsetMs = 7 * 60 * 60 * 1000;
    const vnDate = new Date(Date.now() + vnOffsetMs);
    const y = vnDate.getUTCFullYear();
    const m = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(vnDate.getUTCDate()).padStart(2, '0');
    const vnDateStr = `${y}-${m}-${d}`;
    const vnHour = vnDate.getUTCHours();
    const vnMinute = vnDate.getUTCMinutes();
    return { now: vnDate, vnDateStr, vnHour, vnMinute };
  }

  private getVietnamTomorrowBounds(nowVn: Date) {
    const vnOffsetMs = 7 * 60 * 60 * 1000;
    const tomorrowVn = new Date(nowVn.getTime() + 24 * 60 * 60 * 1000);
    const y = tomorrowVn.getUTCFullYear();
    const m = tomorrowVn.getUTCMonth();
    const d = tomorrowVn.getUTCDate();

    const startOfTomorrow = new Date(Date.UTC(y, m, d, 0, 0, 0, 0) - vnOffsetMs);
    const endOfTomorrow = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - vnOffsetMs);
    const dayOfWeekNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayOfWeek = dayOfWeekNames[tomorrowVn.getUTCDay()];
    const dateFormatted = `${String(d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/${y}`;

    return { startOfTomorrow, endOfTomorrow, dayOfWeek, dateFormatted };
  }

  /**
   * Evaluates if it is the designated evening hour (21:00 or later) and dispatches briefing for tomorrow
   */
  async checkAndDispatchDailyBriefing(): Promise<boolean> {
    const { now, vnDateStr, vnHour, vnMinute } = this.getVietnamTime();
    const targetHour = parseInt(this.configService.get('DOCTOR_BRIEFING_HOUR') || '21', 10);
    const targetMinute = parseInt(this.configService.get('DOCTOR_BRIEFING_MINUTE') || '0', 10);

    // Check if current time is within or past the scheduled time on the same evening (e.g. >= 21:00)
    const isPastScheduledTime = vnHour > targetHour || (vnHour === targetHour && vnMinute >= targetMinute);

    if (isPastScheduledTime) {
      if (this.state.lastDispatchedDate === vnDateStr) {
        // Already dispatched for today
        return false;
      }

      this.logger.log(`Target dispatch time reached (${vnHour}:${String(vnMinute).padStart(2, '0')} VN). Executing tomorrow schedule briefing...`);
      const result = await this.dispatchTomorrowBriefing();

      this.state.lastDispatchedDate = vnDateStr;
      this.state.lastDispatchedAt = new Date().toISOString();
      this.state.totalDoctorsNotified = result.doctorsNotified;
      this.state.totalAppointments = result.totalAppointments;
      this.saveState();
      return true;
    }

    return false;
  }

  /**
   * Main dispatch method: queries all appointments for tomorrow and dispatches summary email to assigned doctors
   */
  async dispatchTomorrowBriefing(targetTomorrowDate?: Date) {
    const { now } = this.getVietnamTime();
    const { startOfTomorrow, endOfTomorrow, dayOfWeek, dateFormatted } =
      this.getVietnamTomorrowBounds(targetTomorrowDate ? new Date(targetTomorrowDate.getTime() - 24 * 60 * 60 * 1000) : now);

    this.logger.log(`Scanning appointments for tomorrow: ${dayOfWeek}, ${dateFormatted} (${startOfTomorrow.toISOString()} -> ${endOfTomorrow.toISOString()})`);

    // Fetch all active appointments for tomorrow
    const appointmentsTomorrow = await this.prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startOfTomorrow,
          lte: endOfTomorrow,
        },
        status: {
          in: ['CONFIRMED', 'PENDING', 'CHECKED_IN', 'IN_PROGRESS'],
        },
      },
      include: {
        patient: true,
        doctor: true,
        branch: true,
        chair: { include: { room: true } },
        services: { include: { service: true } },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    if (appointmentsTomorrow.length === 0) {
      this.logger.log(`Không có lịch hẹn nào vào ngày mai (${dateFormatted}). Không cần gửi email cho bác sĩ.`);
      return {
        success: true,
        doctorsNotified: 0,
        totalAppointments: 0,
        dateFormatted,
      };
    }

    // Group appointments by doctorId
    const appointmentsByDoctor = new Map<string, { doctor: any; appointments: typeof appointmentsTomorrow }>();

    for (const appt of appointmentsTomorrow) {
      if (!appt.doctorId || !appt.doctor) continue;
      const docId = appt.doctorId;
      if (!appointmentsByDoctor.has(docId)) {
        appointmentsByDoctor.set(docId, { doctor: appt.doctor, appointments: [] });
      }
      appointmentsByDoctor.get(docId)!.appointments.push(appt);
    }

    let doctorsNotified = 0;
    const senderEmail = this.configService.get<string>('EMAIL_USER') || process.env.EMAIL_USER || 'phucvandoan123@gmail.com';

    for (const [doctorId, { doctor, appointments }] of appointmentsByDoctor.entries()) {
      const doctorEmail = (doctor.email || '').trim().toLowerCase();
      if (!doctorEmail || !doctorEmail.includes('@')) {
        this.logger.warn(`Bác sĩ ${doctor.fullName} (ID: ${doctorId}) không có email hợp lệ. Bỏ qua gửi email.`);
        continue;
      }

      const emailHtml = this.buildDoctorBriefingEmailHtml({
        doctorName: doctor.fullName,
        dayOfWeek,
        dateFormatted,
        appointments,
      });

      const firstTime = appointments[0]
        ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(appointments[0].startTime))
        : '08:00';

      const emailSubject = `[SmartSchedule AI] Lịch trình khám ngày mai (${dayOfWeek}, ${dateFormatted}) - BS. ${doctor.fullName}`;

      try {
        if (this.transporter) {
          await this.transporter.sendMail({
            from: `"SmartSchedule AI Clinic" <${senderEmail}>`,
            to: doctorEmail,
            subject: emailSubject,
            html: emailHtml,
          });
          this.logger.log(`Đã gửi email lịch trình ngày mai thành công cho BS. ${doctor.fullName} (${doctorEmail}) - ${appointments.length} ca.`);
        } else {
          this.logger.log(`[SIMULATE MAIL] Gửi tới ${doctorEmail} | Tiêu đề: ${emailSubject}`);
        }

        // Create persistent in-app Notification for the doctor
        await this.notificationsService.create({
          userId: doctor.id,
          title: `[Lịch Khám Ngày Mai] Bác sĩ có ${appointments.length} ca khám ngày ${dateFormatted}`,
          content: `Hệ thống SmartSchedule AI đã gửi email tổng hợp lịch trình ngày mai (${dayOfWeek}, ${dateFormatted}) tới ${doctorEmail}. Ca khám đầu tiên bắt đầu lúc ${firstTime}.`,
          type: 'SCHEDULE',
          link: '/admin/appointments',
        });

        // Record Audit Log for compliance
        await this.auditLogsService.log({
          userId: doctor.id,
          module: 'APPOINTMENTS',
          action: 'DOCTOR_BRIEFING_EMAIL_SENT',
          targetEntity: `User:${doctor.id}`,
          details: `Gửi email tổng hợp ${appointments.length} ca khám ngày ${dateFormatted} cho BS. ${doctor.fullName} (${doctorEmail}).`,
          status: 'SUCCESS',
        });

        doctorsNotified++;
      } catch (err: any) {
        this.logger.error(`Lỗi khi gửi email lịch trình cho BS. ${doctor.fullName} (${doctorEmail}): ${err.message}`, err.stack);
      }
    }

    this.logger.log(`Hoàn tất gửi lịch trình ngày mai: đã thông báo cho ${doctorsNotified}/${appointmentsByDoctor.size} bác sĩ.`);

    return {
      success: true,
      doctorsNotified,
      totalAppointments: appointmentsTomorrow.length,
      dateFormatted,
    };
  }

  private buildDoctorBriefingEmailHtml(params: {
    doctorName: string;
    dayOfWeek: string;
    dateFormatted: string;
    appointments: any[];
  }): string {
    const { doctorName, dayOfWeek, dateFormatted, appointments } = params;

    const formatVnTime = (dateInput: Date | string) => {
      const d = new Date(dateInput);
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d);
    };

    const appointmentRows = appointments
      .map((a, idx) => {
        const timeStart = formatVnTime(a.startTime);
        const timeEnd = formatVnTime(a.endTime);
        const serviceNames =
          a.services && a.services.length > 0
            ? a.services.map((s: any) => s.service?.name).filter(Boolean).join(', ')
            : 'Khám & Điều trị chuyên khoa';
        const chairName = a.chair?.name || a.chair?.code || 'Ghế tiêu chuẩn';
        const branchName = a.branch?.name || 'Phòng khám chính';
        const phone = a.patient?.phone || 'Chưa có SĐT';
        const notes = a.notes ? `<div style="margin-top: 6px; font-size: 11px; color: #b45309; background-color: #fef3c7; padding: 4px 8px; border-radius: 6px;">📝 Ghi chú: ${a.notes}</div>` : '';

        return `
          <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
            <td style="padding: 12px 14px; font-weight: 700; color: #0284c7; white-space: nowrap; font-size: 13px;">
              ${timeStart} - ${timeEnd}
            </td>
            <td style="padding: 12px 14px; font-size: 12px; color: #0f172a;">
              <span style="font-weight: 700; display: block; font-size: 13px;">${a.patient?.fullName || 'Khách hàng'}</span>
              <span style="color: #64748b; font-size: 11px;">📞 ${phone}</span>
              ${notes}
            </td>
            <td style="padding: 12px 14px; font-size: 12px; color: #334155;">
              <span style="font-weight: 600; color: #0f766e;">${serviceNames}</span>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                📍 ${branchName} • <strong>${chairName}</strong>
              </div>
            </td>
            <td style="padding: 12px 14px; text-align: center; white-space: nowrap;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;">
                ${a.appointmentCode}
              </span>
            </td>
          </tr>
        `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8">
        <title>Lịch trình khám ngày mai</title>
      </head>
      <body style="margin: 0; padding: 24px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0f766e 100%); padding: 28px 24px; color: #ffffff;">
            <div style="display: inline-block; padding: 4px 10px; background-color: rgba(255,255,255,0.2); border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px;">
              ✨ SmartSchedule AI Clinic Engine
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; line-height: 1.3;">
              Lịch Trình Khám & Điều Trị Ngày Mai
            </h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #e0f2fe;">
              ${dayOfWeek}, ngày ${dateFormatted} • Tự động tổng hợp gửi lúc 21h-22h tối
            </p>
          </div>

          <!-- Doctor Welcome Card -->
          <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
            <p style="margin: 0; font-size: 15px; color: #0f172a; font-weight: 700;">
              Kính gửi Bác sĩ <span style="color: #0284c7;">${doctorName}</span>,
            </p>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; line-height: 1.5;">
              Hệ thống SmartSchedule AI đã hoàn tất việc đồng bộ và gửi đến Bác sĩ danh sách tổng hợp 
              <strong>${appointments.length} ca khám</strong> đã được xác nhận vào ngày mai. Bác sĩ vui lòng xem trước lịch trình để chuẩn bị dụng cụ và phác đồ chu đáo.
            </p>
          </div>

          <!-- Appointments Table -->
          <div style="padding: 20px 24px;">
            <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
                📋 Danh Sách Ca Khám Chi Tiết (${appointments.length} ca)
              </span>
            </div>

            <div style="border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="background-color: #e2e8f0; color: #334155; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                    <th style="padding: 10px 14px;">Giờ Khám</th>
                    <th style="padding: 10px 14px;">Bệnh Nhân</th>
                    <th style="padding: 10px 14px;">Dịch Vụ & Vị Trí</th>
                    <th style="padding: 10px 14px; text-align: center;">Mã Lịch</th>
                  </tr>
                </thead>
                <tbody>
                  ${appointmentRows}
                </tbody>
              </table>
            </div>

            <!-- Notes Section -->
            <div style="margin-top: 18px; padding: 14px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px;">
              <div style="font-size: 12px; font-weight: 700; color: #065f46; margin-bottom: 4px;">
                🛡️ Tiêu chuẩn Vô trùng & Đệm an toàn AI:
              </div>
              <div style="font-size: 12px; color: #047857; line-height: 1.5;">
                Mỗi ca khám đều đã được tự động tính toán kèm khoảng đệm vô trùng 15 phút giữa các ca. Khi bệnh nhân đến phòng khám, lễ tân sẽ đón tiếp và hướng dẫn vào ghế nha đúng giờ.
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
            <p style="margin: 0;">Email này được gửi tự động từ Hệ thống Nha Khoa Thông Minh SmartSchedule AI.</p>
            <p style="margin: 4px 0 0 0;">Quý Bác sĩ có thể đăng nhập cổng quản trị để xem sơ đồ 3D và hồ sơ bệnh án EMR chi tiết.</p>
          </div>

        </div>
      </body>
      </html>
    `;
  }
}
