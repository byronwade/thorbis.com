# Payment Testing Environments API

Comprehensive testing environments for payment flows across all Thorbis verticals with realistic mock data and Stripe test mode integration.

## Overview

The Payment Testing Environments API allows you to create isolated testing environments for each business vertical (Home Services, Auto, Restaurant, Retail) with:

- **Realistic Test Data**: Generated customers, transactions, and payment scenarios
- **Multiple Payment Methods**: Cards, ACH, digital wallets, BNPL options
- **Failure Simulation**: Configurable failure rates and specific error scenarios
- **Stripe Test Mode**: Full integration with Stripe's test environment
- **Performance Testing**: High-volume transaction simulation
- **Compliance Testing**: Regulatory and security scenario validation

## Authentication

All endpoints require valid organization-level authentication:

```bash
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

## Base URL

```
https://api.thorbis.com/v1/testing/payment-environments
```

---

## Endpoints

### 1. List Test Environments

Get all payment testing environments for an organization.

**GET** `/api/v1/testing/payment-environments`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organization_id` | string (UUID) | ✅ | Organization identifier |
| `vertical` | string | ❌ | Filter by vertical (`hs`, `auto`, `rest`, `ret`) |
| `status` | string | ❌ | Filter by status (`active`, `paused`, `completed`) |

#### Response

```json
{
  "data": [
    {
      "id": "env_12345678-1234-1234-1234-123456789abc",
      "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
      "environment_name": "HS Production Test",
      "vertical": "hs",
      "status": "active",
      "test_scenario": "basic_payments",
      "test_data_size": "medium",
      "payment_methods": ["card_visa", "card_mastercard", "ach_debit"],
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z",
      "display_info": {
        "vertical_name": "Home Services",
        "scenario_name": "Basic Payment Processing",
        "status_display": "Active - Ready for Testing",
        "data_size_display": "Medium (50 customers, 200 transactions)"
      },
      "test_summary": {
        "total_transactions": 156,
        "successful_transactions": 148,
        "failed_transactions": 8,
        "total_amount_cents": 2847500,
        "success_rate": 94.9
      },
      "available_actions": ["execute_transaction", "pause_environment", "view_results"]
    }
  ],
  "meta": {
    "total": 3,
    "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
    "supported_verticals": ["hs", "auto", "rest", "ret"],
    "available_scenarios": [
      "basic_payments",
      "subscription_billing", 
      "marketplace_transactions",
      "high_volume_testing",
      "failure_testing"
    ]
  }
}
```

---

### 2. Create Test Environment

Create a new payment testing environment with configurable scenarios and data.

**POST** `/api/v1/testing/payment-environments`

#### Request Body

```json
{
  "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
  "environment_config": {
    "vertical": "hs",
    "environment_name": "HS Production Test",
    "test_scenario": "basic_payments",
    "test_data_size": "medium",
    "include_failures": true,
    "stripe_test_mode": true
  },
  "payment_methods": ["card_visa", "card_mastercard", "ach_debit"],
  "test_scenarios": [
    {
      "scenario_name": "Standard Card Payments",
      "transaction_count": 100,
      "amount_range": {
        "min_cents": 5000,
        "max_cents": 50000
      },
      "success_rate": 95,
      "include_refunds": true,
      "include_disputes": false
    }
  ]
}
```

#### Request Schema

```typescript
interface TestEnvironmentRequest {
  organization_id: string; // UUID format
  environment_config: {
    vertical: 'hs' | 'auto' | 'rest' | 'ret';
    environment_name: string; // 1-100 characters
    test_scenario: 'basic_payments' | 'subscription_billing' | 'marketplace_transactions' 
                  | 'multi_party_payments' | 'international_payments' | 'high_volume_testing'
                  | 'failure_testing' | 'compliance_testing';
    test_data_size: 'small' | 'medium' | 'large';
    include_failures: boolean;
    stripe_test_mode: boolean;
  };
  payment_methods: PaymentMethod[];
  test_scenarios?: TestScenario[];
}

type PaymentMethod = 'card_visa' | 'card_mastercard' | 'card_amex' | 'card_discover'
                   | 'ach_debit' | 'ach_credit' | 'wire_transfer'
                   | 'apple_pay' | 'google_pay' | 'paypal'
                   | 'klarna' | 'afterpay' | 'affirm'
                   | 'cash' | 'check';

interface TestScenario {
  scenario_name: string;
  transaction_count: number; // 1-1000
  amount_range: {
    min_cents: number;
    max_cents: number;
  };
  success_rate: number; // 0-100
  include_refunds: boolean;
  include_disputes: boolean;
}
```

