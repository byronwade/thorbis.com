"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { 
  Code, 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  Monitor,
  Server,
  Database,
  Shield,
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
  Zap,
  Bug,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function TechnologyDashboard() {
  // Mock data for technology dashboard
  const dashboardData = {
    stats: {
      totalProjects: 18,
      activeProjects: 12,
      completedProjects: 6,
      totalRevenue: 284500,
      revenueGrowth: 22.5,
      totalClients: 45,
      clientGrowth: 15.2,
      averageProjectValue: 15805,
      uptime: 99.8
    },
    activeProjects: [
      {
        id: "P-001",
        name: "E-commerce Platform Redesign",
        client: "Fashion Retail Co",
        status: "In Development",
        progress: 75,
        budget: 45000,
        spent: 33750,
        deadline: "2024-02-15T00:00:00Z",
        team: ["Sarah Chen", "Mike Johnson", "Alex Davis"],
        technologies: ["React", "Node.js", "MongoDB"]
      },
      {
        id: "P-002",
        name: "Mobile App Development",
        client: "HealthTech Solutions",
        status: "Testing",
        progress: 90,
        budget: 32000,
        spent: 28800,
        deadline: "2024-01-30T00:00:00Z",
        team: ["Lisa Rodriguez", "Chris Lee"],
        technologies: ["React Native", "Firebase", "AWS"]
      },
      {
        id: "P-003",
        name: "Cloud Migration",
        client: "Finance Corp",
        status: "Planning",
        progress: 25,
        budget: 85000,
        spent: 21250,
        deadline: "2024-03-20T00:00:00Z",
        team: ["David Wilson", "Sarah Chen", "Mike Johnson"],
        technologies: ["AWS", "Docker", "Kubernetes"]
      }
    ],
    systemHealth: {
      servers: [
        { name: "Production Server 1", status: "healthy", uptime: 99.9, load: 45 },
        { name: "Production Server 2", status: "healthy", uptime: 99.8, load: 62 },
        { name: "Development Server", status: "warning", uptime: 98.5, load: 78 },
        { name: "Database Server", status: "healthy", uptime: 99.9, load: 23 }
      ],
      services: [
        { name: "API Gateway", status: "healthy", responseTime: 120 },
        { name: "Authentication Service", status: "healthy", responseTime: 85 },
        { name: "Payment Processing", status: "healthy", responseTime: 200 },
        { name: "Email Service", status: "warning", responseTime: 450 }
      ]
    },
    recentTickets: [
      {
        id: "T-001",
        title: "API Rate Limiting Issue",
        client: "E-commerce Client",
        priority: "high",
        status: "In Progress",
        assignedTo: "Sarah Chen",
        createdAt: "2024-01-15T14:30:00Z",
        description: "API calls are being rate limited unexpectedly"
      },
      {
        id: "T-002",
        title: "Database Performance",
        client: "Finance Corp",
        priority: "medium",
        status: "Open",
        assignedTo: "Mike Johnson",
        createdAt: "2024-01-15T13:15:00Z",
        description: "Slow query performance on reporting dashboard"
      },
      {
        id: "T-003",
        title: "Mobile App Crash",
        client: "HealthTech Solutions",
        priority: "critical",
        status: "Resolved",
        assignedTo: "Lisa Rodriguez",
        createdAt: "2024-01-15T12:45:00Z",
        description: "App crashes on iOS 17.2 devices"
      }
    ],
    teamPerformance: [
      {
        name: "Sarah Chen",
        role: "Senior Developer",
        projects: 4,
        completedTasks: 28,
        avgRating: 4.9,
        availability: 95
      },
      {
        name: "Mike Johnson",
        role: "DevOps Engineer",
        projects: 3,
        completedTasks: 22,
        avgRating: 4.8,
        availability: 92
      },
      {
        name: "Lisa Rodriguez",
        role: "Mobile Developer",
        projects: 2,
        completedTasks: 18,
        avgRating: 4.7,
        availability: 88
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Development': return 'bg-blue-100 text-blue-800';
      case 'Testing': return 'bg-yellow-100 text-yellow-800';
      case 'Planning': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Technology Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your technology business and projects</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/dashboard/business/technology/projects/new">
              <Code className="w-4 h-4 mr-2" />
              New Project
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/business/technology/monitoring">
              <Monitor className="w-4 h-4 mr-2" />
              System Monitoring
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.stats.totalProjects} total • {dashboardData.stats.completedProjects} completed
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
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Active Projects
              </CardTitle>
              <CardDescription>
                Current development projects and their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.activeProjects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-gray-600">{project.client}</p>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-medium ml-1">{formatCurrency(project.budget)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Spent:</span>
                          <span className="font-medium ml-1">{formatCurrency(project.spent)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Deadline:</span>
                          <span className="font-medium ml-1">{formatDate(project.deadline)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Team:</span>
                          <span className="font-medium ml-1">{project.team.length} members</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Technologies:</p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/business/technology/projects/${project.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/business/technology/projects">
                    View All Projects
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                System Health
              </CardTitle>
              <CardDescription>
                Server and service status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Servers</h4>
                {dashboardData.systemHealth.servers.map((server) => (
                  <div key={server.name} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">{server.name}</p>
                      <p className="text-xs text-gray-600">Load: {server.load}%</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getHealthColor(server.status)}>
                        {server.status}
                      </Badge>
                      <p className="text-xs text-gray-600">{server.uptime}% uptime</p>
                    </div>
                  </div>
                ))}
                
                <h4 className="font-medium text-sm mt-4">Services</h4>
                {dashboardData.systemHealth.services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-gray-600">{service.responseTime}ms</p>
                    </div>
                    <Badge className={getHealthColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bug className="w-5 h-5 mr-2" />
                Recent Tickets
              </CardTitle>
              <CardDescription>
                Latest support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentTickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{ticket.title}</h4>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{ticket.client}</p>
                    <p className="text-xs text-gray-500 mb-2">{ticket.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{ticket.assignedTo}</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/business/technology/tickets">
                    View All Tickets
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
            Common technology operations and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/technology/projects">
                <Code className="w-6 h-6 mb-2" />
                <span className="text-sm">Projects</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/technology/clients">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Clients</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/technology/monitoring">
                <Monitor className="w-6 h-6 mb-2" />
                <span className="text-sm">Monitoring</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/technology/analytics">
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
