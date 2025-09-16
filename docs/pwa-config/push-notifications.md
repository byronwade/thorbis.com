# Thorbis Push Notifications System

Comprehensive push notification strategy with topic-based subscriptions for jobs, payments, and reviews across all industry verticals.

## Core Push Notification Architecture

### Service Worker Push Handler
```javascript
// sw-push-notifications.js - Service worker push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  if (!event.data) {
    console.warn('Push event has no data')
    return
  }
  
  try {
    const payload = event.data.json()
    event.waitUntil(handlePushNotification(payload))
  } catch (error) {
    console.error('Failed to parse push payload:', error)
  }
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  // Handle notification click action
  event.waitUntil(handleNotificationClick(event))
})

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
  
  // Track notification dismissal for analytics
  event.waitUntil(trackNotificationDismissal(event.notification.data))
})

async function handlePushNotification(payload) {
  const {
    title,
    body,
    icon,
    badge,
    data,
    actions,
    tag,
    requireInteraction,
    silent,
    timestamp,
    topicType,
    priority
  } = payload
  
  // Filter notifications based on user preferences
  const shouldShow = await shouldShowNotification(payload)
  if (!shouldShow) {
    console.log('Notification filtered by user preferences')
    return
  }
  
  // Apply industry-specific formatting
  const formattedPayload = await formatNotificationForIndustry(payload)
  
  // Show notification with appropriate options
  const notificationOptions = {
    body: formattedPayload.body,
    icon: formattedPayload.icon || '/icons/notification-icon-192x192.png',
    badge: formattedPayload.badge || '/icons/badge-icon-72x72.png',
    data: {
      ...formattedPayload.data,
      timestamp: timestamp || Date.now(),
      topicType,
      priority
    },
    tag: formattedPayload.tag,
    requireInteraction: formattedPayload.requireInteraction || false,
    silent: formattedPayload.silent || false,
    actions: formattedPayload.actions || [],
    vibrate: formattedPayload.vibrate || [200, 100, 200],
    renotify: formattedPayload.renotify || false
  }
  
  await self.registration.showNotification(formattedPayload.title, notificationOptions)
  
  // Track notification delivery
  await trackNotificationDelivery(payload)
}

async function handleNotificationClick(event) {
  const { notification, action } = event
  const { data } = notification
  
  // Handle different click actions
  if (action) {
    await handleNotificationAction(action, data)
  } else {
    await handleDefaultNotificationClick(data)
  }
  
  // Track click for analytics
  await trackNotificationClick(data, action)
}

async function handleDefaultNotificationClick(data) {
  const { topicType, entityId, url } = data
  
  // Determine target URL based on notification type
  let targetUrl = url
  
  if (!targetUrl) {
    switch (topicType) {
      case 'job_update':
        targetUrl = `/schedule/${entityId}`
        break
      case 'payment_received':
        targetUrl = `/invoices/${entityId}`
        break
      case 'review_received':
        targetUrl = `/reviews/${entityId}`
        break
      case 'pos_order':
        targetUrl = `/pos/orders/${entityId}`
        break
      default:
        targetUrl = '/'
    }
  }
  
  // Focus existing window or open new one
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  
  for (const client of clients) {
    if (client.url.includes(targetUrl.split('?')[0])) {
      await client.focus()
      await client.postMessage({ type: 'navigate', url: targetUrl })
      return
    }
  }
  
  // Open new window if no matching client found
  await self.clients.openWindow(targetUrl)
}
```

