import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FinanceService } from './finance.service.js';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('invoices')
  async findAllInvoices(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
  ) {
    return this.financeService.findAllInvoices(branchId, status);
  }

  @Post('invoices')
  async createInvoice(
    @Body()
    body: {
      branchId: string;
      patientId: string;
      appointmentId?: string;
      items: { serviceId: string; quantity: number; unitPrice: number }[];
      discountAmount?: number;
    },
  ) {
    return this.financeService.createInvoice(body);
  }

  @Post('webhook/vietqr')
  async handleVietQrWebhook(
    @Body()
    body: {
      invoiceCode: string;
      amount: number;
      transactionRef: string;
      paymentMethod?: string;
    },
  ) {
    return this.financeService.handleVietQrWebhook(body);
  }
}
