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
  Calendar, 
  MapPin, 
  Clock, 
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Eye
} from 'lucide-react';

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock job data
  const jobs = [
    {
      id: 'JOB-001',
      title: 'HVAC System Installation',
      customer: 'Johnson Residence',
      address: '123 Main St, Springfield, IL',
      technician: 'Mike Rodriguez',
      scheduledDate: '2024-08-25',
      scheduledTime: '09:00 AM',
      status: 'scheduled',
      priority: 'high',
      estimatedDuration: '4 hours',
      value: '$2,500.00'
    },
    {
      id: 'JOB-002',
      title: 'Plumbing Repair',
      customer: 'Smith Commercial',
      address: '456 Business Dr, Springfield, IL',
      technician: 'Sarah Chen',
      scheduledDate: '2024-08-25',
      scheduledTime: '02:00 PM',
      status: 'in-progress',
      priority: 'medium',
      estimatedDuration: '2 hours',
      value: '$450.00'
    },
    {
      id: 'JOB-003',
      title: 'Electrical Inspection',
      customer: 'ABC Corporation',
      address: '789 Corporate Blvd, Springfield, IL',
      technician: 'David Wilson',
      scheduledDate: '2024-08-26',
      scheduledTime: '10:30 AM',
      status: 'completed',
      priority: 'low',
      estimatedDuration: '1.5 hours',
      value: '$200.00'
    },
    {
      id: 'JOB-004',
      title: 'Emergency Heating Repair',
      customer: 'Williams Family',
      address: '321 Oak Ave, Springfield, IL',
      technician: 'Unassigned',
      scheduledDate: '2024-08-24',
      scheduledTime: '08:00 AM',
      status: 'overdue',
      priority: 'urgent',
      estimatedDuration: '3 hours',
      value: '$850.00'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'overdue': 'bg-red-100 text-red-800 border-red-200',
      'cancelled': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-blue-100 text-blue-800 border-blue-200',
      'low': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'scheduled': <Calendar className="h-4 w-4" />,
      'in-progress': <Clock className="h-4 w-4" />,
      'completed': <CheckCircle className="h-4 w-4" />,
      'overdue': <AlertCircle className="h-4 w-4" />,
      'cancelled': <XCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const jobStats = {
    total: jobs.length,
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    inProgress: jobs.filter(j => j.status === 'in-progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    overdue: jobs.filter(j => j.status === 'overdue').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Jobs Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track all field service jobs</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                <p className="text-2xl font-bold">{jobStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold">{jobStats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold">{jobStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold">{jobStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{jobStats.overdue}</p>
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
                placeholder="Search jobs, customers, or job IDs..."
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
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-black dark:text-white">{job.title}</h3>
                        <Badge className={`${getStatusColor(job.status)} border`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(job.status)}
                            <span className="capitalize">{job.status.replace('-', ' ')}</span>
                          </div>
                        </Badge>
                        <Badge className={`${getPriorityColor(job.priority)} border`}>
                          {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{job.customer}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{job.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{job.scheduledDate} at {job.scheduledTime}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Technician: {job.technician}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Duration: {job.estimatedDuration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-green-600">Value: {job.value}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No jobs found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or create a new job.</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
