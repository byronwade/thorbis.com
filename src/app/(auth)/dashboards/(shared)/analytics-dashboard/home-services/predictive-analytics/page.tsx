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
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Zap,
  Bot,
  LineChart,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  Star,
  Calendar,
  Cpu,
  Radar,
  Settings,
  BarChart3,
  PieChart,
  Globe,
  Building,
  Calculator,
  Award,
  Briefcase,
  Phone,
  Mail,
  Package,
  Truck,
  Wrench,
  MapPin,
  Shield,
  Eye,
  TrendingUpDown,
  Sparkles,
  Database,
  Network
} from 'lucide-react'

interface PredictiveMetric {
  id: string
  title: string
  currentValue: string | number
  predictedValue: string | number
  confidence: number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
  timeframe: string
  accuracy: number
}

interface MLModel {
  id: string
  name: string
  type: string
  accuracy: number
  lastTrained: string
  status: 'active' | 'training' | 'inactive'
  predictions: number
  confidence: number
  description: string
}

interface PredictionScenario {
  id: string
  name: string
  probability: number
  impact: 'high' | 'medium' | 'low'
  revenue_impact: number
  timeline: string
  factors: string[]
  color: string
}

interface AIInsight {
  id: string
  type: 'opportunity' | 'risk' | 'optimization' | 'trend'
  title: string
  description: string
  confidence: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  action: string
  impact: string
  timeframe: string
  icon: React.ComponentType<{ className?: string }>
}

const predictiveMetrics: PredictiveMetric[] = [
  {
    id: 'revenue-forecast',
    title: 'Revenue Forecast (30 Days)',
    currentValue: '$485K',
    predictedValue: '$542K',
    confidence: 87.3,
    change: '+11.7%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-400',
    description: 'AI-predicted revenue for next 30 days based on historical patterns',
    timeframe: '30 days',
    accuracy: 92.1
  },
  {
    id: 'demand-forecast',
    title: 'Service Demand Forecast',
    currentValue: '1,240',
    predictedValue: '1,485',
    confidence: 91.2,
    change: '+19.8%',
    trend: 'up',
    icon: Activity,
    color: 'text-blue-400',
    description: 'Predicted service requests based on seasonal patterns and trends',
    timeframe: '14 days',
    accuracy: 89.5
  },
  {
    id: 'technician-utilization',
    title: 'Technician Utilization',
    currentValue: '84.2%',
    predictedValue: '92.1%',
    confidence: 85.7,
    change: '+7.9%',
    trend: 'up',
    icon: Users,
    color: 'text-purple-400',
    description: 'Predicted technician capacity utilization optimization',
    timeframe: '7 days',
    accuracy: 88.3
  },
  {
    id: 'customer-satisfaction',
    title: 'Customer Satisfaction',
    currentValue: '4.6/5.0',
    predictedValue: '4.8/5.0',
    confidence: 82.4,
    change: '+0.2',
    trend: 'up',
    icon: Star,
    color: 'text-yellow-400',
    description: 'Predicted customer satisfaction score improvements',
    timeframe: '30 days',
    accuracy: 86.2
  },
  {
    id: 'equipment-failures',
    title: 'Equipment Failure Risk',
    currentValue: '12',
    predictedValue: '8',
    confidence: 94.1,
    change: '-33.3%',
    trend: 'up',
    icon: AlertTriangle,
    color: 'text-orange-400',
    description: 'AI-predicted equipment failure reduction through maintenance',
    timeframe: '60 days',
    accuracy: 91.7
  },
  {
    id: 'profit-margin',
    title: 'Profit Margin Forecast',
    currentValue: '23.4%',
    predictedValue: '26.8%',
    confidence: 89.6,
    change: '+3.4%',
    trend: 'up',
    icon: Calculator,
    color: 'text-cyan-400',
    description: 'Predicted profit margin improvements through optimization',
    timeframe: '45 days',
    accuracy: 90.8
  }
]