#### Response

```json
{
  "data": {
    "id": "env_12345678-1234-1234-1234-123456789abc",
    "environment_name": "HS Production Test",
    "vertical": "hs",
    "status": "active",
    "test_scenario": "basic_payments",
    "stripe_config": {
      "stripe_test_mode": true,
      "webhook_endpoint": "https://api.thorbis.com/webhooks/stripe-test/env_12345...",
      "test_clock_id": "tc_test_env_12345...",
      "configuration": {
        "automatic_payment_methods": { "enabled": true },
        "payment_method_types": ["card", "us_bank_account"]
      }
    },
    "test_data_summary": {
      "customers": 50,
      "payment_methods": 3,
      "transactions": 200,
      "products": 50
    },
    "display_info": {
      "vertical_name": "Home Services",
      "scenario_name": "Basic Payment Processing",
      "status_display": "Active - Ready for Testing"
    },
    "next_steps": [
      "Environment is ready for payment testing",
      "Use the transaction API to simulate payments",
      "Monitor results in the test dashboard",
      "Export test results when complete"
    ]
  },
  "message": "Test payment environment created successfully"
}
```

---

### 3. Execute Test Transaction

Execute a test payment transaction within a test environment.

**PUT** `/api/v1/testing/payment-environments/transaction`

#### Request Body

```json
{
  "environment_id": "env_12345678-1234-1234-1234-123456789abc",
  "transaction_data": {
    "amount_cents": 15000,
    "payment_method": "card_visa",
    "customer_info": {
      "email": "test@example.com",
      "name": "Test Customer"
    },
    "metadata": {
      "test_type": "api_integration",
      "scenario": "successful_payment"
    },
    "force_failure": false,
    "failure_code": "card_declined"
  }
}
```

#### Request Schema

```typescript
interface TestTransactionRequest {
  environment_id: string; // UUID format
  transaction_data: {
    amount_cents: number; // Minimum 0
    payment_method: PaymentMethod;
    customer_info: {
      email: string; // Valid email format
      name: string; // Minimum 1 character
    };
    metadata?: Record<string, string>;
    force_failure: boolean;
    failure_code?: 'card_declined' | 'insufficient_funds' | 'expired_card' 
                  | 'processing_error' | 'invalid_cvc' | 'authentication_failed';
  };
}
```

#### Response

```json
{
  "data": {
    "transaction_id": "pi_test_1234567890_abcdef123456",
    "status": "succeeded",
    "amount_cents": 15000,
    "payment_method": "card_visa",
    "processing_time_ms": 1247,
    "stripe_payment_intent_id": "pi_test_1234567890_abcdef123456",
    "failure_code": null,
    "test_card_info": {
      "last4": "4242",
      "brand": "visa",
      "test_scenario": "Always succeeds",
      "documentation": "https://stripe.com/docs/testing#cards"
    },
    "environment_info": {
      "vertical": "hs",
      "scenario": "basic_payments",
      "stripe_test_mode": true
    }
  },
  "meta": {
    "executed_at": "2024-01-15T14:30:00Z",
    "environment_id": "env_12345678-1234-1234-1234-123456789abc",
    "environment_statistics": {
      "total_transactions": 157,
      "successful_transactions": 149,
      "failed_transactions": 8,
      "success_rate": 94.9,
      "updated_at": "2024-01-15T14:30:00Z"
    }
  }
}
```

---

## Test Data Configurations

### Data Size Options

| Size | Customers | Transactions | Products | Use Case |
|------|-----------|-------------|----------|----------|
| `small` | 10 | 50 | 20 | Quick testing, CI/CD |
| `medium` | 50 | 200 | 50 | Integration testing |
| `large` | 200 | 1000 | 100 | Load testing, performance |

### Vertical-Specific Configurations

#### Home Services (`hs`)
- **Transaction Range**: $50 - $500
- **Common Services**: Plumbing, HVAC, Electrical, Cleaning
- **Payment Patterns**: Immediate payment, scheduled payments
- **Typical Success Rate**: 94-96%

#### Auto Services (`auto`)
- **Transaction Range**: $100 - $1,000
- **Common Services**: Oil change, Brake service, Diagnostics
- **Payment Patterns**: Point-of-sale, financing options
- **Typical Success Rate**: 92-94%

