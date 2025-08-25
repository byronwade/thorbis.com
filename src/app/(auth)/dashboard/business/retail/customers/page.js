"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Mail,
  Phone,
  Star,
  Calendar,
  DollarSign,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

export default function RetailCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock customer data
  const customers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "(555) 123-4567",
      status: "active",
      totalSpent: 1247.50,
      orders: 8,
      lastVisit: "2024-01-15",
      joinDate: "2023-03-15",
      loyaltyPoints: 1247,
      favoriteCategory: "Clothing",
      avgOrderValue: 155.94
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "(555) 234-5678",
      status: "active",
      totalSpent: 892.30,
      orders: 6,
      lastVisit: "2024-01-12",
      joinDate: "2023-05-20",
      loyaltyPoints: 892,
      favoriteCategory: "Electronics",
      avgOrderValue: 148.72
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "(555) 345-6789",
      status: "inactive",
      totalSpent: 456.80,
      orders: 3,
      lastVisit: "2023-11-28",
      joinDate: "2023-02-10",
      loyaltyPoints: 456,
      favoriteCategory: "Accessories",
      avgOrderValue: 152.27
    },
    {
      id: 4,
      name: "Lisa Rodriguez",
      email: "lisa.rodriguez@email.com",
      phone: "(555) 456-7890",
      status: "active",
      totalSpent: 2156.90,
      orders: 12,
      lastVisit: "2024-01-14",
      joinDate: "2022-08-15",
      loyaltyPoints: 2156,
      favoriteCategory: "Footwear",
      avgOrderValue: 179.74
    },
    {
      id: 5,
      name: "Robert Wilson",
      email: "robert.wilson@email.com",
      phone: "(555) 567-8901",
      status: "new",
      totalSpent: 89.50,
      orders: 1,
      lastVisit: "2024-01-15",
      joinDate: "2024-01-15",
      loyaltyPoints: 89,
      favoriteCategory: "Clothing",
      avgOrderValue: 89.50
    },
    {
      id: 6,
      name: "Jennifer Smith",
      email: "jennifer.smith@email.com",
      phone: "(555) 678-9012",
      status: "active",
      totalSpent: 678.40,
      orders: 5,
      lastVisit: "2024-01-10",
      joinDate: "2023-07-22",
      loyaltyPoints: 678,
      favoriteCategory: "Accessories",
      avgOrderValue: 135.68
    }
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'new': return 'New';
      default: return 'Unknown';
    }
  };

  const getTotalCustomers = () => customers.length;
  const getActiveCustomers = () => customers.filter(c => c.status === 'active').length;
  const getTotalRevenue = () => customers.reduce((total, c) => total + c.totalSpent, 0);
  const getAverageOrderValue = () => {
    const totalOrders = customers.reduce((total, c) => total + c.orders, 0);
    return totalOrders > 0 ? getTotalRevenue() / totalOrders : 0;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships and data</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalCustomers()}</div>
            <p className="text-xs text-muted-foreground">
              {getActiveCustomers()} active customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalRevenue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getAverageOrderValue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per customer order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <p className="text-xs text-muted-foreground">
              Average satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="new">New</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            Manage your customer information and track their activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Contact</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Orders</th>
                  <th className="text-left py-3 px-4 font-medium">Total Spent</th>
                  <th className="text-left py-3 px-4 font-medium">Last Visit</th>
                  <th className="text-left py-3 px-4 font-medium">Loyalty Points</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600">Joined {new Date(customer.joinDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="text-sm">{customer.email}</div>
                        <div className="text-sm text-gray-600">{customer.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(customer.status)}>
                        {getStatusLabel(customer.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{customer.orders}</span>
                        <span className="text-xs text-gray-500">
                          (avg: ${customer.avgOrderValue.toFixed(2)})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">${customer.totalSpent.toFixed(2)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{new Date(customer.lastVisit).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{customer.loyaltyPoints}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
