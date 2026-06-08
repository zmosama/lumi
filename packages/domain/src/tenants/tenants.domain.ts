export interface ProvisionTenantCommand {
  name: string;
  subdomain: string;
  orgType: any;
  initialBranch: {
    name: string;
    area?: string;
    curriculums?: string[];
    ownership?: string;
  };
}

export interface TenantResponse {
  id: string;
  name: string;
  subdomain: string;
  orgType: string;
  isActive: boolean;
}

export class TenantsDomainService {
  constructor(private readonly prisma: any) {}

  async provisionTenant(opts: ProvisionTenantCommand): Promise<{ id: string; branchId: string }> {
    const { name, subdomain, orgType, initialBranch } = opts;

    const existing = await this.prisma.tenant.findUnique({ where: { subdomain } });
    if (existing) {
      throw new Error('SUBDOMAIN_TAKEN');
    }

    const tenant = await this.prisma.tenant.create({
      data: { name, subdomain, orgType },
    });

    const branch = await this.prisma.branch.create({
      data: {
        tenantId: tenant.id,
        name: initialBranch.name,
        area: initialBranch.area,
        isMain: true,
        curriculums: initialBranch.curriculums ?? [],
        ownership: initialBranch.ownership,
      },
    });

    return { id: tenant.id, branchId: branch.id };
  }

  async getTenantStats(tenantId: string, branchId?: string) {
    const branchFilter = branchId ? { branchId } : {};

    const [totalStudents, presentToday, paymentsResult] = await Promise.all([
      this.prisma.student.count({
        where: { tenantId, status: 'active', ...branchFilter },
      }),
      this.prisma.attendance.count({
        where: {
          tenantId,
          date: new Date(new Date().setHours(0, 0, 0, 0)),
          status: 'present',
          student: branchFilter,
        },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          tenantId,
          status: 'paid',
          paidAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
          student: branchFilter,
        },
      }),
    ]);

    return {
      totalStudents,
      presentToday,
      monthlyRevenue: Number(paymentsResult._sum.amount || 0),
    };
  }
}
