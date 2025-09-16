# Financial Compliance Reporting API Documentation

> **Version**: 1.0.0  
> **Last Updated**: 2025-01-31  
> **Status**: Production Ready

## Overview

The Financial Compliance Reporting API provides comprehensive regulatory compliance management including 1099 forms, payroll tax reports (Form 941), business tax returns (Form 1120), and industry-specific compliance requirements. This API automates the generation, validation, and filing of critical business compliance documents.

## Features

- **1099 Tax Forms**: 1099-NEC, 1099-MISC, 1099-K generation and management
- **Payroll Tax Compliance**: Form 941, Form 940, state unemployment reporting
- **Business Tax Returns**: Form 1120, Schedule C, corporate tax compliance
- **Industry-Specific Reports**: Sector-specific compliance requirements
- **Automated Validation**: Real-time compliance checking and validation
- **Electronic Filing**: Direct integration with government filing systems
- **Deadline Management**: Automated tracking of filing deadlines and penalties
- **Audit Trail**: Complete compliance history and documentation

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

- **Production**: `https://api.thorbis.com/v1/compliance`
- **Development**: `http://localhost:3000/api/v1/compliance`

## Endpoints

### 1099 Tax Forms

#### List 1099 Recipients and Forms

**GET** `/1099?organization_id={uuid}&tax_year={year}&form_type={type}&status={status}`

List all 1099 recipients and their payment summaries for compliance reporting.

**Query Parameters:**
- `organization_id` (required): Organization UUID
- `tax_year` (optional): Tax year for reporting (default: current year)
- `form_type` (optional): Filter by 1099-NEC, 1099-MISC, or 1099-K
- `status` (optional): Filter by recipient status

**Response:**
```typescript
{
  data: Array<{
    id: string;
    organization_id: string;
    recipient_info: {
      name: string;
      business_name?: string;
      tin: string;
      tin_type: 'EIN' | 'SSN' | 'ITIN';
      address: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
      backup_withholding: boolean;
      exemption_code?: string;
    };
    status: string;
    created_at: string;
    updated_at: string;
    display_info: {
      recipient_name: string;
      business_name?: string;
      tin_masked: string;
      address_summary: string;
      requires_1099: boolean;
    };
    payment_summaries: Array<{
      tax_year: number;
      form_type: string;
      total_payments_cents: number;
      payments_count: number;
      withholding_cents: number;
      display_info: {
        total_payments_formatted: string;
        withholding_formatted: string;
        requires_filing: boolean;
      };
    }>;
  }>;
  meta: {
    organization_id: string;
    total_recipients: number;
    requiring_1099: number;
    tax_year: string;
    filing_thresholds: Array<{
      form_type: string;
      threshold_cents: number;
      threshold_formatted: string;
    }>;
  };
}
```

#### Generate 1099 Forms

**POST** `/1099`

Generate 1099 forms for specified recipients and tax year.

**Request Body:**
```typescript
{
  organization_id: string; // UUID
  tax_year: number; // e.g., 2023
  form_type: '1099-NEC' | '1099-MISC' | '1099-K';
  filters?: {
    recipient_ids?: string[]; // Specific recipients
    minimum_amount_cents?: number; // Override threshold
    date_range?: {
      start_date: string; // YYYY-MM-DD
      end_date: string;   // YYYY-MM-DD
    };
    include_corrections: boolean; // Include corrected forms
  };
  options?: {
    format: 'pdf' | 'json' | 'xml'; // Default: 'json'
    include_recipient_details: boolean; // Default: true
    electronic_filing: boolean; // Default: false
    correction_sequence?: number; // For corrected forms
  };
}
```

