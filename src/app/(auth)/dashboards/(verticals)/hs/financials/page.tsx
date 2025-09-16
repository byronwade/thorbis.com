import { Button } from '@/components/ui/button';
'use client'

import { useState, useRef, useEffect } from 'react'

import { DataTable } from '@/components/ui/data-table'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  FileText,
  Calculator,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface PLStatement {
  id: string
  period: string
  periodType: 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  revenue: {
    total: number
    residential: number
    commercial: number
    emergency: number
    recurring: number
  }
  expenses: {
    total: number
    laborCosts: number
    materialCosts: number
    overhead: number
    marketing: number
    equipment: number
    insurance: number
    utilities: number
    rent: number
    other: number
  }
  grossProfit: number
  grossMargin: number
  netIncome: number
  netMargin: number
  ebitda: number
  jobCount: number
  averageJobValue: number
  revenuePerTechnician: number
  status: 'draft' | 'finalized' | 'archived'
  createdAt: string
  notes?: string
}

interface CashFlowStatement {
  id: string
  period: string
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  netCashFlow: number
  beginningCash: number
  endingCash: number
  accountsReceivable: number
  accountsPayable: number
  workingCapital: number
  daysInAR: number
  daysInAP: number
}

interface FinancialRatio {
  id: string
  category: string
  name: string
  value: number
  benchmark: number
  status: 'good' | 'warning' | 'poor'
  description: string
  trend: 'up' | 'down' | 'stable'
  periodComparison: number
}

interface BudgetVariance {
  id: string
  category: string
  budgeted: number
  actual: number
  variance: number
  variancePercent: number
  status: 'favorable' | 'unfavorable' | 'neutral'
  notes: string
}

const mockPLStatements: PLStatement[] = Array.from({ length: 24 }, (_, i) => {
  const date = new Date()
  date.setMonth(date.getMonth() - i)
  
  const revenue = {
    residential: 120000 + Math.random() * 80000,
    commercial: 85000 + Math.random() * 60000,
    emergency: 25000 + Math.random() * 20000,
    recurring: 45000 + Math.random() * 30000,
    total: 0
  }
  revenue.total = revenue.residential + revenue.commercial + revenue.emergency + revenue.recurring

  const expenses = {
    laborCosts: revenue.total * 0.35,
    materialCosts: revenue.total * 0.25,
    overhead: revenue.total * 0.15,
    marketing: revenue.total * 0.08,
    equipment: revenue.total * 0.05,
    insurance: revenue.total * 0.03,
    utilities: revenue.total * 0.02,
    rent: revenue.total * 0.04,
    other: revenue.total * 0.03,
    total: 0
  }
  expenses.total = Object.values(expenses).reduce((sum, val) => sum + val, 0) - expenses.total

  const grossProfit = revenue.total - (expenses.laborCosts + expenses.materialCosts)
  const netIncome = revenue.total - expenses.total

  return {
    id: 'pl-${i + 1}',
    period: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    periodType: 'monthly' as const,
    startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
    endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString(),
    revenue,
    expenses,
    grossProfit,
    grossMargin: (grossProfit / revenue.total) * 100,
    netIncome,
    netMargin: (netIncome / revenue.total) * 100,
    ebitda: netIncome + expenses.equipment + expenses.insurance + expenses.utilities,
    jobCount: 180 + Math.floor(Math.random() * 120),
    averageJobValue: revenue.total / (180 + Math.floor(Math.random() * 120)),
    revenuePerTechnician: revenue.total / (12 + Math.floor(Math.random() * 8)),
    status: i < 2 ? 'draft' : i < 22 ? 'finalized' : 'archived',
    createdAt: date.toISOString(),
    notes: i % 3 === 0 ? 'Strong residential growth this period' : undefined
  }
})

