'use client';

import { EventEmitter } from 'events';

/**
 * Notification Service for Investment Platform
 * 
 * This service provides comprehensive notification capabilities for the
 * investment platform, including real-time price alerts, portfolio
 * updates, trading notifications, and system alerts.
 * 
 * Features:
 * - Real-time price alerts and thresholds
 * - Portfolio performance notifications
 * - Trading execution confirmations
 * - Risk management alerts
 * - System status notifications
 * - Multi-channel delivery (email, SMS, push, in-app)
 * - User preference management
 * - Notification history and analytics
 * 
 * Delivery Channels:
 * - In-app notifications (real-time)
 * - Email notifications (batch and immediate)
 * - SMS notifications (critical alerts)
 * - Push notifications (mobile app)
 * - Webhook notifications (API integrations)
 */

interface NotificationPreferences {
  userId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
    webhook?: string;
  };
  categories: {
    priceAlerts: boolean;
    portfolioUpdates: boolean;
    tradingUpdates: boolean;
    riskAlerts: boolean;
    systemAlerts: boolean;
    newsAndInsights: boolean;
  };
  frequency: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    timezone: string;
  };
}

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
}

enum NotificationType {
  PRICE_ALERT = 'price_alert',
  PRICE_TARGET_HIT = 'price_target_hit',
  PORTFOLIO_MILESTONE = 'portfolio_milestone',
  PORTFOLIO_REBALANCED = 'portfolio_rebalanced',
  TRADE_EXECUTED = 'trade_executed',
  TRADE_FAILED = 'trade_failed',
  ORDER_FILLED = 'order_filled',
  ORDER_CANCELLED = 'order_cancelled',
  DIVIDEND_RECEIVED = 'dividend_received',
  MARGIN_CALL = 'margin_call',
  RISK_THRESHOLD_EXCEEDED = 'risk_threshold_exceeded',
  ACCOUNT_LOCKED = 'account_locked',
  LOGIN_DETECTED = 'login_detected',
  PASSWORD_CHANGED = 'password_changed',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  MARKET_CLOSED = 'market_closed',
  NEWS_ALERT = 'news_alert'
}

enum NotificationCategory {
  PRICE_ALERTS = 'price_alerts',
  PORTFOLIO_UPDATES = 'portfolio_updates',
  TRADING_UPDATES = 'trading_updates',
  RISK_ALERTS = 'risk_alerts',
  SYSTEM_ALERTS = 'system_alerts',
  NEWS_AND_INSIGHTS = 'news_and_insights'
}

enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook'
}

interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  condition: 'above' | 'below' | 'change_percent';
  threshold: number;
  currentPrice?: number;
  isActive: boolean;
  triggeredAt?: string;
  message?: string;
}

interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  variables: string[];
  channels: NotificationChannel[];
  priority: Notification['priority'];
}

/**
 * Main Notification Service
 */
export class NotificationService extends EventEmitter {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private priceAlerts: Map<string, PriceAlert> = new Map();
  private templates: Map<NotificationType, NotificationTemplate> = new Map();
  private deliveryQueue: Notification[] = [];
  private isProcessingQueue = false;

  constructor() {
    super();
    this.initializeTemplates();
    this.startQueueProcessor();
    this.setupMarketDataListener();
  }

