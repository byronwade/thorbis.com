import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inventory item update schema
const InventoryItemUpdateSchema = z.object({
  // Basic item information
  product_code: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  subcategory: z.string().max(100).optional(),
  
  // Item classification
  item_type: z.enum(['material', 'tool', 'equipment', 'consumable', 'part']).optional(),
  unit_of_measure: z.string().max(20).optional(),
  
  // Supplier and purchasing
  primary_supplier_id: z.string().uuid().optional(),
  supplier_part_number: z.string().max(100).optional(),
  manufacturer: z.string().max(100).optional(),
  model_number: z.string().max(100).optional(),
  
  // Stock levels (quantity changes handled separately)
  minimum_stock_level: z.number().min(0).optional(),
  maximum_stock_level: z.number().min(0).optional(),
  reorder_point: z.number().min(0).optional(),
  economic_order_quantity: z.number().min(1).optional(),
  
  // Pricing (unit_cost updates handled via stock transactions)
  standard_sell_price: z.number().min(0).optional(),
  
  // Location and tracking
  primary_location: z.string().max(100).optional(),
  bin_location: z.string().max(50).optional(),
  barcode: z.string().max(100).optional(),
  serial_tracking: z.boolean().optional(),
  lot_tracking: z.boolean().optional(),
  
  // Status and settings
  status: z.enum(['active', 'inactive', 'discontinued', 'special_order']).optional(),
  is_taxable: z.boolean().optional(),
  is_serialized: z.boolean().optional(),
  requires_license: z.boolean().optional(),
  hazardous_material: z.boolean().optional(),
  
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
  warranty_period: z.number().min(0).optional(),
});

