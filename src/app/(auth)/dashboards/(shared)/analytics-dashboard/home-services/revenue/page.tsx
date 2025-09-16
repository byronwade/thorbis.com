"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TradingViewWrapper, TradingViewWrapperRef, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'
import { TimeFrameControls, TimeRange } from '@/components/analytics/controls/time-frame-controls'
import { cn } from '@/lib/utils'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calculator,
  Target,
  Calendar,
  BarChart3,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  Receipt,
  Wallet,
  Building,
  Clock,
  Users,
  CheckCircle,
  Brain,
  Zap,
  PieChart,
  LineChart
} from 'lucide-react'

interface RevenueMetric {
  id: string
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
  period: string
}

interface ServiceTypeRevenue {
  service: string
  revenue: number
  jobs: number
  avgTicket: number
  margin: number
  growth: string
  color: string
}

interface MonthlyData {
  month: string
  revenue: number
  costs: number
  profit: number
  jobs: number
}

const revenueMetrics: RevenueMetric[] = [
  {
    id: 'total-revenue',
    title: 'Total Revenue',
    value: '$284,350',
    change: '+18.2%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-400',
    period: 'This Month'
  },
  {
    id: 'net-profit',
    title: 'Net Profit',
    value: '$85,305',
    change: '+22.1%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-emerald-400',
    period: 'This Month'
  },
  {
    id: 'avg-ticket',
    title: 'Average Ticket',
    value: '$345',
    change: '+5.8%',
    trend: 'up',
    icon: Receipt,
    color: 'text-blue-400',
    period: 'This Month'
  },
  {
    id: 'profit-margin',
    title: 'Profit Margin',
    value: '30.0%',
    change: '+2.1%',
    trend: 'up',
    icon: Target,
    color: 'text-purple-400',
    period: 'This Month'
  },
  {
    id: 'outstanding-ar',
    title: 'Outstanding A/R',
    value: '$42,180',
    change: '-8.5%',
    trend: 'up',
    icon: Clock,
    color: 'text-orange-400',
    period: 'Current'
  },
  {
    id: 'collection-rate',
    title: 'Collection Rate',
    value: '94.2%',
    change: '+1.8%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-cyan-400',
    period: 'This Month'
  }
]

const serviceTypeRevenue: ServiceTypeRevenue[] = [
  {
    service: 'HVAC Repair & Maintenance',
    revenue: 125680,
    jobs: 142,
    avgTicket: 885,
    margin: 35.2,
    growth: '+25.3%',
    color: 'bg-blue-500'
  },
  {
    service: 'Plumbing Services',
    revenue: 89420,
    jobs: 203,
    avgTicket: 440,
    margin: 28.1,
    growth: '+12.7%',
    color: 'bg-purple-500'
  },
  {
    service: 'Electrical Work',
    revenue: 56780,
    jobs: 97,
    avgTicket: 585,
    margin: 32.8,
    growth: '+18.9%',
    color: 'bg-yellow-500'
  },
  {
    service: 'Emergency Services',
    revenue: 34890,
    jobs: 45,
    avgTicket: 775,
    margin: 42.1,
    growth: '+31.2%',
    color: 'bg-red-500'
  },
  {
    service: 'Preventive Maintenance',
    revenue: 28560,
    jobs: 156,
    avgTicket: 183,
    margin: 24.5,
    growth: '+8.4%',
    color: 'bg-green-500'
  }
]

