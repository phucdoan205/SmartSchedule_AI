import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  UnauthorizedException,
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

  /**
   * Health check endpoint khi mở bằng trình duyệt hoặc Zalo ping kiểm tra Webhook
   */
  @Get('zalo-webhook')
  checkZaloWebhook() {
    return {
      ok: true,
      service: 'SmartSchedule AI - Zalo Bot Platform Webhook',
      status: 'active',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Webhook tiếp nhận sự kiện và tin nhắn từ Zalo Bot Platform
   */
  @Post('zalo-webhook')
  async handleZaloChat(
    @Headers('x-bot-api-secret-token') secretToken?: string,
    @Body() body?: any,
  ) {
    // 1. Kiểm tra Secret Token nếu đã cấu hình trong .env
    const expectedSecret = process.env.ZALO_BOT_SECRET_TOKEN;
    if (expectedSecret && secretToken && secretToken !== expectedSecret) {
      throw new UnauthorizedException('Secret Token không hợp lệ');
    }

    // 2. Định dạng sự kiện chuẩn từ Zalo Bot Platform
    if (body?.ok && body?.result) {
      return this.aiService.handleZaloBotWebhook(body.result);
    }
    if (body?.event_name) {
      return this.aiService.handleZaloBotWebhook(body);
    }

    // 3. Tương thích ngược với các yêu cầu log tùy biến
    if (body?.messageText) {
      return this.aiService.logZaloChat(body);
    }

    return { ok: true, message: 'Webhook received' };
  }

  /**
   * Kích hoạt quét nhắc lịch tự động thủ công hoặc theo scheduler
   */
  @Post('zalo-reminder/run-check')
  async triggerReminderCheck() {
    return this.aiService.runAutomatedReminders();
  }

  /**
   * Chủ động gửi tin nhắc lịch Zalo cho một lịch hẹn cụ thể
   */
  @Post('zalo-reminder/send/:appointmentId')
  async sendAppointmentReminder(@Param('appointmentId') appointmentId: string) {
    const success = await this.aiService.sendAppointmentZaloReminder(appointmentId);
    return {
      success,
      message: success
        ? 'Đã gửi tin nhắn nhắc lịch hẹn thành công qua Zalo Bot'
        : 'Không thể gửi tin nhắn (bệnh nhân chưa liên kết Zalo hoặc lịch hẹn không tồn tại)',
    };
  }
}

