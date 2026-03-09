import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      ok: true,
      service: 'smartbitz-api',
      timestamp: new Date().toISOString(),
    };
  }
}