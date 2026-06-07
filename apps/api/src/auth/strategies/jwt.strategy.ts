import { Injectable, UnauthorizedException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: string;
  orgType: string;
}

export interface AuthUser {
  userId: string;
  tenantId: string;
  role: string;
  orgType: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (!payload.sub || !payload.tenantId) {
      throw new UnauthorizedException();
    }

    // Verify user still exists and tenant is active
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, tenantId: payload.tenantId },
      include: { tenant: { select: { isActive: true } } },
    });

    if (!user || !user.tenant.isActive) {
      throw new UnauthorizedException(I18nContext.current()!.t('messages.auth.user_not_active'));
    }

    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
      orgType: payload.orgType,
    };
  }
}
