import { Module, forwardRef } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
  imports: [forwardRef(() => RolesModule)],
})
export class CustomersModule {}
