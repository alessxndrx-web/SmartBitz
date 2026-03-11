import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(@Res({ passthrough: true }) res: Response) {
    const health = await this.healthService.getOverallHealth();
    const statusCode = health.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(statusCode);

    return {
      ...health,
      statusCode,
    };
  }

  @Get('simple')
  async simpleCheck() {
    const health = await this.healthService.getOverallHealth();

    return {
      status: health.status,
      timestamp: health.timestamp,
    };
  }

  @Get('database')
  async databaseCheck() {
    return await this.healthService.checkDatabase();
  }

  @Get('storage')
  async storageCheck() {
    return await this.healthService.checkStorage();
  }

  @Get('server')
  async serverCheck() {
    return await this.healthService.checkServer();
  }
}
