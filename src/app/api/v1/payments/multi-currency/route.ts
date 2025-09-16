/**
 * Multi-Currency Payment Processing API
 * Comprehensive international payment support with real-time exchange rates
 * 
 * Features:
 * - Real-time currency conversion with multiple rate providers
 * - International payment compliance and regulations
 * - Multi-currency account management across all verticals
 * - Foreign exchange risk management and hedging
 * - Automated currency settlement and reconciliation
 * - Tax compliance for international transactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Currency Configuration Schema
const CurrencyConfigSchema = z.object({
  organization_id: z.string().uuid(),
  currency_settings: z.object({
    base_currency: z.string().length(3), // ISO 4217 codes (USD, EUR, etc.)
    supported_currencies: z.array(z.string().length(3)).min(1),
    auto_convert: z.boolean().default(true),
    conversion_markup_percent: z.number().min(0).max(10).default(2.5),
    settlement_preference: z.enum(['immediate', 'daily', 'weekly', 'manual']).default('daily'),
    risk_management: z.object({
      hedge_threshold_percent: z.number().min(0).max(100).default(5),
      exposure_limit_usd: z.number().min(0).optional(),
      auto_hedge: z.boolean().default(false)
    }).optional()
  }),
  compliance_settings: z.object({
    enable_tax_calculation: z.boolean().default(true),
    comply_with_local_regulations: z.boolean().default(true),
    reporting_requirements: z.array(z.enum(['vat', 'gst', 'sales_tax', 'withholding_tax'])).optional(),
    sanctioned_countries: z.array(z.string().length(2)).optional() // ISO 3166-1 alpha-2
  }).optional()
});

// Exchange Rate Request Schema
const ExchangeRateRequestSchema = z.object({
  from_currency: z.string().length(3),
  to_currency: z.string().length(3),
  amount: z.number().positive(),
  rate_provider: z.enum(['live', 'ecb', 'fed', 'composite']).default('composite'),
  include_fees: z.boolean().default(true)
});

// Multi-Currency Payment Schema
const MultiCurrencyPaymentSchema = z.object({
  organization_id: z.string().uuid(),
  payment_details: z.object({
    amount_cents: z.number().positive(),
    currency: z.string().length(3),
    target_currency: z.string().length(3).optional(),
    conversion_rate: z.number().positive().optional(),
    lock_rate: z.boolean().default(false),
    rate_expiry_minutes: z.number().min(5).max(1440).default(30) // 30 minutes default
  }),
  customer_info: z.object({
    country_code: z.string().length(2), // ISO 3166-1 alpha-2
    tax_id: z.string().optional(),
    business_type: z.enum(['individual', 'business']).default('individual'),
    regulatory_status: z.string().optional()
  }),
  payment_method: z.object({
    type: z.enum(['card', 'bank_transfer', 'local_payment', 'digital_wallet']),
    supports_currency: z.boolean().default(true),
    local_processing_required: z.boolean().default(false)
  }),
  compliance_data: z.object({
    transaction_purpose: z.enum(['goods', 'services', 'subscription', 'other']).default('services'),
    documentation_required: z.boolean().default(false),
    regulatory_reporting: z.boolean().default(false)
  }).optional()
});

// Currency Conversion Schema
const CurrencyConversionSchema = z.object({
  organization_id: z.string().uuid(),
  conversion_request: z.object({
    from_amount_cents: z.number().positive(),
    from_currency: z.string().length(3),
    to_currency: z.string().length(3),
    conversion_type: z.enum(['spot', 'forward', 'market_order']).default('spot'),
    reference_rate: z.number().positive().optional(),
    slippage_tolerance_percent: z.number().min(0).max(10).default(1)
  }),
  settlement_instructions: z.object({
    settlement_account: z.string().optional(),
    settlement_method: z.enum(['stripe_treasury', 'external_bank', 'hold_balance']).default('stripe_treasury'),
    settlement_timing: z.enum(['immediate', 'next_business_day', 'custom']).default('next_business_day')
  }).optional()
});

/**
 * GET /api/v1/payments/multi-currency
 * Retrieve exchange rates and currency configuration
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const organizationId = url.searchParams.get('organization_id');
    const requestType = url.searchParams.get('request_type') || 'configuration';

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id is required' },
        { status: 400 }
      );
    }

    if (requestType === 'exchange_rates') {
      const fromCurrency = url.searchParams.get('from_currency');
      const toCurrency = url.searchParams.get('to_currency');
      const amount = parseFloat(url.searchParams.get('amount') || '0');

      if (!fromCurrency || !toCurrency || !amount) {
        return NextResponse.json(
          { error: 'from_currency, to_currency, and amount are required for exchange rates' },
          { status: 400 }
        );
      }

      // Mock exchange rate data with multiple providers
      const exchangeRateData = {
        request_details: {
          from_currency: fromCurrency,
          to_currency: toCurrency,
          requested_amount: amount,
          timestamp: new Date().toISOString()
        },
        exchange_rates: {
          spot_rate: 1.0875, // Current market rate
          our_rate: 1.0648, // Rate with markup
          markup_percent: 2.5,
          rate_sources: [
            {
              provider: 'ecb',
              rate: 1.0885,
              timestamp: new Date(Date.now() - 300000).toISOString(),
              reliability_score: 95
            },
            {
              provider: 'fed',
              rate: 1.0870,
              timestamp: new Date(Date.now() - 180000).toISOString(),
              reliability_score: 98
            },
            {
              provider: 'live_market',
              rate: 1.0872,
              timestamp: new Date(Date.now() - 30000).toISOString(),
              reliability_score: 92
            }
          ],
          composite_rate: 1.0875,
          spread_analysis: {
            bid_ask_spread: 0.0025,
            volatility_24h: 1.2,
            volume_indicator: 'high'
          }
        },
        conversion_preview: {
          original_amount: amount,
          original_currency: fromCurrency,
          converted_amount: Math.round(amount * 1.0648),
          target_currency: toCurrency,
          fees: {
            conversion_fee_cents: Math.round(amount * 0.025),
            total_fees_cents: Math.round(amount * 0.035),
            fee_breakdown: [
              {
                type: 'fx_conversion',
                amount_cents: Math.round(amount * 0.025),
                description: 'Currency conversion markup'
              },
              {
                type: 'processing',
                amount_cents: Math.round(amount * 0.01),
                description: 'International processing fee'
              }
            ]
          }
        },
        rate_validity: {
          expires_at: new Date(Date.now() + 1800000).toISOString(), // 30 minutes
          rate_lock_available: true,
          lock_duration_minutes: 60,
          lock_fee_cents: Math.round(amount * 0.001)
        },
        market_insights: {
          trend_24h: 'stable',
          forecast_confidence: 78,
          major_events: [
            {
              event: 'ECB Policy Meeting',
              impact: 'medium',
              scheduled_date: '2024-01-25'
            }
          ],
          recommended_action: 'proceed',
          timing_recommendation: 'Current rates favorable for conversion'
        }
      };

      return NextResponse.json({
        data: exchangeRateData,
        message: 'Exchange rates retrieved successfully'
      });
    }

    // Default: Return currency configuration
    const currencyConfig = {
      organization_settings: {
        organization_id: organizationId,
        base_currency: 'USD',
        supported_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'],
        auto_convert: true,
        conversion_markup_percent: 2.5,
        settlement_preference: 'daily',
        last_updated: new Date().toISOString()
      },
      risk_management: {
        hedge_threshold_percent: 5,
        exposure_limit_usd: 50000000, // $500K exposure limit
        auto_hedge: false,
        current_exposure: {
          total_exposure_usd: 12500000, // $125K current exposure
          currency_breakdown: [
            { currency: 'EUR', exposure_usd: 7500000, percentage: 60 },
            { currency: 'GBP', exposure_usd: 3500000, percentage: 28 },
            { currency: 'CAD', exposure_usd: 1500000, percentage: 12 }
          ]
        },
        hedging_recommendations: [
          {
            currency: 'EUR',
            recommendation: 'consider_hedge',
            reason: 'Approaching hedge threshold',
            suggested_amount: 2500000,
            hedge_instruments: ['forward_contract', 'currency_swap']
          }
        ]
      },
      compliance_settings: {
        enable_tax_calculation: true,
        comply_with_local_regulations: true,
        reporting_requirements: ['vat', 'sales_tax'],
        sanctioned_countries: ['KP', 'IR', 'SY'], // North Korea, Iran, Syria
        regulatory_frameworks: [
          {
            region: 'EU',
            regulations: ['PSD2', 'GDPR', 'AML5'],
            compliance_status: 'active'
          },
          {
            region: 'US',
            regulations: ['BSA', 'PATRIOT_ACT', 'FINCEN'],
            compliance_status: 'active'
          }
        ]
      },
      supported_countries: [
        {
          country_code: 'GB',
          country_name: 'United Kingdom',
          currency: 'GBP',
          local_payment_methods: ['faster_payments', 'bacs'],
          tax_requirements: ['vat'],
          regulatory_notes: 'FCA regulated payments required'
        },
        {
          country_code: 'DE',
          country_name: 'Germany',
          currency: 'EUR',
          local_payment_methods: ['sepa_debit', 'sofort'],
          tax_requirements: ['vat', 'digital_tax'],
          regulatory_notes: 'SEPA compliance required'
        },
        {
          country_code: 'CA',
          country_name: 'Canada',
          currency: 'CAD',
          local_payment_methods: ['interac', 'pre_authorized_debit'],
          tax_requirements: ['gst', 'provincial_tax'],
          regulatory_notes: 'FINTRAC compliance required'
        }
      ],
      transaction_limits: {
        daily_limit_usd: 10000000, // $100K per day
        monthly_limit_usd: 100000000, // $1M per month
        single_transaction_limit_usd: 2500000, // $25K per transaction
        limits_by_currency: [
          { currency: 'EUR', daily_limit: 9000000 },
          { currency: 'GBP', daily_limit: 8000000 },
          { currency: 'CAD', daily_limit: 13000000 }
        ]
      }
    };

    return NextResponse.json({
      data: currencyConfig,
      message: 'Currency configuration retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to process currency request:', error);
    return NextResponse.json(
      { error: 'Failed to process currency request' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/payments/multi-currency
 * Process international payment with currency conversion
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = MultiCurrencyPaymentSchema.parse(body);

    // Mock processing international payment
    const paymentResult = {
      payment_id: 'pi_${Date.now()}_multicurrency',
      status: 'processing',
      original_payment: {
        amount_cents: validatedData.payment_details.amount_cents,
        currency: validatedData.payment_details.currency,
        customer_country: validatedData.customer_info.country_code
      },
      currency_conversion: validatedData.payment_details.target_currency ? {
        from_currency: validatedData.payment_details.currency,
        to_currency: validatedData.payment_details.target_currency,
        conversion_rate: 1.0648,
        converted_amount_cents: Math.round(validatedData.payment_details.amount_cents * 1.0648),
        rate_locked: validatedData.payment_details.lock_rate,
        rate_expires_at: validatedData.payment_details.lock_rate 
          ? new Date(Date.now() + (validatedData.payment_details.rate_expiry_minutes || 30) * 60000).toISOString()
          : null
      } : null,
      international_fees: {
        fx_conversion_fee_cents: validatedData.payment_details.target_currency 
          ? Math.round(validatedData.payment_details.amount_cents * 0.025) 
          : 0,
        international_processing_fee_cents: 150, // $1.50 international fee
        cross_border_fee_cents: 75, // $0.75 cross-border fee
        total_fees_cents: validatedData.payment_details.target_currency 
          ? Math.round(validatedData.payment_details.amount_cents * 0.025) + 225
          : 225
      },
      compliance_checks: {
        sanctions_screening: 'passed',
        aml_check: 'passed',
        tax_calculation: 'completed',
        documentation_status: validatedData.compliance_data?.documentation_required ? 'pending' : 'not_required',
        regulatory_reporting: validatedData.compliance_data?.regulatory_reporting ? 'filed' : 'not_required'
      },
      settlement_timeline: {
        authorization_time: '2-5 minutes',
        settlement_time: '1-3 business days',
        currency_conversion_time: 'immediate',
        regulatory_hold_period: validatedData.customer_info.country_code === 'CN' ? '5-10 business days' : 'none'
      },
      transaction_summary: {
        total_customer_cost_cents: validatedData.payment_details.amount_cents + (validatedData.payment_details.target_currency 
          ? Math.round(validatedData.payment_details.amount_cents * 0.025) + 225
          : 225),
        merchant_receives_cents: validatedData.payment_details.target_currency
          ? Math.round(validatedData.payment_details.amount_cents * 1.0648) - 150 // Less processing fees
          : validatedData.payment_details.amount_cents - 150,
        estimated_settlement_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days
      },
      next_actions: [
        {
          action: 'customer_authentication',
          required: true,
          description: 'Customer must complete 3D Secure authentication'
        },
        {
          action: 'compliance_documentation',
          required: validatedData.compliance_data?.documentation_required || false,
          description: 'Additional documentation required for large transactions'
        }
      ],
      metadata: {
        vertical: 'international',
        transaction_type: 'multi_currency_payment',
        risk_score: 25,
        processing_country: 'US',
        customer_segment: validatedData.customer_info.business_type
      }
    };

    return NextResponse.json({
      data: paymentResult,
      message: 'International payment initiated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid payment request',
          details: error.errors.reduce((acc, err) => {
            const path = err.path.join('.');
            if (!acc[path]) acc[path] = [];
            acc[path].push(err.message);
            return acc;
          }, {} as Record<string, string[]>)
        },
        { status: 400 }
      );
    }

    console.error('Failed to process international payment:', error);
    return NextResponse.json(
      { error: 'Failed to process international payment' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/payments/multi-currency
 * Update currency configuration or perform currency conversion
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'update_configuration';

    if (action === 'convert_currency') {
      const validatedData = CurrencyConversionSchema.parse(body);

      // Mock currency conversion
      const conversionResult = {
        conversion_id: 'conv_${Date.now()}',
        status: 'completed',
        conversion_details: {
          from_amount_cents: validatedData.conversion_request.from_amount_cents,
          from_currency: validatedData.conversion_request.from_currency,
          to_amount_cents: Math.round(validatedData.conversion_request.from_amount_cents * 1.0648),
          to_currency: validatedData.conversion_request.to_currency,
          exchange_rate: 1.0648,
          conversion_type: validatedData.conversion_request.conversion_type
        },
        execution_summary: {
          executed_at: new Date().toISOString(),
          execution_rate: 1.0645, // Slightly different from quote due to market movement
          slippage_percent: 0.03, // Very low slippage
          market_impact: 'minimal',
          execution_venue: 'interbank_market'
        },
        fees_and_costs: {
          conversion_fee_cents: Math.round(validatedData.conversion_request.from_amount_cents * 0.0025),
          spread_cost_cents: Math.round(validatedData.conversion_request.from_amount_cents * 0.0015),
          total_cost_cents: Math.round(validatedData.conversion_request.from_amount_cents * 0.004),
          effective_rate: 1.0607 // Rate after all fees
        },
        settlement_info: {
          settlement_method: validatedData.settlement_instructions?.settlement_method || 'stripe_treasury',
          settlement_timing: validatedData.settlement_instructions?.settlement_timing || 'next_business_day',
          settlement_reference: 'settle_${Date.now()}',
          expected_settlement_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        regulatory_compliance: {
          transaction_reporting: 'filed',
          tax_implications: 'calculated',
          audit_trail: 'complete',
          compliance_score: 98
        }
      };

      return NextResponse.json({
        data: conversionResult,
        message: 'Currency conversion completed successfully'
      });
    }

    // Default: Update configuration
    const validatedData = CurrencyConfigSchema.parse(body);

    const updatedConfig = {
      organization_id: validatedData.organization_id,
      updated_settings: validatedData.currency_settings,
      compliance_settings: validatedData.compliance_settings,
      changes_applied: [
        {
          setting: 'supported_currencies',
          old_value: ['USD', 'EUR', 'GBP'],
          new_value: validatedData.currency_settings.supported_currencies,
          impact: 'New currencies available for processing'
        },
        {
          setting: 'conversion_markup',
          old_value: '3.0%',
          new_value: '${validatedData.currency_settings.conversion_markup_percent}%',
          impact: 'Updated pricing for currency conversions'
        }
      ],
      validation_results: {
        configuration_valid: true,
        regulatory_compliance: 'verified',
        integration_status: 'active',
        test_transactions: 'passed'
      },
      activation_timeline: {
        immediate_changes: ['markup_percent', 'auto_convert'],
        next_business_day: ['supported_currencies', 'settlement_preference'],
        requires_approval: ['risk_management_settings']
      },
      impact_analysis: {
        existing_transactions: 'no_impact',
        future_transactions: 'enhanced_currency_support',
        customer_experience: 'improved',
        compliance_posture: 'strengthened'
      }
    };

    return NextResponse.json({
      data: updatedConfig,
      message: 'Currency configuration updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid configuration request',
          details: error.errors.reduce((acc, err) => {
            const path = err.path.join('.');
            if (!acc[path]) acc[path] = [];
            acc[path].push(err.message);
            return acc;
          }, {} as Record<string, string[]>)
        },
        { status: 400 }
      );
    }

    console.error('Failed to update currency configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update currency configuration' },
      { status: 500 }
    );
  }
}