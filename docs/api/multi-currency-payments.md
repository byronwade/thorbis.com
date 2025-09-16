# Multi-Currency Payments API

Comprehensive international payment processing with real-time exchange rates, currency conversion, and regulatory compliance across all Thorbis verticals.

## Overview

The Multi-Currency Payments API provides:

- **Real-Time Exchange Rates**: Multiple rate providers with composite pricing
- **International Payment Processing**: Global payment methods and local processing
- **Currency Risk Management**: Hedging, exposure monitoring, and automated risk controls
- **Regulatory Compliance**: International tax, AML, and reporting requirements
- **Settlement Management**: Multi-currency settlement with automated reconciliation
- **Cross-Border Optimization**: Routing and processing optimization for international transactions

## Authentication

All endpoints require valid organization-level authentication:

```bash
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

## Base URL

```
https://api.thorbis.com/v1/payments/multi-currency
```

---

## Endpoints

### 1. Get Exchange Rates and Configuration

Retrieve current exchange rates or currency configuration settings.

**GET** `/api/v1/payments/multi-currency`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organization_id` | string (UUID) | ✅ | Organization identifier |
| `request_type` | string | ❌ | `configuration` (default) or `exchange_rates` |
| `from_currency` | string | ❌ | Source currency (for exchange rates) |
| `to_currency` | string | ❌ | Target currency (for exchange rates) |
| `amount` | number | ❌ | Amount for conversion preview |

#### Response - Configuration

```json
{
  "data": {
    "organization_settings": {
      "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
      "base_currency": "USD",
      "supported_currencies": ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF"],
      "auto_convert": true,
      "conversion_markup_percent": 2.5,
      "settlement_preference": "daily",
      "last_updated": "2024-01-15T14:30:00Z"
    },
    "risk_management": {
      "hedge_threshold_percent": 5,
      "exposure_limit_usd": 50000000,
      "auto_hedge": false,
      "current_exposure": {
        "total_exposure_usd": 12500000,
        "currency_breakdown": [
          {
            "currency": "EUR",
            "exposure_usd": 7500000,
            "percentage": 60
          }
        ]
      },
      "hedging_recommendations": [
        {
          "currency": "EUR",
          "recommendation": "consider_hedge",
          "reason": "Approaching hedge threshold",
          "suggested_amount": 2500000,
          "hedge_instruments": ["forward_contract", "currency_swap"]
        }
      ]
    },
    "compliance_settings": {
      "enable_tax_calculation": true,
      "comply_with_local_regulations": true,
      "reporting_requirements": ["vat", "sales_tax"],
      "sanctioned_countries": ["KP", "IR", "SY"],
      "regulatory_frameworks": [
        {
          "region": "EU",
          "regulations": ["PSD2", "GDPR", "AML5"],
          "compliance_status": "active"
        }
      ]
    },
    "supported_countries": [
      {
        "country_code": "GB",
        "country_name": "United Kingdom",
        "currency": "GBP",
        "local_payment_methods": ["faster_payments", "bacs"],
        "tax_requirements": ["vat"],
        "regulatory_notes": "FCA regulated payments required"
      }
    ],
    "transaction_limits": {
      "daily_limit_usd": 10000000,
      "monthly_limit_usd": 100000000,
      "single_transaction_limit_usd": 2500000,
      "limits_by_currency": [
        {
          "currency": "EUR",
          "daily_limit": 9000000
        }
      ]
    }
  },
  "message": "Currency configuration retrieved successfully"
}
```

#### Response - Exchange Rates