#### Restaurant (`rest`)
- **Transaction Range**: $20 - $150
- **Common Items**: Food, Beverages, Catering
- **Payment Patterns**: Quick transactions, tips, split payments
- **Typical Success Rate**: 96-98%

#### Retail (`ret`)
- **Transaction Range**: $10 - $200
- **Common Items**: Clothing, Electronics, Home goods
- **Payment Patterns**: E-commerce, in-store, returns
- **Typical Success Rate**: 93-95%

---

## Test Scenarios

### 1. Basic Payments (`basic_payments`)
Standard payment processing with common success/failure patterns.

**Features:**
- Standard card and ACH processing
- 90-95% success rate simulation
- Basic decline scenarios
- Processing time variation

### 2. Subscription Billing (`subscription_billing`)
Recurring payment scenarios with subscription lifecycle testing.

**Features:**
- Initial setup payments
- Recurring charge simulation
- Failed payment retry logic
- Subscription status changes

### 3. Marketplace Transactions (`marketplace_transactions`)
Multi-party payment scenarios for marketplace platforms.

**Features:**
- Split payments between parties
- Platform fee handling
- Payout simulation
- Dispute scenario testing

### 4. High Volume Testing (`high_volume_testing`)
Performance and scalability testing with high transaction volumes.

**Features:**
- Concurrent transaction processing
- Rate limit testing
- Database performance validation
- API response time monitoring

### 5. Failure Testing (`failure_testing`)
Comprehensive failure scenario simulation.

**Features:**
- All Stripe decline codes
- Network timeout simulation
- Partial failure scenarios
- Error recovery testing

### 6. Compliance Testing (`compliance_testing`)
Regulatory and security compliance validation.

**Features:**
- PCI DSS validation scenarios
- SCA (Strong Customer Authentication) testing
- Tax calculation validation
- Audit trail verification

---

## Payment Method Test Cards

### Visa Test Cards

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| 4242424242424242 | Basic Visa | Always succeeds |
| 4000000000000002 | Generic decline | Always fails with `card_declined` |
| 4000000000009995 | Insufficient funds | Fails with `insufficient_funds` |
| 4000000000000069 | Expired card | Fails with `expired_card` |

### Mastercard Test Cards

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| 5555555555554444 | Basic Mastercard | Always succeeds |
| 5200000000000007 | Processing error | Fails with `processing_error` |
| 5105105105105100 | Generic decline | Always fails with `card_declined` |

### American Express Test Cards

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| 378282246310005 | Basic Amex | Always succeeds |
| 371449635398431 | Generic decline | Always fails with `card_declined` |

### ACH Test Account Numbers

| Account Number | Routing Number | Description |
|----------------|----------------|-------------|
| 000123456789 | 110000000 | Successful ACH debit |
| 000111111116 | 110000000 | Insufficient funds |
| 000111111113 | 110000000 | Account closed |

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Invalid test environment configuration",
  "details": {
    "environment_config": {
      "vertical": {
        "_errors": ["Invalid enum value. Expected 'hs' | 'auto' | 'rest' | 'ret'"]
      }
    }
  }
}
```

#### 404 Not Found
```json
{
  "error": "Test environment not found",
  "message": "No test environment found with ID env_12345..."
}
```

#### 409 Conflict
```json
{
  "error": "Test environment with this name already exists",
  "message": "Environment 'HS Production Test' already exists for this organization"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to create test environment",
  "message": "An unexpected error occurred while setting up the test environment"
}
```

---

## Webhook Events

Test environments can generate webhook events for integration testing:

### `test_environment.created`
```json
{
  "type": "test_environment.created",
  "data": {
    "object": "test_environment",
    "id": "env_12345678-1234-1234-1234-123456789abc",
    "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
    "vertical": "hs",
    "status": "active"
  }
}
```

### `test_transaction.completed`
```json
{
  "type": "test_transaction.completed",
  "data": {
    "object": "test_transaction",
    "id": "pi_test_1234567890_abcdef123456",
    "environment_id": "env_12345678-1234-1234-1234-123456789abc",
    "amount_cents": 15000,
    "status": "succeeded",
    "processing_time_ms": 1247
  }
}
```

---

## SDKs and Integration Examples

### JavaScript/TypeScript
```typescript
import { ThorbisTesting } from '@thorbis/testing-sdk';

const testing = new ThorbisTesting({
  apiKey: 'your-api-key',
  environment: 'test'
});

