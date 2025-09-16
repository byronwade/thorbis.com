# Thorbis Progressive Web App Implementation

Comprehensive PWA strategy for Thorbis Business OS with offline-first capabilities, install prompts, and intelligent caching for critical business operations.

## Core PWA Architecture

### Service Worker Strategy
```javascript
// sw.js - Main service worker
const CACHE_VERSION = 'v1.2.0'
const STATIC_CACHE = `thorbis-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `thorbis-dynamic-${CACHE_VERSION}`
const OFFLINE_CACHE = `thorbis-offline-${CACHE_VERSION}`
const API_CACHE = `thorbis-api-${CACHE_VERSION}`

// Critical routes for offline functionality
const CRITICAL_ROUTES = [
  '/',
  '/pos',
  '/pos/orders',
  '/invoices',
  '/schedule',
  '/customers',
  '/offline'
]

// API endpoints requiring offline support
const OFFLINE_API_PATTERNS = [
  '/api/pos/orders',
  '/api/invoices',
  '/api/schedule',
  '/api/customers',
  '/api/sync'
]

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache critical static assets
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll([
          '/',
          '/static/js/bundle.js',
          '/static/css/main.css',
          '/static/images/logo.png',
          '/manifest.json',
          '/offline.html'
        ])
      }),
      
      // Pre-cache critical routes
      caches.open(OFFLINE_CACHE).then(cache => {
        return cache.addAll(CRITICAL_ROUTES)
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== OFFLINE_CACHE &&
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Handle different request types with appropriate strategies
  if (request.method === 'GET') {
    if (isStaticAsset(url)) {
      event.respondWith(handleStaticAsset(request))
    } else if (isAPIRequest(url)) {
      event.respondWith(handleAPIRequest(request))
    } else if (isPageRequest(url)) {
      event.respondWith(handlePageRequest(request))
    }
  } else if (request.method === 'POST') {
    event.respondWith(handlePostRequest(request))
  }
})
```

### App Shell Architecture
```typescript
// app-shell.ts - Core app shell implementation
interface AppShell {
  navigation: NavigationComponent
  header: HeaderComponent
  sidebar: SidebarComponent
  main: MainContentArea
  footer: FooterComponent
  offline: OfflineIndicator
}

class ThorbisPWA {
  private serviceWorker: ServiceWorkerRegistration | null = null
  private isOnline: boolean = navigator.onLine
  private installPromptEvent: BeforeInstallPromptEvent | null = null
  
  async initialize(): Promise<void> {
    // Register service worker
    await this.registerServiceWorker()
    
    // Setup offline detection
    this.setupOfflineDetection()
    
    // Setup install prompt handling
    this.setupInstallPrompt()
    
    // Initialize app shell
    this.initializeAppShell()
    
    // Setup background sync
    this.setupBackgroundSync()
    
    // Initialize push notifications
    this.initializePushNotifications()
  }
  
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorker = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        console.log('Service Worker registered successfully')
        
        // Listen for updates
        this.serviceWorker.addEventListener('updatefound', () => {
          const newWorker = this.serviceWorker!.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailablePrompt()
              }
            })
          }
        })
        
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }
  
  private setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.handleOnlineStateChange()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.handleOfflineStateChange()
    })
  }
  
  private async setupInstallPrompt(): Promise<void> {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.installPromptEvent = e as BeforeInstallPromptEvent
      this.showInstallPrompt()
    })
    
    window.addEventListener('appinstalled', () => {
      console.log('Thorbis PWA installed successfully')
      this.trackInstallEvent()
    })
  }
}
```

## Install Prompts & User Experience

### Smart Install Prompt Strategy
```typescript
// install-prompt.ts - Intelligent install prompt system
interface InstallPromptConfig {
  minPageViews: number
  minTimeSpent: number  // milliseconds
  criticalActions: string[]
  excludeRoutes: string[]
}

class InstallPromptManager {
  private config: InstallPromptConfig = {
    minPageViews: 3,
    minTimeSpent: 60000, // 1 minute
    criticalActions: ['pos_order_created', 'invoice_generated', 'appointment_scheduled'],
    excludeRoutes: ['/login', '/signup', '/onboarding']
  }
  
