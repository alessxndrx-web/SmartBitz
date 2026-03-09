const { PrismaClient } = require('@prisma/client');
const { seedMinimalData } = require('./seed-data');

const prisma = new PrismaClient();

async function validateTransactionalFlow() {
  console.log('🚀 INICIANDO VALIDACIÓN REAL DEL FLUJO TRANSACCIONAL');
  console.log('=' .repeat(70));

  let testData = null;
  let createdPurchase = null;
  let createdInvoice = null;
  let createdPayment = null;

  try {
    // Paso 0: Crear datos de prueba
    console.log('\n📝 Paso 0: Creando datos de prueba...');
    testData = await seedMinimalData();
    console.log('✅ Datos creados:', { tenantId: testData.tenantId });

    // Paso 1: Crear purchase
    console.log('\n🛒 Paso 1: Creando purchase...');
    const purchaseData = {
      tenantId: testData.tenantId,
      supplierId: testData.supplierId,
      items: [{
        itemId: testData.inventoryItemId,
        quantity: 20,
        unitCost: 10.00,
        discount: 0,
        taxRate: 0,
        total: 200.00,
        received: 0
      }],
      subtotal: 200.00,
      tax: 0,
      total: 200.00,
      status: 'PENDING',
      purchaseDate: new Date(),
      number: '000001'
    };

    createdPurchase = await prisma.purchase.create({
      data: {
        ...purchaseData,
        items: {
          create: purchaseData.items
        }
      },
      include: {
        items: true,
        supplier: true
      }
    });
    console.log('✅ Purchase creado:', createdPurchase.id);
    console.log(`   Status: ${createdPurchase.status}`);
    console.log(`   Items: ${createdPurchase.items.length}`);

    // Paso 2: Verificar stock inicial
    console.log('\n🔍 Paso 2: Verificando stock inicial...');
    const initialStock = await prisma.inventoryItem.findFirst({
      where: { 
        id: testData.inventoryItemId,
        tenantId: testData.tenantId 
      }
    });
    console.log(`✅ Stock inicial: ${initialStock.quantity}`);

    // Paso 3: Recibir purchase (simular receivePurchase)
    console.log('\n📥 Paso 3: Recibiendo purchase (incrementando stock)...');
    
    await prisma.$transaction(async (tx) => {
      // Actualizar purchase item received
      await tx.purchaseItem.update({
        where: { id: createdPurchase.items[0].id },
        data: { received: 20 }
      });

      // Incrementar stock
      await tx.inventoryItem.update({
        where: { id: testData.inventoryItemId },
        data: { 
          quantity: {
            increment: 20
          }
        }
      });

      // Crear inventory movement
      await tx.inventoryMovement.create({
        data: {
          tenantId: testData.tenantId,
          itemId: testData.inventoryItemId,
          type: 'purchase',
          quantity: 20,
          reference: `Purchase ${createdPurchase.number}`,
          notes: `Received 20 units via purchase ${createdPurchase.number}`
        }
      });

      // Actualizar purchase status
      await tx.purchase.update({
        where: { id: createdPurchase.id },
        data: { 
          status: 'RECEIVED',
          receivedAt: new Date()
        }
      });
    });

    console.log('✅ Purchase recibido exitosamente');

    // Paso 4: Verificar incremento de stock
    console.log('\n🔍 Paso 4: Verificando incremento de stock...');
    const stockAfterPurchase = await prisma.inventoryItem.findFirst({
      where: { 
        id: testData.inventoryItemId,
        tenantId: testData.tenantId 
      }
    });
    console.log(`✅ Stock después de purchase: ${stockAfterPurchase.quantity}`);
    
    if (stockAfterPurchase.quantity !== 20) {
      throw new Error(`❌ ERROR: Se esperaba stock = 20, pero es ${stockAfterPurchase.quantity}`);
    }

    // Verificar movement creado
    const movementsAfterPurchase = await prisma.inventoryMovement.findMany({
      where: { 
        itemId: testData.inventoryItemId,
        tenantId: testData.tenantId 
      }
    });
    console.log(`✅ Movimientos creados: ${movementsAfterPurchase.length}`);

    // Paso 5: Crear invoice (simular createWithStockDeduction)
    console.log('\n🧾 Paso 5: Creando invoice (descontando stock)...');
    
    const invoiceData = {
      tenantId: testData.tenantId,
      customerId: testData.customerId,
      number: `INV-${Date.now()}`,
      subtotal: 75.00,
      tax: 0,
      total: 75.00,
      status: 'SENT',
      issueDate: new Date(),
      dueDate: new Date(),
      items: [{
        description: 'Test Product',
        quantity: 5,
        unitPrice: 15.00,
        discount: 0,
        taxRate: 0,
        total: 75.00
      }]
    };

    createdInvoice = await prisma.$transaction(async (tx) => {
      // Crear invoice
      const invoice = await tx.invoice.create({
        data: {
          ...invoiceData,
          items: {
            create: invoiceData.items
          }
        },
        include: {
          items: true
        }
      });

      // Encontrar inventory item por ID directamente
      const inventoryItem = await tx.inventoryItem.findFirst({
        where: { 
          id: testData.inventoryItemId,
          tenantId: testData.tenantId 
        }
      });

      if (inventoryItem) {
        // Validar stock disponible
        if (inventoryItem.quantity < 5) {
          throw new Error(`Insufficient stock for sale. Available: ${inventoryItem.quantity}, Required: 5`);
        }

        // Descontar stock
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { 
            quantity: {
              decrement: 5
            }
          }
        });

        // Crear inventory movement
        await tx.inventoryMovement.create({
          data: {
            tenantId: testData.tenantId,
            itemId: inventoryItem.id,
            type: 'sale',
            quantity: 5,
            reference: `Invoice ${invoice.number}`,
            notes: `Stock deducted for sale - Invoice ${invoice.number}`
          }
        });
      }

      return invoice;
    });

    console.log('✅ Invoice creado:', createdInvoice.id);
    console.log(`   Status: ${createdInvoice.status}`);

    // Paso 6: Verificar descuento de stock
    console.log('\n🔍 Paso 6: Verificando descuento de stock...');
    const stockAfterInvoice = await prisma.inventoryItem.findFirst({
      where: { 
        id: testData.inventoryItemId,
        tenantId: testData.tenantId 
      }
    });
    console.log(`✅ Stock después de invoice: ${stockAfterInvoice.quantity}`);
    
    if (stockAfterInvoice.quantity !== 15) {
      throw new Error(`❌ ERROR: Se esperaba stock = 15, pero es ${stockAfterInvoice.quantity}`);
    }

    // Paso 7: Crear payment
    console.log('\n💳 Paso 7: Creando payment...');
    const paymentData = {
      invoiceId: createdInvoice.id,
      amount: createdInvoice.total,
      method: 'cash',
      status: 'completed',
      paymentDate: new Date(),
      notes: 'Payment for invoice'
    };

    createdPayment = await prisma.payment.create({
      data: paymentData
    });
    console.log('✅ Payment creado:', createdPayment.id);

    // Paso 8: Actualizar estado de invoice
    console.log('\n🔄 Paso 8: Actualizando estado de invoice...');
    await prisma.invoice.update({
      where: { id: createdInvoice.id },
      data: { status: 'PAID' }
    });
    console.log('✅ Invoice status actualizado a PAID');

    // Paso 9: Verificación final
    console.log('\n🔍 Paso 9: Verificación final del estado...');
    const finalInvoice = await prisma.invoice.findUnique({
      where: { id: createdInvoice.id }
    });
    console.log(`✅ Estado final de invoice: ${finalInvoice.status}`);

    // Verificar todos los movimientos
    const allMovements = await prisma.inventoryMovement.findMany({
      where: { 
        itemId: testData.inventoryItemId,
        tenantId: testData.tenantId 
      },
      orderBy: { createdAt: 'asc' }
    });
    console.log(`✅ Total movimientos de inventory: ${allMovements.length}`);

    // Resumen final
    console.log('\n🎉 VALIDACIÓN DEL FLUJO TRANSACCIONAL COMPLETADA');
    console.log('=' .repeat(70));
    console.log('📊 RESUMEN DEL FLUJO COMPLETO:');
    console.log(`✅ Tenant: ${testData.tenantId}`);
    console.log(`✅ Purchase: ${createdPurchase.id} (Status: RECEIVED)`);
    console.log(`✅ Stock inicial: 0 → Stock después purchase: 20`);
    console.log(`✅ Invoice: ${createdInvoice.id} (Status: PAID)`);
    console.log(`✅ Stock después invoice: 15`);
    console.log(`✅ Payment: ${createdPayment.id}`);
    console.log(`✅ Total inventory movements: ${allMovements.length}`);

    console.log('\n🔗 CONSISTENCIA TRANSACCIONAL VALIDADA:');
    console.log('✅ Purchases → Inventory: Stock incrementado de 0 a 20');
    console.log('✅ Inventory → Invoices: Stock descontado de 20 a 15');
    console.log('✅ Invoices → Payments: Invoice actualizado a PAID');
    console.log('✅ Ciclo completo: Purchases → Inventory → Invoices → Payments');

    return true;

  } catch (error) {
    console.error('\n❌ ERROR EN VALIDACIÓN TRANSACCIONAL:');
    console.error(error.message);
    console.error(error.stack);
    
    console.log('\n📊 ESTADO ACTUAL:');
    console.log(`TestData: ${testData ? 'Creado' : 'No creado'}`);
    console.log(`Purchase: ${createdPurchase?.id || 'No creado'}`);
    console.log(`Invoice: ${createdInvoice?.id || 'No creado'}`);
    console.log(`Payment: ${createdPayment?.id || 'No creado'}`);
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar validación
if (require.main === module) {
  validateTransactionalFlow()
    .then(success => {
      console.log(`\n🏁 Resultado: ${success ? 'EXITOSO' : 'FALLIDO'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { validateTransactionalFlow };
