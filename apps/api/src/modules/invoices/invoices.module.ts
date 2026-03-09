import { Module, forwardRef } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../../database/prisma.service';
import { RolesModule } from '../roles/roles.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, PrismaService],
  exports: [InvoicesService],
  imports: [forwardRef(() => RolesModule), InventoryModule],
})
export class InvoicesModule {}
