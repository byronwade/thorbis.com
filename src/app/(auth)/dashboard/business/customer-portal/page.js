"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Bell, 
  CreditCard, 
  FileText, 
  Calculator,
  Settings,
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Building
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerPortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home-services');
  const [businessType, setBusinessType] = useState('home-services'); // home-services or b2b

  // Mock data - replace with actual data from your API
  const [stats, setStats] = useState({
    homeServices: {
      totalCustomers: 1247,
      activeBookings: 23,
      pendingNotifications: 8,
      todayRevenue: 2840,
      monthlyRevenue: 45600
    },
    b2b: {
      totalClients: 89,
      activeProjects: 12,
      pendingInvoices: 15,
      outstandingPayments: 45600,
      monthlyRevenue: 125000
    }
  });

  const [recentActivity, setRecentActivity] = useState({
    homeServices: [
      { id: 1, type: 'booking', customer: 'Sarah Johnson', service: 'House Cleaning', time: '2 hours ago', status: 'confirmed' },
      { id: 2, type: 'payment', customer: 'Mike Chen', service: 'Plumbing Repair', time: '4 hours ago', status: 'completed' },
      { id: 3, type: 'review', customer: 'Lisa Park', service: 'Landscaping', time: '1 day ago', status: '5 stars' }
    ],
    b2b: [
      { id: 1, type: 'invoice', client: 'TechCorp Inc.', amount: 2500, time: '1 hour ago', status: 'sent' },
      { id: 2, type: 'payment', client: 'Design Studio LLC', amount: 1800, time: '3 hours ago', status: 'received' },
      { id: 3, type: 'estimate', client: 'Marketing Pro', amount: 3200, time: '1 day ago', status: 'pending' }
    ]
  });

  const handleTabChange = (value) => {
    setActiveTab(value);
    setBusinessType(value);
  };

  const navigateToSection = (section) => {
    router.push(`/dashboard/business/customer-portal/${businessType}/${section}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Portal</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships, bookings, and business operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {businessType === 'home-services' ? 'Home Services' : 'B2B Services'}
          </Badge>
        </div>
      </div>

      {/* Business Type Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="home-services" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Home Services</span>
          </TabsTrigger>
          <TabsTrigger value="b2b" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>B2B Services</span>
          </TabsTrigger>
        </TabsList>

        {/* Home Services Portal */}
        <TabsContent value="home-services" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.homeServices.totalCustomers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.homeServices.activeBookings}</div>
                <p className="text-xs text-muted-foreground">Today's appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.homeServices.pendingNotifications}</div>
                <p className="text-xs text-muted-foreground">Pending alerts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.homeServices.todayRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% from yesterday</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your home services operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => navigateToSection('bookings')}
                >
                  <Calendar className="h-6 w-6" />
                  <span>Bookings</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => navigateToSection('customers')}
                >
                  <Users className="h-6 w-6" />
                  <span>Customers</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => navigateToSection('notifications')}
                >
                  <Bell className="h-6 w-6" />
                  <span>Notifications</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => navigateToSection('payments')}
                >
                  <CreditCard className="h-6 w-6" />
                  <span>Payments</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest customer interactions and bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.homeServices.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'booking' && <Calendar className="h-5 w-5 text-blue-500" />}
                        {activity.type === 'payment' && <CreditCard className="h-5 w-5 text-green-500" />}
                        {activity.type === 'review' && <CheckCircle className="h-5 w-5 text-yellow-500" />}
                      </div>
                      <div>
                        <p className="font-medium">{activity.customer}</p>
                        <p className="text-sm text-muted-foreground">{activity.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                      <Badge variant={activity.status === 'confirmed' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* B2B Services Portal */}
        <TabsContent value="b2b" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.b2b.totalClients}</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.b2b.activeProjects}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.b2b.pendingInvoices}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.b2b.outstandingPayments.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Past due</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your B2B operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => navigateToSection('invoices')}
                >
                  <FileText className="h-6 w-6" />
                  <span>Invoices</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => navigateToSection('estimates')}
                >
                  <Calculator className="h-6 w-6" />
                  <span>Estimates</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => navigateToSection('payments')}
                >
                  <CreditCard className="h-6 w-6" />
                  <span>Payments</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => navigateToSection('clients')}
                >
                  <Users className="h-6 w-6" />
                  <span>Clients</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest client interactions and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.b2b.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'invoice' && <FileText className="h-5 w-5 text-blue-500" />}
                        {activity.type === 'payment' && <CreditCard className="h-5 w-5 text-green-500" />}
                        {activity.type === 'estimate' && <Calculator className="h-5 w-5 text-purple-500" />}
                      </div>
                      <div>
                        <p className="font-medium">{activity.client}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.type === 'invoice' && 'Invoice sent'}
                          {activity.type === 'payment' && 'Payment received'}
                          {activity.type === 'estimate' && 'Estimate created'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${activity.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                      <Badge variant={activity.status === 'received' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
