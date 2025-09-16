/**
 * Thorbis SDK - Enhanced Idempotency Examples
 * 
 * Demonstrates comprehensive idempotency handling for POST /bookings/hold 
 * and POST /estimates/draft with conflict detection and proper error handling.
 */

import { ThorbisTruthLayerSDK, withIdempotencyKey, withRetry } from './thorbis-truth-layer-sdk/index'
import * as crypto from 'crypto'

// ============================================================================
// ENHANCED IDEMPOTENCY HELPERS
// ============================================================================

/**
 * Generate idempotency key using Thorbis format: tenant:route:hash
 */
export function generateIdempotencyKey(
  tenantId: string,
  route: string,
  requestBody: any,
  providedKey?: string
): string {
  if (providedKey) {
    return providedKey
  }

  // Generate content hash from normalized request body
  const contentHash = generateContentHash(requestBody)
  const tenantIdNoHyphens = tenantId.replace(/-/g, '')
  
  return `${tenantIdNoHyphens}:${route}:${contentHash}`
}

/**
 * Generate content hash for conflict detection
 */
export function generateContentHash(body: any): string {
  const normalized = normalizeRequestBody(body)
  const hash = crypto.createHash('sha256')
  hash.update(JSON.stringify(normalized))
  return hash.digest('hex').substring(0, 16)
}

/**
 * Normalize request body for consistent hashing
 */
function normalizeRequestBody(body: any): any {
  if (Array.isArray(body)) {
    return body.map(normalizeRequestBody).sort()
  }
  
  if (typeof body === 'object' && body !== null) {
    const result: any = {}
    
    // Exclude timestamp and metadata fields that shouldn't affect idempotency
    const excludeFields = [
      'created_at', 'updated_at', 'timestamp', '_metadata',
      'request_id', 'trace_id', 'session_id', 'user_agent'
    ]
    
    Object.keys(body)
      .filter(key => !excludeFields.includes(key))
      .sort()
      .forEach(key => {
        result[key] = normalizeRequestBody(body[key])
      })
    
    return result
  }
  
  return body
}

/**
 * Enhanced withIdempotencyKey helper with Thorbis format
 */
export function withIdempotencyKeyEnhanced(
  tenantId: string,
  route: string,
  requestBody: any,
  providedKey?: string
): { idempotencyKey: string } {
  return {
    idempotencyKey: generateIdempotencyKey(tenantId, route, requestBody, providedKey)
  }
}

/**
 * Check if error is an idempotency conflict
 */
export function isIdempotencyConflict(error: any): boolean {
  return error?.code === 'CONFLICT' && 
         error?.details?.conflict_type === 'idempotency' ||
         error?.code === 'IDEMPOTENCY_CONFLICT'
}

/**
 * Check if response is an idempotency replay
 */
export function isIdempotencyReplay(response: any, headers?: Record<string, string>): boolean {
  return headers?.['x-idempotency-replay'] === 'true' || 
         headers?.['X-Idempotency-Replay'] === 'true'
}

// ============================================================================
// EXAMPLE 1: BOOKING HOLD WITH COMPREHENSIVE IDEMPOTENCY
// ============================================================================

/**
 * Create booking hold with full idempotency handling
 */
