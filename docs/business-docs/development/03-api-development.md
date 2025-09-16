# API Development Guide

This guide covers comprehensive API development for Thorbis Business OS, including industry-specific namespaces, authentication, security, and best practices for building scalable RESTful APIs.

## API Architecture Overview

### Industry-Separated Namespaces

Thorbis Business OS uses industry-specific API namespaces to provide tailored functionality while maintaining code organization and security boundaries.

```typescript
// API namespace structure
const apiNamespaces = {
  homeServices: '/api/hs',     // Home Services APIs
  restaurant: '/api/rest',     // Restaurant APIs  
  automotive: '/api/auto',     // Automotive APIs
  retail: '/api/ret',          // Retail APIs
  public: '/api/public',       // Public/unauthenticated APIs
  shared: '/api/shared'        // Cross-industry shared APIs
} as const

// Example API routes by industry
const industryRoutes = {
  '/api/hs/customers',         // Home Services customers
  '/api/hs/work-orders',       // Home Services work orders
  '/api/hs/scheduling',        // Home Services scheduling
  
  '/api/rest/customers',       // Restaurant customers
  '/api/rest/orders',          // Restaurant orders
  '/api/rest/menu',            // Restaurant menu management
  
  '/api/auto/customers',       // Automotive customers
  '/api/auto/repair-orders',   // Automotive repair orders
  '/api/auto/estimates',       // Automotive estimates
  
  '/api/ret/customers',        // Retail customers
  '/api/ret/products',         // Retail products
  '/api/ret/inventory'         // Retail inventory
}
```

### API Design Principles

#### 1. RESTful Design
```typescript
// RESTful resource patterns
interface APIResource {
  // Collection operations
  'GET /api/{industry}/customers'     // List customers
  'POST /api/{industry}/customers'    // Create customer
  
  // Individual resource operations
  'GET /api/{industry}/customers/:id'    // Get customer
  'PUT /api/{industry}/customers/:id'    // Update customer (full)
  'PATCH /api/{industry}/customers/:id'  // Update customer (partial)
  'DELETE /api/{industry}/customers/:id' // Delete customer
  
  // Sub-resource operations
  'GET /api/{industry}/customers/:id/orders'    // Get customer orders
  'POST /api/{industry}/customers/:id/orders'   // Create order for customer
}
```

#### 2. Consistent Response Format
```typescript
// Standardized API response structure
interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
    filters?: Record<string, unknown>
    sort?: string
  }
  timestamp: string
  requestId: string
}

// Success response example
const successResponse: APIResponse<Customer[]> = {
  success: true,
  data: [
    {
      id: 'cust_123',
      name: 'John Smith',
      email: 'john@example.com'
    }
  ],
  meta: {
    pagination: {
      page: 1,
      pageSize: 20,
      total: 150,
      totalPages: 8
    }
  },
  timestamp: '2025-01-31T12:00:00Z',
  requestId: 'req_abc123'
}
```

## API Implementation

### Next.js 15 API Routes

#### Basic API Route Structure
```typescript
// apps/hs/src/app/api/hs/customers/route.ts
import { NextRequest } from 'next/server'
import { apiResponse, validateAuth, setTenantContext } from '@/lib/api'
import { getCustomers, createCustomer } from '@/lib/services/customers'
import { customerCreateSchema } from '@thorbis/schemas'

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await validateAuth(request)
    
    // 2. Set tenant context for RLS
    await setTenantContext(user.businessId)
    
    // 3. Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100)
    const search = searchParams.get('search') || ''
    
    // 4. Business logic
    const { customers, total } = await getCustomers({
      page,
      pageSize,
      search,
      businessId: user.businessId
    })
    
    // 5. Return standardized response
    return apiResponse({
      data: customers,
      meta: {
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    })
  } catch (error) {
    return apiResponse({
      error: {
        code: 'CUSTOMERS_FETCH_ERROR',
        message: 'Failed to fetch customers',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication and authorization
    const user = await validateAuth(request, ['customers:create'])
    await setTenantContext(user.businessId)
    
    // 2. Validate request body
    const body = await request.json()
    const validatedData = customerCreateSchema.parse(body)
    
    // 3. Business logic
    const customer = await createCustomer({
      ...validatedData,
      businessId: user.businessId,
      createdBy: user.id
    })
    
    // 4. Return created resource
    return apiResponse({ data: customer }, 201)
  } catch (error) {
    if (error instanceof ZodError) {
      return apiResponse({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors
        }
      }, 400)
    }
    
    return apiResponse({
      error: {
        code: 'CUSTOMER_CREATE_ERROR',
        message: 'Failed to create customer'
      }
    }, 500)
  }
}
```

