import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://smartbitz:smartbitz@localhost:5432/smartbitz_test?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.REDIS_ENABLED = process.env.REDIS_ENABLED || 'false';

if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
  throw new Error('Test suite requires a PostgreSQL DATABASE_URL (or TEST_DATABASE_URL).');
}

const prisma = new PrismaClient();

async function waitForPostgres(maxAttempts = 20, delayMs = 1500) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$queryRawUnsafe('SELECT 1');
      return;
    } catch {
      if (attempt === maxAttempts) {
        throw new Error(
          `PostgreSQL is not reachable at ${process.env.DATABASE_URL}. ` +
            'Start local infra first (e.g. docker compose up -d postgres).',
        );
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

beforeAll(async () => {
  await waitForPostgres();

  execSync('npx prisma db push --force-reset --skip-generate', {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env,
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.file.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.tenantMembership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
});

export { prisma };
