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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../roles/guards/permissions.guard';
import { Permissions } from '../roles/decorators/permissions.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Permissions('customers:create')
  create(@Body() createCustomerDto: CreateCustomerDto, @TenantId() tenantId: string) {
    return this.customersService.create(createCustomerDto, tenantId);
  }

  @Get()
  @Permissions('customers:read')
  findAll(@Query() query: QueryCustomerDto, @TenantId() tenantId: string) {
    return this.customersService.findAll(query, tenantId);
  }

  @Get(':id')
  @Permissions('customers:read')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.customersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Permissions('customers:update')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @TenantId() tenantId: string,
  ) {
    return this.customersService.update(id, updateCustomerDto, tenantId);
  }

  @Delete(':id')
  @Permissions('customers:delete')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.customersService.remove(id, tenantId);
  }

  @Get('search/:term')
  @Permissions('customers:read')
  search(@Param('term') term: string, @TenantId() tenantId: string) {
    return this.customersService.findAll(
      { search: term, limit: '20' },
      tenantId,
    );
  }
}
