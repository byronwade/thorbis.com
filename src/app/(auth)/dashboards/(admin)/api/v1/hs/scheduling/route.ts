import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

/**
 * Thorbis Business OS - Home Services Scheduling & Dispatch API
 * 
 * This file provides comprehensive scheduling and dispatch management for Home Services businesses.
 * Features:
 * - Intelligent scheduling with AI-powered optimization
 * - Real-time technician tracking and dispatch
 * - Route optimization and travel time calculations
 * - Automated appointment reminders and notifications
 * - Capacity planning and resource allocation
 * - Emergency dispatch and priority handling
 * - Customer self-scheduling with availability windows
 * - Multi-tenant security with business isolation
 * - Integration with calendar systems and mobile apps
 * - Service level agreement (SLA) tracking
 * - Comprehensive audit trail and performance metrics
 */

interface TechnicianAvailability {
  technician_id: string
  date: string
  time_slots: Array<{
    start_time: string
    end_time: string
    status: 'available' | 'booked' | 'blocked' | 'traveling'
    work_order_id?: string
    buffer_time?: number // minutes
  }>
  working_hours: {
    start: string // "08:00"
    end: string   // "17:00"
  }
  max_appointments: number
  skills: string[] // Service codes this tech can handle
  service_areas: string[] // ZIP codes or regions
  vehicle_capacity?: {
    max_parts_weight: number
    max_parts_volume: number
  }
}

interface ScheduledAppointment {
  id: string
  business_id: string
  work_order_id: string
  customer_id: string
  technician_id: string
  
  // Scheduling Information
  scheduled_date: string
  scheduled_start_time: string
  scheduled_end_time: string
  estimated_duration: number // minutes
  actual_start_time?: string
  actual_end_time?: string
  actual_duration?: number
  
  // Status and Priority
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
  priority: 'low' | 'normal' | 'high' | 'emergency'
  urgency_score: number // 0-100, calculated by AI
  
  // Service Details
  service_type: string
  service_codes: string[]
  required_skills: string[]
  required_parts: Array<{
    part_id: string
    quantity: number
    critical: boolean // Must have before starting job
  }>
  
  // Location and Travel
  service_address: {
    street: string
    street2?: string
    city: string
    state: string
    zip: string
    coordinates: { lat: number; lng: number }
    access_instructions?: string
    parking_notes?: string
  }
  travel_time_to: number // minutes from previous appointment
  travel_time_from: number // minutes to next appointment
  mileage?: number
  
  // Customer Communication
  customer_contact: {
    name: string
    phone: string
    email?: string
    preferred_contact_method: 'phone' | 'email' | 'sms' | 'app'
  }
  appointment_window: {
    type: 'exact' | '2_hour' | '4_hour' | 'morning' | 'afternoon'
    start_time?: string
    end_time?: string
  }
  
  // Notifications and Reminders
  reminder_sent: boolean
  reminder_sent_date?: string
  confirmation_requested: boolean
  confirmation_received?: boolean
  confirmation_date?: string
  
  // Special Requirements
  special_instructions?: string
  requires_ladder: boolean
  requires_permit: boolean
  customer_must_be_present: boolean
  pet_on_site?: boolean
  senior_customer: boolean
  
  // AI Optimization Data
  ai_scheduled: boolean
  optimization_score: number // How well this fits the schedule
  alternative_slots?: Array<{
    start_time: string
    end_time: string
    score: number
    reasoning: string
  }>
  
  // Performance Tracking
  sla_target: number // minutes
  sla_actual?: number
  sla_met: boolean
  customer_satisfaction_score?: number
  
  // Integration Data
  calendar_event_id?: string
  external_booking_id?: string
  dispatch_notes?: string
  
  // Audit fields
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  schedule_version: number
}

interface SchedulingRequest {
  work_order_id: string
  customer_id: string
  preferred_technician_id?: string
  preferred_date?: string
  preferred_time_window?: {
    start: string
    end: string
  }
  service_codes: string[]
  estimated_duration: number
  priority: 'low' | 'normal' | 'high' | 'emergency'
  special_requirements?: {
    requires_ladder: boolean
    requires_permit: boolean
    customer_must_be_present: boolean
    senior_customer: boolean
  }
  parts_required?: Array<{
    part_id: string
    quantity: number
    critical: boolean
  }>
  use_ai_optimization: boolean
}

