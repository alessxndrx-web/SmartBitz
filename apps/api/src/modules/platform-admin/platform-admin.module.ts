import { Module } from '@nestjs/common';
import { PlatformAdminController } from './platform-admin.controller';
import { PlatformAdminService } from './platform-admin.service';
import { PrismaService } from '../../database/prisma.service';
import { RoleGuard } from '../../common/guards/role.guard';

@Module({
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService, PrismaService, RoleGuard],
})
export class PlatformAdminModule {}
