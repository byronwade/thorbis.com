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
  Heart,
  Star,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  UserPlus,
  UserMinus,
  Eye,
  MousePointer,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Award,
  Target,
  Brain,
  Bot,
  Lightbulb,
  Route,
  MapPin,
  Smartphone,
  Globe,
  Search,
  FileText,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  LineChart,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Timer,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Layers,
  Navigation
} from 'lucide-react'

interface JourneyMetric {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
  benchmark?: string
  description: string
}

interface TouchpointData {
  id: string
  name: string
  channel: 'website' | 'phone' | 'email' | 'social' | 'in-person' | 'app'
  interactions: number
  conversionRate: number
  satisfaction: number
  averageTime: number
  dropoffRate: number
  color: string
}

interface CustomerSegment {
  id: string
  name: string
  size: number
  percentage: number
  averageValue: number
  retention: number
  satisfaction: number
  growthRate: number
  characteristics: string[]
  color: string
}

interface JourneyStage {
  id: string
  name: string
  customers: number
  conversionToNext: number
  averageTime: number
  dropoffRate: number
  keyActions: string[]
  painPoints: string[]
  opportunities: string[]
  satisfaction: number
}

interface CustomerFeedback {
  id: string
  customer: string
  stage: string
  channel: string
  sentiment: 'positive' | 'neutral' | 'negative'
  category: string
  feedback: string
  timestamp: string
  resolution?: string
  impact: 'high' | 'medium' | 'low'
}

interface PersonaInsight {
  id: string
  persona: string
  description: string
  preferences: string[]
  painPoints: string[]
  motivations: string[]
  size: number
  valueScore: number
  retentionRate: number
}

const journeyMetrics: JourneyMetric[] = [
  {
    id: 'customer-lifetime-value',
    title: 'Customer Lifetime Value',
    value: '$4,850',
    change: '+12.4%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-400',
    benchmark: '$4,200',
    description: 'Average value per customer over their lifetime'
  },
  {
    id: 'acquisition-cost',
    title: 'Customer Acquisition Cost',
    value: '$285',
    change: '-8.2%',
    trend: 'up',
    icon: UserPlus,
    color: 'text-blue-400',
    benchmark: '$320',
    description: 'Cost to acquire a new customer'
  },
  {
    id: 'net-promoter-score',
    title: 'Net Promoter Score',
    value: 72,
    change: '+8',
    trend: 'up',
    icon: Heart,
    color: 'text-pink-400',
    benchmark: '65',
    description: 'Customer loyalty and recommendation score'
  },
  {
    id: 'retention-rate',
    title: 'Customer Retention Rate',
    value: '89.2%',
    change: '+3.1%',
    trend: 'up',
    icon: Award,
    color: 'text-purple-400',
    benchmark: '85%',
    description: '12-month customer retention percentage'
  },
  {
    id: 'time-to-first-value',
    title: 'Time to First Value',
    value: '2.3 days',
    change: '-0.5 days',
    trend: 'up',
    icon: Timer,
    color: 'text-orange-400',
    benchmark: '3 days',
    description: 'Time from signup to first service completion'
  },
  {
    id: 'churn-rate',
    title: 'Monthly Churn Rate',
    value: '2.8%',
    change: '-0.9%',
    trend: 'up',
    icon: UserMinus,
    color: 'text-red-400',
    benchmark: '4%',
    description: 'Percentage of customers lost each month'
  }
]

const touchpointData: TouchpointData[] = [
  {
    id: 'website',
    name: 'Website',
    channel: 'website',
    interactions: 2847,
    conversionRate: 12.4,
    satisfaction: 4.2,
    averageTime: 180,
    dropoffRate: 23.1,
    color: 'bg-blue-500'
  },
  {
    id: 'phone',
    name: 'Phone Calls',
    channel: 'phone',
    interactions: 1563,
    conversionRate: 68.9,
    satisfaction: 4.7,
    averageTime: 420,
    dropoffRate: 5.2,
    color: 'bg-green-500'
  },
  {
    id: 'email',
    name: 'Email',
    channel: 'email',
    interactions: 3421,
    conversionRate: 8.7,
    satisfaction: 4.1,
    averageTime: 45,
    dropoffRate: 31.5,
    color: 'bg-purple-500'
  },
  {
    id: 'social',
    name: 'Social Media',
    channel: 'social',
    interactions: 892,
    conversionRate: 15.3,
    satisfaction: 4.0,
    averageTime: 90,
    dropoffRate: 28.7,
    color: 'bg-pink-500'
  },
  {
    id: 'app',
    name: 'Mobile App',
    channel: 'app',
    interactions: 1234,
    conversionRate: 22.1,
    satisfaction: 4.5,
    averageTime: 120,
    dropoffRate: 18.9,
    color: 'bg-orange-500'
  }
]

