# Thorbis Background Sync Implementation

Comprehensive background synchronization strategy for queued writes, offline data persistence, and seamless reconnection handling for jobs and POS tickets.

## Core Background Sync Architecture

### Service Worker Background Sync Setup
```javascript
// sw-background-sync.js - Service worker background sync implementation
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { Queue } from 'workbox-background-sync'

// Create sync queues for different data types
const posOrdersQueue = new Queue('pos-orders-sync', {
  onSync: async ({ queue }) => {
    let entry
    while ((entry = await queue.shiftRequest())) {
      try {
        await syncPOSOrder(entry)
      } catch (error) {
        console.error('POS order sync failed:', error)
        await queue.unshiftRequest(entry) // Put back for retry
        throw error
      }
    }
  }
})

const jobUpdatesQueue = new Queue('job-updates-sync', {
  onSync: async ({ queue }) => {
    let entry
    while ((entry = await queue.shiftRequest())) {
      try {
        await syncJobUpdate(entry)
      } catch (error) {
        console.error('Job update sync failed:', error)
        await queue.unshiftRequest(entry)
        throw error
      }
    }
  }
})

const customerDataQueue = new Queue('customer-data-sync', {
  onSync: async ({ queue }) => {
    let entry
    while ((entry = await queue.shiftRequest())) {
      try {
        await syncCustomerData(entry)
      } catch (error) {
        console.error('Customer data sync failed:', error)
        await queue.unshiftRequest(entry)
        throw error
      }
    }
  }
})

// Register background sync event listener
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  switch (event.tag) {
    case 'pos-orders-sync':
      event.waitUntil(posOrdersQueue.replayRequests())
      break
      
    case 'job-updates-sync':
      event.waitUntil(jobUpdatesQueue.replayRequests())
      break
      
    case 'customer-data-sync':
      event.waitUntil(customerDataQueue.replayRequests())
      break
      
    case 'immediate-sync':
      event.waitUntil(performImmediateSync())
      break
      
    default:
      console.warn('Unknown sync tag:', event.tag)
  }
})

// Handle POST requests with background sync fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST') {
    const url = new URL(event.request.url)
    
    // Route POST requests to appropriate sync queues
    if (url.pathname.includes('/api/pos/orders')) {
      event.respondWith(handlePOSOrderRequest(event.request))
    } else if (url.pathname.includes('/api/jobs')) {
      event.respondWith(handleJobUpdateRequest(event.request))
    } else if (url.pathname.includes('/api/customers')) {
      event.respondWith(handleCustomerDataRequest(event.request))
    }
  }
})

async function handlePOSOrderRequest(request) {
  try {
    // Try network first
    const response = await fetch(request.clone())
    
    if (response.ok) {
      return response
    }
    
    throw new Error('Network request failed')
  } catch (error) {
    // Queue for background sync
    await posOrdersQueue.pushRequest({ request })
    
    // Return optimistic response
    return new Response(
      JSON.stringify({
        success: true,
        queued: true,
        message: 'Order queued for processing when online'
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
```

