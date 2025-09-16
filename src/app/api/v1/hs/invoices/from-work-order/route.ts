import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Schema for creating invoice from work order
const WorkOrderToInvoiceSchema = z.object({
  work_order_id: z.string().uuid(),
  
  // Override invoice details if needed
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  
  // Override dates
  invoice_date: z.string().date().default(() => new Date().toISOString().split('T')[0]),
  due_date: z.string().date().optional(), // Will default to 30 days from invoice date
  service_date: z.string().date().optional(),
  
  // Override billing address if different from customer
  billing_address_line_1: z.string().min(1).max(255).optional(),
  billing_address_line_2: z.string().max(255).optional(),
  billing_city: z.string().min(1).max(100).optional(),
  billing_state_province: z.string().min(1).max(100).optional(),
  billing_postal_code: z.string().min(1).max(20).optional(),
  
  // Pricing overrides
  tax_rate: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  
  // Payment terms
  payment_terms: z.string().max(100).optional(),
  late_fee_percentage: z.number().min(0).max(100).default(0),
  
  // Terms and conditions
  terms_and_conditions: z.string().optional(),
  notes: z.string().optional(),
  
  // Item filtering - specify which work order items to include
  include_items: z.array(z.string().uuid()).optional(), // If not provided, include all completed items
  exclude_items: z.array(z.string().uuid()).optional(),
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

// POST /api/v1/hs/invoices/from-work-order - Create invoice from completed work order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const invoiceData = WorkOrderToInvoiceSchema.parse(body);

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

    // Get work order with all details
    const { data: workOrder, error: workOrderError } = await supabase
      .from('hs.work_orders')
      .select('
        *,
        work_order_items(*),
        customers:customer_id(
          id,
          first_name,
          last_name,
          company_name,
          email,
          phone,
          billing_address_line_1,
          billing_address_line_2,
          billing_city,
          billing_state_province,
          billing_postal_code
        )
      ')
      .eq('id', invoiceData.work_order_id)
      .eq('organization_id', organizationId)
      .single();

    if (workOrderError || !workOrder) {
      return NextResponse.json(
        { error: 'Work order not found or access denied' },
        { status: 404 }
      );
    }

    // Check if work order can be invoiced
    if (!['completed', 'approved'].includes(workOrder.status)) {
      return NextResponse.json(
        { error: 'Work order must be completed or approved to create invoice' },
        { status: 409 }
      );
    }

    // Check if work order is already invoiced
    const { data: existingInvoice } = await supabase
      .from('hs.invoices')
      .select('id, invoice_number')
      .eq('work_order_id', workOrder.id)
      .single();

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Work order already invoiced (Invoice: ${existingInvoice.invoice_number})' },
        { status: 409 }
      );
    }

    // Filter work order items
    let itemsToInclude = workOrder.work_order_items || [];
    
    if (invoiceData.include_items && invoiceData.include_items.length > 0) {
      itemsToInclude = itemsToInclude.filter(item => 
        invoiceData.include_items!.includes(item.id)
      );
    }

    if (invoiceData.exclude_items && invoiceData.exclude_items.length > 0) {
      itemsToInclude = itemsToInclude.filter(item => 
        !invoiceData.exclude_items!.includes(item.id)
      );
    }

    // Only include completed items by default
    itemsToInclude = itemsToInclude.filter(item => 
      item.status === 'completed' || item.status === 'approved'
    );

    if (itemsToInclude.length === 0) {
      return NextResponse.json(
        { error: 'No billable items found in work order' },
        { status: 400 }
      );
    }

    // Use provided tax rate or work order's rate
    const taxRate = invoiceData.tax_rate ?? workOrder.tax_rate ?? 0;
    const discountAmount = invoiceData.discount_amount ?? 0;

    // Calculate totals from filtered items
    const calculatedTotals = calculateInvoiceTotals(itemsToInclude, taxRate, discountAmount);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(organizationId);

    // Set due date to 30 days from invoice date if not provided
    const dueDate = invoiceData.due_date || 
      new Date(new Date(invoiceData.invoice_date).getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

    // Use customer billing address if not overridden
    const customer = workOrder.customers;
    const billingAddress = {
      billing_address_line_1: invoiceData.billing_address_line_1 || customer.billing_address_line_1 || workOrder.service_address_line_1,
      billing_address_line_2: invoiceData.billing_address_line_2 || customer.billing_address_line_2 || workOrder.service_address_line_2,
      billing_city: invoiceData.billing_city || customer.billing_city || workOrder.service_city,
      billing_state_province: invoiceData.billing_state_province || customer.billing_state_province || workOrder.service_state_province,
      billing_postal_code: invoiceData.billing_postal_code || customer.billing_postal_code || workOrder.service_postal_code,
    };

    // Create invoice data
    const newInvoiceData = {
      invoice_number: invoiceNumber,
      organization_id: organizationId,
      customer_id: workOrder.customer_id,
      work_order_id: workOrder.id,
      
      // Billing address
      ...billingAddress,
      
      // Invoice details
      title: invoiceData.title || 'Work Order #${workOrder.work_order_number}',
      description: invoiceData.description || workOrder.work_requested || workOrder.problem_description,
      
      // Dates
      invoice_date: invoiceData.invoice_date,
      due_date: dueDate,
      service_date: invoiceData.service_date || workOrder.completed_at?.split('T')[0] || workOrder.scheduled_date,
      
      // Calculated pricing
      ...calculatedTotals,
      tax_rate: taxRate,
      discount_amount: discountAmount,
      
      // Payment terms
      payment_terms: invoiceData.payment_terms || 'Net 30',
      late_fee_percentage: invoiceData.late_fee_percentage,
      
      // Terms and conditions
      terms_and_conditions: invoiceData.terms_and_conditions,
      notes: invoiceData.notes,
      
      // Status
      status: 'draft',
      payment_status: 'unpaid',
      
      // Audit
      created_by: user.id,
    };

    // Create invoice
    const { data: invoice, error: invoiceCreateError } = await supabase
      .from('hs.invoices')
      .insert(newInvoiceData)
      .select()
      .single();

    if (invoiceCreateError) {
      console.error('Database error creating invoice:', invoiceCreateError);
      return NextResponse.json(
        { error: 'Failed to create invoice from work order' },
        { status: 500 }
      );
    }

    // Create invoice items from work order items
    const invoiceItems = itemsToInclude.map((item: unknown, index: number) => ({
      invoice_id: invoice.id,
      item_type: item.item_type,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      total_price: item.total_price,
      markup_percentage: item.markup_percentage,
      labor_hours: item.labor_hours,
      hourly_rate: item.hourly_rate,
      product_code: item.product_code,
      manufacturer: item.manufacturer,
      line_order: index + 1,
    }));

    const { error: itemsError } = await supabase
      .from('hs.invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('Database error creating invoice items:', itemsError);
      // Don't fail the invoice creation, just log the error
    }

    // Mark work order as invoiced
    await supabase
      .from('hs.work_orders')
      .update({ 
        invoiced: true,
        invoice_created_at: new Date().toISOString(),
      })
      .eq('id', workOrder.id);

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
        ),
        work_orders:work_order_id(
          work_order_number,
          problem_description,
          status
        )
      ')
      .eq('id', invoice.id)
      .single();

    return NextResponse.json({
      message: 'Invoice created successfully from work order',
      invoice: completeInvoice || invoice,
      work_order_id: workOrder.id,
      conversion_details: {
        invoice_number: invoiceNumber,
        items_included: itemsToInclude.length,
        total_amount: calculatedTotals.total_amount,
        work_order_number: workOrder.work_order_number,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/hs/invoices/from-work-order error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid work order to invoice data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}