"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  Store,
  CreditCard,
  Truck,
  Tag,
  Calendar,
  Clock,
  Star,
  Eye,
  ShoppingBag,
  Receipt,
  Target,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function RetailDashboard() {
  // Mock data for retail dashboard
  const dashboardData = {
    stats: {
      totalSales: 28450,
      salesGrowth: 15.2,
      totalOrders: 156,
      orderGrowth: 8.5,
      averageOrderValue: 182.37,
      customerCount: 1247,
      customerGrowth: 12.3,
      inventoryValue: 45620,
      lowStockItems: 8,
      outOfStockItems: 3
    },
    recentOrders: [
      {
        id: "ORD-001",
        customer: "Sarah Johnson",
        items: 3,
        total: 245.99,
        status: "completed",
        paymentMethod: "Credit Card",
        orderDate: "2024-01-15T14:30:00Z",
        itemsList: ["Premium T-Shirt", "Denim Jeans", "Sneakers"]
      },
      {
        id: "ORD-002",
        customer: "Mike Chen",
        items: 2,
        total: 89.50,
        status: "processing",
        paymentMethod: "PayPal",
        orderDate: "2024-01-15T13:15:00Z",
        itemsList: ["Hoodie", "Baseball Cap"]
      },
      {
        id: "ORD-003",
        customer: "Lisa Rodriguez",
        items: 1,
        total: 129.99,
        status: "shipped",
        paymentMethod: "Credit Card",
        orderDate: "2024-01-15T12:45:00Z",
        itemsList: ["Designer Bag"]
      }
    ],
    topProducts: [
      {
        name: "Premium T-Shirt",
        category: "Clothing",
        sales: 45,
        revenue: 2250,
        stock: 23,
        trend: "up"
      },
      {
        name: "Denim Jeans",
        category: "Clothing",
        sales: 38,
        revenue: 3420,
        stock: 15,
        trend: "up"
      },
      {
        name: "Wireless Headphones",
        category: "Electronics",
        sales: 32,
        revenue: 2560,
        stock: 8,
        trend: "down"
      }
    ],
    inventoryAlerts: [
      {
        product: "Wireless Headphones",
        quantity: 8,
        threshold: 10,
        urgency: "medium"
      },
      {
        product: "Designer Bags",
        quantity: 0,
        threshold: 5,
        urgency: "high"
      },
      {
        product: "Sneakers - Size 10",
        quantity: 2,
        threshold: 8,
        urgency: "medium"
      }
    ],
    customerInsights: {
      newCustomers: 23,
      returningCustomers: 133,
      averageRating: 4.6,
      topCustomer: {
        name: "Sarah Johnson",
        totalSpent: 1247.50,
        orders: 8,
        lastVisit: "2024-01-15T10:30:00Z"
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Retail Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your retail business operations</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/dashboard/business/retail/pos">
              <ShoppingCart className="w-4 h-4 mr-2" />
              POS System
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/business/retail/inventory">
              <Package className="w-4 h-4 mr-2" />
              Manage Inventory
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.stats.totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.stats.salesGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.stats.orderGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.stats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.customerCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.stats.customerGrowth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Recent Orders
              </CardTitle>
              <CardDescription>
                Latest customer orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{order.customer}</h4>
                          <p className="text-sm text-gray-600">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {order.items} items • {order.paymentMethod}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <div className="text-lg font-bold mt-1">
                            {formatCurrency(order.total)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Items: {order.itemsList.join(', ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Ordered: {formatDate(order.orderDate)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/business/retail/orders/${order.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/business/retail/orders">
                    View All Orders
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Top Products
              </CardTitle>
              <CardDescription>
                Best performing products this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-600">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(product.trend)}
                        <span className="text-sm font-medium">{product.sales}</span>
                      </div>
                      <p className="text-xs text-gray-600">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-orange-500" />
                Inventory Alerts
              </CardTitle>
              <CardDescription>
                Items requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.inventoryAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">{alert.product}</h4>
                      <p className="text-xs text-gray-600">
                        {alert.quantity} remaining
                      </p>
                    </div>
                    <Badge className={alert.urgency === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {alert.urgency}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/business/retail/inventory">
                    Manage Inventory
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common retail operations and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/retail/pos">
                <ShoppingCart className="w-6 h-6 mb-2" />
                <span className="text-sm">POS System</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/retail/inventory">
                <Package className="w-6 h-6 mb-2" />
                <span className="text-sm">Inventory</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/retail/customers">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Customers</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/retail/analytics">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="text-sm">Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
