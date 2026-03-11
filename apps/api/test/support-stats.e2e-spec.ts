import { prisma } from './setup';
import { SupportService } from '../src/modules/support/support.service';

describe('Support stats semantics', () => {
  it('open should count strictly OPEN and active should count non-CLOSED', async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Support Tenant',
        slug: `support-tenant-${Date.now()}`,
        ruc: 'SUP-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    await prisma.supportTicket.createMany({
      data: [
        { tenantId: tenant.id, subject: 'A', description: 'A', status: 'OPEN' },
        { tenantId: tenant.id, subject: 'B', description: 'B', status: 'IN_PROGRESS' },
        { tenantId: tenant.id, subject: 'C', description: 'C', status: 'CLOSED' },
      ],
    });

    const service = new SupportService(prisma as any);
    const stats = await service.getStats(tenant.id);

    expect(stats.open).toBe(1);
    expect(stats.active).toBe(2);
    expect(stats.total).toBe(3);
  });
});
