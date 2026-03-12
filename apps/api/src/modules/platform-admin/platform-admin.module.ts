import { Module } from '@nestjs/common';
import { PlatformAdminController } from './platform-admin.controller';
import { PlatformAdminService } from './platform-admin.service';
import { RoleGuard } from '../../common/guards/role.guard';

@Module({
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService,  RoleGuard],
})
export class PlatformAdminModule {}
