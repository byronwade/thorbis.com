import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Dispatch schemas
const DispatchAssignmentSchema = z.object({
  work_order_id: z.string().uuid(),
  technician_id: z.string().uuid(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  scheduled_date: z.string().datetime(),
  estimated_duration_minutes: z.number().min(15).max(480), // 15 min to 8 hours
  
  // Location and routing
  customer_location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
    special_instructions: z.string().optional(),
  }),
  
  // Assignment details
  assignment_notes: z.string().optional(),
  required_skills: z.array(z.string()).optional(),
  required_equipment: z.array(z.string()).optional(),
  
  // Automatic routing and optimization
  auto_optimize_route: z.boolean().default(true),
  travel_time_buffer_minutes: z.number().min(0).max(60).default(15),
});

const RouteOptimizationSchema = z.object({
  technician_ids: z.array(z.string().uuid()),
  date: z.string().date(),
  
  // Optimization parameters
  optimization_goals: z.array(z.enum(['minimize_travel', 'minimize_overtime', 'balance_workload', 'prioritize_urgent'])).optional(),
  max_assignments_per_technician: z.number().min(1).max(20).optional(),
  working_hours: z.object({
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }).optional(),
  
  // Constraints
  respect_technician_skills: z.boolean().default(true),
  respect_customer_preferences: z.boolean().default(true),
  minimum_travel_time_minutes: z.number().min(5).max(60).default(10),
});