const mlModels: MLModel[] = [
  {
    id: 'revenue-prediction',
    name: 'Revenue Prediction Model',
    type: 'Time Series Forecasting',
    accuracy: 92.1,
    lastTrained: '2 hours ago',
    status: 'active',
    predictions: 15420,
    confidence: 89.3,
    description: 'Advanced LSTM model for revenue forecasting using 3 years of historical data'
  },
  {
    id: 'demand-forecasting',
    name: 'Service Demand Predictor',
    type: 'Multi-variate Regression',
    accuracy: 89.5,
    lastTrained: '6 hours ago',
    status: 'active',
    predictions: 8920,
    confidence: 91.2,
    description: 'Gradient boosting model predicting service demand based on weather, seasonality, and market factors'
  },
  {
    id: 'churn-prediction',
    name: 'Customer Churn Predictor',
    type: 'Classification Model',
    accuracy: 86.7,
    lastTrained: '1 day ago',
    status: 'active',
    predictions: 4560,
    confidence: 84.8,
    description: 'Random forest model identifying customers at risk of churn'
  },
  {
    id: 'equipment-maintenance',
    name: 'Predictive Maintenance AI',
    type: 'Anomaly Detection',
    accuracy: 94.2,
    lastTrained: '4 hours ago',
    status: 'training',
    predictions: 2340,
    confidence: 92.1,
    description: 'Deep learning model for equipment failure prediction and maintenance scheduling'
  }
]

const predictionScenarios: PredictionScenario[] = [
  {
    id: 'peak-season-surge',
    name: 'Peak Season Revenue Surge',
    probability: 78.4,
    impact: 'high',
    revenue_impact: 485000,
    timeline: 'Next 60 days',
    factors: ['Historical seasonal patterns', 'Weather forecast', 'Marketing campaigns', 'Technician capacity'],
    color: 'bg-green-500'
  },
  {
    id: 'technician-shortage',
    name: 'Technician Capacity Constraint',
    probability: 65.2,
    impact: 'medium',
    revenue_impact: -125000,
    timeline: 'Next 45 days',
    factors: ['Current hiring rate', 'Training pipeline', 'Market demand', 'Competitor activity'],
    color: 'bg-orange-500'
  },
  {
    id: 'equipment-optimization',
    name: 'Equipment Efficiency Gains',
    probability: 89.1,
    impact: 'medium',
    revenue_impact: 180000,
    timeline: 'Next 90 days',
    factors: ['Predictive maintenance', 'Upgrade schedule', 'Usage patterns', 'Performance data'],
    color: 'bg-blue-500'
  }
]

