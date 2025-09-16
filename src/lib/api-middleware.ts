/**
 * Thorbis Business OS - Consolidated API Middleware
 * 
 * Centralized middleware for all API endpoints providing:
 * - Authentication & Authorization
 * - Rate limiting
 * - Request logging & metrics
 * - Error handling
 * - Response caching
 * - Security headers
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { isDemoMode, getDemoContext } from './demo-data'

// Types
export interface ApiContext {
  request: NextRequest
  businessId: string
  userId: string
  role: string
  industry: string
  permissions: string[]
  rateLimit: RateLimitResult
  requestId: string
  startTime: number
  demo?: {
    enabled: boolean
    industry: string
    session_id: string
    business_name: string
    data: unknown
  }
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: string
  retryAfter: number
}

interface ApiError {
  code: string
  message: string
  details?: any
  field?: string
  requestId: string
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// In-memory rate limiting (for development - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Schemas
const IndustrySchema = z.enum(['hs', 'rest', 'auto', 'ret', 'courses', 'payroll', 'lom'])
const MethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

/**
 * Main API middleware function
 */
export async function apiMiddleware(
  request: NextRequest,
  handler: (context: ApiContext) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requireIdempotency?: boolean
    industry?: string
    permissions?: string[]
    rateLimit?: {
      windowMs: number
      maxRequests: number
    }
  } = {}
): Promise<NextResponse> {
  const startTime = Date.now()
  const requestId = generateRequestId()
  
  try {
    // Extract industry from URL path
    const pathname = new URL(request.url).pathname
    const industry = extractIndustryFromPath(pathname)
    
    // Validate industry
    if (options.industry && industry !== options.industry) {
      return createErrorResponse({
        code: 'INVALID_INDUSTRY',
        message: 'Industry mismatch in request path',
        requestId
      }, 400)
    }

    // Check for demo mode first
    const demoContext = getDemoContext(request)
    
    // Authentication
    let businessId = '
    let userId = '
    let role = 'anonymous'
    let permissions: string[] = []

    if (demoContext) {
      // Demo mode - bypass authentication
      businessId = demoContext.business_id
      userId = demoContext.user_id
      role = 'demo_user'
      permissions = [
        'work_orders:read', 'work_orders:create',
        'estimates:read', 'estimates:create', 
        'invoices:read', 'invoices:create',
        'customers:read', 'employees:read',
        'lessons:read', 'orders:read',
        'menu_items:read', 'repair_orders:read'
      ]
    } else if (options.requireAuth !== false) {
      const authResult = await authenticateRequest(request)
      if (!authResult.success) {
        await logSecurityEvent({
          type: 'unauthorized_access_attempt',
          endpoint: pathname,
          method: request.method,
          ip: getClientIP(request),
          userAgent: request.headers.get('user-agent') || 'unknown',
          requestId
        })
        
        return createErrorResponse({
          code: 'AUTH_ERROR',
          message: authResult.error || 'Authentication required',
          requestId
        }, 401)
      }

      businessId = authResult.businessId
      userId = authResult.userId
      role = authResult.role
      permissions = authResult.permissions
    }

    // Permission check
    if (options.permissions?.length) {
      const hasPermission = options.permissions.some(permission => 
        permissions.includes(permission)
      )
      if (!hasPermission) {
        return createErrorResponse({
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions for this operation',
          requestId
        }, 403)
      }
    }

    // Rate limiting
    const rateLimitOptions = options.rateLimit || {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000
    }
    
    const rateLimit = await checkRateLimit(
      userId || getClientIP(request),
      pathname,
      rateLimitOptions
    )

    if (!rateLimit.allowed) {
      await recordMetric('thorbis_api_rate_limit_exceeded_total', 1, {
        industry,
        endpoint: pathname,
        user_id: userId
      })

      return createErrorResponse({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded',
        details: {
          limit: rateLimit.limit,
          resetAt: rateLimit.resetAt
        },
        requestId
      }, 429, {
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': rateLimit.resetAt,
        'Retry-After': String(rateLimit.retryAfter)
      })
    }

    // Idempotency check for write operations
    if (options.requireIdempotency && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const idempotencyKey = request.headers.get('idempotency-key')
      if (!idempotencyKey) {
        return createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Idempotency-Key header required for write operations',
          field: 'idempotency-key',
          requestId
        }, 400)
      }

      // Check for duplicate request (simplified in-memory implementation)
      const existingResult = await checkIdempotencyKey(businessId, idempotencyKey)
      if (existingResult) {
        return new NextResponse(JSON.stringify(existingResult), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Idempotency-Key': idempotencyKey,
            'X-Idempotency-Status': 'duplicate',
            'X-Request-ID': requestId
          }
        })
      }
    }

    // Create API context
    const context: ApiContext = {
      request,
      businessId,
      userId,
      role,
      industry,
      permissions,
      rateLimit,
      requestId,
      startTime,
      demo: demoContext ? {
        enabled: true,
        industry: demoContext.industry,
        session_id: demoContext.session_id,
        business_name: demoContext.business_name,
        data: demoContext.data
      } : undefined
    }

    // Execute handler
    const response = await handler(context)
    
    // Add standard headers
    response.headers.set('X-Request-ID', requestId)
    response.headers.set('X-Industry', industry)
    response.headers.set('X-API-Version', '2.0.0')
    response.headers.set('X-RateLimit-Limit', String(rateLimit.limit))
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining))
    response.headers.set('X-RateLimit-Reset', rateLimit.resetAt)
    
    // Add demo mode headers
    if (demoContext) {
      response.headers.set('X-Demo-Mode', 'true')
      response.headers.set('X-Demo-Industry', demoContext.industry)
      response.headers.set('X-Demo-Session', demoContext.session_id)
      response.headers.set('X-Demo-Business', demoContext.business_name)
    }

    // Record metrics
    const responseTime = Date.now() - startTime
    await recordMetric('thorbis_api_request_duration_seconds', responseTime / 1000, {
      method: request.method,
      industry,
      endpoint: pathname,
      status: String(response.status),
      user_id: userId
    })

    await recordMetric('thorbis_api_requests_total', 1, {
      method: request.method,
      industry,
      endpoint: pathname,
      status: String(response.status)
    })

    return response

  } catch (_error) {
    const responseTime = Date.now() - startTime
    
    await logError('api_middleware_error', error as Error, {
      endpoint: new URL(request.url).pathname,
      method: request.method,
      responseTimeMs: responseTime,
      requestId
    })

    await recordMetric('thorbis_api_errors_total', 1, {
      method: request.method,
      endpoint: new URL(request.url).pathname,
      errorType: (error as Error).name || 'unknown'
    })

    return createErrorResponse({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      requestId
    }, 500)
  }
}

