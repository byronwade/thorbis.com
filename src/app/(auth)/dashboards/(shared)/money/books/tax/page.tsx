'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  Calculator, 
  Eye, 
  Edit,
  Download,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Receipt,
  TrendingUp,
  Building,
  Percent,
  PieChart
} from 'lucide-react'
import { TaxRate } from '@/types/accounting'

// Mock tax rate data
const mockTaxRates: TaxRate[] = [
  {
    id: 'tax_1',
    name: 'Sales Tax',
    rate: 8.25,
    description: 'Standard state and local sales tax',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tax_2',
    name: 'Service Tax',
    rate: 6.0,
    description: 'Tax on professional services',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tax_3',
    name: 'Import Duty',
    rate: 15.5,
    description: 'Customs duty on imported goods',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tax_4',
    name: 'Luxury Tax',
    rate: 25.0,
    description: 'Tax on luxury items over $10,000',
    is_active: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
]

// Mock tax reporting data
const mockTaxReports = [
  {
    id: 'report_1',
    period: 'Q4 2024',
    type: 'Sales Tax Return',
    status: 'filed',
    due_date: '2025-01-31',
    filed_date: '2025-01-20',
    tax_collected: 15420.50,
    tax_paid: 12836.75,
    balance: 2583.75,
    penalty: 0,
    filing_method: 'electronic'
  },
  {
    id: 'report_2',
    period: 'Q3 2024',
    type: 'Sales Tax Return',
    status: 'filed',
    due_date: '2024-10-31',
    filed_date: '2024-10-28',
    tax_collected: 18750.25,
    tax_paid: 18750.25,
    balance: 0,
    penalty: 0,
    filing_method: 'electronic'
  },
  {
    id: 'report_3',
    period: 'Annual 2024',
    type: 'Income Tax Return',
    status: 'draft',
    due_date: '2025-03-15',
    filed_date: null,
    tax_collected: 0,
    tax_paid: 0,
    balance: 8500.00,
    penalty: 0,
    filing_method: 'electronic'
  },
  {
    id: 'report_4',
    period: 'Q2 2024',
    type: 'Service Tax Return',
    status: 'overdue',
    due_date: '2024-07-31',
    filed_date: null,
    tax_collected: 4250.75,
    tax_paid: 0,
    balance: 4250.75,
    penalty: 212.54,
    filing_method: 'paper'
  }
]

// Mock tax transactions
const mockTaxTransactions = [
  {
    id: 'tx_1',
    date: '2024-01-15',
    type: 'tax_collected',
    description: 'Sales tax on Invoice INV-2024-001',
    tax_type: 'Sales Tax',
    rate: 8.25,
    taxable_amount: 5000,
    tax_amount: 412.50,
    invoice_id: 'inv_001',
    customer: 'Acme Corp'
  },
  {
    id: 'tx_2',
    date: '2024-01-20',
    type: 'tax_payment',
    description: 'Q4 2023 Sales Tax Payment',
    tax_type: 'Sales Tax',
    rate: null,
    taxable_amount: null,
    tax_amount: 12836.75,
    invoice_id: null,
    customer: null
  },
  {
    id: 'tx_3',
    date: '2024-01-10',
    type: 'tax_collected',
    description: 'Service tax on consulting services',
    tax_type: 'Service Tax',
    rate: 6.0,
    taxable_amount: 2500,
    tax_amount: 150.00,
    invoice_id: 'inv_002',
    customer: 'Tech Solutions'
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'filed': return 'bg-green-100 text-green-800'
    case 'draft': return 'bg-blue-100 text-blue-800'
    case 'overdue': return 'bg-red-100 text-red-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-neutral-100 text-neutral-800'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'filed': return <CheckCircle className="w-4 h-4 text-green-600" />
    case 'draft': return <FileText className="w-4 h-4 text-blue-600" />
    case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />
    case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
    default: return <FileText className="w-4 h-4 text-neutral-600" />
  }
}

function getTaxTypeColor(type: string) {
  switch (type.toLowerCase()) {
    case 'sales tax': return 'bg-blue-100 text-blue-800'
    case 'service tax': return 'bg-green-100 text-green-800'
    case 'income tax': return 'bg-purple-100 text-purple-800'
    case 'import duty': return 'bg-orange-100 text-orange-800'
    default: return 'bg-neutral-100 text-neutral-800'
  }
}

export default function TaxPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [activeTab, setActiveTab] = useState<'rates' | 'reports' | 'transactions' | 'insights'>('rates')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [reportFilter, setReportFilter] = useState<'all' | 'filed' | 'draft' | 'overdue'>('all')

  const filteredTaxRates = useMemo(() => {
    return mockTaxRates.filter(rate => {
      const matchesSearch = rate.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && rate.is_active) ||
        (statusFilter === 'inactive' && !rate.is_active)
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

  const filteredTaxReports = useMemo(() => {
    return mockTaxReports.filter(report => {
      const matchesSearch = 
        report.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = reportFilter === 'all' || report.status === reportFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, reportFilter])

  const taxStats = useMemo(() => {
    const totalCollected = mockTaxTransactions
      .filter(tx => tx.type === 'tax_collected')
      .reduce((sum, tx) => sum + tx.tax_amount, 0)
    
    const totalPaid = mockTaxTransactions
      .filter(tx => tx.type === 'tax_payment')
      .reduce((sum, tx) => sum + tx.tax_amount, 0)
    
    const overdueReports = mockTaxReports.filter(r => r.status === 'overdue').length
    const draftReports = mockTaxReports.filter(r => r.status === 'draft').length

    return { totalCollected, totalPaid, overdueReports, draftReports }
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Calculator className="mr-3 h-8 w-8" />
            Tax Management
          </h1>
          <p className="text-muted-foreground">Manage tax rates, returns, and compliance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Tax Return
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Tax Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">${taxStats.totalCollected.toLocaleString()}</div>
            <div className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              This year
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Tax Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${taxStats.totalPaid.toLocaleString()}</div>
            <div className="text-xs text-blue-600 flex items-center mt-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              Filed returns
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Overdue Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{taxStats.overdueReports}</div>
            <div className="text-xs text-red-600 flex items-center mt-1">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Need attention
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Draft Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{taxStats.draftReports}</div>
            <div className="text-xs text-yellow-600 flex items-center mt-1">
              <FileText className="w-3 h-3 mr-1" />
              In progress
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'rates', label: 'Tax Rates', icon: Percent },
          { id: 'reports', label: 'Tax Returns', icon: FileText },
          { id: 'transactions', label: 'Tax Transactions', icon: Receipt },
          { id: 'insights', label: 'Tax Insights', icon: PieChart }
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={'Search ${activeTab}...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              {activeTab === 'rates' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  <option value="all">All Rates</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              )}
              {activeTab === 'reports' && (
                <select
                  value={reportFilter}
                  onChange={(e) => setReportFilter(e.target.value as typeof reportFilter)}
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  <option value="all">All Reports</option>
                  <option value="filed">Filed</option>
                  <option value="draft">Draft</option>
                  <option value="overdue">Overdue</option>
                </select>
              )}
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'rates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTaxRates.map((rate) => (
            <Card key={rate.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Percent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{rate.name}</h3>
                      <div className="text-2xl font-bold text-blue-600">
                        {rate.rate}%
                      </div>
                    </div>
                  </div>
                  <Badge className={rate.is_active ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'}>
                    {rate.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {rate.description}
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {filteredTaxReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      {getStatusIcon(report.status)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{report.type}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {report.period} • Due: {new Date(report.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="font-semibold">${report.balance.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Balance Due</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {report.status === 'draft' && (
                        <Button size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          File
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tax Collected: </span>
                      ${report.tax_collected.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tax Paid: </span>
                      ${report.tax_paid.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Filing Method: </span>
                      {report.filing_method}
                    </div>
                    <div>
                      {report.filed_date && (
                        <>
                          <span className="text-muted-foreground">Filed: </span>
                          {new Date(report.filed_date).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>
                  {report.penalty > 0 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Penalty: ${report.penalty.toFixed(2)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {mockTaxTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Receipt className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{transaction.description}</h3>
                        <Badge className={getTaxTypeColor(transaction.tax_type)}>
                          {transaction.tax_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                        {transaction.customer && ' • ${transaction.customer}'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      ${transaction.tax_amount.toLocaleString()}
                    </div>
                    {transaction.rate && (
                      <div className="text-sm text-muted-foreground">
                        {transaction.rate}% on ${transaction.taxable_amount?.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Collection Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Sales Tax (8.25%)</span>
                  <span className="font-semibold">$412.50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Service Tax (6.0%)</span>
                  <span className="font-semibold">$150.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-semibold">
                  <span>Total Collected</span>
                  <span>${taxStats.totalCollected.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Filed on Time</span>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-green-600 font-semibold">95%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Overdue Returns</span>
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-red-600 font-semibold">{taxStats.overdueReports}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Penalties YTD</span>
                  <span className="font-semibold">$212.54</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Tax Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-semibold">Annual Income Tax Return</div>
                    <div className="text-sm text-muted-foreground">2024 Tax Year</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">March 15, 2025</div>
                    <div className="text-sm text-yellow-600">43 days remaining</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-semibold">Q1 2025 Sales Tax Return</div>
                    <div className="text-sm text-muted-foreground">January - March</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">April 30, 2025</div>
                    <div className="text-sm text-green-600">89 days remaining</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}