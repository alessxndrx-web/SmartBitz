import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './test-app';

describe('HTTP /health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/health/simple should respond with status + timestamp', async () => {
    const res = await request(app.getHttpServer()).get('/api/health/simple').expect(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
  });



  it('GET /api/health should return matching http status and payload statusCode', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('statusCode', res.status);
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/healthz should respond with ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/healthz').expect(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('service', 'smartbitz-api');
  });
});