/**
 * Authentication helper
 */
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { success: false, error: 'Invalid authorization header' }
  }

  const token = authHeader.substring(7)
  
  try {
    // Validate JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return { success: false, error: 'Invalid token' }
    }

    // Mock business context for now (would be real database lookup)
    return {
      success: true,
      businessId: 'biz_123',
      userId: user.id,
      role: 'manager',
      permissions: ['work_orders:read', 'work_orders:create', 'customers:read'],
      industry: 'hs'
    }
  } catch (_error) {
    return { success: false, error: 'Token validation failed` }
  }
}

/**
 * Rate limiting (simplified in-memory implementation)
 */
async function checkRateLimit(
  identifier: string,
  endpoint: string,
  options: { windowMs: number; maxRequests: number }
): Promise<RateLimitResult> {
  const key = `${identifier}:${endpoint}`
  const now = Date.now()
  const windowStart = Math.floor(now / options.windowMs) * options.windowMs
  const windowEnd = windowStart + options.windowMs

  const current = rateLimitStore.get(key) || { count: 0, resetAt: windowEnd }
  
  // Reset if window has passed
  if (current.resetAt <= now) {
    current.count = 0
    current.resetAt = windowEnd
  }

  current.count++
  rateLimitStore.set(key, current)

  const remaining = Math.max(0, options.maxRequests - current.count)
  
  return {
    allowed: current.count <= options.maxRequests,
    limit: options.maxRequests,
    remaining,
    resetAt: new Date(current.resetAt).toISOString(),
    retryAfter: current.count > options.maxRequests ? Math.ceil((current.resetAt - now) / 1000) : 0
  }
}

/**
 * Idempotency check (simplified in-memory implementation)
 */
const idempotencyStore = new Map<string, { result: any; expiresAt: number }>()

async function checkIdempotencyKey(businessId: string, key: string) {
  const fullKey = `${businessId}:${key}'
  const stored = idempotencyStore.get(fullKey)
  
  if (stored && stored.expiresAt > Date.now()) {
    return stored.result
  }
  
  if (stored && stored.expiresAt <= Date.now()) {
    idempotencyStore.delete(fullKey)
  }
  
  return null
}

/**
 * Store idempotency result
 */
export async function storeIdempotencyResult(
  businessId: string, 
  key: string, result: unknown,
  ttlSeconds = 3600
) {
  const fullKey = '${businessId}:${key}'
  const expiresAt = Date.now() + (ttlSeconds * 1000)
  
  idempotencyStore.set(fullKey, { result, expiresAt })
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    const now = Date.now()
    for (const [key, value] of idempotencyStore.entries()) {
      if (value.expiresAt <= now) {
        idempotencyStore.delete(key)
      }
    }
  }
}

/**
 * Utility functions
 */
function extractIndustryFromPath(pathname: string): string {
  // Extract industry from paths like /api/v2/hs/... or /api/hs/...
  const match = pathname.match(/^\/api\/(?:v2\/)?([^\/]+)/) || pathname.match(/^\/data\/api\/([^\/]+)/)
  return match?.[1] || 'unknown'
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         request.ip ||
         'unknown'
}

function generateRequestId(): string {
  return 'req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}'
}

function createErrorResponse(
  error: ApiError, 
  status: number, 
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  return NextResponse.json(
    { error },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': error.requestId,
        ...additionalHeaders
      }
    }
  )
}

/**
 * Logging and metrics (simplified implementations)
 */
async function logSecurityEvent(event: unknown) {
  console.log('🔒 Security Event:`, event)
}

async function recordMetric(name: string, value: number, labels: unknown) {
  console.log(`📊 Metric: ${name} = ${value}', labels)
}

async function logError(type: string, error: Error, context: unknown) {
  console.error('❌ ${type}:', error.message, context)
}