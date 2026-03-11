import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const isDebugQueryLog = process.env.PRISMA_LOG_QUERIES === 'true' || process.env.NODE_ENV === 'development';

    super({
      log: isDebugQueryLog ? ['query'] : ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
