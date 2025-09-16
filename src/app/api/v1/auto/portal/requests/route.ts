import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Auto service request schema for portal users
const AutoServiceRequestSchema = z.object({
  portal_access_token: z.string().min(32).max(64),
  
  // Vehicle information
  vehicle_id: z.string().uuid().optional(),
  vehicle_info: z.object({
    make: z.string().min(1).max(50),
    model: z.string().min(1).max(50),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    vin: z.string().length(17).optional(),
    license_plate: z.string().max(20).optional(),
    mileage: z.number().min(0).optional(),
    color: z.string().max(30).optional(),
    engine_type: z.string().max(50).optional(),
    fuel_type: z.enum(['gasoline', 'diesel', 'hybrid', 'electric', 'other']).optional(),
  }),
  
  // Service request details
  service_type: z.enum(['maintenance', 'repair', 'diagnostic', 'inspection', 'estimate', 'warranty_work', 'recall_service']),
  service_category: z.array(z.enum([
    'engine', 'transmission', 'brakes', 'electrical', 'air_conditioning',
    'suspension', 'steering', 'exhaust', 'cooling_system', 'fuel_system',
    'tires', 'alignment', 'body_work', 'paint', 'interior', 'glass', 'other'
  ])).min(1),
  
  // Problem description
  symptoms_description: z.string().min(10).max(2000),
  when_problem_occurs: z.enum(['always', 'startup', 'driving', 'braking', 'turning', 'parking', 'intermittent']).optional(),
  problem_duration: z.enum(['just_started', 'few_days', 'few_weeks', 'few_months', 'ongoing']).optional(),
  warning_lights: z.array(z.string()).optional(), // e.g., ['check_engine', 'abs', 'battery']
  unusual_noises: z.boolean().default(false),
  fluid_leaks: z.boolean().default(false),
  
  // Service preferences
  preferred_appointment_date: z.string().date().optional(),
  preferred_time_slot: z.enum(['early_morning', 'morning', 'afternoon', 'evening', 'any_time']).default('any_time'),
  urgency: z.enum(['routine', 'soon', 'urgent', 'emergency']).default('routine'),
  drop_off_type: z.enum(['appointment', 'early_drop_off', 'after_hours']).default('appointment'),
  
  // Additional services
  additional_services: z.object({
    needs_loaner_car: z.boolean().default(false),
    loaner_car_type: z.enum(['compact', 'sedan', 'suv', 'truck', 'any']).optional(),
    needs_pickup_delivery: z.boolean().default(false),
    pickup_delivery_address: z.string().optional(),
    needs_rental_discount: z.boolean().default(false),
    ok_with_aftermarket_parts: z.boolean().default(true),
    warranty_work_only: z.boolean().default(false),
    rush_service: z.boolean().default(false),
    multi_point_inspection: z.boolean().default(false),
  }).optional(),
  
  // Budget and approval
  estimated_budget: z.number().min(0).optional(),
  auto_approve_under: z.number().min(0).optional(), // Auto-approve repairs under this amount
  requires_estimate_approval: z.boolean().default(true),
  payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'check', 'financing', 'insurance']).optional(),
  
  // Contact and communication
  contact_preferences: z.object({
    preferred_method: z.enum(['phone', 'email', 'sms', 'portal']).default('phone'),
    can_contact_at_work: z.boolean().default(true),
    best_time_to_contact: z.enum(['morning', 'afternoon', 'evening', 'any_time']).default('any_time'),
    emergency_contact: z.object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    }).optional(),
    send_progress_updates: z.boolean().default(true),
    send_completion_notification: z.boolean().default(true),
  }).optional(),
  
  // Insurance information
  insurance_info: z.object({
    is_insurance_claim: z.boolean().default(false),
    insurance_company: z.string().optional(),
    policy_number: z.string().optional(),
    claim_number: z.string().optional(),
    deductible_amount: z.number().min(0).optional(),
    has_rental_coverage: z.boolean().default(false),
    adjuster_name: z.string().optional(),
    adjuster_phone: z.string().optional(),
  }).optional(),
  
  // Vehicle condition and photos
  attachments: z.array(z.object({
    filename: z.string(),
    file_type: z.string(),
    file_size: z.number(),
    description: z.string().optional(),
    storage_path: z.string(),
    photo_type: z.enum(['damage', 'vehicle_exterior', 'vehicle_interior', 'document', 'other']).optional(),
  })).optional(),
  
  notes: z.string().optional(),
});

const AutoRequestQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  
  // Filters
  status: z.enum(['submitted', 'reviewed', 'estimate_provided', 'approved', 'in_progress', 'completed', 'picked_up', 'cancelled']).optional(),
  urgency: z.enum(['routine', 'soon', 'urgent', 'emergency']).optional(),
  service_type: z.enum(['maintenance', 'repair', 'diagnostic', 'inspection', 'estimate', 'warranty_work', 'recall_service']).optional(),
  service_category: z.string().optional(),
  
  // Vehicle filters
  vehicle_make: z.string().optional(),
  vehicle_model: z.string().optional(),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  
  // Date filters
  submitted_from: z.string().datetime().optional(),
  submitted_to: z.string().datetime().optional(),
  preferred_date_from: z.string().date().optional(),
  preferred_date_to: z.string().date().optional(),
  
  // Special filters
  needs_loaner: z.boolean().optional(),
  insurance_claim: z.boolean().optional(),
  warranty_work: z.boolean().optional(),
  
  // Sorting
  sort: z.enum(['submitted_at', 'preferred_date', 'urgency', 'status', 'vehicle_year']).default('submitted_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  
  // Include options
  include_customer_details: z.boolean().default(true),
  include_vehicle_details: z.boolean().default(true),
  include_attachments: z.boolean().default(false),
});

