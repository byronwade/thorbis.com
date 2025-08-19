"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { 
  Calculator,
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
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function B2BEstimatesPage() {
  const router = useRouter();
  const [estimates, setEstimates] = useState([]);
  const [filteredEstimates, setFilteredEstimates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockEstimates = [
      {
        id: 'EST-2024-001',
        client: {
          name: 'TechCorp Inc.',
          email: 'procurement@techcorp.com',
          address: '123 Business Ave, Tech City, CA 90210'
        },
        amount: 8500,
        status: 'sent',
        validUntil: '2024-02-15',
        issueDate: '2024-01-15',
        responseDate: null,
        items: [
          { description: 'Custom Software Development', quantity: 1, rate: 5000, amount: 5000 },
          { description: 'Database Design', quantity: 1, rate: 2000, amount: 2000 },
          { description: 'Testing & QA', quantity: 1, rate: 1500, amount: 1500 }
        ],
        notes: 'This estimate is valid for 30 days. Project timeline: 8-12 weeks.',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'EST-2024-002',
        client: {
          name: 'Design Studio LLC',
          email: 'projects@designstudio.com',
          address: '456 Creative Blvd, Design Town, CA 90211'
        },
        amount: 3200,
        status: 'accepted',
        validUntil: '2024-01-30',
        issueDate: '2024-01-01',
        responseDate: '2024-01-10',
        items: [
          { description: 'Brand Identity Design', quantity: 1, rate: 1500, amount: 1500 },
          { description: 'Website Design', quantity: 1, rate: 1200, amount: 1200 },
          { description: 'Marketing Materials', quantity: 1, rate: 500, amount: 500 }
        ],
        notes: 'Accepted by client. Ready to convert to invoice.',
        createdAt: '2024-01-01T09:15:00Z'
      },
      {
        id: 'EST-2024-003',
        client: {
          name: 'Marketing Pro',
          email: 'quotes@marketingpro.com',
          address: '789 Strategy St, Marketing City, CA 90212'
        },
        amount: 5600,
        status: 'expired',
        validUntil: '2023-12-31',
        issueDate: '2023-12-01',
        responseDate: null,
        items: [
          { description: 'Digital Marketing Campaign', quantity: 3, rate: 1200, amount: 3600 },
          { description: 'Content Strategy', quantity: 1, rate: 2000, amount: 2000 }
        ],
        notes: 'Estimate expired. Client may still be interested.',
        createdAt: '2023-12-01T14:20:00Z'
      },
      {
        id: 'EST-2024-004',
        client: {
          name: 'Startup Ventures',
          email: 'quotes@startupventures.com',
          address: '321 Innovation Dr, Startup Valley, CA 90213'
        },
        amount: 12000,
        status: 'draft',
        validUntil: '2024-03-01',
        issueDate: null,
        responseDate: null,
        items: [
          { description: 'Mobile App Development', quantity: 1, rate: 8000, amount: 8000 },
          { description: 'Backend API Development', quantity: 1, rate: 3000, amount: 3000 },
          { description: 'Deployment & Setup', quantity: 1, rate: 1000, amount: 1000 }
        ],
        notes: 'Draft estimate - pending internal review',
        createdAt: '2024-01-14T16:45:00Z'
      },
      {
        id: 'EST-2024-005',
        client: {
          name: 'Enterprise Solutions',
          email: 'procurement@enterprisesolutions.com',
          address: '654 Corporate Way, Enterprise City, CA 90214'
        },
        amount: 25000,
        status: 'rejected',
        validUntil: '2024-01-20',
        issueDate: '2023-12-20',
        responseDate: '2024-01-05',
        items: [
          { description: 'Enterprise Software Implementation', quantity: 1, rate: 15000, amount: 15000 },
          { description: 'Custom Integration', quantity: 1, rate: 7000, amount: 7000 },
          { description: 'Training & Support', quantity: 1, rate: 3000, amount: 3000 }
        ],
        notes: 'Client found alternative solution. Follow up in 6 months.',
        createdAt: '2023-12-20T11:30:00Z'
      }
    ];

    setEstimates(mockEstimates);
    setFilteredEstimates(mockEstimates);
    setLoading(false);
  }, []);

  // Filter estimates based on search and status
  useEffect(() => {
    let filtered = estimates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(estimate =>
        estimate.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(estimate => estimate.status === statusFilter);
    }

    setFilteredEstimates(filtered);
  }, [estimates, searchTerm, statusFilter]);

  const handleStatusChange = async (estimateId, newStatus) => {
    // Update estimate status - replace with actual API call
    setEstimates(prev => prev.map(estimate =>
      estimate.id === estimateId ? { ...estimate, status: newStatus } : estimate
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-success/10 text-success';
      case 'sent': return 'bg-primary/10 text-primary';
      case 'expired': return 'bg-destructive/10 text-destructive';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'rejected': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      case 'draft': return <Calculator className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const getDaysUntilExpiry = (validUntil) => {
    const diffTime = new Date(validUntil) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const convertToInvoice = (estimate) => {
    // Convert estimate to invoice - replace with actual API call
    router.push(`/dashboard/business/customer-portal/b2b/invoices/new?estimate=${estimate.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading estimates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">
            Manage your B2B estimates and proposals
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/business/customer-portal/b2b/estimates/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Estimate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estimates.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${estimates.reduce((sum, est) => sum + est.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All estimates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${estimates
                .filter(est => est.status === 'accepted')
                .reduce((sum, est) => sum + est.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Converted value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${estimates
                .filter(est => est.status === 'sent')
                .reduce((sum, est) => sum + est.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
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
                  placeholder="Search estimates, clients..."
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
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
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

      {/* Estimates List */}
      <div className="space-y-4">
        {filteredEstimates.map((estimate) => (
          <Card key={estimate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{estimate.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {estimate.client.name} • Created {new Date(estimate.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(estimate.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(estimate.status)}
                          <span className="capitalize">{estimate.status}</span>
                        </div>
                      </Badge>
                      {estimate.status === 'sent' && !isExpired(estimate.validUntil) && (
                        <Badge variant="outline">
                          {getDaysUntilExpiry(estimate.validUntil)} days left
                        </Badge>
                      )}
                      {isExpired(estimate.validUntil) && (
                        <Badge variant="destructive">
                          Expired
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{estimate.client.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{estimate.client.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{estimate.client.address}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Valid until: {new Date(estimate.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                      {estimate.issueDate && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Issued: {new Date(estimate.issueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {estimate.responseDate && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Responded: {new Date(estimate.responseDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estimate Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Estimate Items</h4>
                    <div className="space-y-1">
                      {estimate.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.description}</span>
                          <span>${item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${estimate.amount.toLocaleString()}</span>
                    </div>
                    {estimate.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{estimate.notes}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  {estimate.status === 'draft' && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusChange(estimate.id, 'sent')}
                    >
                      Send Estimate
                    </Button>
                  )}
                  {estimate.status === 'accepted' && (
                    <Button 
                      size="sm"
                      onClick={() => convertToInvoice(estimate)}
                      className="bg-success hover:bg-success"
                    >
                      Convert to Invoice
                    </Button>
                  )}
                  {estimate.status === 'sent' && !isExpired(estimate.validUntil) && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(estimate.id, 'accepted')}
                    >
                      Mark Accepted
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
      {filteredEstimates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No estimates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first estimate'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => router.push('/dashboard/business/customer-portal/b2b/estimates/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Estimate
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
