const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3001/api';

// Test data for two different tenants
const TENANT_A = {
  name: 'Barbería Test A',
  slug: 'barberia-test-a',
  ruc: '12345678901',
  businessType: 'BARBERSHOP',
  user: {
    email: 'owner@tenantA.com',
    fullName: 'Owner Tenant A',
    password: 'password123'
  },
  customer: {
    fullName: 'Customer A',
    email: 'customer@tenantA.com',
    phone: '123456789'
  }
};

const TENANT_B = {
  name: 'Restaurante Test B',
  slug: 'restaurante-test-b',
  ruc: '98765432109',
  businessType: 'RESTAURANT',
  user: {
    email: 'owner@tenantB.com',
    fullName: 'Owner Tenant B',
    password: 'password123'
  },
  customer: {
    fullName: 'Customer B',
    email: 'customer@tenantB.com',
    phone: '987654321'
  }
};

let tenantA, tenantB, userA, userB, tokenA, tokenB;
let customerA, customerB;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };
    
    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

async function setupTestData() {
  console.log('🔧 Setting up test data...');
  
  // Create tenants
  const tenantAResult = await makeRequest('POST', '/tenants', TENANT_A);
  if (tenantAResult.success) {
    tenantA = tenantAResult.data;
    console.log('✅ Tenant A created');
  } else {
    console.log('❌ Failed to create Tenant A:', tenantAResult.error);
    return false;
  }
  
  const tenantBResult = await makeRequest('POST', '/tenants', TENANT_B);
  if (tenantBResult.success) {
    tenantB = tenantBResult.data;
    console.log('✅ Tenant B created');
  } else {
    console.log('❌ Failed to create Tenant B:', tenantBResult.error);
    return false;
  }
  
  // Create users (if endpoint exists)
  const userAResult = await makeRequest('POST', '/auth/register', {
    ...TENANT_A.user,
    tenantId: tenantA.id
  });
  
  const userBResult = await makeRequest('POST', '/auth/register', {
    ...TENANT_B.user,
    tenantId: tenantB.id
  });
  
  // Try to login
  const loginAResult = await makeRequest('POST', '/auth/login', {
    email: TENANT_A.user.email,
    password: TENANT_A.user.password
  });
  
  if (loginAResult.success) {
    tokenA = loginAResult.data.accessToken;
    console.log('✅ User A logged in');
  } else {
    console.log('⚠️ User A login failed, using mock token');
    tokenA = 'mock-token-tenantA';
  }
  
  const loginBResult = await makeRequest('POST', '/auth/login', {
    email: TENANT_B.user.email,
    password: TENANT_B.user.password
  });
  
  if (loginBResult.success) {
    tokenB = loginBResult.data.accessToken;
    console.log('✅ User B logged in');
  } else {
    console.log('⚠️ User B login failed, using mock token');
    tokenB = 'mock-token-tenantB';
  }
  
  // Create customers
  const customerAResult = await makeRequest('POST', '/customers', TENANT_A.customer, tokenA);
  if (customerAResult.success) {
    customerA = customerAResult.data;
    console.log('✅ Customer A created');
  } else {
    console.log('❌ Failed to create Customer A:', customerAResult.error);
    return false;
  }
  
  const customerBResult = await makeRequest('POST', '/customers', TENANT_B.customer, tokenB);
  if (customerBResult.success) {
    customerB = customerBResult.data;
    console.log('✅ Customer B created');
  } else {
    console.log('❌ Failed to create Customer B:', customerBResult.error);
    return false;
  }
  
  return true;
}

