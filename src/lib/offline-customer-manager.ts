// Offline customer data management with real-time sync and conflict resolution
// Handles customer profiles, interactions, and relationship data across all business verticals

interface CustomerAddress {
  id: string;
  type: 'billing' | 'shipping' | 'service' | 'home' | 'work';
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  isActive: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  accessNotes?: string;
  deliveryInstructions?: string;
}

interface CustomerContact {
  id: string;
  type: 'phone' | 'email' | 'fax' | 'mobile' | 'landline';
  value: string;
  isPrimary: boolean;
  isVerified: boolean;
  label?: string;
  extension?: string;
  allowMarketing: boolean;
  allowNotifications: boolean;
}

interface CustomerPreferences {
  communicationMethod: 'email' | 'phone' | 'sms' | 'app';
  serviceReminders: boolean;
  marketingOptIn: boolean;
  appointmentReminders: boolean;
  invoiceDelivery: 'email' | 'mail' | 'portal';
  language: string;
  timezone: string;
  currency: string;
  paymentTerms: string;
  specialInstructions?: string;
}

interface CustomerMetrics {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  firstOrderDate?: Date;
  lifetimeValue: number;
  satisfactionScore?: number;
  referralCount: number;
  complaintCount: number;
  appointmentHistory: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
}

interface CustomerInteraction {
  id: string;
  customerId: string;
  type: 'call' | 'email' | 'meeting' | 'service' | 'complaint' | 'inquiry' | 'follow_up';
  subject: string;
  description: string;
  outcome: 'resolved' | 'pending' | 'escalated' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Interaction details
  duration?: number; // in minutes
  method: 'phone' | 'email' | 'in_person' | 'video' | 'chat' | 'app';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignedTo?: string;
  organizationId: string;
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
  
  // Attachments
  attachments?: string[];
  tags?: string[];
  
  // Sync tracking
  isOffline: boolean;
  isSynced: boolean;
  lastSyncAttempt?: Date;
  syncConflict?: CustomerConflictResolution;
}

interface Customer {
  id: string;
  
  // Basic info
  type: 'individual' | 'business';
  firstName: string;
  lastName: string;
  businessName?: string;
  displayName: string;
  
  // Business details (if type is business)
  businessType?: string;
  taxId?: string;
  website?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  
  // Contact information
  contacts: CustomerContact[];
  addresses: CustomerAddress[];
  
  // Customer status
  status: 'active' | 'inactive' | 'prospect' | 'suspended' | 'archived';
  customerSince?: Date;
  source: 'referral' | 'online' | 'marketing' | 'walk_in' | 'advertisement' | 'other';
  sourceDetails?: string;
  
  // Preferences and settings
  preferences: CustomerPreferences;
  
  // Financial information
  creditLimit?: number;
  paymentTerms: string;
  taxExempt: boolean;
  defaultPaymentMethod?: string;
  
  // Metrics and analytics
  metrics: CustomerMetrics;
  
  // Custom fields (industry-specific)
  customFields: Record<string, unknown>;
  
  // Metadata
  organizationId: string;
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'courses';
  
  // Relationship data
  assignedTo?: string; // Sales rep, account manager
  referredBy?: string; // Other customer ID
  parentCustomer?: string; // For business hierarchies
  childCustomers?: string[]; // Sub-accounts
  
  // System tracking
  version: number;
  createdAt: Date;
  updatedAt: Date;
  lastContactDate?: Date;
  lastSyncedAt?: Date;
  
  // Offline tracking
  pendingChanges?: CustomerChange[];
  conflictResolution?: CustomerConflictResolution;
  isActive: boolean;
}

interface CustomerChange {
  id: string;
  customerId: string;
  changeType: 'create' | 'update' | 'delete' | 'interaction' | 'address' | 'contact';
  
  // Change details
  fieldChanged?: string;
  oldValue?: any;
  newValue?: any;
  
  // Change context
  reason: string;
  description?: string;
  
  // Metadata
  timestamp: Date;
  createdBy: string;
  organizationId: string;
  
  // Sync tracking
  isOffline: boolean;
  isSynced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: Date;
  syncError?: string;
}

interface CustomerConflictResolution {
  conflictId: string;
  type: 'data_conflict' | 'interaction_conflict' | 'address_conflict' | 'status_conflict';
  localValue: any;
  serverValue: any;
  resolution: 'use_local' | 'use_server' | 'merge' | 'manual_review';
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  pendingInteractions: number;
  unsynced: number;
  conflicts: number;
  
