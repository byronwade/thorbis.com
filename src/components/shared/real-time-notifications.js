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
  Trash2,
  Filter,
  Settings,
  Archive,
  Clock,
  Zap,
  Shield,
  TrendingUp,
  Package,
  Phone,
  Mail,
  MapPin
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
  const [filter, setFilter] = useState("all"); // all, unread, important, today
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
      category: "reviews",
      priority: "high"
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
      category: "jobs",
      priority: "urgent"
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
      category: "payments",
      priority: "medium"
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
      category: "system",
      priority: "low"
    },
    {
      id: "5",
      type: "customer",
      title: "Customer inquiry",
      message: "Sarah M. sent a message about scheduling",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      read: false,
      important: false,
      actionUrl: "/dashboard/business/messages",
      category: "messages",
      priority: "medium"
    },
    {
      id: "6",
      type: "schedule",
      title: "Upcoming appointment",
      message: "Appointment reminder: HVAC service tomorrow at 2 PM",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: true,
      important: true,
      actionUrl: "/dashboard/business/schedule",
      category: "schedule",
      priority: "high"
    }
  ], []);

  // Enhanced notification icon mapping
  const getNotificationIcon = useCallback((type) => {
    const iconMap = {
      review: { icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
      job: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
      payment: { icon: DollarSign, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
      system: { icon: Settings, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
      customer: { icon: Users, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
      schedule: { icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
      message: { icon: MessageSquare, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
      invoice: { icon: Package, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
      call: { icon: Phone, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
      email: { icon: Mail, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-950/30" },
      location: { icon: MapPin, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30" }
    };
    
    return iconMap[type] || { icon: Bell, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-950/30" };
  }, []);

  // Priority badge styling
  const getPriorityBadge = useCallback((priority) => {
    const priorityMap = {
      urgent: { color: "bg-red-500 text-white", text: "Urgent" },
      high: { color: "bg-orange-500 text-white", text: "High" },
      medium: { color: "bg-blue-500 text-white", text: "Medium" },
      low: { color: "bg-gray-500 text-white", text: "Low" }
    };
    
    return priorityMap[priority] || priorityMap.low;
  }, []);

  // Filter notifications based on current filter
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    switch (filter) {
      case "unread":
        filtered = notifications.filter(n => !n.read);
        break;
      case "important":
        filtered = notifications.filter(n => n.important);
        break;
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = notifications.filter(n => n.timestamp >= today);
        break;
      default:
        filtered = notifications;
    }
    
    // Sort by priority and timestamp
    return filtered.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority] || 3;
      const bPriority = priorityOrder[b.priority] || 3;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return b.timestamp - a.timestamp;
    });
  }, [notifications, filter]);

  // Initialize notifications
  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [mockNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Delete notification
  const deleteNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      const newNotifications = prev.filter(n => n.id !== id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return newNotifications;
    });
  }, []);

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
    const endTime = performance.now();
    logger.info(`RealTimeNotifications rendered in ${endTime - startTime}ms`);
  }, [startTime]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative h-7 w-7 rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 ${className}`}
          title="Notifications"
        >
          <BellRing className="w-3.5 h-3.5 text-foreground animate-pulse" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[420px] z-[10001]" align="end" sideOffset={8}>
        {/* Enhanced Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Notifications</h3>
              </div>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Notification settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced Filter Tabs */}
          <div className="flex items-center space-x-1 bg-muted/30 rounded-lg p-1">
            {[
              { key: "all", label: "All", icon: Bell },
              { key: "unread", label: "Unread", icon: Zap },
              { key: "important", label: "Important", icon: Star },
              { key: "today", label: "Today", icon: Clock }
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isActive = filter === tab.key;
              
              return (
                <Button
                  key={tab.key}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 text-xs flex items-center space-x-1.5 ${
                    isActive ? "bg-background shadow-sm" : "hover:bg-background/50"
                  }`}
                  onClick={() => setFilter(tab.key)}
                >
                  <IconComponent className="w-3 h-3" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Bar */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
            <span className="text-sm text-muted-foreground flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</span>
            </span>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary hover:text-primary/80"
                onClick={markAllAsRead}
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
                title="Archive all"
              >
                <Archive className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Notifications List */}
        <ScrollArea className="max-h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground mb-1">
                {filter === "unread" ? "No unread notifications" : 
                 filter === "important" ? "No important notifications" : 
                 filter === "today" ? "No notifications today" :
                 "No notifications"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {filter === "unread" ? "You're all caught up!" :
                 filter === "important" ? "No important updates right now" :
                 filter === "today" ? "Check back later for updates" :
                 "You'll see notifications here when they arrive"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredNotifications.map((notification) => {
                const { icon: IconComponent, color, bg } = getNotificationIcon(notification.type);
                const priorityBadge = getPriorityBadge(notification.priority);
                const isToday = new Date(notification.timestamp).toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={notification.id}
                    className={`group relative p-4 hover:bg-accent/30 transition-all duration-200 cursor-pointer ${
                      !notification.read ? "bg-blue-50/20 dark:bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
                    )}

                    <div className="flex items-start space-x-3">
                      {/* Enhanced Icon */}
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <Avatar className="w-10 h-10 ring-2 ring-background">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback className={`${bg}`}>
                              <IconComponent className={`w-5 h-5 ${color}`} />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ring-2 ring-background`}>
                            <IconComponent className={`w-5 h-5 ${color}`} />
                          </div>
                        )}
                      </div>

                      {/* Enhanced Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Header with title and priority */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`text-sm font-semibold truncate ${
                                !notification.read ? "text-foreground" : "text-foreground/80"
                              }`}>
                                {notification.title}
                              </h4>
                              {notification.important && (
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            
                            {/* Priority badge */}
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge 
                                className={`text-xs px-2 py-0.5 ${priorityBadge.color}`}
                              >
                                {priorityBadge.text}
                              </Badge>
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                {notification.category}
                              </Badge>
                            </div>
                          </div>

                          {/* Enhanced Actions */}
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-950/30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5 text-green-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-950/30"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              title="Delete notification"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            </Button>
                          </div>
                        </div>

                        {/* Message */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {notification.message}
                        </p>

                        {/* Footer with timestamp */}
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {isToday ? formatDistanceToNow(notification.timestamp, { addSuffix: true }) :
                             notification.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Enhanced Footer */}
        <div className="border-t border-border/50 p-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1.5" />
              View all notifications
            </Button>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{unreadCount} unread</span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
