import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inventory item validation schema
const InventoryItemSchema = z.object({
  // Basic item information
  product_code: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  subcategory: z.string().max(100).optional(),
  
  // Item classification
  item_type: z.enum(['material', 'tool', 'equipment', 'consumable', 'part']),
  unit_of_measure: z.string().max(20).default('each'),
  
  // Supplier and purchasing
  primary_supplier_id: z.string().uuid().optional(),
  supplier_part_number: z.string().max(100).optional(),
  manufacturer: z.string().max(100).optional(),
  model_number: z.string().max(100).optional(),
  
  // Stock management
  quantity_on_hand: z.number().min(0).default(0),
  quantity_allocated: z.number().min(0).default(0),
  quantity_on_order: z.number().min(0).default(0),
  minimum_stock_level: z.number().min(0).default(0),
  maximum_stock_level: z.number().min(0).optional(),
  reorder_point: z.number().min(0).default(0),
  economic_order_quantity: z.number().min(1).optional(),
  
  // Pricing
  unit_cost: z.number().min(0).default(0),
  average_cost: z.number().min(0).default(0),
  last_purchase_cost: z.number().min(0).optional(),
  standard_sell_price: z.number().min(0).optional(),
  
  // Location and tracking
  primary_location: z.string().max(100).optional(),
  bin_location: z.string().max(50).optional(),
  barcode: z.string().max(100).optional(),
  serial_tracking: z.boolean().default(false),
  lot_tracking: z.boolean().default(false),
  
  // Status and settings
  status: z.enum(['active', 'inactive', 'discontinued', 'special_order']).default('active'),
  is_taxable: z.boolean().default(true),
  is_serialized: z.boolean().default(false),
  requires_license: z.boolean().default(false),
  hazardous_material: z.boolean().default(false),
  
  // Physical properties
  weight: z.number().min(0).optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
    unit: z.enum(['inches', 'feet', 'cm', 'meters']).default('inches'),
  }).optional(),
  
  // Notes and documentation
  notes: z.string().optional(),
  installation_notes: z.string().optional(),
  warranty_period: z.number().min(0).optional(), // days
});

const InventoryQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  item_type: z.enum(['material', 'tool', 'equipment', 'consumable', 'part']).optional(),
  status: z.enum(['active', 'inactive', 'discontinued', 'special_order']).optional(),
  supplier_id: z.string().uuid().optional(),
  location: z.string().optional(),
  low_stock: z.boolean().optional(), // Items below reorder point
  out_of_stock: z.boolean().optional(), // Items with 0 quantity
  overstocked: z.boolean().optional(), // Items above maximum stock level
  requires_reorder: z.boolean().optional(), // Items below reorder point with no pending orders
  cost_min: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  cost_max: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  sort: z.enum(['name', 'product_code', 'quantity_on_hand', 'unit_cost', 'last_activity', 'created_at']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
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

// Helper function to update average cost
async function updateAverageCost(itemId: string, newQuantity: number, newCost: number) {
  const { data: item } = await supabase
    .from('hs.inventory')
    .select('quantity_on_hand, average_cost')
    .eq('id', itemId)
    .single();

  if (!item) return;

  const currentQuantity = item.quantity_on_hand;
  const currentAverageCost = item.average_cost || 0;
  
  // Calculate weighted average cost
  const totalCurrentValue = currentQuantity * currentAverageCost;
  const newValue = newQuantity * newCost;
  const totalQuantity = currentQuantity + newQuantity;
  
  const newAverageCost = totalQuantity > 0 ? (totalCurrentValue + newValue) / totalQuantity : 0;

  await supabase
    .from('hs.inventory')
    .update({ average_cost: Math.round(newAverageCost * 100) / 100 })
    .eq('id', itemId);
}

// GET /api/v1/hs/inventory - List inventory items with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = InventoryQuerySchema.parse(Object.fromEntries(searchParams));
    
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
      .from('hs.inventory')
      .select('
        id,
        product_code,
        name,
        description,
        category,
        subcategory,
        item_type,
        unit_of_measure,
        primary_supplier_id,
        supplier_part_number,
        manufacturer,
        model_number,
        quantity_on_hand,
        quantity_allocated,
        quantity_on_order,
        minimum_stock_level,
        maximum_stock_level,
        reorder_point,
        economic_order_quantity,
        unit_cost,
        average_cost,
        last_purchase_cost,
        standard_sell_price,
        primary_location,
        bin_location,
        barcode,
        serial_tracking,
        lot_tracking,
        status,
        is_taxable,
        is_serialized,
        requires_license,
        hazardous_material,
        weight,
        dimensions,
        warranty_period,
        last_activity_at,
        created_at,
        updated_at,
        suppliers:primary_supplier_id(
          company_name,
          contact_name,
          phone,
          email
        )
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.category) {
      supabaseQuery = supabaseQuery.eq('category', query.category);
    }
    
    if (query.subcategory) {
      supabaseQuery = supabaseQuery.eq('subcategory', query.subcategory);
    }
    
    if (query.item_type) {
      supabaseQuery = supabaseQuery.eq('item_type', query.item_type);
    }
    
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }
    
    if (query.supplier_id) {
      supabaseQuery = supabaseQuery.eq('primary_supplier_id', query.supplier_id);
    }
    
    if (query.location) {
      supabaseQuery = supabaseQuery.ilike('primary_location', '%${query.location}%');
    }
    
    if (query.cost_min !== undefined) {
      supabaseQuery = supabaseQuery.gte('unit_cost', query.cost_min);
    }
    
    if (query.cost_max !== undefined) {
      supabaseQuery = supabaseQuery.lte('unit_cost', query.cost_max);
    }

    // Stock level filters
    if (query.low_stock) {
      supabaseQuery = supabaseQuery.filter('quantity_on_hand', 'lte', 'reorder_point');
    }
    
    if (query.out_of_stock) {
      supabaseQuery = supabaseQuery.eq('quantity_on_hand', 0);
    }
    
    if (query.overstocked) {
      supabaseQuery = supabaseQuery.filter('quantity_on_hand', 'gt', 'maximum_stock_level');
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'product_code.ilike.%${query.search}%,name.ilike.%${query.search}%,description.ilike.%${query.search}%,manufacturer.ilike.%${query.search}%,model_number.ilike.%${query.search}%,barcode.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: inventory, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inventory' },
        { status: 500 }
      );
    }

    // Calculate additional metrics for each item
    const enrichedInventory = inventory?.map(item => ({
      ...item,
      available_quantity: item.quantity_on_hand - item.quantity_allocated,
      total_value: item.quantity_on_hand * item.average_cost,
      needs_reorder: item.quantity_on_hand <= item.reorder_point,
      is_low_stock: item.quantity_on_hand <= item.minimum_stock_level,
      is_out_of_stock: item.quantity_on_hand === 0,
      is_overstocked: item.maximum_stock_level && item.quantity_on_hand > item.maximum_stock_level,
    }));

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      inventory: enrichedInventory || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/inventory error:', error);
    
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

