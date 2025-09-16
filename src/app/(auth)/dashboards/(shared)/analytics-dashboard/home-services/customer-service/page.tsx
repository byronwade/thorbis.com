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
  Users,
  Star,
  MessageSquare,
  Phone,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Zap,
  BarChart3,
  LineChart,
  Brain,
  Bot
} from 'lucide-react'

interface CustomerServiceMetric {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface SatisfactionTrend {
  metric: string
  current: number
  target: number
  trend: string
  color: string
}

interface ServiceChannel {
  channel: string
  volume: number
  avgResponseTime: number
  satisfaction: number
  resolved: number
  color: string
}

interface FeedbackSentiment {
  category: string
  positive: number
  neutral: number
  negative: number
  totalResponses: number
  trend: string
}

const customerServiceMetrics: CustomerServiceMetric[] = [
  {
    id: 'satisfaction-score',
    title: 'Customer Satisfaction',
    value: '4.8/5.0',
    change: '+0.2',
    trend: 'up',
    icon: Star,
    color: 'text-yellow-400'
  },
  {
    id: 'response-time',
    title: 'Avg Response Time',
    value: '2.3h',
    change: '-0.7h',
    trend: 'up',
    icon: Clock,
    color: 'text-blue-400'
  },
  {
    id: 'resolution-rate',
    title: 'First-Call Resolution',
    value: '87%',
    change: '+5%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-green-400'
  },
  {
    id: 'total-tickets',
    title: 'Total Tickets',
    value: 342,
    change: '+12%',
    trend: 'up',
    icon: MessageSquare,
    color: 'text-purple-400'
  },
  {
    id: 'nps-score',
    title: 'Net Promoter Score',
    value: 72,
    change: '+8',
    trend: 'up',
    icon: Heart,
    color: 'text-pink-400'
  },
  {
    id: 'escalation-rate',
    title: 'Escalation Rate',
    value: '4.2%',
    change: '-1.8%',
    trend: 'up',
    icon: AlertTriangle,
    color: 'text-orange-400'
  }
]

const satisfactionTrends: SatisfactionTrend[] = [
  {
    metric: 'Service Quality',
    current: 94,
    target: 90,
    trend: '+3%',
    color: 'bg-green-500'
  },
  {
    metric: 'Communication',
    current: 89,
    target: 85,
    trend: '+6%',
    color: 'bg-blue-500'
  },
  {
    metric: 'Timeliness',
    current: 91,
    target: 88,
    trend: '+2%',
    color: 'bg-purple-500'
  },
  {
    metric: 'Problem Resolution',
    current: 87,
    target: 85,
    trend: '+4%',
    color: 'bg-orange-500'
  }
]

const serviceChannels: ServiceChannel[] = [
  {
    channel: 'Phone Support',
    volume: 156,
    avgResponseTime: 45,
    satisfaction: 4.6,
    resolved: 89,
    color: 'bg-blue-500'
  },
  {
    channel: 'Email Support',
    volume: 89,
    avgResponseTime: 180,
    satisfaction: 4.4,
    resolved: 92,
    color: 'bg-green-500'
  },
  {
    channel: 'Live Chat',
    volume: 67,
    avgResponseTime: 5,
    satisfaction: 4.8,
    resolved: 85,
    color: 'bg-purple-500'
  },
  {
    channel: 'In-Person',
    volume: 30,
    avgResponseTime: 0,
    satisfaction: 4.9,
    resolved: 95,
    color: 'bg-orange-500'
  }
]

const feedbackSentiment: FeedbackSentiment[] = [
  {
    category: 'Service Quality',
    positive: 78,
    neutral: 18,
    negative: 4,
    totalResponses: 245,
    trend: '+12%'
  },
  {
    category: 'Staff Professionalism',
    positive: 85,
    neutral: 12,
    negative: 3,
    totalResponses: 198,
    trend: '+8%'
  },
  {
    category: 'Response Time',
    positive: 72,
    neutral: 22,
    negative: 6,
    totalResponses: 167,
    trend: '+15%'
  },
  {
    category: 'Problem Resolution',
    positive: 81,
    neutral: 15,
    negative: 4,
    totalResponses: 203,
    trend: '+7%'
  }
]

export default function CustomerServiceAnalyticsPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [satisfactionChartData, setSatisfactionChartData] = useState<TradingViewChartData[]>([])
  const [responseTimeChartData, setResponseTimeChartData] = useState<TradingViewChartData[]>([])
  const tradingViewRef = useRef<TradingViewWrapperRef>(null)
  const responseTimeRef = useRef<TradingViewWrapperRef>(null)

  // Generate customer satisfaction chart data
  useEffect(() => {
    const generateSatisfactionData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
      
      const baseSatisfaction = 4.5 // Starting satisfaction score
      
      for (let i = 0; i < 90; i++) {
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic patterns for satisfaction trends
        const weekdayFactor = [1, 2, 3, 4, 5].includes(time.getDay()) ? 1.02 : 0.98 // Slightly higher on weekdays
        const trendImprovement = 1 + (i / 1000) // Gradual improvement over time
        const randomVariation = 0.95 + Math.random() * 0.1 // ±5% variation
        
        const dailySatisfaction = baseSatisfaction * weekdayFactor * trendImprovement * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(3.0, Math.min(5.0, dailySatisfaction)),
        })
      }
      
