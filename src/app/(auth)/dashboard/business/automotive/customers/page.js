"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  DollarSign,
  Star,
  Edit,
  Eye,
  MessageSquare,
  Clock,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function AutomotiveCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for customers
  const customers = [
    {
      id: "C-001",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      address: "123 Main St, San Francisco, CA 94102",
      joinDate: "2023-01-15T00:00:00Z",
      status: "active",
      totalSpent: 2847.50,
      lastVisit: "2024-01-12T14:30:00Z",
      vehicles: [
        {
          id: "V-001",
          make: "Honda",
          model: "Civic",
          year: "2020",
          vin: "1HGBH41JXMN109186",
          mileage: "45,230",
          lastService: "2024-01-12T00:00:00Z"
        }
      ],
      loyaltyPoints: 1250,
      rating: 4.8,
      notes: "Prefers synthetic oil, always on time for appointments"
    },
    {
      id: "C-002",
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "(555) 234-5678",
      address: "456 Oak Ave, San Francisco, CA 94103",
      joinDate: "2022-08-22T00:00:00Z",
      status: "active",
      totalSpent: 1895.75,
      lastVisit: "2024-01-10T11:15:00Z",
      vehicles: [
        {
          id: "V-002",
          make: "Toyota",
          model: "Camry",
          year: "2018",
          vin: "4T1B11HK5JU123456",
          mileage: "67,890",
          lastService: "2024-01-10T00:00:00Z"
        }
      ],
      loyaltyPoints: 890,
      rating: 4.6,
      notes: "Loyal customer, brings her own coffee"
    },
    {
      id: "C-003",
      name: "Robert Brown",
      email: "robert.brown@email.com",
      phone: "(555) 345-6789",
      address: "789 Pine St, San Francisco, CA 94104",
      joinDate: "2023-03-10T00:00:00Z",
      status: "active",
      totalSpent: 3420.25,
      lastVisit: "2024-01-08T16:45:00Z",
      vehicles: [
        {
          id: "V-003",
          make: "Ford",
          model: "F-150",
          year: "2021",
          vin: "1FTEW1EG8MFA12345",
          mileage: "23,450",
          lastService: "2024-01-08T00:00:00Z"
        }
      ],
      loyaltyPoints: 1680,
      rating: 4.9,
      notes: "Commercial customer, fleet maintenance"
    },
    {
      id: "C-004",
      name: "Lisa Anderson",
      email: "lisa.anderson@email.com",
      phone: "(555) 456-7890",
      address: "321 Market St, San Francisco, CA 94105",
      joinDate: "2023-11-05T00:00:00Z",
      status: "active",
      totalSpent: 675.00,
      lastVisit: "2024-01-05T09:30:00Z",
      vehicles: [
        {
          id: "V-004",
          make: "Nissan",
          model: "Altima",
          year: "2019",
          vin: "1N4AL3AP8KC123456",
          mileage: "52,100",
          lastService: "2024-01-05T00:00:00Z"
        }
      ],
      loyaltyPoints: 320,
      rating: 4.7,
      notes: "New customer, very satisfied with service"
    },
    {
      id: "C-005",
      name: "David Miller",
      email: "david.miller@email.com",
      phone: "(555) 567-8901",
      address: "654 Union St, San Francisco, CA 94106",
      joinDate: "2022-12-18T00:00:00Z",
      status: "inactive",
      totalSpent: 1245.50,
      lastVisit: "2023-11-20T13:20:00Z",
      vehicles: [
        {
          id: "V-005",
          make: "Chevrolet",
          model: "Malibu",
          year: "2017",
          vin: "1G1ZD5ST5HF123456",
          mileage: "78,920",
          lastService: "2023-11-20T00:00:00Z"
        }
      ],
      loyaltyPoints: 620,
      rating: 4.3,
      notes: "Moved out of area, may return"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.vehicles.some(vehicle => 
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageRating: (customers.reduce((sum, c) => sum + c.rating, 0) / customers.length).toFixed(1)
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your automotive service customers</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/business/automotive/customers/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Customers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}</p>
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
                  placeholder="Search by name, email, phone, or vehicle..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="vip">VIP</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            {filteredCustomers.length} customers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/api/avatar/${customer.id}`} alt={customer.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{customer.rating}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Contact Info</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{customer.address}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Vehicles</h4>
                        {customer.vehicles.map((vehicle) => (
                          <div key={vehicle.id} className="text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Car className="w-3 h-3" />
                              <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                            </div>
                            <p className="text-xs text-gray-500 ml-5">
                              {vehicle.mileage} miles • Last service: {formatDate(vehicle.lastService)}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Financial</h4>
                        <p className="text-sm text-gray-600">
                          Total Spent: <span className="font-medium">${customer.totalSpent.toLocaleString()}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Loyalty Points: <span className="font-medium">{customer.loyaltyPoints}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Member since: {formatDate(customer.joinDate)}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Activity</h4>
                        <p className="text-sm text-gray-600">
                          Last Visit: {formatDateTime(customer.lastVisit)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {customer.vehicles.length} vehicle{customer.vehicles.length !== 1 ? 's' : ''}
                        </p>
                        {customer.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            Note: {customer.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Customer ID: {customer.id}</span>
                        <span>•</span>
                        <span>Join Date: {formatDate(customer.joinDate)}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/business/automotive/customers/${customer.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/business/automotive/customers/${customer.id}/edit`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first customer'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/dashboard/business/automotive/customers/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
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
