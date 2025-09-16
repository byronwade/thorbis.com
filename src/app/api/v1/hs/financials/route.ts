import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Financial overview query schema
const FinancialQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']).default('month'),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  
  // Metrics to include
  include_revenue: z.boolean().default(true),
  include_expenses: z.boolean().default(true),
  include_profit: z.boolean().default(true),
  include_cashflow: z.boolean().default(true),
  include_aging: z.boolean().default(true),
  include_trends: z.boolean().default(true),
  
  // Grouping and filtering
  group_by: z.enum(['day', 'week', 'month', 'technician', 'service_type', 'customer_type']).optional(),
  customer_id: z.string().uuid().optional(),
  technician_id: z.string().uuid().optional(),
  service_type: z.string().optional(),
  
  // Comparison periods
  include_comparisons: z.boolean().default(true),
  compare_previous_period: z.boolean().default(true),
  compare_previous_year: z.boolean().default(false),
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
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
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

// Helper function to calculate financial metrics
async function calculateFinancialMetrics(organizationId: string, dateRange: unknown, filters: unknown = {}) {
  let invoiceQuery = supabase
    .from('hs.invoices')
    .select('
      id,
      invoice_number,
      total_amount,
      amount_paid,
      status,
      due_date,
      created_at,
      customer_id,
      work_order_id,
      technician_id,
      service_type,
      customers!inner(customer_type)
    ')
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  // Apply filters
  if (filters.customer_id) {
    invoiceQuery = invoiceQuery.eq('customer_id', filters.customer_id);
  }
  if (filters.technician_id) {
    invoiceQuery = invoiceQuery.eq('technician_id', filters.technician_id);
  }
  if (filters.service_type) {
    invoiceQuery = invoiceQuery.eq('service_type', filters.service_type);
  }

  const { data: invoices } = await invoiceQuery;

  // Get payments for the same period
  const paymentQuery = supabase
    .from('hs.invoice_payments')
    .select('
      id,
      payment_amount,
      payment_method,
      payment_date,
      invoices!inner(
        customer_id,
        technician_id,
        service_type,
        customers!inner(customer_type)
      )
    ')
    .eq('organization_id', organizationId)
    .gte('payment_date', dateRange.start.toISOString())
    .lte('payment_date', dateRange.end.toISOString());

  const { data: payments } = await paymentQuery;

  // Calculate revenue metrics
  const totalInvoiced = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
  const totalPaid = payments?.reduce((sum, pay) => sum + (pay.payment_amount || 0), 0) || 0;
  const totalOutstanding = invoices?.reduce((sum, inv) => sum + ((inv.total_amount || 0) - (inv.amount_paid || 0)), 0) || 0;

  // Calculate averages
  const averageInvoiceAmount = invoices?.length ? totalInvoiced / invoices.length : 0;
  const averagePaymentAmount = payments?.length ? totalPaid / payments.length : 0;

  // Status breakdown
  const invoiceStatusBreakdown = invoices?.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Customer type revenue
  const customerTypeRevenue = invoices?.reduce((acc, inv) => {
    const customerType = inv.customers?.customer_type || 'unknown';
    acc[customerType] = (acc[customerType] || 0) + (inv.total_amount || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  // Payment method breakdown
  const paymentMethodBreakdown = payments?.reduce((acc, pay) => {
    acc[pay.payment_method] = (acc[pay.payment_method] || 0) + (pay.payment_amount || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    revenue: {
      total_invoiced: totalInvoiced,
      total_collected: totalPaid,
      total_outstanding: totalOutstanding,
      collection_rate: totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0,
      average_invoice_amount: averageInvoiceAmount,
      average_payment_amount: averagePaymentAmount,
      invoice_count: invoices?.length || 0,
      payment_count: payments?.length || 0,
    },
    breakdowns: {
      invoice_status: invoiceStatusBreakdown,
      customer_type_revenue: customerTypeRevenue,
      payment_methods: paymentMethodBreakdown,
    },
  };
}

// Helper function to calculate aging report
async function calculateAgingReport(organizationId: string, filters: unknown = {}) {
  const now = new Date();
  
  let query = supabase
    .from('hs.invoices')
    .select('
      id,
      invoice_number,
      total_amount,
      amount_paid,
      due_date,
      created_at,
      customers!inner(
        id,
        first_name,
        last_name,
        company_name,
        customer_type
      )
    ')
    .eq('organization_id', organizationId)
    .neq('status', 'paid')
    .gt('total_amount - amount_paid', 0); // Only unpaid balances

  if (filters.customer_id) {
    query = query.eq('customer_id', filters.customer_id);
  }

  const { data: unpaidInvoices } = await query;

  const agingBuckets = {
    current: 0,        // 0-30 days
    thirty_days: 0,    // 31-60 days
    sixty_days: 0,     // 61-90 days
    ninety_days: 0,    // 91-120 days
    over_120: 0,       // 120+ days
  };

  const detailedAging: unknown[] = [];

  unpaidInvoices?.forEach(invoice => {
    const outstandingAmount = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
    const dueDate = new Date(invoice.due_date);
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    let bucket = 'current';
    if (daysOverdue > 120) bucket = 'over_120';
    else if (daysOverdue > 90) bucket = 'ninety_days';
    else if (daysOverdue > 60) bucket = 'sixty_days';
    else if (daysOverdue > 30) bucket = 'thirty_days';

    agingBuckets[bucket as keyof typeof agingBuckets] += outstandingAmount;

    detailedAging.push({
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      customer_name: invoice.customers?.company_name || '${invoice.customers?.first_name} ${invoice.customers?.last_name}',
      customer_type: invoice.customers?.customer_type,
      outstanding_amount: outstandingAmount,
      due_date: invoice.due_date,
      days_overdue: Math.max(0, daysOverdue),
      aging_bucket: bucket,
    });
  });

  return {
    buckets: agingBuckets,
    total_outstanding: Object.values(agingBuckets).reduce((sum, amount) => sum + amount, 0),
    detailed_aging: detailedAging.sort((a, b) => b.days_overdue - a.days_overdue),
  };
}

// GET /api/v1/hs/financials - Get comprehensive financial overview
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = FinancialQuerySchema.parse(Object.fromEntries(searchParams));

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
      service_type: query.service_type,
    };

    const financialData: unknown = {
      period: query.period,
      date_range: {
        from: current.start.toISOString(),
        to: current.end.toISOString(),
      },
    };

    // Get current period metrics
    if (query.include_revenue || query.include_profit) {
      const currentMetrics = await calculateFinancialMetrics(organizationId, current, filters);
      financialData.current_period = currentMetrics;

      // Get comparison data if requested
      if (query.include_comparisons) {
        const comparisons: unknown = {};

        if (query.compare_previous_period) {
          const previousMetrics = await calculateFinancialMetrics(organizationId, previous, filters);
          comparisons.previous_period = {
            ...previousMetrics,
            changes: {
              revenue_change: currentMetrics.revenue.total_invoiced - previousMetrics.revenue.total_invoiced,
              revenue_change_percent: previousMetrics.revenue.total_invoiced > 0 ? 
                ((currentMetrics.revenue.total_invoiced - previousMetrics.revenue.total_invoiced) / previousMetrics.revenue.total_invoiced) * 100 : 0,
              collection_change: currentMetrics.revenue.total_collected - previousMetrics.revenue.total_collected,
              collection_change_percent: previousMetrics.revenue.total_collected > 0 ? 
                ((currentMetrics.revenue.total_collected - previousMetrics.revenue.total_collected) / previousMetrics.revenue.total_collected) * 100 : 0,
            },
          };
        }

        if (query.compare_previous_year) {
          const yearAgoMetrics = await calculateFinancialMetrics(organizationId, yearAgo, filters);
          comparisons.year_ago = {
            ...yearAgoMetrics,
            changes: {
              revenue_change: currentMetrics.revenue.total_invoiced - yearAgoMetrics.revenue.total_invoiced,
              revenue_change_percent: yearAgoMetrics.revenue.total_invoiced > 0 ? 
                ((currentMetrics.revenue.total_invoiced - yearAgoMetrics.revenue.total_invoiced) / yearAgoMetrics.revenue.total_invoiced) * 100 : 0,
            },
          };
        }

        financialData.comparisons = comparisons;
      }
    }

    // Get aging report
    if (query.include_aging) {
      const agingReport = await calculateAgingReport(organizationId, filters);
      financialData.aging_report = agingReport;
    }

    // Get cash flow analysis
    if (query.include_cashflow) {
      // Get daily cash flow for trend analysis
      const { data: dailyCashFlow } = await supabase
        .from('hs.invoice_payments')
        .select('
          payment_date,
          payment_amount,
          payment_method
        ')
        .eq('organization_id', organizationId)
        .gte('payment_date', current.start.toISOString())
        .lte('payment_date', current.end.toISOString())
        .order('payment_date');

      // Group by day
      const dailyTotals = dailyCashFlow?.reduce((acc, payment) => {
        const date = payment.payment_date.split('T')[0];
        acc[date] = (acc[date] || 0) + payment.payment_amount;
        return acc;
      }, {} as Record<string, number>) || {};

      financialData.cash_flow = {
        daily_totals: dailyTotals,
        total_inflow: Object.values(dailyTotals).reduce((sum, amount) => sum + amount, 0),
        average_daily: Object.values(dailyTotals).length > 0 ? 
          Object.values(dailyTotals).reduce((sum, amount) => sum + amount, 0) / Object.values(dailyTotals).length : 0,
        payment_frequency: dailyCashFlow?.length || 0,
      };
    }

    // Get key performance indicators
    financialData.kpis = {
      total_customers: await supabase
        .from('hs.customers')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('customer_status', 'active'),
      
      active_invoices: await supabase
        .from('hs.invoices')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .in('status', ['sent', 'viewed', 'partial', 'overdue']),
      
      overdue_amount: financialData.aging_report ? 
        financialData.aging_report.buckets.thirty_days + 
        financialData.aging_report.buckets.sixty_days + 
        financialData.aging_report.buckets.ninety_days + 
        financialData.aging_report.buckets.over_120 : 0,
    };

    return NextResponse.json(financialData);

  } catch (error) {
    console.error('GET /api/v1/hs/financials error:', error);
    
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