import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Price Book Item update schema
const PriceBookItemUpdateSchema = z.object({
  // Item identification
  code: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  subcategory: z.string().max(100).optional(),
  
  // Item type and classification
  item_type: z.enum(['labor', 'material', 'equipment', 'service', 'fee']).optional(),
  service_category: z.enum(['plumbing', 'hvac', 'electrical', 'general', 'emergency', 'maintenance']).optional(),
  
  // Pricing
  base_price: z.number().min(0).optional(),
  markup_percentage: z.number().min(0).optional(),
  sell_price: z.number().min(0).optional(),
  
  // Labor specific
  labor_rate: z.number().min(0).optional(),
  estimated_hours: z.number().min(0).optional(),
  skill_level_required: z.number().min(1).max(5).optional(),
  
  // Unit and measurement
  unit_of_measure: z.string().max(20).optional(),
  minimum_quantity: z.number().min(0).optional(),
  
  // Status and availability
  is_active: z.boolean().optional(),
  is_taxable: z.boolean().optional(),
  requires_license: z.boolean().optional(),
  
  // Material/Equipment specific
  manufacturer: z.string().max(100).optional(),
  model_number: z.string().max(100).optional(),
  warranty_period: z.number().min(0).optional(),
  
  // Inventory integration
  track_inventory: z.boolean().optional(),
  inventory_item_id: z.string().uuid().optional(),
  
  // Pricing tiers
  tier_pricing: z.array(z.object({
    min_quantity: z.number().min(1),
    price: z.number().min(0),
    discount_percentage: z.number().min(0).max(100).optional(),
  })).optional(),
  
  // Notes and specifications
  specifications: z.string().optional(),
  internal_notes: z.string().optional(),
});

