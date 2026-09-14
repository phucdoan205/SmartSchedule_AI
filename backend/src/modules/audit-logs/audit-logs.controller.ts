import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service.js';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(
    @Query('module') moduleName?: string,
    @Query('search') search?: string,
  ) {
    return this.auditLogsService.findAll(moduleName, search);
  }
}