const customerSegments: CustomerSegment[] = [
  {
    id: 'residential-premium',
    name: 'Residential Premium',
    size: 1247,
    percentage: 34.2,
    averageValue: 6850,
    retention: 94.3,
    satisfaction: 4.8,
    growthRate: 18.4,
    characteristics: ['High-income households', 'Regular maintenance contracts', 'Emergency service priority'],
    color: 'bg-green-500'
  },
  {
    id: 'residential-standard',
    name: 'Residential Standard',
    size: 1685,
    percentage: 46.1,
    averageValue: 3420,
    retention: 87.2,
    satisfaction: 4.5,
    growthRate: 12.1,
    characteristics: ['Middle-income families', 'Seasonal service needs', 'Price-conscious'],
    color: 'bg-blue-500'
  },
  {
    id: 'commercial-small',
    name: 'Small Business',
    size: 478,
    percentage: 13.1,
    averageValue: 8920,
    retention: 91.7,
    satisfaction: 4.6,
    growthRate: 22.8,
    characteristics: ['Local businesses', 'Regular maintenance', 'Bulk service discounts'],
    color: 'bg-purple-500'
  },
  {
    id: 'commercial-enterprise',
    name: 'Enterprise',
    size: 142,
    percentage: 3.9,
    averageValue: 24680,
    retention: 97.1,
    satisfaction: 4.9,
    growthRate: 28.5,
    characteristics: ['Large facilities', 'Contract services', 'Dedicated account management'],
    color: 'bg-orange-500'
  },
  {
    id: 'emergency-only',
    name: 'Emergency Only',
    size: 98,
    percentage: 2.7,
    averageValue: 1250,
    retention: 42.8,
    satisfaction: 4.2,
    growthRate: -5.3,
    characteristics: ['One-time service', 'Price-sensitive', 'Urgent needs only'],
    color: 'bg-red-500'
  }
]

const journeyStages: JourneyStage[] = [
  {
    id: 'awareness',
    name: 'Awareness',
    customers: 10000,
    conversionToNext: 18.5,
    averageTime: 7,
    dropoffRate: 81.5,
    keyActions: ['Website visits', 'Social media engagement', 'Word-of-mouth referrals'],
    painPoints: ['Limited brand recognition', 'Competitive market'],
    opportunities: ['SEO optimization', 'Content marketing', 'Referral programs'],
    satisfaction: 3.8
  },
  {
    id: 'consideration',
    name: 'Consideration',
    customers: 1850,
    conversionToNext: 42.7,
    averageTime: 12,
    dropoffRate: 57.3,
    keyActions: ['Quote requests', 'Service comparisons', 'Review reading'],
    painPoints: ['Complex pricing', 'Long quote process'],
    opportunities: ['Instant quoting', 'Transparent pricing', 'Customer testimonials'],
    satisfaction: 4.1
  },
  {
    id: 'purchase',
    name: 'Purchase',
    customers: 790,
    conversionToNext: 94.3,
    averageTime: 3,
    dropoffRate: 5.7,
    keyActions: ['Service booking', 'Payment processing', 'Scheduling'],
    painPoints: ['Scheduling conflicts', 'Payment options'],
    opportunities: ['Flexible scheduling', 'Payment plans', 'Online booking'],
    satisfaction: 4.4
  },
  {
    id: 'service',
    name: 'Service Delivery',
    customers: 745,
    conversionToNext: 87.8,
    averageTime: 1,
    dropoffRate: 12.2,
    keyActions: ['Service completion', 'Quality check', 'Customer communication'],
    painPoints: ['Service delays', 'Communication gaps'],
    opportunities: ['Real-time updates', 'Quality assurance', 'Follow-up calls'],
    satisfaction: 4.6
  },
  {
    id: 'retention',
    name: 'Retention',
    customers: 654,
    conversionToNext: 78.4,
    averageTime: 90,
    dropoffRate: 21.6,
    keyActions: ['Follow-up surveys', 'Maintenance reminders', 'Loyalty programs'],
    painPoints: ['Limited ongoing engagement', 'Service reminders'],
    opportunities: ['Automated reminders', 'Loyalty rewards', 'Preventive maintenance'],
    satisfaction: 4.7
  },
  {
    id: 'advocacy',
    name: 'Advocacy',
    customers: 513,
    conversionToNext: 65.3,
    averageTime: 180,
    dropoffRate: 34.7,
    keyActions: ['Referrals', 'Reviews', 'Social sharing'],
    painPoints: ['Low referral motivation', 'Review requests'],
    opportunities: ['Referral incentives', 'Review automation', 'Social integration'],
    satisfaction: 4.9
  }
]

