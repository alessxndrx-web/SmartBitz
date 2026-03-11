import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestApp } from './test-app';
import { prisma } from '../setup';

const MODULES = ['payments', 'support', 'files', 'inventory', 'invoices', 'purchases'] as const;

async function seedStaffReadPermissions(tenantId: string) {
  const role = await prisma.role.upsert({
    where: { id: `${tenantId}-staff-role` },
    update: { isActive: true },
    create: {
      id: `${tenantId}-staff-role`,
      tenantId,
      name: 'staff',
      description: 'staff',
    },
  });

  const permissions = await Promise.all(
    MODULES.map((module) =>
      prisma.permission.create({
        data: {
          tenantId,
          name: `${module}:read`,
          module,
          action: 'read',
        },
      }),
    ),
  );

  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
    })),
  });
}

async function registerAndLogin(app: INestApplication, tenantSlug: string, email: string, role: 'staff' | 'tenant_admin' = 'staff') {
  const password = 'P@ssw0rd123!';

  await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({
      fullName: 'Test User',
      email,
      password,
      role,
      tenantSlug,
    })
    .expect(201);

  const login = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(201);

  return login.body.accessToken as string;
}

describe('Tenant modules access and isolation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should allow authenticated tenant user with read permissions to access module list endpoints', async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Tenant Access A',
        slug: `tenant-access-a-${Date.now()}`,
        ruc: 'TA-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    await seedStaffReadPermissions(tenant.id);

    const token = await registerAndLogin(
      app,
      tenant.slug,
      `reader-${Date.now()}@example.com`,
      'staff',
    );

    await request(app.getHttpServer()).get('/api/payments').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/api/support').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/api/files').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/api/inventory/items').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/api/invoices').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/api/purchases').set('Authorization', `Bearer ${token}`).expect(200);
  });

  it('should reject requests without tenant context on tenant-scoped module endpoints', async () => {
    const tokenWithoutTenant = new JwtService({ secret: 'dev-jwt-secret' }).sign({
      sub: 'user-without-tenant',
      userId: 'user-without-tenant',
      email: 'notenant@example.com',
      role: 'staff',
    });

    await request(app.getHttpServer()).get('/api/payments').set('Authorization', `Bearer ${tokenWithoutTenant}`).expect(403);
    await request(app.getHttpServer()).get('/api/support').set('Authorization', `Bearer ${tokenWithoutTenant}`).expect(403);
    await request(app.getHttpServer()).get('/api/files').set('Authorization', `Bearer ${tokenWithoutTenant}`).expect(403);
    await request(app.getHttpServer()).get('/api/inventory/items').set('Authorization', `Bearer ${tokenWithoutTenant}`).expect(403);
    await request(app.getHttpServer()).get('/api/invoices').set('Authorization', `Bearer ${tokenWithoutTenant}`).expect(403);
    await request(app.getHttpServer()).get('/api/purchases').set('Authorization', `Bearer ${tokenWithoutTenant}`).expect(403);
  });

  it('should keep tenant data isolated and enforce permission boundaries', async () => {
    const tenantA = await prisma.tenant.create({
      data: {
        name: 'Tenant Isolated A',
        slug: `tenant-isolated-a-${Date.now()}`,
        ruc: 'TIA-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    const tenantB = await prisma.tenant.create({
      data: {
        name: 'Tenant Isolated B',
        slug: `tenant-isolated-b-${Date.now()}`,
        ruc: 'TIB-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    await seedStaffReadPermissions(tenantA.id);
    await seedStaffReadPermissions(tenantB.id);

    const customerA = await prisma.customer.create({
      data: { tenantId: tenantA.id, fullName: 'Customer A' },
    });

    const invoiceA = await prisma.invoice.create({
      data: {
        tenantId: tenantA.id,
        number: `INV-${Date.now()}`,
        customerId: customerA.id,
        subtotal: 100,
        tax: 0,
        total: 100,
        status: 'sent',
        items: { create: [{ description: 'Service', quantity: 1, unitPrice: 100, total: 100 }] },
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

    const itemA = await prisma.inventoryItem.create({
      data: {
        tenantId: tenantA.id,
        name: 'Item A',
        quantity: 10,
        unitCost: 5,
      },
    });

    const supplierA = await prisma.supplier.create({
      data: {
        tenantId: tenantA.id,
        name: 'Supplier A',
      },
    });

    await prisma.purchase.create({
      data: {
        tenantId: tenantA.id,
        supplierId: supplierA.id,
        number: `PUR-${Date.now()}`,
        subtotal: 10,
        tax: 0,
        total: 10,
        items: {
          create: [{ itemId: itemA.id, quantity: 1, unitCost: 10, total: 10 }],
        },
      },
    });

    await prisma.supportTicket.create({
      data: {
        tenantId: tenantA.id,
        subject: 'Ticket A',
        description: 'Issue A',
        status: 'OPEN',
      },
    });

    await prisma.file.create({
      data: {
        tenantId: tenantA.id,
        filename: 'f-a.txt',
        originalName: 'f-a.txt',
        mimeType: 'text/plain',
        size: 12,
        path: `${tenantA.id}/f-a.txt`,
      },
    });

    const tokenB = await registerAndLogin(app, tenantB.slug, `isolated-b-${Date.now()}@example.com`, 'staff');

    const paymentsRes = await request(app.getHttpServer()).get('/api/payments').set('Authorization', `Bearer ${tokenB}`).expect(200);
    expect(paymentsRes.body.total).toBe(0);

    const invoicesRes = await request(app.getHttpServer()).get('/api/invoices').set('Authorization', `Bearer ${tokenB}`).expect(200);
    expect(invoicesRes.body.total).toBe(0);

    const inventoryRes = await request(app.getHttpServer()).get('/api/inventory/items').set('Authorization', `Bearer ${tokenB}`).expect(200);
    expect(inventoryRes.body.total).toBe(0);

    const purchasesRes = await request(app.getHttpServer()).get('/api/purchases').set('Authorization', `Bearer ${tokenB}`).expect(200);
    expect(purchasesRes.body.total).toBe(0);

    const supportRes = await request(app.getHttpServer()).get('/api/support').set('Authorization', `Bearer ${tokenB}`).expect(200);
    expect(Array.isArray(supportRes.body)).toBe(true);
    expect(supportRes.body).toHaveLength(0);

    const filesRes = await request(app.getHttpServer()).get('/api/files').set('Authorization', `Bearer ${tokenB}`).expect(200);
    expect(Array.isArray(filesRes.body)).toBe(true);
    expect(filesRes.body).toHaveLength(0);

    // Permission boundary: tenant_admin in tenant B has no payments:read by default matrix
    const tokenTenantAdminB = await registerAndLogin(
      app,
      tenantB.slug,
      `tenant-admin-b-${Date.now()}@example.com`,
      'tenant_admin',
    );

    await request(app.getHttpServer())
      .get('/api/payments')
      .set('Authorization', `Bearer ${tokenTenantAdminB}`)
      .expect(403);
  });
});
