// Payment sync manager for handling offline payment synchronization
// Manages queued payments, retry logic, and conflict resolution

import { offlineManager } from './offline-utils';
import { paymentTokenizer } from './payment-tokenization';

interface QueuedPayment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  customerId?: string;
  organizationId: string;
  tokenId?: string;
  metadata: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  error?: string;
  priority: number; // 1-10, higher is more important
}

interface SyncResult {
  success: boolean;
  paymentId: string;
  remoteId?: string;
  error?: string;
  shouldRetry: boolean;
}

interface SyncBatch {
  payments: QueuedPayment[];
  batchId: string;
  createdAt: string;
}

interface SyncMetrics {
  totalPending: number;
  totalProcessing: number;
  totalCompleted: number;
  totalFailed: number;
  avgRetryCount: number;
  oldestPending?: string;
  lastSuccessfulSync?: string;
}

export class PaymentSyncManager {
  private static instance: PaymentSyncManager | null = null;
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private batchSize = 10;
  private maxConcurrentRequests = 3;
  private syncRetryDelay = 5000; // 5 seconds

  private constructor() {
    this.setupPeriodicSync();
    this.setupNetworkEventListeners();
  }

  static getInstance(): PaymentSyncManager {
    if (!PaymentSyncManager.instance) {
      PaymentSyncManager.instance = new PaymentSyncManager();
    }
    return PaymentSyncManager.instance;
  }

  async queuePayment(payment: Omit<QueuedPayment, 'id' | 'status' | 'retryCount' | 'createdAt' | 'priority'>): Promise<string> {
    const queuedPayment: QueuedPayment = {
      ...payment,
      id: this.generatePaymentId(),
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString(),
      priority: this.calculatePriority(payment)
    };

    await offlineManager.storeOfflineData('payment_queue', queuedPayment);
    
    // Attempt immediate sync if online
    if (navigator.onLine && !this.syncInProgress) {
      this.triggerSync();
    }

    return queuedPayment.id;
  }

  async getQueuedPayments(status?: QueuedPayment['status']): Promise<QueuedPayment[]> {
    const filters: unknown = {};
    if (status) {
      filters.status = status;
    }

    const payments = await offlineManager.getOfflineData('payment_queue', filters);
    return payments as QueuedPayment[];
  }

  async getPaymentById(id: string): Promise<QueuedPayment | null> {
    const payments = await offlineManager.getOfflineData('payment_queue', { id });
    return payments.length > 0 ? payments[0] as QueuedPayment : null;
  }

  async updatePaymentStatus(
    id: string, 
    status: QueuedPayment['status'], 
    error?: string,
    remoteId?: string
  ): Promise<void> {
    const payment = await this.getPaymentById(id);
    if (!payment) return;

    payment.status = status;
    payment.lastAttemptAt = new Date().toISOString();
    
    if (error) {
      payment.error = error;
      payment.retryCount++;
      
      if (payment.retryCount < payment.maxRetries) {
        payment.nextRetryAt = new Date(Date.now() + this.calculateBackoffDelay(payment.retryCount)).toISOString();
        payment.status = 'retrying';
      } else {
        payment.status = 'failed';
      }
    }

    if (remoteId) {
      payment.metadata.remoteId = remoteId;
    }

    await offlineManager.storeOfflineData('payment_queue', payment);
  }

