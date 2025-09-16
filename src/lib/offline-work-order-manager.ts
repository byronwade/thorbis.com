// Comprehensive offline work order management system
// Supports creation, updates, status tracking, and sync capabilities for all business verticals

import { EventEmitter } from 'events';

interface WorkOrderMetadata {
  id: string;
  number: string; // Auto-generated work order number
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  type: WorkOrderType;
  category: string;
  
  // Customer/Client Information
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  
  // Location/Property
  serviceAddress: ServiceAddress;
  propertyType?: string;
  accessInstructions?: string;
  
  // Scheduling
  scheduledAt?: Date;
  estimatedDuration?: number; // minutes
  actualStartTime?: Date;
  actualEndTime?: Date;
  
  // Assignment
  assignedTechnicians: string[]; // technician IDs
  teamLead?: string;
  supervisorId?: string;
  
  // Financial
  estimatedCost?: number;
  actualCost?: number;
  laborCost?: number;
  materialsCost?: number;
  currency: string;
  
  // Items and Services
  lineItems: WorkOrderLineItem[];
  materials: WorkOrderMaterial[];
  equipment: WorkOrderEquipment[];
  
  // Documentation
  attachments: string[]; // document IDs
  photos: string[];
  signatures: WorkOrderSignature[];
  notes: WorkOrderNote[];
  
  // Industry-specific fields
  industryData: Record<string, unknown>;
  
  // Tracking
  createdAt: Date;
  createdBy: string;
  lastModified: Date;
  modifiedBy: string;
  completedAt?: Date;
  completedBy?: string;
  
  // Sync and organization
  organizationId: string;
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'courses' | 'payroll';
  isDeleted: boolean;
  deletedAt?: Date;
  isSynced: boolean;
  syncedAt?: Date;
  lastSyncAttempt?: Date;
  syncStatus: 'pending' | 'syncing' | 'completed' | 'failed';
  syncError?: string;
  version: number;
  
  // External references
  parentWorkOrderId?: string;
  relatedWorkOrders: string[];
  invoiceId?: string;
  estimateId?: string;
  contractId?: string;
  
  // Quality and compliance
  qualityChecked: boolean;
  qualityCheckedBy?: string;
  qualityCheckedAt?: Date;
  complianceNotes?: string;
  
  // Customer satisfaction
  customerRating?: number;
  customerFeedback?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  
  // Recurring work orders
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  recurringUntil?: Date;
  
  // Emergency and urgency
  isEmergency: boolean;
  emergencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  responseTime?: number; // minutes
  
  // Weather and conditions
  weatherConditions?: string;
  workingConditions?: string;
  safetyNotes?: string;
}

interface ServiceAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  unit?: string;
  buildingNumber?: string;
  instructions?: string;
}

interface WorkOrderLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  taxable: boolean;
  taxRate?: number;
  discountAmount?: number;
  discountPercent?: number;
  notes?: string;
}

interface WorkOrderMaterial {
  id: string;
  materialId?: string; // Reference to inventory
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  partNumber?: string;
  serialNumber?: string;
  warrantyInfo?: string;
  used: boolean;
  returnedQuantity?: number;
}

interface WorkOrderEquipment {
  id: string;
  equipmentId?: string; // Reference to equipment registry
  name: string;
  type: string;
  model?: string;
  serialNumber?: string;
  usageHours?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_repair';
  maintenanceRequired: boolean;
  notes?: string;
}

interface WorkOrderSignature {
  id: string;
  type: 'customer' | 'technician' | 'supervisor' | 'inspector';
  signedBy: string;
  signedAt: Date;
  signatureData: string; // Base64 encoded signature image
  title?: string;
  purpose: string;
  ipAddress?: string;
  deviceInfo?: string;
}

interface WorkOrderNote {
  id: string;
  content: string;
  type: 'general' | 'technical' | 'customer' | 'internal' | 'safety';
  createdAt: Date;
  createdBy: string;
  isPrivate: boolean;
  attachments: string[];
  tags: string[];
  importance: 'low' | 'medium' | 'high';
}

interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  interval: number; // every N frequency units
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
  monthOfYear?: number; // 1-12
  endDate?: Date;
  maxOccurrences?: number;
}

type WorkOrderStatus = 
  | 'draft' | 'scheduled' | 'dispatched' | 'in_progress' | 'on_hold'
  | 'completed' | 'cancelled' | 'requires_approval' | 'approved'
  | 'invoiced' | 'paid' | 'follow_up_required';

type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent' | 'emergency';

type WorkOrderType = 
  | 'maintenance' | 'repair' | 'installation' | 'inspection' | 'service'
  | 'emergency' | 'warranty' | 'estimate' | 'consultation' | 'training'
  | 'compliance' | 'upgrade' | 'replacement' | 'cleaning' | 'delivery';

