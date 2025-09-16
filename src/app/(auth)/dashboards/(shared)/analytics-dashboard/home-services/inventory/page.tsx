"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  DollarSign,
  Activity,
  Timer,
  Target,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  RefreshCw,
  ShoppingCart,
  Truck,
  Building,
  Calendar,
  Hash,
  Zap
} from 'lucide-react'

interface InventoryMetric {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface InventoryItem {
  id: string
  name: string
  category: string
  sku: string
  currentStock: number
  reorderPoint: number
  maxStock: number
  unitCost: number
  totalValue: number
  supplier: string
  lastOrdered: string
  usage30Days: number
  turnoverRate: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock'
}

interface CategoryUsage {
  category: string
  items: number
  totalValue: number
  monthlyUsage: number
  turnover: number
  trend: string
  color: string
}

const inventoryMetrics: InventoryMetric[] = [
  {
    id: 'total-items',
    title: 'Total Inventory Items',
    value: 342,
    change: '+18',
    trend: 'up',
    icon: Package,
    color: 'text-blue-400'
  },
  {
    id: 'inventory-value',
    title: 'Total Inventory Value',
    value: '$125,340',
    change: '+8.2%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-400'
  },
  {
    id: 'turnover-rate',
    title: 'Avg Turnover Rate',
    value: '4.2x',
    change: '+0.3x',
    trend: 'up',
    icon: RefreshCw,
    color: 'text-purple-400'
  },
  {
    id: 'low-stock-items',
    title: 'Low Stock Alerts',
    value: 23,
    change: '+5',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-orange-400'
  },
  {
    id: 'monthly-usage',
    title: 'Monthly Usage Value',
    value: '$32,450',
    change: '+12%',
    trend: 'up',
    icon: Activity,
    color: 'text-yellow-400'
  },
  {
    id: 'stock-efficiency',
    title: 'Stock Efficiency',
    value: '87%',
    change: '+4%',
    trend: 'up',
    icon: Target,
    color: 'text-emerald-400'
  }
]

const inventoryItems: InventoryItem[] = [
  {
    id: 'hvac-filter-001',
    name: 'HVAC Air Filter 16x25x1',
    category: 'HVAC Parts',
    sku: 'HVF-16251',
    currentStock: 45,
    reorderPoint: 20,
    maxStock: 100,
    unitCost: 12.50,
    totalValue: 562.50,
    supplier: 'HVAC Supply Co.',
    lastOrdered: '2024-02-15',
    usage30Days: 28,
    turnoverRate: 6.8,
    status: 'in-stock'
  },
  {
    id: 'plumb-pipe-001',
    name: '1/2" Copper Pipe (10ft)',
    category: 'Plumbing Parts',
    sku: 'PLB-CP510',
    currentStock: 8,
    reorderPoint: 15,
    maxStock: 50,
    unitCost: 24.75,
    totalValue: 198.00,
    supplier: 'Metro Plumbing Supply',
    lastOrdered: '2024-01-28',
    usage30Days: 22,
    turnoverRate: 8.2,
    status: 'low-stock'
  },
  {
    id: 'elec-wire-001',
    name: '12 AWG THHN Wire (100ft)',
    category: 'Electrical Parts',
    sku: 'ELC-THN12',
    currentStock: 0,
    reorderPoint: 10,
    maxStock: 25,
    unitCost: 89.99,
    totalValue: 0,
    supplier: 'Electrical Depot',
    lastOrdered: '2024-02-01',
    usage30Days: 12,
    turnoverRate: 4.8,
    status: 'out-of-stock'
  },
  {
    id: 'hvac-thermostat-001',
    name: 'Programmable Thermostat',
    category: 'HVAC Parts',
    sku: 'HVT-PGM001',
    currentStock: 12,
    reorderPoint: 5,
    maxStock: 20,
    unitCost: 145.00,
    totalValue: 1740.00,
    supplier: 'Climate Control Inc.',
    lastOrdered: '2024-02-20',
    usage30Days: 8,
    turnoverRate: 3.2,
    status: 'in-stock'
  },
  {
    id: 'plumb-valve-001',
    name: 'Ball Valve 3/4"',
    category: 'Plumbing Parts',
    sku: 'PLB-BV34',
    currentStock: 35,
    reorderPoint: 12,
    maxStock: 30,
    unitCost: 18.50,
    totalValue: 647.50,
    supplier: 'Metro Plumbing Supply',
    lastOrdered: '2024-02-10',
    usage30Days: 15,
    turnoverRate: 5.1,
    status: 'overstock'
  }
]

const categoryUsage: CategoryUsage[] = [
  {
    category: 'HVAC Parts',
    items: 124,
    totalValue: 45680,
    monthlyUsage: 12340,
    turnover: 5.2,
    trend: '+15%',
    color: 'bg-blue-500'
  },
  {
    category: 'Plumbing Parts',
    items: 98,
    totalValue: 28450,
    monthlyUsage: 8920,
    turnover: 6.8,
    trend: '+8%',
    color: 'bg-purple-500'
  },
  {
    category: 'Electrical Parts',
    items: 87,
    totalValue: 34250,
    monthlyUsage: 7890,
    turnover: 4.1,
    trend: '+22%',
    color: 'bg-yellow-500'
  },
  {
    category: 'General Tools',
    items: 33,
    totalValue: 16960,
    monthlyUsage: 3300,
    turnover: 2.8,
    trend: '+5%',
    color: 'bg-green-500'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in-stock': return 'bg-green-500'
    case 'low-stock': return 'bg-orange-500'
    case 'out-of-stock': return 'bg-red-500'
    case 'overstock': return 'bg-blue-500'
    default: return 'bg-neutral-500'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'in-stock': return 'In Stock'
    case 'low-stock': return 'Low Stock'
    case 'out-of-stock': return 'Out of Stock'
    case 'overstock': return 'Overstock'
    default: return 'Unknown'
  }
}

const getStockLevel = (current: number, reorder: number, max: number) => {
  const percentage = (current / max) * 100
  return percentage
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  })
}