### Push Subscription Management
```typescript
// push-subscription-manager.ts - Client-side push subscription management
interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userId: string
  deviceId: string
  topics: string[]
  preferences: NotificationPreferences
}

interface NotificationPreferences {
  jobs: boolean
  payments: boolean
  reviews: boolean
  marketing: boolean
  system: boolean
  quietHours: {
    enabled: boolean
    start: string  // HH:MM format
    end: string    // HH:MM format
  }
  priority: {
    high: boolean
    medium: boolean
    low: boolean
  }
  industries: {
    [key: string]: boolean
  }
}

class PushSubscriptionManager {
  private subscription: PushSubscription | null = null
  private preferences: NotificationPreferences
  
  constructor() {
    this.preferences = this.loadPreferences()
  }
  
  async initialize(): Promise<void> {
    // Check if push notifications are supported
    if (!('Notification' in window) || !('PushManager' in window)) {
      console.warn('Push notifications not supported in this browser')
      return
    }
    
    // Load existing subscription
    await this.loadExistingSubscription()
    
    // Setup preference change listeners
    this.setupPreferenceListeners()
  }
  
  async requestPermission(): Promise<boolean> {
    if (Notification.permission === 'granted') {
      return true
    }
    
    if (Notification.permission === 'denied') {
      console.warn('Push notifications permission denied')
      return false
    }
    
    try {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        await this.createSubscription()
        return true
      }
      
      console.warn('Push notifications permission not granted:', permission)
      return false
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }
  
  async createSubscription(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(await this.getVapidPublicKey())
      })
      
      this.subscription = subscription
      
      // Send subscription to server
      await this.saveSubscriptionToServer(subscription)
      
      return subscription
    } catch (error) {
      console.error('Failed to create push subscription:', error)
      return null
    }
  }
  
  async subscribeToTopics(topics: string[]): Promise<void> {
    if (!this.subscription) {
      throw new Error('No active push subscription')
    }
    
    try {
      const response = await fetch('/api/push/topics/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: this.subscription,
          topics,
          preferences: this.preferences
        })
      })
      
      if (response.ok) {
        console.log('Successfully subscribed to topics:', topics)
      } else {
        throw new Error(`Topic subscription failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to subscribe to topics:', error)
      throw error
    }
  }
  
  async unsubscribeFromTopics(topics: string[]): Promise<void> {
    try {
      const response = await fetch('/api/push/topics/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: this.subscription,
          topics
        })
      })
      
      if (response.ok) {
        console.log('Successfully unsubscribed from topics:', topics)
      } else {
        throw new Error(`Topic unsubscription failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to unsubscribe from topics:', error)
      throw error
    }
  }
  
  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences }
    this.savePreferences(this.preferences)
    
    // Update server with new preferences
    this.updateServerPreferences(this.preferences)
  }
  
  private loadPreferences(): NotificationPreferences {
    const stored = localStorage.getItem('thorbis_notification_preferences')
    
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Default preferences
    return {
      jobs: true,
      payments: true,
      reviews: true,
      marketing: false,
      system: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      priority: {
        high: true,
        medium: true,
        low: false
      },
      industries: {
        hs: true,
        rest: true,
        auto: true,
        ret: true
      }
    }
  }
  
  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }
}
```

## Topic-Based Notification System

### Topic Model Architecture
```typescript
// notification-topics.ts - Comprehensive topic management system
interface NotificationTopic {
  id: string
  name: string
  description: string
  category: 'jobs' | 'payments' | 'reviews' | 'system' | 'marketing'
  priority: 'high' | 'medium' | 'low'
  industries: string[]
  defaultEnabled: boolean
  requiresPermission: boolean
}

const NOTIFICATION_TOPICS: NotificationTopic[] = [
  // Job-related topics
  {
    id: 'job_assigned',
    name: 'Job Assigned',
    description: 'When a new job is assigned to you',
    category: 'jobs',
    priority: 'high',
    industries: ['hs', 'auto'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'job_status_changed',
    name: 'Job Status Updates',
    description: 'When job status changes (started, completed, etc.)',
    category: 'jobs',
    priority: 'medium',
    industries: ['hs', 'auto'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'job_customer_message',
    name: 'Customer Messages',
    description: 'When customers send messages about jobs',
    category: 'jobs',
    priority: 'high',
    industries: ['hs', 'auto'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'job_schedule_reminder',
    name: 'Appointment Reminders',
    description: 'Reminders for upcoming appointments',
    category: 'jobs',
    priority: 'medium',
    industries: ['hs', 'auto', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'job_emergency',
    name: 'Emergency Jobs',
    description: 'High-priority emergency service requests',
    category: 'jobs',
    priority: 'high',
    industries: ['hs'],
    defaultEnabled: true,
    requiresPermission: false
  },
  
  // Payment-related topics
  {
    id: 'payment_received',
    name: 'Payment Received',
    description: 'When payments are successfully processed',
    category: 'payments',
    priority: 'high',
    industries: ['hs', 'rest', 'auto', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'payment_failed',
    name: 'Payment Failed',
    description: 'When payment processing fails',
    category: 'payments',
    priority: 'high',
    industries: ['hs', 'rest', 'auto', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'invoice_sent',
    name: 'Invoice Sent',
    description: 'When invoices are sent to customers',
    category: 'payments',
    priority: 'medium',
    industries: ['hs', 'auto', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'payment_overdue',
    name: 'Overdue Payments',
    description: 'When payments become overdue',
    category: 'payments',
    priority: 'medium',
    industries: ['hs', 'auto', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'refund_processed',
    name: 'Refund Processed',
    description: 'When refunds are processed successfully',
    category: 'payments',
    priority: 'medium',
    industries: ['rest', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  
  // Review-related topics
  {
    id: 'review_received',
    name: 'New Reviews',
    description: 'When new customer reviews are received',
    category: 'reviews',
    priority: 'medium',
    industries: ['hs', 'rest', 'auto', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'review_response_needed',
    name: 'Review Response Needed',
    description: 'When reviews need management response',
    category: 'reviews',
    priority: 'medium',
    industries: ['hs', 'rest', 'auto', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'review_negative',
    name: 'Negative Reviews',
    description: 'When negative reviews (1-2 stars) are received',
    category: 'reviews',
    priority: 'high',
    industries: ['hs', 'rest', 'auto', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'review_milestone',
    name: 'Review Milestones',
    description: 'When reaching review count milestones',
    category: 'reviews',
    priority: 'low',
    industries: ['hs', 'rest', 'auto', 'ret'],
    defaultEnabled: false,
    requiresPermission: false
  },
  
  // POS-specific topics (Restaurants)
  {
    id: 'pos_order_ready',
    name: 'Order Ready',
    description: 'When kitchen orders are ready for pickup',
    category: 'jobs',
    priority: 'high',
    industries: ['rest'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'pos_low_stock',
    name: 'Low Stock Alert',
    description: 'When inventory items are running low',
    category: 'system',
    priority: 'medium',
    industries: ['rest', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'pos_shift_reminder',
    name: 'Shift Reminders',
    description: 'Reminders for upcoming shifts',
    category: 'jobs',
    priority: 'medium',
    industries: ['rest', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  
  // System topics
  {
    id: 'system_maintenance',
    name: 'System Maintenance',
    description: 'Scheduled maintenance notifications',
    category: 'system',
    priority: 'medium',
    industries: ['hs', 'rest', 'auto', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  {
    id: 'system_security_alert',
    name: 'Security Alerts',
    description: 'Important security notifications',
    category: 'system',
    priority: 'high',
    industries: ['hs', 'rest', 'auto', 'ret'],
    defaultEnabled: true,
    requiresPermission: false
  },
  
  // Marketing topics
  {
    id: 'feature_announcements',
    name: 'New Features',
    description: 'Announcements about new Thorbis features',
    category: 'marketing',
    priority: 'low',
    industries: ['hs', 'rest', 'auto', 'ret'],
    defaultEnabled: false,
    requiresPermission: true
  },
  {
    id: 'tips_and_tricks',
    name: 'Tips & Tricks',
    description: 'Helpful tips to improve business efficiency',
    category: 'marketing',
    priority: 'low',
    industries: ['hs', 'rest', 'auto', 'ret'],
    defaultEnabled: false,
    requiresPermission: true
  }
]

class TopicManager {
  getTopicsForIndustry(industry: string): NotificationTopic[] {
    return NOTIFICATION_TOPICS.filter(topic => 
      topic.industries.includes(industry) || topic.industries.includes('all')
    )
  }
  
  getDefaultTopicsForUser(industry: string, role: string): string[] {
    const industryTopics = this.getTopicsForIndustry(industry)
    
    return industryTopics
      .filter(topic => topic.defaultEnabled && this.isTopicRelevantForRole(topic, role))
      .map(topic => topic.id)
  }
  
  private isTopicRelevantForRole(topic: NotificationTopic, role: string): boolean {
    const roleRelevance = {
      'admin': true,  // Admins get all notifications
      'manager': topic.category !== 'marketing',
      'staff': topic.category === 'jobs' || topic.category === 'system',
      'technician': topic.category === 'jobs',
      'server': topic.category === 'jobs' && topic.industries.includes('rest'),
      'cashier': topic.category === 'jobs' && (topic.industries.includes('rest') || topic.industries.includes('ret'))
    }
    
    return roleRelevance[role] ?? false
  }
}
```

### Industry-Specific Notification Templates
```typescript
// notification-templates.ts - Industry-specific notification formatting
interface NotificationTemplate {
  title: string
  body: string
  icon?: string
  actions?: NotificationAction[]
  sound?: string
  vibrate?: number[]
  priority?: 'high' | 'medium' | 'low'
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

class NotificationTemplateManager {
  getTemplate(topicId: string, industry: string, data: any): NotificationTemplate {
    const templateKey = `${industry}_${topicId}`
    
    // Try industry-specific template first, fallback to generic
    return this.templates[templateKey] || this.templates[topicId] || this.getDefaultTemplate(data)
  }
  
  private templates: Record<string, (data: any) => NotificationTemplate> = {
    // Home Services Job Templates
    'hs_job_assigned': (data) => ({
      title: '🔧 New Job Assigned',
      body: `${data.serviceType} job at ${data.customerAddress}`,
      icon: '/icons/hs-job-icon.png',
      actions: [
        { action: 'view', title: 'View Job' },
        { action: 'navigate', title: 'Get Directions' }
      ],
      priority: 'high',
      vibrate: [300, 100, 300]
    }),
    
    'hs_job_emergency': (data) => ({
      title: '🚨 Emergency Service Request',
      body: `URGENT: ${data.serviceType} - ${data.customerName}`,
      icon: '/icons/emergency-icon.png',
      actions: [
        { action: 'accept', title: 'Accept Job' },
        { action: 'call_customer', title: 'Call Customer' }
      ],
      priority: 'high',
      vibrate: [500, 200, 500, 200, 500]
    }),
    
    // Restaurant POS Templates
    'rest_pos_order_ready': (data) => ({
      title: '🍽️ Order Ready',
      body: `Table ${data.tableNumber} - Order #${data.orderNumber}`,
      icon: '/icons/order-ready-icon.png',
      actions: [
        { action: 'mark_delivered', title: 'Mark Delivered' }
      ],
      priority: 'high',
      vibrate: [200, 100, 200]
    }),
    
    'rest_payment_received': (data) => ({
      title: '💳 Payment Received',
      body: `$${data.amount} from Table ${data.tableNumber}`,
      icon: '/icons/payment-success-icon.png',
      priority: 'medium'
    }),
    
    // Auto Services Templates
    'auto_job_status_changed': (data) => ({
      title: '🚗 Job Status Update',
      body: `${data.vehicleInfo} - ${data.newStatus}`,
      icon: '/icons/auto-service-icon.png',
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'notify_customer', title: 'Notify Customer' }
      ],
      priority: 'medium'
    }),
    
    // Retail Templates
    'ret_pos_low_stock': (data) => ({
      title: '📦 Low Stock Alert',
      body: `${data.itemName} - Only ${data.quantity} left`,
      icon: '/icons/inventory-icon.png',
      actions: [
        { action: 'reorder', title: 'Reorder' },
        { action: 'view_inventory', title: 'View Inventory' }
      ],
      priority: 'medium'
    }),
    
    // Payment Templates (All Industries)
    'payment_failed': (data) => ({
      title: '❌ Payment Failed',
      body: `$${data.amount} payment declined - ${data.reason}`,
      icon: '/icons/payment-failed-icon.png',
      actions: [
        { action: 'retry', title: 'Retry Payment' },
        { action: 'contact_customer', title: 'Contact Customer' }
      ],
      priority: 'high',
      vibrate: [100, 50, 100, 50, 100]
    }),
    
    'payment_overdue': (data) => ({
      title: '⏰ Payment Overdue',
      body: `Invoice #${data.invoiceNumber} - $${data.amount} (${data.daysOverdue} days)`,
      icon: '/icons/overdue-icon.png',
      actions: [
        { action: 'send_reminder', title: 'Send Reminder' },
        { action: 'view_invoice', title: 'View Invoice' }
      ],
      priority: 'medium'
    }),
    
    // Review Templates
    'review_received': (data) => ({
      title: '⭐ New Review',
      body: `${data.rating} stars from ${data.customerName}`,
      icon: '/icons/review-icon.png',
      actions: [
        { action: 'view_review', title: 'View Review' },
        { action: 'respond', title: 'Respond' }
      ],
      priority: data.rating <= 2 ? 'high' : 'medium'
    }),
    
    'review_negative': (data) => ({
      title: '⚠️ Negative Review Alert',
      body: `${data.rating} star review needs attention`,
      icon: '/icons/negative-review-icon.png',
      actions: [
        { action: 'view_review', title: 'View Review' },
        { action: 'respond_immediately', title: 'Respond Now' }
      ],
      priority: 'high',
      vibrate: [200, 100, 200, 100, 200]
    })
  }
  
  private getDefaultTemplate(data: any): NotificationTemplate {
    return {
      title: 'Thorbis Notification',
      body: data.message || 'You have a new notification',
      icon: '/icons/default-notification-icon.png',
      priority: 'medium'
    }
  }
}
```

### Smart Notification Timing
```typescript
// notification-timing.ts - Intelligent notification timing and batching
interface NotificationTiming {
  immediateTypes: string[]
  batchableTypes: string[]
  quietHoursRespected: string[]
  businessHoursOnly: string[]
}

