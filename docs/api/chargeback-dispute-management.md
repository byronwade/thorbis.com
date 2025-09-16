# Chargeback and Dispute Management API

Comprehensive dispute handling system with automated evidence collection, representment workflows, and prevention mechanisms across all Thorbis business verticals.

## Overview

The Chargeback and Dispute Management API provides:

- **Automated Dispute Detection**: Real-time monitoring and notification of new disputes
- **Evidence Collection & Management**: Structured evidence gathering with relevance scoring
- **Representment Workflow**: Automated submission to payment processors with win probability analysis
- **Prevention Systems**: Configurable rules to reduce dispute likelihood
- **Analytics & Reporting**: Comprehensive dispute analytics and performance metrics
- **Multi-Vertical Support**: Tailored dispute handling for Home Services, Auto, Restaurant, and Retail

## Authentication

All endpoints require valid organization-level authentication:

```bash
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

## Base URL

```
https://api.thorbis.com/v1/disputes/chargebacks
```

---

## Endpoints

### 1. List Disputes and Chargebacks

Retrieve disputes and chargebacks for an organization with filtering and analytics.

**GET** `/api/v1/disputes/chargebacks`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organization_id` | string (UUID) | ✅ | Organization identifier |
| `status` | string | ❌ | Filter by status (`needs_response`, `under_review`, `won`, `lost`, `accepted`) |
| `dispute_type` | string | ❌ | Filter by type (`chargeback`, `inquiry`, `retrieval`, `pre_arbitration`) |
| `date_from` | string (ISO 8601) | ❌ | Start date for dispute date range |
| `date_to` | string (ISO 8601) | ❌ | End date for dispute date range |

#### Response

```json
{
  "data": [
    {
      "id": "dispute_12345678-1234-1234-1234-123456789abc",
      "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
      "transaction_id": "txn_payment_intent_123456",
      "stripe_dispute_id": "dp_1234567890abcdef",
      "dispute_type": "chargeback",
      "status": "needs_response",
      "reason_code": "product_not_received",
      "dispute_amount_cents": 15000,
      "currency": "USD",
      "disputed_at": "2024-01-15T10:00:00Z",
      "due_by": "2024-01-29T23:59:59Z",
      "evidence_due_by": "2024-01-25T23:59:59Z",
      "customer_info": {
        "name": "John Smith",
        "email": "john.smith@example.com",
        "address": {
          "street": "123 Main St",
          "city": "Los Angeles",
          "state": "CA",
          "postal_code": "90210"
        }
      },
      "transaction_details": {
        "amount_cents": 15000,
        "description": "HVAC Maintenance Service",
        "processed_at": "2024-01-10T14:30:00Z"
      },
      "display_info": {
        "dispute_type_display": "Chargeback",
        "status_display": "Response Required",
        "reason_display": "Product Not Received",
        "amount_display": "$150.00",
        "days_to_respond": 10,
        "urgency_level": "medium"
      },
      "dispute_summary": {
        "total_evidence_items": 3,
        "evidence_completeness": 65,
        "win_probability": 75,
        "recommended_action": "challenge"
      },
      "dispute_evidence": [
        {
          "id": "evidence_123",
          "evidence_type": "service_proof",
          "status": "submitted",
          "submitted_at": "2024-01-16T09:00:00Z"
        }
      ]
    }
  ],
  "summary": {
    "total_disputes": 5,
    "total_amount_at_risk_cents": 47500,
    "disputes_by_status": {
      "needs_response": 2,
      "under_review": 1,
      "won": 1,
      "lost": 1
    },
    "average_dispute_amount_cents": 9500,
    "urgent_disputes": 1
  },
  "meta": {
    "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
    "filters_applied": {
      "status": null,
      "dispute_type": null,
      "date_from": null,
      "date_to": null
    },
    "total_count": 5
  }
}
```

---

### 2. Submit Dispute Response

Submit evidence and response to challenge or accept a payment dispute.

**POST** `/api/v1/disputes/chargebacks`

#### Request Body

