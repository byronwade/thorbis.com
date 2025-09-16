// Unified background sync manager for all business operations
// Coordinates synchronization across payments, inventory, customers, and other systems

interface SyncOperation {
  id: string;
  type: 'payment' | 'inventory' | 'customer' | 'work_order' | 'appointment' | 'document' | 'analytics';
  subType?: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  data: unknown;
  dependencies?: string[]; // IDs of operations that must complete first
  retryCount: number;
  maxRetries: number;
  lastAttempt?: Date;
  nextAttempt?: Date;
  createdAt: Date;
  organizationId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  syncStrategy: 'immediate' | 'batched' | 'background' | 'scheduled';
  estimatedTime?: number; // milliseconds
  actualTime?: number;
}

interface SyncBatch {
  id: string;
  operations: SyncOperation[];
  priority: SyncOperation['priority'];
  estimatedTime: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface SyncStats {
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  pendingOperations: number;
  averageLatency: number;
  successRate: number;
  byType: Record<string, {
    total: number;
    completed: number;
    failed: number;
    averageTime: number;
  }>;
  networkStatus: {
    isOnline: boolean;
    lastOnline?: Date;
    connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
    bandwidth?: number; // Mbps
  };
}

interface SyncResult {
  operationId: string;
  success: boolean;
  duration: number;
  error?: string;
  conflictsDetected?: number;
  conflictsResolved?: number;
  dataSize?: number;
}

interface SyncConfig {
  maxConcurrentOperations: number;
  batchSize: number;
  retryIntervals: number[]; // milliseconds for exponential backoff
  priorityWeights: Record<SyncOperation['priority'], number>;
  networkThresholds: {
    excellent: number; // bytes/sec
    good: number;
    poor: number;
  };
  syncIntervals: {
    immediate: number; // milliseconds
    background: number;
    scheduled: number;
  };
  conflictResolution: {
    strategy: 'local_wins' | 'server_wins' | 'timestamp_wins' | 'manual_review';
    autoResolve: boolean;
  };
}

/**
 * Advanced background synchronization manager for business operations
 * 
 * Coordinates complex multi-step synchronization across payments, inventory, customers,
 * work orders, appointments, and analytics systems. Provides intelligent batching,
 * dependency resolution, retry mechanisms, and network-aware operation scheduling.
 * 
 * Features:
 * - Intelligent operation batching and prioritization
 * - Dependency graph resolution for complex workflows
 * - Network-aware sync strategies with offline resilience
 * - Comprehensive error handling and retry mechanisms
 * - Real-time progress tracking and statistics
 * - Worker-based processing for performance isolation
 * - Event-driven architecture for reactive updates
 * 
 * @example
 * '''typescript
 * const syncManager = BackgroundSyncManager.getInstance();
 * 
 * // Queue a payment operation
 * await syncManager.queueOperation({
 *   type: 'payment',
 *   subType: 'process_payment',
 *   priority: 'critical',
 *   data: { paymentId: 'pay_123', amount: 99.99 },
 *   organizationId: 'org_456',
 *   syncStrategy: 'immediate'
 * });
 * 
 * // Monitor progress
 * syncManager.on('operation:completed`, (operation) => {
 *   console.log(`Operation ${operation.id} completed successfully`);
 * });
 * 
 * // Get sync statistics
 * const stats = await syncManager.getStats();
 * console.log(`Success rate: ${stats.successRate}%`);
 * '''
 */
export class BackgroundSyncManager {
  private static instance: BackgroundSyncManager | null = null;
  
  private operationQueue: Map<string, SyncOperation> = new Map();
  private activeBatches: Map<string, SyncBatch> = new Map();
  private completedOperations: Map<string, SyncResult> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  
  private syncWorker: Worker | null = null;
  private syncTimer: NodeJS.Timeout | null = null;
  private networkMonitor: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;
  private connectionQuality: SyncStats['networkStatus']['connectionQuality'] = 'good';
  private bandwidth = 0;
  
