import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Analytics query schema
const AnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '6m', '1y', 'custom']).default('30d'),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  
  // Analytics modules to include
  include_overview: z.boolean().default(true),
  include_financial: z.boolean().default(true),
  include_operations: z.boolean().default(true),
  include_customers: z.boolean().default(true),
  include_technicians: z.boolean().default(true),
  include_marketing: z.boolean().default(true),
  include_trends: z.boolean().default(true),
  include_forecasting: z.boolean().default(false),
  
  // Filters
  customer_type: z.enum(['residential', 'commercial', 'property_management']).optional(),
  service_type: z.string().optional(),
  technician_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  region: z.string().optional(),
  
  // Grouping and comparison
  group_by: z.enum(['day', 'week', 'month', 'technician', 'service_type', 'customer_type']).optional(),
  compare_to_previous: z.boolean().default(true),
  
  // Output format
  format: z.enum(['summary', 'detailed', 'export']).default('summary'),
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
  let previousStart = new Date();
  let previousEnd = new Date();

  if (period === 'custom' && startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    const duration = end.getTime() - start.getTime();
    previousEnd = new Date(start);
    previousStart = new Date(start.getTime() - duration);
  } else {
    switch (period) {
      case '7d':
        start.setDate(now.getDate() - 7);
        previousStart.setDate(now.getDate() - 14);
        previousEnd.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        previousStart.setDate(now.getDate() - 60);
        previousEnd.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        previousStart.setDate(now.getDate() - 180);
        previousEnd.setDate(now.getDate() - 90);
        break;
      case '6m':
        start.setMonth(now.getMonth() - 6);
        previousStart.setMonth(now.getMonth() - 12);
        previousEnd.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        previousStart.setFullYear(now.getFullYear() - 2);
        previousEnd.setFullYear(now.getFullYear() - 1);
        break;
    }
  }

  return { 
    current: { start, end },
    previous: { start: previousStart, end: previousEnd }
  };
}

