import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { NOTIFICATIONS_QUEUE, NOTIFY_AUDIT_EVENT_JOB } from '../jobs.constants';

export interface AuditNotificationPayload {
  tenantId: string;
  module: string;
  action: string;
  userId?: string;
  entityId?: string;
  notes?: string;
  createdAt: string;
}

@Injectable()
export class NotificationsQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsQueueService.name);
  private queue: any = null;
  private worker: any = null;

  constructor(@Inject(RedisService) private readonly redisService: RedisService) {}

  onModuleInit() {
    this.initialize();
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }

    if (this.queue) {
      await this.queue.close();
      this.queue = null;
    }
  }

  private initialize() {
    const client = this.redisService.getClient();

    if (!this.redisService.isEnabled() || !client) {
      this.logger.log('Notifications queue disabled because Redis is not enabled/connected.');
      return;
    }

    try {
      const { Queue, Worker } = require('bullmq');

      this.queue = new Queue(NOTIFICATIONS_QUEUE, {
        connection: client,
        prefix: this.redisService.getQueuePrefix(),
        defaultJobOptions: {
          attempts: 3,
          removeOnComplete: true,
        },
      });

      this.worker = new Worker(
        NOTIFICATIONS_QUEUE,
        async (job: any) => {
          this.logger.debug(`Processed job ${job.name} for tenant ${job.data.tenantId}`);
        },
        {
          connection: client,
          prefix: this.redisService.getQueuePrefix(),
        },
      );

      this.worker.on('failed', (job: any, error: Error) => {
        this.logger.error(`Job ${job?.id} failed: ${error.message}`);
      });

      this.logger.log('Notifications queue initialized.');
    } catch (error) {
      this.logger.warn('BullMQ dependency is not installed yet; queue infrastructure is prepared but inactive.');
      this.queue = null;
      this.worker = null;
    }
  }

  async enqueueAuditEvent(payload: AuditNotificationPayload) {
    if (!this.queue) {
      return { queued: false };
    }

    await this.queue.add(NOTIFY_AUDIT_EVENT_JOB, payload);
    return { queued: true };
  }
}