```json
{
  "data": {
    "request_details": {
      "from_currency": "USD",
      "to_currency": "EUR",
      "requested_amount": 1000,
      "timestamp": "2024-01-15T14:30:00Z"
    },
    "exchange_rates": {
      "spot_rate": 1.0875,
      "our_rate": 1.0648,
      "markup_percent": 2.5,
      "rate_sources": [
        {
          "provider": "ecb",
          "rate": 1.0885,
          "timestamp": "2024-01-15T14:25:00Z",
          "reliability_score": 95
        },
        {
          "provider": "fed",
          "rate": 1.0870,
          "timestamp": "2024-01-15T14:27:00Z",
          "reliability_score": 98
        }
      ],
      "composite_rate": 1.0875,
      "spread_analysis": {
        "bid_ask_spread": 0.0025,
        "volatility_24h": 1.2,
        "volume_indicator": "high"
      }
    },
    "conversion_preview": {
      "original_amount": 1000,
      "original_currency": "USD",
      "converted_amount": 1065,
      "target_currency": "EUR",
      "fees": {
        "conversion_fee_cents": 25,
        "total_fees_cents": 35,
        "fee_breakdown": [
          {
            "type": "fx_conversion",
            "amount_cents": 25,
            "description": "Currency conversion markup"
          },
          {
            "type": "processing",
            "amount_cents": 10,
            "description": "International processing fee"
          }
        ]
      }
    },
    "rate_validity": {
      "expires_at": "2024-01-15T15:00:00Z",
      "rate_lock_available": true,
      "lock_duration_minutes": 60,
      "lock_fee_cents": 1
    },
    "market_insights": {
      "trend_24h": "stable",
      "forecast_confidence": 78,
      "major_events": [
        {
          "event": "ECB Policy Meeting",
          "impact": "medium",
          "scheduled_date": "2024-01-25"
        }
      ],
      "recommended_action": "proceed",
      "timing_recommendation": "Current rates favorable for conversion"
    }
  },
  "message": "Exchange rates retrieved successfully"
}
```

---

### 2. Process International Payment

Process a payment with currency conversion and international compliance.

**POST** `/api/v1/payments/multi-currency`

#### Request Body

```json
{
  "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
  "payment_details": {
    "amount_cents": 500000,
    "currency": "USD",
    "target_currency": "EUR",
    "conversion_rate": 1.0648,
    "lock_rate": true,
    "rate_expiry_minutes": 30
  },
  "customer_info": {
    "country_code": "DE",
    "tax_id": "DE123456789",
    "business_type": "business",
    "regulatory_status": "vat_registered"
  },
  "payment_method": {
    "type": "card",
    "supports_currency": true,
    "local_processing_required": false
  },
  "compliance_data": {
    "transaction_purpose": "services",
    "documentation_required": false,
    "regulatory_reporting": true
  }
}
```

#### Request Schema

```typescript
interface MultiCurrencyPaymentRequest {
  organization_id: string; // UUID format
  payment_details: {
    amount_cents: number; // Positive integer
    currency: string; // ISO 4217 3-letter code
    target_currency?: string; // Optional conversion target
    conversion_rate?: number; // Optional locked rate
    lock_rate: boolean; // Lock rate for specified duration
    rate_expiry_minutes: number; // 5-1440 minutes
  };
  customer_info: {
    country_code: string; // ISO 3166-1 alpha-2
    tax_id?: string; // Customer tax identifier
    business_type: 'individual' | 'business';
    regulatory_status?: string;
  };
  payment_method: {
    type: 'card' | 'bank_transfer' | 'local_payment' | 'digital_wallet';
    supports_currency: boolean;
    local_processing_required: boolean;
  };
  compliance_data?: {
    transaction_purpose: 'goods' | 'services' | 'subscription' | 'other';
    documentation_required: boolean;
    regulatory_reporting: boolean;
  };
}
```

#### Response

```json
{
  "data": {
    "payment_id": "pi_1234567890_multicurrency",
    "status": "processing",
    "original_payment": {
      "amount_cents": 500000,
      "currency": "USD",
      "customer_country": "DE"
    },
    "currency_conversion": {
      "from_currency": "USD",
      "to_currency": "EUR",
      "conversion_rate": 1.0648,
      "converted_amount_cents": 532400,
      "rate_locked": true,
      "rate_expires_at": "2024-01-15T15:00:00Z"
    },
    "international_fees": {
      "fx_conversion_fee_cents": 12500,
      "international_processing_fee_cents": 150,
      "cross_border_fee_cents": 75,
      "total_fees_cents": 12725
    },
    "compliance_checks": {
      "sanctions_screening": "passed",
      "aml_check": "passed",
      "tax_calculation": "completed",
      "documentation_status": "not_required",
      "regulatory_reporting": "filed"
    },
    "settlement_timeline": {
      "authorization_time": "2-5 minutes",
      "settlement_time": "1-3 business days",
      "currency_conversion_time": "immediate",
      "regulatory_hold_period": "none"
    },
    "transaction_summary": {
      "total_customer_cost_cents": 512725,
      "merchant_receives_cents": 532250,
      "estimated_settlement_date": "2024-01-17"
    },
    "next_actions": [
      {
        "action": "customer_authentication",
        "required": true,
        "description": "Customer must complete 3D Secure authentication"
      }
    ],
    "metadata": {
      "vertical": "international",
      "transaction_type": "multi_currency_payment",
      "risk_score": 25,
      "processing_country": "US",
      "customer_segment": "business"
    }
  },
  "message": "International payment initiated successfully"
}
```

