"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { 
  FileText,
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
  MapPin
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function B2BInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockInvoices = [
      {
        id: 'INV-2024-001',
        client: {
          name: 'TechCorp Inc.',
          email: 'accounts@techcorp.com',
          address: '123 Business Ave, Tech City, CA 90210'
        },
        amount: 2500,
        status: 'sent',
        dueDate: '2024-02-15',
        issueDate: '2024-01-15',
        paidDate: null,
        items: [
          { description: 'Website Development', quantity: 1, rate: 2000, amount: 2000 },
          { description: 'SEO Optimization', quantity: 1, rate: 500, amount: 500 }
        ],
        notes: 'Payment due within 30 days',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'INV-2024-002',
        client: {
          name: 'Design Studio LLC',
          email: 'billing@designstudio.com',
          address: '456 Creative Blvd, Design Town, CA 90211'
        },
        amount: 1800,
        status: 'paid',
        dueDate: '2024-01-30',
        issueDate: '2024-01-01',
        paidDate: '2024-01-25',
        items: [
          { description: 'Logo Design', quantity: 1, rate: 800, amount: 800 },
          { description: 'Brand Guidelines', quantity: 1, rate: 1000, amount: 1000 }
        ],
        notes: 'Thank you for your business',
        createdAt: '2024-01-01T09:15:00Z'
      },
      {
        id: 'INV-2024-003',
        client: {
          name: 'Marketing Pro',
          email: 'finance@marketingpro.com',
          address: '789 Strategy St, Marketing City, CA 90212'
        },
        amount: 3200,
        status: 'overdue',
        dueDate: '2024-01-10',
        issueDate: '2023-12-10',
        paidDate: null,
        items: [
          { description: 'Social Media Management', quantity: 3, rate: 800, amount: 2400 },
          { description: 'Content Creation', quantity: 1, rate: 800, amount: 800 }
        ],
        notes: 'Payment is overdue. Please contact us immediately.',
        createdAt: '2023-12-10T14:20:00Z'
      },
      {
        id: 'INV-2024-004',
        client: {
          name: 'Startup Ventures',
          email: 'accounts@startupventures.com',
          address: '321 Innovation Dr, Startup Valley, CA 90213'
        },
        amount: 4500,
        status: 'draft',
        dueDate: '2024-03-01',
        issueDate: null,
        paidDate: null,
        items: [
          { description: 'Mobile App Development', quantity: 1, rate: 3000, amount: 3000 },
          { description: 'UI/UX Design', quantity: 1, rate: 1500, amount: 1500 }
        ],
        notes: 'Draft invoice - pending client approval',
        createdAt: '2024-01-14T16:45:00Z'
      }
    ];

    setInvoices(mockInvoices);
    setFilteredInvoices(mockInvoices);
    setLoading(false);
  }, []);

  // Filter invoices based on search and status
  useEffect(() => {
    let filtered = invoices;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter]);

  const handleStatusChange = async (invoiceId, newStatus) => {
    // Update invoice status - replace with actual API call
    setInvoices(prev => prev.map(invoice =>
      invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate) < new Date();
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
          <p className="mt-2 text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your B2B invoicing and payment tracking
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/business/customer-portal/b2b/invoices/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoices
                .filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + inv.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Received payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoices
                .filter(inv => inv.status !== 'paid')
                .reduce((sum, inv) => sum + inv.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Pending payment</p>
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
                  placeholder="Search invoices, clients..."
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
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
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

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{invoice.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {invoice.client.name} • Created {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(invoice.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(invoice.status)}
                          <span className="capitalize">{invoice.status}</span>
                        </div>
                      </Badge>
                      {invoice.status === 'overdue' && (
                        <Badge variant="destructive">
                          {getDaysOverdue(invoice.dueDate)} days overdue
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{invoice.client.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{invoice.client.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{invoice.client.address}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      {invoice.issueDate && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {invoice.paidDate && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Paid: {new Date(invoice.paidDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Invoice Items</h4>
                    <div className="space-y-1">
                      {invoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.description}</span>
                          <span>${item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${invoice.amount.toLocaleString()}</span>
                    </div>
                    {invoice.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{invoice.notes}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  {invoice.status === 'draft' && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusChange(invoice.id, 'sent')}
                    >
                      Send Invoice
                    </Button>
                  )}
                  {invoice.status === 'sent' && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusChange(invoice.id, 'paid')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Paid
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first invoice'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => router.push('/dashboard/business/customer-portal/b2b/invoices/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
