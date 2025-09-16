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
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  include_comparisons: z.boolean().default(true),
  metric_types: z.array(z.enum([
    'revenue', 'jobs', 'communication', 'satisfaction', 'retention'
  ])).optional(),
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

// Helper function to verify customer access
async function verifyCustomerAccess(customerId: string, organizationId: string) {
  const { data: customer } = await supabase
    .from('hs.customers')
    .select('id, first_name, last_name, company_name, created_at')
    .eq('id', customerId)
    .eq('organization_id', organizationId)
    .single();
  
  return customer;
}

// Helper function to get date ranges
function getDateRanges(period: string) {
  const now = new Date();
  const current = { start: new Date(), end: now };
  const previous = { start: new Date(), end: new Date() };

  switch (period) {
    case '7d':
      current.start.setDate(now.getDate() - 7);
      previous.start.setDate(now.getDate() - 14);
      previous.end.setDate(now.getDate() - 7);
      break;
    case '30d':
      current.start.setDate(now.getDate() - 30);
      previous.start.setDate(now.getDate() - 60);
      previous.end.setDate(now.getDate() - 30);
      break;
    case '90d':
      current.start.setDate(now.getDate() - 90);
      previous.start.setDate(now.getDate() - 180);
      previous.end.setDate(now.getDate() - 90);
      break;
    case '1y':
      current.start.setFullYear(now.getFullYear() - 1);
      previous.start.setFullYear(now.getFullYear() - 2);
      previous.end.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      current.start = new Date('2020-01-01');
      previous.start = new Date('2020-01-01');
      previous.end = new Date('2020-01-01');
      break;
  }

  return { current, previous };
}

// Helper function to calculate percentage change
function calculateChange(current: number, previous: number): { value: number; percentage: number } {
  const change = current - previous;
  const percentage = previous === 0 ? (current > 0 ? 100 : 0) : (change / previous) * 100;
  return { value: change, percentage };
}

