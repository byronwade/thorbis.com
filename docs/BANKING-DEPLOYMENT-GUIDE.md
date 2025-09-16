# Banking & Financial Services Deployment Guide

## Prerequisites

### Environment Setup
Ensure you have the following environment variables configured:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plaid Configuration  
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox  # sandbox, development, production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Encryption Keys
BANKING_ENCRYPTION_KEY=your_32_character_key_here
DATABASE_ENCRYPTION_SALT=your_salt_here

# Compliance and Risk
SANCTIONS_SCREENING_API_KEY=your_sanctions_api_key
FRAUD_DETECTION_API_KEY=your_fraud_detection_key

# Real-time Payments (Production)
FEDNOW_PARTICIPANT_ID=your_fednow_id
RTP_PARTICIPANT_ID=your_rtp_id
```

### Required Dependencies
```bash
# Install banking package dependencies
pnpm install @thorbis/banking

# Install peer dependencies if not already installed
pnpm install stripe plaid date-fns decimal.js
```

## Database Setup

### 1. Run Database Migration
```bash
# Apply the comprehensive banking schema
supabase migration up --file 20250903_banking_financial_services_comprehensive.sql

# Generate TypeScript types
pnpm db:generate
```

### 2. Configure Row-Level Security
Ensure RLS is properly configured for your tenant isolation:

```sql
-- Example tenant isolation policy
CREATE POLICY "Users can only see their tenant data" ON financial_accounts
  FOR ALL USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));
```

### 3. Set up Real-time Subscriptions
Enable real-time for critical tables:

```sql
-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE fraud_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_accounts;
```

## Integration Setup

### 1. Stripe Treasury Setup

#### Create Connected Account
```typescript
import { BankingService } from '@thorbis/banking';

const bankingService = new BankingService();

// Create Treasury account for a business entity
const setupTreasuryAccount = async (entityId: string) => {
  const result = await bankingService.createTreasuryAccount(entityId, {
    tenantId: 'your-tenant-id',
    accountName: 'Primary Business Account',
    enableCardIssuing: true,
    enableWires: true,
    userId: 'user-id'
  });

  console.log('Treasury account created:', result);
};
```

#### Configure Webhooks
Set up Stripe webhooks to handle Treasury events:

```typescript
// pages/api/webhooks/stripe.ts
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'treasury.financial_account.created':
        await handleFinancialAccountCreated(event.data.object);
        break;
      
      case 'treasury.outbound_payment.posted':
        await handleOutboundPaymentPosted(event.data.object);
        break;
      
      case 'issuing.authorization.request':
        return await handleCardAuthorization(event.data.object);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return Response.json({ error: 'Webhook error' }, { status: 400 });
  }
}
```

### 2. Plaid Integration Setup

#### Link Bank Account Flow
```typescript
// components/PlaidLinkButton.tsx
import { usePlaidLink } from 'react-plaid-link';
import { useLinkExternalBank } from '@thorbis/banking';

