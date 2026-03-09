const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3001/api';

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

async function runBasicIsolationTests() {
  console.log('🧪 Running Basic Multi-Tenant Isolation Tests...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Verify server is running and requires authentication
  totalTests++;
  console.log('🔍 Test 1: Server requires authentication');
  const result1 = await makeRequest('GET', '/tenants');
  if (!result1.success && result1.status === 401) {
    console.log('✅ PASS: Server correctly requires authentication');
    passedTests++;
  } else {
    console.log('❌ FAIL: Server should require authentication');
    console.log('   Response:', result1);
  }
  
  // Test 2: Verify protected endpoints without token
  totalTests++;
  console.log('\n🔍 Test 2: Protected endpoints without token');
  const result2 = await makeRequest('GET', '/customers');
  if (!result2.success && result2.status === 401) {
    console.log('✅ PASS: Customers endpoint requires authentication');
    passedTests++;
  } else {
    console.log('❌ FAIL: Customers endpoint should require authentication');
    console.log('   Response:', result2);
  }
  
  // Test 3: Verify protected endpoints with invalid token
  totalTests++;
  console.log('\n🔍 Test 3: Protected endpoints with invalid token');
  const result3 = await makeRequest('GET', '/customers', null, 'invalid-token');
  if (!result3.success && result3.status === 401) {
    console.log('✅ PASS: Invalid token is rejected');
    passedTests++;
  } else {
    console.log('❌ FAIL: Invalid token should be rejected');
    console.log('   Response:', result3);
  }
  
  // Test 4: Verify multiple protected endpoints
  totalTests++;
  console.log('\n🔍 Test 4: Multiple endpoints require authentication');
  const endpoints = ['/invoices', '/inventory/items', '/purchases', '/support', '/files'];
  let allProtected = true;
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', endpoint);
    if (!(!result.success && result.status === 401)) {
      allProtected = false;
      console.log(`   ❌ ${endpoint} is not properly protected`);
    }
  }
  
  if (allProtected) {
    console.log('✅ PASS: All endpoints require authentication');
    passedTests++;
  }
  
  // Summary
  console.log('\n📊 BASIC SECURITY TEST RESULTS');
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL SECURITY TESTS PASSED - Basic Authentication Working!');
    console.log('🔐 Multi-tenant isolation foundation is properly secured.');
  } else {
    console.log('\n⚠️ SOME SECURITY TESTS FAILED - Authentication Issues Detected!');
  }
  
  return passedTests === totalTests;
}

async function main() {
  console.log('🚀 Starting Basic Multi-Tenant Security Validation\n');
  
  try {
    const allTestsPassed = await runBasicIsolationTests();
    
    // Final result
    if (allTestsPassed) {
      console.log('\n✨ VALIDATION COMPLETE: Security Foundation SECURE');
      console.log('📝 Next Step: Implement user authentication and test tenant isolation');
      process.exit(0);
    } else {
      console.log('\n🚨 VALIDATION FAILED: Security Foundation has ISSUES!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
main();
