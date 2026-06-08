import { I18nContext } from 'nestjs-i18n';
import { Injectable, ConflictException } from '@nestjs/common';
import { OrgType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { TenantsDomainService } from '@lumi/domain';

export interface ProvisionOptions {
  name: string;
  subdomain: string;
  orgType: OrgType;
  initialBranch: {
    name: string;
    area?: string;
    curriculums?: string[];
    ownership?: string;
  };
}

@Injectable()
export class TenantsService {
  private domainService: TenantsDomainService;

  constructor(private prisma: PrismaService) {
    this.domainService = new TenantsDomainService(this.prisma);
  }

  async provisionTenant(
    opts: ProvisionOptions,
  ): Promise<{ id: string; branchId: string }> {
    try {
      return await this.domainService.provisionTenant(opts);
    } catch (e: any) {
      if (e.message === 'SUBDOMAIN_TAKEN') {
        throw new ConflictException(I18nContext.current()!.t('messages.tenant.subdomain_taken'));
      }
      throw e;
    }
  }

  async getTenantStats(tenantId: string, branchId?: string) {
    return this.domainService.getTenantStats(tenantId, branchId);
  }
}
