"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart,
  Package,
  Calendar,
  Star,
  Target,
  Activity,
  PieChart,
  LineChart,
  Download
} from 'lucide-react';

export default function RetailAnalytics() {
  // Mock analytics data
  const analyticsData = {
    overview: {
      totalRevenue: 28450,
      revenueGrowth: 15.2,
      totalOrders: 156,
      orderGrowth: 8.5,
      averageOrderValue: 182.37,
      customerCount: 1247,
      customerGrowth: 12.3,
      conversionRate: 3.2
    },
    salesTrends: [
      { month: 'Jan', revenue: 18500, orders: 98 },
      { month: 'Feb', revenue: 19200, orders: 104 },
      { month: 'Mar', revenue: 20100, orders: 112 },
      { month: 'Apr', revenue: 21800, orders: 118 },
      { month: 'May', revenue: 22500, orders: 125 },
      { month: 'Jun', revenue: 28450, orders: 156 }
    ],
    topProducts: [
      { name: "Premium T-Shirt", sales: 45, revenue: 2250, growth: 12.5 },
      { name: "Denim Jeans", sales: 38, revenue: 3420, growth: 8.2 },
      { name: "Wireless Headphones", sales: 32, revenue: 2560, growth: -5.1 },
      { name: "Designer Bag", sales: 28, revenue: 3640, growth: 15.8 },
      { name: "Sneakers", sales: 25, revenue: 3000, growth: 22.1 }
    ],
    customerMetrics: {
      newCustomers: 23,
      returningCustomers: 133,
      averageRating: 4.6,
      customerLifetimeValue: 245.80,
      retentionRate: 78.5,
      topCustomer: {
        name: "Sarah Johnson",
        totalSpent: 1247.50,
        orders: 8,
        lastVisit: "2024-01-15"
      }
    },
    categoryPerformance: [
      { category: "Clothing", revenue: 12500, percentage: 44.0, growth: 12.5 },
      { category: "Electronics", revenue: 8900, percentage: 31.3, growth: 8.2 },
      { category: "Accessories", revenue: 4500, percentage: 15.8, growth: 15.8 },
      { category: "Footwear", revenue: 2550, percentage: 9.0, growth: 22.1 }
    ],
    inventoryMetrics: {
      totalProducts: 156,
      lowStockItems: 8,
      outOfStockItems: 3,
      inventoryValue: 45620,
      turnoverRate: 4.2
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-1">Comprehensive business performance analytics</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getGrowthIcon(analyticsData.overview.revenueGrowth)}
              <span className={getGrowthColor(analyticsData.overview.revenueGrowth)}>
                +{analyticsData.overview.revenueGrowth}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalOrders}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getGrowthIcon(analyticsData.overview.orderGrowth)}
              <span className={getGrowthColor(analyticsData.overview.orderGrowth)}>
                +{analyticsData.overview.orderGrowth}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Visitors to customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2" />
              Sales Trends
            </CardTitle>
            <CardDescription>
              Monthly revenue and order trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.salesTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{trend.month}</h4>
                    <p className="text-sm text-gray-600">{trend.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(trend.revenue)}</div>
                    <div className="text-sm text-gray-600">
                      ${(trend.revenue / trend.orders).toFixed(2)} avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
            <div className="space-y-4">
              {analyticsData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-600">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(product.revenue)}</div>
                    <div className={`flex items-center space-x-1 text-xs ${getGrowthColor(product.growth)}`}>
                      {getGrowthIcon(product.growth)}
                      <span>{product.growth > 0 ? '+' : ''}{product.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Customer Insights
            </CardTitle>
            <CardDescription>
              Customer behavior and satisfaction metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analyticsData.customerMetrics.newCustomers}</div>
                  <p className="text-sm text-gray-600">New Customers</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analyticsData.customerMetrics.returningCustomers}</div>
                  <p className="text-sm text-gray-600">Returning</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{analyticsData.customerMetrics.averageRating}</div>
                  <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(analyticsData.customerMetrics.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analyticsData.customerMetrics.retentionRate}%</div>
                  <p className="text-sm text-gray-600">Retention Rate</p>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-2">Top Customer</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{analyticsData.customerMetrics.topCustomer.name}</p>
                    <p className="text-sm text-gray-600">{analyticsData.customerMetrics.topCustomer.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(analyticsData.customerMetrics.topCustomer.totalSpent)}</div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Category Performance
            </CardTitle>
            <CardDescription>
              Revenue breakdown by product category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.categoryPerformance.map((category, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{category.category}</h4>
                    <div className={`flex items-center space-x-1 text-xs ${getGrowthColor(category.growth)}`}>
                      {getGrowthIcon(category.growth)}
                      <span>{category.growth > 0 ? '+' : ''}{category.growth}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-bold">{formatCurrency(category.revenue)}</div>
                      <p className="text-xs text-gray-600">{category.percentage}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Inventory Overview
          </CardTitle>
          <CardDescription>
            Stock levels and inventory performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analyticsData.inventoryMetrics.totalProducts}</div>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{analyticsData.inventoryMetrics.lowStockItems}</div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analyticsData.inventoryMetrics.outOfStockItems}</div>
              <p className="text-sm text-gray-600">Out of Stock</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(analyticsData.inventoryMetrics.inventoryValue)}</div>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
