import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePurchaseDto, PurchaseStatus } from './dto/create-purchase.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { ReceivePurchaseDto } from './dto/receive-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  // Suppliers
  async createSupplier(createSupplierDto: CreateSupplierDto, tenantId: string) {
    return this.prisma.supplier.create({
      data: {
        ...createSupplierDto,
        tenantId,
      },
    });
  }

  async findAllSuppliers(tenantId: string) {
    return this.prisma.supplier.findMany({
      where: { tenantId, isActive: true },
      include: {
        _count: {
          select: { purchases: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateSupplier(id: string, updateData: Partial<CreateSupplierDto>, tenantId: string) {
    await this.findSupplierById(id, tenantId);
    await this.prisma.supplier.updateMany({
      where: { id, tenantId },
      data: updateData,
    });
    return this.findSupplierById(id, tenantId);
  }

  async removeSupplier(id: string, tenantId: string) {
    await this.findSupplierById(id, tenantId);
    await this.prisma.supplier.updateMany({
      where: { id, tenantId },
      data: { isActive: false },
    });
    return { id, deleted: true };
  }

  private async findSupplierById(id: string, tenantId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId, isActive: true },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }

  // Purchases
  async createPurchase(createPurchaseDto: CreatePurchaseDto, tenantId: string) {
    // Validate supplier belongs to tenant
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: createPurchaseDto.supplierId, tenantId, isActive: true },
    });

    if (!supplier) {
      throw new BadRequestException('Supplier not found or does not belong to this tenant');
    }

    // Validate that all items belong to tenant
    const itemIds = createPurchaseDto.items.map((i) => i.itemId);
    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: {
        id: { in: itemIds },
        tenantId,
        isActive: true,
      },
      select: { id: true },
    });

    if (inventoryItems.length !== new Set(itemIds).size) {
      throw new BadRequestException('One or more inventory items do not belong to this tenant or do not exist');
    }

    // Generate purchase number if not provided
    let purchaseNumber = createPurchaseDto.number;
    if (!purchaseNumber) {
      const lastPurchase = await this.prisma.purchase.findFirst({
        where: { tenantId },
        orderBy: { number: 'desc' },
      });
      
      const nextNumber = lastPurchase ? parseInt(lastPurchase.number) + 1 : 1;
      purchaseNumber = nextNumber.toString().padStart(6, '0');
    }

    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;
    const items = createPurchaseDto.items.map(item => {
      const itemSubtotal = item.quantity * item.unitCost;
      const itemDiscount = itemSubtotal * (item.discount || 0) / 100;
      const itemTaxable = itemSubtotal - itemDiscount;
      const itemTax = itemTaxable * (item.taxRate || 0) / 100;
      const itemTotal = itemTaxable + itemTax;

      subtotal += itemSubtotal;
      totalTax += itemTax;

      return {
        itemId: item.itemId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        discount: item.discount || 0,
        taxRate: item.taxRate || 0,
        total: itemTotal,
        received: 0,
      };
    });

    const total = subtotal + totalTax;

    return this.prisma.purchase.create({
      data: {
        tenantId,
        number: purchaseNumber,
        supplierId: createPurchaseDto.supplierId,
        subtotal,
        tax: totalTax,
        total,
        status: createPurchaseDto.status || PurchaseStatus.PENDING,
        purchaseDate: createPurchaseDto.purchaseDate ? new Date(createPurchaseDto.purchaseDate) : new Date(),
        notes: createPurchaseDto.notes,
        items: {
          create: items,
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async findAllPurchases(tenantId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        include: {
          supplier: true,
          items: {
            include: {
              item: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchase.count({ where }),
    ]);

    return {
      purchases,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOnePurchase(id: string, tenantId: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return purchase;
  }

  async updatePurchase(id: string, updateData: Partial<CreatePurchaseDto>, tenantId: string) {
    await this.findOnePurchase(id, tenantId);
    await this.prisma.purchase.updateMany({
      where: { id, tenantId },
      data: updateData,
    });
    return this.findOnePurchase(id, tenantId);
  }

  async cancelPurchase(id: string, tenantId: string) {
    const purchase = await this.findOnePurchase(id, tenantId);

    if (purchase.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException('Cannot cancel received purchase');
    }

    if (purchase.status === PurchaseStatus.CANCELLED) {
      throw new BadRequestException('Purchase already cancelled');
    }

    await this.prisma.purchase.updateMany({
      where: { id, tenantId },
      data: { status: PurchaseStatus.CANCELLED },
    });
    return this.findOnePurchase(id, tenantId);
  }

  async receivePurchase(id: string, receivePurchaseDto: ReceivePurchaseDto, tenantId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Validate purchase exists and belongs to tenant
      const purchase = await tx.purchase.findFirst({
        where: { id, tenantId },
        include: {
          items: {
            include: { item: true },
          },
        },
      });

      if (!purchase) {
        throw new NotFoundException('Purchase not found or does not belong to this tenant');
      }

      if (purchase.status === PurchaseStatus.CANCELLED) {
        throw new BadRequestException('Cannot receive cancelled purchase');
      }

      if (purchase.status === PurchaseStatus.RECEIVED) {
        throw new BadRequestException('Purchase already received');
      }

      // Validate and process each item reception
      let totalReceived = 0;
      for (const receiveItem of receivePurchaseDto.items) {
        // Find purchase item
        const purchaseItem = purchase.items.find(item => item.id === receiveItem.purchaseItemId);
        if (!purchaseItem) {
          throw new BadRequestException(`Purchase item ${receiveItem.purchaseItemId} not found`);
        }

        // Validate received quantity
        if (receiveItem.quantityReceived <= 0) {
          throw new BadRequestException(`Received quantity must be greater than 0 for item ${receiveItem.purchaseItemId}`);
        }

        if (purchaseItem.received + receiveItem.quantityReceived > purchaseItem.quantity) {
          throw new BadRequestException(`Cannot receive more than ordered quantity for item ${receiveItem.purchaseItemId}`);
        }

        // Update purchase item received quantity
        await tx.purchaseItem.update({
          where: { id: receiveItem.purchaseItemId },
          data: {
            received: purchaseItem.received + receiveItem.quantityReceived,
          },
        });

        // Update inventory item quantity
        await tx.inventoryItem.update({
        where: { id: purchaseItem.itemId, tenantId },
          data: {
            quantity: {
              increment: receiveItem.quantityReceived,
            },
          },
        });

        // Create inventory movement
        await tx.inventoryMovement.create({
          data: {
            tenantId,
            itemId: purchaseItem.itemId,
            type: 'purchase',
            quantity: receiveItem.quantityReceived,
            reference: `Purchase ${purchase.number}`,
            notes: `Received ${receiveItem.quantityReceived} units via purchase ${purchase.number}`,
          },
        });

        totalReceived += receiveItem.quantityReceived;
      }

      // Check if all items are fully received
      const allItemsReceived = purchase.items.every(item => {
        const receivedItem = receivePurchaseDto.items.find(ri => ri.purchaseItemId === item.id);
        return item.received + (receivedItem?.quantityReceived || 0) >= item.quantity;
      });

      // Update purchase status
      const newStatus = allItemsReceived ? PurchaseStatus.RECEIVED : PurchaseStatus.PENDING;
      
      await tx.purchase.updateMany({
        where: { id, tenantId },
        data: {
          status: newStatus,
          receivedAt: newStatus === PurchaseStatus.RECEIVED ? new Date() : null,
        },
      });

      const updatedPurchase = await tx.purchase.findFirst({
        where: { id, tenantId },
        include: {
          supplier: true,
          items: {
            include: { item: true },
          },
        },
      });

      if (!updatedPurchase) {
        throw new NotFoundException('Purchase not found');
      }

      return {
        purchase: updatedPurchase,
        totalReceived,
        status: newStatus,
        message: `Successfully received ${totalReceived} items. Purchase status: ${newStatus}`,
      };
    });
  }

  async getStats(tenantId: string) {
    const [
      totalPurchases,
      pendingPurchases,
      receivedPurchases,
      cancelledPurchases,
      totalSpent,
    ] = await Promise.all([
      this.prisma.purchase.count({ where: { tenantId } }),
      this.prisma.purchase.count({ where: { tenantId, status: PurchaseStatus.PENDING } }),
      this.prisma.purchase.count({ where: { tenantId, status: PurchaseStatus.RECEIVED } }),
      this.prisma.purchase.count({ where: { tenantId, status: PurchaseStatus.CANCELLED } }),
      this.prisma.purchase.aggregate({
        where: { tenantId, status: PurchaseStatus.RECEIVED },
        _sum: { total: true },
      }),
    ]);

    return {
      total: totalPurchases,
      pending: pendingPurchases,
      received: receivedPurchases,
      cancelled: cancelledPurchases,
      totalSpent: totalSpent._sum.total || 0,
    };
  }
}
