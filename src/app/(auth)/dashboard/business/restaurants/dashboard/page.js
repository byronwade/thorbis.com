"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { 
  Store, 
  Utensils, 
  ChefHat, 
  Calendar, 
  Truck, 
  Users, 
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  AlertTriangle
} from "lucide-react";

export default function RestaurantDashboardPage() {
  // Mock restaurant dashboard data
  const dashboardData = {
    overview: {
      dailyRevenue: 3250,
      ordersToday: 87,
      avgOrderValue: 37.36,
      tablesTurned: 156,
      customerSatisfaction: 4.6,
      staffOnDuty: 12
    },
    quickStats: [
      { label: "Open Tables", value: "8/24", status: "good", icon: Calendar },
      { label: "Kitchen Queue", value: "3 orders", status: "normal", icon: ChefHat },
      { label: "Delivery Time", value: "28 min", status: "warning", icon: Truck },
      { label: "Staff Present", value: "12/14", status: "good", icon: Users }
    ],
    recentOrders: [
      { id: "ORD-001", table: "Table 5", items: 3, total: 45.50, status: "preparing" },
      { id: "ORD-002", table: "Table 12", items: 2, total: 28.75, status: "ready" },
      { id: "ORD-003", table: "Takeout", items: 4, total: 62.25, status: "delivered" }
    ],
    alerts: [
      { type: "warning", message: "Low stock: Salmon (5 portions left)" },
      { type: "info", message: "Peak hour approaching (7 PM)" }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "good": return "text-success";
      case "warning": return "text-warning";
      case "danger": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-success/10 text-success";
      case "ready": return "bg-primary/10 text-primary";
      case "preparing": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time overview of restaurant operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-success border-green-600">
            <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
            Restaurant Open
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(dashboardData.overview.dailyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.ordersToday}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(dashboardData.overview.avgOrderValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Table Turns</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.tablesTurned}</div>
            <p className="text-xs text-muted-foreground">
              8/24 tables occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.customerSatisfaction}</div>
            <p className="text-xs text-muted-foreground">
              Based on 47 reviews today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Status */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Status</CardTitle>
          <CardDescription>Current operational status and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {dashboardData.quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{stat.label}</p>
                      <p className={`text-lg font-bold ${getStatusColor(stat.status)}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                  {stat.status === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest order activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Store className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.table} • {order.items} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>Important updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.alerts.map((alert, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {alert.type === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-primary" />
                  )}
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Performance</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">94%</div>
              <p className="text-sm text-muted-foreground">Order Accuracy</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">18 min</div>
              <p className="text-sm text-muted-foreground">Avg Prep Time</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-warning">2.3</div>
              <p className="text-sm text-muted-foreground">Table Turns/Hour</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
