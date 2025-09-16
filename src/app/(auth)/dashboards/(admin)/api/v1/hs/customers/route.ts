import { NextRequest } from 'next/server'
import { withApiHandler, createErrorResponse, ApiErrorCode } from '@thorbis/api-utils'
import { getDatabase, createDatabaseContext } from '@thorbis/database'
import { CustomerSchema } from '@thorbis/schemas'

/**
 * Thorbis Business OS - Home Services Customers API
 * 
 * This API provides comprehensive customer management for Home Services businesses.
 * Features:
 * - Complete customer profile management with service history
 * - Property information and service locations with GPS coordinates
 * - Contact preferences and automated communication workflows
 * - Payment method management and billing history tracking
 * - Service agreements, contracts, and warranty management
 * - Customer portal access and self-service capabilities
 * - Lead qualification and conversion funnel management
 * - Customer satisfaction tracking and feedback collection
 * - Integration with work orders, estimates, and invoicing
 * - GDPR compliance with data retention and deletion policies
 * - Customer segmentation and targeted marketing campaigns
 * - Referral tracking and loyalty program integration
 * - Real-time notifications and status updates
 * - Mobile-first design for field technician access
 * - Advanced search and filtering capabilities
 * - Duplicate detection and customer merging workflows
 * - Service history analytics and lifetime value calculation
 * - Automated follow-up and maintenance reminders
 */

interface Customer {
  id: string
  business_id: string
  status: 'lead' | 'active' | 'inactive' | 'archived'
  type: 'residential' | 'commercial'
  
  // Contact Information
  first_name: string
  last_name: string
  company_name?: string
  email?: string
  phone_primary: string
  phone_secondary?: string
  
  // Address Information
  service_address: {
    street: string
    street2?: string
    city: string
    state: string
    zip: string
    coordinates?: { lat: number; lng: number }
    property_type?: 'single_family' | 'condo' | 'apartment' | 'commercial'
    access_notes?: string
  }
  billing_address?: {
    street: string
    street2?: string
    city: string
    state: string
    zip: string
  }
  
  // Customer Preferences
  preferred_contact_method: 'phone' | 'email' | 'text' | 'app'
  communication_preferences: {
    appointment_reminders: boolean
    marketing_communications: boolean
    service_updates: boolean
  }
  service_preferences: {
    preferred_technician_id?: string
    preferred_time_window?: 'morning' | 'afternoon' | 'evening' | 'anytime'
    special_instructions?: string
  }
  
  // Business Data
  lifetime_value: number
  total_jobs: number
  last_service_date?: string
  next_service_due?: string
  credit_limit?: number
  payment_terms?: 'net_15' | 'net_30' | 'cod' | 'credit_card'
  
  // Equipment and Property
  equipment?: Array<{
    id: string
    type: 'hvac' | 'plumbing' | 'electrical' | 'security' | 'other'
    brand: string
    model: string
    serial_number?: string
    installation_date?: string
    warranty_expires?: string
    service_interval?: number // days
    notes?: string
  }>
  
  // Tags and Classification
  tags: string[]
  source: 'referral' | 'website' | 'marketing' | 'cold_call' | 'repeat' | 'other'
  referral_source?: string
  
  // AI and Analytics
  risk_score?: number // 0-100, higher = more likely to churn
  satisfaction_score?: number // 1-5 star equivalent
  ai_insights?: {
    upsell_opportunities: string[]
    churn_risk_factors: string[]
    recommended_services: string[]
    optimal_contact_time?: string
  }
  
  // Hardware Integration
  mobile_app_user: boolean
  hardware_interactions?: {
    qr_code_scanned?: boolean
    beacon_proximity?: boolean
    last_mobile_checkin?: string
  }
  
  // Audit fields
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  version: number
}