---

### 3. Currency Conversion & Configuration

Update currency settings or perform standalone currency conversion.

**PUT** `/api/v1/payments/multi-currency`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | ❌ | `update_configuration` (default) or `convert_currency` |

#### Request Body - Currency Conversion

```json
{
  "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
  "conversion_request": {
    "from_amount_cents": 100000,
    "from_currency": "USD",
    "to_currency": "EUR",
    "conversion_type": "spot",
    "reference_rate": 1.0648,
    "slippage_tolerance_percent": 1
  },
  "settlement_instructions": {
    "settlement_account": "acct_treasury_001",
    "settlement_method": "stripe_treasury",
    "settlement_timing": "next_business_day"
  }
}
```

#### Request Body - Configuration Update

```json
{
  "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
  "currency_settings": {
    "base_currency": "USD",
    "supported_currencies": ["USD", "EUR", "GBP", "CAD", "AUD"],
    "auto_convert": true,
    "conversion_markup_percent": 2.5,
    "settlement_preference": "daily",
    "risk_management": {
      "hedge_threshold_percent": 5,
      "exposure_limit_usd": 50000000,
      "auto_hedge": false
    }
  },
  "compliance_settings": {
    "enable_tax_calculation": true,
    "comply_with_local_regulations": true,
    "reporting_requirements": ["vat", "gst", "sales_tax"],
    "sanctioned_countries": ["KP", "IR", "SY"]
  }
}
```

#### Response - Currency Conversion

```json
{
  "data": {
    "conversion_id": "conv_1234567890",
    "status": "completed",
    "conversion_details": {
      "from_amount_cents": 100000,
      "from_currency": "USD",
      "to_amount_cents": 106480,
      "to_currency": "EUR",
      "exchange_rate": 1.0648,
      "conversion_type": "spot"
    },
    "execution_summary": {
      "executed_at": "2024-01-15T14:30:15Z",
      "execution_rate": 1.0645,
      "slippage_percent": 0.03,
      "market_impact": "minimal",
      "execution_venue": "interbank_market"
    },
    "fees_and_costs": {
      "conversion_fee_cents": 250,
      "spread_cost_cents": 150,
      "total_cost_cents": 400,
      "effective_rate": 1.0607
    },
    "settlement_info": {
      "settlement_method": "stripe_treasury",
      "settlement_timing": "next_business_day",
      "settlement_reference": "settle_1234567890",
      "expected_settlement_date": "2024-01-16"
    },
    "regulatory_compliance": {
      "transaction_reporting": "filed",
      "tax_implications": "calculated",
      "audit_trail": "complete",
      "compliance_score": 98
    }
  },
  "message": "Currency conversion completed successfully"
}
```

#### Response - Configuration Update

```json
{
  "data": {
    "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
    "updated_settings": {
      "base_currency": "USD",
      "supported_currencies": ["USD", "EUR", "GBP", "CAD", "AUD"],
      "conversion_markup_percent": 2.5,
      "settlement_preference": "daily"
    },
    "changes_applied": [
      {
        "setting": "supported_currencies",
        "old_value": ["USD", "EUR", "GBP"],
        "new_value": ["USD", "EUR", "GBP", "CAD", "AUD"],
        "impact": "New currencies available for processing"
      },
      {
        "setting": "conversion_markup",
        "old_value": "3.0%",
        "new_value": "2.5%",
        "impact": "Updated pricing for currency conversions"
      }
    ],
    "validation_results": {
      "configuration_valid": true,
      "regulatory_compliance": "verified",
      "integration_status": "active",
      "test_transactions": "passed"
    },
    "activation_timeline": {
      "immediate_changes": ["markup_percent", "auto_convert"],
      "next_business_day": ["supported_currencies", "settlement_preference"],
      "requires_approval": ["risk_management_settings"]
    },
    "impact_analysis": {
      "existing_transactions": "no_impact",
      "future_transactions": "enhanced_currency_support",
      "customer_experience": "improved",
      "compliance_posture": "strengthened"
    }
  },
  "message": "Currency configuration updated successfully"
}
```