// Helper function to calculate percentage change
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Helper function to get overview analytics
async function getOverviewAnalytics(organizationId: string, dateRange: unknown, filters: unknown = {}) {
  // Get current period data
  const [workOrders, invoices, payments, customers, technicians] = await Promise.all([
    // Work orders
    supabase
      .from('hs.work_orders')
      .select('id, status, created_at, estimate_total, completion_date, priority, service_type')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.current.start.toISOString())
      .lte('created_at', dateRange.current.end.toISOString()),
    
    // Invoices
    supabase
      .from('hs.invoices')
      .select('id, total_amount, status, created_at, due_date, amount_paid')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.current.start.toISOString())
      .lte('created_at', dateRange.current.end.toISOString()),
    
    // Payments
    supabase
      .from('hs.invoice_payments')
      .select('id, payment_amount, payment_date')
      .eq('organization_id', organizationId)
      .gte('payment_date', dateRange.current.start.toISOString())
      .lte('payment_date', dateRange.current.end.toISOString()),
    
    // New customers
    supabase
      .from('hs.customers')
      .select('id, created_at, customer_type')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.current.start.toISOString())
      .lte('created_at', dateRange.current.end.toISOString()),
    
    // Active technicians
    supabase
      .from('hs.technicians')
      .select('id, status, created_at')
      .eq('organization_id', organizationId)
      .eq('status', 'active'),
  ]);

  // Calculate current metrics
  const currentMetrics = {
    work_orders: {
      total: workOrders.data?.length || 0,
      completed: workOrders.data?.filter(wo => wo.status === 'completed').length || 0,
      in_progress: workOrders.data?.filter(wo => wo.status === 'in_progress').length || 0,
      revenue: workOrders.data?.reduce((sum, wo) => sum + (wo.estimate_total || 0), 0) || 0,
    },
    invoices: {
      total: invoices.data?.length || 0,
      total_amount: invoices.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
      paid_amount: invoices.data?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0,
      outstanding: invoices.data?.reduce((sum, inv) => sum + ((inv.total_amount || 0) - (inv.amount_paid || 0)), 0) || 0,
    },
    payments: {
      total: payments.data?.length || 0,
      total_amount: payments.data?.reduce((sum, pay) => sum + (pay.payment_amount || 0), 0) || 0,
    },
    customers: {
      new_customers: customers.data?.length || 0,
      residential: customers.data?.filter(c => c.customer_type === 'residential').length || 0,
      commercial: customers.data?.filter(c => c.customer_type === 'commercial').length || 0,
    },
    technicians: {
      active: technicians.data?.length || 0,
    },
  };

  // Get previous period data for comparison
  const [prevWorkOrders, prevInvoices, prevPayments, prevCustomers] = await Promise.all([
    supabase
      .from('hs.work_orders')
      .select('id, status, estimate_total')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.previous.start.toISOString())
      .lte('created_at', dateRange.previous.end.toISOString()),
    
    supabase
      .from('hs.invoices')
      .select('id, total_amount, amount_paid')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.previous.start.toISOString())
      .lte('created_at', dateRange.previous.end.toISOString()),
    
    supabase
      .from('hs.invoice_payments')
      .select('id, payment_amount')
      .eq('organization_id', organizationId)
      .gte('payment_date', dateRange.previous.start.toISOString())
      .lte('payment_date', dateRange.previous.end.toISOString()),
    
    supabase
      .from('hs.customers')
      .select('id, customer_type')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.previous.start.toISOString())
      .lte('created_at', dateRange.previous.end.toISOString()),
  ]);

  const previousMetrics = {
    work_orders: {
      total: prevWorkOrders.data?.length || 0,
      revenue: prevWorkOrders.data?.reduce((sum, wo) => sum + (wo.estimate_total || 0), 0) || 0,
    },
    invoices: {
      total: prevInvoices.data?.length || 0,
      total_amount: prevInvoices.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
    },
    payments: {
      total_amount: prevPayments.data?.reduce((sum, pay) => sum + (pay.payment_amount || 0), 0) || 0,
    },
    customers: {
      new_customers: prevCustomers.data?.length || 0,
    },
  };

  // Calculate changes
  const changes = {
    work_orders_change: calculatePercentageChange(currentMetrics.work_orders.total, previousMetrics.work_orders.total),
    revenue_change: calculatePercentageChange(currentMetrics.work_orders.revenue, previousMetrics.work_orders.revenue),
    invoices_change: calculatePercentageChange(currentMetrics.invoices.total, previousMetrics.invoices.total),
    payments_change: calculatePercentageChange(currentMetrics.payments.total_amount, previousMetrics.payments.total_amount),
    customers_change: calculatePercentageChange(currentMetrics.customers.new_customers, previousMetrics.customers.new_customers),
  };

  return {
    current_metrics: currentMetrics,
    previous_metrics: previousMetrics,
    changes,
    key_insights: [
      {
        metric: 'Work Order Completion Rate',
        value: currentMetrics.work_orders.total > 0 ? 
          ((currentMetrics.work_orders.completed / currentMetrics.work_orders.total) * 100).toFixed(1) + '%' : '0%',
        trend: changes.work_orders_change >= 0 ? 'positive' : 'negative',
      },
      {
        metric: 'Invoice Collection Rate',
        value: currentMetrics.invoices.total_amount > 0 ?
          ((currentMetrics.invoices.paid_amount / currentMetrics.invoices.total_amount) * 100).toFixed(1) + '%' : '0%',
        trend: 'neutral',
      },
      {
        metric: 'Average Work Order Value',
        value: currentMetrics.work_orders.total > 0 ?
          '$' + (currentMetrics.work_orders.revenue / currentMetrics.work_orders.total).toFixed(0) : '$0',
        trend: changes.revenue_change >= 0 ? 'positive' : 'negative',
      },
    ],
  };
}

