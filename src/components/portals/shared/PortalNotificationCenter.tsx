/**
 * Portal Notification Center
 * Real-time notification system for customer portals
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell,
  Check,
  X,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Package,
  Calendar,
  DollarSign,
  Wrench,
  Car,
  Home,
  Store,
  Utensils,
  Settings,
  Archive,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'update';
  category: 'system' | 'order' | 'service' | 'payment' | 'schedule' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  starred: boolean;
  portal_type: 'restaurant' | 'auto' | 'retail' | 'hs';
  created_at: string;
  expires_at?: string;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, unknown>;
}

interface PortalNotificationCenterProps {
  portalType: 'restaurant' | 'auto' | 'retail' | 'hs';
  customerId: string;
  onNotificationAction?: (notification: PortalNotification, action: 'read' | 'unread' | 'star' | 'archive' | 'delete') => void;
  onNotificationClick?: (notification: PortalNotification) => void;
}

// Mock notifications for demonstration
const mockNotifications: PortalNotification[] = [
  {
    id: 'notif_001',
    title: 'Service Appointment Confirmed',
    message: 'Your plumbing service appointment for tomorrow at 2:00 PM has been confirmed. Our technician will arrive within the scheduled window.',
    type: 'success',
    category: 'schedule',
    priority: 'medium',
    read: false,
    starred: false,
    portal_type: 'hs',
    created_at: '2024-01-20T14:30:00Z',
    action_url: '/schedule/appointments/apt_123',
    action_text: 'View Details',
    metadata: { appointment_id: 'apt_123', technician: 'John Smith' }
  },
  {
    id: 'notif_002',
    title: 'Invoice Ready for Review',
    message: 'Your invoice #INV-2024-001 for $350.00 is ready for review and payment. Due date: January 25, 2024.',
    type: 'info',
    category: 'payment',
    priority: 'high',
    read: false,
    starred: true,
    portal_type: 'hs',
    created_at: '2024-01-20T10:15:00Z',
    action_url: '/invoices/INV-2024-001',
    action_text: 'Pay Now',
    metadata: { amount: 350.00, due_date: '2024-01-25', invoice_id: 'INV-2024-001' }
  },
  {
    id: 'notif_003',
    title: 'Maintenance Reminder',
    message: 'Your HVAC system maintenance is due next week. Schedule now to ensure optimal performance.',
    type: 'warning',
    category: 'service',
    priority: 'medium',
    read: true,
    starred: false,
    portal_type: 'hs',
    created_at: '2024-01-19T16:45:00Z',
    expires_at: '2024-01-27T23:59:59Z',
    action_url: '/schedule/new?service_type=hvac_maintenance',
    action_text: 'Schedule Now',
    metadata: { service_type: 'HVAC Maintenance', property_id: 'prop_456' }
  },
  {
    id: 'notif_004',
    title: 'Order Status Update',
    message: 'Your order #ORD-2024-156 has been shipped and is on its way. Estimated delivery: January 22, 2024.',
    type: 'update',
    category: 'order',
    priority: 'medium',
    read: true,
    starred: false,
    portal_type: 'retail',
    created_at: '2024-01-19T11:20:00Z',
    action_url: '/orders/ORD-2024-156/tracking',
    action_text: 'Track Package',
    metadata: { order_id: 'ORD-2024-156', tracking_number: '1234567890', estimated_delivery: '2024-01-22' }
  },
  {
    id: 'notif_005',
    title: 'Special Promotion Available',
    message: 'Limited time offer: 20% off your next service when you schedule before January 31st. Use code SAVE20.',
    type: 'info',
    category: 'promotion',
    priority: 'low',
    read: false,
    starred: false,
    portal_type: 'hs',
    created_at: '2024-01-18T09:00:00Z',
    expires_at: '2024-01-31T23:59:59Z',
    action_url: '/schedule/new?promo=SAVE20',
    action_text: 'Book Service',
    metadata: { promo_code: 'SAVE20', discount: 20, expires: '2024-01-31' }
  },
  {
    id: 'notif_006',
    title: 'System Maintenance Notice',
    message: 'Scheduled maintenance will occur tonight from 11 PM to 2 AM EST. Some features may be temporarily unavailable.',
    type: 'warning',
    category: 'system',
    priority: 'medium',
    read: false,
    starred: false,
    portal_type: 'hs',
    created_at: '2024-01-20T08:00:00Z',
    expires_at: '2024-01-21T02:00:00Z',
    metadata: { maintenance_start: '2024-01-21T04:00:00Z', maintenance_end: '2024-01-21T07:00:00Z' }
  }
];

const getNotificationIcon = (type: PortalNotification['type']) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'update': return <Info className="h-4 w-4 text-blue-500" />;
    default: return <Info className="h-4 w-4 text-neutral-500" />;
  }
};

const getCategoryIcon = (category: PortalNotification['category']) => {
  switch (category) {
    case 'order': return <Package className="h-4 w-4" />;
    case 'service': return <Wrench className="h-4 w-4" />;
    case 'payment': return <DollarSign className="h-4 w-4" />;
    case 'schedule': return <Calendar className="h-4 w-4" />;
    case 'promotion': return <Star className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: PortalNotification['priority']) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'low': return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago';
  if (diffInDays < 7) return '${diffInDays}d ago';
  return date.toLocaleDateString();
};

function NotificationItem({ 
  notification, 
  onAction, 
  onClick 
}: { 
  notification: PortalNotification;
  onAction: (action: 'read' | 'unread' | 'star' | 'archive' | 'delete') => void;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "group border-b last:border-b-0 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer",
        !notification.read && "bg-blue-50/50 dark:bg-blue-900/10"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Status Indicator */}
        <div className="flex flex-col items-center gap-2 pt-1">
          {getNotificationIcon(notification.type)}
          {!notification.read && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={cn(
                "font-medium text-sm",
                !notification.read && "font-semibold"
              )}>
                {notification.title}
              </h4>
              {notification.starred && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
              <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                {notification.priority}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTimeAgo(notification.created_at)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onAction(notification.read ? 'unread' : 'read')}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark as {notification.read ? 'unread' : 'read'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAction('star')}>
                    <Star className="h-4 w-4 mr-2" />
                    {notification.starred ? 'Remove star' : 'Add star'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAction('archive')}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAction('delete')} className="text-red-600">
                    <X className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getCategoryIcon(notification.category)}
              <span className="text-xs text-muted-foreground capitalize">
                {notification.category}
              </span>
              {notification.expires_at && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Expires {formatTimeAgo(notification.expires_at)}
                  </div>
                </>
              )}
            </div>

            {notification.action_url && notification.action_text && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(notification.action_url, '_blank');
                }}
              >
                {notification.action_text}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortalNotificationCenter({
  portalType,
  customerId,
  onNotificationAction,
  onNotificationClick,
}: PortalNotificationCenterProps) {
  const [notifications, setNotifications] = useState<PortalNotification[]>(
    mockNotifications.filter(n => n.portal_type === portalType)
  );
  const [activeTab, setActiveTab] = useState('all');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving a new notification occasionally
      if (Math.random() < 0.1) {
        const newNotification: PortalNotification = {
          id: 'notif_${Date.now()}',
          title: 'New Update Available',
          message: 'A new feature has been added to your portal. Check it out!',
          type: 'info',
          category: 'system',
          priority: 'low',
          read: false,
          starred: false,
          portal_type: portalType,
          created_at: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [portalType]);

  const handleNotificationAction = (notification: PortalNotification, action: 'read' | 'unread' | 'star' | 'archive' | 'delete') => {
    setNotifications(prev => prev.map(n => {
      if (n.id === notification.id) {
        switch (action) {
          case 'read':
            return { ...n, read: true };
          case 'unread':
            return { ...n, read: false };
          case 'star':
            return { ...n, starred: !n.starred };
          case 'delete':
            return null; // Will be filtered out
          default:
            return n;
        }
      }
      return n;
    }).filter(Boolean) as PortalNotification[]);

    onNotificationAction?.(notification, action);
  };

  const handleNotificationClick = (notification: PortalNotification) => {
    // Mark as read when clicked
    handleNotificationAction(notification, 'read');
    onNotificationClick?.(notification);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return !notification.read;
      case 'starred':
        return notification.starred;
      case 'urgent':
        return notification.priority === 'urgent' || notification.priority === 'high';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const starredCount = notifications.filter(n => n.starred).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated with important information and updates
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notification Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Preferences
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearAllNotifications} className="text-red-600">
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="starred">
                Starred ({starredCount})
              </TabsTrigger>
              <TabsTrigger value="urgent">
                Urgent ({urgentCount})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground text-sm">
                  {activeTab === 'all' 
                    ? "You're all caught up! No notifications to show."
                    : 'No ${activeTab} notifications to show.'
                  }
                </p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onAction={(action) => handleNotificationAction(notification, action)}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}