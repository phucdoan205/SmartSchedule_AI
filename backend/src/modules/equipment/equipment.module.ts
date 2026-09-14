import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service.js';
import { EquipmentController } from './equipment.controller.js';

@Module({
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
