import { Button } from '@/components/ui/button';
import { InlineConfirmBar } from '@/components/ui';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  Search,
  Filter,
  MoreVertical,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  Building2,
  Wrench,
  Settings,
  ShoppingCart,
  Download,
  Upload,
  BarChart3,
  Scan,
  RefreshCw,
  Archive,
  Copy,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Star,
  Tag,
  Database,
  FileText
} from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'


interface InventoryItem {
  id: string
  sku: string
  name: string
  description: string
  category: 'hvac' | 'plumbing' | 'electrical' | 'appliance' | 'tools' | 'consumable' | 'safety'
  subcategory: string
  
  // Inventory tracking
  currentStock: number
  reservedStock: number
  availableStock: number
  minStockLevel: number
  maxStockLevel: number
  reorderPoint: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | 'on_order'
  
  // Pricing
  costPrice: number
  sellPrice: number
  markup: number
  discountPrice?: number
  
  // Physical details
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  
  // Location tracking
  warehouseLocation?: string
  binLocation?: string
  truckInventory: Array<{
    truckId: string
    truckName: string
    quantity: number
    technician: string
  }>
  
  // Supplier information
  primarySupplier: {
    id: string
    name: string
    contact: string
    leadTime: number
  }
  alternateSuppliers?: Array<{
    id: string
    name: string
    contact: string
    leadTime: number
    price: number
  }>
  
  // Usage tracking
  monthlyUsage: number
  yearlyUsage: number
  lastOrderDate?: string
  lastUsedDate?: string
  
  // Quality & compliance
  brand: string
  model?: string
  warrantyPeriod?: number
  certifications?: string[]
  hazardous: boolean
  
  // Digital tracking
  barcodeUpc?: string
  qrCode?: string
  images: Array<{
    id: string
    url: string
    description: string
  }>
  
  // Purchase orders
  openPurchaseOrders?: Array<{
    poNumber: string
    quantity: number
    expectedDate: string
    supplier: string
  }>
  
  createdAt: string
  updatedAt: string
  createdBy: string
}

const statusColors = {
  in_stock: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  low_stock: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  out_of_stock: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  discontinued: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  on_order: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
}

const statusIcons = {
  in_stock: CheckCircle,
  low_stock: AlertTriangle,
  out_of_stock: AlertTriangle,
  discontinued: Archive,
  on_order: Clock
}

