import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './test-app';
import { prisma } from '../setup';
import { signTestJwt } from '../helpers/jwt';

describe('HTTP guards and platform-admin boundaries', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should allow platform_admin and deny tenant users on /api/platform-admin/overview', async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Platform Tenant',
        slug: `platform-tenant-${Date.now()}`,
        ruc: 'PLAT-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    const adminEmail = `platform-admin-${Date.now()}@example.com`;
    const staffEmail = `staff-${Date.now()}@example.com`;
    const password = 'P@ssw0rd123!';

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        fullName: 'Platform Admin',
        email: adminEmail,
        password,
        role: 'platform_admin',
        tenantSlug: tenant.slug,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        fullName: 'Staff User',
        email: staffEmail,
        password,
        role: 'staff',
        tenantSlug: tenant.slug,
      })
      .expect(201);

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password })
      .expect(201);

    const staffLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: staffEmail, password })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/platform-admin/overview')
      .set('Authorization', `Bearer ${adminLogin.body.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/platform-admin/overview')
      .set('Authorization', `Bearer ${staffLogin.body.accessToken}`)
      .expect(403);
  });

  it('should reject requests without tenant context on tenant-scoped modules', async () => {
    const tokenWithoutTenant = signTestJwt({
      userId: 'user-without-tenant',
      email: 'notenant@example.com',
      role: 'staff',
    });

    await request(app.getHttpServer())
      .get('/api/payments')
      .set('Authorization', `Bearer ${tokenWithoutTenant}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/api/support')
      .set('Authorization', `Bearer ${tokenWithoutTenant}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/api/files')
      .set('Authorization', `Bearer ${tokenWithoutTenant}`)
      .expect(401);
  });
});
