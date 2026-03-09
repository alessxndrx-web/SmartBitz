import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async checkDatabase(): Promise<{ status: string; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
      };
    }
  }

  async checkStorage(): Promise<{ status: string; accessible: boolean }> {
    try {
      const storagePath = this.configService.get('storage.local.basePath');
      const testFile = join(storagePath, '.health-check');
      
      // Intentar escribir archivo de prueba
      await fs.writeFile(testFile, 'health-check');
      
      // Intentar leer archivo de prueba
      await fs.readFile(testFile);
      
      // Limpiar archivo de prueba
      await fs.unlink(testFile);
      
      return {
        status: 'healthy',
        accessible: true,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        accessible: false,
      };
    }
  }

  async checkServer(): Promise<{ status: string; uptime: number; memory: any }> {
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      
      return {
        status: 'healthy',
        uptime: Math.floor(uptime),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        uptime: 0,
        memory: {},
      };
    }
  }

  async getOverallHealth() {
    const [database, storage, server] = await Promise.all([
      this.checkDatabase(),
      this.checkStorage(),
      this.checkServer(),
    ]);

    const overallStatus = 
      database.status === 'healthy' && 
      storage.status === 'healthy' && 
      server.status === 'healthy' 
        ? 'healthy' 
        : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database,
        storage,
        server,
      },
    };
  }
}
