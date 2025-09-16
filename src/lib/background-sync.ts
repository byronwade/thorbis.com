'use client'

// Background Sync system for offline data synchronization in Thorbis Business OS
// Handles queueing, storing, and syncing data when the connection is restored

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface SyncRequest {
  id: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  timestamp: number
  retries: number
  maxRetries: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  metadata?: Record<string, unknown>
}

export interface SyncQueueOptions {
  maxRetries?: number
  retryDelay?: number
  batchSize?: number
  priority?: SyncRequest['priority']
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface SyncStats {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  failedRequests: number
  lastSyncTime: number | null
}

// =============================================================================
// IndexedDB Management for Offline Storage
// =============================================================================

class SyncStorage {
  private dbName = 'thorbis-background-sync'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp')
          store.createIndex('priority', 'priority')
          store.createIndex('tags', 'tags', { multiEntry: true })
        }

        // Create sync stats store
        if (!db.objectStoreNames.contains('syncStats')) {
          db.createObjectStore('syncStats', { keyPath: 'key' })
        }
      }
    })
  }

  async addRequest(request: SyncRequest): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      
      const addRequest = store.add(request)
      addRequest.onsuccess = () => resolve()
      addRequest.onerror = () => reject(addRequest.error)
    })
  }

  async getRequests(limit?: number): Promise<SyncRequest[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly')
      const store = transaction.objectStore('syncQueue')
      const index = store.index('priority')

      // Get requests ordered by priority (critical first)
      const request = index.openCursor(null, 'prev')
      const results: SyncRequest[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor && (!limit || results.length < limit)) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          resolve(results)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  async removeRequest(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      
      const deleteRequest = store.delete(id)
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    })
  }

  async updateRequest(request: SyncRequest): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      
      const updateRequest = store.put(request)
      updateRequest.onsuccess = () => resolve()
      updateRequest.onerror = () => reject(updateRequest.error)
    })
  }

  async getStats(): Promise<SyncStats> {
    if (!this.db) await this.init()

    const requests = await this.getRequests()
    const stats = await this.getStoredStats()

    return {
      totalRequests: requests.length + stats.completedRequests + stats.failedRequests,
      pendingRequests: requests.length,
      completedRequests: stats.completedRequests,
      failedRequests: stats.failedRequests,
      lastSyncTime: stats.lastSyncTime
    }
  }

  private async getStoredStats(): Promise<{
    completedRequests: number
    failedRequests: number
    lastSyncTime: number | null
  }> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncStats'], 'readonly')
      const store = transaction.objectStore('syncStats')
      
      const request = store.get('stats')
      request.onsuccess = () => {
        const result = request.result
        resolve(result?.value || {
          completedRequests: 0,
          failedRequests: 0,
          lastSyncTime: null
        })
      }
      request.onerror = () => reject(request.error)
    })
  }

  async updateStats(stats: Partial<{
    completedRequests: number
    failedRequests: number
    lastSyncTime: number
  }>): Promise<void> {
    if (!this.db) await this.init()

    return new Promise(async (resolve, reject) => {
      const currentStats = await this.getStoredStats()
      const updatedStats = { ...currentStats, ...stats }

      const transaction = this.db!.transaction(['syncStats'], 'readwrite')
      const store = transaction.objectStore('syncStats')
      
      const updateRequest = store.put({ key: 'stats', value: updatedStats })
      updateRequest.onsuccess = () => resolve()
      updateRequest.onerror = () => reject(updateRequest.error)
    })
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue', 'syncStats'], 'readwrite')
      
      const clearQueue = transaction.objectStore('syncQueue').clear()
      const clearStats = transaction.objectStore('syncStats').clear()
      
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }
}

// =============================================================================
// Background Sync Manager
// =============================================================================

export class BackgroundSyncManager {
  private storage = new SyncStorage()
  private isProcessing = false
  private retryTimeouts = new Map<string, NodeJS.Timeout>()
  private listeners = new Set<(event: SyncEvent) => void>()

