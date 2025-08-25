"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { 
  Scissors, 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  Calendar,
  Clock,
  Star,
  Eye,
  Phone,
  Mail,
  Building2,
  Target,
  Activity,
  FileText,
  Settings,
  Heart,
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function BeautyWellnessDashboard() {
  // Mock data for beauty & wellness dashboard
  const dashboardData = {
    stats: {
      totalAppointments: 156,
      completedToday: 23,
      totalRevenue: 12450,
      revenueGrowth: 18.5,
      totalClients: 284,
      clientGrowth: 12.3,
      averageRating: 4.8,
      customerSatisfaction: 96
    },
    todayAppointments: [
      {
        id: "APT-001",
        client: "Sarah Johnson",
        service: "Haircut & Styling",
        stylist: "Lisa Rodriguez",
        time: "10:00 AM",
        duration: 60,
        status: "confirmed",
        price: 85,
        notes: "Regular client, prefers natural look"
      },
      {
        id: "APT-002",
        client: "Emily Davis",
        service: "Facial Treatment",
        stylist: "Maria Garcia",
        time: "11:30 AM",
        duration: 90,
        status: "in_progress",
        price: 120,
        notes: "Sensitive skin, use gentle products"
      },
      {
        id: "APT-003",
        client: "Jennifer Wilson",
        service: "Manicure & Pedicure",
        stylist: "Anna Chen",
        time: "2:00 PM",
        duration: 75,
        status: "scheduled",
        price: 65,
        notes: "New client, first visit"
      }
    ],
    topServices: [
      {
        name: "Haircut & Styling",
        bookings: 45,
        revenue: 3825,
        avgRating: 4.9,
        stylist: "Lisa Rodriguez"
      },
      {
        name: "Facial Treatment",
        bookings: 32,
        revenue: 3840,
        avgRating: 4.8,
        stylist: "Maria Garcia"
      },
      {
        name: "Manicure & Pedicure",
        bookings: 38,
        revenue: 2470,
        avgRating: 4.7,
        stylist: "Anna Chen"
      },
      {
        name: "Massage Therapy",
        bookings: 28,
        revenue: 3360,
        avgRating: 4.9,
        stylist: "David Kim"
      }
    ],
    stylistPerformance: [
      {
        name: "Lisa Rodriguez",
        role: "Senior Stylist",
        appointments: 45,
        revenue: 3825,
        rating: 4.9,
        specialties: ["Haircut", "Color", "Styling"],
        availability: "Mon-Sat"
      },
      {
        name: "Maria Garcia",
        role: "Esthetician",
        appointments: 32,
        revenue: 3840,
        rating: 4.8,
        specialties: ["Facial", "Waxing", "Skincare"],
        availability: "Tue-Sat"
      },
      {
        name: "Anna Chen",
        role: "Nail Technician",
        appointments: 38,
        revenue: 2470,
        rating: 4.7,
        specialties: ["Manicure", "Pedicure", "Nail Art"],
        availability: "Wed-Sun"
      }
    ],
    clientInsights: {
      newClients: 12,
      returningClients: 144,
      averageVisitValue: 87.50,
      topClient: {
        name: "Sarah Johnson",
        visits: 8,
        totalSpent: 680,
        lastVisit: "2024-01-10T14:30:00Z",
        favoriteService: "Haircut & Styling"
      }
    },
    inventoryAlerts: [
      {
        item: "Shampoo - Professional Grade",
        quantity: 3,
        threshold: 5,
        urgency: "medium"
      },
      {
        item: "Nail Polish - Red Collection",
        quantity: 0,
        threshold: 10,
        urgency: "high"
      },
      {
        item: "Facial Masks",
        quantity: 8,
        threshold: 15,
        urgency: "low"
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (time) => {
    return time;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Beauty & Wellness Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your spa and salon business</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/dashboard/business/beauty/appointments/new">
              <Calendar className="w-4 h-4 mr-2" />
              New Appointment
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/business/beauty/clients">
              <Users className="w-4 h-4 mr-2" />
              Manage Clients
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.stats.completedToday} completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.stats.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.stats.clientGrowth}% from last month
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
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Today's Appointments
              </CardTitle>
              <CardDescription>
                Today's scheduled appointments and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{appointment.client}</h4>
                          <p className="text-sm text-gray-600">{appointment.service}</p>
                          <p className="text-sm text-gray-500">Stylist: {appointment.stylist}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.replace('_', ' ')}
                          </Badge>
                          <div className="text-lg font-bold mt-1">
                            {formatCurrency(appointment.price)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{formatTime(appointment.time)}</span>
                          <span>{appointment.duration} min</span>
                          {appointment.notes && (
                            <span className="text-gray-500">Note: {appointment.notes}</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/business/beauty/appointments/${appointment.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/business/beauty/appointments">
                    View All Appointments
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Top Services
              </CardTitle>
              <CardDescription>
                Most popular services this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.topServices.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{service.name}</h4>
                        <p className="text-xs text-gray-600">{service.stylist}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{service.avgRating}</span>
                      </div>
                      <p className="text-xs text-gray-600">{formatCurrency(service.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stylist Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Stylist Performance
              </CardTitle>
              <CardDescription>
                Team performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.stylistPerformance.map((stylist) => (
                  <div key={stylist.name} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{stylist.name}</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{stylist.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{stylist.role}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Appointments:</span>
                        <span className="font-medium ml-1">{stylist.appointments}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium ml-1">{formatCurrency(stylist.revenue)}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Specialties: {stylist.specialties.join(', ')}</p>
                    </div>
                  </div>
                ))}
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
            Common beauty & wellness operations and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/beauty/appointments">
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-sm">Appointments</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/beauty/clients">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Clients</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/beauty/services">
                <Scissors className="w-6 h-6 mb-2" />
                <span className="text-sm">Services</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/beauty/analytics">
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
