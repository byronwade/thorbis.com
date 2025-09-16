// Base error class for all application errors
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly timestamp: Date
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.timestamp = new Date()
    this.context = context

    Error.captureStackTrace(this, this.constructor)
  }
}

// Validation errors
export class ValidationError extends AppError {
  public readonly fields: Record<string, string[]>

  constructor(
    message: string,
    fields: Record<string, string[]> = {},
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', 400, true, context)
    this.fields = fields
  }
}

// Database errors
export class DatabaseError extends AppError {
  constructor(
    message: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(message, 'DATABASE_ERROR', 500, true, {
      ...context,
      originalError: originalError?.message,
      stack: originalError?.stack
    })
  }
}

// Business logic errors
export class BusinessRuleError extends AppError {
  constructor(
    message: string,
    code: string = 'BUSINESS_RULE_VIOLATION',
    context?: Record<string, unknown>
  ) {
    super(message, code, 422, true, context)
  }
}

// Not found errors
export class NotFoundError extends AppError {
  constructor(
    resource: string,
    identifier?: string | number,
    context?: Record<string, unknown>
  ) {
    const message = identifier 
      ? '${resource} with identifier '${identifier}' not found'
      : '${resource} not found'
    super(message, 'NOT_FOUND', 404, true, { resource, identifier, ...context })
  }
}

// Authentication errors
export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication required',
    context?: Record<string, unknown>
  ) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, context)
  }
}

// Authorization errors
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Insufficient permissions',
    requiredPermission?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, {
      requiredPermission,
      ...context
    })
  }
}

// Network/API errors
export class NetworkError extends AppError {
  constructor(
    message: string,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message, 'NETWORK_ERROR', statusCode, true, context)
  }
}

// Rate limiting errors
export class RateLimitError extends AppError {
  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, true, {
      retryAfter,
      ...context
    })
  }
}

// File operation errors
export class FileError extends AppError {
  constructor(
    message: string,
    operation: string,
    fileName?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'FILE_ERROR', 500, true, {
      operation,
      fileName,
      ...context
    })
  }
}

// External service errors
export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    service: string,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message, 'EXTERNAL_SERVICE_ERROR', statusCode, true, {
      service,
      ...context
    })
  }
}

// Configuration errors
export class ConfigurationError extends AppError {
  constructor(
    message: string,
    configKey?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'CONFIGURATION_ERROR`, 500, false, {
      configKey,
      ...context
    })
  }
}

// Accounting specific errors
export class AccountingError extends BusinessRuleError {
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>
  ) {
    super(message, `ACCOUNTING_${code}', context)
  }
}

export class TransactionBalanceError extends AccountingError {
  constructor(
    totalDebits: number,
    totalCredits: number,
    context?: Record<string, unknown>
  ) {
    const difference = totalDebits - totalCredits
    const message = 'Transaction is out of balance. Debits: $${totalDebits.toFixed(2)}, Credits: $${totalCredits.toFixed(2)}, Difference: $${difference.toFixed(2)}'
    super(message, 'TRANSACTION_OUT_OF_BALANCE', {
      totalDebits,
      totalCredits,
      difference,
      ...context
    })
  }
}

export class InsufficientFundsError extends AccountingError {
  constructor(
    accountId: string,
    requestedAmount: number,
    availableBalance: number,
    context?: Record<string, unknown>
  ) {
    const message = 'Insufficient funds in account ${accountId}. Requested: $${requestedAmount.toFixed(2)}, Available: $${availableBalance.toFixed(2)}'
    super(message, 'INSUFFICIENT_FUNDS', {
      accountId,
      requestedAmount,
      availableBalance,
      shortfall: requestedAmount - availableBalance,
      ...context
    })
  }
}

export class DuplicateRecordError extends BusinessRuleError {
  constructor(
    resource: string,
    field: string,
    value: string,
    context?: Record<string, unknown>
  ) {
    const message = '${resource} with ${field} '${value}' already exists'
    super(message, 'DUPLICATE_RECORD', {
      resource,
      field,
      value,
      ...context
    })
  }
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  VALIDATION = 'validation',
  DATABASE = 'database',
  BUSINESS_LOGIC = 'business_logic',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  FILE_SYSTEM = 'file_system',
  EXTERNAL_SERVICE = 'external_service',
  CONFIGURATION = 'configuration',
  UNKNOWN = 'unknown'
}

// Error details interface for logging and monitoring
export interface ErrorDetails {
  id: string
  message: string
  code: string
  statusCode: number
  severity: ErrorSeverity
  category: ErrorCategory
  timestamp: Date
  context?: Record<string, unknown>
  stack?: string
  userId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ip?: string
}

// Type guard functions
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError
}

export function isBusinessRuleError(error: unknown): error is BusinessRuleError {
  return error instanceof BusinessRuleError
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}

// Error categorization helper
export function categorizeError(error: unknown): ErrorCategory {
  if (isValidationError(error)) return ErrorCategory.VALIDATION
  if (isDatabaseError(error)) return ErrorCategory.DATABASE
  if (isBusinessRuleError(error)) return ErrorCategory.BUSINESS_LOGIC
  if (isAuthenticationError(error)) return ErrorCategory.AUTHENTICATION
  if (isAuthorizationError(error)) return ErrorCategory.AUTHORIZATION
  if (isNetworkError(error)) return ErrorCategory.NETWORK
  if (error instanceof FileError) return ErrorCategory.FILE_SYSTEM
  if (error instanceof ExternalServiceError) return ErrorCategory.EXTERNAL_SERVICE
  if (error instanceof ConfigurationError) return ErrorCategory.CONFIGURATION
  return ErrorCategory.UNKNOWN
}

// Error severity determination
export function determineErrorSeverity(error: unknown): ErrorSeverity {
  if (isAppError(error)) {
    if (error instanceof ConfigurationError) return ErrorSeverity.CRITICAL
    if (error instanceof DatabaseError) return ErrorSeverity.HIGH
    if (error instanceof AuthenticationError) return ErrorSeverity.MEDIUM
    if (error instanceof ValidationError) return ErrorSeverity.LOW
    if (error instanceof BusinessRuleError) return ErrorSeverity.MEDIUM
    if (error instanceof NotFoundError) return ErrorSeverity.LOW
    if (error instanceof NetworkError && error.statusCode >= 500) return ErrorSeverity.HIGH
  }
  return ErrorSeverity.MEDIUM
}