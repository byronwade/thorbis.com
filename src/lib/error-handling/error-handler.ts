import { 
  AppError, 
  ErrorDetails, 
  ErrorSeverity, 
  ErrorCategory,
  categorizeError,
  determineErrorSeverity,
  isAppError
} from './error-types'

// Error handler configuration
interface ErrorHandlerConfig {
  logErrors: boolean
  showStackTrace: boolean
  enableMonitoring: boolean
  maxRetries: number
  retryDelay: number
  development: boolean
}

// Default configuration
const defaultConfig: ErrorHandlerConfig = {
  logErrors: true,
  showStackTrace: process.env.NODE_ENV === 'development',
  enableMonitoring: process.env.NODE_ENV === 'production',
  maxRetries: 3,
  retryDelay: 1000,
  development: process.env.NODE_ENV === 'development'
}

// User-friendly error messages mapping
const USER_FRIENDLY_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  DATABASE_ERROR: 'We\'re experiencing technical difficulties. Please try again later.',
  BUSINESS_RULE_VIOLATION: 'This action cannot be completed due to business rules.',
  NOT_FOUND: 'The requested item could not be found.',
  AUTHENTICATION_ERROR: 'Please sign in to continue.',
  AUTHORIZATION_ERROR: 'You don\'t have permission to perform this action.',
  NETWORK_ERROR: 'Connection error. Please check your internet connection and try again.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.',
  FILE_ERROR: 'File operation failed. Please try again.',
  EXTERNAL_SERVICE_ERROR: 'External service is temporarily unavailable.',
  CONFIGURATION_ERROR: 'System configuration error. Please contact support.',
  ACCOUNTING_TRANSACTION_OUT_OF_BALANCE: 'Transaction entries must balance (debits must equal credits).',
  ACCOUNTING_INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction.',
  DUPLICATE_RECORD: 'A record with this information already exists.',
  DEFAULT: 'An unexpected error occurred. Please try again.'
}

// Error logging service interface
interface ErrorLogger {
  log(details: ErrorDetails): Promise<void>
}

// Console error logger
class ConsoleErrorLogger implements ErrorLogger {
  async log(details: ErrorDetails): Promise<void> {
    const logLevel = this.getLogLevel(details.severity)
    const logMessage = this.formatLogMessage(details)
    
    console[logLevel](logMessage)
    
    if (details.stack && defaultConfig.showStackTrace) {
      console.error('Stack trace:', details.stack)
    }
  }

  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error'
      case ErrorSeverity.MEDIUM:
        return 'warn'
      case ErrorSeverity.LOW:
        return 'info'
      default:
        return 'error'
    }
  }

  private formatLogMessage(details: ErrorDetails): string {
    return '[${details.timestamp.toISOString()}] ${details.severity.toUpperCase()}: ${details.code} - ${details.message}${
      details.context ? ' | Context: ${JSON.stringify(details.context)}' : '
    }'
  }
}

// External monitoring logger (placeholder for services like Sentry, DataDog, etc.)
class MonitoringErrorLogger implements ErrorLogger {
  async log(details: ErrorDetails): Promise<void> {
    try {
      // Send to internal monitoring endpoint first
      await fetch('/api/v1/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: details.error.message,
          stack: details.error.stack,
          context: details.context,
          severity: details.severity,
          timestamp: details.timestamp,
          category: details.category,
          metadata: details.metadata
        })
      }).catch(() => {}) // Silent fail for monitoring
      
      // For critical/high severity errors, also attempt external service
      if (details.severity === ErrorSeverity.CRITICAL || details.severity === ErrorSeverity.HIGH) {
        // Check if external monitoring is configured
        if (typeof window !== 'undefined' && window.ENV?.MONITORING_ENABLED) {
          // Send to external monitoring service (Sentry, DataDog, etc.)
          const monitoringPayload = {
            message: details.error.message,
            level: details.severity.toLowerCase(),
            extra: {
              context: details.context,
              metadata: details.metadata,
              stack: details.error.stack
            },
            timestamp: details.timestamp
          }
          
          // This would be replaced with actual monitoring service SDK call
          console.warn('External monitoring payload:', monitoringPayload)
        }
      }
    } catch (monitoringError) {
      // Fallback to console if monitoring fails
      console.error('Error logging failed:', monitoringError)
      console.error('Original error:`, details)
    }
  }
}