#### Dynamic API Routes
```typescript
// apps/hs/src/app/api/hs/customers/[id]/route.ts
interface RouteParams {
  params: { id: string }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await validateAuth(request)
    await setTenantContext(user.businessId)
    
    const customer = await getCustomerById(params.id, user.businessId)
    
    if (!customer) {
      return apiResponse({
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found'
        }
      }, 404)
    }
    
    return apiResponse({ data: customer })
  } catch (error) {
    return apiResponse({
      error: {
        code: 'CUSTOMER_FETCH_ERROR',
        message: 'Failed to fetch customer'
      }
    }, 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await validateAuth(request, ['customers:update'])
    await setTenantContext(user.businessId)
    
    const body = await request.json()
    const validatedData = customerUpdateSchema.parse(body)
    
    const customer = await updateCustomer(params.id, {
      ...validatedData,
      updatedBy: user.id,
      updatedAt: new Date()
    }, user.businessId)
    
    return apiResponse({ data: customer })
  } catch (error) {
    return handleAPIError(error)
  }
}
```

### Authentication and Authorization

#### Auth Middleware Implementation
```typescript
// lib/api/auth.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

interface AuthUser {
  id: string
  email: string
  businessId: string
  role: string
  permissions: string[]
}

export async function validateAuth(
  request: NextRequest,
  requiredPermissions: string[] = []
): Promise<AuthUser> {
  // 1. Extract JWT token
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    throw new Error('Authentication required')
  }
  
  // 2. Verify token with Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new Error('Invalid authentication token')
  }
  
  // 3. Get user business context and permissions
  const { data: profile } = await supabase
    .from('user_profiles')
    .select(`
      business_id,
      role,
      permissions,
      businesses (
        id,
        name,
        industry,
        status
      )
    `)
    .eq('user_id', user.id)
    .single()
  
  if (!profile || !profile.businesses) {
    throw new Error('User profile not found')
  }
  
  // 4. Check business status
  if (profile.businesses.status !== 'active') {
    throw new Error('Business account inactive')
  }
  
  // 5. Verify permissions
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every(permission =>
      profile.permissions.includes(permission) ||
      profile.permissions.includes('*') // Owner has all permissions
    )
    
    if (!hasPermission) {
      throw new Error('Insufficient permissions')
    }
  }
  
  return {
    id: user.id,
    email: user.email!,
    businessId: profile.business_id,
    role: profile.role,
    permissions: profile.permissions
  }
}
```

#### Permission System
```typescript
// lib/permissions.ts
interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | '*'
  conditions?: string[]
}

const rolePermissions: Record<string, Permission[]> = {
  owner: [
    { resource: '*', action: '*' } // Full access
  ],
  
  manager: [
    { resource: 'customers', action: '*' },
    { resource: 'orders', action: '*' },
    { resource: 'inventory', action: '*' },
    { resource: 'reports', action: 'read' },
    { resource: 'settings', action: 'read' }
  ],
  
  staff: [
    { resource: 'customers', action: 'read' },
    { resource: 'customers', action: 'update', conditions: ['assigned_to_user'] },
    { resource: 'orders', action: 'create' },
    { resource: 'orders', action: 'update', conditions: ['assigned_to_user'] },
    { resource: 'inventory', action: 'read' }
  ],
  
  viewer: [
    { resource: 'customers', action: 'read' },
    { resource: 'orders', action: 'read' },
    { resource: 'reports', action: 'read' }
  ]
}

export function checkPermission(
  userRole: string,
  resource: string,
  action: string,
  context?: Record<string, unknown>
): boolean {
  const permissions = rolePermissions[userRole] || []
  
  return permissions.some(permission => {
    // Check resource match
    if (permission.resource !== '*' && permission.resource !== resource) {
      return false
    }
    
    // Check action match
    if (permission.action !== '*' && permission.action !== action) {
      return false
    }
    
    // Check conditions if present
    if (permission.conditions && context) {
      return permission.conditions.every(condition => 
        evaluateCondition(condition, context)
      )
    }
    
    return true
  })
}
```

### Data Validation and Schemas

