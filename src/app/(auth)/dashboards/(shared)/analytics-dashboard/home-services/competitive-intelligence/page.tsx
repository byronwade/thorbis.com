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
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
  Award,
  Building,
  Zap,
  Globe,
  Search,
  Eye,
  Brain,
  Bot,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  LineChart,
  BarChart3,
  PieChart,
  Activity,
  Crown,
  Shield,
  Radar,
  Crosshair,
  Binoculars,
  Map,
  Calendar,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Layers,
  Navigation,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface CompetitiveMetric {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
  benchmark?: string
  ranking?: number
  description: string
}

interface Competitor {
  id: string
  name: string
  marketShare: number
  revenue: number
  growth: number
  customerBase: number
  avgRating: number
  pricePosition: 'premium' | 'mid-market' | 'budget'
  strengths: string[]
  weaknesses: string[]
  threatLevel: 'high' | 'medium' | 'low'
  color: string
}

interface MarketTrend {
  id: string
  category: string
  trend: string
  impact: 'high' | 'medium' | 'low'
  opportunity: number
  timeframe: string
  description: string
  actionItems: string[]
}

interface SWOTItem {
  category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats'
  item: string
  impact: 'high' | 'medium' | 'low'
  priority: 'critical' | 'high' | 'medium' | 'low'
  actionRequired: boolean
}

interface CompetitiveAdvantage {
  id: string
  advantage: string
  strength: number
  sustainability: number
  investmentRequired: 'high' | 'medium' | 'low'
  timeToImplement: string
  description: string
  competitors: string[]
}

interface MarketIntelligence {
  id: string
  insight: string
  confidence: number
  source: string
  impact: 'strategic' | 'tactical' | 'operational'
  urgency: 'immediate' | 'near-term' | 'long-term'
  recommendation: string
  timestamp: string
}

const competitiveMetrics: CompetitiveMetric[] = [
  {
    id: 'market-position',
    title: 'Market Position',
    value: '#2',
    change: '↑1',
    trend: 'up',
    icon: Target,
    color: 'text-green-400',
    benchmark: '#3',
    ranking: 2,
    description: 'Overall market ranking in local area'
  },
  {
    id: 'market-share',
    title: 'Market Share',
    value: '23.4%',
    change: '+2.1%',
    trend: 'up',
    icon: PieChart,
    color: 'text-blue-400',
    benchmark: '21.3%',
    description: 'Share of total addressable market'
  },
  {
    id: 'competitive-price-index',
    title: 'Price Competitiveness',
    value: '108',
    change: '-3',
    trend: 'up',
    icon: DollarSign,
    color: 'text-orange-400',
    benchmark: '100',
    description: 'Price index vs market average (100=market avg)'
  },
  {
    id: 'service-quality-score',
    title: 'Service Quality Score',
    value: '94.2',
    change: '+5.1',
    trend: 'up',
    icon: Star,
    color: 'text-yellow-400',
    benchmark: '87.5',
    description: 'Composite service quality rating'
  },
  {
    id: 'brand-recognition',
    title: 'Brand Recognition',
    value: '76%',
    change: '+8%',
    trend: 'up',
    icon: Eye,
    color: 'text-purple-400',
    benchmark: '68%',
    description: 'Unaided brand awareness in target market'
  },
  {
    id: 'digital-presence',
    title: 'Digital Presence Score',
    value: '89',
    change: '+12',
    trend: 'up',
    icon: Globe,
    color: 'text-cyan-400',
    benchmark: '72',
    description: 'Online visibility and digital engagement'
  }
]

