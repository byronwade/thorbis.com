/**
 * Tax Reporting API
 * Generate tax reports for compliance and financial reporting
 * 
 * Features: Sales tax reports, use tax reports, exemption reports, audit trails
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Tax report request schema
const TaxReportSchema = z.object({
  organization_id: z.string().uuid(),
  report_type: z.enum([
    'sales_tax_summary',
    'detailed_transactions', 
    'exemption_report',
    'jurisdiction_breakdown',
    'audit_trail',
    'monthly_filing',
    'quarterly_filing',
    'annual_summary'
  ]),
  date_range: z.object({
    start_date: z.string(),
    end_date: z.string()
  }),
  filters: z.object({
    jurisdiction: z.string().optional(),
    transaction_types: z.array(z.string()).optional(),
    customer_types: z.array(z.string()).optional(),
    product_categories: z.array(z.string()).optional()
  }).optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  include_details: z.boolean().default(true)
});

// GET /api/v1/tax/reports - Generate tax reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const reportType = searchParams.get('report_type') || 'sales_tax_summary';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const jurisdiction = searchParams.get('jurisdiction');
    const format = searchParams.get('format') || 'json';

    if (!organizationId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'organization_id, start_date, and end_date parameters are required' },
        { status: 400 }
      );
    }

    const reportRequest = {
      organization_id: organizationId,
      report_type: reportType,
      date_range: { start_date: startDate, end_date: endDate },
      filters: jurisdiction ? { jurisdiction } : undefined,
      format,
      include_details: true
    };

    const validationResult = TaxReportSchema.safeParse(reportRequest);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid report parameters', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const reportData = await generateTaxReport(supabase, validationResult.data);

    // Return different formats based on request
    if (format === 'csv') {
      return new NextResponse(reportData.csv_content, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="tax-report-${reportType}-${startDate}-${endDate}.csv"'
        }
      });
    }

    return NextResponse.json({
      data: reportData,
      meta: {
        generated_at: new Date().toISOString(),
        report_parameters: validationResult.data,
        record_count: reportData.summary?.total_transactions || 0
      }
    });

  } catch (error) {
    console.error('Tax reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tax report' },
      { status: 500 }
    );
  }
}

// POST /api/v1/tax/reports - Generate comprehensive tax report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = TaxReportSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid tax report request', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const reportParams = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Verify organization access
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, tax_settings, business_address')
      .eq('id', reportParams.organization_id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const reportData = await generateTaxReport(supabase, reportParams);

    // Store report generation record
    await supabase
      .from('tax_reports')
      .insert({
        organization_id: reportParams.organization_id,
        report_type: reportParams.report_type,
        date_range: reportParams.date_range,
        filters: reportParams.filters || {},
        generated_by: 'api', // In real app, this would be user ID
        generated_at: new Date().toISOString(),
        report_data: reportData.summary
      });

    return NextResponse.json({
      data: reportData,
      organization: {
        name: organization.name,
        business_address: organization.business_address
      },
      meta: {
        generated_at: new Date().toISOString(),
        report_parameters: reportParams,
        record_count: reportData.summary?.total_transactions || 0,
        compliance_period: formatCompliancePeriod(reportParams.date_range)
      }
    });

  } catch (error) {
    console.error('Tax report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comprehensive tax report' },
      { status: 500 }
    );
  }
}

// Helper Functions
async function generateTaxReport(supabase: unknown, params: unknown) {
  switch (params.report_type) {
    case 'sales_tax_summary':
      return await generateSalesTaxSummary(supabase, params);
    case 'detailed_transactions':
      return await generateDetailedTransactionsReport(supabase, params);
    case 'exemption_report':
      return await generateExemptionReport(supabase, params);
    case 'jurisdiction_breakdown':
      return await generateJurisdictionBreakdown(supabase, params);
    case 'audit_trail':
      return await generateAuditTrail(supabase, params);
    case 'monthly_filing':
      return await generateMonthlyFilingReport(supabase, params);
    case 'quarterly_filing':
      return await generateQuarterlyFilingReport(supabase, params);
    case 'annual_summary':
      return await generateAnnualSummary(supabase, params);
    default:
      throw new Error('Unsupported report type: ${params.report_type}');
  }
}

async function generateSalesTaxSummary(supabase: unknown, params: unknown) {
  // Mock sales tax summary data
  const mockData = {
    summary: {
      reporting_period: params.date_range,
      total_transactions: 2847,
      taxable_sales_cents: 2456789,
      exempt_sales_cents: 234567,
      total_tax_collected_cents: 196543,
      effective_tax_rate: 8.0,
      jurisdictions_count: 12
    },
    by_jurisdiction: [
      {
        jurisdiction: 'California State',
        jurisdiction_type: 'state',
        tax_rate: 7.25,
        taxable_sales_cents: 1567890,
        tax_collected_cents: 113621,
        transaction_count: 1456
      },
      {
        jurisdiction: 'Los Angeles County',
        jurisdiction_type: 'county',
        tax_rate: 2.75,
        taxable_sales_cents: 1234567,
        tax_collected_cents: 33951,
        transaction_count: 987
      },
      {
        jurisdiction: 'City of Los Angeles',
        jurisdiction_type: 'city',
        tax_rate: 1.0,
        taxable_sales_cents: 987654,
        tax_collected_cents: 9877,
        transaction_count: 654
      }
    ],
    by_product_type: [
      {
        product_type: 'service',
        taxable_sales_cents: 1876543,
        tax_collected_cents: 150123,
        transaction_count: 2134
      },
      {
        product_type: 'product',
        taxable_sales_cents: 456789,
        tax_collected_cents: 36543,
        transaction_count: 567
      },
      {
        product_type: 'digital',
        taxable_sales_cents: 123457,
        tax_collected_cents: 9877,
        transaction_count: 146
      }
    ],
    payment_due: {
      amount_cents: 196543,
      due_date: '2024-03-20',
      filing_frequency: 'monthly`
    }
  };

  // Add display formatting
  mockData.summary = {
    ...mockData.summary,
    display_info: {
      taxable_sales_formatted: formatCurrency(mockData.summary.taxable_sales_cents),
      exempt_sales_formatted: formatCurrency(mockData.summary.exempt_sales_cents),
      tax_collected_formatted: formatCurrency(mockData.summary.total_tax_collected_cents),
      effective_tax_rate_display: '${mockData.summary.effective_tax_rate}%'
    }
  };

  return mockData;
}

async function generateDetailedTransactionsReport(supabase: unknown, params: unknown) {
  const mockTransactions = [];
  
  // Generate mock transaction data
  for (const i = 1; i <= 50; i++) {
    mockTransactions.push({
      transaction_id: 'txn_${String(i).padStart(6, '0')}',
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: ['invoice', 'payment', 'refund'][Math.floor(Math.random() * 3)],
      customer_name: 'Customer ${i}',
      customer_address: {
        city: ['Los Angeles', 'San Francisco', 'San Diego'][Math.floor(Math.random() * 3)],
        state: 'CA',
        postal_code: '90210'
      },
      subtotal_cents: Math.floor(Math.random() * 50000 + 10000),
      tax_cents: Math.floor(Math.random() * 4000 + 800),
      total_cents: 0, // Will be calculated
      tax_rate: 8.0 + Math.random() * 2,
      jurisdiction: 'Los Angeles, CA',
      exemption_reason: Math.random() > 0.9 ? 'Resale Certificate' : null,
      product_categories: ['Service', 'Product'][Math.floor(Math.random() * 2)]
    });
  }

  // Calculate totals
  mockTransactions.forEach(tx => {
    tx.total_cents = tx.subtotal_cents + tx.tax_cents;
  });

  return {
    transactions: mockTransactions.map(tx => ({
      ...tx,
      display_info: {
        subtotal_formatted: formatCurrency(tx.subtotal_cents),
        tax_formatted: formatCurrency(tx.tax_cents),
        total_formatted: formatCurrency(tx.total_cents),
        tax_rate_display: '${tx.tax_rate.toFixed(2)}%'
      }
    })),
    summary: {
      total_transactions: mockTransactions.length,
      total_subtotal_cents: mockTransactions.reduce((sum, tx) => sum + tx.subtotal_cents, 0),
      total_tax_cents: mockTransactions.reduce((sum, tx) => sum + tx.tax_cents, 0),
      total_amount_cents: mockTransactions.reduce((sum, tx) => sum + tx.total_cents, 0),
      average_tax_rate: mockTransactions.reduce((sum, tx) => sum + tx.tax_rate, 0) / mockTransactions.length
    }
  };
}

async function generateExemptionReport(supabase: unknown, params: unknown) {
  return {
    summary: {
      total_exempt_transactions: 45,
      total_exempt_amount_cents: 567890,
      potential_tax_savings_cents: 45431
    },
    exemptions: [
      {
        exemption_type: 'Resale Certificate',
        transaction_count: 23,
        exempt_amount_cents: 345678,
        tax_savings_cents: 27654,
        customers_count: 12
      },
      {
        exemption_type: 'Non-profit Organization',
        transaction_count: 15,
        exempt_amount_cents: 156789,
        tax_savings_cents: 12543,
        customers_count: 8
      },
      {
        exemption_type: 'Government Entity',
        transaction_count: 7,
        exempt_amount_cents: 65423,
        tax_savings_cents: 5234,
        customers_count: 3
      }
    ],
    certificates_expiring: [
      {
        customer_name: 'ABC Non-profit',
        certificate_number: 'CERT-12345',
        expiration_date: '2024-12-31',
        exempt_amount_ytd_cents: 45678
      }
    ]
  };
}

async function generateJurisdictionBreakdown(supabase: unknown, params: unknown) {
  return {
    jurisdictions: [
      {
        name: 'California State',
        type: 'state',
        tax_rate: 7.25,
        taxable_sales_cents: 1567890,
        tax_collected_cents: 113621,
        filing_frequency: 'quarterly',
        next_due_date: '2024-04-30'
      },
      {
        name: 'Los Angeles County',
        type: 'county', 
        tax_rate: 2.75,
        taxable_sales_cents: 987654,
        tax_collected_cents: 27161,
        filing_frequency: 'quarterly',
        next_due_date: '2024-04-30'
      },
      {
        name: 'City of Los Angeles',
        type: 'city',
        tax_rate: 1.0,
        taxable_sales_cents: 654321,
        tax_collected_cents: 6543,
        filing_frequency: 'monthly',
        next_due_date: '2024-03-20'
      }
    ],
    summary: {
      total_jurisdictions: 3,
      combined_rate: 10.0,
      total_tax_collected_cents: 147325,
      compliance_status: 'current'
    }
  };
}

async function generateAuditTrail(supabase: unknown, params: unknown) {
  return {
    audit_events: [
      {
        event_id: 'audit_001',
        timestamp: '2024-01-15T10:30:00Z',
        event_type: 'tax_calculation',
        user: 'system',
        transaction_id: 'txn_123456',
        changes: {
          tax_rate_used: 8.5,
          calculation_method: 'internal',
          jurisdiction: 'Los Angeles, CA'
        }
      },
      {
        event_id: 'audit_002',
        timestamp: '2024-01-15T14:22:00Z',
        event_type: 'exemption_applied',
        user: 'jane.doe@company.com',
        transaction_id: 'txn_123457',
        changes: {
          exemption_type: 'resale_certificate',
          certificate_number: 'RC-789',
          original_tax_cents: 4567,
          final_tax_cents: 0
        }
      }
    ],
    summary: {
      total_events: 245,
      event_types: ['tax_calculation', 'exemption_applied', 'rate_change', 'jurisdiction_update'],
      date_range: params.date_range
    }
  };
}

async function generateMonthlyFilingReport(supabase: unknown, params: unknown) {
  return {
    filing_summary: {
      filing_period: formatFilingPeriod(params.date_range),
      gross_receipts_cents: 2456789,
      exempt_sales_cents: 234567,
      taxable_sales_cents: 2222222,
      tax_due_cents: 177778,
      filing_deadline: '2024-03-20',
      jurisdiction: 'California'
    },
    schedule_a: {
      // Detailed breakdown by jurisdiction
      state_tax: { taxable_cents: 2222222, rate: 7.25, tax_cents: 161111 },
      local_tax: { taxable_cents: 2222222, rate: 0.75, tax_cents: 16667 }
    },
    remittance_advice: {
      amount_due_cents: 177778,
      payment_methods: ['electronic', 'check'],
      reference_number: 'CA-2024-01-ORG123'
    }
  };
}

async function generateQuarterlyFilingReport(supabase: unknown, params: unknown) {
  return {
    filing_summary: {
      filing_period: 'Q${Math.floor(new Date().getMonth() / 3) + 1} 2024',
      total_gross_receipts_cents: 7456789,
      total_exempt_sales_cents: 734567,
      total_taxable_sales_cents: 6722222,
      total_tax_due_cents: 537778,
      filing_deadline: '2024-04-30'
    },
    monthly_breakdown: [
      {
        month: 'January 2024',
        gross_receipts_cents: 2456789,
        taxable_sales_cents: 2222222,
        tax_due_cents: 177778
      },
      {
        month: 'February 2024',
        gross_receipts_cents: 2345678,
        taxable_sales_cents: 2111111,
        tax_due_cents: 168889
      },
      {
        month: 'March 2024',
        gross_receipts_cents: 2654321,
        taxable_sales_cents: 2388889,
        tax_due_cents: 191111
      }
    ]
  };
}

async function generateAnnualSummary(supabase: unknown, params: unknown) {
  return {
    annual_summary: {
      year: new Date(params.date_range.start_date).getFullYear(),
      total_transactions: 34164,
      total_gross_receipts_cents: 29482156,
      total_exempt_sales_cents: 2848215,
      total_taxable_sales_cents: 26633941,
      total_tax_collected_cents: 2130715,
      average_tax_rate: 8.0
    },
    quarterly_breakdown: [
      { quarter: 'Q1', taxable_cents: 6633941, tax_cents: 530715 },
      { quarter: 'Q2', taxable_cents: 6833941, tax_cents: 546715 },
      { quarter: 'Q3', taxable_cents: 6533941, tax_cents: 522715 },
      { quarter: 'Q4', taxable_cents: 6632118, tax_cents: 530570 }
    ],
    compliance_summary: {
      filings_submitted: 12,
      filings_on_time: 12,
      compliance_rate: 100,
      penalties_assessed_cents: 0,
      interest_charged_cents: 0
    }
  };
}

function formatCompliancePeriod(dateRange: unknown): string {
  const start = new Date(dateRange.start_date);
  const end = new Date(dateRange.end_date);
  
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  
  return '${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}';
}

function formatFilingPeriod(dateRange: unknown): string {
  const start = new Date(dateRange.start_date);
  return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatCurrency(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(cents / 100);
}