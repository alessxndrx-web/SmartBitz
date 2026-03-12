import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RolesService } from '../roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    // Check each required permission
    for (const permission of requiredPermissions) {
      const [module, action] = permission.split(':');
      const hasPermission = await this.rolesService.hasPermission(
        user.userId,
        user.tenantId,
        module,
        action,
      );
      
      if (!hasPermission) {
        throw new ForbiddenException(`Insufficient permissions: ${permission}`);
      }
    }

    return true;
  }
}
