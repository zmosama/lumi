import { I18nContext } from 'nestjs-i18n';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface PlatformJwtPayload {
  sub: string;
  type: string;
  role: string;
}

export interface PlatformAuthRequest extends Request {
  platformUser?: {
    platformUserId: string;
    role: string;
  };
}

@Injectable()
export class PlatformAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<PlatformAuthRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(I18nContext.current()!.t('messages.auth.missing_platform_token'));
    }

    const token = authHeader.slice(7);

    let payload: PlatformJwtPayload;
    try {
      payload = this.jwtService.verify<PlatformJwtPayload>(token, {
        secret: this.config.get('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(I18nContext.current()!.t('messages.auth.invalid_platform_token'));
    }

    if (payload.type !== 'platform') {
      throw new UnauthorizedException(I18nContext.current()!.t('messages.auth.not_platform_token'));
    }

    request.platformUser = {
      platformUserId: payload.sub,
      role: payload.role,
    };

    return true;
  }
}
