import { PrismaClient } from '@prisma/client';

export type PermissionSeed = { module: string; action: string; name?: string };

export async function createTenant(prisma: PrismaClient, name = 'Test Tenant') {
  return prisma.tenant.create({
    data: {
      name,
      slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      ruc: `RUC-${Date.now()}`,
      businessType: 'RETAIL',
      subscriptionPlan: 'BASIC',
    },
  });
}

export async function seedRoleWithPermissions(
  prisma: PrismaClient,
  params: {
    tenantId: string;
    roleName: string;
    permissions: PermissionSeed[];
  },
) {
  const permissions = await Promise.all(
    params.permissions.map((p) =>
      prisma.permission.create({
        data: {
          tenantId: params.tenantId,
          name: p.name || `${p.module}:${p.action}`,
          module: p.module,
          action: p.action,
        },
      }),
    ),
  );

  const role = await prisma.role.create({
    data: {
      tenantId: params.tenantId,
      name: params.roleName,
      description: params.roleName,
    },
  });

  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
    })),
  });

  return { role, permissions };
}
