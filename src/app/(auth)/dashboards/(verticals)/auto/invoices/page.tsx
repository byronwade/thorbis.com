import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  Send,
  Car,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  CreditCard,
  MoreVertical
} from 'lucide-react'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'


interface AutoInvoice {
  id: string
  invoiceNumber: string
  customer: {
    name: string
    phone: string
  }
  vehicle: {
    year: number
    make: string
    model: string
    licensePlate?: string
  }
  repairOrderId?: string
  
  // Status and dates
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'
  issuedAt: string
  dueAt: string
  paidAt?: string
  
  // Totals
  laborTotal: number
  partsTotal: number
  subtotal: number
  tax: number
  total: number
  amountPaid: number
  amountDue: number
  
  // Payment information
  paymentTerms: string
  
  createdAt: string
  updatedAt: string
}

const statusColors = {
  draft: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  cancelled: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
}

const statusIcons = {
  draft: Clock,
  sent: Send,
  paid: CheckCircle,
  partial: AlertTriangle,
  overdue: AlertTriangle,
  cancelled: Clock
}

export default function AutoInvoicesPage() {
  const [invoices, setInvoices] = useState<AutoInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      // Mock auto invoices data
      setInvoices([
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          customer: {
            name: 'Michael Johnson',
            phone: '(555) 123-4567'
          },
          vehicle: {
            year: 2020,
            make: 'Honda',
            model: 'Civic',
            licensePlate: 'ABC123'
          },
          repairOrderId: 'RO-2024-001',
          status: 'sent',
          issuedAt: '2024-01-15T10:00:00Z',
          dueAt: '2024-02-14T23:59:59Z',
          laborTotal: 180,
          partsTotal: 220,
          subtotal: 400,
          tax: 36,
          total: 436,
          amountPaid: 0,
          amountDue: 436,
          paymentTerms: 'Net 30',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<AutoInvoice>[] = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      width: '130px',
      sortable: true,
      render: (invoice) => (
        <div>
          <div className="font-mono font-medium text-sm">{invoice.invoiceNumber}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(invoice.issuedAt).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer & Vehicle',
      render: (invoice) => (
        <div>
          <div className="font-medium flex items-center">
            <User className="h-3 w-3 mr-1" />
            {invoice.customer.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {invoice.customer.phone}
          </div>
          <div className="text-sm text-muted-foreground flex items-center mt-1">
            <Car className="h-3 w-3 mr-1" />
            {invoice.vehicle.year} {invoice.vehicle.make} {invoice.vehicle.model}
          </div>
          {invoice.vehicle.licensePlate && (
            <div className="text-xs text-muted-foreground font-mono">
              {invoice.vehicle.licensePlate}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      sortable: true,
      render: (invoice) => {
        const Icon = statusIcons[invoice.status]
        return (
          <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}'}>
            <Icon className="h-3 w-3 mr-1" />
            {invoice.status}
          </span>
        )
      }
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      width: '120px',
      sortable: true,
      render: (invoice) => {
        const dueDate = new Date(invoice.dueAt)
        const isOverdue = dueDate < new Date() && invoice.status !== 'paid'
        const isDueSoon = dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && invoice.status !== 'paid'
        
        return (
          <div className="text-sm">
            <div className={'flex items-center ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-orange-500' : '
              }'}>'
              <Calendar className="h-3 w-3 mr-1" />
              {dueDate.toLocaleDateString()}
            </div>
            {isOverdue && (
              <div className="text-xs text-red-500 mt-1">Overdue</div>
            )}
            {!isOverdue && isDueSoon && (
              <div className="text-xs text-orange-500 mt-1">Due soon</div>
            )}
          </div>
        )
      }
    },
    {
      key: 'breakdown',
      label: 'Breakdown',
      width: '140px',
      render: (invoice) => (
        <div className="text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Labor:</span>
            <span>${invoice.laborTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Parts:</span>
            <span>${invoice.partsTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-1 mt-1">
            <span>Total:</span>
            <span>${invoice.total.toLocaleString()}</span>
          </div>
        </div>
      )
    },
    {
      key: 'payment',
      label: 'Payment',
      width: '120px',
      render: (invoice) => {
        const paymentPercentage = invoice.total > 0 ? (invoice.amountPaid / invoice.total) * 100 : 0
        
        return (
          <div className="text-sm">
            <div className="font-medium">${invoice.amountDue.toFixed(2)} due</div>
            <div className="text-xs text-muted-foreground mb-1">
              {Math.round(paymentPercentage)}% paid
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all" 
                style={{ width: '${paymentPercentage}%' }}
              />
            </div>
          </div>
        )
      }
    }
  ]

  const rowActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (invoices: AutoInvoice[]) => {
        console.log('View invoice:', invoices[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (invoices: AutoInvoice[]) => {
        console.log('Edit invoice:', invoices[0].id)
      }
    },
    {
      label: 'Send',
      icon: Send,
      onClick: (invoices: AutoInvoice[]) => {
        console.log('Send invoice:', invoices[0].id)
      }
    },
    {
      label: 'Payment',
      icon: CreditCard,
      onClick: (invoices: AutoInvoice[]) => {
        console.log('Record payment:', invoices[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Send Selected',
      icon: Send,
      onClick: (selectedInvoices: AutoInvoice[]) => {
        console.log('Send invoices:', selectedInvoices)
      },
      variant: 'default' as const
    },
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedInvoices: AutoInvoice[]) => {
        console.log('Export invoices:', selectedInvoices)
      },
      variant: 'outline' as const
    }
  ]

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All Status', value: ' },
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Partial', value: 'partial' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Cancelled', value: 'cancelled' }
      ],
      value: ',
      onChange: (value: string) => console.log('Status filter:', value)
    }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Invoices</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Track service payments and manage billing
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              Payment Reports
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <DataTable
          data={invoices}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search invoices, customers, vehicles, or amounts..."
          selectable
          bulkActions={bulkActions}
          rowActions={rowActions}
          filters={filters}
          onRowClick={(invoice) => {
            console.log('Navigate to invoice details:', invoice.id)
          }}
          paginated
          emptyState={
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No invoices found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Create your first invoice to start billing for completed services
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          }
          density="comfortable"
          className="h-full"
        />
      </div>
    </div>
  )
}
