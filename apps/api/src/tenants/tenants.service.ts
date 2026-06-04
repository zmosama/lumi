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
  ): Promise<{ id: string; schemaName: string; branchId: string }> {
    const { name, subdomain, orgType, initialBranch } = opts;
    const schemaName = `tenant_${subdomain.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const existing = await this.prisma.tenant.findUnique({ where: { subdomain } });
    if (existing) {
      throw new ConflictException('Subdomain already taken');
    }

    const tenant = await this.prisma.tenant.create({
      data: { name, subdomain, schemaName, orgType },
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

    await this.createTenantSchema(schemaName);

    return { id: tenant.id, schemaName, branchId: branch.id };
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."students" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        branch_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        parent_name TEXT,
        parent_phone TEXT,
        grade TEXT,
        class_name TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."teachers" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        branch_id TEXT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        subject TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."classes" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        branch_id TEXT,
        name TEXT NOT NULL,
        grade TEXT,
        teacher_id TEXT REFERENCES "${schemaName}"."teachers"(id) ON DELETE SET NULL,
        capacity INTEGER DEFAULT 30,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."attendance" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        student_id TEXT NOT NULL REFERENCES "${schemaName}"."students"(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'present',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(student_id, date)
      )
    `);

    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."payments" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        student_id TEXT NOT NULL REFERENCES "${schemaName}"."students"(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'paid',
        paid_at TIMESTAMPTZ,
        due_date DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS idx_students_branch ON "${schemaName}"."students"(branch_id)`,
    );
    await this.prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS idx_students_status ON "${schemaName}"."students"(status)`,
    );
  }

  async getTenantStats(schemaName: string, branchId?: string) {
    const branchFilter = branchId ? `AND branch_id = '${branchId}'` : '';

    const [studentsResult, presentResult, paymentsResult] = await Promise.all([
      this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*) as count FROM "${schemaName}"."students" WHERE status = 'active' ${branchFilter}`,
      ),
      this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*) as count FROM "${schemaName}"."attendance" a
         JOIN "${schemaName}"."students" s ON s.id = a.student_id
         WHERE a.date = CURRENT_DATE AND a.status = 'present' ${branchFilter}`,
      ),
      this.prisma.$queryRawUnsafe<[{ total: string }]>(
        `SELECT COALESCE(SUM(p.amount), 0)::text as total FROM "${schemaName}"."payments" p
         JOIN "${schemaName}"."students" s ON s.id = p.student_id
         WHERE p.status = 'paid' AND DATE_TRUNC('month', p.paid_at) = DATE_TRUNC('month', NOW()) ${branchFilter}`,
      ),
    ]);

    return {
      totalStudents: Number(studentsResult[0]?.count || 0),
      presentToday: Number(presentResult[0]?.count || 0),
      monthlyRevenue: parseFloat(paymentsResult[0]?.total || '0'),
    };
  }
}
