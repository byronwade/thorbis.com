# Thorbis MCP Tools to OpenAPI Mapping

This document maps each MCP tool to its corresponding OpenAPI endpoint in the Thorbis Truth Layer API, explaining the relationship and any transformations that occur.

## Overview

The Thorbis MCP tools provide a Claude-friendly interface to the Truth Layer API with built-in safety guardrails:

- **Never Write on Open**: All mutation tools require confirmation URLs
- **Idempotency**: Write operations require unique keys to prevent duplicates  
- **Rate Limiting**: Each tool has specific budget constraints
- **Type Safety**: Strict JSON schemas prevent invalid requests
- **Error Recovery**: Comprehensive error codes with recovery guidance

## Tool-to-Endpoint Mapping

### Read Operations (Public Access)

#### `getBusinessBySlug` → `GET /businesses/{slug}`

**Purpose**: Retrieve verified business profile with licenses and insurance status

**Mapping**:
- Tool parameter `slug` → URL path parameter `{slug}`
- Direct 1:1 mapping with no transformations
- Response includes verification badges and operational status

**Example**:
```typescript
// MCP Tool Call
getBusinessBySlug({ slug: "smith-plumbing-co" })

// OpenAPI Request
GET /businesses/smith-plumbing-co
Authorization: Bearer <token>
```

**Rate Limits**: 60/min, 1000/hour

---

#### `getAvailability` → `GET /availability`

**Purpose**: Get real-time Now/Next availability windows for service booking

**Mapping**:
- Tool parameters become query parameters
- `service_code` (required) → `?service_code=plumbing`
- `zip` (required) → `?zip=78701`
- `when` (optional) → `?when=2024-02-16T10:00:00Z`
- `duration_minutes` (optional) → `?duration_minutes=120`

**Example**:
```typescript
// MCP Tool Call
getAvailability({
  service_code: "plumbing",
  zip: "78701", 
  duration_minutes: 120
})

// OpenAPI Request  
GET /availability?service_code=plumbing&zip=78701&duration_minutes=120
Authorization: Bearer <token>
```

**Rate Limits**: 30/min, 500/hour

---

#### `getPriceBands` → `GET /price-bands`

**Purpose**: Get market pricing percentiles (p50/p75/p90) from invoice data

**Mapping**:
- Tool parameters → query parameters
- `service_code` (required) → `?service_code=plumbing`
- `zip` (required) → `?zip=78701`
- `job_type` (optional) → `?job_type=repair`

**Example**:
```typescript
// MCP Tool Call
getPriceBands({
  service_code: "plumbing",
  zip: "78701",
  job_type: "repair"
})

// OpenAPI Request
GET /price-bands?service_code=plumbing&zip=78701&job_type=repair
Authorization: Bearer <token>
```

**Rate Limits**: 20/min, 200/hour

---

#### `getReviews` → `GET /reviews`

**Purpose**: Get invoice-verified reviews with masked customer identities

**Mapping**:
- Tool parameters → query parameters
- `business` (required) → `?business=smith-plumbing-co`
- `limit` (optional) → `?limit=10`
- `offset` (optional) → `?offset=0`
- `min_rating` (optional) → `?min_rating=4`
- `service_type` (optional) → `?service_type=emergency_repair`

**Example**:
```typescript
// MCP Tool Call
getReviews({
  business: "smith-plumbing-co",
  limit: 5,
  min_rating: 4
})

// OpenAPI Request
GET /reviews?business=smith-plumbing-co&limit=5&min_rating=4
Authorization: Bearer <token>
```

**Rate Limits**: 30/min, 300/hour

---

### Action Operations (Confirm-Flow Only)

#### `createBookingHold` → `POST /bookings/hold`

**Purpose**: Create temporary booking hold that requires customer confirmation

**Mapping**:
- Tool parameters → JSON request body
- `idempotency_key` (required) → `Idempotency-Key` header
- All other fields map directly to request body structure
- **Never writes directly** - returns `confirm_url` for customer action

