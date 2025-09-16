import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// History query schema
const HistoryQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  
  // Filter by type of history
  include_work_orders: z.boolean().default(true),
  include_appointments: z.boolean().default(true),
  include_estimates: z.boolean().default(true),
  include_invoices: z.boolean().default(true),
  include_communications: z.boolean().default(true),
  include_payments: z.boolean().default(true),
  
  // Date filters
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  
  // Status filters
  work_order_status: z.enum(['new', 'scheduled', 'dispatched', 'in_progress', 'completed', 'cancelled', 'on_hold']).optional(),
  appointment_status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']).optional(),
  estimate_status: z.enum(['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired']).optional(),
  invoice_status: z.enum(['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled']).optional(),
  
  // Sorting
  sort: z.enum(['date', 'type', 'amount', 'status']).default('date'),
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

// Helper function to verify customer access
async function verifyCustomerAccess(customerId: string, organizationId: string) {
  const { data: customer } = await supabase
    .from('hs.customers')
    .select('id, first_name, last_name, company_name')
    .eq('id', customerId)
    .eq('organization_id', organizationId)
    .single();
  
  return customer;
}

// Helper function to format history items
function formatHistoryItem(item: unknown, type: string): unknown {
  const baseItem = {
    id: item.id,
    type,
    date: item.created_at || item.scheduled_date || item.sent_at || item.payment_date,
    amount: item.total_amount || item.estimate_total || item.payment_amount || 0,
    status: item.status,
  };

  switch (type) {
    case 'work_order':
      return {
        ...baseItem,
        work_order_number: item.work_order_number,
        service_type: item.service_type,
        technician: item.technicians ? `${item.technicians.first_name} ${item.technicians.last_name}' : null,
        date: item.scheduled_date || item.created_at,
        description: '${item.service_type} - ${item.work_order_number}',
        priority: item.priority,
      };

    case 'appointment`:
      return {
        ...baseItem,
        scheduled_date: item.scheduled_date,
        scheduled_time: item.scheduled_time_start,
        service_type: item.service_type,
        technician: item.technicians ? `${item.technicians.first_name} ${item.technicians.last_name}' : null,
        description: 'Appointment - ${item.service_type}',
        duration: item.estimated_duration,
        date: item.scheduled_date,
      };

    case 'estimate':
      return {
        ...baseItem,
        estimate_number: item.estimate_number,
        description: 'Estimate ${item.estimate_number}',
        valid_until: item.valid_until,
        date: item.created_at,
        amount: item.total_amount,
      };

    case 'invoice':
      return {
        ...baseItem,
        invoice_number: item.invoice_number,
        description: 'Invoice ${item.invoice_number}',
        due_date: item.due_date,
        date: item.created_at,
        amount: item.total_amount,
        amount_paid: item.amount_paid,
        balance_due: item.total_amount - (item.amount_paid || 0),
      };

    case 'communication':
      return {
        ...baseItem,
        communication_type: item.communication_type,
        subject: item.subject,
        description: '${item.communication_type.toUpperCase()}: ${item.subject || 'Communication'}',
        direction: item.direction,
        date: item.sent_at || item.created_at,
        amount: 0,
      };

    case 'payment':
      return {
        ...baseItem,
        payment_method: item.payment_method,
        description: 'Payment - ${item.payment_method}',
        date: item.payment_date,
        amount: item.payment_amount,
        reference_number: item.reference_number,
        invoice_number: item.invoices?.invoice_number,
      };

    default:
      return baseItem;
  }
}

// GET /api/v1/hs/customers/[id]/history - Get customer history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const { searchParams } = new URL(request.url);
    const query = HistoryQuerySchema.parse(Object.fromEntries(searchParams));

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

    // Verify customer access
    const customer = await verifyCustomerAccess(customerId, organizationId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    const allHistoryItems: unknown[] = [];

    // Get Work Orders
    if (query.include_work_orders) {
      let workOrderQuery = supabase
        .from('hs.work_orders')
        .select('
          id,
          work_order_number,
          service_type,
          status,
          priority,
          scheduled_date,
          estimate_total,
          created_at,
          technicians:primary_technician_id(
            first_name,
            last_name
          )
        ')
        .eq('customer_id', customerId)
        .eq('organization_id', organizationId);

      if (query.work_order_status) {
        workOrderQuery = workOrderQuery.eq('status', query.work_order_status);
      }

      if (query.date_from) {
        workOrderQuery = workOrderQuery.gte('created_at', query.date_from);
      }

      if (query.date_to) {
        const endDate = new Date(query.date_to);
        endDate.setHours(23, 59, 59, 999);
        workOrderQuery = workOrderQuery.lte('created_at', endDate.toISOString());
      }

      const { data: workOrders } = await workOrderQuery;
      if (workOrders) {
        allHistoryItems.push(...workOrders.map(item => formatHistoryItem(item, 'work_order')));
      }
    }

    // Get Appointments
    if (query.include_appointments) {
      let appointmentQuery = supabase
        .from('hs.appointments')
        .select('
          id,
          service_type,
          status,
          scheduled_date,
          scheduled_time_start,
          estimated_duration,
          created_at,
          technicians:primary_technician_id(
            first_name,
            last_name
          )
        ')
        .eq('customer_id', customerId)
        .eq('organization_id', organizationId);

      if (query.appointment_status) {
        appointmentQuery = appointmentQuery.eq('status', query.appointment_status);
      }

      const { data: appointments } = await appointmentQuery;
      if (appointments) {
        allHistoryItems.push(...appointments.map(item => formatHistoryItem(item, 'appointment')));
      }
    }

    // Get Estimates
    if (query.include_estimates) {
      let estimateQuery = supabase
        .from('hs.estimates')
        .select('
          id,
          estimate_number,
          status,
          total_amount,
          valid_until,
          created_at
        ')
        .eq('customer_id', customerId)
        .eq('organization_id', organizationId);

      if (query.estimate_status) {
        estimateQuery = estimateQuery.eq('status', query.estimate_status);
      }

      const { data: estimates } = await estimateQuery;
      if (estimates) {
        allHistoryItems.push(...estimates.map(item => formatHistoryItem(item, 'estimate')));
      }
    }

    // Get Invoices
    if (query.include_invoices) {
      let invoiceQuery = supabase
        .from('hs.invoices')
        .select('
          id,
          invoice_number,
          status,
          total_amount,
          amount_paid,
          due_date,
          created_at
        ')
        .eq('customer_id', customerId)
        .eq('organization_id', organizationId);

      if (query.invoice_status) {
        invoiceQuery = invoiceQuery.eq('status', query.invoice_status);
      }

      const { data: invoices } = await invoiceQuery;
      if (invoices) {
        allHistoryItems.push(...invoices.map(item => formatHistoryItem(item, 'invoice')));
      }
    }

    // Get Communications
    if (query.include_communications) {
      const { data: communications } = await supabase
        .from('hs.communications')
        .select('
          id,
          communication_type,
          direction,
          subject,
          status,
          sent_at,
          created_at
        ')
        .eq('customer_id', customerId)
        .eq('organization_id', organizationId);

      if (communications) {
        allHistoryItems.push(...communications.map(item => formatHistoryItem(item, 'communication')));
      }
    }

    // Get Payments
    if (query.include_payments) {
      const { data: payments } = await supabase
        .from('hs.invoice_payments')
        .select('
          id,
          payment_amount,
          payment_method,
          payment_date,
          reference_number,
          invoices:invoice_id(
            invoice_number
          )
        ')
        .eq('organization_id', organizationId)
        .eq('invoices.customer_id', customerId);

      if (payments) {
        allHistoryItems.push(...payments.map(item => formatHistoryItem(item, 'payment')));
      }
    }

    // Sort all history items
    allHistoryItems.sort((a, b) => {
      const aDate = new Date(a.date || 0).getTime();
      const bDate = new Date(b.date || 0).getTime();
      
      if (query.sort === 'date') {
        return query.order === 'desc' ? bDate - aDate : aDate - bDate;
      } else if (query.sort === 'amount') {
        return query.order === 'desc' ? (b.amount || 0) - (a.amount || 0) : (a.amount || 0) - (b.amount || 0);
      } else if (query.sort === 'type') {
        return query.order === 'desc' ? b.type.localeCompare(a.type) : a.type.localeCompare(b.type);
      }
      
      return 0;
    });

    // Apply pagination
    const offset = (query.page - 1) * query.limit;
    const paginatedItems = allHistoryItems.slice(offset, offset + query.limit);
    const total = allHistoryItems.length;
    const totalPages = Math.ceil(total / query.limit);

    // Calculate summary statistics
    const summary = {
      total_items: total,
      work_orders_count: allHistoryItems.filter(item => item.type === 'work_order').length,
      appointments_count: allHistoryItems.filter(item => item.type === 'appointment').length,
      estimates_count: allHistoryItems.filter(item => item.type === 'estimate').length,
      invoices_count: allHistoryItems.filter(item => item.type === 'invoice').length,
      communications_count: allHistoryItems.filter(item => item.type === 'communication').length,
      payments_count: allHistoryItems.filter(item => item.type === 'payment').length,
      total_revenue: allHistoryItems
        .filter(item => ['invoice', 'payment'].includes(item.type))
        .reduce((sum, item) => sum + (item.amount || 0), 0),
      date_range: {
        from: query.date_from,
        to: query.date_to,
        oldest_item: allHistoryItems.length > 0 ? 
          allHistoryItems.reduce((oldest, current) => 
            new Date(current.date) < new Date(oldest.date) ? current : oldest
          ).date : null,
        newest_item: allHistoryItems.length > 0 ? 
          allHistoryItems.reduce((newest, current) => 
            new Date(current.date) > new Date(newest.date) ? current : newest
          ).date : null,
      },
    };

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.company_name || '${customer.first_name} ${customer.last_name}',
      },
      history: paginatedItems,
      summary,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/customers/[id]/history error:', error);
    
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