import { Controller, Get, Query, Req } from '@nestjs/common';
import { OverviewService } from './overview.service.js';

@Controller('overview')
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get()
  async getDashboardData(
    @Req() req: any,
    @Query('branchId') branchId?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.overviewService.getDashboardData(userId, branchId);
  }
}
