import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './test-app';
import { prisma } from '../setup';

describe('HTTP auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('register + login + me works for a tenant user', async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Auth Tenant',
        slug: `auth-tenant-${Date.now()}`,
        ruc: 'AUTH-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    const email = `user-${Date.now()}@example.com`;
    const password = 'P@ssw0rd123!';

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
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

    expect(loginRes.body).toHaveProperty('accessToken');

    const meRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .expect(200);

    expect(meRes.body).toHaveProperty('user');
    expect(meRes.body.user).toHaveProperty('tenantId', tenant.id);
    expect(meRes.body.user).toHaveProperty('email', email);
  });
});