  private userEngagement = {
    pageViews: 0,
    timeSpent: 0,
    criticalActionsPerformed: 0,
    lastVisit: Date.now()
  }
  
  shouldShowInstallPrompt(): boolean {
    // Check if PWA is already installed
    if (this.isPWAInstalled()) return false
    
    // Check if user meets engagement criteria
    const engagementMet = 
      this.userEngagement.pageViews >= this.config.minPageViews ||
      this.userEngagement.timeSpent >= this.config.minTimeSpent ||
      this.userEngagement.criticalActionsPerformed > 0
    
    // Check if current route allows prompts
    const routeAllowed = !this.config.excludeRoutes.some(route => 
      window.location.pathname.includes(route)
    )
    
    return engagementMet && routeAllowed && this.installPromptEvent !== null
  }
  
  async showInstallPrompt(): Promise<void> {
    if (!this.shouldShowInstallPrompt()) return
    
    // Show custom install prompt UI
    const userChoice = await this.showCustomInstallDialog()
    
    if (userChoice === 'install') {
      this.triggerInstallPrompt()
    } else if (userChoice === 'later') {
      this.postponeInstallPrompt()
    } else {
      this.dismissInstallPrompt()
    }
  }
  
  private async showCustomInstallDialog(): Promise<'install' | 'later' | 'dismiss'> {
    return new Promise((resolve) => {
      const dialog = document.createElement('div')
      dialog.className = 'install-prompt-overlay'
      dialog.innerHTML = `
        <div class="install-prompt-dialog">
          <div class="install-prompt-header">
            <img src="/static/images/pwa-icon.png" alt="Thorbis" class="install-prompt-icon">
            <h3>Install Thorbis</h3>
          </div>
          <div class="install-prompt-content">
            <p>Get faster access to your business tools with the Thorbis app:</p>
            <ul>
              <li>✓ Instant loading, even offline</li>
              <li>✓ Process orders without internet</li>
              <li>✓ Quick access from your home screen</li>
              <li>✓ Push notifications for important updates</li>
            </ul>
          </div>
          <div class="install-prompt-actions">
            <button class="btn-secondary" data-choice="dismiss">No thanks</button>
            <button class="btn-outline" data-choice="later">Maybe later</button>
            <button class="btn-primary" data-choice="install">Install App</button>
          </div>
        </div>
      `
      
      dialog.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement
        const choice = target.getAttribute('data-choice') as 'install' | 'later' | 'dismiss'
        if (choice) {
          document.body.removeChild(dialog)
          resolve(choice)
        }
      })
      
      document.body.appendChild(dialog)
    })
  }
  
  private async triggerInstallPrompt(): Promise<void> {
    if (this.installPromptEvent) {
      const { outcome } = await this.installPromptEvent.prompt()
      
      // Track install outcome
      this.trackInstallPrompt(outcome)
      
      // Clear the saved prompt
      this.installPromptEvent = null
    }
  }
}
```

### Context-Aware Install Prompts
```typescript
// contextual-install.ts - Industry and use-case specific prompts
interface ContextualPrompt {
  industry: 'hs' | 'rest' | 'auto' | 'ret'
  useCase: string
  title: string
  benefits: string[]
  trigger: () => boolean
}

const CONTEXTUAL_PROMPTS: ContextualPrompt[] = [
  {
    industry: 'rest',
    useCase: 'pos_busy_period',
    title: 'Speed up orders during rush',
    benefits: [
      'Process orders faster with offline POS',
      'No interruptions during internet outages',  
      'Quick access from kitchen displays'
    ],
    trigger: () => isPeakHours() && isOnPOSPage()
  },
  {
    industry: 'hs',
    useCase: 'field_technician',
    title: 'Work anywhere, sync later',
    benefits: [
      'Complete work orders offline',
      'Capture photos and signatures',
      'Sync when back in service area'
    ],
    trigger: () => isMobileDevice() && isOnSchedulePage()
  },
  {
    industry: 'auto',
    useCase: 'service_bay',
    title: 'Shop floor efficiency',
    benefits: [
      'Update job status instantly',
      'Work offline in service bays',
      'Quick part lookups and ordering'
    ],
    trigger: () => isOnWorkOrderPage() && hasActiveJobs()
  },
  {
    industry: 'ret',
    useCase: 'inventory_management',
    title: 'Never miss a sale',
    benefits: [
      'Process sales during outages',
      'Real-time inventory updates',
      'Customer checkout anywhere'
    ],
    trigger: () => isOnInventoryPage() || isOnCheckoutPage()
  }
]
```

## Offline Caching Strategy

### Cache-First Strategy for Critical Assets
```javascript
// cache-strategies.js - Comprehensive caching implementation

