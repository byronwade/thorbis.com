"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ScrollArea } from "@components/ui/scroll-area";
import { Separator } from "@components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@components/ui/dropdown-menu";
import {
  Bell,
  BellRing,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Calendar,
  Users,
  DollarSign,
  Zap,
  TrendingUp,
  MessageSquare,
  FileText,
  Settings,
  X,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@lib/utils";

/**
 * Smart Notification Center
 * Real-time notifications with intelligent prioritization and contextual actions
 */
export default function SmartNotificationCenter({ 
  userId = "user_1",
  businessId = "business_1",
  className = ""
}) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [isOpen, setIsOpen] = useState(false);

  // Mock notification data - in real app, this would come from API/WebSocket
  useEffect(() => {
    const mockNotifications = generateMockNotifications();
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance of new notification
        const newNotification = generateRandomNotification();
        setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50
        setUnreadCount(prev => prev + 1);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Generate mock notifications
  const generateMockNotifications = () => {
    const types = [
      {
        type: 'job_completed',
        title: 'Job Completed',
        message: 'Technician John completed job #1234 at Smith Residence',
        icon: CheckCircle,
        priority: 'medium',
        category: 'operations',
        actionable: true,
        actions: [
          { label: 'View Job', action: '/dashboard/business/field-management/schedule/jobs/1234' },
          { label: 'Send Invoice', action: '/dashboard/business/field-management/invoices/create?job=1234' }
        ]
      },
      {
        type: 'payment_received',
        title: 'Payment Received',
        message: '$450.00 payment received for Invoice #INV-2024-001',
        icon: DollarSign,
        priority: 'high',
        category: 'financial',
        actionable: true,
        actions: [
          { label: 'View Invoice', action: '/dashboard/business/field-management/invoices/INV-2024-001' }
        ]
      },
      {
        type: 'schedule_conflict',
        title: 'Schedule Conflict',
        message: 'Double booking detected for tomorrow at 2:00 PM',
        icon: AlertTriangle,
        priority: 'high',
        category: 'scheduling',
        actionable: true,
        actions: [
          { label: 'Resolve Conflict', action: '/dashboard/business/field-management/schedule/conflicts' }
        ]
      },
      {
        type: 'customer_review',
        title: 'New Customer Review',
        message: 'Sarah Johnson left a 5-star review for your service',
        icon: Star,
        priority: 'low',
        category: 'customer',
        actionable: true,
        actions: [
          { label: 'View Review', action: '/dashboard/shared/marketing/reviews' }
        ]
      },
      {
        type: 'low_inventory',
        title: 'Low Inventory Alert',
        message: 'PVC Pipes (2") running low - 5 units remaining',
        icon: AlertTriangle,
        priority: 'medium',
        category: 'inventory',
        actionable: true,
        actions: [
          { label: 'Reorder', action: '/dashboard/shared/inventory/reorder' },
          { label: 'View Inventory', action: '/dashboard/shared/inventory' }
        ]
      }
    ];

    return types.map((type, index) => ({
      id: `notif_${index}`,
      ...type,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last 7 days
      read: Math.random() > 0.6 // 40% unread
    }));
  };

  const generateRandomNotification = () => {
    const types = [
      {
        type: 'new_job',
        title: 'New Job Assigned',
        message: 'Emergency plumbing job assigned to Mike Wilson',
        icon: Zap,
        priority: 'high',
        category: 'operations'
      },
      {
        type: 'estimate_approved',
        title: 'Estimate Approved',
        message: 'Customer approved estimate EST-2024-045 ($1,250)',
        icon: CheckCircle,
        priority: 'high',
        category: 'sales'
      }
    ];

    const randomType = types[Math.floor(Math.random() * types.length)];
    return {
      id: `notif_${Date.now()}`,
      ...randomType,
      timestamp: new Date(),
      read: false,
      actionable: true,
      actions: [
        { label: 'View Details', action: '/dashboard/business/field-management' }
      ]
    };
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'actionable') {
      filtered = filtered.filter(n => n.actionable);
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.category === filter);
    }
    
    // Sort by priority and timestamp
    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }, [notifications, filter]);

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Handle notification action
  const handleNotificationAction = (action, notificationId) => {
    markAsRead(notificationId);
    window.location.href = action;
    setIsOpen(false);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("relative transition-all duration-200 hover:scale-110", className)}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4 text-primary animate-pulse" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Unread Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('actionable')}>
                  Actionable
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter('operations')}>
                  Operations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('financial')}>
                  Financial
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('customer')}>
                  Customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-muted/50 transition-colors relative group",
                      !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "flex-shrink-0 p-2 rounded-full",
                        notification.priority === 'high' && "bg-red-100 dark:bg-red-900/20",
                        notification.priority === 'medium' && "bg-yellow-100 dark:bg-yellow-900/20",
                        notification.priority === 'low' && "bg-green-100 dark:bg-green-900/20"
                      )}>
                        <Icon className={cn("h-4 w-4", getPriorityColor(notification.priority))} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{notification.title}</p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                        </div>
                        
                        {/* Actions */}
                        {notification.actionable && notification.actions && (
                          <div className="flex items-center space-x-2 mt-2">
                            {notification.actions.slice(0, 2).map((action, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => handleNotificationAction(action.action, notification.id)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-center text-xs"
            onClick={() => {
              window.location.href = '/dashboard/shared/notifications';
              setIsOpen(false);
            }}
          >
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
