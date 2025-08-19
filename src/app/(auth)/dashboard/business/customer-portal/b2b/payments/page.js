"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { 
  CreditCard,
  Building,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Send,
  Eye,
  Mail,
  MapPin,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function B2BPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockPayments = [
      {
        id: 'PAY-2024-001',
        client: {
          name: 'Design Studio LLC',
          email: 'billing@designstudio.com',
          address: '456 Creative Blvd, Design Town, CA 90211'
        },
        invoice: {
          id: 'INV-2024-002',
          amount: 1800,
          dueDate: '2024-01-30'
        },
        amount: 1800,
        status: 'completed',
        method: 'bank_transfer',
        transactionId: 'TXN-123456789',
        receivedDate: '2024-01-25',
        dueDate: '2024-01-30',
        notes: 'Payment received on time',
        createdAt: '2024-01-25T14:30:00Z'
      },
      {
        id: 'PAY-2024-002',
        client: {
          name: 'TechCorp Inc.',
          email: 'accounts@techcorp.com',
          address: '123 Business Ave, Tech City, CA 90210'
        },
        invoice: {
          id: 'INV-2024-001',
          amount: 2500,
          dueDate: '2024-02-15'
        },
        amount: 2500,
        status: 'pending',
        method: 'check',
        transactionId: null,
        receivedDate: null,
        dueDate: '2024-02-15',
        notes: 'Check mailed, expected delivery in 3-5 business days',
        createdAt: '2024-01-28T09:15:00Z'
      },
      {
        id: 'PAY-2024-003',
        client: {
          name: 'Marketing Pro',
          email: 'finance@marketingpro.com',
          address: '789 Strategy St, Marketing City, CA 90212'
        },
        invoice: {
          id: 'INV-2024-003',
          amount: 3200,
          dueDate: '2024-01-10'
        },
        amount: 3200,
        status: 'overdue',
        method: 'credit_card',
        transactionId: null,
        receivedDate: null,
        dueDate: '2024-01-10',
        notes: 'Payment is overdue. Follow-up email sent.',
        createdAt: '2024-01-10T16:45:00Z'
      },
      {
        id: 'PAY-2024-004',
        client: {
          name: 'Startup Ventures',
          email: 'accounts@startupventures.com',
          address: '321 Innovation Dr, Startup Valley, CA 90213'
        },
        invoice: {
          id: 'INV-2024-004',
          amount: 4500,
          dueDate: '2024-03-01'
        },
        amount: 4500,
        status: 'scheduled',
        method: 'ach',
        transactionId: null,
        receivedDate: null,
        dueDate: '2024-03-01',
        notes: 'Scheduled ACH payment for March 1st',
        createdAt: '2024-01-29T11:20:00Z'
      },
      {
        id: 'PAY-2024-005',
        client: {
          name: 'Enterprise Solutions',
          email: 'procurement@enterprisesolutions.com',
          address: '654 Corporate Way, Enterprise City, CA 90214'
        },
        invoice: {
          id: 'INV-2024-005',
          amount: 15000,
          dueDate: '2024-01-20'
        },
        amount: 15000,
        status: 'partial',
        method: 'wire_transfer',
        transactionId: 'WIRE-987654321',
        receivedDate: '2024-01-22',
        dueDate: '2024-01-20',
        notes: 'Partial payment received. Remaining balance: $5,000',
        createdAt: '2024-01-22T13:45:00Z'
      }
    ];

    setPayments(mockPayments);
    setFilteredPayments(mockPayments);
    setLoading(false);
  }, []);

  // Filter payments based on search and status
  useEffect(() => {
    let filtered = payments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  const handleStatusChange = async (paymentId, newStatus) => {
    // Update payment status - replace with actual API call
    setPayments(prev => prev.map(payment =>
      payment.id === paymentId ? { ...payment, status: newStatus } : payment
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'overdue': return 'bg-destructive/10 text-destructive';
      case 'scheduled': return 'bg-primary/10 text-primary';
      case 'partial': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'partial': return <TrendingUp className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'bank_transfer': return 'bg-primary/10 text-primary';
      case 'credit_card': return 'bg-purple-100 text-purple-800';
      case 'check': return 'bg-success/10 text-success';
      case 'ach': return 'bg-warning/10 text-warning';
      case 'wire_transfer': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer';
      case 'credit_card': return 'Credit Card';
      case 'check': return 'Check';
      case 'ach': return 'ACH';
      case 'wire_transfer': return 'Wire Transfer';
      default: return method;
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysOverdue = (dueDate) => {
    const diffTime = Math.abs(new Date() - new Date(dueDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage B2B payment transactions
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/business/customer-portal/b2b/payments/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payments
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payments
                .filter(p => p.status === 'pending')
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payments
                .filter(p => p.status === 'overdue')
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Past due</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search payments, clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="scheduled">Scheduled</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{payment.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {payment.client.name} • Invoice {payment.invoice.id} • {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(payment.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </div>
                      </Badge>
                      <Badge className={getMethodColor(payment.method)}>
                        {getMethodLabel(payment.method)}
                      </Badge>
                      {payment.status === 'overdue' && (
                        <Badge variant="destructive">
                          {getDaysOverdue(payment.dueDate)} days overdue
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{payment.client.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{payment.client.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{payment.client.address}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Invoice: {payment.invoice.id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      {payment.receivedDate && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Received: {new Date(payment.receivedDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {payment.transactionId && (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">TXN: {payment.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Payment Amount</span>
                      <span className="text-2xl font-bold">${payment.amount.toLocaleString()}</span>
                    </div>
                    {payment.notes && (
                      <p className="text-sm text-muted-foreground">{payment.notes}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  {payment.status === 'pending' && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusChange(payment.id, 'completed')}
                      className="bg-success hover:bg-success"
                    >
                      Mark Received
                    </Button>
                  )}
                  {payment.status === 'overdue' && (
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-destructive border-red-600 hover:bg-red-50"
                    >
                      Send Reminder
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive border-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Get started by recording your first payment'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => router.push('/dashboard/business/customer-portal/b2b/payments/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
