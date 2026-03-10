import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PlatformAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [tenants, activeTenants, users, activeUsers, invoices, paidInvoices, openTickets, inProgressTickets] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.invoice.count(),
      this.prisma.invoice.count({ where: { status: 'paid' } }),
      this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
    ]);

    const byPlan = await this.prisma.tenant.groupBy({
      by: ['subscriptionPlan'],
      _count: { _all: true },
    });

    return {
      generatedAt: new Date().toISOString(),
      totals: {
        tenants,
        activeTenants,
        users,
        activeUsers,
        invoices: {
          total: invoices,
          paid: paidInvoices,
          pending: Math.max(invoices - paidInvoices, 0),
        },
        supportTickets: {
          open: openTickets,
          inProgress: inProgressTickets,
          totalActive: openTickets + inProgressTickets,
        },
      },
      subscriptions: byPlan.map((item) => ({
        plan: item.subscriptionPlan,
        count: item._count._all,
      })),
    };
  }
}
