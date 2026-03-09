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
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, CreateInventoryMovementDto } from './dto/create-inventory-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../roles/guards/permissions.guard';
import { Permissions } from '../roles/decorators/permissions.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Categories
  @Post('categories')
  @Permissions('inventory:create')
  createCategory(@Body() createCategoryDto: CreateCategoryDto, @TenantId() tenantId: string) {
    return this.inventoryService.createCategory(createCategoryDto, tenantId);
  }

  @Get('categories')
  @Permissions('inventory:read')
  findAllCategories(@TenantId() tenantId: string) {
    return this.inventoryService.findAllCategories(tenantId);
  }

  @Patch('categories/:id')
  @Permissions('inventory:update')
  updateCategory(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateCategoryDto>,
    @TenantId() tenantId: string,
  ) {
    return this.inventoryService.updateCategory(id, updateData, tenantId);
  }

  @Delete('categories/:id')
  @Permissions('inventory:delete')
  removeCategory(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.inventoryService.removeCategory(id, tenantId);
  }

  // Items
  @Post('items')
  @Permissions('inventory:create')
  createItem(@Body() createInventoryItemDto: CreateInventoryItemDto, @TenantId() tenantId: string) {
    return this.inventoryService.createItem(createInventoryItemDto, tenantId);
  }

  @Get('items')
  @Permissions('inventory:read')
  findAllItems(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.inventoryService.findAllItems(
      tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      categoryId,
    );
  }

  @Get('items/low-stock')
  @Permissions('inventory:read')
  getLowStockItems(@TenantId() tenantId: string) {
    return this.inventoryService.getLowStockItems(tenantId);
  }

  @Get('items/stats')
  @Permissions('inventory:read')
  getStats(@TenantId() tenantId: string) {
    return this.inventoryService.getStats(tenantId);
  }

  @Get('items/:id')
  @Permissions('inventory:read')
  findOneItem(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.inventoryService.findOneItem(id, tenantId);
  }

  @Patch('items/:id')
  @Permissions('inventory:update')
  updateItem(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateInventoryItemDto>,
    @TenantId() tenantId: string,
  ) {
    return this.inventoryService.updateItem(id, updateData, tenantId);
  }

  @Delete('items/:id')
  @Permissions('inventory:delete')
  removeItem(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.inventoryService.removeItem(id, tenantId);
  }

  // Movements
  @Post('movements')
  @Permissions('inventory:update')
  createMovement(@Body() createMovementDto: CreateInventoryMovementDto, @TenantId() tenantId: string) {
    return this.inventoryService.createMovement(createMovementDto, tenantId);
  }

  @Get('movements/:itemId')
  @Permissions('inventory:read')
  findMovements(
    @Param('itemId') itemId: string,
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.findMovements(
      itemId,
      tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
