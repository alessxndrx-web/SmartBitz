import { HealthController } from '../src/modules/health/health.controller';
import { HealthService } from '../src/modules/health/health.service';

describe('HealthController', () => {
  it('returns HTTP 503 when overall health is unhealthy', async () => {
    const healthService = {
      getOverallHealth: jest.fn().mockResolvedValue({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {},
      }),
    } as unknown as HealthService;

    const controller = new HealthController(healthService);
    const res = { status: jest.fn() } as any;

    const body = await controller.check(res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(body.statusCode).toBe(503);
    expect(body.status).toBe('unhealthy');
  });
});
