/**
 * Comprehensive API Middleware Wrapper
 * Combines authentication, rate limiting, audit logging, and standardized responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthContext, AuthMiddlewareOptions } from './api-auth-middleware';
import { createSuccessResponse, createErrorResponse, ApiErrorCode } from './api-response-utils';
import crypto from 'crypto';

export interface ApiHandlerOptions extends AuthMiddlewareOptions {
  // Rate limiting
  rateLimit?: {
    windowMs: number;          // Time window in milliseconds
    maxRequests: number;       // Max requests per window
    skipSuccessfulRequests?: boolean;
    keyGenerator?: (request: NextRequest, context: AuthContext) => string;
  };
  
  // Idempotency
  requireIdempotency?: boolean;
  idempotencyTtlMs?: number;   // How long to store idempotency keys
  
  // Audit logging
  auditLog?: boolean;
  auditConfig?: {
    includeRequestBody?: boolean;
    includeResponseBody?: boolean;
    logLevel?: 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Caching
  cache?: {
    ttlMs: number;
    keyGenerator?: (request: NextRequest, context: AuthContext) => string;
    varyByUser?: boolean;
  };
  
  // Response configuration
  responseConfig?: {
    usageCost?: number;
    usageUnits?: string;
    customHeaders?: Record<string, string>;
  };
}

export interface ApiHandler<TRequest = any, TResponse = any> {
  (request: NextRequest, context: AuthContext, parsedBody?: TRequest): Promise<TResponse>;
}

/**
 * Simple in-memory stores for development
 * In production, use Redis or similar
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const idempotencyStore = new Map<string, { response: unknown; createdAt: number }>();
const cacheStore = new Map<string, { data: unknown; createdAt: number; ttl: number }>();

/**
 * Rate limiting implementation
 */
async function checkRateLimit(
  request: NextRequest,
  context: AuthContext,
  config: NonNullable<ApiHandlerOptions['rateLimit']>
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = config.keyGenerator 
    ? config.keyGenerator(request, context)
    : '${context.businessId || 'anonymous'}:${request.url}';
  
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // Get or create rate limit entry
  const entry = rateLimitStore.get(key) || { count: 0, resetTime: now + config.windowMs };
  
  // Reset if window expired
  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + config.windowMs;
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: entry.resetTime 
    };
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return { 
    allowed: true, 
    remaining: config.maxRequests - entry.count, 
    resetTime: entry.resetTime 
  };
}

/**
 * Idempotency checking
 */
async function checkIdempotency(
  request: NextRequest,
  context: AuthContext,
  ttlMs: number
): Promise<{ isRetry: boolean; existingResponse?: any }> {
  const idempotencyKey = request.headers.get('idempotency-key');
  
  if (!idempotencyKey) {
    return { isRetry: false };
  }
  
  const key = '${context.businessId}:${idempotencyKey}';
  const entry = idempotencyStore.get(key);
  
  if (!entry) {
    return { isRetry: false };
  }
  
  // Check if entry is still valid
  if (Date.now() - entry.createdAt > ttlMs) {
    idempotencyStore.delete(key);
    return { isRetry: false };
  }
  
  return { isRetry: true, existingResponse: entry.response };
}

/**
 * Store idempotency response
 */
function storeIdempotencyResponse(
  request: NextRequest,
  context: AuthContext, response: unknown): void {
  const idempotencyKey = request.headers.get('idempotency-key');
  
  if (idempotencyKey) {
    const key = '${context.businessId}:${idempotencyKey}';
    idempotencyStore.set(key, {
      response,
      createdAt: Date.now()
    });
  }
}

/**
 * Cache checking and storage
 */
async function checkCache(
  request: NextRequest,
  context: AuthContext,
  config: NonNullable<ApiHandlerOptions['cache']>
): Promise<{ hit: boolean; data?: any }> {
  const key = config.keyGenerator
    ? config.keyGenerator(request, context)
    : '${config.varyByUser ? context.businessId : 'global'}:${request.url}';
  
  const entry = cacheStore.get(key);
  
  if (!entry) {
    return { hit: false };
  }
  
  // Check if expired
  if (Date.now() - entry.createdAt > entry.ttl) {
    cacheStore.delete(key);
    return { hit: false };
  }
  
  return { hit: true, data: entry.data };
}