interface WorkOrderFilter {
  status?: WorkOrderStatus | WorkOrderStatus[];
  priority?: WorkOrderPriority | WorkOrderPriority[];
  type?: WorkOrderType | WorkOrderType[];
  assignedTechnician?: string;
  customerId?: string;
  organizationId?: string;
  industry?: string;
  dateRange?: {
    start: Date;
    end: Date;
    field?: 'createdAt' | 'scheduledAt' | 'completedAt';
  };
  searchQuery?: string;
  isEmergency?: boolean;
  isRecurring?: boolean;
  isSynced?: boolean;
  tags?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // kilometers
  };
}

interface WorkOrderSearchResult {
  workOrders: WorkOrderMetadata[];
  totalCount: number;
  statusCounts: Record<WorkOrderStatus, number>;
  priorityCounts: Record<WorkOrderPriority, number>;
  typeCounts: Record<WorkOrderType, number>;
  totalValue: number;
  averageCompletionTime?: number;
}

interface WorkOrderStats {
  totalWorkOrders: number;
  completedWorkOrders: number;
  pendingWorkOrders: number;
  overdueWorkOrders: number;
  emergencyWorkOrders: number;
  completionRate: number;
  averageCompletionTime: number;
  totalRevenue: number;
  syncedCount: number;
  unsyncedCount: number;
  statusBreakdown: Record<WorkOrderStatus, number>;
  priorityBreakdown: Record<WorkOrderPriority, number>;
  typeBreakdown: Record<WorkOrderType, number>;
  technicianWorkload: Record<string, number>;
  customerSatisfaction: {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: Record<number, number>;
  };
  performanceMetrics: {
    onTimeCompletion: number;
    firstTimeFixRate: number;
    callbackRate: number;
    averageResponseTime: number;
  };
}

interface WorkOrderTemplate {
  id: string;
  name: string;
  description: string;
  type: WorkOrderType;
  category: string;
  estimatedDuration: number;
  defaultLineItems: Omit<WorkOrderLineItem, 'id'>[];
  defaultMaterials: Omit<WorkOrderMaterial, 'id'>[];
  requiredSignatures: string[];
  checklistItems: string[];
  instructions: string;
  safetyRequirements: string[];
  industry: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OfflineWorkOrderManager extends EventEmitter {
  private static instance: OfflineWorkOrderManager | null = null;
  
  private dbName = 'offline_work_orders';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  
  private workOrders: Map<string, WorkOrderMetadata> = new Map();
  private templates: Map<string, WorkOrderTemplate> = new Map();
  
  private initialized = false;
  private currentUserId = 'default';
  private currentOrganizationId = 'default';
  private sequenceCounters: Map<string, number> = new Map(); // For work order numbering

  private constructor() {
    super();
    this.initialize();
  }

  static getInstance(): OfflineWorkOrderManager {
    if (!OfflineWorkOrderManager.instance) {
      OfflineWorkOrderManager.instance = new OfflineWorkOrderManager();
    }
    return OfflineWorkOrderManager.instance;
  }

  // Initialize IndexedDB and load existing data
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.initializeDatabase();
      await this.loadWorkOrdersFromStorage();
      await this.loadTemplatesFromStorage();
      await this.initializeSequenceCounters();
      
      this.initialized = true;
      this.emit('manager_initialized');
    } catch (error) {
      console.error('Failed to initialize work order manager:', error);
      throw new Error('Work order manager initialization failed');
    }
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Work orders store
        if (!db.objectStoreNames.contains('work_orders')) {
          const workOrderStore = db.createObjectStore('work_orders', { keyPath: 'id' });
          workOrderStore.createIndex('number', 'number', { unique: true });
          workOrderStore.createIndex('status', 'status', { unique: false });
          workOrderStore.createIndex('priority', 'priority', { unique: false });
          workOrderStore.createIndex('assignedTechnicians', 'assignedTechnicians', { unique: false, multiEntry: true });
          workOrderStore.createIndex('customerId', 'customerId', { unique: false });
          workOrderStore.createIndex('organizationId', 'organizationId', { unique: false });
          workOrderStore.createIndex('scheduledAt', 'scheduledAt', { unique: false });
          workOrderStore.createIndex('createdAt', 'createdAt', { unique: false });
          workOrderStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          workOrderStore.createIndex('industry', 'industry', { unique: false });
        }

        // Templates store
        if (!db.objectStoreNames.contains('templates')) {
          const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
          templateStore.createIndex('name', 'name', { unique: false });
          templateStore.createIndex('type', 'type', { unique: false });
          templateStore.createIndex('industry', 'industry', { unique: false });
        }

        // Sequence counters store
        if (!db.objectStoreNames.contains('sequences')) {
          db.createObjectStore('sequences', { keyPath: 'id' });
        }

