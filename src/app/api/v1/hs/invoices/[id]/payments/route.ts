import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Payment validation schema
const PaymentSchema = z.object({
  amount: z.number().min(0.01),
  payment_method: z.enum(['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'ach', 'online', 'other']),
  payment_reference: z.string().max(100).optional(),
  payment_date: z.string().date().default(() => new Date().toISOString().split('T')[0]),
  transaction_id: z.string().max(100).optional(),
  payment_processor: z.string().max(50).optional(),
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

// Helper function to verify invoice access and get invoice details
async function getInvoiceDetails(invoiceId: string, organizationId: string) {
  const { data: invoice } = await supabase
    .from('hs.invoices')
    .select('id, total_amount, amount_paid, status, payment_status')
    .eq('id', invoiceId)
    .eq('organization_id', organizationId)
    .single();
  
  return invoice;
}

// POST /api/v1/hs/invoices/[id]/payments - Record payment for invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const body = await request.json();
    const paymentData = PaymentSchema.parse(body);

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

    // Get invoice details
    const invoice = await getInvoiceDetails(invoiceId, organizationId);
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 }
      );
    }

    // Check if invoice can accept payments
    if (['cancelled', 'refunded'].includes(invoice.status)) {
      return NextResponse.json(
        { error: 'Cannot record payment for cancelled or refunded invoice' },
        { status: 409 }
      );
    }

    // Calculate remaining balance
    const currentAmountPaid = invoice.amount_paid || 0;
    const remainingBalance = invoice.total_amount - currentAmountPaid;

    if (paymentData.amount > remainingBalance) {
      return NextResponse.json(
        { error: 'Payment amount exceeds remaining balance of $${remainingBalance.toFixed(2)}' },
        { status: 400 }
      );
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('hs.invoice_payments')
      .insert({
        invoice_id: invoiceId,
        ...paymentData,
        recorded_by: user.id,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Database error creating payment:', paymentError);
      return NextResponse.json(
        { error: 'Failed to record payment' },
        { status: 500 }
      );
    }

    // Calculate new total paid amount
    const newAmountPaid = currentAmountPaid + paymentData.amount;
    const isFullyPaid = newAmountPaid >= invoice.total_amount;
    const isPartiallyPaid = newAmountPaid > 0 && newAmountPaid < invoice.total_amount;

    // Update invoice payment status
    let paymentStatus = 'unpaid';
    if (isFullyPaid) {
      paymentStatus = 'paid';
    } else if (isPartiallyPaid) {
      paymentStatus = 'partial';
    }

    const invoiceUpdateData: unknown = {
      amount_paid: newAmountPaid,
      payment_status: paymentStatus,
    };

    // If fully paid, update status and payment received date
    if (isFullyPaid) {
      invoiceUpdateData.status = 'paid';
      invoiceUpdateData.payment_received_date = new Date().toISOString();
    }

    const { data: updatedInvoice, error: updateError } = await supabase
      .from('hs.invoices')
      .update(invoiceUpdateData)
      .eq('id', invoiceId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (updateError) {
      console.error('Database error updating invoice:', updateError);
      // Don't fail the payment creation, just log the error
    }

    return NextResponse.json({
      payment,
      invoice_update: {
        previous_amount_paid: currentAmountPaid,
        new_amount_paid: newAmountPaid,
        remaining_balance: invoice.total_amount - newAmountPaid,
        payment_status: paymentStatus,
        is_fully_paid: isFullyPaid,
      },
      message: isFullyPaid ? 'Payment recorded and invoice marked as paid' : 'Payment recorded successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/hs/invoices/[id]/payments error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payment data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/v1/hs/invoices/[id]/payments - List payments for invoice
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
    const invoice = await getInvoiceDetails(invoiceId, organizationId);
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 }
      );
    }

    // Get payments for this invoice
    const { data: payments, error } = await supabase
      .from('hs.invoice_payments')
      .select('
        id,
        amount,
        payment_method,
        payment_reference,
        payment_date,
        transaction_id,
        payment_processor,
        notes,
        created_at,
        recorded_by_user:recorded_by(
          first_name,
          last_name
        )
      ')
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      );
    }

    // Calculate payment summary
    const totalPaid = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const remainingBalance = invoice.total_amount - totalPaid;

    return NextResponse.json({
      payments: payments || [],
      summary: {
        invoice_total: invoice.total_amount,
        total_paid: totalPaid,
        remaining_balance: remainingBalance,
        payment_count: payments?.length || 0,
        is_fully_paid: remainingBalance <= 0,
        payment_status: invoice.payment_status,
      }
    });

  } catch (error) {
    console.error('GET /api/v1/hs/invoices/[id]/payments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}