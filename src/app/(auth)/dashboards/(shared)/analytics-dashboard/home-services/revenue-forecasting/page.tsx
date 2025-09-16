"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TradingViewWrapper, TradingViewWrapperRef, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'
import { TimeFrameControls, TimeRange } from '@/components/analytics/controls/time-frame-controls'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Calculator,
  Crosshair,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  Bot,
  Radar,
  Cpu,
  Settings2,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface ForecastMetric {
  id: string
  title: string
  value: string
  confidence: number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
  timeframe: string
}

interface PredictionModel {
  name: string
  accuracy: number
  lastUpdated: string
  confidence: number
  status: 'active' | 'training' | 'offline'
  predictions: number
}

interface SeasonalPattern {
  period: string
  factor: number
  confidence: number
  impact: string
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface ScenarioAnalysis {
  scenario: string
  probability: number
  impact: string
  revenueChange: number
  timeframe: string
  color: string
}

const forecastMetrics: ForecastMetric[] = [
  {
    id: 'next-month',
    title: 'Next Month Forecast',
    value: '$298,500',
    confidence: 87,
    change: '+18.2%',
    trend: 'up',
    icon: Calendar,
    color: 'text-blue-400',
    timeframe: '30 days'
  },
  {
    id: 'q4-projection',
    title: 'Q4 Revenue Projection',
    value: '$850,000',
    confidence: 82,
    change: '+22.1%',
    trend: 'up',
    icon: Target,
    color: 'text-green-400',
    timeframe: '90 days'
  },
  {
    id: 'annual-forecast',
    title: 'Annual Forecast',
    value: '$3.2M',
    confidence: 78,
    change: '+15.8%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-purple-400',
    timeframe: '365 days'
  },
  {
    id: 'peak-season',
    title: 'Peak Season Revenue',
    value: '$425,000',
    confidence: 91,
    change: '+28.5%',
    trend: 'up',
    icon: Activity,
    color: 'text-orange-400',
    timeframe: 'Summer'
  },
  {
    id: 'growth-rate',
    title: 'Projected Growth Rate',
    value: '24.3%',
    confidence: 85,
    change: '+2.1%',
    trend: 'up',
    icon: Calculator,
    color: 'text-cyan-400',
    timeframe: 'YoY'
  },
  {
    id: 'forecast-accuracy',
    title: 'Model Accuracy',
    value: '91.2%',
    confidence: 94,
    change: '+3.8%',
    trend: 'up',
    icon: Crosshair,
    color: 'text-pink-400',
    timeframe: 'Current'
  }
]

const predictionModels: PredictionModel[] = [
  {
    name: 'ARIMA Time Series',
    accuracy: 91.2,
    lastUpdated: '2 hours ago',
    confidence: 94,
    status: 'active',
    predictions: 1247
  },
  {
    name: 'Neural Network',
    accuracy: 89.7,
    lastUpdated: '4 hours ago',
    confidence: 87,
    status: 'active',
    predictions: 892
  },
  {
    name: 'Seasonal Decomposition',
    accuracy: 85.3,
    lastUpdated: '1 hour ago',
    confidence: 82,
    status: 'active',
    predictions: 634
  },
  {
    name: 'Ensemble Model',
    accuracy: 93.1,
    lastUpdated: '30 min ago',
    confidence: 96,
    status: 'active',
    predictions: 1456
  }
]

const seasonalPatterns: SeasonalPattern[] = [
  {
    period: 'Summer Peak',
    factor: 1.35,
    confidence: 92,
    impact: 'High demand for HVAC services',
    trend: 'increasing'
  },
  {
    period: 'Winter Surge',
    factor: 1.28,
    confidence: 88,
    impact: 'Heating system repairs and maintenance',
    trend: 'stable'
  },
  {
    period: 'Spring Maintenance',
    factor: 1.15,
    confidence: 85,
    impact: 'Preventive maintenance bookings',
    trend: 'increasing'
  },
  {
    period: 'Holiday Slowdown',
    factor: 0.72,
    confidence: 94,
    impact: 'Reduced service calls during holidays',
    trend: 'stable'
  }
]

const scenarioAnalyses: ScenarioAnalysis[] = [
  {
    scenario: 'Economic Expansion',
    probability: 35,
    impact: 'Increased commercial projects',
    revenueChange: 18,
    timeframe: '6-12 months',
    color: 'bg-green-500'
  },
  {
    scenario: 'Market Saturation',
    probability: 25,
    impact: 'Slower growth, price competition',
    revenueChange: -8,
    timeframe: '12-18 months',
    color: 'bg-orange-500'
  },
  {
    scenario: 'Technology Adoption',
    probability: 40,
    impact: 'Smart home systems drive demand',
    revenueChange: 22,
    timeframe: '3-9 months',
    color: 'bg-blue-500'
  },
  {
    scenario: 'Regulatory Changes',
    probability: 20,
    impact: 'New efficiency standards',
    revenueChange: 12,
    timeframe: '9-15 months',
    color: 'bg-purple-500'
  }
]

export default function RevenueForecastingPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [forecastChartData, setForecastChartData] = useState<TradingViewChartData[]>([])
  const [scenarioChartData, setScenarioChartData] = useState<TradingViewChartData[]>([])
  const tradingViewRef = useRef<TradingViewWrapperRef>(null)
  const scenarioRef = useRef<TradingViewWrapperRef>(null)

