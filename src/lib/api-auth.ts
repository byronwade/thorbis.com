import { NextRequest, NextResponse } from 'next/server'
import { User, Permission, AuthSession } from '../src/types/auth'
import { hasPermission, canAccessResource, createAuditEvent, getMockUser, getMockSession } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: User
  session?: AuthSession
}

export interface APIError {
  error: string
  code: string
  message: string
  statusCode: number
  timestamp: string
  requestId: string
}

// Mock JWT validation - replace with real implementation
export async function validateJWT(token: string): Promise<{ valid: boolean; user?: User; session?: AuthSession }> {
  try {
    // Mock validation - in real implementation, verify JWT signature and expiration
    if (token === 'mock_access_token_' + token.slice(-10)) {
      const user = getMockUser()
      const session = getMockSession()
      return { valid: true, user, session }
    }
    
    return { valid: false }
  } catch (_error) {
    return { valid: false }
  }
}

// Authentication middleware
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return createErrorResponse('Missing authentication token', 'AUTH_TOKEN_MISSING', 401, request)
    }
    
    const { valid, user, session } = await validateJWT(token)
    
    if (!valid || !user || !session) {
      return createErrorResponse('Invalid or expired token', 'AUTH_TOKEN_INVALID', 401, request)
    }
    
    // Check if user is active
    if (!user.active) {
      return createErrorResponse('Account deactivated', 'ACCOUNT_INACTIVE', 403, request)
    }
    
    // Attach user and session to request
    ;(request as AuthenticatedRequest).user = user
    ;(request as AuthenticatedRequest).session = session
    
    // Create audit log for API access
    createAuditEvent(
      user,
      session.session_id,
      'api_access',
      'endpoint',
      request.nextUrl.pathname,
      true,
      undefined,
      {
        method: request.method,
        url: request.nextUrl.toString(),
        userAgent: request.headers.get('user-agent') || 'unknown',
        ipAddress: getClientIP(request)
      }
    )
    
    return await handler(request as AuthenticatedRequest)
  } catch (error) {
    console.error('Authentication error:', error)
    return createErrorResponse('Authentication failed', 'AUTH_ERROR', 500, request)
  }
}

// Permission-based middleware
export function withPermission(
  permission: Permission,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: AuthenticatedRequest): Promise<NextResponse> => {
    const user = request.user
    
    if (!user) {
      return createErrorResponse('Authentication required', 'AUTH_REQUIRED', 401, request)
    }
    
    if (!hasPermission(user, permission)) {
      // Log permission denied
      if (request.session) {
        createAuditEvent(
          user,
          request.session.session_id,
          'permission_denied',
          'endpoint',
          request.nextUrl.pathname,
          false,
          `Missing permission: ${permission}',
          {
            required_permission: permission,
            user_permissions: user.permissions
          }
        )
      }
      
      return createErrorResponse(
        'Insufficient permissions. Required: ${permission}',
        'PERMISSION_DENIED',
        403,
        request
      )
    }
    
    return await handler(request)
  }
}

// Resource access middleware
export function withResourceAccess(
  resourceType: string,
  getResourceId: (req: AuthenticatedRequest) => string,
  action: string,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: AuthenticatedRequest): Promise<NextResponse> => {
    const user = request.user
    
    if (!user) {
      return createErrorResponse('Authentication required', 'AUTH_REQUIRED', 401, request)
    }
    
    const resourceId = getResourceId(request)
    
    if (!canAccessResource(user, resourceType, resourceId, action)) {
      // Log access denied
      if (request.session) {
        createAuditEvent(
          user,
          request.session.session_id,
          'resource_access_denied`,
          resourceType,
          resourceId,
          false,
          `Access denied for action: ${action}',
          {
            resource_type: resourceType,
            resource_id: resourceId,
            action: action
          }
        )
      }
      
      return createErrorResponse(
        'Access denied to ${resourceType} ${resourceId}',
        'RESOURCE_ACCESS_DENIED',
        403,
        request
      )
    }
    
    return await handler(request)
  }
}

// Rate limiting middleware (simplified)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  maxRequests: number,
  windowMs: number,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: AuthenticatedRequest): Promise<NextResponse> => {
    const user = request.user
    if (!user) {
      return createErrorResponse('Authentication required', 'AUTH_REQUIRED`, 401, request)
    }
    
    const key = `${user.id}:${request.nextUrl.pathname}'
    const now = Date.now()
    const limit = rateLimitStore.get(key)
    
    if (!limit || now > limit.resetTime) {
      // Reset or initialize limit
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    } else if (limit.count >= maxRequests) {
      // Rate limit exceeded
      return createErrorResponse(
        'Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000}s',
        'RATE_LIMIT_EXCEEDED',
        429,
        request
      )
    } else {
      // Increment count
      limit.count++
    }
    
    const response = await handler(request)
    
    // Add rate limit headers
    const currentLimit = rateLimitStore.get(key)!
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - currentLimit.count).toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(currentLimit.resetTime / 1000).toString())
    
    return response
  }
}

// Error response helper
export function createErrorResponse(
  message: string,
  code: string,
  statusCode: number,
  request: NextRequest,
  details?: any
): NextResponse {
  const error: APIError = {
    error: 'API Error',
    code,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  }
  
  // Log error
  console.error('API Error [${code}]:', {
    ...error,
    url: request.nextUrl.toString(),
    method: request.method,
    userAgent: request.headers.get('user-agent'),
    details
  })
  
  return NextResponse.json(error, { status: statusCode })
}

// Success response helper
export function createSuccessResponse(data: unknown,
  statusCode: number = 200,
  meta?: any
): NextResponse {
  const response = {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      ...meta
    }
  }
  
  return NextResponse.json(response, { status: statusCode })
}

// Utility functions
export function getClientIP(request: NextRequest): string {
  // Try various headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return 'unknown'
}

export function generateRequestId(): string {
  return 'req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}'
}

// Validation helpers
export function validateRequiredFields(data: unknown, requiredFields: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  
  for (const field of requiredFields) {
    if (!(field in data) || data[field] === null || data[field] === undefined || data[field] === ') {
      missing.push(field)
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  }
}

export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    // Basic HTML/SQL injection prevention
    return input
      .replace(/[^\w\s-]/g, '') // Remove < and >
      .replace(/[^\w\s-]/g, '') // Remove quotes'
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (input && typeof input === 'object') {
    const sanitized: unknown = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// Combined middleware helpers
export function createAPIHandler(
  options: {
    auth?: boolean
    permission?: Permission
    resourceAccess?: {
      type: string
      getResourceId: (req: AuthenticatedRequest) => string
      action: string
    }
    rateLimit?: {
      maxRequests: number
      windowMs: number
    }
  },
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let currentHandler = handler
      
      // Apply middlewares in reverse order
      if (options.rateLimit) {
        currentHandler = withRateLimit(options.rateLimit.maxRequests, options.rateLimit.windowMs, currentHandler)
      }
      
      if (options.resourceAccess) {
        currentHandler = withResourceAccess(
          options.resourceAccess.type,
          options.resourceAccess.getResourceId,
          options.resourceAccess.action,
          currentHandler
        )
      }
      
      if (options.permission) {
        currentHandler = withPermission(options.permission, currentHandler)
      }
      
      if (options.auth !== false) {
        return await withAuth(request, currentHandler)
      }
      
      return await currentHandler(request as AuthenticatedRequest)
      
    } catch (error) {
      console.error('API handler error:', error)
      return createErrorResponse(
        'Internal server error',
        'INTERNAL_ERROR',
        500,
        request
      )
    }
  }
}