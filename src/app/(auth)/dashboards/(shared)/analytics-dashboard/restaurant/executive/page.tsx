"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TradingViewWrapper, TradingViewWrapperRef, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'
import { TimeFrameControls, TimeRange } from '@/components/analytics/controls/time-frame-controls'
import { cn } from '@/lib/utils'
import {
  Crown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Brain,
  Briefcase,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Clock,
  Award,
  Zap,
  Globe,
  Building,
  Calculator,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  Star,
  MapPin,
  Calendar,
  Cpu,
  Bot,
  Radar,
  Shield,
  Phone,
  Mail,
  ChefHat,
  Utensils,
  Coffee,
  Truck,
  Package
} from 'lucide-react'

interface ExecutiveMetric {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
  target?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
}

interface MarketPosition {
  metric: string
  value: number
  marketAvg: number
  rank: number
  totalCompetitors: number
  trend: string
  color: string
}

interface BusinessUnit {
  name: string
  revenue: number
  growth: number
  margin: number
  orders: number
  satisfaction: number
  color: string
}

interface RiskFactor {
  id: string
  category: string
  description: string
  probability: number
  impact: 'high' | 'medium' | 'low'
  mitigation: string
  status: 'monitoring' | 'active' | 'resolved'
  lastUpdated: string
}

interface StrategicInitiative {
  id: string
  title: string
  description: string
  progress: number
  budget: number
  spent: number
  roi: number
  timeline: string
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed'
  owner: string
}

const executiveMetrics: ExecutiveMetric[] = [
  {
    id: 'total-revenue',
    title: 'Total Revenue (YTD)',
    value: '$3.2M',
    change: '+22.1%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-400',
    description: 'Year-to-date revenue across all locations',
    target: '$3.8M',
    priority: 'critical'
  },
  {
    id: 'avg-order-value',
    title: 'Average Order Value',
    value: '$48.50',
    change: '+8.4%',
    trend: 'up',
    icon: Calculator,
    color: 'text-blue-400',
    description: 'Average transaction value per customer',
    target: '$52.00',
    priority: 'high'
  },
  {
    id: 'daily-covers',
    title: 'Daily Covers',
    value: '284',
    change: '+15.2%',
    trend: 'up',
    icon: Users,
    color: 'text-purple-400',
    description: 'Average daily customer count',
    target: '320',
    priority: 'high'
  },
  {
    id: 'food-cost-percentage',
    title: 'Food Cost %',
    value: '28.4%',
    change: '-2.1%',
    trend: 'up',
    icon: Package,
    color: 'text-orange-400',
    description: 'Food costs as percentage of revenue',
    target: '26%',
    priority: 'medium'
  },
  {
    id: 'customer-satisfaction',
    title: 'Customer Satisfaction',
    value: '4.7/5.0',
    change: '+0.3',
    trend: 'up',
    icon: Star,
    color: 'text-yellow-400',
    description: 'Average customer rating across all platforms',
    target: '4.8',
    priority: 'high'
  },
  {
    id: 'table-turnover',
    title: 'Table Turnover Rate',
    value: '3.2x',
    change: '+0.4x',
    trend: 'up',
    icon: Clock,
    color: 'text-cyan-400',
    description: 'Average table turns per service period',
    target: '3.5x',
    priority: 'medium'
  }
]

const marketPositions: MarketPosition[] = [
  {
    metric: 'Revenue Growth',
    value: 22.1,
    marketAvg: 14.8,
    rank: 1,
    totalCompetitors: 12,
    trend: '+7.3%',
    color: 'bg-green-500'
  },
  {
    metric: 'Customer Satisfaction',
    value: 94.0,
    marketAvg: 86.5,
    rank: 2,
    totalCompetitors: 12,
    trend: '+2.1%',
    color: 'bg-blue-500'
  },
  {
    metric: 'Service Speed',
    value: 18,
    marketAvg: 25,
    rank: 1,
    totalCompetitors: 12,
    trend: '-3 min',
    color: 'bg-purple-500'
  },
  {
    metric: 'Digital Adoption',
    value: 87,
    marketAvg: 68,
    rank: 1,
    totalCompetitors: 12,
    trend: '+15%',
    color: 'bg-orange-500'
  }
]

const businessUnits: BusinessUnit[] = [
  {
    name: 'Dine-In Service',
    revenue: 2240000,
    growth: 18.5,
    margin: 24.2,
    orders: 28400,
    satisfaction: 4.8,
    color: 'bg-blue-500'
  },
  {
    name: 'Takeout & Delivery',
    revenue: 680000,
    growth: 35.7,
    margin: 18.9,
    orders: 14200,
    satisfaction: 4.5,
    color: 'bg-green-500'
  },
  {
    name: 'Catering Services',
    revenue: 280000,
    growth: 28.2,
    margin: 32.1,
    orders: 890,
    satisfaction: 4.9,
    color: 'bg-purple-500'
  }
]