### Background Sync Manager
```typescript
// background-sync-manager.ts - Client-side background sync coordination
interface SyncQueueItem {
  id: string
  type: SyncType
  data: any
  timestamp: number
  retryCount: number
  priority: 'high' | 'medium' | 'low'
  maxRetries: number
  lastAttempt?: number
}

type SyncType = 'pos_order' | 'job_update' | 'customer_data' | 'invoice_data' | 'schedule_update'

class BackgroundSyncManager {
  private db: IDBDatabase | null = null
  private syncQueues: Map<SyncType, SyncQueueItem[]> = new Map()
  private isOnline: boolean = navigator.onLine
  private syncInProgress: Set<string> = new Set()
  
  async initialize(): Promise<void> {
    // Initialize IndexedDB
    await this.initializeDatabase()
    
    // Load pending sync items
    await this.loadPendingSyncItems()
    
    // Setup online/offline listeners
    this.setupNetworkListeners()
    
    // Setup periodic sync attempts
    this.setupPeriodicSync()
    
    // Register service worker sync
    await this.registerBackgroundSync()
  }
  
  async queueSyncItem(type: SyncType, data: any, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<string> {
    const syncItem: SyncQueueItem = {
      id: this.generateSyncId(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      priority,
      maxRetries: this.getMaxRetries(type, priority),
      lastAttempt: undefined
    }
    
    // Store in IndexedDB
    await this.storeSyncItem(syncItem)
    
    // Add to memory queue
    if (!this.syncQueues.has(type)) {
      this.syncQueues.set(type, [])
    }
    this.syncQueues.get(type)!.push(syncItem)
    
    // Trigger immediate sync if online
    if (this.isOnline) {
      setTimeout(() => this.processSyncQueue(type), 100)
    }
    
    return syncItem.id
  }
  
  async processSyncQueue(type: SyncType): Promise<void> {
    const queue = this.syncQueues.get(type)
    if (!queue || queue.length === 0) return
    
    // Sort by priority and timestamp
    queue.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityWeight[a.priority]
      const bPriority = priorityWeight[b.priority]
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority // High priority first
      }
      
      return a.timestamp - b.timestamp // Older first
    })
    
    // Process items sequentially to avoid overwhelming the server
    for (const item of [...queue]) {
      if (this.syncInProgress.has(item.id)) continue
      
      try {
        await this.syncItem(item)
        
        // Remove from queue and database on success
        const index = queue.indexOf(item)
        if (index > -1) {
          queue.splice(index, 1)
          await this.removeSyncItem(item.id)
        }
      } catch (error) {
        console.error(`Sync failed for ${item.type}:`, error)
        
        // Update retry count
        item.retryCount++
        item.lastAttempt = Date.now()
        
        if (item.retryCount >= item.maxRetries) {
          // Move to failed queue for manual review
          await this.moveToFailedQueue(item)
          const index = queue.indexOf(item)
          if (index > -1) {
            queue.splice(index, 1)
          }
        } else {
          // Update in database for retry
          await this.updateSyncItem(item)
        }
      }
    }
  }
  
  private async syncItem(item: SyncQueueItem): Promise<void> {
    this.syncInProgress.add(item.id)
    
    try {
      switch (item.type) {
        case 'pos_order':
          await this.syncPOSOrder(item)
          break
        case 'job_update':
          await this.syncJobUpdate(item)
          break
        case 'customer_data':
          await this.syncCustomerData(item)
          break
        case 'invoice_data':
          await this.syncInvoiceData(item)
          break
        case 'schedule_update':
          await this.syncScheduleUpdate(item)
          break
        default:
          throw new Error(`Unknown sync type: ${item.type}`)
      }
    } finally {
      this.syncInProgress.delete(item.id)
    }
  }
}
```

## POS Ticket Background Sync

