import { Module, forwardRef } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../../database/prisma.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, PrismaService],
  exports: [InventoryService],
  imports: [forwardRef(() => RolesModule)],
})
export class InventoryModule {}
