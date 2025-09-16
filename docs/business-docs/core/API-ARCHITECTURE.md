# API Architecture Documentation

> **Last Updated**: 2025-01-31  
> **Version**: 3.0.0  
> **Status**: Production Ready  
> **Author**: Thorbis Platform Team  
> **Classification**: Internal Use

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [API Ecosystem Overview](#api-ecosystem-overview)
3. [Industry-Separated API Namespaces](#industry-separated-api-namespaces)
4. [API-First Development Pattern](#api-first-development-pattern)
5. [Authentication & Authorization](#authentication--authorization)
6. [Rate Limiting & Security](#rate-limiting--security)
7. [Data Models & Schemas](#data-models--schemas)
8. [Error Handling & Standards](#error-handling--standards)
9. [Versioning Strategy](#versioning-strategy)
10. [Performance & Caching](#performance--caching)
11. [Monitoring & Observability](#monitoring--observability)
12. [Integration Patterns](#integration-patterns)

## Executive Summary

The Thorbis Business OS API Architecture implements a comprehensive, industry-separated REST API ecosystem supporting multi-tenant business operations across Home Services, Restaurant, Automotive, and Retail industries. Built on Next.js 15 App Router with TypeScript, the architecture enforces strict API-first development patterns, ensuring all features include corresponding API endpoints before UI implementation.

### Key Architecture Principles

- **Industry Separation**: Complete API isolation per business vertical
- **API-First Development**: All feature work requires API changes before UI
- **Multi-Tenant Security**: Row-Level Security (RLS) on every endpoint
- **Performance Optimization**: NextFaster performance doctrine compliance
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Comprehensive Testing**: Unit, integration, and E2E test coverage

## API Ecosystem Overview

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    Client Applications                          │
├─────────────────────────────────────────────────────────────────┤
│                      API Gateway Layer                         │
├─────────────────────────────────────────────────────────────────┤
│                 Industry-Specific APIs                         │
├─────────────────────────────────────────────────────────────────┤
│                  Business Logic Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                 Data Access Layer (RLS)                        │
├─────────────────────────────────────────────────────────────────┤
│                   Supabase Database                            │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Next.js App Router | 15.x | Server-side API routes |
| Language | TypeScript | 5.x | Type safety and development experience |
| Database | Supabase PostgreSQL | 15.x | Multi-tenant data storage |
| Validation | Zod | 3.x | Runtime type checking and validation |
| Authentication | Supabase Auth | Latest | JWT-based authentication |
| Rate Limiting | Custom middleware | - | Request throttling and abuse prevention |
| Monitoring | Prometheus + Grafana | Latest | Metrics collection and visualization |

## Industry-Separated API Namespaces

### Home Services APIs (`/api/hs/`)

**App APIs (Tenant-Scoped)**
```
/api/hs/app/v1/work-orders      # Work order management
/api/hs/app/v1/estimates        # Service estimates
/api/hs/app/v1/invoices         # Billing and invoicing
/api/hs/app/v1/customers        # Customer management
/api/hs/app/v1/technicians      # Technician scheduling
/api/hs/app/v1/dispatch         # Dispatch coordination
/api/hs/app/v1/equipment        # Equipment tracking
/api/hs/app/v1/inventory        # Parts and supplies
```

**Public APIs (Trust-Focused)**
```
/api/hs/public/v1/trust         # Trust metrics and badges
/api/hs/public/v1/reviews       # Customer reviews (verified)
/api/hs/public/v1/business      # Public business info
/api/hs/public/v1/availability  # Service availability
```

**AI Tools APIs**
```
/api/hs/ai/demand-forecast      # AI demand prediction
/api/hs/ai/pricing-optimization # Dynamic pricing
/api/hs/ai/predictive-maintenance # Equipment maintenance
```

### Restaurant APIs (`/api/rest/`)

**App APIs (Tenant-Scoped)**
```
/api/rest/app/v1/orders         # Order management
/api/rest/app/v1/menu           # Menu management
/api/rest/app/v1/reservations   # Table reservations
/api/rest/app/v1/inventory      # Food inventory
/api/rest/app/v1/staff          # Staff scheduling
/api/rest/app/v1/pos            # Point of sale
/api/rest/app/v1/kds            # Kitchen display system
/api/rest/app/v1/payments       # Payment processing
```

**Public APIs (Trust-Focused)**
```
/api/rest/public/v1/menu        # Public menu display
/api/rest/public/v1/reservations # Online reservations
/api/rest/public/v1/hours       # Operating hours
/api/rest/public/v1/location    # Location information
```

### Automotive APIs (`/api/auto/`)

**App APIs (Tenant-Scoped)**
```
/api/auto/app/v1/repair-orders  # Repair order management
/api/auto/app/v1/estimates      # Service estimates
/api/auto/app/v1/vehicles       # Vehicle database
/api/auto/app/v1/customers      # Customer management
/api/auto/app/v1/parts          # Parts inventory
/api/auto/app/v1/service-bays   # Bay scheduling
/api/auto/app/v1/inspections    # Vehicle inspections
/api/auto/app/v1/warranty       # Warranty tracking
```

### Retail APIs (`/api/ret/`)

**App APIs (Tenant-Scoped)**
```
/api/ret/app/v1/products        # Product catalog
/api/ret/app/v1/orders          # Sales orders
/api/ret/app/v1/inventory       # Stock management
/api/ret/app/v1/customers       # Customer database
/api/ret/app/v1/pos             # Point of sale
/api/ret/app/v1/loyalty         # Loyalty programs
/api/ret/app/v1/promotions      # Marketing campaigns
/api/ret/app/v1/analytics       # Sales analytics
```

## API-First Development Pattern

### Critical Development Workflow

**Feature Implementation Order:**
1. **API Design First**: Define API contracts and data models
2. **Schema Validation**: Implement Zod schemas for request/response
3. **Database Updates**: Apply migrations and RLS policies
4. **API Implementation**: Build server-side route handlers
5. **API Testing**: Unit and integration tests for endpoints
6. **UI Implementation**: Build client-side components
7. **E2E Testing**: End-to-end workflow validation

### Benefits of API-First Approach

- **Early Issue Detection**: Data model problems caught before UI development
- **Parallel Development**: Frontend and backend teams work independently
- **Consistent Integration**: All features follow the same patterns
- **Testing Efficiency**: APIs tested independently of UI complexity
- **Technical Debt Prevention**: No orphaned endpoints or unused features

### API Contract Example

```typescript
// Schema Definition (Zod)
export const CreateWorkOrderSchema = z.object({
  customerId: z.string().uuid(),
  serviceType: z.enum(['plumbing', 'electrical', 'hvac', 'general']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  description: z.string().min(10).max(1000),
  scheduledDate: z.string().datetime().optional(),
  estimatedDuration: z.number().int().min(30).max(480) // minutes
})

// API Route Implementation
export async function POST(request: Request) {
  const session = await getSession()
  const { data, error } = CreateWorkOrderSchema.safeParse(await request.json())
  
  if (error) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
  }
  
  // Business logic implementation
  // RLS automatically enforces tenant isolation
  const workOrder = await createWorkOrder(data, session.user.business_id)
  
  return NextResponse.json(workOrder, { status: 201 })
}
```

## Authentication & Authorization

### JWT-Based Authentication

**Authentication Flow:**
1. User credentials validated against Supabase Auth
2. JWT token issued with business_id and role claims
3. Middleware validates token on each API request
4. RLS policies enforce data isolation automatically

### Role-Based Access Control (RBAC)

**Role Hierarchy:**
```
Owner (Full Access)
├── Manager (Most Operations)
├── Staff (Limited Operations)
├── Viewer (Read-Only Access)
└── API Partner (Public Data Only)
```

**Permission Matrix:**
```typescript
const PERMISSIONS = {
  'owner': ['*'],
  'manager': ['read', 'create', 'update', 'delete:own'],
  'staff': ['read', 'create', 'update:own'],
  'viewer': ['read'],
  'api-partner': ['read:public']
}
```

### Multi-Tenant Security

**Row Level Security (RLS) Implementation:**
```sql
-- Example RLS Policy
CREATE POLICY "tenant_isolation_policy" ON work_orders
  FOR ALL USING (business_id = auth.jwt() ->> 'business_id')
  WITH CHECK (business_id = auth.jwt() ->> 'business_id');
```

## Rate Limiting & Security

### Multi-Tier Rate Limiting

**Global Limits:**
- 10,000 requests per minute across all APIs
- 1,000 requests per minute per IP address
- 100 requests per minute per user

**Endpoint-Specific Limits:**
```typescript
const ENDPOINT_LIMITS = {
  '/api/*/auth/*': { requests: 10, window: '15m' },
  '/api/*/app/v1/orders': { requests: 100, window: '1m' },
  '/api/*/public/v1/*': { requests: 1000, window: '1m' },
  '/api/*/ai/*': { requests: 20, window: '1m' }
}
```

### Security Middleware Stack

1. **CORS Protection**: Restrict cross-origin requests
2. **Rate Limiting**: Prevent abuse and DoS attacks
3. **Input Validation**: Zod schema validation on all inputs
4. **SQL Injection Prevention**: Parameterized queries only
5. **XSS Protection**: Input sanitization and CSP headers
6. **Authentication**: JWT validation on protected routes
7. **Authorization**: Role-based access control
8. **Audit Logging**: Complete request/response logging

### WAF (Web Application Firewall) Rules

```typescript
const WAF_RULES = [
  {
    name: 'SQL_INJECTION_DETECTION',
    pattern: /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    action: 'BLOCK'
  },
  {
    name: 'XSS_DETECTION',
    pattern: /<script[^>]*>.*?<\/script>/gi,
    action: 'SANITIZE'
  },
  {
    name: 'COMMAND_INJECTION',
    pattern: /(\b(exec|system|eval|cmd)\s*\()/i,
    action: 'BLOCK'
  }
]
```

## Data Models & Schemas

### Industry-Specific Data Models

**Home Services Data Model:**
```typescript
interface WorkOrder {
  id: string
  business_id: string  // Tenant isolation
  customer_id: string
  technician_id?: string
  service_type: 'plumbing' | 'electrical' | 'hvac' | 'general'
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  estimated_duration: number
  actual_duration?: number
  scheduled_date?: string
  completed_date?: string
  created_at: string
  updated_at: string
}
```

**Restaurant Data Model:**
```typescript
interface Order {
  id: string
  business_id: string  // Tenant isolation
  table_number?: number
  customer_id?: string
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid'
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  payment_status: 'unpaid' | 'paid' | 'refunded'
  created_at: string
  updated_at: string
}

interface OrderItem {
  menu_item_id: string
  quantity: number
  price: number
  modifications?: string[]
  special_instructions?: string
}
```

### Schema Validation Patterns

**Request Validation:**
```typescript
// Create schemas for all request bodies
const CreateCustomerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/)
  })
})

// Response schemas ensure consistent API contracts
const CustomerResponseSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string()
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})
```

## Error Handling & Standards

### Standardized Error Responses

**Error Response Format:**
```typescript
interface ApiError {
  error: {
    code: string          // Machine-readable error code
    message: string       // Human-readable error message
    details?: any         // Additional error context
    timestamp: string     // ISO datetime of error
    trace_id?: string     // Request tracing ID
  }
}
```

**HTTP Status Code Standards:**
```typescript
const HTTP_STATUS = {
  OK: 200,                    // Successful GET, PUT
  CREATED: 201,               // Successful POST
  NO_CONTENT: 204,            // Successful DELETE
  BAD_REQUEST: 400,           // Invalid request data
  UNAUTHORIZED: 401,          // Missing/invalid authentication
  FORBIDDEN: 403,             // Insufficient permissions
  NOT_FOUND: 404,             // Resource not found
  CONFLICT: 409,              // Business logic conflict
  VALIDATION_ERROR: 422,      // Data validation failed
  RATE_LIMITED: 429,          // Too many requests
  SERVER_ERROR: 500           // Internal server error
}
```

### Error Classification

**Business Logic Errors:**
- `DUPLICATE_RECORD`: Attempt to create existing record
- `INVALID_STATE_TRANSITION`: Invalid status change
- `INSUFFICIENT_INVENTORY`: Not enough stock
- `SCHEDULE_CONFLICT`: Appointment time conflict

**Validation Errors:**
- `INVALID_INPUT`: Request data doesn't match schema
- `MISSING_REQUIRED_FIELD`: Required field not provided
- `INVALID_FORMAT`: Data format validation failed
- `VALUE_OUT_OF_RANGE`: Numeric value outside valid range

**System Errors:**
- `DATABASE_CONNECTION_ERROR`: Database connectivity issue
- `EXTERNAL_SERVICE_UNAVAILABLE`: Third-party service down
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Unexpected system error

## Versioning Strategy

### API Versioning Approach

**URL-Based Versioning:**
```
/api/hs/app/v1/work-orders    # Version 1 (current)
/api/hs/app/v2/work-orders    # Version 2 (future)
```

**Version Lifecycle:**
1. **v1**: Current production version (stable)
2. **v2**: Next version (development/beta)
3. **Deprecation**: 12-month notice for breaking changes
4. **Sunset**: Remove deprecated versions after transition period

### Backward Compatibility

**Non-Breaking Changes (Same Version):**
- Add new optional fields
- Add new endpoints
- Extend enum values
- Add response fields

**Breaking Changes (New Version):**
- Remove fields
- Change field types
- Modify required fields
- Change endpoint behavior

### Migration Strategy

```typescript
// Version compatibility middleware
export async function versionMiddleware(request: Request) {
  const version = extractVersion(request.url)
  
  switch (version) {
    case 'v1':
      return v1Handler(request)
    case 'v2':
      return v2Handler(request)
    default:
      return new Response('Unsupported API version', { status: 400 })
  }
}
```

## Performance & Caching

### NextFaster Performance Doctrine

**Performance Requirements:**
- API response time: < 100ms (95th percentile)
- Database query time: < 50ms (95th percentile)
- First-byte time: < 200ms
- Total page load: < 300ms

### Caching Strategy

**Multi-Layer Caching:**
```
┌─────────────────┐
│   CDN Cache     │ ← Static content, 24h TTL
├─────────────────┤
│   Edge Cache    │ ← API responses, 5m TTL
├─────────────────┤
│ Application     │ ← Query results, 1m TTL
├─────────────────┤
│ Database        │ ← Materialized views
└─────────────────┘
```

**Cache Configuration:**
```typescript
const CACHE_CONFIG = {
  // Static data (rarely changes)
  'menu-items': { ttl: 3600, tags: ['menu'] },
  'business-info': { ttl: 1800, tags: ['business'] },
  
  // Dynamic data (frequently changes)
  'work-orders': { ttl: 300, tags: ['work-orders'] },
  'inventory': { ttl: 60, tags: ['inventory'] },
  
  // Real-time data (no caching)
  'order-status': { ttl: 0 },
  'live-tracking': { ttl: 0 }
}
```

### Database Optimization

**Query Optimization:**
- Indexed columns for all common queries
- Materialized views for complex aggregations
- Connection pooling with pgBouncer
- Read replicas for analytical queries

**RLS Policy Optimization:**
```sql
-- Optimized RLS with proper indexing
CREATE INDEX idx_work_orders_business_status 
ON work_orders(business_id, status) 
WHERE deleted_at IS NULL;

CREATE POLICY "work_orders_access" ON work_orders
  FOR ALL USING (
    business_id = auth.jwt() ->> 'business_id' AND
    deleted_at IS NULL
  );
```

## Monitoring & Observability

### Comprehensive Metrics Collection

**API Metrics:**
- Request count by endpoint
- Response times (P50, P95, P99)
- Error rates by status code
- Concurrent request count
- Rate limiting events

**Business Metrics:**
- Orders created per hour
- Revenue per API call
- Customer satisfaction scores
- Feature adoption rates
- Tenant activity levels

**System Metrics:**
- CPU and memory usage
- Database connection pool
- Cache hit rates
- Third-party service latency
- Background job queues

### Monitoring Infrastructure

**Technology Stack:**
```yaml
Metrics: Prometheus + Grafana
Logging: Structured JSON logs
Tracing: OpenTelemetry + Jaeger
Alerting: PagerDuty integration
Uptime: Pingdom monitoring
```

**Alert Thresholds:**
```typescript
const ALERT_THRESHOLDS = {
  error_rate: {
    warning: 5,    // 5% error rate
    critical: 10   // 10% error rate
  },
  response_time: {
    warning: 500,   // 500ms P95
    critical: 1000  // 1000ms P95
  },
  availability: {
    warning: 99.5,  // 99.5% uptime
    critical: 99.0  // 99.0% uptime
  }
}
```

### Request Tracing

**Distributed Tracing:**
```typescript
// Each request gets unique trace ID
const traceId = generateTraceId()

// Log request start
logger.info('API request started', {
  trace_id: traceId,
  method: request.method,
  url: request.url,
  user_id: session?.user.id,
  business_id: session?.user.business_id
})

// Log request completion
logger.info('API request completed', {
  trace_id: traceId,
  duration_ms: Date.now() - startTime,
  status_code: response.status
})
```

## Integration Patterns

### Third-Party Service Integration

**Payment Processing:**
```typescript
// Stripe integration pattern
class PaymentService {
  async processPayment(amount: number, customerId: string): Promise<PaymentResult> {
    try {
      const payment = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        customer: customerId,
        metadata: {
          business_id: this.businessId,
          trace_id: this.traceId
        }
      })
      
      return { success: true, paymentId: payment.id }
    } catch (error) {
      logger.error('Payment processing failed', { error, customerId })
      throw new PaymentProcessingError(error.message)
    }
  }
}
```

**External API Integration:**
```typescript
// QuickBooks integration pattern
class QuickBooksIntegration {
  async syncInvoice(invoice: Invoice): Promise<void> {
    const qbInvoice = this.transformToQuickBooks(invoice)
    
    try {
      await this.qbClient.createInvoice(qbInvoice)
      
      // Update sync status
      await this.updateSyncStatus(invoice.id, 'synced')
    } catch (error) {
      await this.updateSyncStatus(invoice.id, 'failed')
      throw error
    }
  }
}
```

### Webhook Integration

**Incoming Webhooks:**
```typescript
// Stripe webhook handler
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const body = await request.text()
  
  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
  } catch (error) {
    return new Response('Invalid signature', { status: 400 })
  }
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object)
      break
  }
  
  return new Response('OK')
}
```

**Outgoing Webhooks:**
```typescript
// Notify external systems of events
class WebhookService {
  async notifyOrderComplete(order: Order): Promise<void> {
    const webhookUrls = await this.getWebhookUrls('order.completed')
    
    const payload = {
      event: 'order.completed',
      data: order,
      timestamp: new Date().toISOString(),
      business_id: order.business_id
    }
    
    await Promise.allSettled(
      webhookUrls.map(url => this.sendWebhook(url, payload))
    )
  }
}
```

---

*This API Architecture documentation provides the foundation for all API development within the Thorbis Business OS platform. All API endpoints must conform to these standards and patterns to ensure consistency, security, and maintainability across the entire ecosystem.*