// Strategy 1: Cache First (for static assets and app shell)
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return cache.match('/offline.html')
    }
    throw error
  }
}

// Strategy 2: Network First with Fallback (for dynamic content)
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page with navigation to cached routes
    return cache.match('/offline.html')
  }
}

// Strategy 3: Stale While Revalidate (for API data)
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Always try to fetch fresh data in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => null)
  
  // Return cached data immediately if available
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Wait for network if no cache
  return await fetchPromise || new Response(
    JSON.stringify({ error: 'Offline', cached: false }), 
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  )
}
```

### Industry-Specific Cache Priorities

#### Restaurant POS Caching
```javascript
// pos-cache.js - POS-specific caching strategy
const POS_CACHE_CONFIG = {
  // High priority - critical for offline POS operation
  critical: [
    '/api/pos/menu',           // Menu items and pricing
    '/api/pos/orders',         // Order management
    '/api/pos/payments',       // Payment processing
    '/api/pos/customers',      // Customer data
    '/api/pos/taxes',          // Tax calculations
  ],
  
  // Medium priority - important but can fallback
  important: [
    '/api/pos/reports',        // Daily reports
    '/api/pos/inventory',      // Inventory levels
    '/api/pos/staff',          // Staff management
  ],
  
  // Low priority - nice to have
  optional: [
    '/api/pos/analytics',      // Analytics data
    '/api/pos/promotions',     // Current promotions
  ]
}

class POSCacheManager {
  async preloadCriticalData(): Promise<void> {
    const cache = await caches.open(API_CACHE)
    
    // Preload critical POS data
    for (const endpoint of POS_CACHE_CONFIG.critical) {
      try {
        const response = await fetch(endpoint)
        if (response.ok) {
          await cache.put(endpoint, response.clone())
        }
      } catch (error) {
        console.warn(`Failed to preload ${endpoint}:`, error)
      }
    }
  }
  
  async handlePOSOrder(orderData: any): Promise<any> {
    try {
      // Try to process online first
      const response = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      throw new Error('Network request failed')
    } catch (error) {
      // Store for background sync when online
      await this.queueOfflineOrder(orderData)
      
      // Return optimistic response
      return {
        orderId: `offline_${Date.now()}`,
        status: 'pending_sync',
        timestamp: new Date().toISOString(),
        offlineMode: true
      }
    }
  }
  
  private async queueOfflineOrder(orderData: any): Promise<void> {
    const db = await this.openIndexedDB()
    const transaction = db.transaction(['pending_orders'], 'readwrite')
    const store = transaction.objectStore('pending_orders')
    
    await store.add({
      ...orderData,
      timestamp: Date.now(),
      type: 'pos_order',
      synced: false
    })
  }
}
```

#### Home Services Schedule Caching
```javascript
// schedule-cache.js - Home services scheduling cache
const SCHEDULE_CACHE_CONFIG = {
  critical: [
    '/api/schedule/appointments',  // Today's appointments
    '/api/schedule/technicians',   // Available technicians
    '/api/schedule/customers',     // Customer information
  ],
  
  timeBasedCache: {
    '/api/schedule/appointments': {
      maxAge: 5 * 60 * 1000,      // 5 minutes for appointments
      staleWhileRevalidate: true
    },
    '/api/schedule/technicians': {
      maxAge: 15 * 60 * 1000,     // 15 minutes for technician status
      staleWhileRevalidate: true
    },
    '/api/schedule/customers': {
      maxAge: 60 * 60 * 1000,     // 1 hour for customer data
      staleWhileRevalidate: false
    }
  }
}

