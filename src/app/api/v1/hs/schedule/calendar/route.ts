import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Calendar query schema
const CalendarQuerySchema = z.object({
  date_from: z.string().date(),
  date_to: z.string().date(),
  technician_id: z.string().uuid().optional(),
  view: z.enum(['day', 'week', 'month']).default('week'),
  include_completed: z.boolean().default(true),
  include_cancelled: z.boolean().default(false),
  service_type: z.enum(['maintenance', 'repair', 'installation', 'inspection', 'consultation', 'emergency']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']).optional(),
  customer_id: z.string().uuid().optional(),
});

// Calendar event creation schema
const CalendarEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  event_type: z.enum(['appointment', 'block_time', 'maintenance', 'meeting', 'training', 'travel', 'break']),
  start_date: z.string().date(),
  start_time: z.string().time(),
  end_date: z.string().date().optional(),
  end_time: z.string().time(),
  all_day: z.boolean().default(false),
  
  // Assignment
  technician_id: z.string().uuid().optional(),
  technician_ids: z.array(z.string().uuid()).optional(),
  
  // Location
  location: z.string().optional(),
  
  // Recurrence
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
    interval: z.number().min(1).default(1),
    end_date: z.string().date().optional(),
    max_occurrences: z.number().min(1).optional(),
    days_of_week: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
  }).optional(),
  
  // References
  appointment_id: z.string().uuid().optional(),
  work_order_id: z.string().uuid().optional(),
  
  // Settings
  color_code: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  notes: z.string().optional(),
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

