import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { NotificationsQueueService } from '../../jobs/notifications/notifications-queue.service';

@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationsQueue: NotificationsQueueService,
  ) {}

  private ensureTenantId(tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }
  }


  async createLog(
    createAuditLogDto: CreateAuditLogDto,
    tenantId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    this.ensureTenantId(tenantId);
    return this.prisma.auditLog.create({
      data: {
        ...createAuditLogDto,
        tenantId,
        userId,
        ipAddress,
        userAgent,
      },
    });
  }

  async logAction(
    module: string,
    action: string,
    tenantId: string,
    userId?: string,
    entityId?: string,
    entityType?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
    notes?: string,
  ) {
    this.ensureTenantId(tenantId);

    const log = await this.createLog(
      {
        module,
        action,
        entityId,
        entityType,
        oldValues: oldValues ? JSON.stringify(oldValues) : undefined,
        newValues: newValues ? JSON.stringify(newValues) : undefined,
        notes,
      },
      tenantId,
      userId,
      ipAddress,
      userAgent,
    );

    void this.notificationsQueue.enqueueAuditEvent({
      tenantId,
      module,
      action,
      userId,
      entityId,
      notes,
      createdAt: new Date().toISOString(),
    });

    return log;
  }

  async findAll(tenantId: string) {
    this.ensureTenantId(tenantId);
    return this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 logs for performance
    });
  }

  async findByModule(tenantId: string, module: string) {
    this.ensureTenantId(tenantId);
    return this.prisma.auditLog.findMany({
      where: { tenantId, module },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findByEntity(tenantId: string, entityType: string, entityId: string) {
    this.ensureTenantId(tenantId);
    return this.prisma.auditLog.findMany({
      where: { tenantId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findByUser(tenantId: string, userId: string) {
    this.ensureTenantId(tenantId);
    return this.prisma.auditLog.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findRecent(tenantId: string, hours: number = 24) {
    this.ensureTenantId(tenantId);
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: since,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async getStats(tenantId: string) {
    this.ensureTenantId(tenantId);
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const [total, recent, byModule] = await Promise.all([
      this.prisma.auditLog.count({
        where: { tenantId },
      }),
      this.prisma.auditLog.count({
        where: {
          tenantId,
          createdAt: {
            gte: since,
          },
        },
      }),
      this.prisma.auditLog.groupBy({
        by: ['module'],
        where: {
          tenantId,
          createdAt: {
            gte: since,
          },
        },
        _count: {
          module: true,
        },
        orderBy: {
          _count: {
            module: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      total,
      recent,
      byModule: byModule.map(item => ({
        module: item.module,
        count: item._count.module,
      })),
    };
  }

  // Cleanup old logs (could be called by a cron job)
  async cleanupOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result;
  }
}
