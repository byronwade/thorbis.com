'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Building, 
  Search, 
  Filter, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Bot,
  Sparkles,
  CreditCard,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  Percent,
  Timer
} from 'lucide-react'
import { AccountsPayable, VendorAnalytics, PaymentOptimization, calculateDPO, getVendorRiskLevel, formatPaymentTermsDisplay } from '@/lib/accounts-payable'
import { Bill, Vendor, Payment } from '@/types/accounting'
import { TradingViewWrapper, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'

// Mock data
const mockVendors: Vendor[] = [
  {
    id: 'vendor_1',
    name: 'Office Supply Co',
    email: 'billing@officesupply.com',
    phone: '(555) 111-2222',
    payment_terms: 30,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'vendor_2',
    name: 'Tech Equipment Inc',
    email: 'accounts@techequip.com',
    phone: '(555) 333-4444',
    payment_terms: 45,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'vendor_3',
    name: 'Marketing Agency LLC',
    email: 'invoices@marketing.com',
    phone: '(555) 555-6666', 
    payment_terms: 15,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockBills: Bill[] = [
  {
    id: 'bill_1',
    bill_number: 'BILL-001',
    vendor_id: 'vendor_1',
    vendor: mockVendors[0],
    date: '2024-01-10',
    due_date: '2024-02-09',
    subtotal: 2500,
    tax_amount: 200,
    total_amount: 2700,
    balance: 2700,
    status: 'received',
    line_items: [],
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'bill_2',
    bill_number: 'BILL-002',
    vendor_id: 'vendor_2',
    vendor: mockVendors[1],
    date: '2024-01-05',
    due_date: '2024-01-20',
    subtotal: 15000,
    tax_amount: 1200,
    total_amount: 16200,
    balance: 16200,
    status: 'overdue',
    line_items: [],
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z'
  },
  {
    id: 'bill_3',
    bill_number: 'BILL-003',
    vendor_id: 'vendor_3',
    vendor: mockVendors[2],
    date: '2024-01-12',
    due_date: '2024-01-27',
    subtotal: 5000,
    tax_amount: 400,
    total_amount: 5400,
    balance: 5400,
    status: 'received',
    line_items: [],
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  }
]

const mockAP = new AccountsPayable(mockBills, mockVendors, [], 75000)

const cashFlowData = mockAP.generateCashFlowForecast(14)
const paymentRecommendations = mockAP.getPaymentRecommendations(30)

function VendorAPCard({ vendor, bills, analytics, optimizations }: {
  vendor: Vendor
  bills: Bill[]
  analytics: VendorAnalytics
  optimizations: PaymentOptimization[]
}) {
  const totalOwed = bills.reduce((sum, bill) => sum + bill.balance, 0)
  const overdueBills = bills.filter(bill => new Date(bill.due_date) < new Date())
  const riskLevel = getVendorRiskLevel(analytics.quality_score)
  
  const totalEarlyDiscounts = optimizations.reduce((sum, opt) => 
    sum + (opt.early_payment_discount?.savings_amount || 0), 0
  )

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{vendor.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={
              riskLevel === 'low' ? 'bg-green-100 text-green-800' :
              riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {riskLevel} risk
            </Badge>
            <Badge variant="outline">
              {formatPaymentTermsDisplay(vendor.payment_terms)}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {vendor.email} • {vendor.phone}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Outstanding Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-2xl font-bold text-red-600">
              ${totalOwed.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Outstanding</div>
          </div>
          <div>
            <div className="text-lg font-medium">
              ${analytics.total_spend_ytd.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">YTD Spend</div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span>Quality:</span>
            <span className="font-medium">{Math.round(analytics.quality_score * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery:</span>
            <span className="font-medium">{Math.round(analytics.delivery_performance * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Pricing:</span>
            <span className="font-medium">{Math.round(analytics.price_competitiveness * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Payment:</span>
            <span className="font-medium">{Math.round(analytics.payment_terms_adherence * 100)}%</span>
          </div>
        </div>

        {/* Alerts */}
        {overdueBills.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-2 rounded-lg">
            <div className="flex items-center text-red-800">
              <AlertTriangle className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">
                {overdueBills.length} overdue bill{overdueBills.length > 1 ? 's' : '}
              </span>
            </div>
          </div>
        )}

        {/* Early Payment Opportunities */}
        {totalEarlyDiscounts > 0 && (
          <div className="bg-green-50 border border-green-200 p-2 rounded-lg">
            <div className="flex items-center justify-between text-green-800">
              <div className="flex items-center">
                <Percent className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Early discount available</span>
              </div>
              <span className="text-sm font-bold">${totalEarlyDiscounts.toFixed(0)} savings</span>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            <Bot className="mr-2 h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Status: {analytics.recommended_relationship_status}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Avg order: ${analytics.average_order_value.toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <Button size="sm" variant="outline">
            <Eye className="w-3 h-3 mr-1" />
            View Bills
          </Button>
          <Button size="sm" variant="outline">
            <Calendar className="w-3 h-3 mr-1" />
            Schedule
          </Button>
          <Button size="sm">
            <Zap className="w-3 h-3 mr-1" />
            Pay Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AccountsPayablePage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [sortBy, setSortBy] = useState<'amount' | 'due_date' | 'vendor'>('amount')

  const apMetrics = mockAP.getPayableMetrics()

  const filteredVendors = useMemo(() => {
    return mockVendors.filter(vendor => {
      const analytics = mockAP.getVendorAnalytics(vendor.id)
      const riskLevel = getVendorRiskLevel(analytics.quality_score)
      
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRisk = riskFilter === 'all' || riskLevel === riskFilter
      
      return matchesSearch && matchesRisk
    }).sort((a, b) => {
      const aAnalytics = mockAP.getVendorAnalytics(a.id)
      const bAnalytics = mockAP.getVendorAnalytics(b.id)
      
      switch (sortBy) {
        case 'amount':
          return bAnalytics.total_spend_ytd - aAnalytics.total_spend_ytd
        case 'vendor':
          return a.name.localeCompare(b.name)
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
            <Building className="mr-3 h-8 w-8" />
            Accounts Payable
          </h1>
          <p className="text-muted-foreground">AI-powered vendor management and payment optimization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Payment Schedule
          </Button>
          <Button>
            <Bot className="mr-2 h-4 w-4" />
            Optimize Payments
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
              ${apMetrics.totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Days Payable Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(calculateDPO(apMetrics.totalOutstanding, 200000, 365))}
            </div>
            <p className="text-xs text-muted-foreground">DPO days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Early Pay Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(apMetrics.earlyPaymentOpportunities).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available discounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${apMetrics.overdueAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Past due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Turnover Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apMetrics.turnoverRatio.toFixed(1)}x
            </div>
            <p className="text-xs text-muted-foreground">Annual turnover</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Recommendations */}
      {paymentRecommendations.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Sparkles className="mr-2 h-5 w-5" />
              AI Payment Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentRecommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={
                        rec.priority === 'high' ? 'destructive' :
                        rec.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {rec.priority.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{rec.action}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Bills affected:</span>
                        <span className="ml-2 font-medium">{rec.bills.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Potential savings:</span>
                        <span className="ml-2 font-medium text-green-600">
                          ${rec.potential_savings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm">
                    Act Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>14-Day Cash Flow Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <TradingViewWrapper
              data={cashFlowData.slice(0, 14).map((item, index) => ({
                time: '2024-01-${String(index + 1).padStart(2, '0')}',
                value: item.cumulative_balance
              }))}
              type="area"
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
          </CardContent>
        </Card>

        {/* Vendor Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Performance Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <TradingViewWrapper
              data={mockVendors.map((vendor, index) => {
                const analytics = mockAP.getVendorAnalytics(vendor.id)
                return {
                  time: '2024-01-${String(index + 1).padStart(2, '0')}',
                  value: Math.round(analytics.quality_score * 100)
                }
              })}
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
                  placeholder="Search vendors..."
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
                <option value="amount">Sort by Spend</option>
                <option value="vendor">Sort by Name</option>
                <option value="due_date">Sort by Due Date</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map(vendor => {
          const vendorBills = mockBills.filter(bill => bill.vendor_id === vendor.id)
          const analytics = mockAP.getVendorAnalytics(vendor.id)
          const optimizations = vendorBills.map(bill => mockAP.optimizeIndividualPayment(bill))
          
          return (
            <VendorAPCard
              key={vendor.id}
              vendor={vendor}
              bills={vendorBills}
              analytics={analytics}
              optimizations={optimizations}
            />
          )
        })}
      </div>

      {filteredVendors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Building className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No vendors found matching your criteria.</p>
            <Button className="mt-4" onClick={() => setSearchTerm(')}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}