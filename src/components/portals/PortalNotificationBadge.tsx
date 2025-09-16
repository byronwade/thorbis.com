/**
 * Portal Notification Badge
 * Compact notification display with badge counter for headers and navbars
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Settings,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications, useNotificationConnection } from './PortalNotificationProvider';
import { PortalNotification } from './PortalNotificationCenter';

interface PortalNotificationBadgeProps {
  variant?: 'default' | 'minimal';
  maxPreviewItems?: number;
  showConnectionStatus?: boolean;
  onViewAll?: () => void;
  onNotificationClick?: (notification: PortalNotification) => void;
  className?: string;
}

const getNotificationIcon = (type: PortalNotification['type']) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-3 w-3 text-green-500" />;
    case 'warning': return <AlertCircle className="h-3 w-3 text-yellow-500" />;
    case 'error': return <AlertCircle className="h-3 w-3 text-red-500" />;
    case 'update': return <Info className="h-3 w-3 text-blue-500" />;
    default: return <Info className="h-3 w-3 text-neutral-500" />;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMins < 1) return 'now';
  if (diffInMins < 60) return `${diffInMins}m`;
  if (diffInHours < 24) return `${diffInHours}h';
  if (diffInDays < 7) return '${diffInDays}d';
  return date.toLocaleDateString();
};

function NotificationPreviewItem({ 
  notification,
  onRead,
  onClick 
}: {
  notification: PortalNotification;
  onRead: () => void;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer border-b last:border-b-0",
        !notification.read && "bg-blue-50/30 dark:bg-blue-900/10"
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 pt-0.5">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={cn(
            "text-sm font-medium line-clamp-1",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(notification.created_at)}
            </span>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {notification.message}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
              {notification.category}
            </Badge>
            {notification.priority === 'urgent' && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5">
                Urgent
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {notification.action_url && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(notification.action_url, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRead();
                }}
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortalNotificationBadge({
  variant = 'default',
  maxPreviewItems = 5,
  showConnectionStatus = true,
  onViewAll,
  onNotificationClick,
  className,
}: PortalNotificationBadgeProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const { isConnected, connectionStatus } = useNotificationConnection();
  const [isOpen, setIsOpen] = useState(false);

  // Get recent notifications for preview
  const previewNotifications = notifications
    .slice(0, maxPreviewItems)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleNotificationClick = (notification: PortalNotification) => {
    markAsRead(notification.id);
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  const handleViewAll = () => {
    onViewAll?.();
    setIsOpen(false);
  };

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("relative", className)}
        onClick={handleViewAll}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("relative", className)}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {showConnectionStatus && (
              <div className="flex items-center gap-1 mr-2">
                {isConnected ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <span className="text-xs text-muted-foreground capitalize">
                  {connectionStatus}
                </span>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {unreadCount > 0 && (
                  <DropdownMenuItem onClick={markAllAsRead}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark all as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleViewAll}>
                  <Bell className="h-4 w-4 mr-2" />
                  View all notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Notification settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Notifications List */}
        {previewNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <h4 className="font-medium mb-1">All caught up!</h4>
            <p className="text-sm text-muted-foreground">
              No new notifications to show.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-64">
              <div className="divide-y">
                {previewNotifications.map((notification) => (
                  <NotificationPreviewItem
                    key={notification.id}
                    notification={notification}
                    onRead={() => markAsRead(notification.id)}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t bg-neutral-50/50 dark:bg-neutral-800/50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-sm"
                onClick={handleViewAll}
              >
                View all notifications
                {notifications.length > maxPreviewItems && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    +{notifications.length - maxPreviewItems} more
                  </Badge>
                )}
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}