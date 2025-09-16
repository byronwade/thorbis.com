'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Filter, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Bot,
  Sparkles,
  Zap,
  Target,
  Eye,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Play,
  Pause,
  Settings,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Award,
  Timer,
  Send,
  UserCheck,
  Brain,
  MessageSquare,
  Mail,
  FileText,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  Layers,
  TrendingUp as Trending,
  Globe,
  Shield,
  Cpu,
  Radio
} from 'lucide-react'
import { 
  BatchInvoicingEngine,
  CustomerSegment,
  BatchInvoiceJob,
  CustomerAnalytics,
  formatSegmentSize,
  getSegmentHealthColor,
  calculateSegmentROI
} from '@/lib/batch-invoicing'
import { Customer, Invoice } from '@/types/accounting'
import { TradingViewWrapper, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'

// Initialize the batch invoicing engine
const batchEngine = new BatchInvoicingEngine()

// Mock data
const mockCustomers: Customer[] = [
  { id: 'cust_1', name: 'Enterprise Corp', payment_terms: 30, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01', preferred_currency: 'USD' },
  { id: 'cust_2', name: 'SME Solutions', payment_terms: 15, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01', preferred_currency: 'EUR' },
  { id: 'cust_3', name: 'Startup Inc', payment_terms: 45, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01', preferred_currency: 'USD' }
]

// Create sample segments and jobs
const createSampleData = async () => {
  // This would typically be done asynchronously
  await batchEngine.createSmartSegments(mockCustomers, {
    max_segments: 5,
    min_segment_size: 10,
    optimization_goal: 'revenue',
    include_predictive_segments: true
  })
}

createSampleData()

// Mock monitoring data
const monitoringData = batchEngine.monitorBatchJobs()

// Mock segment performance data
const segmentPerformanceData = [
  { segment: 'VIP', revenue: 125000, customers: 45, conversion: 92, growth: 15 },
  { segment: 'Enterprise', revenue: 89000, customers: 23, conversion: 88, growth: 8 },
  { segment: 'SME', revenue: 67000, customers: 156, conversion: 74, growth: 22 },
  { segment: 'Startups', revenue: 34000, customers: 89, conversion: 65, growth: -5 },
  { segment: 'New', revenue: 12000, customers: 34, conversion: 58, growth: 45 }
]

// Convert segment performance data for TradingView
const segmentTradingData: TradingViewChartData[] = segmentPerformanceData.map((item, index) => ({
  time: '2024-01-${String(index + 1).padStart(2, '0')}',
  value: item.revenue
}))

const personalizationTradingData: TradingViewChartData[] = personalizationImpactData.map((item, index) => ({
  time: '2024-01-${String(index + 1).padStart(2, '0')}',
  value: item.improvement
}))

const jobProgressData = [
  { time: '10:00', processed: 0, successful: 0 },
  { time: '10:15', processed: 125, successful: 118 },
  { time: '10:30', processed: 280, successful: 265 },
  { time: '10:45', processed: 450, successful: 428 },
  { time: '11:00', processed: 620, successful: 595 },
  { time: '11:15', processed: 750, successful: 715 },
  { time: '11:30', processed: 850, successful: 812 }
]

const personalizationImpactData = [
  { metric: 'Open Rate', generic: 68, personalized: 84, improvement: 23.5 },
  { metric: 'Click Rate', generic: 23, personalized: 34, improvement: 47.8 },
  { metric: 'Response Rate', generic: 12, personalized: 21, improvement: 75.0 },
  { metric: 'Payment Rate', generic: 65, personalized: 78, improvement: 20.0 }
]

function SegmentCard({ segment }: { segment: CustomerSegment }) {
  const roi = calculateSegmentROI(segment)
  const healthScore = segment.ai_insights.retention_rate * 100
  const healthColor = getSegmentHealthColor(healthScore)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{segment.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {formatSegmentSize(segment.customer_count)}
            </Badge>
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: healthColor }}
              title={'Health Score: ${healthScore.toFixed(0)}'}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">{segment.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold text-green-600">
              ${segment.total_value.toLocaleString()}
            </div>
            <div className="text-muted-foreground">Total Value</div>
          </div>
          <div>
            <div className="font-bold">
              ${segment.average_invoice_amount.toLocaleString()}
            </div>
            <div className="text-muted-foreground">Avg Invoice</div>
          </div>
          <div>
            <div className="font-medium">
              {segment.payment_behavior.average_days_to_pay.toFixed(0)} days
            </div>
            <div className="text-muted-foreground">Avg Payment</div>
          </div>
          <div>
            <div className="font-medium">
              {Math.round(segment.payment_behavior.payment_success_rate * 100)}%
            </div>
            <div className="text-muted-foreground">Success Rate</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium">AI Insights:</div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              <Trending className="w-3 h-3 mr-1" />
              {segment.ai_insights.growth_trend}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              {segment.ai_insights.upsell_potential.toFixed(0)}% upsell
            </Badge>
          </div>
        </div>

        {roi > 0 && (
          <div className="bg-green-50 border border-green-200 p-2 rounded text-xs">
            <div className="flex items-center text-green-800">
              <DollarSign className="w-3 h-3 mr-1" />
              <span className="font-medium">ROI: {(roi * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs font-medium">Communication Preferences:</div>
          <div className="flex space-x-1">
            {segment.communication_preferences.preferred_channels.map((channel, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {channel === 'email' && <Mail className="w-3 h-3 mr-1" />}
                {channel === 'portal' && <Globe className="w-3 h-3 mr-1" />}
                {channel}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="w-3 h-3 mr-1" />
            Analyze
          </Button>
          <Button size="sm" className="flex-1">
            <Send className="w-3 h-3 mr-1" />
            Create Batch
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function BatchJobCard({ job }: { job: BatchInvoiceJob }) {
  const progressPercentage = job.progress.total_invoices > 0 
    ? (job.progress.processed_invoices / job.progress.total_invoices) * 100 
    : 0

  const statusColor = {
    'draft': 'bg-neutral-100 text-neutral-800',
    'scheduled': 'bg-blue-100 text-blue-800', 
    'processing': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800',
    'cancelled': 'bg-neutral-100 text-neutral-800'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{job.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={statusColor[job.status]}>
              {job.status.toUpperCase()}
            </Badge>
            {job.status === 'processing' && (
              <div className="flex items-center space-x-1">
                <Radio className="w-3 h-3 text-green-600 animate-pulse" />
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {job.description && (
          <p className="text-xs text-muted-foreground">{job.description}</p>
        )}
        
        {job.status === 'processing' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Progress: {progressPercentage.toFixed(0)}%</span>
              <span>{job.progress.processed_invoices} / {job.progress.total_invoices}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: '${progressPercentage}%' }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium text-green-600">{job.progress.successful_invoices}</div>
                <div className="text-muted-foreground">Success</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{job.progress.failed_invoices}</div>
                <div className="text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{job.progress.processing_rate.toFixed(0)}</div>
                <div className="text-muted-foreground">per min</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold">
              {job.target_segments.length}
            </div>
            <div className="text-muted-foreground">Segments</div>
          </div>
          <div>
            <div className="font-bold">
              {job.progress.total_invoices}
            </div>
            <div className="text-muted-foreground">Invoices</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium">AI Predictions:</div>
          <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs">
            <div className="flex items-center justify-between">
              <span>Success Rate:</span>
              <span className="font-medium">{Math.round(job.performance_predictions.payment_conversion_rate * 100)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Est. Collection:</span>
              <span className="font-medium">${job.performance_predictions.total_collection_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {job.ai_recommendations.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs">
            <div className="flex items-center text-yellow-800 mb-1">
              <Bot className="w-3 h-3 mr-1" />
              <span className="font-medium">AI Recommendation</span>
            </div>
            <div className="text-yellow-700">
              {job.ai_recommendations[0].title}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          {job.status === 'draft' && (
            <Button size="sm" variant="outline" className="flex-1">
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}
          {(job.status === 'draft' || job.status === 'scheduled') && (
            <Button size="sm" className="flex-1">
              <Play className="w-3 h-3 mr-1" />
              Start
            </Button>
          )}
          {job.status === 'processing' && (
            <Button size="sm" variant="outline" className="flex-1">
              <Pause className="w-3 h-3 mr-1" />
              Pause
            </Button>
          )}
          {job.status === 'completed' && (
            <Button size="sm" variant="outline" className="flex-1">
              <Download className="w-3 h-3 mr-1" />
              Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AIRecommendationCard({ recommendation }: { recommendation: any }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Brain className="mr-2 h-4 w-4" />
            {recommendation.title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={
              recommendation.priority === 'high' ? 'destructive' :
              recommendation.priority === 'medium' ? 'default' : 'secondary'
            }>
              {recommendation.priority.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              +{recommendation.expected_impact}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{recommendation.description}</p>
        
        <div className="bg-muted/50 p-2 rounded text-xs">
          <div className="font-medium mb-1">Expected Impact:</div>
          <div className="space-y-1">
            {recommendation.supporting_data.map((data: unknown, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span>{data.metric}:</span>
                <span className="font-medium">
                  {data.current_value} → {data.projected_value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs">
          <div className="font-medium mb-1">Action Items:</div>
          <ul className="space-y-1">
            {recommendation.action_items.map((item: string, i: number) => (
              <li key={i} className="flex items-start">
                <CheckCircle2 className="w-3 h-3 mr-1 mt-0.5 text-green-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span>Effort: {recommendation.implementation_effort}</span>
          <Button size="sm">
            <ArrowRight className="w-3 h-3 mr-1" />
            Implement
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function BatchInvoicingPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'segments' | 'jobs' | 'analytics' | 'templates'>('dashboard')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'completed'>('all')

  // Mock segments data - in production this would come from the engine
  const segments: CustomerSegment[] = [
    {
      id: 'vip_customers',
      name: 'VIP Customers',
      description: 'High-value customers with excellent payment history',
      criteria: {
        demographic: { customer_type: 'vip' },
        behavioral: { lifecycle_stage: 'active', engagement_level: 'high' },
        financial: { risk_level: 'low' },
        custom: Record<string, unknown>
      },
      customer_count: 45,
      total_value: 450000,
      average_invoice_amount: 10000,
      payment_behavior: {
        average_days_to_pay: 12,
        payment_success_rate: 0.98,
        preferred_payment_methods: ['bank_transfer', 'credit_card'],
        seasonal_patterns: Record<string, unknown>,
        risk_score: 15,
        reliability_score: 95,
        communication_responsiveness: 0.92
      },
      communication_preferences: {
        preferred_channels: ['email', 'portal'],
        optimal_send_times: [{ day_of_week: 'Tuesday', hour: 10 }],
        frequency_tolerance: 'medium',
        content_preferences: {
          tone: 'formal',
          detail_level: 'standard',
          language: 'en',
          format: 'pdf'
        },
        engagement_metrics: {
          open_rate: 0.95,
          click_rate: 0.78,
          response_rate: 0.65,
          unsubscribe_rate: 0.01
        }
      },
      ai_insights: {
        growth_trend: 'growing',
        revenue_contribution: 35.2,
        profitability_score: 89,
        retention_rate: 0.94,
        churn_risk: 0.08,
        upsell_potential: 0.75,
        cross_sell_opportunities: ['Premium Support', 'Extended Warranty'],
        recommended_strategies: ['Exclusive offers', 'Priority service'],
        market_trends: ['Increasing demand for premium services'],
        competitive_threats: ['New premium competitors entering market']
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ]

  // Mock batch jobs
  const batchJobs: BatchInvoiceJob[] = []

  const filteredSegments = useMemo(() => {
    return segments.filter(segment => 
      segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      segment.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [segments, searchTerm])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Users className="mr-3 h-8 w-8" />
            Batch Invoicing
          </h1>
          <p className="text-muted-foreground">AI-powered customer segmentation and personalized bulk invoicing</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Brain className="mr-2 h-4 w-4" />
            Smart Segments
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Batch Job
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'segments', label: 'Segments', icon: Layers },
          { id: 'jobs', label: 'Batch Jobs', icon: Send },
          { id: 'analytics', label: 'Analytics', icon: LineChart },
          { id: 'templates', label: 'Templates', icon: FileText }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="flex items-center"
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.active_jobs}</div>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  {monitoringData.queued_jobs} queued
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(monitoringData.success_rate * 100)}%
                </div>
                <div className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3% vs last week
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Invoices Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {monitoringData.total_invoices_processed.toLocaleString()}
                </div>
                <div className="text-xs text-blue-600">This month</div>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Revenue Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ${monitoringData.revenue_generated.toLocaleString()}
                </div>
                <div className="text-xs text-orange-600 flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  Record high
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Job Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Radio className="mr-2 h-5 w-5 text-green-600 animate-pulse" />
                Live Batch Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={jobProgressData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line type="monotone" dataKey="processed" stroke="#3b82f6" strokeWidth={2} name="Processed" />
                  <Line type="monotone" dataKey="successful" stroke="#22c55e" strokeWidth={2} name="Successful" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Segment Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Segment Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[250px] w-full">
                  <TradingViewWrapper
                    data={segmentTradingData}
                    type="histogram"
                    height={250}
                    theme="dark"
                    className="rounded-lg overflow-hidden"
                    options={{
                      layout: {
                        background: {
                          type: 1,
                          color: 'transparent',
                        },
                      },
                      grid: {
                        vertLines: {
                          color: 'rgba(75, 85, 99, 0.2)',
                        },
                        horzLines: {
                          color: 'rgba(75, 85, 99, 0.2)',
                        },
                      },
                      rightPriceScale: {
                        scaleMargins: {
                          top: 0.1,
                          bottom: 0.1,
                        },
                      },
                    }}
                  />
                </div>

                <div className="space-y-4">
                  {segmentPerformanceData.map((segment, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{segment.segment}</div>
                        <div className="text-sm text-muted-foreground">{segment.customers} customers</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{segment.conversion}%</div>
                        <div className={'text-xs ${segment.growth >= 0 ? 'text-green-600' : 'text-red-600'
              }'}>'
                          {segment.growth >= 0 ? '+' : '}{segment.growth}% growth
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          {monitoringData.ai_insights.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">AI Recommendations</h2>
                <Button variant="outline" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate More
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {monitoringData.ai_insights.slice(0, 4).map((insight, index) => (
                  <AIRecommendationCard key={index} recommendation={insight} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'segments' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search segments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Brain className="mr-2 h-4 w-4" />
                    AI Segmentation
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Customer Segments ({filteredSegments.length})</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Segment
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSegments.map(segment => (
                <SegmentCard key={segment.id} segment={segment} />
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Personalization Impact Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Personalization Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[250px] w-full">
                  <TradingViewWrapper
                    data={personalizationTradingData}
                    type="histogram"
                    height={250}
                    theme="dark"
                    className="rounded-lg overflow-hidden"
                    options={{
                      layout: {
                        background: {
                          type: 1,
                          color: 'transparent',
                        },
                      },
                      grid: {
                        vertLines: {
                          color: 'rgba(75, 85, 99, 0.2)',
                        },
                        horzLines: {
                          color: 'rgba(75, 85, 99, 0.2)',
                        },
                      },
                      rightPriceScale: {
                        scaleMargins: {
                          top: 0.1,
                          bottom: 0.1,
                        },
                      },
                    }}
                  />
                </div>

                <div className="space-y-4">
                  {personalizationImpactData.map((data, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{data.metric}</div>
                        <div className="text-green-600 font-bold">
                          +{data.improvement.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {data.generic}% → {data.personalized}%
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: '${(data.improvement / 75) * 100}%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Attribution by Segment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <TradingViewWrapper
                    data={segmentTradingData}
                    type="histogram"
                    height={200}
                    theme="dark"
                    className="rounded-lg overflow-hidden"
                    options={{
                      layout: {
                        background: {
                          type: 1,
                          color: 'transparent',
                        },
                      },
                      grid: {
                        vertLines: {
                          color: 'rgba(75, 85, 99, 0.2)',
                        },
                        horzLines: {
                          color: 'rgba(75, 85, 99, 0.2)',
                        },
                      },
                      rightPriceScale: {
                        scaleMargins: {
                          top: 0.1,
                          bottom: 0.1,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                    <span>Invoices Sent</span>
                    <span className="font-bold">1,250</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <span>Opened</span>
                    <span className="font-bold">1,038 (83%)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <span>Clicked</span>
                    <span className="font-bold">425 (34%)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded">
                    <span>Responded</span>
                    <span className="font-bold">213 (17%)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded">
                    <span>Paid</span>
                    <span className="font-bold">896 (72%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'jobs' && (
        <>
          {/* Batch Jobs List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Batch Jobs ({batchJobs.length})</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Batch Job
              </Button>
            </div>
            
            {batchJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Send className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No batch jobs yet</p>
                  <p className="text-sm">Create your first batch invoicing job to get started.</p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batchJobs.map(job => (
                  <BatchJobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}