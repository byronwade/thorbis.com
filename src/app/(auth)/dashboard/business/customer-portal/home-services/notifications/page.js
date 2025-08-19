"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { 
  Bell,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  Star,
  MapPin
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomeServicesNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'booking_reminder',
        title: 'Upcoming Appointment Reminder',
        message: 'You have a house cleaning appointment tomorrow at 9:00 AM with Sarah Johnson',
        customer: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 123-4567',
          address: '123 Main St, Anytown, CA 90210'
        },
        booking: {
          id: 15,
          service: 'House Cleaning',
          date: '2024-01-16',
          time: '09:00',
          duration: '3 hours'
        },
        status: 'pending',
        priority: 'high',
        createdAt: '2024-01-14T10:30:00Z',
        scheduledFor: '2024-01-15T08:00:00Z'
      },
      {
        id: 2,
        type: 'payment_received',
        title: 'Payment Received',
        message: 'Payment of $200 received from Mike Chen for plumbing repair service',
        customer: {
          name: 'Mike Chen',
          email: 'mike.chen@email.com',
          phone: '(555) 234-5678',
          address: '456 Oak Ave, Somewhere, CA 90211'
        },
        booking: {
          id: 14,
          service: 'Plumbing Repair',
          date: '2024-01-14',
          time: '14:00',
          duration: '2 hours'
        },
        status: 'sent',
        priority: 'medium',
        createdAt: '2024-01-14T16:45:00Z',
        scheduledFor: null
      },
      {
        id: 3,
        type: 'review_received',
        title: 'New Customer Review',
        message: 'Lisa Park left a 5-star review for your landscaping service',
        customer: {
          name: 'Lisa Park',
          email: 'lisa.park@email.com',
          phone: '(555) 345-6789',
          address: '789 Pine Rd, Elsewhere, CA 90212'
        },
        booking: {
          id: 13,
          service: 'Landscaping',
          date: '2024-01-13',
          time: '08:00',
          duration: '4 hours'
        },
        status: 'pending',
        priority: 'medium',
        createdAt: '2024-01-14T12:20:00Z',
        scheduledFor: null
      },
      {
        id: 4,
        type: 'booking_cancelled',
        title: 'Appointment Cancelled',
        message: 'David Wilson cancelled his HVAC maintenance appointment for tomorrow',
        customer: {
          name: 'David Wilson',
          email: 'david.wilson@email.com',
          phone: '(555) 456-7890',
          address: '321 Elm St, Nowhere, CA 90213'
        },
        booking: {
          id: 12,
          service: 'HVAC Maintenance',
          date: '2024-01-15',
          time: '11:00',
          duration: '1.5 hours'
        },
        status: 'sent',
        priority: 'high',
        createdAt: '2024-01-14T09:15:00Z',
        scheduledFor: null
      },
      {
        id: 5,
        type: 'new_booking',
        title: 'New Booking Request',
        message: 'Emily Rodriguez has requested a house cleaning service for next week',
        customer: {
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@email.com',
          phone: '(555) 567-8901',
          address: '654 Maple Dr, Anywhere, CA 90214'
        },
        booking: {
          id: 16,
          service: 'House Cleaning',
          date: '2024-01-22',
          time: '10:00',
          duration: '2 hours'
        },
        status: 'pending',
        priority: 'high',
        createdAt: '2024-01-14T14:30:00Z',
        scheduledFor: null
      },
      {
        id: 6,
        type: 'follow_up',
        title: 'Follow-up Reminder',
        message: 'Follow up with TechCorp Inc. regarding their office cleaning quote',
        customer: {
          name: 'TechCorp Inc.',
          email: 'facilities@techcorp.com',
          phone: '(555) 678-9012',
          address: '100 Business Blvd, Tech City, CA 90215'
        },
        booking: null,
        status: 'pending',
        priority: 'medium',
        createdAt: '2024-01-14T11:00:00Z',
        scheduledFor: '2024-01-16T10:00:00Z'
      }
    ];

    setNotifications(mockNotifications);
    setFilteredNotifications(mockNotifications);
    setLoading(false);
  }, []);

  // Filter notifications based on search and filters
  useEffect(() => {
    let filtered = notifications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => notification.status === statusFilter);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter, statusFilter]);

  const handleStatusChange = async (notificationId, newStatus) => {
    // Update notification status - replace with actual API call
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId ? { ...notification, status: newStatus } : notification
    ));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'booking_reminder': return 'bg-primary/10 text-primary';
      case 'payment_received': return 'bg-success/10 text-success';
      case 'review_received': return 'bg-warning/10 text-warning';
      case 'booking_cancelled': return 'bg-destructive/10 text-destructive';
      case 'new_booking': return 'bg-purple-100 text-purple-800';
      case 'follow_up': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-foreground';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking_reminder': return <Calendar className="h-4 w-4" />;
      case 'payment_received': return <CheckCircle className="h-4 w-4" />;
      case 'review_received': return <Star className="h-4 w-4" />;
      case 'booking_cancelled': return <XCircle className="h-4 w-4" />;
      case 'new_booking': return <Plus className="h-4 w-4" />;
      case 'follow_up': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-success/10 text-success';
      default: return 'bg-muted text-foreground';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'booking_reminder': return 'Booking Reminder';
      case 'payment_received': return 'Payment Received';
      case 'review_received': return 'Review Received';
      case 'booking_cancelled': return 'Booking Cancelled';
      case 'new_booking': return 'New Booking';
      case 'follow_up': return 'Follow Up';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage customer notifications and communication
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/business/customer-portal/home-services/notifications/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => 
                n.status === 'sent' && 
                new Date(n.createdAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Notifications sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Types</option>
                <option value="booking_reminder">Booking Reminder</option>
                <option value="payment_received">Payment Received</option>
                <option value="review_received">Review Received</option>
                <option value="booking_cancelled">Booking Cancelled</option>
                <option value="new_booking">New Booking</option>
                <option value="follow_up">Follow Up</option>
              </select>
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
                <option value="sent">Sent</option>
                <option value="read">Read</option>
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
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeColor(notification.type)}>
                        {getTypeLabel(notification.type)}
                      </Badge>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      <Badge variant={notification.status === 'pending' ? 'default' : 'secondary'}>
                        {notification.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <p className="text-sm">{notification.message}</p>
                  </div>

                  {/* Customer Info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{notification.customer.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{notification.customer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{notification.customer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{notification.customer.address}</span>
                      </div>
                    </div>
                    {notification.booking && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(notification.booking.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {notification.booking.time} ({notification.booking.duration})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {notification.booking.service}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  {notification.status === 'pending' && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusChange(notification.id, 'sent')}
                    >
                      Send Now
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
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
      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'You\'re all caught up! No pending notifications'
              }
            </p>
            {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
              <Button onClick={() => router.push('/dashboard/business/customer-portal/home-services/notifications/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