  async triggerSync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    try {
      this.syncInProgress = true;
      await this.performSync();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async getSyncMetrics(): Promise<SyncMetrics> {
    const allPayments = await this.getQueuedPayments();
    
    const metrics: SyncMetrics = {
      totalPending: 0,
      totalProcessing: 0,
      totalCompleted: 0,
      totalFailed: 0,
      avgRetryCount: 0
    };

    const totalRetries = 0;
    let oldestPendingTime: number | null = null;

    for (const payment of allPayments) {
      switch (payment.status) {
        case 'pending':
        case 'retrying':
          metrics.totalPending++;
          const pendingTime = new Date(payment.createdAt).getTime();
          if (!oldestPendingTime || pendingTime < oldestPendingTime) {
            oldestPendingTime = pendingTime;
            metrics.oldestPending = payment.createdAt;
          }
          break;
        case 'processing':
          metrics.totalProcessing++;
          break;
        case 'completed':
          metrics.totalCompleted++;
          break;
        case 'failed':
          metrics.totalFailed++;
          break;
      }
      
      totalRetries += payment.retryCount;
    }

    if (allPayments.length > 0) {
      metrics.avgRetryCount = totalRetries / allPayments.length;
    }

    // Get last successful sync time
    const syncHistory = await offlineManager.getOfflineData('sync_history', {});
    const lastSync = syncHistory
      .filter((h: unknown) => h.success)
      .sort((a: unknown, b: unknown) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (lastSync) {
      metrics.lastSuccessfulSync = lastSync.timestamp;
    }

    return metrics;
  }

  private async performSync(): Promise<void> {
    const pendingPayments = await this.getQueuedPayments('pending');
    const retryingPayments = await this.getQueuedPayments('retrying')
      .then(payments => payments.filter(p => 
        !p.nextRetryAt || new Date(p.nextRetryAt) <= new Date()
      ));

    const paymentsToSync = [...pendingPayments, ...retryingPayments]
      .sort((a, b) => b.priority - a.priority)
      .slice(0, this.batchSize);

    if (paymentsToSync.length === 0) {
      return;
    }

    const batch: SyncBatch = {
      payments: paymentsToSync,
      batchId: this.generateBatchId(),
      createdAt: new Date().toISOString()
    };

    await this.logSyncStart(batch);

    // Process payments in smaller concurrent batches
    const concurrentBatches = this.chunkArray(paymentsToSync, this.maxConcurrentRequests);
    
    for (const concurrentBatch of concurrentBatches) {
      const syncPromises = concurrentBatch.map(payment => this.syncSinglePayment(payment));
      await Promise.allSettled(syncPromises);
    }

    await this.logSyncComplete(batch);
  }

  private async syncSinglePayment(payment: QueuedPayment): Promise<SyncResult> {
    try {
      // Update status to processing
      await this.updatePaymentStatus(payment.id, 'processing');

      // Detokenize payment data if needed
      const paymentData = { ...payment };
      if (payment.tokenId) {
        const sensitiveData = await paymentTokenizer.detokenize({
          tokenId: payment.tokenId,
          organizationId: payment.organizationId,
          purpose: 'payment_processing'
        });
        paymentData.metadata.sensitiveData = sensitiveData;
      }

      // Send to payment API
      const response = await fetch('/api/v1/payments/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Offline-Payment': 'true'
        },
        body: JSON.stringify({
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          customerId: payment.customerId,
          organizationId: payment.organizationId,
          metadata: paymentData.metadata,
          createdAt: payment.createdAt
        })
      });

      if (response.ok) {
        const result = await response.json();
        await this.updatePaymentStatus(payment.id, 'completed', undefined, result.id);
        
        return {
          success: true,
          paymentId: payment.id,
          remoteId: result.id,
          shouldRetry: false
        };
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const shouldRetry = response.status >= 500 || response.status === 429;
        
        await this.updatePaymentStatus(
          payment.id, 
          shouldRetry ? 'retrying' : 'failed',
          errorData.error || 'HTTP ${response.status}'
        );

        return {
          success: false,
          paymentId: payment.id,
          error: errorData.error,
          shouldRetry
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      await this.updatePaymentStatus(payment.id, 'retrying', errorMessage);

      return {
        success: false,
        paymentId: payment.id,
        error: errorMessage,
        shouldRetry: true
      };
    }
  }

  private calculatePriority(payment: Omit<QueuedPayment, 'id' | 'status' | 'retryCount' | 'createdAt' | 'priority'>): number {
    const priority = 5; // Base priority

    // Higher priority for larger amounts
    if (payment.amount > 100000) priority += 2; // $1000+
    else if (payment.amount > 50000) priority += 1; // $500+

    // Higher priority for certain payment methods
    if (payment.paymentMethod === 'card') priority += 1;
    
    // Higher priority if customer is VIP
    if (payment.metadata?.customerTier === 'vip`) priority += 2;

    // Higher priority for failed payments that are retrying
    if (payment.metadata?.isRetry) priority += 1;

    return Math.min(10, Math.max(1, priority));
  }

  private calculateBackoffDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 300000; // 5 minutes
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
    
    return exponentialDelay + jitter;
  }

  private generatePaymentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `pay_offline_${timestamp}_${random}';
  }

  private generateBatchId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return 'batch_${timestamp}_${random}';
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (const i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private async logSyncStart(batch: SyncBatch): Promise<void> {
    await offlineManager.storeOfflineData('sync_history', {
      id: 'sync_start_${batch.batchId}',
      type: 'sync_start',
      batchId: batch.batchId,
      paymentCount: batch.payments.length,
      timestamp: new Date().toISOString()
    });
  }

  private async logSyncComplete(batch: SyncBatch): Promise<void> {
    const completedPayments = await Promise.all(
      batch.payments.map(p => this.getPaymentById(p.id))
    );

    const successCount = completedPayments.filter(p => p?.status === 'completed').length;
    const failedCount = completedPayments.filter(p => p?.status === 'failed').length;
    const retryingCount = completedPayments.filter(p => p?.status === 'retrying').length;

    await offlineManager.storeOfflineData('sync_history', {
      id: 'sync_complete_${batch.batchId}',
      type: 'sync_complete',
      batchId: batch.batchId,
      paymentCount: batch.payments.length,
      successCount,
      failedCount,
      retryingCount,
      success: failedCount === 0,
      timestamp: new Date().toISOString()
    });
  }

  private setupPeriodicSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.triggerSync();
      }
    }, 30000);
  }

  private setupNetworkEventListeners(): void {
    window.addEventListener('online', () => {
      // Trigger immediate sync when coming back online
      setTimeout(() => this.triggerSync(), 1000);
    });

    window.addEventListener('beforeunload', () => {
      // Clean up on page unload
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
      }
    });
  }

  // Cleanup failed payments older than 7 days
  async cleanupOldFailedPayments(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const allPayments = await this.getQueuedPayments();
    
    const cleanedCount = 0;
    
    for (const payment of allPayments) {
      if (payment.status === 'failed' && payment.createdAt < sevenDaysAgo) {
        // Archive instead of delete for audit purposes
        payment.metadata.archived = true;
        payment.metadata.archivedAt = new Date().toISOString();
        await offlineManager.storeOfflineData('payment_queue', payment);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // Get detailed payment history for audit purposes
  async getPaymentAuditTrail(paymentId: string): Promise<any[]> {
    const syncHistory = await offlineManager.getOfflineData('sync_history', {});
    const tokenHistory = await offlineManager.getOfflineData('tokenization_audit', {});
    
    return [
      ...syncHistory.filter((h: unknown) => h.paymentId === paymentId),
      ...tokenHistory.filter((h: unknown) => h.paymentId === paymentId)
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}

// Export singleton instance
export const paymentSyncManager = PaymentSyncManager.getInstance();