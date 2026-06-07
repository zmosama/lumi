import { I18nService } from 'nestjs-i18n';
import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { appRequestContext } from '@lumi/shared';

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    name: string;
    subdomain: string;
  };
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private prisma: PrismaService,
    private i18n: I18nService,
  ) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    // For local dev: use x-tenant-id header
    // For production: extract from subdomain
    let subdomain: string | undefined;

    const tenantHeader = req.headers['x-tenant-id'] as string;
    if (tenantHeader) {
      subdomain = tenantHeader;
    } else {
      const host = req.headers.host || '';
      const parts = host.split('.');
      if (parts.length >= 3) {
        subdomain = parts[0];
      }
    }

    if (!subdomain) {
      throw new NotFoundException(this.i18n.t('messages.tenant.not_found'));
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain, isActive: true },
      select: { id: true, name: true, subdomain: true },
    });

    if (!tenant) {
      throw new NotFoundException(this.i18n.t('messages.tenant.not_found'));
    }

    req.tenant = tenant;

    appRequestContext.run({ tenantId: tenant.id }, () => {
      next();
    });
  }
}
