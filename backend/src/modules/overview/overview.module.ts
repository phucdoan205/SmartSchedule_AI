import { Module } from '@nestjs/common';
import { OverviewController } from './overview.controller.js';
import { OverviewService } from './overview.service.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [OverviewController],
  providers: [OverviewService],
  exports: [OverviewService],
})
export class OverviewModule {}