const competitors: Competitor[] = [
  {
    id: 'competitor-a',
    name: 'ServiceMaster Pro',
    marketShare: 28.5,
    revenue: 3200000,
    growth: 15.2,
    customerBase: 3850,
    avgRating: 4.2,
    pricePosition: 'premium',
    strengths: ['Strong brand recognition', 'Premium service quality', 'Large customer base'],
    weaknesses: ['Higher pricing', 'Slower response times', 'Limited digital presence'],
    threatLevel: 'high',
    color: 'bg-red-500'
  },
  {
    id: 'competitor-b',
    name: 'QuickFix Solutions',
    marketShare: 18.7,
    revenue: 2100000,
    growth: 22.8,
    customerBase: 2640,
    avgRating: 4.5,
    pricePosition: 'mid-market',
    strengths: ['Fast response times', 'Competitive pricing', 'Good digital marketing'],
    weaknesses: ['Smaller team', 'Limited service range', 'Lower brand recognition'],
    threatLevel: 'medium',
    color: 'bg-orange-500'
  },
  {
    id: 'competitor-c',
    name: 'Local Heroes HVAC',
    marketShare: 15.2,
    revenue: 1680000,
    growth: 8.4,
    customerBase: 2100,
    avgRating: 4.7,
    pricePosition: 'mid-market',
    strengths: ['Excellent customer service', 'Local reputation', 'Specialized expertise'],
    weaknesses: ['Limited marketing', 'Slower growth', 'Geographic constraints'],
    threatLevel: 'low',
    color: 'bg-blue-500'
  },
  {
    id: 'competitor-d',
    name: 'Budget Home Services',
    marketShare: 14.2,
    revenue: 1580000,
    growth: 5.1,
    customerBase: 4200,
    avgRating: 3.8,
    pricePosition: 'budget',
    strengths: ['Low pricing', 'High volume', 'Quick scheduling'],
    weaknesses: ['Quality concerns', 'High churn rate', 'Limited warranty'],
    threatLevel: 'low',
    color: 'bg-yellow-500'
  }
]

const marketTrends: MarketTrend[] = [
  {
    id: 'smart-home-integration',
    category: 'Technology',
    trend: 'Smart Home Integration Demand',
    impact: 'high',
    opportunity: 85,
    timeframe: '6-12 months',
    description: 'Growing demand for smart thermostats, connected HVAC systems, and IoT integration',
    actionItems: ['Partner with smart device manufacturers', 'Train technicians on smart home tech', 'Develop IoT service packages']
  },
  {
    id: 'sustainability-focus',
    category: 'Environmental',
    trend: 'Energy Efficiency Focus',
    impact: 'high',
    opportunity: 78,
    timeframe: '3-6 months',
    description: 'Increased customer interest in energy-efficient solutions and green certifications',
    actionItems: ['Obtain green certifications', 'Promote energy-efficient options', 'Develop sustainability marketing']
  },
  {
    id: 'subscription-models',
    category: 'Business Model',
    trend: 'Subscription-Based Services',
    impact: 'medium',
    opportunity: 65,
    timeframe: '12-18 months',
    description: 'Growing preference for maintenance plans and subscription-based service models',
    actionItems: ['Develop subscription offerings', 'Create tiered service plans', 'Implement recurring billing']
  },
  {
    id: 'digital-first-experience',
    category: 'Customer Experience',
    trend: 'Digital-First Customer Journey',
    impact: 'high',
    opportunity: 72,
    timeframe: '3-9 months',
    description: 'Customers expect seamless digital booking, tracking, and communication',
    actionItems: ['Enhance mobile app', 'Implement real-time tracking', 'Automate customer communications']
  }
]

const swotAnalysis: SWOTItem[] = [
  // Strengths
  { category: 'strengths', item: 'Highest customer satisfaction rating (4.8/5)', impact: 'high', priority: 'high', actionRequired: false },
  { category: 'strengths', item: 'Strong digital presence and modern technology stack', impact: 'high', priority: 'medium', actionRequired: false },
  { category: 'strengths', item: 'Skilled and certified technician workforce', impact: 'medium', priority: 'medium', actionRequired: false },
  { category: 'strengths', item: 'Comprehensive service offering across all trades', impact: 'medium', priority: 'medium', actionRequired: false },
  
  // Weaknesses
  { category: 'weaknesses', item: 'Premium pricing limits market penetration', impact: 'medium', priority: 'high', actionRequired: true },
  { category: 'weaknesses', item: 'Limited brand recognition compared to market leader', impact: 'medium', priority: 'high', actionRequired: true },
  { category: 'weaknesses', item: 'Smaller fleet size affecting response times', impact: 'medium', priority: 'medium', actionRequired: true },
  
  // Opportunities
  { category: 'opportunities', item: 'Smart home technology integration market', impact: 'high', priority: 'critical', actionRequired: true },
  { category: 'opportunities', item: 'Subscription-based maintenance service models', impact: 'high', priority: 'high', actionRequired: true },
  { category: 'opportunities', item: 'Geographic expansion to adjacent markets', impact: 'medium', priority: 'medium', actionRequired: true },
  { category: 'opportunities', item: 'Commercial and enterprise customer segment', impact: 'high', priority: 'high', actionRequired: true },
  
  // Threats
  { category: 'threats', item: 'Market leader expanding service offerings', impact: 'high', priority: 'critical', actionRequired: true },
  { category: 'threats', item: 'Economic downturn reducing discretionary spending', impact: 'medium', priority: 'medium', actionRequired: false },
  { category: 'threats', item: 'Skilled labor shortage driving up costs', impact: 'high', priority: 'high', actionRequired: true },
  { category: 'threats', item: 'New digital-native competitors entering market', impact: 'medium', priority: 'medium', actionRequired: true }
]

