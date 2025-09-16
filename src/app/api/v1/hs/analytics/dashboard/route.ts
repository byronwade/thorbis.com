import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Dashboard query schema
const DashboardQuerySchema = z.object({
  period: z.enum(['24h', '7d', '30d', '90d']).default('7d'),
  refresh: z.boolean().default(false),
  
  // Widget selection
  widgets: z.array(z.enum([
    'kpi_overview',
    'revenue_chart',
    'work_orders_status',
    'technician_performance',
    'customer_satisfaction',
    'recent_activities',
    'upcoming_appointments',
    'financial_summary',
    'service_requests',
    'inventory_alerts'
  ])).optional(),
  
  // Real-time options
  include_real_time: z.boolean().default(true),
  include_notifications: z.boolean().default(true),
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
function getDateRange(period: string) {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case '24h':
      start.setDate(now.getDate() - 1);
      break;
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
  }
  
  return { start, end: now };
}

// Helper function to get KPI overview
async function getKPIOverview(organizationId: string, dateRange: unknown) {
  const [workOrders, invoices, payments, customers] = await Promise.all([
    supabase
      .from('hs.work_orders')
      .select('id, status, estimate_total, created_at')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.start.toISOString()),
    
    supabase
      .from('hs.invoices')
      .select('id, total_amount, amount_paid, status, created_at')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.start.toISOString()),
    
    supabase
      .from('hs.invoice_payments')
      .select('id, payment_amount, payment_date')
      .eq('organization_id', organizationId)
      .gte('payment_date', dateRange.start.toISOString()),
    
    supabase
      .from('hs.customers')
      .select('id, created_at')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.start.toISOString()),
  ]);

  const totalRevenue = workOrders.data?.reduce((sum, wo) => sum + (wo.estimate_total || 0), 0) || 0;
  const totalPaid = payments.data?.reduce((sum, pay) => sum + (pay.payment_amount || 0), 0) || 0;
  const completedOrders = workOrders.data?.filter(wo => wo.status === 'completed').length || 0;

  return {
    total_work_orders: workOrders.data?.length || 0,
    completed_work_orders: completedOrders,
    completion_rate: workOrders.data?.length ? (completedOrders / workOrders.data.length) * 100 : 0,
    total_revenue: totalRevenue,
    total_collected: totalPaid,
    new_customers: customers.data?.length || 0,
    avg_order_value: workOrders.data?.length ? totalRevenue / workOrders.data.length : 0,
  };
}

