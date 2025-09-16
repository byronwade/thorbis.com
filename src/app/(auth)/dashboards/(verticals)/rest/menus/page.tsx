import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  DollarSign,
  Clock,
  Star,
  Utensils,
  AlertTriangle,
  CheckCircle,
  Circle,
  Image,
  MoreVertical
} from 'lucide-react'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'


interface MenuItem {
  id: string
  name: string
  description?: string
  category: string
  price: number
  
  // Availability
  available: boolean
  availableFrom?: string
  availableUntil?: string
  
  // Dietary and nutrition
  ingredients: string[]
  allergens: string[]
  dietary: string[]
  calories?: number
  spiceLevel: number
  
  // Kitchen info
  prepTime: number
  station?: string
  
  // Media
  image?: string
  
  // Cost and profitability
  foodCost?: number
  costPercentage?: number
  
  // Popularity metrics
  ordersToday: number
  ordersThisWeek: number
  averageRating: number
  
  createdAt: string
  updatedAt: string
}

const categoryColors = {
  appetizers: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  salads: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  soups: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  entrees: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  desserts: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  beverages: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
}

export default function MenusPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:3000/data/api/rest/menu-items?count=50')
      const result = await response.json()
      setMenuItems(result.data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<MenuItem>[] = [
    {
      key: 'name',
      label: 'Item',
      render: (item) => (
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center flex-shrink-0">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Utensils className="h-6 w-6 text-neutral-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium">{item.name}</div>
            {item.description && (
              <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                {item.description}
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className={'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryColors[item.category as keyof typeof categoryColors] || 'bg-neutral-100 text-neutral-800'
              }'}>'
                {item.category}
              </span>
              {item.dietary.length > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  {item.dietary.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      width: '100px',
      align: 'right',
      sortable: true,
      render: (item) => (
        <div className="text-right">
          <div className="font-medium flex items-center justify-end">
            <DollarSign className="h-3 w-3" />
            {item.price.toFixed(2)}
          </div>
          {item.costPercentage && (
            <div className="text-xs text-muted-foreground">
              {item.costPercentage}% cost
            </div>
          )}
        </div>
      )
    },
    {
      key: 'kitchen',
      label: 'Kitchen',
      width: '120px',
      render: (item) => (
        <div className="text-sm">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {item.prepTime}m prep
          </div>
          {item.station && (
            <div className="text-muted-foreground capitalize">
              {item.station} station
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Spice: {item.spiceLevel}/5
          </div>
        </div>
      )
    },
    {
      key: 'availability',
      label: 'Status',
      width: '100px',
      render: (item) => (
        <div className="text-sm">
          {item.available ? (
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              Available
            </div>
          ) : (
            <div className="flex items-center text-red-500">
              <Circle className="h-4 w-4 mr-1" />
              Unavailable
            </div>
          )}
          {item.allergens.length > 0 && (
            <div className="text-xs text-orange-500 mt-1">
              <AlertTriangle className="h-3 w-3 mr-1 inline" />
              Allergens
            </div>
          )}
        </div>
      )
    },
    {
      key: 'popularity',
      label: 'Orders',
      width: '120px',
      sortable: true,
      render: (item) => (
        <div className="text-sm">
          <div className="font-medium">{item.ordersToday} today</div>
          <div className="text-muted-foreground">{item.ordersThisWeek} this week</div>
          <div className="flex items-center text-xs mt-1">
            <Star className="h-3 w-3 mr-1 text-yellow-500" />
            {item.averageRating.toFixed(1)}
          </div>
        </div>
      )
    }
  ]

  const rowActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (items: MenuItem[]) => {
        console.log('View menu item:', items[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (items: MenuItem[]) => {
        console.log('Edit menu item:', items[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Set Available',
      icon: CheckCircle,
      onClick: (selectedItems: MenuItem[]) => {
        console.log('Set available:', selectedItems)
      },
      variant: 'default' as const
    },
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedItems: MenuItem[]) => {
        console.log('Export menu items:', selectedItems)
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
        { label: 'Appetizers', value: 'appetizers' },
        { label: 'Salads', value: 'salads' },
        { label: 'Soups', value: 'soups' },
        { label: 'Entrees', value: 'entrees' },
        { label: 'Desserts', value: 'desserts' },
        { label: 'Beverages', value: 'beverages' }
      ],
      value: ',
      onChange: (value: string) => console.log('Category filter:', value)
    },
    {
      key: 'availability',
      label: 'Availability',
      type: 'select' as const,
      options: [
        { label: 'All Items', value: ' },
        { label: 'Available', value: 'true' },
        { label: 'Unavailable', value: 'false' }
      ],
      value: ',
      onChange: (value: string) => console.log('Availability filter:', value)
    }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Menu Management</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Manage menu items, pricing, and availability
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="header" className="rounded-lg">
              Categories
            </Button>
            <Button variant="header" className="rounded-lg">
              Print Menu
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
          data={menuItems}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search menu items, ingredients, or categories..."
          selectable
          bulkActions={bulkActions}
          rowActions={rowActions}
          filters={filters}
          onRowClick={(item) => {
            console.log('Navigate to menu item details:', item.id)
          }}
          paginated
          emptyState={
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No menu items found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Add your first menu item to start building your restaurant menu
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
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