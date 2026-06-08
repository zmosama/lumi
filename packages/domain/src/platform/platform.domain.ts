export interface TenantDomainModel {
  id: string;
  name: string;
  subdomain: string;
  orgType: string;
  plan: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformUserDomainModel {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  inactiveTenants: number;
}

export class PlatformDomainService {
  constructor(private readonly prisma: any) {}

  async listTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        subdomain: true,
        orgType: true,
        plan: true,
        isActive: true,
        createdAt: true,
        _count: { select: { users: true } },
      },
    });
  }

  async toggleTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new Error('TENANT_NOT_FOUND');
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: { isActive: !tenant.isActive },
      select: { id: true, name: true, subdomain: true, isActive: true },
    });

    return updated;
  }

  async getStats(): Promise<PlatformStats> {
    const [total, active, trial] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.tenant.count({ where: { plan: 'trial' } }),
    ]);

    return {
      totalTenants: total,
      activeTenants: active,
      trialTenants: trial,
      inactiveTenants: total - active,
    };
  }

  async listPlatformUsers() {
    return this.prisma.platformUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
  }
}
