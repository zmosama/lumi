import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async provisionTenant(name: string, subdomain: string): Promise<{ id: string; schemaName: string }> {
    const schemaName = `tenant_${subdomain.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const existing = await this.prisma.tenant.findUnique({ where: { subdomain } });
    if (existing) {
      throw new ConflictException('Subdomain already taken');
    }

    const tenant = await this.prisma.tenant.create({
      data: { name, subdomain, schemaName },
    });

    await this.createTenantSchema(schemaName);

    return { id: tenant.id, schemaName };
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."students" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
  }

  async getTenantStats(schemaName: string) {
    const [studentsResult, presentResult, paymentsResult] = await Promise.all([
      this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*) as count FROM "${schemaName}"."students" WHERE status = 'active'`
      ),
      this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*) as count FROM "${schemaName}"."attendance" WHERE date = CURRENT_DATE AND status = 'present'`
      ),
      this.prisma.$queryRawUnsafe<[{ total: string }]>(
        `SELECT COALESCE(SUM(amount), 0)::text as total FROM "${schemaName}"."payments" WHERE status = 'paid' AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', NOW())`
      ),
    ]);

    return {
      totalStudents: Number(studentsResult[0]?.count || 0),
      presentToday: Number(presentResult[0]?.count || 0),
      monthlyRevenue: parseFloat(paymentsResult[0]?.total || '0'),
    };
  }
}
