'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Shield,
  Bot,
  Sparkles,
  Eye,
  MessageSquare,
  Upload,
  Download,
  Settings,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle,
  XCircleIcon,
  Timer,
  Bell,
  Send,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Calendar,
  User,
  Building,
  DollarSign,
  Percent,
  Archive,
  History,
  Flag,
  Lock,
  Unlock
} from 'lucide-react'
import { 
  InvoiceApprovalEngine,
  InvoiceApprovalRequest,
  InvoiceApprovalWorkflow,
  getApprovalStatusColor,
  formatApprovalStatus,
  calculateApprovalProgress,
  getFraudRiskColor,
  getComplianceStatusColor
} from '@/lib/invoice-approval'
import { Invoice, Customer } from '@/types/accounting'
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Cell, RadialBarChart, RadialBar } from 'recharts'

// Mock data
const mockCustomers: Customer[] = [
  { id: 'cust_1', name: 'Acme Corporation', payment_terms: 30, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'cust_2', name: 'Global Tech Solutions', payment_terms: 15, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'cust_3', name: 'Metro Industries', payment_terms: 45, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' }
]

const approvalEngine = new InvoiceApprovalEngine()

// Create sample approval requests
const mockApprovalRequests: InvoiceApprovalRequest[] = [
  {
    id: 'approval_1',
    invoice_id: 'inv_1',
    invoice: {
      id: 'inv_1',
      invoice_number: 'INV-2024-001',
      customer_id: 'cust_1',
      customer: mockCustomers[0],
      date: '2024-01-15',
      due_date: '2024-02-14',
      subtotal: 15000,
      tax_amount: 1500,
      total_amount: 16500,
      balance: 16500,
      status: 'draft',
      line_items: [],
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    workflow_id: 'workflow_1',
    workflow: {
      id: 'workflow_1',
      name: 'Standard Approval',
      description: 'Standard approval workflow',
      is_active: true,
      trigger_conditions: Record<string, unknown>,
      approval_levels: [],
      compliance_checks: [],
      fraud_detection_rules: [],
      escalation_rules: [],
      automation_settings: {
        auto_approve_low_risk: true,
        auto_approve_threshold: 25,
        ai_assisted_review: true,
        batch_processing_enabled: false,
        real_time_processing: true,
        weekend_processing: false,
        holiday_processing: false,
        notification_preferences: {
          approver_notifications: true,
          submitter_notifications: true,
          stakeholder_updates: true,
          compliance_alerts: true
        }
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    current_level: 1,
    status: 'pending',
    submission_date: '2024-01-15T10:00:00Z',
    due_date: '2024-01-16T10:00:00Z',
    submitter_id: 'user_1',
    fraud_risk_score: 25,
    fraud_risk_breakdown: {
      overall_score: 25,
      risk_factors: [],
      historical_comparison: {
        similar_invoices_analyzed: 100,
        average_risk_score: 30,
        false_positive_rate: 0.05,
        detection_accuracy: 0.95
      },
      ai_insights: []
    },
    compliance_status: {
      overall_status: 'compliant',
      compliance_score: 95,
      checks_performed: [],
      regulatory_requirements: []
    },
    ai_recommendations: [],
    approval_history: [],
    current_approvers: [],
    required_approvals_remaining: 1,
    supporting_documents: [],
    comments: [],
    audit_trail: []
  },
  {
    id: 'approval_2',
    invoice_id: 'inv_2',
    invoice: {
      id: 'inv_2',
      invoice_number: 'INV-2024-002',
      customer_id: 'cust_2',
      customer: mockCustomers[1],
      date: '2024-01-14',
      due_date: '2024-02-13',
      subtotal: 45000,
      tax_amount: 4500,
      total_amount: 49500,
      balance: 49500,
      status: 'draft',
      line_items: [],
      created_at: '2024-01-14T00:00:00Z',
      updated_at: '2024-01-14T00:00:00Z'
    },
    workflow_id: 'workflow_1',
    workflow: {
      id: 'workflow_1',
      name: 'Executive Approval',
      description: 'High-value approval workflow',
      is_active: true,
      trigger_conditions: Record<string, unknown>,
      approval_levels: [],
      compliance_checks: [],
      fraud_detection_rules: [],
      escalation_rules: [],
      automation_settings: {
        auto_approve_low_risk: false,
        auto_approve_threshold: 10,
        ai_assisted_review: true,
        batch_processing_enabled: false,
        real_time_processing: true,
        weekend_processing: false,
        holiday_processing: false,
        notification_preferences: {
          approver_notifications: true,
          submitter_notifications: true,
          stakeholder_updates: true,
          compliance_alerts: true
        }
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    current_level: 2,
    status: 'in_review',
    submission_date: '2024-01-14T14:30:00Z',
    due_date: '2024-01-15T14:30:00Z',
    submitter_id: 'user_2',
    fraud_risk_score: 65,
    fraud_risk_breakdown: {
      overall_score: 65,
      risk_factors: [],
      historical_comparison: {
        similar_invoices_analyzed: 50,
        average_risk_score: 40,
        false_positive_rate: 0.08,
        detection_accuracy: 0.92
      },
      ai_insights: []
    },
    compliance_status: {
      overall_status: 'requires_review',
      compliance_score: 78,
      checks_performed: [],
      regulatory_requirements: []
    },
    ai_recommendations: [],
    approval_history: [],
    current_approvers: [],
    required_approvals_remaining: 2,
    supporting_documents: [],
    comments: [],
    audit_trail: []
  }
]

// Mock analytics data
const approvalTrendsData = [
  { date: 'Jan 1', approved: 45, rejected: 5, pending: 12, fraud_detected: 2 },
  { date: 'Jan 2', approved: 52, rejected: 3, pending: 15, fraud_detected: 1 },
  { date: 'Jan 3', approved: 38, rejected: 8, pending: 9, fraud_detected: 3 },
  { date: 'Jan 4', approved: 61, rejected: 4, pending: 18, fraud_detected: 1 },
  { date: 'Jan 5', approved: 49, rejected: 6, pending: 14, fraud_detected: 2 },
  { date: 'Jan 6', approved: 55, rejected: 2, pending: 16, fraud_detected: 0 },
  { date: 'Jan 7', approved: 43, rejected: 7, pending: 11, fraud_detected: 4 }
]

const fraudRiskDistribution = [
  { risk_level: 'Low (0-25)', count: 245, color: '#22c55e' },
  { risk_level: 'Medium (26-50)', count: 89, color: '#3b82f6' },
  { risk_level: 'High (51-75)', count: 34, color: '#f59e0b' },
  { risk_level: 'Critical (76-100)', count: 12, color: '#ef4444' }
]

const complianceBreakdown = [
  { category: 'Tax Compliance', score: 98.5, issues: 2 },
  { category: 'GAAP Standards', score: 96.2, issues: 5 },
  { category: 'Internal Policy', score: 94.8, issues: 8 },
  { category: 'Regulatory', score: 99.1, issues: 1 }
]

function ApprovalRequestCard({ request }: { request: InvoiceApprovalRequest }) {
  const progress = calculateApprovalProgress(request)
  const statusColor = getApprovalStatusColor(request.status)
  const fraudRiskColor = getFraudRiskColor(request.fraud_risk_score)
  const complianceColor = getComplianceStatusColor(request.compliance_status.overall_status)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{request.invoice.invoice_number}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge style={{ backgroundColor: statusColor, color: 'white' }} className="text-xs">
              {formatApprovalStatus(request.status)}
            </Badge>
            {request.ai_recommendations.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Bot className="w-3 h-3 mr-1" />
                AI Assisted
              </Badge>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {request.invoice.customer.name}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-lg font-bold">
              ${request.invoice.total_amount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Invoice Amount</div>
          </div>
          <div>
            <div className="text-sm font-medium">
              Level {progress.current_level} of {progress.total_levels}
            </div>
            <div className="text-xs text-muted-foreground">Approval Progress</div>
          </div>
        </div>

        {/* Risk and Compliance Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className={'p-2 rounded text-xs border'} style={{ borderColor: fraudRiskColor }}>
            <div className="flex items-center">
              <Shield className="w-3 h-3 mr-1" style={{ color: fraudRiskColor }} />
              <span className="font-medium">Fraud Risk: {request.fraud_risk_score}/100</span>
            </div>
            <div className="text-xs opacity-75 mt-1">
              {request.fraud_risk_score < 30 ? 'Low Risk' : 
               request.fraud_risk_score < 60 ? 'Medium Risk' : 'High Risk`}
            </div>
          </div>
          <div className={`p-2 rounded text-xs border`} style={{ borderColor: complianceColor }}>
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" style={{ color: complianceColor }} />
              <span className="font-medium">Compliance: {request.compliance_status.compliance_score}/100</span>
            </div>
            <div className="text-xs opacity-75 mt-1">
              {formatApprovalStatus(request.compliance_status.overall_status)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Approval Progress</span>
            <span>{Math.round(progress.completion_percentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.completion_percentage}%' }}
            />
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Timer className="w-3 h-3 mr-1" />
            <span>
              {progress.time_remaining_hours > 0 
                ? '${Math.round(progress.time_remaining_hours)}h remaining'
                : 'Overdue'
              }
            </span>
          </div>
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            <span>{request.required_approvals_remaining} approvals needed</span>
          </div>
        </div>

        {/* AI Recommendations Preview */}
        {request.ai_recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs">
            <div className="flex items-center text-blue-800 mb-1">
              <Sparkles className="w-3 h-3 mr-1" />
              <span className="font-medium">AI Recommendation</span>
            </div>
            <div className="text-blue-700">
              {request.ai_recommendations[0].recommendation_type === 'approve' ? 
                'AI suggests approval based on low risk factors' :
                'AI suggests review based on detected anomalies'
              }
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="w-3 h-3 mr-1" />
            Review
          </Button>
          {request.status === 'pending' && (
            <>
              <Button size="sm" variant="outline" className="flex-1">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <XCircle className="w-3 h-3 mr-1" />
                Reject
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" className="flex-1">
            <MessageSquare className="w-3 h-3 mr-1" />
            Comment
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function FraudMonitoringCard() {
  const fraudMetrics = approvalEngine.monitorFraudRisk()

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-red-800">
          <Shield className="mr-2 h-5 w-5" />
          Fraud Detection Monitor
          <Badge className="ml-3 bg-red-600 text-white">
            {fraudMetrics.high_risk_invoices} High Risk
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {fraudMetrics.fraud_alerts_today}
            </div>
            <div className="text-sm text-muted-foreground">Alerts Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {fraudMetrics.detection_accuracy}%
            </div>
            <div className="text-sm text-muted-foreground">Detection Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {fraudMetrics.false_positive_rate}%
            </div>
            <div className="text-sm text-muted-foreground">False Positive Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {fraudMetrics.high_risk_invoices}
            </div>
            <div className="text-sm text-muted-foreground">High Risk Invoices</div>
          </div>
        </div>

        {/* Top Risk Factors */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-800">Top Risk Factors</h4>
          {fraudMetrics.top_risk_factors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
              <div className="flex items-center">
                <AlertTriangle className="w-3 h-3 mr-2 text-red-600" />
                <span className="text-xs font-medium">{factor.factor}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {factor.frequency} cases
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {factor.impact_score}/100
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* AI Insights */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-red-800">AI Insights</h4>
          {fraudMetrics.ai_insights.map((insight, index) => (
            <div key={index} className="bg-white p-2 rounded text-xs">
              <div className="flex items-center mb-1">
                <Bot className="w-3 h-3 mr-1 text-blue-600" />
                <span className="font-medium">{insight.title}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {Math.round(insight.confidence * 100)}% confidence
                </Badge>
              </div>
              <div className="text-muted-foreground">{insight.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ComplianceOverviewCard() {
  const complianceOverview = approvalEngine.getComplianceOverview()

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-green-800">
          <CheckCircle className="mr-2 h-5 w-5" />
          Compliance Overview
          <Badge className="ml-3 bg-green-600 text-white">
            {complianceOverview.overall_compliance_rate.toFixed(1)}% Compliant
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {complianceOverview.critical_violations}
            </div>
            <div className="text-sm text-muted-foreground">Critical Violations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {complianceOverview.pending_reviews}
            </div>
            <div className="text-sm text-muted-foreground">Pending Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {complianceOverview.automated_fixes_applied}
            </div>
            <div className="text-sm text-muted-foreground">Auto-fixes Applied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {complianceOverview.overall_compliance_rate.toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">Overall Compliance</div>
          </div>
        </div>

        {/* Compliance by Category */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-green-800">Compliance by Category</h4>
          {complianceOverview.compliance_by_category.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                <span className="text-xs font-medium">{category.category}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {category.compliance_rate.toFixed(1)}%
                </Badge>
                <Badge variant={category.violations_count > 0 ? "destructive" : "secondary"} className="text-xs">
                  {category.violations_count} issues
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Regulatory Status */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-green-800">Regulatory Status</h4>
          {complianceOverview.regulatory_status.map((regulation, index) => (
            <div key={index} className="bg-white p-2 rounded text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{regulation.regulation}</span>
                <Badge 
                  variant={regulation.compliance_level === 'full' ? 'default' : 
                          regulation.compliance_level === 'partial' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {regulation.compliance_level}
                </Badge>
              </div>
              <div className="text-muted-foreground">
                Last audit: {new Date(regulation.last_audit_date).toLocaleDateString()} | 
                Next review: {new Date(regulation.next_review_due).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function InvoiceApprovalPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'in_review'>('all')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'workflows' | 'analytics' | 'settings'>('dashboard')

  const filteredRequests = useMemo(() => {
    return mockApprovalRequests.filter(request => {
      const matchesSearch = request.invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

  const metrics = approvalEngine.getApprovalMetrics()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Shield className="mr-3 h-8 w-8" />
            Invoice Approval Workflows
          </h1>
          <p className="text-muted-foreground">AI-powered fraud detection, compliance checking, and approval automation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Bot className="mr-2 h-4 w-4" />
            AI Optimize
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'requests', label: 'Approval Requests', icon: FileText },
          { id: 'workflows', label: 'Workflows', icon: Settings },
          { id: 'analytics', label: 'Analytics', icon: LineChart },
          { id: 'settings', label: 'Settings', icon: Settings }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_requests}</div>
                <div className="text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +12% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{metrics.pending_requests}</div>
                <div className="text-xs text-muted-foreground">
                  <Timer className="w-3 h-3 inline mr-1" />
                  Avg {metrics.average_approval_time_hours}h to approve
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Auto-Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{metrics.auto_approval_rate}%</div>
                <div className="text-xs text-muted-foreground">
                  <Bot className="w-3 h-3 inline mr-1" />
                  AI-powered efficiency
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fraud Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.fraud_detection_accuracy}%</div>
                <div className="text-xs text-muted-foreground">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Detection accuracy
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.compliance_pass_rate}%</div>
                <div className="text-xs text-muted-foreground">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Regulatory compliance
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fraud Monitoring and Compliance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FraudMonitoringCard />
            <ComplianceOverviewCard />
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Approval Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Approval Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={approvalTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="approved" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Approved" />
                    <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Pending" />
                    <Area type="monotone" dataKey="rejected" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Rejected" />
                    <Area type="monotone" dataKey="fraud_detected" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Fraud Detected" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Fraud Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Fraud Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie data={fraudRiskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                    {fraudRiskDistribution.map((entry, index) => (
                      <Cell key={'cell-${index}'} fill={entry.color} />
                    ))}
                    <Tooltip 
                      formatter={(value) => [value, 'Invoices']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent High-Priority Requests */}
          <Card>
            <CardHeader>
              <CardTitle>High-Priority Approval Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockApprovalRequests
                  .filter(request => request.fraud_risk_score > 50 || request.status === 'escalated')
                  .slice(0, 3)
                  .map(request => (
                    <ApprovalRequestCard key={request.id} request={request} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'requests' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Approval Requests Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Approval Requests ({filteredRequests.length})</h2>
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                Bulk Actions
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map(request => (
                <ApprovalRequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Approval Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={[
                    { level: 'Level 1', avg_time: 8.5, target: 12 },
                    { level: 'Level 2', avg_time: 15.2, target: 18 },
                    { level: 'Level 3', avg_time: 22.8, target: 24 },
                    { level: 'Executive', avg_time: 35.5, target: 48 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => ['${value} hours', 'Time']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line type="monotone" dataKey="avg_time" stroke="#3b82f6" strokeWidth={2} name="Average Time" />
                    <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Target Time" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={complianceBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'score' ? '${value}%' : value,
                        name === 'score' ? 'Score' : 'Issues'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="score" fill="#22c55e" name="score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Productivity Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Productivity Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">{metrics.productivity_metrics.requests_per_day}</div>
                  <div className="text-sm text-muted-foreground">Requests/Day</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">{metrics.productivity_metrics.average_review_time_minutes}m</div>
                  <div className="text-sm text-muted-foreground">Avg Review Time</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-orange-600">{metrics.productivity_metrics.efficiency_score}</div>
                  <div className="text-sm text-muted-foreground">Efficiency Score</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-purple-600">{metrics.escalation_rate}%</div>
                  <div className="text-sm text-muted-foreground">Escalation Rate</div>
                </div>
              </div>

              {/* Bottlenecks */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Identified Bottlenecks</h4>
                {metrics.productivity_metrics.bottlenecks_identified.map((bottleneck, index) => (
                  <div key={index} className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                    <span className="text-sm">{bottleneck}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}