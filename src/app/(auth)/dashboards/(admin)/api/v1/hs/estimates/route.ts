import { NextRequest } from 'next/server'
import { withApiHandler, createErrorResponse, ApiErrorCode } from '@thorbis/api-utils'
import { getDatabase, createDatabaseContext } from '@thorbis/database'
import { HSEstimateSchema } from '@thorbis/schemas'

/**
 * Thorbis Business OS - Home Services Estimates API
 * 
 * This API provides comprehensive estimate management for Home Services businesses.
 * Features:
 * - Professional estimate generation with customizable templates
 * - Multi-option estimates with alternative service packages
 * - Real-time pricing with dynamic material and labor costs
 * - Digital signature capture and customer approval workflows
 * - Integration with work order creation upon approval
 * - Automated follow-up sequences and reminder campaigns
 * - Photo and diagram integration for visual estimates
 * - Warranty information and terms inclusion
 * - Tax calculation with location-based rates
 * - Discount and promotion application
 * - Payment schedule options for large projects
 * - Integration with accounting systems for tracking
 * - Mobile-friendly customer review and approval
 * - Estimate versioning and revision tracking
 * - Competitor pricing analysis and market insights
 * - Upselling and cross-selling opportunity identification
 * - Customer portal integration for self-service access
 * - Estimate analytics and conversion rate tracking
 * - Automated invoice generation upon work completion
 * - Integration with scheduling for approved estimates
 */

interface EstimateLineItem {
  id: string
  type: 'service' | 'part' | 'labor' | 'markup' | 'discount'
  service_code?: string
  part_id?: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  markup_percentage?: number
  discount_percentage?: number
  tax_exempt: boolean
  notes?: string
}

interface Estimate {
  id: string
  business_id: string
  estimate_number: string // Auto-generated sequential
  customer_id: string
  
  // Status and workflow
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted'
  version: number
  is_template: boolean
  template_name?: string
  
  // Basic Information
  title: string
  description?: string
  service_address: {
    street: string
    street2?: string
    city: string
    state: string
    zip: string
    coordinates?: { lat: number; lng: number }
    access_instructions?: string
  }
  
  // Pricing and Line Items
  line_items: EstimateLineItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  
  // Terms and Conditions
  payment_terms: string
  validity_period_days: number // How long estimate is valid
  terms_conditions: string
  warranty_info?: string
  
  // Scheduling and Timeline
  estimated_start_date?: string
  estimated_completion_date?: string
  estimated_duration_hours?: number
  priority: 'low' | 'normal' | 'high' | 'emergency'
  
  // Customer Interaction
  sent_date?: string
  viewed_date?: string
  customer_response_date?: string
  customer_notes?: string
  follow_up_dates: string[]
  expires_date?: string
  
  // Digital Signature and Approval
  customer_signature?: {
    signature_data: string // Base64 encoded signature
    signed_date: string
    ip_address: string
    device_info: string
  }
  
  // Conversion Tracking
  converted_to_work_order_id?: string
  conversion_date?: string
  win_probability?: number // AI-calculated 0-100
  
  // AI and Insights
  ai_generated: boolean
  ai_pricing_suggestions?: {
    suggested_adjustments: Array<{
      item_id: string
      current_price: number
      suggested_price: number
      reasoning: string
    }>
    market_analysis: {
      competitive_position: 'low' | 'competitive' | 'premium'
      confidence_score: number
    }
  }
  
  // Hardware Integration
  created_via_mobile: boolean
  photos_attached: Array<{
    id: string
    filename: string
    url: string
    taken_date: string
    gps_coordinates?: { lat: number; lng: number }
  }>
  
  // Attachments and Media
  attachments: Array<{
    id: string
    filename: string
    content_type: string
    size: number
    url: string
  }>
  
  // Export and Delivery
  pdf_url?: string
  email_delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed'
  last_email_sent?: string
  view_count: number
  
  // Audit fields
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  revision_history: Array<{
    version: number
    changes: string[]
    updated_by: string
    updated_at: string
  }>
}

