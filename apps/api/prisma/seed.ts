import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Lumi@Owner2025!', 10);
  await prisma.platformUser.upsert({
    where: { email: 'mohammedosama@gmail.com' },
    update: {},
    create: {
      email: 'mohammedosama@gmail.com',
      passwordHash: hash,
      name: 'Mohammed Osama',
      role: 'OWNER',
    },
  });
  console.log('✅ Platform OWNER created: mohammedosama@gmail.com / Lumi@Owner2025!');

  const salesHash = await bcrypt.hash('Sales@Lumi123!', 10);
  await prisma.platformUser.upsert({
    where: { email: 'sales@lumi.app' },
    update: {},
    create: {
      email: 'sales@lumi.app',
      passwordHash: salesHash,
      name: 'فريق المبيعات',
      role: 'SALES',
    },
  });
  console.log('✅ Platform SALES created: sales@lumi.app / Sales@Lumi123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
