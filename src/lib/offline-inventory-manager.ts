// Offline inventory management with intelligent conflict resolution
// Handles stock tracking, movements, and sync across all business verticals

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  
  // Pricing
  cost: number;
  price: number;
  discountedPrice?: number;
  
  // Stock management
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  maxStock?: number;
  
  // Physical attributes
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'in' | 'cm' | 'mm';
  };
  
  // Metadata
  supplier?: string;
  location: string;
  barcode?: string;
  qrCode?: string;
  images?: string[];
  tags?: string[];
  
  // Tracking
  organizationId: string;
  locationId?: string;
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'courses';
  isActive: boolean;
  
  // Versioning for conflict resolution
  version: number;
  lastModified: Date;
  lastModifiedBy: string;
  lastSyncedAt?: Date;
  
  // Offline status
  pendingChanges?: InventoryChange[];
  conflictResolution?: ConflictResolution;
}

interface InventoryChange {
  id: string;
  itemId: string;
  type: 'adjustment' | 'sale' | 'purchase' | 'transfer' | 'damage' | 'return';
  
  // Change details
  quantityChange: number;
  newQuantity: number;
  previousQuantity: number;
  
  // Transaction details
  reason: string;
  reference?: string;
  customerId?: string;
  orderId?: string;
  supplierId?: string;
  
  // Cost tracking
  unitCost?: number;
  totalValue: number;
  
  // Metadata
  timestamp: Date;
  createdBy: string;
  organizationId: string;
  locationId?: string;
  
  // Offline tracking
  isOffline: boolean;
  isSynced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: Date;
  syncError?: string;
}

interface ConflictResolution {
  conflictId: string;
  type: 'quantity_mismatch' | 'price_change' | 'item_modified' | 'item_deleted';
  localValue: any;
  serverValue: any;
  resolution: 'use_local' | 'use_server' | 'merge' | 'manual_review';
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingChanges: number;
  unsynced: number;
  conflicts: number;
  categories: Record<string, number>;
  valueByCategory: Record<string, number>;
}

interface SyncResult {
  itemsProcessed: number;
  itemsUpdated: number;
  changesProcessed: number;
  changesSynced: number;
  conflictsDetected: number;
  conflictsResolved: number;
  errors: string[];
}