// Helper function to format appointment as calendar event
function formatAppointmentAsEvent(appointment: unknown): unknown {
  return {
    id: appointment.id,
    title: appointment.title || `${appointment.service_type} - ${appointment.customers?.company_name || '${appointment.customers?.first_name} ${appointment.customers?.last_name}'}',
    description: appointment.description,
    event_type: 'appointment`,
    start_date: appointment.scheduled_date,
    start_time: appointment.scheduled_time_start,
    end_date: appointment.scheduled_date,
    end_time: appointment.scheduled_time_end,
    all_day: false,
    location: `${appointment.service_address_line_1}, ${appointment.service_city}, ${appointment.service_state_province}`,
    technician_id: appointment.primary_technician_id,
    technician_name: appointment.technicians ? `${appointment.technicians.first_name} ${appointment.technicians.last_name}' : null,
    customer_id: appointment.customer_id,
    customer_name: appointment.customers?.company_name || '${appointment.customers?.first_name} ${appointment.customers?.last_name}',
    customer_phone: appointment.customer_phone,
    appointment_id: appointment.id,
    work_order_id: appointment.work_order_id,
    status: appointment.status,
    priority: appointment.priority,
    service_type: appointment.service_type,
    service_category: appointment.service_category,
    color_code: getStatusColor(appointment.status, appointment.priority),
    is_recurring: appointment.is_recurring,
  };
}

// Helper function to get color based on status and priority
function getStatusColor(status: string, priority: string): string {
  if (status === 'completed') return '#10B981'; // Green
  if (status === 'cancelled') return '#6B7280'; // Gray
  if (status === 'no_show') return '#F59E0B'; // Yellow
  if (priority === 'emergency') return '#DC2626'; // Red
  if (priority === 'urgent') return '#F97316'; // Orange
  if (priority === 'high') return '#EF4444'; // Light Red
  if (status === 'confirmed') return '#3B82F6'; // Blue
  if (status === 'in_progress') return '#8B5CF6'; // Purple
  return '#1F2937'; // Default dark
}

// GET /api/v1/hs/schedule/calendar - Get calendar view with appointments and events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = CalendarQuerySchema.parse(Object.fromEntries(searchParams));
    
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

    // Build appointments query
    let appointmentsQuery = supabase
      .from('hs.appointments')
      .select('
        *,
        customers:customer_id(
          id,
          first_name,
          last_name,
          company_name,
          email,
          phone
        ),
        technicians:primary_technician_id(
          id,
          first_name,
          last_name,
          phone,
          employee_id
        ),
        work_orders:work_order_id(
          id,
          work_order_number,
          status
        )
      ')
      .eq('organization_id', organizationId)
      .gte('scheduled_date', query.date_from)
      .lte('scheduled_date', query.date_to)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time_start', { ascending: true });

    // Apply filters
    if (query.technician_id) {
      appointmentsQuery = appointmentsQuery.eq('primary_technician_id', query.technician_id);
    }

    if (query.service_type) {
      appointmentsQuery = appointmentsQuery.eq('service_type', query.service_type);
    }

    if (query.priority) {
      appointmentsQuery = appointmentsQuery.eq('priority', query.priority);
    }

    if (query.customer_id) {
      appointmentsQuery = appointmentsQuery.eq('customer_id', query.customer_id);
    }

    // Status filters
    const statusFilters = ['scheduled', 'confirmed', 'in_progress'];
    if (query.include_completed) statusFilters.push('completed');
    if (query.include_cancelled) statusFilters.push('cancelled', 'no_show');
    
    appointmentsQuery = appointmentsQuery.in('status', statusFilters);

    const { data: appointments, error: appointmentsError } = await appointmentsQuery;

    if (appointmentsError) {
      console.error('Database error fetching appointments:', appointmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    // Get calendar events (if you have a separate calendar_events table)
    let eventsQuery = supabase
      .from('hs.calendar_events')
      .select('
        *,
        technicians:technician_id(
          id,
          first_name,
          last_name
        )
      ')
      .eq('organization_id', organizationId)
      .gte('start_date', query.date_from)
      .lte('start_date', query.date_to)
      .order('start_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (query.technician_id) {
      eventsQuery = eventsQuery.eq('technician_id`, query.technician_id);
    }

    const { data: calendarEvents } = await eventsQuery;

    // Format appointments as calendar events
    const appointmentEvents = appointments?.map(formatAppointmentAsEvent) || [];

    // Format calendar events
    const formattedCalendarEvents = calendarEvents?.map(event => ({
      id: `event_${event.id}',
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      start_date: event.start_date,
      start_time: event.start_time,
      end_date: event.end_date || event.start_date,
      end_time: event.end_time,
      all_day: event.all_day,
      location: event.location,
      technician_id: event.technician_id,
      technician_name: event.technicians ? '${event.technicians.first_name} ${event.technicians.last_name}' : null,
      color_code: event.color_code,
      notes: event.notes,
      is_recurring: event.is_recurring,
    })) || [];

    // Combine all events
    const allEvents = [...appointmentEvents, ...formattedCalendarEvents];

    // Group events by date for easier frontend consumption
    const eventsByDate = allEvents.reduce((acc, event) => {
      const date = event.start_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {} as Record<string, any[]>);

    // Get technicians for the filtered period (for calendar headers)
    let techniciansQuery = supabase
      .from('hs.technicians')
      .select('id, first_name, last_name, employee_id, phone')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (query.technician_id) {
      techniciansQuery = techniciansQuery.eq('id', query.technician_id);
    }

    const { data: technicians } = await techniciansQuery;

    return NextResponse.json({
      calendar_data: {
        date_range: {
          from: query.date_from,
          to: query.date_to,
        },
        view: query.view,
        events_by_date: eventsByDate,
        all_events: allEvents,
        technicians: technicians || [],
      },
      summary: {
        total_events: allEvents.length,
        appointments: appointmentEvents.length,
        calendar_events: formattedCalendarEvents.length,
        date_range: '${query.date_from} to ${query.date_to}',
        technicians_count: technicians?.length || 0,
        status_breakdown: appointmentEvents.reduce((acc, event) => {
          acc[event.status] = (acc[event.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      }
    });

  } catch (error) {
    console.error('GET /api/v1/hs/schedule/calendar error:', error);
    
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

// POST /api/v1/hs/schedule/calendar - Create calendar event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventData = CalendarEventSchema.parse(body);

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

    // Validate technician if provided
    if (eventData.technician_id) {
      const { data: technician } = await supabase
        .from('hs.technicians')
        .select('id')
        .eq('id', eventData.technician_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!technician) {
        return NextResponse.json(
          { error: 'Technician not found' },
          { status: 400 }
        );
      }
    }

    // Set end date to start date if not provided and not all day
    const endDate = eventData.end_date || eventData.start_date;

    // Create calendar event
    const { data: calendarEvent, error } = await supabase
      .from('hs.calendar_events')
      .insert({
        ...eventData,
        end_date: endDate,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select('
        *,
        technicians:technician_id(
          first_name,
          last_name,
          employee_id
        )
      ')
      .single();

    if (error) {
      console.error('Database error creating calendar event:', error);
      return NextResponse.json(
        { error: 'Failed to create calendar event' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        calendar_event: calendarEvent,
        message: 'Calendar event created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/schedule/calendar error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid calendar event data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}