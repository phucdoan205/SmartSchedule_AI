import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service.js';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async findAll(
    @Query('branchId') branchId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.equipmentService.findAll({
      branchId,
      category,
      status,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('stats')
  async getStats(@Query('branchId') branchId?: string) {
    return this.equipmentService.getStats(branchId);
  }

  @Get('notifications')
  async getNotifications(@Query('branchId') branchId?: string) {
    return this.equipmentService.getNotifications(branchId);
  }

  @Get('maintenance-history')
  async getMaintenanceHistory(
    @Query('branchId') branchId?: string,
    @Query('equipmentId') equipmentId?: string,
  ) {
    return this.equipmentService.getMaintenanceHistory(branchId, equipmentId);
  }

  @Patch(':id/toggle-pause')
  async togglePause(@Param('id') id: string) {
    return this.equipmentService.togglePause(id);
  }

  @Post('schedule')
  async createSchedule(
    @Body()
    body: {
      equipmentId: string;
      branchId?: string;
      technicianId?: string;
      actionType: string;
      scheduledAt: string;
      scheduledTime?: string;
      findings?: string;
      isUrgent?: boolean;
    },
  ) {
    return this.equipmentService.createSchedule(body);
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
      certificateUrl?: string;
    },
  ) {
    return this.equipmentService.createMaintenanceLog(id, body);
  }
}
