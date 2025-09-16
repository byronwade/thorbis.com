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
  Users, 
  Eye, 
  Edit,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building
} from 'lucide-react'
import { Customer } from '@/types/accounting'

// Mock customer data
const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    name: 'Acme Corporation',
    email: 'accounting@acme.com',
    phone: '(555) 123-4567',
    address: {
      street: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      country: 'USA'
    },
    tax_id: 'TAX123456789',
    payment_terms: 30,
    credit_limit: 50000,
    preferred_currency: 'USD',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'cust_2',
    name: 'Tech Solutions LLC',
    email: 'billing@techsolutions.com',
    phone: '(555) 987-6543',
    address: {
      street: '456 Tech Park Drive',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94105',
      country: 'USA'
    },
    tax_id: 'TAX987654321',
    payment_terms: 15,
    credit_limit: 25000,
    preferred_currency: 'USD',
    is_active: true,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    id: 'cust_3',
    name: 'Global Industries Inc',
    email: 'finance@global.com',
    phone: '(555) 456-7890',
    address: {
      street: '789 International Blvd',
      city: 'Chicago',
      state: 'IL',
      zip_code: '60601',
      country: 'USA'
    },
    tax_id: 'TAX456789123',
    payment_terms: 30,
    credit_limit: 100000,
    preferred_currency: 'USD',
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-18T00:00:00Z'
  },
  {
    id: 'cust_4',
    name: 'Small Business Co',
    email: 'owner@smallbiz.com',
    phone: '(555) 333-2222',
    address: {
      street: '321 Main Street',
      city: 'Austin',
      state: 'TX',
      zip_code: '73301',
      country: 'USA'
    },
    payment_terms: 15,
    credit_limit: 10000,
    preferred_currency: 'USD',
    is_active: false,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z'
  },
  {
    id: 'cust_5',
    name: 'Enterprise Holdings Ltd',
    email: 'ap@enterprise.com',
    phone: '(555) 777-8888',
    address: {
      street: '555 Corporate Center',
      city: 'Seattle',
      state: 'WA',
      zip_code: '98101',
      country: 'USA'
    },
    tax_id: 'TAX789123456',
    payment_terms: 45,
    credit_limit: 200000,
    preferred_currency: 'USD',
    is_active: true,
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-22T00:00:00Z'
  }
]

// Mock financial data for customers
const mockCustomerFinancials = {
  'cust_1': {
    outstanding_balance: 5400,
    total_invoiced: 15400,
    payments_received: 10000,
    overdue_amount: 0,
    last_payment_date: '2024-01-20',
    credit_used: 5400,
    average_payment_days: 18
  },
  'cust_2': {
    outstanding_balance: 0,
    total_invoiced: 8700,
    payments_received: 8700,
    overdue_amount: 0,
    last_payment_date: '2024-01-20',
    credit_used: 0,
    average_payment_days: 12
  },
  'cust_3': {
    outstanding_balance: 8100,
    total_invoiced: 18100,
    payments_received: 10000,
    overdue_amount: 8100,
    last_payment_date: '2024-01-15',
    credit_used: 8100,
    average_payment_days: 35
  },
  'cust_4': {
    outstanding_balance: 0,
    total_invoiced: 2500,
    payments_received: 2500,
    overdue_amount: 0,
    last_payment_date: '2024-01-18',
    credit_used: 0,
    average_payment_days: 8
  },
  'cust_5': {
    outstanding_balance: 12500,
    total_invoiced: 32500,
    payments_received: 20000,
    overdue_amount: 0,
    last_payment_date: '2024-01-25',
    credit_used: 12500,
    average_payment_days: 42
  }
}

function getStatusColor(isActive: boolean) {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-neutral-100 text-neutral-800'
}

function getPaymentStatus(customerId: string) {
  const financials = mockCustomerFinancials[customerId]
  if (!financials) return 'unknown'
  
  if (financials.overdue_amount > 0) return 'overdue'
  if (financials.outstanding_balance > 0) return 'outstanding'
  return 'current'
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'current': return 'bg-green-100 text-green-800'
    case 'outstanding': return 'bg-blue-100 text-blue-800'
    case 'overdue': return 'bg-red-100 text-red-800'
    default: return 'bg-neutral-100 text-neutral-800'
  }
}

function getPaymentStatusIcon(status: string) {
  switch (status) {
    case 'current': return <CheckCircle className="w-4 h-4 text-green-600" />
    case 'outstanding': return <Clock className="w-4 h-4 text-blue-600" />
    case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />
    default: return <DollarSign className="w-4 h-4 text-neutral-600" />
  }
}

