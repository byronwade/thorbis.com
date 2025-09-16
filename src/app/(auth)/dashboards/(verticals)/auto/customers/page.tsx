import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  Phone,
  MapPin,
  Mail,
  Car,
  Calendar,
  DollarSign,
  FileText,
  MoreVertical,
  Wrench
} from 'lucide-react'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'


interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  
  // Vehicle count
  vehicles: Array<{
    id: string
    year: number
    make: string
    model: string
    licensePlate?: string
  }>
  
  // Customer metrics
  metrics: {
    totalServices: number
    totalSpent: number
    avgServiceValue: number
    lastServiceDate?: string
    customerSince: string
    preferredServices: string[]
  }
  
  // Status
  status: 'active' | 'inactive' | 'potential'
  tags: string[]
  
  createdAt: string
  updatedAt: string
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  potential: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
}

export default function AutoCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      // Mock customer data for auto services
      setCustomers([
        {
          id: '1',
          name: 'Michael Johnson',
          email: 'michael@email.com',
          phone: '(555) 123-4567',
          address: {
            street: '456 Oak St',
            city: 'Phoenix',
            state: 'AZ',
            zipCode: '85001'
          },
          vehicles: [
            {
              id: 'v1',
              year: 2020,
              make: 'Honda',
              model: 'Civic',
              licensePlate: 'ABC123'
            },
            {
              id: 'v2', 
              year: 2018,
              make: 'Toyota',
              model: 'Camry',
              licensePlate: 'XYZ789'
            }
          ],
          status: 'active',
          tags: ['fleet', 'commercial'],
          metrics: {
            totalServices: 12,
            totalSpent: 4250,
            avgServiceValue: 354,
            lastServiceDate: '2024-01-10T10:00:00Z',
            customerSince: '2022-06-15T10:00:00Z',
            preferredServices: ['oil_change', 'brake_service', 'inspection']
          },
          createdAt: '2022-06-15T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z'
        }
      ])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'name',
      label: 'Customer',
      render: (customer) => (
        <div>
          <div className="font-medium">{customer.name}</div>
          <div className="text-sm text-muted-foreground flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            {customer.phone}
          </div>
          {customer.email && (
            <div className="text-sm text-muted-foreground flex items-center mt-1">
              <Mail className="h-3 w-3 mr-1" />
              {customer.email}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'vehicles',
      label: 'Vehicles',
      render: (customer) => (
        <div>
          <div className="flex items-center mb-1">
            <Car className="h-3 w-3 mr-1" />
            <span className="font-medium">{customer.vehicles.length} vehicle{customer.vehicles.length !== 1 ? 's' : '}</span>
          </div>
          <div className="space-y-1">
            {customer.vehicles.slice(0, 2).map((vehicle) => (
              <div key={vehicle.id} className="text-sm text-muted-foreground">
                {vehicle.year} {vehicle.make} {vehicle.model}
                {vehicle.licensePlate && (
                  <span className="ml-2 font-mono text-xs">({vehicle.licensePlate})</span>
                )}
              </div>
            ))}
            {customer.vehicles.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{customer.vehicles.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Address',
      render: (customer) => (
        <div>
          <div className="text-sm">{customer.address.street}</div>
          <div className="text-sm text-muted-foreground flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {customer.address.city}, {customer.address.state} {customer.address.zipCode}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      sortable: true,
      render: (customer) => (
        <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[customer.status]}'}>
          {customer.status}
        </span>
      )
    },
    {
      key: 'serviceHistory',
      label: 'Service History',
      width: '140px',
      render: (customer) => (
        <div className="text-sm">
          <div className="flex items-center">
            <Wrench className="h-3 w-3 mr-1" />
            <span>{customer.metrics.totalServices} services</span>
          </div>
          <div className="flex items-center text-muted-foreground mt-1">
            <DollarSign className="h-3 w-3 mr-1" />
            <span>${customer.metrics.totalSpent.toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg: ${customer.metrics.avgServiceValue}
          </div>
        </div>
      )
    },
    {
      key: 'lastService',
      label: 'Last Service',
      width: '120px',
      sortable: true,
      render: (customer) => (
        <div className="text-sm">
          {customer.metrics.lastServiceDate ? (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(customer.metrics.lastServiceDate).toLocaleDateString()}
            </div>
          ) : (
            <span className="text-muted-foreground">No services yet</span>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Since {new Date(customer.metrics.customerSince).toLocaleDateString()}
          </div>
        </div>
      )
    }
  ]

  const rowActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (customers: Customer[]) => {
        console.log('View customer details:', customers[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (customers: Customer[]) => {
        console.log('Edit customer:', customers[0].id)
      }
    },
    {
      label: 'New Service',
      icon: Wrench,
      onClick: (customers: Customer[]) => {
        console.log('Create new service for customer:', customers[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Service Reminders',
      icon: Calendar,
      onClick: (selectedCustomers: Customer[]) => {
        console.log('Send service reminders:', selectedCustomers)
      },
      variant: 'default' as const
    },
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedCustomers: Customer[]) => {
        console.log('Export customers:', selectedCustomers)
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
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Potential', value: 'potential' }
      ],
      value: ',
      onChange: (value: string) => console.log('Status filter:', value)
    },
    {
      key: 'tags',
      label: 'Type',
      type: 'select' as const,
      options: [
        { label: 'All Types', value: ' },
        { label: 'Fleet', value: 'fleet' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Individual', value: 'individual' },
        { label: 'VIP', value: 'vip' }
      ],
      value: ',
      onChange: (value: string) => console.log('Type filter:', value)
    }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Customers</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Manage customer database and vehicle service history
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              Import
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <DataTable
          data={customers}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search customers by name, phone, vehicle, or license plate..."
          selectable
          bulkActions={bulkActions}
          rowActions={rowActions}
          filters={filters}
          onRowClick={(customer) => {
            console.log('Navigate to customer details:', customer.id)
          }}
          paginated
          emptyState={
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No customers found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Add your first customer to start building your service database
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
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
