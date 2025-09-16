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
  Car,
  Wrench,
  Settings,
  Gauge,
  Package,
  Fuel,
  Truck
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
  jobs: number
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
    value: '$2.1M',
    change: '+16.8%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-400',
    description: 'Year-to-date revenue across all service categories',
    target: '$2.4M',
    priority: 'critical'
  },
  {
    id: 'labor-efficiency',
    title: 'Labor Efficiency',
    value: '87.2%',
    change: '+5.4%',
    trend: 'up',
    icon: Gauge,
    color: 'text-blue-400',
    description: 'Billable hours as percentage of total shop time',
    target: '90%',
    priority: 'high'
  },
  {
    id: 'avg-job-value',
    title: 'Average Job Value',
    value: '$485',
    change: '+12.3%',
    trend: 'up',
    icon: Calculator,
    color: 'text-purple-400',
    description: 'Average revenue per completed service order',
    target: '$520',
    priority: 'high'
  },
  {
    id: 'parts-margin',
    title: 'Parts Profit Margin',
    value: '42.8%',
    change: '+3.1%',
    trend: 'up',
    icon: Package,
    color: 'text-orange-400',
    description: 'Profit margin on parts sales',
    target: '45%',
    priority: 'medium'
  },
  {
    id: 'customer-retention',
    title: 'Customer Retention',
    value: '78.4%',
    change: '+6.2%',
    trend: 'up',
    icon: Star,
    color: 'text-yellow-400',
    description: '12-month customer return rate',
    target: '82%',
    priority: 'high'
  },
  {
    id: 'bay-utilization',
    title: 'Bay Utilization',
    value: '74.6%',
    change: '+8.1%',
    trend: 'up',
    icon: Settings,
    color: 'text-cyan-400',
    description: 'Average service bay capacity utilization',
    target: '80%',
    priority: 'medium'
  }
]

const marketPositions: MarketPosition[] = [
  {
    metric: 'Service Quality',
    value: 96.2,
    marketAvg: 89.4,
    rank: 1,
    totalCompetitors: 18,
    trend: '+3.8%',
    color: 'bg-green-500'
  },
  {
    metric: 'Response Time',
    value: 24,
    marketAvg: 48,
    rank: 1,
    totalCompetitors: 18,
    trend: '-8 hrs',
    color: 'bg-blue-500'
  },
  {
    metric: 'Diagnostic Accuracy',
    value: 94.7,
    marketAvg: 84.2,
    rank: 2,
    totalCompetitors: 18,
    trend: '+5.1%',
    color: 'bg-purple-500'
  },
  {
    metric: 'Digital Integration',
    value: 92,
    marketAvg: 71,
    rank: 1,
    totalCompetitors: 18,
    trend: '+18%',
    color: 'bg-orange-500'
  }
]

const businessUnits: BusinessUnit[] = [
  {
    name: 'General Repair',
    revenue: 1260000,
    growth: 14.2,
    margin: 35.8,
    jobs: 4280,
    satisfaction: 4.6,
    color: 'bg-blue-500'
  },
  {
    name: 'Transmission Services',
    revenue: 420000,
    growth: 22.4,
    margin: 52.1,
    jobs: 890,
    satisfaction: 4.8,
    color: 'bg-green-500'
  },
  {
    name: 'Engine Diagnostics',
    revenue: 280000,
    growth: 18.7,
    margin: 48.3,
    jobs: 670,
    satisfaction: 4.7,
    color: 'bg-purple-500'
  },
  {
    name: 'Preventive Maintenance',
    revenue: 140000,
    growth: 12.1,
    margin: 28.4,
    jobs: 1850,
    satisfaction: 4.5,
    color: 'bg-orange-500'
  }
]

const riskFactors: RiskFactor[] = [
  {
    id: 'parts-shortage',
    category: 'Supply Chain',
    description: 'Global semiconductor shortage affecting auto parts availability',
    probability: 78,
    impact: 'high',
    mitigation: 'Diversify suppliers and increase critical parts inventory',
    status: 'active',
    lastUpdated: '2 days ago'
  },
  {
    id: 'technician-shortage',
    category: 'Human Resources',
    description: 'Certified technician shortage impacting service capacity',
    probability: 72,
    impact: 'high',
    mitigation: 'Enhanced training programs and competitive compensation',
    status: 'active',
    lastUpdated: '1 week ago'
  },
  {
    id: 'ev-transition',
    category: 'Technology Disruption',
    description: 'Electric vehicle adoption changing service requirements',
    probability: 85,
    impact: 'medium',
    mitigation: 'EV certification training and equipment investment',
    status: 'monitoring',
    lastUpdated: '3 days ago'
  }
]

