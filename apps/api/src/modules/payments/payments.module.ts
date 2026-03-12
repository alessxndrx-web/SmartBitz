import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { RolesModule } from '../roles/roles.module';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [RolesModule, PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