#### Zod Schema Definitions
```typescript
// packages/schemas/src/customers.ts
import { z } from 'zod'

export const customerBaseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number').optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('US')
  }).optional(),
  customerType: z.enum(['residential', 'commercial']).default('residential'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional()
})

export const customerCreateSchema = customerBaseSchema.extend({
  businessId: z.string().uuid() // Added during API processing
})

export const customerUpdateSchema = customerBaseSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.date()
})

// Industry-specific extensions
export const homeServicesCustomerSchema = customerCreateSchema.extend({
  serviceAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  }).optional(),
  propertyType: z.enum(['house', 'apartment', 'condo', 'commercial']).optional(),
  accessInstructions: z.string().optional()
})
```

#### Request Validation Middleware
```typescript
// lib/api/validation.ts
import { z, ZodSchema } from 'zod'
import { NextRequest } from 'next/server'

export function validateRequestBody<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    try {
      const body = await request.json()
      return schema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid request data', error.errors)
      }
      throw new Error('Invalid JSON in request body')
    }
  }
}

export function validateQueryParams<T>(schema: ZodSchema<T>) {
  return (request: NextRequest): T => {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    try {
      return schema.parse(params)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid query parameters', error.errors)
      }
      throw error
    }
  }
}

// Usage in API routes
export async function POST(request: NextRequest) {
  const validateBody = validateRequestBody(customerCreateSchema)
  const data = await validateBody(request) // Throws if invalid
  
  // Proceed with validated data
  const customer = await createCustomer(data)
  return apiResponse({ data: customer })
}
```

## Industry-Specific APIs

### Home Services APIs

#### Work Orders API
```typescript
// apps/hs/src/app/api/hs/work-orders/route.ts
import { workOrderCreateSchema, workOrderQuerySchema } from '@thorbis/schemas'

export async function GET(request: NextRequest) {
  const user = await validateAuth(request, ['work-orders:read'])
  await setTenantContext(user.businessId)
  
  const validateQuery = validateQueryParams(workOrderQuerySchema)
  const queryParams = validateQuery(request)
  
  const workOrders = await getWorkOrders({
    ...queryParams,
    businessId: user.businessId
  })
  
  return apiResponse({ data: workOrders })
}

export async function POST(request: NextRequest) {
  const user = await validateAuth(request, ['work-orders:create'])
  await setTenantContext(user.businessId)
  
  const validateBody = validateRequestBody(workOrderCreateSchema)
  const data = await validateBody(request)
  
  // Business logic specific to home services
  const workOrder = await createWorkOrder({
    ...data,
    businessId: user.businessId,
    createdBy: user.id,
    status: 'scheduled',
    estimatedDuration: calculateEstimatedDuration(data.serviceType),
    priority: calculatePriority(data.customerType, data.serviceType)
  })
  
  // Trigger notifications
  await notifyTechnician(workOrder.technicianId, workOrder)
  await notifyCustomer(workOrder.customerId, workOrder)
  
  return apiResponse({ data: workOrder }, 201)
}
```

#### Scheduling API
```typescript
// apps/hs/src/app/api/hs/scheduling/availability/route.ts
export async function GET(request: NextRequest) {
  const user = await validateAuth(request, ['scheduling:read'])
  
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const technicianId = searchParams.get('technicianId')
  
  const availability = await getTechnicianAvailability({
    date,
    technicianId,
    businessId: user.businessId
  })
  
  return apiResponse({ data: availability })
}

export async function POST(request: NextRequest) {
  const user = await validateAuth(request, ['scheduling:create'])
  
  const data = await request.json()
  const appointment = await scheduleAppointment({
    ...data,
    businessId: user.businessId,
    scheduledBy: user.id
  })
  
  // Route optimization
  await optimizeTechnicianRoute(appointment.technicianId, appointment.date)
  
  return apiResponse({ data: appointment }, 201)
}
```

### Restaurant APIs

#### Orders API
```typescript
// apps/rest/src/app/api/rest/orders/route.ts
import { orderCreateSchema, orderQuerySchema } from '@thorbis/schemas'

export async function POST(request: NextRequest) {
  const user = await validateAuth(request, ['orders:create'])
  await setTenantContext(user.businessId)
  
  const validateBody = validateRequestBody(orderCreateSchema)
  const orderData = await validateBody(request)
  
  // Restaurant-specific business logic
  const order = await createOrder({
    ...orderData,
    businessId: user.businessId,
    orderNumber: await generateOrderNumber(user.businessId),
    status: 'pending',
    estimatedPrepTime: calculatePrepTime(orderData.items),
    total: calculateOrderTotal(orderData.items)
  })
  
  // Update inventory
  await updateInventoryFromOrder(order.items)
  
  // Send to kitchen display system
  await sendToKitchen(order)
  
  // Notify customer
  if (order.orderType === 'delivery') {
    await notifyDeliveryService(order)
  }
  
  return apiResponse({ data: order }, 201)
}
```