export class OfflineInventoryManager {
  private static instance: OfflineInventoryManager | null = null;
  private items: Map<string, InventoryItem> = new Map();
  private changes: Map<string, InventoryChange> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private syncInProgress = false;
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  private readonly ITEMS_STORAGE_KEY = 'offline_inventory_items';
  private readonly CHANGES_STORAGE_KEY = 'offline_inventory_changes';
  private readonly STATS_STORAGE_KEY = 'inventory_stats';
  private readonly SYNC_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.initialize();
  }

  static getInstance(): OfflineInventoryManager {
    if (!OfflineInventoryManager.instance) {
      OfflineInventoryManager.instance = new OfflineInventoryManager();
    }
    return OfflineInventoryManager.instance;
  }

  // Initialize the inventory manager
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadFromStorage();
      this.setupNetworkListeners();
      this.startAutoSync();
      
      this.initialized = true;
      this.emit('inventory_initialized');
    } catch (error) {
      console.error('Failed to initialize inventory manager:', error);
      throw new Error('Inventory manager initialization failed');
    }
  }

  // CRUD Operations for Inventory Items

  // Add new inventory item
  async addItem(itemData: Omit<InventoryItem, 'id' | 'version' | 'lastModified' | 'lastModifiedBy' | 'availableQuantity'>): Promise<InventoryItem> {
    await this.initialize();

    const item: InventoryItem = {
      id: this.generateId(),
      version: 1,
      lastModified: new Date(),
      lastModifiedBy: 'offline_user',
      availableQuantity: itemData.quantity - itemData.reservedQuantity,
      isActive: true,
      ...itemData
    };

    this.items.set(item.id, item);
    await this.persistItems();

    // Create change record
    await this.recordChange({
      itemId: item.id,
      type: 'adjustment',
      quantityChange: item.quantity,
      newQuantity: item.quantity,
      previousQuantity: 0,
      reason: 'Initial stock',
      totalValue: item.quantity * item.cost,
      timestamp: new Date(),
      createdBy: 'offline_user',
      organizationId: item.organizationId,
      locationId: item.locationId,
      isOffline: !navigator.onLine,
      isSynced: false,
      syncAttempts: 0
    });

    this.emit('item_added', item);
    this.scheduleSync();

    return item;
  }

  // Update inventory item
  async updateItem(itemId: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    await this.initialize();

    const item = this.items.get(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    const previousQuantity = item.quantity;
    const updatedItem: InventoryItem = {
      ...item,
      ...updates,
      version: item.version + 1,
      lastModified: new Date(),
      lastModifiedBy: 'offline_user',
      availableQuantity: (updates.quantity ?? item.quantity) - (updates.reservedQuantity ?? item.reservedQuantity)
    };

    this.items.set(itemId, updatedItem);
    await this.persistItems();

    // Record quantity change if quantity was updated
    if (updates.quantity !== undefined && updates.quantity !== previousQuantity) {
      await this.recordChange({
        itemId,
        type: 'adjustment',
        quantityChange: updates.quantity - previousQuantity,
        newQuantity: updates.quantity,
        previousQuantity,
        reason: 'Manual adjustment',
        totalValue: (updates.quantity - previousQuantity) * updatedItem.cost,
        timestamp: new Date(),
        createdBy: 'offline_user',
        organizationId: updatedItem.organizationId,
        locationId: updatedItem.locationId,
        isOffline: !navigator.onLine,
        isSynced: false,
        syncAttempts: 0
      });
    }

    this.emit('item_updated', updatedItem);
    this.scheduleSync();

    return updatedItem;
  }

  // Get inventory item
  getItem(itemId: string): InventoryItem | undefined {
    return this.items.get(itemId);
  }

  // Get items with filtering
  getItems(filters?: {
    category?: string;
    industry?: string;
    organizationId?: string;
    locationId?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
    search?: string;
  }): InventoryItem[] {
    let items = Array.from(this.items.values()).filter(item => item.isActive);

    if (filters) {
      if (filters.category) {
        items = items.filter(item => item.category === filters.category);
      }
      if (filters.industry) {
        items = items.filter(item => item.industry === filters.industry);
      }
      if (filters.organizationId) {
        items = items.filter(item => item.organizationId === filters.organizationId);
      }
      if (filters.locationId) {
        items = items.filter(item => item.locationId === filters.locationId);
      }
      if (filters.lowStock) {
        items = items.filter(item => item.quantity <= item.lowStockThreshold);
      }
      if (filters.outOfStock) {
        items = items.filter(item => item.quantity === 0);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(search) ||
          item.sku.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search) ||
          item.barcode?.includes(search)
        );
      }
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Stock Movement Operations

  // Adjust stock quantity
  async adjustStock(itemId: string, quantityChange: number, reason: string, reference?: string): Promise<InventoryItem> {
    await this.initialize();

    const item = this.items.get(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    const newQuantity = Math.max(0, item.quantity + quantityChange);
    const updatedItem = await this.updateItem(itemId, { quantity: newQuantity });

    await this.recordChange({
      itemId,
      type: 'adjustment',
      quantityChange,
      newQuantity,
      previousQuantity: item.quantity,
      reason,
      reference,
      totalValue: quantityChange * item.cost,
      timestamp: new Date(),
      createdBy: 'offline_user',
      organizationId: item.organizationId,
      locationId: item.locationId,
      isOffline: !navigator.onLine,
      isSynced: false,
      syncAttempts: 0
    });

    this.emit('stock_adjusted', { item: updatedItem, change: quantityChange, reason });
    return updatedItem;
  }

  // Record sale
  async recordSale(itemId: string, quantity: number, customerId?: string, orderId?: string): Promise<InventoryItem> {
    await this.initialize();

    const item = this.items.get(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.availableQuantity < quantity) {
      throw new Error('Insufficient stock available');
    }

    const newQuantity = item.quantity - quantity;
    const updatedItem = await this.updateItem(itemId, { quantity: newQuantity });

    await this.recordChange({
      itemId,
      type: 'sale',
      quantityChange: -quantity,
      newQuantity,
      previousQuantity: item.quantity,
      reason: 'Sale transaction',
      customerId,
      orderId,
      totalValue: quantity * item.price,
      timestamp: new Date(),
      createdBy: 'offline_user',
      organizationId: item.organizationId,
      locationId: item.locationId,
      isOffline: !navigator.onLine,
      isSynced: false,
      syncAttempts: 0
    });

    this.emit('sale_recorded', { item: updatedItem, quantity, customerId, orderId });
    return updatedItem;
  }

  // Record purchase/restock
  async recordPurchase(itemId: string, quantity: number, unitCost: number, supplierId?: string, reference?: string): Promise<InventoryItem> {
    await this.initialize();

    const item = this.items.get(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    const newQuantity = item.quantity + quantity;
    const updatedItem = await this.updateItem(itemId, { 
      quantity: newQuantity,
      cost: unitCost // Update cost with latest purchase price
    });

    await this.recordChange({
      itemId,
      type: 'purchase',
      quantityChange: quantity,
      newQuantity,
      previousQuantity: item.quantity,
      reason: 'Purchase/Restock',
      reference,
      supplierId,
      unitCost,
      totalValue: quantity * unitCost,
      timestamp: new Date(),
      createdBy: 'offline_user',
      organizationId: item.organizationId,
      locationId: item.locationId,
      isOffline: !navigator.onLine,
      isSynced: false,
      syncAttempts: 0
    });

    this.emit('purchase_recorded', { item: updatedItem, quantity, unitCost, supplierId });
    return updatedItem;
  }

  // Reserve stock
  async reserveStock(itemId: string, quantity: number, reason: string): Promise<InventoryItem> {
    await this.initialize();

    const item = this.items.get(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.availableQuantity < quantity) {
      throw new Error('Insufficient stock available for reservation');
    }

    const newReservedQuantity = item.reservedQuantity + quantity;
    const updatedItem = await this.updateItem(itemId, { reservedQuantity: newReservedQuantity });

    this.emit('stock_reserved', { item: updatedItem, quantity, reason });
    return updatedItem;
  }

  // Release reserved stock
  async releaseReservedStock(itemId: string, quantity: number, reason: string): Promise<InventoryItem> {
    await this.initialize();

    const item = this.items.get(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    const newReservedQuantity = Math.max(0, item.reservedQuantity - quantity);
    const updatedItem = await this.updateItem(itemId, { reservedQuantity: newReservedQuantity });

    this.emit('stock_released', { item: updatedItem, quantity, reason });
    return updatedItem;
  }

  // Analytics and Reporting

  // Get inventory statistics
  async getStatistics(organizationId?: string, locationId?: string): Promise<InventoryStats> {
    await this.initialize();

    let items = Array.from(this.items.values()).filter(item => item.isActive);
    
    if (organizationId) {
      items = items.filter(item => item.organizationId === organizationId);
    }
    if (locationId) {
      items = items.filter(item => item.locationId === locationId);
    }

    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    const lowStockItems = items.filter(item => item.quantity <= item.lowStockThreshold).length;
    const outOfStockItems = items.filter(item => item.quantity === 0).length;

    const categories = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const valueByCategory = items.reduce((acc, item) => {
      const value = item.quantity * item.cost;
      acc[item.category] = (acc[item.category] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    const pendingChanges = Array.from(this.changes.values())
      .filter(change => !change.isSynced).length;

    const unsynced = items.filter(item => 
      item.lastSyncedAt === undefined || 
      item.lastModified > item.lastSyncedAt
    ).length;

    const conflicts = items.filter(item => item.conflictResolution).length;

    return {
      totalItems: items.length,
      totalValue,
      lowStockItems,
      outOfStockItems,
      pendingChanges,
      unsynced,
      conflicts,
      categories,
      valueByCategory
    };
  }

  // Get low stock items
  getLowStockItems(organizationId?: string): InventoryItem[] {
    return this.getItems({ organizationId, lowStock: true });
  }

  // Get items due for reorder
  getReorderItems(organizationId?: string): InventoryItem[] {
    let items = Array.from(this.items.values()).filter(item => 
      item.isActive && item.quantity <= item.reorderPoint
    );
    
    if (organizationId) {
      items = items.filter(item => item.organizationId === organizationId);
    }

    return items.sort((a, b) => a.quantity - b.quantity);
  }

  // Get inventory changes
  getChanges(filters?: {
    itemId?: string;
    type?: InventoryChange['type'];
    dateFrom?: Date;
    dateTo?: Date;
    unsynced?: boolean;
  }): InventoryChange[] {
    let changes = Array.from(this.changes.values());

    if (filters) {
      if (filters.itemId) {
        changes = changes.filter(change => change.itemId === filters.itemId);
      }
      if (filters.type) {
        changes = changes.filter(change => change.type === filters.type);
      }
      if (filters.dateFrom) {
        changes = changes.filter(change => change.timestamp >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        changes = changes.filter(change => change.timestamp <= filters.dateTo!);
      }
      if (filters.unsynced) {
        changes = changes.filter(change => !change.isSynced);
      }
    }

    return changes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Conflict Resolution

  // Detect conflicts during sync
  private detectConflicts(localItem: InventoryItem, serverItem: InventoryItem): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];

    // Quantity mismatch
    if (localItem.quantity !== serverItem.quantity) {
      conflicts.push({
        conflictId: this.generateId(),
        type: 'quantity_mismatch',
        localValue: localItem.quantity,
        serverValue: serverItem.quantity,
        resolution: 'manual_review'
      });
    }

    // Price changes
    if (localItem.price !== serverItem.price || localItem.cost !== serverItem.cost) {
      conflicts.push({
        conflictId: this.generateId(),
        type: 'price_change',
        localValue: { price: localItem.price, cost: localItem.cost },
        serverValue: { price: serverItem.price, cost: serverItem.cost },
        resolution: 'use_server' // Default to server for pricing
      });
    }

    // Item modifications
    if (localItem.version !== serverItem.version && localItem.lastModified > serverItem.lastModified) {
      conflicts.push({
        conflictId: this.generateId(),
        type: 'item_modified',
        localValue: localItem,
        serverValue: serverItem,
        resolution: 'merge'
      });
    }

    return conflicts;
  }

  // Resolve conflict
  async resolveConflict(itemId: string, conflictId: string, resolution: ConflictResolution['resolution'], notes?: string): Promise<void> {
    const item = this.items.get(itemId);
    if (!item || !item.conflictResolution) {
      throw new Error('Item or conflict not found');
    }

    const conflict = item.conflictResolution;
    if (conflict.conflictId !== conflictId) {
      throw new Error('Conflict ID mismatch');
    }

    conflict.resolution = resolution;
    conflict.resolvedAt = new Date();
    conflict.resolvedBy = 'offline_user';
    conflict.notes = notes;

    // Apply resolution
    switch (resolution) {
      case 'use_local':
        // Keep local version
        break;
      case 'use_server':
        // Apply server values (would need server data)
        break;
      case 'merge':
        // Merge strategies based on conflict type
        if (conflict.type === 'price_change') {
          // Use server pricing
          await this.updateItem(itemId, conflict.serverValue);
        }
        break;
    }

    await this.persistItems();
    this.emit('conflict_resolved', { itemId, conflictId, resolution });
  }

  // Sync Operations

  // Sync with server
  async syncWithServer(): Promise<SyncResult> {
    if (this.syncInProgress || !navigator.onLine) {
      return {
        itemsProcessed: 0,
        itemsUpdated: 0,
        changesProcessed: 0,
        changesSynced: 0,
        conflictsDetected: 0,
        conflictsResolved: 0,
        errors: []
      };
    }

    this.syncInProgress = true;
    this.emit('sync_started');

    const result: SyncResult = {
      itemsProcessed: 0,
      itemsUpdated: 0,
      changesProcessed: 0,
      changesSynced: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      errors: []
    };

    try {
      // Sync items
      const itemSyncResult = await this.syncItems();
      result.itemsProcessed = itemSyncResult.processed;
      result.itemsUpdated = itemSyncResult.updated;
      result.conflictsDetected = itemSyncResult.conflicts;

      // Sync changes
      const changeSyncResult = await this.syncChanges();
      result.changesProcessed = changeSyncResult.processed;
      result.changesSynced = changeSyncResult.synced;

      await this.persistItems();
      await this.persistChanges();

      this.emit('sync_completed', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      result.errors.push(errorMessage);
      this.emit('sync_failed', { error: errorMessage });
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  private async syncItems(): Promise<{ processed: number; updated: number; conflicts: number }> {
    // Mock sync implementation - in real app, this would call actual API
    const items = Array.from(this.items.values());
    const updated = 0;
    let conflicts = 0;

    for (const item of items) {
      // Simulate server response
      const shouldUpdate = Math.random() < 0.1; // 10% chance of update
      const hasConflict = Math.random() < 0.05; // 5% chance of conflict

      if (hasConflict) {
        // Simulate conflict
        const serverItem = { ...item, quantity: item.quantity + 5, version: item.version + 1 };
        const detectedConflicts = this.detectConflicts(item, serverItem);
        if (detectedConflicts.length > 0) {
          item.conflictResolution = detectedConflicts[0];
          conflicts++;
        }
      } else if (shouldUpdate) {
        item.lastSyncedAt = new Date();
        updated++;
      }
    }

    return { processed: items.length, updated, conflicts };
  }

  private async syncChanges(): Promise<{ processed: number; synced: number }> {
    const unsynced = Array.from(this.changes.values()).filter(change => !change.isSynced);
    const synced = 0;

    for (const change of unsynced) {
      // Mock sync - in real app, send to server
      const success = Math.random() < 0.9; // 90% success rate
      
      if (success) {
        change.isSynced = true;
        synced++;
      } else {
        change.syncAttempts++;
        change.lastSyncAttempt = new Date();
        change.syncError = 'Network error';
      }
    }

    return { processed: unsynced.length, synced };
  }

  // Private helper methods

  private async recordChange(changeData: Omit<InventoryChange, 'id'>): Promise<InventoryChange> {
    const change: InventoryChange = {
      id: this.generateId(),
      ...changeData
    };

    this.changes.set(change.id, change);
    await this.persistChanges();

    this.emit('change_recorded', change);
    return change;
  }

  private generateId(): string {
    return 'inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
  }

  private scheduleSync(): void {
    if (navigator.onLine && !this.syncInProgress) {
      setTimeout(() => this.syncWithServer(), 1000);
    }
  }

  private startAutoSync(): void {
    this.autoSyncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncWithServer();
      }
    }, this.SYNC_INTERVAL);
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.emit('network_online');
      this.scheduleSync();
    });

    window.addEventListener('offline', () => {
      this.emit('network_offline');
    });
  }

  // Storage operations
  private async persistItems(): Promise<void> {
    try {
      const serialized = Array.from(this.items.entries()).map(([id, item]) => [
        id,
        {
          ...item,
          lastModified: item.lastModified.toISOString(),
          lastSyncedAt: item.lastSyncedAt?.toISOString()
        }
      ]);
      localStorage.setItem(this.ITEMS_STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist items:', error);
    }
  }

  private async persistChanges(): Promise<void> {
    try {
      const serialized = Array.from(this.changes.entries()).map(([id, change]) => [
        id,
        {
          ...change,
          timestamp: change.timestamp.toISOString(),
          lastSyncAttempt: change.lastSyncAttempt?.toISOString()
        }
      ]);
      localStorage.setItem(this.CHANGES_STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist changes:', error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      // Load items
      const storedItems = localStorage.getItem(this.ITEMS_STORAGE_KEY);
      if (storedItems) {
        const serialized = JSON.parse(storedItems);
        this.items = new Map(
          serialized.map(([id, item]: [string, any]) => [
            id,
            {
              ...item,
              lastModified: new Date(item.lastModified),
              lastSyncedAt: item.lastSyncedAt ? new Date(item.lastSyncedAt) : undefined
            }
          ])
        );
      }

      // Load changes
      const storedChanges = localStorage.getItem(this.CHANGES_STORAGE_KEY);
      if (storedChanges) {
        const serialized = JSON.parse(storedChanges);
        this.changes = new Map(
          serialized.map(([id, change]: [string, any]) => [
            id,
            {
              ...change,
              timestamp: new Date(change.timestamp),
              lastSyncAttempt: change.lastSyncAttempt ? new Date(change.lastSyncAttempt) : undefined
            }
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
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
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
    this.eventListeners.clear();
    this.items.clear();
    this.changes.clear();
    this.initialized = false;
  }
}

// Factory function
export function createOfflineInventoryManager(): OfflineInventoryManager {
  return OfflineInventoryManager.getInstance();
}

// React hook
export function useOfflineInventory() {
  const manager = OfflineInventoryManager.getInstance();
  
  return {
    // Item operations
    addItem: manager.addItem.bind(manager),
    updateItem: manager.updateItem.bind(manager),
    getItem: manager.getItem.bind(manager),
    getItems: manager.getItems.bind(manager),
    
    // Stock operations
    adjustStock: manager.adjustStock.bind(manager),
    recordSale: manager.recordSale.bind(manager),
    recordPurchase: manager.recordPurchase.bind(manager),
    reserveStock: manager.reserveStock.bind(manager),
    releaseReservedStock: manager.releaseReservedStock.bind(manager),
    
    // Analytics
    getStatistics: manager.getStatistics.bind(manager),
    getLowStockItems: manager.getLowStockItems.bind(manager),
    getReorderItems: manager.getReorderItems.bind(manager),
    getChanges: manager.getChanges.bind(manager),
    
    // Sync
    syncWithServer: manager.syncWithServer.bind(manager),
    
    // Conflict resolution
    resolveConflict: manager.resolveConflict.bind(manager),
    
    // Events
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}