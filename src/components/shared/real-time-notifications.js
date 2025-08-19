"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { ScrollArea } from "@components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger
} from "@components/ui/dropdown-menu";
import { 
  Bell, 
  BellRing, 
  Check, 
  Star, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@store/auth";
import logger from "@lib/utils/logger";

/**
 * Real-time Notifications Component
 * Features: WebSocket integration, categorized notifications, smart filtering, persistence
 */
export default function RealTimeNotifications({ 
  dashboardType = "business",
  onNotificationClick,
  className = ""
}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unread, important
  const [ws, setWs] = useState(null);
  
  const { user } = useAuthStore();

  // Performance tracking
  const startTime = performance.now();

  // Mock notifications for demo (in production, these would come from WebSocket/API)
  const mockNotifications = useMemo(() => [
    {
      id: "1",
      type: "review",
      title: "New 5-star review",
      message: "John D. left a great review for your plumbing service",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      important: true,
      actionUrl: "/dashboard/business/reviews",
      avatar: "https://vercel.com/api/www/avatar?u=johnd&s=64",
      category: "reviews"
    },
    {
      id: "2", 
      type: "job",
      title: "New job request",
      message: "Emergency plumbing repair requested in downtown area",
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      important: true,
      actionUrl: "/dashboard/business/jobs",
      category: "jobs"
    },
    {
      id: "3",
      type: "payment",
      title: "Payment received",
      message: "$350.00 payment processed for invoice #1234",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      important: false,
      actionUrl: "/dashboard/business/invoices",
      category: "payments"
    },
    {
      id: "4",
      type: "system",
      title: "System maintenance",
      message: "Scheduled maintenance completed successfully",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
      important: false,
      actionUrl: null,
      category: "system"
    },
    {
      id: "5",
      type: "customer",
      title: "New customer signup",
      message: "Sarah M. joined your customer portal",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: false,
      important: false,
      actionUrl: "/dashboard/business/customers",
      avatar: "https://vercel.com/api/www/avatar?u=sarahm&s=64",
      category: "customers"
    }
  ], []);

  // Initialize notifications
  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [mockNotifications]);

  // WebSocket connection (mock implementation)
  useEffect(() => {
    if (!user) return;

    // In production, this would connect to actual WebSocket
    const mockWs = {
      send: (data) => console.log('WS Send:', data),
      close: () => console.log('WS Closed'),
      onmessage: null,
      onopen: null,
      onerror: null
    };

    setWs(mockWs);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 30 seconds
        const newNotification = {
          id: Date.now().toString(),
          type: ["review", "job", "payment", "customer"][Math.floor(Math.random() * 4)],
          title: "New notification",
          message: "Real-time notification received",
          timestamp: new Date(),
          read: false,
          important: Math.random() > 0.7,
          actionUrl: "/dashboard/business",
          category: "system"
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20
        setUnreadCount(prev => prev + 1);
        
        // Log notification
        logger.debug('Notification interaction', {
          action: 'notification_received',
          type: newNotification.type,
          dashboardType,
          timestamp: Date.now(),
        });
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (mockWs) {
        mockWs.close();
      }
    };
  }, [user, dashboardType]);

  // Notification type icons and colors
  const getNotificationIcon = useCallback((type) => {
    const iconMap = {
      review: { icon: Star, color: "text-warning", bg: "bg-yellow-50 dark:bg-warning/30" },
      job: { icon: Calendar, color: "text-primary", bg: "bg-blue-50 dark:bg-primary/30" },
      payment: { icon: DollarSign, color: "text-success", bg: "bg-green-50 dark:bg-success/30" },
      customer: { icon: Users, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
      system: { icon: Info, color: "text-muted-foreground", bg: "bg-gray-50 dark:bg-card/30" },
      warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-orange-50 dark:bg-warning/30" },
      success: { icon: CheckCircle, color: "text-success", bg: "bg-green-50 dark:bg-success/30" },
      message: { icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" }
    };

    return iconMap[type] || iconMap.system;
  }, []);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (filter === "unread") return !notification.read;
      if (filter === "important") return notification.important;
      return true;
    });
  }, [notifications, filter]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, read: true }
          : n
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    logger.debug('Notification event', {
      action: 'notification_read',
      notificationId,
      dashboardType,
      timestamp: Date.now(),
    });
  }, [dashboardType]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    
    logger.debug('Notification event', {
      action: 'notifications_mark_all_read',
      count: unreadCount,
      dashboardType,
      timestamp: Date.now(),
    });
  }, [unreadCount, dashboardType]);

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    logger.debug('Notification event', {
      action: 'notification_deleted',
      notificationId,
      dashboardType,
      timestamp: Date.now(),
    });
  }, [notifications, dashboardType]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    setIsOpen(false);
  }, [markAsRead, onNotificationClick]);

  // Performance logging
  useEffect(() => {
    const renderTime = performance.now() - startTime;
    logger.performance(`RealTimeNotifications rendered in ${renderTime.toFixed(2)}ms`);
  }, [startTime]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`relative h-7 w-7 rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 transition-colors ${className}`}
        >
          {unreadCount > 0 ? (
            <BellRing className="w-3.5 h-3.5 text-primary animate-pulse" />
          ) : (
            <Bell className="w-3.5 h-3.5" />
          )}
          
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-96" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Filter buttons */}
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter("unread")}
            >
              Unread
            </Button>
            <Button
              variant={filter === "important" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter("important")}
            >
              Important
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:text-primary/80"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <ScrollArea className="max-h-96">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {filter === "unread" ? "No unread notifications" : 
                 filter === "important" ? "No important notifications" : 
                 "No notifications"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const { icon: IconComponent, color, bg } = getNotificationIcon(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`group flex items-start p-4 hover:bg-accent/50 transition-colors cursor-pointer relative ${
                      !notification.read ? "bg-blue-50/30 dark:bg-primary/10" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Read indicator */}
                    {!notification.read && (
                      <div className="absolute left-2 top-6 w-2 h-2 bg-primary rounded-full"></div>
                    )}

                    {/* Icon or Avatar */}
                    <div className="flex-shrink-0 mr-3">
                      {notification.avatar ? (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback>
                            <IconComponent className={`w-4 h-4 ${color}`} />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                          <IconComponent className={`w-4 h-4 ${color}`} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm font-medium truncate ${
                              !notification.read ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {notification.title}
                            </p>
                            {notification.important && (
                              <Star className="w-3 h-3 text-warning fill-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            title="Delete notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-3">
          <Button variant="outline" size="sm" className="w-full">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