class ScheduleCacheManager {
  async handleScheduleUpdate(appointmentData: any): Promise<any> {
    try {
      // Try online update
      const response = await fetch('/api/schedule/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })
      
      if (response.ok) {
        // Update local cache with fresh data
        const cache = await caches.open(API_CACHE)
        await cache.put('/api/schedule/appointments', response.clone())
        return await response.json()
      }
      
      throw new Error('Network update failed')
    } catch (error) {
      // Queue for background sync
      await this.queueScheduleUpdate(appointmentData)
      
      // Update local cache optimistically
      await this.updateLocalScheduleCache(appointmentData)
      
      return {
        ...appointmentData,
        status: 'pending_sync',
        lastModified: new Date().toISOString()
      }
    }
  }
}
```

#### Invoice System Caching
```javascript
// invoice-cache.js - Invoice management caching
const INVOICE_CACHE_CONFIG = {
  critical: [
    '/api/invoices/templates',     // Invoice templates
    '/api/invoices/customers',     // Customer billing info
    '/api/invoices/items',         // Service/product catalog
    '/api/invoices/taxes',         // Tax rates and rules
  ],
  
  drafts: '/api/invoices/drafts',   // Draft invoices (local storage)
  sent: '/api/invoices/sent',       // Sent invoices (cache longer)
}

class InvoiceCacheManager {
  async createOfflineInvoice(invoiceData: any): Promise<any> {
    // Generate offline invoice ID
    const offlineId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store in IndexedDB for persistence
    await this.storeOfflineInvoice({
      ...invoiceData,
      id: offlineId,
      status: 'draft_offline',
      createdAt: new Date().toISOString(),
      needsSync: true
    })
    
    // Return optimistic response
    return {
      id: offlineId,
      status: 'created_offline',
      message: 'Invoice created offline. Will sync when online.'
    }
  }
  
  async generateOfflinePDF(invoiceId: string): Promise<Blob> {
    // Use cached templates and data to generate PDF offline
    const invoiceData = await this.getOfflineInvoice(invoiceId)
    const template = await this.getCachedTemplate(invoiceData.templateId)
    
    // Generate PDF using client-side PDF library
    return await this.generatePDFFromTemplate(template, invoiceData)
  }
}
```

## Cache Invalidation Rules

### Time-Based Invalidation
```typescript
// cache-invalidation.ts - Comprehensive cache management
interface CacheInvalidationRules {
  [cacheType: string]: {
    maxAge: number           // Maximum cache age in milliseconds
    staleWhileRevalidate: boolean
    invalidateOn: string[]   // Events that trigger invalidation
    priority: 'high' | 'medium' | 'low'
  }
}

const CACHE_INVALIDATION_RULES: CacheInvalidationRules = {
  // Static assets - cache aggressively
  'static-assets': {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    staleWhileRevalidate: false,
    invalidateOn: ['app-update', 'version-change'],
    priority: 'low'
  },
  
  // API data - business critical
  'pos-menu': {
    maxAge: 60 * 60 * 1000, // 1 hour
    staleWhileRevalidate: true,
    invalidateOn: ['menu-update', 'price-change', 'item-added'],
    priority: 'high'
  },
  
  'schedule-appointments': {
    maxAge: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: true,
    invalidateOn: ['appointment-created', 'appointment-updated', 'technician-assigned'],
    priority: 'high'
  },
  
  'customer-data': {
    maxAge: 60 * 60 * 1000, // 1 hour
    staleWhileRevalidate: true,
    invalidateOn: ['customer-updated', 'customer-created'],
    priority: 'medium'
  },
  
  'invoice-templates': {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    staleWhileRevalidate: false,
    invalidateOn: ['template-updated', 'branding-changed'],
    priority: 'medium'
  },
  
  // Analytics and reports - less critical
  'analytics-data': {
    maxAge: 15 * 60 * 1000, // 15 minutes
    staleWhileRevalidate: true,
    invalidateOn: ['report-generated'],
    priority: 'low'
  }
}

class CacheInvalidationManager {
  private eventListeners: Map<string, Set<Function>> = new Map()
  