      return data
    }

    // Generate response time chart data
    const generateResponseTimeData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
      
      const baseResponseTime = 180 // Starting response time in minutes (3 hours)
      
      for (let i = 0; i < 90; i++) {
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic patterns for response time improvements
        const weekdayFactor = [1, 2, 3, 4, 5].includes(time.getDay()) ? 1.1 : 0.8 // Higher response times on weekdays
        const improvementTrend = 1 - (i / 500) // Gradual improvement over time
        const randomVariation = 0.8 + Math.random() * 0.4 // ±20% variation
        
        const dailyResponseTime = baseResponseTime * weekdayFactor * improvementTrend * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(60, Math.min(300, dailyResponseTime)), // 1-5 hours range
        })
      }
      
      return data
    }

    setSatisfactionChartData(generateSatisfactionData())
    setResponseTimeChartData(generateResponseTimeData())
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
            <h1 className="text-2xl font-bold text-neutral-100">Customer Service Analytics</h1>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Brain className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
          <p className="text-neutral-400 mt-1">Customer satisfaction, response times, and service quality metrics</p>
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

      {/* Key Customer Service Metrics - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {customerServiceMetrics.map((metric) => {
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
            </div>
          )
        })}
      </div>

      {/* TradingView Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Satisfaction Trend Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-medium text-neutral-100">Customer Satisfaction Trending</h3>
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
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
              data={satisfactionChartData}
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
                <span>Current: {satisfactionChartData[satisfactionChartData.length - 1]?.value?.toFixed(1) || '0'}/5.0</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.exportToPDF()}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Response Time Trend Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Response Time Trending</h3>
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
              ref={responseTimeRef}
              data={responseTimeChartData}
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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Data</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Current: {Math.round(responseTimeChartData[responseTimeChartData.length - 1]?.value || 0)} min</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => responseTimeRef.current?.exportToPDF()}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satisfaction Trends by Category - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-medium text-neutral-100">Satisfaction by Category</h3>
          </div>
          <div className="space-y-4">
            {satisfactionTrends.map((trend, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", trend.color)} />
                    <span className="font-medium text-neutral-200 text-sm">{trend.metric}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">{trend.current}%</span>
                    <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
                      {trend.trend}
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", trend.color)}
                      style={{ width: `${trend.current}%' }}
                    />
                  </div>
                  <div className="absolute top-0 left-0 h-2 w-full flex items-center">
                    <div 
                      className="w-0.5 h-3 bg-neutral-400 opacity-60"
                      style={{ marginLeft: '${trend.target}%' }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Target: {trend.target}%</span>
                  <span>Current: {trend.current}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Channels Performance - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Service Channels Performance</h3>
          </div>
          <div className="space-y-4">
            {serviceChannels.map((channel, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", channel.color)} />
                    <span className="font-medium text-neutral-200 text-sm">{channel.channel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">{channel.volume} tickets</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-400">Response</div>
                    <div className="font-medium text-neutral-200">
                      {channel.avgResponseTime === 0 ? 'Instant` : 
                       channel.avgResponseTime < 60 ? `${channel.avgResponseTime}m` : 
                       `${Math.round(channel.avgResponseTime / 60)}h`}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Satisfaction</div>
                    <div className="font-medium text-neutral-200">{channel.satisfaction}/5.0</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Resolved</div>
                    <div className="font-medium text-neutral-200">{channel.resolved}%</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", channel.color)}
                      style={{ width: `${channel.resolved}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Sentiment Analysis - Data-Focused */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-medium text-neutral-100">AI-Powered Sentiment Analysis</h3>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            AI Analysis
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feedbackSentiment.map((sentiment, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">{sentiment.category}</span>
                <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
                  {sentiment.trend}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3 text-green-400" />
                    <span className="text-neutral-400">Positive</span>
                  </div>
                  <span className="text-green-400">{sentiment.positive}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-neutral-500" />
                    <span className="text-neutral-400">Neutral</span>
                  </div>
                  <span className="text-neutral-400">{sentiment.neutral}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="h-3 w-3 text-red-400" />
                    <span className="text-neutral-400">Negative</span>
                  </div>
                  <span className="text-red-400">{sentiment.negative}%</span>
                </div>
              </div>
              <div className="relative h-6 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500"
                  style={{ width: `${sentiment.positive}%` }}
                />
                <div 
                  className="absolute top-0 h-full bg-neutral-500"
                  style={{ 
                    left: `${sentiment.positive}%`,
                    width: `${sentiment.neutral}%` 
                  }}
                />
                <div 
                  className="absolute top-0 h-full bg-red-500"
                  style={{ 
                    left: `${sentiment.positive + sentiment.neutral}%',
                    width: '${sentiment.negative}%' 
                  }}
                />
              </div>
              <div className="text-xs text-neutral-500 text-center">
                {sentiment.totalResponses} responses
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}