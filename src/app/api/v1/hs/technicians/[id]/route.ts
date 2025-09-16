import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Technician update schema
const TechnicianUpdateSchema = z.object({
  user_id: z.string().uuid().optional(),
  employee_id: z.string().max(50).optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  emergency_contact_name: z.string().max(100).optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  
  // Employment details
  hire_date: z.string().date().optional(),
  employment_status: z.enum(['active', 'inactive', 'terminated', 'suspended']).optional(),
  job_title: z.string().max(100).optional(),
  pay_rate: z.number().min(0).optional(),
  pay_type: z.enum(['hourly', 'salary', 'commission', 'piece_rate']).optional(),
  
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
  service_radius: z.number().min(1).max(200).optional(),
  
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
  current_status: z.enum(['available', 'busy', 'break', 'offline', 'emergency']).optional(),
});

// Status update schema for location tracking
const StatusUpdateSchema = z.object({
  current_status: z.enum(['available', 'busy', 'break', 'offline', 'emergency']),
  current_location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
});

// Availability update schema
const AvailabilityUpdateSchema = z.object({
  date: z.string().date(),
  time_start: z.string().time(),
  time_end: z.string().time(),
  availability_type: z.enum(['available', 'unavailable', 'time_off', 'vacation', 'sick', 'training', 'meeting']),
  reason: z.string().max(100).optional(),
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

// Helper function to verify technician access
async function verifyTechnicianAccess(technicianId: string, organizationId: string) {
  const { data: technician } = await supabase
    .from('hs.technicians')
    .select('id')
    .eq('id', technicianId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!technician;
}

// GET /api/v1/hs/technicians/[id] - Get specific technician
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const technicianId = params.id;

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

    // Verify technician access
    if (!(await verifyTechnicianAccess(technicianId, organizationId))) {
      return NextResponse.json(
        { error: 'Technician not found or access denied' },
        { status: 404 }
      );
    }

    // Get technician with related data
    const { data: technician, error } = await supabase
      .from('hs.technicians')
      .select('
        *,
        user_profiles:user_id(
          first_name,
          last_name,
          email,
          avatar_url
        ),
        assigned_work_orders:work_orders!primary_technician_id(
          id,
          work_order_number,
          status,
          scheduled_date,
          problem_description
        ),
        availability:technician_availability(
          date,
          time_start,
          time_end,
          availability_type,
          status,
          reason
        ),
        assigned_equipment:equipment!assigned_to_technician(
          id,
          name,
          equipment_type,
          status
        )
      ')
      .eq('id', technicianId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch technician' },
        { status: 500 }
      );
    }

    return NextResponse.json({ technician });

  } catch (error) {
    console.error('GET /api/v1/hs/technicians/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/technicians/[id] - Update technician
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const technicianId = params.id;
    const body = await request.json();
    const updateData = TechnicianUpdateSchema.parse(body);

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

    // Verify technician access
    if (!(await verifyTechnicianAccess(technicianId, organizationId))) {
      return NextResponse.json(
        { error: 'Technician not found or access denied' },
        { status: 404 }
      );
    }

    // Validate user exists if being changed
    if (updateData.user_id) {
      const { data: userProfile } = await supabase
        .from('user_mgmt.profiles')
        .select('id')
        .eq('id', updateData.user_id)
        .single();
      
      if (!userProfile) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate employee ID if being changed
    if (updateData.employee_id) {
      const { data: existingTechnician } = await supabase
        .from('hs.technicians')
        .select('id')
        .eq('employee_id', updateData.employee_id)
        .eq('organization_id', organizationId)
        .neq('id', technicianId)
        .single();
      
      if (existingTechnician) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 409 }
        );
      }
    }

    // Update technician
    const { data: technician, error } = await supabase
      .from('hs.technicians')
      .update(updateData)
      .eq('id', technicianId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update technician' },
        { status: 500 }
      );
    }

    return NextResponse.json({ technician });

  } catch (error) {
    console.error('PUT /api/v1/hs/technicians/[id] error:', error);
    
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

// PATCH /api/v1/hs/technicians/[id]/status - Update technician status and location
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const technicianId = params.id;
    const body = await request.json();
    const statusData = StatusUpdateSchema.parse(body);

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

    // Verify technician access
    if (!(await verifyTechnicianAccess(technicianId, organizationId))) {
      return NextResponse.json(
        { error: 'Technician not found or access denied' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: unknown = {
      current_status: statusData.current_status,
      last_location_update: new Date().toISOString(),
    };

    // Add location if provided
    if (statusData.current_location) {
      updateData.current_location = 'POINT(${statusData.current_location.longitude} ${statusData.current_location.latitude})';
    }

    // Update technician status
    const { data: technician, error } = await supabase
      .from('hs.technicians')
      .update(updateData)
      .eq('id', technicianId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update technician status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ technician });

  } catch (error) {
    console.error('PATCH /api/v1/hs/technicians/[id]/status error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid status update data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/hs/technicians/[id] - Deactivate technician
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const technicianId = params.id;

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

    // Verify technician access
    if (!(await verifyTechnicianAccess(technicianId, organizationId))) {
      return NextResponse.json(
        { error: 'Technician not found or access denied' },
        { status: 404 }
      );
    }

    // Check if technician has active work orders
    const { data: activeWorkOrders } = await supabase
      .from('hs.work_orders')
      .select('id')
      .eq('primary_technician_id', technicianId)
      .in('status', ['new', 'scheduled', 'dispatched', 'in_progress'])
      .limit(1);

    if (activeWorkOrders && activeWorkOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot deactivate technician with active work orders' },
        { status: 409 }
      );
    }

    // Deactivate technician
    const { data: technician, error } = await supabase
      .from('hs.technicians')
      .update({ 
        employment_status: 'inactive',
        current_status: 'offline'
      })
      .eq('id', technicianId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to deactivate technician' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Technician deactivated successfully',
      technician 
    });

  } catch (error) {
    console.error('DELETE /api/v1/hs/technicians/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}