class SmartNotificationScheduler {
  private readonly timing: NotificationTiming = {
    immediateTypes: [
      'job_emergency',
      'payment_failed', 
      'system_security_alert',
      'pos_order_ready'
    ],
    batchableTypes: [
      'review_received',
      'invoice_sent',
      'feature_announcements',
      'tips_and_tricks'
    ],
    quietHoursRespected: [
      'review_received',
      'feature_announcements',
      'tips_and_tricks',
      'review_milestone'
    ],
    businessHoursOnly: [
      'job_assigned',
      'job_status_changed',
      'pos_shift_reminder'
    ]
  }
  
  private batchBuffer: Map<string, NotificationBatch> = new Map()
  private batchTimers: Map<string, NodeJS.Timeout> = new Map()
  
  async scheduleNotification(notification: any): Promise<void> {
    const { topicId, userId, data } = notification
    
    // Check if notification should be sent immediately
    if (this.timing.immediateTypes.includes(topicId)) {
      await this.sendImmediateNotification(notification)
      return
    }
    
    // Check business hours restrictions
    if (this.timing.businessHoursOnly.includes(topicId) && !this.isBusinessHours(data.timezone)) {
      await this.scheduleForBusinessHours(notification)
      return
    }
    
    // Check quiet hours
    const userPreferences = await this.getUserPreferences(userId)
    if (this.shouldRespectQuietHours(topicId, userPreferences)) {
      const isQuietHours = this.isQuietHours(userPreferences.quietHours)
      if (isQuietHours) {
        await this.scheduleAfterQuietHours(notification, userPreferences)
        return
      }
    }
    
    // Handle batchable notifications
    if (this.timing.batchableTypes.includes(topicId)) {
      this.addToBatch(notification)
      return
    }
    
    // Send regular notification
    await this.sendNotification(notification)
  }
  