  async invalidateCache(cacheType: string, reason: string): Promise<void> {
    const rules = CACHE_INVALIDATION_RULES[cacheType]
    if (!rules) return
    
    console.log(`Invalidating cache: ${cacheType} - Reason: ${reason}`)
    
    // Remove expired entries
    await this.removeExpiredEntries(cacheType)
    
    // Clear specific cache if event-triggered
    if (rules.invalidateOn.includes(reason)) {
      await this.clearCacheType(cacheType)
    }
    
    // Notify listeners
    this.notifyInvalidation(cacheType, reason)
  }
  
  async checkCacheExpiry(): Promise<void> {
    const now = Date.now()
    
    for (const [cacheType, rules] of Object.entries(CACHE_INVALIDATION_RULES)) {
      const cache = await caches.open(cacheType)
      const keys = await cache.keys()
      
      for (const request of keys) {
        const response = await cache.match(request)
        if (!response) continue
        
        const cachedTime = response.headers.get('sw-cached-time')
        if (cachedTime) {
          const age = now - parseInt(cachedTime)
          
          if (age > rules.maxAge) {
            await cache.delete(request)
            console.log(`Expired cache entry removed: ${request.url}`)
          }
        }
      }
    }
  }
  
  // Event-driven invalidation
  onBusinessDataChanged(dataType: string): void {
    const invalidationMap = {
      'menu_item': ['pos-menu'],
      'appointment': ['schedule-appointments'],
      'customer': ['customer-data'],
      'invoice_template': ['invoice-templates'],
      'price': ['pos-menu', 'invoice-templates']
    }
    
    const cachesToInvalidate = invalidationMap[dataType] || []
    
    cachesToInvalidate.forEach(cacheType => {
      this.invalidateCache(cacheType, `${dataType}_changed`)
    })
  }
}
```

### Smart Cache Replacement
```typescript
// cache-replacement.ts - Intelligent cache management
class SmartCacheManager {
  private cacheUsageStats: Map<string, CacheUsageStats> = new Map()
  
  async manageCacheSize(): Promise<void> {
    const caches = await window.caches.keys()
    const totalSize = await this.calculateTotalCacheSize(caches)
    
    // Target maximum cache size: 50MB
    const MAX_CACHE_SIZE = 50 * 1024 * 1024
    
    if (totalSize > MAX_CACHE_SIZE) {
      await this.evictLeastImportantData(totalSize - MAX_CACHE_SIZE)
    }
  }
  
  private async evictLeastImportantData(bytesToEvict: number): Promise<void> {
    // Priority order for eviction (least to most important)
    const evictionPriority = [
      'analytics-data',
      'optional-images',
      'historical-reports',
      'customer-data',
      'invoice-templates',
      'schedule-appointments',
      'pos-menu',
      'static-assets'
    ]
    
    let bytesEvicted = 0
    
    for (const cacheType of evictionPriority) {
      if (bytesEvicted >= bytesToEvict) break
      
      const cache = await caches.open(cacheType)
      const entries = await this.getCacheEntriesByUsage(cache)
      
      // Evict least recently used entries
      for (const entry of entries) {
        if (bytesEvicted >= bytesToEvict) break
        
        const size = await this.getEntrySize(entry)
        await cache.delete(entry.request)
        bytesEvicted += size
        
        console.log(`Evicted cache entry: ${entry.request.url} (${size} bytes)`)
      }
    }
  }
  
  private async getCacheEntriesByUsage(cache: Cache): Promise<CacheEntry[]> {
    const keys = await cache.keys()
    const entries: CacheEntry[] = []
    
    for (const request of keys) {
      const response = await cache.match(request)
      if (!response) continue
      
      const lastUsed = parseInt(response.headers.get('sw-last-used') || '0')
      const accessCount = parseInt(response.headers.get('sw-access-count') || '0')
      
      entries.push({
        request,
        response,
        lastUsed,
        accessCount,
        score: this.calculateUsageScore(lastUsed, accessCount)
      })
    }
    
    // Sort by usage score (lowest first = least important)
    return entries.sort((a, b) => a.score - b.score)
  }
  
