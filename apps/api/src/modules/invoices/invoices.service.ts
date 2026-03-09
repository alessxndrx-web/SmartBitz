import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, tenantId: string) {
    // Validate invoice data
    await this.validateInvoiceData(createInvoiceDto, tenantId);

    return await this.prisma.$transaction(async (tx) => {
      // Generate invoice number if not provided
      let invoiceNumber = createInvoiceDto.number;
      if (!invoiceNumber) {
        const lastInvoice = await tx.invoice.findFirst({
          where: { tenantId },
          orderBy: { number: 'desc' },
        });
        
        const nextNumber = lastInvoice ? parseInt(lastInvoice.number) + 1 : 1;
        invoiceNumber = nextNumber.toString().padStart(6, '0');
      }

      // Validate unique invoice number for tenant
      const existingInvoice = await tx.invoice.findFirst({
        where: { 
          tenantId, 
          number: invoiceNumber 
        },
      });

      if (existingInvoice) {
        throw new BadRequestException(`Invoice number ${invoiceNumber} already exists for this tenant`);
      }

      // Calculate totals with enhanced validation
      const { items, subtotal, totalTax, total } = await this.calculateInvoiceTotals(createInvoiceDto.items);

      // Validate customer exists and belongs to tenant
      if (createInvoiceDto.customerId) {
        const customer = await tx.customer.findFirst({
          where: { id: createInvoiceDto.customerId, tenantId },
        });
        
        if (!customer) {
          throw new BadRequestException('Customer not found or does not belong to this tenant');
        }
      }

      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          number: invoiceNumber,
          customerId: createInvoiceDto.customerId,
          subtotal,
          tax: totalTax,
          total,
          status: createInvoiceDto.status || 'draft',
          issueDate: createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : new Date(),
          dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : null,
          items: {
            create: items,
          },
        },
      });

      return invoice;
    });
  }

  async createWithStockDeduction(createInvoiceDto: CreateInvoiceDto, tenantId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // First create the invoice
      const invoice = await this.create(createInvoiceDto, tenantId);

      // If invoice is not draft, deduct stock for inventory items
      if (invoice.status !== 'draft') {
        await this.deductStockForInvoiceItems(invoice, tenantId);
      }

      return invoice;
    });
  }

  private async deductStockForInvoiceItems(invoice: any, tenantId: string) {
    for (const item of invoice.items) {
      // Check if this invoice item corresponds to an inventory item
      // This would require linking invoice items to inventory items
      // For now, we'll assume invoice items with SKU correspond to inventory items
      
      if (item.description && item.quantity > 0) {
        try {
          // Try to find inventory item by name/description
          const inventoryItem = await this.prisma.inventoryItem.findFirst({
            where: { 
              tenantId,
              name: item.description,
              isActive: true 
            },
          });

          if (inventoryItem) {
            await this.inventoryService.deductStockForSale(
              inventoryItem.id,
              item.quantity,
              invoice.number,
              tenantId
            );
          }
        } catch (error) {
          // Log error but don't fail the invoice creation
          console.warn(`Could not deduct stock for item ${item.description}:`, error.message);
        }
      }
    }
  }

  async updateStatus(id: string, status: string, tenantId: string) {
    const invoice = await this.findOne(id, tenantId);

    // Validate status transition
    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return await this.prisma.$transaction(async (tx) => {
      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: { status },
      });

      // If changing from draft to sent, deduct stock
      if (invoice.status === 'draft' && (status === 'sent' || status === 'paid')) {
        await this.deductStockForInvoiceItems(updatedInvoice, tenantId);
      }

      return updatedInvoice;
    });
  }

  private async validateInvoiceData(invoiceDto: CreateInvoiceDto, tenantId: string) {
    // Validate items array
    if (!invoiceDto.items || invoiceDto.items.length === 0) {
      throw new BadRequestException('Invoice must have at least one item');
    }

    // Validate each item
    for (const item of invoiceDto.items) {
      if (item.quantity <= 0) {
        throw new BadRequestException('Item quantity must be greater than 0');
      }
      if (item.unitPrice < 0) {
        throw new BadRequestException('Item unit price cannot be negative');
      }
      if (item.discount && (item.discount < 0 || item.discount > 100)) {
        throw new BadRequestException('Item discount must be between 0 and 100');
      }
      if (item.taxRate && (item.taxRate < 0 || item.taxRate > 100)) {
        throw new BadRequestException('Item tax rate must be between 0 and 100');
      }
    }

    // Validate status
    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (invoiceDto.status && !validStatuses.includes(invoiceDto.status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate dates
    if (invoiceDto.issueDate && invoiceDto.dueDate) {
      const issueDate = new Date(invoiceDto.issueDate);
      const dueDate = new Date(invoiceDto.dueDate);
      
      if (dueDate < issueDate) {
        throw new BadRequestException('Due date cannot be before issue date');
      }
    }
  }

  private async calculateInvoiceTotals(items: CreateInvoiceDto['items']) {
    let subtotal = 0;
    let totalTax = 0;
    const calculatedItems = items.map(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discount || 0) / 100;
      const itemTaxable = itemSubtotal - itemDiscount;
      const itemTax = itemTaxable * (item.taxRate || 0) / 100;
      const itemTotal = itemTaxable + itemTax;

      subtotal += itemSubtotal;
      totalTax += itemTax;

      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        taxRate: item.taxRate || 0,
        total: parseFloat(itemTotal.toFixed(2)),
      };
    });

    const total = subtotal + totalTax;

    return {
      items: calculatedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  async findAll(tenantId: string, page = 1, limit = 10, status?: string) {
    const where: any = { tenantId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const updateData: any = {};
    
    if (updateInvoiceDto.customerId !== undefined) {
      updateData.customerId = updateInvoiceDto.customerId;
    }
    if (updateInvoiceDto.status !== undefined) {
      updateData.status = updateInvoiceDto.status;
    }
    if (updateInvoiceDto.issueDate) {
      updateData.issueDate = new Date(updateInvoiceDto.issueDate);
    }
    if (updateInvoiceDto.dueDate) {
      updateData.dueDate = new Date(updateInvoiceDto.dueDate);
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.invoice.delete({
      where: { id },
    });
  }

  async getStats(tenantId: string) {
    const [
      totalInvoices,
      paidInvoices,
      outstandingInvoices,
      draftInvoices,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.invoice.count({ where: { tenantId } }),
      this.prisma.invoice.count({ where: { tenantId, status: 'paid' } }),
      this.prisma.invoice.count({
        where: {
          tenantId,
          status: {
            in: ['draft', 'sent', 'overdue', 'partially_paid'],
          },
        },
      }),
      this.prisma.invoice.count({ where: { tenantId, status: 'draft' } }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: 'paid' },
        _sum: { total: true },
      }),
    ]);

    return {
      totalInvoices,
      paidInvoices,
      unpaidInvoices: outstandingInvoices,
      draftInvoices,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  }
}
