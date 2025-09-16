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
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Bot,
  Sparkles,
  Clock,
  Target,
  Eye,
  Send,
  CreditCard,
  FileText,
  Zap
} from 'lucide-react'
import { AccountsReceivable, AgingReport, CustomerPaymentProfile, getPaymentRiskColor, formatPaymentTerms, calculateDSO } from '@/lib/accounts-receivable'
import { Invoice, Customer, Payment } from '@/types/accounting'
import { TradingViewWrapper, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'

// Mock data
const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    name: 'Acme Corporation',
    email: 'accounting@acme.com',
    phone: '(555) 123-4567',
    payment_terms: 30,
    credit_limit: 50000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cust_2', 
    name: 'Tech Solutions LLC',
    email: 'billing@techsolutions.com',
    phone: '(555) 987-6543',
    payment_terms: 15,
    credit_limit: 25000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cust_3',
    name: 'Global Industries Inc',
    email: 'finance@global.com', 
    phone: '(555) 456-7890',
    payment_terms: 30,
    credit_limit: 75000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    invoice_number: 'INV-2024-001',
    customer_id: 'cust_1',
    customer: mockCustomers[0],
    date: '2024-01-15',
    due_date: '2024-02-14',
    subtotal: 5000,
    tax_amount: 400,
    total_amount: 5400,
    balance: 5400,
    status: 'sent',
    line_items: [],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'inv_2',
    invoice_number: 'INV-2024-002',
    customer_id: 'cust_2',
    customer: mockCustomers[1],
    date: '2023-12-20',
    due_date: '2024-01-04',
    subtotal: 2500,
    tax_amount: 200,
    total_amount: 2700,
    balance: 2700,
    status: 'overdue',
    line_items: [],
    created_at: '2023-12-20T00:00:00Z',
    updated_at: '2023-12-20T00:00:00Z'
  },
  {
    id: 'inv_3',
    invoice_number: 'INV-2024-003',
    customer_id: 'cust_3',
    date: '2023-11-15',
    due_date: '2023-12-15',
    subtotal: 7500,
    tax_amount: 600,
    total_amount: 8100,
    balance: 8100,
    status: 'overdue',
    customer: mockCustomers[2],
    line_items: [],
    created_at: '2023-11-15T00:00:00Z',
    updated_at: '2023-11-15T00:00:00Z'
  }
]

const mockAR = new AccountsReceivable(mockInvoices, mockCustomers)
const agingData = mockAR.generateAgingReport()

const agingChartData = [
  { period: '0-30 Days', amount: agingData.reduce((sum, r) => sum + r.current, 0), color: '#22c55e' },
  { period: '31-60 Days', amount: agingData.reduce((sum, r) => sum + r.days_31_60, 0), color: '#f59e0b' },
  { period: '61-90 Days', amount: agingData.reduce((sum, r) => sum + r.days_61_90, 0), color: '#ef4444' },
  { period: '90+ Days', amount: agingData.reduce((sum, r) => sum + r.days_over_90, 0), color: '#7c2d12' }
]

// Convert data for TradingView charts
const agingTradingData: TradingViewChartData[] = agingChartData.map((item, index) => ({
  time: '2024-01-${String(index + 1).padStart(2, '0')}',
  value: item.amount
}))

const paymentPerformanceData: TradingViewChartData[] = [
  { time: '2024-01-01', value: 25 }, // Acme Corp avg days
  { time: '2024-01-02', value: 45 }, // Tech Solutions avg days
  { time: '2024-01-03', value: 65 }, // Global Industries avg days
]

const consistencyData: TradingViewChartData[] = [
  { time: '2024-01-01', value: 85 }, // Acme Corp consistency
  { time: '2024-01-02', value: 60 }, // Tech Solutions consistency
  { time: '2024-01-03', value: 40 }, // Global Industries consistency
]

