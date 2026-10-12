import { Module } from '@nestjs/common';
import { AiConsultationController } from './ai-consultation.controller.js';
import { AiConsultationService } from './ai-consultation.service.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [AiConsultationController],
  providers: [AiConsultationService],
  exports: [AiConsultationService],
})
export class AiConsultationModule {}
