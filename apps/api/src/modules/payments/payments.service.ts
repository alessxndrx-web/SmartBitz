import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, tenantId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Validate invoice exists and belongs to tenant
      const invoice = await tx.invoice.findFirst({
        where: { id: createPaymentDto.invoiceId, tenantId },
        include: { items: true },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found or does not belong to this tenant');
      }

      if (invoice.status === 'cancelled') {
        throw new BadRequestException('Cannot register payments for a cancelled invoice');
      }

      // Validate payment amount
      if (createPaymentDto.amount <= 0) {
        throw new BadRequestException('Payment amount must be greater than 0');
      }

      // Calculate total paid so far
      const existingPayments = await tx.payment.findMany({
        where: { invoiceId: createPaymentDto.invoiceId },
      });

      const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const newTotalPaid = totalPaid + createPaymentDto.amount;

      if (newTotalPaid > invoice.total) {
        throw new BadRequestException(`Payment amount exceeds invoice total. Invoice total: ${invoice.total}, Already paid: ${totalPaid}, Attempted payment: ${createPaymentDto.amount}`);
      }

      // Create payment
      const payment = await tx.payment.create({
        data: {
          invoiceId: createPaymentDto.invoiceId,
          amount: createPaymentDto.amount,
          method: createPaymentDto.method,
          status: createPaymentDto.status || 'completed',
          paymentDate: createPaymentDto.paymentDate ? new Date(createPaymentDto.paymentDate) : new Date(),
          notes: createPaymentDto.notes,
        },
      });

      // Update invoice status based on payment
      let newStatus = invoice.status;
      if (Math.abs(newTotalPaid - invoice.total) < 0.01) {
        newStatus = 'paid';
      } else if (newTotalPaid > 0) {
        newStatus = 'partially_paid';
      }

      if (newStatus !== invoice.status) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: newStatus },
        });
      }

      return {
        payment,
        invoiceStatus: newStatus,
        totalPaid: newTotalPaid,
        remainingBalance: invoice.total - newTotalPaid,
      };
    });
  }

  async findAll(tenantId: string, page = 1, limit = 10, invoiceId?: string) {
    const where: any = { invoice: { tenantId } };
    if (invoiceId) where.invoiceId = invoiceId;

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              total: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, tenantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { 
        id,
        invoice: { tenantId }
      },
      include: {
        invoice: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getInvoicePayments(invoiceId: string, tenantId: string) {
    // Validate invoice belongs to tenant
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found or does not belong to this tenant');
    }

    const payments = await this.prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingBalance = invoice.total - totalPaid;

    return {
      invoice,
      payments,
      totalPaid,
      remainingBalance,
      paymentStatus: remainingBalance <= 0 ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid',
    };
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, tenantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { 
        id,
        invoice: { tenantId }
      },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: updatePaymentDto,
      });

      // Recalculate invoice status
      const allPayments = await tx.payment.findMany({
        where: { invoiceId: payment.invoiceId },
      });

      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
      let newStatus = payment.invoice.status;

      if (Math.abs(totalPaid - payment.invoice.total) < 0.01) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        newStatus = 'partially_paid';
      } else {
        newStatus = 'draft';
      }

      if (newStatus !== payment.invoice.status) {
        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: newStatus },
        });
      }

      return updatedPayment;
    });
  }

  async remove(id: string, tenantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { 
        id,
        invoice: { tenantId }
      },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.payment.delete({
        where: { id },
      });

      // Recalculate invoice status
      const remainingPayments = await tx.payment.findMany({
        where: { invoiceId: payment.invoiceId },
      });

      const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
      let newStatus = payment.invoice.status;

      if (Math.abs(totalPaid - payment.invoice.total) < 0.01) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        newStatus = 'partially_paid';
      } else {
        newStatus = 'draft';
      }

      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: newStatus },
      });

      return { message: 'Payment deleted successfully', newStatus };
    });
  }
}
