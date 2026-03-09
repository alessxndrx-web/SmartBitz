import { Controller, Get, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    const health = await this.healthService.getOverallHealth();
    
    return {
      ...health,
      statusCode: health.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
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
