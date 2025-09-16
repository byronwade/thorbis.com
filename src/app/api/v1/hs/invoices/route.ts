import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Invoice validation schema
const InvoiceSchema = z.object({
  customer_id: z.string().uuid(),
  work_order_id: z.string().uuid().optional(),
  estimate_id: z.string().uuid().optional(),
  
  // Billing address (can be different from service address)
  billing_address_line_1: z.string().min(1).max(255).optional(),
  billing_address_line_2: z.string().max(255).optional(),
  billing_city: z.string().min(1).max(100).optional(),
  billing_state_province: z.string().min(1).max(100).optional(),
  billing_postal_code: z.string().min(1).max(20).optional(),
  
  // Invoice details
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  
  // Dates
  invoice_date: z.string().date().default(() => new Date().toISOString().split('T')[0]),
  due_date: z.string().date(),
  service_date: z.string().date().optional(),
  
  // Pricing (will be calculated from items)
  subtotal: z.number().min(0).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
  tax_amount: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  total_amount: z.number().min(0).default(0),
  
  // Payment terms
  payment_terms: z.string().max(100).optional(),
  late_fee_percentage: z.number().min(0).max(100).default(0),
  
  // Line items
  items: z.array(z.object({
    item_type: z.enum(['labor', 'material', 'equipment', 'fee']),
    description: z.string().min(1),
    quantity: z.number().min(0.01),
    unit: z.string().max(20).default('each'),
    unit_price: z.number().min(0),
    total_price: z.number().min(0),
    markup_percentage: z.number().min(0).default(0),
    labor_hours: z.number().min(0).optional(),
    hourly_rate: z.number().min(0).optional(),
    product_code: z.string().max(100).optional(),
    manufacturer: z.string().max(100).optional(),
    line_order: z.number().default(0),
  })).default([]),
  
  // Terms and conditions
  terms_and_conditions: z.string().optional(),
  notes: z.string().optional(),
});

const InvoiceQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  status: z.enum(['draft', 'pending', 'sent', 'overdue', 'paid', 'cancelled', 'refunded']).optional(),
  customer_id: z.string().uuid().optional(),
  work_order_id: z.string().uuid().optional(),
  invoice_date_from: z.string().date().optional(),
  invoice_date_to: z.string().date().optional(),
  due_date_from: z.string().date().optional(),
  due_date_to: z.string().date().optional(),
  amount_min: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  amount_max: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  payment_status: z.enum(['unpaid', 'partial', 'paid', 'overdue']).optional(),
  sort: z.enum(['created_at', 'invoice_number', 'total_amount', 'due_date', 'status']).default('created_at'),
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

// Helper function to generate invoice number
async function generateInvoiceNumber(organizationId: string): Promise<string> {
  const { data: invoices } = await supabase
    .from('hs.invoices')
    .select('invoice_number')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(1);

  const currentYear = new Date().getFullYear();
  let nextNumber = 1;

  if (invoices && invoices.length > 0) {
    const lastNumber = invoices[0].invoice_number;
    const match = lastNumber.match(/INV-(\d{4})-(\d+)/);
    if (match && parseInt(match[1]) === currentYear) {
      nextNumber = parseInt(match[2]) + 1;
    }
  }

  return 'INV-${currentYear}-${nextNumber.toString().padStart(6, '0')}';
}

// Helper function to calculate totals
function calculateInvoiceTotals(items: unknown[], taxRate: number = 0, discountAmount: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
  const totalAmount = subtotal + taxAmount - discountAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(taxAmount * 100) / 100,
    total_amount: Math.round(totalAmount * 100) / 100,
  };
}

