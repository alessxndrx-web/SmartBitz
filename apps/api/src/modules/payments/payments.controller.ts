import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../roles/guards/permissions.guard';
import { Permissions } from '../roles/decorators/permissions.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Permissions('payments:create')
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @TenantId() tenantId: string,
  ) {
    return this.paymentsService.create(createPaymentDto, tenantId);
  }

  @Get()
  @Permissions('payments:read')
  findAll(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('invoiceId') invoiceId?: string,
  ) {
    return this.paymentsService.findAll(
      tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      invoiceId,
    );
  }

  @Get('invoice/:invoiceId')
  @Permissions('payments:read')
  getInvoicePayments(
    @Param('invoiceId') invoiceId: string,
    @TenantId() tenantId: string,
  ) {
    return this.paymentsService.getInvoicePayments(invoiceId, tenantId);
  }

  @Get('stats')
  @Permissions('payments:read')
  getStats(@TenantId() tenantId: string) {
    return this.paymentsService.getStats(tenantId);
  }

  @Get(':id')
  @Permissions('payments:read')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.paymentsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Permissions('payments:update')
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @TenantId() tenantId: string,
  ) {
    return this.paymentsService.update(id, updatePaymentDto, tenantId);
  }

  @Delete(':id')
  @Permissions('payments:delete')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.paymentsService.remove(id, tenantId);
  }
}
