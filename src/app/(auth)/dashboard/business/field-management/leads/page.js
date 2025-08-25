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
  Target,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Clock,
  TrendingUp,
  Star,
  Eye,
  Edit,
  MoreHorizontal,
  Building,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Mock leads data
  const leads = [
    {
      id: 'LEAD-001',
      name: 'Robert Johnson',
      company: 'Johnson Manufacturing',
      email: 'robert.johnson@johnsonmfg.com',
      phone: '(555) 123-4567',
      address: '123 Industrial Way, Springfield, IL',
      status: 'qualified',
      source: 'website',
      priority: 'high',
      value: '$15,000',
      service: 'HVAC Installation',
      assignedTo: 'Mike Rodriguez',
      createdDate: '2024-08-20',
      lastContact: '2024-08-24',
      nextFollowup: '2024-08-26',
      score: 85,
      notes: 'Interested in complete HVAC system for new warehouse expansion. Decision maker confirmed.',
      activities: [
        { type: 'call', date: '2024-08-24', note: 'Discussed requirements and timeline' },
        { type: 'email', date: '2024-08-22', note: 'Sent initial proposal draft' }
      ]
    },
    {
      id: 'LEAD-002',
      name: 'Sarah Thompson',
      company: 'Thompson Residence',
      email: 'sarah.thompson@email.com',
      phone: '(555) 234-5678',
      address: '456 Oak Street, Springfield, IL',
      status: 'new',
      source: 'referral',
      priority: 'medium',
      value: '$3,500',
      service: 'Plumbing Repair',
      assignedTo: 'Sarah Chen',
      createdDate: '2024-08-24',
      lastContact: '2024-08-24',
      nextFollowup: '2024-08-25',
      score: 65,
      notes: 'Bathroom renovation project. Needs plumbing for new fixtures. Referred by previous customer.',
      activities: [
        { type: 'web-form', date: '2024-08-24', note: 'Initial inquiry submitted via website' }
      ]
    },
    {
      id: 'LEAD-003',
      name: 'Michael Davis',
      company: 'Davis Electric Corp',
      email: 'm.davis@daviselectric.com',
      phone: '(555) 345-6789',
      address: '789 Business Blvd, Springfield, IL',
      status: 'contacted',
      source: 'cold-call',
      priority: 'high',
      value: '$25,000',
      service: 'Electrical Installation',
      assignedTo: 'David Wilson',
      createdDate: '2024-08-18',
      lastContact: '2024-08-23',
      nextFollowup: '2024-08-25',
      score: 78,
      notes: 'Large commercial electrical project. Needs proposal by end of week. Budget approved.',
      activities: [
        { type: 'meeting', date: '2024-08-23', note: 'Site visit completed, measurements taken' },
        { type: 'call', date: '2024-08-20', note: 'Initial contact made, interest confirmed' }
      ]
    },
    {
      id: 'LEAD-004',
      name: 'Lisa Rodriguez',
      company: 'Rodriguez Family',
      email: 'lisa.rodriguez@email.com',
      phone: '(555) 456-7890',
      address: '321 Maple Ave, Springfield, IL',
      status: 'lost',
      source: 'google-ads',
      priority: 'low',
      value: '$1,200',
      service: 'HVAC Maintenance',
      assignedTo: 'Lisa Martinez',
      createdDate: '2024-08-15',
      lastContact: '2024-08-22',
      nextFollowup: null,
      score: 25,
      notes: 'Decided to go with competitor due to pricing. Keep for future opportunities.',
      activities: [
        { type: 'call', date: '2024-08-22', note: 'Customer chose competitor, marked as lost' },
        { type: 'email', date: '2024-08-18', note: 'Sent quote for annual maintenance plan' }
      ]
    },
    {
      id: 'LEAD-005',
      name: 'James Wilson',
      company: 'Wilson Retail Group',
      email: 'james@wilsonretail.com',
      phone: '(555) 567-8901',
      address: '654 Shopping Center Dr, Springfield, IL',
      status: 'converted',
      source: 'facebook',
      priority: 'high',
      value: '$8,500',
      service: 'Multiple Services',
      assignedTo: 'Mike Rodriguez',
      createdDate: '2024-08-10',
      lastContact: '2024-08-21',
      nextFollowup: null,
      score: 95,
      notes: 'Successfully converted to customer! Signed contract for ongoing maintenance services.',
      activities: [
        { type: 'contract', date: '2024-08-21', note: 'Contract signed, converted to customer' },
        { type: 'proposal', date: '2024-08-19', note: 'Proposal accepted' },
        { type: 'meeting', date: '2024-08-16', note: 'In-person meeting at their location' }
      ]
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800 border-blue-200',
      'contacted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'qualified': 'bg-purple-100 text-purple-800 border-purple-200',
      'proposal-sent': 'bg-orange-100 text-orange-800 border-orange-200',
      'converted': 'bg-green-100 text-green-800 border-green-200',
      'lost': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-red-600',
      'medium': 'text-yellow-600',
      'low': 'text-gray-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const leadStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
    totalValue: leads.reduce((sum, lead) => sum + parseFloat(lead.value.replace('$', '').replace(',', '')), 0),
    conversionRate: Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100)
  };

  const sources = [...new Set(leads.map(lead => lead.source))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Lead Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and nurture potential customers through the sales funnel</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold">{leadStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New</p>
                <p className="text-2xl font-bold text-blue-600">{leadStats.new}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Qualified</p>
                <p className="text-2xl font-bold text-purple-600">{leadStats.qualified}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Converted</p>
                <p className="text-2xl font-bold text-green-600">{leadStats.converted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lost</p>
                <p className="text-2xl font-bold text-red-600">{leadStats.lost}</p>
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
                <p className="text-2xl font-bold">${leadStats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-600">{leadStats.conversionRate}%</p>
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
                placeholder="Search leads, companies, or services..."
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
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal-sent">Proposal Sent</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
              
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              >
                <option value="all">All Sources</option>
                {sources.map(source => (
                  <option key={source} value={source}>
                    {source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-black dark:text-white">{lead.name}</h3>
                    <Badge className={`${getStatusColor(lead.status)} border`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.replace('-', ' ').slice(1)}
                    </Badge>
                    <span className={`text-sm font-medium ${getPriorityColor(lead.priority)}`}>
                      {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
                    </span>
                    <span className={`text-sm font-bold ${getScoreColor(lead.score)}`}>
                      Score: {lead.score}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{lead.company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{lead.phone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{lead.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Assigned: {lead.assignedTo}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>Source: {lead.source.charAt(0).toUpperCase() + lead.source.slice(1).replace('-', ' ')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-green-600">Value: {lead.value}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {lead.createdDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Last Contact: {lead.lastContact}</span>
                    </div>
                    {lead.nextFollowup && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Next: {lead.nextFollowup}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <p><span className="font-medium">Service: </span>{lead.service}</p>
                    <p className="mt-1"><span className="font-medium">Notes: </span>{lead.notes}</p>
                  </div>

                  {lead.activities.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-800 dark:text-gray-200">Recent Activities:</span>
                      <div className="mt-1 space-y-1">
                        {lead.activities.slice(0, 2).map((activity, index) => (
                          <div key={index} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <MessageCircle className="h-3 w-3" />
                            <span className="capitalize">{activity.type.replace('-', ' ')}</span>
                            <span>•</span>
                            <span>{activity.date}</span>
                            <span>•</span>
                            <span>{activity.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
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

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No leads found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or add new leads.</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Lead
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
