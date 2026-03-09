import { Module, forwardRef } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { PrismaService } from '../../database/prisma.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  controllers: [PurchasesController],
  providers: [PurchasesService, PrismaService],
  exports: [PurchasesService],
  imports: [forwardRef(() => RolesModule)],
})
export class PurchasesModule {}
