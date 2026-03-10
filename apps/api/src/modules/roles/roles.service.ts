import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // Roles
  async createRole(createRoleDto: CreateRoleDto, tenantId: string) {
    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        tenantId,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Assign permissions if provided
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      return this.assignPermissionsToRole(role.id, tenantId, createRoleDto.permissionIds);
    }

    return this.findRoleById(role.id, tenantId);
  }

  async findAllRoles(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenantId, isActive: true },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { rolePermissions: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findRoleById(id: string, tenantId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async updateRole(id: string, updateData: Partial<CreateRoleDto>, tenantId: string) {
    await this.findRoleById(id, tenantId);

    const { permissionIds, ...roleData } = updateData;

    // Update role basic info
    await this.prisma.role.updateMany({
      where: { id, tenantId },
      data: roleData,
    });

    // Update permissions if provided
    if (permissionIds !== undefined) {
      await this.updateRolePermissions(id, tenantId, permissionIds);
    }

    return this.findRoleById(id, tenantId);
  }

  async removeRole(id: string, tenantId: string) {
    await this.findRoleById(id, tenantId);

    await this.prisma.role.updateMany({
      where: { id, tenantId },
      data: { isActive: false },
    });

    return { id, deleted: true };
  }

  async assignPermissionsToRole(roleId: string, tenantId: string, permissionIds: string[]) {
    await this.findRoleById(roleId, tenantId);

    const validPermissions = await this.prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
        tenantId,
        isActive: true,
      },
      select: { id: true },
    });

    if (validPermissions.length !== new Set(permissionIds).size) {
      throw new NotFoundException('One or more permissions were not found for this tenant');
    }

    const rolePermissions = permissionIds.map(permissionId => ({
      roleId,
      permissionId,
    }));

    await this.prisma.rolePermission.createMany({
      data: rolePermissions,
    });

    return this.findRoleById(roleId, tenantId);
  }

  async updateRolePermissions(roleId: string, tenantId: string, permissionIds: string[]) {
    // Remove existing permissions
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Assign new permissions
    if (permissionIds.length > 0) {
      await this.assignPermissionsToRole(roleId, tenantId, permissionIds);
    }

    return this.findRoleById(roleId, tenantId);
  }

  // Permissions
  async createPermission(createPermissionDto: CreatePermissionDto, tenantId: string) {
    return this.prisma.permission.create({
      data: {
        ...createPermissionDto,
        tenantId,
      },
    });
  }

  async findAllPermissions(tenantId: string) {
    return this.prisma.permission.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  async findPermissionsByModule(tenantId: string, module: string) {
    return this.prisma.permission.findMany({
      where: { tenantId, module, isActive: true },
      orderBy: { action: 'asc' },
    });
  }

  async updatePermission(id: string, updateData: Partial<CreatePermissionDto>, tenantId: string) {
    const permission = await this.prisma.permission.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.prisma.permission.updateMany({
      where: { id, tenantId },
      data: updateData,
    });

    return this.prisma.permission.findFirst({
      where: { id, tenantId, isActive: true },
    });
  }

  async removePermission(id: string, tenantId: string) {
    const permission = await this.prisma.permission.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.prisma.permission.updateMany({
      where: { id: permission.id, tenantId },
      data: { isActive: false },
    });

    return { id, deleted: true };
  }

  // Get all permissions for a user
  async getUserPermissions(userId: string, tenantId: string, roleName?: string): Promise<string[]> {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { userId, tenantId },
      select: { role: true },
    });

    const effectiveRole = roleName || membership?.role;

    if (!effectiveRole) {
      return [];
    }

    const role = await this.prisma.role.findFirst({
      where: {
        tenantId,
        name: effectiveRole,
        isActive: true,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return [];
    }

    const permissions = new Set<string>();
    for (const rolePermission of role.rolePermissions) {
      if (rolePermission.permission.isActive) {
        permissions.add(`${rolePermission.permission.module}:${rolePermission.permission.action}`);
      }
    }

    return [...permissions];
  }

  // Check if user has permission
  async hasPermission(userId: string, tenantId: string, module: string, action: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, tenantId);
    const requiredPermission = `${module}:${action}`;
    
    return permissions.includes(requiredPermission);
  }

  async ensureTenantRoleExists(tenantId: string, roleName: string) {
    const existing = await this.prisma.role.findFirst({
      where: { tenantId, name: roleName, isActive: true },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.role.create({
      data: {
        tenantId,
        name: roleName,
        description: `Auto-created role ${roleName}`,
      },
    });
  }

  // Initialize default roles and permissions for a tenant
  async initializeDefaultRoles(tenantId: string) {
    const defaultPermissions = [
      { name: 'View Customers', module: 'customers', action: 'read' },
      { name: 'Create Customers', module: 'customers', action: 'create' },
      { name: 'Update Customers', module: 'customers', action: 'update' },
      { name: 'Delete Customers', module: 'customers', action: 'delete' },
      { name: 'View Invoices', module: 'invoices', action: 'read' },
      { name: 'Create Invoices', module: 'invoices', action: 'create' },
      { name: 'Update Invoices', module: 'invoices', action: 'update' },
      { name: 'Delete Invoices', module: 'invoices', action: 'delete' },
      { name: 'View Inventory', module: 'inventory', action: 'read' },
      { name: 'Create Inventory Items', module: 'inventory', action: 'create' },
      { name: 'Update Inventory Items', module: 'inventory', action: 'update' },
      { name: 'Delete Inventory Items', module: 'inventory', action: 'delete' },
      { name: 'View Purchases', module: 'purchases', action: 'read' },
      { name: 'Create Purchases', module: 'purchases', action: 'create' },
      { name: 'Update Purchases', module: 'purchases', action: 'update' },
      { name: 'Delete Purchases', module: 'purchases', action: 'delete' },
      { name: 'View Payments', module: 'payments', action: 'read' },
      { name: 'Create Payments', module: 'payments', action: 'create' },
      { name: 'Update Payments', module: 'payments', action: 'update' },
      { name: 'Delete Payments', module: 'payments', action: 'delete' },
      { name: 'View Support Tickets', module: 'support', action: 'read' },
      { name: 'Create Support Tickets', module: 'support', action: 'create' },
      { name: 'Update Support Tickets', module: 'support', action: 'update' },
      { name: 'Delete Support Tickets', module: 'support', action: 'delete' },
      { name: 'View Files', module: 'files', action: 'read' },
      { name: 'Create Files', module: 'files', action: 'create' },
      { name: 'Update Files', module: 'files', action: 'update' },
      { name: 'Delete Files', module: 'files', action: 'delete' },
      { name: 'View Tenants (Platform)', module: 'tenants', action: 'read' },
      { name: 'Create Tenants (Platform)', module: 'tenants', action: 'create' },
      { name: 'View Roles', module: 'roles', action: 'read' },
      { name: 'Create Roles', module: 'roles', action: 'create' },
      { name: 'Update Roles', module: 'roles', action: 'update' },
      { name: 'Delete Roles', module: 'roles', action: 'delete' },
      { name: 'View Platform Admin Overview', module: 'platform-admin', action: 'read' },
    ];

    const existingRoles = await this.prisma.role.findMany({
      where: { tenantId },
      select: { id: true },
    });

    await this.prisma.rolePermission.deleteMany({
      where: { roleId: { in: existingRoles.map((role) => role.id) } },
    });
    await this.prisma.role.deleteMany({ where: { tenantId } });
    await this.prisma.permission.deleteMany({ where: { tenantId } });

    const permissions = await Promise.all(
      defaultPermissions.map((permission) =>
        this.prisma.permission.create({
          data: {
            ...permission,
            tenantId,
          },
        }),
      ),
    );

    const tenantOwnerRole = await this.prisma.role.create({
      data: {
        name: 'tenant_owner',
        description: 'Full access to tenant features',
        tenantId,
      },
    });

    const tenantAdminRole = await this.prisma.role.create({
      data: {
        name: 'tenant_admin',
        description: 'Administrative tenant access',
        tenantId,
      },
    });

    const staffRole = await this.prisma.role.create({
      data: {
        name: 'staff',
        description: 'Operational staff access',
        tenantId,
      },
    });

    const tenantScopedPermissions = permissions.filter(
      (p) => !['tenants', 'platform-admin'].includes(p.module),
    );

    await this.assignPermissionsToRole(tenantOwnerRole.id, tenantId, tenantScopedPermissions.map((p) => p.id));

    const tenantAdminPermissions = tenantScopedPermissions.filter((p) => p.module !== 'roles');
    await this.assignPermissionsToRole(tenantAdminRole.id, tenantId, tenantAdminPermissions.map((p) => p.id));

    const staffPermissions = tenantScopedPermissions.filter(
      (p) =>
        (p.action === 'read' && ['customers', 'inventory', 'invoices', 'purchases', 'payments', 'support', 'files'].includes(p.module)) ||
        (p.module === 'invoices' && ['create', 'update'].includes(p.action)) ||
        (p.module === 'payments' && p.action === 'create') ||
        (p.module === 'support' && ['create', 'update'].includes(p.action)),
    );
    await this.assignPermissionsToRole(staffRole.id, tenantId, staffPermissions.map((p) => p.id));

    return { tenantOwnerRole, tenantAdminRole, staffRole };
  }
}
