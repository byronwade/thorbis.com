import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Report generation schema
const ReportRequestSchema = z.object({
  report_type: z.enum([
    'financial_summary',
    'technician_performance', 
    'customer_analysis',
    'service_type_analysis',
    'operational_efficiency',
    'revenue_forecast',
    'inventory_usage',
    'marketing_roi',
    'custom'
  ]),
  
  // Time period
  period: z.enum(['7d', '30d', '90d', '6m', '1y', 'custom']).default('30d'),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  
  // Report format and delivery
  format: z.enum(['json', 'pdf', 'csv', 'excel']).default('json'),
  delivery_method: z.enum(['api', 'email', 'download']).default('api'),
  
  // Filters and parameters
  filters: z.object({
    customer_type: z.enum(['residential', 'commercial', 'property_management']).optional(),
    service_type: z.string().optional(),
    technician_id: z.string().uuid().optional(),
    customer_id: z.string().uuid().optional(),
    region: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    status: z.string().optional(),
  }).optional(),
  
  // Custom report parameters
  custom_fields: z.array(z.string()).optional(),
  grouping: z.enum(['daily', 'weekly', 'monthly', 'technician', 'service_type', 'customer_type']).optional(),
  
  // Scheduling
  schedule: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    recipients: z.array(z.string().email()).optional(),
  }).optional(),
  
  // Report metadata
  title: z.string().optional(),
  description: z.string().optional(),
});

