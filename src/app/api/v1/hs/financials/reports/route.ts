import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Financial report query schema
const FinancialReportQuerySchema = z.object({
  report_type: z.enum([
    'profit_loss',
    'balance_sheet',
    'aging_report',
    'revenue_analysis',
    'expense_analysis',
    'customer_profitability',
    'technician_performance',
    'service_type_analysis'
  ]),
  
  // Date range
  period: z.enum(['week', 'month', 'quarter', 'year', 'custom']).default('month'),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  
  // Comparison
  include_previous_period: z.boolean().default(true),
  include_year_over_year: z.boolean().default(false),
  
  // Filtering
  customer_id: z.string().uuid().optional(),
  technician_id: z.string().uuid().optional(),
  service_types: z.array(z.string()).optional(),
  customer_types: z.array(z.enum(['residential', 'commercial', 'property_management'])).optional(),
  
  // Grouping and detail level
  group_by: z.enum(['day', 'week', 'month', 'customer', 'technician', 'service_type']).optional(),
  detail_level: z.enum(['summary', 'detailed', 'line_item']).default('summary'),
  
  // Export options
  export_format: z.enum(['json', 'csv', 'pdf']).default('json'),
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
      case 'week':
        const dayOfWeek = now.getDay();
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
    }
  }

  // Calculate comparison periods
  const periodLength = end.getTime() - start.getTime();
  const previousStart = new Date(start.getTime() - periodLength);
  const previousEnd = new Date(start.getTime() - 1);

  const yearAgoStart = new Date(start);
  const yearAgoEnd = new Date(end);
  yearAgoStart.setFullYear(yearAgoStart.getFullYear() - 1);
  yearAgoEnd.setFullYear(yearAgoEnd.getFullYear() - 1);

  return {
    current: { start, end },
    previous: { start: previousStart, end: previousEnd },
    yearAgo: { start: yearAgoStart, end: yearAgoEnd },
  };
}

