"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { 
  Building, 
  FileText, 
  Calculator, 
  CreditCard, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function B2BDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalClients: 89,
    activeProjects: 12,
    pendingInvoices: 15,
    outstandingPayments: 45600,
    monthlyRevenue: 125000,
    totalEstimates: 25,
    acceptedEstimates: 8,
    overduePayments: 3200
  });

  const [recentInvoices, setRecentInvoices] = useState([
    {
      id: 'INV-2024-001',
      client: 'TechCorp Inc.',
      amount: 2500,
      status: 'sent',
      dueDate: '2024-02-15',
      issueDate: '2024-01-15'
    },
    {
      id: 'INV-2024-002',
      client: 'Design Studio LLC',
      amount: 1800,
      status: 'paid',
      dueDate: '2024-01-30',
      issueDate: '2024-01-01'
    },
    {
      id: 'INV-2024-003',
      client: 'Marketing Pro',
      amount: 3200,
      status: 'overdue',
      dueDate: '2024-01-10',
      issueDate: '2023-12-10'
    }
  ]);

  const [recentEstimates, setRecentEstimates] = useState([
    {
      id: 'EST-2024-001',
      client: 'Startup Ventures',
      amount: 12000,
      status: 'sent',
      validUntil: '2024-02-15',
      issueDate: '2024-01-15'
    },
    {
      id: 'EST-2024-002',
      client: 'Enterprise Solutions',
      amount: 25000,
      status: 'accepted',
      validUntil: '2024-01-20',
      issueDate: '2023-12-20'
    },
    {
      id: 'EST-2024-003',
      client: 'Innovation Labs',
      amount: 8500,
      status: 'draft',
      validUntil: '2024-03-01',
      issueDate: null
    }
  ]);

  const [recentPayments, setRecentPayments] = useState([
    {
      id: 'PAY-2024-001',
      client: 'Design Studio LLC',
      amount: 1800,
      status: 'completed',
      method: 'bank_transfer',
      receivedDate: '2024-01-25'
    },
    {
      id: 'PAY-2024-002',
      client: 'TechCorp Inc.',
      amount: 2500,
      status: 'pending',
      method: 'check',
      receivedDate: null
    },
    {
      id: 'PAY-2024-003',
      client: 'Enterprise Solutions',
      amount: 10000,
      status: 'completed',
      method: 'wire_transfer',
      receivedDate: '2024-01-22'
    }
  ]);

  const [topClients, setTopClients] = useState([
    {
      id: 1,
      name: 'Enterprise Solutions',
      email: 'procurement@enterprisesolutions.com',
      phone: '(555) 123-4567',
      totalSpent: 45000,
      projects: 5,
      lastProject: '2024-01-15'
    },
    {
      id: 2,
      name: 'TechCorp Inc.',
      email: 'accounts@techcorp.com',
      phone: '(555) 234-5678',
      totalSpent: 32000,
      projects: 8,
      lastProject: '2024-01-20'
    },
    {
      id: 3,
      name: 'Design Studio LLC',
      email: 'billing@designstudio.com',
      phone: '(555) 345-6789',
      totalSpent: 28000,
      projects: 12,
      lastProject: '2024-01-25'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success';
      case 'sent': return 'bg-primary/10 text-primary';
      case 'overdue': return 'bg-destructive/10 text-destructive';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'accepted': return 'bg-success/10 text-success';
      case 'completed': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <FileText className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'draft': return <Calculator className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'bank_transfer': return 'bg-primary/10 text-primary';
      case 'credit_card': return 'bg-purple-100 text-purple-800';
      case 'check': return 'bg-success/10 text-success';
      case 'wire_transfer': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer';
      case 'credit_card': return 'Credit Card';
      case 'check': return 'Check';
      case 'wire_transfer': return 'Wire Transfer';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">B2B Services Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your B2B business operations and client management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            B2B Services
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.outstandingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
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
              onClick={() => router.push('/dashboard/business/customer-portal/b2b/invoices')}
            >
              <FileText className="h-6 w-6" />
              <span>Manage Invoices</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col space-y-2 p-4"
              onClick={() => router.push('/dashboard/business/customer-portal/b2b/estimates')}
            >
              <Calculator className="h-6 w-6" />
              <span>View Estimates</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col space-y-2 p-4"
              onClick={() => router.push('/dashboard/business/customer-portal/b2b/payments')}
            >
              <CreditCard className="h-6 w-6" />
              <span>Track Payments</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col space-y-2 p-4"
              onClick={() => router.push('/dashboard/business/customer-portal/b2b/invoices/new')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Create Invoice</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Top Clients */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest invoice activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.client}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
                    <Badge className={getStatusColor(invoice.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(invoice.status)}
                        <span className="capitalize">{invoice.status}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/dashboard/business/customer-portal/b2b/invoices')}
            >
              View All Invoices
            </Button>
          </CardContent>
        </Card>

        {/* Recent Estimates */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Estimates</CardTitle>
            <CardDescription>Latest estimate activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEstimates.map((estimate) => (
                <div key={estimate.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Calculator className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">{estimate.id}</p>
                      <p className="text-sm text-muted-foreground">{estimate.client}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Valid until: {new Date(estimate.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${estimate.amount.toLocaleString()}</p>
                    <Badge className={getStatusColor(estimate.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(estimate.status)}
                        <span className="capitalize">{estimate.status}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/dashboard/business/customer-portal/b2b/estimates')}
            >
              View All Estimates
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments & Top Clients */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.id}</p>
                      <p className="text-sm text-muted-foreground">{payment.client}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {payment.receivedDate ? 
                            `Received: ${new Date(payment.receivedDate).toLocaleDateString()}` : 
                            'Pending'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getStatusColor(payment.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </div>
                      </Badge>
                      {payment.method && (
                        <Badge className={getMethodColor(payment.method)}>
                          {getMethodLabel(payment.method)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/dashboard/business/customer-portal/b2b/payments')}
            >
              View All Payments
            </Button>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
            <CardDescription>Highest value clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{client.email}</span>
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{client.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          ${client.totalSpent.toLocaleString()} • {client.projects} projects
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/dashboard/business/customer-portal/b2b/clients')}
            >
              View All Clients
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Invoice Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pending</span>
                <span className="font-medium text-warning">{stats.pendingInvoices}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Overdue</span>
                <span className="font-medium text-destructive">${stats.overduePayments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Monthly Revenue</span>
                <span className="font-medium">${stats.monthlyRevenue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Estimate Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total</span>
                <span className="font-medium">{stats.totalEstimates}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Accepted</span>
                <span className="font-medium text-success">{stats.acceptedEstimates}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Conversion Rate</span>
                <span className="font-medium">
                  {((stats.acceptedEstimates / stats.totalEstimates) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Client Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Clients</span>
                <span className="font-medium">{stats.totalClients}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Projects</span>
                <span className="font-medium text-primary">{stats.activeProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Outstanding</span>
                <span className="font-medium">${stats.outstandingPayments.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
