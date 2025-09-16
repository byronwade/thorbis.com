# Tax Management API Documentation

> **Version**: 1.0.0  
> **Last Updated**: 2025-01-31  
> **Status**: Production Ready

## Overview

The Tax Management API provides comprehensive tax calculation, reporting, and compliance management across all Thorbis verticals. This API supports multi-jurisdictional tax calculations, automated reporting, and real-time compliance tracking.

## Features

- **Multi-Provider Tax Calculation**: Internal, TaxJar, and Avalara integrations
- **Multi-Jurisdictional Support**: State, county, city, and special district taxes
- **Real-time Calculations**: Instant tax calculations for transactions
- **Comprehensive Reporting**: Sales tax, exemption, and compliance reports
- **Audit Trail**: Complete transaction and calculation history
- **Exemption Management**: Tax-exempt customer and certificate handling
- **Compliance Tracking**: Automated filing deadlines and requirements

## Authentication

All endpoints require organization-level authentication via Supabase RLS policies.

```typescript
// Request headers
{
  "Authorization": "Bearer <supabase-jwt-token>",
  "Content-Type": "application/json"
}
```

## Base URLs

- **Production**: `https://api.thorbis.com/v1/tax`
- **Development**: `http://localhost:3000/api/v1/tax`

## Endpoints

### Tax Calculation

#### Calculate Tax for Transaction

**POST** `/calculate`

Calculate taxes for a transaction across all applicable jurisdictions.

**Request Body:**
```typescript
{
  organization_id: string; // UUID
  transaction: {
    type: 'invoice' | 'estimate' | 'payment' | 'refund' | 'expense';
    line_items: Array<{
      id: string;
      description: string;
      amount_cents: number; // Amount in cents
      quantity: number;
      product_type: 'service' | 'product' | 'digital' | 'shipping';
      tax_category?: string;
      exempt: boolean;
    }>;
    customer_info: {
      type: 'individual' | 'business' | 'nonprofit' | 'government';
      tax_id?: string;
      address: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
        country: string; // Default: 'US'
      };
      tax_exempt: boolean;
      tax_exemption_certificate?: string;
    };
    business_address: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string; // Default: 'US'
    };
    date?: string; // ISO 8601 date
  };
  options?: {
    provider: 'internal' | 'taxjar' | 'avalara'; // Default: 'internal'
    include_breakdown: boolean; // Default: true
    validate_addresses: boolean; // Default: false
    commit_transaction: boolean; // Default: false
  };
}
```

**Response:**
```typescript
{
  data: {
    calculation_id?: string;
    subtotal_cents: number;
    tax_amount_cents: number;
    total_cents: number;
    effective_tax_rate: number;
    tax_breakdown?: Array<{
      name: string;
      rate: number;
      amount_cents: number;
      jurisdiction_type: 'state' | 'county' | 'city' | 'special';
    }>;
    jurisdiction: {
      name: string;
      country: string;
      state: string;
      city: string;
      postal_code: string;
      tax_type: 'sales_tax' | 'vat';
      service_location: boolean;
      nexus_rules: {
        physical_presence: boolean;
        economic_nexus: boolean;
      };
    };
    exemptions_applied?: Array<{
      type: string;
      certificate?: string;
      reason: string;
    }>;
    display_info: {
      subtotal_formatted: string;
      tax_amount_formatted: string;
      total_formatted: string;
      tax_summary: Array<{
        name: string;
        rate: string;
        amount: string;
      }>;
    };
  };
  meta: {
    calculated_at: string; // ISO 8601 timestamp
    provider: string;
    jurisdiction: string;
    committed: boolean;
  };
}
```

**Error Responses:**
```typescript
// 400 Bad Request
{
  error: "Invalid tax calculation request";
  details: {
    // Zod validation errors
  };
}

// 404 Not Found
{
  error: "Organization not found";
}

// 500 Internal Server Error
{
  error: "Failed to calculate taxes";
}
```

#### Get Tax Rates for Location

**GET** `/calculate?organization_id={uuid}&country={country}&state={state}&city={city}&postal_code={code}`

Get current tax rates for a specific location.

**Query Parameters:**
- `organization_id` (required): Organization UUID
- `country` (optional): Country code (default: 'US')
- `state` (optional): State/province code
- `city` (optional): City name
- `postal_code` (optional): ZIP/postal code

