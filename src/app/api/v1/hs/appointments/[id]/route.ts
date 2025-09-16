import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Appointment update schema
const AppointmentUpdateSchema = z.object({
  customer_id: z.string().uuid().optional(),
  work_order_id: z.string().uuid().optional(),
  
  // Service details
  service_type: z.enum(['maintenance', 'repair', 'installation', 'inspection', 'consultation', 'emergency']).optional(),
  service_category: z.enum(['plumbing', 'hvac', 'electrical', 'general', 'emergency', 'maintenance']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']).optional(),
  
  // Scheduling
  scheduled_date: z.string().date().optional(),
  scheduled_time_start: z.string().time().optional(),
  scheduled_time_end: z.string().time().optional(),
  estimated_duration: z.number().min(15).max(480).optional(),
  
  // Location
  service_address_line_1: z.string().min(1).max(255).optional(),
  service_address_line_2: z.string().max(255).optional(),
  service_city: z.string().min(1).max(100).optional(),
  service_state_province: z.string().min(1).max(100).optional(),
  service_postal_code: z.string().min(1).max(20).optional(),
  
  // Assignment
  primary_technician_id: z.string().uuid().optional(),
  additional_technician_ids: z.array(z.string().uuid()).optional(),
  crew_size: z.number().min(1).optional(),
  
  // Appointment details
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  internal_notes: z.string().optional(),
  
  // Customer interaction
  customer_phone: z.string().max(20).optional(),
  customer_email: z.string().email().optional(),
  preferred_contact_method: z.enum(['phone', 'email', 'sms', 'app']).optional(),
  
  // Requirements
  special_instructions: z.string().optional(),
  required_tools: z.array(z.string()).optional(),
  required_parts: z.array(z.string()).optional(),
  access_requirements: z.string().optional(),
  
  // Status updates
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']).optional(),
});

// Status update schema for workflow actions
const StatusUpdateSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']),
  action: z.enum(['confirm', 'start_work', 'complete', 'cancel', 'mark_no_show', 'reschedule']).optional(),
  notes: z.string().optional(),
  completion_notes: z.string().optional(),
  cancellation_reason: z.string().optional(),
  
  // For rescheduling
  new_scheduled_date: z.string().date().optional(),
  new_scheduled_time_start: z.string().time().optional(),
  new_estimated_duration: z.number().min(15).max(480).optional(),
});