---

## Exchange Rate Methodology

### Rate Sources and Aggregation

The API uses multiple rate sources for accurate pricing:

1. **European Central Bank (ECB)**: Official EU exchange rates
2. **Federal Reserve**: US official rates and policy indicators
3. **Live Market Data**: Real-time interbank and trading platform rates
4. **Commercial Bank Rates**: Major commercial bank pricing
5. **Composite Algorithm**: Weighted average with reliability scoring

### Rate Calculation Process

```
Final Rate = (Composite Rate × (1 - Markup)) - Processing Spread

Where:
- Composite Rate: Weighted average of all sources
- Markup: Organization-specific markup (default 2.5%)
- Processing Spread: Fixed processing costs
```

### Rate Validity and Locking

- **Standard Validity**: 30 minutes for rate quotes
- **Rate Lock**: Available for up to 24 hours with fee
- **Lock Fee**: 0.1% of transaction amount
- **Automatic Refresh**: Every 30 seconds during market hours

## Risk Management Framework

### Exposure Monitoring

The system continuously monitors:

- **Total FX Exposure**: Aggregate exposure across all currencies
- **Per-Currency Limits**: Individual currency exposure thresholds
- **Correlation Risk**: Cross-currency correlation analysis
- **Market Volatility**: Real-time volatility tracking

### Hedging Strategies

Available hedging instruments:

| Instrument | Description | Use Case |
|------------|-------------|----------|
| **Forward Contracts** | Lock in exchange rates for future delivery | Predictable cash flows |
| **Currency Swaps** | Exchange currencies with agreement to reverse | Long-term exposure |
| **Options** | Right to buy/sell at specific rates | Downside protection |
| **Natural Hedging** | Match receivables and payables by currency | Operational efficiency |

### Automated Risk Controls

- **Exposure Alerts**: Automatic notifications at threshold levels
- **Auto-Hedge**: Optional automatic hedging at defined triggers
- **Position Limits**: Hard limits on maximum exposure per currency
- **Volatility Stops**: Automatic position reduction during high volatility

## International Compliance Framework

### Regulatory Coverage

The API maintains compliance with international regulations:

#### United States
- **Bank Secrecy Act (BSA)**: Anti-money laundering requirements
- **PATRIOT Act**: Enhanced due diligence and screening
- **FinCEN Regulations**: Reporting requirements for international transfers
- **OFAC Sanctions**: Screening against sanctioned entities

#### European Union
- **Payment Services Directive 2 (PSD2)**: Strong customer authentication
- **General Data Protection Regulation (GDPR)**: Data privacy compliance
- **Anti-Money Laundering Directive 5 (AML5)**: Enhanced AML procedures
- **Markets in Financial Instruments Directive (MiFID II)**: Investment services

#### United Kingdom
- **Financial Conduct Authority (FCA)**: Regulatory compliance
- **Payment Services Regulations**: Authorization and conduct rules
- **Data Protection Act**: UK data protection framework

#### Canada
- **Financial Transactions and Reports Analysis Centre (FINTRAC)**: AML/CTF compliance
- **Personal Information Protection and Electronic Documents Act (PIPEDA)**: Privacy protection

### Tax Compliance

Automatic tax calculation for:

- **Value Added Tax (VAT)**: EU member states
- **Goods and Services Tax (GST)**: Canada, Australia, New Zealand
- **Sales Tax**: Various US states and jurisdictions
- **Withholding Tax**: International payment requirements
- **Digital Services Tax**: Emerging digital tax obligations

### Documentation and Reporting

