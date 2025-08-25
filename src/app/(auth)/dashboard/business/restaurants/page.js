"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  Store, 
  Utensils, 
  ChefHat, 
  Calendar, 
  Truck, 
  Users, 
  Package, 
  UserCheck, 
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  AlertTriangle
} from "lucide-react";

export default function RestaurantsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock restaurant data
  const restaurantData = {
    overview: {
      dailyRevenue: 3250,
      ordersToday: 87,
      avgOrderValue: 37.36,
      tablesTurned: 156,
      customerSatisfaction: 4.6,
      staffOnDuty: 12
    },
    quickStats: [
      { label: "Open Tables", value: "8/24", status: "good" },
      { label: "Kitchen Queue", value: "3 orders", status: "normal" },
      { label: "Delivery Time", value: "28 min", status: "warning" },
      { label: "Staff Present", value: "12/14", status: "good" }
    ]
  };

  const modules = [
    {
      id: "pos",
      title: "Point of Sale",
      description: "Process orders, payments, and manage transactions",
      icon: Store,
      href: "/dashboard/business/restaurants/pos",
      color: "bg-blue-500",
      stats: "87 orders today"
    },
    {
      id: "menu",
      title: "Menu Management",
      description: "Update menu items, pricing, and availability",
      icon: Utensils,
      href: "/dashboard/business/restaurants/menu",
      color: "bg-green-500",
      stats: "124 active items"
    },
    {
      id: "kitchen",
      title: "Kitchen Operations",
      description: "Kitchen display system and order management",
      icon: ChefHat,
      href: "/dashboard/business/restaurants/kitchen",
      color: "bg-orange-500",
      stats: "3 orders in queue"
    },
    {
      id: "reservations",
      title: "Reservations",
      description: "Table bookings and reservation management",
      icon: Calendar,
      href: "/dashboard/business/restaurants/reservations",
      color: "bg-purple-500",
      stats: "24 reservations today"
    },
    {
      id: "delivery",
      title: "Delivery & Takeout",
      description: "Manage delivery orders and driver assignments",
      icon: Truck,
      href: "/dashboard/business/restaurants/delivery",
      color: "bg-red-500",
      stats: "15 active deliveries"
    },
    {
      id: "customers",
      title: "Customer Management",
      description: "Customer profiles, loyalty, and preferences",
      icon: Users,
      href: "/dashboard/business/restaurants/customers",
      color: "bg-indigo-500",
      stats: "1,247 customers"
    },
    {
      id: "inventory",
      title: "Inventory",
      description: "Track ingredients, supplies, and stock levels",
      icon: Package,
      href: "/dashboard/business/restaurants/inventory",
      color: "bg-yellow-500",
      stats: "23 low stock items"
    },
    {
      id: "staff",
      title: "Staff Management",
      description: "Scheduling, payroll, and staff performance",
      icon: UserCheck,
      href: "/dashboard/business/restaurants/staff",
      color: "bg-pink-500",
      stats: "12/14 staff present"
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Sales reports, trends, and business insights",
      icon: BarChart3,
      href: "/dashboard/business/restaurants/analytics",
      color: "bg-cyan-500",
      stats: "+12% vs yesterday"
    }
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Management</h1>
          <p className="text-muted-foreground">
            Complete restaurant operations and management system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-success border-green-600">
            <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
            Restaurant Open
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(restaurantData.overview.dailyRevenue)}
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
            <div className="text-2xl font-bold">{restaurantData.overview.ordersToday}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(restaurantData.overview.avgOrderValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Table Turns</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurantData.overview.tablesTurned}</div>
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
            <div className="text-2xl font-bold">{restaurantData.overview.customerSatisfaction}</div>
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
            {restaurantData.quickStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className={`text-lg font-bold ${getStatusColor(stat.status)}`}>
                    {stat.value}
                  </p>
                </div>
                {stat.status === "warning" && (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Modules */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${module.color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${module.color.replace('bg-', 'text-')}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {module.stats}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{module.title}</h3>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  <Button asChild className="w-full mt-4">
                    <Link href={module.href}>
                      Open {module.title}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common restaurant management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Store className="h-6 w-6" />
              <span>New Order</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Add Reservation</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Package className="h-6 w-6" />
              <span>Update Inventory</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <UserCheck className="h-6 w-6" />
              <span>Staff Check-in</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
