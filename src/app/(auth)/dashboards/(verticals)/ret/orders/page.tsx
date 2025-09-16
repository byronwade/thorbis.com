import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  Package,
  DollarSign,
  Truck,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreVertical
} from 'lucide-react'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'


interface Order {
  id: string
  orderNumber: string
  customer?: {
    name: string
    phone: string
    email?: string
  }
  
  // Order details
  status: 'pending' | 'confirmed' | 'processing' | 'picking' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  fulfillmentMethod: 'in_store' | 'ship_to_home' | 'pickup' | 'curbside' | 'delivery'
  priority: 'normal' | 'high' | 'rush'
  
  // Items
  itemCount: number
  uniqueItems: number
  
  // Totals
  subtotal: number
  discountTotal: number
  taxTotal: number
  shippingCost: number
  total: number
  
  // Payment
  paymentStatus: 'pending' | 'authorized' | 'paid' | 'partial' | 'refunded' | 'failed'
  
  // Shipping information
  shippingAddress?: {
    city: string
    state: string
  }
  trackingNumber?: string
  shippedAt?: string
  deliveredAt?: string
  estimatedDelivery?: string
  
  // Source
  source: 'online' | 'in_store' | 'phone' | 'mobile_app'
  
  // Staff
  processedBy?: string
  fulfilledBy?: string
  
  createdAt: string
  updatedAt: string
}

const statusColors = {
  pending: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  processing: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  picking: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  packed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  picking: Package,
  packed: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: AlertTriangle,
  returned: AlertTriangle
}

