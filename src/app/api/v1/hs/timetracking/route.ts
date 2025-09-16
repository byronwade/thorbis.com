import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Time entry schemas
const TimeEntrySchema = z.object({
  technician_id: z.string().uuid(),
  work_order_id: z.string().uuid().optional(),
  
  // Time tracking
  clock_in: z.string().datetime(),
  clock_out: z.string().datetime().optional(),
  break_duration_minutes: z.number().min(0).max(480).default(0), // Max 8 hours breaks
  
  // Location tracking
  clock_in_location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().min(0).optional(),
    address: z.string().optional(),
  }).optional(),
  
  clock_out_location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().min(0).optional(),
    address: z.string().optional(),
  }).optional(),
  
  // Activity details
  activity_type: z.enum([
    'regular_work', 'overtime', 'travel', 'break', 'lunch',
    'training', 'meeting', 'administrative', 'on_call', 'other'
  ]).default('regular_work'),
  
  description: z.string().max(1000).optional(),
  notes: z.string().optional(),
  
  // Billing and rates
  hourly_rate: z.number().min(0).optional(),
  is_billable: z.boolean().default(true),
  billing_category: z.enum(['regular', 'overtime', 'holiday', 'emergency']).default('regular'),
  
  // Approval workflow
  requires_approval: z.boolean().default(false),
  submitted_for_approval: z.boolean().default(false),
  
  // Additional tracking
  mileage: z.number().min(0).optional(),
  expenses: z.array(z.object({
    description: z.string(),
    amount: z.number().min(0),
    category: z.string(),
    receipt_photo_id: z.string().uuid().optional(),
  })).optional(),
  
  tags: z.array(z.string()).optional(),
});

const TimeQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('50'),
  
  // Filters
  technician_id: z.string().uuid().optional(),
  work_order_id: z.string().uuid().optional(),
  activity_type: z.enum([
    'regular_work', 'overtime', 'travel', 'break', 'lunch',
    'training', 'meeting', 'administrative', 'on_call', 'other'
  ]).optional(),
  
  // Date range filters
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  clock_in_from: z.string().datetime().optional(),
  clock_in_to: z.string().datetime().optional(),
  
  // Status filters
  is_active: z.boolean().optional(), // Currently clocked in
  is_billable: z.boolean().optional(),
  approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  has_location: z.boolean().optional(),
  
  // Time duration filters
  min_duration_hours: z.number().min(0).optional(),
  max_duration_hours: z.number().min(0).optional(),
  
  // Grouping options
  group_by: z.enum(['day', 'week', 'technician', 'work_order', 'activity_type']).optional(),
  
  // Include options
  include_breaks: z.boolean().default(false),
  include_expenses: z.boolean().default(false),
  include_location_details: z.boolean().default(false),
  include_work_order_details: z.boolean().default(true),
  include_technician_details: z.boolean().default(true),
  
  // Sorting
  sort: z.enum(['clock_in', 'clock_out', 'duration', 'technician_name', 'created_at']).default('clock_in'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

const ClockActionSchema = z.object({
  technician_id: z.string().uuid(),
  action: z.enum(['clock_in', 'clock_out', 'start_break', 'end_break']),
  
  // Location data
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().min(0).optional(),
  }).optional(),
  
  // Optional context
  work_order_id: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
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

// Helper function to calculate time duration
function calculateDuration(clockIn: string, clockOut?: string): number {
  const startTime = new Date(clockIn);
  const endTime = clockOut ? new Date(clockOut) : new Date();
  return Math.max(0, (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)); // Hours
}

// Helper function to calculate billable amount
function calculateBillableAmount(durationHours: number, hourlyRate: number, breakMinutes: number = 0): number {
  const billableHours = Math.max(0, durationHours - (breakMinutes / 60));
  return billableHours * hourlyRate;
}

// Helper function to reverse geocode coordinates
async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  // This would integrate with a geocoding service like Google Maps
  // For now, return a placeholder
  return '${latitude.toFixed(4)}, ${longitude.toFixed(4)}';
}