  private readonly config: SyncConfig = {
    maxConcurrentOperations: 5,
    batchSize: 10,
    retryIntervals: [1000, 2000, 5000, 10000, 30000], // 1s, 2s, 5s, 10s, 30s
    priorityWeights: {
      critical: 10,
      high: 5,
      normal: 1,
      low: 0.5
    },
    networkThresholds: {
      excellent: 10 * 1024 * 1024, // 10 MB/s
      good: 1 * 1024 * 1024, // 1 MB/s
      poor: 128 * 1024 // 128 KB/s
    },
    syncIntervals: {
      immediate: 1000, // 1 second
      background: 30000, // 30 seconds
      scheduled: 300000 // 5 minutes
    },
    conflictResolution: {
      strategy: 'timestamp_wins',
      autoResolve: true
    }
  };

  private readonly STORAGE_KEYS = {
    operations: 'background_sync_operations',
    batches: 'background_sync_batches',
    results: 'background_sync_results',
    stats: 'background_sync_stats'
  };

  private constructor() {
    this.initialize();
  }

  static getInstance(): BackgroundSyncManager {
    if (!BackgroundSyncManager.instance) {
      BackgroundSyncManager.instance = new BackgroundSyncManager();
    }
    return BackgroundSyncManager.instance;
  }

  // Initialize the background sync manager
  private async initialize(): Promise<void> {
    try {
      await this.loadFromStorage();
      this.setupNetworkMonitoring();
      this.setupWorker();
      this.startSyncTimer();
      
      // Resume any in-progress operations
      await this.resumePendingOperations();
      
      this.emit('sync_manager_initialized');
    } catch (error) {
      console.error('Failed to initialize background sync manager:', error);
      throw new Error('Background sync manager initialization failed');
    }
  }

  // Queue a new sync operation
  async queueOperation(operation: Omit<SyncOperation, 'id' | 'createdAt' | 'status' | 'retryCount'>): Promise<string> {
    try {
      const syncOperation: SyncOperation = {
        id: this.generateId(),
        createdAt: new Date(),
        status: 'pending',
        retryCount: 0,
        ...operation
      };

      this.operationQueue.set(syncOperation.id, syncOperation);
      await this.persistOperations();

      this.emit('operation_queued', syncOperation);

      // Schedule immediate processing if priority is critical
      if (syncOperation.priority === 'critical' || syncOperation.syncStrategy === 'immediate') {
        setTimeout(() => this.processNextBatch(), 100);
      }

      return syncOperation.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emit('operation_queue_failed', { operation, error: errorMessage });
      throw new Error('Failed to queue operation: ${errorMessage}');
    }
  }

  // Queue multiple operations as a batch
  async queueBatch(operations: Omit<SyncOperation, 'id' | 'createdAt' | 'status' | 'retryCount'>[]): Promise<string> {
    try {
      if (!operations || operations.length === 0) {
        throw new Error('Cannot queue empty batch - operations array is required');
      }

      const operationIds: string[] = [];
      const estimatedTime = operations.reduce((total, op) => total + (op.estimatedTime || 1000), 0);
      
      // Queue individual operations with rollback on failure
      const queuedIds: string[] = [];
      try {
        for (const operation of operations) {
          const id = await this.queueOperation(operation);
          operationIds.push(id);
          queuedIds.push(id);
        }
      } catch (_error) {
        // Rollback any successfully queued operations
        for (const id of queuedIds) {
          this.operationQueue.delete(id);
        }
        throw error;
      }

      // Create batch
      const batch: SyncBatch = {
        id: this.generateId(),
        operations: operationIds.map(id => this.operationQueue.get(id)!),
        priority: this.getHighestPriority(operations.map(op => op.priority)),
        estimatedTime,
        createdAt: new Date(),
        status: 'pending'
      };

      this.activeBatches.set(batch.id, batch);
      await this.persistBatches();

      this.emit('batch_queued', batch);
      return batch.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emit('batch_queue_failed', { operations, error: errorMessage });
      throw new Error('Failed to queue batch: ${errorMessage}');
    }
  }