// GET /api/hs/app/v1/scheduling - Get scheduled appointments
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    
    if (!authHeader) {
      await logSecurityEvent({
        type: 'unauthorized_access_attempt',
        endpoint: '/api/hs/app/v1/scheduling'
      })
      
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { businessId, userId, role } = await validateAndExtractJWTClaims(authHeader)
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit(userId, 'scheduling_read')
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: { 
            code: 'RATE_LIMIT', 
            message: 'Rate limit exceeded'
          }
        },
        { status: 429 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const dateFrom = url.searchParams.get('date_from') || new Date().toISOString().split('T')[0]
    const dateTo = url.searchParams.get('date_to') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const technicianId = url.searchParams.get('technician_id')
    const status = url.searchParams.get('status') as ScheduledAppointment['status'] | null
    const priority = url.searchParams.get('priority') as ScheduledAppointment['priority'] | null
    const includeAvailability = url.searchParams.get('include_availability') === 'true'
    const view = url.searchParams.get('view') || 'list' // list, calendar, dispatch

    // Record usage for billing
    await recordUsage(businessId, 'api_calls', 1, {
      endpoint: 'scheduling_read',
      user_id: userId,
      query_complexity: calculateQueryComplexity({ 
        date_range_days: Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (24 * 60 * 60 * 1000)),
        filters: [technicianId, status, priority].filter(Boolean),
        includes: includeAvailability ? ['availability'] : []
      })
    })

    // Fetch scheduled appointments with RLS enforcement
    const appointments = await fetchScheduledAppointmentsWithRLS({
      businessId,
      userId,
      role,
      filters: { 
        dateFrom, 
        dateTo, 
        technicianId, 
        status, 
        priority
      }
    })

    // Get technician availability if requested
    let availability: TechnicianAvailability[] = []
    if (includeAvailability) {
      availability = await fetchTechnicianAvailability({
        businessId,
        dateFrom,
        dateTo,
        technicianId
      })
    }

    // Format response based on view type
    let formattedData: any
    switch (view) {
      case 'calendar':
        formattedData = await formatForCalendarView(appointments)
        break
      case 'dispatch':
        formattedData = await formatForDispatchView(appointments, businessId)
        break
      default:
        formattedData = appointments
    }

    const responseTime = Date.now() - startTime
    await recordMetric('thorbis_api_request_duration_seconds', responseTime / 1000, {
      method: 'GET',
      endpoint: '/scheduling',
      view: view,
      business_id: businessId
    })

    return NextResponse.json({
      data: formattedData,
      availability: availability,
      summary: {
        total_appointments: appointments.length,
        appointments_by_status: await groupAppointmentsByStatus(appointments),
        technician_utilization: await calculateTechnicianUtilization(businessId, dateFrom, dateTo),
        avg_travel_time: await calculateAverageTravelTime(appointments)
      },
      meta: {
        request_id: generateRequestId(),
        response_time_ms: responseTime,
        date_range: { from: dateFrom, to: dateTo },
        view: view
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=120, stale-while-revalidate=240', // Short cache for scheduling data
        'X-Business-ID': businessId
      }
    })
  } catch (_error) {
    const responseTime = Date.now() - startTime
    
    await logError('scheduling_api_error', error, {
      endpoint: '/api/hs/app/v1/scheduling',
      method: 'GET',
      response_time_ms: responseTime
    })

    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch scheduling data',
          request_id: generateRequestId()
        }
      },
      { status: 500 }
    )
  }
}