const competitiveAdvantages: CompetitiveAdvantage[] = [
  {
    id: 'customer-experience',
    advantage: 'Superior Customer Experience',
    strength: 94,
    sustainability: 87,
    investmentRequired: 'medium',
    timeToImplement: '3-6 months',
    description: 'Industry-leading customer satisfaction through personalized service and technology',
    competitors: ['ServiceMaster Pro', 'QuickFix Solutions']
  },
  {
    id: 'technology-integration',
    advantage: 'Advanced Technology Integration',
    strength: 89,
    sustainability: 92,
    investmentRequired: 'high',
    timeToImplement: '6-12 months',
    description: 'Cutting-edge field service management and customer communication technology',
    competitors: ['Local Heroes HVAC', 'Budget Home Services']
  },
  {
    id: 'service-quality',
    advantage: 'Premium Service Quality',
    strength: 91,
    sustainability: 85,
    investmentRequired: 'medium',
    timeToImplement: '6-9 months',
    description: 'Highly trained technicians with industry certifications and continuous education',
    competitors: ['QuickFix Solutions', 'Budget Home Services']
  }
]

const marketIntelligence: MarketIntelligence[] = [
  {
    id: 'intel-001',
    insight: 'ServiceMaster Pro planning major digital transformation initiative',
    confidence: 85,
    source: 'Industry report & job postings',
    impact: 'strategic',
    urgency: 'near-term',
    recommendation: 'Accelerate our technology roadmap to maintain competitive edge',
    timestamp: '2 hours ago'
  },
  {
    id: 'intel-002',
    insight: 'QuickFix Solutions expanding into commercial HVAC services',
    confidence: 78,
    source: 'Customer feedback & market analysis',
    impact: 'tactical',
    urgency: 'immediate',
    recommendation: 'Strengthen commercial customer relationships and service offerings',
    timestamp: '6 hours ago'
  },
  {
    id: 'intel-003',
    insight: 'Local market showing 15% growth in energy efficiency upgrades',
    confidence: 92,
    source: 'Government data & utility reports',
    impact: 'operational',
    urgency: 'immediate',
    recommendation: 'Develop specialized energy efficiency service packages',
    timestamp: '1 day ago'
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

export default function CompetitiveIntelligencePage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [marketShareData, setMarketShareData] = useState<TradingViewChartData[]>([])
  const [competitivePositionData, setCompetitivePositionData] = useState<TradingViewChartData[]>([])
  const tradingViewRef = useRef<TradingViewWrapperRef>(null)
  const positionRef = useRef<TradingViewWrapperRef>(null)

  // Generate market share trend data
  useEffect(() => {
    const generateMarketShareData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      
      const baseMarketShare = 21.3 // Starting market share percentage
      
      for (let i = 0; i < 365; i += 30) { // Monthly data points
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic market share growth patterns
        const competitivePressure = 1 - 0.02 * Math.sin((i / 180) * Math.PI) // Competitive cycles
        const marketExpansion = 1 + (i / 5000) // Gradual market share growth
        const seasonalFactor = 1 + 0.05 * Math.sin((i / 365) * Math.PI * 2) // Seasonal variation
        const randomVariation = 0.98 + Math.random() * 0.04 // ±2% variation
        
        const monthlyMarketShare = baseMarketShare * competitivePressure * marketExpansion * seasonalFactor * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(20, Math.min(25, monthlyMarketShare)),
        })
      }
      
      return data
    }

    // Generate competitive position score data
    const generateCompetitivePositionData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) // 6 months ago
      
      const baseScore = 78 // Starting competitive position score
      
      for (let i = 0; i < 180; i += 7) { // Weekly data points
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic competitive position improvements
        const improvementTrend = 1 + (i / 1800) // Gradual improvement
        const competitorActions = 1 - 0.03 * Math.sin((i / 90) * Math.PI) // Competitor response cycles
        const marketDynamics = 1 + 0.02 * Math.sin((i / 45) * Math.PI) // Market dynamics
        const randomVariation = 0.97 + Math.random() * 0.06 // ±3% variation
        
        const weeklyScore = baseScore * improvementTrend * competitorActions * marketDynamics * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(70, Math.min(95, weeklyScore)),
        })
      }
      
      return data
    }

    setMarketShareData(generateMarketShareData())
    setCompetitivePositionData(generateCompetitivePositionData())
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Competitive Intelligence Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Binoculars className="h-6 w-6 text-cyan-400" />
            <h1 className="text-2xl font-bold text-neutral-100">Competitive Analysis & Market Intelligence</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                <Radar className="h-3 w-3 mr-1" />
                Intelligence
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Brain className="h-3 w-3 mr-1" />
                AI Analysis
              </Badge>
            </div>
          </div>
          <p className="text-neutral-400 mt-1">Market positioning, competitive analysis, and strategic intelligence for data-driven decisions</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                All Competitors
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">All Competitors</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Direct Competitors</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Market Leaders</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Emerging Threats</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Export Intelligence Report
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* Competitive Metrics - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {competitiveMetrics.map((metric) => {
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
                  {metric.ranking && (
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100">{metric.value}</div>
              <div className="text-sm text-neutral-400">{metric.title}</div>
              {metric.benchmark && (
                <div className="text-xs text-neutral-500">vs Market: {metric.benchmark}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Market Share & Competitive Position Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Share Trend Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Market Share Evolution</h3>
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
              data={marketShareData}
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
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Live Market Data</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Current Share: 23.4%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Competitive Position Score Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-medium text-neutral-100">Competitive Position Score</h3>
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
              ref={positionRef}
              data={competitivePositionData}
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
                <span>Live Position Score</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Current Score: 87.3</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => positionRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Crosshair className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-medium text-neutral-100">Competitor Analysis</h3>
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
            Threat Assessment
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {competitors.map((competitor) => (
            <div key={competitor.id} className="bg-neutral-800/50 border border-neutral-700 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-neutral-200">{competitor.name}</h4>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    competitor.threatLevel === 'high' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                    competitor.threatLevel === 'medium' ? "bg-orange-600/20 text-orange-400 border-orange-600/30" :
                    "bg-green-600/20 text-green-400 border-green-600/30"
                  )}
                >
                  {competitor.threatLevel} threat
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-neutral-400">Market Share</div>
                  <div className="font-medium text-neutral-200">{competitor.marketShare}%</div>
                </div>
                <div>
                  <div className="text-neutral-400">Growth</div>
                  <div className={cn(
                    "font-medium",
                    competitor.growth > 15 ? "text-red-400" :
                    competitor.growth > 10 ? "text-orange-400" : "text-green-400"
                  )}>+{competitor.growth}%</div>
                </div>
                <div>
                  <div className="text-neutral-400">Revenue</div>
                  <div className="font-medium text-neutral-200">{formatCurrency(competitor.revenue)}</div>
                </div>
                <div>
                  <div className="text-neutral-400">Rating</div>
                  <div className="font-medium text-neutral-200">{competitor.avgRating}/5.0</div>
                </div>
              </div>

              <div className="relative">
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-300", competitor.color)}
                    style={{ width: '${competitor.marketShare}%' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Top Strengths:</div>
                  <div className="text-xs text-green-400">
                    {competitor.strengths.slice(0, 2).join(', ')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Key Weaknesses:</div>
                  <div className="text-xs text-orange-400">
                    {competitor.weaknesses.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>

              <div className="text-xs text-neutral-600">
                Position: {competitor.pricePosition} • {competitor.customerBase.toLocaleString()} customers
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Trends & SWOT Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Trends */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Market Trends & Opportunities</h3>
          </div>
          <div className="space-y-4">
            {marketTrends.map((trend) => (
              <div key={trend.id} className="p-4 bg-neutral-800/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200">{trend.trend}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-neutral-600">
                      {trend.category}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        trend.impact === 'high' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                        trend.impact === 'medium' ? "bg-orange-600/20 text-orange-400 border-orange-600/30" :
                        "bg-green-600/20 text-green-400 border-green-600/30"
                      )}
                    >
                      {trend.impact} impact
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-neutral-400">{trend.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Opportunity Score</span>
                  <span className="text-green-400">{trend.opportunity}%</span>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: '${trend.opportunity}%' }}
                    />
                  </div>
                </div>
                
                <div className="text-xs text-neutral-500">
                  Timeline: {trend.timeframe} • Top Action: {trend.actionItems[0]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SWOT Analysis */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">SWOT Analysis</h3>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Strategic Planning
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <h4 className="font-medium text-green-400">Strengths</h4>
              </div>
              <div className="space-y-2">
                {swotAnalysis.filter(item => item.category === 'strengths').map((item, index) => (
                  <div key={index} className="p-2 bg-green-600/10 border border-green-600/20 rounded text-xs">
                    <div className="text-neutral-200">{item.item}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-green-600/30 text-green-400">
                        {item.impact} impact
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <h4 className="font-medium text-orange-400">Weaknesses</h4>
              </div>
              <div className="space-y-2">
                {swotAnalysis.filter(item => item.category === 'weaknesses').map((item, index) => (
                  <div key={index} className="p-2 bg-orange-600/10 border border-orange-600/20 rounded text-xs">
                    <div className="text-neutral-200">{item.item}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-orange-600/30 text-orange-400">
                        {item.priority} priority
                      </Badge>
                      {item.actionRequired && (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                <h4 className="font-medium text-blue-400">Opportunities</h4>
              </div>
              <div className="space-y-2">
                {swotAnalysis.filter(item => item.category === 'opportunities').map((item, index) => (
                  <div key={index} className="p-2 bg-blue-600/10 border border-blue-600/20 rounded text-xs">
                    <div className="text-neutral-200">{item.item}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-blue-600/30 text-blue-400">
                        {item.priority} priority
                      </Badge>
                      {item.actionRequired && (
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Threats */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <h4 className="font-medium text-red-400">Threats</h4>
              </div>
              <div className="space-y-2">
                {swotAnalysis.filter(item => item.category === 'threats').map((item, index) => (
                  <div key={index} className="p-2 bg-red-600/10 border border-red-600/20 rounded text-xs">
                    <div className="text-neutral-200">{item.item}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-red-600/30 text-red-400">
                        {item.priority} priority
                      </Badge>
                      {item.actionRequired && (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Advantages & Market Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitive Advantages */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-medium text-neutral-100">Competitive Advantages</h3>
          </div>
          <div className="space-y-4">
            {competitiveAdvantages.map((advantage) => (
              <div key={advantage.id} className="p-4 bg-neutral-800/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-neutral-200">{advantage.advantage}</h4>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    advantage.investmentRequired === 'high' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                    advantage.investmentRequired === 'medium' ? "bg-orange-600/20 text-orange-400 border-orange-600/30" :
                    "bg-green-600/20 text-green-400 border-green-600/30"
                  )}>
                    {advantage.investmentRequired} investment
                  </Badge>
                </div>
                
                <p className="text-sm text-neutral-400">{advantage.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-400">Strength</div>
                    <div className="font-medium text-green-400">{advantage.strength}%</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Sustainability</div>
                    <div className="font-medium text-blue-400">{advantage.sustainability}%</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Strength vs Competition</span>
                    <span className="text-green-400">{advantage.strength}%</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 transition-all duration-300"
                        style={{ width: '${advantage.strength}%' }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-neutral-500">
                  Implementation: {advantage.timeToImplement} • Against: {advantage.competitors.slice(0, 2).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Intelligence Feed */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-medium text-neutral-100">Market Intelligence Feed</h3>
            <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              AI Powered
            </Badge>
          </div>
          <div className="space-y-4">
            {marketIntelligence.map((intel) => (
              <div key={intel.id} className={cn(
                "p-4 rounded-lg border",
                intel.impact === 'strategic' ? "bg-red-600/10 border-red-600/20" :
                intel.impact === 'tactical' ? "bg-orange-600/10 border-orange-600/20" :
                "bg-blue-600/10 border-blue-600/20"
              )}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      intel.urgency === 'immediate' ? "bg-red-400" :
                      intel.urgency === 'near-term' ? "bg-orange-400" : "bg-blue-400"
                    )} />
                    <Badge variant="outline" className="text-xs border-neutral-600">
                      {intel.impact}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-500">{intel.timestamp}</div>
                </div>
                
                <p className="text-sm text-neutral-200 mb-2">{intel.insight}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Confidence Level</span>
                    <span className={cn(
                      "font-medium",
                      intel.confidence >= 85 ? "text-green-400" :
                      intel.confidence >= 70 ? "text-orange-400" : "text-red-400"
                    )}>{intel.confidence}%</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-300",
                          intel.confidence >= 85 ? "bg-green-500" :
                          intel.confidence >= 70 ? "bg-orange-500" : "bg-red-500"
                        )}
                        style={{ width: '${intel.confidence}%' }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs">
                  <div className="text-neutral-500 mb-1">Recommendation:</div>
                  <div className="text-cyan-400">{intel.recommendation}</div>
                </div>
                
                <div className="mt-2 text-xs text-neutral-600">
                  Source: {intel.source} • Urgency: {intel.urgency}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}