  private addToBatch(notification: any): void {
    const { userId, topicId } = notification
    const batchKey = `${userId}_${topicId}`
    
    if (!this.batchBuffer.has(batchKey)) {
      this.batchBuffer.set(batchKey, {
        userId,
        topicId,
        notifications: [],
        scheduledTime: Date.now() + this.getBatchDelay(topicId)
      })
      
      // Schedule batch processing
      const timer = setTimeout(() => {
        this.processBatch(batchKey)
      }, this.getBatchDelay(topicId))
      
      this.batchTimers.set(batchKey, timer)
    }
    
    this.batchBuffer.get(batchKey)!.notifications.push(notification)
  }
  
  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.batchBuffer.get(batchKey)
    if (!batch) return
    
    // Clear batch from memory
    this.batchBuffer.delete(batchKey)
    const timer = this.batchTimers.get(batchKey)
    if (timer) {
      clearTimeout(timer)
      this.batchTimers.delete(batchKey)
    }
    
    // Create batched notification
    const batchedNotification = this.createBatchedNotification(batch)
    await this.sendNotification(batchedNotification)
  }
  
  private createBatchedNotification(batch: NotificationBatch): any {
    const { topicId, notifications } = batch
    const count = notifications.length
    
    switch (topicId) {
      case 'review_received':
        return {
          title: `📝 ${count} New Reviews`,
          body: count === 1 
            ? `New review from ${notifications[0].data.customerName}`
            : `You have ${count} new customer reviews`,
          data: {
            type: 'batch',
            topicId,
            notifications,
            url: '/reviews'
          }
        }
        
      case 'invoice_sent':
        return {
          title: `📄 ${count} Invoices Sent`,
          body: `${count} invoices have been sent to customers`,
          data: {
            type: 'batch',
            topicId,
            notifications,
            url: '/invoices'
          }
        }
        
      default:
        return {
          title: `🔔 ${count} Updates`,
          body: `You have ${count} new notifications`,
          data: {
            type: 'batch',
            topicId,
            notifications,
            url: '/'
          }
        }
    }
  }
  
  private getBatchDelay(topicId: string): number {
    const delays = {
      'review_received': 300000,      // 5 minutes
      'invoice_sent': 600000,         // 10 minutes
      'feature_announcements': 1800000, // 30 minutes
      'tips_and_tricks': 3600000      // 1 hour
    }
    
    return delays[topicId] || 300000 // Default 5 minutes
  }
  
  private isBusinessHours(timezone: string = 'UTC'): boolean {
    const now = new Date().toLocaleString('en-US', { timeZone: timezone })
    const currentTime = new Date(now)
    const hour = currentTime.getHours()
    const day = currentTime.getDay()
    
    // Monday-Friday, 8 AM - 6 PM
    return day >= 1 && day <= 5 && hour >= 8 && hour < 18
  }
  
  private isQuietHours(quietHours: { enabled: boolean, start: string, end: string }): boolean {
    if (!quietHours.enabled) return false
    
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute
    
    const [startHour, startMinute] = quietHours.start.split(':').map(Number)
    const [endHour, endMinute] = quietHours.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime
    } else {
      return currentTime >= startTime && currentTime <= endTime
    }
  }
}

