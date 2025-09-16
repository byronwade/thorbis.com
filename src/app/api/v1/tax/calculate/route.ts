/**
 * Tax Calculation API
 * Calculate taxes for transactions across all Thorbis verticals
 * 
 * Features: Multi-jurisdictional tax calculation, sales tax, VAT, service tax
 * Integration: TaxJar, Avalara, internal tax tables
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Tax calculation request schema
const TaxCalculationSchema = z.object({
  organization_id: z.string().uuid(),
  transaction: z.object({
    type: z.enum(['invoice', 'estimate', 'payment', 'refund', 'expense']),
    line_items: z.array(z.object({
      id: z.string(),
      description: z.string(),
      amount_cents: z.number().int().min(0),
      quantity: z.number().min(0).default(1),
      product_type: z.enum(['service', 'product', 'digital', 'shipping']),
      tax_category: z.string().optional(),
      exempt: z.boolean().default(false)
    })),
    customer_info: z.object({
      type: z.enum(['individual', 'business', 'nonprofit', 'government']),
      tax_id: z.string().optional(),
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        postal_code: z.string(),
        country: z.string().default('US')
      }),
      tax_exempt: z.boolean().default(false),
      tax_exemption_certificate: z.string().optional()
    }),
    business_address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      country: z.string().default('US')
    }),
    date: z.string().optional()
  }),
  options: z.object({
    provider: z.enum(['internal', 'taxjar', 'avalara']).default('internal'),
    include_breakdown: z.boolean().default(true),
    validate_addresses: z.boolean().default(false),
    commit_transaction: z.boolean().default(false)
  }).optional()
});

// GET /api/v1/tax/rates - Get tax rates for a location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const country = searchParams.get('country') || 'US';
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const postalCode = searchParams.get('postal_code');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get tax rates for the specified location
    const taxRates = await getTaxRatesForLocation(
      supabase,
      { country, state, city, postal_code: postalCode }
    );

    return NextResponse.json({
      data: {
        location: { country, state, city, postal_code: postalCode },
        tax_rates: taxRates,
        effective_date: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Tax rates API error:', error);
    return NextResponse.json(
      { error: 'Failed to get tax rates' },
      { status: 500 }
    );
  }
}

// POST /api/v1/tax/calculate - Calculate taxes for a transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = TaxCalculationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid tax calculation request', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { organization_id, transaction, options = {} } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Verify organization exists and get tax settings
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('
        id,
        name,
        status,
        tax_settings,
        business_address,
        industry
      ')
      .eq('id', organization_id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get tax jurisdiction and rules
    const taxJurisdiction = await determineTaxJurisdiction(
      transaction.business_address,
      transaction.customer_info.address,
      organization.industry
    );

    // Calculate taxes based on provider
    let taxCalculation;
    switch (options.provider) {
      case 'taxjar':
        taxCalculation = await calculateTaxesWithTaxJar(transaction, taxJurisdiction);
        break;
      case 'avalara':
        taxCalculation = await calculateTaxesWithAvalara(transaction, taxJurisdiction);
        break;
      default:
        taxCalculation = await calculateTaxesInternal(
          supabase,
          transaction,
          taxJurisdiction,
          organization.tax_settings
        );
    }

    // Apply exemptions if applicable
    if (transaction.customer_info.tax_exempt) {
      taxCalculation = applyTaxExemptions(taxCalculation, transaction.customer_info);
    }

    // Store calculation for audit purposes
    const { data: calculationRecord } = await supabase
      .from('tax_calculations')
      .insert({
        organization_id,
        transaction_type: transaction.type,
        customer_address: transaction.customer_info.address,
        business_address: transaction.business_address,
        subtotal_cents: transaction.line_items.reduce((sum, item) => 
          sum + (item.amount_cents * item.quantity), 0),
        tax_amount_cents: taxCalculation.total_tax_cents,
        tax_rate_percentage: taxCalculation.effective_tax_rate,
        tax_breakdown: taxCalculation.breakdown,
        provider: options.provider,
        calculation_date: new Date().toISOString(),
        committed: options.commit_transaction || false
      })
      .select('id')
      .single();

    return NextResponse.json({
      data: {
        calculation_id: calculationRecord?.id,
        subtotal_cents: transaction.line_items.reduce((sum, item) => 
          sum + (item.amount_cents * item.quantity), 0),
        tax_amount_cents: taxCalculation.total_tax_cents,
        total_cents: transaction.line_items.reduce((sum, item) => 
          sum + (item.amount_cents * item.quantity), 0) + taxCalculation.total_tax_cents,
        effective_tax_rate: taxCalculation.effective_tax_rate,
        tax_breakdown: options.include_breakdown ? taxCalculation.breakdown : undefined,
        jurisdiction: taxJurisdiction,
        exemptions_applied: taxCalculation.exemptions_applied || [],
        display_info: {
          subtotal_formatted: formatCurrency(transaction.line_items.reduce((sum, item) => 
            sum + (item.amount_cents * item.quantity), 0)),
          tax_amount_formatted: formatCurrency(taxCalculation.total_tax_cents),
          total_formatted: formatCurrency(
            transaction.line_items.reduce((sum, item) => 
              sum + (item.amount_cents * item.quantity), 0) + taxCalculation.total_tax_cents
          ),
          tax_summary: taxCalculation.breakdown?.map(b => ({
            name: b.name,
            rate: '${b.rate}%',
            amount: formatCurrency(b.amount_cents)
          })) || []
        }
      },
      meta: {
        calculated_at: new Date().toISOString(),
        provider: options.provider,
        jurisdiction: taxJurisdiction.name,
        committed: options.commit_transaction || false
      }
    });

  } catch (error) {
    console.error('Tax calculation API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate taxes' },
      { status: 500 }
    );
  }
}

// Helper Functions
async function getTaxRatesForLocation(supabase: unknown, location: unknown) {
  // Mock tax rates - in production, this would query actual tax rate tables
  const mockRates = {
    'US': {
      'CA': {
        state_rate: 7.25,
        local_rates: [
          { jurisdiction: 'Los Angeles', rate: 2.75 },
          { jurisdiction: 'San Francisco', rate: 3.5 }
        ]
      },
      'NY': {
        state_rate: 8.0,
        local_rates: [
          { jurisdiction: 'New York City', rate: 4.5 }
        ]
      },
      'TX': {
        state_rate: 6.25,
        local_rates: [
          { jurisdiction: 'Austin', rate: 2.0 },
          { jurisdiction: 'Houston', rate: 2.75 }
        ]
      }
    }
  };

  const countryRates = mockRates[location.country as keyof typeof mockRates];
  if (!countryRates) {
    return { state_rate: 0, local_rates: [] };
  }

  const stateRates = countryRates[location.state as keyof typeof countryRates];
  if (!stateRates) {
    return { state_rate: 0, local_rates: [] };
  }

  return stateRates;
}

async function determineTaxJurisdiction(businessAddress: unknown, customerAddress: unknown, industry: string) {
  // Determine tax jurisdiction based on business rules
  // For US: generally based on where business is located or has nexus
  
  const isServiceBusiness = ['hs', 'auto'].includes(industry);
  const primaryAddress = isServiceBusiness ? businessAddress : customerAddress;

  return {
    name: '${primaryAddress.city}, ${primaryAddress.state}',
    country: primaryAddress.country,
    state: primaryAddress.state,
    city: primaryAddress.city,
    postal_code: primaryAddress.postal_code,
    tax_type: primaryAddress.country === 'US' ? 'sales_tax' : 'vat',
    service_location: isServiceBusiness,
    nexus_rules: {
      physical_presence: true,
      economic_nexus: false // Would be calculated based on sales volume
    }
  };
}

async function calculateTaxesInternal(supabase: unknown, transaction: unknown, jurisdiction: unknown, taxSettings: unknown) {
  const breakdown: unknown[] = [];
  let totalTaxCents = 0;

  // Get tax rates for jurisdiction
  const taxRates = await getTaxRatesForLocation(supabase, jurisdiction);
  
  // Calculate state tax
  if (taxRates.state_rate > 0) {
    const stateTaxCents = Math.round(
      transaction.line_items.reduce((sum: number, item: unknown) => {
        if (item.exempt) return sum;
        return sum + (item.amount_cents * item.quantity * (taxRates.state_rate / 100));
      }, 0)
    );

    if (stateTaxCents > 0) {
      breakdown.push({
        name: '${jurisdiction.state} State Tax',
        rate: taxRates.state_rate,
        amount_cents: stateTaxCents,
        jurisdiction_type: 'state'
      });
      totalTaxCents += stateTaxCents;
    }
  }

  // Calculate local taxes
  for (const localRate of taxRates.local_rates) {
    const localTaxCents = Math.round(
      transaction.line_items.reduce((sum: number, item: unknown) => {
        if (item.exempt) return sum;
        return sum + (item.amount_cents * item.quantity * (localRate.rate / 100));
      }, 0)
    );

    if (localTaxCents > 0) {
      breakdown.push({
        name: '${localRate.jurisdiction} Local Tax',
        rate: localRate.rate,
        amount_cents: localTaxCents,
        jurisdiction_type: 'local'
      });
      totalTaxCents += localTaxCents;
    }
  }

  const subtotalCents = transaction.line_items.reduce((sum: number, item: unknown) => 
    sum + (item.amount_cents * item.quantity), 0);

  const effectiveTaxRate = subtotalCents > 0 ? (totalTaxCents / subtotalCents) * 100 : 0;

  return {
    total_tax_cents: totalTaxCents,
    effective_tax_rate: effectiveTaxRate,
    breakdown
  };
}

async function calculateTaxesWithTaxJar(transaction: unknown, jurisdiction: unknown) {
  // Mock TaxJar API integration
  // In production, this would make actual API calls to TaxJar
  
  const mockTaxRate = 8.5; // Combined rate
  const subtotalCents = transaction.line_items.reduce((sum: number, item: unknown) => 
    sum + (item.amount_cents * item.quantity), 0);
  
  const totalTaxCents = Math.round(subtotalCents * (mockTaxRate / 100));

  return {
    total_tax_cents: totalTaxCents,
    effective_tax_rate: mockTaxRate,
    breakdown: [
      {
        name: 'Sales Tax (TaxJar)',
        rate: mockTaxRate,
        amount_cents: totalTaxCents,
        jurisdiction_type: 'combined'
      }
    ],
    provider_response: {
      provider: 'taxjar',
      confidence: 'high'
    }
  };
}

async function calculateTaxesWithAvalara(transaction: unknown, jurisdiction: unknown) {
  // Mock Avalara API integration
  // In production, this would make actual API calls to Avalara
  
  const mockTaxRate = 7.75; // Combined rate
  const subtotalCents = transaction.line_items.reduce((sum: number, item: unknown) => 
    sum + (item.amount_cents * item.quantity), 0);
  
  const totalTaxCents = Math.round(subtotalCents * (mockTaxRate / 100));

  return {
    total_tax_cents: totalTaxCents,
    effective_tax_rate: mockTaxRate,
    breakdown: [
      {
        name: 'Sales Tax (Avalara)',
        rate: mockTaxRate,
        amount_cents: totalTaxCents,
        jurisdiction_type: 'combined'
      }
    ],
    provider_response: {
      provider: 'avalara',
      confidence: 'high'
    }
  };
}

function applyTaxExemptions(taxCalculation: unknown, customerInfo: unknown) {
  if (!customerInfo.tax_exempt) return taxCalculation;

  return {
    ...taxCalculation,
    total_tax_cents: 0,
    effective_tax_rate: 0,
    breakdown: taxCalculation.breakdown.map((item: unknown) => ({
      ...item,
      amount_cents: 0,
      exemption_applied: true
    })),
    exemptions_applied: [
      {
        type: 'customer_exempt',
        certificate: customerInfo.tax_exemption_certificate,
        reason: 'Customer has valid tax exemption certificate'
      }
    ]
  };
}

function formatCurrency(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(cents / 100);
}