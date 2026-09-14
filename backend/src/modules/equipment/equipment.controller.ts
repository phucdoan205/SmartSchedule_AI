import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service.js';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async findAll(@Query('branchId') branchId?: string) {
    return this.equipmentService.findAll(branchId);
  }

  @Post(':id/maintenance')
  async createMaintenanceLog(
    @Param('id') id: string,
    @Body()
    body: {
      technicianId: string;
      actionType: string;
      findings: string;
      isCertified?: boolean;
    },
  ) {
    return this.equipmentService.createMaintenanceLog(id, body);
  }

  @Get('maintenance-history')
  async getMaintenanceHistory(@Query('equipmentId') equipmentId?: string) {
    return this.equipmentService.getMaintenanceHistory(equipmentId);
  }
}
