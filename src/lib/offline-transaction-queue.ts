// Offline transaction queue with intelligent sync and conflict resolution
// Handles queuing, retry logic, and background sync for all payment operations

interface QueuedTransaction {
  id: string;
  type: 'payment' | 'refund' | 'void' | 'capture';
  data: {
    amount: number;
    currency: string;
    paymentMethod: string;
    organizationId: string;
    customerId?: string;
    metadata?: Record<string, unknown>;
  };
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retry';
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  estimatedSyncTime?: Date;
  lastError?: string;
  dependsOn?: string[]; // IDs of transactions this one depends on
  tags?: string[];
}

interface SyncResult {
  successful: string[];
  failed: string[];
  conflicts: ConflictResolution[];
}

interface ConflictResolution {
  transactionId: string;
  conflictType: 'duplicate' | 'outdated' | 'invalid_state';
  resolution: 'merge' | 'override' | 'manual_review';
  details: string;
}

interface QueueMetrics {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageProcessingTime: number;
  successRate: number;
  lastSyncTime?: Date;
}

export class OfflineTransactionQueue {
  private static instance: OfflineTransactionQueue | null = null;
  private queue: Map<string, QueuedTransaction> = new Map();
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private retryTimers: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  private readonly STORAGE_KEY = 'offline_transaction_queue';
  private readonly RETRY_DELAYS = [1000, 5000, 15000, 60000, 300000]; // 1s, 5s, 15s, 1m, 5m
  private readonly MAX_QUEUE_SIZE = 1000;
  private readonly BATCH_SIZE = 10;

  private constructor() {
    this.loadFromStorage();
    this.startSyncTimer();
    this.setupNetworkListeners();
  }

  static getInstance(): OfflineTransactionQueue {
    if (!OfflineTransactionQueue.instance) {
      OfflineTransactionQueue.instance = new OfflineTransactionQueue();
    }
    return OfflineTransactionQueue.instance;
  }

  // Add transaction to queue
  async enqueue(transaction: Omit<QueuedTransaction, 'id' | 'timestamp' | 'status' | 'retryCount'>): Promise<string> {
    // Check queue size limit
    if (this.queue.size >= this.MAX_QUEUE_SIZE) {
      await this.cleanupOldTransactions();
    }

    const id = this.generateTransactionId();
    const queuedTransaction: QueuedTransaction = {
      id,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
      ...transaction
    };

    this.queue.set(id, queuedTransaction);
    await this.persistToStorage();

    this.emit('transaction_queued', queuedTransaction);

    // Try immediate sync if online
    if (navigator.onLine) {
      this.scheduleSync();
    }

    return id;
  }

