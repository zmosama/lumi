import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nContext } from 'nestjs-i18n';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles() decorator is present, allow access (auth-only)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) {
      throw new ForbiddenException(I18nContext.current()!.t('messages.auth.access_denied'));
    }

    // super_admin has access to everything
    if (user.role === 'super_admin') {
      return true;
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(I18nContext.current()!.t('messages.auth.access_denied'));
    }

    return true;
  }
}
