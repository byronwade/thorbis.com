'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Bot, 
  Search, 
  Filter, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Target,
  Eye,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Play,
  Pause,
  Settings,
  BarChart3,
  LineChart,
  PieChart,
  ArrowRight,
  Users,
  Workflow,
  Bell,
  Shield,
  Award,
  Timer,
  Activity,
  CreditCard,
  Send,
  UserCheck,
  TrendingUp as Trending
} from 'lucide-react'
import { 
  InvoiceAutomationEngine,
  InvoiceAutomation,
  AutomationMetrics,
  CollectionCampaign,
  CustomerPaymentBehavior,
  MessageTemplate,
  formatAutomationMetrics,
  getStrategyColor,
  calculateAutomationROI
} from '@/lib/invoice-automation'
import { Invoice, Customer } from '@/types/accounting'
import { TradingViewWrapper, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: 'inv_1', invoice_number: 'INV-2024-001', customer_id: 'cust_1',
    customer: { id: 'cust_1', name: 'Acme Corp', payment_terms: 30, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
    date: '2024-01-15', due_date: '2024-02-14', subtotal: 15000, tax_amount: 1200,
    total_amount: 16200, balance: 16200, status: 'overdue', line_items: [],
    created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'inv_2', invoice_number: 'INV-2024-002', customer_id: 'cust_2',
    customer: { id: 'cust_2', name: 'Tech Solutions', payment_terms: 15, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
    date: '2023-12-20', due_date: '2024-01-04', subtotal: 8500, tax_amount: 680,
    total_amount: 9180, balance: 9180, status: 'overdue', line_items: [],
    created_at: '2023-12-20T00:00:00Z', updated_at: '2023-12-20T00:00:00Z'
  }
]

const mockCustomers: Customer[] = [
  { id: 'cust_1', name: 'Acme Corp', payment_terms: 30, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'cust_2', name: 'Tech Solutions', payment_terms: 15, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' }
]

const automationEngine = new InvoiceAutomationEngine()

// Create sample automations
const sampleAutomations = mockInvoices.map(invoice => 
  automationEngine.createSmartAutomation(invoice, invoice.customer!)
)

const monitoringData = automationEngine.monitorAutomations()

// Mock performance data for charts
const performanceData = [
  { date: 'Jan 1', recovery_rate: 65, emails_sent: 120, responses: 45, payments: 28 },
  { date: 'Jan 2', recovery_rate: 68, emails_sent: 98, responses: 52, payments: 31 },
  { date: 'Jan 3', recovery_rate: 72, emails_sent: 110, responses: 58, payments: 39 },
  { date: 'Jan 4', recovery_rate: 69, emails_sent: 87, responses: 41, payments: 33 },
  { date: 'Jan 5', recovery_rate: 75, emails_sent: 95, responses: 62, payments: 44 },
  { date: 'Jan 6', recovery_rate: 78, emails_sent: 103, responses: 68, payments: 49 },
  { date: 'Jan 7', recovery_rate: 71, emails_sent: 115, responses: 59, payments: 37 }
]

const channelData = [
  { name: 'Email', success_rate: 65, volume: 890, color: '#3b82f6' },
  { name: 'Phone', success_rate: 82, volume: 234, color: '#22c55e' },
  { name: 'SMS', success_rate: 45, volume: 567, color: '#f59e0b' },
  { name: 'Portal', success_rate: 71, volume: 123, color: '#8b5cf6' }
]

const strategyData = [
  { strategy: 'Gentle', count: 45, recovery_rate: 68, avg_days: 12 },
  { strategy: 'Standard', count: 128, recovery_rate: 74, avg_days: 18 },
  { strategy: 'Aggressive', count: 23, recovery_rate: 85, avg_days: 8 },
  { strategy: 'Legal', count: 7, recovery_rate: 92, avg_days: 45 }
]

// Convert data for TradingView charts
const performanceTradingData: TradingViewChartData[] = performanceData.map((item, index) => ({
  time: '2024-01-${String(index + 1).padStart(2, '0')}',
  value: item.recovery_rate
}))

const channelTradingData: TradingViewChartData[] = channelData.map((item, index) => ({
  time: '2024-01-${String(index + 1).padStart(2, '0')}',
  value: item.success_rate
}))

const strategyTradingData: TradingViewChartData[] = strategyData.map((item, index) => ({
  time: '2024-01-${String(index + 1).padStart(2, '0')}',
  value: item.recovery_rate
}))

function AutomationCard({ automation }: { automation: InvoiceAutomation }) {
  const [isRunning, setIsRunning] = useState(automation.status === 'active')
  const roi = calculateAutomationROI(automation)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Invoice {automation.invoice_id}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline"
              className="text-white"
              style={{ backgroundColor: getStrategyColor(automation.strategy.strategy_type) }}
            >
              {automation.strategy.strategy_type}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRunning(!isRunning)}
              className="h-6 w-6 p-0"
            >
              {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold text-green-600">
              ${automation.performance_metrics.total_amount_recovered.toLocaleString()}
            </div>
            <div className="text-muted-foreground">Recovered</div>
          </div>
          <div>
            <div className="font-bold">
              {automation.performance_metrics.recovery_rate.toFixed(0)}%
            </div>
            <div className="text-muted-foreground">Success Rate</div>
          </div>
          <div>
            <div className="font-medium">
              {automation.performance_metrics.average_days_to_payment.toFixed(0)} days
            </div>
            <div className="text-muted-foreground">Avg Collection</div>
          </div>
          <div>
            <div className="font-medium">
              {automation.schedule.max_attempts - automation.performance_metrics.total_invoices_processed}
            </div>
            <div className="text-muted-foreground">Attempts Left</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium">Communication Channels:</div>
          <div className="flex space-x-1">
            {automation.strategy.communication_channels.map((channel, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {channel === 'email' && <Mail className="w-3 h-3 mr-1" />}
                {channel === 'phone' && <Phone className="w-3 h-3 mr-1" />}
                {channel === 'sms' && <MessageSquare className="w-3 h-3 mr-1" />}
                {channel}
              </Badge>
            ))}
          </div>
        </div>

        {roi > 0 && (
          <div className="bg-green-50 border border-green-200 p-2 rounded text-xs">
            <div className="flex items-center text-green-800">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span className="font-medium">ROI: +{(roi * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}

        {automation.ai_recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs">
            <div className="flex items-center text-blue-800 mb-1">
              <Bot className="w-3 h-3 mr-1" />
              <span className="font-medium">AI Recommendations</span>
            </div>
            <div className="text-blue-700">
              {automation.ai_recommendations[0].title}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="w-3 h-3 mr-1" />
            Details
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Settings className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TemplateCard({ template }: { template: MessageTemplate }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{template.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {template.channel}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {Math.round(template.ai_optimization.response_rate_prediction * 100)}% predicted
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">
          <strong>Subject:</strong> {template.subject}
        </div>
        
        <div className="text-xs bg-muted/50 p-2 rounded max-h-20 overflow-y-auto">
          {template.content.substring(0, 150)}...
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="font-medium">Tone: {template.ai_optimization.tone}</div>
          </div>
          <div>
            <div className="font-medium">Urgency: {template.ai_optimization.urgency_level}/10</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs">
            <span className={'inline-block w-2 h-2 rounded-full mr-2 ${
              template.compliance_checked ? 'bg-green-500' : 'bg-red-500'
              }'} />'
            {template.compliance_checked ? 'Compliant' : 'Needs Review'}
          </div>
          <div className="flex space-x-1">
            <Button size="sm" variant="outline" className="h-6 text-xs">
              Edit
            </Button>
            <Button size="sm" variant="outline" className="h-6 text-xs">
              Test
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CampaignCard({ campaign }: { campaign: CollectionCampaign }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{campaign.name}</CardTitle>
          <Badge variant={campaign.performance_tracking.end_date ? 'secondary' : 'default'}>
            {campaign.performance_tracking.end_date ? 'Completed' : 'Active'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{campaign.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold text-blue-600">
              {campaign.performance_tracking.invoices_targeted}
            </div>
            <div className="text-muted-foreground">Invoices</div>
          </div>
          <div>
            <div className="font-bold text-green-600">
              {campaign.performance_tracking.recovery_rate.toFixed(0)}%
            </div>
            <div className="text-muted-foreground">Recovery</div>
          </div>
          <div>
            <div className="font-medium">
              ${campaign.performance_tracking.amount_recovered.toLocaleString()}
            </div>
            <div className="text-muted-foreground">Recovered</div>
          </div>
          <div>
            <div className="font-medium">
              {campaign.performance_tracking.average_resolution_time.toFixed(0)} days
            </div>
            <div className="text-muted-foreground">Avg Time</div>
          </div>
        </div>

        <div className="bg-muted/50 p-2 rounded text-xs">
          <div className="font-medium mb-1">Target Criteria:</div>
          <div>Amount: ${campaign.target_criteria.amount_range.min.toLocaleString()} - ${campaign.target_criteria.amount_range.max.toLocaleString()}</div>
          <div>Overdue: {campaign.target_criteria.days_overdue_range.min} - {campaign.target_criteria.days_overdue_range.max} days</div>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <BarChart3 className="w-3 h-3 mr-1" />
            Analytics
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Settings className="w-3 h-3 mr-1" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AlertCard({ alert }: { alert: any }) {
  const severityColor = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50'
  }

  return (
    <Card className={'${severityColor[alert.severity]} hover:shadow-lg transition-shadow'}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {alert.type.replace('_', ' ').toUpperCase()}
          </CardTitle>
          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
            {alert.severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium">{alert.message}</p>
        <div className="text-xs text-muted-foreground">
          Automation ID: {alert.automation_id}
        </div>
        <div className="bg-white/50 p-2 rounded text-xs">
          <span className="font-medium">Recommended Action:</span> {alert.recommended_action}
        </div>
        <Button size="sm" className="w-full">
          Take Action
        </Button>
      </CardContent>
    </Card>
  )
}

export default function InvoiceAutomationPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'automations' | 'templates' | 'campaigns' | 'analytics'>('dashboard')
  const [automationFilter, setAutomationFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all')

  const filteredAutomations = useMemo(() => {
    return sampleAutomations.filter(automation => {
      const matchesFilter = automationFilter === 'all' || automation.status === automationFilter
      const matchesSearch = automation.invoice_id.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [automationFilter, searchTerm])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Bot className="mr-3 h-8 w-8" />
            Smart Invoice Automation
          </h1>
          <p className="text-muted-foreground">AI-powered payment reminders and collection strategies</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            New Automation
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'automations', label: 'Automations', icon: Workflow },
          { id: 'templates', label: 'Templates', icon: FileText },
          { id: 'campaigns', label: 'Campaigns', icon: Target },
          { id: 'analytics', label: 'Analytics', icon: LineChart }
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
                <CardTitle className="text-sm font-medium text-primary">Active Automations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.active_automations}</div>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  Running smoothly
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(monitoringData.success_rate)}%
                </div>
                <div className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% vs last month
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Revenue Recovered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${monitoringData.revenue_recovered_today.toLocaleString()}
                </div>
                <div className="text-xs text-blue-600">Today's recovery</div>'
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Satisfaction Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {monitoringData.customer_satisfaction_score.toFixed(1)}/10
                </div>
                <div className="text-xs text-orange-600 flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  Excellent rating
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recovery Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <TradingViewWrapper
                    data={performanceTradingData}
                    type="line"
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <TradingViewWrapper
                    data={channelTradingData}
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
              </CardContent>
            </Card>
          </div>

          {/* Active Alerts */}
          {monitoringData.performance_alerts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Performance Alerts ({monitoringData.performance_alerts.length})</h2>
                <Button variant="outline" size="sm">
                  <Bell className="mr-2 h-4 w-4" />
                  Manage Alerts
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monitoringData.performance_alerts.map((alert, index) => (
                  <AlertCard key={index} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {monitoringData.ai_recommendations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">AI Recommendations ({monitoringData.ai_recommendations.length})</h2>
                <Button variant="outline" size="sm">
                  <Bot className="mr-2 h-4 w-4" />
                  Generate More
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {monitoringData.ai_recommendations.map((rec, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{rec.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {Math.round(rec.confidence_level * 100)}% confidence
                          </Badge>
                          <Badge variant="outline">
                            +{rec.expected_improvement}% improvement
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">{rec.description}</p>
                      
                      <div className="text-xs">
                        <div className="font-medium mb-1">Action Items:</div>
                        <ul className="space-y-1">
                          {rec.action_items.map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span>Estimated ROI: ${rec.estimated_roi.toLocaleString()}</span>
                        <Badge variant={
                          rec.implementation_effort === 'low' ? 'default' :
                          rec.implementation_effort === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {rec.implementation_effort} effort
                        </Badge>
                      </div>

                      <Button size="sm" className="w-full">
                        <ArrowRight className="w-3 h-3 mr-1" />
                        Implement
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'automations' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search automations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <select
                    value={automationFilter}
                    onChange={(e) => setAutomationFilter(e.target.value as typeof automationFilter)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Automations Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Automations ({filteredAutomations.length})</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAutomations.map(automation => (
                <AutomationCard key={automation.id} automation={automation} />
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Strategy Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Strategy Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="h-[300px] w-full">
                  <TradingViewWrapper
                    data={strategyTradingData}
                    type="histogram"
                    height={300}
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

                <div className="grid grid-cols-4 gap-4 text-center">
                  {strategyData.map((strategy, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="font-bold text-lg">{strategy.count}</div>
                      <div className="text-sm text-muted-foreground">{strategy.strategy} Cases</div>
                      <div className="text-xs">
                        <span className="text-green-600">{strategy.recovery_rate}% success</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication Channel Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Communication Channel Effectiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[250px] w-full">
                  <TradingViewWrapper
                    data={channelTradingData}
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
                  {channelData.map((channel, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-3" 
                          style={{ backgroundColor: channel.color }}
                        />
                        <div>
                          <div className="font-medium">{channel.name}</div>
                          <div className="text-sm text-muted-foreground">{channel.volume} attempts</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{channel.success_rate}%</div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}