### POS Order Queue Management
```typescript
// pos-background-sync.ts - POS-specific background sync
interface POSOrder {
  id: string
  items: OrderItem[]
  customerId?: string
  tableNumber?: number
  serverName: string
  paymentMethod: string
  subtotal: number
  tax: number
  total: number
  timestamp: string
  status: 'completed' | 'cancelled' | 'refunded'
  modifications?: OrderModification[]
  discounts?: OrderDiscount[]
}

interface OrderModification {
  itemId: string
  modification: string
  priceAdjustment?: number
}

interface OrderDiscount {
  type: 'percentage' | 'fixed'
  value: number
  reason: string
  appliedBy: string
}

class POSBackgroundSync {
  private orderBuffer: Map<string, POSOrder> = new Map()
  private batchSize: number = 10
  private batchTimeout: number = 30000 // 30 seconds
  private batchTimer: NodeJS.Timeout | null = null
  
  async queuePOSOrder(order: POSOrder): Promise<string> {
    // Generate offline order ID if needed
    if (!order.id || order.id.startsWith('offline_')) {
      order.id = `offline_pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Store in buffer for batching
    this.orderBuffer.set(order.id, order)
    
    // Store in IndexedDB for persistence
    await this.storeOfflinePOSOrder(order)
    
    // Setup batch processing
    this.scheduleBatchSync()
    
    // Return optimistic response
    return order.id
  }
  
  private scheduleBatchSync(): void {
    // Clear existing timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }
    
    // Process immediately if buffer is full
    if (this.orderBuffer.size >= this.batchSize) {
      this.processPOSBatch()
      return
    }
    
    // Schedule batch processing
    this.batchTimer = setTimeout(() => {
      this.processPOSBatch()
    }, this.batchTimeout)
  }
  
  async processPOSBatch(): Promise<void> {
    if (this.orderBuffer.size === 0) return
    
    const orders = Array.from(this.orderBuffer.values())
    this.orderBuffer.clear()
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    
    try {
      // Send batch to server
      const response = await fetch('/api/pos/orders/batch', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Batch-Size': orders.length.toString()
        },
        body: JSON.stringify({ orders })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Process successful syncs
        for (const syncedOrder of result.successful) {
          await this.handleSuccessfulSync(syncedOrder)
        }
        
        // Requeue failed orders
        for (const failedOrder of result.failed) {
          await this.requeueFailedOrder(failedOrder)
        }
        
        console.log(`POS batch sync: ${result.successful.length} successful, ${result.failed.length} failed`)
      } else {
        throw new Error(`Batch sync failed: ${response.status}`)
      }
    } catch (error) {
      console.error('POS batch sync failed:', error)
      
      // Requeue all orders for retry
      for (const order of orders) {
        await this.requeuePOSOrder(order)
      }
    }
  }
  
  async syncPOSOrder(order: POSOrder): Promise<any> {
    try {
      const response = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Offline-Sync': 'true'
        },
        body: JSON.stringify(order)
      })
      
      if (response.ok) {
        const syncedOrder = await response.json()
        
        // Update local references
        await this.updateOrderReferences(order.id, syncedOrder.id)
        
        // Remove from offline storage
        await this.removeOfflinePOSOrder(order.id)
        
        // Trigger receipt sync if needed
        await this.syncOrderReceipt(order.id, syncedOrder.id)
        
        return syncedOrder
      } else {
        const error = await response.text()
        throw new Error(`Server error: ${response.status} - ${error}`)
      }
    } catch (error) {
      throw new Error(`POS order sync failed: ${error.message}`)
    }
  }
  
  private async handleSuccessfulSync(syncResult: any): Promise<void> {
    const { offlineId, onlineId, order } = syncResult
    
    // Update local storage
    await this.updateOrderMapping(offlineId, onlineId)
    
    // Update any dependent records
    await this.updateDependentRecords(offlineId, onlineId)
    
    // Remove from offline storage
    await this.removeOfflinePOSOrder(offlineId)
    
    // Trigger UI updates
    this.notifyOrderSynced(offlineId, onlineId, order)
  }
  
  private async requeuePOSOrder(order: POSOrder): Promise<void> {
    // Increment retry count
    const existingData = await this.getOfflinePOSOrder(order.id)
    const retryCount = (existingData?.retryCount || 0) + 1
    const maxRetries = 5
    
    if (retryCount <= maxRetries) {
      // Calculate exponential backoff delay
      const baseDelay = 30000 // 30 seconds
      const delay = baseDelay * Math.pow(2, retryCount - 1)
      
      setTimeout(async () => {
        await this.queuePOSOrder({
          ...order,
          retryCount
        })
      }, delay)
    } else {
      // Move to failed queue for manual intervention
      await this.moveToFailedPOSOrders(order)
    }
  }
}
```

### Payment Transaction Sync
```typescript
// payment-sync.ts - Payment transaction background sync
interface PaymentTransaction {
  id: string
  orderId: string
  amount: number
  method: 'cash' | 'card' | 'mobile' | 'check' | 'gift_card'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  timestamp: string
  processorResponse?: any
  receiptData?: any
  needsVerification: boolean
}

