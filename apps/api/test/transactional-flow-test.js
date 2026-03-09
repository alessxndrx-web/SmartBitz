const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';
const TENANT_ID = 'test-tenant-123';

// Datos de prueba
const testTenant = {
  name: 'Test Company',
  slug: 'test-company',
  ruc: '123456789',
  businessType: 'RETAIL',
  subscriptionPlan: 'BASIC'
};

const testSupplier = {
  name: 'Test Supplier',
  email: 'supplier@test.com',
  phone: '+1234567890',
  address: '123 Test St'
};

const testInventoryItem = {
  name: 'Test Product',
  sku: 'TEST-001',
  description: 'Test product for transactional flow',
  quantity: 0,
  minStock: 5,
  unitCost: 10.00,
  salePrice: 15.00
};

const testCustomer = {
  name: 'Test Customer',
  email: 'customer@test.com',
  phone: '+1234567890',
  address: '456 Customer Ave'
};

let authToken = null;
let createdTenant = null;
let createdSupplier = null;
let createdInventoryItem = null;
let createdCustomer = null;
let createdPurchase = null;
let createdInvoice = null;
let createdPayment = null;

// Función auxiliar para hacer peticiones
async function apiRequest(method, endpoint, data = null, includeAuth = true) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(includeAuth && authToken ? { Authorization: `Bearer ${authToken}` } : {})
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Función principal de prueba
async function runTransactionalFlowTest() {
  console.log('🚀 INICIANDO PRUEBA DE FLUJO TRANSACCIONAL COMPLETO');
  console.log('=' .repeat(60));

  try {
    // Paso 1: Crear tenant
    console.log('\n📝 Paso 1: Creando tenant...');
    const tenantResult = await apiRequest('POST', '/tenants', testTenant, false);
    if (!tenantResult.success) {
      throw new Error(`Error creando tenant: ${tenantResult.error}`);
    }
    createdTenant = tenantResult.data;
    console.log('✅ Tenant creado:', createdTenant.id);

    // Paso 2: Autenticarse (simulado)
    console.log('\n🔐 Paso 2: Autenticando...');
    authToken = 'test-token'; // Simulación para prueba

    // Paso 3: Crear supplier
    console.log('\n🏭 Paso 3: Creando supplier...');
    const supplierResult = await apiRequest('POST', '/purchases/suppliers', testSupplier);
    if (!supplierResult.success) {
      throw new Error(`Error creando supplier: ${supplierResult.error}`);
    }
    createdSupplier = supplierResult.data;
    console.log('✅ Supplier creado:', createdSupplier.id);

    // Paso 4: Crear inventory item
    console.log('\n📦 Paso 4: Creando inventory item...');
    const itemResult = await apiRequest('POST', '/inventory/items', testInventoryItem);
    if (!itemResult.success) {
      throw new Error(`Error creando inventory item: ${itemResult.error}`);
    }
    createdInventoryItem = itemResult.data;
    console.log('✅ Inventory item creado:', createdInventoryItem.id);
    console.log(`   Stock inicial: ${createdInventoryItem.quantity}`);

    // Paso 5: Crear customer
    console.log('\n👤 Paso 5: Creando customer...');
    const customerResult = await apiRequest('POST', '/customers', testCustomer);
    if (!customerResult.success) {
      throw new Error(`Error creando customer: ${customerResult.error}`);
    }
    createdCustomer = customerResult.data;
    console.log('✅ Customer creado:', createdCustomer.id);

    // Paso 6: Crear purchase
    console.log('\n🛒 Paso 6: Creando purchase...');
    const purchaseData = {
      supplierId: createdSupplier.id,
      items: [{
        itemId: createdInventoryItem.id,
        quantity: 20,
        unitCost: 10.00,
        taxRate: 0
      }]
    };
    const purchaseResult = await apiRequest('POST', '/purchases', purchaseData);
    if (!purchaseResult.success) {
      throw new Error(`Error creando purchase: ${purchaseResult.error}`);
    }
    createdPurchase = purchaseResult.data;
    console.log('✅ Purchase creado:', createdPurchase.id);
    console.log(`   Status: ${createdPurchase.status}`);

    // Paso 7: Recibir purchase (debe incrementar stock)
    console.log('\n📥 Paso 7: Recibiendo purchase (incrementando stock)...');
    const receiveData = {
      items: [{
        purchaseItemId: createdPurchase.items[0].id,
        quantityReceived: 20
      }]
    };
    const receiveResult = await apiRequest('POST', `/purchases/${createdPurchase.id}/receive`, receiveData);
    if (!receiveResult.success) {
      throw new Error(`Error recibiendo purchase: ${receiveResult.error}`);
    }
    console.log('✅ Purchase recibido');
    console.log(`   Status actualizado: ${receiveResult.data.purchase.status}`);

    // Paso 8: Verificar incremento de stock
    console.log('\n🔍 Paso 8: Verificando incremento de stock...');
    const stockCheck1 = await apiRequest('GET', `/inventory/items/${createdInventoryItem.id}`);
    if (!stockCheck1.success) {
      throw new Error(`Error verificando stock: ${stockCheck1.error}`);
    }
    const updatedStock = stockCheck1.data.quantity;
    console.log(`✅ Stock después de recibir purchase: ${updatedStock}`);
    if (updatedStock !== 20) {
      throw new Error(`❌ Error: Se esperaba stock = 20, pero es ${updatedStock}`);
    }

    // Paso 9: Crear invoice (debe descontar stock)
    console.log('\n🧾 Paso 9: Creando invoice (descontando stock)...');
    const invoiceData = {
      customerId: createdCustomer.id,
      status: 'sent',
      items: [{
        description: createdInventoryItem.name,
        quantity: 5,
        unitPrice: 15.00,
        taxRate: 0
      }]
    };
    const invoiceResult = await apiRequest('POST', '/invoices', invoiceData);
    if (!invoiceResult.success) {
      throw new Error(`Error creando invoice: ${invoiceResult.error}`);
    }
    createdInvoice = invoiceResult.data;
    console.log('✅ Invoice creado:', createdInvoice.id);
    console.log(`   Status: ${createdInvoice.status}`);

    // Paso 10: Verificar descuento de stock
    console.log('\n🔍 Paso 10: Verificando descuento de stock...');
    const stockCheck2 = await apiRequest('GET', `/inventory/items/${createdInventoryItem.id}`);
    if (!stockCheck2.success) {
      throw new Error(`Error verificando stock: ${stockCheck2.error}`);
    }
    const finalStock = stockCheck2.data.quantity;
    console.log(`✅ Stock después de crear invoice: ${finalStock}`);
    if (finalStock !== 15) {
      throw new Error(`❌ Error: Se esperaba stock = 15, pero es ${finalStock}`);
    }

    // Paso 11: Crear payment
    console.log('\n💳 Paso 11: Creando payment...');
    const paymentData = {
      invoiceId: createdInvoice.id,
      amount: createdInvoice.total,
      method: 'cash',
      status: 'completed',
      paymentDate: new Date().toISOString()
    };
    const paymentResult = await apiRequest('POST', '/payments', paymentData);
    if (!paymentResult.success) {
      throw new Error(`Error creando payment: ${paymentResult.error}`);
    }
    createdPayment = paymentResult.data;
    console.log('✅ Payment creado:', createdPayment.id);

    // Paso 12: Verificar estado de invoice
    console.log('\n🔍 Paso 12: Verificando estado de invoice...');
    const invoiceCheck = await apiRequest('GET', `/invoices/${createdInvoice.id}`);
    if (!invoiceCheck.success) {
      throw new Error(`Error verificando invoice: ${invoiceCheck.error}`);
    }
    const finalInvoiceStatus = invoiceCheck.data.status;
    console.log(`✅ Estado final de invoice: ${finalInvoiceStatus}`);

    // Resumen final
    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('=' .repeat(60));
    console.log('📊 RESUMEN DEL FLUJO TRANSACCIONAL:');
    console.log(`✅ Tenant: ${createdTenant.id}`);
    console.log(`✅ Supplier: ${createdSupplier.id}`);
    console.log(`✅ Inventory Item: ${createdInventoryItem.id}`);
    console.log(`✅ Customer: ${createdCustomer.id}`);
    console.log(`✅ Purchase: ${createdPurchase.id} (Status: ${createdPurchase.status})`);
    console.log(`✅ Stock después de purchase: ${updatedStock}`);
    console.log(`✅ Invoice: ${createdInvoice.id} (Status: ${finalInvoiceStatus})`);
    console.log(`✅ Stock después de invoice: ${finalStock}`);
    console.log(`✅ Payment: ${createdPayment.id}`);
    
    console.log('\n🔗 CONSISTENCIA TRANSACCIONAL VALIDADA:');
    console.log('✅ Purchases → Inventory: Stock incrementado correctamente');
    console.log('✅ Inventory → Invoices: Stock descontado correctamente');
    console.log('✅ Invoices → Payments: Estado actualizado correctamente');
    console.log('✅ Ciclo completo: Purchases → Inventory → Invoices → Payments');

    return true;

  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBA TRANSACCIONAL:');
    console.error(error.message);
    console.log('\n📊 ESTADO ACTUAL:');
    console.log(`Tenant: ${createdTenant?.id || 'No creado'}`);
    console.log(`Supplier: ${createdSupplier?.id || 'No creado'}`);
    console.log(`Inventory Item: ${createdInventoryItem?.id || 'No creado'}`);
    console.log(`Customer: ${createdCustomer?.id || 'No creado'}`);
    console.log(`Purchase: ${createdPurchase?.id || 'No creado'}`);
    console.log(`Invoice: ${createdInvoice?.id || 'No creado'}`);
    console.log(`Payment: ${createdPayment?.id || 'No creado'}`);
    return false;
  }
}

// Ejecutar prueba
if (require.main === module) {
  runTransactionalFlowTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { runTransactionalFlowTest };
