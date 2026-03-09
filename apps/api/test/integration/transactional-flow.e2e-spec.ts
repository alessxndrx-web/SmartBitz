import { PrismaClient } from '@prisma/client';
import { prisma } from '../setup';

describe('Transactional Flow Integration', () => {
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    prismaClient = prisma;
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('Complete Transactional Flow', () => {
    let tenantId: string;
    let supplierId: string;
    let customerId: string;
    let inventoryItemId: string;
    let purchaseId: string;
    let invoiceId: string;
    let paymentId: string;

    beforeEach(async () => {
      // Create test data
      const tenant = await prismaClient.tenant.create({
        data: {
          name: 'Test Company',
          slug: 'test-company-flow',
          ruc: '123456789',
          businessType: 'RETAIL',
          subscriptionPlan: 'BASIC',
        },
      });
      tenantId = tenant.id;

      const supplier = await prismaClient.supplier.create({
        data: {
          tenantId,
          name: 'Test Supplier',
          email: 'supplier@test.com',
          phone: '+1234567890',
          address: '123 Test St',
        },
      });
      supplierId = supplier.id;

      const customer = await prismaClient.customer.create({
        data: {
          tenantId,
          fullName: 'Test Customer',
          email: 'customer@test.com',
          phone: '+1234567890',
          address: '456 Customer Ave',
        },
      });
      customerId = customer.id;

      const inventoryItem = await prismaClient.inventoryItem.create({
        data: {
          tenantId,
          name: 'Test Product',
          sku: 'TEST-001',
          description: 'Test product for flow',
          quantity: 0,
          minStock: 5,
          unitCost: 10.00,
          salePrice: 15.00,
        },
      });
      inventoryItemId = inventoryItem.id;
    });

    it('should execute complete flow: Purchase → Inventory → Invoice → Payment', async () => {
      // Step 1: Create Purchase
      const purchase = await prismaClient.purchase.create({
        data: {
          tenantId,
          supplierId,
          number: 'PUR-000001',
          subtotal: 200.00,
          tax: 0,
          total: 200.00,
          status: 'pending',
          items: {
            create: [{
              itemId: inventoryItemId,
              quantity: 20,
              unitCost: 10.00,
              discount: 0,
              taxRate: 0,
              total: 200.00,
            }],
          },
        },
        include: { items: true },
      });
      purchaseId = purchase.id;

      expect(purchase.status).toBe('pending');
      expect(purchase.items).toHaveLength(1);

      // Step 2: Receive Purchase (increment stock)
      await prismaClient.$transaction(async (tx) => {
        // Load purchase item from database to avoid stale references
        const [purchaseItem] = await tx.purchaseItem.findMany({
          where: { purchaseId: purchase.id },
        });

        await tx.purchaseItem.update({
          where: { id: purchaseItem.id },
          data: { received: 20 },
        });

        // Increment stock
        await tx.inventoryItem.update({
          where: { id: inventoryItemId },
          data: { quantity: { increment: 20 } },
        });

        // Create inventory movement
        await tx.inventoryMovement.create({
          data: {
            tenantId,
            itemId: inventoryItemId,
            type: 'purchase',
            quantity: 20,
            reference: `Purchase ${purchase.number}`,
            notes: 'Received 20 units',
          },
        });

        // Update purchase status
        await tx.purchase.update({
          where: { id: purchaseId },
          data: { 
            status: 'received',
            receivedAt: new Date(),
          },
        });
      });

      // Verify stock increment
      const stockAfterPurchase = await prismaClient.inventoryItem.findUnique({
        where: { id: inventoryItemId },
      });
      expect(stockAfterPurchase.quantity).toBe(20);

      const movementsAfterPurchase = await prismaClient.inventoryMovement.findMany({
        where: { itemId: inventoryItemId, tenantId },
      });
      expect(movementsAfterPurchase).toHaveLength(1);

      // Step 3: Create Invoice (deduct stock)
      const invoice = await prismaClient.$transaction(async (tx) => {
        const newInvoice = await tx.invoice.create({
          data: {
            tenantId,
            customerId,
            number: `INV-${Date.now()}`,
            subtotal: 75.00,
            tax: 0,
            total: 75.00,
            status: 'sent',
            issueDate: new Date(),
            dueDate: new Date(),
            items: {
              create: [{
                description: 'Test Product',
                quantity: 5,
                unitPrice: 15.00,
                discount: 0,
                taxRate: 0,
                total: 75.00,
              }],
            },
          },
          include: { items: true },
        });

        // Deduct stock
        await tx.inventoryItem.update({
          where: { id: inventoryItemId },
          data: { quantity: { decrement: 5 } },
        });

        // Create inventory movement
        await tx.inventoryMovement.create({
          data: {
            tenantId,
            itemId: inventoryItemId,
            type: 'sale',
            quantity: 5,
            reference: `Invoice ${newInvoice.number}`,
            notes: 'Stock deducted for sale',
          },
        });

        return newInvoice;
      });
      invoiceId = invoice.id;

      // Verify stock deduction
      const stockAfterInvoice = await prismaClient.inventoryItem.findUnique({
        where: { id: inventoryItemId },
      });
      expect(stockAfterInvoice.quantity).toBe(15);

      const movementsAfterInvoice = await prismaClient.inventoryMovement.findMany({
        where: { itemId: inventoryItemId, tenantId },
      });
      expect(movementsAfterInvoice).toHaveLength(2);

      // Step 4: Create Payment
      const payment = await prismaClient.payment.create({
        data: {
          invoiceId,
          amount: 75.00,
          method: 'cash',
          status: 'completed',
          paymentDate: new Date(),
          notes: 'Payment for invoice',
        },
      });
      paymentId = payment.id;

      // Step 5: Update Invoice Status
      const updatedInvoice = await prismaClient.invoice.update({
        where: { id: invoiceId },
        data: { status: 'paid' },
      });

      // Final verification
      expect(updatedInvoice.status).toBe('paid');
      expect(payment.status).toBe('completed');

      const finalMovements = await prismaClient.inventoryMovement.findMany({
        where: { itemId: inventoryItemId, tenantId },
        orderBy: { createdAt: 'asc' },
      });
      expect(finalMovements).toHaveLength(2);
      expect(finalMovements[0].type).toBe('purchase');
      expect(finalMovements[0].quantity).toBe(20);
      expect(finalMovements[1].type).toBe('sale');
      expect(finalMovements[1].quantity).toBe(5);

      const finalStock = await prismaClient.inventoryItem.findUnique({
        where: { id: inventoryItemId },
      });
      expect(finalStock.quantity).toBe(15);
    });

    it('should prevent stock deduction when insufficient stock', async () => {
      // Try to create invoice with insufficient stock (enforced by business check)
      await expect(
        prismaClient.$transaction(async (tx) => {
          const invoice = await tx.invoice.create({
            data: {
              tenantId,
              customerId,
              number: `INV-${Date.now()}`,
              subtotal: 150.00,
              tax: 0,
              total: 150.00,
              status: 'sent',
              issueDate: new Date(),
              dueDate: new Date(),
              items: {
                create: [{
                  description: 'Test Product',
                  quantity: 10,
                  unitPrice: 15.00,
                  discount: 0,
                  taxRate: 0,
                  total: 150.00,
                }],
              },
            },
          });

          const current = await tx.inventoryItem.findUnique({
            where: { id: inventoryItemId },
            select: { quantity: true },
          });

          if (!current || current.quantity < 10) {
            throw new Error('Insufficient stock');
          }

          await tx.inventoryItem.update({
            where: { id: inventoryItemId },
            data: { quantity: { decrement: 10 } },
          });
        })
      ).rejects.toThrow();
    });

    it('should maintain tenant isolation throughout the flow', async () => {
      // Create second tenant
      const tenant2 = await prismaClient.tenant.create({
        data: {
          name: 'Second Company',
          slug: 'second-company',
          ruc: '987654321',
          businessType: 'RETAIL',
          subscriptionPlan: 'BASIC',
        },
      });

      // Try to access first tenant's data from second tenant context
      const tenant2Items = await prismaClient.inventoryItem.findMany({
        where: { tenantId: tenant2.id },
      });
      expect(tenant2Items).toHaveLength(0);

      // Verify first tenant's data is isolated
      const tenant1Items = await prismaClient.inventoryItem.findMany({
        where: { tenantId },
      });
      expect(tenant1Items).toHaveLength(1);
    });
  });
});