// Helper function to get revenue chart data
async function getRevenueChart(organizationId: string, dateRange: unknown, period: string) {
  const { data: workOrders } = await supabase
    .from('hs.work_orders')
    .select('estimate_total, created_at, status')
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start.toISOString())
    .order('created_at');

  const { data: payments } = await supabase
    .from('hs.invoice_payments')
    .select('payment_amount, payment_date')
    .eq('organization_id', organizationId)
    .gte('payment_date', dateRange.start.toISOString())
    .order('payment_date');

  // Group by appropriate time interval
  const groupBy = period === '24h' ? 'hour' : period === '7d' ? 'day' : 'day';
  const revenueData = new Map();
  const paymentsData = new Map();

  // Process work orders
  workOrders?.forEach(wo => {
    const date = new Date(wo.created_at);
    let key: string;
    
    if (groupBy === 'hour') {
      key = '${date.toISOString().split('T')[0]} ${date.getHours()}:00';
    } else {
      key = date.toISOString().split('T')[0];
    }
    
    if (!revenueData.has(key)) {
      revenueData.set(key, { estimated: 0, completed: 0 });
    }
    
    const data = revenueData.get(key);
    data.estimated += wo.estimate_total || 0;
    if (wo.status === 'completed') {
      data.completed += wo.estimate_total || 0;
    }
  });

  // Process payments
  payments?.forEach(payment => {
    const date = new Date(payment.payment_date);
    let key: string;
    
    if (groupBy === 'hour') {
      key = '${date.toISOString().split('T')[0]} ${date.getHours()}:00';
    } else {
      key = date.toISOString().split('T')[0];
    }
    
    paymentsData.set(key, (paymentsData.get(key) || 0) + (payment.payment_amount || 0));
  });

  // Combine data
  const chartData = Array.from(revenueData.entries())
    .map(([date, revenue]) => ({
      date,
      estimated_revenue: revenue.estimated,
      completed_revenue: revenue.completed,
      payments_received: paymentsData.get(date) || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return chartData;
}

// Helper function to get work orders status
async function getWorkOrdersStatus(organizationId: string, dateRange: unknown) {
  const { data: workOrders } = await supabase
    .from('hs.work_orders')
    .select('id, status, priority, created_at, service_type')
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start.toISOString());

  const statusCounts = workOrders?.reduce((acc, wo) => {
    acc[wo.status] = (acc[wo.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const priorityCounts = workOrders?.reduce((acc, wo) => {
    acc[wo.priority || 'medium'] = (acc[wo.priority || 'medium'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const serviceTypeCounts = workOrders?.reduce((acc, wo) => {
    acc[wo.service_type || 'unknown'] = (acc[wo.service_type || 'unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    total: workOrders?.length || 0,
    by_status: statusCounts,
    by_priority: priorityCounts,
    by_service_type: serviceTypeCounts,
  };
}

// Helper function to get technician performance
async function getTechnicianPerformance(organizationId: string, dateRange: unknown) {
  const [technicians, workOrders] = await Promise.all([
    supabase
      .from('hs.technicians')
      .select('id, first_name, last_name, status')
      .eq('organization_id', organizationId)
      .eq('status', 'active'),
    
    supabase
      .from('hs.work_orders')
      .select('id, technician_id, status, estimate_total, created_at')
      .eq('organization_id', organizationId)
      .gte('created_at', dateRange.start.toISOString()),
  ]);

  const performanceData = technicians.data?.map(tech => {
    const techOrders = workOrders.data?.filter(wo => wo.technician_id === tech.id) || [];
    const completedOrders = techOrders.filter(wo => wo.status === 'completed');
    const revenue = techOrders.reduce((sum, wo) => sum + (wo.estimate_total || 0), 0);

    return {
      id: tech.id,
      name: '${tech.first_name} ${tech.last_name}',
      total_orders: techOrders.length,
      completed_orders: completedOrders.length,
      completion_rate: techOrders.length > 0 ? (completedOrders.length / techOrders.length) * 100 : 0,
      revenue: revenue,
    };
  }).sort((a, b) => b.revenue - a.revenue) || [];

  return {
    technicians: performanceData,
    total_technicians: technicians.data?.length || 0,
    avg_completion_rate: performanceData.reduce((sum, tech) => sum + tech.completion_rate, 0) / (performanceData.length || 1),
  };
}

// Helper function to get recent activities
async function getRecentActivities(organizationId: string) {
  const [workOrders, payments, customers] = await Promise.all([
    supabase
      .from('hs.work_orders')
      .select('
        id,
        work_order_number,
        status,
        created_at,
        customers(first_name, last_name, company_name)
      ')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10),
    
    supabase
      .from('hs.invoice_payments')
      .select('
        id,
        payment_amount,
        payment_date,
        invoices(invoice_number, customers(first_name, last_name, company_name))
      ')
      .eq('organization_id', organizationId)
      .order('payment_date', { ascending: false })
      .limit(10),
    
    supabase
      .from('hs.customers')
      .select('id, first_name, last_name, company_name, created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const activities = [
    ...(workOrders.data?.map(wo => ({
      type: 'work_order`,
      action: 'Work order #${wo.work_order_number} ${wo.status}',
      customer: wo.customers?.company_name || '${wo.customers?.first_name || ''} ${wo.customers?.last_name || ''}'.trim(),
      timestamp: wo.created_at,
    })) || []),
    
    ...(payments.data?.map(payment => ({
      type: 'payment`,
      action: 'Payment received: $${payment.payment_amount}',
      customer: payment.invoices?.customers?.company_name || 
        '${payment.invoices?.customers?.first_name || ''} ${payment.invoices?.customers?.last_name || ''}'.trim(),
      timestamp: payment.payment_date,
    })) || []),
    
    ...(customers.data?.map(customer => ({
      type: 'customer',
      action: 'New customer registered',
      customer: customer.company_name || '${customer.first_name || ''} ${customer.last_name || ''}'.trim(),
      timestamp: customer.created_at,
    })) || []),
  ];

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);
}

// Helper function to get upcoming appointments
async function getUpcomingAppointments(organizationId: string) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const { data: appointments } = await supabase
    .from('hs.work_orders')
    .select('
      id,
      work_order_number,
      scheduled_date,
      service_type,
      priority,
      customers(first_name, last_name, company_name, phone),
      technicians(first_name, last_name)
    ')
    .eq('organization_id', organizationId)
    .in('status', ['scheduled', 'dispatched'])
    .gte('scheduled_date', new Date().toISOString())
    .lte('scheduled_date', nextWeek.toISOString())
    .order('scheduled_date')
    .limit(20);

  return appointments?.map(apt => ({
    id: apt.id,
    work_order_number: apt.work_order_number,
    scheduled_date: apt.scheduled_date,
    service_type: apt.service_type,
    priority: apt.priority,
    customer: {
      name: apt.customers?.company_name || '${apt.customers?.first_name || ''} ${apt.customers?.last_name || ''}'.trim(),
      phone: apt.customers?.phone,
    },
    technician: apt.technicians ? '${apt.technicians.first_name} ${apt.technicians.last_name}' : 'Unassigned',
  })) || [];
}

// Helper function to get system notifications
async function getSystemNotifications(organizationId: string) {
  const notifications = [];
  
  // Check for overdue work orders
  const { data: overdueOrders } = await supabase
    .from('hs.work_orders')
    .select('id, work_order_number, scheduled_date')
    .eq('organization_id', organizationId)
    .in('status', ['scheduled', 'dispatched'])
    .lt('scheduled_date', new Date().toISOString())
    .limit(5);

  if (overdueOrders && overdueOrders.length > 0) {
    notifications.push({
      type: 'warning',
      title: 'Overdue Work Orders',
      message: '${overdueOrders.length} work orders are overdue',
      action: 'View overdue orders',
    });
  }

  // Check for unpaid invoices
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: unpaidInvoices } = await supabase
    .from('hs.invoices')
    .select('id, total_amount, amount_paid')
    .eq('organization_id', organizationId)
    .lt('due_date', new Date().toISOString())
    .neq('status', 'paid');

  const overdueAmount = unpaidInvoices?.reduce((sum, inv) => sum + ((inv.total_amount || 0) - (inv.amount_paid || 0)), 0) || 0;
  
  if (overdueAmount > 0) {
    notifications.push({
      type: 'info',
      title: 'Outstanding Invoices',
      message: '$${overdueAmount.toFixed(2)} in overdue invoices',
      action: 'View aging report',
    });
  }

  // Check for low inventory
  const { data: lowInventory } = await supabase
    .from('hs.inventory_items')
    .select('id, name, current_stock, reorder_point')
    .eq('organization_id', organizationId)
    .lt('current_stock', supabase.raw('reorder_point'))
    .limit(5);

  if (lowInventory && lowInventory.length > 0) {
    notifications.push({
      type: 'warning',
      title: 'Low Inventory',
      message: '${lowInventory.length} items are below reorder point',
      action: 'View inventory',
    });
  }

  return notifications;
}

// GET /api/v1/hs/analytics/dashboard - Get dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = DashboardQuerySchema.parse(Object.fromEntries(searchParams));

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

    const dateRange = getDateRange(query.period);
    const requestedWidgets = query.widgets || [
      'kpi_overview',
      'revenue_chart',
      'work_orders_status',
      'technician_performance',
      'recent_activities',
      'upcoming_appointments'
    ];

    const dashboardData: unknown = {
      period: query.period,
      date_range: {
        from: dateRange.start.toISOString(),
        to: dateRange.end.toISOString(),
      },
      generated_at: new Date().toISOString(),
      widgets: Record<string, unknown>,
    };

    // Get data for requested widgets in parallel
    const widgetPromises: Promise<void>[] = [];

    if (requestedWidgets.includes('kpi_overview')) {
      widgetPromises.push(
        getKPIOverview(organizationId, dateRange).then(data => {
          dashboardData.widgets.kpi_overview = data;
        })
      );
    }

    if (requestedWidgets.includes('revenue_chart')) {
      widgetPromises.push(
        getRevenueChart(organizationId, dateRange, query.period).then(data => {
          dashboardData.widgets.revenue_chart = data;
        })
      );
    }

    if (requestedWidgets.includes('work_orders_status')) {
      widgetPromises.push(
        getWorkOrdersStatus(organizationId, dateRange).then(data => {
          dashboardData.widgets.work_orders_status = data;
        })
      );
    }

    if (requestedWidgets.includes('technician_performance')) {
      widgetPromises.push(
        getTechnicianPerformance(organizationId, dateRange).then(data => {
          dashboardData.widgets.technician_performance = data;
        })
      );
    }

    if (requestedWidgets.includes('recent_activities')) {
      widgetPromises.push(
        getRecentActivities(organizationId).then(data => {
          dashboardData.widgets.recent_activities = data;
        })
      );
    }

    if (requestedWidgets.includes('upcoming_appointments')) {
      widgetPromises.push(
        getUpcomingAppointments(organizationId).then(data => {
          dashboardData.widgets.upcoming_appointments = data;
        })
      );
    }

    // Wait for all widget data to load
    await Promise.all(widgetPromises);

    // Get system notifications
    if (query.include_notifications) {
      dashboardData.notifications = await getSystemNotifications(organizationId);
    }

    // Add real-time status
    if (query.include_real_time) {
      const { data: activeUsers } = await supabase
        .from('user_mgmt.user_sessions')
        .select('id')
        .eq('organization_id', organizationId)
        .gte('last_activity', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Last 15 minutes

      dashboardData.real_time = {
        active_users: activeUsers?.length || 0,
        system_status: 'operational', // This would come from actual monitoring
        last_backup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        data_freshness: 'live', // Indicates data is current
      };
    }

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('GET /api/v1/hs/analytics/dashboard error:', error);
    
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