// Helper function to validate portal access
async function validateAutoPortalAccess(accessToken: string) {
  const { data: portalAccess } = await supabase
    .from('auto.customer_portal_access')
    .select('
      *,
      customer:customer_id(id, first_name, last_name, email, phone)
    ')
    .eq('access_token', accessToken)
    .eq('is_active', true)
    .single();

  if (!portalAccess) {
    return null;
  }

  // Check if access has expired
  if (portalAccess.expires_at && new Date(portalAccess.expires_at) < new Date()) {
    return null;
  }

  // Check permissions
  if (!portalAccess.permissions?.can_schedule_service) {
    return null;
  }

  return portalAccess;
}

// Helper function to get user's organization  
async function getUserOrganization(userId: string) {
  const { data: membership } = await supabase
    .from('user_mgmt.organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  return membership?.organization_id;
}

// Helper function to log auto portal activity
async function logAutoPortalActivity(
  portalAccessId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string
) {
  await supabase
    .from('auto.portal_activity_log')
    .insert({
      portal_access_id: portalAccessId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
    });
}

// GET /api/v1/auto/portal/requests - List auto service requests (admin view)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = AutoRequestQuerySchema.parse(Object.fromEntries(searchParams));

    // Get authenticated user (admin/staff)
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get user's organization
    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    // Build query
    let supabaseQuery = supabase
      .from('auto.portal_service_requests`)
      .select('
        *,
        ${query.include_customer_details ? '
          customer:customer_id(
            id,
            first_name,
            last_name,
            company_name,
            email,
            phone,
            customer_type
          ),
        ' : '}
        ${query.include_vehicle_details ? '
          vehicle:vehicle_id(
            id,
            make,
            model,
            year,
            vin,
            license_plate,
            mileage
          ),
        ' : '}
        portal_access:portal_access_id(access_type),
        assigned_to_user:assigned_to(first_name, last_name)
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }
    
    if (query.urgency) {
      supabaseQuery = supabaseQuery.eq('urgency', query.urgency);
    }
    
    if (query.service_type) {
      supabaseQuery = supabaseQuery.eq('service_type', query.service_type);
    }
    
    if (query.service_category) {
      supabaseQuery = supabaseQuery.contains('service_category', [query.service_category]);
    }

    // Vehicle filters
    if (query.vehicle_make) {
      supabaseQuery = supabaseQuery.ilike('vehicle_info->make', '%${query.vehicle_make}%');
    }
    
    if (query.vehicle_model) {
      supabaseQuery = supabaseQuery.ilike('vehicle_info->model', '%${query.vehicle_model}%');
    }
    
    if (query.vehicle_year) {
      supabaseQuery = supabaseQuery.eq('vehicle_info->year', query.vehicle_year);
    }

    // Date filters
    if (query.submitted_from) {
      supabaseQuery = supabaseQuery.gte('submitted_at', query.submitted_from);
    }
    
    if (query.submitted_to) {
      supabaseQuery = supabaseQuery.lte('submitted_at', query.submitted_to);
    }
    
    if (query.preferred_date_from) {
      supabaseQuery = supabaseQuery.gte('preferred_appointment_date', query.preferred_date_from);
    }
    
    if (query.preferred_date_to) {
      supabaseQuery = supabaseQuery.lte('preferred_appointment_date', query.preferred_date_to);
    }

    // Special filters
    if (query.needs_loaner !== undefined) {
      supabaseQuery = supabaseQuery.eq('additional_services->needs_loaner_car', query.needs_loaner);
    }
    
    if (query.insurance_claim !== undefined) {
      supabaseQuery = supabaseQuery.eq('insurance_info->is_insurance_claim', query.insurance_claim);
    }
    
    if (query.warranty_work !== undefined) {
      supabaseQuery = supabaseQuery.eq('additional_services->warranty_work_only', query.warranty_work);
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: requests, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch auto service requests' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Get requests statistics
    const { data: allRequests } = await supabase
      .from('auto.portal_service_requests')
      .select('status, urgency, submitted_at, service_type, additional_services, insurance_info')
      .eq('organization_id', organizationId);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const summary = {
      total_requests: count || 0,
      pending_requests: allRequests?.filter(r => r.status === 'submitted').length || 0,
      urgent_requests: allRequests?.filter(r => r.urgency === 'urgent' || r.urgency === 'emergency').length || 0,
      loaner_requests: allRequests?.filter(r => r.additional_services?.needs_loaner_car).length || 0,
      insurance_claims: allRequests?.filter(r => r.insurance_info?.is_insurance_claim).length || 0,
      
      requests_last_24h: allRequests?.filter(r => 
        new Date(r.submitted_at) > twentyFourHoursAgo
      ).length || 0,
      requests_last_7d: allRequests?.filter(r => 
        new Date(r.submitted_at) > sevenDaysAgo
      ).length || 0,
      
      by_status: allRequests?.reduce((acc, request) => {
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_urgency: allRequests?.reduce((acc, request) => {
        acc[request.urgency] = (acc[request.urgency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_service_type: allRequests?.reduce((acc, request) => {
        acc[request.service_type] = (acc[request.service_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    };

    return NextResponse.json({
      service_requests: requests || [],
      summary,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/auto/portal/requests error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/auto/portal/requests - Submit auto service request (customer portal)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestData = AutoServiceRequestSchema.parse(body);

    // Validate portal access
    const portalAccess = await validateAutoPortalAccess(requestData.portal_access_token);
    if (!portalAccess) {
      return NextResponse.json(
        { error: 'Invalid or expired portal access' },
        { status: 401 }
      );
    }

    const customer = portalAccess.customer;
    const organizationId = portalAccess.organization_id;

    // Get or create vehicle record
    let vehicleId = requestData.vehicle_id;
    if (!vehicleId && requestData.vehicle_info.vin) {
      // Try to find existing vehicle by VIN
      const { data: existingVehicle } = await supabase
        .from('auto.vehicles')
        .select('id')
        .eq('vin', requestData.vehicle_info.vin)
        .eq('customer_id', customer.id)
        .single();

      if (existingVehicle) {
        vehicleId = existingVehicle.id;
      } else {
        // Create new vehicle record
        const { data: newVehicle } = await supabase
          .from('auto.vehicles')
          .insert({
            customer_id: customer.id,
            make: requestData.vehicle_info.make,
            model: requestData.vehicle_info.model,
            year: requestData.vehicle_info.year,
            vin: requestData.vehicle_info.vin,
            license_plate: requestData.vehicle_info.license_plate,
            current_mileage: requestData.vehicle_info.mileage,
            color: requestData.vehicle_info.color,
            engine_type: requestData.vehicle_info.engine_type,
            fuel_type: requestData.vehicle_info.fuel_type,
            organization_id: organizationId,
          })
          .select('id')
          .single();

        vehicleId = newVehicle?.id;
      }
    }

    // Generate request number
    const requestNumber = 'ASR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}';

    // Determine priority based on urgency and symptoms
    let calculatedPriority = 'medium';
    if (requestData.urgency === 'emergency') calculatedPriority = 'critical';
    else if (requestData.urgency === 'urgent') calculatedPriority = 'high';
    else if (requestData.urgency === 'routine') calculatedPriority = 'low';

    // Create auto service request
    const { data: serviceRequest, error } = await supabase
      .from('auto.portal_service_requests')
      .insert({
        request_number: requestNumber,
        customer_id: customer.id,
        vehicle_id: vehicleId,
        portal_access_id: portalAccess.id,
        vehicle_info: requestData.vehicle_info,
        service_type: requestData.service_type,
        service_category: requestData.service_category,
        symptoms_description: requestData.symptoms_description,
        when_problem_occurs: requestData.when_problem_occurs,
        problem_duration: requestData.problem_duration,
        warning_lights: requestData.warning_lights,
        unusual_noises: requestData.unusual_noises,
        fluid_leaks: requestData.fluid_leaks,
        preferred_appointment_date: requestData.preferred_appointment_date,
        preferred_time_slot: requestData.preferred_time_slot,
        urgency: requestData.urgency,
        drop_off_type: requestData.drop_off_type,
        additional_services: requestData.additional_services,
        estimated_budget: requestData.estimated_budget,
        auto_approve_under: requestData.auto_approve_under,
        requires_estimate_approval: requestData.requires_estimate_approval,
        payment_method: requestData.payment_method,
        contact_preferences: requestData.contact_preferences,
        insurance_info: requestData.insurance_info,
        attachments: requestData.attachments,
        notes: requestData.notes,
        priority: calculatedPriority,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to submit auto service request' },
        { status: 500 }
      );
    }

    // Update portal access last activity
    await supabase
      .from('auto.customer_portal_access')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', portalAccess.id);

    // Log portal activity
    await logAutoPortalActivity(
      portalAccess.id,
      'auto_service_request_submitted',
      'Auto service request submitted: ${requestData.service_type} for ${requestData.vehicle_info.year} ${requestData.vehicle_info.make} ${requestData.vehicle_info.model}',
      {
        request_id: serviceRequest.id,
        request_number: requestNumber,
        service_type: requestData.service_type,
        service_category: requestData.service_category,
        urgency: requestData.urgency,
        vehicle_info: requestData.vehicle_info,
        estimated_budget: requestData.estimated_budget,
      },
      organizationId
    );

    // Determine estimated response time based on urgency
    let estimatedResponseTime = '48 hours';
    if (requestData.urgency === 'emergency') estimatedResponseTime = '2 hours';
    else if (requestData.urgency === 'urgent') estimatedResponseTime = '8 hours';
    else if (requestData.urgency === 'soon') estimatedResponseTime = '24 hours';

    return NextResponse.json({
      service_request: {
        ...serviceRequest,
        customer: {
          id: customer.id,
          name: '${customer.first_name} ${customer.last_name}',
          email: customer.email,
        },
      },
      message: 'Auto service request submitted successfully',
      request_number: requestNumber,
      estimated_response_time: estimatedResponseTime,
      next_steps: [
        'Your auto service request has been received and assigned a tracking number',
        'Our service advisor will review your request within ${estimatedResponseTime}',
        'You will receive an email confirmation with request details',
        'A service advisor will contact you to discuss the service and schedule an appointment',
        requestData.additional_services?.needs_loaner_car ? 'Loaner car availability will be confirmed during scheduling' : ',
        requestData.insurance_info?.is_insurance_claim ? 'Insurance claim information has been noted for processing' : ',
      ].filter(Boolean),
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/auto/portal/requests error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid auto service request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}