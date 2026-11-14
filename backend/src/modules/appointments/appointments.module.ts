import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service.js';
import { AppointmentsController } from './appointments.controller.js';
import { DoctorScheduleBriefingService } from './doctor-schedule-briefing.service.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [AuditLogsModule, NotificationsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, DoctorScheduleBriefingService],
  exports: [AppointmentsService, DoctorScheduleBriefingService],
})
export class AppointmentsModule {}

