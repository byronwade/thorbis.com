'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  MoreHorizontal,
  Download,
  Send,
  Copy,
  TrendingUp,
  Mail
} from 'lucide-react';

export default function ProposalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock proposals data
  const proposals = [
    {
      id: 'PROP-001',
      title: 'Commercial HVAC Installation - Johnson Manufacturing',
      customer: 'Robert Johnson',
      company: 'Johnson Manufacturing',
      service: 'HVAC Installation',
      value: '$15,000.00',
      status: 'sent',
      createdDate: '2024-08-22',
      sentDate: '2024-08-23',
      validUntil: '2024-09-23',
      lastViewed: '2024-08-24',
      viewCount: 3,
      assignedTo: 'Mike Rodriguez',
      leadId: 'LEAD-001',
      description: 'Complete HVAC system installation for new warehouse expansion including ductwork, units, and smart controls.',
      lineItems: [
        { item: 'HVAC Unit - 5 Ton', qty: 2, price: 3500, total: 7000 },
        { item: 'Ductwork Installation', qty: 1, price: 4000, total: 4000 },
        { item: 'Smart Thermostat System', qty: 1, price: 800, total: 800 },
        { item: 'Labor & Installation', qty: 1, price: 3200, total: 3200 }
      ],
      notes: 'Includes 2-year warranty on all equipment and 1-year service agreement.',
      terms: 'Net 30 payment terms. 50% deposit required to begin work.'
    },
    {
      id: 'PROP-002',
      title: 'Electrical Panel Upgrade - Davis Electric',
      customer: 'Michael Davis',
      company: 'Davis Electric Corp',
      service: 'Electrical Installation',
      value: '$8,500.00',
      status: 'accepted',
      createdDate: '2024-08-20',
      sentDate: '2024-08-21',
      validUntil: '2024-09-21',
      lastViewed: '2024-08-23',
      acceptedDate: '2024-08-23',
      viewCount: 5,
      assignedTo: 'David Wilson',
      leadId: 'LEAD-003',
      description: 'Upgrade electrical panel from 100A to 200A service with new circuits for expanded operations.',
      lineItems: [
        { item: '200A Electrical Panel', qty: 1, price: 1200, total: 1200 },
        { item: 'Circuit Breakers (20)', qty: 20, price: 45, total: 900 },
        { item: 'Electrical Wire & Conduit', qty: 1, price: 1500, total: 1500 },
        { item: 'Labor & Installation', qty: 1, price: 4900, total: 4900 }
      ],
      notes: 'Work includes permit acquisition and city inspection coordination.',
      terms: 'Net 15 payment terms. Work begins within 5 business days of acceptance.'
    },
    {
      id: 'PROP-003',
      title: 'Plumbing Renovation - Thompson Residence',
      customer: 'Sarah Thompson',
      company: 'Thompson Residence',
      service: 'Plumbing Installation',
      value: '$4,200.00',
      status: 'draft',
      createdDate: '2024-08-24',
      sentDate: null,
      validUntil: '2024-09-24',
      lastViewed: null,
      viewCount: 0,
      assignedTo: 'Sarah Chen',
      leadId: 'LEAD-002',
      description: 'Complete bathroom renovation plumbing including new fixtures, water lines, and drainage.',
      lineItems: [
        { item: 'Bathroom Fixtures Set', qty: 1, price: 1800, total: 1800 },
        { item: 'PEX Plumbing Lines', qty: 1, price: 600, total: 600 },
        { item: 'Drainage System', qty: 1, price: 800, total: 800 },
        { item: 'Labor & Installation', qty: 1, price: 1000, total: 1000 }
      ],
      notes: 'Customer prefers eco-friendly fixtures. Timeline flexible.',
      terms: 'Net 30 payment terms. Material costs due upfront.'
    },
    {
      id: 'PROP-004',
      title: 'Emergency Generator Installation - Medical Plaza',
      customer: 'Downtown Medical',
      company: 'Downtown Medical Plaza',
      service: 'Electrical Installation',
      value: '$12,000.00',
      status: 'declined',
      createdDate: '2024-08-18',
      sentDate: '2024-08-19',
      validUntil: '2024-09-19',
      lastViewed: '2024-08-21',
      declinedDate: '2024-08-22',
      declineReason: 'Budget constraints - deferred to next fiscal year',
      viewCount: 2,
      assignedTo: 'David Wilson',
      leadId: 'LEAD-004',
      description: 'Backup generator system installation for medical facility with automatic transfer switch.',
      lineItems: [
        { item: 'Standby Generator - 50kW', qty: 1, price: 8000, total: 8000 },
        { item: 'Automatic Transfer Switch', qty: 1, price: 2000, total: 2000 },
        { item: 'Installation & Testing', qty: 1, price: 2000, total: 2000 }
      ],
      notes: 'Critical infrastructure - requires minimal downtime during installation.',
      terms: 'Net 15 payment terms. Installation scheduled over weekend.'
    },
    {
      id: 'PROP-005',
      title: 'HVAC Maintenance Contract - Wilson Retail',
      customer: 'James Wilson',
      company: 'Wilson Retail Group',
      service: 'Maintenance Contract',
      value: '$2,400.00',
      status: 'expired',
      createdDate: '2024-07-15',
      sentDate: '2024-07-16',
      validUntil: '2024-08-15',
      lastViewed: '2024-07-20',
      viewCount: 1,
      assignedTo: 'Lisa Martinez',
      leadId: 'LEAD-005',
      description: 'Annual HVAC maintenance contract covering quarterly inspections and priority service.',
      lineItems: [
        { item: 'Quarterly Inspections', qty: 4, price: 300, total: 1200 },
        { item: 'Filter Replacements', qty: 12, price: 50, total: 600 },
        { item: 'Priority Service Rate', qty: 1, price: 600, total: 600 }
      ],
      notes: 'Includes 20% discount on repair services and emergency response.',
      terms: 'Annual payment due within 30 days of agreement signing.'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800 border-gray-200',
      'sent': 'bg-blue-100 text-blue-800 border-blue-200',
      'viewed': 'bg-purple-100 text-purple-800 border-purple-200',
      'accepted': 'bg-green-100 text-green-800 border-green-200',
      'declined': 'bg-red-100 text-red-800 border-red-200',
      'expired': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'draft': <Edit className="h-4 w-4" />,
      'sent': <Send className="h-4 w-4" />,
      'viewed': <Eye className="h-4 w-4" />,
      'accepted': <CheckCircle className="h-4 w-4" />,
      'declined': <XCircle className="h-4 w-4" />,
      'expired': <AlertCircle className="h-4 w-4" />
    };
    return icons[status] || <FileText className="h-4 w-4" />;
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(proposal.createdDate) >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = new Date(proposal.createdDate) >= monthAgo;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const proposalStats = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'draft').length,
    sent: proposals.filter(p => p.status === 'sent').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    declined: proposals.filter(p => p.status === 'declined').length,
    totalValue: proposals.reduce((sum, p) => sum + parseFloat(p.value.replace('$', '').replace(',', '')), 0),
    acceptanceRate: Math.round((proposals.filter(p => p.status === 'accepted').length / proposals.filter(p => p.status !== 'draft').length) * 100)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Proposals</h1>
          <p className="text-gray-600 dark:text-gray-400">Create, send, and track service proposals</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold">{proposalStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
                <p className="text-2xl font-bold">{proposalStats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sent</p>
                <p className="text-2xl font-bold text-blue-600">{proposalStats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{proposalStats.accepted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Declined</p>
                <p className="text-2xl font-bold text-red-600">{proposalStats.declined}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold">${proposalStats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accept Rate</p>
                <p className="text-2xl font-bold text-green-600">{proposalStats.acceptanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search proposals, customers, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
              </select>
              
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      <div className="grid gap-4">
        {filteredProposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-black dark:text-white">{proposal.title}</h3>
                    <Badge className={`${getStatusColor(proposal.status)} border`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(proposal.status)}
                        <span className="capitalize">{proposal.status}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Customer: {proposal.customer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{proposal.company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Assigned: {proposal.assignedTo}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-green-600">Value: {proposal.value}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {proposal.createdDate}</span>
                    </div>
                    {proposal.sentDate && (
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>Sent: {proposal.sentDate}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Valid Until: {proposal.validUntil}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <p className="mb-1">
                      <span className="font-medium">Service: </span>
                      {proposal.service}
                    </p>
                    <p>
                      <span className="font-medium">Description: </span>
                      {proposal.description}
                    </p>
                  </div>

                  {proposal.viewCount > 0 && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>Viewed {proposal.viewCount} time{proposal.viewCount !== 1 ? 's' : ''}</span>
                      </div>
                      {proposal.lastViewed && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Last viewed: {proposal.lastViewed}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {(proposal.acceptedDate || proposal.declinedDate) && (
                    <div className="text-sm mb-3">
                      {proposal.acceptedDate && (
                        <p className="text-green-600 font-medium">
                          ✓ Accepted on {proposal.acceptedDate}
                        </p>
                      )}
                      {proposal.declinedDate && (
                        <p className="text-red-600 font-medium">
                          ✗ Declined on {proposal.declinedDate}
                          {proposal.declineReason && <span className="font-normal"> - {proposal.declineReason}</span>}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Line Items Summary */}
                  <div className="text-sm">
                    <span className="font-medium text-gray-800 dark:text-gray-200">Line Items ({proposal.lineItems.length}):</span>
                    <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {proposal.lineItems.map((item, index) => (
                        <div key={index} className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <p className="font-medium">{item.item}</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {item.qty} × ${item.price} = ${item.total.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    Clone
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProposals.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No proposals found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or create a new proposal.</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Proposal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
