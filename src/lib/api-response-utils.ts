/**
 * Standardized API Response Utilities
 * Thorbis Business OS - Consistent response formatting
 */

import crypto from 'crypto';

export interface ApiSuccessResponse<T> {
  data: T;
  meta: {
    request_id: string;
    response_time_ms: number;
    timestamp: string;
    pagination?: PaginationMeta;
    cache_status: 'hit' | 'miss' | 'stale';
    cache_ttl?: number;
    usage_cost?: number;
    usage_units?: string;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    request_id: string;
    suggested_action?: string;
    documentation_url?: string;
    retry_after_seconds?: number;
    rate_limit_reset?: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  responseTimeMs: number,
  options: {
    pagination?: PaginationMeta;
    cacheStatus?: 'hit' | 'miss' | 'stale';
    cacheTtl?: number;
    usageCost?: number;
    usageUnits?: string;
  } = {}
): ApiSuccessResponse<T> {
  return {
    data,
    meta: {
      request_id: crypto.randomUUID(),
      response_time_ms: Math.round(responseTimeMs),
      timestamp: new Date().toISOString(),
      pagination: options.pagination,
      cache_status: options.cacheStatus || 'miss',
      cache_ttl: options.cacheTtl,
      usage_cost: options.usageCost,
      usage_units: options.usageUnits
    }
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  options: {
    details?: any;
    suggestedAction?: string;
    documentationUrl?: string;
    retryAfterSeconds?: number;
    rateLimitReset?: string;
  } = {}
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      details: options.details,
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID(),
      suggested_action: options.suggestedAction,
      documentation_url: options.documentationUrl,
      retry_after_seconds: options.retryAfterSeconds,
      rate_limit_reset: options.rateLimitReset
    }
  };
}

/**
 * Common error codes used across Thorbis APIs
 */
export enum ApiErrorCode {
  // Authentication & Authorization
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation & Input
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Business Logic
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  
  // Rate Limiting & Usage
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  USAGE_LIMIT_EXCEEDED = 'USAGE_LIMIT_EXCEEDED',
  
  // System & Infrastructure
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Idempotency
  IDEMPOTENCY_KEY_REQUIRED = 'IDEMPOTENCY_KEY_REQUIRED',
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST',

  // AI & ML
  AI_SEARCH_FAILED = 'AI_SEARCH_FAILED',
  EMBEDDING_GENERATION_FAILED = 'EMBEDDING_GENERATION_FAILED',
  
  // Analytics
  ANALYTICS_ERROR = 'ANALYTICS_ERROR',
  
  // Configuration
  VOYAGE_API_KEY_MISSING = 'VOYAGE_API_KEY_MISSING'
}

/**
 * Common usage units for billing tracking
 */
export enum UsageUnits {
  API_CALL = 'api_call',
  AI_SEARCH = 'ai_search',
  EMBEDDING_GENERATION = 'embedding_generation',
  ANALYTICS_QUERY = 'analytics_query',
  DATABASE_QUERY = 'database_query'
}