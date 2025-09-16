import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Service request schema for portal users
const ServiceRequestSchema = z.object({
  service_type: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  
  preferred_date: z.string().date().optional(),
  preferred_time_slot: z.enum(['morning', 'afternoon', 'evening', 'any_time']).default('any_time'),
  
  location: z.object({
    is_primary_address: z.boolean().default(true),
    address: z.string().optional(),
    city: z.string().optional(),
    state_province: z.string().optional(),
    postal_code: z.string().optional(),
    special_instructions: z.string().optional(),
  }).default({}),
  
  attachments: z.array(z.object({
    filename: z.string(),
    file_type: z.string(),
    file_size: z.number(),
    description: z.string().optional(),
    storage_path: z.string(),
  })).optional(),
  
  contact_preferences: z.object({
    preferred_method: z.enum(['phone', 'email', 'sms']).default('phone'),
    best_time_to_contact: z.enum(['morning', 'afternoon', 'evening', 'any_time']).default('any_time'),
    phone_number: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
  
  // Portal-specific fields
  portal_access_token: z.string().min(32).max(64),
});

const RequestQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  
  // Filters
  status: z.enum(['submitted', 'reviewed', 'approved', 'scheduled', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  service_type: z.string().optional(),
  
  // Date filters
  submitted_from: z.string().datetime().optional(),
  submitted_to: z.string().datetime().optional(),
  preferred_date_from: z.string().date().optional(),
  preferred_date_to: z.string().date().optional(),
  
  // Sorting
  sort: z.enum(['submitted_at', 'preferred_date', 'priority', 'status']).default('submitted_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  
  // Include options
  include_customer_details: z.boolean().default(true),
  include_attachments: z.boolean().default(false),
});

// Helper function to validate portal access
async function validatePortalAccess(accessToken: string) {
  const { data: portalAccess } = await supabase
    .from('hs.customer_portal_access')
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
  if (!portalAccess.permissions?.can_request_service) {
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

// Helper function to log portal activity
async function logPortalActivity(
  portalAccessId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string
) {
  await supabase
    .from('hs.portal_activity_log')
    .insert({
      portal_access_id: portalAccessId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
    });
}

// GET /api/v1/hs/portal/requests - List service requests (admin view)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = RequestQuerySchema.parse(Object.fromEntries(searchParams));

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
      .from('hs.portal_service_requests`)
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
        portal_access:portal_access_id(access_type),
        assigned_to_user:assigned_to(first_name, last_name)
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }
    
    if (query.priority) {
      supabaseQuery = supabaseQuery.eq('priority', query.priority);
    }
    
    if (query.service_type) {
      supabaseQuery = supabaseQuery.ilike('service_type', '%${query.service_type}%');
    }

    // Date filters
    if (query.submitted_from) {
      supabaseQuery = supabaseQuery.gte('submitted_at', query.submitted_from);
    }
    
    if (query.submitted_to) {
      supabaseQuery = supabaseQuery.lte('submitted_at', query.submitted_to);
    }
    
    if (query.preferred_date_from) {
      supabaseQuery = supabaseQuery.gte('preferred_date', query.preferred_date_from);
    }
    
    if (query.preferred_date_to) {
      supabaseQuery = supabaseQuery.lte('preferred_date', query.preferred_date_to);
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
        { error: 'Failed to fetch service requests' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Get requests statistics
    const { data: allRequests } = await supabase
      .from('hs.portal_service_requests')
      .select('status, priority, submitted_at')
      .eq('organization_id', organizationId);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const summary = {
      total_requests: count || 0,
      pending_requests: allRequests?.filter(r => r.status === 'submitted').length || 0,
      high_priority_requests: allRequests?.filter(r => r.priority === 'high').length || 0,
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
      
      by_priority: allRequests?.reduce((acc, request) => {
        acc[request.priority] = (acc[request.priority] || 0) + 1;
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
    console.error('GET /api/v1/hs/portal/requests error:', error);
    
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

// POST /api/v1/hs/portal/requests - Submit service request (customer portal)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestData = ServiceRequestSchema.parse(body);

    // Validate portal access
    const portalAccess = await validatePortalAccess(requestData.portal_access_token);
    if (!portalAccess) {
      return NextResponse.json(
        { error: 'Invalid or expired portal access' },
        { status: 401 }
      );
    }

    const customer = portalAccess.customer;
    const organizationId = portalAccess.organization_id;

    // Determine service location
    let serviceLocation = {};
    if (requestData.location?.is_primary_address) {
      // Use customer's primary address
      const { data: customerData } = await supabase
        .from('hs.customers')
        .select('address, city, state_province, postal_code')
        .eq('id', customer.id)
        .single();
        
      serviceLocation = {
        address: customerData?.address,
        city: customerData?.city,
        state_province: customerData?.state_province,
        postal_code: customerData?.postal_code,
        special_instructions: requestData.location?.special_instructions,
      };
    } else {
      serviceLocation = requestData.location;
    }

    // Generate request number
    const requestNumber = 'SR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}';

    // Create service request
    const { data: serviceRequest, error } = await supabase
      .from('hs.portal_service_requests')
      .insert({
        request_number: requestNumber,
        customer_id: customer.id,
        portal_access_id: portalAccess.id,
        service_type: requestData.service_type,
        description: requestData.description,
        priority: requestData.priority,
        preferred_date: requestData.preferred_date,
        preferred_time_slot: requestData.preferred_time_slot,
        service_location: serviceLocation,
        contact_preferences: requestData.contact_preferences,
        attachments: requestData.attachments,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to submit service request' },
        { status: 500 }
      );
    }

    // Update portal access last activity
    await supabase
      .from('hs.customer_portal_access')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', portalAccess.id);

    // Log portal activity
    await logPortalActivity(
      portalAccess.id,
      'service_request_submitted',
      'Service request submitted: ${requestData.service_type}',
      {
        request_id: serviceRequest.id,
        request_number: requestNumber,
        service_type: requestData.service_type,
        priority: requestData.priority,
        preferred_date: requestData.preferred_date,
      },
      organizationId
    );

    // Send notification to staff (would be implemented via notification system)
    // await sendNotification({
    //   type: 'service_request_submitted',
    //   organizationId,
    //   data: serviceRequest,
    // });

    return NextResponse.json({
      service_request: {
        ...serviceRequest,
        customer: {
          id: customer.id,
          name: '${customer.first_name} ${customer.last_name}',
          email: customer.email,
        },
      },
      message: 'Service request submitted successfully',
      request_number: requestNumber,
      estimated_response_time: '24 hours',
      next_steps: [
        'Your request has been received and assigned a tracking number',
        'Our team will review your request within 24 hours',
        'You will receive an email confirmation shortly',
        'A team member will contact you to schedule the service',
      ],
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/hs/portal/requests error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid service request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}