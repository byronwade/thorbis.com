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
  Store,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  RotateCcw,
  Percent
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
  transactions: number
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
    value: '$4.2M',
    change: '+18.9%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-400',
    description: 'Year-to-date revenue across all channels',
    target: '$4.8M',
    priority: 'critical'
  },
  {
    id: 'gross-margin',
    title: 'Gross Margin',
    value: '45.2%',
    change: '+2.8%',
    trend: 'up',
    icon: Percent,
    color: 'text-blue-400',
    description: 'Gross profit margin across all products',
    target: '47%',
    priority: 'high'
  },
  {
    id: 'avg-transaction',
    title: 'Average Transaction',
    value: '$67.80',
    change: '+9.4%',
    trend: 'up',
    icon: Calculator,
    color: 'text-purple-400',
    description: 'Average basket value per transaction',
    target: '$72.00',
    priority: 'high'
  },
  {
    id: 'inventory-turnover',
    title: 'Inventory Turnover',
    value: '8.4x',
    change: '+1.2x',
    trend: 'up',
    icon: Package,
    color: 'text-orange-400',
    description: 'Annual inventory turnover rate',
    target: '9.0x',
    priority: 'medium'
  },
  {
    id: 'customer-satisfaction',
    title: 'Customer Satisfaction',
    value: '4.6/5.0',
    change: '+0.2',
    trend: 'up',
    icon: Star,
    color: 'text-yellow-400',
    description: 'Customer satisfaction score across all touchpoints',
    target: '4.8',
    priority: 'high'
  },
  {
    id: 'conversion-rate',
    title: 'Conversion Rate',
    value: '3.8%',
    change: '+0.6%',
    trend: 'up',
    icon: Target,
    color: 'text-cyan-400',
    description: 'Overall store conversion rate',
    target: '4.2%',
    priority: 'medium'
  }
]

const marketPositions: MarketPosition[] = [
  {
    metric: 'Customer Experience',
    value: 92.4,
    marketAvg: 84.7,
    rank: 2,
    totalCompetitors: 15,
    trend: '+4.2%',
    color: 'bg-green-500'
  },
  {
    metric: 'Price Competitiveness',
    value: 88.5,
    marketAvg: 85.1,
    rank: 3,
    totalCompetitors: 15,
    trend: '+2.1%',
    color: 'bg-blue-500'
  },
  {
    metric: 'Product Selection',
    value: 94.8,
    marketAvg: 89.2,
    rank: 1,
    totalCompetitors: 15,
    trend: '+3.7%',
    color: 'bg-purple-500'
  },
  {
    metric: 'Digital Integration',
    value: 89.2,
    marketAvg: 76.4,
    rank: 1,
    totalCompetitors: 15,
    trend: '+8.3%',
    color: 'bg-orange-500'
  }
]

const businessUnits: BusinessUnit[] = [
  {
    name: 'In-Store Sales',
    revenue: 2940000,
    growth: 12.4,
    margin: 48.6,
    transactions: 45200,
    satisfaction: 4.7,
    color: 'bg-blue-500'
  },
  {
    name: 'Online Sales',
    revenue: 840000,
    growth: 34.7,
    margin: 38.2,
    transactions: 8900,
    satisfaction: 4.4,
    color: 'bg-green-500'
  },
  {
    name: 'Mobile App',
    revenue: 420000,
    growth: 58.2,
    margin: 35.1,
    transactions: 5200,
    satisfaction: 4.6,
    color: 'bg-purple-500'
  }
]

const riskFactors: RiskFactor[] = [
  {
    id: 'supply-chain-disruption',
    category: 'Supply Chain',
    description: 'Global shipping delays affecting inventory availability',
    probability: 68,
    impact: 'high',
    mitigation: 'Diversify suppliers and increase safety stock levels',
    status: 'active',
    lastUpdated: '1 day ago'
  },
  {
    id: 'ecommerce-competition',
    category: 'Market Competition',
    description: 'Increasing pressure from online-only competitors',
    probability: 75,
    impact: 'medium',
    mitigation: 'Enhanced omnichannel experience and unique value propositions',
    status: 'active',
    lastUpdated: '3 days ago'
  },
  {
    id: 'consumer-spending',
    category: 'Economic Factors',
    description: 'Potential reduction in discretionary consumer spending',
    probability: 45,
    impact: 'high',
    mitigation: 'Focus on value positioning and essential product categories',
    status: 'monitoring',
    lastUpdated: '1 week ago'
  }
]

