import { prisma } from './setup';

describe('Permissions (data-level)', () => {
  it('should return permissions only from the user role (not all tenant roles)', async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Perm Tenant',
        slug: `perm-tenant-${Date.now()}`,
        ruc: 'P-123',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
      },
    });

    const permReadCustomers = await prisma.permission.create({
      data: {
        tenantId: tenant.id,
        name: 'View Customers',
        module: 'customers',
        action: 'read',
      },
    });

    const permDeleteCustomers = await prisma.permission.create({
      data: {
        tenantId: tenant.id,
        name: 'Delete Customers',
        module: 'customers',
        action: 'delete',
      },
    });

    const ownerRole = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'owner',
        description: 'Owner role',
      },
    });

    const operatorRole = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'operator',
        description: 'Operator role',
      },
    });

    await prisma.rolePermission.createMany({
      data: [
        { roleId: ownerRole.id, permissionId: permReadCustomers.id },
        { roleId: ownerRole.id, permissionId: permDeleteCustomers.id },
        { roleId: operatorRole.id, permissionId: permReadCustomers.id },
      ],
    });

    const operatorUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        fullName: 'Operator User',
        email: `operator-${Date.now()}@example.com`,
        password: 'hashed',
        role: 'operator',
      },
    });

    // Emulate RolesService.getUserPermissions logic via Prisma: role.name == user.role
    const role = await prisma.role.findFirst({
      where: { tenantId: tenant.id, name: operatorUser.role, isActive: true },
      include: { rolePermissions: { include: { permission: true } } },
    });

    const permissions = new Set(
      (role?.rolePermissions ?? [])
        .filter((rp) => rp.permission.isActive)
        .map((rp) => `${rp.permission.module}:${rp.permission.action}`),
    );

    expect([...permissions].sort()).toEqual(['customers:read']);
  });
});