#### Menu Management API
```typescript
// apps/rest/src/app/api/rest/menu/route.ts
export async function GET(request: NextRequest) {
  // Public endpoint - no auth required for menu viewing
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get('businessId')
  
  if (!businessId) {
    return apiResponse({
      error: { code: 'BUSINESS_ID_REQUIRED', message: 'Business ID required' }
    }, 400)
  }
  
  const menu = await getPublicMenu(businessId)
  return apiResponse({ data: menu })
}

export async function POST(request: NextRequest) {
  const user = await validateAuth(request, ['menu:update'])
  await setTenantContext(user.businessId)
  
  const menuItemData = await request.json()
  const menuItem = await createMenuItem({
    ...menuItemData,
    businessId: user.businessId,
    createdBy: user.id
  })
  
  // Update POS systems
  await syncWithPOSSystems(menuItem)
  
  return apiResponse({ data: menuItem }, 201)
}
```

### Cross-Industry Shared APIs

#### Customer API (Shared Pattern)
```typescript
// packages/api/src/customers.ts
interface CustomerAPI {
  industry: 'hs' | 'rest' | 'auto' | 'ret'
  baseEndpoint: string
}

export function createCustomerAPI(config: CustomerAPI) {
  const { industry, baseEndpoint } = config
  
  return {
    async getCustomers(params: GetCustomersParams) {
      // Shared customer retrieval logic
      const query = supabase
        .from('customers')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          created_at,
          ${getIndustrySpecificFields(industry)}
        `)
        .eq('business_id', params.businessId)
      
      if (params.search) {
        query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
      }
      
      const { data, error } = await query
        .range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1)
      
      if (error) throw error
      return data
    },
    
    async createCustomer(data: CreateCustomerData) {
      // Industry-specific validation
      const schema = getIndustryCustomerSchema(industry)
      const validatedData = schema.parse(data)
      
      const { data: customer, error } = await supabase
        .from('customers')
        .insert(validatedData)
        .select()
        .single()
      
      if (error) throw error
      
      // Industry-specific post-creation logic
      await executeIndustryHooks(industry, 'customer:created', customer)
      
      return customer
    }
  }
}

function getIndustrySpecificFields(industry: string): string {
  switch (industry) {
    case 'hs':
      return 'service_address, property_type, access_instructions'
    case 'rest':
      return 'dietary_preferences, loyalty_points, favorite_items'
    case 'auto':
      return 'vehicles'
    case 'ret':
      return 'loyalty_tier, purchase_history'
    default:
      return ''
  }
}
```

## Error Handling and Logging

### Standardized Error Handling
```typescript
// lib/api/errors.ts
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public validationErrors: unknown) {
    super('VALIDATION_ERROR', message, 400, validationErrors)
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404)
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHORIZED', message, 401)
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403)
  }
}

// Error handling middleware
export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error)
  
  if (error instanceof APIError) {
    return apiResponse({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    }, error.statusCode)
  }
  
  if (error instanceof z.ZodError) {
    return apiResponse({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors
      }
    }, 400)
  }
  
  // Generic server error
  return apiResponse({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  }, 500)
}
```

### Request Logging and Monitoring
```typescript
// lib/api/logging.ts
interface APILogEntry {
  requestId: string
  method: string
  url: string
  userAgent: string
  userId?: string
  businessId?: string
  industry?: string
  responseTime: number
  statusCode: number
  error?: string
}