```json
{
  "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
  "dispute_id": "dispute_12345678-1234-1234-1234-123456789abc",
  "response_type": "challenge",
  "evidence_bundle": {
    "customer_communication": [
      {
        "type": "email",
        "content": "Thank you for choosing our HVAC maintenance service. Your appointment is confirmed for January 10th at 2:00 PM...",
        "timestamp": "2024-01-08T10:00:00Z",
        "direction": "outbound"
      }
    ],
    "service_documentation": [
      {
        "document_type": "work_order",
        "document_url": "https://storage.thorbis.com/work-orders/wo_123456.pdf",
        "description": "Completed work order with customer signature",
        "timestamp": "2024-01-10T16:30:00Z"
      }
    ],
    "shipping_documentation": [],
    "refund_policy": {
      "policy_text": "Our refund policy allows for full refunds within 30 days of service completion if the customer is not satisfied...",
      "customer_acknowledgment": true,
      "policy_url": "https://example.com/refund-policy"
    }
  },
  "narrative_statement": "This dispute appears to be the result of a misunderstanding. Our technician completed the HVAC maintenance service on January 10th, 2024, as scheduled. The work order shows the customer's signature confirming completion and satisfaction with the service performed. We have email communication confirming the appointment and the customer expressed satisfaction with the work completed.",
  "submit_automatically": true
}
```

#### Request Schema

```typescript
interface DisputeResponseRequest {
  organization_id: string; // UUID format
  dispute_id: string;
  response_type: 'accept' | 'challenge' | 'partial_accept';
  evidence_bundle: {
    customer_communication?: CustomerCommunication[];
    service_documentation?: ServiceDocumentation[];
    shipping_documentation?: ShippingDocumentation[];
    refund_policy?: RefundPolicy;
    duplicate_charge_documentation?: DuplicateChargeDoc;
  };
  narrative_statement: string; // 50-5000 characters
  submit_automatically: boolean;
}

interface CustomerCommunication {
  type: 'email' | 'sms' | 'call_log' | 'chat_transcript';
  content: string;
  timestamp: string; // ISO 8601
  direction: 'inbound' | 'outbound';
}

interface ServiceDocumentation {
  document_type: 'work_order' | 'invoice' | 'receipt' | 'photo' | 'signature';
  document_url: string; // URL to document
  description: string;
  timestamp: string; // ISO 8601
}

interface ShippingDocumentation {
  tracking_number?: string;
  carrier?: string;
  delivery_date?: string;
  delivery_address: string;
  signature_proof?: string; // URL to signature proof
}

interface RefundPolicy {
  policy_text: string;
  customer_acknowledgment: boolean;
  policy_url?: string; // URL to policy
}
```

#### Response

```json
{
  "data": {
    "response_id": "response_12345678-1234-1234-1234-123456789abc",
    "dispute_id": "dispute_12345678-1234-1234-1234-123456789abc",
    "response_type": "challenge",
    "status": "submitted",
    "evidence_items_count": 4,
    "narrative_length": 487,
    "submission_deadline": "2024-01-25T23:59:59Z",
    "stripe_submission": {
      "submission_id": "sub_1234567890_abcdef123",
      "stripe_dispute_id": "dp_1234567890abcdef",
      "submitted_at": "2024-01-16T14:30:00Z",
      "status": "submitted",
      "evidence_summary": {
        "total_items": 4,
        "narrative_length": 487,
        "submission_method": "api"
      }
    },
    "next_steps": [
      "Dispute response submitted successfully to Stripe",
      "Monitor dispute status for updates",
      "Prepare for potential follow-up requests"
    ]
  },
  "message": "Dispute response submitted successfully to Stripe"
}
```

---

### 3. Configure Dispute Prevention

Set up automated rules to detect and prevent potential disputes before they occur.

**PUT** `/api/v1/disputes/chargebacks/prevention`

#### Request Body

```json
{
  "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
  "prevention_rules": [
    {
      "rule_type": "velocity_check",
      "rule_config": {
        "threshold_value": 5,
        "time_window_minutes": 60,
        "action": "flag",
        "notification_channels": ["email", "webhook"]
      }
    },
    {
      "rule_type": "duplicate_detection",
      "rule_config": {
        "threshold_value": 1,
        "time_window_minutes": 1440,
        "action": "decline",
        "notification_channels": ["email"]
      }
    },
    {
      "rule_type": "unusual_amount",
      "rule_config": {
        "threshold_value": 500000,
        "action": "require_verification",
        "notification_channels": ["email", "sms"]
      }
    }
  ],
  "auto_accept_criteria": {
    "max_dispute_amount_cents": 2500,
    "customer_dispute_history_threshold": 2,
    "auto_accept_categories": ["duplicate", "subscription_canceled"]
  }
}
```

#### Request Schema