  /**
   * Create and send a notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    data: {
      title?: string;
      message?: string;
      priority?: Notification['priority'];
      actionUrl?: string;
      actionText?: string;
      customData?: Record<string, unknown>;
      scheduleFor?: string;
      expiresAt?: string;
    }
  ): Promise<string> {
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`No template found for notification type: ${type}');
    }

    const userPrefs = this.getUserPreferences(userId);
    const category = this.getNotificationCategory(type);

    // Check if user wants this type of notification
    if (!this.shouldSendNotification(userPrefs, category, data.priority || template.priority)) {
      console.log('Notification blocked by user preferences: ${type} for user ${userId}');
      return ';
    }

    const notificationId = this.generateNotificationId();
    
    const notification: Notification = {
      id: notificationId,
      userId,
      type,
      category,
      priority: data.priority || template.priority,
      title: data.title || this.renderTemplate(template.title, data.customData || {}),
      message: data.message || this.renderTemplate(template.message, data.customData || {}),
      data: data.customData,
      channels: this.determineChannels(userPrefs, category, data.priority || template.priority),
      status: data.scheduleFor ? 'pending' : 'pending',
      createdAt: new Date().toISOString(),
      scheduledAt: data.scheduleFor,
      expiresAt: data.expiresAt,
      actionUrl: data.actionUrl,
      actionText: data.actionText
    };

    this.notifications.set(notificationId, notification);

    // Add to delivery queue or schedule
    if (data.scheduleFor) {
      setTimeout(() => {
        this.addToDeliveryQueue(notification);
      }, new Date(data.scheduleFor).getTime() - Date.now());
    } else {
      this.addToDeliveryQueue(notification);
    }

    // Emit event for real-time updates
    this.emit('notificationCreated', notification);

    return notificationId;
  }

  /**
   * Create a price alert
   */
  createPriceAlert(
    userId: string,
    symbol: string,
    condition: PriceAlert['condition`],
    threshold: number,
    message?: string
  ): string {
    const alertId = this.generateAlertId();
    
    const alert: PriceAlert = {
      id: alertId,
      userId,
      symbol: symbol.toUpperCase(),
      condition,
      threshold,
      isActive: true,
      message
    };

    this.priceAlerts.set(alertId, alert);
    
    console.log(`Price alert created: ${symbol} ${condition} ${threshold} for user ${userId}');
    
    return alertId;
  }

  /**
   * Update user notification preferences
   */
  updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const existingPrefs = this.preferences.get(userId) || this.getDefaultPreferences(userId);
    const updatedPrefs = { ...existingPrefs, ...preferences };
    
    this.preferences.set(userId, updatedPrefs);
    
    console.log('Updated notification preferences for user: ${userId}');
  }

  /**
   * Get user's notification preferences'
   */
  getUserPreferences(userId: string): NotificationPreferences {
    return this.preferences.get(userId) || this.getDefaultPreferences(userId);
  }

  /**
   * Get user's notifications'
   */
  getUserNotifications(
    userId: string,
    filters?: {
      category?: NotificationCategory;
      status?: Notification['status'];
      priority?: Notification['priority'];
      limit?: number;
      offset?: number;
    }
  ): Notification[] {
    let notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);

    if (filters?.category) {
      notifications = notifications.filter(n => n.category === filters.category);
    }

    if (filters?.status) {
      notifications = notifications.filter(n => n.status === filters.status);
    }

    if (filters?.priority) {
      notifications = notifications.filter(n => n.priority === filters.priority);
    }

    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    if (filters?.offset || filters?.limit) {
      const start = filters.offset || 0;
      const end = filters.limit ? start + filters.limit : undefined;
      notifications = notifications.slice(start, end);
    }

    return notifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string, userId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.userId !== userId) {
      return false;
    }

    notification.status = 'delivered';
    notification.deliveredAt = new Date().toISOString();
    
    this.emit('notificationRead', notification);
    
    return true;
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string, userId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.userId !== userId) {
      return false;
    }

    this.notifications.delete(notificationId);
    return true;
  }

  /**
   * Get user's active price alerts'
   */
  getUserPriceAlerts(userId: string): PriceAlert[] {
    return Array.from(this.priceAlerts.values())
      .filter(alert => alert.userId === userId && alert.isActive);
  }

  /**
   * Deactivate a price alert
   */
  deactivatePriceAlert(alertId: string, userId: string): boolean {
    const alert = this.priceAlerts.get(alertId);
    if (!alert || alert.userId !== userId) {
      return false;
    }

    alert.isActive = false;
    return true;
  }

  /**
   * Process price updates and trigger alerts
   */
  processPriceUpdate(symbol: string, price: number, changePercent: number): void {
    const relevantAlerts = Array.from(this.priceAlerts.values())
      .filter(alert => alert.symbol === symbol && alert.isActive);

    for (const alert of relevantAlerts) {
      let shouldTrigger = false;

      switch (alert.condition) {
        case 'above':
          shouldTrigger = price >= alert.threshold;
          break;
        case 'below':
          shouldTrigger = price <= alert.threshold;
          break;
        case 'change_percent':
          shouldTrigger = Math.abs(changePercent) >= alert.threshold;
          break;
      }

      if (shouldTrigger) {
        this.triggerPriceAlert(alert, price, changePercent);
      }
    }
  }

  /**
   * Send portfolio update notification
   */
  async sendPortfolioUpdate(
    userId: string,
    portfolioId: string,
    updateType: 'milestone' | 'rebalanced' | 'performance',
    data: Record<string, unknown>
  ): Promise<void> {
    let notificationType: NotificationType;
    const customData = { portfolioId, ...data };

    switch (updateType) {
      case 'milestone':
        notificationType = NotificationType.PORTFOLIO_MILESTONE;
        break;
      case 'rebalanced':
        notificationType = NotificationType.PORTFOLIO_REBALANCED;
        break;
      case 'performance':
        notificationType = NotificationType.PORTFOLIO_MILESTONE;
        customData.updateType = 'performance';
        break;
    }

    await this.createNotification(userId, notificationType, {
      customData,
      priority: 'medium',
      actionUrl: '/investments/portfolio/${portfolioId}',
      actionText: 'View Portfolio'
    });
  }

  /**
   * Send trading notification
   */
  async sendTradingNotification(
    userId: string,
    type: 'executed' | 'failed' | 'filled' | 'cancelled',
    tradeData: {
      symbol: string;
      side: 'buy' | 'sell';
      quantity: number;
      price?: number;
      orderId: string;
      reason?: string;
    }
  ): Promise<void> {
    const notificationTypeMap = {
      executed: NotificationType.TRADE_EXECUTED,
      failed: NotificationType.TRADE_FAILED,
      filled: NotificationType.ORDER_FILLED,
      cancelled: NotificationType.ORDER_CANCELLED
    };

    await this.createNotification(userId, notificationTypeMap[type], {
      customData: tradeData,
      priority: type === 'failed' ? 'high' : 'medium',
      actionUrl: '/investments/orders/${tradeData.orderId}',
      actionText: 'View Order'
    });
  }

  // Private helper methods

  private initializeTemplates(): void {
    const templates: Array<[NotificationType, NotificationTemplate]> = [
      [NotificationType.PRICE_ALERT, {
        type: NotificationType.PRICE_ALERT,
        title: 'Price Alert: {{symbol}}',
        message: '{{symbol}} has {{condition}} your target price of ${{threshold}}. Current price: ${{currentPrice}}',
        variables: ['symbol', 'condition', 'threshold', 'currentPrice'],
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        priority: 'medium'
      }],
      [NotificationType.PORTFOLIO_MILESTONE, {
        type: NotificationType.PORTFOLIO_MILESTONE,
        title: 'Portfolio Milestone Reached',
        message: 'Your portfolio has reached a significant milestone: {{milestone}}',
        variables: ['milestone'],
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        priority: 'medium'
      }],
      [NotificationType.TRADE_EXECUTED, {
        type: NotificationType.TRADE_EXECUTED,
        title: 'Trade Executed',
        message: 'Your {{side}} order for {{quantity}} shares of {{symbol}} has been executed at ${{price}}',
        variables: ['side', 'quantity', 'symbol', 'price'],
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        priority: 'medium'
      }],
      [NotificationType.RISK_THRESHOLD_EXCEEDED, {
        type: NotificationType.RISK_THRESHOLD_EXCEEDED,
        title: 'Risk Alert',
        message: 'Your portfolio risk level has exceeded your threshold. Current risk: {{currentRisk}}',
        variables: ['currentRisk'],
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
        priority: 'high`
      }]
    ];

