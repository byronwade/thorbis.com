import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Reschedule schema
const RescheduleSchema = z.object({
  new_scheduled_date: z.string().date(),
  new_scheduled_time_start: z.string().time(),
  new_scheduled_time_end: z.string().time().optional(),
  new_estimated_duration: z.number().min(15).max(480).optional(),
  new_primary_technician_id: z.string().uuid().optional(),
  reason: z.string().max(500).optional(),
  notify_customer: z.boolean().default(true),
  internal_notes: z.string().optional(),
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
  let query = supabase
    .from('hs.appointments')
    .select('id, scheduled_time_start, scheduled_time_end, estimated_duration')
    .eq('primary_technician_id', technicianId)
    .eq('scheduled_date', date)
    .in('status', ['scheduled', 'confirmed', 'in_progress']);

  if (excludeAppointmentId) {
    query = query.neq('id', excludeAppointmentId);
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

// POST /api/v1/hs/appointments/[id]/reschedule - Reschedule appointment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    const body = await request.json();
    const rescheduleData = RescheduleSchema.parse(body);

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

    // Get current appointment details
    const { data: currentAppointment } = await supabase
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
      .eq('id', appointmentId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found or access denied' },
        { status: 404 }
      );
    }

    // Check if appointment can be rescheduled
    if (['completed'].includes(currentAppointment.status)) {
      return NextResponse.json(
        { error: 'Cannot reschedule completed appointments' },
        { status: 409 }
      );
    }

    // Determine technician for availability check
    const technicianId = rescheduleData.new_primary_technician_id || currentAppointment.primary_technician_id;
    
    if (technicianId) {
      // Validate new technician exists if changing
      if (rescheduleData.new_primary_technician_id && rescheduleData.new_primary_technician_id !== currentAppointment.primary_technician_id) {
        const { data: newTechnician } = await supabase
          .from('hs.technicians')
          .select('id, first_name, last_name')
          .eq('id', rescheduleData.new_primary_technician_id)
          .eq('organization_id', organizationId)
          .single();
        
        if (!newTechnician) {
          return NextResponse.json(
            { error: 'New technician not found' },
            { status: 400 }
          );
        }
      }

      // Check availability for new time slot
      const duration = rescheduleData.new_estimated_duration || currentAppointment.estimated_duration || 60;
      const isAvailable = await checkTechnicianAvailability(
        technicianId,
        rescheduleData.new_scheduled_date,
        rescheduleData.new_scheduled_time_start,
        duration,
        appointmentId // Exclude current appointment from conflict check
      );

      if (!isAvailable) {
        return NextResponse.json(
          { error: 'Technician is not available at the new selected time' },
          { status: 409 }
        );
      }
    }

    // Calculate new end time if not provided
    let newScheduledTimeEnd = rescheduleData.new_scheduled_time_end;
    if (!newScheduledTimeEnd) {
      const duration = rescheduleData.new_estimated_duration || currentAppointment.estimated_duration || 60;
      const startTime = new Date('${rescheduleData.new_scheduled_date}T${rescheduleData.new_scheduled_time_start}');
      startTime.setMinutes(startTime.getMinutes() + duration);
      newScheduledTimeEnd = startTime.toTimeString().slice(0, 5);
    }

    // Store original scheduling details for history
    const originalDetails = {
      scheduled_date: currentAppointment.scheduled_date,
      scheduled_time_start: currentAppointment.scheduled_time_start,
      scheduled_time_end: currentAppointment.scheduled_time_end,
      primary_technician_id: currentAppointment.primary_technician_id,
      estimated_duration: currentAppointment.estimated_duration,
    };

    // Prepare update data
    const updateData = {
      scheduled_date: rescheduleData.new_scheduled_date,
      scheduled_time_start: rescheduleData.new_scheduled_time_start,
      scheduled_time_end: newScheduledTimeEnd,
      estimated_duration: rescheduleData.new_estimated_duration || currentAppointment.estimated_duration,
      primary_technician_id: rescheduleData.new_primary_technician_id || currentAppointment.primary_technician_id,
      status: 'scheduled', // Reset to scheduled status
      reschedule_reason: rescheduleData.reason,
      reschedule_count: (currentAppointment.reschedule_count || 0) + 1,
      rescheduled_at: new Date().toISOString(),
      rescheduled_by: user.id,
    };

    // Add internal notes if provided
    if (rescheduleData.internal_notes) {
      const existingNotes = currentAppointment.internal_notes || `;
      updateData.internal_notes = existingNotes 
        ? `${existingNotes}\n\n[${new Date().toISOString()}] Rescheduled: ${rescheduleData.internal_notes}'
        : '[${new Date().toISOString()}] Rescheduled: ${rescheduleData.internal_notes}';
    }

    // Update appointment
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('hs.appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .eq('organization_id', organizationId)
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
      .single();

    if (updateError) {
      console.error('Database error updating appointment:', updateError);
      return NextResponse.json(
        { error: 'Failed to reschedule appointment' },
        { status: 500 }
      );
    }

    // Record reschedule history
    await supabase
      .from('hs.appointment_history')
      .insert({
        appointment_id: appointmentId,
        action: 'reschedule',
        old_status: currentAppointment.status,
        new_status: 'scheduled',
        notes: 'Rescheduled from ${originalDetails.scheduled_date} ${originalDetails.scheduled_time_start} to ${rescheduleData.new_scheduled_date} ${rescheduleData.new_scheduled_time_start}. Reason: ${rescheduleData.reason || 'Not specified'}',
        metadata: {
          original: originalDetails,
          new: {
            scheduled_date: rescheduleData.new_scheduled_date,
            scheduled_time_start: rescheduleData.new_scheduled_time_start,
            scheduled_time_end: newScheduledTimeEnd,
            primary_technician_id: rescheduleData.new_primary_technician_id || currentAppointment.primary_technician_id,
            estimated_duration: rescheduleData.new_estimated_duration || currentAppointment.estimated_duration,
          }
        },
        created_by: user.id,
      });

    // TODO: Send notification to customer if notify_customer is true
    // This would integrate with your notification system (email, SMS, etc.)

    return NextResponse.json({
      message: 'Appointment rescheduled successfully',
      appointment: updatedAppointment,
      reschedule_details: {
        original_date: originalDetails.scheduled_date,
        original_time: originalDetails.scheduled_time_start,
        new_date: rescheduleData.new_scheduled_date,
        new_time: rescheduleData.new_scheduled_time_start,
        technician_changed: rescheduleData.new_primary_technician_id !== currentAppointment.primary_technician_id,
        reschedule_count: updateData.reschedule_count,
        notify_customer: rescheduleData.notify_customer,
      }
    });

  } catch (error) {
    console.error('POST /api/v1/hs/appointments/[id]/reschedule error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid reschedule data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}