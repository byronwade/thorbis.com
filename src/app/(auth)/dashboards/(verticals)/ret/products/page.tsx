import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  Package,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Circle,
  Tag,
  Image,
  MoreVertical
} from 'lucide-react'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'


interface Product {
  id: string
  name: string
  description?: string
  sku: string
  upc?: string
  
  // Categorization
  category: string
  subcategory?: string
  brand?: string
  
  // Pricing
  price: number
  compareAtPrice?: number
  costPrice?: number
  
  // Inventory
  currentStock: number
  reservedStock: number
  availableStock: number
  reorderPoint: number
  
  // Status
  status: 'active' | 'inactive' | 'discontinued' | 'out_of_stock'
  
  // Media
  images: Array<{
    url: string
    alt: string
  }>
  
  // Variants
  hasVariants: boolean
  variantCount?: number
  
  // Sales metrics
  salesMetrics: {
    soldToday: number
    soldThisWeek: number
    soldThisMonth: number
    revenue: number
    profitMargin: number
  }
  
  createdAt: string
  updatedAt: string
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  discontinued: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  out_of_stock: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

const statusIcons = {
  active: CheckCircle,
  inactive: Circle,
  discontinued: AlertTriangle,
  out_of_stock: AlertTriangle
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Mock product data
      setProducts([
        {
          id: '1',
          name: 'Wireless Bluetooth Headphones',
          description: 'Premium over-ear headphones with active noise cancellation',
          sku: 'WBH-001',
          upc: '123456789012',
          category: 'electronics',
          subcategory: 'audio',
          brand: 'TechBrand',
          price: 199.99,
          compareAtPrice: 249.99,
          costPrice: 120.00,
          currentStock: 45,
          reservedStock: 3,
          availableStock: 42,
          reorderPoint: 10,
          status: 'active',
          images: [],
          hasVariants: true,
          variantCount: 3,
          salesMetrics: {
            soldToday: 2,
            soldThisWeek: 12,
            soldThisMonth: 48,
            revenue: 9599.52,
            profitMargin: 40
          },
          createdAt: '2023-06-01T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Cotton T-Shirt',
          description: '100% organic cotton t-shirt in various colors',
          sku: 'CT-100',
          category: 'clothing',
          brand: 'EcoWear',
          price: 24.99,
          costPrice: 12.00,
          currentStock: 5,
          reservedStock: 2,
          availableStock: 3,
          reorderPoint: 20,
          status: 'out_of_stock',
          images: [],
          hasVariants: true,
          variantCount: 8,
          salesMetrics: {
            soldToday: 0,
            soldThisWeek: 5,
            soldThisMonth: 32,
            revenue: 799.68,
            profitMargin: 52
          },
          createdAt: '2023-03-15T10:00:00Z',
          updatedAt: '2024-01-14T10:00:00Z'
        }
      ])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'product',
      label: 'Product',
      render: (product) => (
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center flex-shrink-0">
            {product.images.length > 0 ? (
              <img 
                src={product.images[0].url} 
                alt={product.images[0].alt} 
                className="w-full h-full object-cover rounded-lg" 
              />
            ) : (
              <Package className="h-6 w-6 text-neutral-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium">{product.name}</div>
            {product.description && (
              <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                {product.description}
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground font-mono">
                SKU: {product.sku}
              </span>
              {product.brand && (
                <span className="text-xs text-muted-foreground">
                  {product.brand}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      width: '120px',
      render: (product) => (
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Tag className="h-3 w-3 mr-1" />
            {product.category}
          </span>
          {product.subcategory && (
            <div className="text-xs text-muted-foreground mt-1">
              {product.subcategory}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'pricing',
      label: 'Pricing',
      width: '140px',
      align: 'right',
      render: (product) => (
        <div className="text-right text-sm">
          <div className="font-medium flex items-center justify-end">
            <DollarSign className="h-3 w-3" />
            {product.price.toFixed(2)}
          </div>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <div className="text-xs text-muted-foreground line-through">
              ${product.compareAtPrice.toFixed(2)}
            </div>
          )}
          {product.costPrice && (
            <div className="text-xs text-muted-foreground">
              Cost: ${product.costPrice.toFixed(2)}
            </div>
          )}
          <div className="text-xs text-green-600 mt-1">
            {product.salesMetrics.profitMargin}% margin
          </div>
        </div>
      )
    },
    {
      key: 'inventory',
      label: 'Stock',
      width: '120px',
      render: (product) => {
        const isLowStock = product.availableStock <= product.reorderPoint
        
        return (
          <div className="text-sm">
            <div className={'font-medium ${isLowStock ? 'text-red-500' : 'text-green-600'
              }'}>'
              {product.availableStock} available
            </div>
            <div className="text-muted-foreground">
              {product.currentStock} total
            </div>
            {product.reservedStock > 0 && (
              <div className="text-xs text-muted-foreground">
                {product.reservedStock} reserved
              </div>
            )}
            {isLowStock && (
              <div className="text-xs text-red-500 flex items-center mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low stock
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (product) => {
        const Icon = statusIcons[product.status]
        return (
          <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[product.status]}'}>
            <Icon className="h-3 w-3 mr-1" />
            {product.status.replace('_', ' ')}
          </span>
        )
      }
    },
    {
      key: 'sales',
      label: 'Sales',
      width: '120px',
      render: (product) => (
        <div className="text-sm">
          <div className="flex items-center">
            <BarChart3 className="h-3 w-3 mr-1" />
            <span>{product.salesMetrics.soldThisMonth} this month</span>
          </div>
          <div className="text-muted-foreground">
            {product.salesMetrics.soldThisWeek} this week
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Revenue: ${product.salesMetrics.revenue.toLocaleString()}
          </div>
        </div>
      )
    }
  ]

  const rowActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (products: Product[]) => {
        console.log('View product details:', products[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (products: Product[]) => {
        console.log('Edit product:', products[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Update Prices',
      icon: DollarSign,
      onClick: (selectedProducts: Product[]) => {
        console.log('Update prices:', selectedProducts)
      },
      variant: 'default' as const
    },
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedProducts: Product[]) => {
        console.log('Export products:', selectedProducts)
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
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All Status', value: ' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Discontinued', value: 'discontinued' },
        { label: 'Out of Stock', value: 'out_of_stock' }
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
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Products</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Manage product catalog, pricing, and inventory
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="header" className="rounded-lg">
              Categories
            </Button>
            <Button variant="header" className="rounded-lg">
              Import
            </Button>
            <Button variant="header" className="rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <DataTable
          data={products}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search products by name, SKU, brand, or category..."
          selectable
          bulkActions={bulkActions}
          rowActions={rowActions}
          filters={filters}
          onRowClick={(product) => {
            console.log('Navigate to product details:', product.id)
          }}
          paginated
          emptyState={
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No products found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Add your first product to start building your catalog
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
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
