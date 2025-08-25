"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Settings,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  FileText,
  CreditCard,
  Users,
  Calendar,
  Phone
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'important' | 'info';
  category: 'invoice' | 'payment' | 'contact' | 'appointment' | 'system' | 'communication';
  timestamp: Date;
  read: boolean;
  actions?: {
    label: string;
    action: string;
    icon?: React.ReactNode;
  }[];
}

interface EnhancedNotificationsProps {
  className?: string;
}

const EnhancedNotifications: React.FC<EnhancedNotificationsProps> = ({ 
  className = '' 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showRead, setShowRead] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  // Mock notifications - in real app, this would come from API
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Payment Received',
      message: 'Invoice #1234 has been paid by John Doe',
      type: 'important',
      category: 'payment',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      actions: [
        { label: 'View Invoice', action: 'view_invoice', icon: <FileText className="h-3 w-3" /> },
        { label: 'Mark Read', action: 'mark_read', icon: <CheckCircle className="h-3 w-3" /> }
      ]
    },
    {
      id: '2',
      title: 'System Maintenance',
      message: 'Scheduled maintenance in 30 minutes. Service may be briefly unavailable.',
      type: 'urgent',
      category: 'system',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      actions: [
        { label: 'Dismiss', action: 'dismiss', icon: <XCircle className="h-3 w-3" /> }
      ]
    },
    {
      id: '3',
      title: 'New Contact Added',
      message: 'Sarah Manager has been added to your contacts',
      type: 'info',
      category: 'contact',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      actions: [
        { label: 'View Contact', action: 'view_contact', icon: <Users className="h-3 w-3" /> }
      ]
    },
    {
      id: '4',
      title: 'Appointment Reminder',
      message: 'You have a meeting with ABC Corp in 1 hour',
      type: 'important',
      category: 'appointment',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      read: false,
      actions: [
        { label: 'View Calendar', action: 'view_calendar', icon: <Calendar className="h-3 w-3" /> },
        { label: 'Reschedule', action: 'reschedule', icon: <Clock className="h-3 w-3" /> }
      ]
    },
    {
      id: '5',
      title: 'Invoice Overdue',
      message: 'Invoice #1235 is 5 days overdue. Consider sending a reminder.',
      type: 'urgent',
      category: 'invoice',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: false,
      actions: [
        { label: 'Send Reminder', action: 'send_reminder', icon: <FileText className="h-3 w-3" /> },
        { label: 'View Invoice', action: 'view_invoice', icon: <FileText className="h-3 w-3" /> }
      ]
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.type === 'urgent' && !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'important':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'invoice':
        return <FileText className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'contact':
        return <Users className="h-4 w-4" />;
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'communication':
        return <Phone className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleAction = (notificationId: string, action: string) => {
    switch (action) {
      case 'mark_read':
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        break;
      case 'dismiss':
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        break;
      case 'view_invoice':
        // Navigate to invoice
        console.log('Navigate to invoice');
        break;
      case 'view_contact':
        // Navigate to contact
        console.log('Navigate to contact');
        break;
      case 'view_calendar':
        // Navigate to calendar
        console.log('Navigate to calendar');
        break;
      case 'send_reminder':
        // Send reminder
        console.log('Send reminder');
        break;
      case 'reschedule':
        // Reschedule appointment
        console.log('Reschedule appointment');
        break;
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (!showRead && notification.read) return false;
    if (filter !== 'all' && notification.category !== filter) return false;
    return true;
  });

  const categories = [
    { id: 'all', label: 'All', icon: <Bell className="h-4 w-4" /> },
    { id: 'invoice', label: 'Invoices', icon: <FileText className="h-4 w-4" /> },
    { id: 'payment', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'contact', label: 'Contacts', icon: <Users className="h-4 w-4" /> },
    { id: 'appointment', label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
    { id: 'system', label: 'System', icon: <Settings className="h-4 w-4" /> }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`relative h-7 w-7 rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 ${className}`}
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5 text-foreground" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          {urgentCount > 0 && (
            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-2 z-[10001] max-h-[600px] overflow-y-auto">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {unreadCount} unread • {urgentCount} urgent
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-6 w-6 p-0"
                title="Mark all as read"
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-6 w-6 p-0"
                title="Clear all"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Filters */}
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRead(!showRead)}
              className="h-6 px-2 text-xs"
            >
              {showRead ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showRead ? 'Hide Read' : 'Show Read'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={filter === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(category.id)}
                className="h-6 px-2 text-xs"
              >
                {category.icon}
                <span className="ml-1">{category.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />
        
        {/* Notifications List */}
        <DropdownMenuGroup>
          {filteredNotifications.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <DropdownMenuItem key={notification.id} className="p-3 border-b last:border-b-0">
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getCategoryIcon(notification.category)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {notification.category}
                      </span>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      )}
                    </div>
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="flex space-x-1 mt-2">
                        {notification.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(notification.id, action.action)}
                            className="h-6 px-2 text-xs"
                          >
                            {action.icon}
                            <span className="ml-1">{action.label}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        
        {filteredNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Button variant="ghost" className="w-full justify-center text-xs">
                  View All Notifications
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnhancedNotifications;
