import { prisma } from './setup';

describe('Tenant isolation (data-level)', () => {
  it('should not leak customers/inventory across tenants', async () => {
    const tenantA = await prisma.tenant.create({
      data: {
        name: 'Tenant A',
        slug: `tenant-a-${Date.now()}`,
        ruc: 'A-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    const tenantB = await prisma.tenant.create({
      data: {
        name: 'Tenant B',
        slug: `tenant-b-${Date.now()}`,
        ruc: 'B-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    const customerA = await prisma.customer.create({
      data: {
        tenantId: tenantA.id,
        fullName: 'Customer A',
        email: 'a@example.com',
      },
    });

    const itemA = await prisma.inventoryItem.create({
      data: {
        tenantId: tenantA.id,
        name: 'Item A',
        sku: 'SKU-A',
        quantity: 10,
        unitCost: 5,
      },
    });

    // Same IDs cannot be fetched when scoping by another tenantId
    const crossCustomer = await prisma.customer.findFirst({
      where: { id: customerA.id, tenantId: tenantB.id },
    });
    expect(crossCustomer).toBeNull();

    const crossItem = await prisma.inventoryItem.findFirst({
      where: { id: itemA.id, tenantId: tenantB.id },
    });
    expect(crossItem).toBeNull();

    // Tenant-scoped collections should be isolated
    const tenantBCustomers = await prisma.customer.findMany({
      where: { tenantId: tenantB.id },
    });
    expect(tenantBCustomers).toHaveLength(0);

    const tenantBItems = await prisma.inventoryItem.findMany({
      where: { tenantId: tenantB.id },
    });
    expect(tenantBItems).toHaveLength(0);
  });

  it('should not allow invoices/payments to be queried cross-tenant via invoice relation', async () => {
    const tenantA = await prisma.tenant.create({
      data: {
        name: 'Tenant A2',
        slug: `tenant-a2-${Date.now()}`,
        ruc: 'A2-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    const tenantB = await prisma.tenant.create({
      data: {
        name: 'Tenant B2',
        slug: `tenant-b2-${Date.now()}`,
        ruc: 'B2-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    const customerA = await prisma.customer.create({
      data: {
        tenantId: tenantA.id,
        fullName: 'Customer A2',
      },
    });

    const invoiceA = await prisma.invoice.create({
      data: {
        tenantId: tenantA.id,
        number: `000001`,
        customerId: customerA.id,
        subtotal: 100,
        tax: 0,
        total: 100,
        status: 'sent',
        items: {
          create: [
            {
              description: 'Service',
              quantity: 1,
              unitPrice: 100,
              total: 100,
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        invoiceId: invoiceA.id,
        amount: 50,
        method: 'cash',
        status: 'completed',
      },
    });

    // Payment must not be visible when querying via invoice.tenantId = tenantB
    const paymentsTenantB = await prisma.payment.findMany({
      where: { invoice: { tenantId: tenantB.id } },
    });
    expect(paymentsTenantB).toHaveLength(0);

    // Invoice must not be found under wrong tenantId scope
    const crossInvoice = await prisma.invoice.findFirst({
      where: { id: invoiceA.id, tenantId: tenantB.id },
    });
    expect(crossInvoice).toBeNull();
  });
});