    templates.forEach(([type, template]) => {
      this.templates.set(type, template);
    });
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
  }

  private generateAlertId(): string {
    return 'alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: true
      },
      categories: {
        priceAlerts: true,
        portfolioUpdates: true,
        tradingUpdates: true,
        riskAlerts: true,
        systemAlerts: true,
        newsAndInsights: false
      },
      frequency: {
        immediate: true,
        daily: false,
        weekly: false
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'America/New_York'
      }
    };
  }

  private getNotificationCategory(type: NotificationType): NotificationCategory {
    const categoryMap = {
      [NotificationType.PRICE_ALERT]: NotificationCategory.PRICE_ALERTS,
      [NotificationType.PRICE_TARGET_HIT]: NotificationCategory.PRICE_ALERTS,
      [NotificationType.PORTFOLIO_MILESTONE]: NotificationCategory.PORTFOLIO_UPDATES,
      [NotificationType.PORTFOLIO_REBALANCED]: NotificationCategory.PORTFOLIO_UPDATES,
      [NotificationType.TRADE_EXECUTED]: NotificationCategory.TRADING_UPDATES,
      [NotificationType.TRADE_FAILED]: NotificationCategory.TRADING_UPDATES,
      [NotificationType.ORDER_FILLED]: NotificationCategory.TRADING_UPDATES,
      [NotificationType.ORDER_CANCELLED]: NotificationCategory.TRADING_UPDATES,
      [NotificationType.DIVIDEND_RECEIVED]: NotificationCategory.PORTFOLIO_UPDATES,
      [NotificationType.MARGIN_CALL]: NotificationCategory.RISK_ALERTS,
      [NotificationType.RISK_THRESHOLD_EXCEEDED]: NotificationCategory.RISK_ALERTS,
      [NotificationType.ACCOUNT_LOCKED]: NotificationCategory.SYSTEM_ALERTS,
      [NotificationType.LOGIN_DETECTED]: NotificationCategory.SYSTEM_ALERTS,
      [NotificationType.PASSWORD_CHANGED]: NotificationCategory.SYSTEM_ALERTS,
      [NotificationType.SYSTEM_MAINTENANCE]: NotificationCategory.SYSTEM_ALERTS,
      [NotificationType.MARKET_CLOSED]: NotificationCategory.SYSTEM_ALERTS,
      [NotificationType.NEWS_ALERT]: NotificationCategory.NEWS_AND_INSIGHTS
    };

    return categoryMap[type] || NotificationCategory.SYSTEM_ALERTS;
  }

  private shouldSendNotification(
    prefs: NotificationPreferences,
    category: NotificationCategory,
    priority: Notification['priority']
  ): boolean {
    // Always send critical notifications
    if (priority === 'critical') return true;

    // Check category preferences
    const categoryEnabled = prefs.categories[category as keyof typeof prefs.categories];
    if (!categoryEnabled) return false;

    // Check quiet hours for non-critical notifications
    if (prefs.quietHours.enabled && this.isInQuietHours(prefs.quietHours)) {
      return priority === 'high';
    }

    return true;
  }

  private isInQuietHours(quietHours: NotificationPreferences['quietHours']): boolean {
    // Simple implementation - in production, use proper timezone handling
    const now = new Date();
    const currentTime = '${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}';
    
    return currentTime >= quietHours.startTime || currentTime <= quietHours.endTime;
  }

  private determineChannels(
    prefs: NotificationPreferences,
    category: NotificationCategory,
    priority: Notification['priority']
  ): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    // Always include in-app for immediate visibility
    if (prefs.channels.inApp) {
      channels.push(NotificationChannel.IN_APP);
    }

    // Add email for medium+ priority
    if (prefs.channels.email && (priority === 'medium' || priority === 'high' || priority === 'critical')) {
      channels.push(NotificationChannel.EMAIL);
    }

    // Add SMS for high/critical priority
    if (prefs.channels.sms && (priority === 'high' || priority === 'critical')) {
      channels.push(NotificationChannel.SMS);
    }

    // Add push notifications
    if (prefs.channels.push) {
      channels.push(NotificationChannel.PUSH);
    }

    return channels;
  }

  private renderTemplate(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key]?.toString() || match;
    });
  }

  private addToDeliveryQueue(notification: Notification): void {
    this.deliveryQueue.push(notification);
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      if (!this.isProcessingQueue && this.deliveryQueue.length > 0) {
        this.processDeliveryQueue();
      }
    }, 1000); // Process queue every second
  }

  private async processDeliveryQueue(): Promise<void> {
    this.isProcessingQueue = true;

    while (this.deliveryQueue.length > 0) {
      const notification = this.deliveryQueue.shift()!;
      await this.deliverNotification(notification);
    }

    this.isProcessingQueue = false;
  }

  private async deliverNotification(notification: Notification): Promise<void> {
    try {
      console.log('Delivering notification: ${notification.id} via channels: ${notification.channels.join(', ')}');

      // Simulate delivery to different channels
      for (const channel of notification.channels) {
        await this.deliverToChannel(notification, channel);
      }

      notification.status = 'sent';
      notification.sentAt = new Date().toISOString();

      this.emit('notificationSent', notification);

    } catch (error) {
      console.error('Failed to deliver notification ${notification.id}:', error);
      notification.status = 'failed';
    }
  }

  private async deliverToChannel(notification: Notification, channel: NotificationChannel): Promise<void> {
    // Mock delivery implementations
    // In production, integrate with actual services (SendGrid, Twilio, Firebase, etc.)
    
    switch (channel) {
      case NotificationChannel.IN_APP:
        // Real-time delivery via WebSocket or Server-Sent Events
        this.emit('inAppNotification`, notification);
        break;
        
      case NotificationChannel.EMAIL:
        // Email delivery via SendGrid, AWS SES, etc.
        console.log(`📧 Email sent to user ${notification.userId}: ${notification.title}`);
        break;
        
      case NotificationChannel.SMS:
        // SMS delivery via Twilio, AWS SNS, etc.
        console.log(`📱 SMS sent to user ${notification.userId}: ${notification.title}`);
        break;
        
      case NotificationChannel.PUSH:
        // Push notification via Firebase, Apple Push, etc.
        console.log(`🔔 Push notification sent to user ${notification.userId}: ${notification.title}');
        break;
        
      case NotificationChannel.WEBHOOK:
        // Webhook delivery to external systems
        console.log('🔗 Webhook sent for user ${notification.userId}: ${notification.title}');
        break;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private triggerPriceAlert(alert: PriceAlert, currentPrice: number, changePercent: number): void {
    alert.triggeredAt = new Date().toISOString();
    alert.isActive = false; // One-time alert
    alert.currentPrice = currentPrice;

    const conditionText = alert.condition === 'above' ? 'risen above' :
                         alert.condition === 'below' ? 'fallen below' :
                         'changed by';

    this.createNotification(alert.userId, NotificationType.PRICE_ALERT, {
      customData: {
        symbol: alert.symbol,
        condition: conditionText,
        threshold: alert.threshold,
        currentPrice,
        changePercent
      },
      priority: 'medium',
      actionUrl: '/investments/trading?symbol=${alert.symbol}',
      actionText: 'View Chart'
    });
  }

  private setupMarketDataListener(): void {
    // Mock market data listener
    // In production, integrate with real-time market data service
    setInterval(() => {
      // Simulate price updates for common stocks
      const mockPrices = [
        { symbol: 'AAPL', price: 150 + Math.random() * 20, change: (Math.random() - 0.5) * 10 },
        { symbol: 'GOOGL', price: 2800 + Math.random() * 200, change: (Math.random() - 0.5) * 5 },
        { symbol: 'TSLA', price: 800 + Math.random() * 100, change: (Math.random() - 0.5) * 15 }
      ];

      for (const { symbol, price, change } of mockPrices) {
        this.processPriceUpdate(symbol, price, change);
      }
    }, 10000); // Check every 10 seconds
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export { NotificationType, NotificationCategory, NotificationChannel };
export type { Notification, NotificationPreferences, PriceAlert };
export default notificationService;