// Report query schema
const ReportQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  report_type: z.enum([
    'financial_summary',
    'technician_performance', 
    'customer_analysis',
    'service_type_analysis',
    'operational_efficiency',
    'revenue_forecast',
    'inventory_usage',
    'marketing_roi',
    'custom'
  ]).optional(),
  status: z.enum(['generating', 'completed', 'failed', 'scheduled']).optional(),
  created_by: z.string().uuid().optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  sort: z.enum(['created_at', 'report_type', 'status', 'title']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
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

// Helper function to generate financial summary report
async function generateFinancialSummaryReport(organizationId: string, params: unknown) {
  const { start_date, end_date, filters = {} } = params;
  
  // Get financial data
  const [invoices, payments, expenses, workOrders] = await Promise.all([
    supabase
      .from('hs.invoices')
      .select('
        id,
        invoice_number,
        total_amount,
        amount_paid,
        status,
        created_at,
        due_date,
        customers!inner(id, first_name, last_name, company_name, customer_type)
      ')
      .eq('organization_id', organizationId)
      .gte('created_at', start_date)
      .lte('created_at', end_date),
    
    supabase
      .from('hs.invoice_payments')
      .select('id, payment_amount, payment_date, payment_method, invoices!inner(invoice_number)')
      .eq('organization_id', organizationId)
      .gte('payment_date', start_date)
      .lte('payment_date', end_date),
    
    supabase
      .from('hs.business_expenses')
      .select('id, amount, category, description, expense_date')
      .eq('organization_id', organizationId)
      .gte('expense_date', start_date)
      .lte('expense_date', end_date),
    
    supabase
      .from('hs.work_orders')
      .select('
        id,
        work_order_number,
        estimate_total,
        service_type,
        status,
        created_at,
        customers!inner(customer_type)
      ')
      .eq('organization_id', organizationId)
      .gte('created_at', start_date)
      .lte('created_at', end_date),
  ]);

  // Calculate metrics
  const totalRevenue = invoices.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
  const totalPaid = payments.data?.reduce((sum, pay) => sum + (pay.payment_amount || 0), 0) || 0;
  const totalExpenses = expenses.data?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
  const grossProfit = totalRevenue - totalExpenses;

  // Revenue breakdown
  const revenueByCustomerType = workOrders.data?.reduce((acc, wo) => {
    const type = wo.customers?.customer_type || 'unknown';
    acc[type] = (acc[type] || 0) + (wo.estimate_total || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  const revenueByServiceType = workOrders.data?.reduce((acc, wo) => {
    const type = wo.service_type || 'unknown';
    acc[type] = (acc[type] || 0) + (wo.estimate_total || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  // Top customers by revenue
  const customerRevenue = invoices.data?.reduce((acc, inv) => {
    const customerId = inv.customers?.id;
    const customerName = inv.customers?.company_name || 
      '${inv.customers?.first_name || ''} ${inv.customers?.last_name || ''}'.trim();
    
    if (customerId && customerName) {
      acc[customerName] = (acc[customerName] || 0) + (inv.total_amount || 0);
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const topCustomers = Object.entries(customerRevenue)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, revenue]) => ({ name, revenue }));

  return {
    summary: {
      total_revenue: totalRevenue,
      total_paid: totalPaid,
      total_outstanding: totalRevenue - totalPaid,
      total_expenses: totalExpenses,
      gross_profit: grossProfit,
      profit_margin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      collection_rate: totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0,
    },
    breakdowns: {
      revenue_by_customer_type: revenueByCustomerType,
      revenue_by_service_type: revenueByServiceType,
      expenses_by_category: expenses.data?.reduce((acc, exp) => {
        const category = exp.category || 'unknown';
        acc[category] = (acc[category] || 0) + (exp.amount || 0);
        return acc;
      }, {} as Record<string, number>) || {},
    },
    top_customers: topCustomers,
    invoice_count: invoices.data?.length || 0,
    payment_count: payments.data?.length || 0,
    avg_invoice_value: invoices.data?.length ? totalRevenue / invoices.data.length : 0,
  };
}

// Helper function to generate technician performance report
async function generateTechnicianPerformanceReport(organizationId: string, params: unknown) {
  const { start_date, end_date, filters = {} } = params;
  
  // Get technician data
  const { data: technicians } = await supabase
    .from('hs.technicians')
    .select('
      id,
      first_name,
      last_name,
      email,
      phone,
      skills,
      status,
      hourly_rate,
      created_at
    ')
    .eq('organization_id', organizationId);

  // Get work orders for performance analysis
  const { data: workOrders } = await supabase
    .from('hs.work_orders')
    .select('
      id,
      technician_id,
      status,
      priority,
      service_type,
      estimate_total,
      created_at,
      scheduled_date,
      completion_date,
      customers!inner(customer_type, city, state_province)
    ')
    .eq('organization_id', organizationId)
    .gte('created_at', start_date)
    .lte('created_at', end_date);

  // Calculate performance metrics for each technician
  const performanceData = technicians?.map(tech => {
    const techWorkOrders = workOrders?.filter(wo => wo.technician_id === tech.id) || [];
    const completedOrders = techWorkOrders.filter(wo => wo.status === 'completed');
    const totalRevenue = techWorkOrders.reduce((sum, wo) => sum + (wo.estimate_total || 0), 0);
    
    // Calculate average completion time
    const completedWithDates = completedOrders.filter(wo => wo.completion_date && wo.scheduled_date);
    const avgCompletionTime = completedWithDates.length > 0 ?
      completedWithDates.reduce((sum, wo) => {
        const duration = new Date(wo.completion_date!).getTime() - new Date(wo.scheduled_date!).getTime();
        return sum + duration;
      }, 0) / completedWithDates.length / (1000 * 60 * 60) : 0; // Convert to hours

    // Service type distribution
    const serviceTypes = techWorkOrders.reduce((acc, wo) => {
      const type = wo.service_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Customer type distribution
    const customerTypes = techWorkOrders.reduce((acc, wo) => {
      const type = wo.customers?.customer_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      technician: {
        id: tech.id,
        name: '${tech.first_name} ${tech.last_name}',
        email: tech.email,
        phone: tech.phone,
        skills: tech.skills,
        status: tech.status,
        hourly_rate: tech.hourly_rate,
      },
      metrics: {
        total_work_orders: techWorkOrders.length,
        completed_work_orders: completedOrders.length,
        completion_rate: techWorkOrders.length > 0 ? (completedOrders.length / techWorkOrders.length) * 100 : 0,
        total_revenue: totalRevenue,
        avg_order_value: techWorkOrders.length > 0 ? totalRevenue / techWorkOrders.length : 0,
        avg_completion_time_hours: avgCompletionTime,
        service_type_distribution: serviceTypes,
        customer_type_distribution: customerTypes,
      },
    };
  }) || [];

  // Sort by total revenue
  performanceData.sort((a, b) => b.metrics.total_revenue - a.metrics.total_revenue);

  // Calculate team averages
  const teamMetrics = {
    avg_completion_rate: performanceData.reduce((sum, tech) => sum + tech.metrics.completion_rate, 0) / (performanceData.length || 1),
    avg_order_value: performanceData.reduce((sum, tech) => sum + tech.metrics.avg_order_value, 0) / (performanceData.length || 1),
    total_team_revenue: performanceData.reduce((sum, tech) => sum + tech.metrics.total_revenue, 0),
    total_work_orders: performanceData.reduce((sum, tech) => sum + tech.metrics.total_work_orders, 0),
  };

  return {
    technician_performance: performanceData,
    team_metrics: teamMetrics,
    top_performer: performanceData[0] || null,
    summary: {
      total_technicians: performanceData.length,
      active_technicians: performanceData.filter(t => t.technician.status === 'active').length,
      team_completion_rate: teamMetrics.avg_completion_rate,
      team_revenue: teamMetrics.total_team_revenue,
    },
  };
}

// Helper function to generate customer analysis report
async function generateCustomerAnalysisReport(organizationId: string, params: unknown) {
  const { start_date, end_date, filters = {} } = params;
  
  // Get customer data with work orders and invoices
  const { data: customers } = await supabase
    .from('hs.customers')
    .select('
      id,
      first_name,
      last_name,
      company_name,
      customer_type,
      email,
      phone,
      city,
      state_province,
      customer_status,
      created_at
    ')
    .eq('organization_id', organizationId);

  // Get work orders for customer analysis
  const { data: workOrders } = await supabase
    .from('hs.work_orders')
    .select('
      id,
      customer_id,
      status,
      service_type,
      estimate_total,
      created_at,
      completion_date
    ')
    .eq('organization_id', organizationId)
    .gte('created_at', start_date)
    .lte('created_at', end_date);

  // Get invoices for customer analysis
  const { data: invoices } = await supabase
    .from('hs.invoices')
    .select('
      id,
      customer_id,
      total_amount,
      amount_paid,
      status,
      created_at
    ')
    .eq('organization_id', organizationId)
    .gte('created_at', start_date)
    .lte('created_at', end_date);

  // Calculate customer metrics
  const customerAnalysis = customers?.map(customer => {
    const customerWorkOrders = workOrders?.filter(wo => wo.customer_id === customer.id) || [];
    const customerInvoices = invoices?.filter(inv => inv.customer_id === customer.id) || [];
    
    const totalRevenue = customerInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalPaid = customerInvoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
    
    // Service frequency analysis
    const serviceTypes = customerWorkOrders.reduce((acc, wo) => {
      const type = wo.service_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Customer lifetime calculation (days since first order)
    const firstOrderDate = customerWorkOrders.length > 0 ? 
      Math.min(...customerWorkOrders.map(wo => new Date(wo.created_at).getTime())) : 
      new Date(customer.created_at).getTime();
    const daysSinceFirst = Math.floor((Date.now() - firstOrderDate) / (1000 * 60 * 60 * 24));

    return {
      customer: {
        id: customer.id,
        name: customer.company_name || '${customer.first_name || ''} ${customer.last_name || ''}'.trim(),
        type: customer.customer_type,
        email: customer.email,
        phone: customer.phone,
        location: '${customer.city || ''}, ${customer.state_province || ''}'.replace(', ', '').trim() || 'Unknown',
        status: customer.customer_status,
        created_at: customer.created_at,
      },
      metrics: {
        total_work_orders: customerWorkOrders.length,
        completed_work_orders: customerWorkOrders.filter(wo => wo.status === 'completed').length,
        total_revenue: totalRevenue,
        total_paid: totalPaid,
        outstanding_balance: totalRevenue - totalPaid,
        avg_order_value: customerWorkOrders.length > 0 ? totalRevenue / customerWorkOrders.length : 0,
        service_frequency: serviceTypes,
        days_since_first_order: daysSinceFirst,
        customer_lifetime_value: totalRevenue,
      },
    };
  }) || [];

  // Sort by customer lifetime value
  customerAnalysis.sort((a, b) => b.metrics.customer_lifetime_value - a.metrics.customer_lifetime_value);

  // Calculate segmentation
  const segments = {
    high_value: customerAnalysis.filter(c => c.metrics.customer_lifetime_value > 5000),
    medium_value: customerAnalysis.filter(c => c.metrics.customer_lifetime_value >= 1000 && c.metrics.customer_lifetime_value <= 5000),
    low_value: customerAnalysis.filter(c => c.metrics.customer_lifetime_value < 1000),
  };

  // Geographic analysis
  const geographicDistribution = customerAnalysis.reduce((acc, customer) => {
    const location = customer.customer.location;
    if (location && location !== 'Unknown') {
      acc[location] = (acc[location] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Customer type analysis
  const customerTypeAnalysis = customerAnalysis.reduce((acc, customer) => {
    const type = customer.customer.type || 'unknown';
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        total_revenue: 0,
        avg_order_value: 0,
        total_orders: 0,
      };
    }
    acc[type].count++;
    acc[type].total_revenue += customer.metrics.total_revenue;
    acc[type].total_orders += customer.metrics.total_work_orders;
    return acc;
  }, {} as Record<string, unknown>);

  // Calculate averages for customer types
  Object.keys(customerTypeAnalysis).forEach(type => {
    const analysis = customerTypeAnalysis[type];
    analysis.avg_order_value = analysis.total_orders > 0 ? analysis.total_revenue / analysis.total_orders : 0;
    analysis.avg_revenue_per_customer = analysis.count > 0 ? analysis.total_revenue / analysis.count : 0;
  });

  return {
    customer_analysis: customerAnalysis.slice(0, 100), // Limit to top 100 for performance
    segments: {
      high_value: { count: segments.high_value.length, total_revenue: segments.high_value.reduce((sum, c) => sum + c.metrics.total_revenue, 0) },
      medium_value: { count: segments.medium_value.length, total_revenue: segments.medium_value.reduce((sum, c) => sum + c.metrics.total_revenue, 0) },
      low_value: { count: segments.low_value.length, total_revenue: segments.low_value.reduce((sum, c) => sum + c.metrics.total_revenue, 0) },
    },
    geographic_distribution: geographicDistribution,
    customer_type_analysis: customerTypeAnalysis,
    top_customers: customerAnalysis.slice(0, 20),
    summary: {
      total_customers: customerAnalysis.length,
      avg_customer_lifetime_value: customerAnalysis.reduce((sum, c) => sum + c.metrics.customer_lifetime_value, 0) / (customerAnalysis.length || 1),
      total_customer_revenue: customerAnalysis.reduce((sum, c) => sum + c.metrics.total_revenue, 0),
    },
  };
}

// Helper function to generate report based on type
async function generateReport(reportType: string, organizationId: string, params: unknown) {
  switch (reportType) {
    case 'financial_summary':
      return await generateFinancialSummaryReport(organizationId, params);
    
    case 'technician_performance':
      return await generateTechnicianPerformanceReport(organizationId, params);
    
    case 'customer_analysis':
      return await generateCustomerAnalysisReport(organizationId, params);
    
    // Add more report types as needed
    default:
      throw new Error('Report type "${reportType}" not implemented');
  }
}

// GET /api/v1/hs/analytics/reports - List generated reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = ReportQuerySchema.parse(Object.fromEntries(searchParams));

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

    // Build query
    let supabaseQuery = supabase
      .from('hs.analytics_reports')
      .select('
        id,
        title,
        report_type,
        status,
        format,
        parameters,
        file_url,
        created_at,
        updated_at,
        created_by_user:created_by(first_name, last_name)
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.report_type) {
      supabaseQuery = supabaseQuery.eq('report_type', query.report_type);
    }
    
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }

    if (query.created_by) {
      supabaseQuery = supabaseQuery.eq('created_by', query.created_by);
    }

    if (query.date_from) {
      supabaseQuery = supabaseQuery.gte('created_at', query.date_from);
    }

    if (query.date_to) {
      supabaseQuery = supabaseQuery.lte('created_at', query.date_to);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'title.ilike.%${query.search}%,description.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: reports, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Get report statistics
    const { data: reportStats } = await supabase
      .from('hs.analytics_reports')
      .select('report_type, status')
      .eq('organization_id', organizationId);

    const summary = {
      total_reports: count || 0,
      by_type: reportStats?.reduce((acc, report) => {
        acc[report.report_type] = (acc[report.report_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      by_status: reportStats?.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    };

    return NextResponse.json({
      reports: reports || [],
      summary,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/analytics/reports error:', error);
    
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

// POST /api/v1/hs/analytics/reports - Generate new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reportRequest = ReportRequestSchema.parse(body);

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

    // Prepare report parameters
    const reportParams = {
      start_date: reportRequest.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: reportRequest.end_date || new Date().toISOString(),
      filters: reportRequest.filters || {},
      custom_fields: reportRequest.custom_fields || [],
      grouping: reportRequest.grouping,
    };

    // Create report record
    const { data: report, error: createError } = await supabase
      .from('hs.analytics_reports')
      .insert({
        title: reportRequest.title || '${reportRequest.report_type.replace('_', ' ').toUpperCase()} Report',
        description: reportRequest.description || 'Generated ${reportRequest.report_type} report',
        report_type: reportRequest.report_type,
        status: 'generating',
        format: reportRequest.format,
        delivery_method: reportRequest.delivery_method,
        parameters: reportParams,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Database error:', createError);
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      );
    }

    try {
      // Generate report data
      const reportData = await generateReport(reportRequest.report_type, organizationId, reportParams);

      // Update report with generated data
      await supabase
        .from('hs.analytics_reports')
        .update({
          status: 'completed',
          report_data: reportData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.id);

      // Return response based on format
      if (reportRequest.format === 'json') {
        return NextResponse.json({
          report: {
            ...report,
            status: 'completed',
            data: reportData,
          },
        }, { status: 201 });
      } else {
        // For other formats, return report metadata
        return NextResponse.json({
          report: {
            ...report,
            status: 'completed',
            message: 'Report generated successfully in ${reportRequest.format} format',
          },
        }, { status: 201 });
      }

    } catch (generateError) {
      // Update report status to failed
      await supabase
        .from('hs.analytics_reports')
        .update({
          status: 'failed',
          error_message: generateError.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.id);

      console.error('Report generation error:', generateError);
      return NextResponse.json(
        { error: 'Failed to generate report', details: generateError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('POST /api/v1/hs/analytics/reports error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid report request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}