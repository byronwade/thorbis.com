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
  MoreVertical
} from 'lucide-react'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'


interface InventoryItem {
  id: string
  name: string
  description?: string
  category: string
  
  // Inventory tracking
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  
  // Cost tracking
  unitCost: number
  lastCost?: number
  averageCost?: number
  
  // Vendor information
  vendor?: string
  vendorSku?: string
  
  // Dates and expiration
  lastOrderedAt?: string
  lastReceivedAt?: string
  expirationDate?: string
  
  // Storage
  location: string
  storageTemp?: number
  
  // Usage tracking
  weeklyUsage: number
  monthlyUsage: number
  
  createdAt: string
  updatedAt: string
}

const categoryColors = {
  protein: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  produce: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  dairy: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  dry_goods: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  beverages: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  alcohol: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  supplies: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  const fetchInventoryItems = async () => {
    try {
      // Mock inventory data
      setItems([
        {
          id: '1',
          name: 'Ground Beef (80/20)',
          description: 'Fresh ground beef for burgers and tacos',
          category: 'protein',
          unit: 'lbs',
          currentStock: 25,
          minStock: 10,
          maxStock: 50,
          reorderPoint: 15,
          unitCost: 5.99,
          lastCost: 5.89,
          averageCost: 5.95,
          vendor: 'Food Distributors Inc',
          vendorSku: 'FDI-GB-80-20',
          location: 'Walk-in Cooler',
          storageTemp: 38,
          weeklyUsage: 20,
          monthlyUsage: 85,
          lastOrderedAt: '2024-01-10T10:00:00Z',
          lastReceivedAt: '2024-01-11T09:30:00Z',
          expirationDate: '2024-01-18T23:59:59Z',
          createdAt: '2023-01-01T10:00:00Z',
          updatedAt: '2024-01-11T09:30:00Z'
        },
        {
          id: '2',
          name: 'Romaine Lettuce',
          description: 'Fresh romaine hearts for salads',
          category: 'produce',
          unit: 'cases',
          currentStock: 3,
          minStock: 2,
          maxStock: 8,
          reorderPoint: 4,
          unitCost: 12.50,
          location: 'Walk-in Cooler',
          storageTemp: 35,
          weeklyUsage: 5,
          monthlyUsage: 22,
          vendor: 'Fresh Produce Co',
          lastReceivedAt: '2024-01-12T07:00:00Z',
          expirationDate: '2024-01-17T23:59:59Z',
          createdAt: '2023-01-01T10:00:00Z',
          updatedAt: '2024-01-12T07:00:00Z'
        }
      ])
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<InventoryItem>[] = [
    {
      key: 'name',
      label: 'Item',
      render: (item) => (
        <div>
          <div className="font-medium">{item.name}</div>
          {item.description && (
            <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
              {item.description}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryColors[item.category as keyof typeof categoryColors] || 'bg-neutral-100 text-neutral-800'
              }'}>'
              <Package className="h-3 w-3 mr-1" />
              {item.category.replace('_', ' ')}
            </span>
            <span className="text-xs text-muted-foreground">
              {item.location}
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
        const isLow = item.currentStock <= item.reorderPoint
        const percentage = (item.currentStock / item.maxStock) * 100
        
        return (
          <div className="text-sm">
            <div className={'font-medium ${isLow ? 'text-red-500' : 'text-green-600'
              }'}>'
              {item.currentStock} {item.unit}
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-1">
              <div 
                className={'h-2 rounded-full transition-all ${
                  isLow ? 'bg-red-500' : percentage < 50 ? 'bg-yellow-500' : 'bg-green-500`
              }`} '
                style={{ width: '${Math.min(percentage, 100)}%' }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Min: {item.minStock} · Max: {item.maxStock}
            </div>
            {isLow && (
              <div className="text-xs text-red-500 flex items-center mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Reorder needed
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'cost',
      label: 'Cost',
      width: '120px',
      align: 'right',
      sortable: true,
      render: (item) => (
        <div className="text-right text-sm">
          <div className="font-medium flex items-center justify-end">
            <DollarSign className="h-3 w-3" />
            {item.unitCost.toFixed(2)}
          </div>
          <div className="text-muted-foreground">per {item.unit}</div>
          {item.lastCost && item.lastCost !== item.unitCost && (
            <div className={'text-xs flex items-center justify-end mt-1 ${item.unitCost > item.lastCost ? 'text-red-500' : 'text-green-500'
              }'}>'
              {item.unitCost > item.lastCost ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(item.unitCost - item.lastCost).toFixed(2)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'usage',
      label: 'Usage',
      width: '120px',
      render: (item) => (
        <div className="text-sm">
          <div className="font-medium">{item.weeklyUsage} / week</div>
          <div className="text-muted-foreground">{item.monthlyUsage} / month</div>
        </div>
      )
    },
    {
      key: 'vendor',
      label: 'Vendor',
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
              {item.lastOrderedAt && (
                <div className="text-xs text-muted-foreground flex items-center mt-1">
                  <Truck className="h-3 w-3 mr-1" />
                  {new Date(item.lastOrderedAt).toLocaleDateString()}
                </div>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">No vendor</span>
          )}
        </div>
      )
    },
    {
      key: 'expiration',
      label: 'Expiration',
      width: '120px',
      sortable: true,
      render: (item) => {
        if (!item.expirationDate) return <span className="text-muted-foreground text-sm">N/A</span>
        
        const expirationDate = new Date(item.expirationDate)
        const isExpired = expirationDate < new Date()
        const isExpiringSoon = expirationDate < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
        
        return (
          <div className="text-sm">
            <div className={'flex items-center ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-orange-500' : '
              }'}>'
              <Calendar className="h-3 w-3 mr-1" />
              {expirationDate.toLocaleDateString()}
            </div>
            {isExpired && (
              <div className="text-xs text-red-500 mt-1">Expired</div>
            )}
            {!isExpired && isExpiringSoon && (
              <div className="text-xs text-orange-500 mt-1">Expires soon</div>
            )}
          </div>
        )
      }
    }
  ]

  const rowActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (items: InventoryItem[]) => {
        console.log('View inventory item:', items[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (items: InventoryItem[]) => {
        console.log('Edit inventory item:', items[0].id)
      }
    },
    {
      label: 'Reorder',
      icon: Truck,
      onClick: (items: InventoryItem[]) => {
        console.log('Reorder item:', items[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Create PO',
      icon: Truck,
      onClick: (selectedItems: InventoryItem[]) => {
        console.log('Create purchase order for:', selectedItems)
      },
      variant: 'default' as const
    },
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedItems: InventoryItem[]) => {
        console.log('Export items:', selectedItems)
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
        { label: 'Protein', value: 'protein' },
        { label: 'Produce', value: 'produce' },
        { label: 'Dairy', value: 'dairy' },
        { label: 'Dry Goods', value: 'dry_goods' },
        { label: 'Beverages', value: 'beverages' },
        { label: 'Alcohol', value: 'alcohol' },
        { label: 'Supplies', value: 'supplies' }
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
              Track stock levels and manage purchase orders
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
          searchPlaceholder="Search inventory items, vendors, or SKUs..."
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