const mockCashFlow: CashFlowStatement[] = Array.from({ length: 12 }, (_, i) => {
  const operatingCashFlow = 180000 + Math.random() * 120000
  const investingCashFlow = -15000 - Math.random() * 25000
  const financingCashFlow = -8000 - Math.random() * 15000
  
  return {
    id: 'cf-${i + 1}',
    period: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,
    netCashFlow: operatingCashFlow + investingCashFlow + financingCashFlow,
    beginningCash: 125000 + Math.random() * 75000,
    endingCash: 145000 + Math.random() * 85000,
    accountsReceivable: 85000 + Math.random() * 45000,
    accountsPayable: 35000 + Math.random() * 25000,
    workingCapital: 95000 + Math.random() * 55000,
    daysInAR: 28 + Math.random() * 14,
    daysInAP: 22 + Math.random() * 12
  }
})

const mockRatios: FinancialRatio[] = [
  {
    id: 'ratio-1',
    category: 'Profitability',
    name: 'Gross Profit Margin',
    value: 42.5,
    benchmark: 45.0,
    status: 'warning',
    description: 'Percentage of revenue remaining after direct costs',
    trend: 'up',
    periodComparison: 1.2
  },
  {
    id: 'ratio-2',
    category: 'Profitability',
    name: 'Net Profit Margin',
    value: 18.3,
    benchmark: 15.0,
    status: 'good',
    description: 'Percentage of revenue remaining after all expenses',
    trend: 'up',
    periodComparison: 2.1
  },
  {
    id: 'ratio-3',
    category: 'Efficiency',
    name: 'Revenue per Technician',
    value: 285000,
    benchmark: 250000,
    status: 'good',
    description: 'Annual revenue generated per technician',
    trend: 'up',
    periodComparison: 12.5
  },
  {
    id: 'ratio-4',
    category: 'Efficiency',
    name: 'Job Completion Rate',
    value: 96.8,
    benchmark: 95.0,
    status: 'good',
    description: 'Percentage of scheduled jobs completed',
    trend: 'stable',
    periodComparison: 0.3
  },
  {
    id: 'ratio-5',
    category: 'Liquidity',
    name: 'Days in A/R',
    value: 32.5,
    benchmark: 30.0,
    status: 'warning',
    description: 'Average days to collect receivables',
    trend: 'down',
    periodComparison: -1.8
  },
  {
    id: 'ratio-6',
    category: 'Liquidity',
    name: 'Current Ratio',
    value: 2.4,
    benchmark: 2.0,
    status: 'good',
    description: 'Current assets divided by current liabilities',
    trend: 'up',
    periodComparison: 0.2
  },
  {
    id: 'ratio-7',
    category: 'Growth',
    name: 'Revenue Growth Rate',
    value: 24.8,
    benchmark: 20.0,
    status: 'good',
    description: 'Year-over-year revenue growth percentage',
    trend: 'up',
    periodComparison: 4.2
  },
  {
    id: 'ratio-8',
    category: 'Growth',
    name: 'Customer Retention Rate',
    value: 89.2,
    benchmark: 85.0,
    status: 'good',
    description: 'Percentage of customers retained year-over-year',
    trend: 'stable',
    periodComparison: 1.1
  }
]

const mockBudgetVariances: BudgetVariance[] = [
  {
    id: 'var-1',
    category: 'Revenue',
    budgeted: 275000,
    actual: 289500,
    variance: 14500,
    variancePercent: 5.27,
    status: 'favorable',
    notes: 'Strong commercial growth exceeded projections'
  },
  {
    id: 'var-2',
    category: 'Labor Costs',
    budgeted: 96250,
    actual: 101800,
    variance: -5550,
    variancePercent: -5.77,
    status: 'unfavorable',
    notes: 'Overtime costs higher than budgeted due to emergency calls'
  },
  {
    id: 'var-3',
    category: 'Material Costs',
    budgeted: 68750,
    actual: 65200,
    variance: 3550,
    variancePercent: 5.16,
    status: 'favorable',
    notes: 'Better vendor pricing negotiated mid-period'
  },
  {
    id: 'var-4',
    category: 'Marketing',
    budgeted: 22000,
    actual: 19800,
    variance: 2200,
    variancePercent: 10.00,
    status: 'favorable',
    notes: 'Digital marketing campaigns more cost-effective than expected'
  },
  {
    id: 'var-5',
    category: 'Equipment',
    budgeted: 13750,
    actual: 16200,
    variance: -2450,
    variancePercent: -17.82,
    status: 'unfavorable',
    notes: 'Unexpected equipment repairs and replacements'
  },
  {
    id: 'var-6',
    category: 'Insurance',
    budgeted: 8250,
    actual: 8100,
    variance: 150,
    variancePercent: 1.82,
    status: 'neutral',
    notes: 'Slight savings on workers compensation premiums'
  }
]