export async function logAPIRequest(
  request: NextRequest,
  response: Response,
  user?: AuthUser,
  startTime: number
) {
  const logEntry: APILogEntry = {
    requestId: crypto.randomUUID(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || '',
    userId: user?.id,
    businessId: user?.businessId,
    industry: extractIndustryFromURL(request.url),
    responseTime: Date.now() - startTime,
    statusCode: response.status
  }
  
  // Log to multiple destinations
  await Promise.all([
    logToDatabase(logEntry),
    logToAnalytics(logEntry),
    logToMonitoring(logEntry)
  ])
}

// Request monitoring middleware
export function withAPILogging<T extends unknown[], R>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const startTime = Date.now()
    const request = args[0] as NextRequest
    
    try {
      const response = await handler(...args)
      await logAPIRequest(request, response, undefined, startTime)
      return response
    } catch (error) {
      const errorResponse = handleAPIError(error)
      await logAPIRequest(request, errorResponse, undefined, startTime)
      return errorResponse
    }
  }
}
```

## API Security

### Rate Limiting
```typescript
// lib/api/rate-limiting.ts
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
}

class RateLimiter {
  private cache = new Map<string, { count: number; resetTime: number }>()
  
  async checkRateLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Clean up expired entries
    for (const [k, v] of this.cache.entries()) {
      if (v.resetTime < windowStart) {
        this.cache.delete(k)
      }
    }
    
    const current = this.cache.get(key) || { count: 0, resetTime: now + config.windowMs }
    
    if (current.resetTime < now) {
      // Reset window
      current.count = 1
      current.resetTime = now + config.windowMs
    } else {
      current.count++
    }
    
    this.cache.set(key, current)
    
    return {
      allowed: current.count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - current.count),
      resetTime: current.resetTime
    }
  }
}

const rateLimiter = new RateLimiter()

export async function enforceRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<void> {
  const key = config.keyGenerator(request)
  const result = await rateLimiter.checkRateLimit(key, config)
  
  if (!result.allowed) {
    throw new APIError(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests',
      429,
      {
        remaining: result.remaining,
        resetTime: result.resetTime
      }
    )
  }
}

// Rate limiting configurations
export const rateLimitConfigs = {
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req: NextRequest) => req.ip || 'anonymous'
  },
  
  authenticated: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 500,
    keyGenerator: (req: NextRequest) => {
      const authHeader = req.headers.get('authorization')
      return authHeader ? `user_${authHeader}` : req.ip || 'anonymous'
    }
  },
  
  strict: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 20,
    keyGenerator: (req: NextRequest) => req.ip || 'anonymous'
  }
}
```

### Input Validation and Sanitization
```typescript
// lib/api/sanitization.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    // Remove XSS attempts
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    })
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (input && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key) as string] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// SQL injection prevention
export function sanitizeSQL(query: string, params: unknown[]): [string, unknown[]] {
  // Use parameterized queries only
  if (query.includes('${') || query.includes('`')) {
    throw new Error('String interpolation not allowed in SQL queries')
  }
  
  return [query, params.map(sanitizeInput)]
}
```

## API Testing

### Unit Testing API Routes
```typescript
// apps/hs/src/app/api/hs/customers/__tests__/route.test.ts
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import { createMockRequest, createMockUser } from '@/lib/test-utils'

describe('/api/hs/customers', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })
  
  describe('GET', () => {
    it('should return customers for authenticated user', async () => {
      const mockUser = createMockUser({ role: 'manager' })
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3001/api/hs/customers?page=1&pageSize=20',
        headers: { authorization: `Bearer ${mockUser.token}` }
      })
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
    })
    
    it('should return 401 for unauthenticated requests', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3001/api/hs/customers'
      })
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })
  })
  
  describe('POST', () => {
    it('should create customer with valid data', async () => {
      const mockUser = createMockUser({ permissions: ['customers:create'] })
      const customerData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '555-123-4567'
      }
      
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3001/api/hs/customers',
        headers: { authorization: `Bearer ${mockUser.token}` },
        body: customerData
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe(customerData.name)
    })
    
    it('should return validation errors for invalid data', async () => {
      const mockUser = createMockUser({ permissions: ['customers:create'] })
      const invalidData = {
        email: 'invalid-email'
      }
      
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3001/api/hs/customers',
        headers: { authorization: `Bearer ${mockUser.token}` },
        body: invalidData
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })
  })
})
```

### Integration Testing
```typescript
// __tests__/integration/api/customers.test.ts
import { testApiHandler } from 'next-test-api-route-handler'
import handler from '@/pages/api/hs/customers'
import { setupTestDatabase, cleanupTestDatabase } from '@/lib/test-utils'