export const PlaidLinkButton = ({ entityId, tenantId, userId }: {
  entityId: string;
  tenantId: string; 
  userId: string;
}) => {
  const linkExternalBank = useLinkExternalBank();

  const { open, ready } = usePlaidLink({
    token: 'your-link-token', // Get from your backend
    onSuccess: (public_token, metadata) => {
      linkExternalBank.mutate({
        entityId,
        publicToken: public_token,
        tenantId,
        userId
      });
    },
    onExit: (err, metadata) => {
      console.log('Plaid Link exited', err, metadata);
    },
    onEvent: (eventName, metadata) => {
      console.log('Plaid Link event', eventName, metadata);
    }
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Link Bank Account
    </button>
  );
};
```

### 3. Real-time Payments Setup

For production deployments, integrate with FedNow and RTP networks:

```typescript
// Configure real-time payment processors
const rtpConfig = {
  participantId: process.env.RTP_PARTICIPANT_ID,
  certPath: '/path/to/rtp/certificate.pem',
  keyPath: '/path/to/rtp/private.key',
  environment: 'production' // or 'certification'
};

const fedNowConfig = {
  participantId: process.env.FEDNOW_PARTICIPANT_ID,
  certPath: '/path/to/fednow/certificate.pem',
  keyPath: '/path/to/fednow/private.key',
  environment: 'production'
};
```

## Industry-Specific Deployments

### Home Services (HS App)
```typescript
// apps/hs/src/lib/banking-config.ts
export const homeServicesBankingConfig = {
  features: {
    equipmentFinancing: true,
    invoiceFactoring: true,
    customerPayments: true,
    seasonalCreditLine: true
  },
  paymentMethods: ['ACH', 'CARD', 'CHECK'],
  compliance: {
    contractorBonding: true,
    insuranceVerification: true
  }
};

// Enhanced for home services workflows
export const setupHomeServicesBanking = async (businessId: string) => {
  // Create specialized accounts for home services
  await Promise.all([
    createOperatingAccount(businessId),
    createEquipmentLoanAccount(businessId),
    createSeasonalBufferAccount(businessId)
  ]);
};
```

### Restaurant (REST App)
```typescript
// apps/rest/src/lib/banking-config.ts
export const restaurantBankingConfig = {
  features: {
    posIntegration: true,
    tipPooling: true,
    supplierPayments: true,
    cashFlowForecasting: true
  },
  paymentMethods: ['CARD', 'CASH', 'MOBILE'],
  compliance: {
    salesTaxTracking: true,
    tipReporting: true
  }
};
```

### Auto Services (AUTO App)
```typescript
// apps/auto/src/lib/banking-config.ts
export const autoServicesBankingConfig = {
  features: {
    partsInventoryFinancing: true,
    insuranceClaimsPayments: true,
    diagnosticEquipmentLeasing: true
  },
  paymentMethods: ['ACH', 'CARD', 'WIRE', 'CHECK'],
  compliance: {
    insuranceClaimsTracking: true,
    partWarrantyReserves: true
  }
};
```

### Retail (RET App)
```typescript
// apps/ret/src/lib/banking-config.ts
export const retailBankingConfig = {
  features: {
    inventoryFinancing: true,
    seasonalLineOfCredit: true,
    merchantServices: true,
    buyNowPayLater: true
  },
  paymentMethods: ['CARD', 'MOBILE', 'BNPL', 'CASH'],
  compliance: {
    inventoryValuation: true,
    seasonalAdjustments: true
  }
};
```

## Security and Compliance

### 1. Encryption Setup
```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.BANKING_ENCRYPTION_KEY!;
const ALGORITHM = 'aes-256-gcm';

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
};

