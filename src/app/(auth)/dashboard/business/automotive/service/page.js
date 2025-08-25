"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  User,
  Car,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';

export default function AutomotiveServiceOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for service orders
  const serviceOrders = [
    {
      id: "SO-001",
      customer: "John Smith",
      phone: "(555) 123-4567",
      email: "john.smith@email.com",
      vehicle: "2020 Honda Civic",
      vin: "1HGBH41JXMN109186",
      mileage: "45,230",
      service: "Oil Change & Inspection",
      description: "Full synthetic oil change with multi-point inspection",
      status: "in_progress",
      priority: "high",
      technician: "Mike Johnson",
      estimatedCompletion: "2:30 PM",
      estimatedCost: 89.99,
      actualCost: null,
      createdAt: "2024-01-15T09:00:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "SO-002",
      customer: "Sarah Wilson",
      phone: "(555) 234-5678",
      email: "sarah.wilson@email.com",
      vehicle: "2018 Toyota Camry",
      vin: "4T1B11HK5JU123456",
      mileage: "67,890",
      service: "Brake Replacement",
      description: "Front brake pads and rotors replacement",
      status: "completed",
      priority: "medium",
      technician: "Alex Davis",
      estimatedCompletion: null,
      estimatedCost: 299.99,
      actualCost: 285.50,
      createdAt: "2024-01-15T08:00:00Z",
      updatedAt: "2024-01-15T13:45:00Z"
    },
    {
      id: "SO-003",
      customer: "Robert Brown",
      phone: "(555) 345-6789",
      email: "robert.brown@email.com",
      vehicle: "2021 Ford F-150",
      vin: "1FTEW1EG8MFA12345",
      mileage: "23,450",
      service: "Tire Rotation",
      description: "Four tire rotation and balance",
      status: "scheduled",
      priority: "low",
      technician: "Chris Lee",
      estimatedCompletion: "3:00 PM",
      estimatedCost: 49.99,
      actualCost: null,
      createdAt: "2024-01-15T07:30:00Z",
      updatedAt: "2024-01-15T07:30:00Z"
    },
    {
      id: "SO-004",
      customer: "Lisa Anderson",
      phone: "(555) 456-7890",
      email: "lisa.anderson@email.com",
      vehicle: "2019 Nissan Altima",
      vin: "1N4AL3AP8KC123456",
      mileage: "52,100",
      service: "Diagnostic Check",
      description: "Check engine light diagnostic and repair",
      status: "pending",
      priority: "high",
      technician: "Mike Johnson",
      estimatedCompletion: "4:00 PM",
      estimatedCost: 129.99,
      actualCost: null,
      createdAt: "2024-01-15T11:00:00Z",
      updatedAt: "2024-01-15T11:00:00Z"
    },
    {
      id: "SO-005",
      customer: "David Miller",
      phone: "(555) 567-8901",
      email: "david.miller@email.com",
      vehicle: "2017 Chevrolet Malibu",
      vin: "1G1ZD5ST5HF123456",
      mileage: "78,920",
      service: "AC Repair",
      description: "Air conditioning system repair and recharge",
      status: "in_progress",
      priority: "medium",
      technician: "Alex Davis",
      estimatedCompletion: "5:00 PM",
      estimatedCost: 199.99,
      actualCost: null,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T12:15:00Z"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredOrders = serviceOrders.filter(order => {
    const matchesSearch = 
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: serviceOrders.length,
    inProgress: serviceOrders.filter(o => o.status === 'in_progress').length,
    completed: serviceOrders.filter(o => o.status === 'completed').length,
    pending: serviceOrders.filter(o => o.status === 'pending').length,
    scheduled: serviceOrders.filter(o => o.status === 'scheduled').length
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Orders</h1>
          <p className="text-gray-600 mt-1">Manage automotive service orders and repairs</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/business/automotive/service/new">
            <Plus className="w-4 h-4 mr-2" />
            New Service Order
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by customer, vehicle, service, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Service Orders</CardTitle>
          <CardDescription>
            {filteredOrders.length} orders found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{order.id}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{order.customer}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{order.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span>{order.email}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{order.vehicle}</h4>
                        <p className="text-sm text-gray-600">VIN: {order.vin}</p>
                        <p className="text-sm text-gray-600">Mileage: {order.mileage}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{order.service}</h4>
                        <p className="text-sm text-gray-600">{order.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <User className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-600">{order.technician}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Created: {formatDate(order.createdAt)}</span>
                        {order.estimatedCompletion && (
                          <span>Est. Completion: {order.estimatedCompletion}</span>
                        )}
                        <span>Est. Cost: ${order.estimatedCost}</span>
                        {order.actualCost && (
                          <span>Actual Cost: ${order.actualCost}</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/business/automotive/service/${order.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/business/automotive/service/${order.id}/edit`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No service orders found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first service order'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/dashboard/business/automotive/service/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Service Order
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
