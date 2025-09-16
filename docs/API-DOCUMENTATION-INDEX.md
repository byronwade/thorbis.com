# Thorbis Business OS - Comprehensive API Documentation Index

> **Version**: 3.0.0  
> **Last Updated**: 2025-01-31  
> **Status**: Production Ready

## Table of Contents
1. [API Architecture Overview](#api-architecture-overview)
2. [Industry-Specific API Namespacing](#industry-specific-api-namespacing)
3. [API Endpoint Discovery](#api-endpoint-discovery)
4. [Authentication & Authorization](#authentication--authorization)
5. [Error Handling & Response Formats](#error-handling--response-formats)
6. [Rate Limiting & Security](#rate-limiting--security)
7. [API Documentation by Industry](#api-documentation-by-industry)
8. [Integration Patterns](#integration-patterns)
9. [Developer Tools & Testing](#developer-tools--testing)
10. [Performance & Monitoring](#performance--monitoring)

---

## API Architecture Overview

### Design Philosophy
The Thorbis Business OS API follows a **"Dark-First, Overlay-Free, Industry-Separated, AI-Governed, Blockchain-Verified"** architecture:

- **RESTful Design**: Standard HTTP methods with predictable URL patterns
- **Industry Separation**: Dedicated API namespaces for each vertical
- **Multi-tenant**: Built-in tenant isolation with Row-Level Security (RLS)
- **AI-First**: Every API operation monitored and optimized by AI agents
- **NextFaster Performance**: Sub-300ms response times, optimized for mobile-first
- **Blockchain Transparency**: Critical operations cryptographically verified

### Core API Patterns

#### 1. Standard Response Format
```typescript
// Success Response
interface ApiSuccessResponse<T> {
  data: T
  meta: {
    request_id: string
    response_time_ms: number
    timestamp: string
    pagination?: PaginationMeta
    cache_status: 'hit' | 'miss' | 'stale'
    cache_ttl?: number
    usage_cost?: number
    usage_units?: string
  }
}

// Error Response
interface ApiErrorResponse {
  error: {
    code: ApiErrorCode
    message: string
    details?: any
    timestamp: string
    request_id: string
    suggested_action?: string
    documentation_url?: string
    retry_after_seconds?: number
    rate_limit_reset?: string
  }
}
```

#### 2. Request Context
Every API request includes comprehensive context for security and tracking:
```typescript
interface RequestContext {
  request_id: string
  business_id: string
  user_id: string
  user_role: 'owner' | 'manager' | 'staff' | 'viewer' | 'api_partner'
  industry: 'hs' | 'auto' | 'rest' | 'ret'
  ip_address?: string
  user_agent?: string
  endpoint: string
  method: string
  start_time: number
}
```

---

## Industry-Specific API Namespacing

The Thorbis Business OS uses a hierarchical API structure that separates concerns by industry vertical and access level:

### Production URLs (thorbis.com)
- **Home Services**: `https://thorbis.com/api/v1/hs/`
- **Auto Services**: `https://thorbis.com/api/v1/auto/`
- **Restaurant**: `https://thorbis.com/api/v1/rest/`
- **Retail**: `https://thorbis.com/api/v1/ret/`

### Documentation & Testing APIs
- **Unified Docs**: `https://thorbis.com/api/v1/` (Documentation endpoints)
- **Documentation Site**: `https://thorbis.com/api/v2/` (Cross-industry examples)

### Special Purpose APIs
- **AI Chat**: `https://thorbis.com/ai/api/`
- **Learning Platform**: `https://thorbis.com/courses/api/`
- **List of Manifests**: `https://lom.thorbis.com/api/`
- **Investigations**: `https://thorbis.com/investigations/api/`

### API Versioning Strategy
```
/api/v{major}/{industry}/             # Industry-specific APIs
/api/v{major}/                        # Cross-industry documentation/examples
```

**Authentication Patterns**:
- **Public endpoints**: No authentication required (rate limited)
- **Protected endpoints**: JWT authentication with tenant context
- **App endpoints**: Session-based authentication with role permissions

---

## API Endpoint Discovery

### Complete Endpoint Catalog

#### Home Services (`/api/v1/hs/`)
```typescript
// Core Business Objects (Protected endpoints - JWT required)
GET|POST /api/v1/hs/work-orders           // Work order management
GET|POST /api/v1/hs/customers            // Customer management
GET|POST /api/v1/hs/estimates            // Estimate creation & tracking
GET|POST /api/v1/hs/invoices             // Invoice management
GET|POST /api/v1/hs/scheduling           // Appointment scheduling
GET|POST /api/v1/hs/billing              // Billing & payment processing

// AI-Powered Features (Protected endpoints - JWT required)
POST /api/v1/hs/ai/customer-insights     // AI customer analytics
POST /api/v1/hs/ai/demand-forecast       // Demand forecasting
POST /api/v1/hs/ai/invoice-anomaly       // Invoice anomaly detection
POST /api/v1/hs/ai/job-classification    // Automatic job categorization
POST /api/v1/hs/ai/predictive-maintenance // Predictive maintenance insights
POST /api/v1/hs/ai/pricing-optimization  // Dynamic pricing recommendations
GET  /api/v1/hs/ai/models               // Available AI models

// Public APIs (No authentication required - rate limited)
GET /api/v1/hs/quote-generator      // Public quote generation
GET /api/v1/hs/businesses          // Public business directory
```

#### Auto Services (`/api/v1/auto/`)
```typescript
// Vehicle & Service Management (Protected endpoints - JWT required)
GET|POST /api/v1/auto/repair-orders        // Repair order lifecycle
GET|POST /api/v1/auto/vehicles            // Vehicle fleet management
GET|POST /api/v1/auto/customers           // Customer & fleet tracking
GET|POST /api/v1/auto/parts               // Parts inventory & ordering
GET|POST /api/v1/auto/service-bays        // Service bay scheduling
```

#### Restaurant (`/api/v1/rest/`)
```typescript
// Restaurant Operations (Protected endpoints - JWT required)
GET|POST /api/v1/rest/orders              // Order management
GET|POST /api/v1/rest/menu-items          // Menu management
GET|POST /api/v1/rest/reservations        // Table reservations
GET|POST /api/v1/rest/inventory           // Food inventory
GET|POST /api/v1/rest/pos-transactions    // Point of sale
```

#### Retail (`/api/v1/ret/`)
```typescript
// Retail Operations (Protected endpoints - JWT required)
GET|POST /api/v1/ret/products            // Product catalog
GET|POST /api/v1/ret/inventory           // Inventory management
GET|POST /api/v1/ret/customers           // Customer management
GET|POST /api/v1/ret/orders              // Order processing
GET|POST /api/v1/ret/pos-transactions    // Point of sale
```

#### Learning Platform (`/api/v1/courses/`)
```typescript
// Learning Management
GET|POST /courses             // Course catalog
GET|POST /lessons             // Lesson management
GET|POST /study-groups        // Collaborative learning
GET|POST /badges              // Achievement system
GET|POST /xp                  // Experience points
GET|POST /leaderboard         // Gamification
POST /auth                    // Course-specific auth
```

#### AI Platform (`/api/ai/`)
```typescript
// AI Chat & Processing
POST /chat                    // AI chat interface
POST /ai/chat                 // Advanced AI interactions
```

#### Documentation & Discovery (`/api/v1/`, `/api/v2/`)
```typescript
// Cross-Industry Examples
GET /v1/hs/customers          // Home Services examples
GET /v1/rest/orders           // Restaurant examples
GET /v1/auto/repair-orders    // Auto Services examples
GET /v1/ret/products          // Retail examples
GET /v1/courses               // Learning examples
GET /v1/payroll               // Payroll examples
GET /v1/ai                    // AI examples

// V2 Documentation APIs
GET /v2/docs                  // API documentation
GET /v2/hs/work-orders        // HS examples
GET /v2/rest/orders           // Restaurant examples
GET /v2/auto/repair-orders    // Auto examples
GET /v2/ret/products          // Retail examples
GET /v2/courses/courses       // Learning examples
```

---

## Authentication & Authorization

### JWT-Based Authentication
All APIs use industry-standard JWT tokens with comprehensive claims:

```typescript
interface JWTClaims {
  sub: string                    // User ID
  business_id: string           // Tenant ID
  role: 'owner' | 'manager' | 'staff' | 'viewer' | 'api_partner'
  industry: 'hs' | 'auto' | 'rest' | 'ret'
  permissions: string[]         // Granular permissions
  exp: number                   // Token expiration
  iat: number                   // Issued at
}
```

### Permission System
Granular permissions follow the pattern: `{industry}:{resource}:{action}`

```typescript
// Examples
'hs:work_orders:read'         // Read home services work orders
'hs:work_orders:write'        // Create/update work orders
'auto:repair_orders:read'     // Read auto repair orders
'rest:orders:write'           // Create restaurant orders
```

### Role Hierarchy
```typescript
const roleHierarchy = {
  owner: 100,      // Full access to everything
  manager: 75,     // Management functions + staff permissions
  staff: 50,       // Daily operations
  viewer: 25,      // Read-only access
  api_partner: 10  // Limited API access
}
```

### Authentication Flow
```typescript
// Request headers
Authorization: Bearer {jwt_token}
Idempotency-Key: {unique_key}  // Required for write operations
```

---

## Error Handling & Response Formats

### Error Codes
```typescript
enum ApiErrorCode {
  // Authentication & Authorization
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation & Input
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Business Logic
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  
  // Rate Limiting & Usage
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  USAGE_LIMIT_EXCEEDED = 'USAGE_LIMIT_EXCEEDED',
  
  // System & Infrastructure
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Idempotency
  IDEMPOTENCY_KEY_REQUIRED = 'IDEMPOTENCY_KEY_REQUIRED',
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST'
}
```

### Status Code Mapping
```typescript
// HTTP Status Codes
200: Success
201: Created
400: Bad Request (validation errors)
401: Unauthorized (authentication required)
403: Forbidden (insufficient permissions)
404: Not Found
409: Conflict (duplicate/idempotency issues)
429: Too Many Requests (rate limiting)
500: Internal Server Error
503: Service Unavailable
```

---

## Rate Limiting & Security

### Rate Limiting Tiers
```typescript
// Default limits per operation type
const rateLimits = {
  'work_orders_read': { limit: 1000, window: '1h' },
  'work_orders_create': { limit: 100, window: '1h' },
  'customers_read': { limit: 2000, window: '1h' },
  'ai_analysis': { limit: 50, window: '1h' }
}
```

### Security Features
- **PII Detection**: Automatic detection and redaction of sensitive data
- **Audit Logging**: Every API call logged with security events
- **Idempotency**: Prevents duplicate operations with idempotency keys
- **Input Sanitization**: All inputs validated against Zod schemas
- **SQL Injection Protection**: Parameterized queries and ORM usage
- **CSRF Protection**: Built-in with Next.js App Router

### Security Headers
```typescript
// Standard security headers on all responses
'X-Business-ID': string,
'X-Request-ID': string,
'X-Response-Time': string,
'X-RateLimit-Limit': string,
'X-RateLimit-Remaining': string,
'X-RateLimit-Reset': string
```

---

## API Documentation by Industry

### Home Services API

#### Work Orders API (`/api/hs/app/v1/work-orders`)

**Features:**
- Complete work order lifecycle management
- Real-time status tracking and updates
- Technician assignment and dispatch
- Customer service history integration
- Parts and materials tracking
- Photo documentation and file attachments
- Warranty tracking and follow-up scheduling
- Integration with scheduling and invoicing

**Request/Response Examples:**

```typescript
// GET /api/hs/app/v1/work-orders
interface WorkOrderListRequest {
  limit?: number                 // Default: 20, Max: 100
  offset?: number               // Default: 0
  status?: 'created' | 'scheduled' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
  technician_id?: string
  customer_id?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  service_type?: 'plumbing' | 'electrical' | 'hvac' // ... more types
  date_from?: string            // ISO 8601 date
  date_to?: string
  search?: string               // Search across title, description, customer
  include_customer?: boolean
  include_technician?: boolean
  include_photos?: boolean
  include_materials?: boolean
}

// POST /api/hs/app/v1/work-orders
interface CreateWorkOrderRequest {
  title: string
  description: string
  customer: CustomerInfo
  serviceType: HSServiceType
  jobType: 'service_call' | 'installation' | 'repair' | 'maintenance'
  priority?: Priority
  scheduledAt?: Date
  estimatedDuration?: number    // minutes
  location: AddressWithAccess
  estimate?: {
    laborHours: number
    laborRate: number
    materialCost: number
    total: number
  }
  materials?: MaterialItem[]
  notes?: string
  warranty?: WarrantyInfo
}
```

**Business Rules:**
- Work orders follow state machine transitions (created → scheduled → assigned → in_progress → completed)
- Only assigned technicians or managers can mark orders as completed
- Materials must be available in inventory before assignment
- Scheduling conflicts are automatically detected and prevented

#### Customers API (`/api/hs/app/v1/customers`)

**Features:**
- Residential and commercial customer management
- Service address and billing address tracking
- Equipment and property information
- Service history and lifetime value calculation
- Communication preferences and contact methods
- AI-powered customer insights and recommendations
- Integration with work orders and invoicing

### Auto Services API

#### Repair Orders API (`/api/auto/app/v1/repair-orders`)

**Features:**
- Comprehensive repair order lifecycle management
- VIN decoding and vehicle history integration
- Parts ordering and labor tracking
- Service bay assignment and scheduling
- Customer communication and updates
- Warranty claim processing
- Integration with DMS systems

#### Customers API (`/api/auto/app/v1/customers`)

**Features:**
- Individual, commercial, and fleet customer management
- Multi-vehicle tracking per customer
- Maintenance reminders based on mileage and time
- Service history across all customer vehicles
- Insurance information and claim integration
- Fleet management for commercial accounts

### Restaurant API (Inferred Structure)

Expected endpoints based on app structure:
- **Orders API**: Order management and kitchen display integration
- **Menu API**: Menu item management and pricing
- **Reservations API**: Table booking and availability
- **Inventory API**: Food cost and waste tracking
- **POS API**: Point of sale integration

### Retail API (Inferred Structure)

Expected endpoints based on app structure:
- **Products API**: Product catalog and pricing
- **Inventory API**: Stock management and reordering
- **Orders API**: Sales order processing
- **POS API**: Point of sale transactions
- **Customers API**: Customer loyalty and purchase history

---

## Integration Patterns

### 1. Cross-App Data Access
```typescript
// Apps can access other industry APIs through the unified gateway
const workOrderData = await fetch('/api/v1/hs/work-orders', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

// Cross-industry analytics
const analyticsData = await fetch('/api/v2/analytics', {
  body: JSON.stringify({
    industries: ['hs', 'auto'],
    metrics: ['revenue', 'customer_satisfaction']
  })
})
```

### 2. Real-time Integration
```typescript
// WebSocket connections for real-time updates
const socket = new WebSocket('wss://thorbis.com/realtime')
socket.addEventListener('message', (event) => {
  const update = JSON.parse(event.data)
  if (update.type === 'work_order_status_change') {
    // Handle real-time work order updates
  }
})
```

### 3. Webhook Integration
```typescript
// Configure webhooks for external system integration
POST /api/v1/webhooks/configure
{
  "url": "https://your-system.com/webhook",
  "events": ["work_order.completed", "customer.created"],
  "signing_key": "your_signing_key",
  "industry": "hs"
}
```

### 4. SDK Integration
```typescript
// TypeScript SDK (generated from schemas)
import { ThorbisAPI } from '@thorbis/sdk'

const client = new ThorbisAPI({
  apiKey: process.env.THORBIS_API_KEY,
  industry: 'hs'
})

const workOrders = await client.workOrders.list({
  status: 'in_progress',
  limit: 50
})
```

---

## Developer Tools & Testing

### 1. API Playground
- **Location**: `https://thorbis.com/api/playground`
- **Features**: Interactive API testing, request/response inspection, authentication testing
- **Code Generation**: Automatic code generation for multiple languages

### 2. Documentation Explorer
- **Location**: `https://thorbis.com/api/docs`
- **Features**: Interactive API documentation, schema validation, example requests

### 3. SDK Generation
- **TypeScript**: Auto-generated from Zod schemas
- **Python**: REST client with full type hints
- **Go**: Structured API client
- **cURL**: Complete command-line examples

### 4. Testing Strategy

#### Unit Testing
```typescript
// API endpoint testing with Jest
describe('Work Orders API', () => {
  test('should create work order with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/hs/work-orders')
      .set('Authorization', `Bearer ${testToken}`)
      .send(validWorkOrderData)
      .expect(201)
    
    expect(response.body.data.status).toBe('created')
  })
})
```

#### Integration Testing
```typescript
// End-to-end API workflows
test('complete work order workflow', async () => {
  // 1. Create work order
  const workOrder = await createWorkOrder(testData)
  
  // 2. Assign technician
  await assignTechnician(workOrder.id, technicianId)
  
  // 3. Start work
  await updateWorkOrderStatus(workOrder.id, 'in_progress')
  
  // 4. Complete work
  await completeWorkOrder(workOrder.id, completionData)
  
  // 5. Verify final state
  const final = await getWorkOrder(workOrder.id)
  expect(final.status).toBe('completed')
})
```

### 5. Mock Data & Development
```typescript
// Comprehensive mock data for development
const mockWorkOrder: HSWorkOrder = {
  id: 'wo_test_001',
  jobNumber: 'WO-2024-001',
  status: 'created',
  title: 'HVAC Maintenance',
  description: 'Annual system checkup',
  customer: mockCustomer,
  serviceType: 'hvac',
  priority: 'normal',
  // ... complete mock structure
}
```

---

## Performance & Monitoring

### 1. Performance Targets
- **Response Time**: < 300ms for most endpoints
- **Throughput**: 1000 requests/second per industry API
- **Availability**: 99.9% uptime SLA
- **Error Rate**: < 0.1% for successful auth

### 2. Monitoring & Observability
```typescript
// Built-in performance monitoring
interface ResponseMetrics {
  response_time_ms: number
  database_query_time: number
  external_api_time: number
  cache_hit_ratio: number
  memory_usage: number
}
```

### 3. Caching Strategy
```typescript
// Multi-level caching
const cacheConfig = {
  redis: {
    ttl: 300,              // 5 minutes default
    prefix: 'thorbis:api'
  },
  cdn: {
    static_assets: '1y',
    api_responses: '5m'
  },
  browser: {
    etags: true,
    cache_control: 'public, max-age=300'
  }
}
```

### 4. Health Checks
```typescript
// Endpoint health monitoring
GET /api/v1/health
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "ai_services": "healthy"
  },
  "response_time_ms": 45,
  "timestamp": "2024-01-31T10:00:00Z"
}
```

---

## Best Practices & Guidelines

### 1. API Design Principles
- **Consistency**: Uniform patterns across all industry APIs
- **Predictability**: Standard HTTP methods and status codes
- **Discoverability**: Self-documenting URLs and comprehensive documentation
- **Versioning**: Backward compatibility with graceful deprecation
- **Security**: Authentication, authorization, and audit logging by default

### 2. Error Handling Best Practices
```typescript
// Always provide actionable error messages
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Customer phone number is required",
    "details": {
      "field": "phone_primary",
      "provided_value": null,
      "expected_format": "+1-XXX-XXX-XXXX"
    },
    "suggested_action": "Provide a valid phone number in E.164 format",
    "documentation_url": "https://thorbis.com/docs/validation#phone"
  }
}
```

### 3. Pagination & Filtering
```typescript
// Standard pagination parameters
interface PaginationRequest {
  limit?: number        // Default: 20, Max: 100
  offset?: number       // Default: 0
  cursor?: string       // For cursor-based pagination
}

// Comprehensive filtering
interface FilterOptions {
  search?: string       // Full-text search
  status?: string[]     // Multiple status filter
  date_range?: {
    start: string
    end: string
  }
  sort_by?: string      // Field to sort by
  sort_order?: 'asc' | 'desc'
}
```

### 4. Idempotency Requirements
```typescript
// All write operations require idempotency keys
POST /api/hs/app/v1/work-orders
Headers: {
  "Idempotency-Key": "unique-operation-id",
  "Authorization": "Bearer token"
}
```

---

## Migration & Upgrade Path

### API Versioning Strategy
- **Major Version**: Breaking changes requiring migration (v1 → v2)
- **Minor Version**: Backward-compatible additions (v1.0 → v1.1)
- **Patch Version**: Bug fixes and optimizations (v1.0.0 → v1.0.1)

### Deprecation Policy
- **6 months notice**: For any breaking changes
- **Migration guides**: Comprehensive documentation for version upgrades
- **Dual support**: Previous version supported for transition period
- **Automated testing**: Compatibility testing across versions

---

## Conclusion

The Thorbis Business OS API ecosystem provides a comprehensive, secure, and performant foundation for building industry-specific business applications. With its industry-separated architecture, AI-powered insights, and rigorous security model, it enables developers to create powerful integrations while maintaining the highest standards of data protection and system reliability.

For the most up-to-date documentation and interactive examples, visit:
- **Main Documentation**: `https://thorbis.com/docs`
- **API Playground**: `https://thorbis.com/api/playground`
- **Status Page**: `https://status.thorbis.com`
- **Developer Portal**: `https://thorbis.com/developers`

---

**Next Steps:**
1. Choose your target industry vertical (HS, Auto, Restaurant, Retail)
2. Review the specific API documentation for your vertical
3. Set up authentication and test basic endpoints
4. Explore the interactive playground for hands-on learning
5. Implement your first integration using the provided SDKs

For technical support and questions, contact our developer relations team at `api-support@thorbis.com`.