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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from './decorators/permissions.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Roles
  @Post()
  @Permissions('roles:create')
  createRole(@Body() createRoleDto: CreateRoleDto, @TenantId() tenantId: string) {
    return this.rolesService.createRole(createRoleDto, tenantId);
  }

  @Get()
  @Permissions('roles:read')
  findAllRoles(@TenantId() tenantId: string) {
    return this.rolesService.findAllRoles(tenantId);
  }

  @Get(':id')
  @Permissions('roles:read')
  findRole(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.rolesService.findRoleById(id, tenantId);
  }

  @Patch(':id')
  @Permissions('roles:update')
  updateRole(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateRoleDto>,
    @TenantId() tenantId: string,
  ) {
    return this.rolesService.updateRole(id, updateData, tenantId);
  }

  @Delete(':id')
  @Permissions('roles:delete')
  removeRole(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.rolesService.removeRole(id, tenantId);
  }

  @Post(':id/permissions')
  @Permissions('roles:update')
  assignPermissions(
    @Param('id') id: string,
    @Body('permissionIds') permissionIds: string[],
    @TenantId() tenantId: string,
  ) {
    return this.rolesService.updateRolePermissions(id, tenantId, permissionIds);
  }

  // Permissions
  @Post('permissions')
  @Permissions('roles:create')
  createPermission(@Body() createPermissionDto: CreatePermissionDto, @TenantId() tenantId: string) {
    return this.rolesService.createPermission(createPermissionDto, tenantId);
  }

  @Get('permissions')
  @Permissions('roles:read')
  findAllPermissions(@TenantId() tenantId: string) {
    return this.rolesService.findAllPermissions(tenantId);
  }

  @Get('permissions/:module')
  @Permissions('roles:read')
  findPermissionsByModule(
    @Param('module') module: string,
    @TenantId() tenantId: string,
  ) {
    return this.rolesService.findPermissionsByModule(tenantId, module);
  }

  @Patch('permissions/:id')
  @Permissions('roles:update')
  updatePermission(
    @Param('id') id: string,
    @Body() updateData: Partial<CreatePermissionDto>,
    @TenantId() tenantId: string,
  ) {
    return this.rolesService.updatePermission(id, updateData, tenantId);
  }

  @Delete('permissions/:id')
  @Permissions('roles:delete')
  removePermission(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.rolesService.removePermission(id, tenantId);
  }

  @Post('initialize')
  @Permissions('roles:create')
  initializeDefaultRoles(@TenantId() tenantId: string) {
    return this.rolesService.initializeDefaultRoles(tenantId);
  }
}
