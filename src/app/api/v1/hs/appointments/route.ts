import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Appointment validation schema
const AppointmentSchema = z.object({
  customer_id: z.string().uuid(),
  work_order_id: z.string().uuid().optional(),
  
  // Service details
  service_type: z.enum(['maintenance', 'repair', 'installation', 'inspection', 'consultation', 'emergency']),
  service_category: z.enum(['plumbing', 'hvac', 'electrical', 'general', 'emergency', 'maintenance']),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']).default('normal'),
  
  // Scheduling
  scheduled_date: z.string().date(),
  scheduled_time_start: z.string().time(),
  scheduled_time_end: z.string().time().optional(),
  estimated_duration: z.number().min(15).max(480).default(60), // minutes, 15 min to 8 hours
  
  // Location
  service_address_line_1: z.string().min(1).max(255),
  service_address_line_2: z.string().max(255).optional(),
  service_city: z.string().min(1).max(100),
  service_state_province: z.string().min(1).max(100),
  service_postal_code: z.string().min(1).max(20),
  service_coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional(),
  
  // Assignment
  primary_technician_id: z.string().uuid().optional(),
  additional_technician_ids: z.array(z.string().uuid()).optional(),
  crew_size: z.number().min(1).default(1),
  
  // Appointment details
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  internal_notes: z.string().optional(),
  
  // Customer interaction
  customer_phone: z.string().max(20).optional(),
  customer_email: z.string().email().optional(),
  preferred_contact_method: z.enum(['phone', 'email', 'sms', 'app']).default('phone'),
  
  // Requirements
  special_instructions: z.string().optional(),
  required_tools: z.array(z.string()).default([]),
  required_parts: z.array(z.string()).default([]),
  access_requirements: z.string().optional(),
  
  // Confirmation and reminders
  requires_confirmation: z.boolean().default(true),
  send_reminder: z.boolean().default(true),
  reminder_offset_hours: z.number().min(1).max(168).default(24), // 1 hour to 7 days
  
  // Recurring appointments
  is_recurring: z.boolean().default(false),
  recurring_pattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually']),
    interval: z.number().min(1).default(1),
    end_date: z.string().date().optional(),
    max_occurrences: z.number().min(1).optional(),
  }).optional(),
});

const AppointmentQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']).optional(),
  service_type: z.enum(['maintenance', 'repair', 'installation', 'inspection', 'consultation', 'emergency']).optional(),
  service_category: z.enum(['plumbing', 'hvac', 'electrical', 'general', 'emergency', 'maintenance']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']).optional(),
  customer_id: z.string().uuid().optional(),
  technician_id: z.string().uuid().optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  time_from: z.string().time().optional(),
  time_to: z.string().time().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  is_recurring: z.boolean().optional(),
  requires_confirmation: z.boolean().optional(),
  sort: z.enum(['created_at', 'scheduled_date', 'scheduled_time_start', 'priority', 'status']).default('scheduled_date'),
  order: z.enum(['asc', 'desc']).default('asc'),
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

// Helper function to check technician availability
async function checkTechnicianAvailability(
  technicianId: string, 
  date: string, 
  timeStart: string, 
  duration: number,
  excludeAppointmentId?: string
) {
  const timeEnd = new Date('${date}T${timeStart}');
  timeEnd.setMinutes(timeEnd.getMinutes() + duration);
  
  let query = supabase
    .from('hs.appointments')
    .select('id, scheduled_time_start, scheduled_time_end, estimated_duration')
    .eq('primary_technician_id', technicianId)
    .eq('scheduled_date', date)
    .in('status', ['scheduled', 'confirmed', 'in_progress'])
    .or('scheduled_time_start.lte.${timeStart},scheduled_time_end.gte.${timeStart}');

  if (excludeAppointmentId) {
    query = query.neq('id', excludeAppointmentId);
  }

  const { data: conflicts } = await query;
  return !conflicts || conflicts.length === 0;
}

// Helper function to generate appointment number
async function generateAppointmentNumber(organizationId: string): Promise<string> {
  const { data: appointments } = await supabase
    .from('hs.appointments')
    .select('appointment_number')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(1);

  const currentYear = new Date().getFullYear();
  let nextNumber = 1;

  if (appointments && appointments.length > 0) {
    const lastNumber = appointments[0].appointment_number;
    const match = lastNumber.match(/APT-(\d{4})-(\d+)/);
    if (match && parseInt(match[1]) === currentYear) {
      nextNumber = parseInt(match[2]) + 1;
    }
  }

  return 'APT-${currentYear}-${nextNumber.toString().padStart(6, '0')}';
}

// GET /api/v1/hs/appointments - List appointments with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = AppointmentQuerySchema.parse(Object.fromEntries(searchParams));
    
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
      .from('hs.appointments')
      .select('
        id,
        appointment_number,
        customer_id,
        work_order_id,
        service_type,
        service_category,
        priority,
        scheduled_date,
        scheduled_time_start,
        scheduled_time_end,
        estimated_duration,
        service_address_line_1,
        service_address_line_2,
        service_city,
        service_state_province,
        service_postal_code,
        primary_technician_id,
        additional_technician_ids,
        crew_size,
        title,
        description,
        status,
        customer_phone,
        customer_email,
        preferred_contact_method,
        requires_confirmation,
        confirmed_at,
        send_reminder,
        reminder_sent_at,
        is_recurring,
        created_at,
        updated_at,
        customers:customer_id(
          first_name,
          last_name,
          company_name,
          email,
          phone
        ),
        technicians:primary_technician_id(
          first_name,
          last_name,
          phone,
          employee_id
        ),
        work_orders:work_order_id(
          work_order_number,
          problem_description,
          status
        )
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }
    
    if (query.service_type) {
      supabaseQuery = supabaseQuery.eq('service_type', query.service_type);
    }
    
    if (query.service_category) {
      supabaseQuery = supabaseQuery.eq('service_category', query.service_category);
    }
    
    if (query.priority) {
      supabaseQuery = supabaseQuery.eq('priority', query.priority);
    }
    
    if (query.customer_id) {
      supabaseQuery = supabaseQuery.eq('customer_id', query.customer_id);
    }
    
    if (query.technician_id) {
      supabaseQuery = supabaseQuery.eq('primary_technician_id', query.technician_id);
    }
    
    if (query.date_from) {
      supabaseQuery = supabaseQuery.gte('scheduled_date', query.date_from);
    }
    
    if (query.date_to) {
      supabaseQuery = supabaseQuery.lte('scheduled_date', query.date_to);
    }
    
    if (query.time_from) {
      supabaseQuery = supabaseQuery.gte('scheduled_time_start', query.time_from);
    }
    
    if (query.time_to) {
      supabaseQuery = supabaseQuery.lte('scheduled_time_start', query.time_to);
    }
    
    if (query.city) {
      supabaseQuery = supabaseQuery.ilike('service_city', '%${query.city}%');
    }
    
    if (query.postal_code) {
      supabaseQuery = supabaseQuery.eq('service_postal_code', query.postal_code);
    }
    
    if (query.is_recurring !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_recurring', query.is_recurring);
    }
    
    if (query.requires_confirmation !== undefined) {
      supabaseQuery = supabaseQuery.eq('requires_confirmation', query.requires_confirmation);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'appointment_number.ilike.%${query.search}%,title.ilike.%${query.search}%,description.ilike.%${query.search}%,service_address_line_1.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    
    // Handle composite sorting for date and time
    if (query.sort === 'scheduled_date') {
      supabaseQuery = supabaseQuery
        .order('scheduled_date', { ascending: query.order === 'asc' })
        .order('scheduled_time_start', { ascending: query.order === 'asc' });
    } else {
      supabaseQuery = supabaseQuery.order(query.sort, { ascending: query.order === 'asc' });
    }
    
    supabaseQuery = supabaseQuery.range(offset, offset + query.limit - 1);

    const { data: appointments, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      appointments: appointments || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/appointments error:', error);
    
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

// POST /api/v1/hs/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const appointmentData = AppointmentSchema.parse(body);

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

    // Validate customer exists
    const { data: customer } = await supabase
      .from('hs.customers')
      .select('id, phone, email')
      .eq('id', appointmentData.customer_id)
      .eq('organization_id', organizationId)
      .single();
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 400 }
      );
    }

    // Validate work order exists if provided
    if (appointmentData.work_order_id) {
      const { data: workOrder } = await supabase
        .from('hs.work_orders')
        .select('id')
        .eq('id', appointmentData.work_order_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!workOrder) {
        return NextResponse.json(
          { error: 'Work order not found' },
          { status: 400 }
        );
      }
    }

    // Validate primary technician exists and check availability
    if (appointmentData.primary_technician_id) {
      const { data: technician } = await supabase
        .from('hs.technicians')
        .select('id')
        .eq('id', appointmentData.primary_technician_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!technician) {
        return NextResponse.json(
          { error: 'Primary technician not found' },
          { status: 400 }
        );
      }

      // Check availability
      const isAvailable = await checkTechnicianAvailability(
        appointmentData.primary_technician_id,
        appointmentData.scheduled_date,
        appointmentData.scheduled_time_start,
        appointmentData.estimated_duration
      );

      if (!isAvailable) {
        return NextResponse.json(
          { error: 'Primary technician is not available at the selected time' },
          { status: 409 }
        );
      }
    }

    // Validate additional technicians
    if (appointmentData.additional_technician_ids && appointmentData.additional_technician_ids.length > 0) {
      const { data: additionalTechnicians } = await supabase
        .from('hs.technicians')
        .select('id')
        .in('id', appointmentData.additional_technician_ids)
        .eq('organization_id', organizationId);
      
      if (!additionalTechnicians || additionalTechnicians.length !== appointmentData.additional_technician_ids.length) {
        return NextResponse.json(
          { error: 'One or more additional technicians not found' },
          { status: 400 }
        );
      }
    }

    // Calculate end time if not provided
    let scheduledTimeEnd = appointmentData.scheduled_time_end;
    if (!scheduledTimeEnd) {
      const startTime = new Date('${appointmentData.scheduled_date}T${appointmentData.scheduled_time_start}');
      startTime.setMinutes(startTime.getMinutes() + appointmentData.estimated_duration);
      scheduledTimeEnd = startTime.toTimeString().slice(0, 5);
    }

    // Use customer contact info if not provided
    const customerPhone = appointmentData.customer_phone || customer.phone;
    const customerEmail = appointmentData.customer_email || customer.email;

    // Generate appointment number
    const appointmentNumber = await generateAppointmentNumber(organizationId);

    // Create appointment
    const { data: appointment, error } = await supabase
      .from('hs.appointments')
      .insert({
        ...appointmentData,
        appointment_number: appointmentNumber,
        scheduled_time_end: scheduledTimeEnd,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        organization_id: organizationId,
        status: 'scheduled',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }

    // Fetch complete appointment with related data
    const { data: completeAppointment } = await supabase
      .from('hs.appointments')
      .select('
        *,
        customers:customer_id(
          first_name,
          last_name,
          company_name,
          email,
          phone
        ),
        technicians:primary_technician_id(
          first_name,
          last_name,
          phone,
          employee_id
        )
      ')
      .eq('id', appointment.id)
      .single();

    return NextResponse.json(
      { appointment: completeAppointment || appointment },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/appointments error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid appointment data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}