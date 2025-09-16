import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Communication validation schema
const CommunicationSchema = z.object({
  // Communication details
  communication_type: z.enum(['email', 'sms', 'call', 'whatsapp', 'in_app', 'postal']),
  direction: z.enum(['inbound', 'outbound']),
  channel: z.enum(['system', 'manual', 'automated']),
  
  // Content
  subject: z.string().min(1).max(200).optional(),
  message: z.string().min(1),
  template_id: z.string().uuid().optional(),
  
  // Recipients/Participants
  customer_id: z.string().uuid().optional(),
  technician_id: z.string().uuid().optional(),
  contact_name: z.string().max(100).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(20).optional(),
  
  // References
  work_order_id: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional(),
  estimate_id: z.string().uuid().optional(),
  invoice_id: z.string().uuid().optional(),
  
  // Status and tracking
  status: z.enum(['draft', 'sent', 'delivered', 'read', 'replied', 'failed', 'cancelled']).default('draft'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  
  // Scheduling
  scheduled_send_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  
  // Delivery tracking
  delivery_receipt_requested: z.boolean().default(false),
  read_receipt_requested: z.boolean().default(false),
  
  // Attachments
  attachments: z.array(z.object({
    file_name: z.string(),
    file_url: z.string().url(),
    file_size: z.number().optional(),
    mime_type: z.string().optional(),
  })).optional(),
  
  // Settings
  is_confidential: z.boolean().default(false),
  auto_archive_after_days: z.number().min(1).optional(),
  tags: z.array(z.string()).optional(),
  
  // Notes
  internal_notes: z.string().optional(),
});

// Communication query schema
const CommunicationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  
  // Filters
  communication_type: z.enum(['email', 'sms', 'call', 'whatsapp', 'in_app', 'postal']).optional(),
  direction: z.enum(['inbound', 'outbound']).optional(),
  status: z.enum(['draft', 'sent', 'delivered', 'read', 'replied', 'failed', 'cancelled']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  
  // Participants
  customer_id: z.string().uuid().optional(),
  technician_id: z.string().uuid().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  
  // References
  work_order_id: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional(),
  estimate_id: z.string().uuid().optional(),
  invoice_id: z.string().uuid().optional(),
  
  // Search
  search: z.string().optional(), // Search in subject, message, contact name
  tags: z.array(z.string()).optional(),
  
  // Date filters
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  sent_from: z.string().date().optional(),
  sent_to: z.string().date().optional(),
  
  // Special filters
  unread: z.boolean().optional(),
  has_attachments: z.boolean().optional(),
  is_overdue: z.boolean().optional(), // Scheduled but not sent
  is_confidential: z.boolean().optional(),
  
  sort: z.enum(['created_at', 'sent_at', 'subject', 'priority', 'status']).default('created_at'),
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

// Helper function to validate participant references
async function validateParticipantReferences(
  organizationId: string,
  customerId?: string,
  technicianId?: string,
  workOrderId?: string,
  appointmentId?: string,
  estimateId?: string,
  invoiceId?: string
) {
  const validationErrors = [];

  // Validate customer
  if (customerId) {
    const { data: customer } = await supabase
      .from('hs.customers')
      .select('id')
      .eq('id', customerId)
      .eq('organization_id', organizationId)
      .single();
    
    if (!customer) validationErrors.push('Customer not found');
  }

  // Validate technician
  if (technicianId) {
    const { data: technician } = await supabase
      .from('hs.technicians')
      .select('id')
      .eq('id', technicianId)
      .eq('organization_id', organizationId)
      .single();
    
    if (!technician) validationErrors.push('Technician not found');
  }

  // Validate work order
  if (workOrderId) {
    const { data: workOrder } = await supabase
      .from('hs.work_orders')
      .select('id')
      .eq('id', workOrderId)
      .eq('organization_id', organizationId)
      .single();
    
    if (!workOrder) validationErrors.push('Work order not found');
  }

  // Validate appointment
  if (appointmentId) {
    const { data: appointment } = await supabase
      .from('hs.appointments')
      .select('id')
      .eq('id', appointmentId)
      .eq('organization_id', organizationId)
      .single();
    
    if (!appointment) validationErrors.push('Appointment not found');
  }

  // Validate estimate
  if (estimateId) {
    const { data: estimate } = await supabase
      .from('hs.estimates')
      .select('id')
      .eq('id', estimateId)
      .eq('organization_id', organizationId)
      .single();
    
    if (!estimate) validationErrors.push('Estimate not found');
  }

  // Validate invoice
  if (invoiceId) {
    const { data: invoice } = await supabase
      .from('hs.invoices')
      .select('id')
      .eq('id', invoiceId)
      .eq('organization_id', organizationId)
      .single();
    
    if (!invoice) validationErrors.push('Invoice not found');
  }

  return validationErrors;
}

// GET /api/v1/hs/communications - List communications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = CommunicationQuerySchema.parse(Object.fromEntries(searchParams));
    
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
      .from('hs.communications')
      .select('
        id,
        communication_type,
        direction,
        channel,
        subject,
        message,
        template_id,
        customer_id,
        technician_id,
        contact_name,
        contact_email,
        contact_phone,
        work_order_id,
        appointment_id,
        estimate_id,
        invoice_id,
        status,
        priority,
        scheduled_send_at,
        sent_at,
        delivered_at,
        read_at,
        replied_at,
        failed_at,
        expires_at,
        delivery_receipt_requested,
        read_receipt_requested,
        attachments,
        is_confidential,
        auto_archive_after_days,
        tags,
        internal_notes,
        created_at,
        updated_at,
        customers:customer_id(
          first_name,
          last_name,
          company_name,
          email,
          phone
        ),
        technicians:technician_id(
          first_name,
          last_name,
          phone,
          employee_id
        ),
        work_orders:work_order_id(
          work_order_number,
          status,
          service_type
        ),
        appointments:appointment_id(
          scheduled_date,
          scheduled_time_start,
          service_type
        ),
        estimates:estimate_id(
          estimate_number,
          status,
          total_amount
        ),
        invoices:invoice_id(
          invoice_number,
          status,
          total_amount
        ),
        templates:template_id(
          name,
          template_type
        )
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.communication_type) {
      supabaseQuery = supabaseQuery.eq('communication_type', query.communication_type);
    }
    
    if (query.direction) {
      supabaseQuery = supabaseQuery.eq('direction', query.direction);
    }
    
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }
    
    if (query.priority) {
      supabaseQuery = supabaseQuery.eq('priority', query.priority);
    }
    
    if (query.customer_id) {
      supabaseQuery = supabaseQuery.eq('customer_id', query.customer_id);
    }
    
    if (query.technician_id) {
      supabaseQuery = supabaseQuery.eq('technician_id', query.technician_id);
    }
    
    if (query.contact_email) {
      supabaseQuery = supabaseQuery.eq('contact_email', query.contact_email);
    }
    
    if (query.contact_phone) {
      supabaseQuery = supabaseQuery.eq('contact_phone', query.contact_phone);
    }
    
    if (query.work_order_id) {
      supabaseQuery = supabaseQuery.eq('work_order_id', query.work_order_id);
    }
    
    if (query.appointment_id) {
      supabaseQuery = supabaseQuery.eq('appointment_id', query.appointment_id);
    }
    
    if (query.estimate_id) {
      supabaseQuery = supabaseQuery.eq('estimate_id', query.estimate_id);
    }
    
    if (query.invoice_id) {
      supabaseQuery = supabaseQuery.eq('invoice_id', query.invoice_id);
    }
    
    if (query.tags && query.tags.length > 0) {
      supabaseQuery = supabaseQuery.overlaps('tags', query.tags);
    }
    
    if (query.date_from) {
      supabaseQuery = supabaseQuery.gte('created_at', query.date_from);
    }
    
    if (query.date_to) {
      const endDate = new Date(query.date_to);
      endDate.setHours(23, 59, 59, 999);
      supabaseQuery = supabaseQuery.lte('created_at', endDate.toISOString());
    }
    
    if (query.sent_from) {
      supabaseQuery = supabaseQuery.gte('sent_at', query.sent_from);
    }
    
    if (query.sent_to) {
      const endDate = new Date(query.sent_to);
      endDate.setHours(23, 59, 59, 999);
      supabaseQuery = supabaseQuery.lte('sent_at', endDate.toISOString());
    }
    
    if (query.unread) {
      supabaseQuery = supabaseQuery.is('read_at', null);
    }
    
    if (query.has_attachments) {
      supabaseQuery = supabaseQuery.not('attachments', 'is', null);
    }
    
    if (query.is_overdue) {
      const now = new Date().toISOString();
      supabaseQuery = supabaseQuery
        .lt('scheduled_send_at', now)
        .eq('status', 'draft');
    }
    
    if (query.is_confidential !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_confidential', query.is_confidential);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'subject.ilike.%${query.search}%,message.ilike.%${query.search}%,contact_name.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: communications, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch communications' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      communications: communications || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/communications error:', error);
    
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

// POST /api/v1/hs/communications - Create communication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const communicationData = CommunicationSchema.parse(body);

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

    // Validate participant and reference IDs
    const validationErrors = await validateParticipantReferences(
      organizationId,
      communicationData.customer_id,
      communicationData.technician_id,
      communicationData.work_order_id,
      communicationData.appointment_id,
      communicationData.estimate_id,
      communicationData.invoice_id
    );

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Validate template if provided
    if (communicationData.template_id) {
      const { data: template } = await supabase
        .from('hs.communication_templates')
        .select('id, template_type, subject_template, message_template')
        .eq('id', communicationData.template_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!template) {
        return NextResponse.json(
          { error: 'Communication template not found' },
          { status: 400 }
        );
      }
    }

    // Create communication
    const { data: communication, error } = await supabase
      .from('hs.communications')
      .insert({
        ...communicationData,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select('
        *,
        customers:customer_id(
          first_name,
          last_name,
          company_name,
          email,
          phone
        ),
        technicians:technician_id(
          first_name,
          last_name,
          phone,
          employee_id
        ),
        templates:template_id(
          name,
          template_type
        )
      ')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create communication' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { communication },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/communications error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid communication data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}