import { Controller, Get, Post, Body, Patch, Param, Query, Delete, UseGuards } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { ReceivePurchaseDto } from './dto/receive-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { PermissionsGuard } from '../roles/guards/permissions.guard';
import { Permissions } from '../roles/decorators/permissions.decorator';

@Controller('purchases')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  // Suppliers
  @Post('suppliers')
  @Permissions('purchases:create')
  createSupplier(@Body() createSupplierDto: CreateSupplierDto, @TenantId() tenantId: string) {
    return this.purchasesService.createSupplier(createSupplierDto, tenantId);
  }

  @Get('suppliers')
  @Permissions('purchases:read')
  findAllSuppliers(@TenantId() tenantId: string) {
    return this.purchasesService.findAllSuppliers(tenantId);
  }

  @Patch('suppliers/:id')
  @Permissions('purchases:update')
  updateSupplier(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateSupplierDto>,
    @TenantId() tenantId: string,
  ) {
    return this.purchasesService.updateSupplier(id, updateData, tenantId);
  }

  @Delete('suppliers/:id')
  @Permissions('purchases:delete')
  removeSupplier(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.purchasesService.removeSupplier(id, tenantId);
  }

  // Purchases
  @Post()
  @Permissions('purchases:create')
  createPurchase(@Body() createPurchaseDto: CreatePurchaseDto, @TenantId() tenantId: string) {
    return this.purchasesService.createPurchase(createPurchaseDto, tenantId);
  }

  @Get()
  @Permissions('purchases:read')
  findAllPurchases(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.purchasesService.findAllPurchases(
      tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
    );
  }

  @Get('stats')
  @Permissions('purchases:read')
  getStats(@TenantId() tenantId: string) {
    return this.purchasesService.getStats(tenantId);
  }

  @Get(':id')
  @Permissions('purchases:read')
  findOnePurchase(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.purchasesService.findOnePurchase(id, tenantId);
  }

  @Patch(':id')
  @Permissions('purchases:update')
  updatePurchase(
    @Param('id') id: string,
    @Body() updateData: Partial<CreatePurchaseDto>,
    @TenantId() tenantId: string,
  ) {
    return this.purchasesService.updatePurchase(id, updateData, tenantId);
  }

  @Post(':id/receive')
  @Permissions('purchases:update')
  receivePurchase(
    @Param('id') id: string,
    @Body() receivePurchaseDto: ReceivePurchaseDto,
    @TenantId() tenantId: string,
  ) {
    return this.purchasesService.receivePurchase(id, receivePurchaseDto, tenantId);
  }

  @Post(':id/cancel')
  @Permissions('purchases:update')
  cancelPurchase(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.purchasesService.cancelPurchase(id, tenantId);
  }
}