function CustomerARCard({ customer, agingReport, profile }: {
  customer: Customer
  agingReport: AgingReport
  profile: CustomerPaymentProfile
}) {
  const prediction = mockAR.predictPaymentDate(mockInvoices.find(inv => inv.customer_id === customer.id)!)
  const strategy = mockAR.recommendCollectionStrategy(customer, agingReport.total_outstanding)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{customer.name}</CardTitle>
          <Badge className={getPaymentRiskColor(profile.risk_level)}>
            {profile.risk_level} risk
          </Badge>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Mail className="mr-1 h-3 w-3" />
            {customer.email}
          </div>
          <div className="flex items-center">
            <Phone className="mr-1 h-3 w-3" />
            {customer.phone}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Outstanding Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-2xl font-bold text-red-600">
              ${agingReport.total_outstanding.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Outstanding</div>
          </div>
          <div>
            <div className="text-lg font-medium">
              {Math.round(profile.average_days_to_pay)} days
            </div>
            <div className="text-xs text-muted-foreground">Avg Payment Time</div>
          </div>
        </div>

        {/* Aging Breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Aging Breakdown:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {agingReport.current > 0 && (
              <div className="flex justify-between">
                <span>0-30:</span>
                <span className="font-medium">${agingReport.current.toLocaleString()}</span>
              </div>
            )}
            {agingReport.days_31_60 > 0 && (
              <div className="flex justify-between text-yellow-600">
                <span>31-60:</span>
                <span className="font-medium">${agingReport.days_31_60.toLocaleString()}</span>
              </div>
            )}
            {agingReport.days_61_90 > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>61-90:</span>
                <span className="font-medium">${agingReport.days_61_90.toLocaleString()}</span>
              </div>
            )}
            {agingReport.days_over_90 > 0 && (
              <div className="flex justify-between text-red-600">
                <span>90+:</span>
                <span className="font-medium">${agingReport.days_over_90.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            <Bot className="mr-2 h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Strategy: {strategy.strategy}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {Math.round(strategy.success_probability * 100)}% success rate
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Next action in {strategy.timeline}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <Button size="sm" variant="outline">
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline">
            <Send className="w-3 h-3 mr-1" />
            Contact
          </Button>
          <Button size="sm">
            <Zap className="w-3 h-3 mr-1" />
            Auto-Follow
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AccountsReceivablePage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [sortBy, setSortBy] = useState<'amount' | 'days' | 'risk'>('amount')

  const arMetrics = mockAR.getReceivablesMetrics()
  const earlyWarnings = mockAR.getEarlyWarningAlerts()

  const filteredAgingData = useMemo(() => {
    return agingData.filter(report => {
      const customer = mockCustomers.find(c => c.id === report.customer_id)
      const profile = mockAR.getCustomerPaymentProfile(report.customer_id)
      
      const matchesSearch = customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRisk = riskFilter === 'all' || profile.risk_level === riskFilter
      
      return matchesSearch && matchesRisk
    }).sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.total_outstanding - a.total_outstanding
        case 'days':
          return (b.days_over_90 + b.days_61_90) - (a.days_over_90 + a.days_61_90)
        case 'risk':
          const aProfile = mockAR.getCustomerPaymentProfile(a.customer_id)
          const bProfile = mockAR.getCustomerPaymentProfile(b.customer_id)
          const riskOrder = { high: 3, medium: 2, low: 1 }
          return riskOrder[bProfile.risk_level] - riskOrder[aProfile.risk_level]
        default:
          return 0
      }
    })
  }, [searchTerm, riskFilter, sortBy])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Users className="mr-3 h-8 w-8" />
            Accounts Receivable
          </h1>
          <p className="text-muted-foreground">AI-powered payment predictions and automated follow-up workflows</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Aging Report
          </Button>
          <Button>
            <Bot className="mr-2 h-4 w-4" />
            AI Analysis
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${arMetrics.totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Days Sales Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(calculateDSO(arMetrics.totalOutstanding, 100000, 365))}
            </div>
            <p className="text-xs text-muted-foreground">DSO days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collection Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {arMetrics.collectionEfficiency.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Collection rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bad Debt Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {arMetrics.badDebtPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Write-off rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {earlyWarnings.length}
            </div>
            <p className="text-xs text-muted-foreground">Issues detected</p>
          </CardContent>
        </Card>
      </div>

      {/* Early Warning Alerts */}
      {earlyWarnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Early Warning System ({earlyWarnings.length} alerts)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earlyWarnings.slice(0, 3).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{alert.customer_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{alert.description}</p>
                    <p className="text-xs text-blue-600">{alert.recommended_action}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Act Now
                  </Button>
                </div>
              ))}
              {earlyWarnings.length > 3 && (
                <Button variant="ghost" size="sm" className="w-full">
                  View {earlyWarnings.length - 3} more alerts
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aging Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receivables Aging Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <TradingViewWrapper
                data={agingTradingData}
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
            <div className="mt-4 space-y-2">
              {agingChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    {item.period}
                  </div>
                  <span className="font-medium">${item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Collection Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Average Payment Days</h4>
                <div className="h-[250px] w-full">
                  <TradingViewWrapper
                    data={paymentPerformanceData}
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
                    }}
                  />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Payment Consistency %</h4>
                <div className="h-[250px] w-full">
                  <TradingViewWrapper
                    data={consistencyData}
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
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as typeof riskFilter)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="amount">Sort by Amount</option>
                <option value="days">Sort by Days Overdue</option>
                <option value="risk">Sort by Risk Level</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgingData.map(agingReport => {
          const customer = mockCustomers.find(c => c.id === agingReport.customer_id)!
          const profile = mockAR.getCustomerPaymentProfile(agingReport.customer_id)
          
          return (
            <CustomerARCard
              key={agingReport.customer_id}
              customer={customer}
              agingReport={agingReport}
              profile={profile}
            />
          )
        })}
      </div>

      {filteredAgingData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No receivables found matching your criteria.</p>
            <Button className="mt-4" onClick={() => setSearchTerm(')}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}