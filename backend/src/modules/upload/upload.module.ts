import { Module } from '@nestjs/common';
import { UploadService } from './upload.service.js';
import { UploadController } from './upload.controller.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
