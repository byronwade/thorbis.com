'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Globe, 
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
  Shield,
  LineChart,
  PieChart,
  BarChart3,
  Activity,
  Award,
  Timer,
  CreditCard,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
  Bell,
  Calculator,
  Banknote,
  TrendingUp as Trending,
  Lock,
  Unlock,
  Repeat
} from 'lucide-react'
import { 
  MultiCurrencyManager,
  Currency,
  ExchangeRate,
  MultiCurrencyInvoice,
  CurrencyConversion,
  HedgingStrategy,
  CurrencyRiskAnalysis,
  formatCurrencyAmount,
  getCurrencyRiskColor,
  getHedgingStrategyIcon,
  calculateCurrencyGainLoss
} from '@/lib/multi-currency'
import { Invoice, Customer } from '@/types/accounting'
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Cell, RadialBarChart, RadialBar } from 'recharts'

// Mock data
const mockCustomers: Customer[] = [
  { id: 'cust_1', name: 'European Solutions GmbH', payment_terms: 30, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01', preferred_currency: 'EUR' },
  { id: 'cust_2', name: 'Tokyo Tech Ltd', payment_terms: 15, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01', preferred_currency: 'JPY' },
  { id: 'cust_3', name: 'London Enterprises', payment_terms: 45, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01', preferred_currency: 'GBP' }
]

const currencyManager = new MultiCurrencyManager()

// Mock multi-currency invoices
const mockMultiCurrencyInvoices: MultiCurrencyInvoice[] = []

// Create some sample multi-currency invoices
const createSampleInvoices = async () => {
  for (const customer of mockCustomers) {
    const baseInvoice: Invoice = {
      id: `inv_${customer.id}',
      invoice_number: 'INV-2024-00${mockCustomers.indexOf(customer) + 1}',
      customer_id: customer.id,
      customer,
      date: '2024-01-15',
      due_date: '2024-02-14',
      subtotal: 10000 + Math.random() * 40000,
      tax_amount: 0,
      total_amount: 0,
      balance: 0,
      status: 'sent',
      line_items: [],
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
    baseInvoice.tax_amount = baseInvoice.subtotal * 0.1
    baseInvoice.total_amount = baseInvoice.subtotal + baseInvoice.tax_amount
    baseInvoice.balance = baseInvoice.total_amount

    const multiCurrencyInvoice = await currencyManager.createMultiCurrencyInvoice(
      baseInvoice,
      customer,
      { 
        target_currency: customer.preferred_currency,
        include_hedging: baseInvoice.total_amount > 25000,
        rate_protection: true,
        ai_optimization: true
      }
    )
    
    mockMultiCurrencyInvoices.push(multiCurrencyInvoice)
  }
}

// Initialize sample data
createSampleInvoices()

// Mock exchange rate data for charts
const exchangeRateHistory = [
  { date: 'Jan 1', USD_EUR: 0.85, USD_GBP: 0.75, USD_JPY: 110, volatility: 12 },
  { date: 'Jan 2', USD_EUR: 0.86, USD_GBP: 0.74, USD_JPY: 112, volatility: 15 },
  { date: 'Jan 3', USD_EUR: 0.84, USD_GBP: 0.76, USD_JPY: 108, volatility: 18 },
  { date: 'Jan 4', USD_EUR: 0.87, USD_GBP: 0.73, USD_JPY: 114, volatility: 22 },
  { date: 'Jan 5', USD_EUR: 0.85, USD_GBP: 0.75, USD_JPY: 111, volatility: 16 },
  { date: 'Jan 6', USD_EUR: 0.88, USD_GBP: 0.72, USD_JPY: 116, volatility: 25 },
  { date: 'Jan 7', USD_EUR: 0.86, USD_GBP: 0.74, USD_JPY: 113, volatility: 19 }
]

const currencyExposureData = [
  { currency: 'USD', exposure: 125000, percentage: 45, hedged: 85000, unhedged: 40000, color: '#3b82f6' },
  { currency: 'EUR', exposure: 89000, percentage: 32, hedged: 62000, unhedged: 27000, color: '#22c55e' },
  { currency: 'GBP', exposure: 45000, percentage: 16, hedged: 25000, unhedged: 20000, color: '#f59e0b' },
  { currency: 'JPY', exposure: 19000, percentage: 7, hedged: 10000, unhedged: 9000, color: '#ef4444' }
]

const hedgingStrategies = [
  {
    id: 'hedge_1',
    strategy_type: 'forward_contract',
    currency_pair: 'USD/EUR',
    exposure_amount: 50000,
    cost_estimate: 250,
    potential_savings: 1250,
    risk_reduction: 85,
    time_horizon: 90
  },
  {
    id: 'hedge_2',
    strategy_type: 'currency_option',
    currency_pair: 'USD/GBP',
    exposure_amount: 30000,
    cost_estimate: 450,
    potential_savings: 900,
    risk_reduction: 65,
    time_horizon: 60
  }
]

const riskMetrics = {
  total_exposure: 278000,
  var_95: 15600,
  var_99: 22400,
  overall_risk_score: 68,
  hedging_ratio: 0.72
}

function ExchangeRateCard({ rate }: { rate: { from: string, to: string, current: number, change: number, volatility: number } }) {
  const isPositive = rate.change >= 0
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600'
  const changeIcon = isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {rate.from}/{rate.to}
          <div className="flex items-center space-x-1">
            {rate.volatility > 20 && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
            <Badge variant="outline" className="text-xs">
              {rate.volatility.toFixed(1)}% vol
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-xl font-bold">
            {rate.current.toFixed(rate.to === 'JPY' ? 0 : 4)}
          </div>
          <div className={'text-sm flex items-center ${changeColor}'}>
            {changeIcon}
            <span className="ml-1">
              {Math.abs(rate.change).toFixed(2)}% ({isPositive ? '+' : '}{rate.change.toFixed(2)}%)
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CurrencyInvoiceCard({ invoice }: { invoice: MultiCurrencyInvoice }) {
  const gainLoss = calculateCurrencyGainLoss(
    invoice.total_amount,
    invoice.exchange_rate_used,
    invoice.exchange_rate_used * 1.02, // Mock 2% change
    invoice.display_currency
  )

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{invoice.invoice_number}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {invoice.original_currency} → {invoice.display_currency}
            </Badge>
            {invoice.hedging_applied && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Hedged
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold text-lg">
              {formatCurrencyAmount(invoice.total_amount, invoice.display_currency)}
            </div>
            <div className="text-muted-foreground">Invoice Amount</div>
          </div>
          <div>
            <div className="font-medium">
              {invoice.exchange_rate_used.toFixed(4)}
            </div>
            <div className="text-muted-foreground">Exchange Rate</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium">Rate Protection:</div>
          <div className="flex items-center space-x-2">
            {invoice.rate_protection.is_protected ? (
              <>
                <Lock className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">
                  Protected until {new Date(invoice.rate_protection.protection_expiry!).toLocaleDateString()}
                </span>
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 text-yellow-600" />
                <span className="text-xs text-yellow-600">Not protected</span>
              </>
            )}
          </div>
        </div>

        <div className={'p-2 rounded text-xs ${gainLoss.is_gain ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }'}>'
          <div className={'flex items-center ${gainLoss.is_gain ? 'text-green-800' : 'text-red-800'
              }'}>'
            {gainLoss.is_gain ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            <span className="font-medium">
              {gainLoss.is_gain ? 'Unrealized Gain' : 'Unrealized Loss'}: {gainLoss.formatted_amount}
            </span>
          </div>
          <div className="text-xs opacity-75 mt-1">
            Based on current market rates ({gainLoss.gain_loss_percentage.toFixed(2)}% change)
          </div>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="w-3 h-3 mr-1" />
            Details
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Repeat className="w-3 h-3 mr-1" />
            Revalue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function HedgingStrategyCard({ strategy }: { strategy: HedgingStrategy }) {
  const costBenefitRatio = (strategy.potential_savings / strategy.cost_estimate).toFixed(1)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <span className="mr-2">{getHedgingStrategyIcon(strategy.strategy_type)}</span>
            {strategy.strategy_type.replace('_', ' ').toUpperCase()}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {strategy.currency_pair}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{strategy.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold text-green-600">
              {formatCurrencyAmount(strategy.potential_savings, 'USD')}
            </div>
            <div className="text-muted-foreground">Potential Savings</div>
          </div>
          <div>
            <div className="font-bold text-red-600">
              {formatCurrencyAmount(strategy.cost_estimate, 'USD')}
            </div>
            <div className="text-muted-foreground">Cost</div>
          </div>
          <div>
            <div className="font-medium">
              {strategy.risk_reduction}%
            </div>
            <div className="text-muted-foreground">Risk Reduction</div>
          </div>
          <div>
            <div className="font-medium">
              {strategy.time_horizon} days
            </div>
            <div className="text-muted-foreground">Time Horizon</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs">
          <div className="flex items-center text-blue-800 mb-1">
            <Calculator className="w-3 h-3 mr-1" />
            <span className="font-medium">Cost-Benefit Ratio: {costBenefitRatio}:1</span>
          </div>
          <div className="text-blue-700">
            {parseFloat(costBenefitRatio) > 3 ? 'Highly recommended' : 
             parseFloat(costBenefitRatio) > 2 ? 'Recommended' : 'Consider alternatives'}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Target className="w-3 h-3 mr-1" />
            Analyze
          </Button>
          <Button size="sm" className="flex-1">
            <Zap className="w-3 h-3 mr-1" />
            Implement
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RiskMetricsCard({ metrics }: { metrics: typeof riskMetrics }) {
  const riskColor = getCurrencyRiskColor(metrics.overall_risk_score)

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-yellow-800">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Currency Risk Overview
          <Badge className="ml-3 text-lg px-3 py-1" style={{ backgroundColor: riskColor, color: 'white' }}>
            {metrics.overall_risk_score}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrencyAmount(metrics.total_exposure, 'USD')}
            </div>
            <div className="text-sm text-muted-foreground">Total Exposure</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrencyAmount(metrics.var_95, 'USD')}
            </div>
            <div className="text-sm text-muted-foreground">VaR (95%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrencyAmount(metrics.var_99, 'USD')}
            </div>
            <div className="text-sm text-muted-foreground">VaR (99%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(metrics.hedging_ratio * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Hedged</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-yellow-800">
          <div className="font-medium mb-1">Risk Assessment:</div>
          <div>
            {metrics.overall_risk_score < 30 ? 'Low risk profile with manageable currency exposure' :
             metrics.overall_risk_score < 70 ? 'Moderate risk requiring active monitoring and selective hedging' :
             'High risk exposure requiring immediate hedging and risk mitigation strategies'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MultiCurrencyPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'rates' | 'hedging' | 'analytics'>('dashboard')
  const [selectedCurrency, setSelectedCurrency] = useState<'all' | 'USD' | 'EUR' | 'GBP' | 'JPY'>('all')

  const currentRates = [
    { from: 'USD', to: 'EUR', current: 0.86, change: 1.2, volatility: 15.3 },
    { from: 'USD', to: 'GBP', current: 0.74, change: -0.8, volatility: 18.7 },
    { from: 'USD', to: 'JPY', current: 113, change: 2.1, volatility: 12.4 },
    { from: 'USD', to: 'CAD', current: 1.26, change: 0.5, volatility: 9.8 }
  ]

  const filteredInvoices = useMemo(() => {
    return mockMultiCurrencyInvoices.filter(invoice => {
      const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.customer!.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCurrency = selectedCurrency === 'all' || invoice.display_currency === selectedCurrency
      return matchesSearch && matchesCurrency
    })
  }, [searchTerm, selectedCurrency])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Globe className="mr-3 h-8 w-8" />
            Multi-Currency Invoicing
          </h1>
          <p className="text-muted-foreground">Real-time exchange rates, hedging strategies, and currency risk management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Rates
          </Button>
          <Button>
            <Bot className="mr-2 h-4 w-4" />
            AI Optimization
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'invoices', label: 'Invoices', icon: CreditCard },
          { id: 'rates', label: 'Exchange Rates', icon: ArrowUpDown },
          { id: 'hedging', label: 'Hedging', icon: Shield },
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
          {/* Risk Metrics Overview */}
          <RiskMetricsCard metrics={riskMetrics} />

          {/* Current Exchange Rates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Live Exchange Rates</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  Real-time
                </Badge>
                <Button variant="outline" size="sm">
                  <Bell className="mr-2 h-4 w-4" />
                  Rate Alerts
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentRates.map((rate, index) => (
                <ExchangeRateCard key={index} rate={rate} />
              ))}
            </div>
          </div>

          {/* Currency Exposure Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Exposure Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie data={currencyExposureData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                    {currencyExposureData.map((entry, index) => (
                      <Cell key={'cell-${index}'} fill={entry.color} />
                    ))}
                    <Tooltip 
                      formatter={(value) => [formatCurrencyAmount(Number(value), 'USD'), 'Exposure']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </RechartsPie>
                </ResponsiveContainer>

                <div className="space-y-4">
                  {currencyExposureData.map((currency, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-3" 
                          style={{ backgroundColor: currency.color }}
                        />
                        <div>
                          <div className="font-medium">{currency.currency}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrencyAmount(currency.hedged, 'USD')} hedged
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrencyAmount(currency.exposure, 'USD')}</div>
                        <div className="text-xs text-muted-foreground">{currency.percentage}% of total</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exchange Rate Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Exchange Rate Trends & Volatility</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={exchangeRateHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line yAxisId="left" type="monotone" dataKey="USD_EUR" stroke="#22c55e" strokeWidth={2} name="USD/EUR" />
                  <Line yAxisId="left" type="monotone" dataKey="USD_GBP" stroke="#3b82f6" strokeWidth={2} name="USD/GBP" />
                  <Line yAxisId="right" type="monotone" dataKey="volatility" stroke="#f59e0b" strokeWidth={2} name="Volatility %" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'invoices' && (
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
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value as typeof selectedCurrency)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  >
                    <option value="all">All Currencies</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Currency Invoices */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Multi-Currency Invoices ({filteredInvoices.length})</h2>
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvoices.map(invoice => (
                <CurrencyInvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'hedging' && (
        <>
          {/* Hedging Strategies */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">AI-Recommended Hedging Strategies</h2>
              <Button>
                <Bot className="mr-2 h-4 w-4" />
                Generate Strategies
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hedgingStrategies.map(strategy => (
                <HedgingStrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </div>
          </div>

          {/* Hedging Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Hedging Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">$12,450</div>
                      <div className="text-sm text-muted-foreground">Savings YTD</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">72%</div>
                      <div className="text-sm text-muted-foreground">Hedge Ratio</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">$3,200</div>
                      <div className="text-sm text-muted-foreground">Hedge Costs</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">8.9:1</div>
                      <div className="text-sm text-muted-foreground">ROI Ratio</div>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { month: 'Jan', savings: 2100, costs: 450 },
                    { month: 'Feb', savings: 1800, costs: 380 },
                    { month: 'Mar', savings: 2300, costs: 520 },
                    { month: 'Apr', savings: 1950, costs: 420 },
                    { month: 'May', savings: 2200, costs: 480 },
                    { month: 'Jun', savings: 2100, costs: 450 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => ['$${value?.toLocaleString()}', 'Amount']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="savings" fill="#22c55e" name="Savings" />
                    <Bar dataKey="costs" fill="#ef4444" name="Costs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Comprehensive Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Currency Performance Attribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { currency: 'EUR', performance: 2.3, volume: 89000 },
                    { currency: 'GBP', performance: -1.8, volume: 45000 },
                    { currency: 'JPY', performance: 0.7, volume: 19000 },
                    { currency: 'CAD', performance: 1.2, volume: 28000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="currency" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'performance' ? '${value}%' : formatCurrencyAmount(Number(value), 'USD'),
                        name === 'performance' ? 'Performance' : 'Volume'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="performance" fill="#3b82f6" name="Performance %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk-Adjusted Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={[
                    { date: 'Jan', return: 2.1, risk: 15.3 },
                    { date: 'Feb', return: 1.8, risk: 18.7 },
                    { date: 'Mar', return: 2.5, risk: 12.4 },
                    { date: 'Apr', return: 1.2, risk: 22.1 },
                    { date: 'May', return: 3.1, risk: 9.8 },
                    { date: 'Jun', return: 2.4, risk: 16.5 }
                  ]}>
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
                    <Area type="monotone" dataKey="return" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Return %" />
                    <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Risk %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}