const fulfillmentIcons = {
  in_store: Package,
  ship_to_home: Truck,
  pickup: Package,
  curbside: Package,
  delivery: Truck
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      // Mock orders data
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          customer: {
            name: 'Sarah Wilson',
            phone: '(555) 123-4567',
            email: 'sarah@email.com'
          },
          status: 'shipped',
          fulfillmentMethod: 'ship_to_home',
          priority: 'normal',
          itemCount: 3,
          uniqueItems: 2,
          subtotal: 199.97,
          discountTotal: 20.00,
          taxTotal: 14.40,
          shippingCost: 9.99,
          total: 204.36,
          paymentStatus: 'paid',
          shippingAddress: {
            city: 'Austin',
            state: 'TX'
          },
          trackingNumber: '1Z999AA1234567890',
          shippedAt: '2024-01-14T10:00:00Z',
          estimatedDelivery: '2024-01-16T17:00:00Z',
          source: 'online',
          processedBy: 'John Doe',
          fulfilledBy: 'Jane Smith',
          createdAt: '2024-01-13T14:30:00Z',
          updatedAt: '2024-01-14T10:00:00Z'
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          customer: {
            name: 'Mike Chen',
            phone: '(555) 987-6543'
          },
          status: 'processing',
          fulfillmentMethod: 'pickup',
          priority: 'high',
          itemCount: 1,
          uniqueItems: 1,
          subtotal: 24.99,
          discountTotal: 0,
          taxTotal: 2.00,
          shippingCost: 0,
          total: 26.99,
          paymentStatus: 'paid',
          source: 'in_store',
          processedBy: 'Alice Johnson',
          createdAt: '2024-01-15T09:15:00Z',
          updatedAt: '2024-01-15T09:15:00Z'
        }
      ])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'orderNumber',
      label: 'Order #',
      width: '130px',
      sortable: true,
      render: (order) => (
        <div>
          <div className="font-mono font-medium text-sm">{order.orderNumber}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {order.source.replace('_', ' ')}
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (order) => (
        <div>
          {order.customer ? (
            <>
              <div className="font-medium flex items-center">
                <User className="h-3 w-3 mr-1" />
                {order.customer.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {order.customer.phone}
              </div>
              {order.customer.email && (
                <div className="text-xs text-muted-foreground">
                  {order.customer.email}
                </div>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Guest checkout</span>
          )}
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      width: '100px',
      render: (order) => (
        <div className="text-sm">
          <div className="font-medium">{order.itemCount} items</div>
          <div className="text-muted-foreground">
            {order.uniqueItems} unique
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      sortable: true,
      render: (order) => {
        const Icon = statusIcons[order.status]
        return (
          <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}'}>
            <Icon className="h-3 w-3 mr-1" />
            {order.status}
          </span>
        )
      }
    },
    {
      key: 'fulfillment',
      label: 'Fulfillment',
      width: '140px',
      render: (order) => {
        const Icon = fulfillmentIcons[order.fulfillmentMethod]
        
        return (
          <div className="text-sm">
            <div className="flex items-center capitalize">
              <Icon className="h-3 w-3 mr-1" />
              {order.fulfillmentMethod.replace('_', ' ')}
            </div>
            {order.shippingAddress && (
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </div>
            )}
            {order.trackingNumber && (
              <div className="text-xs text-muted-foreground font-mono mt-1">
                {order.trackingNumber}
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'payment',
      label: 'Payment',
      width: '120px',
      render: (order) => (
        <div className="text-sm">
          <div className={'font-medium ${
            order.paymentStatus === 'paid' ? 'text-green-600' :
            order.paymentStatus === 'failed' ? 'text-red-600' :
            'text-orange-600'
              }'}>'
            {order.paymentStatus}
          </div>
          <div className="text-muted-foreground">
            ${order.total.toFixed(2)}
          </div>
        </div>
      )
    },
    {
      key: 'timing',
      label: 'Timeline',
      width: '140px',
      render: (order) => (
        <div className="text-sm">
          {order.shippedAt && (
            <div className="flex items-center">
              <Truck className="h-3 w-3 mr-1" />
              <span className="text-xs">Shipped {new Date(order.shippedAt).toLocaleDateString()}</span>
            </div>
          )}
          {order.estimatedDelivery && (
            <div className="flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              <span className="text-xs">ETA {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
            </div>
          )}
          {order.deliveredAt && (
            <div className="flex items-center text-green-600 mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span className="text-xs">Delivered {new Date(order.deliveredAt).toLocaleDateString()}</span>
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
      onClick: (orders: Order[]) => {
        console.log('View order details:', orders[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (orders: Order[]) => {
        console.log('Edit order:', orders[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Update Status',
      icon: Package,
      onClick: (selectedOrders: Order[]) => {
        console.log('Update status for orders:', selectedOrders)
      },
      variant: 'default' as const
    },
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedOrders: Order[]) => {
        console.log('Export orders:', selectedOrders)
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
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' }
      ],
      value: ',
      onChange: (value: string) => console.log('Status filter:', value)
    },
    {
      key: 'fulfillment',
      label: 'Fulfillment',
      type: 'select' as const,
      options: [
        { label: 'All Methods', value: ' },
        { label: 'Ship to Home', value: 'ship_to_home' },
        { label: 'In Store', value: 'in_store' },
        { label: 'Pickup', value: 'pickup' },
        { label: 'Curbside', value: 'curbside' },
        { label: 'Delivery', value: 'delivery' }
      ],
      value: ',
      onChange: (value: string) => console.log('Fulfillment filter:', value)
    }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Orders</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Manage customer orders and fulfillment
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="header" className="rounded-lg">
              Fulfillment Queue
            </Button>
            <Button variant="header" className="rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          
          // Enhanced Features
          viewModes={["table", "cards", "kanban"]}
          defaultView="table"
          showMetrics={true}
          
          // Field mappings for enhanced features
          titleField="orderNumber"
          clientField="customer"
          amountField="total"
          statusField="status"
          dueDateField="estimatedDelivery"
          
          // Status styling
          statusColors={{
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400",
            confirmed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400",
            processing: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-400",
            shipped: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-400",
            delivered: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400",
            cancelled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-400",
            returned: "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-900/50 dark:text-neutral-400"
          }}
          
          // Search and filtering
          searchable
          searchPlaceholder="Search orders, customers, or tracking numbers..."
          filters={filters}
          
          // Selection and actions
          selectable
          bulkActions={bulkActions}
          rowActions={rowActions}
          
          // Enhanced features
          enableCommandPalette={true}
          commandActions={[
            {
              label: 'Create New Order',
              icon: Plus,
              action: () => console.log('Create new order'),
              group: 'Actions'
            },
            {
              label: 'Fulfillment Queue',
              action: () => console.log('View fulfillment queue'),
              group: 'Operations'
            }
          ]}
          
          enableDetailSheet={true}
          
          onRowClick={(order) => {
            console.log('Navigate to order details:', order.id)
          }}
          
          onNewItem={() => console.log('Create new order')}
          
          // Pagination
          paginated
          emptyState={
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No orders found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Create your first order to start processing sales
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
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
