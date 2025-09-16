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
  ShoppingCart,
  Calendar,
  DollarSign,
  Star,
  MoreVertical
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
  
  // Customer metrics
  metrics: {
    totalOrders: number
    totalSpent: number
    avgOrderValue: number
    lastOrderDate?: string
    customerSince: string
    loyaltyPoints: number
    lifetimeValue: number
  }
  
  // Status and preferences
  status: 'active' | 'inactive' | 'potential'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  tags: string[]
  preferredContactMethod: 'email' | 'phone' | 'sms'
  
  // Marketing permissions
  emailMarketing: boolean
  smsMarketing: boolean
  
  createdAt: string
  updatedAt: string
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  potential: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
}

const tierColors = {
  bronze: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  silver: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  platinum: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
}

export default function RetailCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      // Mock retail customer data
      setCustomers([
        {
          id: '1',
          name: 'Sarah Wilson',
          email: 'sarah@email.com',
          phone: '(555) 123-4567',
          address: {
            street: '789 Pine St',
            city: 'Austin',
            state: 'TX',
            zipCode: '73301'
          },
          status: 'active',
          tier: 'gold',
          tags: ['vip', 'frequent_buyer'],
          preferredContactMethod: 'email',
          emailMarketing: true,
          smsMarketing: false,
          metrics: {
            totalOrders: 28,
            totalSpent: 3420,
            avgOrderValue: 122,
            lastOrderDate: '2024-01-12T14:30:00Z',
            customerSince: '2022-05-10T10:00:00Z',
            loyaltyPoints: 1250,
            lifetimeValue: 4100
          },
          createdAt: '2022-05-10T10:00:00Z',
          updatedAt: '2024-01-12T14:30:00Z'
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
      key: 'status',
      label: 'Status',
      width: '100px',
      render: (customer) => (
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[customer.status]}'}>
            {customer.status}
          </span>
          <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${tierColors[customer.tier]}'}>
            {customer.tier}
          </span>
        </div>
      )
    },
    {
      key: 'orderHistory',
      label: 'Order History',
      width: '140px',
      render: (customer) => (
        <div className="text-sm">
          <div className="flex items-center">
            <ShoppingCart className="h-3 w-3 mr-1" />
            <span>{customer.metrics.totalOrders} orders</span>
          </div>
          <div className="flex items-center text-muted-foreground mt-1">
            <DollarSign className="h-3 w-3 mr-1" />
            <span>${customer.metrics.totalSpent.toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg: ${customer.metrics.avgOrderValue}
          </div>
        </div>
      )
    },
    {
      key: 'loyalty',
      label: 'Loyalty',
      width: '120px',
      render: (customer) => (
        <div className="text-sm">
          <div className="flex items-center">
            <Star className="h-3 w-3 mr-1 text-yellow-500" />
            <span className="font-medium">{customer.metrics.loyaltyPoints}</span>
            <span className="text-muted-foreground ml-1">pts</span>
          </div>
          <div className="text-muted-foreground">
            LTV: ${customer.metrics.lifetimeValue.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'lastOrder',
      label: 'Last Order',
      width: '120px',
      sortable: true,
      render: (customer) => (
        <div className="text-sm">
          {customer.metrics.lastOrderDate ? (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(customer.metrics.lastOrderDate).toLocaleDateString()}
            </div>
          ) : (
            <span className="text-muted-foreground">No orders yet</span>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Since {new Date(customer.metrics.customerSince).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Location',
      render: (customer) => (
        <div>
          <div className="text-sm">{customer.address.street}</div>
          <div className="text-sm text-muted-foreground flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {customer.address.city}, {customer.address.state}
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
    }
  ]

  const bulkActions = [
    {
      label: 'Marketing Campaign',
      icon: Mail,
      onClick: (selectedCustomers: Customer[]) => {
        console.log('Create marketing campaign:', selectedCustomers)
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
      key: 'tier',
      label: 'Tier',
      type: 'select' as const,
      options: [
        { label: 'All Tiers', value: ' },
        { label: 'Platinum', value: 'platinum' },
        { label: 'Gold', value: 'gold' },
        { label: 'Silver', value: 'silver' },
        { label: 'Bronze', value: 'bronze' }
      ],
      value: ',
      onChange: (value: string) => console.log('Tier filter:', value)
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
              Manage customer relationships and loyalty programs
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              Loyalty Program
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
          searchPlaceholder="Search customers by name, phone, email, or address..."
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
                Add your first customer to start building your retail customer base
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