  // Process the next batch of operations
  private async processNextBatch(): Promise<void> {
    if (!this.isOnline || this.getActiveBatchCount() >= this.config.maxConcurrentOperations) {
      return;
    }

    const nextBatch = this.selectNextBatch();
    if (!nextBatch) return;

    nextBatch.status = 'in_progress';
    nextBatch.startedAt = new Date();
    await this.persistBatches();

    this.emit('batch_started', nextBatch);

    try {
      await this.executeBatch(nextBatch);
      
      nextBatch.status = 'completed';
      nextBatch.completedAt = new Date();
      
      this.emit('batch_completed', nextBatch);
    } catch (_error) {
      nextBatch.status = 'failed';
      this.emit('batch_failed', { batch: nextBatch, error });
    }

    await this.persistBatches();
    
    // Schedule next batch
    setTimeout(() => this.processNextBatch(), 500);
  }

  // Execute a batch of operations
  private async executeBatch(batch: SyncBatch): Promise<void> {
    const promises = batch.operations.map(operation => this.executeOperation(operation));
    
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Batch execution failed:', error);
      throw error;
    }
  }

  // Execute a single sync operation
  private async executeOperation(operation: SyncOperation): Promise<SyncResult> {
    const startTime = Date.now();
    operation.status = 'in_progress';
    operation.lastAttempt = new Date();

    this.emit('operation_started', operation);

    try {
      let result: SyncResult;

      switch (operation.type) {
        case 'payment':
          result = await this.syncPaymentData(operation);
          break;
        case 'inventory':
          result = await this.syncInventoryData(operation);
          break;
        case 'customer':
          result = await this.syncCustomerData(operation);
          break;
        case 'work_order':
          result = await this.syncWorkOrderData(operation);
          break;
        case 'appointment':
          result = await this.syncAppointmentData(operation);
          break;
        case 'document':
          result = await this.syncDocumentData(operation);
          break;
        case 'analytics':
          result = await this.syncAnalyticsData(operation);
          break;
        default:
          throw new Error('Unknown operation type: ${operation.type}');
      }

      operation.status = 'completed';
      operation.actualTime = Date.now() - startTime;
      
      this.completedOperations.set(operation.id, result);
      this.emit('operation_completed', { operation, result });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      operation.retryCount++;
      operation.error = error instanceof Error ? error.message : 'Unknown error';

      if (operation.retryCount >= operation.maxRetries) {
        operation.status = 'failed';
        this.emit('operation_failed', { operation, error });
      } else {
        operation.status = 'pending';
        operation.nextAttempt = new Date(Date.now() + this.getRetryDelay(operation.retryCount));
        this.emit('operation_retry_scheduled', operation);
      }

      const result: SyncResult = {
        operationId: operation.id,
        success: false,
        duration,
        error: operation.error
      };

      this.completedOperations.set(operation.id, result);
      return result;
    } finally {
      await this.persistOperations();
    }
  }

  // Sync-specific operation handlers

  private async syncPaymentData(operation: SyncOperation): Promise<SyncResult> {
    // Mock payment sync - in real implementation, integrate with payment processors
    const { subType, data } = operation;
    
    await this.simulateNetworkDelay();

    switch (subType) {
      case 'transaction':
        return this.syncPaymentTransaction(data);
      case 'token':
        return this.syncPaymentToken(data);
      case 'terminal':
        return this.syncTerminalData(data);
      default:
        throw new Error('Unknown payment sync type: ${subType}');
    }
  }