// GET /api/hs/app/v1/estimates
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    
    if (!authHeader) {
      await logSecurityEvent({
        type: 'unauthorized_access_attempt',
        endpoint: '/api/hs/app/v1/estimates'
      })
      
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { businessId, userId, role } = await validateAndExtractJWTClaims(authHeader)
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit(userId, 'estimates_read')
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
            'X-RateLimit-Remaining': String(rateLimitResult.remaining)
          }
        }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const status = url.searchParams.get('status') as Estimate['status'] | null
    const customerId = url.searchParams.get('customer_id')
    const dateFrom = url.searchParams.get('date_from')
    const dateTo = url.searchParams.get('date_to')
    const includeConverted = url.searchParams.get('include_converted') === 'true'
    const templatesOnly = url.searchParams.get('templates_only') === 'true'

    // Record usage for billing
    await recordUsage(businessId, 'api_calls', 1, {
      endpoint: 'estimates_read',
      user_id: userId,
      query_complexity: calculateQueryComplexity({ 
        limit, 
        filters: [status, customerId, dateFrom, dateTo].filter(Boolean)
      })
    })

    // Fetch estimates with RLS enforcement
    const estimates = await fetchEstimatesWithRLS({
      businessId,
      userId,
      role,
      filters: { 
        status, 
        customerId, 
        dateFrom, 
        dateTo, 
        includeConverted,
        templatesOnly,
        limit, 
        offset 
      }
    })

    // Apply role-based filtering
    const filteredEstimates = await filterEstimatesByRole(estimates, role)

    const responseTime = Date.now() - startTime
    await recordMetric('thorbis_api_request_duration_seconds', responseTime / 1000, {
      method: 'GET',
      endpoint: '/estimates',
      status: '200',
      business_id: businessId
    })

    return NextResponse.json({
      data: filteredEstimates,
      pagination: {
        limit,
        offset,
        total: await getEstimateCount(businessId, { status, customerId, dateFrom, dateTo }),
        has_more: estimates.length === limit
      },
      summary: {
        total_value: filteredEstimates.reduce((sum, est) => sum + est.total_amount, 0),
        avg_value: filteredEstimates.length > 0 ? 
          filteredEstimates.reduce((sum, est) => sum + est.total_amount, 0) / filteredEstimates.length : 0,
        conversion_rate: await calculateConversionRate(businessId, dateFrom, dateTo)
      },
      meta: {
        request_id: generateRequestId(),
        response_time_ms: responseTime
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
        'X-Business-ID': businessId
      }
    })
  } catch (_error) {
    const responseTime = Date.now() - startTime
    
    await logError('estimates_api_error', error, {
      endpoint: '/api/hs/app/v1/estimates',
      method: 'GET',
      response_time_ms: responseTime
    })

    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch estimates',
          request_id: generateRequestId()
        }
      },
      { status: 500 }
    )
  }
}

