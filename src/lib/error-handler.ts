/**
 * Comprehensive Error Handling and Validation System
 * 
 * Provides standardized error handling, validation, and logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'
import { executeQuery } from './database'
import crypto from 'crypto'

// Error types and codes
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Business Logic
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // System
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // File/Media
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  
  // Payment/Billing
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED'
}

export interface ApiError {
  code: ErrorCode
  message: string
  details?: any
  field?: string
  timestamp: string
  requestId: string
  stack?: string
}

export class ThorbisApiError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: any
  public readonly field?: string
  public readonly requestId: string

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any,
    field?: string
  ) {
    super(message)
    this.name = 'ThorbisApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.field = field
    this.requestId = crypto.randomUUID()
    
    // Capture stack trace
    Error.captureStackTrace(this, ThorbisApiError)
  }

  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      field: this.field,
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    }
  }
}

// Predefined error factories
export const ErrorFactory = {
  unauthorized: (message = 'Authentication required') => 
    new ThorbisApiError(ErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (message = 'Insufficient permissions') => 
    new ThorbisApiError(ErrorCode.FORBIDDEN, message, 403),

  notFound: (resource = 'Resource', message?: string) => 
    new ThorbisApiError(
      ErrorCode.RESOURCE_NOT_FOUND, 
      message || '${resource} not found', 
      404
    ),

  conflict: (resource = 'Resource', message?: string) => 
    new ThorbisApiError(
      ErrorCode.RESOURCE_CONFLICT, 
      message || '${resource} already exists', 
      409
    ),

  validation: (message = 'Validation failed', details?: any, field?: string) => 
    new ThorbisApiError(ErrorCode.VALIDATION_ERROR, message, 400, details, field),

  businessRule: (message: string, details?: any) => 
    new ThorbisApiError(ErrorCode.BUSINESS_RULE_VIOLATION, message, 422, details),

  rateLimit: (message = 'Rate limit exceeded') => 
    new ThorbisApiError(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429),

  internal: (message = 'Internal server error', details?: any) => 
    new ThorbisApiError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details),

  database: (message = 'Database error`, details?: any) => 
    new ThorbisApiError(ErrorCode.DATABASE_ERROR, message, 500, details),

  externalService: (service: string, message?: string, details?: any) => 
    new ThorbisApiError(
      ErrorCode.EXTERNAL_SERVICE_ERROR, 
      message || `${service} service error', 
      502, 
      details
    )
}

/**
 * Error logging service
 */
class ErrorLogger {
  async logError(error: ThorbisApiError | Error, context: {
    businessId?: string
    userId?: string
    endpoint?: string
    method?: string
    userAgent?: string
    ip?: string
    body?: any
  }) {
    try {
      const errorData = {
        id: crypto.randomUUID(),
        error_code: error instanceof ThorbisApiError ? error.code : ErrorCode.INTERNAL_SERVER_ERROR,
        message: error.message,
        stack_trace: error.stack,
        business_id: context.businessId || null,
        user_id: context.userId || null,
        endpoint: context.endpoint || null,
        method: context.method || null,
        user_agent: context.userAgent || null,
        ip_address: context.ip || null,
        request_body: context.body ? JSON.stringify(context.body) : null,
        details: error instanceof ThorbisApiError ? JSON.stringify(error.details) : null,
        severity: this.getSeverity(error),
        created_at: new Date().toISOString()
      }

      // Log to database (use shared schema for cross-business error tracking)
      if (context.businessId) {
        await executeQuery(context.businessId, '
          INSERT INTO shared.error_logs (
            id, business_id, error_code, message, stack_trace, user_id, endpoint,
            method, user_agent, ip_address, request_body, details, severity, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ', Object.values(errorData))
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', {'
          code: errorData.error_code,
          message: errorData.message,
          endpoint: errorData.endpoint,
          stack: error.stack
        })
      }

      // Send to external monitoring service in production
      if (process.env.NODE_ENV === 'production' && process.env.ERROR_MONITORING_URL) {
        await this.sendToMonitoring(errorData)
      }

    } catch (loggingError) {
      console.error('Failed to log error:', loggingError)
    }
  }

