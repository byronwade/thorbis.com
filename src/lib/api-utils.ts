import { NextRequest, NextResponse } from 'next/server'

export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  SCHEMA_MISSING = 'SCHEMA_MISSING',
  CONFLICT = 'CONFLICT',
  NOT_FOUND = 'NOT_FOUND',
  DEPENDENCY_DOWN = 'DEPENDENCY_DOWN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN'
}

function getStatusForErrorCode(code: ApiErrorCode): number {
  switch (code) {
    case ApiErrorCode.VALIDATION_ERROR:
      return 400
    case ApiErrorCode.AUTH_ERROR:
      return 401
    case ApiErrorCode.INSUFFICIENT_PERMISSIONS:
      return 403
    case ApiErrorCode.NOT_FOUND:
      return 404
    case ApiErrorCode.CONFLICT:
      return 409
    case ApiErrorCode.RATE_LIMIT:
      return 429
    case ApiErrorCode.DEPENDENCY_DOWN:
      return 502
    default:
      return 500
  }
}

export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  details?: any
) {
  return NextResponse.json({
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  }, {
    status: getStatusForErrorCode(code)
  })
}

export function withApiHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      console.error('API Error:', error)
      return createErrorResponse(
        ApiErrorCode.UNKNOWN,
        'An unexpected error occurred',
        process.env.NODE_ENV === 'development' ? error : undefined
      )
    }
  }
}

// Simple database context - mock for now
export function getDatabase() {
  return {
    courses: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({})
    }
  }
}

export function createDatabaseContext() {
  return getDatabase()
}
