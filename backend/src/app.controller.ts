import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return {
      status: 'active',
      service: 'SmartSchedule AI Backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth(): any {
    return {
      status: 'ok',
      service: 'SmartSchedule AI Health Check',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
