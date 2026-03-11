import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import redisConfig from '../../config/redis.config';

type RedisLikeClient = {
  connect: () => Promise<void>;
  quit: () => Promise<void>;
  on: (event: string, cb: (error: Error) => void) => void;
};

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisLikeClient | null = null;

  constructor(
    @Inject(redisConfig.KEY)
    private readonly cfg: ConfigType<typeof redisConfig>,
  ) {}

  async onModuleInit() {
    if (!this.cfg.enabled) {
      this.logger.log('Redis disabled (REDIS_ENABLED=false).');
      return;
    }

    try {
      const { default: Redis } = require('ioredis');
      this.client = new Redis(this.cfg.url, {
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
        lazyConnect: true,
      });

      this.client.on('error', (error: Error) => {
        this.logger.error(`Redis error: ${error.message}`);
      });

      await this.client.connect();
      this.logger.log('Redis connected.');
    } catch (error) {
      this.logger.warn('Redis dependencies are not installed yet; infrastructure is configured but inactive.');
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  isEnabled() {
    return this.cfg.enabled;
  }

  getUrl() {
    return this.cfg.url;
  }

  getQueuePrefix() {
    return this.cfg.queuePrefix;
  }

  getClient() {
    return this.client;
  }
}
