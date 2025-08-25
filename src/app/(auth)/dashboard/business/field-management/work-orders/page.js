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
  User,
  MapPin,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  MoreHorizontal,
  Paperclip,
  DollarSign,
  Package
} from 'lucide-react';

export default function WorkOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Mock work order data
  const workOrders = [
    {
      id: 'WO-001',
      title: 'HVAC System Repair',
      description: 'Main compressor unit making unusual noises and not cooling efficiently',
      customer: 'Johnson Residence',
      address: '123 Main St, Springfield, IL',
      technician: 'Mike Rodriguez',
      requestedDate: '2024-08-20',
      scheduledDate: '2024-08-25',
      completedDate: null,
      status: 'in-progress',
      priority: 'high',
      category: 'HVAC',
      estimatedHours: 4,
      actualHours: 2.5,
      materialsCost: '$450.00',
      laborCost: '$180.00',
      totalCost: '$630.00',
      attachments: 3,
      notes: 'Customer reported issues started 3 days ago. Initial inspection shows compressor belt needs replacement.',
      equipment: ['Compressor Belt', 'Refrigerant R-410A', 'Pressure Gauges']
    },
    {
      id: 'WO-002',
      title: 'Plumbing Leak Repair',
      description: 'Kitchen sink pipe leak causing water damage under cabinet',
      customer: 'Smith Commercial',
      address: '456 Business Dr, Springfield, IL',
      technician: 'Sarah Chen',
      requestedDate: '2024-08-24',
      scheduledDate: '2024-08-25',
      completedDate: null,
      status: 'scheduled',
      priority: 'urgent',
      category: 'Plumbing',
      estimatedHours: 2,
      actualHours: null,
      materialsCost: '$125.00',
      laborCost: '$90.00',
      totalCost: '$215.00',
      attachments: 2,
      notes: 'Emergency call - water shut off required. Customer has temporary bucket in place.',
      equipment: ['Pipe Wrench Set', 'PVC Fittings', 'Pipe Sealant']
    },
    {
      id: 'WO-003',
      title: 'Electrical Panel Upgrade',
      description: 'Replace old 100A panel with new 200A panel for home addition',
      customer: 'Williams Family',
      address: '789 Oak Ave, Springfield, IL',
      technician: 'David Wilson',
      requestedDate: '2024-08-15',
      scheduledDate: '2024-08-26',
      completedDate: '2024-08-26',
      status: 'completed',
      priority: 'medium',
      category: 'Electrical',
      estimatedHours: 6,
      actualHours: 5.5,
      materialsCost: '$850.00',
      laborCost: '$275.00',
      totalCost: '$1,125.00',
      attachments: 5,
      notes: 'Panel upgrade completed successfully. All circuits tested and labeled. Customer satisfied with work.',
      equipment: ['200A Panel', 'Circuit Breakers', 'Electrical Wire', 'Conduit']
    },
    {
      id: 'WO-004',
      title: 'Routine Maintenance Check',
      description: 'Quarterly HVAC system inspection and filter replacement',
      customer: 'ABC Corporation',
      address: '321 Corporate Blvd, Springfield, IL',
      technician: 'Lisa Martinez',
      requestedDate: '2024-08-22',
      scheduledDate: '2024-08-27',
      completedDate: null,
      status: 'scheduled',
      priority: 'low',
      category: 'Maintenance',
      estimatedHours: 1.5,
      actualHours: null,
      materialsCost: '$75.00',
      laborCost: '$67.50',
      totalCost: '$142.50',
      attachments: 1,
      notes: 'Regular maintenance contract. Customer prefers morning appointments.',
      equipment: ['Air Filters', 'Cleaning Supplies', 'Inspection Tools']
    },
    {
      id: 'WO-005',
      title: 'Emergency Heating Repair',
      description: 'No heat in building - furnace not igniting',
      customer: 'Downtown Medical',
      address: '654 Medical Plaza, Springfield, IL',
      technician: 'Unassigned',
      requestedDate: '2024-08-24',
      scheduledDate: '2024-08-24',
      completedDate: null,
      status: 'overdue',
      priority: 'urgent',
      category: 'HVAC',
      estimatedHours: 3,
      actualHours: null,
      materialsCost: '$200.00',
      laborCost: '$135.00',
      totalCost: '$335.00',
      attachments: 0,
      notes: 'Emergency repair needed. Medical facility cannot operate without heat.',
      equipment: ['Ignition Components', 'Gas Leak Detector', 'Multimeter']
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800 border-gray-200',
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'overdue': 'bg-red-100 text-red-800 border-red-200'
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
      'draft': <FileText className="h-4 w-4" />,
      'scheduled': <Calendar className="h-4 w-4" />,
      'in-progress': <Clock className="h-4 w-4" />,
      'completed': <CheckCircle className="h-4 w-4" />,
      'cancelled': <XCircle className="h-4 w-4" />,
      'overdue': <AlertTriangle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const workOrderStats = {
    total: workOrders.length,
    draft: workOrders.filter(wo => wo.status === 'draft').length,
    scheduled: workOrders.filter(wo => wo.status === 'scheduled').length,
    inProgress: workOrders.filter(wo => wo.status === 'in-progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    overdue: workOrders.filter(wo => wo.status === 'overdue').length,
    totalValue: workOrders.reduce((sum, wo) => sum + parseFloat(wo.totalCost.replace('$', '').replace(',', '')), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Work Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track all field service work orders</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Work Order
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
                <p className="text-2xl font-bold">{workOrderStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{workOrderStats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{workOrderStats.inProgress}</p>
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
                <p className="text-2xl font-bold text-green-600">{workOrderStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{workOrderStats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
                <p className="text-2xl font-bold">{workOrderStats.draft}</p>
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
                <p className="text-2xl font-bold">${workOrderStats.totalValue.toLocaleString()}</p>
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
                placeholder="Search work orders, customers, or categories..."
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
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="overdue">Overdue</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders List */}
      <div className="grid gap-4">
        {filteredWorkOrders.map((workOrder) => (
          <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-black dark:text-white">{workOrder.title}</h3>
                    <Badge className={`${getStatusColor(workOrder.status)} border`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(workOrder.status)}
                        <span className="capitalize">{workOrder.status.replace('-', ' ')}</span>
                      </div>
                    </Badge>
                    <Badge className={`${getPriorityColor(workOrder.priority)} border`}>
                      {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                      {workOrder.category}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                    {workOrder.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Customer: {workOrder.customer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{workOrder.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4" />
                      <span>Technician: {workOrder.technician}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Requested: {workOrder.requestedDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Scheduled: {workOrder.scheduledDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Est. Hours: {workOrder.estimatedHours}h</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-green-600">Total: {workOrder.totalCost}</span>
                    </div>
                  </div>

                  {workOrder.actualHours && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span>Actual Hours: {workOrder.actualHours}h | Materials: {workOrder.materialsCost} | Labor: {workOrder.laborCost}</span>
                    </div>
                  )}

                  {workOrder.equipment.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Required Equipment: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {workOrder.equipment.map(item => (
                          <Badge key={item} variant="outline" className="text-xs">
                            <Package className="h-3 w-3 mr-1" />
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-2">
                      <span className="font-medium">Notes: </span>
                      {workOrder.notes}
                    </p>
                    {workOrder.attachments > 0 && (
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4" />
                        <span>{workOrder.attachments} attachment{workOrder.attachments !== 1 ? 's' : ''}</span>
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

      {filteredWorkOrders.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No work orders found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or create a new work order.</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Work Order
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