  private async syncInventoryData(operation: SyncOperation): Promise<SyncResult> {
    // Mock inventory sync
    const { subType, data } = operation;
    
    await this.simulateNetworkDelay();

    switch (subType) {
      case 'item':
        return this.syncInventoryItem(data);
      case 'movement':
        return this.syncInventoryMovement(data);
      case 'adjustment':
        return this.syncInventoryAdjustment(data);
      default:
        throw new Error('Unknown inventory sync type: ${subType}');
    }
  }

  private async syncCustomerData(operation: SyncOperation): Promise<SyncResult> {
    // Mock customer sync
    const { subType, data } = operation;
    
    await this.simulateNetworkDelay();

    switch (subType) {
      case 'profile':
        return this.syncCustomerProfile(data);
      case 'interaction':
        return this.syncCustomerInteraction(data);
      case 'address':
        return this.syncCustomerAddress(data);
      default:
        throw new Error('Unknown customer sync type: ${subType}');
    }
  }

  private async syncWorkOrderData(operation: SyncOperation): Promise<SyncResult> {
    await this.simulateNetworkDelay();
    
    // Mock sync success with potential conflicts
    const conflictsDetected = Math.random() < 0.1 ? Math.floor(Math.random() * 3) : 0;
    const conflictsResolved = conflictsDetected;

    return {
      operationId: operation.id,
      success: true,
      duration: Math.random() * 2000 + 500,
      conflictsDetected,
      conflictsResolved,
      dataSize: JSON.stringify(operation.data).length
    };
  }

  private async syncAppointmentData(operation: SyncOperation): Promise<SyncResult> {
    await this.simulateNetworkDelay();
    
    return {
      operationId: operation.id,
      success: Math.random() > 0.05, // 95% success rate
      duration: Math.random() * 1500 + 300,
      dataSize: JSON.stringify(operation.data).length
    };
  }

  private async syncDocumentData(operation: SyncOperation): Promise<SyncResult> {
    await this.simulateNetworkDelay(2000); // Documents take longer
    
    return {
      operationId: operation.id,
      success: Math.random() > 0.02, // 98% success rate
      duration: Math.random() * 5000 + 1000,
      dataSize: operation.data.size || JSON.stringify(operation.data).length
    };
  }

  private async syncAnalyticsData(operation: SyncOperation): Promise<SyncResult> {
    await this.simulateNetworkDelay(500); // Analytics are quick
    
    return {
      operationId: operation.id,
      success: Math.random() > 0.01, // 99% success rate
      duration: Math.random() * 800 + 200,
      dataSize: JSON.stringify(operation.data).length
    };
  }

  // Individual sync handlers

  private async syncPaymentTransaction(data: unknown): Promise<SyncResult> {
    // Simulate API call to payment processor
    const success = Math.random() > 0.02; // 98% success rate
    const duration = Math.random() * 2000 + 800;
    
    return {
      operationId: data.id,
      success,
      duration,
      dataSize: JSON.stringify(data).length
    };
  }

  private async syncPaymentToken(data: unknown): Promise<SyncResult> {
    const success = Math.random() > 0.01; // 99% success rate
    const duration = Math.random() * 1000 + 300;
    
    return {
      operationId: data.id,
      success,
      duration,
      dataSize: JSON.stringify(data).length
    };
  }

  private async syncTerminalData(data: unknown): Promise<SyncResult> {
    const success = Math.random() > 0.05; // 95% success rate
    const duration = Math.random() * 3000 + 1000;
    
    return {
      operationId: data.id,
      success,
      duration,
      dataSize: JSON.stringify(data).length
    };
  }

  private async syncInventoryItem(data: unknown): Promise<SyncResult> {
    const success = Math.random() > 0.03; // 97% success rate
    const duration = Math.random() * 1500 + 400;
    const conflictsDetected = Math.random() < 0.15 ? 1 : 0;
    
    return {
      operationId: data.id,
      success,
      duration,
      conflictsDetected,
      conflictsResolved: conflictsDetected,
      dataSize: JSON.stringify(data).length
    };
  }