const categoryColors = {
  hvac: 'bg-blue-500',
  plumbing: 'bg-cyan-500',
  electrical: 'bg-yellow-500',
  appliance: 'bg-green-500',
  tools: 'bg-orange-500',
  consumable: 'bg-purple-500',
  safety: 'bg-red-500'
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>(')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      // Generate comprehensive mock inventory data
      const mockInventory: InventoryItem[] = Array.from({ length: 200 }, (_, i) => {
        const categories: InventoryItem['category'][] = ['hvac', 'plumbing', 'electrical', 'appliance', 'tools', 'consumable', 'safety']
        const statuses: InventoryItem['status'][] = ['in_stock', 'low_stock', 'out_of_stock', 'discontinued', 'on_order']
        
        const category = categories[i % categories.length]
        const status = statuses[i % statuses.length]
        
        // Category-specific items
        const itemsByCategory = {
          hvac: ['Air Filter', 'Compressor', 'Condenser Coil', 'Thermostat', 'Ductwork', 'Refrigerant R410A', 'Blower Motor', 'Heat Exchanger'],
          plumbing: ['Copper Pipe', 'PVC Fitting', 'Water Heater', 'Faucet', 'Toilet', 'Drain Snake', 'Pipe Wrench', 'Solder'],
          electrical: ['Wire Nuts', 'Circuit Breaker', 'Electrical Wire', 'Outlet', 'Light Switch', 'Conduit', 'Junction Box', 'Multimeter'],
          appliance: ['Dishwasher Parts', 'Refrigerator Coil', 'Washer Belt', 'Dryer Vent', 'Oven Element', 'Garbage Disposal'],
          tools: ['Drill Bits', 'Screwdriver Set', 'Socket Wrench', 'Level', 'Tape Measure', 'Safety Goggles', 'Work Gloves'],
          consumable: ['Screws', 'Washers', 'Tape', 'Grease', 'Cleaning Solution', 'Lubricant', 'Sealant'],
          safety: ['Hard Hat', 'Safety Vest', 'First Aid Kit', 'Fire Extinguisher', 'Safety Boots', 'Respirator Mask']
        }
        
        const brands = ['Carrier', 'Trane', 'Lennox', 'Rheem', 'Goodman', 'American Standard', 'York', 'Bryant', 'Daikin', 'Mitsubishi']
        
        const itemName = itemsByCategory[category][i % itemsByCategory[category].length]
        const brand = brands[i % brands.length]
        const currentStock = Math.floor(Math.random() * 500) + 10
        const minStock = Math.floor(currentStock * 0.2)
        const maxStock = Math.floor(currentStock * 2)
        const costPrice = Math.floor(Math.random() * 500) + 25
        const markup = 30 + Math.random() * 50 // 30-80% markup
        const sellPrice = Math.floor(costPrice * (1 + markup / 100))
        
        return {
          id: 'inv-${i + 1}',
          sku: '${category.toUpperCase().slice(0,2)}${String(i + 1).padStart(4, '0')}`,
          name: `${brand} ${itemName}',
          description: 'Professional grade ${itemName.toLowerCase()} for ${category} applications. High quality and reliable performance.',
          category,
          subcategory: itemsByCategory[category][i % itemsByCategory[category].length],
          
          currentStock,
          reservedStock: Math.floor(Math.random() * 20),
          availableStock: currentStock - Math.floor(Math.random() * 20),
          minStockLevel: minStock,
          maxStockLevel: maxStock,
          reorderPoint: minStock + Math.floor(Math.random() * 10),
          status: currentStock <= minStock ? 'low_stock' : 
                  currentStock === 0 ? 'out_of_stock' : 
                  i % 15 === 0 ? 'on_order' :
                  i % 20 === 0 ? 'discontinued' : 'in_stock`,
          
          costPrice,
          sellPrice,
          markup: Math.floor(markup),
          discountPrice: i % 8 === 0 ? Math.floor(sellPrice * 0.9) : undefined,
          
          weight: Math.floor(Math.random() * 50) + 1,
          dimensions: {
            length: Math.floor(Math.random() * 24) + 6,
            width: Math.floor(Math.random() * 12) + 4,
            height: Math.floor(Math.random() * 8) + 2
          },
          
          warehouseLocation: `Aisle ${String.fromCharCode(65 + (i % 10))}-${Math.floor(i / 10) + 1}`,
          binLocation: `${String.fromCharCode(65 + (i % 5))}${Math.floor(Math.random() * 20) + 1}`,
          truckInventory: i % 4 === 0 ? [
            {
              truckId: `truck-${(i % 8) + 1}',
              truckName: 'Service Truck ${(i % 8) + 1}',
              quantity: Math.floor(Math.random() * 5) + 1,
              technician: ['Mike Tech', 'Sarah Service', 'Tom Repair', 'Amy Fix'][i % 4]
            }
          ] : [],
          
          primarySupplier: {
            id: 'supplier-${(i % 12) + 1}',
            name: ['ABC Supply', 'Home Depot Pro', 'Ferguson', 'Grainger', 'McMaster-Carr', 'Johnstone Supply`][i % 6],
            contact: `supplier${(i % 12) + 1}@company.com',
            leadTime: Math.floor(Math.random() * 14) + 3
          },
          
          monthlyUsage: Math.floor(Math.random() * 50) + 5,
          yearlyUsage: Math.floor(Math.random() * 500) + 60,
          lastOrderDate: i % 3 === 0 ? new Date(Date.now() - (Math.random() * 60 * 24 * 60 * 60 * 1000)).toISOString() : undefined,
          lastUsedDate: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
          
          brand,
          model: 'Model-${i + 100}',
          warrantyPeriod: Math.floor(Math.random() * 24) + 12, // 12-36 months
          certifications: i % 3 === 0 ? ['UL Listed', 'Energy Star'] : undefined,
          hazardous: category === 'safety` || i % 25 === 0,
          
          barcodeUpc: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
          qrCode: `QR${i + 1}${Math.floor(Math.random() * 1000)}`,
          images: [{
            id: `img-${i}-1',
            url: '/inventory/images/${i + 1}.jpg',
            description: 'Product image'
          }],
          
          openPurchaseOrders: status === 'on_order' ? [{
            poNumber: 'PO-2024-${String(i + 1).padStart(4, '0')}',
            quantity: Math.floor(Math.random() * 100) + 50,
            expectedDate: new Date(Date.now() + (Math.random() * 21 * 24 * 60 * 60 * 1000)).toISOString(),
            supplier: ['ABC Supply', 'Ferguson', 'Grainger'][i % 3]
          }] : undefined,
          
          createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
          updatedAt: new Date(Date.now() - (Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
          createdBy: 'System'
        }
      })
      
      setInventory(mockInventory)
    } catch (error) {
      console.error('Error generating inventory:', error)
      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = (action: string) => {
    setBulkAction(action)
    setShowBulkActions(true)
  }

  const confirmBulkAction = () => {
    console.log('Performing ${bulkAction} on items:', selectedRows)
    setShowBulkActions(false)
    setSelectedRows([])
    setBulkAction(')
  }

  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      width: '120px',
      render: (item: unknown) => (
        <div>
          <div className="font-mono font-medium text-sm text-blue-400">{item.sku}</div>
          <div className="text-xs text-neutral-400">{item.category.toUpperCase()}</div>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Item Details',
      render: (item: unknown) => (
        <div className="flex items-center gap-3">
          <div className={'h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${categoryColors[item.category as keyof typeof categoryColors]}'}>
            <Package className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-white">{item.name}</div>
            <div className="text-sm text-neutral-400">{item.brand} - {item.model}</div>
            <div className="text-xs text-neutral-500 mt-1 line-clamp-1">{item.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Stock Levels',
      width: '140px',
      render: (item: unknown) => (
        <div className="text-sm">
          <div className="font-medium text-white">
            {item.availableStock} / {item.currentStock}
          </div>
          <div className="text-xs text-neutral-400">
            Min: {item.minStockLevel} | Max: {item.maxStockLevel}
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Reserved: {item.reservedStock}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (item: unknown) => {
        const Icon = statusIcons[item.status as keyof typeof statusIcons]
        return (
          <div>
            <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status as keyof typeof statusColors]}'}>
              <Icon className="h-3 w-3 mr-1" />
              {item.status.replace('_', ' ')}
            </span>
            {item.currentStock <= item.minStockLevel && (
              <div className="text-xs text-orange-400 mt-1">Reorder needed</div>
            )}
          </div>
        )
      }
    },
    {
      key: 'location',
      label: 'Location',
      width: '120px',
      render: (item: unknown) => (
        <div className="text-sm">
          <div className="text-white">{item.warehouseLocation}</div>
          <div className="text-neutral-400">Bin: {item.binLocation}</div>
          {item.truckInventory.length > 0 && (
            <div className="text-xs text-blue-400 mt-1 flex items-center">
              <Truck className="h-3 w-3 mr-1" />
              {item.truckInventory.length} truck{item.truckInventory.length > 1 ? 's' : '}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'pricing',
      label: 'Pricing',
      width: '120px',
      align: 'right',
      render: (item: unknown) => (
        <div className="text-right text-sm">
          <div className="font-medium text-white">
            ${item.sellPrice.toLocaleString()}
          </div>
          <div className="text-neutral-400">
            Cost: ${item.costPrice.toLocaleString()}
          </div>
          <div className="text-xs text-green-400">
            {item.markup}% markup
          </div>
        </div>
      )
    },
    {
      key: 'supplier',
      label: 'Supplier',
      width: '140px',
      render: (item: unknown) => (
        <div className="text-sm">
          <div className="text-white">{item.primarySupplier.name}</div>
          <div className="text-neutral-400">{item.primarySupplier.leadTime} day lead</div>
          {item.openPurchaseOrders && item.openPurchaseOrders.length > 0 && (
            <div className="text-xs text-blue-400 mt-1">
              PO: {item.openPurchaseOrders[0].poNumber}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'usage',
      label: 'Usage',
      width: '100px',
      render: (item: unknown) => (
        <div className="text-sm">
          <div className="text-white">{item.monthlyUsage}/mo</div>
          <div className="text-neutral-400">{item.yearlyUsage}/yr</div>
        </div>
      )
    }
  ]

  const bulkActions = [
    {
      label: 'Update Stock',
      icon: RefreshCw,
      onClick: () => handleBulkAction('update_stock'),
      variant: 'default' as const
    },
    {
      label: 'Create PO',
      icon: ShoppingCart,
      onClick: () => handleBulkAction('create_po'),
      variant: 'outline' as const
    },
    {
      label: 'Print Labels',
      icon: Tag,
      onClick: () => handleBulkAction('print_labels'),
      variant: 'outline' as const
    },
    {
      label: 'Export',
      icon: Download,
      onClick: () => handleBulkAction('export'),
      variant: 'outline' as const
    },
    {
      label: 'Archive',
      icon: Archive,
      onClick: () => handleBulkAction('archive'),
      variant: 'outline' as const,
      destructive: true
    }
  ]

  const rowActions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (items: InventoryItem[]) => {
        console.log('View item:', items[0].id)
      }
    },
    {
      label: 'Edit Item',
      icon: Edit,
      onClick: (items: InventoryItem[]) => {
        console.log('Edit item:', items[0].id)
      }
    },
    {
      label: 'Adjust Stock',
      icon: RefreshCw,
      onClick: (items: InventoryItem[]) => {
        console.log('Adjust stock:', items[0].id)
      }
    }
  ]

  const filters = [
    {
      key: 'category',
      label: 'Category',
      type: 'select' as const,
      options: [
        { label: 'All Categories', value: ' },
        { label: 'HVAC', value: 'hvac' },
        { label: 'Plumbing', value: 'plumbing' },
        { label: 'Electrical', value: 'electrical' },
        { label: 'Appliance', value: 'appliance' },
        { label: 'Tools', value: 'tools' },
        { label: 'Consumable', value: 'consumable' },
        { label: 'Safety', value: 'safety' }
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
        { label: 'In Stock', value: 'in_stock' },
        { label: 'Low Stock', value: 'low_stock' },
        { label: 'Out of Stock', value: 'out_of_stock' },
        { label: 'On Order', value: 'on_order' },
        { label: 'Discontinued', value: 'discontinued' }
      ],
      value: ',
      onChange: (value: string) => console.log('Status filter:', value)
    }
  ]

  // Inventory Statistics
  const totalItems = inventory.length
  const inStockItems = inventory.filter(i => i.status === 'in_stock').length
  const lowStockItems = inventory.filter(i => i.status === 'low_stock').length
  const outOfStockItems = inventory.filter(i => i.status === 'out_of_stock').length
  const onOrderItems = inventory.filter(i => i.status === 'on_order').length
  const totalValue = inventory.reduce((sum, i) => sum + (i.currentStock * i.costPrice), 0)
  const reorderNeeded = inventory.filter(i => i.currentStock <= i.reorderPoint).length

  return (
    <div className="flex flex-col min-h-screen">
      <InlineConfirmBar
        isOpen={showBulkActions}
        title={'${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1).replace('_', ' ')} Items'}
        description={'${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1).replace('_', ' ')} ${selectedRows.length} selected item${selectedRows.length > 1 ? 's' : '}?'}
        confirmText="Confirm"
        onConfirm={confirmBulkAction}
        onCancel={() => setShowBulkActions(false)}
      />
      
      {/* Header with Stats */}
      <div className="border-b border-neutral-800 bg-neutral-925">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Inventory & Supply Management</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Track parts, materials, and supplies across warehouses and service vehicles
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Scan className="h-4 w-4 mr-2" />
                Scan Barcode
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Inventory Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/10 rounded-lg p-2">
                  <Package className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Total Items</p>
                  <p className="text-lg font-semibold text-white">{totalItems}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/10 rounded-lg p-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">In Stock</p>
                  <p className="text-lg font-semibold text-white">{inStockItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-600/10 rounded-lg p-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Low Stock</p>
                  <p className="text-lg font-semibold text-white">{lowStockItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-600/10 rounded-lg p-2">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Out of Stock</p>
                  <p className="text-lg font-semibold text-white">{outOfStockItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600/10 rounded-lg p-2">
                  <ShoppingCart className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Need Reorder</p>
                  <p className="text-lg font-semibold text-white">{reorderNeeded}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/10 rounded-lg p-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Total Value</p>
                  <p className="text-lg font-semibold text-white">${totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="bg-neutral-925 rounded-lg border border-neutral-800 h-full">
          {(DataTable as any)({
            data: inventory,
            columns: columns,
            searchable: false,
            className: "h-full"
          })}
        </div>
      </div>
    </div>
  )
}