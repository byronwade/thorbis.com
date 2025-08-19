"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { 
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Clock,
  Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomeServicesCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCustomers = [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Anytown, CA 90210',
        status: 'active',
        totalBookings: 15,
        totalSpent: 2250,
        averageRating: 4.8,
        lastBooking: '2024-01-10',
        favoriteServices: ['House Cleaning', 'Deep Cleaning'],
        notes: 'Prefers morning appointments, has 2 dogs',
        createdAt: '2023-06-15'
      },
      {
        id: 2,
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        phone: '(555) 234-5678',
        address: '456 Oak Ave, Somewhere, CA 90211',
        status: 'active',
        totalBookings: 8,
        totalSpent: 1600,
        averageRating: 4.9,
        lastBooking: '2024-01-12',
        favoriteServices: ['Plumbing Repair', 'HVAC Maintenance'],
        notes: 'Emergency contact for plumbing issues',
        createdAt: '2023-08-22'
      },
      {
        id: 3,
        name: 'Lisa Park',
        email: 'lisa.park@email.com',
        phone: '(555) 345-6789',
        address: '789 Pine Rd, Elsewhere, CA 90212',
        status: 'inactive',
        totalBookings: 3,
        totalSpent: 450,
        averageRating: 4.5,
        lastBooking: '2023-11-15',
        favoriteServices: ['Landscaping'],
        notes: 'Seasonal landscaping customer',
        createdAt: '2023-09-10'
      },
      {
        id: 4,
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        phone: '(555) 456-7890',
        address: '321 Elm St, Nowhere, CA 90213',
        status: 'active',
        totalBookings: 22,
        totalSpent: 3800,
        averageRating: 5.0,
        lastBooking: '2024-01-14',
        favoriteServices: ['HVAC Maintenance', 'Electrical Work'],
        notes: 'VIP customer, always pays on time',
        createdAt: '2023-03-05'
      },
      {
        id: 5,
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '(555) 567-8901',
        address: '654 Maple Dr, Anywhere, CA 90214',
        status: 'new',
        totalBookings: 1,
        totalSpent: 150,
        averageRating: 5.0,
        lastBooking: '2024-01-13',
        favoriteServices: ['House Cleaning'],
        notes: 'New customer, very satisfied with first service',
        createdAt: '2024-01-08'
      }
    ];

    setCustomers(mockCustomers);
    setFilteredCustomers(mockCustomers);
    setLoading(false);
  }, []);

  // Filter customers based on search and status
  useEffect(() => {
    let filtered = customers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'inactive': return 'bg-muted text-foreground';
      case 'new': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-foreground';
    }
  };

  const getCustomerValue = (customer) => {
    if (customer.totalSpent > 3000) return 'VIP';
    if (customer.totalSpent > 1500) return 'Regular';
    if (customer.totalSpent > 500) return 'Occasional';
    return 'New';
  };

  const getValueColor = (value) => {
    switch (value) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Regular': return 'bg-primary/10 text-primary';
      case 'Occasional': return 'bg-warning/10 text-warning';
      case 'New': return 'bg-success/10 text-success';
      default: return 'bg-muted text-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database and relationships
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/business/customer-portal/home-services/customers/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Regular clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(customers.reduce((sum, c) => sum + c.averageRating, 0) / customers.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Customer satisfaction</p>
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
                  placeholder="Search customers..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="new">New</option>
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

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{customer.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Customer since {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                      <Badge className={getValueColor(getCustomerValue(customer))}>
                        {getCustomerValue(customer)}
                      </Badge>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer.address}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Last booking: {new Date(customer.lastBooking).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {customer.totalBookings} bookings • ${customer.totalSpent.toLocaleString()} spent
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {customer.averageRating} rating
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Services & Notes */}
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-sm">Favorite Services</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {customer.favoriteServices.map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {customer.notes && (
                      <div>
                        <h4 className="font-medium text-sm">Notes</h4>
                        <p className="text-sm text-muted-foreground">{customer.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Service
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
      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No customers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Get started by adding your first customer'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => router.push('/dashboard/business/customer-portal/home-services/customers/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
