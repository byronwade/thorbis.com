import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  Receipt,
  DollarSign,
  CreditCard,
  RotateCcw,
  User,
  Calendar,
  Package,
  MoreVertical
} from 'lucide-react'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'


interface ReceiptRecord {
  id: string
  receiptNumber: string
  customer?: {
    name: string
    phone: string
  }
  
  // Transaction details
  status: 'completed' | 'refunded' | 'exchanged' | 'voided'
  transactionType: 'sale' | 'return' | 'exchange' | 'void'
  
  // Items summary
  itemCount: number
  uniqueItems: number
  
  // Totals
  subtotal: number
  discountTotal: number
  taxTotal: number
  total: number
  
  // Payment details
  paymentMethod: string
  changeGiven: number
  
  // Store and staff info
  registerId?: string
  cashier: {
    name: string
    id: string
  }
  
  // Transaction timing
  transactionDate: string
  
  // Return/void info
  voidReason?: string
  returnReason?: string
  
  createdAt: string
  updatedAt: string
}

const statusColors = {
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  refunded: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  exchanged: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  voided: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
}

const transactionTypeColors = {
  sale: 'text-green-600',
  return: 'text-red-600',
  exchange: 'text-blue-600',
  void: 'text-neutral-600'
}

const paymentMethodIcons = {
  cash: DollarSign,
  credit_card: CreditCard,
  debit_card: CreditCard,
  mobile_pay: CreditCard
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    try {
      // Mock receipts data
      setReceipts([
        {
          id: '1',
          receiptNumber: 'RCP-2024-001',
          customer: {
            name: 'Sarah Wilson',
            phone: '(555) 123-4567'
          },
          status: 'completed',
          transactionType: 'sale',
          itemCount: 3,
          uniqueItems: 2,
          subtotal: 199.97,
          discountTotal: 20.00,
          taxTotal: 14.40,
          total: 194.37,
          paymentMethod: 'credit_card',
          changeGiven: 0,
          registerId: 'REG-01',
          cashier: {
            name: 'Alice Johnson',
            id: 'emp1'
          },
          transactionDate: '2024-01-15T14:30:00Z',
          createdAt: '2024-01-15T14:30:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          receiptNumber: 'RCP-2024-002',
          status: 'refunded',
          transactionType: 'return',
          itemCount: 1,
          uniqueItems: 1,
          subtotal: -24.99,
          discountTotal: 0,
          taxTotal: -2.00,
          total: -26.99,
          paymentMethod: 'credit_card',
          changeGiven: 0,
          registerId: 'REG-01',
          cashier: {
            name: 'Bob Smith',
            id: 'emp2'
          },
          transactionDate: '2024-01-15T16:45:00Z',
          returnReason: 'Customer changed mind',
          createdAt: '2024-01-15T16:45:00Z',
          updatedAt: '2024-01-15T16:45:00Z'
        }
      ])
    } catch (error) {
      console.error('Error fetching receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<ReceiptRecord>[] = [
    {
      key: 'receiptNumber',
      label: 'Receipt #',
      width: '130px',
      sortable: true,
      render: (receipt) => (
        <div>
          <div className="font-mono font-medium text-sm">{receipt.receiptNumber}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(receipt.transactionDate).toLocaleDateString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(receipt.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (receipt) => (
        <div>
          {receipt.customer ? (
            <>
              <div className="font-medium flex items-center">
                <User className="h-3 w-3 mr-1" />
                {receipt.customer.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {receipt.customer.phone}
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">Guest</span>
          )}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      width: '100px',
      render: (receipt) => (
        <div className={'text-sm font-medium ${transactionTypeColors[receipt.transactionType]}'}>
          <div className="capitalize">{receipt.transactionType}</div>
          {receipt.returnReason && (
            <div className="text-xs text-muted-foreground mt-1">
              {receipt.returnReason}
            </div>
          )}
          {receipt.voidReason && (
            <div className="text-xs text-muted-foreground mt-1">
              {receipt.voidReason}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      width: '80px',
      render: (receipt) => (
        <div className="text-sm">
          <div className="font-medium">{receipt.itemCount}</div>
          <div className="text-xs text-muted-foreground">
            {receipt.uniqueItems} unique
          </div>
        </div>
      )
    },
    {
      key: 'payment',
      label: 'Payment',
      width: '120px',
      render: (receipt) => {
        const PaymentIcon = paymentMethodIcons[receipt.paymentMethod as keyof typeof paymentMethodIcons] || CreditCard
        
        return (
          <div className="text-sm">
            <div className="flex items-center">
              <PaymentIcon className="h-3 w-3 mr-1" />
              <span className="capitalize">{receipt.paymentMethod.replace('_', ' ')}</span>
            </div>
            {receipt.changeGiven > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Change: ${receipt.changeGiven.toFixed(2)}
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'total',
      label: 'Amount',
      width: '120px',
      align: 'right',
      sortable: true,
      render: (receipt) => (
        <div className="text-right">
          <div className={'font-medium flex items-center justify-end ${
            receipt.total < 0 ? 'text-red-600' : 'text-green-600'
              }'}>'
            <DollarSign className="h-3 w-3" />
            {Math.abs(receipt.total).toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            Sub: ${Math.abs(receipt.subtotal).toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            Tax: ${Math.abs(receipt.taxTotal).toFixed(2)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      render: (receipt) => (
        <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[receipt.status]}'}>
          {receipt.status}
        </span>
      )
    },
    {
      key: 'cashier',
      label: 'Cashier',
      width: '100px',
      render: (receipt) => (
        <div className="text-sm">
          <div className="font-medium">{receipt.cashier.name}</div>
          {receipt.registerId && (
            <div className="text-xs text-muted-foreground">
              {receipt.registerId}
            </div>
          )}
        </div>
      )
    }
  ]

  const rowActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (receipts: ReceiptRecord[]) => {
        console.log('View receipt details:', receipts[0].id)
      }
    },
    {
      label: 'Print',
      icon: Receipt,
      onClick: (receipts: ReceiptRecord[]) => {
        console.log('Print receipt:', receipts[0].id)
      }
    },
    {
      label: 'Return',
      icon: RotateCcw,
      onClick: (receipts: ReceiptRecord[]) => {
        console.log('Process return:', receipts[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedReceipts: ReceiptRecord[]) => {
        console.log('Export receipts:', selectedReceipts)
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
        { label: 'Completed', value: 'completed' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Exchanged', value: 'exchanged' },
        { label: 'Voided', value: 'voided' }
      ],
      value: ',
      onChange: (value: string) => console.log('Status filter:', value)
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      type: 'select' as const,
      options: [
        { label: 'All Methods', value: ' },
        { label: 'Cash', value: 'cash' },
        { label: 'Credit Card', value: 'credit_card' },
        { label: 'Debit Card', value: 'debit_card' },
        { label: 'Mobile Pay', value: 'mobile_pay' }
      ],
      value: ',
      onChange: (value: string) => console.log('Payment method filter:', value)
    }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Receipts</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              View transaction history and manage returns
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="header" className="rounded-lg">
              Daily Reports
            </Button>
            <Button variant="header" className="rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <DataTable
          data={receipts}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search receipts by number, customer, or cashier..."
          selectable
          bulkActions={bulkActions}
          rowActions={rowActions}
          filters={filters}
          onRowClick={(receipt) => {
            console.log('Navigate to receipt details:', receipt.id)
          }}
          paginated
          emptyState={
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No receipts found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Complete your first sale to see transaction history
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Sale
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
