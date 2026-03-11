import { NestFactory } from '@nestjs/core';
import { JobsModule } from './jobs/jobs.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(JobsModule);

  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();
