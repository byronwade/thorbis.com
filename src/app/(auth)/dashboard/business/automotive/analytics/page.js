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
  Wrench, 
  Package, 
  Star,
  Calendar,
  Clock,
  Car,
  Target,
  Award,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

export default function AutomotiveAnalytics() {
  // Mock analytics data
  const analyticsData = {
    overview: {
      totalRevenue: 154200,
      revenueGrowth: 12.5,
      totalCustomers: 284,
      customerGrowth: 8.2,
      totalServiceOrders: 1247,
      orderGrowth: 15.3,
      averageRating: 4.7,
      ratingChange: 0.2
    },
    monthlyRevenue: [
      { month: 'Jan', revenue: 12500, orders: 98 },
      { month: 'Feb', revenue: 13200, orders: 104 },
      { month: 'Mar', revenue: 11800, orders: 92 },
      { month: 'Apr', revenue: 14100, orders: 108 },
      { month: 'May', revenue: 15600, orders: 115 },
      { month: 'Jun', revenue: 16200, orders: 122 },
      { month: 'Jul', revenue: 15800, orders: 118 },
      { month: 'Aug', revenue: 17100, orders: 125 },
      { month: 'Sep', revenue: 18300, orders: 132 },
      { month: 'Oct', revenue: 19200, orders: 138 },
      { month: 'Nov', revenue: 20100, orders: 145 },
      { month: 'Dec', revenue: 21800, orders: 152 }
    ],
    topServices: [
      { service: 'Oil Change', revenue: 28450, orders: 245, avgPrice: 116 },
      { service: 'Brake Service', revenue: 32100, orders: 89, avgPrice: 361 },
      { service: 'Tire Replacement', revenue: 29800, orders: 67, avgPrice: 445 },
      { service: 'AC Repair', revenue: 18750, orders: 45, avgPrice: 417 },
      { service: 'Diagnostic', revenue: 15600, orders: 120, avgPrice: 130 }
    ],
    customerMetrics: {
      newCustomers: 45,
      returningCustomers: 239,
      customerRetention: 87.5,
      averageCustomerValue: 543,
      topCustomers: [
        { name: 'John Smith', totalSpent: 2847, visits: 12, rating: 4.8 },
        { name: 'Sarah Wilson', totalSpent: 1895, visits: 8, rating: 4.6 },
        { name: 'Robert Brown', totalSpent: 3420, visits: 15, rating: 4.9 },
        { name: 'Lisa Anderson', totalSpent: 675, visits: 3, rating: 4.7 },
        { name: 'David Miller', totalSpent: 1245, visits: 6, rating: 4.3 }
      ]
    },
    inventoryMetrics: {
      totalParts: 156,
      lowStockItems: 12,
      outOfStockItems: 3,
      inventoryValue: 28450,
      turnoverRate: 4.2
    },
    technicianPerformance: [
      { name: 'Mike Johnson', completedOrders: 156, avgRating: 4.8, efficiency: 94 },
      { name: 'Alex Davis', completedOrders: 142, avgRating: 4.7, efficiency: 91 },
      { name: 'Chris Lee', completedOrders: 128, avgRating: 4.6, efficiency: 88 },
      { name: 'Sarah Chen', completedOrders: 134, avgRating: 4.9, efficiency: 92 }
    ]
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your automotive business</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
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
            <div className="text-2xl font-bold">${analyticsData.overview.totalRevenue.toLocaleString()}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(analyticsData.overview.revenueGrowth)}`}>
              {getGrowthIcon(analyticsData.overview.revenueGrowth)}
              <span className="ml-1">+{analyticsData.overview.revenueGrowth}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalCustomers}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(analyticsData.overview.customerGrowth)}`}>
              {getGrowthIcon(analyticsData.overview.customerGrowth)}
              <span className="ml-1">+{analyticsData.overview.customerGrowth}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalServiceOrders}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(analyticsData.overview.orderGrowth)}`}>
              {getGrowthIcon(analyticsData.overview.orderGrowth)}
              <span className="ml-1">+{analyticsData.overview.orderGrowth}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.averageRating}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(analyticsData.overview.ratingChange)}`}>
              {getGrowthIcon(analyticsData.overview.ratingChange)}
              <span className="ml-1">+{analyticsData.overview.ratingChange} from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart and Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2" />
              Revenue Trend
            </CardTitle>
            <CardDescription>
              Monthly revenue performance over the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.monthlyRevenue.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 text-sm font-medium">{month.month}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(month.revenue / Math.max(...analyticsData.monthlyRevenue.map(m => m.revenue))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">${month.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Top Services by Revenue
            </CardTitle>
            <CardDescription>
              Highest revenue generating services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topServices.map((service, index) => (
                <div key={service.service} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{service.service}</h4>
                      <p className="text-sm text-gray-600">{service.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${service.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">${service.avgPrice} avg</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Metrics and Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Customer Metrics
            </CardTitle>
            <CardDescription>
              Customer acquisition and retention insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analyticsData.customerMetrics.newCustomers}</div>
                <div className="text-sm text-green-600">New Customers</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analyticsData.customerMetrics.returningCustomers}</div>
                <div className="text-sm text-blue-600">Returning</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Retention Rate</span>
                <span className="font-medium">{analyticsData.customerMetrics.customerRetention}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Customer Value</span>
                <span className="font-medium">${analyticsData.customerMetrics.averageCustomerValue}</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Top Customers</h4>
              <div className="space-y-2">
                {analyticsData.customerMetrics.topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{customer.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      ${customer.totalSpent} • {customer.visits} visits • {customer.rating}★
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Inventory Overview
            </CardTitle>
            <CardDescription>
              Parts inventory and stock management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analyticsData.inventoryMetrics.totalParts}</div>
                <div className="text-sm text-blue-600">Total Parts</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${analyticsData.inventoryMetrics.inventoryValue.toLocaleString()}</div>
                <div className="text-sm text-green-600">Total Value</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Stock Items</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {analyticsData.inventoryMetrics.lowStockItems}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Out of Stock</span>
                <Badge variant="destructive">
                  {analyticsData.inventoryMetrics.outOfStockItems}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Turnover Rate</span>
                <span className="font-medium">{analyticsData.inventoryMetrics.turnoverRate}x/year</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Inventory Alerts</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded text-sm">
                  <span>Oil Filter - Premium</span>
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded text-sm">
                  <span>Brake Pads - Front</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded text-sm">
                  <span>Spark Plugs - Iridium</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technician Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Technician Performance
          </CardTitle>
          <CardDescription>
            Team performance metrics and efficiency ratings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.technicianPerformance.map((tech) => (
              <div key={tech.name} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                    {tech.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-medium">{tech.name}</h4>
                    <p className="text-sm text-gray-600">{tech.completedOrders} orders</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{tech.avgRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Efficiency</span>
                    <span className="text-sm font-medium">{tech.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${tech.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