const aiInsights: AIInsight[] = [
  {
    id: 'hvac-demand-spike',
    type: 'opportunity',
    title: 'HVAC Demand Spike Predicted',
    description: 'Weather forecast indicates 15°F temperature drop next week, historically resulting in 40% increase in HVAC service calls.',
    confidence: 91.2,
    priority: 'high',
    action: 'Increase HVAC technician availability and pre-position equipment',
    impact: '+$85K potential revenue',
    timeframe: '7 days',
    icon: Zap
  },
  {
    id: 'customer-churn-risk',
    type: 'risk',
    title: 'High-Value Customer Churn Risk',
    description: '12 customers with lifetime value >$15K showing churn indicators. Proactive outreach could prevent 75% churn.',
    confidence: 84.7,
    priority: 'critical',
    action: 'Deploy customer success team for personalized outreach',
    impact: 'Prevent $180K revenue loss',
    timeframe: '14 days',
    icon: Shield
  },
  {
    id: 'route-optimization',
    type: 'optimization',
    title: 'Route Efficiency Opportunity',
    description: 'AI analysis shows 23% travel time reduction possible through optimized scheduling and routing algorithms.',
    confidence: 87.9,
    priority: 'medium',
    action: 'Implement dynamic route optimization system',
    impact: '+18% technician productivity',
    timeframe: '30 days',
    icon: MapPin
  },
  {
    id: 'pricing-optimization',
    type: 'trend',
    title: 'Market Pricing Analysis',
    description: 'Competitor analysis suggests 8-12% premium pricing opportunity for premium services without demand impact.',
    confidence: 79.3,
    priority: 'medium',
    action: 'Test premium pricing tiers in select markets',
    impact: '+$95K monthly revenue potential',
    timeframe: '60 days',
    icon: Calculator
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

export default function PredictiveAnalyticsPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [revenueChart, setRevenueChart] = useState<TradingViewChartData[]>([])
  const [demandChart, setDemandChart] = useState<TradingViewChartData[]>([])
  const revenueRef = useRef<TradingViewWrapperRef>(null)
  const demandRef = useRef<TradingViewWrapperRef>(null)

  // Generate predictive analytics chart data
  useEffect(() => {
    const generateRevenueChart = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) // 3 months ago
      
      const baseRevenue = 425000
      
      for (let i = 0; i < 120; i += 7) { // Weekly data points for 4 months (including 1 month forecast)
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        const isForecast = time > now
        
        if (isForecast) {
          // Forecast data with AI predictions
          const seasonalBoost = 1 + 0.15 * Math.sin((i / 365) * Math.PI * 2)
          const trendGrowth = 1 + (i / 5000)
          const aiOptimization = 1.08 // 8% AI-driven improvement
          const weeklyRevenue = baseRevenue * seasonalBoost * trendGrowth * aiOptimization
          
          data.push({
            time: Math.floor(time.getTime() / 1000) as any,
            value: Math.max(380000, weeklyRevenue),
          })
        } else {
          // Historical data
          const seasonalFactor = 1 + 0.12 * Math.sin((i / 365) * Math.PI * 2)
          const trendGrowth = 1 + (i / 6000)
          const randomVariation = 0.92 + Math.random() * 0.16
          const weeklyRevenue = baseRevenue * seasonalFactor * trendGrowth * randomVariation
          
          data.push({
            time: Math.floor(time.getTime() / 1000) as any,
            value: Math.max(350000, weeklyRevenue),
          })
        }
      }
      
      return data
    }

    const generateDemandChart = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) // 3 months ago
      
      const baseDemand = 1240
      
      for (let i = 0; i < 120; i += 7) { // Weekly data points
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        const isForecast = time > now
        
        if (isForecast) {
          // Forecast data with weather and seasonal predictions
          const weatherImpact = 1 + 0.25 * Math.sin((i / 180) * Math.PI)
          const seasonalDemand = 1 + 0.18 * Math.sin((i / 365) * Math.PI * 2 + Math.PI)
          const marketGrowth = 1.12 // 12% growth
          const weeklyDemand = baseDemand * weatherImpact * seasonalDemand * marketGrowth
          
          data.push({
            time: Math.floor(time.getTime() / 1000) as any,
            value: Math.max(980, weeklyDemand),
          })
        } else {
          // Historical data
          const seasonalFactor = 1 + 0.15 * Math.sin((i / 365) * Math.PI * 2 + Math.PI)
          const weekdayFactor = 1.05
          const randomVariation = 0.9 + Math.random() * 0.2
          const weeklyDemand = baseDemand * seasonalFactor * weekdayFactor * randomVariation
          
          data.push({
            time: Math.floor(time.getTime() / 1000) as any,
            value: Math.max(920, weeklyDemand),
          })
        }
      }
      
      return data
    }

    setRevenueChart(generateRevenueChart())
    setDemandChart(generateDemandChart())
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-neutral-100">Advanced Predictive Analytics</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Bot className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Machine Learning
              </Badge>
            </div>
          </div>
          <p className="text-neutral-400 mt-1">AI-driven forecasting and predictive business intelligence for data-driven decisions</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                Prediction Models
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">All Models</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Revenue Forecasting</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Demand Prediction</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Risk Analysis</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Export Predictions
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* Predictive Metrics - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {predictiveMetrics.map((metric) => {
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
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-neutral-100">{metric.predictedValue}</div>
                <div className="text-sm text-neutral-400">{metric.title}</div>
                <div className="text-xs text-neutral-500">Current: {metric.currentValue}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Confidence</span>
                  <span className="text-blue-400">{metric.confidence}%</span>
                </div>
                <div className="relative">
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: '${metric.confidence}%' }}
                    />
                  </div>
                </div>
                <div className="text-xs text-neutral-600">Accuracy: {metric.accuracy}%</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Predictive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Forecast Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-medium text-neutral-100">Revenue Forecast (AI Prediction)</h3>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                ML Powered
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
              ref={revenueRef}
              data={revenueChart}
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
                <span>AI Forecast</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Confidence: 89.3%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => revenueRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Demand Prediction Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Service Demand Prediction</h3>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Weather AI
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
              ref={demandRef}
              data={demandChart}
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
                <span>Live Prediction</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Weather Impact: High</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => demandRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* ML Models & Prediction Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Models Status */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Machine Learning Models</h3>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Active Models
            </Badge>
          </div>
          <div className="space-y-4">
            {mlModels.map((model) => (
              <div key={model.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-400" />
                    <span className="font-medium text-neutral-200">{model.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      model.status === 'active' ? "bg-green-600/20 text-green-400 border-green-600/30" :
                      model.status === 'training' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                      "bg-neutral-600/20 text-neutral-400 border-neutral-600/30"
                    )}
                  >
                    {model.status}
                  </Badge>
                </div>
                <div className="text-sm text-neutral-400">{model.description}</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-500">Accuracy</div>
                    <div className="font-medium text-neutral-200">{model.accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Predictions</div>
                    <div className="font-medium text-neutral-200">{formatNumber(model.predictions)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Confidence</div>
                    <div className="font-medium text-neutral-200">{model.confidence}%</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: '${model.accuracy}%' }}
                    />
                  </div>
                </div>
                <div className="text-xs text-neutral-600">
                  Last trained: {model.lastTrained} • Type: {model.type}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction Scenarios */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUpDown className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Prediction Scenarios</h3>
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Probability Analysis
            </Badge>
          </div>
          <div className="space-y-4">
            {predictionScenarios.map((scenario) => (
              <div 
                key={scenario.id} 
                className={cn(
                  "p-4 rounded-lg border",
                  scenario.impact === 'high' ? "bg-green-600/10 border-green-600/20" :
                  scenario.impact === 'medium' ? "bg-orange-600/10 border-orange-600/20" :
                  "bg-yellow-600/10 border-yellow-600/20"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-neutral-200">{scenario.name}</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", scenario.color)} />
                    <span className="text-sm text-neutral-400">{scenario.probability}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <div className="text-neutral-500">Revenue Impact</div>
                    <div className={cn(
                      "font-medium",
                      scenario.revenue_impact > 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {scenario.revenue_impact > 0 ? '+' : '}{formatCurrency(scenario.revenue_impact)}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Timeline</div>
                    <div className="font-medium text-neutral-200">{scenario.timeline}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-neutral-400">Key Factors:</div>
                  <div className="flex flex-wrap gap-1">
                    {scenario.factors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="bg-neutral-700/50 text-neutral-300 text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="relative mt-3">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", scenario.color)}
                      style={{ width: '${scenario.probability}%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-neutral-100">AI-Generated Business Insights</h3>
          <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            Actionable Intelligence
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {aiInsights.map((insight) => {
            const Icon = insight.icon
            return (
              <div 
                key={insight.id} 
                className={cn(
                  "p-4 rounded-lg border",
                  insight.type === 'opportunity' ? "bg-green-600/10 border-green-600/20" :
                  insight.type === 'risk' ? "bg-red-600/10 border-red-600/20" :
                  insight.type === 'optimization' ? "bg-blue-600/10 border-blue-600/20" :
                  "bg-purple-600/10 border-purple-600/20"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      "h-5 w-5",
                      insight.type === 'opportunity' ? "text-green-400" :
                      insight.type === 'risk' ? "text-red-400" :
                      insight.type === 'optimization' ? "text-blue-400" :
                      "text-purple-400"
                    )} />
                    <span className="font-medium text-neutral-200">{insight.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        insight.priority === 'critical' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                        insight.priority === 'high' ? "bg-orange-600/20 text-orange-400 border-orange-600/30" :
                        insight.priority === 'medium' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                        "bg-green-600/20 text-green-400 border-green-600/30"
                      )}
                    >
                      {insight.priority}
                    </Badge>
                    <Badge variant="secondary" className="bg-neutral-700/50 text-neutral-300 text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-neutral-400 mb-3">{insight.description}</p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-neutral-500">Recommended Action: </span>
                    <span className="text-neutral-200">{insight.action}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-neutral-500">Potential Impact: </span>
                    <span className="text-neutral-200">{insight.impact}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-neutral-500">Timeline: </span>
                    <span className="text-neutral-200">{insight.timeframe}</span>
                  </div>
                </div>
                <div className="relative mt-3">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        insight.type === 'opportunity' ? "bg-green-500" :
                        insight.type === 'risk' ? "bg-red-500" :
                        insight.type === 'optimization' ? "bg-blue-500" :
                        "bg-purple-500"
                      )}
                      style={{ width: '${insight.confidence}%' }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}