// Helper function to log time tracking activity
async function logTimeTrackingActivity(
  timeEntryId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('hs.time_tracking_activity_log')
    .insert({
      time_entry_id: timeEntryId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/hs/timetracking - List time entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = TimeQuerySchema.parse(Object.fromEntries(searchParams));

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

    // Build query
    let supabaseQuery = supabase
      .from('hs.time_entries`)
      .select('
        *,
        ${query.include_technician_details ? '
          technician:technician_id(
            id,
            first_name,
            last_name,
            employee_id,
            hourly_rate
          ),
        ' : '}
        ${query.include_work_order_details ? '
          work_order:work_order_id(
            id,
            work_order_number,
            description,
            status,
            customer:customer_id(first_name, last_name, company_name)
          ),
        ' : '}
        created_by_user:created_by(first_name, last_name)
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.technician_id) {
      supabaseQuery = supabaseQuery.eq('technician_id', query.technician_id);
    }
    
    if (query.work_order_id) {
      supabaseQuery = supabaseQuery.eq('work_order_id', query.work_order_id);
    }
    
    if (query.activity_type) {
      supabaseQuery = supabaseQuery.eq('activity_type', query.activity_type);
    }
    
    if (query.is_active !== undefined) {
      if (query.is_active) {
        supabaseQuery = supabaseQuery.is('clock_out', null);
      } else {
        supabaseQuery = supabaseQuery.not('clock_out', 'is', null);
      }
    }
    
    if (query.is_billable !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_billable', query.is_billable);
    }
    
    if (query.approval_status) {
      supabaseQuery = supabaseQuery.eq('approval_status', query.approval_status);
    }
    
    if (query.has_location !== undefined) {
      if (query.has_location) {
        supabaseQuery = supabaseQuery.not('clock_in_location', 'is', null);
      } else {
        supabaseQuery = supabaseQuery.is('clock_in_location', null);
      }
    }

    // Date filters
    if (query.date_from) {
      supabaseQuery = supabaseQuery.gte('clock_in', '${query.date_from}T00:00:00.000Z');
    }
    
    if (query.date_to) {
      supabaseQuery = supabaseQuery.lte('clock_in', '${query.date_to}T23:59:59.999Z');
    }
    
    if (query.clock_in_from) {
      supabaseQuery = supabaseQuery.gte('clock_in', query.clock_in_from);
    }
    
    if (query.clock_in_to) {
      supabaseQuery = supabaseQuery.lte('clock_in', query.clock_in_to);
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: timeEntries, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch time entries' },
        { status: 500 }
      );
    }

    // Calculate durations and billable amounts for each entry
    const enrichedTimeEntries = timeEntries?.map(entry => {
      const duration = calculateDuration(entry.clock_in, entry.clock_out);
      const billableAmount = entry.hourly_rate ? 
        calculateBillableAmount(duration, entry.hourly_rate, entry.break_duration_minutes) : null;
      
      return {
        ...entry,
        calculated_duration_hours: duration,
        calculated_billable_amount: billableAmount,
        is_currently_active: !entry.clock_out,
      };
    });

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Get time tracking statistics
    const { data: allEntries } = await supabase
      .from('hs.time_entries')
      .select('clock_in, clock_out, activity_type, is_billable, hourly_rate, break_duration_minutes, approval_status')
      .eq('organization_id', organizationId);

    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate totals
    const totalHours = allEntries?.reduce((sum, entry) => {
      return sum + calculateDuration(entry.clock_in, entry.clock_out);
    }, 0) || 0;

    const billableHours = allEntries?.reduce((sum, entry) => {
      if (!entry.is_billable) return sum;
      return sum + calculateDuration(entry.clock_in, entry.clock_out) - (entry.break_duration_minutes || 0) / 60;
    }, 0) || 0;

    const totalBillableAmount = allEntries?.reduce((sum, entry) => {
      if (!entry.is_billable || !entry.hourly_rate) return sum;
      const duration = calculateDuration(entry.clock_in, entry.clock_out);
      return sum + calculateBillableAmount(duration, entry.hourly_rate, entry.break_duration_minutes);
    }, 0) || 0;

    const summary = {
      total_entries: count || 0,
      active_entries: allEntries?.filter(e => !e.clock_out).length || 0,
      pending_approval: allEntries?.filter(e => e.approval_status === 'pending').length || 0,
      
      total_hours: totalHours,
      billable_hours: billableHours,
      total_billable_amount: totalBillableAmount,
      
      by_activity_type: allEntries?.reduce((acc, entry) => {
        acc[entry.activity_type] = (acc[entry.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_approval_status: allEntries?.reduce((acc, entry) => {
        acc[entry.approval_status || 'approved'] = (acc[entry.approval_status || 'approved'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    };

    return NextResponse.json({
      time_entries: enrichedTimeEntries || [],
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
    console.error('GET /api/v1/hs/timetracking error:', error);
    
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

// POST /api/v1/hs/timetracking - Create time entry or clock action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Determine if this is a clock action or full time entry
    const isClockAction = body.action;
    
    if (isClockAction) {
      return handleClockAction(body, request);
    } else {
      return handleTimeEntry(body, request);
    }

  } catch (error) {
    console.error('POST /api/v1/hs/timetracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle clock in/out actions
async function handleClockAction(body: unknown, request: NextRequest) {
  const actionData = ClockActionSchema.parse(body);

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

  // Verify technician exists
  const { data: technician } = await supabase
    .from('hs.technicians')
    .select('id, hourly_rate')
    .eq('id', actionData.technician_id)
    .eq('organization_id', organizationId)
    .single();

  if (!technician) {
    return NextResponse.json(
      { error: 'Technician not found or access denied' },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();
  let locationAddress = null;

  // Reverse geocode location if provided
  if (actionData.location) {
    locationAddress = await reverseGeocode(actionData.location.latitude, actionData.location.longitude);
  }

  const locationData = actionData.location ? {
    latitude: actionData.location.latitude,
    longitude: actionData.location.longitude,
    accuracy: actionData.location.accuracy,
    address: locationAddress,
  } : null;

  switch (actionData.action) {
    case 'clock_in':
      // Check if already clocked in
      const { data: activeEntry } = await supabase
        .from('hs.time_entries')
        .select('id')
        .eq('technician_id', actionData.technician_id)
        .is('clock_out', null)
        .single();

      if (activeEntry) {
        return NextResponse.json(
          { error: 'Technician is already clocked in' },
          { status: 409 }
        );
      }

      // Create new time entry
      const { data: newEntry, error: clockInError } = await supabase
        .from('hs.time_entries')
        .insert({
          technician_id: actionData.technician_id,
          work_order_id: actionData.work_order_id,
          clock_in: now,
          clock_in_location: locationData,
          hourly_rate: technician.hourly_rate,
          notes: actionData.notes,
          organization_id: organizationId,
          created_by: user.id,
        })
        .select()
        .single();

      if (clockInError) {
        console.error('Clock in error:', clockInError);
        return NextResponse.json(
          { error: 'Failed to clock in' },
          { status: 500 }
        );
      }

      await logTimeTrackingActivity(
        newEntry.id,
        'clocked_in',
        'Technician clocked in',
        { location: locationData, work_order_id: actionData.work_order_id },
        organizationId,
        user.id
      );

      return NextResponse.json({
        action: 'clocked_in',
        time_entry: newEntry,
        message: 'Successfully clocked in',
      });

    case 'clock_out':
      // Find active time entry
      const { data: entryToClose } = await supabase
        .from('hs.time_entries')
        .select('*')
        .eq('technician_id', actionData.technician_id)
        .is('clock_out', null)
        .single();

      if (!entryToClose) {
        return NextResponse.json(
          { error: 'No active time entry found' },
          { status: 404 }
        );
      }

      // Update time entry with clock out
      const { data: closedEntry, error: clockOutError } = await supabase
        .from('hs.time_entries')
        .update({
          clock_out: now,
          clock_out_location: locationData,
          updated_at: now,
        })
        .eq('id', entryToClose.id)
        .select()
        .single();

      if (clockOutError) {
        console.error('Clock out error:', clockOutError);
        return NextResponse.json(
          { error: 'Failed to clock out' },
          { status: 500 }
        );
      }

      const duration = calculateDuration(entryToClose.clock_in, now);
      const billableAmount = entryToClose.hourly_rate ? 
        calculateBillableAmount(duration, entryToClose.hourly_rate, entryToClose.break_duration_minutes) : null;

      await logTimeTrackingActivity(
        entryToClose.id,
        'clocked_out',
        'Technician clocked out',
        { 
          location: locationData, 
          duration_hours: duration,
          billable_amount: billableAmount,
        },
        organizationId,
        user.id
      );

      return NextResponse.json({
        action: 'clocked_out',
        time_entry: {
          ...closedEntry,
          calculated_duration_hours: duration,
          calculated_billable_amount: billableAmount,
        },
        message: 'Successfully clocked out',
      });

    default:
      return NextResponse.json(
        { error: 'Invalid clock action' },
        { status: 400 }
      );
  }
}

// Handle full time entry creation
async function handleTimeEntry(body: unknown, request: NextRequest) {
  const timeData = TimeEntrySchema.parse(body);

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

  // Verify technician exists
  const { data: technician } = await supabase
    .from('hs.technicians')
    .select('id, hourly_rate')
    .eq('id', timeData.technician_id)
    .eq('organization_id', organizationId)
    .single();

  if (!technician) {
    return NextResponse.json(
      { error: 'Technician not found or access denied' },
      { status: 404 }
    );
  }

  // Verify work order if provided
  if (timeData.work_order_id) {
    const { data: workOrder } = await supabase
      .from('hs.work_orders')
      .select('id')
      .eq('id', timeData.work_order_id)
      .eq('organization_id', organizationId)
      .single();

    if (!workOrder) {
      return NextResponse.json(
        { error: 'Work order not found or access denied' },
        { status: 404 }
      );
    }
  }

  // Validate time entry logic
  if (timeData.clock_out && new Date(timeData.clock_out) <= new Date(timeData.clock_in)) {
    return NextResponse.json(
      { error: 'Clock out time must be after clock in time' },
      { status: 400 }
    );
  }

  // Create time entry
  const { data: timeEntry, error } = await supabase
    .from('hs.time_entries')
    .insert({
      ...timeData,
      hourly_rate: timeData.hourly_rate || technician.hourly_rate,
      organization_id: organizationId,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }

  // Calculate duration and billable amount
  const duration = calculateDuration(timeEntry.clock_in, timeEntry.clock_out);
  const billableAmount = timeEntry.hourly_rate ? 
    calculateBillableAmount(duration, timeEntry.hourly_rate, timeEntry.break_duration_minutes) : null;

  // Log time entry creation
  await logTimeTrackingActivity(
    timeEntry.id,
    'time_entry_created',
    'Time entry created',
    {
      activity_type: timeEntry.activity_type,
      duration_hours: duration,
      billable_amount: billableAmount,
      work_order_id: timeEntry.work_order_id,
    },
    organizationId,
    user.id
  );

  return NextResponse.json({
    time_entry: {
      ...timeEntry,
      calculated_duration_hours: duration,
      calculated_billable_amount: billableAmount,
    },
    message: 'Time entry created successfully',
  }, { status: 201 });
}