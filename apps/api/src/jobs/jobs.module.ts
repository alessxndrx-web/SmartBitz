import { Module } from '@nestjs/common';
import { RedisModule } from '../infrastructure/redis/redis.module';
import { NotificationsQueueService } from './notifications/notifications-queue.service';

@Module({
  imports: [RedisModule],
  providers: [NotificationsQueueService],
  exports: [NotificationsQueueService],
})
export class JobsModule {}
