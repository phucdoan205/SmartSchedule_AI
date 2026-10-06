import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { FinanceService } from './finance.service.js';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('overview')
  async getOverview(
    @Query('branchId') branchId?: string,
    @Query('month') month?: string,
  ) {
    return this.financeService.getOverview(branchId, month);
  }

  @Get('transactions')
  async getTransactions(
    @Query('branchId') branchId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.financeService.getTransactions({
      branchId,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('invoices')
  async findAllInvoices(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
  ) {
    return this.financeService.findAllInvoices(branchId, status);
  }

  @Post('invoices')
  async createInvoice(
    @Req() req: any,
    @Body()
    body: {
      branchId: string;
      patientId: string;
      appointmentId?: string;
      items: { serviceId: string; quantity: number; unitPrice: number }[];
      discountAmount?: number;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.financeService.createInvoice(body, userId);
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

  @Post('receipt')
  async createReceipt(
    @Req() req: any,
    @Body()
    body: {
      patientId: string;
      amount: number;
      description?: string;
      paymentMethod?: string;
      collector?: string;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.financeService.createReceipt(body, userId);
  }
}