- **Transaction Records**: Comprehensive audit trails
- **Regulatory Filings**: Automatic submission to required authorities
- **Tax Returns**: Integrated tax return preparation and filing
- **Compliance Reports**: Regular compliance status reporting

## Supported Payment Methods by Region

### North America (US, Canada)
- **Credit/Debit Cards**: Visa, Mastercard, American Express
- **ACH Transfers**: Direct debit and credit transfers
- **Wire Transfers**: Domestic and international
- **Digital Wallets**: Apple Pay, Google Pay, PayPal

### Europe (EU, UK, EEA)
- **Credit/Debit Cards**: Visa, Mastercard with 3D Secure
- **SEPA Transfers**: Single Euro Payments Area transfers
- **Local Methods**: Bancontact, iDEAL, Giropay, Sofort
- **Open Banking**: PSD2-compliant bank transfers

### Asia Pacific
- **Credit/Debit Cards**: Local and international cards
- **Bank Transfers**: Local banking network transfers
- **Alternative Methods**: Alipay, WeChat Pay, JCB
- **E-Wallets**: Regional digital wallet solutions

### Latin America
- **Credit/Debit Cards**: Local and international acceptance
- **Bank Transfers**: Local banking systems
- **Cash Payments**: OXXO, Boleto, other cash networks
- **Digital Methods**: Local digital payment solutions

## Currency Support Matrix

| Currency | Code | Symbol | Regions | Settlement | Local Methods |
|----------|------|--------|---------|------------|---------------|
| US Dollar | USD | $ | Global | T+1 | ACH, Wire |
| Euro | EUR | € | EU/EEA | T+1 | SEPA, Local Banks |
| British Pound | GBP | £ | UK | T+1 | Faster Payments, BACS |
| Canadian Dollar | CAD | C$ | Canada | T+1 | Interac, PAD |
| Australian Dollar | AUD | A$ | Australia | T+1 | BPAY, NPP |
| Japanese Yen | JPY | ¥ | Japan | T+2 | JCB, Bank Transfer |
| Swiss Franc | CHF | Fr | Switzerland | T+1 | SIC, PostFinance |
| Chinese Yuan | CNY | ¥ | China | T+2 | UnionPay, Alipay |

## Error Handling

### Common Error Responses

#### 400 Bad Request - Invalid Currency

```json
{
  "error": "Invalid currency configuration",
  "details": {
    "payment_details": {
      "currency": {
        "_errors": ["Currency 'XYZ' is not supported"]
      }
    }
  }
}
```

#### 400 Bad Request - Rate Expired

```json
{
  "error": "Exchange rate expired",
  "message": "The locked exchange rate has expired. Please request a new rate.",
  "current_rate": 1.0875,
  "expired_rate": 1.0648,
  "rate_difference_percent": 2.1
}
```

#### 403 Forbidden - Compliance Violation

```json
{
  "error": "Transaction blocked by compliance rules",
  "message": "Transaction to sanctioned country blocked",
  "compliance_details": {
    "blocked_reason": "sanctions_screening",
    "country_code": "XX",
    "regulation": "OFAC"
  }
}
```

#### 429 Too Many Requests - Rate Limit

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many currency conversion requests. Please try again later.",
  "retry_after_seconds": 60
}
```

#### 500 Internal Server Error - Processing Error

```json
{
  "error": "Failed to process multi-currency payment",
  "message": "An unexpected error occurred during currency conversion"
}
```

## SDK Integration Examples

### JavaScript/TypeScript

```typescript
import { ThorbisMultiCurrency } from '@thorbis/multi-currency-sdk';

