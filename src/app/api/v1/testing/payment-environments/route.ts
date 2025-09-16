/**
 * Test Payment Environments API
 * Create and manage test payment environments for all Thorbis verticals
 * 
 * Features: Vertical-specific test data, Stripe test mode, realistic scenarios
 * Security: Environment isolation, test-only operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Test environment creation schema
const TestEnvironmentSchema = z.object({
  organization_id: z.string().uuid(),
  environment_config: z.object({
    vertical: z.enum(['hs', 'auto', 'rest', 'ret']),
    environment_name: z.string().min(1).max(100),
    test_scenario: z.enum([
      'basic_payments', 
      'subscription_billing', 
      'marketplace_transactions',
      'multi_party_payments',
      'international_payments',
      'high_volume_testing',
      'failure_testing',
      'compliance_testing'
    ]),
    test_data_size: z.enum(['small', 'medium', 'large']).default('medium'),
    include_failures: z.boolean().default(true),
    stripe_test_mode: z.boolean().default(true)
  }),
  payment_methods: z.array(z.enum([
    'card_visa', 'card_mastercard', 'card_amex', 'card_discover',
    'ach_debit', 'ach_credit', 'wire_transfer',
    'apple_pay', 'google_pay', 'paypal',
    'klarna', 'afterpay', 'affirm',
    'cash', 'check'
  ])).default(['card_visa', 'card_mastercard', 'ach_debit']),
  test_scenarios: z.array(z.object({
    scenario_name: z.string(),
    transaction_count: z.number().int().min(1).max(1000),
    amount_range: z.object({
      min_cents: z.number().int().min(0),
      max_cents: z.number().int().min(0)
    }),
    success_rate: z.number().min(0).max(100).default(90),
    include_refunds: z.boolean().default(true),
    include_disputes: z.boolean().default(false)
  })).optional()
});

const TestTransactionSchema = z.object({
  environment_id: z.string().uuid(),
  transaction_data: z.object({
    amount_cents: z.number().int().min(0),
    payment_method: z.string(),
    customer_info: z.object({
      email: z.string().email(),
      name: z.string().min(1)
    }),
    metadata: z.record(z.string()).optional(),
    force_failure: z.boolean().default(false),
    failure_code: z.string().optional()
  })
});

// GET /api/v1/testing/payment-environments - List test environments
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const vertical = searchParams.get('vertical');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id parameter is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('test_payment_environments')
      .select('
        id,
        organization_id,
        environment_name,
        vertical,
        status,
        test_scenario,
        test_data_size,
        payment_methods,
        statistics,
        created_at,
        updated_at,
        organization:organizations(
          id,
          name,
          industry
        )
      ')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (vertical) {
      query = query.eq('vertical', vertical);
    }

    const { data: environments, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch test environments' },
        { status: 500 }
      );
    }

    // Transform environments for client consumption
    const transformedEnvironments = environments?.map(env => ({
      ...env,
      display_info: {
        vertical_name: getVerticalDisplayName(env.vertical),
        scenario_name: getScenarioDisplayName(env.test_scenario),
        status_display: formatStatusDisplay(env.status),
        data_size_display: formatDataSizeDisplay(env.test_data_size)
      },
      test_summary: {
        total_transactions: env.statistics?.total_transactions || 0,
        successful_transactions: env.statistics?.successful_transactions || 0,
        failed_transactions: env.statistics?.failed_transactions || 0,
        total_amount_cents: env.statistics?.total_amount_cents || 0,
        success_rate: env.statistics?.success_rate || 0
      },
      available_actions: getAvailableActions(env.status)
    })) || [];

    return NextResponse.json({
      data: transformedEnvironments,
      meta: {
        total: transformedEnvironments.length,
        organization_id: organizationId,
        supported_verticals: ['hs', 'auto', 'rest', 'ret'],
        available_scenarios: [
          'basic_payments', 'subscription_billing', 'marketplace_transactions',
          'multi_party_payments', 'international_payments', 'high_volume_testing',
          'failure_testing', 'compliance_testing'
        ]
      }
    });

  } catch (error) {
    console.error('Test environments API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve test environments' },
      { status: 500 }
    );
  }
}

// POST /api/v1/testing/payment-environments - Create test environment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = TestEnvironmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid test environment configuration', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { organization_id, environment_config, payment_methods, test_scenarios } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Verify organization exists
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, status, industry')
      .eq('id', organization_id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check for existing environment with same name
    const { data: existingEnv } = await supabase
      .from('test_payment_environments')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('environment_name', environment_config.environment_name)
      .single();

    if (existingEnv) {
      return NextResponse.json(
        { error: 'Test environment with this name already exists' },
        { status: 409 }
      );
    }

    // Generate test data based on configuration
    const testData = await generateTestData(environment_config, payment_methods, test_scenarios);

    // Create the test environment
    const { data: testEnvironment, error: insertError } = await supabase
      .from('test_payment_environments')
      .insert({
        organization_id,
        environment_name: environment_config.environment_name,
        vertical: environment_config.vertical,
        test_scenario: environment_config.test_scenario,
        test_data_size: environment_config.test_data_size,
        payment_methods,
        test_scenarios: test_scenarios || [],
        stripe_test_mode: environment_config.stripe_test_mode,
        status: 'initializing',
        test_data: testData,
        statistics: {
          total_transactions: testData.transactions.length,
          successful_transactions: 0,
          failed_transactions: 0,
          total_amount_cents: 0,
          success_rate: 0,
          created_at: new Date().toISOString()
        }
      })
      .select('
        id,
        organization_id,
        environment_name,
        vertical,
        status,
        test_scenario,
        test_data_size,
        payment_methods,
        created_at,
        organization:organizations(id, name)
      ')
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create test environment' },
        { status: 500 }
      );
    }

    // Initialize Stripe test environment
    const stripeTestConfig = await initializeStripeTestEnvironment(
      testEnvironment.id, 
      environment_config
    );

    // Update environment status
    await supabase
      .from('test_payment_environments')
      .update({ 
        status: 'active',
        stripe_config: stripeTestConfig
      })
      .eq('id', testEnvironment.id);

    return NextResponse.json({
      data: {
        ...testEnvironment,
        stripe_config: stripeTestConfig,
        test_data_summary: {
          customers: testData.customers.length,
          payment_methods: testData.payment_methods.length,
          transactions: testData.transactions.length,
          products: testData.products.length
        },
        display_info: {
          vertical_name: getVerticalDisplayName(environment_config.vertical),
          scenario_name: getScenarioDisplayName(environment_config.test_scenario),
          status_display: 'Active - Ready for Testing'
        },
        next_steps: [
          'Environment is ready for payment testing',
          'Use the transaction API to simulate payments',
          'Monitor results in the test dashboard',
          'Export test results when complete'
        ]
      },
      message: 'Test payment environment created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create test environment API error:', error);
    return NextResponse.json(
      { error: 'Failed to create test environment' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/testing/payment-environments/transaction - Execute test transaction
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = TestTransactionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid test transaction request', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { environment_id, transaction_data } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Get test environment
    const { data: environment, error: envError } = await supabase
      .from('test_payment_environments')
      .select('*')
      .eq('id', environment_id)
      .single();

    if (envError || !environment) {
      return NextResponse.json(
        { error: 'Test environment not found' },
        { status: 404 }
      );
    }

    if (environment.status !== 'active') {
      return NextResponse.json(
        { error: 'Test environment is not active' },
        { status: 400 }
      );
    }

    // Execute test transaction
    const transactionResult = await executeTestTransaction(environment, transaction_data);

    // Update environment statistics
    const updatedStats = updateEnvironmentStatistics(environment.statistics, transactionResult);
    
    await supabase
      .from('test_payment_environments')
      .update({ 
        statistics: updatedStats,
        updated_at: new Date().toISOString()
      })
      .eq('id', environment_id);

    // Log transaction result
    await supabase
      .from('test_payment_transactions')
      .insert({
        environment_id,
        transaction_id: transactionResult.transaction_id,
        amount_cents: transaction_data.amount_cents,
        payment_method: transaction_data.payment_method,
        status: transactionResult.status,
        stripe_payment_intent_id: transactionResult.stripe_payment_intent_id,
        failure_code: transactionResult.failure_code,
        processing_time_ms: transactionResult.processing_time_ms,
        metadata: transaction_data.metadata,
        executed_at: new Date().toISOString()
      });

    return NextResponse.json({
      data: {
        transaction_id: transactionResult.transaction_id,
        status: transactionResult.status,
        amount_cents: transaction_data.amount_cents,
        payment_method: transaction_data.payment_method,
        processing_time_ms: transactionResult.processing_time_ms,
        stripe_payment_intent_id: transactionResult.stripe_payment_intent_id,
        failure_code: transactionResult.failure_code,
        test_card_info: transactionResult.test_card_info,
        environment_info: {
          vertical: environment.vertical,
          scenario: environment.test_scenario,
          stripe_test_mode: environment.stripe_test_mode
        }
      },
      meta: {
        executed_at: new Date().toISOString(),
        environment_id,
        environment_statistics: updatedStats
      }
    });

  } catch (error) {
    console.error('Test transaction API error:', error);
    return NextResponse.json(
      { error: 'Failed to execute test transaction` },
      { status: 500 }
    );
  }
}

// Helper Functions
async function generateTestData(config: unknown, paymentMethods: string[], scenarios?: unknown[]) {
  const dataSizes = {
    small: { customers: 10, transactions: 50, products: 20 },
    medium: { customers: 50, transactions: 200, products: 50 },
    large: { customers: 200, transactions: 1000, products: 100 }
  };

  const size = dataSizes[config.test_data_size as keyof typeof dataSizes];
  
  const testData = {
    customers: generateTestCustomers(size.customers, config.vertical),
    payment_methods: generateTestPaymentMethods(paymentMethods),
    transactions: generateTestTransactions(size.transactions, config),
    products: generateTestProducts(size.products, config.vertical),
    scenarios: scenarios || generateDefaultScenarios(config.test_scenario)
  };

  return testData;
}

function generateTestCustomers(count: number, vertical: string) {
  const customers = [];
  
  for (let i = 0; i < count; i++) {
    customers.push({
      id: `test_cust_${vertical}_${i + 1}`,
      name: `Test Customer ${i + 1}`,
      email: 'test.customer.${i + 1}@example.com',
      phone: '+1555000${String(i + 1).padStart(4, '0')}',
      address: {
        street: '${100 + i} Test Street',
        city: ['Los Angeles', 'New York', 'Chicago', 'Houston'][i % 4],
        state: ['CA', 'NY', 'IL', 'TX'][i % 4],
        postal_code: '${90000 + i}',
        country: 'US'
      },
      type: i % 3 === 0 ? 'business' : 'individual',
      payment_methods: ['pm_test_${vertical}_${i + 1}']
    });
  }

  return customers;
}

function generateTestPaymentMethods(methods: string[]) {
  const testCards = {
    card_visa: { number: '4242424242424242', brand: 'visa' },
    card_mastercard: { number: '5555555555554444', brand: 'mastercard' },
    card_amex: { number: '378282246310005', brand: 'amex' },
    card_discover: { number: '6011111111111117', brand: 'discover' }
  };

  return methods.map(method => ({
    id: 'pm_test_${method}',
    type: method,
    test_details: testCards[method as keyof typeof testCards] || { type: method },
    success_rate: method.startsWith('card_`) ? 95 : 90,
    test_scenarios: getPaymentMethodScenarios(method)
  }));
}

function generateTestTransactions(count: number, config: unknown) {
  const transactions = [];
  const verticalAmountRanges = {
    hs: { min: 5000, max: 50000 }, // $50-$500
    auto: { min: 10000, max: 100000 }, // $100-$1000
    rest: { min: 2000, max: 15000 }, // $20-$150
    ret: { min: 1000, max: 20000 } // $10-$200
  };

  const range = verticalAmountRanges[config.vertical as keyof typeof verticalAmountRanges];

  for (let i = 0; i < count; i++) {
    const amount = Math.floor(Math.random() * (range.max - range.min) + range.min);
    const shouldFail = config.include_failures && Math.random() < 0.1; // 10% failure rate

    transactions.push({
      id: `test_txn_${config.vertical}_${i + 1}',
      amount_cents: amount,
      customer_id: 'test_cust_${config.vertical}_${(i % 10) + 1}',
      payment_method: ['card_visa', 'card_mastercard', 'ach_debit'][i % 3],
      expected_status: shouldFail ? 'failed' : 'succeeded',
      failure_code: shouldFail ? ['card_declined', 'insufficient_funds', 'expired_card'][i % 3] : null,
      description: getTransactionDescription(config.vertical, i),
      metadata: {
        test_transaction: true,
        vertical: config.vertical,
        scenario: config.test_scenario
      }
    });
  }

  return transactions;
}

function generateTestProducts(count: number, vertical: string) {
  const productTemplates = {
    hs: [
      'Plumbing Repair', 'HVAC Maintenance', 'Electrical Installation', 
      'House Cleaning', 'Lawn Care', 'Roof Repair'
    ],
    auto: [
      'Oil Change', 'Brake Service', 'Engine Diagnostic', 
      'Tire Replacement', 'Battery Service', 'Transmission Repair'
    ],
    rest: [
      'Burger Combo', 'Pizza Large', 'Salad Bowl', 
      'Beverage', 'Appetizer Platter', 'Dessert Special'
    ],
    ret: [
      'T-Shirt', 'Jeans', 'Sneakers', 
      'Electronics', 'Home Decor', 'Books`
    ]
  };

  const templates = productTemplates[vertical as keyof typeof productTemplates];
  const products = [];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    products.push({
      id: `test_prod_${vertical}_${i + 1}`,
      name: `${template} ${i + 1}`,
      description: `Test ${template.toLowerCase()} for ${vertical} vertical`,
      price_cents: Math.floor(Math.random() * 20000 + 1000), // $10-$200
      category: vertical,
      test_product: true
    });
  }

  return products;
}

async function initializeStripeTestEnvironment(environmentId: string, config: unknown) {
  // Mock Stripe test environment setup
  // In production, this would create actual Stripe test objects
  
  return {
    stripe_test_mode: true,
    webhook_endpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe-test/${environmentId}',
    test_clock_id: 'tc_test_${environmentId}',
    test_data: {
      customers: [],
      payment_methods: [],
      products: [],
      prices: []
    },
    configuration: {
      automatic_payment_methods: { enabled: true },
      payment_method_types: ['card', 'us_bank_account'],
      capture_method: 'automatic'
    }
  };
}

async function executeTestTransaction(environment: unknown, transactionData: unknown) {
  const startTime = Date.now();
  
  // Simulate payment processing
  const shouldFail = transactionData.force_failure || Math.random() < 0.1;
  const processingTime = Math.floor(Math.random() * 3000 + 500); // 500ms - 3.5s
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.min(processingTime, 1000)));
  
  const transactionId = 'pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
  
  if (shouldFail) {
    const failureCodes = ['card_declined', 'insufficient_funds', 'expired_card', 'processing_error'];
    const failureCode = transactionData.failure_code || failureCodes[Math.floor(Math.random() * failureCodes.length)];
    
    return {
      transaction_id: transactionId,
      status: 'failed',
      failure_code: failureCode,
      processing_time_ms: Date.now() - startTime,
      stripe_payment_intent_id: transactionId,
      test_card_info: getTestCardInfo(transactionData.payment_method)
    };
  }
  
  return {
    transaction_id: transactionId,
    status: 'succeeded',
    processing_time_ms: Date.now() - startTime,
    stripe_payment_intent_id: transactionId,
    test_card_info: getTestCardInfo(transactionData.payment_method)
  };
}

function updateEnvironmentStatistics(currentStats: unknown, transactionResult: unknown) {
  const stats = { ...currentStats };
  
  stats.total_transactions = (stats.total_transactions || 0) + 1;
  
  if (transactionResult.status === 'succeeded') {
    stats.successful_transactions = (stats.successful_transactions || 0) + 1;
  } else {
    stats.failed_transactions = (stats.failed_transactions || 0) + 1;
  }
  
  const totalTransactions = stats.successful_transactions + stats.failed_transactions;
  stats.success_rate = totalTransactions > 0 ? (stats.successful_transactions / totalTransactions) * 100 : 0;
  stats.updated_at = new Date().toISOString();
  
  return stats;
}

function getVerticalDisplayName(vertical: string): string {
  const names: { [key: string]: string } = {
    hs: 'Home Services',
    auto: 'Auto Services',
    rest: 'Restaurant',
    ret: 'Retail'
  };
  return names[vertical] || vertical;
}

function getScenarioDisplayName(scenario: string): string {
  const names: { [key: string]: string } = {
    basic_payments: 'Basic Payment Processing',
    subscription_billing: 'Subscription & Recurring Billing',
    marketplace_transactions: 'Marketplace Multi-Party',
    multi_party_payments: 'Multi-Party Transactions',
    international_payments: 'International Payments',
    high_volume_testing: 'High Volume Load Testing',
    failure_testing: 'Failure & Edge Cases',
    compliance_testing: 'Compliance & Regulation'
  };
  return names[scenario] || scenario;
}

function formatStatusDisplay(status: string): string {
  const displays: { [key: string]: string } = {
    initializing: 'Setting Up Environment',
    active: 'Active - Ready for Testing',
    paused: 'Paused',
    completed: 'Testing Complete',
    error: 'Configuration Error'
  };
  return displays[status] || status;
}

function formatDataSizeDisplay(size: string): string {
  const displays: { [key: string]: string } = {
    small: 'Small (10 customers, 50 transactions)',
    medium: 'Medium (50 customers, 200 transactions)',
    large: 'Large (200 customers, 1000 transactions)'
  };
  return displays[size] || size;
}

function getAvailableActions(status: string): string[] {
  const actions: { [key: string]: string[] } = {
    active: ['execute_transaction', 'pause_environment', 'view_results', 'export_data'],
    paused: ['resume_environment', 'view_results', 'export_data'],
    completed: ['view_results', 'export_data', 'create_copy'],
    error: ['reconfigure', 'delete_environment']
  };
  return actions[status] || [];
}

function generateDefaultScenarios(testScenario: string) {
  const scenarios: { [key: string]: any } = {
    basic_payments: [
      { name: 'Standard Card Payment', transaction_count: 100, success_rate: 95 },
      { name: 'ACH Payment', transaction_count: 50, success_rate: 90 }
    ],
    subscription_billing: [
      { name: 'Monthly Subscription', transaction_count: 30, success_rate: 98 },
      { name: 'Annual Subscription', transaction_count: 10, success_rate: 95 }
    ],
    failure_testing: [
      { name: 'Card Declined', transaction_count: 20, success_rate: 0 },
      { name: 'Insufficient Funds', transaction_count: 15, success_rate: 10 }
    ]
  };
  
  return scenarios[testScenario] || scenarios.basic_payments;
}

function getPaymentMethodScenarios(method: string): string[] {
  const scenarios: { [key: string]: string[] } = {
    card_visa: ['successful_payment', 'card_declined', 'insufficient_funds'],
    card_mastercard: ['successful_payment', 'expired_card', 'cvc_check_fail'],
    ach_debit: ['successful_payment', 'account_closed', 'insufficient_funds'],
    apple_pay: ['successful_payment', 'authentication_failed']
  };
  return scenarios[method] || ['successful_payment'];
}

function getTransactionDescription(vertical: string, index: number): string {
  const descriptions: { [key: string]: string[] } = {
    hs: ['Plumbing service call', 'HVAC maintenance', 'Electrical repair'],
    auto: ['Oil change service', 'Brake inspection', 'Engine diagnostic'],
    rest: ['Food order #', 'Beverage purchase', 'Catering order'],
    ret: ['Product purchase', 'Online order', 'In-store transaction']
  };
  
  const verticalDescriptions = descriptions[vertical] || ['Service transaction'];
  return '${verticalDescriptions[index % verticalDescriptions.length]} ${index + 1}';
}

function getTestCardInfo(paymentMethod: string) {
  const cardInfo: { [key: string]: any } = {
    card_visa: {
      last4: '4242',
      brand: 'visa',
      test_scenario: 'Always succeeds',
      documentation: 'https://stripe.com/docs/testing#cards'
    },
    card_mastercard: {
      last4: '4444',
      brand: 'mastercard',
      test_scenario: 'Always succeeds',
      documentation: 'https://stripe.com/docs/testing#cards'
    },
    ach_debit: {
      account_type: 'checking',
      test_scenario: 'ACH debit simulation',
      processing_time: '3-5 business days'
    }
  };
  
  return cardInfo[paymentMethod] || { type: paymentMethod, test_mode: true };
}