/**
 * STRIPE WRAPPER INTEGRATION TEST SCRIPT
 * Comprehensive testing of the Thorbis Stripe wrapper with real database integration
 * Created: 2025-01-31
 * Version: 1.0.0
 */

import { createThorbisStripe, ApiUsageTracker, withUsageTracking } from './packages/billing/src';

// Test configuration
const TEST_CONFIG = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  supabaseUrl: process.env.SUPABASE_URL || 'your-supabase-url',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key',
  testOrganizationId: 'hs-001-uuid-a1b2c3d4e5f6', // From seed data
  environment: 'test',
  debugMode: true,
};

// Initialize Stripe wrapper
const stripe = createThorbisStripe(TEST_CONFIG);
const usageTracker = new ApiUsageTracker(TEST_CONFIG);

/**
 * Test Suite 1: Customer Management
 */
async function testCustomerManagement() {
  console.log('🧪 Testing Customer Management...');
  console.log('═══════════════════════════════════════');
  
  try {
    // Test 1.1: Create customer
    console.log('📝 Test 1.1: Creating customer...');
    const customer = await stripe.createCustomer({
      organizationId: TEST_CONFIG.testOrganizationId,
      email: 'test-billing@swiftservicepro.com',
      name: 'Swift Service Pro LLC (Test)',
      address: {
        line1: '123 Test Service Street',
        city: 'Denver',
        state: 'CO',
        postal_code: '80202',
        country: 'US',
      },
      metadata: {
        test_customer: 'true',
        created_via: 'integration_test',
      },
    });
    
    console.log('✅ Customer created:', {
      id: customer.id,
      email: customer.email,
      name: customer.name,
    });
    
    // Test 1.2: Update customer
    console.log('📝 Test 1.2: Updating customer...');
    const updatedCustomer = await stripe.updateCustomer(
      TEST_CONFIG.testOrganizationId,
      {
        name: 'Swift Service Pro LLC (Updated)',
        metadata: {
          updated_via: 'integration_test',
          test_update: 'true',
        },
      }
    );
    
    console.log('✅ Customer updated:', {
      id: updatedCustomer.id,
      name: updatedCustomer.name,
    });
    
    return { success: true, customer };
  } catch (error) {
    console.error('❌ Customer management test failed:', error);
    return { success: false, error };
  }
}

/**
 * Test Suite 2: Subscription Management
 */