  // Process transaction queue
  async processQueue(): Promise<SyncResult> {
    if (this.syncInProgress || !navigator.onLine) {
      return { successful: [], failed: [], conflicts: [] };
    }

    this.syncInProgress = true;
    this.emit('sync_started');

    const result: SyncResult = {
      successful: [],
      failed: [],
      conflicts: []
    };

    try {
      // Get transactions ready for processing
      const readyTransactions = this.getReadyTransactions();
      const batches = this.createProcessingBatches(readyTransactions);

      for (const batch of batches) {
        const batchResult = await this.processBatch(batch);
        
        result.successful.push(...batchResult.successful);
        result.failed.push(...batchResult.failed);
        result.conflicts.push(...batchResult.conflicts);

        // Small delay between batches to prevent overwhelming the server
        if (batches.length > 1) {
          await this.delay(100);
        }
      }

      await this.persistToStorage();
      this.emit('sync_completed', result);

    } catch (error) {
      console.error('Queue processing failed:', error);
      this.emit('sync_failed', error);
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  // Get transactions ready for processing (respects dependencies and priority)
  private getReadyTransactions(): QueuedTransaction[] {
    const pending = Array.from(this.queue.values())
      .filter(t => t.status === 'pending' || t.status === 'retry')
      .filter(t => this.areDependenciesMet(t))
      .sort((a, b) => {
        // Sort by priority first, then by timestamp
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return a.timestamp.getTime() - b.timestamp.getTime();
      });

    return pending.slice(0, this.BATCH_SIZE);
  }

  // Check if transaction dependencies are met
  private areDependenciesMet(transaction: QueuedTransaction): boolean {
    if (!transaction.dependsOn?.length) return true;

    return transaction.dependsOn.every(depId => {
      const dep = this.queue.get(depId);
      return dep?.status === 'completed';
    });
  }

  // Create processing batches with dependency awareness
  private createProcessingBatches(transactions: QueuedTransaction[]): QueuedTransaction[][] {
    const batches: QueuedTransaction[][] = [];
    const processed = new Set<string>();

    // Process transactions in dependency order
    while (processed.size < transactions.length) {
      const batch: QueuedTransaction[] = [];
      
      for (const transaction of transactions) {
        if (processed.has(transaction.id)) continue;
        
        // Check if dependencies are in processed set
        const depsReady = !transaction.dependsOn?.some(depId => 
          transactions.find(t => t.id === depId) && !processed.has(depId)
        );
        
        if (depsReady && batch.length < this.BATCH_SIZE) {
          batch.push(transaction);
          processed.add(transaction.id);
        }
      }
      
      if (batch.length === 0) break; // Prevent infinite loop
      batches.push(batch);
    }

    return batches;
  }

  // Process a batch of transactions
  private async processBatch(batch: QueuedTransaction[]): Promise<SyncResult> {
    const result: SyncResult = { successful: [], failed: [], conflicts: [] };

    // Process transactions in parallel within the batch
    const promises = batch.map(async (transaction) => {
      try {
        transaction.status = 'processing';
        this.emit('transaction_processing', transaction);

        const syncResult = await this.syncTransaction(transaction);
        
        if (syncResult.success) {
          transaction.status = 'completed';
          result.successful.push(transaction.id);
          this.emit('transaction_completed', transaction);
        } else if (syncResult.conflict) {
          result.conflicts.push(syncResult.conflict);
          this.emit('transaction_conflict', { transaction, conflict: syncResult.conflict });
        } else {
          throw new Error(syncResult.error || 'Unknown sync error');
        }
      } catch (_error) {
        await this.handleTransactionError(transaction, error);
        result.failed.push(transaction.id);
      }
    });

    await Promise.allSettled(promises);
    return result;
  }

  // Sync individual transaction with server
  private async syncTransaction(transaction: QueuedTransaction): Promise<{
    success: boolean;
    conflict?: ConflictResolution;
    error?: string;
  }> {
    try {
      // Simulate API call - replace with actual implementation
      const response = await this.makeApiCall(transaction);
      
      if (response.status === 'duplicate') {
        return {
          success: false,
          conflict: {
            transactionId: transaction.id,
            conflictType: 'duplicate',
            resolution: 'merge',
            details: 'Transaction already exists on server'
          }
        };
      }

      if (response.status === 'invalid') {
        return {
          success: false,
          error: response.message || 'Invalid transaction data'
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Mock API call - replace with actual implementation
  private async makeApiCall(transaction: QueuedTransaction): Promise<unknown> {
    // Simulate network delay
    await this.delay(Math.random() * 2000 + 500);

    // Simulate various responses
    const rand = Math.random();
    if (rand < 0.05) {
      return { status: 'duplicate', id: transaction.id };
    } else if (rand < 0.1) {
      return { status: 'invalid', message: 'Invalid amount' };
    } else if (rand < 0.15) {
      throw new Error('Network timeout');
    }

    return { status: 'success', id: transaction.id, serverTimestamp: new Date() };
  }

  // Handle transaction processing errors
  private async handleTransactionError(transaction: QueuedTransaction, error: unknown): Promise<void> {
    transaction.lastError = error instanceof Error ? error.message : String(error);
    transaction.retryCount++;

    if (transaction.retryCount >= transaction.maxRetries) {
      transaction.status = 'failed';
      this.emit('transaction_failed', { transaction, error });
    } else {
      transaction.status = 'retry';
      this.scheduleRetry(transaction);
      this.emit('transaction_retry_scheduled', transaction);
    }
  }

  // Schedule retry for failed transaction
  private scheduleRetry(transaction: QueuedTransaction): void {
    const delay = this.RETRY_DELAYS[Math.min(transaction.retryCount - 1, this.RETRY_DELAYS.length - 1)];
    
    // Clear existing retry timer
    const existingTimer = this.retryTimers.get(transaction.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new retry
    const timer = setTimeout(() => {
      transaction.status = 'pending';
      transaction.estimatedSyncTime = new Date(Date.now() + delay);
      this.retryTimers.delete(transaction.id);
      
      if (navigator.onLine) {
        this.scheduleSync();
      }
    }, delay);

    this.retryTimers.set(transaction.id, timer);
  }

  // Remove transaction from queue
  async removeTransaction(id: string): Promise<boolean> {
    const removed = this.queue.delete(id);
    if (removed) {
      // Clear any pending retry timer
      const timer = this.retryTimers.get(id);
      if (timer) {
        clearTimeout(timer);
        this.retryTimers.delete(id);
      }

      await this.persistToStorage();
      this.emit('transaction_removed', id);
    }
    return removed;
  }

  // Get transaction by ID
  getTransaction(id: string): QueuedTransaction | undefined {
    return this.queue.get(id);
  }

  // Get all transactions with optional filtering
  getTransactions(filter?: {
    status?: QueuedTransaction['status'];
    type?: QueuedTransaction['type'];
    priority?: QueuedTransaction['priority'];
    tags?: string[];
  }): QueuedTransaction[] {
    let transactions = Array.from(this.queue.values());

    if (filter) {
      if (filter.status) {
        transactions = transactions.filter(t => t.status === filter.status);
      }
      if (filter.type) {
        transactions = transactions.filter(t => t.type === filter.type);
      }
      if (filter.priority) {
        transactions = transactions.filter(t => t.priority === filter.priority);
      }
      if (filter.tags?.length) {
        transactions = transactions.filter(t => 
          t.tags?.some(tag => filter.tags!.includes(tag))
        );
      }
    }

    return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get queue metrics
  getMetrics(): QueueMetrics {
    const transactions = Array.from(this.queue.values());
    const completed = transactions.filter(t => t.status === 'completed');
    
    let averageProcessingTime = 0;
    if (completed.length > 0) {
      const totalTime = completed.reduce((sum, t) => {
        // Estimate processing time based on retry count and current time
        return sum + (t.retryCount * 30000); // Rough estimate
      }, 0);
      averageProcessingTime = totalTime / completed.length;
    }

    const successRate = transactions.length > 0 ? completed.length / transactions.length : 1;

    return {
      total: transactions.length,
      pending: transactions.filter(t => t.status === 'pending').length,
      processing: transactions.filter(t => t.status === 'processing').length,
      completed: completed.length,
      failed: transactions.filter(t => t.status === 'failed').length,
      averageProcessingTime,
      successRate,
      lastSyncTime: this.getLastSyncTime()
    };
  }

  // Clear completed transactions older than specified days
  async cleanupOldTransactions(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    let removed = 0;

    for (const [id, transaction] of this.queue) {
      if (transaction.status === 'completed' && transaction.timestamp < cutoffDate) {
        this.queue.delete(id);
        removed++;
      }
    }

    if (removed > 0) {
      await this.persistToStorage();
      this.emit('transactions_cleaned', removed);
    }

    return removed;
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener for ${event}:', error);
        }
      });
    }
  }

  // Storage management
  private async persistToStorage(): Promise<void> {
    try {
      const data = {
        queue: Array.from(this.queue.entries()),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist queue to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.queue = new Map(data.queue.map(([id, transaction]: [string, any]) => [
          id,
          {
            ...transaction,
            timestamp: new Date(transaction.timestamp),
            estimatedSyncTime: transaction.estimatedSyncTime ? new Date(transaction.estimatedSyncTime) : undefined
          }
        ]));
      }
    } catch (error) {
      console.error('Failed to load queue from storage:', error);
      this.queue = new Map();
    }
  }

  // Network and sync management
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.emit('network_online');
      this.scheduleSync(1000); // Delay to ensure connection is stable
    });

    window.addEventListener('offline', () => {
      this.emit('network_offline');
    });
  }

  private startSyncTimer(): void {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.scheduleSync();
      }
    }, 5 * 60 * 1000);
  }

  private scheduleSync(delay: number = 0): void {
    setTimeout(() => {
      this.processQueue();
    }, delay);
  }

  private getLastSyncTime(): Date | undefined {
    // Get the most recent completed transaction timestamp as proxy for last sync
    const completed = Array.from(this.queue.values())
      .filter(t => t.status === 'completed')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return completed[0]?.timestamp;
  }

  // Utility methods
  private generateTransactionId(): string {
    return 'txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup resources
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Clear all retry timers
    for (const timer of this.retryTimers.values()) {
      clearTimeout(timer);
    }
    this.retryTimers.clear();

    // Remove event listeners
    window.removeEventListener('online', this.scheduleSync);
    window.removeEventListener('offline', () => {});

    this.eventListeners.clear();
  }
}

// Factory function
export function createOfflineTransactionQueue(): OfflineTransactionQueue {
  return OfflineTransactionQueue.getInstance();
}

// Hook for React components
export function useOfflineTransactionQueue() {
  const queue = OfflineTransactionQueue.getInstance();
  
  return {
    enqueue: queue.enqueue.bind(queue),
    getTransactions: queue.getTransactions.bind(queue),
    getMetrics: queue.getMetrics.bind(queue),
    processQueue: queue.processQueue.bind(queue),
    removeTransaction: queue.removeTransaction.bind(queue),
    cleanupOldTransactions: queue.cleanupOldTransactions.bind(queue),
    on: queue.on.bind(queue),
    off: queue.off.bind(queue)
  };
}