export const decrypt = (encryptedData: string): string => {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipherGCM(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

### 2. PCI DSS Compliance
```typescript
// middleware/pci-compliance.ts
export const pciComplianceMiddleware = (req: Request) => {
  // Ensure HTTPS
  if (req.headers.get('x-forwarded-proto') !== 'https') {
    return new Response('HTTPS required', { status: 400 });
  }

  // Validate CSP headers
  const cspHeader = "default-src 'self'; script-src 'self' js.stripe.com; frame-src js.stripe.com";
  
  // Log security events
  logSecurityEvent({
    type: 'CARD_DATA_ACCESS',
    ip: req.headers.get('x-forwarded-for'),
    userAgent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });
};
```

### 3. KYC/AML Setup
```typescript
// services/compliance.ts
export const performKYCCheck = async (individual: IndividualType) => {
  // Document verification
  const docVerification = await verifyIdentityDocuments(individual.documents);
  
  // Sanctions screening
  const sanctionsResult = await screenAgainstSanctionsList({
    firstName: individual.first_name,
    lastName: individual.last_name,
    dateOfBirth: individual.date_of_birth
  });
  
  // PEP screening
  const pepResult = await screenForPoliticalExposure(individual);
  
  // Update KYC record
  await updateKYCRecord(individual.id, {
    kyc_status: docVerification.passed && !sanctionsResult.match ? 'APPROVED' : 'REJECTED',
    sanctions_screening_result: sanctionsResult.match ? 'CONFIRMED_MATCH' : 'NO_MATCH',
    pep_screening_result: pepResult.match ? 'CONFIRMED_MATCH' : 'NO_MATCH'
  });
};
```

## Monitoring and Observability

### 1. Transaction Monitoring
```typescript
// services/monitoring.ts
export const setupTransactionMonitoring = () => {
  // Real-time fraud detection
  supabase
    .channel('transactions')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'transactions'
    }, async (payload) => {
      const transaction = payload.new;
      
      // Run risk checks
      const riskScore = await calculateRiskScore(transaction);
      
      if (riskScore > 70) {
        await createFraudAlert(transaction, riskScore);
      }
      
      // Update ML model
      await updateFraudDetectionModel(transaction);
    })
    .subscribe();
};
```

### 2. Compliance Reporting
```typescript
// services/reporting.ts
export const generateComplianceReports = async (tenantId: string) => {
  // SAR reports
  const sarReports = await generateSARReports(tenantId);
  
  // CTR reports
  const ctrReports = await generateCTRReports(tenantId);
  
  // Audit trails
  const auditTrails = await generateAuditTrails(tenantId);
  
  // Schedule automated filing
  await scheduleRegulatoryFiling(sarReports, ctrReports);
};
```

## Performance Optimization

### 1. Database Optimization
```sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY idx_transactions_tenant_date 
ON transactions(tenant_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_financial_accounts_tenant_status 
ON financial_accounts(tenant_id, status) 
WHERE status = 'ACTIVE';

-- Partition large tables
CREATE TABLE transactions_2024 PARTITION OF transactions 
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 2. Caching Strategy
```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const getCachedAccountBalance = async (accountId: string) => {
  const cached = await redis.get(`balance:${accountId}`);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const balance = await fetchAccountBalance(accountId);
  await redis.setex(`balance:${accountId}`, 30, JSON.stringify(balance)); // 30 second cache
  
  return balance;
};
```

## Testing

### 1. Integration Tests
```typescript
// __tests__/banking-integration.test.ts
import { BankingService } from '@thorbis/banking';

describe('Banking Integration', () => {
  const bankingService = new BankingService();

  test('should create Treasury account', async () => {
    const result = await bankingService.createTreasuryAccount('entity-123', {
      tenantId: 'tenant-123',
      accountName: 'Test Account',
      enableCardIssuing: true,
      enableWires: false,
      userId: 'user-123'
    });

    expect(result.dbAccount).toBeDefined();
    expect(result.stripeAccount).toBeDefined();
  });

  test('should process ACH payment', async () => {
    const payment = await bankingService.createACHDebit({
      tenantId: 'tenant-123',
      amount: 1000,
      description: 'Test payment',
      // ... other required fields
    });

    expect(payment.transaction.status).toBe('PENDING');
  });
});
```

### 2. E2E Tests
```typescript
// e2e/banking-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete banking setup flow', async ({ page }) => {
  await page.goto('/banking');
  
  // Test account creation
  await page.click('[data-testid="add-account"]');
  await page.fill('[data-testid="account-name"]', 'Test Business Account');
  await page.click('[data-testid="create-treasury-account"]');
  
  await expect(page.locator('[data-testid="account-created"]')).toBeVisible();
  
  // Test payment creation
  await page.click('[data-testid="new-payment"]');
  await page.fill('[data-testid="payment-amount"]', '500.00');
  await page.click('[data-testid="submit-payment"]');
  
  await expect(page.locator('[data-testid="payment-pending"]')).toBeVisible();
});
```

## Production Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migration applied
- [ ] Stripe connected accounts set up
- [ ] Plaid production keys configured
- [ ] SSL certificates installed
- [ ] PCI DSS compliance verified
- [ ] KYC/AML processes tested
- [ ] Fraud detection rules configured
- [ ] Backup procedures established

### Post-deployment
- [ ] Webhook endpoints verified
- [ ] Real-time subscriptions working
- [ ] Transaction monitoring active
- [ ] Compliance reporting scheduled
- [ ] Performance metrics baseline established
- [ ] Security scanning completed
- [ ] Load testing completed
- [ ] Disaster recovery procedures tested

### Ongoing Monitoring
- [ ] Daily transaction volume monitoring
- [ ] Weekly compliance report generation
- [ ] Monthly security audits
- [ ] Quarterly PCI compliance review
- [ ] Annual penetration testing

This comprehensive deployment guide ensures a secure, compliant, and performant implementation of the banking and financial services functionality across all Thorbis Business OS applications.