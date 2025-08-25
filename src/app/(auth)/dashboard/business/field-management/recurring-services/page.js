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
  RotateCcw,
  Calendar,
  DollarSign,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Eye,
  Edit,
  MoreHorizontal,
  Repeat,
  TrendingUp,
  Settings
} from 'lucide-react';

export default function RecurringServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');

  // Mock recurring services data
  const recurringServices = [
    {
      id: 'REC-001',
      title: 'Quarterly HVAC Maintenance - Johnson Manufacturing',
      customer: 'Robert Johnson',
      company: 'Johnson Manufacturing',
      service: 'HVAC Maintenance',
      frequency: 'quarterly',
      nextService: '2024-09-15',
      lastService: '2024-06-15',
      price: '$450.00',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      assignedTo: 'Mike Rodriguez',
      totalServices: 12,
      completedServices: 8,
      description: 'Comprehensive quarterly HVAC system maintenance including filter changes, system inspection, and performance testing.',
      tasks: [
        'Filter Replacement',
        'System Inspection',
        'Performance Testing',
        'Cleaning & Lubrication',
        'Safety Checks'
      ],
      autoSchedule: true,
      reminderDays: 7,
      invoiceOnCompletion: true
    },
    {
      id: 'REC-002',
      title: 'Monthly Plumbing Inspections - Thompson Properties',
      customer: 'Sarah Thompson',
      company: 'Thompson Properties LLC',
      service: 'Plumbing Inspection',
      frequency: 'monthly',
      nextService: '2024-08-30',
      lastService: '2024-07-30',
      price: '$200.00',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      assignedTo: 'Sarah Chen',
      totalServices: 12,
      completedServices: 7,
      description: 'Monthly plumbing system inspections for multi-unit residential property including leak detection and preventive maintenance.',
      tasks: [
        'Leak Detection',
        'Pipe Inspection',
        'Fixture Check',
        'Water Pressure Test',
        'Drain Assessment'
      ],
      autoSchedule: true,
      reminderDays: 3,
      invoiceOnCompletion: true
    },
    {
      id: 'REC-003',
      title: 'Bi-Annual Electrical Safety Inspections - Medical Plaza',
      customer: 'Downtown Medical',
      company: 'Downtown Medical Plaza',
      service: 'Electrical Inspection',
      frequency: 'bi-annually',
      nextService: '2024-12-01',
      lastService: '2024-06-01',
      price: '$800.00',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2025-12-31',
      assignedTo: 'David Wilson',
      totalServices: 4,
      completedServices: 1,
      description: 'Critical electrical safety inspections for medical facility ensuring compliance with healthcare regulations.',
      tasks: [
        'Panel Inspection',
        'Circuit Testing',
        'Ground Fault Testing',
        'Emergency System Check',
        'Compliance Documentation'
      ],
      autoSchedule: true,
      reminderDays: 14,
      invoiceOnCompletion: false
    },
    {
      id: 'REC-004',
      title: 'Weekly Pool Maintenance - Wilson Retail',
      customer: 'James Wilson',
      company: 'Wilson Retail Group',
      service: 'Pool Maintenance',
      frequency: 'weekly',
      nextService: '2024-08-26',
      lastService: '2024-08-19',
      price: '$120.00',
      status: 'paused',
      startDate: '2024-05-01',
      endDate: '2024-10-31',
      assignedTo: 'Lisa Martinez',
      totalServices: 26,
      completedServices: 16,
      pausedDate: '2024-08-20',
      pauseReason: 'Customer vacation - resume 9/1',
      description: 'Weekly pool maintenance service for corporate facility including chemical balancing and cleaning.',
      tasks: [
        'Chemical Testing',
        'Chemical Balancing',
        'Skimming & Cleaning',
        'Filter Maintenance',
        'Equipment Check'
      ],
      autoSchedule: true,
      reminderDays: 1,
      invoiceOnCompletion: true
    },
    {
      id: 'REC-005',
      title: 'Annual Fire Safety Inspection - Davis Electric',
      customer: 'Michael Davis',
      company: 'Davis Electric Corp',
      service: 'Fire Safety Inspection',
      frequency: 'annually',
      nextService: '2025-02-01',
      lastService: '2024-02-01',
      price: '$350.00',
      status: 'cancelled',
      startDate: '2023-02-01',
      endDate: '2025-02-01',
      assignedTo: 'David Wilson',
      totalServices: 3,
      completedServices: 2,
      cancelledDate: '2024-08-15',
      cancelReason: 'Customer switched to another provider',
      description: 'Annual fire safety and electrical system inspection to ensure compliance with local fire codes.',
      tasks: [
        'Fire Alarm Testing',
        'Emergency Lighting Check',
        'Exit Sign Inspection',
        'Electrical Panel Review',
        'Compliance Certificate'
      ],
      autoSchedule: false,
      reminderDays: 30,
      invoiceOnCompletion: true
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'paused': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'completed': 'bg-blue-100 text-blue-800 border-blue-200',
      'overdue': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'active': <PlayCircle className="h-4 w-4" />,
      'paused': <PauseCircle className="h-4 w-4" />,
      'cancelled': <XCircle className="h-4 w-4" />,
      'completed': <CheckCircle className="h-4 w-4" />,
      'overdue': <AlertTriangle className="h-4 w-4" />
    };
    return icons[status] || <RotateCcw className="h-4 w-4" />;
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'weekly': 'Weekly',
      'bi-weekly': 'Bi-Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'bi-annually': 'Bi-Annually',
      'annually': 'Annually'
    };
    return labels[frequency] || frequency;
  };

  const filteredServices = recurringServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesFrequency = frequencyFilter === 'all' || service.frequency === frequencyFilter;
    return matchesSearch && matchesStatus && matchesFrequency;
  });

  const serviceStats = {
    total: recurringServices.length,
    active: recurringServices.filter(s => s.status === 'active').length,
    paused: recurringServices.filter(s => s.status === 'paused').length,
    cancelled: recurringServices.filter(s => s.status === 'cancelled').length,
    totalValue: recurringServices.filter(s => s.status === 'active').reduce((sum, s) => sum + parseFloat(s.price.replace('$', '').replace(',', '')), 0),
    monthlyRevenue: recurringServices.filter(s => s.status === 'active').reduce((sum, s) => {
      const price = parseFloat(s.price.replace('$', '').replace(',', ''));
      const multiplier = {
        'weekly': 4.33, // ~4.33 weeks per month
        'bi-weekly': 2.17,
        'monthly': 1,
        'quarterly': 0.33,
        'bi-annually': 0.17,
        'annually': 0.083
      };
      return sum + (price * (multiplier[s.frequency] || 1));
    }, 0)
  };

  const frequencies = [...new Set(recurringServices.map(service => service.frequency))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Recurring Services</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage scheduled recurring maintenance and service contracts</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Revenue Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Recurring Service
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <RotateCcw className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Services</p>
                <p className="text-2xl font-bold">{serviceStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <PlayCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{serviceStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <PauseCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paused</p>
                <p className="text-2xl font-bold text-yellow-600">{serviceStats.paused}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{serviceStats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contract Value</p>
                <p className="text-2xl font-bold">${serviceStats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">${Math.round(serviceStats.monthlyRevenue).toLocaleString()}</p>
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
                placeholder="Search recurring services, customers, or service types..."
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
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
              
              <select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              >
                <option value="all">All Frequencies</option>
                {frequencies.map(frequency => (
                  <option key={frequency} value={frequency}>
                    {getFrequencyLabel(frequency)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Services List */}
      <div className="grid gap-4">
        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-black dark:text-white">{service.title}</h3>
                    <Badge className={`${getStatusColor(service.status)} border`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(service.status)}
                        <span className="capitalize">{service.status}</span>
                      </div>
                    </Badge>
                    <Badge variant="outline">
                      <Repeat className="h-3 w-3 mr-1" />
                      {getFrequencyLabel(service.frequency)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Customer: {service.customer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{service.company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Assigned: {service.assignedTo}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-green-600">Price: {service.price}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Next: {service.nextService}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Last: {service.lastService}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Progress: {service.completedServices}/{service.totalServices}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <p className="mb-2">
                      <span className="font-medium">Service: </span>
                      {service.service}
                    </p>
                    <p>
                      <span className="font-medium">Description: </span>
                      {service.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Service Progress
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.round((service.completedServices / service.totalServices) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(service.completedServices / service.totalServices) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Service Tasks:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {service.tasks.map(task => (
                        <Badge key={task} variant="outline" className="text-xs">
                          {task}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Service Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Auto Schedule: {service.autoSchedule ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Reminder: {service.reminderDays} days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Auto Invoice: {service.invoiceOnCompletion ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  {/* Status-specific information */}
                  {service.pausedDate && service.pauseReason && (
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <span className="font-medium">Paused: </span>
                        {service.pausedDate} - {service.pauseReason}
                      </p>
                    </div>
                  )}

                  {service.cancelledDate && service.cancelReason && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <span className="font-medium">Cancelled: </span>
                        {service.cancelledDate} - {service.cancelReason}
                      </p>
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

      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No recurring services found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or create a new recurring service.</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Recurring Service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
