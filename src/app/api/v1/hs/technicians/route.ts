import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Technician validation schemas
const TechnicianSchema = z.object({
  user_id: z.string().uuid().optional(),
  employee_id: z.string().max(50).optional(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  emergency_contact_name: z.string().max(100).optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  
  // Employment details
  hire_date: z.string().date().optional(),
  employment_status: z.enum(['active', 'inactive', 'terminated', 'suspended']).default('active'),
  job_title: z.string().max(100).optional(),
  pay_rate: z.number().min(0).optional(),
  pay_type: z.enum(['hourly', 'salary', 'commission', 'piece_rate']).default('hourly'),
  
  // Skills and certifications
  specializations: z.array(z.string()).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().optional(),
    issue_date: z.string().date().optional(),
    expiry_date: z.string().date().optional(),
    certificate_number: z.string().optional(),
  })).optional(),
  skill_level: z.number().min(1).max(5).optional(),
  
  // Scheduling and availability
  default_schedule: z.object({
    monday: z.object({ start: z.string().time(), end: z.string().time() }).optional(),
    tuesday: z.object({ start: z.string().time(), end: z.string().time() }).optional(),
    wednesday: z.object({ start: z.string().time(), end: z.string().time() }).optional(),
    thursday: z.object({ start: z.string().time(), end: z.string().time() }).optional(),
    friday: z.object({ start: z.string().time(), end: z.string().time() }).optional(),
    saturday: z.object({ start: z.string().time(), end: z.string().time() }).optional(),
    sunday: z.object({ start: z.string().time(), end: z.string().time() }).optional(),
  }).optional(),
  service_radius: z.number().min(1).max(200).default(25),
  
  // Vehicle and equipment
  vehicle_info: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
    license_plate: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  tools_assigned: z.array(z.string()).optional(),
  
  // Status
  current_status: z.enum(['available', 'busy', 'break', 'offline', 'emergency']).default('available'),
});

const TechnicianQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  employment_status: z.enum(['active', 'inactive', 'terminated', 'suspended']).optional(),
  current_status: z.enum(['available', 'busy', 'break', 'offline', 'emergency']).optional(),
  specialization: z.string().optional(),
  skill_level: z.number().min(1).max(5).optional(),
  sort: z.enum(['created_at', 'last_name', 'hire_date', 'jobs_completed', 'average_rating']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

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

// GET /api/v1/hs/technicians - List technicians with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = TechnicianQuerySchema.parse(Object.fromEntries(searchParams));
    
    // Get authenticated user
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

    // Build the query
    let supabaseQuery = supabase
      .from('hs.technicians')
      .select('
        id,
        user_id,
        employee_id,
        first_name,
        last_name,
        email,
        phone,
        emergency_contact_name,
        emergency_contact_phone,
        hire_date,
        employment_status,
        job_title,
        pay_rate,
        pay_type,
        specializations,
        certifications,
        skill_level,
        default_schedule,
        service_radius,
        jobs_completed,
        average_rating,
        customer_satisfaction_score,
        efficiency_rating,
        vehicle_info,
        tools_assigned,
        current_status,
        last_location_update,
        created_at,
        updated_at
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.employment_status) {
      supabaseQuery = supabaseQuery.eq('employment_status', query.employment_status);
    }
    
    if (query.current_status) {
      supabaseQuery = supabaseQuery.eq('current_status', query.current_status);
    }
    
    if (query.skill_level) {
      supabaseQuery = supabaseQuery.eq('skill_level', query.skill_level);
    }
    
    if (query.specialization) {
      supabaseQuery = supabaseQuery.contains('specializations', [query.specialization]);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%,employee_id.ilike.%${query.search}%,email.ilike.%${query.search}%,phone.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: technicians, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch technicians' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      technicians: technicians || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/technicians error:', error);
    
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

// POST /api/v1/hs/technicians - Create new technician
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const technicianData = TechnicianSchema.parse(body);

    // Get authenticated user
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

    // Validate user exists if provided
    if (technicianData.user_id) {
      const { data: userProfile } = await supabase
        .from('user_mgmt.profiles')
        .select('id')
        .eq('id', technicianData.user_id)
        .single();
      
      if (!userProfile) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate employee ID
    if (technicianData.employee_id) {
      const { data: existingTechnician } = await supabase
        .from('hs.technicians')
        .select('id')
        .eq('employee_id', technicianData.employee_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (existingTechnician) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 409 }
        );
      }
    }

    // Create technician
    const { data: technician, error } = await supabase
      .from('hs.technicians')
      .insert({
        ...technicianData,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create technician' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { technician },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/technicians error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid technician data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}