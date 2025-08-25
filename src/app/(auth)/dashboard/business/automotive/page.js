"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { 
  Wrench, 
  Car, 
  Package, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Phone,
  MapPin,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function AutomotiveDashboard() {
  // Mock data for automotive dashboard
  const dashboardData = {
    stats: {
      activeServiceOrders: 12,
      completedToday: 8,
      pendingEstimates: 5,
      totalRevenue: 15420,
      averageRating: 4.7,
      customerSatisfaction: 92
    },
    recentServiceOrders: [
      {
        id: "SO-001",
        customer: "John Smith",
        vehicle: "2020 Honda Civic",
        service: "Oil Change & Inspection",
        status: "in_progress",
        technician: "Mike Johnson",
        estimatedCompletion: "2:30 PM",
        priority: "high"
      },
      {
        id: "SO-002",
        customer: "Sarah Wilson",
        vehicle: "2018 Toyota Camry",
        service: "Brake Replacement",
        status: "completed",
        technician: "Alex Davis",
        completedAt: "1:45 PM",
        priority: "medium"
      },
      {
        id: "SO-003",
        customer: "Robert Brown",
        vehicle: "2021 Ford F-150",
        service: "Tire Rotation",
        status: "scheduled",
        technician: "Chris Lee",
        scheduledFor: "3:00 PM",
        priority: "low"
      }
    ],
    inventoryAlerts: [
      {
        part: "Brake Pads - Front",
        quantity: 2,
        threshold: 5,
        supplier: "AutoZone",
        urgency: "medium"
      },
      {
        part: "Oil Filter - Premium",
        quantity: 0,
        threshold: 10,
        supplier: "NAPA",
        urgency: "high"
      }
    ],
    todaySchedule: [
      {
        time: "9:00 AM",
        customer: "Lisa Anderson",
        service: "Diagnostic Check",
        vehicle: "2019 Nissan Altima"
      },
      {
        time: "10:30 AM",
        customer: "David Miller",
        service: "AC Repair",
        vehicle: "2017 Chevrolet Malibu"
      },
      {
        time: "2:00 PM",
        customer: "Jennifer Garcia",
        service: "Battery Replacement",
        vehicle: "2020 Hyundai Sonata"
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automotive Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your automotive service business</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/dashboard/business/automotive/service">
              <Wrench className="w-4 h-4 mr-2" />
              New Service Order
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/business/automotive/parts">
              <Package className="w-4 h-4 mr-2" />
              Manage Parts
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Service Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.activeServiceOrders}</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              +1 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.stats.customerSatisfaction}% satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Service Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="w-5 h-5 mr-2" />
                Recent Service Orders
              </CardTitle>
              <CardDescription>
                Latest service orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentServiceOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{order.customer}</h4>
                          <p className="text-sm text-gray-600">{order.vehicle}</p>
                          <p className="text-sm text-gray-500">{order.service}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`ml-2 ${getPriorityColor(order.priority)}`}>
                            {order.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">
                          Tech: {order.technician}
                        </span>
                        <span className="text-sm text-gray-500">
                          {order.status === 'in_progress' && `Est. ${order.estimatedCompletion}`}
                          {order.status === 'completed' && `Completed ${order.completedAt}`}
                          {order.status === 'scheduled' && `Scheduled ${order.scheduledFor}`}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/business/automotive/service/${order.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/business/automotive/service">
                    View All Service Orders
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Inventory Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Inventory Alerts
              </CardTitle>
              <CardDescription>
                Low stock items requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.inventoryAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">{alert.part}</h4>
                      <p className="text-xs text-gray-600">
                        {alert.quantity} remaining (min: {alert.threshold})
                      </p>
                      <p className="text-xs text-gray-500">Supplier: {alert.supplier}</p>
                    </div>
                    <Badge className={getUrgencyColor(alert.urgency)}>
                      {alert.urgency}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/business/automotive/parts">
                    Manage Inventory
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                Upcoming appointments and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.todaySchedule.map((appointment, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="text-sm font-medium text-gray-900 min-w-0">
                      {appointment.time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{appointment.customer}</h4>
                      <p className="text-xs text-gray-600 truncate">{appointment.service}</p>
                      <p className="text-xs text-gray-500 truncate">{appointment.vehicle}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/business/automotive/schedule">
                    View Full Schedule
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
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/automotive/service">
                <Wrench className="w-6 h-6 mb-2" />
                <span className="text-sm">New Service Order</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/automotive/customers">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Manage Customers</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/automotive/parts">
                <Package className="w-6 h-6 mb-2" />
                <span className="text-sm">Parts Inventory</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/automotive/analytics">
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
