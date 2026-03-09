import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInventoryItemDto, CreateInventoryMovementDto, MovementType } from './dto/create-inventory-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Categories
  async createCategory(createCategoryDto: CreateCategoryDto, tenantId: string) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        tenantId,
      },
    });
  }

  async findAllCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId, isActive: true },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateCategory(id: string, updateData: Partial<CreateCategoryDto>, tenantId: string) {
    await this.findCategoryById(id, tenantId);
    return this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async removeCategory(id: string, tenantId: string) {
    await this.findCategoryById(id, tenantId);
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async findCategoryById(id: string, tenantId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId, isActive: true },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  // Inventory Items
  async createItem(createInventoryItemDto: CreateInventoryItemDto, tenantId: string) {
    return this.prisma.inventoryItem.create({
      data: {
        ...createInventoryItemDto,
        tenantId,
      },
      include: {
        category: true,
      },
    });
  }

  async findAllItems(tenantId: string, page = 1, limit = 10, search?: string, categoryId?: string) {
    const where: any = { tenantId, isActive: true };
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneItem(id: string, tenantId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        category: true,
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return item;
  }

  async updateItem(id: string, updateData: Partial<CreateInventoryItemDto>, tenantId: string) {
    await this.findOneItem(id, tenantId);
    return this.prisma.inventoryItem.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });
  }

  async removeItem(id: string, tenantId: string) {
    await this.findOneItem(id, tenantId);
    return this.prisma.inventoryItem.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Inventory Movements
  async createMovement(createMovementDto: CreateInventoryMovementDto, tenantId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({
        where: { id: createMovementDto.itemId, tenantId, isActive: true },
      });

      if (!item) {
        throw new NotFoundException('Inventory item not found');
      }

      let newQuantity = item.quantity;
      if (createMovementDto.type === MovementType.IN || createMovementDto.type === MovementType.PURCHASE) {
        newQuantity += createMovementDto.quantity;
      } else if (createMovementDto.type === MovementType.OUT || createMovementDto.type === MovementType.SALE) {
        newQuantity -= createMovementDto.quantity;
        if (newQuantity < 0) {
          throw new BadRequestException(`Insufficient stock. Available: ${item.quantity}, Required: ${createMovementDto.quantity}`);
        }
      } else if (createMovementDto.type === MovementType.ADJUSTMENT) {
        newQuantity = createMovementDto.quantity;
      }

      const [movement] = await Promise.all([
        tx.inventoryMovement.create({
          data: {
            ...createMovementDto,
            tenantId,
          },
        }),
        tx.inventoryItem.update({
          where: { id: createMovementDto.itemId },
          data: { quantity: newQuantity },
        }),
      ]);

      // Check if stock is below minimum
      if (newQuantity < item.minStock && item.minStock > 0) {
        // This could trigger a notification in a real system
        console.warn(`Stock below minimum for item ${item.name}. Current: ${newQuantity}, Minimum: ${item.minStock}`);
      }

      return movement;
    });
  }

  async validateStockAvailability(itemId: string, requiredQuantity: number, tenantId: string): Promise<boolean> {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: itemId, tenantId, isActive: true },
      select: { quantity: true, name: true, sku: true },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return item.quantity >= requiredQuantity;
  }

  async reserveStock(itemId: string, quantity: number, reference: string, tenantId: string) {
    return await this.createMovement({
      itemId,
      type: MovementType.OUT,
      quantity,
      reference,
      notes: `Stock reserved for ${reference}`,
    }, tenantId);
  }

  async releaseStock(itemId: string, quantity: number, reference: string, tenantId: string) {
    return await this.createMovement({
      itemId,
      type: MovementType.IN,
      quantity,
      reference,
      notes: `Stock released from ${reference}`,
    }, tenantId);
  }

  async deductStockForSale(itemId: string, quantity: number, invoiceNumber: string, tenantId: string) {
    const isAvailable = await this.validateStockAvailability(itemId, quantity, tenantId);
    if (!isAvailable) {
      throw new BadRequestException(`Insufficient stock for sale. Cannot process invoice ${invoiceNumber}`);
    }

    return await this.createMovement({
      itemId,
      type: MovementType.SALE,
      quantity,
      reference: `Invoice ${invoiceNumber}`,
      notes: `Stock deducted for sale - Invoice ${invoiceNumber}`,
    }, tenantId);
  }

  async addStockFromPurchase(itemId: string, quantity: number, purchaseNumber: string, tenantId: string) {
    return await this.createMovement({
      itemId,
      type: MovementType.PURCHASE,
      quantity,
      reference: `Purchase ${purchaseNumber}`,
      notes: `Stock added from purchase - Purchase ${purchaseNumber}`,
    }, tenantId);
  }

  async getStockAlerts(tenantId: string) {
    const lowStock = await this.getLowStockItems(tenantId);
    const outOfStock = await this.prisma.inventoryItem.findMany({
      where: {
        tenantId,
        isActive: true,
        quantity: 0,
      },
      include: {
        category: true,
      },
    });

    return {
      lowStock: lowStock.map(item => ({
        ...item,
        alertType: 'LOW_STOCK',
        message: `Stock below minimum: ${item.quantity} < ${item.minStock}`,
      })),
      outOfStock: outOfStock.map(item => ({
        ...item,
        alertType: 'OUT_OF_STOCK',
        message: 'Item is out of stock',
      })),
      summary: {
        totalLowStock: lowStock.length,
        totalOutOfStock: outOfStock.length,
        totalAlerts: lowStock.length + outOfStock.length,
      },
    };
  }

  async findMovements(itemId: string, tenantId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [movements, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where: { itemId, tenantId },
        skip,
        take: limit,
        include: {
          item: {
            select: { name: true, sku: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryMovement.count({
        where: { itemId, tenantId },
      }),
    ]);

    return {
      movements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLowStockItems(tenantId: string) {
    return this.prisma.inventoryItem.findMany({
      where: {
        tenantId,
        isActive: true,
        quantity: { lte: this.prisma.inventoryItem.fields.minStock },
      },
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getStats(tenantId: string) {
    const [
      totalItems,
      lowStockItems,
      totalValue,
      recentMovements,
    ] = await Promise.all([
      this.prisma.inventoryItem.count({
        where: { tenantId, isActive: true },
      }),
      this.prisma.inventoryItem.count({
        where: {
          tenantId,
          isActive: true,
          quantity: { lte: this.prisma.inventoryItem.fields.minStock },
        },
      }),
      this.prisma.inventoryItem.aggregate({
        where: { tenantId, isActive: true },
        _sum: { quantity: true, unitCost: true },
      }),
      this.prisma.inventoryMovement.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    const totalQuantity = totalValue._sum.quantity || 0;
    const totalCost = totalValue._sum.unitCost || 0;

    return {
      totalItems,
      lowStockItems,
      totalQuantity,
      totalValue: totalQuantity * totalCost,
      recentMovements,
    };
  }
}
