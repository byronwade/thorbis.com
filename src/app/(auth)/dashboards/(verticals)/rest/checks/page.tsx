import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  DollarSign,
  Clock,
  Users,
  User,
  CheckCircle,
  Circle,
  CreditCard,
  Receipt,
  MoreVertical
} from 'lucide-react'

import { DataTable, DataTableColumn } from '@/components/ui/data-table'

interface Check {
  id: string
  checkNumber: string
  customer?: {
    name: string
    phone: string
  }
  tableId?: string
  tableNumber?: string
  partySize: number
  
  // Staff assignment
  server: {
    name: string
    id: string
  }
  
  // Status and timing
  status: 'open' | 'closed' | 'paid' | 'comped' | 'void' | 'split'
  openedAt: string
  closedAt?: string
  lastOrderedAt?: string
  
  // Totals
  subtotal: number
  tax: number
  tip: number
  discount: number
  total: number
  
  // Items count
  itemCount: number
  
  createdAt: string
  updatedAt: string
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  closed: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  comped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  void: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  split: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
}

const statusIcons = {
  open: Circle,
  closed: Clock,
  paid: CheckCircle,
  comped: Receipt,
  void: Circle,
  split: Users
}

export default function ChecksPage() {
  const [checks, setChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChecks()
  }, [])

  const fetchChecks = async () => {
    try {
      const response = await fetch('http://localhost:3000/data/api/rest/checks?count=50')
      const result = await response.json()
      setChecks(result.data)
    } catch (error) {
      console.error('Error fetching checks:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<Check>[] = [
    {
      key: 'checkNumber',
      label: 'Check #',
      width: '120px',
      sortable: true,
      render: (check) => (
        <div>
          <div className="font-mono font-medium text-sm">{check.checkNumber}</div>
          <div className="text-xs text-muted-foreground">
            {check.tableNumber ? 'Table ${check.tableNumber}' : 'Takeout'}
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (check) => (
        <div>
          {check.customer ? (
            <>
              <div className="font-medium">{check.customer.name}</div>
              <div className="text-sm text-muted-foreground">
                {check.customer.phone}
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">Walk-in</span>
          )}
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Users className="h-3 w-3 mr-1" />
            Party of {check.partySize}
          </div>
        </div>
      )
    },
    {
      key: 'server',
      label: 'Server',
      width: '120px',
      render: (check) => (
        <div>
          <div className="font-medium flex items-center">
            <User className="h-3 w-3 mr-1" />
            {check.server.name}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      sortable: true,
      render: (check) => {
        const Icon = statusIcons[check.status]
        return (
          <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[check.status]}'}>
            <Icon className="h-3 w-3 mr-1" />
            {check.status}
          </span>
        )
      }
    },
    {
      key: 'timing',
      label: 'Timing',
      width: '140px',
      render: (check) => {
        const openedAt = new Date(check.openedAt)
        const now = new Date()
        const duration = check.closedAt 
          ? Math.round((new Date(check.closedAt).getTime() - openedAt.getTime()) / (1000 * 60))
          : Math.round((now.getTime() - openedAt.getTime()) / (1000 * 60))
        
        return (
          <div className="text-sm">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {openedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {duration}m {check.status === 'open' ? 'ago' : 'duration'}
            </div>
          </div>
        )
      }
    },
    {
      key: 'items',
      label: 'Items',
      width: '80px',
      render: (check) => (
        <div className="text-sm font-medium text-center">
          {check.itemCount}
        </div>
      )
    },
    {
      key: 'total',
      label: 'Amount',
      width: '140px',
      align: 'right',
      sortable: true,
      render: (check) => (
        <div className="text-right">
          <div className="font-medium flex items-center justify-end">
            <DollarSign className="h-3 w-3" />
            {check.total.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            Sub: ${check.subtotal.toFixed(2)}
          </div>
          {check.tip > 0 && (
            <div className="text-xs text-green-600">
              Tip: ${check.tip.toFixed(2)}
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
      onClick: (checks: Check[]) => {
        console.log('View check details:', checks[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (checks: Check[]) => {
        console.log('Edit check:', checks[0].id)
      }
    },
    {
      label: 'Payment',
      icon: CreditCard,
      onClick: (checks: Check[]) => {
        console.log('Process payment:', checks[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Close Selected',
      icon: Clock,
      onClick: (selectedChecks: Check[]) => {
        console.log('Close checks:', selectedChecks)
      },
      variant: 'default' as const
    },
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedChecks: Check[]) => {
        console.log('Export checks:', selectedChecks)
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
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
        { label: 'Paid', value: 'paid' },
        { label: 'Comped', value: 'comped' },
        { label: 'Void', value: 'void' },
        { label: 'Split', value: 'split' }
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
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Checks</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Monitor table checks and payment status
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="header" className="rounded-lg">
              Reports
            </Button>
            <Button variant="header" className="rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              New Check
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <DataTable
          data={checks}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search checks, servers, or table numbers..."
          selectable
          bulkActions={bulkActions}
          rowActions={rowActions}
          filters={filters}
          onRowClick={(check) => {
            console.log('Navigate to check details:', check.id)
          }}
          paginated
          emptyState={
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No checks found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Open your first table check to start taking orders
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Open Check
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