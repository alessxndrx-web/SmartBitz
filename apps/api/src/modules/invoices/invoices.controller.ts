import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../roles/guards/permissions.guard';
import { Permissions } from '../roles/decorators/permissions.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Permissions('invoices:create')
  create(@Body() createInvoiceDto: CreateInvoiceDto, @TenantId() tenantId: string) {
    return this.invoicesService.create(createInvoiceDto, tenantId);
  }

  @Get()
  @Permissions('invoices:read')
  findAll(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.invoicesService.findAll(
      tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
    );
  }

  @Get('stats')
  @Permissions('invoices:read')
  getStats(@TenantId() tenantId: string) {
    return this.invoicesService.getStats(tenantId);
  }

  @Get(':id')
  @Permissions('invoices:read')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.invoicesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Permissions('invoices:update')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @TenantId() tenantId: string,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto, tenantId);
  }

  @Delete(':id')
  @Permissions('invoices:delete')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.invoicesService.remove(id, tenantId);
  }
}
