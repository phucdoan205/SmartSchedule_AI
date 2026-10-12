import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiConsultationService } from './ai-consultation.service.js';
import type { MulterFile } from '../upload/upload.service.js';

@Controller('ai')
export class AiConsultationController {
  constructor(private readonly aiService: AiConsultationService) {}

  @Post('consultation')
  @UseInterceptors(FileInterceptor('file'))
  async consult(
    @Body() body: { symptoms?: string; patientName?: string; patientPhone?: string; channel?: string },
    @UploadedFile() file?: MulterFile,
  ) {
    return this.aiService.consult(body, file);
  }

  @Patch('consultation/:id/accept')
  async acceptConsultation(
    @Param('id') id: string,
    @Body() body: { appointmentId?: string },
  ) {
    return this.aiService.acceptConsultation(id, body?.appointmentId);
  }

  @Get('insights')
  async getInsights(@Query('branchId') branchId?: string) {
    return this.aiService.getInsights(branchId);
  }

  @Post('zalo-webhook')
  async handleZaloChat(
    @Body()
    body: {
      senderPhone?: string;
      senderName?: string;
      messageText: string;
      aiResponseText: string;
      sentiment?: string;
    },
  ) {
    return this.aiService.logZaloChat(body);
  }
}
