import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service.js';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('book')
  async bookAppointment(
    @Body()
    body: {
      patientName: string;
      patientPhone: string;
      patientEmail?: string;
      birthYear?: number;
      gender?: string;
      branchId: string;
      doctorId: string;
      chairId: string;
      serviceIds: string[];
      startTime: string;
      durationMinutes?: number;
      notes?: string;
      isAiRecommended?: boolean;
    },
  ) {
    return this.appointmentsService.bookAppointment(body);
  }

  @Get()
  async findAll(
    @Query('branchId') branchId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.findAll({ branchId, doctorId, status, date });
  }

  @Get('available-slots')
  async getAvailableSlots(
    @Query('branchId') branchId: string,
    @Query('date') date: string,
    @Query('durationMinutes') durationMinutes?: string,
  ) {
    return this.appointmentsService.getAvailableSlots(
      branchId,
      date,
      durationMinutes ? parseInt(durationMinutes, 10) : 60,
    );
  }

  @Post('check-in-qr')
  async checkInByQr(@Body() body: { qrPassCode: string }) {
    return this.appointmentsService.checkInByQr(body.qrPassCode);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.appointmentsService.findById(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string; changedBy?: string },
  ) {
    return this.appointmentsService.updateStatus(
      id,
      body.status,
      body.reason,
      body.changedBy,
    );
  }
}
