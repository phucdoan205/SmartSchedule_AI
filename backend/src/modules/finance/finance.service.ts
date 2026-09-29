import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllInvoices(branchId?: string, status?: string) {
    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;

    return this.prisma.invoice.findMany({
      where,
      include: {
        branch: true,
        patient: true,
        appointment: true,
        items: {
          include: { service: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(data: {
    branchId: string;
    patientId: string;
    appointmentId?: string;
    items: { serviceId: string; quantity: number; unitPrice: number }[];
    discountAmount?: number;
  }) {
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const discount = data.discountAmount || 0;
    const finalAmount = Math.max(0, totalAmount - discount);

    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count();
    const invoiceCode = `#HD-${year}-${1000 + count + 1}`;

    return this.prisma.invoice.create({
      data: {
        invoiceCode,
        branchId: data.branchId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        totalAmount,
        discountAmount: discount,
        finalAmount,
        status: 'UNPAID',
        items: {
          create: data.items.map((i) => ({
            serviceId: i.serviceId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subTotal: i.quantity * i.unitPrice,
          })),
        },
      },
      include: {
        items: { include: { service: true } },
        patient: true,
        branch: true,
      },
    });
  }

  async handleVietQrWebhook(data: {
    invoiceCode: string;
    amount: number;
    transactionRef: string;
    paymentMethod?: string;
  }) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceCode: data.invoiceCode },
    });

    if (!invoice) {
      throw new NotFoundException(`Hóa đơn ${data.invoiceCode} không tồn tại`);
    }

    const year = new Date().getFullYear();
    const receiptCode = `#PT-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          receiptCode,
          invoiceId: invoice.id,
          amountPaid: data.amount,
          paymentMethod: data.paymentMethod || 'VIETQR',
          transactionRef: data.transactionRef,
          isMatched: true,
        },
      });

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID' },
      });

      return {
        success: true,
        message: 'Khớp lệnh thanh toán VietQR thành công',
        payment,
      };
    });
  }

  async createReceipt(data: {
    patientId: string;
    amount: number;
    description?: string;
    paymentMethod?: string;
    collector?: string;
  }) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        OR: [{ id: data.patientId }, { patientCode: data.patientId }],
      },
      include: {
        appointments: { take: 1, orderBy: { startTime: 'desc' } },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Bệnh nhân ${data.patientId} không tồn tại`);
    }

    const branch =
      (patient.appointments[0]?.branchId
        ? await this.prisma.branch.findUnique({ where: { id: patient.appointments[0].branchId } })
        : null) || (await this.prisma.branch.findFirst());

    if (!branch) {
      throw new NotFoundException('Không tìm thấy chi nhánh hợp lệ');
    }

    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count();
    const invoiceCode = `#HD-${year}-${1000 + count + 1}`;
    const receiptCode = `#PT-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceCode,
          branchId: branch.id,
          patientId: patient.id,
          totalAmount: data.amount,
          discountAmount: 0,
          finalAmount: data.amount,
          status: 'PAID',
        },
      });

      const payment = await tx.payment.create({
        data: {
          receiptCode,
          invoiceId: invoice.id,
          amountPaid: data.amount,
          paymentMethod: data.paymentMethod || 'VIETQR',
          transactionRef: `REC-${Date.now()}`,
          isMatched: true,
        },
      });

      return {
        invoice,
        payment,
      };
    });
  }
}
