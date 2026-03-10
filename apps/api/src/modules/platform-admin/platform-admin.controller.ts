import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PlatformAdminService } from './platform-admin.service';

@Controller('platform-admin')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('platform_admin')
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

  @Get('overview')
  getOverview() {
    return this.platformAdminService.getOverview();
  }
}
