import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PlatformAuthGuard, PlatformAuthRequest, PlatformJwtPayload } from './platform-auth.guard';

@Injectable()
export class PlatformOwnerGuard implements CanActivate {
  private platformAuthGuard: PlatformAuthGuard;

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.platformAuthGuard = new PlatformAuthGuard(jwtService, config);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.platformAuthGuard.canActivate(context);

    const request = context.switchToHttp().getRequest<PlatformAuthRequest>();

    if (request.platformUser?.role !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can perform this action');
    }

    return true;
  }
}
