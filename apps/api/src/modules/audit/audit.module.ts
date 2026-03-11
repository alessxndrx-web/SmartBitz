import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './audit.interceptor';
import { RolesModule } from '../roles/roles.module';
import { JobsModule } from '../../jobs/jobs.module';

@Module({
  imports: [RolesModule, JobsModule],
  controllers: [AuditController],
  providers: [AuditService,  AuditInterceptor],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
