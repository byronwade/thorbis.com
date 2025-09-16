// React Server Component for analytics data
// Demonstrates Next.js 15 server-first patterns with streaming

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'

// =============================================================================
// Server Actions for Data Fetching
// =============================================================================

async function getAnalyticsData(timeframe: string = '30d') {
  'use server'
  
  // Simulate API delay for demonstration
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock analytics data - in production, this would fetch from your database
  return {
    revenue: {
      current: 125420,
      previous: 98340,
      change: 27.5,
    },
    customers: {
      current: 1245,
      previous: 1180,
      change: 5.5,
    },
    orders: {
      current: 3420,
      previous: 3180,
      change: 7.5,
    },
    averageOrder: {
      current: 36.67,
      previous: 30.95,
      change: 18.5,
    },
    timeframe,
    lastUpdated: new Date().toISOString(),
  }
}

async function getChartData() {
  'use server'
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return {
    dailyRevenue: [
      { date: '2024-01-01', revenue: 2400 },
      { date: '2024-01-02', revenue: 1398 },
      { date: '2024-01-03', revenue: 9800 },
      { date: '2024-01-04', revenue: 3908 },
      { date: '2024-01-05', revenue: 4800 },
      { date: '2024-01-06', revenue: 3800 },
      { date: '2024-01-07', revenue: 4300 },
    ],
    topProducts: [
      { name: 'Service Call', revenue: 45600, count: 1240 },
      { name: 'Repair Service', revenue: 32100, count: 890 },
      { name: 'Installation', revenue: 28900, count: 456 },
      { name: 'Maintenance', revenue: 18700, count: 623 },
    ],
  }
}

// =============================================================================
// Loading Components
// =============================================================================

function MetricCardSkeleton() {
  return (
    <Card className="bg-neutral-900/30 border-neutral-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-neutral-800 rounded animate-pulse" />
            <div className="h-8 w-24 bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="h-12 w-12 bg-neutral-800 rounded-full animate-pulse" />
        </div>
        <div className="mt-4">
          <div className="h-3 w-16 bg-neutral-800 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card className="bg-neutral-900/30 border-neutral-800">
      <CardHeader>
        <div className="h-6 w-32 bg-neutral-800 rounded animate-pulse" />
        <div className="h-4 w-48 bg-neutral-800 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-neutral-800 rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Server Components
// =============================================================================

async function MetricCard({ 
  title, 
  value, 
  previousValue, 
  change, 
  icon: Icon, 
  formatter 
}: {
  title: string
  value: number
  previousValue: number
  change: number
  icon: any
  formatter?: (value: number) => string
}) {
  const formatValue = formatter || ((val: number) => val.toLocaleString())
  const isPositive = change > 0
  
  return (
    <Card className="bg-neutral-900/30 border-neutral-800 hover:bg-neutral-900/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{formatValue(value)}</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/20">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className={'text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}'}>
            {isPositive ? '+' : `}{change.toFixed(1)}%
          </span>
          <span className="text-sm text-neutral-500 ml-1">from last period</span>
        </div>
      </CardContent>
    </Card>
  )
}

async function AnalyticsMetrics({ timeframe }: { timeframe?: string }) {
  const data = await getAnalyticsData(timeframe)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard
        title="Total Revenue"
        value={data.revenue.current}
        previousValue={data.revenue.previous}
        change={data.revenue.change}
        icon={DollarSign}
        formatter={(val) => `$${(val / 1000).toFixed(1)}k`}
      />
      
      <MetricCard
        title="Total Customers"
        value={data.customers.current}
        previousValue={data.customers.previous}
        change={data.customers.change}
        icon={Users}
      />
      
      <MetricCard
        title="Total Orders"
        value={data.orders.current}
        previousValue={data.orders.previous}
        change={data.orders.change}
        icon={BarChart3}
      />
      
      <MetricCard
        title="Average Order"
        value={data.averageOrder.current}
        previousValue={data.averageOrder.previous}
        change={data.averageOrder.change}
        icon={TrendingUp}
        formatter={(val) => `$${val.toFixed(2)}'}
      />
    </div>
  )
}

async function AnalyticsChartData() {
  const chartData = await getChartData()
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-neutral-900/30 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Revenue Trend</CardTitle>
          <CardDescription className="text-neutral-400">
            Daily revenue over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end space-x-2">
            {chartData.dailyRevenue.map((day, index) => (
              <div 
                key={day.date} 
                className="flex-1 bg-blue-600 rounded-t transition-all hover:bg-blue-500"
                style={{ 
                  height: '${(day.revenue / Math.max(...chartData.dailyRevenue.map(d => d.revenue))) * 100}%',
                  minHeight: '20px`
                }}
                title={`${day.date}: $${day.revenue.toLocaleString()}'}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900/30 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Top Products</CardTitle>
          <CardDescription className="text-neutral-400">
            Best performing services by revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">{product.name}</p>
                  <p className="text-sm text-neutral-400">{product.count} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">${(product.revenue / 1000).toFixed(1)}k</p>
                  <div 
                    className="h-2 bg-blue-600 rounded mt-1"
                    style={{ 
                      width: '${(product.revenue / Math.max(...chartData.topProducts.map(p => p.revenue))) * 100}px',
                      minWidth: '20px',
                      maxWidth: '80px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// Main Analytics Server Component
// =============================================================================

interface AnalyticsServerProps {
  timeframe?: string
  className?: string
}

export default function AnalyticsServer({ timeframe, className }: AnalyticsServerProps) {
  return (
    <div className={'space-y-8 ${className || ''}'}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Analytics Overview</h2>
        <p className="text-neutral-400">
          Real-time business metrics and performance data
        </p>
      </div>

      {/* Metrics with Suspense for streaming */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      }>
        <AnalyticsMetrics timeframe={timeframe} />
      </Suspense>

      {/* Charts with separate Suspense boundary for independent loading */}
      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      }>
        <AnalyticsChartData />
      </Suspense>

      {/* Last updated info */}
      <div className="text-center">
        <p className="text-xs text-neutral-500">
          Data refreshes automatically every 30 seconds
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// Export Server Actions for Client Components
// =============================================================================

export { getAnalyticsData, getChartData }