// POST /api/v1/hs/inventory - Create new inventory item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inventoryData = InventoryItemSchema.parse(body);

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

    // Check for duplicate product code
    const { data: existingItem } = await supabase
      .from('hs.inventory')
      .select('id')
      .eq('product_code', inventoryData.product_code)
      .eq('organization_id', organizationId)
      .single();
    
    if (existingItem) {
      return NextResponse.json(
        { error: 'Product code already exists' },
        { status: 409 }
      );
    }

    // Validate supplier if provided
    if (inventoryData.primary_supplier_id) {
      const { data: supplier } = await supabase
        .from('hs.suppliers')
        .select('id')
        .eq('id', inventoryData.primary_supplier_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!supplier) {
        return NextResponse.json(
          { error: 'Supplier not found' },
          { status: 400 }
        );
      }
    }

    // Set initial average cost equal to unit cost
    const initialData = {
      ...inventoryData,
      average_cost: inventoryData.unit_cost,
      organization_id: organizationId,
      created_by: user.id,
      last_activity_at: new Date().toISOString(),
    };

    // Create inventory item
    const { data: inventoryItem, error } = await supabase
      .from('hs.inventory')
      .insert(initialData)
      .select('
        *,
        suppliers:primary_supplier_id(
          company_name,
          contact_name,
          phone,
          email
        )
      ')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create inventory item' },
        { status: 500 }
      );
    }

    // Record initial stock transaction if quantity > 0
    if (inventoryData.quantity_on_hand > 0) {
      await supabase
        .from('hs.inventory_transactions')
        .insert({
          inventory_item_id: inventoryItem.id,
          transaction_type: 'adjustment',
          quantity_change: inventoryData.quantity_on_hand,
          quantity_after: inventoryData.quantity_on_hand,
          unit_cost: inventoryData.unit_cost,
          total_cost: inventoryData.quantity_on_hand * inventoryData.unit_cost,
          reference_type: 'initial_stock',
          notes: 'Initial stock entry',
          created_by: user.id,
        });
    }

    return NextResponse.json(
      { inventory_item: inventoryItem },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/inventory error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid inventory data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}