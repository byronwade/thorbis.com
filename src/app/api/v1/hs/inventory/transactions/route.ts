import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Transaction query schema
const TransactionQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  inventory_item_id: z.string().uuid().optional(),
  transaction_type: z.enum(['purchase', 'return', 'usage', 'damage', 'theft', 'count_correction', 'transfer', 'adjustment', 'other']).optional(),
  reference_type: z.enum(['work_order', 'purchase_order', 'adjustment', 'transfer', 'return', 'other']).optional(),
  reference_id: z.string().uuid().optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  created_by: z.string().uuid().optional(),
  location: z.string().optional(),
  lot_number: z.string().optional(),
  serial_number: z.string().optional(),
  min_quantity: z.string().regex(/^-?\d+(\.\d+)?$/).transform(Number).optional(),
  max_quantity: z.string().regex(/^-?\d+(\.\d+)?$/).transform(Number).optional(),
  sort: z.enum(['created_at', 'transaction_type', 'quantity_change', 'total_cost']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Bulk transaction schema for inventory transfers
const BulkTransactionSchema = z.object({
  transactions: z.array(z.object({
    inventory_item_id: z.string().uuid(),
    transaction_type: z.enum(['transfer', 'adjustment', 'usage']),
    quantity_change: z.number(),
    unit_cost: z.number().min(0).optional(),
    reference_type: z.enum(['work_order', 'transfer', 'adjustment', 'other']).optional(),
    reference_id: z.string().uuid().optional(),
    notes: z.string().optional(),
    location: z.string().max(100).optional(),
    lot_number: z.string().max(50).optional(),
    serial_number: z.string().max(100).optional(),
  })),
  batch_notes: z.string().optional(),
  batch_reference: z.string().max(100).optional(),
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

// Helper function to update inventory quantities and costs
async function updateInventoryAfterTransaction(
  itemId: string, 
  quantityChange: number, 
  unitCost?: number
) {
  const { data: item } = await supabase
    .from('hs.inventory')
    .select('quantity_on_hand, average_cost')
    .eq('id', itemId)
    .single();

  if (!item) return { error: 'Inventory item not found' };

  const newQuantity = Math.max(0, item.quantity_on_hand + quantityChange);

  // Calculate new average cost for increases with cost
  let newAverageCost = item.average_cost || 0;
  if (quantityChange > 0 && unitCost && unitCost > 0) {
    const currentQuantity = item.quantity_on_hand;
    const currentValue = currentQuantity * (item.average_cost || 0);
    const newValue = quantityChange * unitCost;
    const totalQuantity = currentQuantity + quantityChange;
    
    newAverageCost = totalQuantity > 0 ? (currentValue + newValue) / totalQuantity : 0;
    newAverageCost = Math.round(newAverageCost * 100) / 100;
  }

  const { error } = await supabase
    .from('hs.inventory')
    .update({
      quantity_on_hand: newQuantity,
      average_cost: newAverageCost,
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', itemId);

  return { error, newQuantity, newAverageCost };
}

// GET /api/v1/hs/inventory/transactions - List inventory transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = TransactionQuerySchema.parse(Object.fromEntries(searchParams));
    
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
      .from('hs.inventory_transactions')
      .select('
        id,
        inventory_item_id,
        transaction_type,
        quantity_change,
        quantity_before,
        quantity_after,
        unit_cost,
        total_cost,
        reference_type,
        reference_id,
        notes,
        location,
        lot_number,
        serial_number,
        created_at,
        created_by,
        inventory_item:inventory_item_id(
          product_code,
          name,
          unit_of_measure
        ),
        created_by_user:created_by(
          first_name,
          last_name
        ),
        work_order:reference_id(
          work_order_number,
          customer_id
        )
      ', { count: 'exact' });

    // Filter by organization through inventory items
    supabaseQuery = supabaseQuery.eq('inventory_item.organization_id', organizationId);

    // Apply filters
    if (query.inventory_item_id) {
      supabaseQuery = supabaseQuery.eq('inventory_item_id', query.inventory_item_id);
    }
    
    if (query.transaction_type) {
      supabaseQuery = supabaseQuery.eq('transaction_type', query.transaction_type);
    }
    
    if (query.reference_type) {
      supabaseQuery = supabaseQuery.eq('reference_type', query.reference_type);
    }
    
    if (query.reference_id) {
      supabaseQuery = supabaseQuery.eq('reference_id', query.reference_id);
    }
    
    if (query.created_by) {
      supabaseQuery = supabaseQuery.eq('created_by', query.created_by);
    }
    
    if (query.location) {
      supabaseQuery = supabaseQuery.ilike('location', '%${query.location}%');
    }
    
    if (query.lot_number) {
      supabaseQuery = supabaseQuery.eq('lot_number', query.lot_number);
    }
    
    if (query.serial_number) {
      supabaseQuery = supabaseQuery.eq('serial_number', query.serial_number);
    }
    
    if (query.date_from) {
      supabaseQuery = supabaseQuery.gte('created_at', query.date_from);
    }
    
    if (query.date_to) {
      const endDate = new Date(query.date_to);
      endDate.setHours(23, 59, 59, 999);
      supabaseQuery = supabaseQuery.lte('created_at', endDate.toISOString());
    }
    
    if (query.min_quantity !== undefined) {
      supabaseQuery = supabaseQuery.gte('quantity_change', query.min_quantity);
    }
    
    if (query.max_quantity !== undefined) {
      supabaseQuery = supabaseQuery.lte('quantity_change', query.max_quantity);
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: transactions, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inventory transactions' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      transactions: transactions || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/inventory/transactions error:', error);
    
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

// POST /api/v1/hs/inventory/transactions - Create bulk transactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bulkData = BulkTransactionSchema.parse(body);

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

    // Validate all inventory items exist and get current quantities
    const itemIds = bulkData.transactions.map(t => t.inventory_item_id);
    const { data: inventoryItems } = await supabase
      .from('hs.inventory')
      .select('id, quantity_on_hand, average_cost')
      .in('id', itemIds)
      .eq('organization_id', organizationId);

    if (!inventoryItems || inventoryItems.length !== itemIds.length) {
      return NextResponse.json(
        { error: 'One or more inventory items not found' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Process each transaction
    for (const i = 0; i < bulkData.transactions.length; i++) {
      const transactionData = bulkData.transactions[i];
      const currentItem = inventoryItems.find(item => item.id === transactionData.inventory_item_id);
      
      if (!currentItem) {
        errors.push({
          index: i,
          error: 'Inventory item not found',
          transaction: transactionData,
        });
        continue;
      }

      const quantityBefore = currentItem.quantity_on_hand;
      const quantityAfter = Math.max(0, quantityBefore + transactionData.quantity_change);
      
      // Check for negative stock
      if (transactionData.quantity_change < 0 && quantityAfter < 0) {
        errors.push({
          index: i,
          error: 'Transaction would result in negative stock',
          transaction: transactionData,
        });
        continue;
      }

      const unitCost = transactionData.unit_cost || currentItem.average_cost || 0;
      const totalCost = Math.abs(transactionData.quantity_change) * unitCost;

      try {
        // Create transaction record
        const { data: transaction, error: transactionError } = await supabase
          .from('hs.inventory_transactions')
          .insert({
            ...transactionData,
            quantity_before: quantityBefore,
            quantity_after: quantityAfter,
            unit_cost: unitCost,
            total_cost: totalCost,
            notes: transactionData.notes || bulkData.batch_notes,
            batch_reference: bulkData.batch_reference,
            created_by: user.id,
          })
          .select()
          .single();

        if (transactionError) {
          errors.push({
            index: i,
            error: transactionError.message,
            transaction: transactionData,
          });
          continue;
        }

        // Update inventory quantities
        const updateResult = await updateInventoryAfterTransaction(
          transactionData.inventory_item_id,
          transactionData.quantity_change,
          transactionData.unit_cost
        );

        if (updateResult.error) {
          errors.push({
            index: i,
            error: updateResult.error,
            transaction: transactionData,
          });
          continue;
        }

        results.push({
          transaction,
          inventory_update: {
            previous_quantity: quantityBefore,
            new_quantity: updateResult.newQuantity,
            new_average_cost: updateResult.newAverageCost,
          },
        });

        // Update current item for subsequent transactions
        currentItem.quantity_on_hand = updateResult.newQuantity!;
        currentItem.average_cost = updateResult.newAverageCost!;

      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
          transaction: transactionData,
        });
      }
    }

    const response = {
      message: 'Processed ${results.length} transactions successfully',
      successful_transactions: results,
      failed_transactions: errors,
      summary: {
        total_requested: bulkData.transactions.length,
        successful: results.length,
        failed: errors.length,
        batch_reference: bulkData.batch_reference,
      },
    };

    const statusCode = errors.length > 0 ? 207 : 201; // 207 Multi-Status for partial success

    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('POST /api/v1/hs/inventory/transactions error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid transaction data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}