/**
 * Store data in cache
 */
function storeCache(
  request: NextRequest,
  context: AuthContext, data: unknown,
  config: NonNullable<ApiHandlerOptions['cache']>
): void {
  const key = config.keyGenerator
    ? config.keyGenerator(request, context)
    : '${config.varyByUser ? context.businessId : 'global'}:${request.url}';
  
  cacheStore.set(key, {
    data,
    createdAt: Date.now(),
    ttl: config.ttlMs
  });
}

/**
 * Audit logging function
 */
async function logApiAccess(
  request: NextRequest,
  context: AuthContext,
  config: NonNullable<ApiHandlerOptions['auditConfig']>,
  responseData?: any,
  error?: any
): Promise<void> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    userId: context.userId,
    businessId: context.businessId,
    role: context.role,
    industry: context.industry,
    requestBody: config.includeRequestBody ? 'REDACTED' : undefined, // Would parse and redact sensitive data
    responseStatus: error ? 'error' : 'success',
    responseBody: config.includeResponseBody ? 'REDACTED' : undefined,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
    logLevel: config.logLevel || 'medium'
  };
  
  // In production, send to logging service
  console.log('[API_AUDIT]', JSON.stringify(logEntry));
}

/**
 * Main API middleware wrapper
 */
export function withApiMiddleware<TRequest = any, TResponse = any>(
  handler: ApiHandler<TRequest, TResponse>,
  options: ApiHandlerOptions = {}
) {
  return async function wrappedHandler(request: NextRequest): Promise<NextResponse> {
    const startTime = performance.now();
    let authContext: AuthContext | undefined;
    let cacheHit = false;
    
    try {
      // 1. Authentication
      const authResult = await authenticateRequest(request, options);
      
      if (!authResult.success) {
        return NextResponse.json(authResult.errorResponse, { status: 401 });
      }
      
      authContext = authResult.authContext!;
      
      // 2. Rate limiting
      if (options.rateLimit) {
        const rateLimitResult = await checkRateLimit(request, authContext, options.rateLimit);
        
        if (!rateLimitResult.allowed) {
          const response = NextResponse.json(
            createErrorResponse(
              ApiErrorCode.RATE_LIMIT_EXCEEDED,
              'Rate limit exceeded',
              {
                retryAfterSeconds: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
                rateLimitReset: new Date(rateLimitResult.resetTime).toISOString()
              }
            ),
            { status: 429 }
          );
          
          response.headers.set('X-RateLimit-Limit', options.rateLimit.maxRequests.toString());
          response.headers.set('X-RateLimit-Remaining', '0');
          response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
          
          return response;
        }
        
        // Set rate limit headers for successful requests
        const responseHeaders = {
          'X-RateLimit-Limit': options.rateLimit.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        };
      }
      
      // 3. Idempotency check
      if (options.requireIdempotency && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const idempotencyKey = request.headers.get('idempotency-key');
        
        if (!idempotencyKey) {
          return NextResponse.json(
            createErrorResponse(
              ApiErrorCode.IDEMPOTENCY_KEY_REQUIRED,
              'Idempotency key required for write operations',
              {
                suggestedAction: 'Add an Idempotency-Key header with a unique identifier',
                documentationUrl: 'https://thorbis.com/docs/api/idempotency'
              }
            ),
            { status: 400 }
          );
        }
        
        const idempotencyResult = await checkIdempotency(
          request,
          authContext,
          options.idempotencyTtlMs || 24 * 60 * 60 * 1000 // 24 hours default
        );
        
        if (idempotencyResult.isRetry) {
          return NextResponse.json(idempotencyResult.existingResponse);
        }
      }
      
      // 4. Cache check (GET requests only)
      if (request.method === 'GET' && options.cache) {
        const cacheResult = await checkCache(request, authContext, options.cache);
        
        if (cacheResult.hit) {
          cacheHit = true;
          const processingTimeMs = performance.now() - startTime;
          
          return NextResponse.json(
            createSuccessResponse(
              cacheResult.data,
              processingTimeMs,
              {
                cacheStatus: 'hit',
                cacheTtl: options.cache.ttlMs,
                usageCost: 0, // Cached responses are free
                usageUnits: 'cache_hit'
              }
            )
          );
        }
      }
      
      // 5. Parse request body for non-GET requests
      let parsedBody;
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          parsedBody = await request.json();
        } catch (_error) {
          return NextResponse.json(
            createErrorResponse(
              ApiErrorCode.VALIDATION_ERROR,
              'Invalid JSON in request body'
            ),
            { status: 400 }
          );
        }
      }
      
      // 6. Execute main handler
      const handlerResult = await handler(request, authContext, parsedBody);
      
      // 7. Create standardized response
      const processingTimeMs = performance.now() - startTime;
      
      const response = createSuccessResponse(
        handlerResult,
        processingTimeMs,
        {
          cacheStatus: cacheHit ? 'hit' : 'miss',
          usageCost: options.responseConfig?.usageCost || 0.001,
          usageUnits: options.responseConfig?.usageUnits || 'api_call'
        }
      );
      
      // 8. Store in cache if configured
      if (request.method === 'GET' && options.cache && !cacheHit) {
        storeCache(request, authContext, handlerResult, options.cache);
      }
      
      // 9. Store idempotency response if needed
      if (options.requireIdempotency && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        storeIdempotencyResponse(request, authContext, response);
      }
      
      // 10. Audit logging
      if (options.auditLog) {
        await logApiAccess(
          request,
          authContext,
          options.auditConfig || {},
          handlerResult
        );
      }
      
      // 11. Create NextResponse with custom headers
      const nextResponse = NextResponse.json(response);
      
      // Add custom headers
      if (options.responseConfig?.customHeaders) {
        Object.entries(options.responseConfig.customHeaders).forEach(([key, value]) => {
          nextResponse.headers.set(key, value);
        });
      }
      
      return nextResponse;
      
    } catch (error) {
      console.error('API middleware error:', error);
      
      // Audit log error
      if (options.auditLog && authContext) {
        await logApiAccess(
          request,
          authContext,
          options.auditConfig || {},
          undefined,
          error
        );
      }
      
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          'Internal server error',
          {
            details: error instanceof Error ? error.message : 'Unknown error'
          }
        ),
        { status: 500 }
      );
    }
  };
}

