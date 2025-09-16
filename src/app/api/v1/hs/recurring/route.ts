import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Recurring service schemas
const RecurringServiceSchema = z.object({
  customer_id: z.string().uuid(),
  service_template_id: z.string().uuid().optional(), // Reference to service templates
  
  // Service details
  service_name: z.string().min(1).max(255),
  service_description: z.string().optional(),
  service_type: z.enum(['maintenance', 'inspection', 'cleaning', 'repair', 'monitoring', 'other']),
  
  // Scheduling configuration
  recurrence_pattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semi_annually', 'annually']),
    interval: z.number().min(1).max(365), // Every N units (e.g., every 2 weeks)
    days_of_week: z.array(z.number().min(0).max(6)).optional(), // For weekly: [1,3,5] = Mon,Wed,Fri
    day_of_month: z.number().min(1).max(31).optional(), // For monthly: 15 = 15th of each month
    months: z.array(z.number().min(1).max(12)).optional(), // For annually: [3,6,9,12] = quarterly
    end_date: z.string().date().optional(), // When to stop recurring
    max_occurrences: z.number().min(1).optional(), // Limit number of recurrences
  }),
  
  // Service specifications
  estimated_duration_minutes: z.number().min(15).max(480).default(60), // 15 min to 8 hours
  required_skills: z.array(z.string()).optional(),
  required_equipment: z.array(z.string()).optional(),
  required_parts: z.array(z.object({
    part_name: z.string(),
    quantity: z.number().min(1),
    part_number: z.string().optional(),
    estimated_cost: z.number().min(0).optional(),
  })).optional(),
  
  // Pricing and billing
  service_rate: z.number().min(0),
  billing_type: z.enum(['per_service', 'monthly_subscription', 'annual_contract']),
  auto_invoice: z.boolean().default(false),
  payment_terms: z.enum(['net_15', 'net_30', 'due_on_receipt', 'subscription']).default('net_30'),
  
  // Assignment preferences
  preferred_technician_id: z.string().uuid().optional(),
  technician_rotation: z.boolean().default(false), // Rotate between available techs
  service_window: z.object({
    preferred_time_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM
    preferred_time_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM
    flexible_scheduling: z.boolean().default(true),
    advance_notice_days: z.number().min(1).max(30).default(7),
  }).optional(),
  
  // Customer preferences
  customer_preferences: z.object({
    contact_method: z.enum(['phone', 'email', 'sms', 'portal']).default('email'),
    reminder_schedule: z.array(z.number()).default([7, 1]), // Days before service
    special_instructions: z.string().optional(),
    access_instructions: z.string().optional(),
    key_location: z.string().optional(),
  }).optional(),
  
  // Contract and status
  contract_start_date: z.string().date(),
  contract_end_date: z.string().date().optional(),
  next_service_date: z.string().date(),
  is_active: z.boolean().default(true),
  is_paused: z.boolean().default(false),
  pause_reason: z.string().optional(),
  
  // Additional metadata
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const RecurringServiceQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  
  // Filters
  customer_id: z.string().uuid().optional(),
  service_type: z.enum(['maintenance', 'inspection', 'cleaning', 'repair', 'monitoring', 'other']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semi_annually', 'annually']).optional(),
  billing_type: z.enum(['per_service', 'monthly_subscription', 'annual_contract']).optional(),
  technician_id: z.string().uuid().optional(),
  
  // Status filters
  is_active: z.boolean().optional(),
  is_paused: z.boolean().optional(),
  needs_scheduling: z.boolean().optional(), // Services due for scheduling
  overdue: z.boolean().optional(),
  
  // Date filters
  next_service_from: z.string().date().optional(),
  next_service_to: z.string().date().optional(),
  contract_expires_before: z.string().date().optional(),
  created_from: z.string().datetime().optional(),
  created_to: z.string().datetime().optional(),
  
  // Value filters
  min_service_rate: z.number().min(0).optional(),
  max_service_rate: z.number().min(0).optional(),
  
  // Include options
  include_customer_details: z.boolean().default(true),
  include_service_history: z.boolean().default(false),
  include_next_occurrences: z.boolean().default(false),
  
  // Sorting
  sort: z.enum(['next_service_date', 'service_name', 'customer_name', 'service_rate', 'created_at']).default('next_service_date'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

// Schema for generating service occurrences
const GenerateOccurrencesSchema = z.object({
  recurring_service_id: z.string().uuid(),
  generate_until: z.string().date(),
  auto_schedule: z.boolean().default(false),
  skip_existing: z.boolean().default(true),
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

// Helper function to calculate next service dates
function calculateNextServiceDates(recurrencePattern: unknown, 
  startDate: string, 
  count: number = 12
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  
  for (const i = 0; i < count; i++) {
    let nextDate: Date;
    
    switch (recurrencePattern.frequency) {
      case 'daily':
        nextDate = new Date(start);
        nextDate.setDate(start.getDate() + (i * recurrencePattern.interval));
        break;
        
      case 'weekly':
        nextDate = new Date(start);
        nextDate.setDate(start.getDate() + (i * recurrencePattern.interval * 7));
        break;
        
      case 'monthly':
        nextDate = new Date(start);
        nextDate.setMonth(start.getMonth() + (i * recurrencePattern.interval));
        if (recurrencePattern.day_of_month) {
          nextDate.setDate(recurrencePattern.day_of_month);
        }
        break;
        
      case 'quarterly':
        nextDate = new Date(start);
        nextDate.setMonth(start.getMonth() + (i * 3 * recurrencePattern.interval));
        break;
        
      case 'semi_annually':
        nextDate = new Date(start);
        nextDate.setMonth(start.getMonth() + (i * 6 * recurrencePattern.interval));
        break;
        
      case 'annually':
        nextDate = new Date(start);
        nextDate.setFullYear(start.getFullYear() + (i * recurrencePattern.interval));
        break;
        
      default:
        continue;
    }
    
    // Check if we've reached the end date
    if (recurrencePattern.end_date && nextDate > new Date(recurrencePattern.end_date)) {
      break;
    }
    
    dates.push(nextDate.toISOString().split('T')[0]);
  }
  
  return dates;
}

// Helper function to log recurring service activity
async function logRecurringServiceActivity(
  recurringServiceId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('hs.recurring_service_activity_log')
    .insert({
      recurring_service_id: recurringServiceId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/hs/recurring - List recurring services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = RecurringServiceQuerySchema.parse(Object.fromEntries(searchParams));

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
      .from('hs.recurring_services')
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
        preferred_technician:preferred_technician_id(first_name, last_name),
        created_by_user:created_by(first_name, last_name)
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.customer_id) {
      supabaseQuery = supabaseQuery.eq('customer_id', query.customer_id);
    }
    
    if (query.service_type) {
      supabaseQuery = supabaseQuery.eq('service_type', query.service_type);
    }
    
    if (query.billing_type) {
      supabaseQuery = supabaseQuery.eq('billing_type', query.billing_type);
    }
    
    if (query.technician_id) {
      supabaseQuery = supabaseQuery.eq('preferred_technician_id', query.technician_id);
    }
    
    if (query.is_active !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_active', query.is_active);
    }
    
    if (query.is_paused !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_paused', query.is_paused);
    }
    
    if (query.overdue) {
      const today = new Date().toISOString().split('T')[0];
      supabaseQuery = supabaseQuery
        .lt('next_service_date', today)
        .eq('is_active', true)
        .eq('is_paused', false);
    }
    
    if (query.needs_scheduling) {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      supabaseQuery = supabaseQuery
        .lte('next_service_date', weekFromNow.toISOString().split('T')[0])
        .eq('is_active', true)
        .eq('is_paused', false);
    }

    // Date filters
    if (query.next_service_from) {
      supabaseQuery = supabaseQuery.gte('next_service_date', query.next_service_from);
    }
    
    if (query.next_service_to) {
      supabaseQuery = supabaseQuery.lte('next_service_date', query.next_service_to);
    }
    
    if (query.contract_expires_before) {
      supabaseQuery = supabaseQuery.lte('contract_end_date', query.contract_expires_before);
    }

    // Value filters
    if (query.min_service_rate) {
      supabaseQuery = supabaseQuery.gte('service_rate', query.min_service_rate);
    }
    
    if (query.max_service_rate) {
      supabaseQuery = supabaseQuery.lte('service_rate`, query.max_service_rate);
    }

    // Apply search
    if (query.search && query.include_customer_details) {
      supabaseQuery = supabaseQuery.or(
        `service_name.ilike.%${query.search}%,service_description.ilike.%${query.search}%,customer.first_name.ilike.%${query.search}%,customer.last_name.ilike.%${query.search}%,customer.company_name.ilike.%${query.search}%'
      );
    } else if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'service_name.ilike.%${query.search}%,service_description.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: recurringServices, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recurring services' },
        { status: 500 }
      );
    }

    // Add calculated fields
    const enrichedServices = recurringServices?.map(service => {
      const nextOccurrences = query.include_next_occurrences ? 
        calculateNextServiceDates(service.recurrence_pattern, service.next_service_date, 6) : [];
      
      const isOverdue = new Date(service.next_service_date) < new Date();
      const daysUntilNext = Math.ceil((new Date(service.next_service_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...service,
        calculated_status: {
          is_overdue: isOverdue,
          days_until_next: daysUntilNext,
          next_occurrences: nextOccurrences,
        },
      };
    });

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Get recurring services statistics
    const { data: allServices } = await supabase
      .from('hs.recurring_services')
      .select('service_type, billing_type, is_active, is_paused, next_service_date, service_rate, contract_end_date')
      .eq('organization_id', organizationId);

    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const summary = {
      total_services: count || 0,
      active_services: allServices?.filter(s => s.is_active && !s.is_paused).length || 0,
      paused_services: allServices?.filter(s => s.is_paused).length || 0,
      overdue_services: allServices?.filter(s => 
        s.is_active && !s.is_paused && s.next_service_date < today
      ).length || 0,
      due_this_month: allServices?.filter(s => 
        s.is_active && !s.is_paused && s.next_service_date <= nextMonth.toISOString().split('T')[0]
      ).length || 0,
      expiring_contracts: allServices?.filter(s => 
        s.contract_end_date && s.contract_end_date <= nextMonth.toISOString().split('T')[0]
      ).length || 0,
      
      total_monthly_revenue: allServices?.reduce((sum, s) => {
        if (!s.is_active || s.is_paused) return sum;
        switch (s.billing_type) {
          case 'monthly_subscription':
            return sum + s.service_rate;
          case 'annual_contract':
            return sum + (s.service_rate / 12);
          default:
            return sum;
        }
      }, 0) || 0,
      
      by_service_type: allServices?.reduce((acc, service) => {
        acc[service.service_type] = (acc[service.service_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_billing_type: allServices?.reduce((acc, service) => {
        acc[service.billing_type] = (acc[service.billing_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    };

    return NextResponse.json({
      recurring_services: enrichedServices || [],
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
    console.error('GET /api/v1/hs/recurring error:', error);
    
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

// POST /api/v1/hs/recurring - Create recurring service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const serviceData = RecurringServiceSchema.parse(body);

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

    // Verify customer exists
    const { data: customer } = await supabase
      .from('hs.customers')
      .select('id, first_name, last_name, company_name')
      .eq('id', serviceData.customer_id)
      .eq('organization_id', organizationId)
      .single();

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    // Verify technician if specified
    if (serviceData.preferred_technician_id) {
      const { data: technician } = await supabase
        .from('hs.technicians')
        .select('id')
        .eq('id', serviceData.preferred_technician_id)
        .eq('organization_id', organizationId)
        .single();

      if (!technician) {
        return NextResponse.json(
          { error: 'Preferred technician not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Generate service contract number
    const contractNumber = 'RS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}';

    // Create recurring service
    const { data: recurringService, error } = await supabase
      .from('hs.recurring_services')
      .insert({
        ...serviceData,
        service_contract_number: contractNumber,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create recurring service' },
        { status: 500 }
      );
    }

    // Log recurring service creation
    await logRecurringServiceActivity(
      recurringService.id,
      'recurring_service_created',
      'Recurring service created: ${serviceData.service_name}',
      {
        customer_id: customer.id,
        service_type: serviceData.service_type,
        frequency: serviceData.recurrence_pattern.frequency,
        billing_type: serviceData.billing_type,
        service_rate: serviceData.service_rate,
      },
      organizationId,
      user.id
    );

    // Generate initial service occurrences for next 6 months
    const nextOccurrences = calculateNextServiceDates(
      serviceData.recurrence_pattern, 
      serviceData.contract_start_date, 
      6
    );

    return NextResponse.json({
      recurring_service: {
        ...recurringService,
        customer: customer,
        next_occurrences: nextOccurrences,
      },
      message: 'Recurring service created successfully',
      contract_number: contractNumber,
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/hs/recurring error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid recurring service data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}