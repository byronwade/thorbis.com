"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomeServicesBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockBookings = [
      {
        id: 1,
        customer: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 123-4567',
          address: '123 Main St, Anytown, CA 90210'
        },
        service: 'House Cleaning',
        date: '2024-01-15',
        time: '09:00',
        duration: '3 hours',
        status: 'confirmed',
        price: 150,
        notes: 'Deep cleaning requested, 3 bedrooms, 2 bathrooms',
        createdAt: '2024-01-10T10:30:00Z'
      },
      {
        id: 2,
        customer: {
          name: 'Mike Chen',
          email: 'mike.chen@email.com',
          phone: '(555) 234-5678',
          address: '456 Oak Ave, Somewhere, CA 90211'
        },
        service: 'Plumbing Repair',
        date: '2024-01-15',
        time: '14:00',
        duration: '2 hours',
        status: 'pending',
        price: 200,
        notes: 'Leaky faucet in kitchen, needs replacement',
        createdAt: '2024-01-11T15:45:00Z'
      },
      {
        id: 3,
        customer: {
          name: 'Lisa Park',
          email: 'lisa.park@email.com',
          phone: '(555) 345-6789',
          address: '789 Pine Rd, Elsewhere, CA 90212'
        },
        service: 'Landscaping',
        date: '2024-01-16',
        time: '08:00',
        duration: '4 hours',
        status: 'completed',
        price: 300,
        notes: 'Lawn mowing, hedge trimming, garden maintenance',
        createdAt: '2024-01-09T09:15:00Z'
      },
      {
        id: 4,
        customer: {
          name: 'David Wilson',
          email: 'david.wilson@email.com',
          phone: '(555) 456-7890',
          address: '321 Elm St, Nowhere, CA 90213'
        },
        service: 'HVAC Maintenance',
        date: '2024-01-17',
        time: '11:00',
        duration: '1.5 hours',
        status: 'cancelled',
        price: 120,
        notes: 'Annual AC inspection and filter replacement',
        createdAt: '2024-01-12T12:20:00Z'
      }
    ];

    setBookings(mockBookings);
    setFilteredBookings(mockBookings);
    setLoading(false);
  }, []);

  // Filter bookings based on search and status
  useEffect(() => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter]);

  const handleStatusChange = async (bookingId, newStatus) => {
    // Update booking status - replace with actual API call
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage customer appointments and service bookings
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/business/customer-portal/home-services/bookings/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
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
                  placeholder="Search customers, services..."
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{booking.service}</h3>
                      <p className="text-sm text-muted-foreground">
                        Booking #{booking.id} • Created {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </div>
                    </Badge>
                  </div>

                  {/* Customer Info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{booking.customer.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.customer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.customer.phone}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.time} ({booking.duration})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.customer.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Service Details</h4>
                    <p className="text-sm text-muted-foreground">{booking.notes}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">${booking.price}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  {booking.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Confirm
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusChange(booking.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first booking'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => router.push('/dashboard/business/customer-portal/home-services/bookings/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
