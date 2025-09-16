'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  PieChart, 
  Search, 
  Filter, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Bot,
  Sparkles,
  FileText,
  BarChart3,
  Target,
  Eye,
  Download,
  RefreshCw,
  Zap,
  Activity,
  Calculator,
  LineChart,
  Percent,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { 
  FinancialReporting, 
  FinancialStatement,
  KPIMetric,
  TrendAnalysis,
  BenchmarkComparison,
  formatCurrency, 
  formatPercentage,
  getInsightColor,
  getTrendIcon
} from '@/lib/financial-reporting'
import { ChartOfAccount, Transaction, Customer, Vendor } from '@/types/accounting'
import { TradingViewWrapper, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'

// Mock data for demonstration
const mockAccounts: ChartOfAccount[] = [
  { id: 'acc_1', code: '1010', name: 'Cash and Cash Equivalents', type: 'asset', subtype: 'current_asset', balance: 75000, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'acc_2', code: '1020', name: 'Accounts Receivable', type: 'asset', subtype: 'current_asset', balance: 45000, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'acc_3', code: '4010', name: 'Sales Revenue', type: 'revenue', subtype: 'operating_revenue', balance: 250000, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'acc_4', code: '5010', name: 'Cost of Goods Sold', type: 'expense', subtype: 'operating_expense', balance: 150000, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'acc_5', code: '2010', name: 'Accounts Payable', type: 'liability', subtype: 'current_liability', balance: 25000, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' }
]

const mockTransactions: Transaction[] = [
  {
    id: 'tx_1', account_id: 'acc_1', date: '2024-01-15', description: 'Customer Payment', reference: 'PAY001',
    amount: 5400, total_amount: 5400, type: 'income', category: 'Revenue', status: 'posted',
    created_at: '2024-01-15', updated_at: '2024-01-15', entries: []
  },
  {
    id: 'tx_2', account_id: 'acc_4', date: '2024-01-10', description: 'Inventory Purchase', reference: 'PUR001', 
    amount: -3200, total_amount: 3200, type: 'expense', category: 'COGS', status: 'posted',
    created_at: '2024-01-10', updated_at: '2024-01-10', entries: []
  }
]

const mockReporting = new FinancialReporting(mockAccounts, mockTransactions)
const balanceSheet = mockReporting.generateBalanceSheet('2024-01-31', '2023-12-31')
const incomeStatement = mockReporting.generateIncomeStatement('2024-01-01', '2024-01-31', '2023-01-01', '2023-12-31')
const cashFlow = mockReporting.generateCashFlowStatement('2024-01-01', '2024-01-31')
const kpiMetrics = mockReporting.calculateKPIMetrics('2024-01-01', '2024-01-31')
const revenuetrend = mockReporting.generateTrendAnalysis('Revenue', 12)
const healthScore = mockReporting.calculateFinancialHealthScore('2024-01-01', '2024-01-31')

// Sample chart data for TradingView
const performanceData = kpiMetrics.map(kpi => ({
  name: kpi.name.replace(/[^\w\s-]/g, ''),
  value: kpi.value,
  benchmark: kpi.benchmark_value || 0,
  category: kpi.category
}))

const healthScoreData = [
  { name: 'Profitability', score: healthScore.component_scores.profitability, color: '#22c55e' },
  { name: 'Liquidity', score: healthScore.component_scores.liquidity, color: '#3b82f6' },
  { name: 'Efficiency', score: healthScore.component_scores.efficiency, color: '#f59e0b' },
  { name: 'Leverage', score: healthScore.component_scores.leverage, color: '#ef4444' }
]

// Convert data for TradingView charts
const revenueChartData: TradingViewChartData[] = revenuetrend.time_series.map((item, index) => ({
  time: '2024-${String(index + 1).padStart(2, '0')}-01',
  value: item.actual || 0
}))

const performanceChartData: TradingViewChartData[] = performanceData.map((item, index) => ({
  time: '2024-01-${String(index + 1).padStart(2, '0')}',
  value: item.value
}))

const benchmarkChartData: TradingViewChartData[] = performanceData.map((item, index) => ({
  time: '2024-01-${String(index + 1).padStart(2, '0')}',
  value: item.benchmark
}))

const healthScoreChartData: TradingViewChartData[] = healthScoreData.map((item, index) => ({
  time: '2024-01-${String(index + 1).padStart(2, '0')}',
  value: item.score
}))

function ReportCard({ statement, onGenerate }: { 
  statement: { name: string, description: string, icon: unknown, type: string }
  onGenerate: (type: string) => void 
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onGenerate(statement.type)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <statement.icon className="mr-2 h-5 w-5" />
            {statement.name}
          </CardTitle>
          <Button size="sm" variant="outline">
            <Eye className="w-3 h-3 mr-1" />
            Generate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{statement.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>AI-enhanced with insights</span>
          <Badge variant="outline" className="text-xs">
            <Bot className="w-3 h-3 mr-1" />
            Smart
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function InsightCard({ insight }: { insight: any }) {
  return (
    <Card className={'hover:shadow-lg transition-shadow ${getInsightColor(insight.type)}'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{insight.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {Math.round(insight.confidence * 100)}% confident
            </Badge>
            <Badge variant="outline" className="text-xs">
              Impact: {insight.impact_score}/10
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{insight.description}</p>
        
        {insight.recommendation && (
          <div className="bg-muted/50 p-2 rounded text-xs">
            <span className="font-medium">Recommendation:</span> {insight.recommendation}
          </div>
        )}

        {insight.data_points && insight.data_points.length > 0 && (
          <div className="space-y-2">
            {insight.data_points.map((point: unknown, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span>{point.metric}:</span>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">
                    {point.value.toFixed(point.metric.includes('%') ? 1 : 0)}
                    {point.metric.includes('%') ? '%' : '}
                  </span>
                  {point.benchmark && (
                    <span className="text-muted-foreground">
                      (vs {point.benchmark} benchmark)
                    </span>
                  )}
                  <span>{getTrendIcon(point.trend_direction === 'up' ? 'improving' : point.trend_direction === 'down' ? 'declining' : 'stable')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button size="sm" variant="outline" className="w-full">
          <ArrowRight className="w-3 h-3 mr-1" />
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}

function KPICard({ kpi }: { kpi: KPIMetric }) {
  const performanceColor = kpi.trend === 'improving' ? 'text-green-600' : 
                          kpi.trend === 'declining' ? 'text-red-600' : 'text-neutral-600'
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {kpi.name}
          {kpi.trend === 'improving' ? <TrendingUp className="h-4 w-4 text-green-600" /> :
           kpi.trend === 'declining' ? <TrendingDown className="h-4 w-4 text-red-600" /> :
           <Activity className="h-4 w-4 text-neutral-600" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={'text-2xl font-bold ${performanceColor}'}>
          {kpi.unit === 'currency' ? formatCurrency(kpi.value) :
           kpi.unit === 'percentage' ? formatPercentage(kpi.value) :
           kpi.unit === 'days' ? '${Math.round(kpi.value)} days' :
           kpi.value.toFixed(1)}
        </div>
        
        {kpi.benchmark_value && (
          <div className="text-xs text-muted-foreground mt-1">
            vs {kpi.unit === 'currency' ? formatCurrency(kpi.benchmark_value) :
                kpi.unit === 'percentage' ? formatPercentage(kpi.benchmark_value) :
                kpi.benchmark_value.toFixed(1)} benchmark
          </div>
        )}
        
        <div className="bg-muted/50 p-2 rounded text-xs mt-3">
          {kpi.ai_interpretation}
        </div>
      </CardContent>
    </Card>
  )
}

export default function FinancialReportsPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [selectedPeriod, setSelectedPeriod] = useState('current_month')
  const [reportType, setReportType] = useState<'all' | 'statements' | 'kpis' | 'trends'>('all')

  const reportTypes = [
    { 
      name: 'Balance Sheet', 
      description: 'Assets, liabilities, and equity with AI variance analysis',
      icon: Calculator,
      type: 'balance_sheet'
    },
    { 
      name: 'Income Statement', 
      description: 'Revenue, expenses, and profitability with trend insights',
      icon: BarChart3,
      type: 'income_statement'
    },
    { 
      name: 'Cash Flow Statement', 
      description: 'Operating, investing, and financing cash flows with forecasting',
      icon: LineChart,
      type: 'cash_flow'
    },
    { 
      name: 'Financial Ratios', 
      description: 'Key performance indicators with industry benchmarking',
      icon: Target,
      type: 'ratios'
    }
  ]

  const allInsights = [
    ...balanceSheet.ai_insights,
    ...incomeStatement.ai_insights,
    ...cashFlow.ai_insights
  ].sort((a, b) => b.impact_score - a.impact_score)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <PieChart className="mr-3 h-8 w-8" />
            Financial Reports
          </h1>
          <p className="text-muted-foreground">AI-powered insights, trend analysis, and predictive analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button>
            <Bot className="mr-2 h-4 w-4" />
            AI Analysis
          </Button>
        </div>
      </div>

      {/* Financial Health Score */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Award className="mr-2 h-5 w-5" />
            AI Financial Health Score
            <Badge className="ml-3 text-lg px-3 py-1">
              {healthScore.overall_score.toFixed(0)}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="h-[200px] w-full">
                <TradingViewWrapper
                  data={healthScoreChartData}
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
                        color: 'rgba(75, 85, 99, 0.1)',
                      },
                      horzLines: {
                        color: 'rgba(75, 85, 99, 0.1)',
                      },
                    },
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2 flex items-center">
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Strengths ({healthScore.strengths.length})
                </h4>
                <ul className="text-sm space-y-1">
                  {healthScore.strengths.map((strength, i) => (
                    <li key={i} className="text-green-600">• {strength}</li>
                  ))}
                </ul>
              </div>
              
              {healthScore.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2 flex items-center">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    Areas for Improvement ({healthScore.weaknesses.length})
                  </h4>
                  <ul className="text-sm space-y-1">
                    {healthScore.weaknesses.map((weakness, i) => (
                      <li key={i} className="text-red-600">• {weakness}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {healthScore.priority_actions.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Priority Actions</h4>
                  <ul className="text-sm space-y-1">
                    {healthScore.priority_actions.map((action, i) => (
                      <li key={i} className="text-blue-600">• {action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Dashboard */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh KPIs
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiMetrics.map(kpi => (
            <KPICard key={kpi.name} kpi={kpi} />
          ))}
        </div>
      </div>

      {/* Revenue Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Revenue Trend Analysis
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {Math.round(revenuetrend.forecast_confidence * 100)}% confidence
              </Badge>
              {revenuetrend.seasonality_detected && (
                <Badge variant="outline">Seasonal pattern detected</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <TradingViewWrapper
              data={revenueChartData}
              type="area"
              height={400}
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
          
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg">
                {formatCurrency(revenuetrend.next_period_prediction)}
              </div>
              <div className="text-muted-foreground">Next Period Forecast</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">
                {revenuetrend.trend_strength > 0 ? '+' : '}{formatPercentage(revenuetrend.trend_strength * 100)}
              </div>
              <div className="text-muted-foreground">Trend Strength</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">
                {revenuetrend.risk_factors.length}
              </div>
              <div className="text-muted-foreground">Risk Factors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Statement Generation */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Financial Statements</h2>
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
            >
              <option value="current_month">Current Month</option>
              <option value="current_quarter">Current Quarter</option>
              <option value="current_year">Current Year</option>
              <option value="last_12_months">Last 12 Months</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportTypes.map(report => (
            <ReportCard 
              key={report.type} 
              statement={report} 
              onGenerate={(type) => console.log('Generating ${type}')} 
            />
          ))}
        </div>
      </div>

      {/* AI Insights */}
      {allInsights.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">AI Financial Insights ({allInsights.length})</h2>
            <Button variant="outline" size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate New Insights
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allInsights.slice(0, 6).map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Performance vs Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Industry Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mb-4">
            <TradingViewWrapper
              data={performanceChartData}
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
              }}
            />
          </div>
          <div className="h-[300px] w-full">
            <TradingViewWrapper
              data={benchmarkChartData}
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
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as typeof reportType)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">All Reports</option>
                <option value="statements">Financial Statements</option>
                <option value="kpis">KPIs & Metrics</option>
                <option value="trends">Trend Analysis</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {allInsights.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">AI is analyzing your financial data</p>
            <p className="text-sm">New insights will appear as more data becomes available.</p>
            <Button className="mt-4" variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Run AI Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}