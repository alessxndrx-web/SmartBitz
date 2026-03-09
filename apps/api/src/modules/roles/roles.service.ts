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
    const role = await this.prisma.role.update({
      where: { id },
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
    return this.prisma.role.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async assignPermissionsToRole(roleId: string, tenantId: string, permissionIds: string[]) {
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

    return this.prisma.permission.update({
      where: { id },
      data: updateData,
    });
  }

  async removePermission(id: string, tenantId: string) {
    const permission = await this.prisma.permission.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return this.prisma.permission.update({
      where: { id: permission.id },
      data: { isActive: false },
    });
  }

  // Get all permissions for a user
  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true, role: true },
    });

    if (!user) {
      return [];
    }

    if (tenantId && user.tenantId !== tenantId) {
      return [];
    }

    const role = await this.prisma.role.findFirst({
      where: {
        tenantId: user.tenantId,
        name: user.role,
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

  // Initialize default roles and permissions for a tenant
  async initializeDefaultRoles(tenantId: string) {
    // Create default permissions
    const defaultPermissions = [
      // Customers
      { name: 'View Customers', module: 'customers', action: 'read' },
      { name: 'Create Customers', module: 'customers', action: 'create' },
      { name: 'Update Customers', module: 'customers', action: 'update' },
      { name: 'Delete Customers', module: 'customers', action: 'delete' },
      
      // Invoices
      { name: 'View Invoices', module: 'invoices', action: 'read' },
      { name: 'Create Invoices', module: 'invoices', action: 'create' },
      { name: 'Update Invoices', module: 'invoices', action: 'update' },
      { name: 'Delete Invoices', module: 'invoices', action: 'delete' },
      
      // Inventory
      { name: 'View Inventory', module: 'inventory', action: 'read' },
      { name: 'Create Inventory Items', module: 'inventory', action: 'create' },
      { name: 'Update Inventory Items', module: 'inventory', action: 'update' },
      { name: 'Delete Inventory Items', module: 'inventory', action: 'delete' },
      
      // Purchases
      { name: 'View Purchases', module: 'purchases', action: 'read' },
      { name: 'Create Purchases', module: 'purchases', action: 'create' },
      { name: 'Update Purchases', module: 'purchases', action: 'update' },
      { name: 'Delete Purchases', module: 'purchases', action: 'delete' },
      
      // Roles
      { name: 'View Roles', module: 'roles', action: 'read' },
      { name: 'Create Roles', module: 'roles', action: 'create' },
      { name: 'Update Roles', module: 'roles', action: 'update' },
      { name: 'Delete Roles', module: 'roles', action: 'delete' },
    ];

    const permissions = await Promise.all(
      defaultPermissions.map(permission =>
        this.prisma.permission.create({
          data: {
            ...permission,
            tenantId,
          },
        })
      )
    );

    // Create default roles
    const ownerRole = await this.prisma.role.create({
      data: {
        name: 'owner',
        description: 'Full access to all features',
        tenantId,
      },
    });

    const adminRole = await this.prisma.role.create({
      data: {
        name: 'admin',
        description: 'Administrative access',
        tenantId,
      },
    });

    const cashierRole = await this.prisma.role.create({
      data: {
        name: 'cashier',
        description: 'Point of sales and basic operations',
        tenantId,
      },
    });

    const accountantRole = await this.prisma.role.create({
      data: {
        name: 'accountant',
        description: 'Financial and billing operations',
        tenantId,
      },
    });

    const operatorRole = await this.prisma.role.create({
      data: {
        name: 'operator',
        description: 'Basic operational access',
        tenantId,
      },
    });

    // Assign all permissions to owner
    await this.assignPermissionsToRole(ownerRole.id, tenantId, permissions.map(p => p.id));

    // Assign most permissions to admin (except roles management)
    const adminPermissions = permissions.filter(
      p => p.module !== 'roles'
    );
    await this.assignPermissionsToRole(adminRole.id, tenantId, adminPermissions.map(p => p.id));

    // Assign limited permissions to cashier
    const cashierPermissions = permissions.filter(
      p => ['customers', 'invoices'].includes(p.module) && p.action === 'read' ||
           ['invoices'].includes(p.module) && ['create', 'update'].includes(p.action)
    );
    await this.assignPermissionsToRole(cashierRole.id, tenantId, cashierPermissions.map(p => p.id));

    // Assign financial permissions to accountant
    const accountantPermissions = permissions.filter(
      p => ['customers', 'invoices', 'purchases'].includes(p.module)
    );
    await this.assignPermissionsToRole(accountantRole.id, tenantId, accountantPermissions.map(p => p.id));

    // Assign basic read permissions to operator
    const operatorPermissions = permissions.filter(
      p => p.action === 'read' && ['customers', 'inventory'].includes(p.module)
    );
    await this.assignPermissionsToRole(operatorRole.id, tenantId, operatorPermissions.map(p => p.id));

    return { ownerRole, adminRole, cashierRole, accountantRole, operatorRole };
  }
}