/**
 * Centralized error handling system with comprehensive logging, monitoring, and user-friendly error formatting
 * 
 * Provides structured error processing with automatic categorization, severity assessment,
 * multiple logging strategies, and user-friendly message generation. Integrates with external
 * monitoring services and provides retry mechanisms for transient failures.
 * 
 * @example
 * '''typescript
 * const errorHandler = new ErrorHandler({
 *   logErrors: true,
 *   enableMonitoring: true,
 *   maxRetries: 3
 * });
 * 
 * try {
 *   await riskyOperation();
 * } catch (_error) {
 *   const userResponse = await errorHandler.handle(error, {
 *     userId: user.id,
 *     operation: 'user-registration`
 *   });
 *   
 *   showErrorMessage(userResponse.message);
 * }
 * ```
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig
  private loggers: ErrorLogger[]

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.loggers = this.initializeLoggers()
  }

  private initializeLoggers(): ErrorLogger[] {
    const loggers: ErrorLogger[] = []
    
    if (this.config.logErrors) {
      loggers.push(new ConsoleErrorLogger())
    }
    
    if (this.config.enableMonitoring) {
      loggers.push(new MonitoringErrorLogger())
    }
    
    return loggers
  }

  /**
   * Processes any error and converts it to a structured, user-friendly response
   * 
   * @param error - The error to process (can be Error, AppError, string, or unknown)
   * @param context - Additional context information for logging and debugging
   * @returns Promise resolving to structured error response with user-friendly message
   * 
   * @example
   * '''typescript
   * const response = await errorHandler.handle(error, {
   *   userId: '123',
   *   operation: 'payment-processing`,
   *   amount: 99.99
   * });
   * 
   * // Response structure:
   * // {
   * //   message: "Payment processing failed. Please try again.",
   * //   code: "PAYMENT_ERROR",
   * //   statusCode: 400,
   * //   details: { errorId: "err_abc123" }
   * // }
   * '''
   */
  async handle(error: unknown, context?: Record<string, unknown>): Promise<{
    message: string
    code: string
    statusCode: number
    details?: any
  }> {
    const errorDetails = this.createErrorDetails(error, context)
    
    // Log the error
    await this.logError(errorDetails)
    
    // Return user-friendly response
    return this.createUserResponse(errorDetails)
  }

  // Create structured error details
  private createErrorDetails(error: unknown, context?: Record<string, unknown>): ErrorDetails {
    const id = this.generateErrorId()
    const timestamp = new Date()

    if (isAppError(error)) {
      return {
        id,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        severity: determineErrorSeverity(error),
        category: categorizeError(error),
        timestamp,
        context: { ...error.context, ...context },
        stack: error.stack,
        ...this.extractRequestContext(context)
      }
    }

    if (error instanceof Error) {
      return {
        id,
        message: error.message,
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.UNKNOWN,
        timestamp,
        context,
        stack: error.stack,
        ...this.extractRequestContext(context)
      }
    }

    return {
      id,
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      timestamp,
      context,
      ...this.extractRequestContext(context)
    }
  }

  // Extract request context for logging
  private extractRequestContext(context?: Record<string, unknown>): Partial<ErrorDetails> {
    if (!context) return {}

    return {
      userId: context.userId,
      sessionId: context.sessionId,
      requestId: context.requestId,
      userAgent: context.userAgent,
      ip: context.ip
    }
  }

  // Log error through all configured loggers
  private async logError(details: ErrorDetails): Promise<void> {
    const logPromises = this.loggers.map(logger => 
      logger.log(details).catch(logError => 
        console.error('Error logger failed:', logError)
      )
    )
    
    await Promise.all(logPromises)
  }

  // Create user-friendly response
  private createUserResponse(details: ErrorDetails): {
    message: string
    code: string
    statusCode: number
    details?: any
  } {
    const userMessage = USER_FRIENDLY_MESSAGES[details.code] || USER_FRIENDLY_MESSAGES.DEFAULT
    
    const response = {
      message: userMessage,
      code: details.code,
      statusCode: details.statusCode
    }

    // Include additional details in development
    if (this.config.development) {
      return {
        ...response,
        details: {
          originalMessage: details.message,
          context: details.context,
          stack: this.config.showStackTrace ? details.stack : undefined
        }
      }
    }

    return response
  }

  // Generate unique error ID for tracking
  private generateErrorId(): string {
    return 'err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}'
  }

  // Retry mechanism for operations
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.maxRetries,
    delay: number = this.config.retryDelay
  ): Promise<T> {
    let lastError: unknown
    
    for (const attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (_error) {
        lastError = error
        
        // Don't retry for certain error types'
        if (isAppError(error) && !this.shouldRetry(error)) {
          throw error
        }
        
        if (attempt === maxRetries) {
          break
        }
        
        // Wait before retrying with exponential backoff
        await this.wait(delay * Math.pow(2, attempt - 1))
      }
    }
    
    throw lastError
  }

  // Determine if error should be retried
  private shouldRetry(error: AppError): boolean {
    // Don't retry validation, authentication, or authorization errors'
    if (error.code === 'VALIDATION_ERROR') return false
    if (error.code === 'AUTHENTICATION_ERROR') return false
    if (error.code === 'AUTHORIZATION_ERROR') return false
    if (error.code === 'NOT_FOUND') return false
    if (error.code.startsWith('ACCOUNTING_')) return false
    
    // Retry network and database errors
    return error.code === 'NETWORK_ERROR' || error.code === 'DATABASE_ERROR'
  }

  // Wait utility for retry delays
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Global error handler instance
export const globalErrorHandler = new ErrorHandler()

// Convenience functions
export async function handleError(error: unknown, context?: Record<string, unknown>) {
  return globalErrorHandler.handle(error, context)
}

export async function withRetry<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T> {
  return globalErrorHandler.withRetry(operation, maxRetries, delay)
}

// Error boundary helper for React
export function createErrorBoundaryHandler() {
  return (error: Error, errorInfo: { componentStack: string }) => {
    globalErrorHandler.handle(error, {
      type: 'react_error_boundary',
      componentStack: errorInfo.componentStack
    })
  }
}