const customerFeedback: CustomerFeedback[] = [
  {
    id: 'fb-001',
    customer: 'Sarah Johnson',
    stage: 'Service Delivery',
    channel: 'Phone',
    sentiment: 'positive',
    category: 'Service Quality',
    feedback: 'Technician was extremely professional and explained everything clearly. Fixed the issue quickly.',
    timestamp: '2 hours ago',
    resolution: 'Shared positive feedback with technician and team',
    impact: 'high'
  },
  {
    id: 'fb-002',
    customer: 'Mike Chen',
    stage: 'Consideration',
    channel: 'Website',
    sentiment: 'negative',
    category: 'Pricing',
    feedback: 'Quote process is too complicated and takes too long. Need faster response.',
    timestamp: '4 hours ago',
    impact: 'medium'
  },
  {
    id: 'fb-003',
    customer: 'Lisa Rodriguez',
    stage: 'Retention',
    channel: 'Email',
    sentiment: 'positive',
    category: 'Customer Service',
    feedback: 'Love the maintenance reminder emails. Very helpful to stay on top of HVAC needs.',
    timestamp: '1 day ago',
    resolution: 'Enhanced reminder system based on feedback',
    impact: 'medium'
  }
]

const personaInsights: PersonaInsight[] = [
  {
    id: 'busy-professional',
    persona: 'Busy Professional',
    description: 'High-income, time-pressed individuals who value convenience and quality',
    preferences: ['Online booking', 'Evening/weekend appointments', 'Premium services'],
    painPoints: ['Limited availability during business hours', 'Long service windows'],
    motivations: ['Convenience', 'Quality', 'Time savings'],
    size: 28.4,
    valueScore: 92,
    retentionRate: 94.2
  },
  {
    id: 'budget-conscious-family',
    persona: 'Budget-Conscious Family',
    description: 'Price-sensitive customers who need reliable service at competitive prices',
    preferences: ['Transparent pricing', 'Payment plans', 'DIY guidance'],
    painPoints: ['Unexpected costs', 'Complex pricing structures'],
    motivations: ['Value for money', 'Reliability', 'Family safety'],
    size: 35.7,
    valueScore: 68,
    retentionRate: 78.9
  },
  {
    id: 'tech-savvy-millennial',
    persona: 'Tech-Savvy Millennial',
    description: 'Digital-first customers who expect modern, connected experiences',
    preferences: ['Mobile app', 'Real-time updates', 'Digital payments'],
    painPoints: ['Outdated communication methods', 'Lack of digital options'],
    motivations: ['Modern experience', 'Transparency', 'Efficiency'],
    size: 22.1,
    valueScore: 81,
    retentionRate: 86.3
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

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  return minutes > 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m' : '${minutes}m'
}

export default function CustomerJourneyPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [lifetimeValueData, setLifetimeValueData] = useState<TradingViewChartData[]>([])
  const [satisfactionData, setSatisfactionData] = useState<TradingViewChartData[]>([])
  const tradingViewRef = useRef<TradingViewWrapperRef>(null)
  const satisfactionRef = useRef<TradingViewWrapperRef>(null)

  // Generate customer lifetime value chart data
  useEffect(() => {
    const generateLifetimeValueData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      
      const baseLTV = 4200 // Starting lifetime value
      
      for (let i = 0; i < 365; i += 30) { // Monthly data points
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic LTV growth patterns
        const seasonalFactor = 1 + 0.1 * Math.sin((i / 365) * Math.PI * 2) // Seasonal variation
        const improvementTrend = 1 + (i / 3000) // Gradual improvement over time
        const marketConditions = 1 + 0.05 * Math.sin((i / 180) * Math.PI) // Market cycles
        const randomVariation = 0.95 + Math.random() * 0.1 // ±5% variation
        
        const monthlyLTV = baseLTV * seasonalFactor * improvementTrend * marketConditions * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(3800, monthlyLTV),
        })
      }
      
      return data
    }

    // Generate customer satisfaction chart data
    const generateSatisfactionData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) // 6 months ago
      
      const baseSatisfaction = 4.3 // Starting satisfaction score
      
      for (let i = 0; i < 180; i += 7) { // Weekly data points
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic satisfaction patterns
        const improvementTrend = 1 + (i / 1800) // Gradual improvement
        const weeklyVariation = 0.98 + Math.random() * 0.04 // ±2% variation
        const qualityInitiatives = 1 + (i / 3600) // Quality improvement initiatives
        
        const weeklySatisfaction = baseSatisfaction * improvementTrend * weeklyVariation * qualityInitiatives
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(3.8, Math.min(5.0, weeklySatisfaction)),
        })
      }
      
      return data
    }

    setLifetimeValueData(generateLifetimeValueData())
    setSatisfactionData(generateSatisfactionData())
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Customer Journey Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Route className="h-6 w-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-neutral-100">Customer Experience Journey</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Users className="h-3 w-3 mr-1" />
                Journey Mapping
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Brain className="h-3 w-3 mr-1" />
                AI Insights
              </Badge>
            </div>
          </div>
          <p className="text-neutral-400 mt-1">Customer lifecycle analysis, touchpoint optimization, and experience intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                All Segments
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">All Segments</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Residential Premium</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Commercial</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">New Customers</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Export Journey Map
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* Customer Journey KPIs - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {journeyMetrics.map((metric) => {
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
              {metric.benchmark && (
                <div className="text-xs text-neutral-500">Benchmark: {metric.benchmark}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Journey Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Lifetime Value Trend */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-medium text-neutral-100">Customer Lifetime Value Trend</h3>
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
              data={lifetimeValueData}
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
                <span>Live LTV Data</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Current Avg: $4,850</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Customer Satisfaction Journey */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-medium text-neutral-100">Customer Satisfaction Journey</h3>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
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
              ref={satisfactionRef}
              data={satisfactionData}
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
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Live Satisfaction</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Current Avg: 4.7/5.0</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => satisfactionRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Journey Stages Flow */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-medium text-neutral-100">Customer Journey Flow Analysis</h3>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Conversion Funnel
          </Badge>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto pb-4">
          {journeyStages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-4 min-w-fit">
              <div className="bg-neutral-800/50 border border-neutral-700 p-4 rounded-lg min-w-[280px] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-neutral-200">{stage.name}</h4>
                  <Badge variant="outline" className="text-xs border-neutral-600">
                    {stage.satisfaction}/5.0
                  </Badge>
                </div>
                
                <div className="text-2xl font-bold text-neutral-100">
                  {stage.customers.toLocaleString()}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Conversion Rate</span>
                    <span className="text-green-400">{stage.conversionToNext}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Avg Time</span>
                    <span className="text-neutral-300">{stage.averageTime} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Drop-off Rate</span>
                    <span className="text-red-400">{stage.dropoffRate}%</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: '${stage.conversionToNext}%' }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-neutral-500">Key Actions:</div>
                  <div className="text-xs text-neutral-400">
                    {stage.keyActions.slice(0, 2).join(', ')}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-neutral-500">Top Pain Point:</div>
                  <div className="text-xs text-orange-400">
                    {stage.painPoints[0]}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-neutral-500">Opportunity:</div>
                  <div className="text-xs text-green-400">
                    {stage.opportunities[0]}
                  </div>
                </div>
              </div>
              
              {index < journeyStages.length - 1 && (
                <ArrowRight className="h-6 w-6 text-neutral-600 min-w-fit" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Customer Segments & Touchpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments Analysis */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-medium text-neutral-100">Customer Segments</h3>
          </div>
          <div className="space-y-4">
            {customerSegments.map((segment) => (
              <div key={segment.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", segment.color)} />
                    <span className="font-medium text-neutral-200">{segment.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">{segment.size.toLocaleString()}</span>
                    <Badge variant="secondary" className={cn(
                      "text-xs",
                      segment.growthRate > 0 ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"
                    )}>
                      {segment.growthRate > 0 ? '+' : '}{segment.growthRate}%
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-400">Avg Value</div>
                    <div className="font-medium text-neutral-200">{formatCurrency(segment.averageValue)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Retention</div>
                    <div className="font-medium text-neutral-200">{segment.retention}%</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Satisfaction</div>
                    <div className="font-medium text-neutral-200">{segment.satisfaction}/5.0</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", segment.color)}
                      style={{ width: '${segment.percentage}%' }}
                    />
                  </div>
                </div>

                <div className="text-xs text-neutral-400">
                  {segment.characteristics.slice(0, 2).join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Touchpoint Performance */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MousePointer className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Touchpoint Performance</h3>
          </div>
          <div className="space-y-4">
            {touchpointData.map((touchpoint) => (
              <div key={touchpoint.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", touchpoint.color)} />
                    <span className="font-medium text-neutral-200">{touchpoint.name}</span>
                  </div>
                  <span className="text-sm text-neutral-400">{touchpoint.interactions.toLocaleString()} interactions</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-400">Conversion</div>
                    <div className="font-medium text-green-400">{touchpoint.conversionRate}%</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Satisfaction</div>
                    <div className="font-medium text-neutral-200">{touchpoint.satisfaction}/5.0</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Avg Time</div>
                    <div className="font-medium text-neutral-200">{formatTime(touchpoint.averageTime)}</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", touchpoint.color)}
                      style={{ width: '${touchpoint.conversionRate * 2}%' }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Drop-off Rate: {touchpoint.dropoffRate}%</span>
                  <span>Channel: {touchpoint.channel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Feedback & Persona Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Customer Feedback */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Customer Feedback Stream</h3>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Real-time
            </Badge>
          </div>
          <div className="space-y-3">
            {customerFeedback.map((feedback) => (
              <div key={feedback.id} className={cn(
                "p-3 rounded-lg border",
                feedback.sentiment === 'positive' ? "bg-green-600/10 border-green-600/20" :
                feedback.sentiment === 'negative' ? "bg-red-600/10 border-red-600/20" :
                "bg-blue-600/10 border-blue-600/20"
              )}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      feedback.sentiment === 'positive' ? "bg-green-400" :
                      feedback.sentiment === 'negative' ? "bg-red-400" : "bg-blue-400"
                    )} />
                    <span className="text-sm font-medium text-neutral-200">{feedback.customer}</span>
                    <Badge variant="outline" className="text-xs border-neutral-600">
                      {feedback.stage}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-500">{feedback.timestamp}</div>
                </div>
                
                <p className="text-sm text-neutral-300 mb-2">{feedback.feedback}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Channel:</span>
                    <span className="text-neutral-400">{feedback.channel}</span>
                    <span className="text-neutral-500">Category:</span>
                    <span className="text-neutral-400">{feedback.category}</span>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    feedback.impact === 'high' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                    feedback.impact === 'medium' ? "bg-orange-600/20 text-orange-400 border-orange-600/30" :
                    "bg-blue-600/20 text-blue-400 border-blue-600/30"
                  )}>
                    {feedback.impact} impact
                  </Badge>
                </div>
                
                {feedback.resolution && (
                  <div className="mt-2 text-xs text-green-400">
                    Resolution: {feedback.resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Customer Persona Insights */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Customer Persona Insights</h3>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Brain className="h-3 w-3 mr-1" />
              AI Analysis
            </Badge>
          </div>
          <div className="space-y-4">
            {personaInsights.map((persona) => (
              <div key={persona.id} className="p-4 bg-neutral-800/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-neutral-200">{persona.persona}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-400">{persona.size}%</span>
                    <Badge variant="outline" className="text-xs border-neutral-600">
                      Score: {persona.valueScore}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-neutral-400">{persona.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-500 mb-1">Top Preferences:</div>
                    <div className="text-neutral-300 text-xs">
                      {persona.preferences.slice(0, 2).join(', ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-1">Main Pain Points:</div>
                    <div className="text-orange-400 text-xs">
                      {persona.painPoints.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Retention Rate</span>
                    <span className="text-green-400">{persona.retentionRate}%</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: '${persona.retentionRate}%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-neutral-500">
                  Key Motivations: {persona.motivations.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}