// Profit & Loss Report
async function generateProfitLossReport(organizationId: string, dateRange: unknown, filters: unknown = {}) {
  // Revenue
  let revenueQuery = supabase
    .from('hs.invoices')
    .select('
      total_amount,
      amount_paid,
      status,
      service_type,
      created_at
    ')
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  if (filters.service_types?.length > 0) {
    revenueQuery = revenueQuery.in('service_type', filters.service_types);
  }

  const { data: invoices } = await revenueQuery;

  // Expenses
  const [inventoryExpenses, laborExpenses, businessExpenses] = await Promise.all([
    supabase
      .from('hs.inventory_transactions')
      .select('total_cost, transaction_date')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'purchase')
      .gte('transaction_date', dateRange.start.toISOString())
      .lte('transaction_date', dateRange.end.toISOString()),
    
    supabase
      .from('hs.technician_payments')
      .select('payment_amount, payment_date')
      .eq('organization_id', organizationId)
      .gte('payment_date', dateRange.start.toISOString())
      .lte('payment_date', dateRange.end.toISOString()) || { data: [] },
    
    supabase
      .from('hs.business_expenses')
      .select('amount, category, expense_date')
      .eq('organization_id', organizationId)
      .gte('expense_date', dateRange.start.toISOString())
      .lte('expense_date', dateRange.end.toISOString()) || { data: [] },
  ]);

  // Calculate revenue
  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
  const paidRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0;

  // Revenue by service type
  const revenueByService = invoices?.reduce((acc, inv) => {
    const serviceType = inv.service_type || 'Unknown';
    acc[serviceType] = (acc[serviceType] || 0) + (inv.total_amount || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate expenses
  const inventoryCost = inventoryExpenses.data?.reduce((sum, exp) => sum + (exp.total_cost || 0), 0) || 0;
  const laborCost = laborExpenses.data?.reduce((sum, exp) => sum + (exp.payment_amount || 0), 0) || 0;
  
  const expensesByCategory = businessExpenses.data?.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalBusinessExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
  const totalExpenses = inventoryCost + laborCost + totalBusinessExpenses;

  // Calculate profit
  const grossProfit = totalRevenue - inventoryCost - laborCost;
  const netProfit = grossProfit - totalBusinessExpenses;

  return {
    revenue: {
      total_revenue: totalRevenue,
      collected_revenue: paidRevenue,
      uncollected_revenue: totalRevenue - paidRevenue,
      revenue_by_service: revenueByService,
    },
    expenses: {
      cost_of_goods_sold: {
        inventory_cost: inventoryCost,
        labor_cost: laborCost,
        total_cogs: inventoryCost + laborCost,
      },
      operating_expenses: expensesByCategory,
      total_operating_expenses: totalBusinessExpenses,
      total_expenses: totalExpenses,
    },
    profitability: {
      gross_profit: grossProfit,
      gross_margin_percent: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      net_profit: netProfit,
      net_margin_percent: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    },
  };
}

// Revenue Analysis Report
async function generateRevenueAnalysisReport(organizationId: string, dateRange: unknown, filters: unknown = {}) {
  let query = supabase
    .from('hs.invoices')
    .select('
      id,
      invoice_number,
      total_amount,
      amount_paid,
      status,
      service_type,
      created_at,
      customer_id,
      technician_id,
      customers!inner(
        first_name,
        last_name,
        company_name,
        customer_type
      ),
      technicians(
        first_name,
        last_name
      )
    ')
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  if (filters.customer_types?.length > 0) {
    query = query.in('customers.customer_type', filters.customer_types);
  }

  const { data: invoices } = await query;

  // Revenue by customer type
  const revenueByCustomerType = invoices?.reduce((acc, inv) => {
    const customerType = inv.customers?.customer_type || 'Unknown';
    acc[customerType] = (acc[customerType] || 0) + (inv.total_amount || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  // Revenue by service type
  const revenueByServiceType = invoices?.reduce((acc, inv) => {
    const serviceType = inv.service_type || 'Unknown';
    acc[serviceType] = (acc[serviceType] || 0) + (inv.total_amount || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  // Revenue by technician
  const revenueByTechnician = invoices?.reduce((acc, inv) => {
    const techName = inv.technicians ? 
      '${inv.technicians.first_name} ${inv.technicians.last_name}' : 
      'Unassigned';
    acc[techName] = (acc[techName] || 0) + (inv.total_amount || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  // Top customers by revenue
  const customerRevenue = invoices?.reduce((acc, inv) => {
    const customerName = inv.customers?.company_name || 
      '${inv.customers?.first_name} ${inv.customers?.last_name}';
    const customerId = inv.customer_id;
    
    if (!acc[customerId]) {
      acc[customerId] = {
        name: customerName,
        total_revenue: 0,
        invoice_count: 0,
      };
    }
    
    acc[customerId].total_revenue += inv.total_amount || 0;
    acc[customerId].invoice_count += 1;
    
    return acc;
  }, {} as Record<string, unknown>) || {};

  const topCustomers = Object.values(customerRevenue)
    .sort((a: unknown, b: unknown) => b.total_revenue - a.total_revenue)
    .slice(0, 10);

  // Monthly revenue trend
  const monthlyRevenue = invoices?.reduce((acc, inv) => {
    const month = new Date(inv.created_at).toISOString().substr(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + (inv.total_amount || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    summary: {
      total_revenue: invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
      total_invoices: invoices?.length || 0,
      average_invoice_amount: invoices?.length ? 
        (invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) / invoices.length) : 0,
    },
    breakdowns: {
      by_customer_type: revenueByCustomerType,
      by_service_type: revenueByServiceType,
      by_technician: revenueByTechnician,
    },
    trends: {
      monthly_revenue: monthlyRevenue,
    },
    top_customers: topCustomers,
  };
}

// Customer Profitability Report
async function generateCustomerProfitabilityReport(organizationId: string, dateRange: unknown, filters: unknown = {}) {
  let query = supabase
    .from('hs.invoices')
    .select('
      total_amount,
      customer_id,
      customers!inner(
        first_name,
        last_name,
        company_name,
        customer_type,
        created_at
      )
    ')
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  const { data: invoices } = await query;

  // Calculate customer metrics
  const customerMetrics = invoices?.reduce((acc, inv) => {
    const customerId = inv.customer_id;
    const customerName = inv.customers?.company_name || 
      '${inv.customers?.first_name} ${inv.customers?.last_name}';
    
    if (!acc[customerId]) {
      acc[customerId] = {
        id: customerId,
        name: customerName,
        customer_type: inv.customers?.customer_type,
        customer_since: inv.customers?.created_at,
        total_revenue: 0,
        invoice_count: 0,
        average_invoice: 0,
      };
    }
    
    acc[customerId].total_revenue += inv.total_amount || 0;
    acc[customerId].invoice_count += 1;
    
    return acc;
  }, {} as Record<string, unknown>) || {};

  // Calculate averages and lifetime value
  Object.values(customerMetrics).forEach((customer: unknown) => {
    customer.average_invoice = customer.total_revenue / customer.invoice_count;
    
    // Estimate customer lifetime (days since first invoice)
    const daysSinceFirst = Math.floor(
      (Date.now() - new Date(customer.customer_since).getTime()) / (1000 * 60 * 60 * 24)
    );
    customer.days_as_customer = daysSinceFirst;
    
    // Simple LTV calculation (annual revenue projection)
    if (daysSinceFirst > 0) {
      const dailyRevenue = customer.total_revenue / daysSinceFirst;
      customer.estimated_annual_value = dailyRevenue * 365;
    } else {
      customer.estimated_annual_value = customer.total_revenue;
    }
  });

  // Sort by profitability
  const rankedCustomers = Object.values(customerMetrics)
    .sort((a: unknown, b: unknown) => b.total_revenue - a.total_revenue);

  // Customer segments
  const segments = {
    high_value: rankedCustomers.filter((c: unknown) => c.total_revenue > 5000),
    medium_value: rankedCustomers.filter((c: unknown) => c.total_revenue > 1000 && c.total_revenue <= 5000),
    low_value: rankedCustomers.filter((c: unknown) => c.total_revenue <= 1000),
  };

  return {
    summary: {
      total_customers: rankedCustomers.length,
      total_revenue: rankedCustomers.reduce((sum: number, c: unknown) => sum + c.total_revenue, 0),
      average_customer_value: rankedCustomers.length > 0 ? 
        rankedCustomers.reduce((sum: number, c: unknown) => sum + c.total_revenue, 0) / rankedCustomers.length : 0,
    },
    segments: {
      high_value: {
        count: segments.high_value.length,
        total_revenue: segments.high_value.reduce((sum: number, c: unknown) => sum + c.total_revenue, 0),
      },
      medium_value: {
        count: segments.medium_value.length,
        total_revenue: segments.medium_value.reduce((sum: number, c: unknown) => sum + c.total_revenue, 0),
      },
      low_value: {
        count: segments.low_value.length,
        total_revenue: segments.low_value.reduce((sum: number, c: unknown) => sum + c.total_revenue, 0),
      },
    },
    top_customers: rankedCustomers.slice(0, 20),
  };
}

// GET /api/v1/hs/financials/reports - Generate financial reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = FinancialReportQuerySchema.parse(Object.fromEntries(searchParams));

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

    const { current, previous, yearAgo } = getDateRanges(query.period, query.start_date, query.end_date);
    const filters = {
      customer_id: query.customer_id,
      technician_id: query.technician_id,
      service_types: query.service_types,
      customer_types: query.customer_types,
    };

    let reportData: unknown = {
      report_type: query.report_type,
      period: query.period,
      date_range: {
        from: current.start.toISOString(),
        to: current.end.toISOString(),
      },
      generated_at: new Date().toISOString(),
    };

    // Generate the requested report
    switch (query.report_type) {
      case 'profit_loss':
        reportData.data = await generateProfitLossReport(organizationId, current, filters);
        
        if (query.include_previous_period) {
          reportData.previous_period = await generateProfitLossReport(organizationId, previous, filters);
        }
        break;

      case 'revenue_analysis':
        reportData.data = await generateRevenueAnalysisReport(organizationId, current, filters);
        break;

      case 'customer_profitability':
        reportData.data = await generateCustomerProfitabilityReport(organizationId, current, filters);
        break;

      // Add other report types here...
      default:
        return NextResponse.json(
          { error: 'Report type '${query.report_type}' not implemented yet' },
          { status: 400 }
        );
    }

    return NextResponse.json(reportData);

  } catch (error) {
    console.error('GET /api/v1/hs/financials/reports error:', error);
    
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