import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Invoice update schema
const InvoiceUpdateSchema = z.object({
  customer_id: z.string().uuid().optional(),
  work_order_id: z.string().uuid().optional(),
  estimate_id: z.string().uuid().optional(),
  
  // Billing address
  billing_address_line_1: z.string().min(1).max(255).optional(),
  billing_address_line_2: z.string().max(255).optional(),
  billing_city: z.string().min(1).max(100).optional(),
  billing_state_province: z.string().min(1).max(100).optional(),
  billing_postal_code: z.string().min(1).max(20).optional(),
  
  // Invoice details
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  
  // Dates
  invoice_date: z.string().date().optional(),
  due_date: z.string().date().optional(),
  service_date: z.string().date().optional(),
  
  // Pricing
  tax_rate: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  
  // Payment terms
  payment_terms: z.string().max(100).optional(),
  late_fee_percentage: z.number().min(0).max(100).optional(),
  
  // Terms and conditions
  terms_and_conditions: z.string().optional(),
  notes: z.string().optional(),
  
  // Status updates
  status: z.enum(['draft', 'pending', 'sent', 'overdue', 'paid', 'cancelled', 'refunded']).optional(),
});

// Status update schema for workflow actions
const StatusUpdateSchema = z.object({
  status: z.enum(['draft', 'pending', 'sent', 'overdue', 'paid', 'cancelled', 'refunded']),
  action: z.enum(['submit_for_approval', 'approve', 'send_to_customer', 'mark_paid', 'cancel', 'refund']).optional(),
  notes: z.string().optional(),
  payment_amount: z.number().min(0).optional(),
  payment_method: z.string().max(50).optional(),
  payment_reference: z.string().max(100).optional(),
});

