/**
 * Portal Notification Provider
 * Real-time notification management with WebSocket support
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { PortalNotification } from './PortalNotificationCenter';

interface NotificationContextType {
  notifications: PortalNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<PortalNotification, 'id' | 'created_at'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  toggleStar: (notificationId: string) => void;
  clearAll: () => void;
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface PortalNotificationProviderProps {
  children: React.ReactNode;
  portalType: 'restaurant' | 'auto' | 'retail' | 'hs';
  customerId: string;
  organizationId: string;
  accessToken: string;
  enableRealTime?: boolean;
  enableToasts?: boolean;
  maxNotifications?: number;
}

export function PortalNotificationProvider({
  children,
  portalType,
  customerId,
  organizationId,
  accessToken,
  enableRealTime = true,
  enableToasts = true,
  maxNotifications = 100,
}: PortalNotificationProviderProps) {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  // Initialize WebSocket connection for real-time notifications
  useEffect(() => {
    if (!enableRealTime) return;

    let ws: WebSocket;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 1000; // Start with 1 second

    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      
      // In a real implementation, this would be your WebSocket endpoint
      const wsUrl = 'wss://api.thorbis.com/ws/notifications?token=${accessToken}&customer=${customerId}&org=${organizationId}';
      
      // For demo purposes, we'll simulate a WebSocket connection
      try {
        // This would be: ws = new WebSocket(wsUrl);
        // For demo, we'll create a mock connection
        ws = {
          close: () => {},
          send: () => {},
          readyState: WebSocket.OPEN,
        } as any;

        // Simulate connection events
        setTimeout(() => {
          setConnectionStatus('connected');
          setWebsocket(ws);
          reconnectAttempts = 0;

          // Simulate receiving notifications
          const simulateNotifications = () => {
            const notificationTypes = [
              {
                title: 'Service Update',
                message: 'Your scheduled service has been updated.',
                type: 'info' as const,
                category: 'service' as const,
                priority: 'medium' as const,
              },
              {
                title: 'Payment Reminder',
                message: 'Your payment is due in 3 days.',
                type: 'warning' as const,
                category: 'payment' as const,
                priority: 'high' as const,
              },
              {
                title: 'Order Shipped',
                message: 'Your order has been shipped and is on the way.',
                type: 'success' as const,
                category: 'order' as const,
                priority: 'medium' as const,
              },
            ];

            // Send a random notification every 30-60 seconds
            const randomDelay = 30000 + Math.random() * 30000;
            setTimeout(() => {
              const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
              addNotification({
                ...randomNotification,
                portal_type: portalType,
                read: false,
                starred: false,
              });
              simulateNotifications(); // Schedule next notification
            }, randomDelay);
          };

          // Start simulating notifications after a short delay
          setTimeout(simulateNotifications, 10000);
        }, 1000);

        // Handle connection close
        const handleClose = () => {
          setConnectionStatus('disconnected');
          setWebsocket(null);

          // Attempt to reconnect
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = reconnectDelay * Math.pow(2, reconnectAttempts - 1);
            setTimeout(connectWebSocket, delay);
          } else {
            setConnectionStatus('error');
          }
        };

        // In a real WebSocket implementation:
        // ws.onopen = () => { ... };
        // ws.onmessage = (event) => { ... };
        // ws.onclose = handleClose;
        // ws.onerror = () => setConnectionStatus('error');

      } catch (error) {
        console.error('WebSocket connection error:', error);
        setConnectionStatus('error');
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [enableRealTime, accessToken, customerId, organizationId, portalType]);

  // Load initial notifications
  useEffect(() => {
    const loadInitialNotifications = async () => {
      try {
        // In a real implementation, this would fetch from your API
        // const response = await fetch('/api/v1/${portalType}/notifications?customer_id=${customerId}', {
        //   headers: { 'Authorization': 'Bearer ${accessToken}' }
        // });
        // const data = await response.json();
        // setNotifications(data.notifications || []);

        // For demo, we'll use mock data
        const mockInitialNotifications: PortalNotification[] = [
          {
            id: 'initial_1',
            title: 'Welcome to Your Portal',
            message: 'Welcome to your customer portal! Here you can manage your account, view services, and stay updated.',
            type: 'info',
            category: 'system',
            priority: 'medium',
            read: false,
            starred: false,
            portal_type: portalType,
            created_at: new Date().toISOString(),
            action_url: '/portal/help',
            action_text: 'Learn More',
          },
        ];

        setNotifications(mockInitialNotifications);
      } catch (error) {
        console.error('Failed to load initial notifications:', error);
      }
    };

    loadInitialNotifications();
  }, [portalType, customerId, accessToken]);

  const addNotification = useCallback((notificationData: Omit<PortalNotification, 'id' | 'created_at'>) => {
    const newNotification: PortalNotification = {
      ...notificationData,
      id: 'notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      created_at: new Date().toISOString(),
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Limit total notifications
      if (updated.length > maxNotifications) {
        return updated.slice(0, maxNotifications);
      }
      return updated;
    });

    // Show toast notification if enabled
    if (enableToasts) {
      const toastOptions = {
        description: notificationData.message,
        action: notificationData.action_url && notificationData.action_text ? {
          label: notificationData.action_text,
          onClick: () => window.open(notificationData.action_url, '_blank'),
        } : undefined,
      };

      switch (notificationData.type) {
        case 'success':
          toast.success(notificationData.title, toastOptions);
          break;
        case 'warning':
          toast.warning(notificationData.title, toastOptions);
          break;
        case 'error':
          toast.error(notificationData.title, toastOptions);
          break;
        default:
          toast.info(notificationData.title, toastOptions);
      }
    }

    // Send read receipt to server
    // In a real implementation:
    // fetch('/api/v1/${portalType}/notifications', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': 'Bearer ${accessToken}',
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(notificationData)
    // });

  }, [enableToasts, portalType, accessToken, maxNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));

    // Send read status to server
    // fetch('/api/v1/${portalType}/notifications/${notificationId}/read', {
    //   method: 'PUT',
    //   headers: { 'Authorization`: `Bearer ${accessToken}' }
    // });
  }, [portalType, accessToken]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Send batch read status to server
    // fetch('/api/v1/${portalType}/notifications/mark-all-read', {
    //   method: 'PUT',
    //   headers: { 'Authorization`: `Bearer ${accessToken}' }
    // });
  }, [portalType, accessToken]);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    // Delete from server
    // fetch('/api/v1/${portalType}/notifications/${notificationId}', {
    //   method: 'DELETE',
    //   headers: { 'Authorization`: `Bearer ${accessToken}' }
    // });
  }, [portalType, accessToken]);

  const toggleStar = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, starred: !n.starred } : n
    ));

    // Update star status on server
    // const notification = notifications.find(n => n.id === notificationId);
    // if (notification) {
    //   fetch('/api/v1/${portalType}/notifications/${notificationId}/star', {
    //     method: 'PUT',
    //     headers: {
    //       'Authorization': 'Bearer ${accessToken}',
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ starred: !notification.starred })
    //   });
    // }
  }, [portalType, accessToken]);

  const clearAll = useCallback(() => {
    setNotifications([]);

    // Clear all on server
    // fetch('/api/v1/${portalType}/notifications/clear-all', {
    //   method: 'DELETE',
    //   headers: { 'Authorization': 'Bearer ${accessToken}' }
    // });
  }, [portalType, accessToken]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isConnected = connectionStatus === 'connected';

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    toggleStar,
    clearAll,
    isConnected,
    connectionStatus,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a PortalNotificationProvider');
  }
  return context;
}

// Hook for easy access to just the unread count (useful for badges)
export function useUnreadCount() {
  const { unreadCount } = useNotifications();
  return unreadCount;
}

// Hook for connection status
export function useNotificationConnection() {
  const { isConnected, connectionStatus } = useNotifications();
  return { isConnected, connectionStatus };
}