  private calculateUsageScore(lastUsed: number, accessCount: number): number {
    const now = Date.now()
    const timeSinceLastUse = now - lastUsed
    const recencyScore = Math.max(0, 1 - (timeSinceLastUse / (7 * 24 * 60 * 60 * 1000))) // 7 days
    const frequencyScore = Math.min(1, accessCount / 100) // Cap at 100 accesses
    
    return (recencyScore * 0.6) + (frequencyScore * 0.4)
  }
}

interface CacheEntry {
  request: Request
  response: Response
  lastUsed: number
  accessCount: number
  score: number
}

interface CacheUsageStats {
  accessCount: number
  lastAccessed: number
  totalSize: number
  hitRate: number
}
```

## Offline Demo Script

### Complete POS Order Demo
```typescript
// offline-pos-demo.ts - Comprehensive offline POS demonstration
class OfflinePOSDemo {
  private orderQueue: OfflineOrder[] = []
  private isOnline: boolean = navigator.onLine
  
  async demonstrateOfflineOrder(): Promise<void> {
    console.log('🏪 Starting Offline POS Demo')
    
    // Step 1: Simulate going offline
    await this.simulateOfflineMode()
    
    // Step 2: Create offline order
    const order = await this.createOfflineOrder()
    
    // Step 3: Process offline payment
    await this.processOfflinePayment(order)
    
    // Step 4: Generate offline receipt
    await this.generateOfflineReceipt(order)
    
    // Step 5: Simulate coming back online
    await this.simulateOnlineMode()
    
    // Step 6: Sync offline data
    await this.syncOfflineOrders()
    
    console.log('✅ Offline POS Demo completed successfully')
  }
  
  private async simulateOfflineMode(): Promise<void> {
    console.log('📡 Simulating offline mode...')
    this.isOnline = false
    
    // Mock network failure
    const originalFetch = window.fetch
    window.fetch = async () => {
      throw new Error('Network unavailable (demo mode)')
    }
    
    // Update UI to show offline status
    this.updateOfflineStatus(true)
    
    console.log('🔴 Now offline - POS will continue working')
  }
  
  private   async createOfflineOrder(): Promise<OfflineOrder> {
    console.log('🛒 Creating offline order...')
    
    const order: OfflineOrder = {
      id: `offline_pos_${Date.now()}`,
      items: [
        {
          id: 'burger-classic',
          name: 'Classic Burger',
          price: 12.99,
          quantity: 2,
          category: 'entrees'
        },
        {
          id: 'fries-large',
          name: 'Large Fries',
          price: 4.99,
          quantity: 2,
          category: 'sides'
        },
        {
          id: 'soda-cola',
          name: 'Cola',
          price: 2.99,
          quantity: 2,
          category: 'beverages'
        }
      ],
      subtotal: 41.96,
      tax: 3.36,
      total: 45.32,
      paymentMethod: 'card',
      customerId: 'walk-in',
      timestamp: new Date().toISOString(),
      tableNumber: 7,
      serverName: 'Demo Server',
      status: 'completed_offline',
      needsSync: true
    }
    
    // Store in IndexedDB for persistence
    await this.storeOfflineOrder(order)
    
    // Update UI optimistically
    this.displayOrderConfirmation(order)
    
    console.log('✅ Offline order created:', order.id)
    return order
  }
  
  private async processOfflinePayment(order: OfflineOrder): Promise<void> {
    console.log('💳 Processing offline payment...')
    
    // Simulate payment processing without network
    const paymentResult = {
      transactionId: `offline_txn_${Date.now()}`,
      status: 'pending_sync',
      amount: order.total,
      method: order.paymentMethod,
      timestamp: new Date().toISOString(),
      needsOnlineVerification: true
    }
    
    // Store payment details
    await this.storeOfflinePayment(order.id, paymentResult)
    
    // Update order with payment info
    order.paymentTransaction = paymentResult
    
    console.log('✅ Payment processed offline:', paymentResult.transactionId)
  }
  