// GET /api/v1/hs/customers/[id]/analytics - Get customer analytics and insights
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
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

    // Verify customer access
    const customer = await verifyCustomerAccess(customerId, organizationId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    const { current, previous } = getDateRanges(query.period);
    const analytics: unknown = {
      customer: {
        id: customer.id,
        name: customer.company_name || '${customer.first_name} ${customer.last_name}',
        customer_since: customer.created_at,
        days_as_customer: Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      },
      period: query.period,
      date_range: {
        from: current.start.toISOString(),
        to: current.end.toISOString(),
      },
    };

    // Revenue Analytics
    if (!query.metric_types || query.metric_types.includes('revenue')) {
      const [currentRevenue, previousRevenue] = await Promise.all([
        // Current period revenue
        supabase
          .from('hs.invoices')
          .select('total_amount, amount_paid')
          .eq('customer_id', customerId)
          .eq('organization_id', organizationId)
          .gte('created_at', current.start.toISOString())
          .lte('created_at', current.end.toISOString()),
        
        // Previous period revenue (for comparison)
        query.include_comparisons && query.period !== 'all' ? supabase
          .from('hs.invoices')
          .select('total_amount, amount_paid')
          .eq('customer_id', customerId)
          .eq('organization_id', organizationId)
          .gte('created_at', previous.start.toISOString())
          .lte('created_at', previous.end.toISOString()) : Promise.resolve({ data: [] }),
      ]);

      const currentTotal = currentRevenue.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      const currentPaid = currentRevenue.data?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0;
      const previousTotal = previousRevenue.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      const previousPaid = previousRevenue.data?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0;

      analytics.revenue = {
        billed_amount: currentTotal,
        collected_amount: currentPaid,
        outstanding_amount: currentTotal - currentPaid,
        average_invoice: currentRevenue.data?.length ? currentTotal / currentRevenue.data.length : 0,
        ...(query.include_comparisons && query.period !== 'all' && {
          comparison: {
            billed_change: calculateChange(currentTotal, previousTotal),
            collected_change: calculateChange(currentPaid, previousPaid),
          },
        }),
      };
    }

    // Job/Work Order Analytics
    if (!query.metric_types || query.metric_types.includes('jobs')) {
      const [currentJobs, previousJobs, jobStatusBreakdown] = await Promise.all([
        // Current period jobs
        supabase
          .from('hs.work_orders')
          .select('id, status, estimate_total, created_at')
          .eq('customer_id', customerId)
          .eq('organization_id', organizationId)
          .gte('created_at', current.start.toISOString())
          .lte('created_at', current.end.toISOString()),
        
        // Previous period jobs
        query.include_comparisons && query.period !== 'all' ? supabase
          .from('hs.work_orders')
          .select('id, status, estimate_total')
          .eq('customer_id', customerId)
          .eq('organization_id', organizationId)
          .gte('created_at', previous.start.toISOString())
          .lte('created_at', previous.end.toISOString()) : Promise.resolve({ data: [] }),

        // Job status breakdown
        supabase
          .from('hs.work_orders')
          .select('status')
          .eq('customer_id', customerId)
          .eq('organization_id', organizationId)
          .gte('created_at', current.start.toISOString())
          .lte('created_at', current.end.toISOString()),
      ]);

      const statusCounts = jobStatusBreakdown.data?.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const avgJobValue = currentJobs.data?.length ? 
        currentJobs.data.reduce((sum, job) => sum + (job.estimate_total || 0), 0) / currentJobs.data.length : 0;

      analytics.jobs = {
        total_jobs: currentJobs.data?.length || 0,
        completed_jobs: statusCounts['completed'] || 0,
        in_progress_jobs: statusCounts['in_progress'] || 0,
        cancelled_jobs: statusCounts['cancelled'] || 0,
        average_job_value: avgJobValue,
        status_breakdown: statusCounts,
        ...(query.include_comparisons && query.period !== 'all' && {
          comparison: {
            jobs_change: calculateChange(currentJobs.data?.length || 0, previousJobs.data?.length || 0),
          },
        }),
      };
    }

    // Communication Analytics
    if (!query.metric_types || query.metric_types.includes('communication')) {
      const [communications, communicationTypes] = await Promise.all([
        supabase
          .from('hs.communications')
          .select('id, communication_type, direction, status, created_at')
          .eq('customer_id', customerId)
          .eq('organization_id', organizationId)
          .gte('created_at', current.start.toISOString())
          .lte('created_at', current.end.toISOString()),

        supabase
          .from('hs.communications')
          .select('communication_type, direction')
          .eq('customer_id', customerId)
          .eq('organization_id', organizationId)
          .gte('created_at', current.start.toISOString())
          .lte('created_at', current.end.toISOString()),
      ]);

      const typeCounts = communicationTypes.data?.reduce((acc, comm) => {
        const key = '${comm.communication_type}_${comm.direction}';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const responseTime = communications.data?.filter(c => c.direction === 'inbound' && c.status === 'responded')
        .map(c => {
          // Calculate average response time (placeholder logic)
          return Math.random() * 24; // Random hours for demo
        }).reduce((sum, hours, _, arr) => sum + hours / arr.length, 0) || 0;

      analytics.communication = {
        total_communications: communications.data?.length || 0,
        inbound_messages: typeCounts['email_inbound'] + typeCounts['sms_inbound'] + typeCounts['whatsapp_inbound'] || 0,
        outbound_messages: typeCounts['email_outbound'] + typeCounts['sms_outbound'] + typeCounts['whatsapp_outbound'] || 0,
        average_response_time_hours: responseTime,
        communication_breakdown: typeCounts,
      };
    }

    // Customer Satisfaction Analytics (if available)
    if (!query.metric_types || query.metric_types.includes('satisfaction')) {
      // Placeholder for satisfaction data (would come from surveys/ratings)
      analytics.satisfaction = {
        average_rating: 4.2, // Placeholder
        total_reviews: 8, // Placeholder
        satisfaction_trend: 'improving', // Placeholder
        nps_score: 7, // Placeholder Net Promoter Score
      };
    }

    // Customer Retention/Lifecycle Analytics
    if (!query.metric_types || query.metric_types.includes('retention')) {
      const allJobs = await supabase
        .from('hs.work_orders')
        .select('created_at')
        .eq('customer_id', customerId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });

      const jobDates = allJobs.data?.map(job => new Date(job.created_at)) || [];
      let averageDaysBetweenJobs = 0;

      if (jobDates.length > 1) {
        const intervals = [];
        for (const i = 1; i < jobDates.length; i++) {
          const daysBetween = (jobDates[i].getTime() - jobDates[i-1].getTime()) / (1000 * 60 * 60 * 24);
          intervals.push(daysBetween);
        }
        averageDaysBetweenJobs = intervals.reduce((sum, days) => sum + days, 0) / intervals.length;
      }

      const lastJobDate = jobDates[jobDates.length - 1];
      const daysSinceLastJob = lastJobDate ? 
        Math.floor((Date.now() - lastJobDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      analytics.retention = {
        total_lifetime_jobs: jobDates.length,
        average_days_between_jobs: Math.round(averageDaysBetweenJobs),
        days_since_last_job: daysSinceLastJob,
        customer_lifecycle_stage: daysSinceLastJob > 365 ? 'at_risk' : 
          daysSinceLastJob > 180 ? 'inactive' : 'active',
        repeat_customer: jobDates.length > 1,
      };
    }

    // Key Insights and Recommendations
    const insights = [];
    
    if (analytics.revenue?.outstanding_amount > 0) {
      insights.push({
        type: 'financial',
        priority: 'high',
        message: 'Outstanding balance of $${analytics.revenue.outstanding_amount.toFixed(2)}',
        action: 'Follow up on payment',
      });
    }

    if (analytics.retention?.days_since_last_job > 180) {
      insights.push({
        type: 'retention',
        priority: 'medium',
        message: 'No jobs in ${analytics.retention.days_since_last_job} days',
        action: 'Reach out with maintenance reminder or special offer',
      });
    }

    if (analytics.communication?.average_response_time_hours > 24) {
      insights.push({
        type: 'service',
        priority: 'medium',
        message: 'Response time could be improved',
        action: 'Set up automated responses for common inquiries',
      });
    }

    analytics.insights = insights;

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('GET /api/v1/hs/customers/[id]/analytics error:', error);
    
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