**Response:**
```typescript
{
  data: {
    generation_id: string;
    tax_year: number;
    form_type: string;
    forms_generated: number;
    total_payment_amount_cents: number;
    forms?: Array<{
      form_id: string;
      recipient_id: string;
      recipient_name: string;
      recipient_tin: string;
      recipient_address: string;
      payer_name: string;
      payer_tin: string;
      payer_address: string;
      tax_year: number;
      form_type: string;
      payment_amount_cents: number;
      payment_amount_formatted: string;
      withholding_cents: number;
      box_assignments: {
        [box_number: string]: number | string;
      };
      filing_deadline: string;
      correction_sequence: number;
      pdf_url?: string;
    }>;
    filing_deadline: string;
    electronic_filing: boolean;
    download_urls?: string[];
  };
  meta: {
    generated_at: string;
    organization: {
      name: string;
      tax_id: string;
    };
    compliance_notes: string[];
  };
}
```

#### Register 1099 Recipient

**PUT** `/1099/recipients`

Register or update a 1099 recipient (contractor/vendor).

**Request Body:**
```typescript
{
  organization_id: string; // UUID
  recipient_info: {
    type: 'individual' | 'business';
    name: string;
    business_name?: string;
    tin: string; // Format: XX-XXXXXXX or XXX-XX-XXXX
    tin_type: 'EIN' | 'SSN' | 'ITIN';
    address: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string; // Default: 'US'
    };
    backup_withholding: boolean; // Default: false
    exemption_code?: string;
  };
}
```

### General Compliance Reports

#### List Compliance Requirements

**GET** `/reports?organization_id={uuid}&report_type={type}&year={year}`

Get organization compliance profile and upcoming requirements.

**Query Parameters:**
- `organization_id` (required): Organization UUID
- `report_type` (optional): Filter by specific report type
- `year` (optional): Filter by tax year

**Response:**
```typescript
{
  data: {
    compliance_profile: {
      organization_type: string;
      employee_count: number;
      industry_codes: string[];
      federal_requirements: Array<{
        type: string;
        frequency: string;
        description: string;
      }>;
      state_requirements: Array<{
        type: string;
        frequency: string;
        jurisdiction: string;
      }>;
      industry_requirements: Array<{
        type: string;
        frequency: string;
      }>;
    };
    recent_reports: Array<{
      id: string;
      report_type: string;
      reporting_period: {
        period_type: 'monthly' | 'quarterly' | 'annual';
        year: number;
        quarter?: number;
        month?: number;
      };
      status: string;
      filed_date?: string;
      due_date: string;
      created_at: string;
      display_info: {
        report_name: string;
        period_display: string;
        status_display: string;
        days_until_due: number;
      };
    }>;
    upcoming_deadlines: Array<{
      report_type: string;
      description: string;
      due_date: string;
      priority: 'high' | 'medium' | 'low';
      estimated_preparation_time: string;
    }>;
    compliance_score: number; // 0-100
  };
  meta: {
    organization_id: string;
    assessment_date: string;
    next_review_date: string;
  };
}
```

#### Generate Compliance Report

**POST** `/reports`

Generate specific compliance reports (Form 941, 1120, etc.).

**Request Body:**
```typescript
{
  organization_id: string; // UUID
  report_type: 
    | 'form_941'           // Quarterly federal tax return
    | 'form_944'           // Annual federal tax return (small employers)
    | 'schedule_c'         // Profit/loss from business
    | 'form_1120'          // Corporate income tax
    | 'state_unemployment' // State unemployment reports
    | 'workers_comp'       // Workers compensation reports
    | 'industry_specific'  // Industry-specific compliance
    | 'cash_transaction'   // Cash transaction reports (BSA)
    | 'beneficial_ownership'; // Beneficial ownership information
  reporting_period: {
    period_type: 'monthly' | 'quarterly' | 'annual';
    year: number;
    quarter?: number; // 1-4 for quarterly reports
    month?: number;   // 1-12 for monthly reports
  };
  filters?: {
    include_zero_amounts: boolean; // Default: false
    employee_count_threshold?: number;
    revenue_threshold_cents?: number;
    state_jurisdictions?: string[];
  };
  output_options?: {
    format: 'json' | 'pdf' | 'xml' | 'csv'; // Default: 'json'
    include_supporting_schedules: boolean; // Default: true
    electronic_filing: boolean; // Default: false
    preparer_info?: {
      name: string;
      ptin?: string;
      firm_name?: string;
    };
  };
}
```