class PaymentSyncManager {
  async syncPaymentTransaction(transaction: PaymentTransaction): Promise<any> {
    try {
      // Different sync strategies based on payment method
      switch (transaction.method) {
        case 'cash':
          return await this.syncCashPayment(transaction)
        case 'card':
          return await this.syncCardPayment(transaction)
        case 'mobile':
          return await this.syncMobilePayment(transaction)
        default:
          return await this.syncGenericPayment(transaction)
      }
    } catch (error) {
      throw new Error(`Payment sync failed: ${error.message}`)
    }
  }
  
  private async syncCardPayment(transaction: PaymentTransaction): Promise<any> {
    // Card payments may need additional verification
    const response = await fetch('/api/payments/card/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: transaction.id,
        amount: transaction.amount,
        processorResponse: transaction.processorResponse,
        timestamp: transaction.timestamp
      })
    })
    
    if (response.ok) {
      const verification = await response.json()
      
      // Update transaction status
      transaction.status = verification.verified ? 'completed' : 'failed'
      transaction.needsVerification = false
      
      return verification
    }
    
    throw new Error('Card payment verification failed')
  }
  
  private async syncCashPayment(transaction: PaymentTransaction): Promise<any> {
    // Cash payments are typically pre-verified
    const response = await fetch('/api/payments/cash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    })
    
    if (response.ok) {
      return await response.json()
    }
    
    throw new Error('Cash payment sync failed')
  }
}
```

## Job Update Background Sync

### Home Services Job Tracking
```typescript
// job-sync.ts - Home services job update synchronization
interface JobUpdate {
  id: string
  jobId: string
  technicianId: string
  updateType: 'status' | 'location' | 'notes' | 'completion' | 'parts_used'
  data: any
  timestamp: string
  coordinates?: { lat: number, lng: number }
  photos?: string[]
  signature?: string
}

class JobUpdateSyncManager {
  private jobUpdateBuffer: Map<string, JobUpdate[]> = new Map()
  
  async queueJobUpdate(update: JobUpdate): Promise<void> {
    const { jobId } = update
    
    // Group updates by job ID for efficient batching
    if (!this.jobUpdateBuffer.has(jobId)) {
      this.jobUpdateBuffer.set(jobId, [])
    }
    
    this.jobUpdateBuffer.get(jobId)!.push(update)
    
    // Store in IndexedDB
    await this.storeJobUpdate(update)
    
    // Schedule sync
    this.scheduleJobSync(jobId)
  }
  
  async syncJobUpdate(update: JobUpdate): Promise<any> {
    try {
      // Prepare update payload
      const payload = {
        jobId: update.jobId,
        technicianId: update.technicianId,
        updateType: update.updateType,
        data: update.data,
        timestamp: update.timestamp,
        metadata: {
          coordinates: update.coordinates,
          deviceId: await this.getDeviceId(),
          appVersion: await this.getAppVersion()
        }
      }
      
      // Handle different update types
      switch (update.updateType) {
        case 'status':
          return await this.syncJobStatusUpdate(payload)
        case 'completion':
          return await this.syncJobCompletion(payload, update)
        case 'parts_used':
          return await this.syncPartsUsage(payload)
        case 'notes':
          return await this.syncJobNotes(payload)
        case 'location':
          return await this.syncLocationUpdate(payload)
        default:
          return await this.syncGenericJobUpdate(payload)
      }
    } catch (error) {
      throw new Error(`Job update sync failed: ${error.message}`)
    }
  }
  
  private async syncJobCompletion(payload: any, update: JobUpdate): Promise<any> {
    // Job completion may include photos, signatures, and final notes
    const completionData = {
      ...payload,
      completionData: {
        photos: update.photos || [],
        signature: update.signature,
        finalNotes: payload.data.notes,
        partsUsed: payload.data.partsUsed || [],
        laborHours: payload.data.laborHours,
        totalCost: payload.data.totalCost
      }
    }
    
    // Upload photos if present
    if (update.photos && update.photos.length > 0) {
      completionData.completionData.photoUrls = await this.uploadJobPhotos(
        update.jobId, 
        update.photos
      )
    }
    
    const response = await fetch('/api/jobs/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completionData)
    })
    