// Reschedule schema
const RescheduleSchema = z.object({
  new_scheduled_date: z.string().date(),
  new_scheduled_time_start: z.string().time(),
  new_scheduled_time_end: z.string().time().optional(),
  new_estimated_duration: z.number().min(15).max(480).optional(),
  reason: z.string().optional(),
  notify_customer: z.boolean().default(true),
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

// Helper function to verify appointment access
async function verifyAppointmentAccess(appointmentId: string, organizationId: string) {
  const { data: appointment } = await supabase
    .from('hs.appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!appointment;
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
    .in('status', ['scheduled', 'confirmed', 'in_progress']);

  if (excludeAppointmentId) {
    query = query.neq('id`, excludeAppointmentId);
  }

  const { data: conflicts } = await query;
  
  if (!conflicts || conflicts.length === 0) return true;
  
  // Check for time overlaps
  const newStart = new Date(`${date}T${timeStart}`);
  const newEnd = new Date(`${date}T${timeStart}`);
  newEnd.setMinutes(newEnd.getMinutes() + duration);
  
  return !conflicts.some(conflict => {
    const existingStart = new Date(`${date}T${conflict.scheduled_time_start}');
    const existingEnd = new Date('${date}T${conflict.scheduled_time_end || conflict.scheduled_time_start}');
    if (!conflict.scheduled_time_end && conflict.estimated_duration) {
      existingEnd.setMinutes(existingEnd.getMinutes() + conflict.estimated_duration);
    }
    
    return newStart < existingEnd && newEnd > existingStart;
  });
}

// GET /api/v1/hs/appointments/[id] - Get specific appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;

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

    // Verify appointment access
    if (!(await verifyAppointmentAccess(appointmentId, organizationId))) {
      return NextResponse.json(
        { error: 'Appointment not found or access denied' },
        { status: 404 }
      );
    }

    // Get appointment with related data
    const { data: appointment, error } = await supabase
      .from('hs.appointments')
      .select('
        *,
        customers:customer_id(
          id,
          first_name,
          last_name,
          company_name,
          email,
          phone,
          address_line_1,
          address_line_2,
          city,
          state_province,
          postal_code,
          preferred_contact_method
        ),
        work_orders:work_order_id(
          id,
          work_order_number,
          problem_description,
          work_requested,
          status,
          priority
        ),
        technicians:primary_technician_id(
          id,
          first_name,
          last_name,
          phone,
          email,
          employee_id,
          skills,
          certifications
        ),
        appointment_history(
          id,
          action,
          old_status,
          new_status,
          notes,
          created_at,
          created_by
        ),
        created_by_user:created_by(
          first_name,
          last_name
        )
      ')
      .eq('id', appointmentId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointment });

  } catch (error) {
    console.error('GET /api/v1/hs/appointments/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/appointments/[id] - Update appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    const body = await request.json();
    const updateData = AppointmentUpdateSchema.parse(body);

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

    // Verify appointment access
    if (!(await verifyAppointmentAccess(appointmentId, organizationId))) {
      return NextResponse.json(
        { error: 'Appointment not found or access denied' },
        { status: 404 }
      );
    }

    // Check if appointment is in a state that allows editing
    const { data: currentAppointment } = await supabase
      .from('hs.appointments')
      .select('status, scheduled_date, scheduled_time_start')
      .eq('id', appointmentId)
      .single();

    if (['completed', 'cancelled', 'no_show'].includes(currentAppointment?.status)) {
      return NextResponse.json(
        { error: 'Cannot edit completed, cancelled, or no-show appointments' },
        { status: 409 }
      );
    }

    // Validate customer exists if being changed
    if (updateData.customer_id) {
      const { data: customer } = await supabase
        .from('hs.customers')
        .select('id')
        .eq('id', updateData.customer_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 400 }
        );
      }
    }

    // Validate work order exists if being changed
    if (updateData.work_order_id) {
      const { data: workOrder } = await supabase
        .from('hs.work_orders')
        .select('id')
        .eq('id', updateData.work_order_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!workOrder) {
        return NextResponse.json(
          { error: 'Work order not found' },
          { status: 400 }
        );
      }
    }

    // Validate technician and check availability if scheduling is changing
    if (updateData.primary_technician_id || updateData.scheduled_date || updateData.scheduled_time_start) {
      const technicianId = updateData.primary_technician_id || currentAppointment.primary_technician_id;
      const scheduledDate = updateData.scheduled_date || currentAppointment.scheduled_date;
      const scheduledTime = updateData.scheduled_time_start || currentAppointment.scheduled_time_start;
      const duration = updateData.estimated_duration || 60; // Default to 1 hour if not specified
      
      if (technicianId) {
        // Validate technician exists
        const { data: technician } = await supabase
          .from('hs.technicians')
          .select('id')
          .eq('id', technicianId)
          .eq('organization_id', organizationId)
          .single();
        
        if (!technician) {
          return NextResponse.json(
            { error: 'Technician not found' },
            { status: 400 }
          );
        }

        // Check availability (excluding current appointment)
        const isAvailable = await checkTechnicianAvailability(
          technicianId,
          scheduledDate,
          scheduledTime,
          duration,
          appointmentId
        );

        if (!isAvailable) {
          return NextResponse.json(
            { error: 'Technician is not available at the selected time' },
            { status: 409 }
          );
        }
      }
    }

    // Calculate end time if scheduling is changing
    let calculatedEndTime = updateData.scheduled_time_end;
    if ((updateData.scheduled_time_start || updateData.estimated_duration) && !calculatedEndTime) {
      const startTime = updateData.scheduled_time_start || currentAppointment.scheduled_time_start;
      const duration = updateData.estimated_duration || 60;
      const endTime = new Date('2000-01-01T${startTime}');
      endTime.setMinutes(endTime.getMinutes() + duration);
      calculatedEndTime = endTime.toTimeString().slice(0, 5);
    }

    // Prepare update data
    const finalUpdateData = {
      ...updateData,
      ...(calculatedEndTime && { scheduled_time_end: calculatedEndTime }),
    };

    // Update appointment
    const { data: appointment, error } = await supabase
      .from('hs.appointments')
      .update(finalUpdateData)
      .eq('id', appointmentId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointment });

  } catch (error) {
    console.error('PUT /api/v1/hs/appointments/[id] error:', error);
    
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

// PATCH /api/v1/hs/appointments/[id]/status - Update appointment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
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

    // Get current appointment status for validation
    const { data: currentAppointment } = await supabase
      .from('hs.appointments')
      .select('status, work_order_id')
      .eq('id', appointmentId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found or access denied' },
        { status: 404 }
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'scheduled': ['confirmed', 'cancelled', 'rescheduled'],
      'confirmed': ['in_progress', 'cancelled', 'no_show', 'rescheduled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [], // Final state
      'cancelled': ['scheduled'], // Can be reactivated
      'no_show': ['rescheduled'], // Can reschedule after no-show
      'rescheduled': ['scheduled', 'confirmed'], // New appointment created
    };

    const currentStatus = currentAppointment.status;
    const newStatus = statusData.status;

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status transition from ${currentStatus} to ${newStatus}' },
        { status: 400 }
      );
    }

    // Prepare update data with automatic timestamps
    const updateData: unknown = { status: newStatus };

    switch (newStatus) {
      case 'confirmed':
        updateData.confirmed_at = new Date().toISOString();
        break;
      case 'in_progress':
        updateData.started_at = new Date().toISOString();
        break;
      case 'completed':
        updateData.completed_at = new Date().toISOString();
        if (statusData.completion_notes) {
          updateData.completion_notes = statusData.completion_notes;
        }
        // Update related work order status if exists
        if (currentAppointment.work_order_id) {
          await supabase
            .from('hs.work_orders')
            .update({ status: 'completed' })
            .eq('id', currentAppointment.work_order_id);
        }
        break;
      case 'cancelled':
        updateData.cancelled_at = new Date().toISOString();
        if (statusData.cancellation_reason) {
          updateData.cancellation_reason = statusData.cancellation_reason;
        }
        break;
      case 'no_show':
        updateData.no_show_at = new Date().toISOString();
        break;
    }

    if (statusData.notes) {
      updateData.status_notes = statusData.notes;
    }

    // Update appointment status
    const { data: appointment, error } = await supabase
      .from('hs.appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update appointment status' },
        { status: 500 }
      );
    }

    // Record status change history
    await supabase
      .from('hs.appointment_history`)
      .insert({
        appointment_id: appointmentId,
        action: statusData.action || `status_change_to_${newStatus}',
        old_status: currentStatus,
        new_status: newStatus,
        notes: statusData.notes,
        created_by: user.id,
      });

    return NextResponse.json({ 
      appointment,
      message: 'Appointment status updated to ${newStatus}' 
    });

  } catch (error) {
    console.error('PATCH /api/v1/hs/appointments/[id]/status error:', error);
    
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

// DELETE /api/v1/hs/appointments/[id] - Delete appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;

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

    // Get current appointment to check constraints
    const { data: currentAppointment } = await supabase
      .from('hs.appointments')
      .select('status')
      .eq('id', appointmentId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found or access denied' },
        { status: 404 }
      );
    }

    // Check if appointment can be deleted
    if (['completed', 'in_progress'].includes(currentAppointment.status)) {
      return NextResponse.json(
        { error: 'Cannot delete completed or in-progress appointments' },
        { status: 409 }
      );
    }

    // Delete appointment (cascade will handle history)
    const { error } = await supabase
      .from('hs.appointments')
      .delete()
      .eq('id', appointmentId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Appointment deleted successfully' 
    });

  } catch (error) {
    console.error('DELETE /api/v1/hs/appointments/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}