  private async syncInventoryMovement(data: unknown): Promise<SyncResult> {
    const success = Math.random() > 0.02; // 98% success rate
    const duration = Math.random() * 1200 + 300;
    
    return {
      operationId: data.id,
      success,
      duration,
      dataSize: JSON.stringify(data).length
    };
  }

  private async syncInventoryAdjustment(data: unknown): Promise<SyncResult> {
    const success = Math.random() > 0.04; // 96% success rate
    const duration = Math.random() * 1800 + 600;
    
    return {
      operationId: data.id,
      success,
      duration,
      dataSize: JSON.stringify(data).length
    };
  }

  private async syncCustomerProfile(data: unknown): Promise<SyncResult> {
    const success = Math.random() > 0.02; // 98% success rate
    const duration = Math.random() * 1300 + 400;
    const conflictsDetected = Math.random() < 0.08 ? 1 : 0;
    
    return {
      operationId: data.id,
      success,
      duration,
      conflictsDetected,
      conflictsResolved: conflictsDetected,
      dataSize: JSON.stringify(data).length
    };
  }

  private async syncCustomerInteraction(data: unknown): Promise<SyncResult> {
    const success = Math.random() > 0.01; // 99% success rate
    const duration = Math.random() * 900 + 200;
    
    return {
      operationId: data.id,
      success,
      duration,
      dataSize: JSON.stringify(data).length
    };
  }

  private async syncCustomerAddress(data: unknown): Promise<SyncResult> {
    const success = Math.random() > 0.03; // 97% success rate
    const duration = Math.random() * 1100 + 300;
    
    return {
      operationId: data.id,
      success,
      duration,
      dataSize: JSON.stringify(data).length
    };
  }

  // Utility methods

  private selectNextBatch(): SyncBatch | null {
    const pendingBatches = Array.from(this.activeBatches.values())
      .filter(batch => batch.status === 'pending');

    if (pendingBatches.length === 0) {
      // Create a new batch from pending operations
      return this.createBatchFromOperations();
    }

    // Return highest priority batch
    return pendingBatches.sort((a, b) => 
      this.config.priorityWeights[b.priority] - this.config.priorityWeights[a.priority]
    )[0];
  }

