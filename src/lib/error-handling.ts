// Comprehensive error handling system for Thorbis Business OS
// Provides typed error handling, monitoring, and user-friendly error messages

import { ApiError, FormFieldError } from '@/types/industry-schemas'

// =============================================================================
// Custom Error Classes
// =============================================================================

export class BaseError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly context?: Record<string, unknown>
  public readonly timestamp: Date

  constructor(
    message: string,
    code: string,
    statusCode = 500,
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.context = context
    this.timestamp = new Date()

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    }
  }
}

export class ValidationError extends BaseError {
  public readonly fields: FormFieldError[]

  constructor(
    message: string,
    fields: FormFieldError[],
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', 400, context)
    this.fields = fields
  }
}

export class AuthenticationError extends BaseError {
  constructor(
    message = 'Authentication required',
    context?: Record<string, unknown>
  ) {
    super(message, 'AUTHENTICATION_ERROR', 401, context)
  }
}

export class AuthorizationError extends BaseError {
  constructor(
    message = 'Insufficient permissions',
    context?: Record<string, unknown>
  ) {
    super(message, 'AUTHORIZATION_ERROR', 403, context)
  }
}

export class NotFoundError extends BaseError {
  constructor(
    message = 'Resource not found',
    context?: Record<string, unknown>
  ) {
    super(message, 'NOT_FOUND_ERROR', 404, context)
  }
}

export class ConflictError extends BaseError {
  constructor(
    message = 'Resource conflict',
    context?: Record<string, unknown>
  ) {
    super(message, 'CONFLICT_ERROR', 409, context)
  }
}

export class RateLimitError extends BaseError {
  public readonly retryAfter?: number

  constructor(
    message = 'Rate limit exceeded',
    retryAfter?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, context)
    this.retryAfter = retryAfter
  }
}

export class ExternalServiceError extends BaseError {
  public readonly service: string
  public readonly originalError?: Error

  constructor(
    service: string,
    message: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(message, 'EXTERNAL_SERVICE_ERROR', 502, {
      ...context,
      service,
      originalMessage: originalError?.message,
    })
    this.service = service
    this.originalError = originalError
  }
}

// =============================================================================
// Error Monitoring and Reporting
// =============================================================================

interface ErrorReport {
  error: BaseError
  userId?: string
  sessionId?: string
  url: string
  userAgent: string
  additionalContext?: Record<string, unknown>
}

class ErrorMonitor {
  private errorQueue: ErrorReport[] = []
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  private maxQueueSize = 50

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for online/offline events
      window.addEventListener('online', this.flushErrorQueue.bind(this))
      window.addEventListener('offline', () => {
        this.isOnline = false
      })

      // Listen for unhandled errors
      window.addEventListener('error', this.handleUnhandledError.bind(this))
      window.addEventListener('unhandledrejection', this.handleUnhandledPromiseRejection.bind(this))
    }
  }

  public reportError(
    error: BaseError,
    additionalContext?: Record<string, unknown>
  ): void {
    const errorReport: ErrorReport = {
      error,
      url: typeof window !== 'undefined' ? window.location.href : ',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ',
      additionalContext,
    }

    // Add user/session info if available
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId')
      const sessionId = sessionStorage.getItem('sessionId')
      
      if (userId) errorReport.userId = userId
      if (sessionId) errorReport.sessionId = sessionId
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ${error.name}: ${error.code}')
      console.error('Message:', error.message)
      console.error('Status:', error.statusCode)
      if (error.context) console.error('Context:', error.context)
      if (additionalContext) console.error('Additional Context:', additionalContext)
      console.error('Stack:', error.stack)
      console.groupEnd()
    }

    // Queue for reporting to external service
    this.queueError(errorReport)
  }

  private queueError(errorReport: ErrorReport): void {
    // Add to queue
    this.errorQueue.push(errorReport)

    // Prevent memory leaks by limiting queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // Try to flush if online
    if (this.isOnline) {
      this.flushErrorQueue()
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return

    try {
      // Send errors to monitoring service
      await this.sendErrorReports(this.errorQueue)
      this.errorQueue = []
    } catch (error) {
      console.warn('Failed to send error reports:', error)
      // Keep errors in queue for retry
    }
  }

  private async sendErrorReports(reports: ErrorReport[]): Promise<void> {
    // In production, send to your error monitoring service (Sentry, LogRocket, etc.)
    const endpoint = '/api/errors'
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors: reports }),
      })

      if (!response.ok) {
        throw new Error('Failed to send error reports: ${response.status}')
      }
    } catch (_error) {
      throw error
    }
  }

  private handleUnhandledError(event: ErrorEvent): void {
    const error = new BaseError(
      event.message || 'Unhandled error',UNHANDLED_ERROR',
      500,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        originalError: event.error?.message,
      }
    )

    this.reportError(error)
  }

  private handleUnhandledPromiseRejection(event: PromiseRejectionEvent): void {
    const error = new BaseError(
      event.reason?.message || 'Unhandled promise rejection',UNHANDLED_PROMISE_REJECTION',
      500,
      {
        reason: event.reason,
      }
    )

    this.reportError(error)
  }
}

