"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  Calendar, 
  Users, 
  FileText, 
  Calculator, 
  MessageSquare,
  Inbox,
  Wrench,
  MapPin,
  Truck,
  Package,
  UserCheck,
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function FieldManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock field service data
  const fieldData = {
    overview: {
      dailyRevenue: 8450,
      jobsToday: 23,
      avgJobValue: 367.39,
      technicianUtilization: 87,
      customerSatisfaction: 4.7,
      activeJobs: 8
    },
    quickStats: [
      { label: "Jobs Scheduled", value: "23", status: "good" },
      { label: "In Progress", value: "8", status: "normal" },
      { label: "Overdue", value: "2", status: "warning" },
      { label: "Technicians", value: "12/14", status: "good" }
    ]
  };

  const modules = [
    {
      id: "schedule",
      title: "Schedule Management",
      description: "Job scheduling, dispatch, and route optimization",
      icon: Calendar,
      href: "/dashboard/business/field-management/schedule",
      color: "bg-blue-500",
      stats: "23 jobs today"
    },
    {
      id: "customers",
      title: "Customer Management",
      description: "Customer profiles, service history, and communication",
      icon: Users,
      href: "/dashboard/business/field-management/customers",
      color: "bg-green-500",
      stats: "1,847 customers"
    },
    {
      id: "estimates",
      title: "Estimates & Proposals",
      description: "Create estimates, track approvals, and follow-ups",
      icon: Calculator,
      href: "/dashboard/business/field-management/estimates",
      color: "bg-purple-500",
      stats: "12 pending"
    },
    {
      id: "billing",
      title: "Billing",
      description: "Generate invoices, track payments, and accounting",
      icon: FileText,
      href: "/dashboard/business/field-management/billing",
      color: "bg-orange-500",
      stats: "$15,240 outstanding"
    },
    {
      id: "communication",
      title: "Messages",
      description: "Calls, messages, and customer communication",
      icon: MessageSquare,
      href: "/dashboard/business/field-management/communication",
      color: "bg-red-500",
      stats: "8 unread messages"
    },
    {
      id: "equipment",
      title: "Equipment & Tools",
      description: "Track equipment, maintenance, and assignments",
      icon: Wrench,
      href: "/dashboard/business/equipment",
      color: "bg-indigo-500",
      stats: "45 items tracked"
    },
    {
      id: "routes",
      title: "Route Planning",
      description: "Optimize routes and track technician locations",
      icon: MapPin,
      href: "/dashboard/business/field-management/schedule/route-planner",
      color: "bg-cyan-500",
      stats: "8 active routes"
    },
    {
      id: "fleet",
      title: "Fleet Management",
      description: "Vehicle tracking, maintenance, and assignments",
      icon: Truck,
      href: "/dashboard/business/fleet",
      color: "bg-yellow-500",
      stats: "12 vehicles"
    },
    {
      id: "inventory",
      title: "Parts & Inventory",
      description: "Track parts, supplies, and stock levels",
      icon: Package,
      href: "/dashboard/business/inventory",
      color: "bg-pink-500",
      stats: "23 low stock"
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
          <h1 className="text-3xl font-bold tracking-tight">Field Management</h1>
          <p className="text-muted-foreground">
            Complete field service management and operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-success border-green-600">
            <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
            Operations Active
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
              {formatCurrency(fieldData.overview.dailyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +18% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fieldData.overview.jobsToday}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(fieldData.overview.avgJobValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technician Utilization</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fieldData.overview.technicianUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              12/14 technicians active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fieldData.overview.customerSatisfaction}</div>
            <p className="text-xs text-muted-foreground">
              Based on 34 reviews today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Status */}
      <Card>
        <CardHeader>
          <CardTitle>Operations Status</CardTitle>
          <CardDescription>Current field operations status and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {fieldData.quickStats.map((stat, index) => (
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
                {stat.status === "good" && (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Management Modules */}
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
          <CardDescription>Common field service management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule Job</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Calculator className="h-6 w-6" />
              <span>Create Estimate</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="h-6 w-6" />
              <span>Add Customer</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <FileText className="h-6 w-6" />
              <span>Generate Invoice</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