const DispatchBoardQuerySchema = z.object({
  date: z.string().date().optional(),
  technician_ids: z.array(z.string().uuid()).optional(),
  status: z.enum(['scheduled', 'dispatched', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  
  // View options
  view_type: z.enum(['calendar', 'list', 'map', 'kanban']).default('calendar'),
  show_unassigned: z.boolean().default(true),
  show_travel_times: z.boolean().default(true),
  include_customer_details: z.boolean().default(true),
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

// Helper function to calculate travel time between locations
async function calculateTravelTime(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<number> {
  // This would integrate with Google Maps API or similar
  // For now, we'll use a simple distance-based estimation
  
  const R = 3959; // Earth's radius in miles
  const dLat = (toLat - fromLat) * Math.PI / 180;
  const dLng = (toLng - fromLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Estimate travel time: assume 30 mph average speed + 5 minutes base time
  const travelTimeMinutes = Math.round((distance / 30) * 60) + 5;
  return Math.max(10, travelTimeMinutes); // Minimum 10 minutes
}

// Helper function to check technician availability
async function checkTechnicianAvailability(
  technicianId: string, 
  startTime: Date, 
  durationMinutes: number,
  organizationId: string
) {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  
  // Check for overlapping assignments
  const { data: conflicts } = await supabase
    .from('hs.work_orders')
    .select('id, scheduled_date, estimated_duration_minutes')
    .eq('technician_id', technicianId)
    .eq('organization_id', organizationId)
    .in('status', ['scheduled', 'dispatched', 'in_progress'])
    .gte('scheduled_date', startTime.toISOString())
    .lte('scheduled_date', endTime.toISOString());

  return { available: !conflicts || conflicts.length === 0, conflicts: conflicts || [] };
}

// Helper function to optimize route using simple nearest neighbor algorithm
function optimizeRoute(assignments: unknown[], startLocation: { lat: number; lng: number }) {
  if (assignments.length <= 1) return assignments;
  
  const optimized = [];
  let currentLocation = startLocation;
  const remaining = [...assignments];
  
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    
    remaining.forEach((assignment, index) => {
      const distance = Math.sqrt(
        Math.pow(assignment.customer_location.latitude - currentLocation.lat, 2) +
        Math.pow(assignment.customer_location.longitude - currentLocation.lng, 2)
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    
    const nearest = remaining.splice(nearestIndex, 1)[0];
    optimized.push(nearest);
    currentLocation = {
      lat: nearest.customer_location.latitude,
      lng: nearest.customer_location.longitude,
    };
  }
  
  return optimized;
}

// Helper function to log dispatch activity
async function logDispatchActivity(
  workOrderId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('hs.dispatch_activity_log')
    .insert({
      work_order_id: workOrderId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/hs/dispatch - Get dispatch board data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = DispatchBoardQuerySchema.parse(Object.fromEntries(searchParams));

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

    const targetDate = query.date || new Date().toISOString().split('T')[0];

    // Build work orders query
    let workOrdersQuery = supabase
      .from('hs.work_orders')
      .select('
        id,
        work_order_number,
        status,
        priority,
        scheduled_date,
        estimated_duration_minutes,
        service_type,
        description,
        technician_id,
        technicians(id, first_name, last_name, skills, status, phone),
        customers!inner(
          id, 
          first_name, 
          last_name, 
          company_name, 
          phone, 
          email,
          address,
          city,
          state_province,
          latitude,
          longitude
        ),
        estimate_total,
        created_at
      ')
      .eq('organization_id`, organizationId);

    // Apply date filter
    const startOfDay = new Date(`${targetDate}T00:00:00.000Z');
    const endOfDay = new Date('${targetDate}T23:59:59.999Z');
    workOrdersQuery = workOrdersQuery
      .gte('scheduled_date', startOfDay.toISOString())
      .lte('scheduled_date', endOfDay.toISOString());

    // Apply filters
    if (query.technician_ids && query.technician_ids.length > 0) {
      workOrdersQuery = workOrdersQuery.in('technician_id', query.technician_ids);
    }
    
    if (query.status) {
      workOrdersQuery = workOrdersQuery.eq('status', query.status);
    }
    
    if (query.priority) {
      workOrdersQuery = workOrdersQuery.eq('priority', query.priority);
    }

    const { data: workOrders, error } = await workOrdersQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dispatch data' },
        { status: 500 }
      );
    }

    // Get unassigned work orders if requested
    let unassignedWorkOrders = [];
    if (query.show_unassigned) {
      const { data: unassigned } = await supabase
        .from('hs.work_orders')
        .select('
          id,
          work_order_number,
          status,
          priority,
          scheduled_date,
          estimated_duration_minutes,
          service_type,
          description,
          customers!inner(
            id, 
            first_name, 
            last_name, 
            company_name, 
            phone,
            address,
            city,
            state_province,
            latitude,
            longitude
          ),
          estimate_total,
          created_at
        ')
        .eq('organization_id', organizationId)
        .is('technician_id', null)
        .in('status', ['scheduled', 'pending']);

      unassignedWorkOrders = unassigned || [];
    }

    // Get all active technicians
    const { data: allTechnicians } = await supabase
      .from('hs.technicians')
      .select('
        id,
        first_name,
        last_name,
        email,
        phone,
        skills,
        status,
        hourly_rate,
        created_at
      ')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    // Calculate travel times if requested
    let assignmentsWithTravel = workOrders;
    if (query.show_travel_times) {
      // This would be enhanced with real travel time calculations
      assignmentsWithTravel = workOrders?.map(wo => ({
        ...wo,
        estimated_travel_time: 15, // Default 15 minutes
        travel_distance_miles: 5, // Default 5 miles
      }));
    }

    // Organize data by view type
    let organizedData;
    switch (query.view_type) {
      case 'calendar':
        // Group by technician and time slots
        organizedData = {
          technician_schedules: allTechnicians?.map(tech => ({
            technician: tech,
            assignments: assignmentsWithTravel?.filter(wo => wo.technician_id === tech.id)
              .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()) || [],
          })) || [],
        };
        break;
        
      case 'map':
        // Group by location clusters
        organizedData = {
          assignments: assignmentsWithTravel?.map(wo => ({
            ...wo,
            location: {
              latitude: wo.customers.latitude,
              longitude: wo.customers.longitude,
              address: '${wo.customers.address}, ${wo.customers.city}, ${wo.customers.state_province}',
            }
          })) || [],
        };
        break;
        
      case 'kanban':
        // Group by status
        organizedData = {
          columns: [
            {
              status: 'unassigned',
              title: 'Unassigned',
              assignments: unassignedWorkOrders,
            },
            {
              status: 'scheduled',
              title: 'Scheduled',
              assignments: assignmentsWithTravel?.filter(wo => wo.status === 'scheduled') || [],
            },
            {
              status: 'dispatched',
              title: 'Dispatched',
              assignments: assignmentsWithTravel?.filter(wo => wo.status === 'dispatched') || [],
            },
            {
              status: 'in_progress',
              title: 'In Progress',
              assignments: assignmentsWithTravel?.filter(wo => wo.status === 'in_progress') || [],
            },
            {
              status: 'completed',
              title: 'Completed',
              assignments: assignmentsWithTravel?.filter(wo => wo.status === 'completed') || [],
            },
          ],
        };
        break;
        
      default: // list
        organizedData = {
          assignments: assignmentsWithTravel?.sort((a, b) => 
            new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
          ) || [],
        };
    }

    // Calculate dispatch metrics
    const totalAssignments = workOrders?.length || 0;
    const assignedCount = workOrders?.filter(wo => wo.technician_id).length || 0;
    const unassignedCount = unassignedWorkOrders.length;
    const urgentCount = [...(workOrders || []), ...unassignedWorkOrders]
      .filter(wo => wo.priority === 'urgent').length;

    const dispatchMetrics = {
      total_assignments: totalAssignments + unassignedCount,
      assigned: assignedCount,
      unassigned: unassignedCount,
      urgent: urgentCount,
      completion_rate: totalAssignments > 0 ? 
        ((workOrders?.filter(wo => wo.status === 'completed').length || 0) / totalAssignments) * 100 : 0,
      avg_travel_time: query.show_travel_times ? 
        (assignmentsWithTravel?.reduce((sum, wo) => sum + (wo.estimated_travel_time || 0), 0) || 0) / (totalAssignments || 1) : null,
    };

    return NextResponse.json({
      date: targetDate,
      view_type: query.view_type,
      data: organizedData,
      unassigned_work_orders: query.show_unassigned ? unassignedWorkOrders : undefined,
      technicians: allTechnicians || [],
      metrics: dispatchMetrics,
      generated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('GET /api/v1/hs/dispatch error:', error);
    
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

// POST /api/v1/hs/dispatch - Create dispatch assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const assignmentData = DispatchAssignmentSchema.parse(body);

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

    // Verify work order exists and is not already assigned
    const { data: workOrder, error: woError } = await supabase
      .from('hs.work_orders')
      .select('*')
      .eq('id', assignmentData.work_order_id)
      .eq('organization_id', organizationId)
      .single();

    if (woError || !workOrder) {
      return NextResponse.json(
        { error: 'Work order not found or access denied' },
        { status: 404 }
      );
    }

    if (workOrder.technician_id) {
      return NextResponse.json(
        { error: 'Work order is already assigned to a technician' },
        { status: 409 }
      );
    }

    // Verify technician exists and is available
    const { data: technician, error: techError } = await supabase
      .from('hs.technicians')
      .select('*')
      .eq('id', assignmentData.technician_id)
      .eq('organization_id', organizationId)
      .single();

    if (techError || !technician) {
      return NextResponse.json(
        { error: 'Technician not found or access denied' },
        { status: 404 }
      );
    }

    if (technician.status !== 'active') {
      return NextResponse.json(
        { error: 'Technician is not active' },
        { status: 409 }
      );
    }

    // Check technician availability
    const scheduledDate = new Date(assignmentData.scheduled_date);
    const availability = await checkTechnicianAvailability(
      assignmentData.technician_id,
      scheduledDate,
      assignmentData.estimated_duration_minutes,
      organizationId
    );

    if (!availability.available) {
      return NextResponse.json(
        { 
          error: 'Technician is not available at the scheduled time',
          conflicts: availability.conflicts 
        },
        { status: 409 }
      );
    }

    // Update work order with assignment
    const { data: updatedWorkOrder, error: updateError } = await supabase
      .from('hs.work_orders')
      .update({
        technician_id: assignmentData.technician_id,
        scheduled_date: assignmentData.scheduled_date,
        estimated_duration_minutes: assignmentData.estimated_duration_minutes,
        priority: assignmentData.priority,
        assignment_notes: assignmentData.assignment_notes,
        status: 'scheduled',
        dispatched_at: new Date().toISOString(),
        dispatched_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignmentData.work_order_id)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json(
        { error: 'Failed to create dispatch assignment' },
        { status: 500 }
      );
    }

    // Create dispatch record
    const { data: dispatchRecord } = await supabase
      .from('hs.dispatch_assignments')
      .insert({
        work_order_id: assignmentData.work_order_id,
        technician_id: assignmentData.technician_id,
        scheduled_date: assignmentData.scheduled_date,
        estimated_duration_minutes: assignmentData.estimated_duration_minutes,
        priority: assignmentData.priority,
        customer_location: assignmentData.customer_location,
        assignment_notes: assignmentData.assignment_notes,
        required_skills: assignmentData.required_skills,
        required_equipment: assignmentData.required_equipment,
        travel_time_buffer_minutes: assignmentData.travel_time_buffer_minutes,
        organization_id: organizationId,
        dispatched_by: user.id,
      })
      .select()
      .single();

    // Log dispatch activity
    await logDispatchActivity(
      assignmentData.work_order_id,
      'work_order_dispatched`,
      `Work order dispatched to ${technician.first_name} ${technician.last_name}',
      {
        technician_id: assignmentData.technician_id,
        scheduled_date: assignmentData.scheduled_date,
        priority: assignmentData.priority,
        estimated_duration: assignmentData.estimated_duration_minutes,
      },
      organizationId,
      user.id
    );

    return NextResponse.json({
      assignment: dispatchRecord,
      work_order: updatedWorkOrder,
      technician: {
        id: technician.id,
        name: '${technician.first_name} ${technician.last_name}',
        phone: technician.phone,
      },
      message: 'Work order dispatched successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/hs/dispatch error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid assignment data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}