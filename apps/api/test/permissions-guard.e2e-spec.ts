import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../src/modules/roles/guards/permissions.guard';

describe('PermissionsGuard', () => {
  const mockReflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const mockRolesService = {
    hasPermission: jest.fn(),
  } as any;

  const makeContext = (user?: any) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as any;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns 401 when user context is missing', async () => {
    mockReflector.getAllAndOverride = jest.fn().mockReturnValue(['customers:read']);
    const guard = new PermissionsGuard(mockReflector, mockRolesService);

    await expect(guard.canActivate(makeContext(undefined))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns 403 when authenticated user lacks required permission', async () => {
    mockReflector.getAllAndOverride = jest.fn().mockReturnValue(['customers:read']);
    mockRolesService.hasPermission = jest.fn().mockResolvedValue(false);
    const guard = new PermissionsGuard(mockReflector, mockRolesService);

    await expect(
      guard.canActivate(makeContext({ userId: 'u1', tenantId: 't1' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
