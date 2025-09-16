import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Availability query schema
const AvailabilityQuerySchema = z.object({
  technician_id: z.string().uuid().optional(),
  date_from: z.string().date(),
  date_to: z.string().date(),
  service_duration: z.number().min(15).max(480).default(60), // Duration in minutes
  service_type: z.enum(['maintenance', 'repair', 'installation', 'inspection', 'consultation', 'emergency']).optional(),
  time_start: z.string().time().optional(), // Preferred start time
  time_end: z.string().time().optional(), // Preferred end time  
  buffer_time: z.number().min(0).max(60).default(15), // Buffer between appointments in minutes
  include_weekends: z.boolean().default(false),
  max_results: z.number().min(1).max(100).default(50),
});

// Time slot generation schema
const TimeSlotSchema = z.object({
  date: z.string().date(),
  time_start: z.string().time(),
  time_end: z.string().time(),
  duration: z.number().min(15).max(480).default(60),
  technician_ids: z.array(z.string().uuid()).optional(), // If not provided, find available technicians
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

// Helper function to check if date is weekend
function isWeekend(dateString: string): boolean {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

// Helper function to generate time slots for a day
function generateTimeSlots(
  date: string,
  startTime: string = '08:00',
  endTime: string = '17:00',
  duration: number = 60,
  buffer: number = 15
): Array<{start: string, end: string}> {
  const slots: Array<{start: string, end: string}> = [];
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const slotDuration = duration + buffer;
  
  for (const currentTime = startMinutes; currentTime + duration <= endMinutes; currentTime += slotDuration) {
    const slotStartHour = Math.floor(currentTime / 60);
    const slotStartMin = currentTime % 60;
    const slotEndTime = currentTime + duration;
    const slotEndHour = Math.floor(slotEndTime / 60);
    const slotEndMin = slotEndTime % 60;
    
    const start = '${slotStartHour.toString().padStart(2, '0')}:${slotStartMin.toString().padStart(2, '0')}';
    const end = '${slotEndHour.toString().padStart(2, '0')}:${slotEndMin.toString().padStart(2, '0')}';
    
    slots.push({ start, end });
  }
  
  return slots;
}

// Helper function to check technician availability for specific time slot
async function checkTechnicianAvailability(
  technicianId: string,
  organizationId: string,
  date: string,
  timeStart: string,
  timeEnd: string
): Promise<boolean> {
  // Check for conflicting appointments
  const { data: conflicts } = await supabase
    .from('hs.appointments')
    .select('id, scheduled_time_start, scheduled_time_end, estimated_duration')
    .eq('primary_technician_id', technicianId)
    .eq('scheduled_date', date)
    .in('status', ['scheduled', 'confirmed', 'in_progress`]);

  if (conflicts && conflicts.length > 0) {
    const newStart = new Date(`${date}T${timeStart}`);
    const newEnd = new Date(`${date}T${timeEnd}`);
    
    const hasConflict = conflicts.some(conflict => {
      const existingStart = new Date(`${date}T${conflict.scheduled_time_start}');
      const existingEnd = new Date('${date}T${conflict.scheduled_time_end || conflict.scheduled_time_start}');
      if (!conflict.scheduled_time_end && conflict.estimated_duration) {
        existingEnd.setMinutes(existingEnd.getMinutes() + conflict.estimated_duration);
      }
      
      return newStart < existingEnd && newEnd > existingStart;
    });
    
    if (hasConflict) return false;
  }

  // Check technician working hours/schedule (if you have a technician_schedules table)
  // This would check against the technician's regular working hours, time off, etc.
  
  return true;
}

// GET /api/v1/hs/schedule/availability - Get available time slots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = AvailabilityQuerySchema.parse(Object.fromEntries(searchParams));
    
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

    // Get available technicians
    let techniciansQuery = supabase
      .from('hs.technicians')
      .select('id, first_name, last_name, phone, employee_id, skills, certifications')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (query.technician_id) {
      techniciansQuery = techniciansQuery.eq('id', query.technician_id);
    }

    // Filter by service type skills if specified
    if (query.service_type) {
      techniciansQuery = techniciansQuery.contains('skills', [query.service_type]);
    }

    const { data: technicians, error: techError } = await techniciansQuery;

    if (techError) {
      console.error('Database error fetching technicians:', techError);
      return NextResponse.json(
        { error: 'Failed to fetch technicians' },
        { status: 500 }
      );
    }

    if (!technicians || technicians.length === 0) {
      return NextResponse.json({
        availability: [],
        summary: {
          date_range: { from: query.date_from, to: query.date_to },
          total_slots: 0,
          available_technicians: 0,
          message: query.technician_id ? 'Specified technician not found or not available' : 'No available technicians found'
        }
      });
    }

    // Generate date range
    const startDate = new Date(query.date_from);
    const endDate = new Date(query.date_to);
    const availableSlots: Array<{
      date: string;
      day_of_week: string;
      time_start: string;
      time_end: string;
      duration: number;
      available_technicians: Array<{
        id: string;
        first_name: string;
        last_name: string;
        phone: string;
        employee_id: string;
      }>;
    }> = [];

    // Iterate through each date in range
    for (const currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Skip weekends if not included
      if (!query.include_weekends && isWeekend(dateString)) {
        continue;
      }

      // Generate time slots for this day
      const timeSlots = generateTimeSlots(
        dateString,
        query.time_start || '08:00',
        query.time_end || '17:00',
        query.service_duration,
        query.buffer_time
      );

      // Check availability for each time slot
      for (const slot of timeSlots) {
        const availableTechnicians = [];
        
        for (const technician of technicians) {
          const isAvailable = await checkTechnicianAvailability(
            technician.id,
            organizationId,
            dateString,
            slot.start,
            slot.end
          );
          
          if (isAvailable) {
            availableTechnicians.push({
              id: technician.id,
              first_name: technician.first_name,
              last_name: technician.last_name,
              phone: technician.phone,
              employee_id: technician.employee_id,
            });
          }
        }

        // Only include slots with available technicians
        if (availableTechnicians.length > 0) {
          availableSlots.push({
            date: dateString,
            day_of_week: dayOfWeek,
            time_start: slot.start,
            time_end: slot.end,
            duration: query.service_duration,
            available_technicians: availableTechnicians,
          });
        }

        // Limit results
        if (availableSlots.length >= query.max_results) {
          break;
        }
      }

      if (availableSlots.length >= query.max_results) {
        break;
      }
    }

    // Group by date for easier frontend consumption
    const groupedAvailability = availableSlots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = {
          date: slot.date,
          day_of_week: slot.day_of_week,
          slots: []
        };
      }
      
      acc[slot.date].slots.push({
        time_start: slot.time_start,
        time_end: slot.time_end,
        duration: slot.duration,
        available_technicians: slot.available_technicians,
      });
      
      return acc;
    }, {} as Record<string, unknown>);

    return NextResponse.json({
      availability: Object.values(groupedAvailability),
      summary: {
        date_range: { from: query.date_from, to: query.date_to },
        total_slots: availableSlots.length,
        available_technicians: technicians.length,
        service_duration: query.service_duration,
        buffer_time: query.buffer_time,
        includes_weekends: query.include_weekends,
      }
    });

  } catch (error) {
    console.error('GET /api/v1/hs/schedule/availability error:', error);
    
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

// POST /api/v1/hs/schedule/availability/check - Check specific time slot availability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const timeSlotData = TimeSlotSchema.parse(body);

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

    // Determine which technicians to check
    let techniciansToCheck = timeSlotData.technician_ids || [];
    
    if (techniciansToCheck.length === 0) {
      // Get all active technicians
      const { data: allTechnicians } = await supabase
        .from('hs.technicians')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('status', 'active');
      
      techniciansToCheck = allTechnicians?.map(t => t.id) || [];
    }

    // Check availability for each technician
    const availabilityResults = await Promise.all(
      techniciansToCheck.map(async (technicianId) => {
        const { data: technician } = await supabase
          .from('hs.technicians')
          .select('id, first_name, last_name, phone, employee_id')
          .eq('id', technicianId)
          .eq('organization_id', organizationId)
          .single();

        if (!technician) return null;

        const isAvailable = await checkTechnicianAvailability(
          technicianId,
          organizationId,
          timeSlotData.date,
          timeSlotData.time_start,
          timeSlotData.time_end
        );

        return {
          technician,
          available: isAvailable,
        };
      })
    );

    // Filter out null results and separate available/unavailable
    const validResults = availabilityResults.filter(result => result !== null);
    const availableTechnicians = validResults.filter(result => result!.available).map(result => result!.technician);
    const unavailableTechnicians = validResults.filter(result => !result!.available).map(result => result!.technician);

    return NextResponse.json({
      time_slot: {
        date: timeSlotData.date,
        time_start: timeSlotData.time_start,
        time_end: timeSlotData.time_end,
        duration: timeSlotData.duration,
      },
      availability: {
        is_available: availableTechnicians.length > 0,
        available_technicians: availableTechnicians,
        unavailable_technicians: unavailableTechnicians,
        total_technicians_checked: validResults.length,
      }
    });

  } catch (error) {
    console.error('POST /api/v1/hs/schedule/availability/check error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid time slot data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}