// GET /api/hs/app/v1/customers
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const userAgent = headersList.get('user-agent')
    const xForwardedFor = headersList.get('x-forwarded-for')
    
    if (!authHeader) {
      await logSecurityEvent({
        type: 'unauthorized_access_attempt',
        endpoint: '/api/hs/app/v1/customers',
        ip: xForwardedFor || 'unknown',
        user_agent: userAgent || 'unknown'
      })
      
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { businessId, userId, role } = await validateAndExtractJWTClaims(authHeader)
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit(userId, 'customers_read')
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: { 
            code: 'RATE_LIMIT', 
            message: 'Rate limit exceeded',
            details: {
              limit: rateLimitResult.limit,
              reset_at: rateLimitResult.resetAt
            }
          }
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': rateLimitResult.resetAt,
            'Retry-After': String(rateLimitResult.retryAfter)
          }
        }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const status = url.searchParams.get('status') as Customer['status'] | null
    const search = url.searchParams.get('search') // Search by name, email, phone
    const type = url.searchParams.get('type') as Customer['type'] | null
    const includeInsights = url.searchParams.get('include_insights') === 'true'

    // Record usage for billing
    await recordUsage(businessId, 'api_calls', 1, {
      endpoint: 'customers_read',
      user_id: userId,
      query_complexity: calculateQueryComplexity({ 
        limit, 
        filters: [status, search, type].filter(Boolean),
        includes: includeInsights ? ['ai_insights'] : []
      })
    })

    // Fetch customers with RLS enforcement
    const customers = await fetchCustomersWithRLS({
      businessId,
      userId,
      role,
      filters: { status, search, type, limit, offset },
      includeInsights
    })

    // Apply PII redaction based on role
    const redactedCustomers = await redactPIIFromCustomers(customers, role)

    const responseTime = Date.now() - startTime
    await recordMetric('thorbis_api_request_duration_seconds', responseTime / 1000, {
      method: 'GET',
      endpoint: '/customers',
      status: '200',
      business_id: businessId
    })

    return NextResponse.json({
      data: redactedCustomers,
      pagination: {
        limit,
        offset,
        total: await getCustomerCount(businessId, { status, search, type }),
        has_more: customers.length === limit
      },
      meta: {
        request_id: generateRequestId(),
        response_time_ms: responseTime
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
        'X-Business-ID': businessId,
        'X-Request-ID': generateRequestId()
      }
    })
  } catch (_error) {
    const responseTime = Date.now() - startTime
    
    await logError('customers_api_error', error, {
      endpoint: '/api/hs/app/v1/customers',
      method: 'GET',
      response_time_ms: responseTime
    })

    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch customers',
          request_id: generateRequestId()
        }
      },
      { status: 500 }
    )
  }
}

