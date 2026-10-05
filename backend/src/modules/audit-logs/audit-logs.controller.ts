import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service.js';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(
    @Query('module') moduleName?: string,
    @Query('search') search?: string,
    @Query('timeFilter') timeFilter?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLogsService.findAll({
      moduleName,
      search,
      timeFilter,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }
}
