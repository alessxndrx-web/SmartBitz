import { Module, forwardRef } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
  imports: [forwardRef(() => RolesModule)],
})
export class SupportModule {}