export async function createBookingHoldWithIdempotency(
  tenantId: string,
  bookingRequest: {
    business_slug: string
    service_code: 'plumbing' | 'electrical' | 'hvac' | 'general_repair' | 'emergency'
    job_type: 'diagnostic' | 'repair' | 'installation' | 'maintenance' | 'emergency'
    requested_time: string
    duration_minutes?: number
    customer_info: {
      name: string
      phone: string
      email: string
      address: {
        street: string
        city: string
        state: string
        zip: string
      }
    }
    job_details: {
      description: string
      priority: 'low' | 'normal' | 'high' | 'emergency'
      access_instructions?: string
    }
  },
  options: {
    providedIdempotencyKey?: string
    maxRetries?: number
    onConflict?: (conflictDetails: any) => void
    onReplay?: (replayDetails: any) => void
  } = {}
) {
  const sdk = new ThorbisTruthLayerSDK({
    apiKey: process.env.THORBIS_API_KEY!,
    baseURL: process.env.THORBIS_API_URL
  })

  // Generate idempotency key using Thorbis format
  const idempotencyKey = generateIdempotencyKey(
    tenantId,
    'POST:bookings-hold',
    bookingRequest,
    options.providedIdempotencyKey
  )

  console.log(`🔑 Using idempotency key: ${idempotencyKey}`)

  try {
    // Attempt to create booking hold with idempotency
    const response = await sdk.createBookingHold(
      bookingRequest,
      {
        ...withIdempotencyKey(idempotencyKey),
        ...withRetry(options.maxRetries || 3)
      }
    )

    // Check for successful response
    if (response.data) {
      // Check if this was a replayed response
      if (isIdempotencyReplay(response)) {
        console.log('✅ Idempotency replay - returning cached response')
        options.onReplay?.(response.data)
        return {
          success: true,
          data: response.data,
          replayed: true
        }
      }

      console.log('✅ Booking hold created successfully')
      return {
        success: true,
        data: response.data,
        replayed: false
      }
    }

    // Handle errors
    if (response.error) {
      // Check for idempotency conflict
      if (isIdempotencyConflict(response.error)) {
        console.error('❌ Idempotency conflict detected')
        console.error('Conflict details:', response.error.details)
        
        options.onConflict?.(response.error.details)
        
        return {
          success: false,
          error: 'IDEMPOTENCY_CONFLICT',
          message: 'Request body differs from original request with same idempotency key',
          conflictDetails: response.error.details,
          recommendations: [
            'Use a different idempotency key for the new request',
            'Wait for the original request TTL to expire',
            'Check the diff_summary to understand what changed'
          ]
        }
      }

      // Handle other errors
      console.error('❌ Booking hold creation failed:', response.error)
      return {
        success: false,
        error: response.error.code,
        message: response.error.message,
        details: response.error.details
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error in booking hold creation:', error)
    return {
      success: false,
      error: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// ============================================================================
// EXAMPLE 2: ESTIMATE DRAFT WITH CONFLICT HANDLING
// ============================================================================

/**
 * Create estimate draft with sophisticated idempotency and conflict detection
 */
export async function createEstimateDraftWithIdempotency(
  tenantId: string,
  estimateRequest: {
    business_slug: string
    customer_info: {
      name: string
      email: string
      phone: string
      address: {
        street: string
        city: string
        state: string
        zip: string
      }
    }
    project_details: {
      title: string
      description?: string
      type: 'repair' | 'installation' | 'renovation' | 'maintenance' | 'emergency'
      timeline_days?: number
    }
    line_items: Array<{
      description: string
      quantity: number
      unit: string
      unit_price: number
      total: number
    }>
    totals: {
      subtotal: number
      tax_rate?: number
      tax_amount?: number
      discount_amount?: number
      total: number
    }
    terms?: {
      payment_schedule?: Array<{
        description: string
        amount: number
        due: 'upon_acceptance' | 'material_delivery' | 'completion' | 'net_30'
      }>
      warranty?: string
      estimated_start?: string
      valid_until?: string
    }
  },
  options: {
    providedIdempotencyKey?: string
    maxRetries?: number
    conflictResolution?: 'fail' | 'retry_with_new_key' | 'diff_and_prompt'
  } = {}
) {
  const sdk = new ThorbisTruthLayerSDK({
    apiKey: process.env.THORBIS_API_KEY!,
    baseURL: process.env.THORBIS_API_URL
  })

  // Generate idempotency key
  const originalIdempotencyKey = generateIdempotencyKey(
    tenantId,
    'POST:estimates-draft',
    estimateRequest,
    options.providedIdempotencyKey
  )

  let currentIdempotencyKey = originalIdempotencyKey
  let attempt = 0
  const maxAttempts = options.conflictResolution === 'retry_with_new_key' ? 3 : 1

  console.log(`🔑 Starting estimate creation with key: ${currentIdempotencyKey}`)

  while (attempt < maxAttempts) {
    attempt++

    try {
      const response = await sdk.createEstimateDraft(
        estimateRequest,
        {
          ...withIdempotencyKey(currentIdempotencyKey),
          ...withRetry(options.maxRetries || 2)
        }
      )

      // Success case
      if (response.data) {
        const wasReplayed = isIdempotencyReplay(response)
        
        if (wasReplayed) {
          console.log(`✅ Estimate draft replayed from cache (attempt ${attempt})`)
        } else {
          console.log(`✅ Estimate draft created successfully (attempt ${attempt})`)
        }

        return {
          success: true,
          data: response.data,
          replayed: wasReplayed,
          attempts: attempt,
          finalIdempotencyKey: currentIdempotencyKey
        }
      }

      // Error handling
      if (response.error) {
        if (isIdempotencyConflict(response.error)) {
          console.warn(`⚠️  Idempotency conflict on attempt ${attempt}`)
          
          const conflictDetails = response.error.details
          console.warn('Diff summary:', conflictDetails?.diff_summary)

          // Handle conflict based on resolution strategy
          switch (options.conflictResolution) {
            case 'fail':
              return {
                success: false,
                error: 'IDEMPOTENCY_CONFLICT',
                message: 'Request conflicts with existing idempotent request',
                conflictDetails,
                attempts: attempt
              }

            case 'retry_with_new_key':
              if (attempt < maxAttempts) {
                // Generate new key by adding attempt suffix
                currentIdempotencyKey = `${originalIdempotencyKey}_retry_${attempt}`
                console.log(`🔄 Retrying with new key: ${currentIdempotencyKey}`)
                continue
              } else {
                return {
                  success: false,
                  error: 'IDEMPOTENCY_CONFLICT_MAX_RETRIES',
                  message: 'Maximum retry attempts exceeded due to conflicts',
                  conflictDetails,
                  attempts: attempt
                }
              }

            case 'diff_and_prompt':
              return {
                success: false,
                error: 'IDEMPOTENCY_CONFLICT_NEEDS_REVIEW',
                message: 'Request conflicts - review required',
                conflictDetails,
                attempts: attempt,
                diffSummary: conflictDetails?.diff_summary,
                recommendations: [
                  'Review the changes shown in diff_summary',
                  'If changes are intentional, use a new idempotency key',
                  'If changes are unintentional, fix the request and retry'
                ]
              }

            default:
              // Default to fail
              return {
                success: false,
                error: 'IDEMPOTENCY_CONFLICT',
                conflictDetails,
                attempts: attempt
              }
          }
        } else {
          // Other error - don't retry
          console.error(`❌ Estimate creation failed: ${response.error.message}`)
          return {
            success: false,
            error: response.error.code,
            message: response.error.message,
            details: response.error.details,
            attempts: attempt
          }
        }
      }

    } catch (error) {
      console.error(`💥 Unexpected error on attempt ${attempt}:`, error)
      
      if (attempt === maxAttempts) {
        return {
          success: false,
          error: 'UNKNOWN',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          attempts: attempt
        }
      }
    }
  }

  // Should not reach here, but TypeScript safety
  return {
    success: false,
    error: 'MAX_ATTEMPTS_EXCEEDED',
    attempts: attempt
  }
}

// ============================================================================
// EXAMPLE 3: PAYMENT LINK WITH SMART RETRY
// ============================================================================

/**
 * Create payment link with intelligent retry and backoff
 */
export async function createPaymentLinkWithIdempotency(
  tenantId: string,
  paymentRequest: {
    business_slug: string
    reference_type: 'invoice' | 'estimate' | 'deposit' | 'service_fee'
    reference_id: string
    amount: number
    currency?: string
    customer_info: {
      name: string
      email: string
      phone?: string
    }
    description: string
    payment_methods?: Array<'card' | 'ach' | 'apple_pay' | 'google_pay' | 'paypal'>
    due_date?: string
    options?: {
      allow_partial?: boolean
      send_reminders?: boolean
      auto_reconcile?: boolean
    }
  },
  providedIdempotencyKey?: string
) {
  const sdk = new ThorbisTruthLayerSDK({
    apiKey: process.env.THORBIS_API_KEY!,
    baseURL: process.env.THORBIS_API_URL
  })

  const idempotencyKey = generateIdempotencyKey(
    tenantId,
    'POST:payments-link',
    paymentRequest,
    providedIdempotencyKey
  )

  console.log(`🔑 Creating payment link with key: ${idempotencyKey}`)

  // Track retry attempts with exponential backoff
  let attempt = 0
  const maxRetries = 3
  const baseDelay = 1000

  while (attempt <= maxRetries) {
    try {
      const response = await sdk.createPaymentLink(
        paymentRequest,
        { idempotencyKey }
      )

      if (response.data) {
        const wasReplayed = isIdempotencyReplay(response)
        
        return {
          success: true,
          data: response.data,
          replayed: wasReplayed,
          attempts: attempt + 1,
          idempotencyKey
        }
      }

      if (response.error) {
        // Handle specific error types
        if (response.error.code === 'RATE_LIMIT') {
          const retryAfter = response.error.details?.retry_after || baseDelay * Math.pow(2, attempt)
          
          if (attempt < maxRetries) {
            console.log(`⏰ Rate limited, waiting ${retryAfter}ms before retry`)
            await sleep(retryAfter)
            attempt++
            continue
          }
        }

        if (isIdempotencyConflict(response.error)) {
          // For payment links, conflicts are usually serious - don't retry
          return {
            success: false,
            error: 'IDEMPOTENCY_CONFLICT',
            message: 'Payment link request conflicts with existing request',
            conflictDetails: response.error.details,
            idempotencyKey
          }
        }

        // Other errors
        return {
          success: false,
          error: response.error.code,
          message: response.error.message,
          attempts: attempt + 1
        }
      }

    } catch (error) {
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.log(`🔄 Network error, retrying in ${delay}ms...`)
        await sleep(delay)
        attempt++
        continue
      }

      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error occurred',
        attempts: attempt + 1
      }
    }
  }

  return {
    success: false,
    error: 'MAX_RETRIES_EXCEEDED',
    attempts: attempt
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Handle booking with double-submit protection
 */
export async function exampleBookingWithDoubleSubmitProtection() {
  const tenantId = '11111111-1111-1111-1111-111111111111'
  const bookingData = {
    business_slug: 'smith-plumbing-co',
    service_code: 'plumbing' as const,
    job_type: 'repair' as const,
    requested_time: '2024-02-16T10:00:00Z',
    duration_minutes: 120,
    customer_info: {
      name: 'John Smith',
      phone: '+1-512-555-0200',
      email: 'john.smith@email.com',
      address: {
        street: '456 Oak Ave',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      }
    },
    job_details: {
      description: 'Kitchen sink not draining properly',
      priority: 'normal' as const
    }
  }

  // First request
  console.log('📞 Making first booking request...')
  const result1 = await createBookingHoldWithIdempotency(tenantId, bookingData, {
    onReplay: (data) => console.log('🔄 First request was replayed'),
    onConflict: (details) => console.log('⚡ First request had conflict:', details)
  })

  // Immediate duplicate request (should be replayed)
  console.log('📞 Making duplicate booking request...')
  const result2 = await createBookingHoldWithIdempotency(tenantId, bookingData, {
    onReplay: (data) => console.log('✅ Second request replayed successfully'),
    onConflict: (details) => console.log('⚡ Second request had conflict:', details)
  })

  // Modified request with same initial data (should conflict)
  console.log('📞 Making modified booking request...')
  const modifiedBookingData = {
    ...bookingData,
    customer_info: {
      ...bookingData.customer_info,
      phone: '+1-512-555-9999' // Changed phone number
    }
  }

  const result3 = await createBookingHoldWithIdempotency(tenantId, modifiedBookingData, {
    onReplay: (data) => console.log('🔄 Third request was replayed'),
    onConflict: (details) => console.log('⚠️  Third request conflicted as expected:', details)
  })

  return {
    first: result1,
    duplicate: result2,
    modified: result3
  }
}

/**
 * Example: Estimate creation with smart conflict resolution
 */
export async function exampleEstimateWithConflictResolution() {
  const tenantId = '11111111-1111-1111-1111-111111111111'
  const estimateData = {
    business_slug: 'smith-plumbing-co',
    customer_info: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-512-555-0300',
      address: {
        street: '789 Pine St',
        city: 'Austin',
        state: 'TX',
        zip: '78702'
      }
    },
    project_details: {
      title: 'Master Bathroom Renovation',
      description: 'Complete bathroom renovation including new fixtures',
      type: 'renovation' as const,
      timeline_days: 5
    },
    line_items: [
      {
        description: 'Demolition and prep work',
        quantity: 1,
        unit: 'job',
        unit_price: 800.00,
        total: 800.00
      },
      {
        description: 'New plumbing rough-in',
        quantity: 1,
        unit: 'job',
        unit_price: 1200.00,
        total: 1200.00
      }
    ],
    totals: {
      subtotal: 2000.00,
      tax_rate: 0.0825,
      tax_amount: 165.00,
      total: 2165.00
    }
  }

  // Try with automatic retry on conflict
  console.log('📋 Creating estimate with auto-retry...')
  const result = await createEstimateDraftWithIdempotency(tenantId, estimateData, {
    conflictResolution: 'retry_with_new_key',
    maxRetries: 2
  })

  console.log('Estimate creation result:', result)
  return result
}

export default {
  generateIdempotencyKey,
  generateContentHash,
  withIdempotencyKeyEnhanced,
  createBookingHoldWithIdempotency,
  createEstimateDraftWithIdempotency,
  createPaymentLinkWithIdempotency,
  exampleBookingWithDoubleSubmitProtection,
  exampleEstimateWithConflictResolution
}