// GET /api/v1/hs/invoices - List invoices with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = InvoiceQuerySchema.parse(Object.fromEntries(searchParams));
    
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

    // Build the query
    let supabaseQuery = supabase
      .from('hs.invoices')
      .select('
        id,
        invoice_number,
        customer_id,
        work_order_id,
        estimate_id,
        billing_address_line_1,
        billing_address_line_2,
        billing_city,
        billing_state_province,
        billing_postal_code,
        title,
        description,
        invoice_date,
        due_date,
        service_date,
        subtotal,
        tax_rate,
        tax_amount,
        discount_amount,
        total_amount,
        payment_terms,
        late_fee_percentage,
        terms_and_conditions,
        notes,
        status,
        payment_status,
        amount_paid,
        payment_received_date,
        sent_to_customer_at,
        created_at,
        updated_at,
        customers:customer_id(
          first_name,
          last_name,
          company_name,
          email,
          phone
        ),
        work_orders:work_order_id(
          work_order_number,
          problem_description,
          status
        )
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }
    
    if (query.customer_id) {
      supabaseQuery = supabaseQuery.eq('customer_id', query.customer_id);
    }
    
    if (query.work_order_id) {
      supabaseQuery = supabaseQuery.eq('work_order_id', query.work_order_id);
    }
    
    if (query.payment_status) {
      supabaseQuery = supabaseQuery.eq('payment_status', query.payment_status);
    }
    
    if (query.invoice_date_from) {
      supabaseQuery = supabaseQuery.gte('invoice_date', query.invoice_date_from);
    }
    
    if (query.invoice_date_to) {
      supabaseQuery = supabaseQuery.lte('invoice_date', query.invoice_date_to);
    }
    
    if (query.due_date_from) {
      supabaseQuery = supabaseQuery.gte('due_date', query.due_date_from);
    }
    
    if (query.due_date_to) {
      supabaseQuery = supabaseQuery.lte('due_date', query.due_date_to);
    }
    
    if (query.amount_min !== undefined) {
      supabaseQuery = supabaseQuery.gte('total_amount', query.amount_min);
    }
    
    if (query.amount_max !== undefined) {
      supabaseQuery = supabaseQuery.lte('total_amount', query.amount_max);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'invoice_number.ilike.%${query.search}%,title.ilike.%${query.search}%,description.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: invoices, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      invoices: invoices || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/invoices error:', error);
    
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

// POST /api/v1/hs/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const invoiceData = InvoiceSchema.parse(body);

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

    // Validate customer exists
    const { data: customer } = await supabase
      .from('hs.customers')
      .select('id, billing_address_line_1, billing_city, billing_state_province')
      .eq('id', invoiceData.customer_id)
      .eq('organization_id', organizationId)
      .single();
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 400 }
      );
    }

    // Validate work order exists if provided
    if (invoiceData.work_order_id) {
      const { data: workOrder } = await supabase
        .from('hs.work_orders')
        .select('id')
        .eq('id', invoiceData.work_order_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!workOrder) {
        return NextResponse.json(
          { error: 'Work order not found' },
          { status: 400 }
        );
      }
    }

    // Validate estimate exists if provided
    if (invoiceData.estimate_id) {
      const { data: estimate } = await supabase
        .from('hs.estimates')
        .select('id')
        .eq('id', invoiceData.estimate_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!estimate) {
        return NextResponse.json(
          { error: 'Estimate not found' },
          { status: 400 }
        );
      }
    }

    // Calculate totals from items
    const calculatedTotals = calculateInvoiceTotals(
      invoiceData.items, 
      invoiceData.tax_rate, 
      invoiceData.discount_amount
    );

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(organizationId);

    // Use customer billing address if not provided
    const billingAddress = {
      billing_address_line_1: invoiceData.billing_address_line_1 || customer.billing_address_line_1,
      billing_address_line_2: invoiceData.billing_address_line_2,
      billing_city: invoiceData.billing_city || customer.billing_city,
      billing_state_province: invoiceData.billing_state_province || customer.billing_state_province,
      billing_postal_code: invoiceData.billing_postal_code,
    };

    // Prepare invoice data (without items)
    const { items, ...invoiceDataWithoutItems } = invoiceData;

    // Create invoice
    const { data: invoice, error } = await supabase
      .from('hs.invoices')
      .insert({
        ...invoiceDataWithoutItems,
        ...calculatedTotals,
        ...billingAddress,
        invoice_number: invoiceNumber,
        organization_id: organizationId,
        status: 'draft',
        payment_status: 'unpaid',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    // Create invoice items if provided
    if (items && items.length > 0) {
      const invoiceItems = items.map((item, index) => ({
        ...item,
        invoice_id: invoice.id,
        line_order: item.line_order || index + 1,
      }));

      const { error: itemsError } = await supabase
        .from('hs.invoice_items')
        .insert(invoiceItems);

      if (itemsError) {
        console.error('Database error creating items:', itemsError);
        // Don't fail the invoice creation, just log the error
      }
    }

    // Fetch complete invoice with items
    const { data: completeInvoice } = await supabase
      .from('hs.invoices')
      .select('
        *,
        invoice_items(*),
        customers:customer_id(
          first_name,
          last_name,
          company_name,
          email,
          phone
        )
      ')
      .eq('id', invoice.id)
      .single();

    return NextResponse.json(
      { invoice: completeInvoice || invoice },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/invoices error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid invoice data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}