interface NotificationBatch {
  userId: string
  topicId: string
  notifications: any[]
  scheduledTime: number
}
```

### Analytics and Performance Tracking
```typescript
// notification-analytics.ts - Comprehensive notification analytics
interface NotificationMetrics {
  sent: number
  delivered: number
  clicked: number
  dismissed: number
  failed: number
  deliveryRate: number
  clickRate: number
  engagementScore: number
}

class NotificationAnalytics {
  async trackNotificationSent(notification: any): Promise<void> {
    await this.recordEvent('notification_sent', {
      topicId: notification.topicId,
      userId: notification.userId,
      industry: notification.industry,
      priority: notification.priority,
      timestamp: Date.now()
    })
  }
  
  async trackNotificationDelivered(notification: any): Promise<void> {
    await this.recordEvent('notification_delivered', {
      topicId: notification.topicId,
      userId: notification.userId,
      deliveryTime: Date.now() - notification.sentAt,
      timestamp: Date.now()
    })
  }
  
  async trackNotificationClicked(notification: any, action?: string): Promise<void> {
    await this.recordEvent('notification_clicked', {
      topicId: notification.topicId,
      userId: notification.userId,
      action: action || 'default',
      timeToClick: Date.now() - notification.deliveredAt,
      timestamp: Date.now()
    })
  }
  