  private async generateOfflineReceipt(order: OfflineOrder): Promise<void> {
    console.log('🧾 Generating offline receipt...')
    
    // Use cached receipt template
    const template = await this.getCachedReceiptTemplate()
    
    const receiptData = {
      orderNumber: order.id,
      date: new Date(order.timestamp).toLocaleDateString(),
      time: new Date(order.timestamp).toLocaleTimeString(),
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      paymentMethod: order.paymentMethod,
      serverName: order.serverName,
      tableNumber: order.tableNumber,
      offlineMode: true,
      syncStatus: 'pending'
    }
    
    // Generate receipt (offline capable)
    const receipt = await this.generateReceiptHTML(template, receiptData)
    
    // Store receipt for later printing/emailing
    await this.storeOfflineReceipt(order.id, receipt)
    
    // Display or print receipt
    this.displayReceipt(receipt)
    
    console.log('✅ Receipt generated offline')
  }
  
  private async simulateOnlineMode(): Promise<void> {
    console.log('📡 Simulating return to online mode...')
    
    setTimeout(() => {
      this.isOnline = true
      
      // Restore normal fetch
      delete (window as any).fetch
      
      // Update UI
      this.updateOfflineStatus(false)
      
      console.log('🟢 Back online - starting sync process')
    }, 2000)
  }
  
  private async syncOfflineOrders(): Promise<void> {
    console.log('🔄 Syncing offline orders...')
    
    const offlineOrders = await this.getOfflineOrders()
    let syncedCount = 0
    let failedCount = 0
    
    for (const order of offlineOrders) {
      try {
        // Sync order to server
        const response = await fetch('/api/pos/orders/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        })
        
        if (response.ok) {
          const syncedOrder = await response.json()
          
          // Update local storage with server data
          await this.updateOrderWithSyncData(order.id, syncedOrder)
          
          // Mark as synced
          await this.markOrderSynced(order.id)
          
          syncedCount++
          console.log(`✅ Synced order: ${order.id} → ${syncedOrder.id}`)
        } else {
          throw new Error(`Sync failed: ${response.status}`)
        }
      } catch (error) {
        failedCount++
        console.error(`❌ Failed to sync order ${order.id}:`, error)
        
        // Mark for retry
        await this.markOrderForRetry(order.id)
      }
    }
    
    // Sync payment transactions
    await this.syncOfflinePayments()
    
    // Update UI with sync results
    this.displaySyncResults(syncedCount, failedCount)
    
    console.log(`🏁 Sync completed: ${syncedCount} synced, ${failedCount} failed`)
  }
  
  private async storeOfflineOrder(order: OfflineOrder): Promise<void> {
    const db = await this.openIndexedDB()
    const transaction = db.transaction(['offline_orders'], 'readwrite')
    const store = transaction.objectStore('offline_orders')
    await store.add(order)
  }
  
  private async getOfflineOrders(): Promise<OfflineOrder[]> {
    const db = await this.openIndexedDB()
    const transaction = db.transaction(['offline_orders'], 'readonly')
    const store = transaction.objectStore('offline_orders')
    
    return new Promise((resolve) => {
      const request = store.getAll()
      request.onsuccess = () => {
        resolve(request.result.filter(order => order.needsSync))
      }
    })
  }
  
  private displayOrderConfirmation(order: OfflineOrder): void {
    const notification = document.createElement('div')
    notification.className = 'offline-notification success'
    notification.innerHTML = `
      <div class="notification-content">
        <h4>Order Created Offline</h4>
        <p>Order #${order.id} for $${order.total.toFixed(2)}</p>
        <p>Will sync when connection is restored</p>
      </div>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 5000)
  }
}

interface OfflineOrder {
  id: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  customerId: string
  timestamp: string
  tableNumber?: number
  serverName: string
  status: string
  needsSync: boolean
  paymentTransaction?: any
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  modifications?: string[]
}
```

This comprehensive PWA implementation provides Thorbis with offline-first capabilities, intelligent caching, and seamless synchronization for critical business operations across all industries.