  constructor() {
    this.init()
  }

  private async init() {
    await this.storage.init()

    // Register service worker sync event
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this))
    }

    // Start processing on network reconnection
    window.addEventListener('online', this.processQueue.bind(this))

    // Process any pending requests on initialization
    if (navigator.onLine) {
      setTimeout(() => this.processQueue(), 1000)
    }
  }

  // Add request to sync queue
  async queueRequest(
    url: string, 
    options: RequestInit & SyncQueueOptions = {}
  ): Promise<string> {
    const {
      method = 'GET',
      body,
      headers,
      maxRetries = 3,
      priority = 'medium',
      tags = [],
      metadata = {},
      ...fetchOptions
    } = options

    const request: SyncRequest = {
      id: this.generateId(),
      url,
      method: method as SyncRequest['method'],
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...headers as Record<string, string>
      },
      timestamp: Date.now(),
      retries: 0,
      maxRetries,
      priority,
      tags,
      metadata
    }

    await this.storage.addRequest(request)
    this.emit({ type: 'queued', request })

    // Try to process immediately if online
    if (navigator.onLine && !this.isProcessing) {
      setTimeout(() => this.processQueue(), 100)
    }

    // Register background sync with service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration?.sync) {
          await (registration.sync as any).register('background-sync')
        }
      } catch (error) {
        console.warn('[BackgroundSync] Failed to register sync:', error)
      }
    }

    return request.id
  }

  // Process the sync queue
  async processQueue(batchSize: number = 10): Promise<void> {
    if (this.isProcessing || !navigator.onLine) {
      return
    }

    this.isProcessing = true
    this.emit({ type: 'processing-started' })

    try {
      const requests = await this.storage.getRequests(batchSize)
      
      if (requests.length === 0) {
        this.emit({ type: 'queue-empty' })
        return
      }

      const results = await Promise.allSettled(
        requests.map(request => this.processRequest(request))
      )

      const completed = 0
      const failed = 0

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          completed++
        } else {
          failed++
          console.error('[BackgroundSync] Request failed:', result.reason)
        }
      })

      await this.storage.updateStats({
        completedRequests: (await this.storage.getStats()).completedRequests + completed,
        failedRequests: (await this.storage.getStats()).failedRequests + failed,
        lastSyncTime: Date.now()
      })

      this.emit({ 
        type: 'batch-completed', 
        completed, 
        failed, 
        total: requests.length 
      })

    } catch (error) {
      console.error('[BackgroundSync] Queue processing failed:', error)
      this.emit({ type: 'processing-failed', error })
    } finally {
      this.isProcessing = false
      this.emit({ type: 'processing-finished' })
    }
  }

  // Process individual request
  private async processRequest(request: SyncRequest): Promise<void> {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      })

      if (response.ok) {
        // Request successful, remove from queue
        await this.storage.removeRequest(request.id)
        this.emit({ type: 'request-completed', request, response })
      } else {
        throw new Error('HTTP ${response.status}: ${response.statusText}')
      }

    } catch (_error) {
      request.retries++
      
      if (request.retries >= request.maxRetries) {
        // Max retries reached, remove from queue
        await this.storage.removeRequest(request.id)
        this.emit({ type: 'request-failed', request, error })
      } else {
        // Schedule retry
        await this.storage.updateRequest(request)
        this.scheduleRetry(request)
        this.emit({ type: 'request-retry', request, error })
      }
    }
  }

  // Schedule retry with exponential backoff
  private scheduleRetry(request: SyncRequest): void {
    const delay = Math.min(
      1000 * Math.pow(2, request.retries), // Exponential backoff
      30000 // Max 30 seconds
    )

    const timeout = setTimeout(() => {
      this.retryTimeouts.delete(request.id)
      if (navigator.onLine) {
        this.processRequest(request)
      }
    }, delay)

    this.retryTimeouts.set(request.id, timeout)
  }

  // Handle messages from service worker
  private handleServiceWorkerMessage(event: MessageEvent): void {
    if (event.data?.type === 'background-sync') {
      this.processQueue()
    }
  }

  // Get queue statistics
  async getStats(): Promise<SyncStats> {
    return this.storage.getStats()
  }

  // Clear all pending requests
  async clearQueue(): Promise<void> {
    // Clear retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
    this.retryTimeouts.clear()

    await this.storage.clear()
    this.emit({ type: 'queue-cleared' })
  }

  // Event system
  on(listener: (event: SyncEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(event: SyncEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('[BackgroundSync] Listener error:', error)
      }
    })
  }

  // Utility methods
  private generateId(): string {
    return 'sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}'
  }
}

