import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { StaffService } from './staff.service.js';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

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