// Helper function to get financial analytics
async function getFinancialAnalytics(organizationId: string, dateRange: unknown, filters: unknown = {}) {
  // Get detailed financial data
  const [invoices, payments, expenses, workOrders] = await Promise.all([
    // Invoices with customer data
    supabase
      .from('hs.invoices')
      .select('
        id, 
        total_amount, 
        amount_paid, 
        status, 
        created_at, 
        due_date,
        customers!inner(customer_type, first_name, last_name, company_name)
      ')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.current.start.toISOString())
      .lte('created_at', dateRange.current.end.toISOString()),
    
    // Payments
    supabase
      .from('hs.invoice_payments')
      .select('id, payment_amount, payment_date, payment_method')
      .eq('organization_id', organizationId)
      .gte('payment_date', dateRange.current.start.toISOString())
      .lte('payment_date', dateRange.current.end.toISOString()),
    
    // Business expenses
    supabase
      .from('hs.business_expenses')
      .select('id, amount, category, expense_date')
      .eq('organization_id', organizationId)
      .gte('expense_date', dateRange.current.start.toISOString())
      .lte('expense_date', dateRange.current.end.toISOString()),
    
    // Work orders for revenue analysis
    supabase
      .from('hs.work_orders')
      .select('
        id, 
        estimate_total, 
        service_type, 
        status, 
        created_at,
        customers!inner(customer_type)
      ')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.current.start.toISOString())
      .lte('created_at', dateRange.current.end.toISOString()),
  ]);

  const totalRevenue = invoices.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
  const totalPaid = invoices.data?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0;
  const totalOutstanding = totalRevenue - totalPaid;
  const totalExpenses = expenses.data?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
  const grossProfit = totalRevenue - totalExpenses;

  // Revenue by customer type
  const revenueByCustomerType = workOrders.data?.reduce((acc, wo) => {
    const customerType = wo.customers?.customer_type || 'unknown';
    acc[customerType] = (acc[customerType] || 0) + (wo.estimate_total || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  // Revenue by service type
  const revenueByServiceType = workOrders.data?.reduce((acc, wo) => {
    const serviceType = wo.service_type || 'unknown';
    acc[serviceType] = (acc[serviceType] || 0) + (wo.estimate_total || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  // Aging report
  const now = new Date();
  const agingBuckets = {
    current: 0,
    '1_30_days': 0,
    '31_60_days': 0,
    '61_90_days': 0,
    'over_90_days': 0,
  };

  invoices.data?.forEach(invoice => {
    const outstanding = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
    if (outstanding > 0 && invoice.due_date) {
      const daysPastDue = Math.floor((now.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysPastDue <= 0) {
        agingBuckets.current += outstanding;
      } else if (daysPastDue <= 30) {
        agingBuckets['1_30_days'] += outstanding;
      } else if (daysPastDue <= 60) {
        agingBuckets['31_60_days'] += outstanding;
      } else if (daysPastDue <= 90) {
        agingBuckets['61_90_days'] += outstanding;
      } else {
        agingBuckets.over_90_days += outstanding;
      }
    }
  });

  // Cash flow analysis
  const dailyCashFlow = {};
  
  // Add payments (inflow)
  payments.data?.forEach(payment => {
    const date = new Date(payment.payment_date).toISOString().split('T')[0];
    if (!dailyCashFlow[date]) dailyCashFlow[date] = { inflow: 0, outflow: 0 };
    dailyCashFlow[date].inflow += payment.payment_amount || 0;
  });
  
  // Add expenses (outflow)
  expenses.data?.forEach(expense => {
    const date = new Date(expense.expense_date).toISOString().split('T')[0];
    if (!dailyCashFlow[date]) dailyCashFlow[date] = { inflow: 0, outflow: 0 };
    dailyCashFlow[date].outflow += expense.amount || 0;
  });

  const cashFlowTimeline = Object.entries(dailyCashFlow)
    .map(([date, flow]: [string, any]) => ({
      date,
      inflow: flow.inflow,
      outflow: flow.outflow,
      net_flow: flow.inflow - flow.outflow,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      total_revenue: totalRevenue,
      total_paid: totalPaid,
      total_outstanding: totalOutstanding,
      total_expenses: totalExpenses,
      gross_profit: grossProfit,
      profit_margin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0,
      collection_rate: totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100) : 0,
    },
    revenue_breakdown: {
      by_customer_type: revenueByCustomerType,
      by_service_type: revenueByServiceType,
    },
    aging_report: agingBuckets,
    cash_flow: {
      timeline: cashFlowTimeline,
      total_inflow: cashFlowTimeline.reduce((sum, day) => sum + day.inflow, 0),
      total_outflow: cashFlowTimeline.reduce((sum, day) => sum + day.outflow, 0),
      net_cash_flow: cashFlowTimeline.reduce((sum, day) => sum + day.net_flow, 0),
    },
    payment_methods: payments.data?.reduce((acc, payment) => {
      const method = payment.payment_method || 'unknown';
      acc[method] = (acc[method] || 0) + (payment.payment_amount || 0);
      return acc;
    }, {} as Record<string, number>) || {},
  };
}

// Helper function to get operational analytics
async function getOperationalAnalytics(organizationId: string, dateRange: unknown, filters: unknown = {}) {
  // Get operational data
  const [workOrders, technicians, schedules, inventory] = await Promise.all([
    // Work orders with technician and customer data
    supabase
      .from('hs.work_orders')
      .select('
        id,
        status,
        priority,
        service_type,
        created_at,
        scheduled_date,
        completion_date,
        estimate_total,
        technicians(id, first_name, last_name),
        customers(customer_type, city, state_province)
      ')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.current.start.toISOString())
      .lte('created_at', dateRange.current.end.toISOString()),
    
    // Technician performance data
    supabase
      .from('hs.technicians')
      .select('
        id,
        first_name,
        last_name,
        status,
        skills,
        created_at
      ')
      .eq('organization_id', organizationId),
    
    // Schedule efficiency
    supabase
      .from('hs.technician_schedules')
      .select('
        id,
        technician_id,
        work_order_id,
        scheduled_date,
        start_time,
        end_time,
        status
      ')
      .eq('organization_id', organizationId)
      .gte('scheduled_date', dateRange.current.start.toISOString())
      .lte('scheduled_date', dateRange.current.end.toISOString()),
    
    // Inventory usage
    supabase
      .from('hs.inventory_transactions')
      .select('
        id,
        inventory_item_id,
        transaction_type,
        quantity,
        total_cost,
        transaction_date,
        inventory_items(name, category)
      ')
      .eq('organization_id', organizationId)
      .gte('transaction_date', dateRange.current.start.toISOString())
      .lte('transaction_date', dateRange.current.end.toISOString()),
  ]);

  // Calculate work order metrics
  const workOrderMetrics = {
    total: workOrders.data?.length || 0,
    completed: workOrders.data?.filter(wo => wo.status === 'completed').length || 0,
    in_progress: workOrders.data?.filter(wo => wo.status === 'in_progress').length || 0,
    scheduled: workOrders.data?.filter(wo => wo.status === 'scheduled').length || 0,
    cancelled: workOrders.data?.filter(wo => wo.status === 'cancelled').length || 0,
  };

  workOrderMetrics['completion_rate'] = workOrderMetrics.total > 0 ? 
    (workOrderMetrics.completed / workOrderMetrics.total) * 100 : 0;

  // Calculate average completion time
  const completedOrders = workOrders.data?.filter(wo => wo.completion_date && wo.created_at) || [];
  const avgCompletionTime = completedOrders.length > 0 ?
    completedOrders.reduce((sum, wo) => {
      const duration = new Date(wo.completion_date!).getTime() - new Date(wo.created_at).getTime();
      return sum + duration;
    }, 0) / completedOrders.length / (1000 * 60 * 60 * 24) : 0; // Convert to days

  // Service type performance
  const serviceTypeMetrics = workOrders.data?.reduce((acc, wo) => {
    const serviceType = wo.service_type || 'unknown';
    if (!acc[serviceType]) {
      acc[serviceType] = {
        count: 0,
        revenue: 0,
        completed: 0,
        avg_value: 0,
      };
    }
    acc[serviceType].count++;
    acc[serviceType].revenue += wo.estimate_total || 0;
    if (wo.status === 'completed') acc[serviceType].completed++;
    return acc;
  }, {} as Record<string, unknown>) || {};

  // Calculate averages for service types
  Object.keys(serviceTypeMetrics).forEach(serviceType => {
    const metrics = serviceTypeMetrics[serviceType];
    metrics.avg_value = metrics.count > 0 ? metrics.revenue / metrics.count : 0;
    metrics.completion_rate = metrics.count > 0 ? (metrics.completed / metrics.count) * 100 : 0;
  });

  // Technician performance
  const technicianPerformance = technicians.data?.map(tech => {
    const techWorkOrders = workOrders.data?.filter(wo => wo.technicians?.id === tech.id) || [];
    const completedOrders = techWorkOrders.filter(wo => wo.status === 'completed');
    const totalRevenue = techWorkOrders.reduce((sum, wo) => sum + (wo.estimate_total || 0), 0);

    return {
      id: tech.id,
      name: '${tech.first_name} ${tech.last_name}',
      status: tech.status,
      skills: tech.skills,
      work_orders_assigned: techWorkOrders.length,
      work_orders_completed: completedOrders.length,
      completion_rate: techWorkOrders.length > 0 ? (completedOrders.length / techWorkOrders.length) * 100 : 0,
      total_revenue: totalRevenue,
      avg_order_value: techWorkOrders.length > 0 ? totalRevenue / techWorkOrders.length : 0,
    };
  }) || [];

  // Schedule efficiency
  const scheduleMetrics = {
    total_appointments: schedules.data?.length || 0,
    completed_appointments: schedules.data?.filter(s => s.status === 'completed').length || 0,
    missed_appointments: schedules.data?.filter(s => s.status === 'no_show').length || 0,
    cancelled_appointments: schedules.data?.filter(s => s.status === 'cancelled').length || 0,
  };

  scheduleMetrics['utilization_rate'] = scheduleMetrics.total_appointments > 0 ?
    (scheduleMetrics.completed_appointments / scheduleMetrics.total_appointments) * 100 : 0;

  // Inventory metrics
  const inventoryUsage = inventory.data?.reduce((acc, transaction) => {
    const category = transaction.inventory_items?.category || 'unknown';
    if (!acc[category]) {
      acc[category] = {
        items_used: 0,
        total_cost: 0,
        transactions: 0,
      };
    }
    
    if (transaction.transaction_type === 'use') {
      acc[category].items_used += transaction.quantity || 0;
      acc[category].total_cost += transaction.total_cost || 0;
      acc[category].transactions++;
    }
    
    return acc;
  }, {} as Record<string, unknown>) || {};

  return {
    work_orders: workOrderMetrics,
    service_types: serviceTypeMetrics,
    technicians: {
      total_active: technicians.data?.filter(t => t.status === 'active').length || 0,
      performance: technicianPerformance.sort((a, b) => b.total_revenue - a.total_revenue),
      top_performer: technicianPerformance.reduce((top, current) => 
        current.total_revenue > (top?.total_revenue || 0) ? current : top, null),
    },
    schedule: scheduleMetrics,
    inventory: inventoryUsage,
    efficiency_metrics: {
      avg_completion_time_days: avgCompletionTime,
      work_order_completion_rate: workOrderMetrics.completion_rate,
      schedule_utilization_rate: scheduleMetrics.utilization_rate,
      technician_productivity: technicianPerformance.reduce((sum, tech) => 
        sum + tech.completion_rate, 0) / (technicianPerformance.length || 1),
    },
  };
}

// GET /api/v1/hs/analytics - Get comprehensive business analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = AnalyticsQuerySchema.parse(Object.fromEntries(searchParams));

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
      customer_type: query.customer_type,
      service_type: query.service_type,
      technician_id: query.technician_id,
      priority: query.priority,
      region: query.region,
    };

    const analyticsData: unknown = {
      period: query.period,
      date_range: {
        current: {
          from: dateRange.current.start.toISOString(),
          to: dateRange.current.end.toISOString(),
        },
        previous: {
          from: dateRange.previous.start.toISOString(),
          to: dateRange.previous.end.toISOString(),
        }
      },
      filters,
      generated_at: new Date().toISOString(),
    };

    // Get overview analytics
    if (query.include_overview) {
      analyticsData.overview = await getOverviewAnalytics(organizationId, dateRange, filters);
    }

    // Get financial analytics
    if (query.include_financial) {
      analyticsData.financial = await getFinancialAnalytics(organizationId, dateRange, filters);
    }

    // Get operational analytics
    if (query.include_operations) {
      analyticsData.operations = await getOperationalAnalytics(organizationId, dateRange, filters);
    }

    // Get customer analytics
    if (query.include_customers) {
      const { data: customers } = await supabase
        .from('hs.customers')
        .select('
          id,
          customer_type,
          created_at,
          customer_status,
          city,
          state_province
        ')
        .eq('organization_id', organizationId)
        .gte('created_at', dateRange.current.start.toISOString())
        .lte('created_at', dateRange.current.end.toISOString());

      // Get customer work orders for lifetime value
      const { data: customerWorkOrders } = await supabase
        .from('hs.work_orders')
        .select('customer_id, estimate_total, status')
        .eq('organization_id', organizationId)
        .in('customer_id', customers?.map(c => c.id) || []);

      const customerAnalytics = {
        new_customers: customers?.length || 0,
        by_type: customers?.reduce((acc, customer) => {
          const type = customer.customer_type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        by_region: customers?.reduce((acc, customer) => {
          const region = '${customer.city || ''}, ${customer.state_province || ''}'.trim();
          if (region !== ',') {
            acc[region] = (acc[region] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>) || {},
        lifetime_value: customerWorkOrders?.reduce((acc, wo) => {
          const customerId = wo.customer_id;
          acc[customerId] = (acc[customerId] || 0) + (wo.estimate_total || 0);
          return acc;
        }, {} as Record<string, number>) || {},
      };

      analyticsData.customers = customerAnalytics;
    }

    // Generate business insights
    const insights = [];

    // Revenue insights
    if (analyticsData.financial) {
      const profitMargin = analyticsData.financial.summary.profit_margin;
      if (profitMargin < 20) {
        insights.push({
          type: 'warning',
          category: 'financial',
          title: 'Low Profit Margin',
          description: 'Current profit margin is ${profitMargin.toFixed(1)}%, below recommended 20%',
          recommendation: 'Review pricing strategy and operational efficiency',
          impact: 'high',
        });
      }
    }

    // Operational insights
    if (analyticsData.operations) {
      const completionRate = analyticsData.operations.efficiency_metrics.work_order_completion_rate;
      if (completionRate < 85) {
        insights.push({
          type: 'improvement',
          category: 'operations',
          title: 'Work Order Completion Rate',
          description: '${completionRate.toFixed(1)}% completion rate is below optimal',
          recommendation: 'Investigate workflow bottlenecks and resource allocation',
          impact: 'medium',
        });
      }
    }

    // Growth insights
    if (analyticsData.overview) {
      const revenueChange = analyticsData.overview.changes.revenue_change;
      if (revenueChange > 20) {
        insights.push({
          type: 'positive',
          category: 'growth',
          title: 'Strong Revenue Growth',
          description: 'Revenue has grown ${revenueChange.toFixed(1)}% compared to previous period',
          recommendation: 'Consider scaling operations to meet growing demand',
          impact: 'high',
        });
      }
    }

    analyticsData.insights = insights;

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('GET /api/v1/hs/analytics error:', error);
    
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