// =============================================================================
// Sync Events
// =============================================================================

type SyncEvent = 
  | { type: 'queued'; request: SyncRequest }
  | { type: 'processing-started' }
  | { type: 'processing-finished' }
  | { type: 'processing-failed'; error: Error | unknown }
  | { type: 'queue-empty' }
  | { type: 'queue-cleared' }
  | { type: 'batch-completed'; completed: number; failed: number; total: number }
  | { type: 'request-completed'; request: SyncRequest; response: Response }
  | { type: 'request-failed'; request: SyncRequest; error: Error | unknown }
  | { type: 'request-retry'; request: SyncRequest; error: Error | unknown }

// =============================================================================
// Global Instance
// =============================================================================

let syncManager: BackgroundSyncManager | null = null

export function getBackgroundSyncManager(): BackgroundSyncManager {
  if (!syncManager) {
    syncManager = new BackgroundSyncManager()
  }
  return syncManager
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Queue a request for background sync
 */
export async function queueSync(
  url: string,
  options?: RequestInit & SyncQueueOptions
): Promise<string> {
  const manager = getBackgroundSyncManager()
  return manager.queueRequest(url, options)
}

/**
 * Process all pending sync requests
 */
export async function processSync(): Promise<void> {
  const manager = getBackgroundSyncManager()
  return manager.processQueue()
}

/**
 * Get sync queue statistics
 */
export async function getSyncStats(): Promise<SyncStats> {
  const manager = getBackgroundSyncManager()
  return manager.getStats()
}

/**
 * Clear all pending sync requests
 */
export async function clearSyncQueue(): Promise<void> {
  const manager = getBackgroundSyncManager()
  return manager.clearQueue()
}

/**
 * Listen to sync events
 */
export function onSyncEvent(listener: (event: SyncEvent) => void): () => void {
  const manager = getBackgroundSyncManager()
  return manager.on(listener)
}

// =============================================================================
// React Hook for Background Sync
// =============================================================================

export function useBackgroundSync() {
  const [stats, setStats] = React.useState<SyncStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    failedRequests: 0,
    lastSyncTime: null
  })

  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const manager = getBackgroundSyncManager()

    const updateStats = async () => {
      try {
        const newStats = await manager.getStats()
        setStats(newStats)
      } catch (err) {
        console.error('Failed to get sync stats:', err)
      }
    }

    const unsubscribe = manager.on((event) => {
      switch (event.type) {
        case 'processing-started':
          setIsProcessing(true)
          setError(null)
          break
        case 'processing-finished':
          setIsProcessing(false)
          updateStats()
          break
        case 'processing-failed':
          setIsProcessing(false)
          setError(event.error?.message || 'Sync failed')
          break
        case 'queued':
        case 'batch-completed':
        case 'request-completed':
        case 'request-failed':
        case 'queue-cleared':
          updateStats()
          break
      }
    })

    // Initial stats load
    updateStats()

    return unsubscribe
  }, [])

  return {
    stats,
    isProcessing,
    error,
    queueRequest: queueSync,
    processQueue: processSync,
    clearQueue: clearSyncQueue
  }
}

// Make React import available for the hook
declare global {
  const React: typeof import('react')
}

// Fallback for environments where React is not available
if (typeof React === 'undefined') {
  (global as any).React = {
    useState: () => [null, () => {}],
    useEffect: () => {}
  }
}