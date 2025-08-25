"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { 
  Stethoscope, 
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
  Shield,
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function HealthcareDashboard() {
  // Mock data for healthcare dashboard
  const dashboardData = {
    stats: {
      totalPatients: 1247,
      appointmentsToday: 45,
      completedToday: 32,
      totalRevenue: 284500,
      revenueGrowth: 15.2,
      averageWaitTime: 12,
      patientSatisfaction: 4.7,
      emergencyCases: 3
    },
    todayAppointments: [
      {
        id: "APT-001",
        patient: "John Smith",
        doctor: "Dr. Sarah Johnson",
        service: "Annual Checkup",
        time: "9:00 AM",
        duration: 30,
        status: "confirmed",
        priority: "normal",
        notes: "Blood pressure check needed"
      },
      {
        id: "APT-002",
        patient: "Emily Davis",
        doctor: "Dr. Mike Chen",
        service: "Follow-up Consultation",
        time: "10:30 AM",
        duration: 45,
        status: "in_progress",
        priority: "high",
        notes: "Post-surgery recovery"
      },
      {
        id: "APT-003",
        patient: "Robert Wilson",
        doctor: "Dr. Lisa Rodriguez",
        service: "Emergency Visit",
        time: "11:15 AM",
        duration: 60,
        status: "urgent",
        priority: "critical",
        notes: "Chest pain symptoms"
      }
    ],
    patientMetrics: {
      newPatients: 23,
      returningPatients: 22,
      averageAge: 42,
      topConditions: [
        { condition: "Hypertension", count: 156, trend: "up" },
        { condition: "Diabetes", count: 89, trend: "stable" },
        { condition: "Respiratory Issues", count: 67, trend: "up" },
        { condition: "Cardiovascular", count: 45, trend: "down" }
      ]
    },
    staffSchedule: [
      {
        name: "Dr. Sarah Johnson",
        role: "Primary Care Physician",
        appointments: 12,
        status: "available",
        specializations: ["Internal Medicine", "Preventive Care"],
        nextAvailable: "2:00 PM"
      },
      {
        name: "Dr. Mike Chen",
        role: "Cardiologist",
        appointments: 8,
        status: "busy",
        specializations: ["Cardiology", "Interventional"],
        nextAvailable: "3:30 PM"
      },
      {
        name: "Dr. Lisa Rodriguez",
        role: "Emergency Medicine",
        appointments: 5,
        status: "available",
        specializations: ["Emergency Medicine", "Trauma"],
        nextAvailable: "1:00 PM"
      }
    ],
    recentAlerts: [
      {
        id: "ALT-001",
        type: "medication",
        patient: "John Smith",
        message: "Medication refill due in 3 days",
        priority: "medium",
        assignedTo: "Dr. Sarah Johnson",
        createdAt: "2024-01-15T08:30:00Z"
      },
      {
        id: "ALT-002",
        type: "lab_results",
        patient: "Emily Davis",
        message: "Lab results available for review",
        priority: "high",
        assignedTo: "Dr. Mike Chen",
        createdAt: "2024-01-15T09:15:00Z"
      },
      {
        id: "ALT-003",
        type: "appointment",
        patient: "Robert Wilson",
        message: "Appointment reminder for tomorrow",
        priority: "low",
        assignedTo: "Dr. Lisa Rodriguez",
        createdAt: "2024-01-15T10:00:00Z"
      }
    ],
    inventoryAlerts: [
      {
        item: "COVID-19 Test Kits",
        quantity: 15,
        threshold: 20,
        urgency: "medium"
      },
      {
        item: "Blood Pressure Cuffs",
        quantity: 2,
        threshold: 5,
        urgency: "high"
      },
      {
        item: "Surgical Masks",
        quantity: 500,
        threshold: 1000,
        urgency: "low"
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'normal': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeIcon = (type) => {
    switch (type) {
      case 'medication': return <FileText className="w-4 h-4" />;
      case 'lab_results': return <BarChart3 className="w-4 h-4" />;
      case 'appointment': return <Calendar className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
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

  const formatTime = (time) => {
    return time;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your medical practice and patient care</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/dashboard/business/healthcare/appointments/new">
              <Calendar className="w-4 h-4 mr-2" />
              New Appointment
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/business/healthcare/patients">
              <Users className="w-4 h-4 mr-2" />
              Patient Records
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.patientMetrics.newPatients} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.appointmentsToday}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.stats.completedToday} completed • {dashboardData.stats.emergencyCases} emergency
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
            <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.patientSatisfaction}</div>
            <p className="text-xs text-muted-foreground">
              Avg wait time: {dashboardData.stats.averageWaitTime} min
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
                Today's scheduled appointments and patient care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{appointment.patient}</h4>
                          <p className="text-sm text-gray-600">{appointment.service}</p>
                          <p className="text-sm text-gray-500">Dr. {appointment.doctor}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`ml-2 ${getPriorityColor(appointment.priority)}`}>
                            {appointment.priority}
                          </Badge>
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
                            <Link href={`/dashboard/business/healthcare/appointments/${appointment.id}`}>
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
                  <Link href="/dashboard/business/healthcare/appointments">
                    View All Appointments
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Recent Alerts
              </CardTitle>
              <CardDescription>
                Patient care alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getAlertTypeIcon(alert.type)}
                        <h4 className="font-medium text-sm">{alert.patient}</h4>
                      </div>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{alert.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{alert.assignedTo}</span>
                      <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/business/healthcare/alerts">
                    View All Alerts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Staff Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                Staff Schedule
              </CardTitle>
              <CardDescription>
                Current staff availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.staffSchedule.map((staff) => (
                  <div key={staff.name} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{staff.name}</h4>
                      <Badge className={staff.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {staff.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{staff.role}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Appointments:</span>
                        <span className="font-medium ml-1">{staff.appointments}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Next Available:</span>
                        <span className="font-medium ml-1">{staff.nextAvailable}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Specializations: {staff.specializations.join(', ')}</p>
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
            Common healthcare operations and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/healthcare/appointments">
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-sm">Appointments</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/healthcare/patients">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Patients</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/healthcare/records">
                <FileText className="w-6 h-6 mb-2" />
                <span className="text-sm">Records</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/healthcare/analytics">
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
