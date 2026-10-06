import { Controller, Get, Post, Patch, Param, Body, Query, Req } from '@nestjs/common';
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

  @Post()
  async createEquipment(
    @Req() req: any,
    @Body()
    body: {
      code?: string;
      name: string;
      serialNumber?: string;
      category?: string;
      location?: string;
      branchId?: string;
      technician?: string;
      status?: string;
      nextInspectionAt?: string;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.equipmentService.createEquipment(body, userId);
  }

  @Patch(':id')
  async updateEquipment(
    @Param('id') id: string,
    @Req() req: any,
    @Body()
    body: {
      name?: string;
      code?: string;
      serialNumber?: string;
      category?: string;
      location?: string;
      branchId?: string;
      technician?: string;
      status?: string;
      urgencyAlert?: string | null;
      nextInspectionAt?: string;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.equipmentService.updateEquipment(id, body, userId);
  }

  @Patch('maintenance/:logId/status')
  async updateMaintenanceStatus(
    @Param('logId') logId: string,
    @Req() req: any,
    @Body()
    body: {
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      findings?: string;
      technicianName?: string;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.equipmentService.updateMaintenanceStatus(logId, body, userId);
  }
}