        // Recurring patterns store
        if (!db.objectStoreNames.contains('recurring')) {
          const recurringStore = db.createObjectStore('recurring', { keyPath: 'workOrderId' });
          recurringStore.createIndex('nextDue', 'nextDue', { unique: false });
        }
      };
    });
  }

  // Work order creation
  async createWorkOrder(workOrderData: {
    title: string;
    description: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    serviceAddress: ServiceAddress;
    scheduledAt?: Date;
    assignedTechnicians?: string[];
    priority?: WorkOrderPriority;
    type?: WorkOrderType;
    category?: string;
    lineItems?: Omit<WorkOrderLineItem, 'id'>[];
    materials?: Omit<WorkOrderMaterial, 'id'>[];
    equipment?: Omit<WorkOrderEquipment, 'id'>[];
    industryData?: Record<string, unknown>;
    templateId?: string;
    isEmergency?: boolean;
    estimatedCost?: number;
    notes?: string;
  }): Promise<string> {
    if (!this.initialized) await this.initialize();

    try {
      const workOrderId = this.generateId();
      const workOrderNumber = await this.generateWorkOrderNumber();
      const now = new Date();

      // Apply template if specified
      let templateData: Partial<WorkOrderTemplate> = {};
      if (workOrderData.templateId) {
        const template = this.templates.get(workOrderData.templateId);
        if (template) {
          templateData = {
            type: template.type,
            category: template.category,
            estimatedDuration: template.estimatedDuration,
            defaultLineItems: template.defaultLineItems,
            defaultMaterials: template.defaultMaterials
          };
        }
      }

      const workOrder: WorkOrderMetadata = {
        id: workOrderId,
        number: workOrderNumber,
        title: workOrderData.title,
        description: workOrderData.description,
        status: 'draft',
        priority: workOrderData.priority || 'medium',
        type: workOrderData.type || templateData.type || 'service',
        category: workOrderData.category || templateData.category || 'general',
        
        customerName: workOrderData.customerName,
        customerEmail: workOrderData.customerEmail,
        customerPhone: workOrderData.customerPhone,
        
        serviceAddress: workOrderData.serviceAddress,
        
        scheduledAt: workOrderData.scheduledAt,
        estimatedDuration: templateData.estimatedDuration,
        
        assignedTechnicians: workOrderData.assignedTechnicians || [],
        
        estimatedCost: workOrderData.estimatedCost,
        currency: 'USD',
        
        lineItems: workOrderData.lineItems?.map(item => ({
          ...item,
          id: this.generateId()
        })) || templateData.defaultLineItems?.map(item => ({
          ...item,
          id: this.generateId()
        })) || [],
        
        materials: workOrderData.materials?.map(material => ({
          ...material,
          id: this.generateId(),
          used: false
        })) || templateData.defaultMaterials?.map(material => ({
          ...material,
          id: this.generateId(),
          used: false
        })) || [],
        
        equipment: workOrderData.equipment?.map(equip => ({
          ...equip,
          id: this.generateId(),
          condition: equip.condition || 'good',
          maintenanceRequired: false
        })) || [],
        
        attachments: [],
        photos: [],
        signatures: [],
        notes: workOrderData.notes ? [{
          id: this.generateId(),
          content: workOrderData.notes,
          type: 'general',
          createdAt: now,
          createdBy: this.currentUserId,
          isPrivate: false,
          attachments: [],
          tags: [],
          importance: 'medium'
        }] : [],
        
        industryData: workOrderData.industryData || {},
        
        createdAt: now,
        createdBy: this.currentUserId,
        lastModified: now,
        modifiedBy: this.currentUserId,
        
        organizationId: this.currentOrganizationId,
        industry: this.getCurrentIndustry(),
        isDeleted: false,
        isSynced: false,
        syncStatus: 'pending',
        version: 1,
        
        relatedWorkOrders: [],
        
        qualityChecked: false,
        followUpRequired: false,
        
        isRecurring: false,
        isEmergency: workOrderData.isEmergency || false
      };

      // Store in IndexedDB
      await this.storeInDatabase('work_orders', workOrder);
      
      // Update in-memory cache
      this.workOrders.set(workOrderId, workOrder);

      // Emit events
      this.emit('work_order_created', { workOrderId, workOrder });
      
      return workOrderId;
    } catch (error) {
      this.emit('work_order_creation_failed', { error: error.message, data: workOrderData });
      throw error;
    }
  }

  // Work order updates
  async updateWorkOrder(
    workOrderId: string, 
    updates: Partial<WorkOrderMetadata>,
    note?: string
  ): Promise<void> {
    if (!this.initialized) await this.initialize();

    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder || workOrder.isDeleted) {
      throw new Error('Work order not found');
    }

    const now = new Date();
    
    // Add update note if provided
    const updateNote: WorkOrderNote | undefined = note ? {
      id: this.generateId(),
      content: note,
      type: 'general',
      createdAt: now,
      createdBy: this.currentUserId,
      isPrivate: false,
      attachments: [],
      tags: ['update'],
      importance: 'medium'
    } : undefined;

    const updatedWorkOrder: WorkOrderMetadata = {
      ...workOrder,
      ...updates,
      lastModified: now,
      modifiedBy: this.currentUserId,
      version: workOrder.version + 1,
      isSynced: false,
      syncStatus: 'pending',
      notes: updateNote ? [...workOrder.notes, updateNote] : workOrder.notes
    };

    // Handle status changes
    if (updates.status && updates.status !== workOrder.status) {
      await this.handleStatusChange(updatedWorkOrder, workOrder.status, updates.status);
    }

    await this.storeInDatabase('work_orders', updatedWorkOrder);
    this.workOrders.set(workOrderId, updatedWorkOrder);

    this.emit('work_order_updated', { 
      workOrderId, 
      workOrder: updatedWorkOrder, 
      previousStatus: workOrder.status,
      updates 
    });
  }

  // Status management
  async updateStatus(workOrderId: string, newStatus: WorkOrderStatus, note?: string): Promise<void> {
    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder) {
      throw new Error('Work order not found');
    }

    const updates: Partial<WorkOrderMetadata> = { status: newStatus };
    const now = new Date();

    // Handle specific status transitions
    switch (newStatus) {
      case 'in_progress':
        if (!workOrder.actualStartTime) {
          updates.actualStartTime = now;
        }
        break;
      
      case 'completed':
        updates.actualEndTime = now;
        updates.completedAt = now;
        updates.completedBy = this.currentUserId;
        break;
      
      case 'cancelled':
        updates.actualEndTime = now;
        break;
    }

    await this.updateWorkOrder(workOrderId, updates, note);
  }

  private async handleStatusChange(
    workOrder: WorkOrderMetadata, 
    oldStatus: WorkOrderStatus, 
    newStatus: WorkOrderStatus
  ): Promise<void> {
    // Log status change
    const statusNote: WorkOrderNote = {
      id: this.generateId(),
      content: 'Status changed from ${oldStatus} to ${newStatus}',
      type: 'internal',
      createdAt: new Date(),
      createdBy: this.currentUserId,
      isPrivate: false,
      attachments: [],
      tags: ['status_change'],
      importance: 'medium'
    };

    workOrder.notes.push(statusNote);

    // Emit specific events
    this.emit('work_order_status_changed', {
      workOrderId: workOrder.id,
      oldStatus,
      newStatus,
      workOrder
    });

    // Handle completion
    if (newStatus === 'completed') {
      this.emit('work_order_completed', { workOrderId: workOrder.id, workOrder });
      
      // Handle recurring work orders
      if (workOrder.isRecurring && workOrder.recurringPattern) {
        await this.createRecurringInstance(workOrder);
      }
    }
  }

  // Search and filtering
  async searchWorkOrders(filter: WorkOrderFilter, options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'scheduledAt' | 'priority' | 'status' | 'number';
    sortOrder?: 'asc' | 'desc';
  }): Promise<WorkOrderSearchResult> {
    if (!this.initialized) await this.initialize();

    const { limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = options || {};

    // Filter work orders
    let workOrders = Array.from(this.workOrders.values()).filter(wo => {
      if (wo.isDeleted) return false;

      // Status filter
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(wo.status)) return false;
      }

      // Priority filter
      if (filter.priority) {
        const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
        if (!priorities.includes(wo.priority)) return false;
      }

      // Type filter
      if (filter.type) {
        const types = Array.isArray(filter.type) ? filter.type : [filter.type];
        if (!types.includes(wo.type)) return false;
      }

      // Technician filter
      if (filter.assignedTechnician && !wo.assignedTechnicians.includes(filter.assignedTechnician)) {
        return false;
      }

      // Customer filter
      if (filter.customerId && wo.customerId !== filter.customerId) return false;

      // Organization filter
      if (filter.organizationId && wo.organizationId !== filter.organizationId) return false;

      // Industry filter
      if (filter.industry && wo.industry !== filter.industry) return false;

      // Emergency filter
      if (filter.isEmergency !== undefined && wo.isEmergency !== filter.isEmergency) return false;

      // Recurring filter
      if (filter.isRecurring !== undefined && wo.isRecurring !== filter.isRecurring) return false;

      // Sync filter
      if (filter.isSynced !== undefined && wo.isSynced !== filter.isSynced) return false;

      // Date range filter
      if (filter.dateRange) {
        const field = filter.dateRange.field || 'createdAt';
        const date = wo[field];
        if (date && (date < filter.dateRange.start || date > filter.dateRange.end)) {
          return false;
        }
      }

      // Search query filter
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const searchableText = [
          wo.number,
          wo.title,
          wo.description,
          wo.customerName,
          wo.category,
          ...wo.notes.map(note => note.content)
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }

      // Location filter (simplified - would need proper geospatial calculations)
      if (filter.location && wo.serviceAddress.latitude && wo.serviceAddress.longitude) {
        const distance = this.calculateDistance(
          filter.location.latitude,
          filter.location.longitude,
          wo.serviceAddress.latitude,
          wo.serviceAddress.longitude
        );
        if (distance > filter.location.radius) return false;
      }

      return true;
    });

    // Sort work orders
    workOrders.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
        case 'scheduledAt':
          const dateA = a[sortBy]?.getTime() || 0;
          const dateB = b[sortBy]?.getTime() || 0;
          comparison = dateA - dateB;
          break;
        case 'priority':
          const priorityOrder = { emergency: 5, urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'number':
          comparison = a.number.localeCompare(b.number);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const totalCount = workOrders.length;
    const totalValue = workOrders.reduce((sum, wo) => sum + (wo.actualCost || wo.estimatedCost || 0), 0);

    // Calculate aggregations
    const statusCounts = workOrders.reduce((counts, wo) => {
      counts[wo.status] = (counts[wo.status] || 0) + 1;
      return counts;
    }, {} as Record<WorkOrderStatus, number>);

    const priorityCounts = workOrders.reduce((counts, wo) => {
      counts[wo.priority] = (counts[wo.priority] || 0) + 1;
      return counts;
    }, {} as Record<WorkOrderPriority, number>);

    const typeCounts = workOrders.reduce((counts, wo) => {
      counts[wo.type] = (counts[wo.type] || 0) + 1;
      return counts;
    }, {} as Record<WorkOrderType, number>);

    // Calculate average completion time
    const completedWorkOrders = workOrders.filter(wo => wo.completedAt && wo.actualStartTime);
    const averageCompletionTime = completedWorkOrders.length > 0
      ? completedWorkOrders.reduce((sum, wo) => {
          const duration = wo.completedAt!.getTime() - wo.actualStartTime!.getTime();
          return sum + duration;
        }, 0) / completedWorkOrders.length
      : undefined;

    // Apply pagination
    const paginatedWorkOrders = workOrders.slice(offset, offset + limit);

    return {
      workOrders: paginatedWorkOrders,
      totalCount,
      statusCounts,
      priorityCounts,
      typeCounts,
      totalValue,
      averageCompletionTime
    };
  }

  // Statistics and analytics
  async getStatistics(organizationId?: string): Promise<WorkOrderStats> {
    if (!this.initialized) await this.initialize();

    const workOrders = Array.from(this.workOrders.values()).filter(wo => {
      if (wo.isDeleted) return false;
      if (organizationId && wo.organizationId !== organizationId) return false;
      return true;
    });

    const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed');
    const pendingWorkOrders = workOrders.filter(wo => 
      ['draft', 'scheduled', 'dispatched', 'in_progress'].includes(wo.status)
    );
    const overdueWorkOrders = workOrders.filter(wo => 
      wo.scheduledAt && wo.scheduledAt < new Date() && wo.status !== 'completed'
    );
    const emergencyWorkOrders = workOrders.filter(wo => wo.isEmergency);

    // Calculate completion times
    const completionTimes = completedWorkOrders
      .filter(wo => wo.actualStartTime && wo.actualEndTime)
      .map(wo => wo.actualEndTime!.getTime() - wo.actualStartTime!.getTime());

    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    // Status breakdown
    const statusBreakdown = workOrders.reduce((counts, wo) => {
      counts[wo.status] = (counts[wo.status] || 0) + 1;
      return counts;
    }, {} as Record<WorkOrderStatus, number>);

    // Priority breakdown
    const priorityBreakdown = workOrders.reduce((counts, wo) => {
      counts[wo.priority] = (counts[wo.priority] || 0) + 1;
      return counts;
    }, {} as Record<WorkOrderPriority, number>);

    // Type breakdown
    const typeBreakdown = workOrders.reduce((counts, wo) => {
      counts[wo.type] = (counts[wo.type] || 0) + 1;
      return counts;
    }, {} as Record<WorkOrderType, number>);

    // Technician workload
    const technicianWorkload = workOrders.reduce((workload, wo) => {
      wo.assignedTechnicians.forEach(techId => {
        workload[techId] = (workload[techId] || 0) + 1;
      });
      return workload;
    }, {} as Record<string, number>);

    // Customer satisfaction
    const ratingsWorkOrders = workOrders.filter(wo => wo.customerRating !== undefined);
    const totalRatings = ratingsWorkOrders.length;
    const averageRating = totalRatings > 0
      ? ratingsWorkOrders.reduce((sum, wo) => sum + wo.customerRating!, 0) / totalRatings
      : 0;

    const ratingDistribution = ratingsWorkOrders.reduce((dist, wo) => {
      const rating = wo.customerRating!;
      dist[rating] = (dist[rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    // Performance metrics
    const scheduledWorkOrders = workOrders.filter(wo => wo.scheduledAt);
    const onTimeCompleted = completedWorkOrders.filter(wo => 
      wo.scheduledAt && wo.completedAt && wo.completedAt <= wo.scheduledAt
    );
    const onTimeCompletion = scheduledWorkOrders.length > 0
      ? (onTimeCompleted.length / scheduledWorkOrders.length) * 100
      : 0;

    // Calculate response times for emergency work orders
    const emergencyResponseTimes = emergencyWorkOrders
      .filter(wo => wo.actualStartTime && wo.createdAt)
      .map(wo => wo.actualStartTime!.getTime() - wo.createdAt.getTime());

    const averageResponseTime = emergencyResponseTimes.length > 0
      ? emergencyResponseTimes.reduce((sum, time) => sum + time, 0) / emergencyResponseTimes.length
      : 0;

    return {
      totalWorkOrders: workOrders.length,
      completedWorkOrders: completedWorkOrders.length,
      pendingWorkOrders: pendingWorkOrders.length,
      overdueWorkOrders: overdueWorkOrders.length,
      emergencyWorkOrders: emergencyWorkOrders.length,
      completionRate: workOrders.length > 0 ? (completedWorkOrders.length / workOrders.length) * 100 : 0,
      averageCompletionTime,
      totalRevenue: completedWorkOrders.reduce((sum, wo) => sum + (wo.actualCost || 0), 0),
      syncedCount: workOrders.filter(wo => wo.isSynced).length,
      unsyncedCount: workOrders.filter(wo => !wo.isSynced).length,
      statusBreakdown,
      priorityBreakdown,
      typeBreakdown,
      technicianWorkload,
      customerSatisfaction: {
        averageRating,
        totalRatings,
        ratingDistribution
      },
      performanceMetrics: {
        onTimeCompletion,
        firstTimeFixRate: 85, // Mock - would calculate based on callback data
        callbackRate: 8, // Mock - would calculate based on related work orders
        averageResponseTime: averageResponseTime / (1000 * 60) // Convert to minutes
      }
    };
  }

  // Add line items, materials, equipment
  async addLineItem(workOrderId: string, lineItem: Omit<WorkOrderLineItem, 'id'>): Promise<string> {
    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder) throw new Error('Work order not found');

    const itemId = this.generateId();
    const newLineItem: WorkOrderLineItem = { ...lineItem, id: itemId };
    
    const updatedLineItems = [...workOrder.lineItems, newLineItem];
    
    await this.updateWorkOrder(workOrderId, { 
      lineItems: updatedLineItems,
      estimatedCost: updatedLineItems.reduce((sum, item) => sum + item.totalPrice, 0)
    });

    return itemId;
  }

  async addMaterial(workOrderId: string, material: Omit<WorkOrderMaterial, 'id' | 'used'>): Promise<string> {
    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder) throw new Error('Work order not found');

    const materialId = this.generateId();
    const newMaterial: WorkOrderMaterial = { ...material, id: materialId, used: false };
    
    await this.updateWorkOrder(workOrderId, { 
      materials: [...workOrder.materials, newMaterial] 
    });

    return materialId;
  }

  async addEquipment(workOrderId: string, equipment: Omit<WorkOrderEquipment, 'id'>): Promise<string> {
    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder) throw new Error('Work order not found');

    const equipmentId = this.generateId();
    const newEquipment: WorkOrderEquipment = { 
      ...equipment, 
      id: equipmentId,
      condition: equipment.condition || 'good',
      maintenanceRequired: equipment.maintenanceRequired || false
    };
    
    await this.updateWorkOrder(workOrderId, { 
      equipment: [...workOrder.equipment, newEquipment] 
    });

    return equipmentId;
  }

  // Add notes and signatures
  async addNote(workOrderId: string, noteData: {
    content: string;
    type?: WorkOrderNote['type'];
    isPrivate?: boolean;
    importance?: WorkOrderNote['importance'];
    tags?: string[];
  }): Promise<string> {
    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder) throw new Error('Work order not found');

    const noteId = this.generateId();
    const note: WorkOrderNote = {
      id: noteId,
      content: noteData.content,
      type: noteData.type || 'general',
      createdAt: new Date(),
      createdBy: this.currentUserId,
      isPrivate: noteData.isPrivate || false,
      attachments: [],
      tags: noteData.tags || [],
      importance: noteData.importance || 'medium'
    };

    await this.updateWorkOrder(workOrderId, { 
      notes: [...workOrder.notes, note] 
    });

    this.emit('note_added', { workOrderId, noteId, note });
    return noteId;
  }

  async addSignature(workOrderId: string, signatureData: {
    type: WorkOrderSignature['type'];
    signedBy: string;
    signatureData: string;
    title?: string;
    purpose: string;
  }): Promise<string> {
    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder) throw new Error('Work order not found');

    const signatureId = this.generateId();
    const signature: WorkOrderSignature = {
      id: signatureId,
      ...signatureData,
      signedAt: new Date(),
      ipAddress: this.getClientIP(),
      deviceInfo: this.getDeviceInfo()
    };

    await this.updateWorkOrder(workOrderId, { 
      signatures: [...workOrder.signatures, signature] 
    });

    this.emit('signature_added', { workOrderId, signatureId, signature });
    return signatureId;
  }

  // Work order deletion and restoration
  async deleteWorkOrder(workOrderId: string, permanent = false): Promise<void> {
    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder) throw new Error('Work order not found');

    if (permanent) {
      await this.deleteFromDatabase('work_orders', workOrderId);
      this.workOrders.delete(workOrderId);
      this.emit('work_order_deleted_permanently', { workOrderId });
    } else {
      const deletedWorkOrder: WorkOrderMetadata = {
        ...workOrder,
        isDeleted: true,
        deletedAt: new Date(),
        lastModified: new Date(),
        modifiedBy: this.currentUserId,
        isSynced: false,
        syncStatus: 'pending'
      };

      await this.storeInDatabase('work_orders', deletedWorkOrder);
      this.workOrders.set(workOrderId, deletedWorkOrder);
      this.emit('work_order_deleted', { workOrderId });
    }
  }

  async restoreWorkOrder(workOrderId: string): Promise<void> {
    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder || !workOrder.isDeleted) {
      throw new Error('Work order not found or not deleted');
    }

    const restoredWorkOrder: WorkOrderMetadata = {
      ...workOrder,
      isDeleted: false,
      deletedAt: undefined,
      lastModified: new Date(),
      modifiedBy: this.currentUserId,
      isSynced: false,
      syncStatus: 'pending'
    };

    await this.storeInDatabase('work_orders', restoredWorkOrder);
    this.workOrders.set(workOrderId, restoredWorkOrder);
    this.emit('work_order_restored', { workOrderId });
  }

  // Recurring work orders
  private async createRecurringInstance(parentWorkOrder: WorkOrderMetadata): Promise<void> {
    if (!parentWorkOrder.recurringPattern) return;

    const pattern = parentWorkOrder.recurringPattern;
    const nextDate = this.calculateNextRecurringDate(parentWorkOrder.scheduledAt || new Date(), pattern);

    // Check if we should create the next instance
    if (pattern.endDate && nextDate > pattern.endDate) return;
    if (pattern.maxOccurrences) {
      // Would need to track occurrence count
      return;
    }

    // Create new work order instance
    const newWorkOrderData = {
      title: '${parentWorkOrder.title} (Recurring)',
      description: parentWorkOrder.description,
      customerName: parentWorkOrder.customerName,
      customerEmail: parentWorkOrder.customerEmail,
      customerPhone: parentWorkOrder.customerPhone,
      serviceAddress: parentWorkOrder.serviceAddress,
      scheduledAt: nextDate,
      assignedTechnicians: parentWorkOrder.assignedTechnicians,
      priority: parentWorkOrder.priority,
      type: parentWorkOrder.type,
      category: parentWorkOrder.category,
      lineItems: parentWorkOrder.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        category: item.category,
        taxable: item.taxable,
        taxRate: item.taxRate
      })),
      industryData: parentWorkOrder.industryData
    };

    await this.createWorkOrder(newWorkOrderData);
  }

  private calculateNextRecurringDate(baseDate: Date, pattern: RecurringPattern): Date {
    const nextDate = new Date(baseDate);
    
    switch (pattern.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + pattern.interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (pattern.interval * 7));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + pattern.interval);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + (pattern.interval * 3));
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        break;
    }

    return nextDate;
  }

  // Utility methods
  private async generateWorkOrderNumber(): Promise<string> {
    const industry = this.getCurrentIndustry();
    const prefix = industry.toUpperCase();
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const counterId = '${prefix}-${year}${month}';
    const counter = this.sequenceCounters.get(counterId) || 0;
    counter++;
    
    this.sequenceCounters.set(counterId, counter);
    await this.storeInDatabase('sequences', { id: counterId, value: counter });
    
    const sequence = counter.toString().padStart(4, '0');
    return '${prefix}-${year}${month}-${sequence}';
  }

  private async initializeSequenceCounters(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sequences'], 'readonly');
      const store = transaction.objectStore('sequences');
      const request = store.getAll();

      request.onsuccess = () => {
        const sequences = request.result || [];
        sequences.forEach((seq: unknown) => {
          this.sequenceCounters.set(seq.id, seq.value);
        });
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private generateId(): string {
    return 'wo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
  }

  private getCurrentIndustry(): 'hs' | 'rest' | 'auto' | 'ret' | 'courses' | 'payroll' {
    // Mock implementation - would get from context or URL
    return 'hs';
  }

  private getClientIP(): string {
    // Mock implementation - would get actual client IP
    return '127.0.0.1';
  }

  private getDeviceInfo(): string {
    return navigator.userAgent;
  }

  // Database operations
  private async storeInDatabase(storeName: string, data: unknown): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromDatabase(storeName: string, key: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async loadWorkOrdersFromStorage(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['work_orders'], 'readonly');
      const store = transaction.objectStore('work_orders');
      const request = store.getAll();

      request.onsuccess = () => {
        const workOrders: WorkOrderMetadata[] = request.result || [];
        workOrders.forEach(wo => {
          // Convert date strings back to Date objects
          wo.createdAt = new Date(wo.createdAt);
          wo.lastModified = new Date(wo.lastModified);
          if (wo.scheduledAt) wo.scheduledAt = new Date(wo.scheduledAt);
          if (wo.actualStartTime) wo.actualStartTime = new Date(wo.actualStartTime);
          if (wo.actualEndTime) wo.actualEndTime = new Date(wo.actualEndTime);
          if (wo.completedAt) wo.completedAt = new Date(wo.completedAt);
          if (wo.deletedAt) wo.deletedAt = new Date(wo.deletedAt);
          if (wo.syncedAt) wo.syncedAt = new Date(wo.syncedAt);
          if (wo.lastSyncAttempt) wo.lastSyncAttempt = new Date(wo.lastSyncAttempt);
          
          // Convert note dates
          wo.notes.forEach(note => {
            note.createdAt = new Date(note.createdAt);
          });
          
          // Convert signature dates
          wo.signatures.forEach(sig => {
            sig.signedAt = new Date(sig.signedAt);
          });
          
          this.workOrders.set(wo.id, wo);
        });
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async loadTemplatesFromStorage(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['templates'], 'readonly');
      const store = transaction.objectStore('templates');
      const request = store.getAll();

      request.onsuccess = () => {
        const templates: WorkOrderTemplate[] = request.result || [];
        templates.forEach(template => {
          template.createdAt = new Date(template.createdAt);
          template.updatedAt = new Date(template.updatedAt);
          this.templates.set(template.id, template);
        });
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Sync operations
  async markForSync(workOrderIds: string[]): Promise<void> {
    for (const workOrderId of workOrderIds) {
      const workOrder = this.workOrders.get(workOrderId);
      if (workOrder && !workOrder.isDeleted) {
        workOrder.syncStatus = 'pending';
        workOrder.isSynced = false;
        await this.storeInDatabase('work_orders', workOrder);
        this.emit('sync_queued', { workOrderId });
      }
    }
  }

  async getPendingSyncWorkOrders(): Promise<WorkOrderMetadata[]> {
    return Array.from(this.workOrders.values()).filter(wo => 
      !wo.isDeleted && wo.syncStatus === 'pending'
    );
  }

  // Public API methods
  getWorkOrder(workOrderId: string): WorkOrderMetadata | null {
    const workOrder = this.workOrders.get(workOrderId);
    return workOrder && !workOrder.isDeleted ? workOrder : null;
  }

  getWorkOrdersByCustomer(customerId: string): WorkOrderMetadata[] {
    return Array.from(this.workOrders.values()).filter(wo => 
      wo.customerId === customerId && !wo.isDeleted
    );
  }

  getWorkOrdersByTechnician(technicianId: string): WorkOrderMetadata[] {
    return Array.from(this.workOrders.values()).filter(wo => 
      wo.assignedTechnicians.includes(technicianId) && !wo.isDeleted
    );
  }

  getWorkOrdersByStatus(status: WorkOrderStatus): WorkOrderMetadata[] {
    return Array.from(this.workOrders.values()).filter(wo => 
      wo.status === status && !wo.isDeleted
    );
  }

  async createTemplate(templateData: Omit<WorkOrderTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const templateId = this.generateId();
    const now = new Date();
    
    const template: WorkOrderTemplate = {
      ...templateData,
      id: templateId,
      createdAt: now,
      updatedAt: now
    };

    await this.storeInDatabase('templates', template);
    this.templates.set(templateId, template);

    this.emit('template_created', { templateId, template });
    return templateId;
  }

  getTemplates(): WorkOrderTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }
}

// Factory function
export function createWorkOrderManager(): OfflineWorkOrderManager {
  return OfflineWorkOrderManager.getInstance();
}

// React hook
export function useOfflineWorkOrders() {
  const manager = OfflineWorkOrderManager.getInstance();
  
  return {
    // Work order management
    createWorkOrder: manager.createWorkOrder.bind(manager),
    updateWorkOrder: manager.updateWorkOrder.bind(manager),
    updateStatus: manager.updateStatus.bind(manager),
    deleteWorkOrder: manager.deleteWorkOrder.bind(manager),
    restoreWorkOrder: manager.restoreWorkOrder.bind(manager),
    
    // Data retrieval
    getWorkOrder: manager.getWorkOrder.bind(manager),
    searchWorkOrders: manager.searchWorkOrders.bind(manager),
    getStatistics: manager.getStatistics.bind(manager),
    getWorkOrdersByCustomer: manager.getWorkOrdersByCustomer.bind(manager),
    getWorkOrdersByTechnician: manager.getWorkOrdersByTechnician.bind(manager),
    getWorkOrdersByStatus: manager.getWorkOrdersByStatus.bind(manager),
    
    // Line items and materials
    addLineItem: manager.addLineItem.bind(manager),
    addMaterial: manager.addMaterial.bind(manager),
    addEquipment: manager.addEquipment.bind(manager),
    
    // Notes and signatures
    addNote: manager.addNote.bind(manager),
    addSignature: manager.addSignature.bind(manager),
    
    // Templates
    createTemplate: manager.createTemplate.bind(manager),
    getTemplates: manager.getTemplates.bind(manager),
    
    // Sync operations
    markForSync: manager.markForSync.bind(manager),
    getPendingSyncWorkOrders: manager.getPendingSyncWorkOrders.bind(manager),
    
    // Events
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}