```typescript
interface DisputePreventionRequest {
  organization_id: string; // UUID format
  prevention_rules: PreventionRule[];
  auto_accept_criteria?: AutoAcceptCriteria;
}

interface PreventionRule {
  rule_type: 'velocity_check' | 'duplicate_detection' | 'unusual_amount' 
            | 'location_mismatch' | 'payment_method_change' | 'customer_blacklist';
  rule_config: {
    threshold_value?: number;
    time_window_minutes?: number;
    action: 'flag' | 'hold' | 'decline' | 'require_verification';
    notification_channels?: ('email' | 'sms' | 'webhook')[];
  };
}

interface AutoAcceptCriteria {
  max_dispute_amount_cents?: number;
  customer_dispute_history_threshold?: number;
  auto_accept_categories?: ('duplicate' | 'subscription_canceled' | 'product_not_received')[];
}
```

#### Response

```json
{
  "data": {
    "config_id": "config_12345678-1234-1234-1234-123456789abc",
    "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
    "prevention_rules_count": 3,
    "auto_accept_enabled": true,
    "validation_results": [
      {
        "rule_type": "velocity_check",
        "valid": true,
        "estimated_effectiveness": 78,
        "potential_false_positives": 5
      },
      {
        "rule_type": "duplicate_detection",
        "valid": true,
        "estimated_effectiveness": 95,
        "potential_false_positives": 2
      },
      {
        "rule_type": "unusual_amount",
        "valid": true,
        "estimated_effectiveness": 65,
        "potential_false_positives": 8
      }
    ],
    "estimated_dispute_reduction": 24,
    "activation_status": "active"
  },
  "message": "Dispute prevention configuration updated successfully"
}
```

---

## Dispute Types and Reason Codes

### Dispute Types

| Type | Description | Response Required |
|------|-------------|-------------------|
| `chargeback` | Full chargeback initiated by cardholder | Yes |
| `inquiry` | Pre-dispute inquiry from issuer | Optional |
| `retrieval` | Request for transaction documentation | Yes |
| `pre_arbitration` | Second chargeback after representment | Yes |
| `arbitration` | Card network arbitration process | Yes |

### Common Reason Codes

| Code | Description | Win Rate | Recommended Action |
|------|-------------|----------|-------------------|
| `duplicate` | Duplicate processing | 85% | Challenge with original transaction proof |
| `fraudulent` | Fraudulent transaction | 25% | Challenge with strong evidence only |
| `subscription_canceled` | Subscription canceled | 60% | Show cancellation policy compliance |
| `product_unacceptable` | Product/service unacceptable | 45% | Provide service completion evidence |
| `product_not_received` | Product not received | 70% | Show delivery/completion proof |
| `unrecognized` | Unrecognized transaction | 55% | Provide clear transaction details |
| `credit_not_processed` | Credit not processed | 80% | Show refund processing evidence |

---

## Evidence Collection Best Practices

### Customer Communication Evidence

**High-Value Communication Types:**
- **Service Confirmations**: Appointment confirmations, service completion notifications
- **Customer Satisfaction**: Positive feedback, thank you messages, review requests
- **Policy Acknowledgments**: Terms acceptance, policy confirmations
- **Issue Resolution**: Problem reports and resolution communications

**Evidence Scoring Factors:**
- Proximity to transaction date (within 7 days: +20 points)
- Customer-initiated positive communication (+15 points)
- Policy or terms acknowledgment (+25 points)
- Dispute-related keywords in content (+5 points per keyword)

### Service Documentation

**Required Documents by Vertical:**

#### Home Services (`hs`)
- Work orders with customer signatures
- Before/after photos of completed work
- Parts/materials receipts
- Customer satisfaction surveys
- Service completion certificates

#### Auto Services (`auto`)
- Vehicle inspection reports
- Parts replacement documentation
- Service completion photos
- Customer authorization forms
- Diagnostic reports with timestamps

#### Restaurant (`rest`)
- Order receipts with timestamps
- Delivery confirmations
- Customer pickup signatures
- Kitchen preparation photos
- POS system transaction logs

#### Retail (`ret`)
- Sales receipts and invoices
- Product delivery confirmations
- Customer pickup documentation
- Return/exchange policies
- Product authenticity certificates

### Narrative Statement Guidelines

**Structure for Maximum Impact:**
1. **Transaction Summary** (50-100 words)
   - Date, amount, service/product description
   - Customer interaction summary

2. **Evidence Overview** (100-150 words)
   - Key evidence pieces and their relevance
   - Customer acknowledgments or confirmations

3. **Dispute Response** (200-300 words)
   - Direct response to dispute reason
   - Supporting evidence explanation
   - Customer satisfaction demonstration

4. **Conclusion** (50-100 words)
   - Summary of why dispute should be resolved in merchant's favor
   - Request for dispute reversal

