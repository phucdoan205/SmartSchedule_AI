import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { OperatoriesService } from './operatories.service.js';

@Controller('operatories')
export class OperatoriesController {
  constructor(private readonly operatoriesService: OperatoriesService) {}

  @Get('branch/:branchId')
  async getBranchOperatories(@Param('branchId') branchId: string) {
    return this.operatoriesService.getBranchOperatories(branchId);
  }

  @Patch(':id/status')
  async updateChairStatus(
    @Param('id') id: string,
    @Body() body: { status: string; assignedDoctorId?: string },
  ) {
    return this.operatoriesService.updateChairStatus(
      id,
      body.status,
      body.assignedDoctorId,
    );
  }
}