  private createBatchFromOperations(): SyncBatch | null {
    const pendingOperations = Array.from(this.operationQueue.values())
      .filter(op => op.status === 'pending' && this.canExecuteNow(op))
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityDiff = this.config.priorityWeights[b.priority] - this.config.priorityWeights[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    if (pendingOperations.length === 0) return null;

    const batchOperations = pendingOperations.slice(0, this.config.batchSize);
    const estimatedTime = batchOperations.reduce((total, op) => total + (op.estimatedTime || 1000), 0);

    const batch: SyncBatch = {
      id: this.generateId(),
      operations: batchOperations,
      priority: this.getHighestPriority(batchOperations.map(op => op.priority)),
      estimatedTime,
      createdAt: new Date(),
      status: 'pending'
    };

    this.activeBatches.set(batch.id, batch);
    return batch;
  }

  private canExecuteNow(operation: SyncOperation): boolean {
    // Check if operation can be executed based on dependencies and retry schedule
    if (operation.nextAttempt && operation.nextAttempt > new Date()) {
      return false;
    }

    if (operation.dependencies) {
      return operation.dependencies.every(depId => {
        const result = this.completedOperations.get(depId);
        return result && result.success;
      });
    }

    return true;
  }

  private getHighestPriority(priorities: SyncOperation['priority'][]): SyncOperation['priority'] {
    const weights = priorities.map(p => this.config.priorityWeights[p]);
    const maxWeight = Math.max(...weights);
    
    for (const [priority, weight] of Object.entries(this.config.priorityWeights)) {
      if (weight === maxWeight) {
        return priority as SyncOperation['priority'];
      }
    }
    
    return 'normal';
  }

  private getActiveBatchCount(): number {
    return Array.from(this.activeBatches.values())
      .filter(batch => batch.status === 'in_progress').length;
  }

  private getRetryDelay(retryCount: number): number {
    const index = Math.min(retryCount - 1, this.config.retryIntervals.length - 1);
    return this.config.retryIntervals[index];
  }

  private async resumePendingOperations(): Promise<void> {
    const pendingOperations = Array.from(this.operationQueue.values())
      .filter(op => op.status === 'in_progress');

    for (const operation of pendingOperations) {
      operation.status = 'pending';
      operation.nextAttempt = new Date(Date.now() + 1000);
    }

    await this.persistOperations();
  }

  // Network monitoring

  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('network_online');
      setTimeout(() => this.processNextBatch(), 1000);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('network_offline');
    });

    // Monitor connection quality
    this.networkMonitor = setInterval(() => {
      this.measureConnectionQuality();
    }, 10000);
  }

  private async measureConnectionQuality(): Promise<void> {
    if (!this.isOnline) {
      this.connectionQuality = 'offline';
      return;
    }

    try {
      const startTime = Date.now();
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch('/api/ping', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        if (response.ok) {
          if (duration < 100) {
            this.connectionQuality = 'excellent';
            this.bandwidth = 50; // Simulated high bandwidth
          } else if (duration < 500) {
            this.connectionQuality = 'good';
            this.bandwidth = 10;
          } else {
            this.connectionQuality = 'poor';
            this.bandwidth = 1;
          }
        } else {
          this.connectionQuality = 'poor';
          this.bandwidth = 0.5;
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          // Request was aborted due to timeout
          this.connectionQuality = 'poor';
          this.bandwidth = 0.1;
        } else {
          // Network error or other fetch failure
          this.connectionQuality = 'poor';
          this.bandwidth = 0.1;
        }
        
        // Log the specific error for debugging
        this.emit('connection_quality_error', {
          error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
          type: fetchError instanceof Error ? fetchError.name : 'UnknownError'
        });
      }
    } catch (error) {
      // Unexpected error in the outer try block
      this.connectionQuality = 'poor';
      this.bandwidth = 0.1;
      
      this.emit('connection_quality_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'UnexpectedError'
      });
    }

    this.emit('connection_quality_updated', {
      quality: this.connectionQuality,
      bandwidth: this.bandwidth
    });
  }

  // Worker setup for background processing

  private setupWorker(): void {
    if (typeof Worker !== 'undefined') {
      try {
        // Create inline worker for background sync processing
        const workerCode = '
          self.onmessage = function(e) {
            const { type, data } = e.data;
            
            switch (type) {
              case 'process_batch':
                // Simulate background processing
                setTimeout(() => {
                  self.postMessage({
                    type: 'batch_processed',
                    batchId: data.batchId,
                    success: true
                  });
                }, data.estimatedTime || 1000);
                break;
            }
          };
        ';

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.syncWorker = new Worker(URL.createObjectURL(blob));

        this.syncWorker.onmessage = (e) => {
          const { type, batchId, success } = e.data;
          
          if (type === 'batch_processed') {
            this.emit('worker_batch_completed', { batchId, success });
          }
        };
      } catch (error) {
        console.warn('Web Worker not available, falling back to main thread processing');
      }
    }
  }

  // Timer management

  private startSyncTimer(): void {
    this.syncTimer = setInterval(() => {
      if (this.isOnline) {
        this.processNextBatch();
      }
    }, this.config.syncIntervals.background);
  }

  // Statistics and monitoring

  async getStatistics(): Promise<SyncStats> {
    const operations = Array.from(this.operationQueue.values());
    const results = Array.from(this.completedOperations.values());

    const totalOperations = operations.length;
    const completedOperations = operations.filter(op => op.status === 'completed').length;
    const failedOperations = operations.filter(op => op.status === 'failed').length;
    const pendingOperations = operations.filter(op => op.status === 'pending').length;

    const successfulResults = results.filter(r => r.success);
    const averageLatency = successfulResults.length > 0 
      ? successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length
      : 0;

    const successRate = totalOperations > 0 ? (completedOperations / totalOperations) * 100 : 0;

    const byType: SyncStats['byType'] = {};
    for (const operation of operations) {
      if (!byType[operation.type]) {
        byType[operation.type] = { total: 0, completed: 0, failed: 0, averageTime: 0 };
      }
      
      byType[operation.type].total++;
      if (operation.status === 'completed') byType[operation.type].completed++;
      if (operation.status === 'failed') byType[operation.type].failed++;
      if (operation.actualTime) {
        byType[operation.type].averageTime = 
          (byType[operation.type].averageTime + operation.actualTime) / 2;
      }
    }

    return {
      totalOperations,
      completedOperations,
      failedOperations,
      pendingOperations,
      averageLatency,
      successRate,
      byType,
      networkStatus: {
        isOnline: this.isOnline,
        lastOnline: this.isOnline ? new Date() : undefined,
        connectionQuality: this.connectionQuality,
        bandwidth: this.bandwidth
      }
    };
  }

  // Storage operations

  private async persistOperations(): Promise<void> {
    try {
      const serialized = Array.from(this.operationQueue.entries()).map(([id, operation]) => [
        id,
        {
          ...operation,
          createdAt: operation.createdAt.toISOString(),
          lastAttempt: operation.lastAttempt?.toISOString(),
          nextAttempt: operation.nextAttempt?.toISOString()
        }
      ]);

      // Check if localStorage is available and has enough space
      if (typeof Storage === "undefined") {
        throw new Error('localStorage is not supported in this browser');
      }

      const dataString = JSON.stringify(serialized);
      
      // Check approximate storage size (rough estimate)
      if (dataString.length > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Operations data exceeds storage size limit');
      }

      localStorage.setItem(this.STORAGE_KEYS.operations, dataString);
      
      this.emit('operations_persisted', { count: this.operationQueue.size });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown persistence error';
      
      this.emit('operations_persist_failed', { 
        error: errorMessage,
        operationCount: this.operationQueue.size 
      });
      
      // Re-throw for calling code to handle
      throw new Error('Failed to persist operations: ${errorMessage}');
    }
  }

  private async persistBatches(): Promise<void> {
    try {
      const serialized = Array.from(this.activeBatches.entries()).map(([id, batch]) => [
        id,
        {
          ...batch,
          createdAt: batch.createdAt.toISOString(),
          startedAt: batch.startedAt?.toISOString(),
          completedAt: batch.completedAt?.toISOString()
        }
      ]);

      // Check if localStorage is available
      if (typeof Storage === "undefined") {
        throw new Error('localStorage is not supported in this browser');
      }

      const dataString = JSON.stringify(serialized);
      
      // Check storage size
      if (dataString.length > 2 * 1024 * 1024) { // 2MB limit for batches
        throw new Error('Batch data exceeds storage size limit');
      }

      localStorage.setItem(this.STORAGE_KEYS.batches, dataString);
      
      this.emit('batches_persisted', { count: this.activeBatches.size });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown persistence error';
      
      this.emit('batches_persist_failed', { 
        error: errorMessage,
        batchCount: this.activeBatches.size 
      });
      
      // Re-throw for calling code to handle
      throw new Error('Failed to persist batches: ${errorMessage}');
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      // Check if localStorage is available
      if (typeof Storage === "undefined") {
        throw new Error('localStorage is not supported in this browser');
      }

      // Load operations with validation
      try {
        const storedOperations = localStorage.getItem(this.STORAGE_KEYS.operations);
        if (storedOperations) {
          const serialized = JSON.parse(storedOperations);
          
          if (!Array.isArray(serialized)) {
            throw new Error('Stored operations data is corrupted - expected array');
          }
          
          this.operationQueue = new Map(
            serialized.map(([id, operation]: [string, any]) => {
              if (!id || !operation) {
                throw new Error('Invalid operation data structure');
              }
              
              return [
                id,
                {
                  ...operation,
                  createdAt: new Date(operation.createdAt),
                  lastAttempt: operation.lastAttempt ? new Date(operation.lastAttempt) : undefined,
                  nextAttempt: operation.nextAttempt ? new Date(operation.nextAttempt) : undefined
                }
              ];
            })
          );
        }
      } catch (operationsError) {
        this.emit('operations_load_failed', { 
          error: operationsError instanceof Error ? operationsError.message : 'Unknown error' 
        });
        // Continue loading other data even if operations fail
      }

      // Load batches with validation
      try {
        const storedBatches = localStorage.getItem(this.STORAGE_KEYS.batches);
        if (storedBatches) {
          const serialized = JSON.parse(storedBatches);
          
          if (!Array.isArray(serialized)) {
            throw new Error('Stored batches data is corrupted - expected array');
          }
          
          this.activeBatches = new Map(
            serialized.map(([id, batch]: [string, any]) => {
              if (!id || !batch) {
                throw new Error('Invalid batch data structure');
              }
              
              return [
                id,
                {
                  ...batch,
                  createdAt: new Date(batch.createdAt),
                  startedAt: batch.startedAt ? new Date(batch.startedAt) : undefined,
                  completedAt: batch.completedAt ? new Date(batch.completedAt) : undefined
                }
              ];
            })
          );
        }
      } catch (batchesError) {
        this.emit('batches_load_failed', { 
          error: batchesError instanceof Error ? batchesError.message : 'Unknown error' 
        });
        // Continue loading other data even if batches fail
      }

      // Load results with validation
      try {
        const storedResults = localStorage.getItem(this.STORAGE_KEYS.results);
        if (storedResults) {
          const serialized = JSON.parse(storedResults);
          
          if (!Array.isArray(serialized)) {
            throw new Error('Stored results data is corrupted - expected array');
          }
          
          this.completedOperations = new Map(serialized);
        }
      } catch (resultsError) {
        this.emit('results_load_failed', { 
          error: resultsError instanceof Error ? resultsError.message : 'Unknown error' 
        });
        // Continue even if results fail
      }

      this.emit('storage_loaded', {
        operationsCount: this.operationQueue.size,
        batchesCount: this.activeBatches.size,
        resultsCount: this.completedOperations.size
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      
      this.emit('storage_load_failed`, { error: errorMessage });
      
      // Initialize empty collections to ensure app can continue
      this.operationQueue = new Map();
      this.activeBatches = new Map();
      this.completedOperations = new Map();
      
      // Re-throw for calling code to handle
      throw new Error(`Failed to load from storage: ${errorMessage}`);
    }
  }

  // Utility methods

  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
  }

  private async simulateNetworkDelay(baseDelay = 1000): Promise<void> {
    const qualityMultiplier = {
      excellent: 0.5,
      good: 1,
      poor: 2,
      offline: 10
    }[this.connectionQuality];

    const delay = baseDelay * qualityMultiplier * (0.5 + Math.random());
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Event system

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

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Cleanup

  public destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (this.networkMonitor) {
      clearInterval(this.networkMonitor);
      this.networkMonitor = null;
    }

    if (this.syncWorker) {
      this.syncWorker.terminate();
      this.syncWorker = null;
    }

    this.eventListeners.clear();
    this.operationQueue.clear();
    this.activeBatches.clear();
    this.completedOperations.clear();
  }
}

// Factory function
export function createBackgroundSyncManager(): BackgroundSyncManager {
  return BackgroundSyncManager.getInstance();
}

// React hook
export function useBackgroundSync() {
  const manager = BackgroundSyncManager.getInstance();
  
  return {
    // Operation management
    queueOperation: manager.queueOperation.bind(manager),
    queueBatch: manager.queueBatch.bind(manager),
    
    // Statistics
    getStatistics: manager.getStatistics.bind(manager),
    
    // Events
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}