**Example**:
```typescript
// MCP Tool Call
createBookingHold({
  business_slug: "smith-plumbing-co",
  service_code: "plumbing",
  requested_time: "2024-02-16T10:00:00Z",
  customer_info: {
    name: "John Smith",
    phone: "+1-512-555-0200"
  },
  idempotency_key: "550e8400-e29b-41d4-a716-446655440000"
})

// OpenAPI Request
POST /bookings/hold
Authorization: Bearer <token>
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "business_slug": "smith-plumbing-co",
  "service_code": "plumbing", 
  "requested_time": "2024-02-16T10:00:00Z",
  "customer_info": {
    "name": "John Smith",
    "phone": "+1-512-555-0200"
  }
}
```

**Guardrails**:
- ✅ `needsConfirmation: true` - Claude must ask user before calling
- ✅ `requiresIdempotencyKey: true` - Prevents duplicate bookings
- ✅ Returns confirmation URL - Customer must click to complete booking

**Rate Limits**: 5/min, 50/hour

---

#### `createEstimateDraft` → `POST /estimates/draft`

**Purpose**: Create estimate draft for business review before sending to customer

**Mapping**:
- Tool parameters → JSON request body
- Complex nested objects (line_items, totals, terms) map directly
- `idempotency_key` (required) → `Idempotency-Key` header
- **Never writes directly** - returns `confirm_url` for business review

**Example**:
```typescript
// MCP Tool Call
createEstimateDraft({
  business_slug: "smith-plumbing-co",
  customer_info: {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com"
  },
  project_details: {
    title: "Master Bathroom Renovation",
    type: "renovation"
  },
  line_items: [
    {
      description: "Demolition and prep work",
      quantity: 1,
      unit: "job", 
      unit_price: 800.00,
      total: 800.00
    }
  ],
  totals: {
    subtotal: 800.00,
    total: 800.00  
  },
  idempotency_key: "750e8400-e29b-41d4-a716-446655440001"
})

// OpenAPI Request
POST /estimates/draft
Authorization: Bearer <token>
Idempotency-Key: 750e8400-e29b-41d4-a716-446655440001
Content-Type: application/json

{
  "business_slug": "smith-plumbing-co",
  "customer_info": {
    "name": "Sarah Johnson", 
    "email": "sarah.johnson@email.com"
  },
  "project_details": {
    "title": "Master Bathroom Renovation",
    "type": "renovation"
  },
  "line_items": [...],
  "totals": {...}
}
```

**Guardrails**:
- ✅ `needsConfirmation: true` - Requires user approval
- ✅ `requiresIdempotencyKey: true` - Prevents duplicate estimates
- ✅ Returns confirmation URL - Business must review before sending

**Rate Limits**: 3/min, 20/hour

---

#### `createPaymentLink` → `POST /payments/link`

**Purpose**: Create secure payment link for invoices or estimates

**Mapping**:
- Tool parameters → JSON request body
- Payment methods array maps directly
- Customer info and options nested objects map 1:1
- `idempotency_key` (required) → `Idempotency-Key` header

**Example**:
```typescript
// MCP Tool Call  
createPaymentLink({
  business_slug: "smith-plumbing-co",
  reference_type: "invoice",
  reference_id: "inv_2024_0089", 
  amount: 487.50,
  customer_info: {
    name: "Mike Davis",
    email: "mike.davis@email.com"
  },
  payment_methods: ["card", "ach"],
  idempotency_key: "850e8400-e29b-41d4-a716-446655440002"
})

// OpenAPI Request
POST /payments/link
Authorization: Bearer <token>
Idempotency-Key: 850e8400-e29b-41d4-a716-446655440002
Content-Type: application/json

{
  "business_slug": "smith-plumbing-co",
  "reference_type": "invoice",
  "reference_id": "inv_2024_0089",
  "amount": 487.50,
  "customer_info": {
    "name": "Mike Davis",
    "email": "mike.davis@email.com"  
  },
  "payment_methods": ["card", "ach"]
}
```

**Guardrails**:
- ✅ `needsConfirmation: true` - User must approve payment creation
- ✅ `requiresIdempotencyKey: true` - Prevents duplicate payment links
- ✅ Returns confirmation URL - Business reviews before sending to customer

**Rate Limits**: 5/min, 30/hour

---

## Error Code Mapping