    if (response.ok) {
      const result = await response.json()
      
      // Trigger invoice generation if configured
      if (result.generateInvoice) {
        await this.queueInvoiceGeneration(update.jobId, result)
      }
      
      return result
    }
    
    throw new Error('Job completion sync failed')
  }
  
  private async syncJobStatusUpdate(payload: any): Promise<any> {
    const response = await fetch('/api/jobs/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (response.ok) {
      const result = await response.json()
      
      // Update local job cache
      await this.updateLocalJobCache(payload.jobId, result)
      
      return result
    }
    
    throw new Error('Job status sync failed')
  }
  
  private async uploadJobPhotos(jobId: string, photos: string[]): Promise<string[]> {
    const uploadPromises = photos.map(async (photo, index) => {
      const formData = new FormData()
      
      // Convert base64 to blob if needed
      const photoBlob = this.base64ToBlob(photo)
      formData.append('photo', photoBlob, `job_${jobId}_photo_${index}.jpg`)
      formData.append('jobId', jobId)
      formData.append('photoIndex', index.toString())
      
      const response = await fetch('/api/jobs/photos/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.url
      }
      
      throw new Error(`Photo upload failed for index ${index}`)
    })
    
    return await Promise.all(uploadPromises)
  }
  
  private base64ToBlob(base64: string): Blob {
    const parts = base64.split(',')
    const contentType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const raw = window.atob(parts[1])
    const rawLength = raw.length
    
    const uInt8Array = new Uint8Array(rawLength)
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i)
    }
    
    return new Blob([uInt8Array], { type: contentType })
  }
}
```

### Multi-Industry Job Sync Strategies
```typescript
// industry-job-sync.ts - Industry-specific job synchronization
interface IndustryJobConfig {
  industry: 'hs' | 'rest' | 'auto' | 'ret'
  syncPriority: 'high' | 'medium' | 'low'
  batchSize: number
  syncInterval: number
  criticalFields: string[]
  requiredFields: string[]
}

const INDUSTRY_SYNC_CONFIGS: Record<string, IndustryJobConfig> = {
  'hs': {
    industry: 'hs',
    syncPriority: 'high',
    batchSize: 5,
    syncInterval: 30000, // 30 seconds
    criticalFields: ['status', 'location', 'completion', 'emergency'],
    requiredFields: ['jobId', 'technicianId', 'timestamp', 'status']
  },
  
  'rest': {
    industry: 'rest',
    syncPriority: 'high',
    batchSize: 10,
    syncInterval: 15000, // 15 seconds
    criticalFields: ['order_status', 'kitchen_time', 'table_assignment'],
    requiredFields: ['orderId', 'tableId', 'timestamp', 'status']
  },
  
  'auto': {
    industry: 'auto',
    syncPriority: 'medium',
    batchSize: 8,
    syncInterval: 45000, // 45 seconds
    criticalFields: ['bay_status', 'parts_ordered', 'completion', 'customer_approval'],
    requiredFields: ['workOrderId', 'bayId', 'timestamp', 'status']
  },
  
  'ret': {
    industry: 'ret',
    syncPriority: 'medium',
    batchSize: 15,
    syncInterval: 60000, // 1 minute
    criticalFields: ['inventory_update', 'sale_completion', 'returns'],
    requiredFields: ['transactionId', 'storeId', 'timestamp', 'type']
  }
}

class IndustryJobSyncManager {
  private industry: string
  private config: IndustryJobConfig
  
  constructor(industry: string) {
    this.industry = industry
    this.config = INDUSTRY_SYNC_CONFIGS[industry] || INDUSTRY_SYNC_CONFIGS['hs']
  }
  
