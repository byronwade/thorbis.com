import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Customer merge schema
const CustomerMergeSchema = z.object({
  primary_customer_id: z.string().uuid(),
  duplicate_customer_ids: z.array(z.string().uuid()).min(1).max(10),
  merge_strategy: z.object({
    // Which customer's data to keep for each field
    personal_info: z.enum(['primary', 'most_recent', 'most_complete']).default('primary'),
    contact_info: z.enum(['primary', 'most_recent', 'most_complete']).default('most_complete'),
    addresses: z.enum(['primary', 'merge_all', 'most_recent']).default('merge_all'),
    preferences: z.enum(['primary', 'most_permissive', 'most_restrictive']).default('most_permissive'),
    
    // How to handle conflicts
    conflicting_data_resolution: z.enum(['primary_wins', 'manual_review', 'keep_both']).default('primary_wins'),
    
    // What to do with historical data
    preserve_history: z.boolean().default(true),
    create_merge_record: z.boolean().default(true),
  }).optional(),
  
  // Manual overrides for specific fields
  field_overrides: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    company_name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    preferred_contact_method: z.enum(['phone', 'email', 'sms', 'app']).optional(),
  }).optional(),
  
  // Confirmation and safety
  confirm_merge: z.boolean(),
  dry_run: z.boolean().default(false),
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

// Helper function to get customer details
async function getCustomerDetails(customerIds: string[], organizationId: string) {
  const { data: customers } = await supabase
    .from('hs.customers')
    .select('*')
    .in('id', customerIds)
    .eq('organization_id', organizationId);
  
  return customers || [];
}