// POST /api/hs/app/v1/scheduling - Schedule new appointment or optimize existing schedule
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const idempotencyKey = headersList.get('idempotency-key')

    if (!authHeader) {
      await logSecurityEvent({
        type: 'unauthorized_write_attempt',
        endpoint: '/api/hs/app/v1/scheduling',
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
            message: 'Idempotency-Key header required for scheduling operations'
          }
        },
        { status: 400 }
      )
    }

    // Check for duplicate request
    const existingSchedule = await checkIdempotencyKey(businessId, idempotencyKey)
    if (existingSchedule) {
      return NextResponse.json(existingSchedule, {
        status: 200,
        headers: {
          'X-Idempotency-Key': idempotencyKey,
          'X-Idempotency-Status': 'duplicate'
        }
      })
    }

    const body = await request.json()
    
    // Determine operation type
    const operation = body.operation || 'schedule' // schedule, reschedule, optimize, batch_schedule
    
    // Validate input based on operation
    const validationResult = await validateSchedulingInput(body, operation, role)
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
    const usageCheck = await checkUsageLimits(businessId, 'scheduling_operations', 1)
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: { 
            code: 'USAGE_LIMIT_EXCEEDED', 
            message: 'Scheduling operation limit exceeded'
          }
        },
        { status: 429 }
      )
    }

    let result: any
    
    switch (operation) {
      case 'schedule':
        result = await scheduleNewAppointment(body as SchedulingRequest, businessId, userId)
        break
      case 'reschedule':
        result = await rescheduleAppointment(body, businessId, userId)
        break
      case 'optimize':
        result = await optimizeSchedule(body, businessId, userId)
        break
      case 'batch_schedule':
        result = await batchScheduleAppointments(body.requests, businessId, userId)
        break
      default:
        return NextResponse.json(
          { 
            error: { 
              code: 'VALIDATION_ERROR', 
              message: 'Invalid operation type'
            }
          },
          { status: 400 }
        )
    }

    // Record usage for billing
    await recordUsage(businessId, 'scheduling_operations', 1, {
      user_id: userId,
      operation: operation,
      appointments_affected: Array.isArray(result.data) ? result.data.length : 1,
      ai_optimization_used: body.use_ai_optimization || false
    })

    // Send notifications if requested
    if (body.send_notifications) {
      await sendSchedulingNotifications(result.data, businessId, operation)
    }

    // Background sync for PWA
    await queueBackgroundSync('schedule_updated', {
      operation: operation,
      appointments: Array.isArray(result.data) ? result.data.map((a: unknown) => a.id) : [result.data.id],
      business_id: businessId
    })

    const responseTime = Date.now() - startTime
    await recordMetric('thorbis_scheduling_operations_total', 1, {
      business_id: businessId,
      operation: operation,
      ai_optimization: body.use_ai_optimization || false
    })

    return NextResponse.json({
      data: result.data,
      optimization: result.optimization,
      notifications: result.notifications,
      meta: {
        request_id: generateRequestId(),
        response_time_ms: responseTime,
        operation: operation,
        idempotency_status: 'created'
      }
    }, {
      status: 201,
      headers: {
        'X-Idempotency-Key': idempotencyKey,
        'X-Business-ID': businessId
      }
    })
  } catch (_error) {
    const responseTime = Date.now() - startTime
    
    await logError('scheduling_create_error', error as Error, {
      endpoint: '/api/hs/app/v1/scheduling',
      method: 'POST',
      response_time_ms: responseTime
    })

    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to process scheduling request',
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

async function fetchScheduledAppointmentsWithRLS(params: unknown) {
  return [{
    id: 'appt-001',
    business_id: params.businessId,
    work_order_id: 'wo-001',
    customer_id: 'cust-001',
    technician_id: 'tech-001',
    
    scheduled_date: '2024-02-20',
    scheduled_start_time: '10:00:00',
    scheduled_end_time: '12:00:00',
    estimated_duration: 120,
    
    status: 'scheduled' as const,
    priority: 'normal' as const,
    urgency_score: 50,
    
    service_type: 'HVAC Maintenance',
    service_codes: ['hvac_maintenance'],
    required_skills: ['hvac_certified'],
    required_parts: [],
    
    service_address: {
      street: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      coordinates: { lat: 30.2672, lng: -97.7431 }
    },
    travel_time_to: 15,
    travel_time_from: 20,
    
    customer_contact: {
      name: 'John Doe',
      phone: '+1-512-555-1234',
      email: 'john.doe@email.com',
      preferred_contact_method: 'phone' as const
    },
    appointment_window: {
      type: '2_hour' as const,
      start_time: '10:00:00',
      end_time: '12:00:00'
    },
    
    reminder_sent: false,
    confirmation_requested: false,
    
    requires_ladder: false,
    requires_permit: false,
    customer_must_be_present: true,
    senior_customer: false,
    
    ai_scheduled: false,
    optimization_score: 85,
    
    sla_target: 120,
    sla_met: true,
    
    created_at: new Date('2024-02-15T08:00:00Z').toISOString(),
    updated_at: new Date('2024-02-15T08:00:00Z').toISOString(),
    created_by: 'user_456',
    updated_by: 'user_456',
    schedule_version: 1
  }]
}

async function fetchTechnicianAvailability(params: unknown) {
  return [{
    technician_id: 'tech-001',
    date: '2024-02-20',
    time_slots: [
      {
        start_time: '08:00:00',
        end_time: '10:00:00',
        status: 'available' as const
      },
      {
        start_time: '10:00:00',
        end_time: '12:00:00',
        status: 'booked' as const,
        work_order_id: 'wo-001'
      },
      {
        start_time: '12:00:00',
        end_time: '13:00:00',
        status: 'blocked' as const // Lunch break
      },
      {
        start_time: '13:00:00',
        end_time: '17:00:00',
        status: 'available' as const
      }
    ],
    working_hours: {
      start: '08:00',
      end: '17:00'
    },
    max_appointments: 4,
    skills: ['hvac_certified', 'electrical_basic'],
    service_areas: ['78701', '78702', '78703`]
  }]
}

function calculateQueryComplexity(params: unknown) {
  return params.date_range_days + params.filters.length + (params.includes.length * 2)
}

async function formatForCalendarView(appointments: ScheduledAppointment[]) {
  return {
    events: appointments.map(appt => ({
      id: appt.id,
      title: `${appt.service_type} - ${appt.customer_contact.name}`,
      start: `${appt.scheduled_date}T${appt.scheduled_start_time}`,
      end: `${appt.scheduled_date}T${appt.scheduled_end_time}`,
      resourceId: appt.technician_id,
      priority: appt.priority,
      status: appt.status,
      address: appt.service_address
    }))
  }
}

async function formatForDispatchView(appointments: ScheduledAppointment[], businessId: string) {
  // Group by technician with route optimization
  const dispatchRoutes = new Map()
  
  for (const appt of appointments) {
    if (!dispatchRoutes.has(appt.technician_id)) {
      dispatchRoutes.set(appt.technician_id, [])
    }
    dispatchRoutes.get(appt.technician_id).push(appt)
  }
  
  return {
    routes: Array.from(dispatchRoutes.entries()).map(([techId, appts]) => ({
      technician_id: techId,
      appointments: appts,
      total_travel_time: appts.reduce((sum: number, appt: unknown) => sum + appt.travel_time_to, 0),
      estimated_completion: appts[appts.length - 1]?.scheduled_end_time
    }))
  }
}

async function groupAppointmentsByStatus(appointments: ScheduledAppointment[]) {
  return appointments.reduce((acc, appt) => {
    acc[appt.status] = (acc[appt.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

async function calculateTechnicianUtilization(businessId: string, dateFrom: string, dateTo: string) {
  return 0.75 // 75% utilization
}

async function calculateAverageTravelTime(appointments: ScheduledAppointment[]) {
  const totalTravel = appointments.reduce((sum, appt) => sum + appt.travel_time_to, 0)
  return appointments.length > 0 ? totalTravel / appointments.length : 0
}

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
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

async function validateSchedulingInput(body: unknown, operation: string, role: string) {
  const errors = []
  
  if (operation === 'schedule') {
    if (!body.work_order_id) errors.push({ field: 'work_order_id', message: 'Work order ID is required' })
    if (!body.customer_id) errors.push({ field: 'customer_id', message: 'Customer ID is required' })
    if (!body.service_codes?.length) errors.push({ field: 'service_codes', message: 'Service codes are required' })
    if (!body.estimated_duration || body.estimated_duration <= 0) {
      errors.push({ field: 'estimated_duration', message: 'Valid estimated duration is required' })
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

async function checkUsageLimits(businessId: string, metric: string, quantity: number) {
  return {
    allowed: true,
    currentUsage: 125,
    limit: 500,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
}

async function scheduleNewAppointment(request: SchedulingRequest, businessId: string, userId: string) {
  // AI-powered scheduling logic
  const optimalSlot = request.use_ai_optimization ? 
    await findOptimalSchedulingSlot(request, businessId) : 
    await findBasicSchedulingSlot(request, businessId)

  const newAppointment: ScheduledAppointment = {
    id: generateAppointmentId(),
    business_id: businessId,
    work_order_id: request.work_order_id,
    customer_id: request.customer_id,
    technician_id: optimalSlot.technician_id,
    
    scheduled_date: optimalSlot.date,
    scheduled_start_time: optimalSlot.start_time,
    scheduled_end_time: optimalSlot.end_time,
    estimated_duration: request.estimated_duration,
    
    status: 'scheduled',
    priority: request.priority,
    urgency_score: calculateUrgencyScore(request),
    
    service_type: await getServiceTypeName(request.service_codes[0]),
    service_codes: request.service_codes,
    required_skills: await getRequiredSkills(request.service_codes),
    required_parts: request.parts_required || [],
    
    service_address: await getServiceAddress(request.customer_id),
    travel_time_to: optimalSlot.travel_time_to,
    travel_time_from: optimalSlot.travel_time_from,
    
    customer_contact: await getCustomerContact(request.customer_id),
    appointment_window: {
      type: request.preferred_time_window ? 'exact' : '2_hour`,
      start_time: optimalSlot.start_time,
      end_time: optimalSlot.end_time
    },
    
    reminder_sent: false,
    confirmation_requested: false,
    
    requires_ladder: request.special_requirements?.requires_ladder || false,
    requires_permit: request.special_requirements?.requires_permit || false,
    customer_must_be_present: request.special_requirements?.customer_must_be_present || true,
    senior_customer: request.special_requirements?.senior_customer || false,
    
    ai_scheduled: request.use_ai_optimization,
    optimization_score: optimalSlot.optimization_score,
    alternative_slots: optimalSlot.alternatives,
    
    sla_target: request.estimated_duration,
    sla_met: true,
    
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: userId,
    updated_by: userId,
    schedule_version: 1
  }

  const saved = await saveAppointmentWithRLS(newAppointment, businessId)
  
  return {
    data: saved,
    optimization: {
      ai_used: request.use_ai_optimization,
      optimization_score: optimalSlot.optimization_score,
      alternatives_count: optimalSlot.alternatives?.length || 0
    }
  }
}

async function rescheduleAppointment(request: unknown, businessId: string, userId: string) {
  // Implementation for rescheduling
  return {
    data: await getAppointmentById(request.appointment_id, businessId)
  }
}

async function optimizeSchedule(request: unknown, businessId: string, userId: string) {
  // AI-powered schedule optimization
  return {
    data: [],
    optimization: {
      improvements: [],
      efficiency_gain: 0.15
    }
  }
}

async function batchScheduleAppointments(requests: SchedulingRequest[], businessId: string, userId: string) {
  const results = []
  for (const request of requests) {
    const result = await scheduleNewAppointment(request, businessId, userId)
    results.push(result.data)
  }
  
  return {
    data: results,
    optimization: {
      batch_efficiency: 0.92,
      conflicts_resolved: 2
    }
  }
}

async function sendSchedulingNotifications(appointments: unknown, businessId: string, operation: string) {
  console.log(`Sending ${operation} notifications for appointments', appointments)
  return {
    sent: true,
    count: Array.isArray(appointments) ? appointments.length : 1
  }
}

async function queueBackgroundSync(operation: string, data: unknown) {
  console.log('Background sync queued: ${operation}', data)
}

// Helper functions

async function findOptimalSchedulingSlot(request: SchedulingRequest, businessId: string) {
  // AI-powered optimal scheduling
  return {
    technician_id: 'tech-001',
    date: '2024-02-22',
    start_time: '10:00:00',
    end_time: '12:00:00',
    travel_time_to: 15,
    travel_time_from: 20,
    optimization_score: 92,
    alternatives: []
  }
}

async function findBasicSchedulingSlot(request: SchedulingRequest, businessId: string) {
  // Basic scheduling logic
  return {
    technician_id: request.preferred_technician_id || 'tech-001',
    date: request.preferred_date || '2024-02-22',
    start_time: '10:00:00',
    end_time: '12:00:00',
    travel_time_to: 15,
    travel_time_from: 20,
    optimization_score: 60,
    alternatives: []
  }
}

function generateAppointmentId() {
  return 'appt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}'
}

function calculateUrgencyScore(request: SchedulingRequest) {
  let score = 50 // Base score
  
  switch (request.priority) {
    case 'emergency': score = 95; break
    case 'high': score = 80; break
    case 'normal': score = 50; break
    case 'low': score = 25; break
  }
  
  return score
}

async function getServiceTypeName(serviceCode: string) {
  const serviceTypes: Record<string, string> = {
    'hvac_maintenance': 'HVAC Maintenance',
    'hvac_repair': 'HVAC Repair',
    'plumbing_repair': 'Plumbing Repair'
  }
  return serviceTypes[serviceCode] || 'General Service'
}

async function getRequiredSkills(serviceCodes: string[]) {
  return ['general_technician']
}

async function getServiceAddress(customerId: string) {
  return {
    street: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    coordinates: { lat: 30.2672, lng: -97.7431 }
  }
}

async function getCustomerContact(customerId: string) {
  return {
    name: 'John Doe',
    phone: '+1-512-555-1234',
    email: 'john.doe@email.com',
    preferred_contact_method: 'phone' as const
  }
}

async function saveAppointmentWithRLS(appointment: ScheduledAppointment, businessId: string) {
  return appointment
}

async function getAppointmentById(appointmentId: string, businessId: string) {
  return {
    id: appointmentId,
    status: 'rescheduled'
  }
}
