import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Customer validation schema for updates
const CustomerUpdateSchema = z.object({
  customer_type: z.enum(['residential', 'commercial', 'property_management']).optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  company_name: z.string().max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  secondary_phone: z.string().max(20).optional(),
  
  // Address information
  address_line_1: z.string().max(255).optional(),
  address_line_2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state_province: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  
  // Service address (if different)
  service_address_line_1: z.string().max(255).optional(),
  service_address_line_2: z.string().max(255).optional(),
  service_city: z.string().max(100).optional(),
  service_state_province: z.string().max(100).optional(),
  service_postal_code: z.string().max(20).optional(),
  
  // Preferences
  preferred_contact_method: z.enum(['phone', 'email', 'sms', 'app']).optional(),
  preferred_appointment_time: z.string().max(50).optional(),
  special_instructions: z.string().optional(),
  access_instructions: z.string().optional(),
  
  // Status
  customer_status: z.enum(['active', 'inactive', 'blocked']).optional(),
  customer_rating: z.number().min(1).max(5).optional(),
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

// Helper function to verify customer access
async function verifyCustomerAccess(customerId: string, organizationId: string) {
  const { data: customer } = await supabase
    .from('hs.customers')
    .select('id')
    .eq('id', customerId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!customer;
}

// GET /api/v1/hs/customers/[id] - Get specific customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

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
    if (!(await verifyCustomerAccess(customerId, organizationId))) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    // Get customer with work order summary
    const { data: customer, error } = await supabase
      .from('hs.customers')
      .select('
        *,
        work_orders_summary:work_orders(
          id,
          work_order_number,
          status,
          scheduled_date,
          total:estimate_total
        )
      ')
      .eq('id', customerId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer });

  } catch (error) {
    console.error('GET /api/v1/hs/customers/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const body = await request.json();
    const updateData = CustomerUpdateSchema.parse(body);

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
    if (!(await verifyCustomerAccess(customerId, organizationId))) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    // Update customer
    const { data: customer, error } = await supabase
      .from('hs.customers')
      .update(updateData)
      .eq('id', customerId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer });

  } catch (error) {
    console.error('PUT /api/v1/hs/customers/[id] error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid customer data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/hs/customers/[id] - Soft delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

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
    if (!(await verifyCustomerAccess(customerId, organizationId))) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    // Check if customer has active work orders
    const { data: activeWorkOrders } = await supabase
      .from('hs.work_orders')
      .select('id')
      .eq('customer_id', customerId)
      .in('status', ['new', 'scheduled', 'dispatched', 'in_progress'])
      .limit(1);

    if (activeWorkOrders && activeWorkOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with active work orders' },
        { status: 409 }
      );
    }

    // Soft delete by setting status to inactive
    const { data: customer, error } = await supabase
      .from('hs.customers')
      .update({ customer_status: 'inactive' })
      .eq('id', customerId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Customer deactivated successfully',
      customer 
    });

  } catch (error) {
    console.error('DELETE /api/v1/hs/customers/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}