All tools return standardized error codes that map directly to OpenAPI error responses:

| MCP Error Code | HTTP Status | OpenAPI Error | Recovery Guidance |
|---------------|-------------|---------------|-------------------|
| `VALIDATION_ERROR` | 400 | `VALIDATION_ERROR` | Check required fields and format constraints |
| `AUTH_ERROR` | 401 | `AUTH_ERROR` | Ensure valid Bearer token in Authorization header |  
| `NOT_FOUND` | 404 | `NOT_FOUND` | Verify resource exists or search for alternatives |
| `CONFLICT` | 409 | `CONFLICT` | Resource conflict (e.g., time slot no longer available) |
| `RATE_LIMIT` | 429 | `RATE_LIMIT` | Wait for reset or upgrade API tier |
| `DEPENDENCY_DOWN` | 503 | `DEPENDENCY_DOWN` | External service unavailable, retry later |
| `INSUFFICIENT_DATA` | 404 | `INSUFFICIENT_DATA` | Not enough data for reliable results |

## Built-in Guardrails

### Confirmation Requirements

**Read Tools** (`needsConfirmation: false`):
- `getBusinessBySlug` - Safe, read-only
- `getAvailability` - Safe, read-only  
- `getPriceBands` - Safe, read-only
- `getReviews` - Safe, read-only

**Action Tools** (`needsConfirmation: true`):
- `createBookingHold` - Creates hold but requires customer confirmation
- `createEstimateDraft` - Creates draft but requires business approval  
- `createPaymentLink` - Creates draft but requires business approval

### Idempotency Keys

All action tools **require** idempotency keys:
```typescript
// Every write operation must include unique UUID
{
  idempotency_key: "550e8400-e29b-41d4-a716-446655440000"
}
```

This prevents duplicate operations if:
- Network requests are retried
- User accidentally triggers same action twice
- System failures cause operation replay

### Rate Limiting

Each tool has specific rate limits based on:
- **Cost**: More expensive operations have lower limits
- **Impact**: Write operations more restricted than reads  
- **Business Logic**: Booking creation is most limited

## Usage Examples

### Safe Read Pattern
```typescript
// No confirmation needed for reads
const availability = await getAvailability({
  service_code: "plumbing",
  zip: "78701"
})

if (availability.success) {
  console.log("Available now:", availability.data.now_available.available)
}
```

### Confirmed Write Pattern  
```typescript
// Confirmation required for writes
const booking = await createBookingHold({
  business_slug: "smith-plumbing-co", 
  service_code: "plumbing",
  requested_time: "2024-02-16T10:00:00Z",
  customer_info: {
    name: "John Smith",
    phone: "+1-512-555-0200"  
  },
  idempotency_key: generateUUID()
}, {
  needsConfirmation: true,
  confirmationMessage: "Create booking hold for John Smith?"
})

if (booking.success) {
  console.log("Booking hold created!")
  console.log("Customer must confirm at:", booking.data.confirm_url)
  console.log("Hold expires at:", booking.data.expires_at)
}
```

## Security Considerations

1. **Authentication**: All tools require valid Bearer JWT tokens
2. **Authorization**: Tools specify required roles and scopes  
3. **Tenant Isolation**: All data scoped to business context
4. **Audit Logging**: All tool calls logged with full context
5. **Rate Limiting**: Prevents abuse and manages costs
6. **Idempotency**: Prevents duplicate operations
7. **Confirmation URLs**: Signed tokens for secure confirmations

## Implementation Notes

- Tools use the Thorbis Truth Layer SDK internally
- Error handling follows OpenAPI specification exactly
- All examples are tested against actual API endpoints
- Rate limits enforced at both tool and API level
- Confirmation URLs expire after configured timeout
- Idempotency keys stored for duplicate prevention

## Development Workflow

1. **Design Tool**: Define MCP tool with strict JSON schema
2. **Map to OpenAPI**: Ensure 1:1 correspondence with API endpoint
3. **Add Guardrails**: Configure confirmation, idempotency, rate limits
4. **Test Examples**: Verify examples work with actual API
5. **Document Errors**: Map all error codes to recovery guidance
6. **Validate Schema**: Ensure JSON schemas are valid and complete
