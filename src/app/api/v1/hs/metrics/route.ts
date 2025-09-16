import { NextRequest, NextResponse } from 'next/server';
import { type DashboardKPIs, type ChartDatasets, type DashboardMetricsResponse } from '@/types/charts';

// Mock database functions - replace with actual database queries
async function fetchKPIData(timeframe: string = 'week'): Promise<DashboardKPIs> {
  // Simulate database query delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Generate realistic KPI data based on timeframe
  const multiplier = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
  
  return {
    // Financial metrics
    todayRevenue: Math.round(4500 + Math.random() * 3000),
    weeklyRevenue: Math.round(28000 + Math.random() * 15000),
    monthlyRevenue: Math.round(115000 + Math.random() * 40000),
    averageTicket: Math.round(425 + Math.random() * 150),
    conversionRate: 68 + Math.random() * 22,
    
    // Operational metrics
    todayWorkOrders: Math.round(18 + Math.random() * 12),
    completedWorkOrders: Math.round(12 + Math.random() * 8),
    activeWorkOrders: Math.round(4 + Math.random() * 6),
    scheduledWorkOrders: Math.round(8 + Math.random() * 12),
    
    // Technician metrics
    activeTechnicians: Math.round(10 + Math.random() * 6),
    availableTechnicians: Math.round(4 + Math.random() * 4),
    onRouteTechnicians: Math.round(6 + Math.random() * 4),
    techUtilization: 75 + Math.random() * 20,
    
    // Performance metrics
    avgResponseTime: '${Math.round(22 + Math.random() * 18)}m',
    responseTimeChange: (Math.random() - 0.6) * 25, // Slight negative bias for improvement
    callbackRate: 4 + Math.random() * 6,
    customerSatisfaction: 8.2 + Math.random() * 1.5,
    netPromoterScore: Math.round(52 + Math.random() * 30),
    
    // Service metrics
    slaCompliance: 88 + Math.random() * 12,
    firstTimeFixRate: 82 + Math.random() * 16,
    referralRate: 18 + Math.random() * 20
  };
}

async function fetchChartData(timeframe: string = 'week'): Promise<ChartDatasets> {
  // Simulate database query delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const daysBack = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
  const now = new Date();
  
  // Generate revenue data
  const revenueData = {
    daily: generateRevenueData(daysBack, 'day'),
    weekly: generateRevenueData(Math.ceil(daysBack / 7), 'week'),
    monthly: generateRevenueData(Math.ceil(daysBack / 30), 'month')
  };
  
  // Generate work order volume data
  const volumeData = generateVolumeData(daysBack);
  
  // Generate completion rate data
  const completionData = generateMetricsData(daysBack, 85, 'completion_rate');
  
  // Generate technician metrics
  const utilizationData = generateMetricsData(daysBack, 75, 'utilization');
  const responseTimeData = generateMetricsData(daysBack, 25, 'response_time');
  const satisfactionData = generateMetricsData(daysBack, 8.5, 'satisfaction', 10);
  
  // Generate customer metrics
  const customerSatisfactionData = generateMetricsData(daysBack, 8.3, 'satisfaction', 10);
  const npsData = generateMetricsData(daysBack, 55, 'nps', 100);
  const callbacksData = generateMetricsData(daysBack, 5, 'callbacks');
  
  return {
    revenue: revenueData,
    workOrders: {
      volumes: volumeData,
      completionRates: completionData
    },
    technicians: {
      utilization: utilizationData,
      responseTime: responseTimeData,
      satisfaction: satisfactionData
    },
    customers: {
      satisfaction: customerSatisfactionData,
      nps: npsData,
      callbacks: callbacksData
    }
  };
}

// Utility functions for generating mock chart data
function generateRevenueData(periods: number, interval: 'day' | 'week' | 'month') {
  const data = [];
  const now = new Date();
  const baseRevenue = interval === 'day' ? 5000 : interval === 'week' ? 35000 : 150000;
  
  for (let i = periods; i >= 0; i--) {
    const date = new Date(now);
    
    if (interval === 'day') {
      date.setDate(date.getDate() - i);
    } else if (interval === 'week') {
      date.setDate(date.getDate() - (i * 7));
    } else {
      date.setMonth(date.getMonth() - i);
    }
    
    // Add seasonality and growth trends
    const seasonality = Math.sin((periods - i) * 0.2) * 0.15;
    const growth = (periods - i) * 0.008; // Small growth trend
    const randomness = (Math.random() - 0.5) * 0.25;
    
    const multiplier = 1 + seasonality + growth + randomness;
    const revenue = Math.max(baseRevenue * multiplier, baseRevenue * 0.3);
    
    data.push({
      time: Math.floor(date.getTime() / 1000),
      value: Math.round(revenue),
      color: i === 0 ? '#1C8BFF' : undefined // Highlight latest
    });
  }
  
  return data;
}

function generateVolumeData(days: number) {
  const data = [];
  const now = new Date();
  const baseVolume = 22; // Base daily work orders
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Weekend factor
    const dayOfWeek = date.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.65 : 1.0;
    
    // Seasonality and randomness
    const seasonality = Math.sin((days - i) * 0.15) * 0.2;
    const growth = (days - i) * 0.003;
    const randomness = (Math.random() - 0.5) * 0.3;
    
    const multiplier = weekendFactor * (1 + seasonality + growth + randomness);
    const volume = Math.max(Math.round(baseVolume * multiplier), 8);
    
    // Determine color trend
    let color: 'up' | 'down' | 'neutral' = 'neutral';
    if (i < days && data.length > 0) {
      const prevVolume = data[data.length - 1].value;
      if (volume > prevVolume * 1.08) color = 'up';
      else if (volume < prevVolume * 0.92) color = 'down';
    }
    
    data.push({
      time: Math.floor(date.getTime() / 1000),
      value: volume,
      color
    });
  }
  
  return data;
}

function generateMetricsData(days: number, baseValue: number, metricType: string, maxValue: number = 100) {
  const data = [];
  const now = new Date();
  
  // Adjust volatility based on metric type
  let volatility = 0.1;
  if (metricType.includes('satisfaction') || metricType === 'nps') {
    volatility = 0.05;
  } else if (metricType === 'response_time' || metricType === 'callbacks') {
    volatility = 0.15;
  }
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Trend improvements over time
    const improvementFactor = metricType === 'response_time' || metricType === 'callbacks' ? 
      1 - (days - i) * 0.002 : // Decreasing is better
      1 + (days - i) * 0.002;   // Increasing is better
    
    const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2;
    const value = Math.max(0, Math.min(baseValue * improvementFactor * randomFactor, maxValue));
    
    data.push({
      time: Math.floor(date.getTime() / 1000),
      value: Math.round(value * 100) / 100
    });
  }
  
  return data;
}

// API Route Handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week';
    
    // Validate timeframe
    const validTimeframes = ['day', 'week', 'month', 'quarter', 'year'];
    const validatedTimeframe = validTimeframes.includes(timeframe) ? timeframe : 'week';
    
    // Fetch data in parallel
    const [kpis, charts] = await Promise.all([
      fetchKPIData(validatedTimeframe),
      fetchChartData(validatedTimeframe)
    ]);
    
    const response: DashboardMetricsResponse = {
      success: true,
      data: {
        kpis,
        charts
      },
      timestamp: new Date().toISOString()
    };
    
    // Set cache headers for better performance
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' // 30s cache, 60s stale
    });
    
    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('Dashboard metrics API error:', error);
    
    const errorResponse = {
      success: false,
      error: 'Failed to fetch dashboard metrics',
      timestamp: new Date().toISOString()
    };
    
    return new NextResponse(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}