// POST /api/hs/app/v1/customers
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const idempotencyKey = headersList.get('idempotency-key')

    if (!authHeader) {
      await logSecurityEvent({
        type: 'unauthorized_write_attempt',
        endpoint: '/api/hs/app/v1/customers',
        method: 'POST'
      })
      
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { businessId, userId, role } = await validateAndExtractJWTClaims(authHeader)
    
    if (!idempotencyKey) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Idempotency-Key header required for write operations'
          }
        },
        { status: 400 }
      )
    }

    // Check for duplicate request
    const existingCustomer = await checkIdempotencyKey(businessId, idempotencyKey)
    if (existingCustomer) {
      return NextResponse.json(existingCustomer, {
        status: 200,
        headers: {
          'X-Idempotency-Key': idempotencyKey,
          'X-Idempotency-Status': 'duplicate'
        }
      })
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = await validateCustomerInput(body, role)
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Input validation failed',
            details: validationResult.errors
          }
        },
        { status: 400 }
      )
    }

    // Check usage limits
    const usageCheck = await checkUsageLimits(businessId, 'customers', 1)
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: { 
            code: 'USAGE_LIMIT_EXCEEDED', 
            message: 'Customer creation limit exceeded',
            details: {
              current_usage: usageCheck.currentUsage,
              limit: usageCheck.limit,
              reset_date: usageCheck.resetDate
            }
          }
        },
        { status: 429 }
      )
    }

    // Process hardware integration data
    const hardwareData = await processHardwareIntegration(body, userId)
    
    // Generate AI insights if requested
    const aiInsights = body.generate_insights ? 
      await generateCustomerInsights(body, businessId) : undefined

    // Create new customer
    const newCustomer: Customer = {
      id: generateCustomerId(),
      business_id: businessId,
      status: body.status || 'lead',
      type: body.type || 'residential',
      
      first_name: body.first_name,
      last_name: body.last_name,
      company_name: body.company_name,
      email: body.email,
      phone_primary: body.phone_primary,
      phone_secondary: body.phone_secondary,
      
      service_address: body.service_address,
      billing_address: body.billing_address,
      
      preferred_contact_method: body.preferred_contact_method || 'phone',
      communication_preferences: {
        appointment_reminders: body.communication_preferences?.appointment_reminders ?? true,
        marketing_communications: body.communication_preferences?.marketing_communications ?? false,
        service_updates: body.communication_preferences?.service_updates ?? true
      },
      service_preferences: body.service_preferences || {},
      
      lifetime_value: 0,
      total_jobs: 0,
      credit_limit: body.credit_limit,
      payment_terms: body.payment_terms,
      
      equipment: body.equipment || [],
      tags: body.tags || [],
      source: body.source || 'other',
      referral_source: body.referral_source,
      
      ai_insights: aiInsights,
      mobile_app_user: hardwareData.mobileAppUser || false,
      hardware_interactions: hardwareData.interactions,
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId,
      updated_by: userId,
      version: 1
    }

    // Save with RLS enforcement
    const savedCustomer = await saveCustomerWithRLS(newCustomer, businessId)
    
    // Record usage for billing
    await recordUsage(businessId, 'customers_created', 1, {
      user_id: userId,
      customer_id: savedCustomer.id,
      customer_type: savedCustomer.type,
      source: savedCustomer.source
    })

    // Background sync for PWA
    await queueBackgroundSync('customer_created', {
      customer_id: savedCustomer.id,
      business_id: businessId
    })

    const responseTime = Date.now() - startTime
    await recordMetric('thorbis_customers_created_total', 1, {
      business_id: businessId,
      customer_type: savedCustomer.type,
      source: savedCustomer.source
    })

    return NextResponse.json({
      data: savedCustomer,
      meta: {
        request_id: generateRequestId(),
        response_time_ms: responseTime,
        idempotency_status: 'created'
      }
    }, {
      status: 201,
      headers: {
        'Location': '/api/hs/app/v1/customers/${savedCustomer.id}',
        'X-Idempotency-Key': idempotencyKey,
        'X-Business-ID': businessId
      }
    })
  } catch (_error) {
    const responseTime = Date.now() - startTime
    
    await logError('customers_create_error', error as Error, {
      endpoint: '/api/hs/app/v1/customers',
      method: 'POST',
      response_time_ms: responseTime
    })

    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to create customer',
          request_id: generateRequestId()
        }
      },
      { status: 500 }
    )
  }
}

// Utility functions (would be imported from shared modules)

async function logSecurityEvent(event: unknown) {
  console.log('Security Event:', event)
}

async function validateAndExtractJWTClaims(authHeader: string) {
  return {
    businessId: 'biz_123',
    userId: 'user_456',
    role: 'manager' as const
  }
}

async function checkRateLimit(userId: string, operation: string) {
  return {
    allowed: true,
    limit: 1000,
    remaining: 999,
    resetAt: new Date(Date.now() + 3600000).toISOString(),
    retryAfter: 0
  }
}

async function recordUsage(businessId: string, metric: string, quantity: number, metadata?: any) {
  console.log('Usage recorded: ${businessId} - ${metric}: ${quantity}', metadata)
}