  // Generate comprehensive forecast chart data
  useEffect(() => {
    const generateForecastData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) // 180 days ago (historical)
      const endTime = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000) // 180 days forward (forecast)
      
      let baseRevenue = 45000 // Starting revenue
      
      for (let i = -180; i <= 180; i++) {
        const time = new Date(startTime.getTime() + (i + 180) * 24 * 60 * 60 * 1000)
        
        // Historical vs forecast logic
        if (i <= 0) {
          // Historical data with realistic patterns
          const seasonalFactor = 1 + 0.2 * Math.sin((i / 30) * Math.PI) // Monthly cycles
          const growthTrend = 1 + (i / 2000) // Gradual historical growth
          const randomVariation = 0.85 + Math.random() * 0.3 // ±15% variation
          
          const dailyRevenue = baseRevenue * seasonalFactor * growthTrend * randomVariation
          
          data.push({
            time: Math.floor(time.getTime() / 1000) as any,
            value: Math.max(30000, dailyRevenue),
          })
        } else {
          // Forecast data with confidence bands and trend projection
          const seasonalFactor = 1 + 0.25 * Math.sin(((i + 180) / 30) * Math.PI) // Projected seasonal patterns
          const forecastGrowth = 1 + (i / 1000) // Projected growth rate
          const confidenceReduction = 1 - (i / 1000) // Decreasing confidence over time
          const modelVariation = 0.9 + Math.random() * 0.2 * confidenceReduction // Reduced variation with confidence
          
          const forecastRevenue = baseRevenue * 1.15 * seasonalFactor * forecastGrowth * modelVariation
          
          data.push({
            time: Math.floor(time.getTime() / 1000) as any,
            value: Math.max(35000, forecastRevenue),
          })
        }
      }
      
