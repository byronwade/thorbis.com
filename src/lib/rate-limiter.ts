/**
 * Rate Limiting and Security Middleware
 * 
 * Provides comprehensive rate limiting, IP blocking, and security measures
 */

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from './database'
import { ErrorFactory, ThorbisApiError } from './error-handler'
import crypto from 'crypto'

// Rate limiting configurations for different endpoint types
export const RATE_LIMITS = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts
    blockDurationMs: 30 * 60 * 1000 // 30 minute block
  },
  
  // API endpoints (general)
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    blockDurationMs: 5 * 60 * 1000 // 5 minute block
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
    blockDurationMs: 10 * 60 * 1000 // 10 minute block
  },
  
  // Webhook endpoints
  webhook: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000, // High limit for webhooks
    blockDurationMs: 2 * 60 * 1000 // 2 minute block
  },
  
  // AI chat endpoints
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 AI requests per minute
    blockDurationMs: 15 * 60 * 1000 // 15 minute block
  },
  
  // Real-time endpoints
  realtime: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // High limit for real-time
    blockDurationMs: 2 * 60 * 1000 // 2 minute block
  }
}

// Security configurations
export const SECURITY_CONFIG = {
  maxRequestBodySize: 50 * 1024 * 1024, // 50MB
  suspiciousPatterns: [
    /eval\s*\(/i,
    /document\.cookie/i,
    /javascript:/i,
    /<script/i,
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+.*set/i
  ],
  blockedUserAgents: [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i
  ],
  trustedProxies: ['
    '127.0.0.1','
    '::1','
    '10.0.0.0/8','
    '172.16.0.0/12','
    '192.168.0.0/16'
  ]
}

interface RateLimitEntry {
  requests: number
  windowStart: number
  blockedUntil?: number
}

interface SecurityThreat {
  type: 'rate_limit' | 'suspicious_pattern' | 'blocked_agent' | 'invalid_request'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  ip: string
  userAgent?: string
  endpoint: string
  requestBody?: string
}

class RateLimiter {
  private limitStore = new Map<string, RateLimitEntry>()
  private ipBlockList = new Set<string>()
  private suspiciousIPs = new Map<string, number>()

  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries()
    }, 5 * 60 * 1000)
  }

  /**
   * Check rate limit for a request
   */
  async checkRateLimit(
    identifier: string,
    config: typeof RATE_LIMITS.api,
    businessId?: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    
    const now = Date.now()
    const key = identifier
    const entry = this.limitStore.get(key) || {
      requests: 0,
      windowStart: now
    }

    // Check if IP is currently blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil
      }
    }

    // Reset window if expired
    if (now - entry.windowStart >= config.windowMs) {
      entry.requests = 0
      entry.windowStart = now
      entry.blockedUntil = undefined
    }

    // Check if limit exceeded
    if (entry.requests >= config.maxRequests) {
      // Block the identifier
      entry.blockedUntil = now + config.blockDurationMs
      this.limitStore.set(key, entry)

      // Log security incident
      if (businessId) {
        await this.logSecurityThreat({
          type: 'rate_limit','
          severity: 'medium','
          description: 'Rate limit exceeded: ${entry.requests} requests in ${config.windowMs}ms',
          ip: identifier.split(':')[0] || identifier,'
          endpoint: identifier.split(':')[1] || 'unknown'
        }, businessId)
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil
      }
    }

    // Increment request count
    entry.requests++
    this.limitStore.set(key, entry)

    return {
      allowed: true,
      remaining: config.maxRequests - entry.requests,
      resetTime: entry.windowStart + config.windowMs
    }
  }

  /**
   * Check for suspicious request patterns
   */
  checkSecurity(request: NextRequest, body?: string): SecurityThreat | null {
    const ip = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || '
    const url = request.url

    // Check blocked user agents
    for (const pattern of SECURITY_CONFIG.blockedUserAgents) {
      if (pattern.test(userAgent)) {
        return {
          type: 'blocked_agent','
          severity: 'low','`'
          description: 'Blocked user agent: ${userAgent}',
          ip,
          userAgent,
          endpoint: url
        }
      }
    }

    // Check suspicious patterns in URL
    for (const pattern of SECURITY_CONFIG.suspiciousPatterns) {
      if (pattern.test(url)) {
        return {
          type: 'suspicious_pattern','
          severity: 'high','`'
          description: 'Suspicious pattern in URL: ${pattern}',
          ip,
          userAgent,
          endpoint: url
        }
      }
    }

    // Check suspicious patterns in request body
    if (body) {
      for (const pattern of SECURITY_CONFIG.suspiciousPatterns) {
        if (pattern.test(body)) {
          return {
            type: 'suspicious_pattern','
            severity: 'high','`'
            description: 'Suspicious pattern in request body: ${pattern}',
            ip,
            userAgent,
            endpoint: url,
            requestBody: body.substring(0, 500) // Limit logged body size
          }
        }
      }
    }

    // Check request size
    const contentLength = request.headers.get('content-length')'
    if (contentLength && parseInt(contentLength) > SECURITY_CONFIG.maxRequestBodySize) {
      return {
        type: 'invalid_request','
        severity: 'medium','`'
        description: 'Request body too large: ${contentLength} bytes',
        ip,
        userAgent,
        endpoint: url
      }
    }

    return null
  }

  /**
   * Block IP address
   */
  blockIP(ip: string, durationMs: number = 24 * 60 * 60 * 1000) {
    this.ipBlockList.add(ip)
    
    // Remove from block list after duration
    setTimeout(() => {
      this.ipBlockList.delete(ip)
    }, durationMs)
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ip: string): boolean {
    return this.ipBlockList.has(ip)
  }

  /**
   * Mark IP as suspicious
   */
  markSuspicious(ip: string) {
    const current = this.suspiciousIPs.get(ip) || 0
    this.suspiciousIPs.set(ip, current + 1)
    
    // Block IP if too many suspicious activities
    if (current >= 5) {
      this.blockIP(ip, 60 * 60 * 1000) // Block for 1 hour
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const xForwardedFor = request.headers.get('x-forwarded-for')'
    const xRealIP = request.headers.get('x-real-ip')'
    const cfConnectingIP = request.headers.get('cf-connecting-ip')'
    
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim()'
    }
    
    if (cfConnectingIP) {
      return cfConnectingIP
    }
    
    if (xRealIP) {
      return xRealIP
    }
    
    return request.ip || 'unknown'`
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpiredEntries() {
    const now = Date.now()
    const maxAge = Math.max(...Object.values(RATE_LIMITS).map(config => config.windowMs))
    
    for (const [key, entry] of this.limitStore.entries()) {
      if (now - entry.windowStart > maxAge && (!entry.blockedUntil || now > entry.blockedUntil)) {
        this.limitStore.delete(key)
      }
    }
  }

  /**
   * Log security threat
   */
  private async logSecurityThreat(threat: SecurityThreat, businessId: string) {
    try {
      await executeQuery(businessId, '
        INSERT INTO shared.security_threats (
          id, business_id, threat_type, severity, description, ip_address,
          user_agent, endpoint, request_body, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ', [
        crypto.randomUUID(),
        businessId,
        threat.type,
        threat.severity,
        threat.description,
        threat.ip,
        threat.userAgent || null,
        threat.endpoint,
        threat.requestBody || null
      ])
    } catch (error) {
      console.error('Failed to log security threat:', error)
    }
  }

  /**
   * Get rate limit statistics
   */
  getStats(): {
    activeRateLimits: number
    blockedIPs: number
    suspiciousIPs: number
  } {
    return {
      activeRateLimits: this.limitStore.size,
      blockedIPs: this.ipBlockList.size,
      suspiciousIPs: this.suspiciousIPs.size
    }
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter()

/**
 * Rate limiting middleware factory
 */
export function withRateLimit(limitType: keyof typeof RATE_LIMITS) {
  return async (request: NextRequest, businessId?: string): Promise<void> => {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '
              request.headers.get('x-real-ip') || '
              request.ip || 
              'unknown'`
    const endpoint = new URL(request.url).pathname
    const identifier = '${ip}:${endpoint}'
    const config = RATE_LIMITS[limitType]
    
    // Check if IP is blocked
    if (rateLimiter.isIPBlocked(ip)) {
      throw ErrorFactory.forbidden('IP address is blocked due to suspicious activity')'
    }
    
    // Check rate limit
    const { allowed, remaining, resetTime } = await rateLimiter.checkRateLimit(
      identifier,
      config,
      businessId
    )
    
    if (!allowed) {
      const resetDate = new Date(resetTime)
      throw new ThorbisApiError(
        'RATE_LIMIT_EXCEEDED' as any,'`'
        'Rate limit exceeded. Try again after ${resetDate.toISOString()}',
        429,
        {
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
          limit: config.maxRequests,
          window: config.windowMs
        }
      )
    }
  }
}