/**
 * Convenience wrapper for common API patterns
 */
export const ApiPatterns = {
  /**
   * Public API endpoint (no authentication required)
   */
  public: (handler: ApiHandler) => withApiMiddleware(handler, {
    requireAuth: false,
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
    auditLog: true,
    auditConfig: { logLevel: 'low' }
  }),
  
  /**
   * Protected API endpoint (authentication required)
   */
  protected: (handler: ApiHandler) => withApiMiddleware(handler, {
    requireAuth: true,
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 1000 }, // 1000 requests per 15 minutes for authenticated users
    auditLog: true,
    auditConfig: { logLevel: 'medium' }
  }),
  
  /**
   * Admin API endpoint (admin permissions required)
   */
  admin: (handler: ApiHandler) => withApiMiddleware(handler, {
    requireAuth: true,
    allowedRoles: ['owner', 'manager'],
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 500 },
    auditLog: true,
    auditConfig: { logLevel: 'high' }
  }),
  
  /**
   * Write operation endpoint (requires idempotency)
   */
  write: (handler: ApiHandler) => withApiMiddleware(handler, {
    requireAuth: true,
    requireIdempotency: true,
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 200 },
    auditLog: true,
    auditConfig: { logLevel: 'high', includeRequestBody: true }
  }),
  
  /**
   * Cached read endpoint
   */
  cached: (handler: ApiHandler, ttlMs: number = 5 * 60 * 1000) => withApiMiddleware(handler, {
    requireAuth: true,
    cache: { ttlMs, varyByUser: true },
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 2000 },
    auditLog: false // Don't audit cached responses
  })
};