export default function InventoryAnalyticsPage() {
  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">Inventory Management Analytics</h1>
          <p className="text-neutral-400 mt-1">Parts usage, stock levels, and inventory turnover analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                All Categories
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">All Categories</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">HVAC Parts</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Plumbing Parts</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Electrical Parts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* Key Inventory Metrics - Data-Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {inventoryMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.id} className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Icon className={cn("h-5 w-5", metric.color)} />
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    metric.trend === 'up' ? "bg-green-600/20 text-green-400" :
                    metric.trend === 'down' ? "bg-red-600/20 text-red-400" :
                    "bg-neutral-600/20 text-neutral-400"
                  )}
                >
                  {metric.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-neutral-100">{metric.value}</div>
              <div className="text-sm text-neutral-400">{metric.title}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Usage Analysis - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Category Usage Analysis</h3>
          </div>
          <div className="space-y-4">
            {categoryUsage.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", category.color)} />
                    <span className="font-medium text-neutral-200 text-sm">{category.category}</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                    {category.trend}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-400">Items</div>
                    <div className="font-medium text-neutral-200">{category.items}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Value</div>
                    <div className="font-medium text-neutral-200">{formatCurrency(category.totalValue)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Monthly</div>
                    <div className="font-medium text-neutral-200">{formatCurrency(category.monthlyUsage)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Turnover</div>
                    <div className="font-medium text-neutral-200">{category.turnover}x</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", category.color)}
                      style={{ width: `${(category.totalValue / 50000) * 100}%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Level Alerts - Data-Focused */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Stock Level Alerts</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-red-600/10 border border-red-600/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-400">Out of Stock</div>
                  <div className="text-xs text-neutral-400 mt-1">12 AWG THHN Wire (100ft)</div>
                  <div className="text-xs text-neutral-500 mt-1">Used in 3 pending jobs</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-orange-600/10 border border-orange-600/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-orange-400">Low Stock Warning</div>
                  <div className="text-xs text-neutral-400 mt-1">1/2" Copper Pipe (10ft)</div>
                  <div className="text-xs text-neutral-500 mt-1">8 remaining - Reorder point: 15</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-600/20">
              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 text-blue-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-400">Overstock Notice</div>
                  <div className="text-xs text-neutral-400 mt-1">Ball Valve 3/4" - 35 units</div>
                  <div className="text-xs text-neutral-500 mt-1">Consider reducing order quantity</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-green-600/10 border border-green-600/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-green-400">Reorder Completed</div>
                  <div className="text-xs text-neutral-400 mt-1">HVAC Air Filters - 50 units received</div>
                  <div className="text-xs text-neutral-500 mt-1">Delivered this morning</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Items Table - Data-Focused */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-medium text-neutral-100">Inventory Items Overview</h3>
        </div>
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Item</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Stock Level</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Unit Cost</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Total Value</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Turnover</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-300">Last Ordered</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-100">{item.name}</div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300 font-mono text-xs">{item.sku}</td>
                    <td className="py-3 px-4 text-neutral-300">{item.category}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-300",
                              getStatusColor(item.status)
                            )}
                            style={{ width: '${getStockLevel(item.currentStock, item.reorderPoint, item.maxStock)}%' }}
                          />
                        </div>
                        <span className="text-neutral-300 text-xs">{item.currentStock}/{item.maxStock}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(item.status))} />
                        <span className="text-neutral-300 text-xs">{getStatusText(item.status)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{formatCurrency(item.unitCost)}</td>
                    <td className="py-3 px-4 text-neutral-300">{formatCurrency(item.totalValue)}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "font-medium",
                        item.turnoverRate >= 6 ? "text-green-400" :
                        item.turnoverRate >= 4 ? "text-blue-400" :
                        item.turnoverRate >= 2 ? "text-yellow-400" : "text-red-400"
                      )}>
                        {item.turnoverRate}x
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-400">{formatDate(item.lastOrdered)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Stats Grid - Data-Focused */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-medium text-neutral-100">Inventory Performance</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Inventory Accuracy</span>
                <span className="text-sm font-medium text-green-400">98.2%</span>
              </div>
              <Progress value={98.2} className="h-2 bg-neutral-800" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Stock Availability</span>
                <span className="text-sm font-medium text-blue-400">94.7%</span>
              </div>
              <Progress value={94.7} className="h-2 bg-neutral-800" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Order Fill Rate</span>
                <span className="text-sm font-medium text-purple-400">96.8%</span>
              </div>
              <Progress value={96.8} className="h-2 bg-neutral-800" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-neutral-100">Procurement Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">Open POs</span>
              <span className="font-medium text-blue-400">7</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">Pending Deliveries</span>
              <span className="font-medium text-orange-400">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">This Month Orders</span>
              <span className="font-medium text-green-400">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">Total PO Value</span>
              <span className="font-medium text-purple-400">$18,450</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Top Suppliers</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">HVAC Supply Co.</span>
              <span className="font-medium text-green-400">$45,680</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">Metro Plumbing Supply</span>
              <span className="font-medium text-blue-400">$28,450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">Electrical Depot</span>
              <span className="font-medium text-purple-400">$34,250</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">Climate Control Inc.</span>
              <span className="font-medium text-orange-400">$16,960</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}