// Create test environment
const environment = await testing.paymentEnvironments.create({
  organizationId: 'org_...',
  environmentConfig: {
    vertical: 'hs',
    environmentName: 'Integration Test',
    testScenario: 'basic_payments',
    testDataSize: 'medium',
    includeFailures: true,
    stripeTestMode: true
  },
  paymentMethods: ['card_visa', 'card_mastercard', 'ach_debit']
});

// Execute test transaction
const result = await testing.paymentEnvironments.executeTransaction(environment.id, {
  amountCents: 15000,
  paymentMethod: 'card_visa',
  customerInfo: {
    email: 'test@example.com',
    name: 'Test Customer'
  }
});
```

### Python
```python
from thorbis_testing import ThorbisTesting

testing = ThorbisTesting(api_key='your-api-key')

# Create test environment
environment = testing.payment_environments.create(
    organization_id='org_...',
    environment_config={
        'vertical': 'hs',
        'environment_name': 'Integration Test',
        'test_scenario': 'basic_payments',
        'test_data_size': 'medium',
        'include_failures': True,
        'stripe_test_mode': True
    },
    payment_methods=['card_visa', 'card_mastercard', 'ach_debit']
)

# Execute test transaction
result = testing.payment_environments.execute_transaction(
    environment_id=environment['id'],
    transaction_data={
        'amount_cents': 15000,
        'payment_method': 'card_visa',
        'customer_info': {
            'email': 'test@example.com',
            'name': 'Test Customer'
        }
    }
)
```

### cURL Examples

#### Create Test Environment
```bash
curl -X POST https://api.thorbis.com/v1/testing/payment-environments \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
    "environment_config": {
      "vertical": "hs",
      "environment_name": "API Test Environment",
      "test_scenario": "basic_payments",
      "test_data_size": "medium",
      "include_failures": true,
      "stripe_test_mode": true
    },
    "payment_methods": ["card_visa", "card_mastercard", "ach_debit"]
  }'
```

#### Execute Test Transaction
```bash
curl -X PUT https://api.thorbis.com/v1/testing/payment-environments/transaction \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "environment_id": "env_12345678-1234-1234-1234-123456789abc",
    "transaction_data": {
      "amount_cents": 15000,
      "payment_method": "card_visa",
      "customer_info": {
        "email": "test@example.com",
        "name": "Test Customer"
      },
      "force_failure": false
    }
  }'
```

---

## Best Practices

### 1. Environment Management
- Use descriptive environment names that indicate purpose
- Create separate environments for different testing phases
- Clean up completed test environments to manage costs
- Use appropriate data sizes for your testing needs

### 2. Test Scenario Selection
- Start with `basic_payments` for initial integration testing
- Use `failure_testing` to validate error handling
- Implement `high_volume_testing` for performance validation
- Use `compliance_testing` before production deployment

### 3. Payment Method Testing
- Test all payment methods you plan to support
- Include both success and failure scenarios
- Validate handling of payment method-specific errors
- Test timeout and retry scenarios

### 4. Data Management
- Use realistic test data that matches your vertical
- Include edge cases in transaction amounts
- Test with various customer types and scenarios
- Validate data privacy and security measures

### 5. Monitoring and Analytics
- Monitor success rates across different scenarios
- Track processing times and performance metrics
- Analyze failure patterns and error distributions
- Use webhooks for real-time test monitoring

---

## Limits and Quotas

| Resource | Limit | Notes |
|----------|-------|-------|
| Test Environments | 10 per organization | Contact support for higher limits |
| Test Transactions | 1,000 per hour | Per environment |
| Environment Duration | 30 days | Automatic cleanup after expiration |
| Test Data Size | 1,000 transactions max | Large environments |
| Concurrent Transactions | 100 | Per environment |

---

## Support

For technical support and questions:

- **Documentation**: [https://docs.thorbis.com/testing](https://docs.thorbis.com/testing)
- **API Reference**: [https://api-docs.thorbis.com](https://api-docs.thorbis.com)
- **Support Email**: testing-support@thorbis.com
- **Slack Channel**: #payment-testing (for customers)

---

## Changelog

### Version 1.0.0 - January 2024
- Initial release of Payment Testing Environments API
- Support for all four business verticals
- Basic payment scenario testing
- Stripe test mode integration

### Version 1.1.0 - February 2024
- Added high-volume testing scenarios
- Enhanced failure simulation capabilities
- Webhook event support for test environments
- Performance analytics and monitoring