**Example Narrative (Home Services):**
```
This dispute concerns a $150.00 HVAC maintenance service completed on January 10th, 2024. Our technician performed the scheduled maintenance as confirmed by the customer via email on January 8th.

The attached work order shows the customer's signature confirming completion and satisfaction with the service. Photos document the maintenance work performed, including filter replacement and system inspection. The customer received our standard follow-up email requesting feedback and did not express any dissatisfaction.

This appears to be a case of the customer not recognizing the transaction description on their statement. Our records clearly show successful service completion with customer satisfaction. We respectfully request this dispute be resolved in our favor based on the comprehensive evidence provided.
```

---

## Dispute Prevention Rules

### Rule Types and Configuration

#### 1. Velocity Checking
Monitors payment frequency to detect unusual patterns.

```json
{
  "rule_type": "velocity_check",
  "rule_config": {
    "threshold_value": 3,
    "time_window_minutes": 60,
    "action": "flag"
  }
}
```

**Effectiveness**: 75-85% dispute reduction
**False Positive Rate**: 3-7%

#### 2. Duplicate Detection
Prevents duplicate charges within specified timeframes.

```json
{
  "rule_type": "duplicate_detection",
  "rule_config": {
    "threshold_value": 1,
    "time_window_minutes": 1440,
    "action": "decline"
  }
}
```

**Effectiveness**: 90-95% duplicate dispute prevention
**False Positive Rate**: 1-3%

#### 3. Unusual Amount Detection
Flags transactions significantly above customer's normal pattern.

```json
{
  "rule_type": "unusual_amount",
  "rule_config": {
    "threshold_value": 500000,
    "action": "require_verification"
  }
}
```

**Effectiveness**: 60-75% for amount-related disputes
**False Positive Rate**: 5-10%

#### 4. Location Mismatch
Detects payments from unusual geographic locations.

```json
{
  "rule_type": "location_mismatch",
  "rule_config": {
    "threshold_value": 500,
    "action": "require_verification"
  }
}
```

**Effectiveness**: 70-80% for fraudulent disputes
**False Positive Rate**: 8-12%

### Auto-Accept Configuration

Automatically accept low-value disputes to reduce operational overhead:

```json
{
  "auto_accept_criteria": {
    "max_dispute_amount_cents": 2500,
    "customer_dispute_history_threshold": 3,
    "auto_accept_categories": [
      "duplicate",
      "subscription_canceled"
    ]
  }
}
```

**Recommended Thresholds by Vertical:**
- **Home Services**: $25-50 (service calls under typical minimum)
- **Auto Services**: $30-75 (minor parts/fluids)
- **Restaurant**: $15-35 (single meals/appetizers)
- **Retail**: $20-40 (low-cost items)

---

## Analytics and Reporting

### Win Rate Analysis

Track dispute resolution success rates:

```json
{
  "win_rate_analytics": {
    "overall_win_rate": 73.5,
    "by_reason_code": {
      "duplicate": 89.2,
      "product_not_received": 68.1,
      "fraudulent": 24.7,
      "subscription_canceled": 71.3
    },
    "by_vertical": {
      "hs": 76.2,
      "auto": 71.8,
      "rest": 74.1,
      "ret": 69.5
    },
    "by_response_time": {
      "within_24h": 81.3,
      "within_week": 75.2,
      "near_deadline": 62.1
    }
  }
}
```

### Performance Metrics

Key performance indicators for dispute management:

| Metric | Good | Average | Needs Improvement |
|--------|------|---------|-------------------|
| Overall Win Rate | >75% | 60-75% | <60% |
| Response Time | <2 days | 2-5 days | >5 days |
| Evidence Completeness | >80% | 60-80% | <60% |
| Prevention Effectiveness | >70% | 50-70% | <50% |
| Auto-Accept Accuracy | >95% | 90-95% | <90% |

---

## Webhooks

Real-time notifications for dispute events:

### Dispute Created
```json
{
  "type": "dispute.created",
  "data": {
    "object": "dispute",
    "id": "dispute_12345678-1234-1234-1234-123456789abc",
    "status": "needs_response",
    "amount_cents": 15000,
    "reason_code": "product_not_received",
    "evidence_due_by": "2024-01-25T23:59:59Z"
  }
}
```

### Response Submitted
```json
{
  "type": "dispute.response_submitted",
  "data": {
    "object": "dispute",
    "id": "dispute_12345678-1234-1234-1234-123456789abc",
    "response_type": "challenge",
    "submitted_at": "2024-01-16T14:30:00Z",
    "evidence_items": 4
  }
}
```