// Payment recording schema
const PaymentSchema = z.object({
  amount: z.number().min(0.01),
  payment_method: z.enum(['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'ach', 'other']),
  payment_reference: z.string().max(100).optional(),
  payment_date: z.string().date().default(() => new Date().toISOString().split('T')[0]),
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

// Helper function to verify invoice access
async function verifyInvoiceAccess(invoiceId: string, organizationId: string) {
  const { data: invoice } = await supabase
    .from('hs.invoices')
    .select('id')
    .eq('id', invoiceId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!invoice;
}

// Helper function to calculate totals from items
async function recalculateInvoiceTotals(invoiceId: string, taxRate: number = 0, discountAmount: number = 0) {
  const { data: items } = await supabase
    .from('hs.invoice_items')
    .select('total_price')
    .eq('invoice_id', invoiceId);

  const subtotal = items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
  const totalAmount = subtotal + taxAmount - discountAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(taxAmount * 100) / 100,
    total_amount: Math.round(totalAmount * 100) / 100,
  };
}

// GET /api/v1/hs/invoices/[id] - Get specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

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

    // Verify invoice access
    if (!(await verifyInvoiceAccess(invoiceId, organizationId))) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 }
      );
    }

    // Get invoice with related data
    const { data: invoice, error } = await supabase
      .from('hs.invoices')
      .select('
        *,
        invoice_items(*),
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
          billing_address_line_1,
          billing_address_line_2,
          billing_city,
          billing_state_province,
          billing_postal_code
        ),
        work_orders:work_order_id(
          id,
          work_order_number,
          problem_description,
          work_requested,
          status
        ),
        estimates:estimate_id(
          id,
          estimate_number,
          title,
          status
        ),
        payments:invoice_payments(
          id,
          amount,
          payment_method,
          payment_reference,
          payment_date,
          notes
        ),
        created_by_user:created_by(
          first_name,
          last_name
        )
      ')
      .eq('id', invoiceId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoice });

  } catch (error) {
    console.error('GET /api/v1/hs/invoices/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/invoices/[id] - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const body = await request.json();
    const updateData = InvoiceUpdateSchema.parse(body);

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

    // Verify invoice access
    if (!(await verifyInvoiceAccess(invoiceId, organizationId))) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 }
      );
    }

    // Check if invoice is in a state that allows editing
    const { data: currentInvoice } = await supabase
      .from('hs.invoices')
      .select('status, payment_status')
      .eq('id', invoiceId)
      .single();

    if (currentInvoice?.status === 'paid') {
      return NextResponse.json(
        { error: 'Cannot edit paid invoice' },
        { status: 409 }
      );
    }

    if (currentInvoice?.status === 'refunded') {
      return NextResponse.json(
        { error: 'Cannot edit refunded invoice' },
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

    // Validate estimate exists if being changed
    if (updateData.estimate_id) {
      const { data: estimate } = await supabase
        .from('hs.estimates')
        .select('id')
        .eq('id', updateData.estimate_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!estimate) {
        return NextResponse.json(
          { error: 'Estimate not found' },
          { status: 400 }
        );
      }
    }

    // Recalculate totals if tax rate or discount changed
    let calculatedTotals = {};
    if (updateData.tax_rate !== undefined || updateData.discount_amount !== undefined) {
      const currentTaxRate = updateData.tax_rate ?? 0;
      const currentDiscountAmount = updateData.discount_amount ?? 0;
      calculatedTotals = await recalculateInvoiceTotals(invoiceId, currentTaxRate, currentDiscountAmount);
    }

    // Update invoice
    const { data: invoice, error } = await supabase
      .from('hs.invoices')
      .update({
        ...updateData,
        ...calculatedTotals,
      })
      .eq('id', invoiceId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoice });

  } catch (error) {
    console.error('PUT /api/v1/hs/invoices/[id] error:', error);
    
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

// PATCH /api/v1/hs/invoices/[id]/status - Update invoice status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
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

    // Get current invoice status for validation
    const { data: currentInvoice } = await supabase
      .from('hs.invoices')
      .select('status, payment_status, total_amount')
      .eq('id', invoiceId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 }
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'draft': ['pending', 'sent', 'cancelled'],
      'pending': ['draft', 'sent', 'cancelled'],
      'sent': ['overdue', 'paid', 'cancelled'],
      'overdue': ['paid', 'cancelled'],
      'paid': ['refunded'],
      'cancelled': ['draft'], // Can be reactivated
      'refunded': [], // Final state
    };

    const currentStatus = currentInvoice.status;
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
      case 'pending':
        // No additional fields needed
        break;
      case 'sent':
        updateData.sent_to_customer_at = new Date().toISOString();
        break;
      case 'paid':
        updateData.payment_status = 'paid';
        updateData.payment_received_date = new Date().toISOString();
        if (statusData.payment_amount) {
          updateData.amount_paid = statusData.payment_amount;
        }
        break;
      case 'overdue':
        // Automatically set when due date passes (handled by scheduled job)
        break;
      case 'cancelled':
        updateData.payment_status = 'cancelled';
        break;
      case 'refunded':
        updateData.payment_status = 'refunded';
        break;
    }

    // Update invoice status
    const { data: invoice, error } = await supabase
      .from('hs.invoices')
      .update(updateData)
      .eq('id', invoiceId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update invoice status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      invoice,
      message: 'Invoice status updated to ${newStatus}' 
    });

  } catch (error) {
    console.error('PATCH /api/v1/hs/invoices/[id]/status error:', error);
    
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

// DELETE /api/v1/hs/invoices/[id] - Delete invoice (only if draft or cancelled)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

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

    // Get current invoice to check constraints
    const { data: currentInvoice } = await supabase
      .from('hs.invoices')
      .select('status, payment_status')
      .eq('id', invoiceId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 }
      );
    }

    // Check if invoice can be deleted
    if (!['draft', 'cancelled'].includes(currentInvoice.status)) {
      return NextResponse.json(
        { error: 'Can only delete draft or cancelled invoices' },
        { status: 409 }
      );
    }

    // Delete invoice (cascade will handle items and payments)
    const { error } = await supabase
      .from('hs.invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Invoice deleted successfully' 
    });

  } catch (error) {
    console.error('DELETE /api/v1/hs/invoices/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}