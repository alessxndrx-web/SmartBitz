import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSupportTicketDto, TicketStatus, TicketPriority, TicketCategory } from './dto/create-support-ticket.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(createSupportTicketDto: CreateSupportTicketDto, tenantId: string, userId?: string) {
    return this.prisma.supportTicket.create({
      data: {
        ...createSupportTicketDto,
        tenantId,
        userId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(tenantId: string, status: TicketStatus) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId, status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPriority(tenantId: string, priority: TicketPriority) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId, priority },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(tenantId: string, category: TicketCategory) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId, category },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(tenantId: string, userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return ticket;
  }

  async updateStatus(id: string, status: TicketStatus, tenantId: string) {
    await this.findOne(id, tenantId);

    const updateData: any = { status };
    
    if (status === TicketStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
    } else if (status === TicketStatus.OPEN || status === TicketStatus.IN_PROGRESS || status === TicketStatus.CLOSED) {
      updateData.resolvedAt = null;
    }

    await this.prisma.supportTicket.updateMany({
      where: { id, tenantId },
      data: updateData,
    });

    return this.findOne(id, tenantId);
  }

  async assignTicket(id: string, assignedTo: string, tenantId: string) {
    await this.findOne(id, tenantId);

    await this.prisma.supportTicket.updateMany({
      where: { id, tenantId },
      data: { 
        assignedTo,
        status: TicketStatus.IN_PROGRESS,
      },
    });

    return this.findOne(id, tenantId);
  }

  async updateTicket(id: string, updateData: Partial<CreateSupportTicketDto>, tenantId: string) {
    await this.findOne(id, tenantId);

    await this.prisma.supportTicket.updateMany({
      where: { id, tenantId },
      data: updateData,
    });

    return this.findOne(id, tenantId);
  }

  async removeTicket(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    await this.prisma.supportTicket.deleteMany({
      where: { id, tenantId },
    });

    return { id, deleted: true };
  }

  async getStats(tenantId: string) {
    const [total, byStatus, byPriority, byCategory, recent] = await Promise.all([
      this.prisma.supportTicket.count({
        where: { tenantId },
      }),
      this.prisma.supportTicket.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { status: true },
      }),
      this.prisma.supportTicket.groupBy({
        by: ['priority'],
        where: { tenantId },
        _count: { priority: true },
      }),
      this.prisma.supportTicket.groupBy({
        by: ['category'],
        where: { 
          tenantId,
          category: { not: null },
        },
        _count: { category: true },
      }),
      this.prisma.supportTicket.count({
        where: {
          tenantId,
          status: { not: TicketStatus.CLOSED },
        },
      }),
    ]);

    return {
      total,
      open: recent,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      byPriority: byPriority.map(item => ({
        priority: item.priority,
        count: item._count.priority,
      })),
      byCategory: byCategory.map(item => ({
        category: item.category,
        count: item._count.category,
      })),
    };
  }
}
