import { Module, forwardRef } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { PrismaService } from '../../database/prisma.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  controllers: [SupportController],
  providers: [SupportService, PrismaService],
  exports: [SupportService],
  imports: [forwardRef(() => RolesModule)],
})
export class SupportModule {}
