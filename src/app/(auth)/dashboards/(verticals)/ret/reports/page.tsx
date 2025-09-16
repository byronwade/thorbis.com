import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Download,
  Filter
} from 'lucide-react'


interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  totalItems: number
  topSellingProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  revenueByDay: Array<{
    date: string
    revenue: number
    orders: number
  }>
  customerMetrics: {
    newCustomers: number
    returningCustomers: number
    totalCustomers: number
  }
  inventoryAlerts: {
    lowStock: number
    outOfStock: number
  }
}

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null)
  const [dateRange, setDateRange] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      // Mock reports data
      setMetrics({
        totalRevenue: 15420.50,
        totalOrders: 127,
        avgOrderValue: 121.42,
        totalItems: 346,
        topSellingProducts: [
          { name: 'Wireless Headphones', quantity: 24, revenue: 4799.76 },
          { name: 'Cotton T-Shirt', quantity: 45, revenue: 1124.55 },
          { name: 'Running Shoes', quantity: 18, revenue: 1619.82 }
        ],
        revenueByDay: [
          { date: '2024-01-09', revenue: 2340.50, orders: 18 },
          { date: '2024-01-10', revenue: 1890.25, orders: 15 },
          { date: '2024-01-11', revenue: 2750.75, orders: 22 },
          { date: '2024-01-12', revenue: 2180.00, orders: 17 },
          { date: '2024-01-13', revenue: 1960.25, orders: 16 },
          { date: '2024-01-14', revenue: 2298.50, orders: 19 },
          { date: '2024-01-15', revenue: 2000.25, orders: 20 }
        ],
        customerMetrics: {
          newCustomers: 23,
          returningCustomers: 104,
          totalCustomers: 127
        },
        inventoryAlerts: {
          lowStock: 12,
          outOfStock: 3
        }
      })
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading || !metrics) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Sales performance and business insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-md dark:border-neutral-700 dark:bg-neutral-800"
            >
              <option value="1d">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <Button variant="header" className="rounded-lg">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12.5%</span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{metrics.totalOrders}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+8.2%</span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.avgOrderValue)}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+3.8%</span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <p className="text-2xl font-bold">{metrics.totalItems}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-500">-2.1%</span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Revenue</h3>
            <div className="space-y-3">
              {metrics.revenueByDay.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="text-sm">
                    {new Date(day.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">{day.orders} orders</span>
                    <span className="font-medium">{formatCurrency(day.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Top Products</h3>
            <div className="space-y-3">
              {metrics.topSellingProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.quantity} sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(product.revenue)}</div>
                    <div className="text-xs text-muted-foreground">#{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Overview */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Customers</span>
                <span className="font-medium">{metrics.customerMetrics.newCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Returning Customers</span>
                <span className="font-medium">{metrics.customerMetrics.returningCustomers}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium">Total Customers</span>
                <span className="font-bold">{metrics.customerMetrics.totalCustomers}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {((metrics.customerMetrics.returningCustomers / metrics.customerMetrics.totalCustomers) * 100).toFixed(1)}% retention rate
              </div>
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Inventory Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                  <span className="text-sm">Out of Stock</span>
                </div>
                <span className="font-medium text-red-600">{metrics.inventoryAlerts.outOfStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
                  <span className="text-sm">Low Stock</span>
                </div>
                <span className="font-medium text-orange-600">{metrics.inventoryAlerts.lowStock}</span>
              </div>
              <div className="border-t pt-3">
                <Button variant="outline" size="sm" className="w-full">
                  View Inventory Issues
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