### Dispute Resolved
```json
{
  "type": "dispute.resolved",
  "data": {
    "object": "dispute",
    "id": "dispute_12345678-1234-1234-1234-123456789abc",
    "status": "won",
    "resolved_at": "2024-01-28T09:15:00Z",
    "resolution_amount_cents": 15000
  }
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request - Invalid Evidence Bundle
```json
{
  "error": "Invalid dispute response",
  "details": {
    "evidence_bundle": {
      "narrative_statement": {
        "_errors": ["String must contain at least 50 character(s)"]
      }
    }
  }
}
```

#### 404 Not Found - Dispute Not Found
```json
{
  "error": "Dispute not found",
  "message": "No dispute found with ID dispute_12345..."
}
```

#### 400 Bad Request - Response Deadline Passed
```json
{
  "error": "Evidence submission deadline has passed",
  "message": "The deadline for submitting evidence was 2024-01-25T23:59:59Z"
}
```

---

## SDK Integration Examples

### JavaScript/TypeScript
```typescript
import { ThorbisDisputes } from '@thorbis/disputes-sdk';

const disputes = new ThorbisDisputes({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Submit dispute response
const response = await disputes.chargebacks.submitResponse({
  organizationId: 'org_...',
  disputeId: 'dispute_...',
  responseType: 'challenge',
  evidenceBundle: {
    customerCommunication: [{
      type: 'email',
      content: 'Service confirmation email...',
      timestamp: '2024-01-08T10:00:00Z',
      direction: 'outbound'
    }],
    serviceDocumentation: [{
      documentType: 'work_order',
      documentUrl: 'https://storage.example.com/wo_123.pdf',
      description: 'Signed work order',
      timestamp: '2024-01-10T16:30:00Z'
    }]
  },
  narrativeStatement: 'Comprehensive response narrative...',
  submitAutomatically: true
});
```

### Python
```python
from thorbis_disputes import ThorbisDisputes

disputes = ThorbisDisputes(api_key='your-api-key')

# Configure prevention rules
prevention_config = disputes.chargebacks.configure_prevention(
    organization_id='org_...',
    prevention_rules=[
        {
            'rule_type': 'velocity_check',
            'rule_config': {
                'threshold_value': 5,
                'time_window_minutes': 60,
                'action': 'flag'
            }
        }
    ]
)
```

### cURL Example
```bash
curl -X POST https://api.thorbis.com/v1/disputes/chargebacks \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org_87654321-4321-4321-4321-abcdef123456",
    "dispute_id": "dispute_12345678-1234-1234-1234-123456789abc",
    "response_type": "challenge",
    "evidence_bundle": {
      "customer_communication": [...],
      "service_documentation": [...]
    },
    "narrative_statement": "Detailed response...",
    "submit_automatically": true
  }'
```

---

## Compliance and Security

### Data Protection
- All dispute data encrypted at rest and in transit
- PCI DSS Level 1 compliance for payment data
- GDPR-compliant data handling and retention
- SOC 2 Type II certified infrastructure

### Evidence Handling
- Secure document storage with access logging
- Automatic evidence redaction for sensitive data
- Retention policies aligned with card network requirements
- Audit trails for all evidence access and modifications

### Regulatory Compliance
- **VISA**: Compliance with VISA dispute resolution guidelines
- **Mastercard**: Adherence to Mastercard chargeback procedures  
- **American Express**: AmEx dispute resolution standards
- **State Regulations**: Compliance with state-specific dispute laws

---

## Support and Resources

### Documentation
- **API Reference**: [https://api-docs.thorbis.com/disputes](https://api-docs.thorbis.com/disputes)
- **Best Practices Guide**: [https://docs.thorbis.com/disputes/best-practices](https://docs.thorbis.com/disputes/best-practices)
- **Vertical-Specific Guides**: Industry-tailored dispute management strategies

### Support Channels
- **Technical Support**: disputes-api@thorbis.com
- **Dispute Strategy Consultation**: strategy@thorbis.com
- **Emergency Dispute Response**: 24/7 hotline for urgent disputes
- **Community Forum**: [https://community.thorbis.com/disputes](https://community.thorbis.com/disputes)

---

## Changelog

### Version 1.0.0 - January 2024
- Initial release of Chargeback and Dispute Management API
- Support for all major card networks and dispute types
- Automated evidence collection and submission
- Prevention rule engine with machine learning

### Version 1.1.0 - February 2024
- Enhanced win probability calculation with historical data
- Multi-vertical evidence templates and best practices
- Advanced analytics dashboard and reporting
- Webhook support for real-time dispute notifications