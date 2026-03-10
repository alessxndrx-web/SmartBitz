const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./src/database/prisma/dev.db';

const prisma = new PrismaClient();

const TENANT_ID = 'test-tenant-123';

async function seedMinimalData() {
  console.log('🌱 Creando datos mínimos para prueba...');
  
  try {
    // 1. Crear tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: 'test-company' },
      update: {},
      create: {
        name: 'Test Company',
        slug: 'test-company',
        ruc: '123456789',
        businessType: 'RETAIL',
        subscriptionPlan: 'BASIC',
        isActive: true
      }
    });
    console.log('✅ Tenant creado:', tenant.id);

    // 2. Crear supplier
    const supplier = await prisma.supplier.create({
      data: {
        tenantId: tenant.id,
        name: 'Test Supplier',
        email: 'supplier@test.com',
        phone: '+1234567890',
        address: '123 Test St',
        isActive: true
      }
    });
    console.log('✅ Supplier creado:', supplier.id);

    // 3. Crear customer
    const customer = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        fullName: 'Test Customer',
        email: 'customer@test.com',
        phone: '+1234567890',
        address: '456 Customer Ave'
      }
    });
    console.log('✅ Customer creado:', customer.id);

    // 4. Crear inventory item
    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        tenantId: tenant.id,
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test product for transactional flow',
        quantity: 0,
        minStock: 5,
        unitCost: 10.00,
        salePrice: 15.00
      }
    });
    console.log('✅ Inventory item creado:', inventoryItem.id);
    console.log(`   Stock inicial: ${inventoryItem.quantity}`);

    return {
      tenantId: tenant.id,
      supplierId: supplier.id,
      customerId: customer.id,
      inventoryItemId: inventoryItem.id
    };

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { seedMinimalData };