// Global error monitor instance
export const errorMonitor = new ErrorMonitor()

// =============================================================================
// Error Message Mapping
// =============================================================================

const ERROR_MESSAGES: Record<string, string> = {
  // Authentication & Authorization
  AUTHENTICATION_ERROR: 'Please sign in to continue',
  AUTHORIZATION_ERROR: 'You don\'t have permission to perform this action',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Your account has been temporarily locked',
  
  // Validation
  VALIDATION_ERROR: 'Please correct the highlighted fields',
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_FORMAT: 'Please check the format of your input',
  
  // Network & API
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later',
  SERVICE_UNAVAILABLE: 'This service is temporarily unavailable',
  TIMEOUT_ERROR: 'The request took too long. Please try again',
  
  // Business Logic
  NOT_FOUND_ERROR: 'The requested item could not be found',
  CONFLICT_ERROR: 'This action conflicts with existing data',
  DUPLICATE_ENTRY: 'This item already exists',
  INSUFFICIENT_FUNDS: 'Insufficient funds to complete this transaction',
  INVENTORY_SHORTAGE: 'Not enough items in stock',
  
  // Rate Limiting
  RATE_LIMIT_ERROR: 'Too many requests. Please wait before trying again',
  
  // External Services
  EXTERNAL_SERVICE_ERROR: 'External service is unavailable',
  PAYMENT_ERROR: 'Payment processing failed',
  EMAIL_DELIVERY_ERROR: 'Failed to send email',
  
  // File Operations
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  UNSUPPORTED_FILE_TYPE: 'This file type is not supported',
  
  // Default
  UNKNOWN_ERROR: 'An unexpected error occurred',
}

// =============================================================================
// Error Utilities
// =============================================================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof BaseError) {
    return ERROR_MESSAGES[error.code] || error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR
}

export function getUserFriendlyMessage(error: unknown): string {
  const message = getErrorMessage(error)
  
  // Remove technical jargon for user-facing messages
  return message
    .replace(/[^\w\s-]/g, '') // Remove error codes at the start
    .replace(/[^\w\s-]/g, '') // Remove technical details in parentheses
    .trim()
}

export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof BaseError)) return false
  
  const retryableCodes = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SERVER_ERROR',
    'SERVICE_UNAVAILABLE',
    'EXTERNAL_SERVICE_ERROR',
  ]
  
  return retryableCodes.includes(error.code)
}

export function shouldReportError(error: unknown): boolean {
  if (!(error instanceof BaseError)) return true
  
  // Don't report client-side validation errors
  const nonReportableCodes = [
    'VALIDATION_ERROR',
    'AUTHENTICATION_ERROR',
    'AUTHORIZATION_ERROR',
    'NOT_FOUND_ERROR',
  ]
  
  return !nonReportableCodes.includes(error.code)
}

// =============================================================================
// React Error Boundary Helpers
// =============================================================================

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: Record<string, unknown>
}

export function createErrorBoundaryState(): ErrorBoundaryState {
  return {
    hasError: false,
  }
}

export function handleErrorBoundaryError(
  error: Error,
  errorInfo: Record<string, unknown>
): ErrorBoundaryState {
  // Report error
  const baseError = new BaseError(
    error.message,
    'REACT_ERROR_BOUNDARY',
    500,
    errorInfo
  )
  
  errorMonitor.reportError(baseError)
  
  return {
    hasError: true,
    error,
    errorInfo,
  }
}

// =============================================================================
// API Error Response Helpers
// =============================================================================

export function createApiErrorResponse(
  error: BaseError,
  includeStack = false
): Response {
  const body: ApiError = {
    code: error.code,
    message: getUserFriendlyMessage(error),
  }

  if (error instanceof ValidationError) {
    body.details = { fields: error.fields }
  }

  if (includeStack && process.env.NODE_ENV === 'development') {
    body.details = { ...body.details, stack: error.stack }
  }

  return new Response(JSON.stringify({ 
    success: false, 
    errors: [body] 
  }), {
    status: error.statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function handleApiError(error: unknown): Response {
  if (error instanceof BaseError) {
    return createApiErrorResponse(error)
  }

  // Handle unknown errors
  const unknownError = new BaseError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500,
    { originalError: error instanceof Error ? error.message : String(error) }
  )

  errorMonitor.reportError(unknownError)
  return createApiErrorResponse(unknownError)
}