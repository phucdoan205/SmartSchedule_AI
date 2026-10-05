import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service.js';
import { EquipmentController } from './equipment.controller.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';

@Module({
  imports: [AuditLogsModule],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
