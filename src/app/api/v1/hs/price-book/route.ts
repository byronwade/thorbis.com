import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Price Book Item validation schema
const PriceBookItemSchema = z.object({
  // Item identification
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  subcategory: z.string().max(100).optional(),
  
  // Item type and classification
  item_type: z.enum(['labor', 'material', 'equipment', 'service', 'fee']),
  service_category: z.enum(['plumbing', 'hvac', 'electrical', 'general', 'emergency', 'maintenance']).optional(),
  
  // Pricing
  base_price: z.number().min(0),
  markup_percentage: z.number().min(0).default(0),
  sell_price: z.number().min(0),
  
  // Labor specific
  labor_rate: z.number().min(0).optional(),
  estimated_hours: z.number().min(0).optional(),
  skill_level_required: z.number().min(1).max(5).optional(),
  
  // Unit and measurement
  unit_of_measure: z.string().max(20).default('each'),
  minimum_quantity: z.number().min(0).default(1),
  
  // Status and availability
  is_active: z.boolean().default(true),
  is_taxable: z.boolean().default(true),
  requires_license: z.boolean().default(false),
  
  // Material/Equipment specific
  manufacturer: z.string().max(100).optional(),
  model_number: z.string().max(100).optional(),
  warranty_period: z.number().min(0).optional(), // days
  
  // Inventory integration
  track_inventory: z.boolean().default(false),
  inventory_item_id: z.string().uuid().optional(),
  
  // Pricing tiers (optional)
  tier_pricing: z.array(z.object({
    min_quantity: z.number().min(1),
    price: z.number().min(0),
    discount_percentage: z.number().min(0).max(100).optional(),
  })).optional(),
  
  // Notes and specifications
  specifications: z.string().optional(),
  internal_notes: z.string().optional(),
});

const PriceBookQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('50'),
  search: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  item_type: z.enum(['labor', 'material', 'equipment', 'service', 'fee']).optional(),
  service_category: z.enum(['plumbing', 'hvac', 'electrical', 'general', 'emergency', 'maintenance']).optional(),
  is_active: z.string().transform(val => val === 'true').optional(),
  price_min: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  price_max: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  sort: z.enum(['created_at', 'name', 'code', 'sell_price', 'category']).default('name'),
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

// GET /api/v1/hs/price-book - List price book items with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = PriceBookQuerySchema.parse(Object.fromEntries(searchParams));
    
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
      .from('hs.price_book')
      .select('
        id,
        code,
        name,
        description,
        category,
        subcategory,
        item_type,
        service_category,
        base_price,
        markup_percentage,
        sell_price,
        labor_rate,
        estimated_hours,
        skill_level_required,
        unit_of_measure,
        minimum_quantity,
        is_active,
        is_taxable,
        requires_license,
        manufacturer,
        model_number,
        warranty_period,
        track_inventory,
        inventory_item_id,
        tier_pricing,
        specifications,
        created_at,
        updated_at,
        inventory:inventory_item_id(
          product_code,
          quantity_on_hand,
          status
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
    
    if (query.service_category) {
      supabaseQuery = supabaseQuery.eq('service_category', query.service_category);
    }
    
    if (query.is_active !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_active', query.is_active);
    }
    
    if (query.price_min !== undefined) {
      supabaseQuery = supabaseQuery.gte('sell_price', query.price_min);
    }
    
    if (query.price_max !== undefined) {
      supabaseQuery = supabaseQuery.lte('sell_price', query.price_max);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'code.ilike.%${query.search}%,name.ilike.%${query.search}%,description.ilike.%${query.search}%,category.ilike.%${query.search}%,manufacturer.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: items, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch price book items' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      items: items || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/price-book error:', error);
    
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

// POST /api/v1/hs/price-book - Create new price book item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const itemData = PriceBookItemSchema.parse(body);

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

    // Check for duplicate code
    const { data: existingItem } = await supabase
      .from('hs.price_book')
      .select('id')
      .eq('code', itemData.code)
      .eq('organization_id', organizationId)
      .single();
    
    if (existingItem) {
      return NextResponse.json(
        { error: 'Price book item with this code already exists' },
        { status: 409 }
      );
    }

    // Validate inventory item if provided
    if (itemData.inventory_item_id) {
      const { data: inventoryItem } = await supabase
        .from('hs.inventory')
        .select('id')
        .eq('id', itemData.inventory_item_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!inventoryItem) {
        return NextResponse.json(
          { error: 'Inventory item not found' },
          { status: 400 }
        );
      }
    }

    // Create price book item
    const { data: item, error } = await supabase
      .from('hs.price_book')
      .insert({
        ...itemData,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create price book item' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { item },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/price-book error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid price book item data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}