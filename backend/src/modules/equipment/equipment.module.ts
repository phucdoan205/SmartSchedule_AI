import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service.js';
import { EquipmentController } from './equipment.controller.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuditLogsModule, NotificationsModule, AuthModule],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
