import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { PatientsService } from './patients.service.js';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.patientsService.findAll(search, page, limit, branchId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.patientsService.findById(id);
  }

  @Post()
  async create(
    @Req() req: any,
    @Body()
    body: {
      fullName: string;
      phone: string;
      email?: string;
      birthYear?: number;
      dateOfBirth?: string;
      gender?: string;
      medicalAlerts?: string;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.patientsService.create(body, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body()
    body: {
      fullName?: string;
      phone?: string;
      email?: string;
      birthYear?: number;
      gender?: string;
      medicalAlerts?: string;
      avatarUrl?: string;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.patientsService.update(id, body, userId);
  }

  @Post(':id/dental-chart')
  async updateDentalChart(
    @Param('id') id: string,
    @Req() req: any,
    @Body()
    body: {
      toothNumber: number;
      condition: string;
      colorStatus?: string;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.patientsService.updateDentalChart(
      id,
      body.toothNumber,
      body.condition,
      body.colorStatus,
      userId,
    );
  }

  @Post(':id/medical-records')
  async addMedicalRecord(
    @Param('id') id: string,
    @Req() req: any,
    @Body()
    body: {
      diagnosis: string;
      treatmentGiven: string;
      xrayImageUrls?: string[];
      stepId?: string;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.patientsService.addMedicalRecord(id, body, userId);
  }
}
