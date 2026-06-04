import { Injectable, ConflictException } from '@nestjs/common';
import { OrgType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
  constructor(private prisma: PrismaService) {}

  async provisionTenant(
    opts: ProvisionOptions,
  ): Promise<{ id: string; branchId: string }> {
    const { name, subdomain, orgType, initialBranch } = opts;

    const existing = await this.prisma.tenant.findUnique({ where: { subdomain } });
    if (existing) {
      throw new ConflictException('Subdomain already taken');
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

