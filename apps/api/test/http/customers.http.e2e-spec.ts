import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './test-app';
import { prisma } from '../setup';

async function seedRoleWithPermissions(params: {
  tenantId: string;
  roleName: string;
  permissions: Array<{ module: string; action: string; name?: string }>;
}) {
  const perms = await Promise.all(
    params.permissions.map((p) =>
      prisma.permission.create({
        data: {
          tenantId: params.tenantId,
          name: p.name || `${p.module}:${p.action}`,
          module: p.module,
          action: p.action,
        },
      }),
    ),
  );

  const role = await prisma.role.create({
    data: {
      tenantId: params.tenantId,
      name: params.roleName,
      description: params.roleName,
    },
  });

  await prisma.rolePermission.createMany({
    data: perms.map((perm) => ({ roleId: role.id, permissionId: perm.id })),
  });

  return { role, perms };
}

describe('HTTP customers (auth + permissions + tenant isolation)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should allow create/list customers when permission is granted', async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Cust Tenant',
        slug: `cust-tenant-${Date.now()}`,
        ruc: 'CUST-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    await seedRoleWithPermissions({
      tenantId: tenant.id,
      roleName: 'operator',
      permissions: [
        { module: 'customers', action: 'create' },
        { module: 'customers', action: 'read' },
      ],
    });

    const email = `cust-user-${Date.now()}@example.com`;
    const password = 'P@ssw0rd123!';

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        fullName: 'Cust User',
        email,
        password,
        role: 'operator',
        tenantSlug: tenant.slug,
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);

    const token = loginRes.body.accessToken as string;

    const created = await request(app.getHttpServer())
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Cliente Uno', email: 'cliente1@example.com' })
      .expect(201);

    expect(created.body).toHaveProperty('id');
    expect(created.body).toHaveProperty('tenantId', tenant.id);

    const list = await request(app.getHttpServer())
      .get('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body).toHaveProperty('customers');
    expect(Array.isArray(list.body.customers)).toBe(true);
    expect(list.body.customers.length).toBe(1);
    expect(list.body.customers[0].tenantId).toBe(tenant.id);
  });

  it('should forbid access without required permission', async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'NoPerm Tenant',
        slug: `noperm-tenant-${Date.now()}`,
        ruc: 'NP-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    // operator has only read, no create
    await seedRoleWithPermissions({
      tenantId: tenant.id,
      roleName: 'operator',
      permissions: [{ module: 'customers', action: 'read' }],
    });

    const email = `noperm-${Date.now()}@example.com`;
    const password = 'P@ssw0rd123!';

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        fullName: 'NoPerm User',
        email,
        password,
        role: 'operator',
        tenantSlug: tenant.slug,
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);

    const token = loginRes.body.accessToken as string;

    await request(app.getHttpServer())
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Cliente Bloqueado' })
      .expect(403);
  });

  it('should not allow cross-tenant access to customer by id', async () => {
    const tenantA = await prisma.tenant.create({
      data: {
        name: 'Tenant A',
        slug: `tA-${Date.now()}`,
        ruc: 'TA-1',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });
    const tenantB = await prisma.tenant.create({
      data: {
        name: 'Tenant B',
        slug: `tB-${Date.now()}`,
        ruc: 'TB-1',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    await seedRoleWithPermissions({
      tenantId: tenantA.id,
      roleName: 'operator',
      permissions: [{ module: 'customers', action: 'read' }],
    });
    await seedRoleWithPermissions({
      tenantId: tenantB.id,
      roleName: 'operator',
      permissions: [{ module: 'customers', action: 'read' }],
    });

    const customerA = await prisma.customer.create({
      data: { tenantId: tenantA.id, fullName: 'Customer A' },
    });

    const emailB = `userb-${Date.now()}@example.com`;
    const passwordB = 'P@ssw0rd123!';

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        fullName: 'User B',
        email: emailB,
        password: passwordB,
        role: 'operator',
        tenantSlug: tenantB.slug,
      })
      .expect(201);

    const loginResB = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: emailB, password: passwordB })
      .expect(201);

    const tokenB = loginResB.body.accessToken as string;

    await request(app.getHttpServer())
      .get(`/api/customers/${customerA.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });
});