      return data
    }

    // Generate scenario analysis chart data
    const generateScenarioData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Start 30 days from now
      
      let baseRevenue = 52000 // Starting forecast revenue
      
      for (let i = 0; i < 365; i++) {
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Weighted scenario impact
        const economicExpansion = 0.35 * 1.18 // 35% probability, 18% impact
        const marketSaturation = 0.25 * 0.92 // 25% probability, -8% impact
        const technologyAdoption = 0.40 * 1.22 // 40% probability, 22% impact
        const regulatoryChanges = 0.20 * 1.12 // 20% probability, 12% impact
        
        const compositeImpact = economicExpansion + marketSaturation + technologyAdoption + regulatoryChanges
        const seasonalFactor = 1 + 0.2 * Math.sin((i / 30) * Math.PI)
        const uncertaintyFactor = 0.95 + Math.random() * 0.1 // ±5% uncertainty
        
        const scenarioRevenue = baseRevenue * compositeImpact * seasonalFactor * uncertaintyFactor
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(40000, scenarioRevenue),
        })
      }
      
      return data
    }

    setForecastChartData(generateForecastData())
    setScenarioChartData(generateScenarioData())
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
            <h1 className="text-2xl font-bold text-neutral-100">Revenue Forecasting Dashboard</h1>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Bot className="h-3 w-3 mr-1" />
              Machine Learning
            </Badge>
          </div>
          <p className="text-neutral-400 mt-1">Advanced revenue predictions using AI models and scenario analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                All Models
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">All Models</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">ARIMA Only</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Neural Network</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Ensemble Model</DropdownMenuItem>
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

      {/* Forecast Metrics - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {forecastMetrics.map((metric) => {
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
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">{metric.timeframe}</span>
                <span className={cn(
                  "font-medium",
                  metric.confidence >= 90 ? "text-green-400" :
                  metric.confidence >= 80 ? "text-blue-400" :
                  metric.confidence >= 70 ? "text-yellow-400" : "text-red-400"
                )}>
                  {metric.confidence}% confidence
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Forecast Chart - TradingView */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">360-Day Revenue Forecast</h3>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              TradingView Powered
            </Badge>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              Historical + Forecast
            </Badge>
          </div>
          <TimeFrameControls
            onTimeRangeChange={handleTimeRangeChange}
            currentRange={currentTimeRange}
            enableRealTime={true}
            enableComparison={true}
            compact={true}
          />
        </div>
        <div className="h-96">
          <TradingViewWrapper
            ref={tradingViewRef}
            data={forecastChartData}
            type="area"
            height="100%"
            theme="dark"
            enableRealTime={true}
            className="h-full w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Forecasting</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Historical Data</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Forecast Projection</span>
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
        {/* Prediction Models Performance */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">AI Prediction Models</h3>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Real-time
            </Badge>
          </div>
          <div className="space-y-4">
            {predictionModels.map((model, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      model.status === 'active' ? "bg-green-500" :
                      model.status === 'training' ? "bg-yellow-500" : "bg-red-500"
                    )} />
                    <span className="font-medium text-neutral-200">{model.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">{model.accuracy}% accuracy</span>
                    <Badge variant="outline" className="text-xs border-neutral-600">
                      {model.predictions} predictions
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        model.accuracy >= 90 ? "bg-green-500" :
                        model.accuracy >= 85 ? "bg-blue-500" :
                        model.accuracy >= 80 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: '${model.accuracy}%' }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Last updated: {model.lastUpdated}</span>
                  <span>Confidence: {model.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Patterns Analysis */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Seasonal Patterns</h3>
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Pattern Analysis
            </Badge>
          </div>
          <div className="space-y-4">
            {seasonalPatterns.map((pattern, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200">{pattern.period}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      pattern.factor > 1 ? "text-green-400" :
                      pattern.factor < 1 ? "text-red-400" : "text-neutral-400"
                    )}>
                      {pattern.factor > 1 ? '+' : '}{((pattern.factor - 1) * 100).toFixed(1)}%
                    </span>
                    <Badge variant="outline" className="text-xs border-neutral-600">
                      {pattern.confidence}% confidence
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-neutral-400">{pattern.impact}</div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        pattern.factor > 1.2 ? "bg-green-500" :
                        pattern.factor > 1 ? "bg-blue-500" :
                        pattern.factor > 0.8 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: '${pattern.confidence}%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Analysis Chart */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Scenario Analysis Forecast</h3>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              TradingView Powered
            </Badge>
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Weighted Scenarios
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
            ref={scenarioRef}
            data={scenarioChartData}
            type="line"
            height="100%"
            theme="dark"
            enableRealTime={true}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* Scenario Impact Analysis */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Radar className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-neutral-100">Market Scenario Analysis</h3>
          <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            Probability Weighted
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarioAnalyses.map((scenario, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">{scenario.scenario}</span>
                <Badge variant="outline" className="text-xs border-neutral-600">
                  {scenario.probability}%
                </Badge>
              </div>
              <div className="text-sm text-neutral-400">{scenario.impact}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">{scenario.timeframe}</span>
                <span className={cn(
                  "text-sm font-medium",
                  scenario.revenueChange > 0 ? "text-green-400" : "text-red-400"
                )}>
                  {scenario.revenueChange > 0 ? '+' : '}{scenario.revenueChange}%
                </span>
              </div>
              <div className="relative">
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
  )
}