  private getSeverity(error: ThorbisApiError | Error): 'low' | 'medium' | 'high' | 'critical' {
    if (error instanceof ThorbisApiError) {
      switch (error.code) {
        case ErrorCode.INTERNAL_SERVER_ERROR:
        case ErrorCode.DATABASE_ERROR:
          return 'critical'
        case ErrorCode.EXTERNAL_SERVICE_ERROR:
        case ErrorCode.BUSINESS_RULE_VIOLATION:
          return 'high'
        case ErrorCode.VALIDATION_ERROR:
        case ErrorCode.UNAUTHORIZED:
        case ErrorCode.FORBIDDEN:
          return 'medium'
        default:
          return 'low'
      }
    }
    return 'critical'
  }

  private async sendToMonitoring(errorData: unknown) {
    try {
      // Integrate with services like Sentry, DataDog, etc.
      await fetch(process.env.ERROR_MONITORING_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${process.env.ERROR_MONITORING_TOKEN}'
        },
        body: JSON.stringify(errorData)
      })
    } catch (error) {
      console.error('Failed to send error to monitoring service:', error)
    }
  }
}

export const errorLogger = new ErrorLogger()

/**
 * Request validation middleware
 */
export function validateRequest<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    try {
      const body = await request.json().catch(() => ({}))
      return schema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ThorbisApiError(
          ErrorCode.VALIDATION_ERROR,
          'Request validation failed',
          400,
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        )
      }
      throw error
    }
  }
}

/**
 * Query parameter validation
 */
export function validateQuery<T>(schema: ZodSchema<T>, searchParams: URLSearchParams): T {
  try {
    const params = Object.fromEntries(searchParams.entries())
    return schema.parse(params)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ThorbisApiError(
        ErrorCode.VALIDATION_ERROR,
        'Query parameter validation failed',
        400,
        error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      )
    }
    throw error
  }
}

/**
 * Global error handler wrapper for API routes
 */
export function withErrorHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (_error) {
      // Extract request context for logging
      const requestContext = {
        endpoint: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            undefined
      }

      // Log the error
      await errorLogger.logError(error as Error, requestContext)

      // Handle different error types
      if (error instanceof ThorbisApiError) {
        return NextResponse.json(
          { error: error.toJSON() },
          { status: error.statusCode }
        )
      }

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const validationError = new ThorbisApiError(
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          400,
          error.errors
        )
        return NextResponse.json(
          { error: validationError.toJSON() },
          { status: 400 }
        )
      }

      // Handle database errors
      if (error.message?.includes('duplicate key') || error.code === '23505') {
        const conflictError = new ThorbisApiError(
          ErrorCode.RESOURCE_CONFLICT,
          'Resource already exists',
          409
        )
        return NextResponse.json(
          { error: conflictError.toJSON() },
          { status: 409 }
        )
      }

      // Handle unknown errors
      const internalError = new ThorbisApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred',
        500,
        process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      )

      return NextResponse.json(
        { error: internalError.toJSON() },
        { status: 500 }
      )
    }
  }
}

/**
 * Business rule validation helpers
 */
export const BusinessRules = {
  requireActiveSubscription: (subscriptionStatus: string) => {
    if (subscriptionStatus !== 'active') {
      throw ErrorFactory.businessRule('Active subscription required to perform this action')
    }
  },

  requireCompletedOnboarding: (onboardingStatus: string) => {
    if (onboardingStatus !== 'completed') {
      throw ErrorFactory.businessRule('Complete onboarding process to access this feature')
    }
  },

  validateBusinessHours: (businessHours: unknown, requestedTime: Date) => {
    // Implementation for business hours validation
    // This is a placeholder for more complex business logic
  },

  validateIndustryAccess: (userIndustries: string[], requiredIndustry: string) => {
    if (!userIndustries.includes(requiredIndustry)) {
      throw ErrorFactory.forbidden('Access to ${requiredIndustry} industry is not permitted')
    }
  }
}

// Export types (classes and enums already exported above)