**Response (Form 941 Example):**
```typescript
{
  data: {
    report_id: string;
    report_type: 'form_941';
    reporting_period: {
      period_type: 'quarterly';
      year: number;
      quarter: number;
    };
    report_data: {
      form_type: 'Form 941';
      quarter: number;
      organization_info: {
        name: string;
        tax_id: string;
        address: object;
      };
      summary: {
        wages_subject_to_withholding_cents: number;
        federal_income_tax_withheld_cents: number;
        social_security_wages_cents: number;
        social_security_tax_cents: number;
        medicare_wages_cents: number;
        medicare_tax_cents: number;
        total_tax_liability_cents: number;
        deposits_made_cents: number;
        balance_due_cents: number;
      };
      schedule_b: Array<{
        month: string;
        month_number: number;
        tax_liability_cents: number;
        deposits_made: Array<{
          date: string;
          amount_cents: number;
        }>;
      }>;
      pdf_url?: string;
    };
    filing_info: {
      due_date: string;
      filing_method: 'electronic' | 'paper';
      estimated_tax_liability: number;
      penalties_if_late: {
        first_month_penalty_cents: number;
        maximum_penalty_cents: number;
        daily_interest_rate: number;
      };
    };
    download_urls?: string[];
  };
  meta: {
    generated_at: string;
    compliance_notes: string[];
    next_steps: string[];
  };
}
```

#### Validate Compliance Data

**PUT** `/reports/validate`

Perform comprehensive compliance validation and identify issues.

**Request Body:**
```typescript
{
  organization_id: string; // UUID
  validation_type: 
    | 'payroll_tax_reconciliation'
    | 'quarterly_estimates'
    | 'annual_reconciliation'
    | 'industry_compliance'
    | 'multi_state_nexus';
  period: {
    start_date: string; // YYYY-MM-DD
    end_date: string;   // YYYY-MM-DD
  };
}
```

**Response:**
```typescript
{
  data: {
    validation_type: string;
    period: {
      start_date: string;
      end_date: string;
    };
    overall_status: 'compliant' | 'issues_found' | 'critical';
    validation_score: number; // 0-100
    issues_found: Array<{
      severity: 'warning' | 'error' | 'critical';
      category: string;
      description: string;
      recommended_action: string;
    }>;
    recommendations: string[];
    required_actions: string[];
  };
  meta: {
    validated_at: string;
    validation_criteria: string[];
  };
}
```

## Data Models

### 1099 Recipient
```typescript
interface Recipient1099 {
  id: string;
  organization_id: string;
  recipient_info: {
    type: 'individual' | 'business';
    name: string;
    business_name?: string;
    tin: string;
    tin_type: 'EIN' | 'SSN' | 'ITIN';
    address: Address;
    backup_withholding: boolean;
    exemption_code?: string;
  };
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
```

### Compliance Report
```typescript
interface ComplianceReport {
  id: string;
  organization_id: string;
  report_type: string;
  reporting_period: {
    period_type: 'monthly' | 'quarterly' | 'annual';
    year: number;
    quarter?: number;
    month?: number;
  };
  report_data: object;
  filters: object;
  status: 'generated' | 'filed_electronically' | 'filed_paper' | 'overdue';
  due_date: string;
  filed_date?: string;
  generated_by: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
}
```

## Compliance Thresholds

### 1099 Filing Thresholds (2023)
- **1099-NEC**: $600 or more for non-employee compensation
- **1099-MISC**: $600 or more for miscellaneous income
- **1099-K**: $20,000 and 200+ transactions (simplified)

### Filing Deadlines
- **1099 Forms to Recipients**: January 31
- **1099 Forms to IRS**: February 28 (March 31 if filing electronically)
- **Form 941**: Last day of month following end of quarter
- **Form 1120**: 15th day of 3rd month after tax year end

## Integration Examples

