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
  FileText, 
  Eye, 
  Download,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react'
import { Bill, Vendor } from '@/types/accounting'

// Mock bill data
const mockBills: Bill[] = [
  {
    id: 'bill_1',
    bill_number: 'BILL-2024-001',
    vendor_id: 'vend_1',
    vendor: {
      id: 'vend_1',
      name: 'Office Supplies Inc.',
      email: 'billing@officesupplies.com',
      phone: '(555) 987-6543',
      payment_terms: 30,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    date: '2024-01-10',
    due_date: '2024-02-09',
    subtotal: 1200,
    tax_amount: 96,
    total_amount: 1296,
    balance: 1296,
    status: 'pending',
    line_items: [
      {
        id: 'bli_1',
        bill_id: 'bill_1',
        account_id: 'acc_office_supplies',
        description: 'Office paper and supplies',
        quantity: 10,
        unit_price: 120,
        total_amount: 1200,
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z'
      }
    ],
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'bill_2',
    bill_number: 'BILL-2024-002',
    vendor_id: 'vend_2',
    vendor: {
      id: 'vend_2',
      name: 'Utility Company',
      email: 'billing@utility.com',
      phone: '(555) 111-2222',
      payment_terms: 15,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    date: '2024-01-15',
    due_date: '2024-01-30',
    subtotal: 850,
    tax_amount: 68,
    total_amount: 918,
    balance: 0,
    status: 'paid',
    line_items: [
      {
        id: 'bli_2',
        bill_id: 'bill_2',
        account_id: 'acc_utilities',
        description: 'Monthly electricity bill',
        quantity: 1,
        unit_price: 850,
        total_amount: 850,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      }
    ],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'bill_3',
    bill_number: 'BILL-2024-003',
    vendor_id: 'vend_3',
    vendor: {
      id: 'vend_3',
      name: 'Tech Services LLC',
      email: 'invoices@techservices.com',
      phone: '(555) 333-4444',
      payment_terms: 45,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    date: '2024-01-08',
    due_date: '2024-02-22',
    subtotal: 3500,
    tax_amount: 280,
    total_amount: 3780,
    balance: 3780,
    status: 'overdue',
    line_items: [
      {
        id: 'bli_3',
        bill_id: 'bill_3',
        account_id: 'acc_consulting',
        description: 'Software consulting services',
        quantity: 35,
        unit_price: 100,
        total_amount: 3500,
        created_at: '2024-01-08T00:00:00Z',
        updated_at: '2024-01-08T00:00:00Z'
      }
    ],
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z'
  }
]

function getStatusColor(status: Bill['status']) {
  switch (status) {
    case 'draft': return 'bg-neutral-100 text-neutral-800'
    case 'pending': return 'bg-blue-100 text-blue-800'
    case 'paid': return 'bg-green-100 text-green-800'
    case 'overdue': return 'bg-red-100 text-red-800'
    case 'voided': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-neutral-100 text-neutral-800'
  }
}

function getDaysUntilDue(dueDate: string): number {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function getStatusIcon(status: Bill['status']) {
  switch (status) {
    case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />
    case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />
    case 'pending': return <Clock className="w-4 h-4 text-blue-600" />
    case 'voided': return <XCircle className="w-4 h-4 text-yellow-600" />
    default: return <FileText className="w-4 h-4 text-neutral-600" />
  }
}

export default function BillsPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [statusFilter, setStatusFilter] = useState<'all' | Bill['status']>('all')

  const filteredBills = useMemo(() => {
    return mockBills.filter(bill => {
      const matchesSearch = 
        bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.line_items.some(item => 
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      
      const matchesStatus = statusFilter === 'all' || bill.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

  const billStats = useMemo(() => {
    const total = mockBills.reduce((sum, bill) => sum + bill.total_amount, 0)
    const outstanding = mockBills
      .filter(bill => bill.status === 'pending' || bill.status === 'overdue')
      .reduce((sum, bill) => sum + bill.balance, 0)
    const overdue = mockBills
      .filter(bill => bill.status === 'overdue')
      .reduce((sum, bill) => sum + bill.balance, 0)
    const paid = mockBills
      .filter(bill => bill.status === 'paid')
      .reduce((sum, bill) => sum + bill.total_amount, 0)

    return { total, outstanding, overdue, paid }
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bills</h1>
          <p className="text-muted-foreground">Manage vendor bills and payments</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Bill
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${billStats.total.toLocaleString()}</div>
            <div className="text-xs text-blue-600 flex items-center mt-1">
              <FileText className="w-3 h-3 mr-1" />
              {mockBills.length} bills
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">${billStats.outstanding.toLocaleString()}</div>
            <div className="text-xs text-orange-600 flex items-center mt-1">
              <Clock className="w-3 h-3 mr-1" />
              Unpaid bills
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">${billStats.overdue.toLocaleString()}</div>
            <div className="text-xs text-red-600 flex items-center mt-1">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Needs attention
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">${billStats.paid.toLocaleString()}</div>
            <div className="text-xs text-green-600 flex items-center mt-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
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
                  placeholder="Search bills..."
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
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="voided">Voided</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bills List */}
      <div className="space-y-4">
        {filteredBills.map((bill) => (
          <Card key={bill.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    {getStatusIcon(bill.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{bill.bill_number}</h3>
                      <Badge className={getStatusColor(bill.status)}>
                        {bill.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {bill.vendor?.name} • Due {new Date(bill.due_date).toLocaleDateString()}
                      {bill.status === 'overdue' && (
                        <span className="text-red-600 ml-2">
                          ({Math.abs(getDaysUntilDue(bill.due_date))} days overdue)
                        </span>
                      )}
                      {bill.status === 'pending' && getDaysUntilDue(bill.due_date) <= 7 && (
                        <span className="text-orange-600 ml-2">
                          (Due in {getDaysUntilDue(bill.due_date)} days)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="font-semibold">${bill.total_amount.toLocaleString()}</div>
                    {bill.balance > 0 && bill.balance !== bill.total_amount && (
                      <div className="text-sm text-muted-foreground">
                        Balance: ${bill.balance.toLocaleString()}
                      </div>
                    )}
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
                    {bill.status === 'pending' && (
                      <Button size="sm">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Pay
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Bill Details */}
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date: </span>
                    {new Date(bill.date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Terms: </span>
                    {bill.vendor?.payment_terms} days
                  </div>
                  <div>
                    <span className="text-muted-foreground">Items: </span>
                    {bill.line_items.length} line item{bill.line_items.length !== 1 ? 's' : '}
                  </div>
                </div>
                
                {/* Line Items Preview */}
                <div className="mt-3">
                  <div className="text-sm text-muted-foreground mb-2">Line Items:</div>
                  {bill.line_items.slice(0, 2).map((item, index) => (
                    <div key={item.id} className="text-sm flex justify-between py-1">
                      <span>{item.description}</span>
                      <span>${item.total_amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {bill.line_items.length > 2 && (
                    <div className="text-sm text-muted-foreground">
                      +{bill.line_items.length - 2} more items
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredBills.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bills found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first bill'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Bill
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}