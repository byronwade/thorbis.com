"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { 
  Users, 
  Calendar, 
  Bell, 
  CreditCard, 
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomeServicesDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCustomers: 1247,
    activeBookings: 23,
    pendingNotifications: 8,
    todayRevenue: 2840,
    monthlyRevenue: 45600,
    averageRating: 4.8,
    completedToday: 15,
    cancelledToday: 2
  });

  const [recentBookings, setRecentBookings] = useState([
    {
      id: 1,
      customer: 'Sarah Johnson',
      service: 'House Cleaning',
      time: '09:00 AM',
      status: 'confirmed',
      address: '123 Main St, Anytown, CA'
    },
    {
      id: 2,
      customer: 'Mike Chen',
      service: 'Plumbing Repair',
      time: '02:00 PM',
      status: 'in-progress',
      address: '456 Oak Ave, Somewhere, CA'
    },
    {
      id: 3,
      customer: 'Lisa Park',
      service: 'Landscaping',
      time: '08:00 AM',
      status: 'completed',
      address: '789 Pine Rd, Elsewhere, CA'
    }
  ]);

  const [recentCustomers, setRecentCustomers] = useState([
    {
      id: 1,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '(555) 567-8901',
      lastService: 'House Cleaning',
      totalSpent: 150,
      rating: 5
    },
    {
      id: 2,
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '(555) 456-7890',
      lastService: 'HVAC Maintenance',
      totalSpent: 120,
      rating: 4
    },
    {
      id: 3,
      name: 'Jennifer Smith',
      email: 'jennifer.smith@email.com',
      phone: '(555) 678-9012',
      lastService: 'Deep Cleaning',
      totalSpent: 200,
      rating: 5
    }
  ]);

  const [upcomingBookings, setUpcomingBookings] = useState([
    {
      id: 4,
      customer: 'Robert Brown',
      service: 'Electrical Work',
      date: '2024-01-16',
      time: '10:00 AM',
      address: '321 Elm St, Nowhere, CA'
    },
    {
      id: 5,
      customer: 'Maria Garcia',
      service: 'House Cleaning',
      date: '2024-01-16',
      time: '01:00 PM',
      address: '654 Maple Dr, Anywhere, CA'
    },
    {
      id: 6,
      customer: 'James Lee',
      service: 'Plumbing Repair',
      date: '2024-01-17',
      time: '09:00 AM',
      address: '987 Cedar Ln, Somewhere, CA'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success';
      case 'in-progress': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-muted text-foreground';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Home Services Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your home services business operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Home Services
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">Today's appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">Customer satisfaction</p>
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
              onClick={() => router.push('/dashboard/business/customer-portal/home-services/bookings')}
            >
              <Calendar className="h-6 w-6" />
              <span>Manage Bookings</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col space-y-2 p-4"
              onClick={() => router.push('/dashboard/business/customer-portal/home-services/customers')}
            >
              <Users className="h-6 w-6" />
              <span>View Customers</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col space-y-2 p-4"
              onClick={() => router.push('/dashboard/business/customer-portal/home-services/notifications')}
            >
              <Bell className="h-6 w-6" />
              <span>Notifications</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col space-y-2 p-4"
              onClick={() => router.push('/dashboard/business/customer-portal/home-services/bookings/new')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>New Booking</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Upcoming */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest customer appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.customer}</p>
                      <p className="text-sm text-muted-foreground">{booking.service}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{booking.time}</span>
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{booking.address}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </div>
                  </Badge>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/dashboard/business/customer-portal/home-services/bookings')}
            >
              View All Bookings
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Next scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Calendar className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.customer}</p>
                      <p className="text-sm text-muted-foreground">{booking.service}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(booking.date).toLocaleDateString()} at {booking.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{booking.address}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/dashboard/business/customer-portal/home-services/bookings')}
            >
              View All Upcoming
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>Latest customer interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{customer.email}</span>
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{customer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">Last: {customer.lastService}</span>
                      <span className="text-xs text-muted-foreground">• ${customer.totalSpent}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-warning" />
                        <span className="text-xs">{customer.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => router.push('/dashboard/business/customer-portal/home-services/customers')}
          >
            View All Customers
          </Button>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Completed</span>
                <span className="font-medium text-success">{stats.completedToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Cancelled</span>
                <span className="font-medium text-destructive">{stats.cancelledToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Revenue</span>
                <span className="font-medium">${stats.todayRevenue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Revenue</span>
                <span className="font-medium">${stats.monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Customers</span>
                <span className="font-medium">{stats.totalCustomers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Rating</span>
                <span className="font-medium">{stats.averageRating} ⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pending</span>
                <span className="font-medium text-warning">{stats.pendingNotifications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Bookings</span>
                <span className="font-medium text-primary">{stats.activeBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Today's Revenue</span>
                <span className="font-medium">${stats.todayRevenue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