describe('/api/hs/customers integration tests', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })
  
  afterAll(async () => {
    await cleanupTestDatabase()
  })
  
  it('should handle complete customer creation flow', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        // Create customer
        const createResponse = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Integration Test Customer',
            email: 'integration@test.com'
          })
        })
        
        expect(createResponse.status).toBe(201)
        
        const createData = await createResponse.json()
        const customerId = createData.data.id
        
        // Fetch created customer
        const getResponse = await fetch({
          method: 'GET'
        })
        
        const getData = await getResponse.json()
        const customer = getData.data.find((c: any) => c.id === customerId)
        
        expect(customer).toBeDefined()
        expect(customer.name).toBe('Integration Test Customer')
      }
    })
  })
})
```

## Performance Optimization

### Database Query Optimization
```typescript
// lib/services/customers.ts
export async function getCustomersOptimized(params: GetCustomersParams) {
  // Use database indexes and efficient queries
  const query = supabase
    .from('customers')
    .select(`
      id,
      name,
      email,
      phone,
      created_at,
      -- Only select needed fields
      ${params.includeAddress ? 'address,' : ''}
      ${params.includeNotes ? 'notes,' : ''}
      -- Include related data efficiently
      ${params.includeOrders ? `
        orders!inner (
          id,
          status,
          total,
          created_at
        )
      ` : ''}
    `)
    .eq('business_id', params.businessId)
    
  // Use database-level filtering and sorting
  if (params.search) {
    query.textSearch('search_vector', params.search)
  }
  
  if (params.status) {
    query.eq('status', params.status)
  }
  
  // Efficient pagination
  const offset = (params.page - 1) * params.pageSize
  query.range(offset, offset + params.pageSize - 1)
  
  // Use proper ordering with indexes
  query.order('created_at', { ascending: false })
  
  const { data, error, count } = await query
  
  if (error) throw error
  
  return {
    customers: data || [],
    total: count || 0
  }
}
```

### Response Caching
```typescript
// lib/api/caching.ts
interface CacheConfig {
  ttl: number
  tags: string[]
  revalidateOnStale?: boolean
}

export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig
): Promise<T> {
  return cache(async () => {
    const cached = await getCachedValue(key)
    
    if (cached && !isStale(cached, config.ttl)) {
      return cached.value
    }
    
    const fresh = await fetcher()
    await setCachedValue(key, fresh, config)
    
    return fresh
  }, [key])
}

// Usage in API routes
export async function GET(request: NextRequest) {
  const user = await validateAuth(request)
  
  const customers = await withCache(
    `customers:${user.businessId}:${searchParams.toString()}`,
    () => getCustomers({ businessId: user.businessId, ...params }),
    { ttl: 300, tags: ['customers'] } // 5 minute cache
  )
  
  return apiResponse({ data: customers })
}
```

## API Documentation

### OpenAPI Specification Generation
```typescript
// lib/api/openapi.ts
import { OpenAPIV3 } from 'openapi-types'

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Thorbis Business OS API',
    version: '1.0.0',
    description: 'Industry-specific business management APIs'
  },
  servers: [
    { url: 'https://api.thorbis.com', description: 'Production' },
    { url: 'https://staging-api.thorbis.com', description: 'Staging' },
    { url: 'http://localhost:3001', description: 'Development' }
  ],
  paths: {
    '/api/hs/customers': {
      get: {
        summary: 'List home services customers',
        tags: ['Home Services', 'Customers'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            name: 'pageSize', 
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CustomersResponse'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      CustomersResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Customer' }
          }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{ bearerAuth: [] }]
}
```

## Next Steps

After mastering API development:

1. **[Frontend Development](./04-frontend-development.md)**: Learn Next.js patterns and Odixe design system
2. **[Database Development](./05-database-development.md)**: Master PostgreSQL with RLS and multi-tenancy  
3. **[Testing Strategy](./06-testing-strategy.md)**: Implement comprehensive API testing
4. **[Performance Optimization](./07-performance-optimization.md)**: Optimize API performance and caching

## API Development Resources

### Tools and Libraries
- **OpenAPI Tools**: Swagger UI, Redoc, OpenAPI Generator
- **Testing Tools**: Jest, Supertest, Next.js API Testing
- **Validation**: Zod, Yup, Joi for schema validation
- **Documentation**: API docs generation and maintenance

### Best Practices
- **REST Guidelines**: Resource naming and HTTP method usage
- **Error Handling**: Consistent error response formats
- **Security**: Authentication, authorization, and input validation
- **Performance**: Caching strategies and query optimization

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Architecture Overview](./02-architecture-overview.md) | Next: [Frontend Development](./04-frontend-development.md)*