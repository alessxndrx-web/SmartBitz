import { Module, forwardRef } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
  imports: [forwardRef(() => RolesModule)],
})
export class PurchasesModule {}
