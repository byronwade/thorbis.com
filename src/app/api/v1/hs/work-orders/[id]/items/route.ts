import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Work Order Item validation schema
const WorkOrderItemSchema = z.object({
  item_type: z.enum(['labor', 'material', 'equipment', 'fee', 'discount']),
  description: z.string().min(1),
  quantity: z.number().min(0.01),
  unit: z.string().max(20).default('each'),
  
  // Pricing
  unit_price: z.number().min(0),
  total_price: z.number().min(0),
  markup_percentage: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  
  // Labor specific
  labor_hours: z.number().min(0).optional(),
  hourly_rate: z.number().min(0).optional(),
  technician_id: z.string().uuid().optional(),
  
  // Material/Equipment specific
  product_code: z.string().max(100).optional(),
  manufacturer: z.string().max(100).optional(),
  model_number: z.string().max(100).optional(),
  warranty_period: z.number().min(0).optional(),
  
  // Status
  status: z.enum(['pending', 'completed', 'cancelled']).default('pending'),
});

const WorkOrderItemUpdateSchema = WorkOrderItemSchema.partial();

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

// Helper function to verify work order access
async function verifyWorkOrderAccess(workOrderId: string, organizationId: string) {
  const { data: workOrder } = await supabase
    .from('hs.work_orders')
    .select('id')
    .eq('id', workOrderId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!workOrder;
}

// GET /api/v1/hs/work-orders/[id]/items - Get work order items
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workOrderId = params.id;

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

    // Verify work order access
    if (!(await verifyWorkOrderAccess(workOrderId, organizationId))) {
      return NextResponse.json(
        { error: 'Work order not found or access denied' },
        { status: 404 }
      );
    }

    // Get work order items
    const { data: items, error } = await supabase
      .from('hs.work_order_items')
      .select('
        id,
        work_order_id,
        item_type,
        description,
        quantity,
        unit,
        unit_price,
        total_price,
        markup_percentage,
        discount_amount,
        labor_hours,
        hourly_rate,
        technician_id,
        product_code,
        manufacturer,
        model_number,
        warranty_period,
        status,
        completed_at,
        created_at,
        updated_at,
        technicians:technician_id(
          first_name,
          last_name
        )
      ')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch work order items' },
        { status: 500 }
      );
    }

    // Calculate totals
    const totals = {
      subtotal: 0,
      total_labor: 0,
      total_materials: 0,
      total_fees: 0,
      total_discounts: 0,
    };

    items?.forEach(item => {
      const itemTotal = item.total_price || 0;
      totals.subtotal += itemTotal;
      
      switch (item.item_type) {
        case 'labor':
          totals.total_labor += itemTotal;
          break;
        case 'material':
        case 'equipment':
          totals.total_materials += itemTotal;
          break;
        case 'fee':
          totals.total_fees += itemTotal;
          break;
        case 'discount':
          totals.total_discounts += itemTotal;
          break;
      }
    });

    return NextResponse.json({
      items: items || [],
      totals,
    });

  } catch (error) {
    console.error('GET /api/v1/hs/work-orders/[id]/items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/hs/work-orders/[id]/items - Add work order item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workOrderId = params.id;
    const body = await request.json();
    const itemData = WorkOrderItemSchema.parse(body);

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

    // Verify work order access
    if (!(await verifyWorkOrderAccess(workOrderId, organizationId))) {
      return NextResponse.json(
        { error: 'Work order not found or access denied' },
        { status: 404 }
      );
    }

    // Validate technician if provided
    if (itemData.technician_id) {
      const { data: technician } = await supabase
        .from('hs.technicians')
        .select('id')
        .eq('id', itemData.technician_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!technician) {
        return NextResponse.json(
          { error: 'Technician not found' },
          { status: 400 }
        );
      }
    }

    // Create work order item
    const { data: item, error } = await supabase
      .from('hs.work_order_items')
      .insert({
        ...itemData,
        work_order_id: workOrderId,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create work order item' },
        { status: 500 }
      );
    }

    // Update work order total (optional - could be done with triggers)
    const { data: allItems } = await supabase
      .from('hs.work_order_items')
      .select('total_price')
      .eq('work_order_id', workOrderId);

    const totalAmount = allItems?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;

    await supabase
      .from('hs.work_orders')
      .update({ estimate_total: totalAmount })
      .eq('id', workOrderId);

    return NextResponse.json(
      { item },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/work-orders/[id]/items error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid item data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/work-orders/[id]/items - Bulk update work order items
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workOrderId = params.id;
    const body = await request.json();
    
    const BulkItemsSchema = z.object({
      items: z.array(WorkOrderItemSchema.extend({
        id: z.string().uuid().optional(), // Include ID for updates
      })),
    });

    const { items } = BulkItemsSchema.parse(body);

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

    // Verify work order access
    if (!(await verifyWorkOrderAccess(workOrderId, organizationId))) {
      return NextResponse.json(
        { error: 'Work order not found or access denied' },
        { status: 404 }
      );
    }

    const results = [];

    // Process each item (create or update)
    for (const itemData of items) {
      const { id, ...data } = itemData;
      
      if (id) {
        // Update existing item
        const { data: updatedItem, error } = await supabase
          .from('hs.work_order_items')
          .update(data)
          .eq('id', id)
          .eq('work_order_id', workOrderId)
          .select()
          .single();

        if (error) {
          console.error('Update item error:', error);
          continue;
        }
        
        results.push(updatedItem);
      } else {
        // Create new item
        const { data: newItem, error } = await supabase
          .from('hs.work_order_items')
          .insert({
            ...data,
            work_order_id: workOrderId,
          })
          .select()
          .single();

        if (error) {
          console.error('Create item error:', error);
          continue;
        }

        results.push(newItem);
      }
    }

    // Update work order total
    const totalAmount = results.reduce((sum, item) => sum + (item.total_price || 0), 0);
    
    await supabase
      .from('hs.work_orders')
      .update({ estimate_total: totalAmount })
      .eq('id', workOrderId);

    return NextResponse.json({
      items: results,
      message: '${results.length} items processed successfully',
    });

  } catch (error) {
    console.error('PUT /api/v1/hs/work-orders/[id]/items error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid items data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}