const multiCurrency = new ThorbisMultiCurrency({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Get exchange rates
const rates = await multiCurrency.exchangeRates.get({
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  amount: 1000
});

// Process international payment
const payment = await multiCurrency.payments.create({
  organizationId: 'org_...',
  paymentDetails: {
    amountCents: 500000,
    currency: 'USD',
    targetCurrency: 'EUR',
    lockRate: true
  },
  customerInfo: {
    countryCode: 'DE',
    businessType: 'business'
  }
});

// Convert currency
const conversion = await multiCurrency.convert({
  organizationId: 'org_...',
  fromAmountCents: 100000,
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  conversionType: 'spot'
});
```

### Python

```python
from thorbis_multi_currency import ThorbisMultiCurrency

multi_currency = ThorbisMultiCurrency(api_key='your-api-key')

# Get exchange rates
rates = multi_currency.exchange_rates.get(
    from_currency='USD',
    to_currency='EUR',
    amount=1000
)

# Process international payment
payment = multi_currency.payments.create(
    organization_id='org_...',
    payment_details={
        'amount_cents': 500000,
        'currency': 'USD',
        'target_currency': 'EUR',
        'lock_rate': True
    },
    customer_info={
        'country_code': 'DE',
        'business_type': 'business'
    }
)
```

### PHP

```php
<?php
use Thorbis\MultiCurrency\Client;

$client = new Client('your-api-key');

// Get exchange rates
$rates = $client->exchangeRates()->get([
    'from_currency' => 'USD',
    'to_currency' => 'EUR',
    'amount' => 1000
]);

// Process international payment
$payment = $client->payments()->create([
    'organization_id' => 'org_...',
    'payment_details' => [
        'amount_cents' => 500000,
        'currency' => 'USD',
        'target_currency' => 'EUR',
        'lock_rate' => true
    ]
]);
?>
```

## Rate Limits and Quotas

| Resource | Limit | Notes |
|----------|-------|-------|
| Exchange Rate Requests | 1,000 per hour | Per organization |
| Payment Processing | 500 per hour | Per organization |
| Currency Conversions | 100 per hour | Per organization |
| Rate Lock Requests | 50 per hour | Per organization |
| Configuration Updates | 10 per day | Per organization |

## Best Practices

### Exchange Rate Management

1. **Cache Rates Appropriately**: Rates valid for 30 minutes
2. **Use Rate Locking**: For time-sensitive transactions
3. **Monitor Volatility**: Higher volatility = higher risk
4. **Leverage Composite Rates**: More accurate than single source

### Risk Management

1. **Set Appropriate Limits**: Based on business size and risk tolerance
2. **Monitor Exposure Daily**: Track currency exposure trends
3. **Use Natural Hedging**: Match revenues and expenses by currency
4. **Review Hedge Strategies**: Regular assessment of hedging effectiveness

### Compliance Management

1. **Stay Updated**: Monitor regulatory changes
2. **Maintain Documentation**: Keep comprehensive transaction records
3. **Regular Audits**: Periodic compliance reviews
4. **Customer Due Diligence**: Proper KYC/AML procedures

### Performance Optimization

1. **Batch Operations**: Combine multiple conversions when possible
2. **Use Webhooks**: Real-time updates for settlement status
3. **Implement Retry Logic**: Handle temporary failures gracefully
4. **Monitor API Usage**: Stay within rate limits

## Support and Resources

### Documentation
- **API Reference**: [https://api-docs.thorbis.com/multi-currency](https://api-docs.thorbis.com/multi-currency)
- **Integration Guide**: [https://docs.thorbis.com/multi-currency/integration](https://docs.thorbis.com/multi-currency/integration)
- **Compliance Guide**: [https://docs.thorbis.com/multi-currency/compliance](https://docs.thorbis.com/multi-currency/compliance)

### Support Channels
- **Technical Support**: multi-currency-api@thorbis.com
- **Compliance Questions**: compliance@thorbis.com
- **Emergency Support**: 24/7 hotline for critical issues
- **Community Forum**: [https://community.thorbis.com/multi-currency](https://community.thorbis.com/multi-currency)

### Additional Resources
- **Rate Alert Service**: Real-time rate notifications
- **Risk Management Consulting**: Expert advice on FX risk
- **Compliance Monitoring**: Ongoing regulatory updates
- **Custom Integration Support**: Dedicated integration assistance

---

## Changelog

### Version 1.0.0 - January 2024
- Initial release of Multi-Currency Payments API
- Support for 8 major currencies
- Basic exchange rate aggregation
- International compliance framework

### Version 1.1.0 - February 2024
- Enhanced risk management features
- Automated hedging capabilities
- Additional payment method support
- Improved rate aggregation algorithm

### Version 1.2.0 - March 2024
- Advanced compliance automation
- Real-time settlement tracking
- Enhanced API rate limits
- Additional SDK language support