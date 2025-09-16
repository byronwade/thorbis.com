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
  Building2, 
  Eye, 
  Edit,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck
} from 'lucide-react'
import { Vendor } from '@/types/accounting'

// Mock vendor data
const mockVendors: Vendor[] = [
  {
    id: 'vend_1',
    name: 'Office Supplies Inc.',
    email: 'billing@officesupplies.com',
    phone: '(555) 987-6543',
    address: {
      street: '123 Supply Chain Rd',
      city: 'Chicago',
      state: 'IL',
      zip_code: '60601',
      country: 'USA'
    },
    tax_id: 'TAX987654321',
    payment_terms: 30,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'vend_2',
    name: 'Utility Company',
    email: 'billing@utility.com',
    phone: '(555) 111-2222',
    address: {
      street: '456 Power Plant Ave',
      city: 'Houston',
      state: 'TX',
      zip_code: '77001',
      country: 'USA'
    },
    tax_id: 'TAX111222333',
    payment_terms: 15,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'vend_3',
    name: 'Tech Services LLC',
    email: 'invoices@techservices.com',
    phone: '(555) 333-4444',
    address: {
      street: '789 Innovation Drive',
      city: 'Austin',
      state: 'TX',
      zip_code: '73301',
      country: 'USA'
    },
    tax_id: 'TAX333444555',
    payment_terms: 45,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    id: 'vend_4',
    name: 'Facility Maintenance Co',
    email: 'admin@facilities.com',
    phone: '(555) 555-6666',
    address: {
      street: '321 Service Lane',
      city: 'Phoenix',
      state: 'AZ',
      zip_code: '85001',
      country: 'USA'
    },
    tax_id: 'TAX555666777',
    payment_terms: 30,
    is_active: false,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z'
  },
  {
    id: 'vend_5',
    name: 'Professional Consulting Group',
    email: 'billing@profconsulting.com',
    phone: '(555) 777-8888',
    address: {
      street: '555 Executive Plaza',
      city: 'Denver',
      state: 'CO',
      zip_code: '80201',
      country: 'USA'
    },
    tax_id: 'TAX777888999',
    payment_terms: 60,
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-18T00:00:00Z'
  }
]

// Mock financial data for vendors
const mockVendorFinancials = {
  'vend_1': {
    outstanding_balance: 1296,
    total_billed: 8296,
    payments_made: 7000,
    overdue_amount: 0,
    last_payment_date: '2024-01-20',
    last_bill_date: '2024-01-10',
    average_payment_days: 28,
    bill_count: 12
  },
  'vend_2': {
    outstanding_balance: 0,
    total_billed: 3540,
    payments_made: 3540,
    overdue_amount: 0,
    last_payment_date: '2024-01-25',
    last_bill_date: '2024-01-15',
    average_payment_days: 12,
    bill_count: 6
  },
  'vend_3': {
    outstanding_balance: 3780,
    total_billed: 15780,
    payments_made: 12000,
    overdue_amount: 3780,
    last_payment_date: '2024-01-15',
    last_bill_date: '2024-01-08',
    average_payment_days: 52,
    bill_count: 8
  },
  'vend_4': {
    outstanding_balance: 0,
    total_billed: 2500,
    payments_made: 2500,
    overdue_amount: 0,
    last_payment_date: '2024-01-12',
    last_bill_date: '2024-01-01',
    average_payment_days: 25,
    bill_count: 4
  },
  'vend_5': {
    outstanding_balance: 8500,
    total_billed: 28500,
    payments_made: 20000,
    overdue_amount: 0,
    last_payment_date: '2024-01-22',
    last_bill_date: '2024-01-12',
    average_payment_days: 58,
    bill_count: 10
  }
}

function getStatusColor(isActive: boolean) {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-neutral-100 text-neutral-800'
}