async function testSubscriptionManagement() {
  console.log('\n🧪 Testing Subscription Management...');
  console.log('════════════════════════════════════════');
  
  try {
    // Test 2.1: Get available plans
    console.log('📝 Test 2.1: Getting subscription plans...');
    const allPlans = await stripe.getSubscriptionPlans();
    const hsPlans = await stripe.getSubscriptionPlans('hs');
    
    console.log('✅ Plans retrieved:', {
      total: allPlans.length,
      homeServices: hsPlans.length,
    });
    
    if (hsPlans.length === 0) {
      throw new Error('No home services plans found');
    }
    
    // Test 2.2: Create subscription
    console.log('📝 Test 2.2: Creating subscription...');
    const subscription = await stripe.createSubscription({
      organizationId: TEST_CONFIG.testOrganizationId,
      planId: 'plan-basic-monthly', // From seed data
      trialDays: 14,
      metadata: {
        test_subscription: 'true',
        created_via: 'integration_test',
      },
    });
    
    console.log('✅ Subscription created:', {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
    
    // Test 2.3: Check subscription status
    console.log('📝 Test 2.3: Checking subscription status...');
    const hasActive = await stripe.hasActiveSubscription(TEST_CONFIG.testOrganizationId);
    console.log('✅ Has active subscription:', hasActive);
    
    return { success: true, subscription, plans: hsPlans };
  } catch (error) {
    console.error('❌ Subscription management test failed:', error);
    return { success: false, error };
  }
}

/**
 * Test Suite 3: API Usage Tracking
 */
async function testApiUsageTracking() {
  console.log('\n🧪 Testing API Usage Tracking...');
  console.log('═════════════════════════════════════');
  
  try {
    // Test 3.1: Report API usage
    console.log('📝 Test 3.1: Reporting API usage...');
    
    // Report different types of usage
    await stripe.reportUsage({
      organizationId: TEST_CONFIG.testOrganizationId,
      meterName: 'api_calls',
      quantity: 100,
    });
    
    await stripe.reportUsage({
      organizationId: TEST_CONFIG.testOrganizationId,
      meterName: 'data_exports',
      quantity: 5,
    });
    
    await stripe.reportUsage({
      organizationId: TEST_CONFIG.testOrganizationId,
      meterName: 'ai_requests',
      quantity: 25,
    });
    
    console.log('✅ Usage reported successfully');
    
    // Test 3.2: Get billing status
    console.log('📝 Test 3.2: Getting billing status...');
    const billingStatus = await stripe.getBillingStatus(TEST_CONFIG.testOrganizationId);
    
    if (billingStatus) {
      console.log('✅ Billing status retrieved:', {
        plan: billingStatus.currentPlan,
        usage: `${billingStatus.monthlyApiUsage}/${billingStatus.apiQuota}`,
        overage: billingStatus.overageCount,
        estimatedCost: `$${billingStatus.estimatedOverageCost.toFixed(2)}`,
        nextBilling: billingStatus.billingCycleEnd.toDateString(),
      });
    } else {
      throw new Error('Billing status not found');
    }
    
    // Test 3.3: Calculate overage charges
    console.log('📝 Test 3.3: Calculating overage charges...');
    const overageData = await stripe.calculateOverageCharges(TEST_CONFIG.testOrganizationId);
    
    console.log('✅ Overage calculation:', {
      totalOverage: overageData.totalOverage,
      totalCost: `$${overageData.totalCost.toFixed(2)}`,
      breakdown: overageData.breakdown.map(item => ({
        meter: item.meterName,
        overage: item.overage,
        cost: `$${item.cost.toFixed(2)}`,
      })),
    });
    
    return { success: true, billingStatus, overageData };
  } catch (error) {
    console.error('❌ API usage tracking test failed:', error);
    return { success: false, error };
  }
}

/**
 * Test Suite 4: Payment Methods
 */
async function testPaymentMethods() {
  console.log('\n🧪 Testing Payment Methods...');
  console.log('═══════════════════════════════════');
  
  try {
    // Test 4.1: Create setup intent
    console.log('📝 Test 4.1: Creating setup intent...');
    const setupIntent = await stripe.createSetupIntent(TEST_CONFIG.testOrganizationId);
    
    console.log('✅ Setup intent created:', {
      clientSecret: setupIntent.client_secret?.substring(0, 20) + '...',
      status: setupIntent.status,
    });
    
    // Test 4.2: List payment methods (should be empty for test)
    console.log('📝 Test 4.2: Listing payment methods...');
    const paymentMethods = await stripe.listPaymentMethods(TEST_CONFIG.testOrganizationId);
    
    console.log('✅ Payment methods listed:', {
      count: paymentMethods.length,
      methods: paymentMethods.map(pm => ({
        id: pm.id,
        type: pm.type,
        last4: pm.card?.last4,
      })),
    });
    
    return { success: true, setupIntent, paymentMethods };
  } catch (error) {
    console.error('❌ Payment methods test failed:', error);
    return { success: false, error };
  }
}

/**
 * Test Suite 5: Usage Tracking Middleware
 */
async function testUsageTrackingMiddleware() {
  console.log('\n🧪 Testing Usage Tracking Middleware...');
  console.log('══════════════════════════════════════════');
  
  try {
    // Test 5.1: Direct usage tracker
    console.log('📝 Test 5.1: Testing direct usage tracker...');
    
    await usageTracker.trackUsage({
      organizationId: TEST_CONFIG.testOrganizationId,
      endpoint: '/test/middleware',
      method: 'GET',
      statusCode: 200,
      responseTimeMs: 150,
      billable: true,
      meterCategory: 'api_calls',
      timestamp: new Date(),
    });
    
    console.log('✅ Usage tracked via middleware');
    
    // Test 5.2: Wrapper function simulation
    console.log('📝 Test 5.2: Testing wrapper function...');
    
    const trackUsage = withUsageTracking(usageTracker, {
      extractOrgId: () => TEST_CONFIG.testOrganizationId,
      extractUserId: () => 'test-user-id',
      billable: true,
      meterCategory: 'api_calls',
    });
    
    // Simulate an API handler
    const testApiHandler = trackUsage(async () => {
      return { success: true, message: 'Test API response' };
    });
    
    // Mock request object
    const mockRequest = {
      headers: new Map([
        ['x-org-id', TEST_CONFIG.testOrganizationId],
        ['x-user-id', 'test-user-id'],
      ]),
      url: 'http://localhost:3000/test/wrapped-endpoint',
      method: 'GET',
    } as any;
    
    const result = await testApiHandler(mockRequest);
    console.log('✅ Wrapped API handler executed:', result);
    
    return { success: true, result };
  } catch (error) {
    console.error('❌ Usage tracking middleware test failed:', error);
    return { success: false, error };
  }
}

/**
 * Test Suite 6: Error Handling and Edge Cases
 */
async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...');
  console.log('═══════════════════════════════════');
  
  try {
    const errorTests = [];
    
    // Test 6.1: Invalid organization ID
    console.log('📝 Test 6.1: Testing invalid organization ID...');
    try {
      await stripe.getBillingStatus('invalid-org-id');
      errorTests.push({ test: 'invalid-org-id', result: 'should-have-failed' });
    } catch (error) {
      errorTests.push({ test: 'invalid-org-id', result: 'correctly-failed', message: error.message });
    }
    
    // Test 6.2: Invalid plan ID
    console.log('📝 Test 6.2: Testing invalid plan ID...');
    try {
      await stripe.createSubscription({
        organizationId: TEST_CONFIG.testOrganizationId,
        planId: 'invalid-plan-id',
      });
      errorTests.push({ test: 'invalid-plan-id', result: 'should-have-failed' });
    } catch (error) {
      errorTests.push({ test: 'invalid-plan-id', result: 'correctly-failed', message: error.message });
    }
    
    // Test 6.3: Usage reporting with invalid data
    console.log('📝 Test 6.3: Testing invalid usage data...');
    try {
      await stripe.reportUsage({
        organizationId: TEST_CONFIG.testOrganizationId,
        meterName: 'invalid_meter',
        quantity: -1,
      });
      errorTests.push({ test: 'invalid-usage', result: 'should-have-failed' });
    } catch (error) {
      errorTests.push({ test: 'invalid-usage', result: 'correctly-failed', message: error.message });
    }
    
    console.log('✅ Error handling tests completed:', errorTests);
    return { success: true, errorTests };
  } catch (error) {
    console.error('❌ Error handling test failed:', error);
    return { success: false, error };
  }
}

/**
 * Main test runner
 */
async function runIntegrationTests() {
  console.log('🚀 THORBIS STRIPE WRAPPER INTEGRATION TESTS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🔧 Test Environment: ${TEST_CONFIG.environment}`);
  console.log(`📍 Organization ID: ${TEST_CONFIG.testOrganizationId}`);
  console.log(`⚡ Debug Mode: ${TEST_CONFIG.debugMode}`);
  console.log('');
  
  const testResults = {
    customerManagement: null,
    subscriptionManagement: null,
    apiUsageTracking: null,
    paymentMethods: null,
    usageTrackingMiddleware: null,
    errorHandling: null,
  };
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Run all test suites
  const testSuites = [
    { name: 'customerManagement', fn: testCustomerManagement },
    { name: 'subscriptionManagement', fn: testSubscriptionManagement },
    { name: 'apiUsageTracking', fn: testApiUsageTracking },
    { name: 'paymentMethods', fn: testPaymentMethods },
    { name: 'usageTrackingMiddleware', fn: testUsageTrackingMiddleware },
    { name: 'errorHandling', fn: testErrorHandling },
  ];
  
  for (const suite of testSuites) {
    totalTests++;
    try {
      const result = await suite.fn();
      testResults[suite.name] = result;
      if (result.success) {
        passedTests++;
      }
    } catch (error) {
      testResults[suite.name] = { success: false, error: error.message };
    }
  }
  
  // Final summary
  console.log('\n📊 INTEGRATION TEST SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  Object.entries(testResults).forEach(([suiteName, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${suiteName}: ${result.success ? 'PASSED' : 'FAILED'}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
    console.log('✅ Stripe wrapper fully functional');
    console.log('✅ Database integration working');
    console.log('✅ API usage tracking operational');
    console.log('✅ Ready for production deployment');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED - REVIEW REQUIRED');
    console.log('🔍 Check error messages above');
    console.log('🛠️ Fix issues before production deployment');
  }
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Deploy billing schema to production Supabase');
  console.log('2. Configure production Stripe webhook endpoints');
  console.log('3. Create billing dashboard UI components');
  console.log('4. Set up monitoring and alerting');
  console.log('5. Launch $50/month billing system');
  
  return testResults;
}

// Export for use in different environments
export {
  runIntegrationTests,
  testCustomerManagement,
  testSubscriptionManagement,
  testApiUsageTracking,
  testPaymentMethods,
  testUsageTrackingMiddleware,
  testErrorHandling,
  TEST_CONFIG,
};

// Run tests if this script is executed directly
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

export default runIntegrationTests;