async function runIsolationTests() {
  console.log('\n🧪 Running Multi-Tenant Isolation Tests...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Tenant A cannot access Tenant B customer by ID
  totalTests++;
  console.log('🔍 Test 1: Tenant A accessing Tenant B customer by ID');
  const result1 = await makeRequest('GET', `/customers/${customerB.id}`, null, tokenA);
  if (!result1.success && result1.status === 404) {
    console.log('✅ PASS: Tenant A cannot access Tenant B customer');
    passedTests++;
  } else {
    console.log('❌ FAIL: Tenant A should not access Tenant B customer');
    console.log('   Response:', result1);
  }
  
  // Test 2: Tenant A cannot update Tenant B customer
  totalTests++;
  console.log('\n🔍 Test 2: Tenant A updating Tenant B customer');
  const result2 = await makeRequest('PATCH', `/customers/${customerB.id}`, { fullName: 'Hacked Name' }, tokenA);
  if (!result2.success && result2.status === 404) {
    console.log('✅ PASS: Tenant A cannot update Tenant B customer');
    passedTests++;
  } else {
    console.log('❌ FAIL: Tenant A should not update Tenant B customer');
    console.log('   Response:', result2);
  }
  
  // Test 3: Tenant A cannot delete Tenant B customer
  totalTests++;
  console.log('\n🔍 Test 3: Tenant A deleting Tenant B customer');
  const result3 = await makeRequest('DELETE', `/customers/${customerB.id}`, null, tokenA);
  if (!result3.success && result3.status === 404) {
    console.log('✅ PASS: Tenant A cannot delete Tenant B customer');
    passedTests++;
  } else {
    console.log('❌ FAIL: Tenant A should not delete Tenant B customer');
    console.log('   Response:', result3);
  }
  
  // Test 4: Tenant A can access their own customer
  totalTests++;
  console.log('\n🔍 Test 4: Tenant A accessing their own customer');
  const result4 = await makeRequest('GET', `/customers/${customerA.id}`, null, tokenA);
  if (result4.success) {
    console.log('✅ PASS: Tenant A can access their own customer');
    passedTests++;
  } else {
    console.log('❌ FAIL: Tenant A should access their own customer');
    console.log('   Response:', result4);
  }
  
  // Test 5: List customers - should only show tenant's own customers
  totalTests++;
  console.log('\n🔍 Test 5: Tenant A listing customers');
  const result5 = await makeRequest('GET', '/customers', null, tokenA);
  if (result5.success) {
    const customers = result5.data.customers || result5.data;
    const hasTenantBCustomer = customers.some(c => c.id === customerB.id);
    if (!hasTenantBCustomer) {
      console.log('✅ PASS: Tenant A list does not include Tenant B customers');
      passedTests++;
    } else {
      console.log('❌ FAIL: Tenant A list should not include Tenant B customers');
      console.log('   Customers found:', customers.map(c => ({ id: c.id, fullName: c.fullName })));
    }
  } else {
    console.log('❌ FAIL: Could not list customers for Tenant A');
    console.log('   Response:', result5);
  }
  
  // Summary
  console.log('\n📊 TEST RESULTS');
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED - Multi-Tenant Isolation is WORKING!');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED - Multi-Tenant Isolation has ISSUES!');
  }
  
  return passedTests === totalTests;
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  // Clean up in reverse order
  if (customerA) {
    await makeRequest('DELETE', `/customers/${customerA.id}`, null, tokenA);
  }
  if (customerB) {
    await makeRequest('DELETE', `/customers/${customerB.id}`, null, tokenB);
  }
  
  console.log('✅ Cleanup completed');
}

async function main() {
  console.log('🚀 Starting Multi-Tenant Isolation Validation\n');
  
  try {
    // Check if server is running
    const healthCheck = await makeRequest('GET', '/tenants');
    if (healthCheck.status !== 401) {
      console.log('❌ Server is not running or not accessible at', BASE_URL);
      console.log('Please start the server with: npm run dev');
      return;
    }
    
    // Setup test data
    const setupSuccess = await setupTestData();
    if (!setupSuccess) {
      console.log('❌ Failed to setup test data');
      return;
    }
    
    // Wait a bit for data to be processed
    await sleep(1000);
    
    // Run isolation tests
    const allTestsPassed = await runIsolationTests();
    
    // Cleanup
    await cleanup();
    
    // Final result
    if (allTestsPassed) {
      console.log('\n✨ VALIDATION COMPLETE: Multi-Tenant Isolation is SECURE');
      process.exit(0);
    } else {
      console.log('\n🚨 VALIDATION FAILED: Multi-Tenant Isolation has VULNERABILITIES');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
main();