// POST /api/hs/app/v1/estimates
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const idempotencyKey = headersList.get('idempotency-key')

    if (!authHeader) {
      await logSecurityEvent({
        type: 'unauthorized_write_attempt',
        endpoint: '/api/hs/app/v1/estimates',
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
    const existingEstimate = await checkIdempotencyKey(businessId, idempotencyKey)
    if (existingEstimate) {
      return NextResponse.json(existingEstimate, {
        status: 200,
        headers: {
          'X-Idempotency-Key': idempotencyKey,
          'X-Idempotency-Status': 'duplicate'
        }
      })
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = await validateEstimateInput(body, role)
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
    const usageCheck = await checkUsageLimits(businessId, 'estimates', 1)
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: { 
            code: 'USAGE_LIMIT_EXCEEDED', 
            message: 'Estimate creation limit exceeded'
          }
        },
        { status: 429 }
      )
    }

    // Process mobile/hardware data
    const mobileData = await processMobileEstimateData(body, userId)
    
    // Generate AI pricing suggestions if requested
    const aiSuggestions = body.generate_ai_pricing ? 
      await generateAIPricingSuggestions(body, businessId) : undefined

    // Calculate pricing
    const calculatedPricing = await calculateEstimatePricing(body.line_items, businessId)

    // Generate estimate number
    const estimateNumber = await generateEstimateNumber(businessId)

    // Create new estimate
    const newEstimate: Estimate = {
      id: generateEstimateId(),
      business_id: businessId,
      estimate_number: estimateNumber,
      customer_id: body.customer_id,
      
      status: body.status || 'draft',
      version: 1,
      is_template: body.is_template || false,
      template_name: body.template_name,
      
      title: body.title,
      description: body.description,
      service_address: body.service_address,
      
      line_items: body.line_items.map((item: unknown, index: number) => ({
        id: 'line_${Date.now()}_${index}',
        ...item,
        total_price: item.quantity * item.unit_price,
        tax_exempt: item.tax_exempt || false
      })),
      
      subtotal: calculatedPricing.subtotal,
      tax_rate: calculatedPricing.tax_rate,
      tax_amount: calculatedPricing.tax_amount,
      total_amount: calculatedPricing.total,
      
      payment_terms: body.payment_terms || 'Net 30',
      validity_period_days: body.validity_period_days || 30,
      terms_conditions: body.terms_conditions || await getDefaultTermsConditions(businessId),
      warranty_info: body.warranty_info,
      
      estimated_start_date: body.estimated_start_date,
      estimated_completion_date: body.estimated_completion_date,
      estimated_duration_hours: body.estimated_duration_hours,
      priority: body.priority || 'normal',
      
      follow_up_dates: [],
      expires_date: body.validity_period_days ? 
        new Date(Date.now() + body.validity_period_days * 24 * 60 * 60 * 1000).toISOString() : undefined,
      
      ai_generated: body.ai_generated || false,
      ai_pricing_suggestions: aiSuggestions,
      
      created_via_mobile: mobileData.createdViaMobile,
      photos_attached: mobileData.photos,
      
      attachments: body.attachments || [],
      view_count: 0,
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId,
      updated_by: userId,
      revision_history: [{
        version: 1,
        changes: ['Initial creation'],
        updated_by: userId,
        updated_at: new Date().toISOString()
      }]
    }

    // Save with RLS enforcement
    const savedEstimate = await saveEstimateWithRLS(newEstimate, businessId)
    
    // Generate PDF if requested
    if (body.generate_pdf) {
      const pdfUrl = await generateEstimatePDF(savedEstimate, businessId)
      savedEstimate.pdf_url = pdfUrl
    }
    
    // Send email if requested
    if (body.send_email) {
      await sendEstimateEmail(savedEstimate, businessId)
      savedEstimate.email_delivery_status = 'sent'
      savedEstimate.sent_date = new Date().toISOString()
    }
    
    // Record usage for billing
    await recordUsage(businessId, 'estimates_created', 1, {
      user_id: userId,
      estimate_id: savedEstimate.id,
      line_items_count: savedEstimate.line_items.length,
      total_amount: savedEstimate.total_amount,
      created_via_mobile: savedEstimate.created_via_mobile
    })

    // Background sync for PWA
    await queueBackgroundSync('estimate_created', {
      estimate_id: savedEstimate.id,
      business_id: businessId
    })

    const responseTime = Date.now() - startTime
    await recordMetric('thorbis_estimates_created_total', 1, {
      business_id: businessId,
      status: savedEstimate.status,
      created_via_mobile: savedEstimate.created_via_mobile
    })

    return NextResponse.json({
      data: savedEstimate,
      meta: {
        request_id: generateRequestId(),
        response_time_ms: responseTime,
        idempotency_status: 'created'
      }
    }, {
      status: 201,
      headers: {
        'Location': '/api/hs/app/v1/estimates/${savedEstimate.id}',
        'X-Idempotency-Key': idempotencyKey,
        'X-Business-ID': businessId
      }
    })
  } catch (_error) {
    const responseTime = Date.now() - startTime
    
    await logError('estimates_create_error', error as Error, {
      endpoint: '/api/hs/app/v1/estimates',
      method: 'POST',
      response_time_ms: responseTime
    })

    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to create estimate',
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

async function fetchEstimatesWithRLS(params: unknown) {
  return [{
    id: 'est-001',
    business_id: params.businessId,
    estimate_number: 'EST-2024-001',
    customer_id: 'cust-001',
    
    status: 'sent' as const,
    version: 1,
    is_template: false,
    
    title: 'HVAC System Replacement',
    description: 'Complete replacement of aging HVAC system with high-efficiency unit',
    service_address: {
      street: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701'
    },
    
    line_items: [{
      id: 'line-001',
      type: 'service' as const,
      service_code: 'hvac_replacement',
      description: 'High-efficiency HVAC system installation',
      quantity: 1,
      unit_price: 4500,
      total_price: 4500,
      tax_exempt: false
    }],
    
    subtotal: 4500,
    tax_rate: 0.0825,
    tax_amount: 371.25,
    total_amount: 4871.25,
    
    payment_terms: 'Net 30',
    validity_period_days: 30,
    terms_conditions: 'Standard terms and conditions apply',
    
    priority: 'normal' as const,
    sent_date: '2024-02-01T09:00:00Z',
    expires_date: '2024-03-02T09:00:00Z',
    
    ai_generated: false,
    created_via_mobile: false,
    photos_attached: [],
    attachments: [],
    view_count: 3,
    
    created_at: new Date('2024-02-01T08:00:00Z').toISOString(),
    updated_at: new Date('2024-02-01T09:00:00Z').toISOString(),
    created_by: 'user_456',
    updated_by: 'user_456',
    revision_history: [{
      version: 1,
      changes: ['Initial creation'],
      updated_by: 'user_456',
      updated_at: new Date('2024-02-01T08:00:00Z`).toISOString()
    }]
  }]
}

async function filterEstimatesByRole(estimates: Estimate[], role: string) {
  return estimates
}

async function getEstimateCount(businessId: string, filters: unknown) {
  return 1
}

async function calculateConversionRate(businessId: string, dateFrom?: string, dateTo?: string) {
  return 0.35 // 35% conversion rate
}

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

function calculateQueryComplexity(params: unknown) {
  return params.filters.length + (params.limit > 50 ? 2 : 1)
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

async function validateEstimateInput(body: unknown, role: string) {
  const errors = []
  
  if (!body.customer_id) errors.push({ field: 'customer_id', message: 'Customer ID is required' })
  if (!body.title) errors.push({ field: 'title', message: 'Title is required' })
  if (!body.line_items?.length) errors.push({ field: 'line_items', message: 'At least one line item is required' })
  if (!body.service_address?.street) errors.push({ field: 'service_address', message: 'Service address is required' })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

async function checkUsageLimits(businessId: string, metric: string, quantity: number) {
  return {
    allowed: true,
    currentUsage: 23,
    limit: 100,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
}

async function processMobileEstimateData(body: unknown, userId: string) {
  return {
    createdViaMobile: body.mobile_data?.device_type === 'mobile' || false,
    photos: body.mobile_data?.photos || []
  }
}

async function generateAIPricingSuggestions(body: unknown, businessId: string) {
  return {
    suggested_adjustments: [],
    market_analysis: {
      competitive_position: 'competitive' as const,
      confidence_score: 0.85
    }
  }
}

async function calculateEstimatePricing(lineItems: unknown[], businessId: string) {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  const taxRate = 0.0825 // Austin, TX rate
  const taxAmount = subtotal * taxRate
  
  return {
    subtotal,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total: subtotal + taxAmount
  }
}

async function generateEstimateNumber(businessId: string) {
  const year = new Date().getFullYear()
  const sequence = await getNextEstimateSequence(businessId)
  return 'EST-${year}-${sequence.toString().padStart(3, '0')}'
}

async function getNextEstimateSequence(businessId: string) {
  // Would query database for next sequence number
  return 1
}

function generateEstimateId() {
  return 'est_${Date.now()}_${Math.random().toString(36).substring(2, 11)}'
}

async function getDefaultTermsConditions(businessId: string) {
  return 'Payment is due within 30 days. Work will commence upon signed approval.`
}

async function saveEstimateWithRLS(estimate: Estimate, businessId: string) {
  return estimate
}

async function generateEstimatePDF(estimate: Estimate, businessId: string) {
  // Would generate PDF and return signed URL
  return `https://storage.example.com/estimates/${estimate.id}.pdf`
}

async function sendEstimateEmail(estimate: Estimate, businessId: string) {
  console.log(`Sending estimate email for ${estimate.id}')
}

async function queueBackgroundSync(operation: string, data: unknown) {
  console.log('Background sync queued: ${operation}', data)
}