function getPaymentStatus(vendorId: string) {
  const financials = mockVendorFinancials[vendorId]
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

function getVendorCategory(vendorName: string): string {
  const name = vendorName.toLowerCase()
  if (name.includes('office') || name.includes('supplies')) return 'Office Supplies'
  if (name.includes('utility') || name.includes('power')) return 'Utilities'
  if (name.includes('tech') || name.includes('software')) return 'Technology'
  if (name.includes('maintenance') || name.includes('facility')) return 'Facilities'
  if (name.includes('consulting') || name.includes('professional')) return 'Professional Services'
  return 'Other'
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'Office Supplies': return 'bg-blue-100 text-blue-800'
    case 'Utilities': return 'bg-yellow-100 text-yellow-800'
    case 'Technology': return 'bg-purple-100 text-purple-800'
    case 'Facilities': return 'bg-green-100 text-green-800'
    case 'Professional Services': return 'bg-orange-100 text-orange-800'
    default: return 'bg-neutral-100 text-neutral-800'
  }
}

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'current' | 'outstanding' | 'overdue'>('all')

  const filteredVendors = useMemo(() => {
    return mockVendors.filter(vendor => {
      const matchesSearch = 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && vendor.is_active) ||
        (statusFilter === 'inactive' && !vendor.is_active)

      const paymentStatus = getPaymentStatus(vendor.id)
      const matchesPayment = paymentFilter === 'all' || paymentStatus === paymentFilter
      
      return matchesSearch && matchesStatus && matchesPayment
    })
  }, [searchTerm, statusFilter, paymentFilter])

  const vendorStats = useMemo(() => {
    const activeVendors = mockVendors.filter(v => v.is_active).length
    const totalOutstanding = Object.values(mockVendorFinancials).reduce((sum, f) => sum + f.outstanding_balance, 0)
    const overdueAmount = Object.values(mockVendorFinancials).reduce((sum, f) => sum + f.overdue_amount, 0)
    const totalBills = Object.values(mockVendorFinancials).reduce((sum, f) => sum + f.bill_count, 0)

    return { activeVendors, totalOutstanding, overdueAmount, totalBills }
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Building2 className="mr-3 h-8 w-8" />
            Vendors
          </h1>
          <p className="text-muted-foreground">Manage vendor information and payment relationships</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Truck className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Vendor
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{vendorStats.activeVendors}</div>
            <div className="text-xs text-blue-600 flex items-center mt-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              Of {mockVendors.length} total
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Outstanding Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">${vendorStats.totalOutstanding.toLocaleString()}</div>
            <div className="text-xs text-orange-600 flex items-center mt-1">
              <Receipt className="w-3 h-3 mr-1" />
              Pending payment
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">${vendorStats.overdueAmount.toLocaleString()}</div>
            <div className="text-xs text-red-600 flex items-center mt-1">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Requires payment
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{vendorStats.totalBills}</div>
            <div className="text-xs text-green-600 flex items-center mt-1">
              <Receipt className="w-3 h-3 mr-1" />
              All time
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
                  placeholder="Search vendors..."
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

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVendors.map((vendor) => {
          const financials = mockVendorFinancials[vendor.id]
          const paymentStatus = getPaymentStatus(vendor.id)
          const category = getVendorCategory(vendor.name)
          
          return (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{vendor.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(vendor.is_active)}>
                          {vendor.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge className={getPaymentStatusColor(paymentStatus)}>
                          {paymentStatus}
                        </Badge>
                        <Badge className={getCategoryColor(category)}>
                          {category}
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
                  {vendor.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground mr-2" />
                      {vendor.email}
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground mr-2" />
                      {vendor.phone}
                    </div>
                  )}
                  {vendor.address && (
                    <div className="flex items-start text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mr-2 mt-0.5" />
                      <div>
                        {vendor.address.street}<br />
                        {vendor.address.city}, {vendor.address.state} {vendor.address.zip_code}
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
                          {vendor.payment_terms} days
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg: {financials.average_payment_days} days
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                        <div>
                          <div>Total Billed</div>
                          <div className="font-medium text-foreground">${financials.total_billed.toLocaleString()}</div>
                        </div>
                        <div>
                          <div>Bills Count</div>
                          <div className="font-medium text-foreground">{financials.bill_count}</div>
                        </div>
                        <div>
                          <div>Last Payment</div>
                          <div className="font-medium text-foreground">
                            {new Date(financials.last_payment_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {financials.outstanding_balance > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <Button size="sm" className="w-full">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Pay Outstanding Balance
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredVendors.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first vendor'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && paymentFilter === 'all' && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}