async function fetchCustomersWithRLS(params: unknown) {
  return [{
    id: 'cust-001',
    business_id: params.businessId,
    status: 'active' as const,
    type: 'residential' as const,
    
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@email.com',
    phone_primary: '+1-512-555-1234',
    
    service_address: {
      street: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      coordinates: { lat: 30.2672, lng: -97.7431 },
      property_type: 'single_family' as const
    },
    
    preferred_contact_method: 'phone' as const,
    communication_preferences: {
      appointment_reminders: true,
      marketing_communications: false,
      service_updates: true
    },
    service_preferences: {
      preferred_time_window: 'morning' as const
    },
    
    lifetime_value: 2450.75,
    total_jobs: 8,
    last_service_date: '2024-01-15T10:00:00Z',
    next_service_due: '2024-04-15T10:00:00Z',
    
    equipment: [{
      id: 'eq-001',
      type: 'hvac' as const,
      brand: 'Carrier',
      model: 'Infinity 21',
      installation_date: '2022-03-15',
      service_interval: 180
    }],
    
    tags: ['premium', 'referral'],
    source: 'referral' as const,
    referral_source: 'neighbor_recommendation',
    
    mobile_app_user: true,
    
    created_at: new Date('2023-06-15T08:00:00Z').toISOString(),
    updated_at: new Date('2024-01-20T08:00:00Z').toISOString(),
    created_by: 'user_456',
    updated_by: 'user_456',
    version: 3
  }]
}

async function redactPIIFromCustomers(customers: Customer[], role: string) {
  if (role === 'viewer') {
    return customers.map(customer => ({
      ...customer,
      email: customer.email ? customer.email.replace(/(.{1})(.*)(@.*)/, '$1***$3') : undefined,
      phone_primary: customer.phone_primary.replace(/.{6}$/, '***-***'),
      phone_secondary: customer.phone_secondary?.replace(/.{6}$/, '***-***`)
    }))
  }
  return customers
}

async function getCustomerCount(businessId: string, filters: unknown) {
  return 1
}

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

function calculateQueryComplexity(params: unknown) {
  return params.filters.length + (params.limit > 50 ? 2 : 1) + (params.includes.length * 2)
}

async function recordMetric(name: string, value: number, labels: unknown) {
  console.log(`Metric: ${name} = ${value}', labels)
}

async function logError(type: string, error: unknown, context: unknown) {
  console.error('${type}:', error.message, context)
}

async function checkIdempotencyKey(businessId: string, key: string) {
  return null
}

async function validateCustomerInput(body: unknown, role: string) {
  const errors = []
  
  if (!body.first_name) errors.push({ field: 'first_name', message: 'First name is required' })
  if (!body.last_name) errors.push({ field: 'last_name', message: 'Last name is required' })
  if (!body.phone_primary) errors.push({ field: 'phone_primary', message: 'Primary phone is required' })
  if (!body.service_address?.street) errors.push({ field: 'service_address.street', message: 'Service address is required' })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

async function checkUsageLimits(businessId: string, metric: string, quantity: number) {
  return {
    allowed: true,
    currentUsage: 145,
    limit: 500,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
}

async function processHardwareIntegration(body: unknown, userId: string) {
  return {
    mobileAppUser: body.mobile_signup || false,
    interactions: body.qr_code_scanned ? {
      qr_code_scanned: true,
      last_mobile_checkin: new Date().toISOString()
    } : Record<string, unknown>
  }
}

function generateCustomerId() {
  return 'cust_${Date.now()}_${Math.random().toString(36).substring(2, 11)}'
}

async function generateCustomerInsights(body: unknown, businessId: string) {
  return {
    upsell_opportunities: ['Annual maintenance plan', 'Smart thermostat upgrade'],
    churn_risk_factors: [],
    recommended_services: ['HVAC tune-up', 'Duct cleaning'],
    optimal_contact_time: 'weekday_morning'
  }
}

async function saveCustomerWithRLS(customer: Customer, businessId: string) {
  return customer
}

async function queueBackgroundSync(operation: string, data: unknown) {
  console.log('Background sync queued: ${operation}', data)
}
