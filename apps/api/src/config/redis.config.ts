import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  enabled: process.env.REDIS_ENABLED === 'true',
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  queuePrefix: process.env.REDIS_QUEUE_PREFIX || 'smartbitz',
}));