  // Segmentation
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byIndustry: Record<string, number>;
  
  // Value metrics
  totalLifetimeValue: number;
  averageLifetimeValue: number;
  topCustomers: Customer[];
}

interface CustomerSearchFilters {
  search?: string;
  status?: Customer['status'];
  type?: Customer['type'];
  source?: Customer['source'];
  industry?: Customer['industry'];
  assignedTo?: string;
  hasInteractions?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: {
    city?: string;
    state?: string;
    radius?: number;
    coordinates?: { lat: number; lng: number };
  };
}

interface CustomerSyncResult {
  customersProcessed: number;
  customersUpdated: number;
  interactionsProcessed: number;
  interactionsSynced: number;
  conflictsDetected: number;
  conflictsResolved: number;
  errors: string[];
}

export class OfflineCustomerManager {
  private static instance: OfflineCustomerManager | null = null;
  private customers: Map<string, Customer> = new Map();
  private interactions: Map<string, CustomerInteraction> = new Map();
  private changes: Map<string, CustomerChange> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private syncInProgress = false;
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  private readonly CUSTOMERS_STORAGE_KEY = 'offline_customers';
  private readonly INTERACTIONS_STORAGE_KEY = 'offline_customer_interactions';
  private readonly CHANGES_STORAGE_KEY = 'offline_customer_changes';
  private readonly STATS_STORAGE_KEY = 'customer_stats';
  private readonly SYNC_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.initialize();
  }

  static getInstance(): OfflineCustomerManager {
    if (!OfflineCustomerManager.instance) {
      OfflineCustomerManager.instance = new OfflineCustomerManager();
    }
    return OfflineCustomerManager.instance;
  }

  // Initialize the customer manager
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadFromStorage();
      this.setupNetworkListeners();
      this.startAutoSync();
      
      this.initialized = true;
      this.emit('customer_manager_initialized');
    } catch (error) {
      console.error('Failed to initialize customer manager:', error);
      throw new Error('Customer manager initialization failed');
    }
  }

  // Customer CRUD Operations

  // Create new customer
  async createCustomer(customerData: Omit<Customer, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'metrics' | 'isActive'>): Promise<Customer> {
    await this.initialize();

    const customer: Customer = {
      id: this.generateId('customer'),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      metrics: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        lifetimeValue: 0,
        referralCount: 0,
        complaintCount: 0,
        appointmentHistory: {
          total: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0
        }
      },
      ...customerData
    };

    // Generate display name if not provided
    if (!customer.displayName) {
      customer.displayName = customer.type === 'business' 
        ? customer.businessName || `${customer.firstName} ${customer.lastName}'
        : '${customer.firstName} ${customer.lastName}';
    }

    this.customers.set(customer.id, customer);
    await this.persistCustomers();

    // Record change
    await this.recordChange({
      customerId: customer.id,
      changeType: 'create',
      reason: 'Customer created',
      timestamp: new Date(),
      createdBy: 'offline_user',
      organizationId: customer.organizationId,
      isOffline: !navigator.onLine,
      isSynced: false,
      syncAttempts: 0
    });

    this.emit('customer_created', customer);
    this.scheduleSync();

    return customer;
  }

  // Update customer
  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    await this.initialize();

    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const updatedCustomer: Customer = {
      ...customer,
      ...updates,
      version: customer.version + 1,
      updatedAt: new Date()
    };

    this.customers.set(customerId, updatedCustomer);
    await this.persistCustomers();

    // Record changes for each field
    for (const [field, newValue] of Object.entries(updates)) {
      if (field !== 'version' && field !== 'updatedAt') {
        await this.recordChange({
          customerId,
          changeType: 'update',
          fieldChanged: field,
          oldValue: (customer as any)[field],
          newValue,
          reason: 'Updated ${field}',
          timestamp: new Date(),
          createdBy: 'offline_user',
          organizationId: customer.organizationId,
          isOffline: !navigator.onLine,
          isSynced: false,
          syncAttempts: 0
        });
      }
    }

    this.emit('customer_updated', updatedCustomer);
    this.scheduleSync();

    return updatedCustomer;
  }

  // Get customer by ID
  getCustomer(customerId: string): Customer | undefined {
    return this.customers.get(customerId);
  }

  // Search customers with advanced filtering
  searchCustomers(filters: CustomerSearchFilters = {}): Customer[] {
    let customers = Array.from(this.customers.values()).filter(c => c.isActive);

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      customers = customers.filter(customer => 
        customer.displayName.toLowerCase().includes(search) ||
        customer.firstName.toLowerCase().includes(search) ||
        customer.lastName.toLowerCase().includes(search) ||
        customer.businessName?.toLowerCase().includes(search) ||
        customer.contacts.some(contact => contact.value.toLowerCase().includes(search))
      );
    }

    if (filters.status) {
      customers = customers.filter(c => c.status === filters.status);
    }

    if (filters.type) {
      customers = customers.filter(c => c.type === filters.type);
    }

    if (filters.source) {
      customers = customers.filter(c => c.source === filters.source);
    }

    if (filters.industry) {
      customers = customers.filter(c => c.industry === filters.industry);
    }

    if (filters.assignedTo) {
      customers = customers.filter(c => c.assignedTo === filters.assignedTo);
    }

    if (filters.hasInteractions) {
      const customerIds = new Set(
        Array.from(this.interactions.values()).map(i => i.customerId)
      );
      customers = customers.filter(c => customerIds.has(c.id));
    }

    if (filters.dateRange) {
      customers = customers.filter(c => 
        c.createdAt >= filters.dateRange!.start && 
        c.createdAt <= filters.dateRange!.end
      );
    }

    if (filters.location) {
      customers = customers.filter(customer => {
        return customer.addresses.some(address => {
          if (filters.location!.city && address.city.toLowerCase() !== filters.location!.city.toLowerCase()) {
            return false;
          }
          if (filters.location!.state && address.state.toLowerCase() !== filters.location!.state.toLowerCase()) {
            return false;
          }
          
          // Radius-based filtering (if coordinates available)
          if (filters.location!.coordinates && filters.location!.radius && address.coordinates) {
            const distance = this.calculateDistance(
              filters.location!.coordinates,
              address.coordinates
            );
            return distance <= filters.location!.radius;
          }
          
          return true;
        });
      });
    }

    // Sort by last contact date (most recent first)
    return customers.sort((a, b) => {
      const aDate = a.lastContactDate || a.updatedAt;
      const bDate = b.lastContactDate || b.updatedAt;
      return bDate.getTime() - aDate.getTime();
    });
  }

  // Customer Interaction Management

  // Add customer interaction
  async addInteraction(interactionData: Omit<CustomerInteraction, 'id' | 'createdAt' | 'updatedAt' | 'isOffline' | 'isSynced'>): Promise<CustomerInteraction> {
    await this.initialize();

    const interaction: CustomerInteraction = {
      id: this.generateId('interaction'),
      createdAt: new Date(),
      updatedAt: new Date(),
      isOffline: !navigator.onLine,
      isSynced: false,
      ...interactionData
    };

    this.interactions.set(interaction.id, interaction);
    await this.persistInteractions();

    // Update customer's last contact date
    const customer = this.customers.get(interaction.customerId);
    if (customer) {
      customer.lastContactDate = interaction.createdAt;
      await this.persistCustomers();
    }

    // Record change
    await this.recordChange({
      customerId: interaction.customerId,
      changeType: 'interaction',
      reason: 'Added ${interaction.type} interaction',
      description: interaction.subject,
      timestamp: new Date(),
      createdBy: 'offline_user',
      organizationId: interaction.organizationId,
      isOffline: !navigator.onLine,
      isSynced: false,
      syncAttempts: 0
    });

    this.emit('interaction_added', interaction);
    this.scheduleSync();

    return interaction;
  }

  // Get customer interactions
  getCustomerInteractions(customerId: string): CustomerInteraction[] {
    return Array.from(this.interactions.values())
      .filter(i => i.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get all interactions with filtering
  getInteractions(filters?: {
    type?: CustomerInteraction['type'];
    outcome?: CustomerInteraction['outcome'];
    priority?: CustomerInteraction['priority'];
    assignedTo?: string;
    dateRange?: { start: Date; end: Date };
    requiresFollowUp?: boolean;
  }): CustomerInteraction[] {
    let interactions = Array.from(this.interactions.values());

    if (filters) {
      if (filters.type) {
        interactions = interactions.filter(i => i.type === filters.type);
      }
      if (filters.outcome) {
        interactions = interactions.filter(i => i.outcome === filters.outcome);
      }
      if (filters.priority) {
        interactions = interactions.filter(i => i.priority === filters.priority);
      }
      if (filters.assignedTo) {
        interactions = interactions.filter(i => i.assignedTo === filters.assignedTo);
      }
      if (filters.dateRange) {
        interactions = interactions.filter(i => 
          i.createdAt >= filters.dateRange!.start && 
          i.createdAt <= filters.dateRange!.end
        );
      }
      if (filters.requiresFollowUp) {
        interactions = interactions.filter(i => i.followUpRequired);
      }
    }

    return interactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Customer Address Management

  // Add address to customer
  async addCustomerAddress(customerId: string, addressData: Omit<CustomerAddress, 'id'>): Promise<CustomerAddress> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const address: CustomerAddress = {
      id: this.generateId('address'),
      ...addressData
    };

    // If this is the first address or marked as default, make it default
    if (customer.addresses.length === 0 || address.isDefault) {
      customer.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }

    customer.addresses.push(address);
    await this.updateCustomer(customerId, { addresses: customer.addresses });

    return address;
  }

  // Add contact to customer
  async addCustomerContact(customerId: string, contactData: Omit<CustomerContact, 'id'>): Promise<CustomerContact> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const contact: CustomerContact = {
      id: this.generateId('contact'),
      ...contactData
    };

    // If this is the first contact or marked as primary, make it primary
    if (customer.contacts.length === 0 || contact.isPrimary) {
      customer.contacts.forEach(c => c.isPrimary = false);
      contact.isPrimary = true;
    }

    customer.contacts.push(contact);
    await this.updateCustomer(customerId, { contacts: customer.contacts });

    return contact;
  }

  // Analytics and Statistics

  // Get customer statistics
  async getStatistics(organizationId?: string): Promise<CustomerStats> {
    await this.initialize();

    let customers = Array.from(this.customers.values()).filter(c => c.isActive);
    let interactions = Array.from(this.interactions.values());
    
    if (organizationId) {
      customers = customers.filter(c => c.organizationId === organizationId);
      interactions = interactions.filter(i => i.organizationId === organizationId);
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const newThisMonth = customers.filter(c => c.createdAt >= thisMonth).length;
    const pendingInteractions = interactions.filter(i => i.outcome === 'pending').length;

    const unsynced = customers.filter(c => 
      c.lastSyncedAt === undefined || 
      c.updatedAt > c.lastSyncedAt
    ).length;

    const conflicts = customers.filter(c => c.conflictResolution).length;

    // Segmentation
    const byType = customers.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = customers.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySource = customers.reduce((acc, c) => {
      acc[c.source] = (acc[c.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byIndustry = customers.reduce((acc, c) => {
      acc[c.industry] = (acc[c.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Value metrics
    const totalLifetimeValue = customers.reduce((sum, c) => sum + c.metrics.lifetimeValue, 0);
    const averageLifetimeValue = customers.length > 0 ? totalLifetimeValue / customers.length : 0;

    // Top customers by lifetime value
    const topCustomers = customers
      .sort((a, b) => b.metrics.lifetimeValue - a.metrics.lifetimeValue)
      .slice(0, 10);

    return {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      newThisMonth,
      pendingInteractions,
      unsynced,
      conflicts,
      byType,
      byStatus,
      bySource,
      byIndustry,
      totalLifetimeValue,
      averageLifetimeValue,
      topCustomers
    };
  }

  // Get customers requiring follow-up
  getCustomersRequiringFollowUp(organizationId?: string): { customer: Customer; interaction: CustomerInteraction }[] {
    const now = new Date();
    let interactions = Array.from(this.interactions.values()).filter(i => 
      i.followUpRequired && 
      i.followUpDate && 
      i.followUpDate <= now
    );

    if (organizationId) {
      interactions = interactions.filter(i => i.organizationId === organizationId);
    }

    return interactions.map(interaction => ({
      customer: this.customers.get(interaction.customerId)!,
      interaction
    })).filter(item => item.customer);
  }

  // Sync Operations

  // Sync with server
  async syncWithServer(): Promise<CustomerSyncResult> {
    if (this.syncInProgress || !navigator.onLine) {
      return {
        customersProcessed: 0,
        customersUpdated: 0,
        interactionsProcessed: 0,
        interactionsSynced: 0,
        conflictsDetected: 0,
        conflictsResolved: 0,
        errors: []
      };
    }

    this.syncInProgress = true;
    this.emit('sync_started');

    const result: CustomerSyncResult = {
      customersProcessed: 0,
      customersUpdated: 0,
      interactionsProcessed: 0,
      interactionsSynced: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      errors: []
    };

    try {
      // Sync customers
      const customerSyncResult = await this.syncCustomers();
      result.customersProcessed = customerSyncResult.processed;
      result.customersUpdated = customerSyncResult.updated;
      result.conflictsDetected = customerSyncResult.conflicts;

      // Sync interactions
      const interactionSyncResult = await this.syncInteractions();
      result.interactionsProcessed = interactionSyncResult.processed;
      result.interactionsSynced = interactionSyncResult.synced;

      // Sync changes
      const changeSyncResult = await this.syncChanges();

      await this.persistAll();

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

  private async syncCustomers(): Promise<{ processed: number; updated: number; conflicts: number }> {
    // Mock sync implementation
    const customers = Array.from(this.customers.values());
    const updated = 0;
    let conflicts = 0;

    for (const customer of customers) {
      const shouldUpdate = Math.random() < 0.1; // 10% chance of update
      const hasConflict = Math.random() < 0.05; // 5% chance of conflict

      if (hasConflict) {
        // Simulate conflict
        const serverCustomer = { 
          ...customer, 
          firstName: customer.firstName + '_server',
          version: customer.version + 1 
        };
        const detectedConflicts = this.detectCustomerConflicts(customer, serverCustomer);
        if (detectedConflicts.length > 0) {
          customer.conflictResolution = detectedConflicts[0];
          conflicts++;
        }
      } else if (shouldUpdate) {
        customer.lastSyncedAt = new Date();
        updated++;
      }
    }

    return { processed: customers.length, updated, conflicts };
  }

  private async syncInteractions(): Promise<{ processed: number; synced: number }> {
    const unsynced = Array.from(this.interactions.values()).filter(i => !i.isSynced);
    let synced = 0;

    for (const interaction of unsynced) {
      const success = Math.random() < 0.9; // 90% success rate
      
      if (success) {
        interaction.isSynced = true;
        synced++;
      }
    }

    return { processed: unsynced.length, synced };
  }

  private async syncChanges(): Promise<{ processed: number; synced: number }> {
    const unsynced = Array.from(this.changes.values()).filter(c => !c.isSynced);
    let synced = 0;

    for (const change of unsynced) {
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

  // Conflict Resolution

  private detectCustomerConflicts(localCustomer: Customer, serverCustomer: Customer): CustomerConflictResolution[] {
    const conflicts: CustomerConflictResolution[] = [];

    // Check for data conflicts
    const conflictFields = ['firstName', 'lastName', 'businessName', 'status'];
    for (const field of conflictFields) {
      if ((localCustomer as any)[field] !== (serverCustomer as any)[field]) {
        conflicts.push({
          conflictId: this.generateId('conflict'),
          type: 'data_conflict',
          localValue: (localCustomer as any)[field],
          serverValue: (serverCustomer as any)[field],
          resolution: 'manual_review'
        });
      }
    }

    return conflicts;
  }

  // Resolve customer conflict
  async resolveConflict(customerId: string, conflictId: string, resolution: CustomerConflictResolution['resolution'], notes?: string): Promise<void> {
    const customer = this.customers.get(customerId);
    if (!customer || !customer.conflictResolution) {
      throw new Error('Customer or conflict not found');
    }

    const conflict = customer.conflictResolution;
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
        // Implement merge strategy
        break;
    }

    customer.conflictResolution = undefined;
    await this.persistCustomers();
    
    this.emit('conflict_resolved', { customerId, conflictId, resolution });
  }

  // Utility Methods

  private calculateDistance(point1: { lat: number; lng: number }, point2: { latitude: number; longitude: number }): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(point2.latitude - point1.lat);
    const dLon = this.toRadians(point2.longitude - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async recordChange(changeData: Omit<CustomerChange, 'id'>): Promise<CustomerChange> {
    const change: CustomerChange = {
      id: this.generateId('change'),
      ...changeData
    };

    this.changes.set(change.id, change);
    await this.persistChanges();

    this.emit('change_recorded', change);
    return change;
  }

  private generateId(prefix: string): string {
    return '${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
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
  private async persistAll(): Promise<void> {
    await Promise.all([
      this.persistCustomers(),
      this.persistInteractions(),
      this.persistChanges()
    ]);
  }

  private async persistCustomers(): Promise<void> {
    try {
      const serialized = Array.from(this.customers.entries()).map(([id, customer]) => [
        id,
        {
          ...customer,
          createdAt: customer.createdAt.toISOString(),
          updatedAt: customer.updatedAt.toISOString(),
          customerSince: customer.customerSince?.toISOString(),
          lastContactDate: customer.lastContactDate?.toISOString(),
          lastSyncedAt: customer.lastSyncedAt?.toISOString(),
          metrics: {
            ...customer.metrics,
            lastOrderDate: customer.metrics.lastOrderDate?.toISOString(),
            firstOrderDate: customer.metrics.firstOrderDate?.toISOString()
          }
        }
      ]);
      localStorage.setItem(this.CUSTOMERS_STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist customers:', error);
    }
  }

  private async persistInteractions(): Promise<void> {
    try {
      const serialized = Array.from(this.interactions.entries()).map(([id, interaction]) => [
        id,
        {
          ...interaction,
          createdAt: interaction.createdAt.toISOString(),
          updatedAt: interaction.updatedAt.toISOString(),
          followUpDate: interaction.followUpDate?.toISOString(),
          lastSyncAttempt: interaction.lastSyncAttempt?.toISOString()
        }
      ]);
      localStorage.setItem(this.INTERACTIONS_STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist interactions:', error);
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
      // Load customers
      const storedCustomers = localStorage.getItem(this.CUSTOMERS_STORAGE_KEY);
      if (storedCustomers) {
        const serialized = JSON.parse(storedCustomers);
        this.customers = new Map(
          serialized.map(([id, customer]: [string, any]) => [
            id,
            {
              ...customer,
              createdAt: new Date(customer.createdAt),
              updatedAt: new Date(customer.updatedAt),
              customerSince: customer.customerSince ? new Date(customer.customerSince) : undefined,
              lastContactDate: customer.lastContactDate ? new Date(customer.lastContactDate) : undefined,
              lastSyncedAt: customer.lastSyncedAt ? new Date(customer.lastSyncedAt) : undefined,
              metrics: {
                ...customer.metrics,
                lastOrderDate: customer.metrics.lastOrderDate ? new Date(customer.metrics.lastOrderDate) : undefined,
                firstOrderDate: customer.metrics.firstOrderDate ? new Date(customer.metrics.firstOrderDate) : undefined
              }
            }
          ])
        );
      }

      // Load interactions
      const storedInteractions = localStorage.getItem(this.INTERACTIONS_STORAGE_KEY);
      if (storedInteractions) {
        const serialized = JSON.parse(storedInteractions);
        this.interactions = new Map(
          serialized.map(([id, interaction]: [string, any]) => [
            id,
            {
              ...interaction,
              createdAt: new Date(interaction.createdAt),
              updatedAt: new Date(interaction.updatedAt),
              followUpDate: interaction.followUpDate ? new Date(interaction.followUpDate) : undefined,
              lastSyncAttempt: interaction.lastSyncAttempt ? new Date(interaction.lastSyncAttempt) : undefined
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
    this.customers.clear();
    this.interactions.clear();
    this.changes.clear();
    this.initialized = false;
  }
}

// Factory function
export function createOfflineCustomerManager(): OfflineCustomerManager {
  return OfflineCustomerManager.getInstance();
}

// React hook
export function useOfflineCustomers() {
  const manager = OfflineCustomerManager.getInstance();
  
  return {
    // Customer operations
    createCustomer: manager.createCustomer.bind(manager),
    updateCustomer: manager.updateCustomer.bind(manager),
    getCustomer: manager.getCustomer.bind(manager),
    searchCustomers: manager.searchCustomers.bind(manager),
    
    // Interaction operations
    addInteraction: manager.addInteraction.bind(manager),
    getCustomerInteractions: manager.getCustomerInteractions.bind(manager),
    getInteractions: manager.getInteractions.bind(manager),
    
    // Address and contact operations
    addCustomerAddress: manager.addCustomerAddress.bind(manager),
    addCustomerContact: manager.addCustomerContact.bind(manager),
    
    // Analytics
    getStatistics: manager.getStatistics.bind(manager),
    getCustomersRequiringFollowUp: manager.getCustomersRequiringFollowUp.bind(manager),
    
    // Sync
    syncWithServer: manager.syncWithServer.bind(manager),
    
    // Conflict resolution
    resolveConflict: manager.resolveConflict.bind(manager),
    
    // Events
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}

// Export types
export type {
  Customer,
  CustomerInteraction,
  CustomerAddress,
  CustomerContact,
  CustomerPreferences,
  CustomerMetrics,
  CustomerChange,
  CustomerConflictResolution,
  CustomerStats,
  CustomerSearchFilters,
  CustomerSyncResult
};