const strategicInitiatives: StrategicInitiative[] = [
  {
    id: 'omnichannel-integration',
    title: 'Omnichannel Experience Platform',
    description: 'Unified customer experience across store, online, and mobile channels',
    progress: 72,
    budget: 320000,
    spent: 245000,
    roi: 178,
    timeline: 'Q1 2025',
    status: 'on-track',
    owner: 'Jessica Martinez, Digital Director'
  },
  {
    id: 'ai-personalization',
    title: 'AI-Powered Personalization',
    description: 'Machine learning for personalized product recommendations and pricing',
    progress: 45,
    budget: 180000,
    spent: 98000,
    roi: 156,
    timeline: 'Q2 2025',
    status: 'on-track',
    owner: 'Michael Chen, Technology Lead'
  },
  {
    id: 'sustainability-program',
    title: 'Sustainability & ESG Initiative',
    description: 'Carbon-neutral operations and sustainable product sourcing',
    progress: 28,
    budget: 150000,
    spent: 52000,
    roi: 124,
    timeline: 'Q3 2025',
    status: 'at-risk',
    owner: 'Sarah Williams, Operations Manager'
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

export default function RetailExecutiveDashboardPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [revenueChartData, setRevenueChartData] = useState<TradingViewChartData[]>([])
  const [marginChartData, setMarginChartData] = useState<TradingViewChartData[]>([])
  const tradingViewRef = useRef<TradingViewWrapperRef>(null)
  const marginRef = useRef<TradingViewWrapperRef>(null)

  // Generate retail revenue chart data
  useEffect(() => {
    const generateRevenueData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      
      const baseRevenue = 280000 // Starting monthly revenue
      
      for (let i = 0; i < 365; i += 30) { // Monthly data points
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic retail business patterns
        const seasonalFactor = 1 + 0.25 * Math.sin((i / 365) * Math.PI * 2 + Math.PI) // Peak in Q4 holidays
        const growthTrend = 1 + (i / 3200) // 11% annual growth
        const digitalGrowth = 1 + (i / 8000) // Digital transformation boost
        const randomVariation = 0.9 + Math.random() * 0.2 // ±10% variation
        
        const monthlyRevenue = baseRevenue * seasonalFactor * growthTrend * digitalGrowth * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(220000, monthlyRevenue),
        })
      }
      
      return data
    }

    // Generate gross margin chart data
    const generateMarginData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      
      const baseMargin = 42 // Starting gross margin percentage
      
      for (let i = 0; i < 365; i += 30) { // Monthly data points
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic margin improvement patterns
        const categoryMix = 1 + 0.03 * Math.sin((i / 180) * Math.PI) // Category mix changes
        const supplyChainEfficiency = 1 + (i / 10000) // Gradual efficiency gains
        const digitalMargins = 1 + (i / 12000) // Better margins on digital channels
        const randomVariation = 0.96 + Math.random() * 0.08 // ±4% variation
        
        const monthlyMargin = baseMargin * categoryMix * supplyChainEfficiency * digitalMargins * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(38, Math.min(50, monthlyMargin)),
        })
      }
      
      return data
    }

    setRevenueChartData(generateRevenueData())
    setMarginChartData(generateMarginData())
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Retail Executive Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-neutral-100">Retail Executive Dashboard</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Store className="h-3 w-3 mr-1" />
                Retail
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
          </div>
          <p className="text-neutral-400 mt-1">Strategic oversight and business intelligence for retail operations and growth</p>
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
              <DropdownMenuItem className="text-neutral-300">Merchandising Focus</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Customer Analytics</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Financial Performance</DropdownMenuItem>
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

      {/* Retail KPIs - Data-Focused */}
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
                <span>YTD Growth: +18.9%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Gross Margin Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Gross Margin Trend (12 Months)</h3>
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
              ref={marginRef}
              data={marginChartData}
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
                <span>Current Margin: 45.2%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => marginRef.current?.exportToPDF()}>
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
                  <span>Us: {position.value}%</span>
                  <span>Market Avg: {position.marketAvg}%</span>
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

        {/* Sales Channel Performance */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Sales Channel Performance</h3>
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