const riskFactors: RiskFactor[] = [
  {
    id: 'food-cost-inflation',
    category: 'Supply Chain',
    description: 'Rising food commodity prices affecting profit margins',
    probability: 82,
    impact: 'high',
    mitigation: 'Menu engineering and supplier diversification',
    status: 'active',
    lastUpdated: '1 day ago'
  },
  {
    id: 'labor-shortage',
    category: 'Human Resources',
    description: 'Kitchen and service staff shortage impacting operations',
    probability: 75,
    impact: 'high',
    mitigation: 'Competitive wages and enhanced benefits package',
    status: 'active',
    lastUpdated: '3 days ago'
  },
  {
    id: 'delivery-competition',
    category: 'Market Competition',
    description: 'Increased competition from delivery-only ghost kitchens',
    probability: 65,
    impact: 'medium',
    mitigation: 'Enhanced delivery experience and exclusive menu items',
    status: 'monitoring',
    lastUpdated: '1 week ago'
  }
]

const strategicInitiatives: StrategicInitiative[] = [
  {
    id: 'kitchen-automation',
    title: 'Kitchen Automation Program',
    description: 'AI-powered kitchen display systems and automated inventory management',
    progress: 65,
    budget: 280000,
    spent: 165000,
    roi: 187,
    timeline: 'Q3 2024',
    status: 'on-track',
    owner: 'Maria Santos, Operations Director'
  },
  {
    id: 'delivery-expansion',
    title: 'Delivery Market Expansion',
    description: 'Expand delivery radius and partner with additional platforms',
    progress: 45,
    budget: 120000,
    spent: 68000,
    roi: 145,
    timeline: 'Q4 2024',
    status: 'on-track',
    owner: 'James Liu, Marketing Director'
  },
  {
    id: 'sustainability-program',
    title: 'Sustainability Initiative',
    description: 'Zero-waste kitchen and sustainable sourcing program',
    progress: 28,
    budget: 95000,
    spent: 32000,
    roi: 112,
    timeline: 'Q1 2025',
    status: 'at-risk',
    owner: 'Emma Garcia, Sustainability Manager'
  }
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num)
}

export default function RestaurantExecutiveDashboardPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [revenueChartData, setRevenueChartData] = useState<TradingViewChartData[]>([])
  const [marginsChartData, setMarginsChartData] = useState<TradingViewChartData[]>([])
  const tradingViewRef = useRef<TradingViewWrapperRef>(null)
  const marginsRef = useRef<TradingViewWrapperRef>(null)

  // Generate restaurant revenue chart data
  useEffect(() => {
    const generateRevenueData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      
      const baseRevenue = 220000 // Starting monthly revenue
      
      for (let i = 0; i < 365; i += 30) { // Monthly data points
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic restaurant business patterns
        const seasonalFactor = 1 + 0.2 * Math.sin((i / 365) * Math.PI * 2 + Math.PI/2) // Peak in summer
        const growthTrend = 1 + (i / 3000) // 12% annual growth
        const weekendBoost = 1.1 // Weekend revenue boost
        const randomVariation = 0.9 + Math.random() * 0.2 // ±10% variation
        
        const monthlyRevenue = baseRevenue * seasonalFactor * growthTrend * weekendBoost * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(180000, monthlyRevenue),
        })
      }
      
      return data
    }

    // Generate profit margins chart data
    const generateMarginsData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      
      const baseMargin = 18 // Starting profit margin percentage
      
      for (let i = 0; i < 365; i += 30) { // Monthly data points
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic margin improvement patterns
        const efficiencyGains = 1 + (i / 8000) // Gradual efficiency improvements
        const foodCostPressure = 1 - 0.05 * Math.sin((i / 180) * Math.PI) // Food cost fluctuations
        const operationalImprovements = 1 + (i / 10000) // Operational optimization
        const randomVariation = 0.95 + Math.random() * 0.1 // ±5% variation
        
        const monthlyMargin = baseMargin * efficiencyGains * foodCostPressure * operationalImprovements * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(15, Math.min(28, monthlyMargin)),
        })
      }
      
      return data
    }

    setRevenueChartData(generateRevenueData())
    setMarginsChartData(generateMarginsData())
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Restaurant Executive Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-neutral-100">Restaurant Executive Dashboard</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <ChefHat className="h-3 w-3 mr-1" />
                Restaurant
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
          </div>
          <p className="text-neutral-400 mt-1">Strategic oversight and business intelligence for restaurant operations and growth</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                Executive View
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">Executive View</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Operations Focus</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Financial Analysis</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Growth Planning</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* Restaurant KPIs - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {executiveMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.id} className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Icon className={cn("h-5 w-5", metric.color)} />
                <div className="flex items-center gap-1">
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
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    metric.priority === 'critical' ? "bg-red-500" :
                    metric.priority === 'high' ? "bg-orange-500" :
                    metric.priority === 'medium' ? "bg-yellow-500" : "bg-green-500"
                  )} />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100">{metric.value}</div>
              <div className="text-sm text-neutral-400">{metric.title}</div>
              {metric.target && (
                <div className="text-xs text-neutral-500">Target: {metric.target}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Revenue & Margins Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Performance Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-medium text-neutral-100">Revenue Performance (12 Months)</h3>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
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
                <span>Live Revenue Data</span>
              </div>
              <div className="flex items-center gap-1">
                <span>YTD Growth: +22.1%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Profit Margins Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Profit Margins Trend (12 Months)</h3>
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
              ref={marginsRef}
              data={marginsChartData}
              type="line"
              height="100%"
              theme="dark"
              enableRealTime={true}
              className="h-full w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Live Margin Data</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Current Margin: 22.8%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => marginsRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Market Position & Business Units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Position Analysis */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Market Position Analysis</h3>
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Competitive Intelligence
            </Badge>
          </div>
          <div className="space-y-4">
            {marketPositions.map((position, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200">{position.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">
                      #{position.rank} of {position.totalCompetitors}
                    </span>
                    <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
                      {position.trend}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-neutral-400">
                  <span>Us: {position.value}{position.metric === 'Service Speed' ? ' min' : '%'}</span>
                  <span>Market Avg: {position.marketAvg}{position.metric === 'Service Speed' ? ' min' : '%'}</span>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", position.color)}
                      style={{ width: `${Math.min(100, (position.value / Math.max(position.value, position.marketAvg)) * 100)}%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Unit Performance */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Business Unit Performance</h3>
          </div>
          <div className="space-y-4">
            {businessUnits.map((unit, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", unit.color)} />
                    <span className="font-medium text-neutral-200">{unit.name}</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
                    +{unit.growth}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-400">Revenue</div>
                    <div className="font-medium text-neutral-200">{formatCurrency(unit.revenue)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Margin</div>
                    <div className="font-medium text-neutral-200">{unit.margin}%</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Satisfaction</div>
                    <div className="font-medium text-neutral-200">{unit.satisfaction}/5.0</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", unit.color)}
                      style={{ width: '${unit.margin}%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Initiatives */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Radar className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-neutral-100">Strategic Initiatives</h3>
          <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            Active Programs
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {strategicInitiatives.map((initiative) => (
            <div key={initiative.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-neutral-200">{initiative.title}</h4>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    initiative.status === 'on-track' ? "bg-green-600/20 text-green-400 border-green-600/30" :
                    initiative.status === 'at-risk' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                    initiative.status === 'delayed' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                    "bg-blue-600/20 text-blue-400 border-blue-600/30"
                  )}
                >
                  {initiative.status}
                </Badge>
              </div>
              <p className="text-sm text-neutral-400">{initiative.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Progress</span>
                  <span className="text-neutral-300">{initiative.progress}%</span>
                </div>
                <Progress value={initiative.progress} className="h-2 bg-neutral-800" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-neutral-400">Budget</div>
                  <div className="font-medium text-neutral-200">{formatCurrency(initiative.budget)}</div>
                </div>
                <div>
                  <div className="text-neutral-400">ROI</div>
                  <div className="font-medium text-neutral-200">{initiative.roi}%</div>
                </div>
              </div>
              <div className="text-xs text-neutral-500">
                Owner: {initiative.owner} • Timeline: {initiative.timeline}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-medium text-neutral-100">Risk Management</h3>
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
            Active Monitoring
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {riskFactors.map((risk) => (
            <div key={risk.id} className={cn(
              "p-4 rounded-lg border",
              risk.impact === 'high' ? "bg-red-600/10 border-red-600/20" :
              risk.impact === 'medium' ? "bg-orange-600/10 border-orange-600/20" :
              "bg-yellow-600/10 border-yellow-600/20"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-neutral-200">{risk.category}</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    risk.status === 'active' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                    risk.status === 'monitoring' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                    "bg-green-600/20 text-green-400 border-green-600/30"
                  )}
                >
                  {risk.status}
                </Badge>
              </div>
              <p className="text-sm text-neutral-400 mb-3">{risk.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Probability</span>
                  <span className={cn(
                    "font-medium",
                    risk.probability >= 70 ? "text-red-400" :
                    risk.probability >= 50 ? "text-orange-400" : "text-yellow-400"
                  )}>{risk.probability}%</span>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        risk.probability >= 70 ? "bg-red-500" :
                        risk.probability >= 50 ? "bg-orange-500" : "bg-yellow-500"
                      )}
                      style={{ width: '${risk.probability}%' }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-neutral-500">
                Mitigation: {risk.mitigation}
              </div>
              <div className="mt-2 text-xs text-neutral-600">
                Updated: {risk.lastUpdated}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}