**Response:**
```typescript
{
  data: {
    location: {
      country: string;
      state: string;
      city: string;
      postal_code: string;
    };
    tax_rates: {
      state_rate: number;
      local_rates: Array<{
        jurisdiction: string;
        rate: number;
      }>;
    };
    effective_date: string; // ISO 8601 timestamp
  };
}
```

### Tax Reporting

#### Generate Tax Report

**POST** `/reports`

Generate comprehensive tax reports for compliance and analysis.

**Request Body:**
```typescript
{
  organization_id: string; // UUID
  report_type: 
    | 'sales_tax_summary'
    | 'detailed_transactions' 
    | 'exemption_report'
    | 'jurisdiction_breakdown'
    | 'audit_trail'
    | 'monthly_filing'
    | 'quarterly_filing'
    | 'annual_summary';
  date_range: {
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
  };
  filters?: {
    jurisdiction?: string;
    transaction_types?: string[];
    customer_types?: string[];
    product_categories?: string[];
  };
  format: 'json' | 'csv' | 'pdf'; // Default: 'json'
  include_details: boolean; // Default: true
}
```

**Response (Sales Tax Summary):**
```typescript
{
  data: {
    summary: {
      reporting_period: {
        start_date: string;
        end_date: string;
      };
      total_transactions: number;
      taxable_sales_cents: number;
      exempt_sales_cents: number;
      total_tax_collected_cents: number;
      effective_tax_rate: number;
      jurisdictions_count: number;
      display_info: {
        taxable_sales_formatted: string;
        exempt_sales_formatted: string;
        tax_collected_formatted: string;
        effective_tax_rate_display: string;
      };
    };
    by_jurisdiction: Array<{
      jurisdiction: string;
      jurisdiction_type: 'state' | 'county' | 'city';
      tax_rate: number;
      taxable_sales_cents: number;
      tax_collected_cents: number;
      transaction_count: number;
    }>;
    by_product_type: Array<{
      product_type: string;
      taxable_sales_cents: number;
      tax_collected_cents: number;
      transaction_count: number;
    }>;
    payment_due: {
      amount_cents: number;
      due_date: string; // YYYY-MM-DD
      filing_frequency: 'monthly' | 'quarterly' | 'annual';
    };
  };
  organization: {
    name: string;
    business_address: object;
  };
  meta: {
    generated_at: string; // ISO 8601 timestamp
    report_parameters: object;
    record_count: number;
    compliance_period: string;
  };
}
```

#### Get Tax Report (Quick Generate)

**GET** `/reports?organization_id={uuid}&report_type={type}&start_date={date}&end_date={date}&jurisdiction={name}&format={format}`

Quick tax report generation via GET request.

**Query Parameters:**
- `organization_id` (required): Organization UUID
- `report_type` (required): Type of report to generate
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)
- `jurisdiction` (optional): Filter by jurisdiction
- `format` (optional): Response format (default: 'json')

**Response:** Same as POST `/reports` based on report type.

**CSV Response:** When `format=csv`, returns CSV file with appropriate headers:
```
Content-Type: text/csv
Content-Disposition: attachment; filename="tax-report-{type}-{start}-{end}.csv"
```

## Data Models

### Tax Calculation Record
```typescript
interface TaxCalculation {
  id: string;
  organization_id: string;
  transaction_type: string;
  customer_address: Address;
  business_address: Address;
  subtotal_cents: number;
  tax_amount_cents: number;
  tax_rate_percentage: number;
  tax_breakdown: TaxBreakdownItem[];
  provider: 'internal' | 'taxjar' | 'avalara';
  calculation_date: string;
  committed: boolean;
  created_at: string;
  updated_at: string;
}
```

### Tax Report Record
```typescript
interface TaxReport {
  id: string;
  organization_id: string;
  report_type: string;
  date_range: DateRange;
  filters: object;
  generated_by: string;
  generated_at: string;
  report_data: object;
  created_at: string;
}
```

### Address
```typescript
interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}
```

### Tax Breakdown Item
```typescript
interface TaxBreakdownItem {
  name: string;
  rate: number;
  amount_cents: number;
  jurisdiction_type: 'state' | 'county' | 'city' | 'special';
}
```

## Rate Limiting

- **Standard Plan**: 1,000 requests per hour per organization
- **Premium Plan**: 10,000 requests per hour per organization
- **Enterprise Plan**: Unlimited requests

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

