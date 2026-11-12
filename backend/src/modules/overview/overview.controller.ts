import { BadRequestException, Controller, Get, Query, Req } from '@nestjs/common';
import { OverviewService, type OverviewSectionKey } from './overview.service.js';

const VALID_SECTIONS = new Set<string>([
  'ai_widgets',
  'appointments_table',
  'active_staff',
  'doctor_profile',
  'reception_panels',
  'finance_overview',
  'chairs_panel',
  'maintenance_panel',
  'nurse_shift',
  'branch_ops',
]);

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

  @Get('summary')
  async getSummary(
    @Req() req: any,
    @Query('branchId') branchId?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.overviewService.getSummaryData(userId, branchId);
  }

  @Get('section')
  async getSection(
    @Req() req: any,
    @Query('section') section?: string,
    @Query('branchId') branchId?: string,
  ) {
    if (!section || !VALID_SECTIONS.has(section)) {
      throw new BadRequestException(`Section không hợp lệ: ${section || 'trống'}`);
    }
    const userId = req.user?.sub || req.user?.id;
    return this.overviewService.getSectionData(userId, branchId, section as OverviewSectionKey);
  }
}