function getCreditUtilization(customerId: string): number {
  const customer = mockCustomers.find(c => c.id === customerId)
  const financials = mockCustomerFinancials[customerId]
  
  if (!customer?.credit_limit || !financials) return 0
  return (financials.credit_used / customer.credit_limit) * 100
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'current' | 'outstanding' | 'overdue'>('all')

  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && customer.is_active) ||
        (statusFilter === 'inactive' && !customer.is_active)

      const paymentStatus = getPaymentStatus(customer.id)
      const matchesPayment = paymentFilter === 'all' || paymentStatus === paymentFilter
      
      return matchesSearch && matchesStatus && matchesPayment
    })
  }, [searchTerm, statusFilter, paymentFilter])

  const customerStats = useMemo(() => {
    const activeCustomers = mockCustomers.filter(c => c.is_active).length
    const totalOutstanding = Object.values(mockCustomerFinancials).reduce((sum, f) => sum + f.outstanding_balance, 0)
    const overdueAmount = Object.values(mockCustomerFinancials).reduce((sum, f) => sum + f.overdue_amount, 0)
    const avgPaymentDays = Object.values(mockCustomerFinancials).reduce((sum, f) => sum + f.average_payment_days, 0) / Object.values(mockCustomerFinancials).length

    return { activeCustomers, totalOutstanding, overdueAmount, avgPaymentDays }
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Users className="mr-3 h-8 w-8" />
            Customers
          </h1>
          <p className="text-muted-foreground">Manage customer information and relationships</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Building className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{customerStats.activeCustomers}</div>
            <div className="text-xs text-blue-600 flex items-center mt-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              Of {mockCustomers.length} total
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">${customerStats.totalOutstanding.toLocaleString()}</div>
            <div className="text-xs text-orange-600 flex items-center mt-1">
              <Clock className="w-3 h-3 mr-1" />
              Pending payment
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">${customerStats.overdueAmount.toLocaleString()}</div>
            <div className="text-xs text-red-600 flex items-center mt-1">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Requires attention
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Avg Payment Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{Math.round(customerStats.avgPaymentDays)}</div>
            <div className="text-xs text-green-600 flex items-center mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              Days to payment
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">All Payments</option>
                <option value="current">Current</option>
                <option value="outstanding">Outstanding</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCustomers.map((customer) => {
          const financials = mockCustomerFinancials[customer.id]
          const paymentStatus = getPaymentStatus(customer.id)
          const creditUtilization = getCreditUtilization(customer.id)
          
          return (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(customer.is_active)}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge className={getPaymentStatusColor(paymentStatus)}>
                          {paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 mb-4">
                  {customer.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground mr-2" />
                      {customer.email}
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground mr-2" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mr-2 mt-0.5" />
                      <div>
                        {customer.address.street}<br />
                        {customer.address.city}, {customer.address.state} {customer.address.zip_code}
                      </div>
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                {financials && (
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium flex items-center">
                          {getPaymentStatusIcon(paymentStatus)}
                          <span className="ml-2">Outstanding</span>
                        </div>
                        <div className="text-lg font-bold">
                          ${financials.outstanding_balance.toLocaleString()}
                        </div>
                        {financials.overdue_amount > 0 && (
                          <div className="text-red-600 text-xs">
                            ${financials.overdue_amount.toLocaleString()} overdue
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">Payment Terms</div>
                        <div className="text-lg font-bold">
                          {customer.payment_terms} days
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg: {financials.average_payment_days} days
                        </div>
                      </div>
                    </div>
                    
                    {customer.credit_limit && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Credit Utilization</span>
                          <span>{creditUtilization.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className={'h-2 rounded-full ${
                              creditUtilization > 80 ? 'bg-red-500' : 
                              creditUtilization > 60 ? 'bg-yellow-500' : 'bg-green-500`
              }'}
                            style={{ width: '${Math.min(creditUtilization, 100)}%' }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ${financials.credit_used.toLocaleString()} / ${customer.credit_limit.toLocaleString()} limit
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t">
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>
                          <div>Total Invoiced</div>
                          <div className="font-medium text-foreground">${financials.total_invoiced.toLocaleString()}</div>
                        </div>
                        <div>
                          <div>Last Payment</div>
                          <div className="font-medium text-foreground">
                            {new Date(financials.last_payment_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No customers found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first customer'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && paymentFilter === 'all' && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}