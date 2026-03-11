import { Module, forwardRef } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
  imports: [forwardRef(() => RolesModule)],
})
export class TenantsModule {}