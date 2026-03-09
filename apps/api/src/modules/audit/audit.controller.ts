import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.auditService.findAll(tenantId);
  }

  @Get('recent')
  findRecent(@TenantId() tenantId: string, @Query('hours') hours?: number) {
    return this.auditService.findRecent(tenantId, hours);
  }

  @Get('module/:module')
  findByModule(@TenantId() tenantId: string, @Query('module') module: string) {
    return this.auditService.findByModule(tenantId, module);
  }

  @Get('entity/:entityType/:entityId')
  findByEntity(
    @TenantId() tenantId: string,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(tenantId, entityType, entityId);
  }

  @Get('user/:userId')
  findByUser(@TenantId() tenantId: string, @Query('userId') userId: string) {
    return this.auditService.findByUser(tenantId, userId);
  }

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.auditService.getStats(tenantId);
  }
}