## Error Handling

### Standard Error Response
```typescript
{
  error: string; // Human-readable error message
  details?: object; // Additional error details
  code?: string; // Error code for programmatic handling
  timestamp: string; // ISO 8601 timestamp
}
```

### Common Error Codes
- `TAX_001`: Invalid jurisdiction
- `TAX_002`: Tax rate not found
- `TAX_003`: Exemption certificate invalid
- `TAX_004`: Provider API error
- `TAX_005`: Calculation timeout

## Integration Examples

### Basic Tax Calculation
```typescript
// Calculate tax for a service invoice
const response = await fetch('/api/v1/tax/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organization_id: 'org-uuid',
    transaction: {
      type: 'invoice',
      line_items: [{
        id: 'item_1',
        description: 'HVAC Repair Service',
        amount_cents: 25000, // $250.00
        quantity: 1,
        product_type: 'service',
        exempt: false
      }],
      customer_info: {
        type: 'business',
        address: {
          street: '123 Main St',
          city: 'Los Angeles',
          state: 'CA',
          postal_code: '90210',
          country: 'US'
        },
        tax_exempt: false
      },
      business_address: {
        street: '456 Business Ave',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90211',
        country: 'US'
      }
    },
    options: {
      provider: 'internal',
      include_breakdown: true
    }
  })
});

const result = await response.json();
console.log(`Tax: ${result.data.display_info.tax_amount_formatted}`);
console.log(`Total: ${result.data.display_info.total_formatted}`);
```

### Generate Monthly Sales Tax Report
```typescript
// Generate comprehensive sales tax report
const response = await fetch('/api/v1/tax/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organization_id: 'org-uuid',
    report_type: 'sales_tax_summary',
    date_range: {
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    },
    format: 'json',
    include_details: true
  })
});

const report = await response.json();
console.log(`Tax collected: ${report.data.summary.display_info.tax_collected_formatted}`);
console.log(`Due date: ${report.data.payment_due.due_date}`);
```

### Tax-Exempt Customer Calculation
```typescript
// Calculate tax for tax-exempt nonprofit
const response = await fetch('/api/v1/tax/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organization_id: 'org-uuid',
    transaction: {
      type: 'invoice',
      line_items: [{
        id: 'item_1',
        description: 'Nonprofit Services',
        amount_cents: 50000, // $500.00
        quantity: 1,
        product_type: 'service',
        exempt: false
      }],
      customer_info: {
        type: 'nonprofit',
        tax_id: 'EIN-12-3456789',
        address: {
          street: '789 Nonprofit Way',
          city: 'Los Angeles',
          state: 'CA',
          postal_code: '90212',
          country: 'US'
        },
        tax_exempt: true,
        tax_exemption_certificate: 'CERT-NP-2024-001'
      },
      business_address: {
        street: '456 Business Ave',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90211',
        country: 'US'
      }
    }
  })
});

const result = await response.json();
console.log(`Exemptions applied: ${result.data.exemptions_applied?.length || 0}`);
console.log(`Final tax: ${result.data.display_info.tax_amount_formatted}`);
```

## Testing

### Test Environment
- **Base URL**: `http://localhost:3000/api/v1/tax`
- **Test Organization ID**: `550e8400-e29b-41d4-a716-446655440001`

### Mock Data Available
- Tax rates for CA, NY, TX states
- Sample customer addresses
- Various product types and exemptions
- Historical tax calculations and reports

### Postman Collection
Import the Thorbis Tax API collection for comprehensive testing:
- Tax calculation scenarios
- Report generation examples
- Error handling tests
- Rate limiting verification

## Compliance Notes

- **PCI DSS**: No credit card data is processed in tax calculations
- **Data Retention**: Tax calculations stored for 7 years per IRS requirements
- **Audit Trail**: All calculations logged for compliance verification
- **Privacy**: Customer addresses encrypted at rest
- **Accuracy**: Tax rates updated daily from authoritative sources

## Support

- **Documentation**: [https://docs.thorbis.com/tax-api](https://docs.thorbis.com/tax-api)
- **Support**: tax-api-support@thorbis.com
- **Status Page**: [https://status.thorbis.com](https://status.thorbis.com)
- **SDKs**: Available for TypeScript, Python, PHP, and Ruby

---

**Last Updated**: January 31, 2025  
**API Version**: 1.0.0  
**Document Version**: 1.0.0