export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState('pl-statements')
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [dateRange, setDateRange] = useState('12-months')
  const searchRef = useRef<HTMLInputElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const plColumns = [
    {
      key: 'period',
      label: 'Period',
      render: (row: unknown) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <div>
            <div className="font-medium text-white">{row.period}</div>
            <div className="text-sm text-neutral-400">{row.periodType}</div>
          </div>
        </div>
      )
    },
    {
      key: 'revenue.total',
      label: 'Total Revenue',
      render: (row: unknown) => (
        <div className="text-right">
          <div className="font-medium text-white">${row.revenue.total.toLocaleString()}</div>
          <div className="text-sm text-neutral-400">{row.jobCount} jobs</div>
        </div>
      )
    },
    {
      key: 'expenses.total',
      label: 'Total Expenses',
      render: (row: unknown) => (
        <div className="text-right">
          <div className="font-medium text-white">${row.expenses.total.toLocaleString()}</div>
          <div className="text-sm text-red-400">-{((row.expenses.total / row.revenue.total) * 100).toFixed(1)}%</div>
        </div>
      )
    },
    {
      key: 'grossProfit',
      label: 'Gross Profit',
      render: (row: unknown) => (
        <div className="text-right">
          <div className="font-medium text-white">${row.grossProfit.toLocaleString()}</div>
          <div className="text-sm text-green-400">{row.grossMargin.toFixed(1)}% margin</div>
        </div>
      )
    },
    {
      key: 'netIncome',
      label: 'Net Income',
      render: (row: unknown) => (
        <div className="text-right">
          <div className={'font-medium ${row.netIncome >= 0 ? 'text-green-400' : 'text-red-400'
              }'}>'
            ${row.netIncome.toLocaleString()}
          </div>
          <div className="text-sm text-neutral-400">{row.netMargin.toFixed(1)}% margin</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: unknown) => {
        const status = row.status
        const statusConfig = {
          draft: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock },
          finalized: { color: 'text-green-400', bg: 'bg-green-400/10', icon: CheckCircle },
          archived: { color: 'text-neutral-400', bg: 'bg-neutral-400/10`, icon: FileText }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        const Icon = config.icon
        
        return (
          <div className={`flex items-center gap-2 ${config.color}'}>
            <div className={'p-1 rounded ${config.bg}'}>
              <Icon className="h-3 w-3" />
            </div>
            <span className="capitalize">{status}</span>
          </div>
        )
      }
    }
  ]

  const cashFlowColumns = [
    {
      key: 'period',
      label: 'Period',
      render: (row: unknown) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <span className="font-medium text-white">{row.period}</span>
        </div>
      )
    },
    {
      key: 'operatingCashFlow',
      label: 'Operating Cash Flow',
      render: (row: unknown) => (
        <div className="text-right">
          <div className={'font-medium ${row.operatingCashFlow >= 0 ? 'text-green-400' : 'text-red-400'
              }'}>'
            ${row.operatingCashFlow.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'investingCashFlow',
      label: 'Investing Cash Flow',
      render: (row: unknown) => (
        <div className="text-right">
          <div className={'font-medium ${row.investingCashFlow >= 0 ? 'text-green-400' : 'text-red-400'
              }'}>'
            ${row.investingCashFlow.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'netCashFlow',
      label: 'Net Cash Flow',
      render: (row: unknown) => (
        <div className="text-right">
          <div className={'font-medium ${row.netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'
              }'}>'
            ${row.netCashFlow.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'endingCash',
      label: 'Ending Cash',
      render: (row: unknown) => (
        <div className="text-right">
          <div className="font-medium text-white">${row.endingCash.toLocaleString()}</div>
          <div className="text-sm text-neutral-400">A/R: {row.daysInAR.toFixed(0)} days</div>
        </div>
      )
    }
  ]

  const ratioColumns = [
    {
      key: 'category',
      label: 'Category',
      render: (row: unknown) => (
        <div className="font-medium text-white">{row.category}</div>
      )
    },
    {
      key: 'name',
      label: 'Metric',
      render: (row: unknown) => (
        <div>
          <div className="font-medium text-white">{row.name}</div>
          <div className="text-sm text-neutral-400">{row.description}</div>
        </div>
      )
    },
    {
      key: 'value',
      label: 'Current Value',
      render: (row: unknown) => (
        <div className="text-right">
          <div className="font-medium text-white">
            {row.name.includes('Rate') || row.name.includes('Margin') 
              ? '${row.value.toFixed(1)}%'
              : row.name.includes('Revenue') 
              ? '$${row.value.toLocaleString()}'}
              : row.value.toFixed(1)}
          </div>
        </div>
      )
    },
    {
      key: 'benchmark',
      label: 'Benchmark',
      render: (row: unknown) => (
        <div className="text-right">
          <div className="text-neutral-400">
            {row.name.includes('Rate') || row.name.includes('Margin')
              ? '${row.benchmark.toFixed(1)}%'
              : row.name.includes('Revenue')
              ? '$${row.benchmark.toLocaleString()}'}
              : row.benchmark.toFixed(1)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: unknown) => {
        const status = row.status
        const trend = row.trend
        const statusConfig = {
          good: { color: 'text-green-400', bg: 'bg-green-400/10' },
          warning: { color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          poor: { color: 'text-red-400', bg: 'bg-red-400/10' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down` ? TrendingDown : DollarSign
        
        return (
          <div className={`flex items-center gap-2 ${config.color}'}>
            <div className={'p-1 rounded ${config.bg}'}>
              <TrendIcon className="h-3 w-3" />
            </div>
            <span className="capitalize">{status}</span>
          </div>
        )
      }
    }
  ]

  const budgetColumns = [
    {
      key: 'category',
      label: 'Category',
      render: (row: unknown) => (
        <div className="font-medium text-white">{row.category}</div>
      )
    },
    {
      key: 'budgeted',
      label: 'Budgeted',
      render: (row: unknown) => (
        <div className="text-right">
          <div className="text-white">${row.budgeted.toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'actual',
      label: 'Actual',
      render: (row: unknown) => (
        <div className="text-right">
          <div className="font-medium text-white">${row.actual.toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'variance',
      label: 'Variance',
      render: (row: unknown) => (
        <div className="text-right">
          <div className={'font-medium ${row.variance >= 0 ? 'text-green-400' : 'text-red-400'
              }'}>'
            {row.variance >= 0 ? '+' : '}${row.variance.toLocaleString()}
          </div>
          <div className="text-sm text-neutral-400">
            {row.variancePercent >= 0 ? '+' : '}{row.variancePercent.toFixed(1)}%
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: unknown) => {
        const status = row.status
        const statusConfig = {
          favorable: { color: 'text-green-400', bg: 'bg-green-400/10', icon: TrendingUp },
          unfavorable: { color: 'text-red-400', bg: 'bg-red-400/10', icon: TrendingDown },
          neutral: { color: 'text-neutral-400', bg: 'bg-neutral-400/10`, icon: DollarSign }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        const Icon = config.icon
        
        return (
          <div className={`flex items-center gap-2 ${config.color}`}>
            <div className={'p-1 rounded ${config.bg}'}>
              <Icon className="h-3 w-3" />
            </div>
            <span className="capitalize">{status}</span>
          </div>
        )
      }
    }
  ]

  const currentPL = mockPLStatements[0]
  const previousPL = mockPLStatements[1]
  const revenueGrowth = ((currentPL.revenue.total - previousPL.revenue.total) / previousPL.revenue.total) * 100
  const profitGrowth = ((currentPL.netIncome - previousPL.netIncome) / previousPL.netIncome) * 100

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Reports</h1>
          <p className="text-neutral-400">P&L statements, cash flow analysis, and financial metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="12-months">Last 12 Months</option>
            <option value="6-months">Last 6 Months</option>
            <option value="ytd">Year to Date</option>
            <option value="custom">Custom Range</option>
          </select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-925 rounded-lg border border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-white">${currentPL.revenue.total.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className={'text-sm ${revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'
              }'}>'
              {revenueGrowth >= 0 ? '+' : '}{revenueGrowth.toFixed(1)}% vs last month
            </div>
          </div>
        </div>

        <div className="bg-neutral-925 rounded-lg border border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Net Profit</p>
              <p className="text-2xl font-bold text-white">${currentPL.netIncome.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className={'text-sm ${profitGrowth >= 0 ? 'text-green-400' : 'text-red-400'
              }'}>'
              {profitGrowth >= 0 ? '+' : '}{profitGrowth.toFixed(1)}% vs last month
            </div>
          </div>
        </div>

        <div className="bg-neutral-925 rounded-lg border border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Gross Margin</p>
              <p className="text-2xl font-bold text-white">{currentPL.grossMargin.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="text-sm text-neutral-400">
              Target: 45.0%
            </div>
          </div>
        </div>

        <div className="bg-neutral-925 rounded-lg border border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Cash Position</p>
              <p className="text-2xl font-bold text-white">${mockCashFlow[0].endingCash.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Target className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="text-sm text-neutral-400">
              {mockCashFlow[0].daysInAR.toFixed(0)} days in A/R
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-925 rounded-lg border border-neutral-800">
        <div className="border-b border-neutral-800">
          <div className="flex">
            {[
              { id: 'pl-statements', label: 'P&L Statements', icon: FileText },
              { id: 'cash-flow', label: 'Cash Flow', icon: TrendingUp },
              { id: 'ratios', label: 'Financial Ratios', icon: BarChart3 },
              { id: 'budget-variance', label: 'Budget Variance', icon: Calculator },
              { id: 'forecasting', label: 'Forecasting', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={'flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-neutral-400 hover:text-white'
              }'}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'pl-statements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Profit & Loss Statements</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    Generate Report
                  </Button>
                </div>
              </div>
              
              {(DataTable as any)({
                data: mockPLStatements,
                columns: plColumns,
                searchable: false,
                className: "bg-neutral-950"
              })}
            </div>
          )}

          {activeTab === 'cash-flow' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Cash Flow Analysis</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    Cash Flow Forecast
                  </Button>
                </div>
              </div>
              
              {(DataTable as any)({
                data: mockCashFlow,
                columns: cashFlowColumns,
                searchable: false,
                className: "bg-neutral-950"
              })}
            </div>
          )}

          {activeTab === 'ratios' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Financial Ratios & KPIs</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Category
                  </Button>
                  <Button variant="outline" size="sm">
                    Benchmark Settings
                  </Button>
                </div>
              </div>
              
              {(DataTable as any)({
                data: mockRatios,
                columns: ratioColumns,
                searchable: false,
                className: "bg-neutral-950"
              })}
            </div>
          )}

          {activeTab === 'budget-variance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Budget vs Actual Analysis</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Period
                  </Button>
                  <Button variant="outline" size="sm">
                    Update Budget
                  </Button>
                </div>
              </div>
              
              {(DataTable as any)({
                data: mockBudgetVariances,
                columns: budgetColumns,
                searchable: false,
                className: "bg-neutral-950"
              })}
            </div>
          )}

          {activeTab === 'forecasting' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Financial Forecasting</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Forecast Models
                  </Button>
                  <Button variant="outline" size="sm">
                    Scenario Analysis
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-950 rounded-lg border border-neutral-800 p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Revenue Forecast</h4>
                  <div className="space-y-4">
                    {['Next Month', 'Next Quarter', 'Next 6 Months', 'Next Year'].map((period, i) => (
                      <div key={period} className="flex items-center justify-between">
                        <span className="text-neutral-400">{period}</span>
                        <span className="text-white font-medium">
                          ${(currentPL.revenue.total * (1 + (i + 1) * 0.05)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-950 rounded-lg border border-neutral-800 p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Cash Flow Projection</h4>
                  <div className="space-y-4">
                    {['30 Days', '60 Days', '90 Days', '120 Days'].map((period, i) => (
                      <div key={period} className="flex items-center justify-between">
                        <span className="text-neutral-400">{period}</span>
                        <span className="text-white font-medium">
                          ${(mockCashFlow[0].endingCash + (i + 1) * 15000).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}