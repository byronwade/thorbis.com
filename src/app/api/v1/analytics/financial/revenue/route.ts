/**
 * Revenue Analytics API
 * Detailed revenue breakdown and analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const RevenueQuerySchema = z.object({
  organization_id: z.string().uuid(),
  date_range: z.enum(['7d', '30d', '90d', '12m', 'ytd', 'all']).default('30d'),
  granularity: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily'),
  breakdown_by: z.enum(['source', 'industry', 'customer_segment', 'geography']).default('source'),
  currency: z.string().length(3).default('USD')
});

// GET /api/v1/analytics/financial/revenue
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const validationResult = RevenueQuerySchema.safeParse({
      organization_id: searchParams.get('organization_id'),
      date_range: searchParams.get('date_range'),
      granularity: searchParams.get('granularity'),
      breakdown_by: searchParams.get('breakdown_by'),
      currency: searchParams.get('currency')
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { organization_id, date_range, granularity, breakdown_by, currency } = validationResult.data;

    // Calculate date boundaries
    const dateRange = calculateDateRange(date_range);
    
    // Fetch detailed revenue data based on breakdown type
    const revenueBreakdown = await fetchRevenueBreakdown(
      supabase, 
      organization_id, 
      dateRange, 
      granularity, 
      breakdown_by, 
      currency
    );

    const timeSeries = await fetchRevenueTimeSeries(
      supabase,
      organization_id,
      dateRange,
      granularity,
      currency
    );

    const topCustomers = await fetchTopRevenueCustomers(
      supabase,
      organization_id,
      dateRange,
      currency
    );

    const conversionMetrics = await fetchRevenueConversionMetrics(
      supabase,
      organization_id,
      dateRange
    );

    return NextResponse.json({
      data: {
        organization_id,
        date_range: {
          start_date: dateRange.start,
          end_date: dateRange.end,
          period_display: formatDateRange(date_range)
        },
        breakdown: {
          type: breakdown_by,
          segments: revenueBreakdown
        },
        time_series: timeSeries,
        top_customers: topCustomers,
        conversion_metrics: conversionMetrics,
        summary: {
          total_revenue_cents: revenueBreakdown.reduce((sum: number, segment: unknown) => sum + segment.amount_cents, 0),
          average_revenue_per_period: timeSeries.reduce((sum: number, point: unknown) => sum + point.value_cents, 0) / timeSeries.length,
          growth_rate_percentage: calculateGrowthRate(timeSeries),
          revenue_sources: revenueBreakdown.length,
          top_customer_concentration_percentage: topCustomers.length > 0 ? 
            (topCustomers[0].revenue_cents / revenueBreakdown.reduce((sum: number, s: unknown) => sum + s.amount_cents, 0)) * 100 : 0
        }
      },
      meta: {
        generated_at: new Date().toISOString(),
        currency,
        granularity,
        breakdown_by
      }
    });

  } catch (error) {
    console.error('Revenue analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate revenue analytics' },
      { status: 500 }
    );
  }
}

async function fetchRevenueBreakdown(supabase: unknown, orgId: string, dateRange: unknown, granularity: string, breakdownBy: string, currency: string) {
  // Mock data based on breakdown type
  switch (breakdownBy) {
    case 'source':
      return [
        {
          segment_name: 'Subscription Revenue',
          amount_cents: 1567800,
          percentage: 62.5,
          growth_rate: 8.2,
          transaction_count: 234
        },
        {
          segment_name: 'One-time Payments',
          amount_cents: 756900,
          percentage: 30.2,
          growth_rate: -2.1,
          transaction_count: 1843
        },
        {
          segment_name: 'Setup Fees',
          amount_cents: 183400,
          percentage: 7.3,
          growth_rate: 15.6,
          transaction_count: 67
        }
      ];
    case 'industry':
      return [
        {
          segment_name: 'Home Services',
          amount_cents: 1234500,
          percentage: 49.2,
          growth_rate: 12.3,
          transaction_count: 856
        },
        {
          segment_name: 'Auto Services', 
          amount_cents: 876400,
          percentage: 35.0,
          growth_rate: 6.7,
          transaction_count: 623
        },
        {
          segment_name: 'Restaurant',
          amount_cents: 397200,
          percentage: 15.8,
          growth_rate: -1.2,
          transaction_count: 445
        }
      ];
    case 'customer_segment':
      return [
        {
          segment_name: 'Enterprise',
          amount_cents: 1456700,
          percentage: 58.1,
          growth_rate: 14.5,
          transaction_count: 89
        },
        {
          segment_name: 'Mid-Market',
          amount_cents: 756300,
          percentage: 30.2,
          growth_rate: 8.9,
          transaction_count: 234
        },
        {
          segment_name: 'Small Business',
          amount_cents: 295100,
          percentage: 11.7,
          growth_rate: 2.1,
          transaction_count: 789
        }
      ];
    default:
      return [];
  }
}

async function fetchRevenueTimeSeries(supabase: unknown, orgId: string, dateRange: unknown, granularity: string, currency: string) {
  return generateMockTimeSeries(dateRange, granularity, 15000, 45000);
}

async function fetchTopRevenueCustomers(supabase: unknown, orgId: string, dateRange: unknown, currency: string) {
  return [
    {
      customer_id: 'cust_001',
      customer_name: 'ABC Plumbing Corp',
      revenue_cents: 234500,
      transaction_count: 12,
      first_transaction_date: '2024-01-15',
      last_transaction_date: '2024-01-28',
      customer_segment: 'Enterprise'
    },
    {
      customer_id: 'cust_002', 
      customer_name: 'Metro Auto Services',
      revenue_cents: 189300,
      transaction_count: 8,
      first_transaction_date: '2024-01-10',
      last_transaction_date: '2024-01-29',
      customer_segment: 'Mid-Market'
    },
    {
      customer_id: 'cust_003',
      customer_name: 'Downtown Diner',
      revenue_cents: 156700,
      transaction_count: 23,
      first_transaction_date: '2024-01-05',
      last_transaction_date: '2024-01-30',
      customer_segment: 'Small Business'
    }
  ];
}

async function fetchRevenueConversionMetrics(supabase: unknown, orgId: string, dateRange: unknown) {
  return {
    lead_to_customer_rate: 23.4,
    quote_to_close_rate: 67.8,
    average_sales_cycle_days: 14,
    upsell_rate: 15.6,
    cross_sell_rate: 8.9,
    customer_lifetime_value_cents: 245600
  };
}

function calculateDateRange(range: string): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString();
  
  let start: Date;
  switch (range) {
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '12m':
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case 'ytd':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
      start = new Date('2020-01-01');
      break;
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return { start: start.toISOString(), end };
}

function generateMockTimeSeries(dateRange: unknown, granularity: string, minValue: number, maxValue: number) {
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const points: unknown[] = [];
  
  const current = new Date(start);
  while (current <= end) {
    points.push({
      timestamp: current.toISOString(),
      value_cents: Math.floor(Math.random() * (maxValue - minValue) + minValue),
      transaction_count: Math.floor(Math.random() * 50 + 10)
    });
    
    // Increment based on granularity
    switch (granularity) {
      case 'hourly':
        current.setHours(current.getHours() + 1);
        break;
      case 'daily':
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  
  return points;
}

function calculateGrowthRate(timeSeries: unknown[]): number {
  if (timeSeries.length < 2) return 0;
  
  const firstHalf = timeSeries.slice(0, Math.floor(timeSeries.length / 2));
  const secondHalf = timeSeries.slice(Math.floor(timeSeries.length / 2));
  
  const firstSum = firstHalf.reduce((sum, point) => sum + point.value_cents, 0);
  const secondSum = secondHalf.reduce((sum, point) => sum + point.value_cents, 0);
  
  return firstSum > 0 ? ((secondSum - firstSum) / firstSum) * 100 : 0;
}

function formatDateRange(range: string): string {
  const ranges: { [key: string]: string } = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '12m': 'Last 12 months',
    'ytd': 'Year to date',
    'all': 'All time'
  };
  return ranges[range] || 'Custom range';
}