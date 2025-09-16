import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  Send,
  Copy,
  Car,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical
} from 'lucide-react'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'


interface AutoEstimate {
  id: string
  estimateNumber: string
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
  
  // Basic info
  title: string
  description: string
  serviceType: string
  
  // Status and validity
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  validUntil: string
  
  // Totals
  laborTotal: number
  partsTotal: number
  subtotal: number
  tax: number
  total: number
  
  // Timing
  estimatedDuration?: number
  availableDate?: string
  
  createdAt: string
  updatedAt: string
}

const statusColors = {
  draft: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

const statusIcons = {
  draft: Clock,
  sent: Send,
  approved: CheckCircle,
  rejected: XCircle,
  expired: Clock
}

export default function AutoEstimatesPage() {
  const [estimates, setEstimates] = useState<AutoEstimate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEstimates()
  }, [])

  const fetchEstimates = async () => {
    try {
      // Mock auto estimates data
      setEstimates([
        {
          id: '1',
          estimateNumber: 'EST-2024-001',
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
          title: 'Brake Pad Replacement',
          description: 'Replace front brake pads and resurface rotors',
          serviceType: 'brake_service',
          status: 'sent',
          validUntil: '2024-02-15T23:59:59Z',
          laborTotal: 180,
          partsTotal: 220,
          subtotal: 400,
          tax: 36,
          total: 436,
          estimatedDuration: 2,
          availableDate: '2024-01-18T08:00:00Z',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ])
    } catch (error) {
      console.error('Error fetching estimates:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<AutoEstimate>[] = [
    {
      key: 'estimateNumber',
      label: 'Estimate #',
      width: '130px',
      sortable: true,
      render: (estimate) => (
        <div>
          <div className="font-mono font-medium text-sm">{estimate.estimateNumber}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(estimate.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer & Vehicle',
      render: (estimate) => (
        <div>
          <div className="font-medium flex items-center">
            <User className="h-3 w-3 mr-1" />
            {estimate.customer.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {estimate.customer.phone}
          </div>
          <div className="text-sm text-muted-foreground flex items-center mt-1">
            <Car className="h-3 w-3 mr-1" />
            {estimate.vehicle.year} {estimate.vehicle.make} {estimate.vehicle.model}
          </div>
          {estimate.vehicle.licensePlate && (
            <div className="text-xs text-muted-foreground font-mono">
              {estimate.vehicle.licensePlate}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'service',
      label: 'Service',
      render: (estimate) => (
        <div>
          <div className="font-medium">{estimate.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
            {estimate.description}
          </div>
          <div className="text-xs text-muted-foreground mt-1 capitalize">
            {estimate.serviceType.replace('_', ' ')}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      sortable: true,
      render: (estimate) => {
        const Icon = statusIcons[estimate.status]
        return (
          <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[estimate.status]}'}>
            <Icon className="h-3 w-3 mr-1" />
            {estimate.status}
          </span>
        )
      }
    },
    {
      key: 'timing',
      label: 'Timing',
      width: '140px',
      render: (estimate) => (
        <div className="text-sm">
          {estimate.availableDate && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(estimate.availableDate).toLocaleDateString()}
            </div>
          )}
          {estimate.estimatedDuration && (
            <div className="flex items-center text-muted-foreground mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {estimate.estimatedDuration}h estimated
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Valid until {new Date(estimate.validUntil).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'breakdown',
      label: 'Breakdown',
      width: '140px',
      render: (estimate) => (
        <div className="text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Labor:</span>
            <span>${estimate.laborTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Parts:</span>
            <span>${estimate.partsTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-1 mt-1">
            <span>Total:</span>
            <span>${estimate.total.toLocaleString()}</span>
          </div>
        </div>
      )
    }
  ]

  const rowActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (estimates: AutoEstimate[]) => {
        console.log('View estimate:', estimates[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (estimates: AutoEstimate[]) => {
        console.log('Edit estimate:', estimates[0].id)
      }
    },
    {
      label: 'Copy',
      icon: Copy,
      onClick: (estimates: AutoEstimate[]) => {
        console.log('Copy estimate:', estimates[0].id)
      }
    },
    {
      label: 'Send',
      icon: Send,
      onClick: (estimates: AutoEstimate[]) => {
        console.log('Send estimate:', estimates[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Send Selected',
      icon: Send,
      onClick: (selectedEstimates: AutoEstimate[]) => {
        console.log('Send estimates:', selectedEstimates)
      },
      variant: 'default' as const
    },
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedEstimates: AutoEstimate[]) => {
        console.log('Export estimates:', selectedEstimates)
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
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Expired', value: 'expired' }
      ],
      value: ',
      onChange: (value: string) => console.log('Status filter:', value)
    },
    {
      key: 'serviceType',
      label: 'Service Type',
      type: 'select' as const,
      options: [
        { label: 'All Services', value: ' },
        { label: 'Oil Change', value: 'oil_change' },
        { label: 'Brake Service', value: 'brake_service' },
        { label: 'Tire Service', value: 'tire_service' },
        { label: 'Engine Repair', value: 'engine_repair' },
        { label: 'Diagnostic', value: 'diagnostic' }
      ],
      value: ',
      onChange: (value: string) => console.log('Service type filter:', value)
    }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Estimates</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Create and manage service estimates for customers
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              Templates
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Estimate
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <DataTable
          data={estimates}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search estimates, customers, vehicles, or services..."
          selectable
          bulkActions={bulkActions}
          rowActions={rowActions}
          filters={filters}
          onRowClick={(estimate) => {
            console.log('Navigate to estimate details:', estimate.id)
          }}
          paginated
          emptyState={
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No estimates found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Create your first service estimate to start quoting repairs
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Estimate
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
