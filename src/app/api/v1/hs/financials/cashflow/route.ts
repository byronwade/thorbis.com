import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cash flow query schema
const CashFlowQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '6m', '1y', 'custom']).default('30d'),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  
  // Granularity
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  
  // Categories to include
  include_revenue: z.boolean().default(true),
  include_expenses: z.boolean().default(true),
  include_projections: z.boolean().default(true),
  
  // Filtering
  customer_id: z.string().uuid().optional(),
  technician_id: z.string().uuid().optional(),
  service_type: z.string().optional(),
  payment_method: z.enum(['cash', 'check', 'card', 'bank_transfer', 'online']).optional(),
  
  // Grouping
  group_by: z.enum(['day', 'week', 'month', 'payment_method', 'customer_type', 'service_type']).optional(),
});

// Cash flow entry schema
const CashFlowEntrySchema = z.object({
  entry_type: z.enum(['income', 'expense']),
  category: z.string(),
  description: z.string(),
  amount: z.number(),
  transaction_date: z.string().date(),
  payment_method: z.enum(['cash', 'check', 'card', 'bank_transfer', 'online']).optional(),
  reference_id: z.string().optional(),
  reference_type: z.enum(['invoice', 'payment', 'expense', 'other']).optional(),
  tags: z.array(z.string()).optional(),
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

// Helper function to get date ranges
function getDateRanges(period: string, startDate?: string, endDate?: string) {
  const now = new Date();
  let start = new Date();
  let end = new Date(now);

  if (period === 'custom' && startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    switch (period) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '6m':
        start.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
  }

  return { start, end };
}

// Helper function to format date for grouping
function formatDateForGrouping(date: Date, granularity: string): string {
  switch (granularity) {
    case 'daily':
      return date.toISOString().split('T')[0];
    case 'weekly':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().split('T')[0];
    case 'monthly':
      return '${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}';
    default:
      return date.toISOString().split('T')[0];
  }
}

// Helper function to get cash inflows (payments received)
async function getCashInflows(organizationId: string, dateRange: unknown, filters: unknown = {}) {
  let query = supabase
    .from('hs.invoice_payments')
    .select('
      id,
      payment_amount,
      payment_method,
      payment_date,
      reference_number,
      invoices!inner(
        invoice_number,
        customer_id,
        service_type,
        technician_id,
        customers!inner(
          first_name,
          last_name,
          company_name,
          customer_type
        )
      )
    ')
    .eq('organization_id', organizationId)
    .gte('payment_date', dateRange.start.toISOString())
    .lte('payment_date', dateRange.end.toISOString())
    .order('payment_date');

  // Apply filters
  if (filters.customer_id) {
    query = query.eq('invoices.customer_id', filters.customer_id);
  }
  if (filters.technician_id) {
    query = query.eq('invoices.technician_id', filters.technician_id);
  }
  if (filters.service_type) {
    query = query.eq('invoices.service_type', filters.service_type);
  }
  if (filters.payment_method) {
    query = query.eq('payment_method', filters.payment_method);
  }

  const { data: payments } = await query;
  return payments || [];
}

// Helper function to get cash outflows (expenses)
async function getCashOutflows(organizationId: string, dateRange: unknown, filters: unknown = {}) {
  // Get expenses from inventory purchases, technician payments, etc.
  const [inventoryExpenses, laborExpenses, businessExpenses] = await Promise.all([
    // Inventory purchases
    supabase
      .from('hs.inventory_transactions')
      .select('
        id,
        quantity,
        cost_per_unit,
        total_cost,
        transaction_date,
        transaction_type,
        inventory_items!inner(
          name,
          category
        )
      ')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'purchase')
      .gte('transaction_date', dateRange.start.toISOString())
      .lte('transaction_date', dateRange.end.toISOString()),

    // Technician payments (if tracked)
    supabase
      .from('hs.technician_payments')
      .select('
        id,
        payment_amount,
        payment_date,
        payment_type,
        technicians!inner(
          first_name,
          last_name
        )
      ')
      .eq('organization_id', organizationId)
      .gte('payment_date', dateRange.start.toISOString())
      .lte('payment_date', dateRange.end.toISOString()) || { data: [] },

    // General business expenses
    supabase
      .from('hs.business_expenses')
      .select('
        id,
        amount,
        category,
        description,
        expense_date,
        payment_method
      ')
      .eq('organization_id', organizationId)
      .gte('expense_date', dateRange.start.toISOString())
      .lte('expense_date', dateRange.end.toISOString()) || { data: [] },
  ]);

  const outflows = [];

  // Add inventory expenses
  inventoryExpenses.data?.forEach(expense => {
    outflows.push({
      id: expense.id,
      amount: expense.total_cost,
      category: 'inventory',
      description: 'Inventory: ${expense.inventory_items?.name}',
      transaction_date: expense.transaction_date,
      type: 'expense',
    });
  });

  // Add labor expenses
  laborExpenses.data?.forEach(expense => {
    outflows.push({
      id: expense.id,
      amount: expense.payment_amount,
      category: 'labor',
      description: 'Payment to ${expense.technicians?.first_name} ${expense.technicians?.last_name}',
      transaction_date: expense.payment_date,
      type: 'expense',
    });
  });

  // Add business expenses
  businessExpenses.data?.forEach(expense => {
    outflows.push({
      id: expense.id,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      transaction_date: expense.expense_date,
      type: 'expense',
    });
  });

  return outflows;
}

// Helper function to calculate projections
async function calculateProjections(organizationId: string, historicalData: unknown[]) {
  // Simple linear projection based on recent trends
  const recentData = historicalData.slice(-30); // Last 30 data points
  
  if (recentData.length < 7) {
    return { message: 'Insufficient data for projections' };
  }

  const totalInflow = recentData.reduce((sum, day) => sum + day.inflow, 0);
  const totalOutflow = recentData.reduce((sum, day) => sum + day.outflow, 0);
  const totalNet = recentData.reduce((sum, day) => sum + day.net_flow, 0);

  const avgDailyInflow = totalInflow / recentData.length;
  const avgDailyOutflow = totalOutflow / recentData.length;
  const avgDailyNet = totalNet / recentData.length;

  // Project next 30 days
  const projections = [];
  const today = new Date();
  
  for (const i = 1; i <= 30; i++) {
    const projectedDate = new Date(today);
    projectedDate.setDate(today.getDate() + i);
    
    // Add some variance based on day of week and historical patterns
    const dayOfWeek = projectedDate.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0; // Lower on weekends
    
    projections.push({
      date: projectedDate.toISOString().split('T')[0],
      projected_inflow: avgDailyInflow * weekendMultiplier,
      projected_outflow: avgDailyOutflow,
      projected_net: avgDailyNet * weekendMultiplier,
      confidence: Math.max(0.5, 1 - (i / 60)), // Confidence decreases over time
    });
  }

  return {
    summary: {
      average_daily_inflow: avgDailyInflow,
      average_daily_outflow: avgDailyOutflow,
      average_daily_net: avgDailyNet,
    },
    projections,
  };
}

// GET /api/v1/hs/financials/cashflow - Get detailed cash flow analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = CashFlowQuerySchema.parse(Object.fromEntries(searchParams));

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

    const dateRange = getDateRanges(query.period, query.start_date, query.end_date);
    const filters = {
      customer_id: query.customer_id,
      technician_id: query.technician_id,
      service_type: query.service_type,
      payment_method: query.payment_method,
    };

    const cashFlowData: unknown = {
      period: query.period,
      granularity: query.granularity,
      date_range: {
        from: dateRange.start.toISOString(),
        to: dateRange.end.toISOString(),
      },
    };

    // Get cash inflows and outflows
    const [inflows, outflows] = await Promise.all([
      query.include_revenue ? getCashInflows(organizationId, dateRange, filters) : [],
      query.include_expenses ? getCashOutflows(organizationId, dateRange, filters) : [],
    ]);

    // Group data by the requested granularity
    const groupedData = new Map();

    // Process inflows
    inflows.forEach(payment => {
      const date = formatDateForGrouping(new Date(payment.payment_date), query.granularity);
      
      if (!groupedData.has(date)) {
        groupedData.set(date, {
          date,
          inflow: 0,
          outflow: 0,
          net_flow: 0,
          transactions: [],
        });
      }
      
      const dayData = groupedData.get(date);
      dayData.inflow += payment.payment_amount;
      dayData.transactions.push({
        type: 'inflow`,
        amount: payment.payment_amount,
        description: `Payment for Invoice ${payment.invoices?.invoice_number}',
        customer: payment.invoices?.customers?.company_name || 
                 '${payment.invoices?.customers?.first_name} ${payment.invoices?.customers?.last_name}',
        payment_method: payment.payment_method,
        reference: payment.reference_number,
      });
    });

    // Process outflows
    outflows.forEach(expense => {
      const date = formatDateForGrouping(new Date(expense.transaction_date), query.granularity);
      
      if (!groupedData.has(date)) {
        groupedData.set(date, {
          date,
          inflow: 0,
          outflow: 0,
          net_flow: 0,
          transactions: [],
        });
      }
      
      const dayData = groupedData.get(date);
      dayData.outflow += expense.amount;
      dayData.transactions.push({
        type: 'outflow',
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
      });
    });

    // Calculate net flows and sort by date
    const cashFlowTimeline = Array.from(groupedData.values())
      .map(day => {
        day.net_flow = day.inflow - day.outflow;
        return day;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate running balance (assuming starting balance of 0 for demo)
    const runningBalance = 0;
    cashFlowTimeline.forEach(day => {
      runningBalance += day.net_flow;
      day.running_balance = runningBalance;
    });

    cashFlowData.timeline = cashFlowTimeline;

    // Calculate summary metrics
    const totalInflow = cashFlowTimeline.reduce((sum, day) => sum + day.inflow, 0);
    const totalOutflow = cashFlowTimeline.reduce((sum, day) => sum + day.outflow, 0);
    const netCashFlow = totalInflow - totalOutflow;

    cashFlowData.summary = {
      total_inflow: totalInflow,
      total_outflow: totalOutflow,
      net_cash_flow: netCashFlow,
      average_daily_inflow: cashFlowTimeline.length > 0 ? totalInflow / cashFlowTimeline.length : 0,
      average_daily_outflow: cashFlowTimeline.length > 0 ? totalOutflow / cashFlowTimeline.length : 0,
      positive_cash_flow_days: cashFlowTimeline.filter(day => day.net_flow > 0).length,
      negative_cash_flow_days: cashFlowTimeline.filter(day => day.net_flow < 0).length,
      largest_daily_inflow: Math.max(...cashFlowTimeline.map(day => day.inflow)),
      largest_daily_outflow: Math.max(...cashFlowTimeline.map(day => day.outflow)),
    };

    // Add breakdown by category/type
    const inflowByMethod = inflows.reduce((acc, payment) => {
      acc[payment.payment_method] = (acc[payment.payment_method] || 0) + payment.payment_amount;
      return acc;
    }, {} as Record<string, number>);

    const outflowByCategory = outflows.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    cashFlowData.breakdowns = {
      inflow_by_payment_method: inflowByMethod,
      outflow_by_category: outflowByCategory,
    };

    // Add projections if requested
    if (query.include_projections) {
      const projections = await calculateProjections(organizationId, cashFlowTimeline);
      cashFlowData.projections = projections;
    }

    return NextResponse.json(cashFlowData);

  } catch (error) {
    console.error('GET /api/v1/hs/financials/cashflow error:', error);
    
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

// POST /api/v1/hs/financials/cashflow - Add manual cash flow entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entryData = CashFlowEntrySchema.parse(body);

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

    // Add cash flow entry
    const { data: entry, error } = await supabase
      .from('hs.cash_flow_entries')
      .insert({
        ...entryData,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create cash flow entry' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { entry, message: 'Cash flow entry created successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/financials/cashflow error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid cash flow entry data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}