// Helper function to analyze merge conflicts
async function analyzeMergeConflicts(customers: unknown[]) {
  const conflicts = [];
  const fields = ['first_name', 'last_name', 'company_name', 'email', 'phone', 'address_line_1', 'city'];
  
  for (const field of fields) {
    const values = customers.map(c => c[field]).filter(v => v && v.trim() !== ');
    const uniqueValues = [...new Set(values)];
    
    if (uniqueValues.length > 1) {
      conflicts.push({
        field,
        values: uniqueValues,
        customers: customers.filter(c => c[field] && uniqueValues.includes(c[field]))
          .map(c => ({ id: c.id, name: c.company_name || '${c.first_name} ${c.last_name}', value: c[field] })),
      });
    }
  }
  
  return conflicts;
}

// Helper function to get related data counts
async function getRelatedDataCounts(customerIds: string[], organizationId: string) {
  const [workOrders, appointments, estimates, invoices, communications, payments] = await Promise.all([
    supabase.from('hs.work_orders').select('id, customer_id').in('customer_id', customerIds).eq('organization_id', organizationId),
    supabase.from('hs.appointments').select('id, customer_id').in('customer_id', customerIds).eq('organization_id', organizationId),
    supabase.from('hs.estimates').select('id, customer_id').in('customer_id', customerIds).eq('organization_id', organizationId),
    supabase.from('hs.invoices').select('id, customer_id').in('customer_id', customerIds).eq('organization_id', organizationId),
    supabase.from('hs.communications').select('id, customer_id').in('customer_id', customerIds).eq('organization_id', organizationId),
    supabase.from('hs.invoice_payments').select('id, invoices!inner(customer_id)').in('invoices.customer_id', customerIds),
  ]);

  return {
    work_orders: workOrders.data || [],
    appointments: appointments.data || [],
    estimates: estimates.data || [],
    invoices: invoices.data || [],
    communications: communications.data || [],
    payments: payments.data || [],
  };
}

// Helper function to merge customer data based on strategy
function mergeCustomerData(customers: unknown[], strategy: unknown, overrides: unknown = {}) {
  const primary = customers[0];
  const mergedData = { ...primary };

  // Apply overrides first
  Object.assign(mergedData, overrides);

  // Apply merge strategy
  if (strategy.contact_info === 'most_complete') {
    for (const customer of customers) {
      if (!mergedData.email && customer.email) mergedData.email = customer.email;
      if (!mergedData.phone && customer.phone) mergedData.phone = customer.phone;
      if (!mergedData.secondary_phone && customer.secondary_phone) mergedData.secondary_phone = customer.secondary_phone;
    }
  }

  if (strategy.personal_info === 'most_complete') {
    for (const customer of customers) {
      if (!mergedData.first_name && customer.first_name) mergedData.first_name = customer.first_name;
      if (!mergedData.last_name && customer.last_name) mergedData.last_name = customer.last_name;
      if (!mergedData.company_name && customer.company_name) mergedData.company_name = customer.company_name;
    }
  }

  // Merge addresses
  if (strategy.addresses === 'merge_all') {
    // Keep primary address, but add service address from others if missing
    for (const customer of customers) {
      if (!mergedData.service_address_line_1 && customer.service_address_line_1) {
        mergedData.service_address_line_1 = customer.service_address_line_1;
        mergedData.service_address_line_2 = customer.service_address_line_2;
        mergedData.service_city = customer.service_city;
        mergedData.service_state_province = customer.service_state_province;
        mergedData.service_postal_code = customer.service_postal_code;
      }
    }
  }

  return mergedData;
}

// Helper function to perform the actual merge
async function performMerge(
  primaryCustomerId: string,
  duplicateIds: string[], mergedData: unknown,
  relatedData: unknown,
  organizationId: string,
  userId: string
) {
  const mergeResults = {
    updated_records: {
      work_orders: 0,
      appointments: 0,
      estimates: 0,
      invoices: 0,
      communications: 0,
      payments: 0,
    },
    deleted_customers: duplicateIds.length,
  };

  // Update all related records to point to primary customer
  for (const workOrder of relatedData.work_orders) {
    if (workOrder.customer_id !== primaryCustomerId) {
      await supabase
        .from('hs.work_orders')
        .update({ customer_id: primaryCustomerId })
        .eq('id', workOrder.id);
      mergeResults.updated_records.work_orders++;
    }
  }

  for (const appointment of relatedData.appointments) {
    if (appointment.customer_id !== primaryCustomerId) {
      await supabase
        .from('hs.appointments')
        .update({ customer_id: primaryCustomerId })
        .eq('id', appointment.id);
      mergeResults.updated_records.appointments++;
    }
  }

  for (const estimate of relatedData.estimates) {
    if (estimate.customer_id !== primaryCustomerId) {
      await supabase
        .from('hs.estimates')
        .update({ customer_id: primaryCustomerId })
        .eq('id', estimate.id);
      mergeResults.updated_records.estimates++;
    }
  }

  for (const invoice of relatedData.invoices) {
    if (invoice.customer_id !== primaryCustomerId) {
      await supabase
        .from('hs.invoices')
        .update({ customer_id: primaryCustomerId })
        .eq('id', invoice.id);
      mergeResults.updated_records.invoices++;
    }
  }

  for (const communication of relatedData.communications) {
    if (communication.customer_id !== primaryCustomerId) {
      await supabase
        .from('hs.communications')
        .update({ customer_id: primaryCustomerId })
        .eq('id', communication.id);
      mergeResults.updated_records.communications++;
    }
  }

  // Update primary customer with merged data
  await supabase
    .from('hs.customers')
    .update({
      ...mergedData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', primaryCustomerId)
    .eq('organization_id', organizationId);

  // Create merge record for audit trail
  await supabase
    .from('hs.customer_merge_log')
    .insert({
      primary_customer_id: primaryCustomerId,
      merged_customer_ids: duplicateIds,
      merge_details: {
        merged_data: mergedData,
        updated_records: mergeResults.updated_records,
        merge_timestamp: new Date().toISOString(),
      },
      organization_id: organizationId,
      created_by: userId,
    });

  // Soft delete duplicate customers
  await supabase
    .from('hs.customers')
    .update({ 
      customer_status: 'merged',
      merged_into_customer_id: primaryCustomerId,
      updated_at: new Date().toISOString(),
    })
    .in('id', duplicateIds)
    .eq('organization_id', organizationId);

  return mergeResults;
}

// POST /api/v1/hs/customers/merge - Merge duplicate customer records
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mergeData = CustomerMergeSchema.parse(body);

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

    if (!mergeData.confirm_merge && !mergeData.dry_run) {
      return NextResponse.json(
        { error: 'Must either confirm_merge or set dry_run to true' },
        { status: 400 }
      );
    }

    // Validate all customers exist and belong to organization
    const allCustomerIds = [mergeData.primary_customer_id, ...mergeData.duplicate_customer_ids];
    const customers = await getCustomerDetails(allCustomerIds, organizationId);

    if (customers.length !== allCustomerIds.length) {
      return NextResponse.json(
        { error: 'One or more customers not found or access denied' },
        { status: 404 }
      );
    }

    // Check for already merged customers
    const alreadyMerged = customers.filter(c => c.customer_status === 'merged');
    if (alreadyMerged.length > 0) {
      return NextResponse.json(
        { error: 'Customers already merged: ${alreadyMerged.map(c => c.id).join(', ')}` },
        { status: 409 }
      );
    }

    // Ensure primary customer is first in array
    const sortedCustomers = [
      customers.find(c => c.id === mergeData.primary_customer_id)!,
      ...customers.filter(c => c.id !== mergeData.primary_customer_id)
    ];

    // Analyze conflicts
    const conflicts = await analyzeMergeConflicts(sortedCustomers);
    
    // Get related data counts
    const relatedData = await getRelatedDataCounts(allCustomerIds, organizationId);
    
    // Calculate totals
    const totalRelatedRecords = Object.values(relatedData).reduce((sum, records) => sum + records.length, 0);

    // Merge customer data based on strategy
    const mergeStrategy = mergeData.merge_strategy || {};
    const mergedCustomerData = mergeCustomerData(
      sortedCustomers,
      mergeStrategy,
      mergeData.field_overrides
    );

    // Prepare response
    const mergePreview = {
      primary_customer: {
        id: mergeData.primary_customer_id,
        name: sortedCustomers[0].company_name || `${sortedCustomers[0].first_name} ${sortedCustomers[0].last_name}',
      },
      duplicate_customers: mergeData.duplicate_customer_ids.map(id => {
        const customer = customers.find(c => c.id === id)!;
        return {
          id,
          name: customer.company_name || '${customer.first_name} ${customer.last_name}',
        };
      }),
      merged_data: mergedCustomerData,
      conflicts,
      impact_summary: {
        total_customers_affected: allCustomerIds.length,
        total_related_records: totalRelatedRecords,
        records_by_type: {
          work_orders: relatedData.work_orders.length,
          appointments: relatedData.appointments.length,
          estimates: relatedData.estimates.length,
          invoices: relatedData.invoices.length,
          communications: relatedData.communications.length,
          payments: relatedData.payments.length,
        },
      },
      dry_run: mergeData.dry_run,
    };

    // If dry run, return preview only
    if (mergeData.dry_run) {
      return NextResponse.json({
        message: 'Merge preview generated successfully',
        ...mergePreview,
        warnings: conflicts.length > 0 ? [
          'Data conflicts detected. Review conflicts and consider using field overrides.',
        ] : [],
      });
    }

    // Perform actual merge
    const mergeResults = await performMerge(
      mergeData.primary_customer_id,
      mergeData.duplicate_customer_ids,
      mergedCustomerData,
      relatedData,
      organizationId,
      user.id
    );

    return NextResponse.json({
      message: 'Successfully merged ${mergeData.duplicate_customer_ids.length} customers',
      merge_results: mergeResults,
      primary_customer_id: mergeData.primary_customer_id,
      merged_customer_ids: mergeData.duplicate_customer_ids,
      conflicts_resolved: conflicts.length,
      total_records_updated: Object.values(mergeResults.updated_records).reduce((sum, count) => sum + count, 0),
    });

  } catch (error) {
    console.error('POST /api/v1/hs/customers/merge error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid merge data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}