const strategicInitiatives: StrategicInitiative[] = [
  {
    id: 'ev-readiness',
    title: 'Electric Vehicle Service Readiness',
    description: 'Technician certification and equipment for EV service capabilities',
    progress: 42,
    budget: 180000,
    spent: 89000,
    roi: 156,
    timeline: 'Q2 2025',
    status: 'on-track',
    owner: 'David Chen, Technical Director'
  },
  {
    id: 'digital-workflow',
    title: 'Digital Workflow Optimization',
    description: 'AI-powered diagnostic tools and automated workflow management',
    progress: 68,
    budget: 95000,
    spent: 72000,
    roi: 198,
    timeline: 'Q4 2024',
    status: 'on-track',
    owner: 'Sarah Mitchell, Operations Manager'
  },
  {
    id: 'customer-experience',
    title: 'Customer Experience Enhancement',
    description: 'Digital service tracking and automated customer communication',
    progress: 34,
    budget: 65000,
    spent: 28000,
    roi: 142,
    timeline: 'Q1 2025',
    status: 'at-risk',
    owner: 'Mike Rodriguez, Customer Success'
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

export default function AutoExecutiveDashboardPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [revenueChartData, setRevenueChartData] = useState<TradingViewChartData[]>([])
  const [efficiencyChartData, setEfficiencyChartData] = useState<TradingViewChartData[]>([])
  const tradingViewRef = useRef<TradingViewWrapperRef>(null)
  const efficiencyRef = useRef<TradingViewWrapperRef>(null)

  // Generate auto services revenue chart data
  useEffect(() => {
    const generateRevenueData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      
      const baseRevenue = 150000 // Starting monthly revenue
      
      for (let i = 0; i < 365; i += 30) { // Monthly data points
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic auto services business patterns
        const seasonalFactor = 1 + 0.15 * Math.sin((i / 365) * Math.PI * 2 + Math.PI) // Lower in winter
        const growthTrend = 1 + (i / 3500) // 10% annual growth
        const weekdayFactor = 1.05 // Higher weekday demand
        const randomVariation = 0.9 + Math.random() * 0.2 // ±10% variation
        
        const monthlyRevenue = baseRevenue * seasonalFactor * growthTrend * weekdayFactor * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(120000, monthlyRevenue),
        })
      }
      
      return data
    }

    // Generate labor efficiency chart data
    const generateEfficiencyData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      
      const baseEfficiency = 82 // Starting efficiency percentage
      
      for (let i = 0; i < 365; i += 30) { // Monthly data points
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic efficiency improvement patterns
        const trainingImprovements = 1 + (i / 8000) // Gradual training improvements
        const toolUpgrades = 1 + (i / 12000) // Technology improvements
        const seasonalVariation = 1 + 0.03 * Math.sin((i / 365) * Math.PI * 2) // Seasonal variation
        const randomVariation = 0.97 + Math.random() * 0.06 // ±3% variation
        
        const monthlyEfficiency = baseEfficiency * trainingImprovements * toolUpgrades * seasonalVariation * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(75, Math.min(95, monthlyEfficiency)),
        })
      }
      
      return data
    }

    setRevenueChartData(generateRevenueData())
    setEfficiencyChartData(generateEfficiencyData())
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Auto Services Executive Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-neutral-100">Auto Services Executive Dashboard</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Car className="h-3 w-3 mr-1" />
                Automotive
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
          </div>
          <p className="text-neutral-400 mt-1">Strategic oversight and business intelligence for automotive service operations</p>
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
              <DropdownMenuItem className="text-neutral-300">Technical Performance</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Growth Analysis</DropdownMenuItem>
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

      {/* Auto Services KPIs - Data-Focused */}
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

      {/* Revenue & Efficiency Charts */}
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
                <span>YTD Growth: +16.8%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Labor Efficiency Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Labor Efficiency Trend (12 Months)</h3>
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
              ref={efficiencyRef}
              data={efficiencyChartData}
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
                <span>Live Efficiency Data</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Current: 87.2%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => efficiencyRef.current?.exportToPDF()}>
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
                  <span>Us: {position.value}{position.metric === 'Response Time' ? ' hrs' : '%'}</span>
                  <span>Market Avg: {position.marketAvg}{position.metric === 'Response Time' ? ' hrs' : '%'}</span>
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
            <h3 className="text-lg font-medium text-neutral-100">Service Category Performance</h3>
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