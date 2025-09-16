'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Activity, 
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
  Droplets,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUpDown,
  Timer,
  Shield
} from 'lucide-react'
import { 
  CashFlowManagement,
  CashFlowScenario,
  LiquidityOptimization,
  WorkingCapitalAnalysis,
  formatCashFlowAmount,
  getCashFlowTrendIcon,
  getLiquidityStatusColor,
  getScenarioColor
} from '@/lib/cash-flow-management'
import { BankAccount, Invoice, Bill, Payment } from '@/types/accounting'
import { TradingViewWrapper, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'

// Mock data
const mockBankAccounts: BankAccount[] = [
  {
    id: 'bank_1',
    name: 'Main Operating Account',
    account_number: '****1234',
    bank_name: 'First National Bank',
    account_type: 'checking',
    current_balance: 85000,
    available_balance: 78000,
    currency: 'USD',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'bank_2',
    name: 'Reserve Account',
    account_number: '****5678',
    bank_name: 'First National Bank',
    account_type: 'savings',
    current_balance: 45000,
    available_balance: 45000,
    currency: 'USD',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
]

const mockInvoices: Invoice[] = [
  {
    id: 'inv_1', invoice_number: 'INV-2024-001', customer_id: 'cust_1',
    customer: { id: 'cust_1', name: 'Acme Corp', payment_terms: 30, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
    date: '2024-01-15', due_date: '2024-02-14', subtotal: 15000, tax_amount: 1200,
    total_amount: 16200, balance: 16200, status: 'sent', line_items: [],
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

const mockBills: Bill[] = [
  {
    id: 'bill_1', bill_number: 'BILL-001', vendor_id: 'vendor_1',
    vendor: { id: 'vendor_1', name: 'Office Supplies Co', payment_terms: 30, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
    date: '2024-01-10', due_date: '2024-02-09', subtotal: 3200, tax_amount: 256,
    total_amount: 3456, balance: 3456, status: 'received', line_items: [],
    created_at: '2024-01-10T00:00:00Z', updated_at: '2024-01-10T00:00:00Z'
  }
]

const mockPayments: Payment[] = [
  {
    id: 'pay_1', payment_number: 'PAY-001', type: 'payment_received', amount: 5000,
    date: '2024-01-12', method: 'bank_transfer', account_id: 'bank_1', customer_id: 'cust_1',
    created_at: '2024-01-12T00:00:00Z', updated_at: '2024-01-12T00:00:00Z'
  }
]

const mockCashFlow = new CashFlowManagement(mockBankAccounts, mockInvoices, mockBills, mockPayments)
const cashPosition = mockCashFlow.getRealTimeCashPosition()
const scenarios = mockCashFlow.generateCashFlowForecast(90)
const optimizations = mockCashFlow.generateLiquidityOptimizations()
const workingCapital = mockCashFlow.analyzeWorkingCapital()
const insights = mockCashFlow.generateCashFlowInsights()
const kpis = mockCashFlow.getCashFlowKPIs()
const alerts = mockCashFlow.generateCashFlowAlerts()
const stressTests = mockCashFlow.performStressTesting()

// Convert working capital data for TradingView
const workingCapitalTradingData: TradingViewChartData[] = [
  { time: '2024-01-01', value: workingCapital.components.accounts_receivable.dso },
  { time: '2024-01-02', value: workingCapital.components.inventory.dit },
  { time: '2024-01-03', value: workingCapital.components.accounts_payable.dpo }
]

function CashPositionCard({ account }: { account: any }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{account.account_name}</CardTitle>
          <Badge variant={account.alerts.length > 0 ? 'destructive' : 'outline'}>
            {account.alerts.length === 0 ? 'Healthy' : '${account.alerts.length} Alert${account.alerts.length > 1 ? 's' : '}'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xl font-bold text-green-600">
              {formatCashFlowAmount(account.current_balance)}
            </div>
            <div className="text-xs text-muted-foreground">Current Balance</div>
          </div>
          <div>
            <div className="text-lg font-medium">
              {formatCashFlowAmount(account.available_balance)}
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>

        {account.alerts.map((alert: string, i: number) => (
          <div key={i} className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs text-yellow-800">
            <AlertTriangle className="inline w-3 h-3 mr-1" />
            {alert}
          </div>
        ))}

        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(account.last_updated).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}

function ScenarioCard({ scenario }: { scenario: CashFlowScenario }) {
  const chartData = scenario.forecasts.slice(0, 30).map(f => ({
    date: new Date(f.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    balance: f.closing_balance,
    inflows: f.projected_inflows,
    outflows: f.projected_outflows
  }))

  // Convert data for TradingView
  const scenarioTradingData: TradingViewChartData[] = scenario.forecasts.slice(0, 30).map((f, index) => ({
    time: '2024-${String(Math.floor(index / 30) + 1).padStart(2, '0')}-${String((index % 30) + 1).padStart(2, '0')}',
    value: f.closing_balance
  }))

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{scenario.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {Math.round(scenario.probability * 100)}% likely
            </Badge>
            <Badge 
              className="text-white"
              style={{ backgroundColor: getScenarioColor(scenario.type) }}
            >
              {scenario.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[200px] w-full">
          <TradingViewWrapper
            data={scenarioTradingData}
            type="area"
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

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-bold">{formatCashFlowAmount(scenario.impact_summary.best_case_balance)}</div>
            <div className="text-muted-foreground">Best Case</div>
          </div>
          <div>
            <div className="font-bold">{formatCashFlowAmount(scenario.impact_summary.worst_case_balance)}</div>
            <div className="text-muted-foreground">Worst Case</div>
          </div>
          <div>
            <div className="font-bold">{scenario.impact_summary.days_of_runway} days</div>
            <div className="text-muted-foreground">Runway</div>
          </div>
          <div>
            <div className="font-bold">{formatCashFlowAmount(scenario.impact_summary.credit_line_needed)}</div>
            <div className="text-muted-foreground">Credit Needed</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Key Assumptions:</div>
          {scenario.assumptions.map((assumption, i) => (
            <div key={i} className="text-xs bg-muted/50 p-2 rounded">
              {assumption.description}: {assumption.impact_percentage > 0 ? '+' : '}{assumption.impact_percentage}%
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function OptimizationCard({ optimization }: { optimization: LiquidityOptimization }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{optimization.type.replace('_', ' ').toUpperCase()}</CardTitle>
          <Badge className={
            optimization.success_probability > 0.8 ? 'bg-green-100 text-green-800' :
            optimization.success_probability > 0.6 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }>
            {Math.round(optimization.success_probability * 100)}% success
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{optimization.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold text-green-600">
              {formatCashFlowAmount(optimization.potential_cash_impact)}
            </div>
            <div className="text-muted-foreground">Cash Impact</div>
          </div>
          <div>
            <div className="font-medium">
              {optimization.implementation_timeline}
            </div>
            <div className="text-muted-foreground">Timeline</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span>Effort:</span>
          <Badge variant={
            optimization.effort_level === 'low' ? 'default' :
            optimization.effort_level === 'medium' ? 'secondary' : 'destructive'
          }>
            {optimization.effort_level}
          </Badge>
        </div>

        {optimization.prerequisites.length > 0 && (
          <div className="text-xs">
            <div className="font-medium mb-1">Prerequisites:</div>
            <ul className="space-y-1">
              {optimization.prerequisites.map((prereq, i) => (
                <li key={i}>• {prereq}</li>
              ))}
            </ul>
          </div>
        )}

        <Button size="sm" className="w-full">
          <Zap className="w-3 h-3 mr-1" />
          Implement
        </Button>
      </CardContent>
    </Card>
  )
}

function KPICard({ kpi }: { kpi: any }) {
  const statusColor = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    fair: 'text-yellow-600',
    poor: 'text-red-600`
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {kpi.name}
          <span>{getCashFlowTrendIcon(kpi.trend)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${statusColor[kpi.status]}'}>
          {kpi.value.toFixed(0)} {kpi.unit}
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          vs {kpi.benchmark} {kpi.unit} benchmark
        </div>
        
        <Badge 
          variant="outline" 
          className={'mt-2 ${statusColor[kpi.status]} border-current'}
        >
          {kpi.status.toUpperCase()}
        </Badge>
        
        <div className="bg-muted/50 p-2 rounded text-xs mt-3">
          {kpi.description}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CashFlowManagementPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [selectedScenario, setSelectedScenario] = useState<'optimistic' | 'realistic' | 'pessimistic'>('realistic')
  const [timeHorizon, setTimeHorizon] = useState(90)

  const selectedScenarioData = scenarios.find(s => s.type === selectedScenario)!

  const workingCapitalChart = [
    { component: 'Receivables', days: workingCapital.components.accounts_receivable.dso, target: 35, amount: workingCapital.components.accounts_receivable.amount },
    { component: 'Inventory', days: workingCapital.components.inventory.dit, target: 60, amount: workingCapital.components.inventory.amount },
    { component: 'Payables', days: workingCapital.components.accounts_payable.dpo, target: 45, amount: workingCapital.components.accounts_payable.amount }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Activity className="mr-3 h-8 w-8" />
            Cash Flow Management
          </h1>
          <p className="text-muted-foreground">Real-time forecasting with AI-powered liquidity optimization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Forecasts
          </Button>
          <Button>
            <Bot className="mr-2 h-4 w-4" />
            AI Optimization
          </Button>
        </div>
      </div>

      {/* Real-time Cash Position */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Droplets className="mr-2 h-5 w-5" />
            Real-Time Cash Position
            <Badge className="ml-3 text-lg px-3 py-1">
              {formatCashFlowAmount(cashPosition.total_cash)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCashFlowAmount(cashPosition.available_cash)}
                </div>
                <div className="text-sm text-muted-foreground">Available Cash</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCashFlowAmount(cashPosition.committed_cash)}
                </div>
                <div className="text-sm text-muted-foreground">Committed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {formatCashFlowAmount(cashPosition.daily_burn_rate)}
                </div>
                <div className="text-sm text-muted-foreground">Daily Burn Rate</div>
              </div>
              <div className="text-center">
                <div className={'text-xl font-bold ${getLiquidityStatusColor(cashPosition.runway_days)}'}>
                  {cashPosition.runway_days} days
                </div>
                <div className="text-sm text-muted-foreground">Runway</div>
              </div>
            </div>
            
            <div className="space-y-3">
              {cashPosition.next_critical_date && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-center text-yellow-800">
                    <Clock className="mr-2 h-4 w-4" />
                    <span className="font-medium">Next Critical Date:</span>
                  </div>
                  <div className="mt-1 text-sm text-yellow-700">
                    {new Date(cashPosition.next_critical_date).toLocaleDateString()} - Monitor cash flow closely
                  </div>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow KPIs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Cash Flow KPIs</h2>
          <Button variant="outline" size="sm">
            <Target className="mr-2 h-4 w-4" />
            Set Targets
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map(kpi => (
            <KPICard key={kpi.name} kpi={kpi} />
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertCircle className="mr-2 h-5 w-5" />
              Active Cash Flow Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className="bg-background p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        alert.priority === 'critical' ? 'destructive' :
                        alert.priority === 'high' ? 'default' : 'secondary'
                      }>
                        {alert.priority.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{alert.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {alert.projected_date}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{alert.message}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium mb-1">Automatic Actions:</div>
                      <ul className="space-y-1">
                        {alert.automatic_actions.map((action, i) => (
                          <li key={i} className="flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Manual Actions Required:</div>
                      <ul className="space-y-1">
                        {alert.manual_actions_required.map((action, i) => (
                          <li key={i} className="flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-yellow-600" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <Button size="sm">
                      Take Action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Positions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Account Positions ({cashPosition.accounts.length})</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cashPosition.accounts.map(account => (
            <CashPositionCard key={account.account_id} account={account} />
          ))}
        </div>
      </div>

      {/* Scenario Planning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Cash Flow Scenarios</h2>
          <div className="flex items-center space-x-2">
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
            >
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
              <option value={180}>180 Days</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {scenarios.map(scenario => (
            <ScenarioCard key={scenario.type} scenario={scenario} />
          ))}
        </div>
      </div>

      {/* Working Capital Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Working Capital Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold">
                {Math.round(workingCapital.efficiency_ratio * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Efficiency Score vs Optimal
              </div>
            </div>
            
            <div className="h-[250px] w-full">
              <TradingViewWrapper
                data={workingCapitalTradingData}
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

        <Card>
          <CardHeader>
            <CardTitle>Working Capital Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">
                    {formatCashFlowAmount(workingCapital.components.accounts_receivable.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">Receivables</div>
                  <div className="text-xs">
                    {workingCapital.components.accounts_receivable.dso.toFixed(0)} DSO days
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold">
                    {formatCashFlowAmount(workingCapital.components.inventory.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">Inventory</div>
                  <div className="text-xs">
                    {workingCapital.components.inventory.dit.toFixed(0)} DIT days
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">
                    -{formatCashFlowAmount(workingCapital.components.accounts_payable.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">Payables</div>
                  <div className="text-xs">
                    {workingCapital.components.accounts_payable.dpo.toFixed(0)} DPO days
                  </div>
                </div>
              </div>
              
              {workingCapital.improvement_opportunities.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Improvement Opportunities:</div>
                  <div className="space-y-2">
                    {workingCapital.improvement_opportunities.map((opp, i) => (
                      <div key={i} className="bg-muted/50 p-2 rounded text-xs">
                        <div className="flex items-center justify-between">
                          <span>{opp.component}: {opp.current_days}→{opp.target_days} days</span>
                          <span className="font-medium text-green-600">
                            {formatCashFlowAmount(opp.cash_impact)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liquidity Optimizations */}
      {optimizations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">AI Liquidity Optimizations ({optimizations.length})</h2>
            <Button variant="outline" size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate More
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optimizations.map(optimization => (
              <OptimizationCard key={optimization.id} optimization={optimization} />
            ))}
          </div>
        </div>
      )}

      {/* Stress Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Cash Flow Stress Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stressTests.map((test, i) => (
              <div key={i} className={'p-4 rounded-lg border ${
                test.severity === 'critical' ? 'bg-red-50 border-red-200' :
                test.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                test.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-neutral-50 border-neutral-200'
              }'}>'
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{test.scenario_name}</div>
                  <Badge variant={
                    test.severity === 'critical' ? 'destructive' :
                    test.severity === 'high' ? 'default' : 'secondary'
                  }>
                    {test.severity.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Stress Factor:</div>
                    <div>{test.stress_factor}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Cash Impact:</div>
                    <div className="font-medium text-red-600">
                      {test.cash_shortage_days} days of shortage
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs">
                  <div className="text-muted-foreground mb-1">Recommended Mitigation:</div>
                  <ul className="space-y-1">
                    {test.recommended_mitigation.map((mitigation, j) => (
                      <li key={j}>• {mitigation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">AI Cash Flow Insights ({insights.length})</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{insight.title}</CardTitle>
                    <Badge variant="outline">
                      Priority: {insight.priority_score}/10
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{insight.description}</p>
                  
                  <div className="space-y-2">
                    {insight.supporting_data.map((data, j) => (
                      <div key={j} className="flex items-center justify-between text-xs">
                        <span>{data.metric}:</span>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{data.value.toFixed(0)}</span>
                          <span>{getCashFlowTrendIcon(data.trend)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-muted/50 p-2 rounded text-xs">
                    <div className="font-medium mb-1">Recommendations:</div>
                    <ul className="space-y-1">
                      {insight.actionable_recommendations.map((rec, j) => (
                        <li key={j}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cash flow data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value as typeof selectedScenario)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="optimistic">Optimistic Scenario</option>
                <option value="realistic">Realistic Scenario</option>
                <option value="pessimistic">Pessimistic Scenario</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}