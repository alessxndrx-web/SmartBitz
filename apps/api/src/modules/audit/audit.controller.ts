import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../roles/guards/permissions.guard';
import { Permissions } from '../roles/decorators/permissions.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Permissions('audit:read')
  findAll(@TenantId() tenantId: string) {
    return this.auditService.findAll(tenantId);
  }

  @Get('recent')
  @Permissions('audit:read')
  findRecent(@TenantId() tenantId: string, @Query('hours') hours?: number) {
    return this.auditService.findRecent(tenantId, hours);
  }

  @Get('module/:module')
  @Permissions('audit:read')
  findByModule(@TenantId() tenantId: string, @Param('module') module: string) {
    return this.auditService.findByModule(tenantId, module);
  }

  @Get('entity/:entityType/:entityId')
  @Permissions('audit:read')
  findByEntity(
    @TenantId() tenantId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(tenantId, entityType, entityId);
  }

  @Get('user/:userId')
  @Permissions('audit:read')
  findByUser(@TenantId() tenantId: string, @Param('userId') userId: string) {
    return this.auditService.findByUser(tenantId, userId);
  }

  @Get('stats')
  @Permissions('audit:read')
  getStats(@TenantId() tenantId: string) {
    return this.auditService.getStats(tenantId);
  }
}