const monthlyData: MonthlyData[] = [
  { month: 'Jan', revenue: 245000, costs: 171500, profit: 73500, jobs: 687 },
  { month: 'Feb', revenue: 268000, costs: 187600, profit: 80400, jobs: 751 },
  { month: 'Mar', revenue: 312000, costs: 218400, profit: 93600, jobs: 834 },
  { month: 'Apr', revenue: 298000, costs: 208600, profit: 89400, jobs: 802 },
  { month: 'May', revenue: 334000, costs: 233800, profit: 100200, jobs: 891 },
  { month: 'Jun', revenue: 356000, costs: 249200, profit: 106800, jobs: 956 }
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export default function RevenueAnalyticsPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [revenueChartData, setRevenueChartData] = useState<TradingViewChartData[]>([])
  const tradingViewRef = useRef<TradingViewWrapperRef>(null)

  // Generate revenue chart data
  useEffect(() => {
    const generateRevenueData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
      
      const baseRevenue = 45000 // Starting revenue
      
      for (const i = 0; i < 90; i++) {
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add seasonal patterns and growth trends
        const seasonalFactor = 1 + 0.3 * Math.sin((i / 30) * Math.PI) // Monthly cycle
        const growthTrend = 1 + (i / 1000) // Slight upward trend
        const randomVariation = 0.8 + Math.random() * 0.4 // ±20% variation
        
        const dailyRevenue = baseRevenue * seasonalFactor * growthTrend * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(20000, dailyRevenue),
        })
      }
      
      return data
    }

    setRevenueChartData(generateRevenueData())
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">Revenue & Financial Analytics</h1>
          <p className="text-neutral-400 mt-1">Revenue tracking, profit margins, and financial forecasting</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                This Month
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">This Month</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Last 3 Months</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">This Year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {revenueMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.id} className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Icon className={cn("h-5 w-5", metric.color)} />
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    metric.trend === 'up' ? "bg-green-600/20 text-green-400" :
                    metric.trend === 'down' ? "bg-red-600/20 text-red-400" :
                    "bg-neutral-600/20 text-neutral-400"
                  )}
                >
                  {metric.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-neutral-100">{metric.value}</div>
              <div className="text-sm text-neutral-400">{metric.title}</div>
              <div className="text-xs text-neutral-500">{metric.period}</div>
            </div>
          )
        })}
      </div>

      {/* TradingView Revenue Chart */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Revenue Trend Analysis</h3>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              TradingView Powered
            </Badge>
          </div>
          <TimeFrameControls
            onTimeRangeChange={handleTimeRangeChange}
            currentRange={currentTimeRange}
            enableRealTime={true}
            compact={true}
          />
        </div>
        <div className="h-80">
          <TradingViewWrapper
            ref={tradingViewRef}
            data={revenueChartData}
            type="area"
            height="100%"
            theme="dark"
            enableRealTime={true}
            className="h-full w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Current: ${revenueChartData[revenueChartData.length - 1]?.value?.toLocaleString() || '0'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.fitContent()}>
              <Zap className="h-4 w-4 mr-1" />
              Auto-fit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service Type - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Revenue by Service Type</h3>
          </div>
          <div>
            <div className="space-y-4">
              {serviceTypeRevenue.map((service, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", service.color)} />
                      <span className="font-medium text-neutral-200 text-sm">{service.service}</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                      {service.growth}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-400">Revenue</div>
                      <div className="font-medium text-neutral-200">{formatCurrency(service.revenue)}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400">Jobs</div>
                      <div className="font-medium text-neutral-200">{service.jobs}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400">Avg Ticket</div>
                      <div className="font-medium text-neutral-200">{formatCurrency(service.avgTicket)}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400">Margin</div>
                      <div className="font-medium text-neutral-200">{service.margin}%</div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-300", service.color)}
                        style={{ width: `${(service.revenue / 125680) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-medium text-neutral-100">6-Month Financial Trend</h3>
          </div>
          <div>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-200">{month.month}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400">{formatCurrency(month.revenue)}</span>
                      <span className="text-neutral-400">{month.jobs} jobs</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="h-6 bg-neutral-800 rounded overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
                        style={{ width: `${(month.revenue / 360000) * 100}%' }}
                      />
                      <div 
                        className="absolute top-0 h-full bg-red-600/60 transition-all duration-300"
                        style={{ 
                          width: '${(month.costs / 360000) * 100}%',
                          left: 0
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Costs: {formatCurrency(month.costs)}</span>
                    <span>Profit: {formatCurrency(month.profit)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Summary - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Cash Flow Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Cash Receipts</span>
                <span className="font-medium text-green-400">$268,340</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Operating Expenses</span>
                <span className="font-medium text-red-400">$187,850</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Equipment Costs</span>
                <span className="font-medium text-orange-400">$15,640</span>
              </div>
              <div className="border-t border-neutral-800 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-200">Net Cash Flow</span>
                  <span className="font-bold text-green-400">$64,850</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Analysis - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Payment Methods</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-neutral-300">Credit Card</span>
                </div>
                <span className="font-medium text-neutral-200">58%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-neutral-300">ACH/Check</span>
                </div>
                <span className="font-medium text-neutral-200">28%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-neutral-300">Cash</span>
                </div>
                <span className="font-medium text-neutral-200">14%</span>
              </div>
            </div>
            <div className="text-sm text-neutral-500 pt-2">
              Processing Fees: $2,340 (0.8% of revenue)
            </div>
          </div>
        </div>

        {/* Financial Forecasting - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-medium text-neutral-100">Financial Forecast</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-neutral-300">Next Month Projection</span>
                  <span className="font-medium text-emerald-400">$298,500</span>
                </div>
                <div className="text-xs text-neutral-500">Based on current trends</div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-neutral-300">Q4 Revenue Target</span>
                  <span className="font-medium text-blue-400">$850,000</span>
                </div>
                <div className="text-xs text-neutral-500">33% to goal ($562,400 current)</div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-neutral-300">Annual Projection</span>
                  <span className="font-medium text-purple-400">$3.2M</span>
                </div>
                <div className="text-xs text-neutral-500">18% growth over last year</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}