  async getTopicPerformance(topicId: string, timeRange: string = '30d'): Promise<NotificationMetrics> {
    const events = await this.getEvents(topicId, timeRange)
    
    const sent = events.filter(e => e.type === 'notification_sent').length
    const delivered = events.filter(e => e.type === 'notification_delivered').length
    const clicked = events.filter(e => e.type === 'notification_clicked').length
    const dismissed = events.filter(e => e.type === 'notification_dismissed').length
    const failed = sent - delivered
    
    const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0
    const clickRate = delivered > 0 ? (clicked / delivered) * 100 : 0
    const engagementScore = this.calculateEngagementScore(delivered, clicked, dismissed)
    
    return {
      sent,
      delivered,
      clicked,
      dismissed,
      failed,
      deliveryRate,
      clickRate,
      engagementScore
    }
  }
  
  private calculateEngagementScore(delivered: number, clicked: number, dismissed: number): number {
    if (delivered === 0) return 0
    
    const clickWeight = 2
    const dismissWeight = -0.5
    
    const score = (clicked * clickWeight + dismissed * dismissWeight) / delivered
    return Math.max(0, Math.min(100, score * 50)) // Normalize to 0-100
  }
}
```

This comprehensive push notification system provides Thorbis with intelligent, topic-based notifications that adapt to user preferences, business hours, and industry-specific needs while maintaining high engagement and performance.