  async syncIndustrySpecificJob(jobData: any): Promise<any> {
    // Validate required fields
    this.validateRequiredFields(jobData)
    
    // Apply industry-specific transformations
    const transformedData = this.transformJobData(jobData)
    
    // Determine sync endpoint
    const endpoint = this.getSyncEndpoint(jobData.type || 'generic')
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Industry': this.industry,
          'X-Sync-Priority': this.config.syncPriority
        },
        body: JSON.stringify(transformedData)
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      throw new Error(`Industry sync failed: ${response.status}`)
    } catch (error) {
      throw new Error(`${this.industry} job sync failed: ${error.message}`)
    }
  }
  
  private validateRequiredFields(jobData: any): void {
    for (const field of this.config.requiredFields) {
      if (!jobData[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
  }
  
  private transformJobData(jobData: any): any {
    // Apply industry-specific data transformations
    switch (this.industry) {
      case 'hs':
        return this.transformHomeServicesJob(jobData)
      case 'rest':
        return this.transformRestaurantJob(jobData)
      case 'auto':
        return this.transformAutoServicesJob(jobData)
      case 'ret':
        return this.transformRetailJob(jobData)
      default:
        return jobData
    }
  }
  
  private transformHomeServicesJob(jobData: any): any {
    return {
      ...jobData,
      serviceType: jobData.serviceType || 'general',
      urgencyLevel: jobData.emergency ? 'high' : 'normal',
      locationVerified: !!jobData.coordinates,
      equipmentUsed: jobData.equipmentUsed || [],
      customerPresent: jobData.customerPresent ?? true
    }
  }
  
  private transformRestaurantJob(jobData: any): any {
    return {
      ...jobData,
      orderType: jobData.orderType || 'dine_in',
      preparationTime: jobData.preparationTime || null,
      allergyInfo: jobData.allergyInfo || [],
      courseSequence: jobData.courseSequence || 1,
      kitchenSection: jobData.kitchenSection || 'general'
    }
  }
}
```

## Sync Conflict Resolution

### Conflict Detection and Resolution
```typescript
// conflict-resolution.ts - Handle sync conflicts intelligently
interface SyncConflict {
  id: string
  type: 'data_conflict' | 'timestamp_conflict' | 'version_conflict'
  localData: any
  serverData: any
  conflictFields: string[]
  resolutionStrategy: ConflictResolutionStrategy
}

type ConflictResolutionStrategy = 'server_wins' | 'client_wins' | 'merge' | 'manual'

class ConflictResolutionManager {
  async detectConflict(localData: any, serverData: any): Promise<SyncConflict | null> {
    // Check for version conflicts
    if (localData.version && serverData.version && localData.version !== serverData.version) {
      return {
        id: localData.id,
        type: 'version_conflict',
        localData,
        serverData,
        conflictFields: this.getConflictFields(localData, serverData),
        resolutionStrategy: this.determineResolutionStrategy(localData, serverData)
      }
    }
    
    // Check for timestamp conflicts
    const localTimestamp = new Date(localData.lastModified || localData.timestamp).getTime()
    const serverTimestamp = new Date(serverData.lastModified || serverData.timestamp).getTime()
    
    if (Math.abs(localTimestamp - serverTimestamp) > 5000) { // 5 second threshold
      const conflictFields = this.getConflictFields(localData, serverData)
      
      if (conflictFields.length > 0) {
        return {
          id: localData.id,
          type: 'data_conflict',
          localData,
          serverData,
          conflictFields,
          resolutionStrategy: this.determineResolutionStrategy(localData, serverData)
        }
      }
    }
    
    return null
  }
  
  async resolveConflict(conflict: SyncConflict): Promise<any> {
    switch (conflict.resolutionStrategy) {
      case 'server_wins':
        return conflict.serverData
        
      case 'client_wins':
        return conflict.localData
        
      case 'merge':
        return await this.mergeConflictData(conflict)
        
      case 'manual':
        return await this.requestManualResolution(conflict)
        
      default:
        throw new Error(`Unknown resolution strategy: ${conflict.resolutionStrategy}`)
    }
  }
  
  private async mergeConflictData(conflict: SyncConflict): Promise<any> {
    const merged = { ...conflict.serverData }
    
    // Apply intelligent merging rules
    for (const field of conflict.conflictFields) {
      merged[field] = await this.resolveFieldConflict(
        field,
        conflict.localData[field],
        conflict.serverData[field],
        conflict
      )
    }
    
    // Update version and timestamp
    merged.version = (Math.max(conflict.localData.version || 0, conflict.serverData.version || 0)) + 1
    merged.lastModified = new Date().toISOString()
    merged.conflictResolved = true
    
    return merged
  }
  
  private async resolveFieldConflict(
    field: string,
    localValue: any,
    serverValue: any,
    conflict: SyncConflict
  ): Promise<any> {
    // Field-specific resolution rules
    const fieldRules = {
      'status': this.resolveStatusConflict,
      'notes': this.mergeTextFields,
      'amount': this.resolveNumericConflict,
      'timestamp': this.resolveTimestampConflict,
      'items': this.mergeArrayFields
    }
    
    const resolver = fieldRules[field] || this.useNewestValue
    return await resolver.call(this, localValue, serverValue, conflict)
  }
  
  private resolveStatusConflict(localValue: string, serverValue: string): string {
    // Status resolution priority
    const statusPriority = {
      'completed': 5,
      'in_progress': 4,
      'assigned': 3,
      'pending': 2,
      'created': 1,
      'cancelled': 0
    }
    
    const localPriority = statusPriority[localValue] || 0
    const serverPriority = statusPriority[serverValue] || 0
    
    return localPriority >= serverPriority ? localValue : serverValue
  }
  
  private mergeTextFields(localValue: string, serverValue: string): string {
    if (!localValue) return serverValue
    if (!serverValue) return localValue
    
    // Merge with conflict markers
    return `${serverValue}\n\n--- Local changes ---\n${localValue}`
  }
  
  private mergeArrayFields(localValue: any[], serverValue: any[]): any[] {
    if (!localValue) return serverValue || []
    if (!serverValue) return localValue || []
    
    // Merge arrays, removing duplicates
    const merged = [...serverValue]
    
    for (const item of localValue) {
      const exists = merged.some(existing => 
        existing.id === item.id || JSON.stringify(existing) === JSON.stringify(item)
      )
      
      if (!exists) {
        merged.push(item)
      }
    }
    
    return merged
  }
}
```

## Retry Logic and Error Handling

### Exponential Backoff Strategy
```typescript
// retry-logic.ts - Robust retry mechanism
interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
  jitter: boolean
}

class RetryManager {
  private readonly DEFAULT_CONFIG: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000,  // 1 second
    maxDelay: 300000, // 5 minutes
    backoffFactor: 2,
    jitter: true
  }
  
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }
    let lastError: Error
    
    for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        console.warn(`Attempt ${attempt}/${finalConfig.maxRetries} failed:`, error.message)
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          throw error
        }
        
        // Don't delay after last attempt
        if (attempt === finalConfig.maxRetries) {
          break
        }
        
        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, finalConfig)
        await this.sleep(delay)
      }
    }
    
    throw new Error(`Operation failed after ${finalConfig.maxRetries} attempts: ${lastError.message}`)
  }
  
  private shouldNotRetry(error: Error): boolean {
    // Don't retry on client errors (4xx status codes)
    const nonRetryableErrors = [
      'validation_error',
      'authentication_error',
      'authorization_error',
      'not_found',
      'conflict',
      'rate_limit_exceeded'
    ]
    
    return nonRetryableErrors.some(errorType => 
      error.message.toLowerCase().includes(errorType)
    )
  }
  
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1)
    const clampedDelay = Math.min(exponentialDelay, config.maxDelay)
    
    if (config.jitter) {
      // Add random jitter (±25% of delay)
      const jitter = clampedDelay * 0.25
      return clampedDelay + (Math.random() - 0.5) * 2 * jitter
    }
    
    return clampedDelay
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

This comprehensive background sync implementation ensures Thorbis can handle offline operations seamlessly with intelligent queuing, conflict resolution, and robust retry mechanisms across all industries.