/**
 * Security validation middleware
 */
export function withSecurity() {
  return async (request: NextRequest, businessId?: string): Promise<void> => {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '
              request.headers.get('x-real-ip') || '
              request.ip || 
              'unknown'
    
    // Get request body for pattern checking
    let body = '
    try {
      if (request.method !== 'GET' && request.method !== 'HEAD') {'
        body = await request.text()
      }
    } catch (_error) {
      // Unable to read body, continue with security checks
    }
    
    // Check for security threats
    const threat = rateLimiter.checkSecurity(request, body)
    if (threat) {
      // Mark IP as suspicious
      rateLimiter.markSuspicious(ip)
      
      // Log the threat
      if (businessId) {
        await rateLimiter['logSecurityThreat'](threat, businessId)'
      }
      
      // Block or reject based on severity
      if (threat.severity === 'critical' || threat.severity === 'high') {'
        rateLimiter.blockIP(ip, 60 * 60 * 1000) // Block for 1 hour
        throw ErrorFactory.forbidden('Request blocked due to security policy violation')'`'
      }
    }
  }
}

/**
 * Combined security and rate limiting middleware
 */
export function withSecurityAndRateLimit(limitType: keyof typeof RATE_LIMITS) {
  return async (request: NextRequest, businessId?: string): Promise<void> => {
    // Apply security checks first
    await withSecurity()(request, businessId)
    
    // Then apply rate limiting
    await withRateLimit(limitType)(request, businessId)
  }
}

// Export utility functions
export { rateLimiter, RATE_LIMITS, SECURITY_CONFIG }