### Generate 1099-NEC Forms
```typescript
// Generate 1099-NEC forms for all eligible contractors
const response = await fetch('/api/v1/compliance/1099', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organization_id: 'org-uuid',
    tax_year: 2023,
    form_type: '1099-NEC',
    filters: {
      minimum_amount_cents: 60000, // $600 threshold
      include_corrections: false
    },
    options: {
      format: 'pdf',
      electronic_filing: true
    }
  })
});

const result = await response.json();
console.log(`Generated ${result.data.forms_generated} forms`);
console.log(`Filing deadline: ${result.data.filing_deadline}`);
```

### Register New 1099 Recipient
```typescript
// Register a new contractor for 1099 reporting
const response = await fetch('/api/v1/compliance/1099/recipients', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organization_id: 'org-uuid',
    recipient_info: {
      type: 'business',
      name: 'John Doe',
      business_name: 'Doe Contracting LLC',
      tin: '12-3456789',
      tin_type: 'EIN',
      address: {
        street: '123 Contractor St',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90210',
        country: 'US'
      },
      backup_withholding: false
    }
  })
});

const result = await response.json();
console.log(`Recipient registered: ${result.data.display_info.recipient_name}`);
```

### Generate Form 941
```typescript
// Generate quarterly payroll tax return
const response = await fetch('/api/v1/compliance/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organization_id: 'org-uuid',
    report_type: 'form_941',
    reporting_period: {
      period_type: 'quarterly',
      year: 2023,
      quarter: 4
    },
    output_options: {
      format: 'pdf',
      include_supporting_schedules: true,
      electronic_filing: false
    }
  })
});

const result = await response.json();
console.log(`Tax liability: ${result.data.filing_info.estimated_tax_liability}`);
console.log(`Due date: ${result.data.filing_info.due_date}`);
```

### Compliance Validation
```typescript
// Validate payroll tax reconciliation
const response = await fetch('/api/v1/compliance/reports/validate', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organization_id: 'org-uuid',
    validation_type: 'payroll_tax_reconciliation',
    period: {
      start_date: '2023-01-01',
      end_date: '2023-12-31'
    }
  })
});

const result = await response.json();
console.log(`Compliance score: ${result.data.validation_score}`);
console.log(`Issues found: ${result.data.issues_found.length}`);
```

## Error Handling

### Standard Error Response
```typescript
{
  error: string; // Human-readable error message
  details?: object; // Validation errors or additional context
  code?: string; // Error code for programmatic handling
  timestamp: string; // ISO 8601 timestamp
}
```

### Common Error Codes
- `COMP_001`: Invalid TIN format
- `COMP_002`: Recipient already exists
- `COMP_003`: Filing deadline passed
- `COMP_004`: Insufficient payment data
- `COMP_005`: Electronic filing not available

## Rate Limiting

- **Standard Plan**: 100 requests per hour per organization
- **Premium Plan**: 1,000 requests per hour per organization
- **Enterprise Plan**: Unlimited requests

## Compliance Notes

- **Data Retention**: Compliance records retained for 7 years per IRS requirements
- **Security**: All TINs encrypted at rest and masked in API responses
- **Accuracy**: Form calculations validated against current IRS specifications
- **Electronic Filing**: Available for most forms with IRS e-file integration
- **Audit Support**: Complete audit trails maintained for all compliance activities

## Testing

### Test Environment
- **Base URL**: `http://localhost:3000/api/v1/compliance`
- **Test Organization ID**: `550e8400-e29b-41d4-a716-446655440001`

### Mock Data Available
- Sample 1099 recipients with various TIN types
- Historical payment data for threshold testing
- Mock compliance reports for all supported forms
- Test scenarios for validation workflows

## Support

- **Documentation**: [https://docs.thorbis.com/compliance-api](https://docs.thorbis.com/compliance-api)
- **Support**: compliance-support@thorbis.com
- **IRS Updates**: Automatic form updates and threshold changes
- **Professional Services**: Implementation and setup assistance available

---

**Last Updated**: January 31, 2025  
**API Version**: 1.0.0  
**Document Version**: 1.0.0