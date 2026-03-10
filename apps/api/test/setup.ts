import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./src/database/prisma/dev.db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const prisma = new PrismaClient();

beforeAll(async () => {
  execSync('npx prisma migrate reset --force --skip-seed --skip-generate', {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env,
  });

  execSync('npx prisma migrate deploy', {
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
  await prisma.invoice.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
});

export { prisma };
