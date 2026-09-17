import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { PatientsService } from './patients.service.js';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.patientsService.findAll(search);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.patientsService.findById(id);
  }

  @Post()
  async create(
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
    return this.patientsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      fullName?: string;
      phone?: string;
      email?: string;
      birthYear?: number;
      gender?: string;
      medicalAlerts?: string;
    },
  ) {
    return this.patientsService.update(id, body);
  }

  @Post(':id/dental-chart')
  async updateDentalChart(
    @Param('id') id: string,
    @Body()
    body: {
      toothNumber: number;
      condition: string;
      colorStatus?: string;
    },
  ) {
    return this.patientsService.updateDentalChart(
      id,
      body.toothNumber,
      body.condition,
      body.colorStatus,
    );
  }

  @Post(':id/medical-records')
  async addMedicalRecord(
    @Param('id') id: string,
    @Body()
    body: {
      diagnosis: string;
      treatmentGiven: string;
      xrayImageUrls?: string[];
      stepId?: string;
    },
  ) {
    return this.patientsService.addMedicalRecord(id, body);
  }
}
