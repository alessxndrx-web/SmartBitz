import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './test-app';
import { prisma } from '../setup';
import { createTenant, seedRoleWithPermissions } from '../helpers/factories';

describe('HTTP customers (auth + permissions + tenant isolation)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should allow create/list customers when permission is granted', async () => {
    const tenant = await createTenant(prisma, 'Cust Tenant');

    await seedRoleWithPermissions(prisma, {
      tenantId: tenant.id,
      roleName: 'staff',
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
        role: 'staff',
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
    const tenant = await createTenant(prisma, 'NoPerm Tenant');

    // operator has only read, no create
    await seedRoleWithPermissions(prisma, {
      tenantId: tenant.id,
      roleName: 'staff',
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
        role: 'staff',
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
    const tenantA = await createTenant(prisma, 'Tenant A');
    const tenantB = await createTenant(prisma, 'Tenant B');

    await seedRoleWithPermissions(prisma, {
      tenantId: tenantA.id,
      roleName: 'staff',
      permissions: [{ module: 'customers', action: 'read' }],
    });
    await seedRoleWithPermissions(prisma, {
      tenantId: tenantB.id,
      roleName: 'staff',
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
        role: 'staff',
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

