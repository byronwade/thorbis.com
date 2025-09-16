import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  Truck,
  ScanLine,
  MoreVertical
} from 'lucide-react'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'


interface RetailInventoryItem {
  id: string
  name: string
  sku: string
  upc?: string
  category: string
  brand?: string
  
  // Inventory levels
  currentStock: number
  reservedStock: number
  availableStock: number
  reorderPoint: number
  reorderQuantity: number
  
  // Cost information
  costPrice: number
  sellingPrice: number
  margin: number
  
  // Vendor information
  vendor?: string
  vendorSku?: string
  
  // Movement tracking
  lastMovement: {
    type: string
    quantity: number
    date: string
  }
  
  // Sales metrics
  salesMetrics: {
    soldToday: number
    soldThisWeek: number
    soldThisMonth: number
    revenue: number
    turnoverRate: number
  }
  
  createdAt: string
  updatedAt: string
}

const categoryColors = {
  clothing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  electronics: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  home_garden: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  books: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  sports_outdoors: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  beauty_health: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
}

export default function RetailInventoryPage() {
  const [items, setItems] = useState<RetailInventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  const fetchInventoryItems = async () => {
    try {
      // Mock retail inventory data
      setItems([
        {
          id: '1',
          name: 'Wireless Bluetooth Headphones',
          sku: 'WBH-001',
          upc: '123456789012',
          category: 'electronics',
          brand: 'TechBrand',
          currentStock: 45,
          reservedStock: 3,
          availableStock: 42,
          reorderPoint: 10,
          reorderQuantity: 50,
          costPrice: 120.00,
          sellingPrice: 199.99,
          margin: 40.0,
          vendor: 'TechDistributors',
          vendorSku: 'TD-WBH-001',
          lastMovement: {
            type: 'sale',
            quantity: -2,
            date: '2024-01-15T14:30:00Z'
          },
          salesMetrics: {
            soldToday: 2,
            soldThisWeek: 12,
            soldThisMonth: 48,
            revenue: 9599.52,
            turnoverRate: 2.4
          },
          createdAt: '2023-08-01T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          name: 'Cotton T-Shirt - Basic',
          sku: 'CT-BASIC-001',
          category: 'clothing',
          brand: 'EcoWear',
          currentStock: 5,
          reservedStock: 2,
          availableStock: 3,
          reorderPoint: 20,
          reorderQuantity: 100,
          costPrice: 12.00,
          sellingPrice: 24.99,
          margin: 52.0,
          vendor: 'Apparel Supplies Co',
          lastMovement: {
            type: 'sale',
            quantity: -3,
            date: '2024-01-14T16:45:00Z'
          },
          salesMetrics: {
            soldToday: 0,
            soldThisWeek: 8,
            soldThisMonth: 35,
            revenue: 874.65,
            turnoverRate: 7.2
          },
          createdAt: '2023-03-15T10:00:00Z',
          updatedAt: '2024-01-14T16:45:00Z'
        }
      ])
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<RetailInventoryItem>[] = [
    {
      key: 'product',
      label: 'Product',
      render: (item) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-muted-foreground flex items-center">
            <ScanLine className="h-3 w-3 mr-1" />
            <span className="font-mono">{item.sku}</span>
          </div>
          {item.brand && (
            <div className="text-xs text-muted-foreground">{item.brand}</div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryColors[item.category as keyof typeof categoryColors] || 'bg-neutral-100 text-neutral-800'
              }'}>'
              <Package className="h-3 w-3 mr-1" />
              {item.category.replace('_', ' ')}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Stock Level',
      width: '140px',
      sortable: true,
      render: (item) => {
        const isLowStock = item.availableStock <= item.reorderPoint
        const percentage = (item.currentStock / (item.reorderPoint * 3)) * 100
        
        return (
          <div className="text-sm">
            <div className={'font-medium ${isLowStock ? 'text-red-500' : 'text-green-600'
              }'}>'
              {item.availableStock} available
            </div>
            <div className="text-muted-foreground">
              {item.currentStock} total · {item.reservedStock} reserved
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 mt-1">
              <div 
                className={'h-1.5 rounded-full transition-all ${
                  isLowStock ? 'bg-red-500' : percentage < 50 ? 'bg-yellow-500' : 'bg-green-500`
              }`} '
                style={{ width: '${Math.min(percentage, 100)}%' }}
              />
            </div>
            {isLowStock && (
              <div className="text-xs text-red-500 flex items-center mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Reorder at {item.reorderPoint}
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'pricing',
      label: 'Pricing',
      width: '140px',
      align: 'right',
      render: (item) => (
        <div className="text-right text-sm">
          <div className="font-medium flex items-center justify-end">
            <DollarSign className="h-3 w-3" />
            {item.sellingPrice.toFixed(2)}
          </div>
          <div className="text-muted-foreground">
            Cost: ${item.costPrice.toFixed(2)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {item.margin.toFixed(1)}% margin
          </div>
        </div>
      )
    },
    {
      key: 'sales',
      label: 'Sales',
      width: '120px',
      render: (item) => (
        <div className="text-sm">
          <div className="font-medium">{item.salesMetrics.soldThisMonth} / month</div>
          <div className="text-muted-foreground">{item.salesMetrics.soldThisWeek} this week</div>
          <div className="text-xs text-green-600 mt-1">
            ${item.salesMetrics.revenue.toFixed(0)} revenue
          </div>
        </div>
      )
    },
    {
      key: 'vendor',
      label: 'Supplier',
      width: '140px',
      render: (item) => (
        <div className="text-sm">
          {item.vendor ? (
            <>
              <div className="font-medium">{item.vendor}</div>
              {item.vendorSku && (
                <div className="text-muted-foreground font-mono text-xs">
                  {item.vendorSku}
                </div>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">No supplier</span>
          )}
        </div>
      )
    }
  ]

  const rowActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (items: RetailInventoryItem[]) => {
        console.log('View inventory item:', items[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (items: RetailInventoryItem[]) => {
        console.log('Edit inventory item:', items[0].id)
      }
    },
    {
      label: 'Reorder',
      icon: Truck,
      onClick: (items: RetailInventoryItem[]) => {
        console.log('Reorder item:', items[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Update Stock',
      icon: Package,
      onClick: (selectedItems: RetailInventoryItem[]) => {
        console.log('Update stock levels:', selectedItems)
      },
      variant: 'default' as const
    },
    {
      label: 'Create PO',
      icon: Truck,
      onClick: (selectedItems: RetailInventoryItem[]) => {
        console.log('Create purchase order:', selectedItems)
      },
      variant: 'outline' as const
    }
  ]

  const filters = [
    {
      key: 'category',
      label: 'Category',
      type: 'select' as const,
      options: [
        { label: 'All Categories', value: ' },
        { label: 'Clothing', value: 'clothing' },
        { label: 'Electronics', value: 'electronics' },
        { label: 'Home & Garden', value: 'home_garden' },
        { label: 'Books', value: 'books' },
        { label: 'Sports', value: 'sports_outdoors' }
      ],
      value: ',
      onChange: (value: string) => console.log('Category filter:', value)
    },
    {
      key: 'stock',
      label: 'Stock Level',
      type: 'select' as const,
      options: [
        { label: 'All Levels', value: ' },
        { label: 'Low Stock', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'Overstock', value: 'high' }
      ],
      value: ',
      onChange: (value: string) => console.log('Stock filter:', value)
    }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Inventory</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Track product stock levels and manage purchase orders
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="header" className="rounded-lg">
              <Truck className="h-4 w-4 mr-2" />
              Purchase Orders
            </Button>
            <Button variant="header" className="rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <DataTable
          data={items}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search inventory by name, SKU, UPC, or vendor..."
          selectable
          bulkActions={bulkActions}
          rowActions={rowActions}
          filters={filters}
          onRowClick={(item) => {
            console.log('Navigate to inventory item details:', item.id)
          }}
          paginated
          emptyState={
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No inventory items found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Add your first inventory item to start tracking stock levels
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
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