// Pricing update schema for bulk price adjustments
const PricingUpdateSchema = z.object({
  adjustment_type: z.enum(['percentage', 'fixed_amount', 'set_price']),
  adjustment_value: z.number(),
  apply_to_base_price: z.boolean().default(true),
  apply_to_sell_price: z.boolean().default(false),
  reason: z.string().max(200).optional(),
  effective_date: z.string().date().optional(),
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

// Helper function to verify price book item access
async function verifyPriceBookItemAccess(itemId: string, organizationId: string) {
  const { data: item } = await supabase
    .from('hs.price_book')
    .select('id')
    .eq('id', itemId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!item;
}

// GET /api/v1/hs/price-book/[id] - Get specific price book item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;

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

    // Verify price book item access
    if (!(await verifyPriceBookItemAccess(itemId, organizationId))) {
      return NextResponse.json(
        { error: 'Price book item not found or access denied' },
        { status: 404 }
      );
    }

    // Get price book item with related data
    const { data: item, error } = await supabase
      .from('hs.price_book')
      .select('
        *,
        inventory:inventory_item_id(
          id,
          product_code,
          name,
          quantity_on_hand,
          minimum_stock_level,
          status
        ),
        pricing_history:price_book_pricing_history(
          id,
          previous_base_price,
          new_base_price,
          previous_sell_price,
          new_sell_price,
          change_reason,
          changed_at,
          changed_by
        )
      ')
      .eq('id', itemId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch price book item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ item });

  } catch (error) {
    console.error('GET /api/v1/hs/price-book/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/price-book/[id] - Update price book item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    const body = await request.json();
    const updateData = PriceBookItemUpdateSchema.parse(body);

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

    // Verify price book item access
    if (!(await verifyPriceBookItemAccess(itemId, organizationId))) {
      return NextResponse.json(
        { error: 'Price book item not found or access denied' },
        { status: 404 }
      );
    }

    // Check for duplicate code if being changed
    if (updateData.code) {
      const { data: existingItem } = await supabase
        .from('hs.price_book')
        .select('id')
        .eq('code', updateData.code)
        .eq('organization_id', organizationId)
        .neq('id', itemId)
        .single();
      
      if (existingItem) {
        return NextResponse.json(
          { error: 'Price book item with this code already exists' },
          { status: 409 }
        );
      }
    }

    // Validate inventory item if being changed
    if (updateData.inventory_item_id) {
      const { data: inventoryItem } = await supabase
        .from('hs.inventory')
        .select('id')
        .eq('id', updateData.inventory_item_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!inventoryItem) {
        return NextResponse.json(
          { error: 'Inventory item not found' },
          { status: 400 }
        );
      }
    }

    // Update price book item
    const { data: item, error } = await supabase
      .from('hs.price_book')
      .update(updateData)
      .eq('id', itemId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update price book item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ item });

  } catch (error) {
    console.error('PUT /api/v1/hs/price-book/[id] error:', error);
    
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

// PATCH /api/v1/hs/price-book/[id]/pricing - Update pricing with history tracking
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    const body = await request.json();
    const pricingData = PricingUpdateSchema.parse(body);

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

    // Get current item for pricing calculations
    const { data: currentItem } = await supabase
      .from('hs.price_book')
      .select('base_price, sell_price, markup_percentage')
      .eq('id', itemId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Price book item not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate new prices based on adjustment type
    let newBasePrice = currentItem.base_price;
    let newSellPrice = currentItem.sell_price;

    switch (pricingData.adjustment_type) {
      case 'percentage':
        if (pricingData.apply_to_base_price) {
          newBasePrice = currentItem.base_price * (1 + pricingData.adjustment_value / 100);
        }
        if (pricingData.apply_to_sell_price) {
          newSellPrice = currentItem.sell_price * (1 + pricingData.adjustment_value / 100);
        }
        break;
        
      case 'fixed_amount':
        if (pricingData.apply_to_base_price) {
          newBasePrice = currentItem.base_price + pricingData.adjustment_value;
        }
        if (pricingData.apply_to_sell_price) {
          newSellPrice = currentItem.sell_price + pricingData.adjustment_value;
        }
        break;
        
      case 'set_price':
        if (pricingData.apply_to_base_price) {
          newBasePrice = pricingData.adjustment_value;
        }
        if (pricingData.apply_to_sell_price) {
          newSellPrice = pricingData.adjustment_value;
        }
        break;
    }

    // Ensure prices are not negative
    newBasePrice = Math.max(0, newBasePrice);
    newSellPrice = Math.max(0, newSellPrice);

    // Calculate new markup percentage
    let newMarkupPercentage = currentItem.markup_percentage;
    if (newBasePrice > 0 && newSellPrice > 0) {
      newMarkupPercentage = ((newSellPrice - newBasePrice) / newBasePrice) * 100;
    }

    // Update prices
    const { data: item, error } = await supabase
      .from('hs.price_book')
      .update({
        base_price: newBasePrice,
        sell_price: newSellPrice,
        markup_percentage: newMarkupPercentage,
      })
      .eq('id', itemId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update pricing' },
        { status: 500 }
      );
    }

    // Record pricing history with reason
    await supabase
      .from('hs.price_book_pricing_history')
      .insert({
        price_book_item_id: itemId,
        previous_base_price: currentItem.base_price,
        new_base_price: newBasePrice,
        previous_sell_price: currentItem.sell_price,
        new_sell_price: newSellPrice,
        previous_markup_percentage: currentItem.markup_percentage,
        new_markup_percentage: newMarkupPercentage,
        change_reason: pricingData.reason || '${pricingData.adjustment_type} adjustment of ${pricingData.adjustment_value}',
        changed_by: user.id,
        effective_date: pricingData.effective_date || new Date().toISOString().split('T')[0],
      });

    return NextResponse.json({ 
      item,
      pricing_change: {
        adjustment_type: pricingData.adjustment_type,
        adjustment_value: pricingData.adjustment_value,
        previous_base_price: currentItem.base_price,
        new_base_price: newBasePrice,
        previous_sell_price: currentItem.sell_price,
        new_sell_price: newSellPrice,
      }
    });

  } catch (error) {
    console.error('PATCH /api/v1/hs/price-book/[id]/pricing error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid pricing update data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/hs/price-book/[id] - Deactivate price book item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;

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

    // Verify price book item access
    if (!(await verifyPriceBookItemAccess(itemId, organizationId))) {
      return NextResponse.json(
        { error: 'Price book item not found or access denied' },
        { status: 404 }
      );
    }

    // Check if item is used in active work orders or estimates
    const { data: activeUsage } = await supabase
      .from('hs.work_order_items')
      .select('id')
      .eq('product_code', itemId) // Assuming product_code references price book items
      .limit(1);

    if (activeUsage && activeUsage.length > 0) {
      // Soft delete by deactivating instead of hard delete
      const { data: item, error } = await supabase
        .from('hs.price_book')
        .update({ is_active: false })
        .eq('id', itemId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to deactivate price book item' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Price book item deactivated (item is referenced in work orders)',
        item 
      });
    } else {
      // Hard delete if not referenced
      const { error } = await supabase
        .from('hs.price_book')
        .delete()
        .eq('id', itemId)
        .eq('organization_id', organizationId);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to delete price book item' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Price book item deleted successfully' 
      });
    }

  } catch (error) {
    console.error('DELETE /api/v1/hs/price-book/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}