// Stock adjustment schema
const StockAdjustmentSchema = z.object({
  adjustment_type: z.enum(['increase', 'decrease', 'set_to']),
  quantity: z.number(),
  unit_cost: z.number().min(0).optional(),
  reason: z.enum(['purchase', 'return', 'usage', 'damage', 'theft', 'count_correction', 'transfer', 'other']),
  reference_type: z.enum(['work_order', 'purchase_order', 'adjustment', 'transfer', 'return', 'other']).optional(),
  reference_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  location: z.string().max(100).optional(),
  lot_number: z.string().max(50).optional(),
  serial_number: z.string().max(100).optional(),
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

// Helper function to verify inventory access
async function verifyInventoryAccess(itemId: string, organizationId: string) {
  const { data: item } = await supabase
    .from('hs.inventory')
    .select('id')
    .eq('id', itemId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!item;
}

// Helper function to update average cost
async function updateAverageCost(itemId: string, quantityChange: number, newUnitCost: number) {
  const { data: item } = await supabase
    .from('hs.inventory')
    .select('quantity_on_hand, average_cost')
    .eq('id', itemId)
    .single();

  if (!item || quantityChange <= 0) return;

  const currentQuantity = item.quantity_on_hand;
  const currentAverageCost = item.average_cost || 0;
  
  // Calculate weighted average cost
  const totalCurrentValue = currentQuantity * currentAverageCost;
  const newValue = quantityChange * newUnitCost;
  const totalQuantity = currentQuantity + quantityChange;
  
  const newAverageCost = totalQuantity > 0 ? (totalCurrentValue + newValue) / totalQuantity : 0;

  await supabase
    .from('hs.inventory')
    .update({ 
      average_cost: Math.round(newAverageCost * 100) / 100,
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', itemId);
}

// GET /api/v1/hs/inventory/[id] - Get specific inventory item
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

    // Verify inventory access
    if (!(await verifyInventoryAccess(itemId, organizationId))) {
      return NextResponse.json(
        { error: 'Inventory item not found or access denied' },
        { status: 404 }
      );
    }

    // Get inventory item with related data
    const { data: inventoryItem, error } = await supabase
      .from('hs.inventory')
      .select('
        *,
        suppliers:primary_supplier_id(
          id,
          company_name,
          contact_name,
          phone,
          email,
          address_line_1,
          city,
          state_province
        ),
        recent_transactions:inventory_transactions(
          id,
          transaction_type,
          quantity_change,
          quantity_after,
          unit_cost,
          total_cost,
          reference_type,
          reference_id,
          notes,
          lot_number,
          serial_number,
          created_at,
          created_by_user:created_by(
            first_name,
            last_name
          )
        )
      ')
      .eq('id', itemId)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false, referencedTable: 'inventory_transactions' })
      .limit(10, { referencedTable: 'inventory_transactions' })
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inventory item' },
        { status: 500 }
      );
    }

    // Add calculated fields
    const enrichedItem = {
      ...inventoryItem,
      available_quantity: inventoryItem.quantity_on_hand - inventoryItem.quantity_allocated,
      total_value: inventoryItem.quantity_on_hand * inventoryItem.average_cost,
      needs_reorder: inventoryItem.quantity_on_hand <= inventoryItem.reorder_point,
      is_low_stock: inventoryItem.quantity_on_hand <= inventoryItem.minimum_stock_level,
      is_out_of_stock: inventoryItem.quantity_on_hand === 0,
      is_overstocked: inventoryItem.maximum_stock_level && inventoryItem.quantity_on_hand > inventoryItem.maximum_stock_level,
    };

    return NextResponse.json({ inventory_item: enrichedItem });

  } catch (error) {
    console.error('GET /api/v1/hs/inventory/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/inventory/[id] - Update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    const body = await request.json();
    const updateData = InventoryItemUpdateSchema.parse(body);

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

    // Verify inventory access
    if (!(await verifyInventoryAccess(itemId, organizationId))) {
      return NextResponse.json(
        { error: 'Inventory item not found or access denied' },
        { status: 404 }
      );
    }

    // Check for duplicate product code if being changed
    if (updateData.product_code) {
      const { data: existingItem } = await supabase
        .from('hs.inventory')
        .select('id')
        .eq('product_code', updateData.product_code)
        .eq('organization_id', organizationId)
        .neq('id', itemId)
        .single();
      
      if (existingItem) {
        return NextResponse.json(
          { error: 'Product code already exists' },
          { status: 409 }
        );
      }
    }

    // Validate supplier if being changed
    if (updateData.primary_supplier_id) {
      const { data: supplier } = await supabase
        .from('hs.suppliers')
        .select('id')
        .eq('id', updateData.primary_supplier_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (!supplier) {
        return NextResponse.json(
          { error: 'Supplier not found' },
          { status: 400 }
        );
      }
    }

    // Update inventory item
    const { data: inventoryItem, error } = await supabase
      .from('hs.inventory')
      .update({
        ...updateData,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .eq('organization_id', organizationId)
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
        { error: 'Failed to update inventory item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ inventory_item: inventoryItem });

  } catch (error) {
    console.error('PUT /api/v1/hs/inventory/[id] error:', error);
    
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

// PATCH /api/v1/hs/inventory/[id]/stock - Adjust stock levels
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    const body = await request.json();
    const adjustmentData = StockAdjustmentSchema.parse(body);

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

    // Get current inventory item
    const { data: currentItem } = await supabase
      .from('hs.inventory')
      .select('quantity_on_hand, unit_cost, average_cost')
      .eq('id', itemId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Inventory item not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate new quantity and quantity change
    let newQuantity: number;
    let quantityChange: number;

    switch (adjustmentData.adjustment_type) {
      case 'increase':
        quantityChange = Math.abs(adjustmentData.quantity);
        newQuantity = currentItem.quantity_on_hand + quantityChange;
        break;
      case 'decrease':
        quantityChange = -Math.abs(adjustmentData.quantity);
        newQuantity = Math.max(0, currentItem.quantity_on_hand + quantityChange);
        break;
      case 'set_to':
        newQuantity = Math.max(0, adjustmentData.quantity);
        quantityChange = newQuantity - currentItem.quantity_on_hand;
        break;
    }

    // Prevent negative stock
    if (newQuantity < 0) {
      return NextResponse.json(
        { error: 'Stock adjustment would result in negative inventory' },
        { status: 400 }
      );
    }

    // Use provided unit cost or current unit cost
    const unitCost = adjustmentData.unit_cost ?? currentItem.unit_cost;
    const totalCost = Math.abs(quantityChange) * unitCost;

    // Update inventory quantity
    const { data: updatedItem, error: updateError } = await supabase
      .from('hs.inventory')
      .update({
        quantity_on_hand: newQuantity,
        last_purchase_cost: adjustmentData.reason === 'purchase' ? unitCost : currentItem.unit_cost,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (updateError) {
      console.error('Database error updating inventory:', updateError);
      return NextResponse.json(
        { error: 'Failed to adjust inventory stock' },
        { status: 500 }
      );
    }

    // Record transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('hs.inventory_transactions')
      .insert({
        inventory_item_id: itemId,
        transaction_type: adjustmentData.reason,
        quantity_change: quantityChange,
        quantity_before: currentItem.quantity_on_hand,
        quantity_after: newQuantity,
        unit_cost: unitCost,
        total_cost: totalCost,
        reference_type: adjustmentData.reference_type,
        reference_id: adjustmentData.reference_id,
        notes: adjustmentData.notes,
        location: adjustmentData.location,
        lot_number: adjustmentData.lot_number,
        serial_number: adjustmentData.serial_number,
        created_by: user.id,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Database error creating transaction:', transactionError);
      // Don't fail the adjustment, just log the error
    }

    // Update average cost for inventory increases
    if (quantityChange > 0 && adjustmentData.unit_cost) {
      await updateAverageCost(itemId, quantityChange, adjustmentData.unit_cost);
    }

    return NextResponse.json({
      message: 'Stock adjustment completed successfully',
      adjustment: {
        previous_quantity: currentItem.quantity_on_hand,
        new_quantity: newQuantity,
        quantity_change: quantityChange,
        adjustment_type: adjustmentData.adjustment_type,
        unit_cost: unitCost,
        total_cost: totalCost,
      },
      inventory_item: updatedItem,
      transaction: transaction,
    });

  } catch (error) {
    console.error('PATCH /api/v1/hs/inventory/[id]/stock error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid stock adjustment data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/hs/inventory/[id] - Delete inventory item
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

    // Get current item to check constraints
    const { data: currentItem } = await supabase
      .from('hs.inventory')
      .select('quantity_on_hand, quantity_allocated')
      .eq('id', itemId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Inventory item not found or access denied' },
        { status: 404 }
      );
    }

    // Check if item has stock or is allocated
    if (currentItem.quantity_on_hand > 0 || currentItem.quantity_allocated > 0) {
      return NextResponse.json(
        { error: 'Cannot delete inventory item with existing stock or allocations' },
        { status: 409 }
      );
    }

    // Check if item is referenced in active work orders, estimates, etc.
    const { data: activeReferences } = await supabase
      .from('hs.work_order_items')
      .select('id')
      .eq('inventory_item_id', itemId)
      .limit(1);

    if (activeReferences && activeReferences.length > 0) {
      // Soft delete by marking as inactive
      const { data: deactivatedItem, error: deactivateError } = await supabase
        .from('hs.inventory')
        .update({ status: 'inactive' })
        .eq('id', itemId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (deactivateError) {
        console.error('Database error:', deactivateError);
        return NextResponse.json(
          { error: 'Failed to deactivate inventory item' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Inventory item deactivated (item is referenced in work orders)',
        inventory_item: deactivatedItem 
      });
    } else {
      // Hard delete if not referenced
      const { error } = await supabase
        .from('hs.inventory')
        .delete()
        .eq('id', itemId)
        .eq('organization_id', organizationId);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to delete inventory item' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Inventory item deleted successfully' 
      });
    }

  } catch (error) {
    console.error('DELETE /api/v1/hs/inventory/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}