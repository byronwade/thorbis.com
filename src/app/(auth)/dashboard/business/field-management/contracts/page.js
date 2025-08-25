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
  AlertTriangle,
  Eye,
  Edit,
  MoreHorizontal,
  Download,
  Pen,
  Shield,
  TrendingUp
} from 'lucide-react';

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock contracts data
  const contracts = [
    {
      id: 'CONT-001',
      title: 'Annual HVAC Maintenance - Johnson Manufacturing',
      customer: 'Robert Johnson',
      company: 'Johnson Manufacturing',
      contractType: 'Service Agreement',
      value: '$15,000.00',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      renewalDate: '2024-12-01',
      signedDate: '2023-12-15',
      assignedTo: 'Mike Rodriguez',
      billingFrequency: 'Monthly',
      nextBilling: '2024-09-01',
      description: 'Comprehensive annual HVAC maintenance covering all units, quarterly inspections, and priority service rates.',
      services: [
        'Quarterly System Inspections',
        'Filter Replacements',
        'Priority Emergency Service',
        '15% Discount on Repairs'
      ],
      terms: 'Auto-renewal unless cancelled 30 days prior to expiration.',
      attachments: ['HVAC_Maintenance_Contract_2024.pdf', 'Equipment_List.pdf'],
      keyDates: [
        { date: '2024-03-01', event: 'Q1 Inspection Completed' },
        { date: '2024-06-01', event: 'Q2 Inspection Completed' },
        { date: '2024-09-01', event: 'Q3 Inspection Due' },
        { date: '2024-12-01', event: 'Contract Renewal Due' }
      ]
    },
    {
      id: 'CONT-002',
      title: 'Electrical Service Contract - Davis Electric',
      customer: 'Michael Davis',
      company: 'Davis Electric Corp',
      contractType: 'Service Agreement',
      value: '$8,500.00',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      renewalDate: '2025-01-01',
      signedDate: '2024-01-20',
      assignedTo: 'David Wilson',
      billingFrequency: 'Quarterly',
      nextBilling: '2024-08-01',
      description: 'Monthly electrical system monitoring and maintenance with emergency response coverage.',
      services: [
        'Monthly System Monitoring',
        'Bi-annual Safety Inspections',
        '24/7 Emergency Response',
        'Equipment Replacement Coverage'
      ],
      terms: '90-day notice required for contract termination.',
      attachments: ['Electrical_Service_Agreement_2024.pdf'],
      keyDates: [
        { date: '2024-08-01', event: 'Safety Inspection Due' },
        { date: '2024-11-01', event: 'Q4 Billing' },
        { date: '2025-01-01', event: 'Contract Renewal Due' }
      ]
    },
    {
      id: 'CONT-003',
      title: 'Construction Services - Wilson Retail',
      customer: 'James Wilson',
      company: 'Wilson Retail Group',
      contractType: 'Project Contract',
      value: '$45,000.00',
      status: 'pending',
      startDate: '2024-09-01',
      endDate: '2024-11-30',
      renewalDate: null,
      signedDate: null,
      assignedTo: 'Mike Rodriguez',
      billingFrequency: 'Milestone',
      nextBilling: 'Upon Signing',
      description: 'Store renovation project including electrical, plumbing, and HVAC work for three retail locations.',
      services: [
        'Electrical System Upgrade',
        'Plumbing Installation',
        'HVAC System Installation',
        'Project Management'
      ],
      terms: 'Payment due at project milestones: 30% upfront, 40% at 50% completion, 30% upon completion.',
      attachments: ['Construction_Contract_Draft.pdf', 'Project_Specifications.pdf'],
      keyDates: [
        { date: '2024-09-01', event: 'Project Start Date' },
        { date: '2024-10-15', event: '50% Milestone Due' },
        { date: '2024-11-30', event: 'Project Completion Due' }
      ]
    },
    {
      id: 'CONT-004',
      title: 'Emergency Service Agreement - Medical Plaza',
      customer: 'Downtown Medical',
      company: 'Downtown Medical Plaza',
      contractType: 'Service Agreement',
      value: '$12,000.00',
      status: 'expired',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      renewalDate: '2023-12-01',
      signedDate: '2022-12-10',
      assignedTo: 'David Wilson',
      billingFrequency: 'Monthly',
      nextBilling: null,
      description: 'Priority emergency service agreement for critical medical facility infrastructure.',
      services: [
        '24/7 Emergency Response',
        'Monthly System Checks',
        'Priority Parts Sourcing',
        'Backup System Maintenance'
      ],
      terms: 'Contract expired - renewal negotiations in progress.',
      attachments: ['Emergency_Service_Agreement_2023.pdf'],
      keyDates: [
        { date: '2023-12-31', event: 'Contract Expired' },
        { date: '2024-01-15', event: 'Renewal Discussion Scheduled' }
      ]
    },
    {
      id: 'CONT-005',
      title: 'Plumbing Service Contract - Thompson Properties',
      customer: 'Sarah Thompson',
      company: 'Thompson Properties LLC',
      contractType: 'Service Agreement',
      value: '$6,200.00',
      status: 'cancelled',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      renewalDate: null,
      signedDate: '2024-02-15',
      cancelledDate: '2024-07-15',
      assignedTo: 'Sarah Chen',
      billingFrequency: 'Monthly',
      nextBilling: null,
      description: 'Multi-property plumbing maintenance covering residential portfolio.',
      services: [
        'Routine Plumbing Maintenance',
        'Drain Cleaning Service',
        'Emergency Repair Coverage',
        'Tenant Service Coordination'
      ],
      terms: 'Contract cancelled due to property portfolio sale.',
      attachments: ['Plumbing_Service_Contract_2024.pdf', 'Cancellation_Notice.pdf'],
      keyDates: [
        { date: '2024-07-15', event: 'Contract Cancelled' },
        { date: '2024-07-30', event: 'Final Service Completed' }
      ]
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'expired': 'bg-red-100 text-red-800 border-red-200',
      'cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
      'renewed': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'active': <CheckCircle className="h-4 w-4" />,
      'pending': <Clock className="h-4 w-4" />,
      'expired': <AlertTriangle className="h-4 w-4" />,
      'cancelled': <XCircle className="h-4 w-4" />,
      'renewed': <CheckCircle className="h-4 w-4" />
    };
    return icons[status] || <FileText className="h-4 w-4" />;
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.contractType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const contractStats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    pending: contracts.filter(c => c.status === 'pending').length,
    expired: contracts.filter(c => c.status === 'expired').length,
    cancelled: contracts.filter(c => c.status === 'cancelled').length,
    totalValue: contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + parseFloat(c.value.replace('$', '').replace(',', '')), 0),
    avgValue: contracts.length > 0 ? Math.round(contracts.reduce((sum, c) => sum + parseFloat(c.value.replace('$', '').replace(',', '')), 0) / contracts.length) : 0
  };

  const contractTypes = [...new Set(contracts.map(contract => contract.contractType))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Contracts</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage service agreements and project contracts</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Contract
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
                <p className="text-2xl font-bold">{contractStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{contractStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{contractStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expired</p>
                <p className="text-2xl font-bold text-red-600">{contractStats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
                <p className="text-2xl font-bold">{contractStats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Value</p>
                <p className="text-2xl font-bold">${contractStats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Value</p>
                <p className="text-2xl font-bold">${contractStats.avgValue.toLocaleString()}</p>
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
                placeholder="Search contracts, customers, or companies..."
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="renewed">Renewed</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              >
                <option value="all">All Types</option>
                {contractTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="grid gap-4">
        {filteredContracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-black dark:text-white">{contract.title}</h3>
                    <Badge className={`${getStatusColor(contract.status)} border`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(contract.status)}
                        <span className="capitalize">{contract.status}</span>
                      </div>
                    </Badge>
                    <Badge variant="outline">
                      {contract.contractType}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Customer: {contract.customer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{contract.company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Assigned: {contract.assignedTo}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-green-600">Value: {contract.value}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Start: {contract.startDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>End: {contract.endDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Billing: {contract.billingFrequency}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <p className="mb-2">
                      <span className="font-medium">Description: </span>
                      {contract.description}
                    </p>
                  </div>

                  {/* Services */}
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Services Included:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contract.services.map(service => (
                        <Badge key={service} variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Key Dates */}
                  {contract.keyDates.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Key Dates:</span>
                      <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {contract.keyDates.slice(0, 4).map((keyDate, index) => (
                          <div key={index} className="text-xs flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>{keyDate.date}</span>
                            <span>-</span>
                            <span>{keyDate.event}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">Terms: </span>
                      {contract.terms}
                    </p>
                    {contract.attachments.length > 0 && (
                      <div className="flex items-center space-x-2 mt-1">
                        <FileText className="h-4 w-4" />
                        <span>{contract.attachments.length} attachment{contract.attachments.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
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

      {filteredContracts.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No contracts found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or create a new contract.</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Contract
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
