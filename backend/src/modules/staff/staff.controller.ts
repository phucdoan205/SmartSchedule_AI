import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { StaffService } from './staff.service.js';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('schedules')
  async getStaffSchedules(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ) {
    return this.staffService.getStaffSchedules({
      branchId,
      startDate,
      endDate,
      userId,
    });
  }

  @Post('schedules')
  async createStaffSchedule(
    @Body()
    body: {
      userId: string;
      branchId: string;
      workDate: string;
      shiftType: 'morning' | 'afternoon' | 'fullday' | 'leave' | 'overtime';
      startTime?: string;
      endTime?: string;
      notes?: string;
    },
  ) {
    return this.staffService.createStaffSchedule(body);
  }

  @Post('schedules/auto-generate')
  async autoGenerateWeekSchedule(
    @Body() body: { branchId?: string; weekStart?: string },
  ) {
    return this.staffService.autoGenerateWeekSchedule(
      body.branchId,
      body.weekStart,
    );
  }

  @Delete('schedules/:id')
  async deleteStaffSchedule(@Param('id') id: string) {
    return this.staffService.deleteStaffSchedule(id);
  }

  @Get('doctors')
  async findDoctors(
    @Query('branchId') branchId?: string,
    @Query('specialty') specialty?: string,
  ) {
    return this.staffService.findDoctors(branchId, specialty);
  }

  @Get('doctors/:id')
  async getDoctorById(@Param('id') id: string) {
    return this.staffService.getDoctorById(id);
  }

  @Get(':id')
  async getStaffById(@Param('id') id: string) {
    return this.staffService.getDoctorById(id);
  }

  @Patch(':id')
  async updateStaff(
    @Param('id') id: string,
    @Body()
    body: {
      fullName?: string;
      email?: string;
      phone?: string;
      branchId?: string;
      specialty?: string;
      experienceYears?: number;
      bio?: string;
      avatarUrl?: string;
    },
  ) {
    return this.staffService.updateStaff(id, body);
  }

  @Get()
  async findAllStaff(@Query('branchId') branchId?: string) {
    return this.staffService.findAllStaff(branchId);
  }

  @Post()
  async createStaff(
    @Body()
    body: {
      employeeCode: string;
      fullName: string;
      email: string;
      phone: string;
      branchId: string;
      roleName: string;
      avatarUrl?: string;
      specialty?: string;
      licenseNumber?: string;
      experienceYears?: number;
      bio?: string;
    },
  ) {
    return this.staffService.createStaff(body);
  }
}

