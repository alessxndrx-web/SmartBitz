import { Module, forwardRef } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
  imports: [forwardRef(() => AuthModule)],
})
export class RolesModule {}
