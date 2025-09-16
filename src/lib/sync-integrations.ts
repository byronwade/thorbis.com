// Integration layer for connecting background sync with existing business systems
// Provides unified sync coordination across payments, inventory, customers, and other operations

import { BackgroundSyncManager } from './background-sync-manager';
import { OfflineInventoryManager } from './offline-inventory-manager';
import { OfflineCustomerManager } from './offline-customer-manager';
import { PaymentTokenizationService } from './payment-tokenization';
import { OfflineDocumentManager } from './offline-document-manager';
import { OfflineWorkOrderManager } from './offline-work-order-manager';
import { OfflineAppointmentManager } from './offline-appointment-manager';
import { OfflineCommunicationManager } from './offline-communication-manager';
import { OfflineMediaManager } from './offline-media-manager';
import { OfflineGPSManager } from './offline-gps-manager';
import { OfflineSignatureManager } from './offline-signature-manager';

interface SyncIntegrationConfig {
  autoSync: boolean;
  batchSize: number;
  syncInterval: number; // milliseconds
  priorityMapping: Record<string, 'critical' | 'high' | 'normal' | 'low'>;
  retryConfig: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };
}

export class SyncIntegrationManager {
  private static instance: SyncIntegrationManager | null = null;
  
  private backgroundSync: BackgroundSyncManager;
  private inventoryManager: OfflineInventoryManager;
  private customerManager: OfflineCustomerManager;
  private paymentTokenizer: PaymentTokenizationService;
  private documentManager: OfflineDocumentManager;
  private workOrderManager: OfflineWorkOrderManager;
  private appointmentManager: OfflineAppointmentManager;
  private communicationManager: OfflineCommunicationManager;
  private mediaManager: OfflineMediaManager;
  private gpsManager: OfflineGPSManager;
  private signatureManager: OfflineSignatureManager;
  
  private config: SyncIntegrationConfig;
  private eventListeners: Map<string, Function[]> = new Map();
  private integrationTimers: Map<string, NodeJS.Timeout> = new Map();
  private initialized = false;

  private constructor(config?: Partial<SyncIntegrationConfig>) {
    this.config = {
      autoSync: true,
      batchSize: 10,
      syncInterval: 30000, // 30 seconds
      priorityMapping: {
        payment_transaction: 'critical',
        payment_refund: 'critical',
        inventory_sale: 'high',
        inventory_adjustment: 'high',
        customer_create: 'normal',
        customer_update: 'normal',
        work_order_create: 'high',
        work_order_update: 'normal',
        appointment_create: 'normal',
        message_send: 'normal',
        call_initiate: 'high',
        call_emergency: 'critical',
        document_upload: 'low',
        media_upload: 'normal',
        media_batch_upload: 'high',
        media_compress: 'low',
        gps_tracking_start: 'normal',
        gps_location_update: 'low',
        gps_route_create: 'normal',
        gps_route_optimize: 'low',
        gps_geofence_alert: 'high',
        gps_emergency_location: 'critical',
        signature_capture: 'high',
        signature_validate: 'normal',
        form_submit: 'normal',
        form_create: 'low',
        signature_witness: 'high',
        signature_biometric: 'normal',
        analytics_event: 'low'
      },
      retryConfig: {
        maxRetries: 5,
        baseDelay: 1000,
        maxDelay: 30000
      },
      ...config
    };

    this.backgroundSync = BackgroundSyncManager.getInstance();
    this.inventoryManager = OfflineInventoryManager.getInstance();
    this.customerManager = OfflineCustomerManager.getInstance();
    this.paymentTokenizer = PaymentTokenizationService.getInstance();
    this.documentManager = OfflineDocumentManager.getInstance();
    this.workOrderManager = OfflineWorkOrderManager.getInstance();
    this.appointmentManager = OfflineAppointmentManager.getInstance();
    this.communicationManager = OfflineCommunicationManager.getInstance();
    this.mediaManager = OfflineMediaManager.getInstance();
    this.gpsManager = OfflineGPSManager.getInstance();
    this.signatureManager = OfflineSignatureManager.getInstance();

    this.initialize();
  }

  static getInstance(config?: Partial<SyncIntegrationConfig>): SyncIntegrationManager {
    if (!SyncIntegrationManager.instance) {
      SyncIntegrationManager.instance = new SyncIntegrationManager(config);
    }
    return SyncIntegrationManager.instance;
  }

  // Initialize integrations with all systems
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.setupInventoryIntegration();
      await this.setupCustomerIntegration();
      await this.setupPaymentIntegration();
      await this.setupDocumentIntegration();
      await this.setupWorkOrderIntegration();
      await this.setupAppointmentIntegration();
      await this.setupCommunicationIntegration();
      await this.setupMediaIntegration();
      await this.setupGPSIntegration();
      await this.setupSignatureIntegration();
      await this.setupAnalyticsIntegration();

      if (this.config.autoSync) {
        this.startAutoSync();
      }

      this.initialized = true;
      this.emit('integration_initialized');
    } catch (error) {
      console.error('Failed to initialize sync integrations:', error);
      throw new Error('Sync integration initialization failed');
    }
  }

  // Inventory System Integration

  private async setupInventoryIntegration(): Promise<void> {
    // Listen to inventory events and queue sync operations
    this.inventoryManager.on('item_added', (item: unknown) => {
      this.queueInventorySync('item_create', item, 'high');
    });

    this.inventoryManager.on('item_updated', (item: unknown) => {
      this.queueInventorySync('item_update', item, 'normal');
    });

    this.inventoryManager.on('stock_adjusted', (data: unknown) => {
      this.queueInventorySync('stock_adjustment', data, 'high');
    });

    this.inventoryManager.on('sale_recorded', (data: unknown) => {
      this.queueInventorySync('sale', data, 'critical');
    });

    this.inventoryManager.on('purchase_recorded', (data: unknown) => {
      this.queueInventorySync('purchase', data, 'high');
    });
  }

  private async queueInventorySync(
    subType: string, data: unknown, 
    priority: 'critical' | 'high' | 'normal' | 'low'
  ): Promise<void> {
    await this.backgroundSync.queueOperation({
      type: 'inventory',
      subType,
      priority,
      data,
      maxRetries: this.config.retryConfig.maxRetries,
      organizationId: data.organizationId || 'default',
      syncStrategy: priority === 'critical' ? 'immediate' : 'background',
      estimatedTime: this.getEstimatedTime('inventory', subType)
    });
  }

  // Customer System Integration

  private async setupCustomerIntegration(): Promise<void> {
    this.customerManager.on('customer_created', (customer: unknown) => {
      this.queueCustomerSync('profile_create', customer, 'normal');
    });

    this.customerManager.on('customer_updated', (customer: unknown) => {
      this.queueCustomerSync('profile_update', customer, 'normal');
    });

    this.customerManager.on('interaction_recorded', (interaction: unknown) => {
      this.queueCustomerSync('interaction', interaction, 'low');
    });

    this.customerManager.on('address_updated', (data: unknown) => {
      this.queueCustomerSync('address_update', data, 'normal');
    });
  }

  private async queueCustomerSync(
    subType: string, data: unknown,
    priority: 'critical' | 'high' | 'normal' | 'low'
  ): Promise<void> {
    await this.backgroundSync.queueOperation({
      type: 'customer',
      subType,
      priority,
      data,
      maxRetries: this.config.retryConfig.maxRetries,
      organizationId: data.organizationId || 'default',
      syncStrategy: 'background',
      estimatedTime: this.getEstimatedTime('customer', subType)
    });
  }

  // Payment System Integration

  private async setupPaymentIntegration(): Promise<void> {
    this.paymentTokenizer.on('payment_method_tokenized', (data: unknown) => {
      this.queuePaymentSync('token_create', data, 'critical');
    });

    this.paymentTokenizer.on('token_deactivated', (data: unknown) => {
      this.queuePaymentSync('token_deactivate', data, 'high');
    });

    this.paymentTokenizer.on('payment_method_detokenized', (data: unknown) => {
      this.queuePaymentSync('token_usage', data, 'high');
    });
  }

  private async queuePaymentSync(
    subType: string, data: unknown,
    priority: 'critical' | 'high' | 'normal' | 'low'
  ): Promise<void> {
    await this.backgroundSync.queueOperation({
      type: 'payment',
      subType,
      priority,
      data,
      maxRetries: this.config.retryConfig.maxRetries,
      organizationId: data.organizationId || 'default',
      syncStrategy: priority === 'critical' ? 'immediate' : 'background',
      estimatedTime: this.getEstimatedTime('payment', subType)
    });
  }

  // Work Order System Integration

  private async setupWorkOrderIntegration(): Promise<void> {
    // Listen to work order events and queue sync operations
    this.workOrderManager.on('work_order_created', (data: unknown) => {
      this.queueWorkOrderSync('create', data.workOrder, 'high');
    });

    this.workOrderManager.on('work_order_updated', (data: unknown) => {
      this.queueWorkOrderSync('update', data.workOrder, 'normal');
    });

    this.workOrderManager.on('status_changed', (data: unknown) => {
      this.queueWorkOrderSync('status_update', {
        workOrderId: data.workOrderId,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        note: data.note
      }, data.newStatus === 'emergency' ? 'critical' : 'high');
    });

    this.workOrderManager.on('work_order_deleted', (data: unknown) => {
      this.queueWorkOrderSync('delete', { workOrderId: data.workOrderId }, 'low');
    });

    this.workOrderManager.on('line_item_added', (data: unknown) => {
      this.queueWorkOrderSync('line_item_update', data, 'normal');
    });

    this.workOrderManager.on('signature_captured', (data: unknown) => {
      this.queueWorkOrderSync('signature_update', data, 'high');
    });

    // Set up periodic sync for work orders
    const workOrderTimer = setInterval(async () => {
      await this.syncPendingWorkOrders();
    }, this.config.syncInterval);

    this.integrationTimers.set('work_orders', workOrderTimer);
  }

  private async queueWorkOrderSync(
    subType: string, data: unknown,
    priority: 'critical' | 'high' | 'normal' | 'low'
  ): Promise<void> {
    await this.backgroundSync.queueOperation({
      type: 'work_order',
      subType,
      priority,
      data,
      maxRetries: this.config.retryConfig.maxRetries,
      organizationId: data.organizationId || 'default',
      syncStrategy: priority === 'critical' ? 'immediate' : 'background',
      estimatedTime: this.getEstimatedTime('work_order', subType)
    });
  }

  private async syncPendingWorkOrders(): Promise<void> {
    try {
      // Get pending work orders from work order manager
      const pendingWorkOrders = await this.workOrderManager.getPendingSyncWorkOrders();

      for (const workOrder of pendingWorkOrders) {
        await this.backgroundSync.queueOperation({
          type: 'work_order',
          subType: 'sync',
          priority: this.getPriority(workOrder.priority),
          data: workOrder,
          maxRetries: this.config.retryConfig.maxRetries,
          organizationId: workOrder.organizationId,
          syncStrategy: 'background',
          estimatedTime: this.getEstimatedTime('work_order', 'sync')
        });
      }
    } catch (error) {
      console.error('Failed to sync pending work orders:', error);
    }
  }

  // Appointment System Integration

  private async setupAppointmentIntegration(): Promise<void> {
    // Listen to appointment events and queue sync operations
    this.appointmentManager.on('appointment_created', (data: unknown) => {
      this.queueAppointmentSync('create', data.appointment, 'normal');
    });

    this.appointmentManager.on('appointment_updated', (data: unknown) => {
      this.queueAppointmentSync('update', data.appointment, 'normal');
    });

    this.appointmentManager.on('status_changed', (data: unknown) => {
      this.queueAppointmentSync('status_update', {
        appointmentId: data.appointmentId,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        note: data.note
      }, data.newStatus === 'emergency' ? 'critical' : 'normal');
    });

    this.appointmentManager.on('appointment_deleted', (data: unknown) => {
      this.queueAppointmentSync('delete', { appointmentId: data.appointmentId }, 'low');
    });

    this.appointmentManager.on('recurring_appointments_created', (data: unknown) => {
      this.queueAppointmentSync('recurring_create', data, 'normal');
    });

    this.appointmentManager.on('calendar_sync_completed', (data: unknown) => {
      this.queueAppointmentSync('calendar_sync', data, 'low');
    });

    this.appointmentManager.on('calendar_sync_failed', (data: unknown) => {
      this.queueAppointmentSync('calendar_sync_failed', data, 'high');
    });

    // Set up periodic sync for appointments
    const appointmentTimer = setInterval(async () => {
      await this.syncPendingAppointments();
    }, this.config.syncInterval * 2); // Less frequent for appointments

    this.integrationTimers.set('appointments', appointmentTimer);
  }

  private async queueAppointmentSync(
    subType: string, data: unknown,
    priority: 'critical' | 'high' | 'normal' | 'low'
  ): Promise<void> {
    await this.backgroundSync.queueOperation({
      type: 'appointment',
      subType,
      priority,
      data,
      maxRetries: this.config.retryConfig.maxRetries,
      organizationId: data.organizationId || 'default',
      syncStrategy: priority === 'critical' ? 'immediate' : 'background',
      estimatedTime: this.getEstimatedTime('appointment', subType)
    });
  }

  private async syncPendingAppointments(): Promise<void> {
    try {
      // Get pending appointments from appointment manager
      const pendingAppointments = await this.appointmentManager.getPendingSyncAppointments();

      for (const appointment of pendingAppointments) {
        await this.backgroundSync.queueOperation({
          type: 'appointment',
          subType: 'sync',
          priority: this.getAppointmentPriority(appointment),
          data: appointment,
          maxRetries: this.config.retryConfig.maxRetries,
          organizationId: appointment.organizationId,
          syncStrategy: 'background',
          estimatedTime: this.getEstimatedTime('appointment', 'sync')
        });
      }
    } catch (error) {
      console.error('Failed to sync pending appointments:', error);
    }
  }

  // Document System Integration

  private async setupDocumentIntegration(): Promise<void> {
    // Listen to document events and queue sync operations
    this.documentManager.on('document_uploaded', (data: unknown) => {
      this.queueDocumentSync('upload', data.metadata, 'normal');
    });

    this.documentManager.on('document_updated', (data: unknown) => {
      this.queueDocumentSync('update', data.metadata, data.hasNewContent ? 'normal' : 'low');
    });

    this.documentManager.on('document_deleted', (data: unknown) => {
      this.queueDocumentSync('delete', { documentId: data.documentId }, 'low');
    });

    this.documentManager.on('document_restored', (data: unknown) => {
      this.queueDocumentSync('restore', { documentId: data.documentId }, 'normal');
    });

    // Set up periodic sync for pending documents
    const documentTimer = setInterval(async () => {
      await this.syncPendingDocuments();
    }, this.config.syncInterval * 3); // Less frequent for documents

    this.integrationTimers.set('documents', documentTimer);
  }

  private async queueDocumentSync(
    subType: string, data: unknown,
    priority: 'critical' | 'high' | 'normal' | 'low'
  ): Promise<void> {
    await this.backgroundSync.queueOperation({
      type: 'document',
      subType,
      priority,
      data,
      maxRetries: this.config.retryConfig.maxRetries,
      organizationId: data.organizationId || 'default',
      syncStrategy: priority === 'critical' ? 'immediate' : 'background',
      estimatedTime: this.getEstimatedTime('document', subType)
    });
  }

  private async syncPendingDocuments(): Promise<void> {
    try {
      const pendingDocuments = await this.documentManager.getPendingSyncDocuments();

      for (const document of pendingDocuments) {
        await this.backgroundSync.queueOperation({
          type: 'document',
          subType: 'sync',
          priority: 'low',
          data: document,
          maxRetries: this.config.retryConfig.maxRetries,
          organizationId: document.organizationId,
          syncStrategy: 'background',
          estimatedTime: this.getEstimatedTime('document', 'sync')
        });
      }
    } catch (error) {
      console.error('Failed to sync pending documents:', error);
    }
  }

  // Media System Integration

  private async setupMediaIntegration(): Promise<void> {
    // Listen to media events and queue sync operations
    this.mediaManager.on('file_uploaded', (data: unknown) => {
      this.queueMediaSync('upload', data.metadata, 'normal');
    });

    this.mediaManager.on('batch_uploaded', (data: unknown) => {
      this.queueMediaSync('batch_upload', data.batch, 'high');
    });

    this.mediaManager.on('media_updated', (data: unknown) => {
      this.queueMediaSync('update', data.metadata, 'low');
    });

    this.mediaManager.on('media_deleted', (data: unknown) => {
      this.queueMediaSync('delete', { mediaId: data.mediaId }, 'low');
    });

    this.mediaManager.on('media_compressed', (data: unknown) => {
      this.queueMediaSync('compress', data.metadata, 'low');
    });

    this.mediaManager.on('thumbnail_generated', (data: unknown) => {
      this.queueMediaSync('thumbnail', data.metadata, 'low');
    });

    this.mediaManager.on('preview_generated', (data: unknown) => {
      this.queueMediaSync('preview', data.metadata, 'low');
    });

    this.mediaManager.on('batch_progress', (data: unknown) => {
      // Progress events don't need sync, just real-time updates
      this.emit('media_batch_progress', data);
    });

    this.mediaManager.on('batch_completed', (data: unknown) => {
      this.queueMediaSync('batch_complete', data.batch, 'normal');
    });

    this.mediaManager.on('batch_failed', (data: unknown) => {
      this.queueMediaSync('batch_failed', data.batch, 'high');
    });

    this.mediaManager.on('sync_required', (data: unknown) => {
      this.queueMediaSync('sync_required', data, 'high');
    });

    // Set up periodic sync for pending media
    const mediaTimer = setInterval(async () => {
      await this.syncPendingMedia();
    }, this.config.syncInterval * 2); // Less frequent for media

    this.integrationTimers.set('media', mediaTimer);
  }

  private async queueMediaSync(
    subType: string, data: unknown,
    priority: 'critical' | 'high' | 'normal' | 'low'
  ): Promise<void> {
    await this.backgroundSync.queueOperation({
      type: 'media',
      subType,
      priority,
      data,
      maxRetries: this.config.retryConfig.maxRetries,
      organizationId: data.organizationId || 'default',
      syncStrategy: priority === 'critical' ? 'immediate' : 'background',
      estimatedTime: this.getEstimatedTime('media', subType)
    });
  }

  private async syncPendingMedia(): Promise<void> {
    try {
      // Get pending media from media manager
      const pendingMedia = await this.mediaManager.getPendingSyncMedia();

      for (const media of pendingMedia) {
        await this.backgroundSync.queueOperation({
          type: 'media',
          subType: 'sync',
          priority: this.getMediaPriority(media),
          data: media,
          maxRetries: this.config.retryConfig.maxRetries,
          organizationId: media.organizationId,
          syncStrategy: 'background',
          estimatedTime: this.getEstimatedTime('media', 'sync')
        });
      }
    } catch (error) {
      console.error('Failed to sync pending media:', error);
    }
  }

  private getMediaPriority(media: unknown): 'critical' | 'high' | 'normal' | 'low' {
    // Priority based on media category and urgency
    if (media.category === 'customer_signature' || media.category === 'emergency_photo') {
      return 'critical';
    }
    
    if (media.category === 'work_order_photo' || media.category === 'before_after') {
      return 'high';
    }
    
    // Check file size - larger files get lower priority
    if (media.size > 50 * 1024 * 1024) { // 50MB
      return 'low';
    }
    
    // Check file age - newer files get higher priority
    const ageInHours = (Date.now() - new Date(media.capturedAt).getTime()) / (1000 * 60 * 60);
    if (ageInHours < 1) return 'high';
    if (ageInHours < 24) return 'normal';
    
    return 'low';
  }

  // GPS System Integration

  private async setupGPSIntegration(): Promise<void> {
    // Listen to GPS events and queue sync operations
    this.gpsManager.on('tracking_started', (data: unknown) => {
      this.queueGPSSync('tracking_start', data.session, 'normal');
    });

    this.gpsManager.on('tracking_stopped', (data: unknown) => {
      this.queueGPSSync('tracking_stop', data.session, 'normal');
    });

    this.gpsManager.on('location_updated', (data: unknown) => {
      // Only sync location updates periodically to avoid spam
      if (data.location.accuracy <= 20) { // High accuracy locations
        this.queueGPSSync('location_update', data.location, 'low');
      }
    });

    this.gpsManager.on('route_created', (data: unknown) => {
      this.queueGPSSync('route_create', data.route, 'normal');
    });

    this.gpsManager.on('route_updated', (data: unknown) => {
      this.queueGPSSync('route_update', data.route, 'normal');
    });

    this.gpsManager.on('route_optimized', (data: unknown) => {
      this.queueGPSSync('route_optimize', data.route, 'low');
    });

    this.gpsManager.on('route_started', (data: unknown) => {
      this.queueGPSSync('route_start', data.route, 'high');
    });

    this.gpsManager.on('route_completed', (data: unknown) => {
      this.queueGPSSync('route_complete', data.route, 'high');
    });

    this.gpsManager.on('waypoint_reached', (data: unknown) => {
      this.queueGPSSync('waypoint_reached', data, 'normal');
    });

    this.gpsManager.on('geofence_entered', (data: unknown) => {
      this.queueGPSSync('geofence_enter', data, 'high');
    });

    this.gpsManager.on('geofence_exited', (data: unknown) => {
      this.queueGPSSync('geofence_exit', data, 'high');
    });

    this.gpsManager.on('emergency_alert', (data: unknown) => {
      this.queueGPSSync('emergency_alert', data, 'critical');
    });

    this.gpsManager.on('statistics_updated', (data: unknown) => {
      this.queueGPSSync('statistics_update', data.statistics, 'low');
    });

    this.gpsManager.on('sync_required', (data: unknown) => {
      this.queueGPSSync('sync_required', data, 'high');
    });

    // Set up periodic sync for GPS data
    const gpsTimer = setInterval(async () => {
      await this.syncPendingGPS();
    }, this.config.syncInterval * 2); // Less frequent for GPS

    this.integrationTimers.set('gps', gpsTimer);
  }

  private async queueGPSSync(
    subType: string, data: unknown,
    priority: 'critical' | 'high' | 'normal' | 'low'
  ): Promise<void> {
    await this.backgroundSync.queueOperation({
      type: 'gps',
      subType,
      priority,
      data,
      maxRetries: this.config.retryConfig.maxRetries,
      organizationId: data.organizationId || 'default',
      syncStrategy: priority === 'critical' ? 'immediate' : 'background',
      estimatedTime: this.getEstimatedTime('gps', subType)
    });
  }

  private async syncPendingGPS(): Promise<void> {
    try {
      // Get pending GPS data from GPS manager
      const pendingGPS = await this.gpsManager.getPendingSyncData();

      for (const gpsData of pendingGPS) {
        await this.backgroundSync.queueOperation({
          type: 'gps',
          subType: 'sync',
          priority: this.getGPSPriority(gpsData),
          data: gpsData,
          maxRetries: this.config.retryConfig.maxRetries,
          organizationId: gpsData.organizationId,
          syncStrategy: 'background',
          estimatedTime: this.getEstimatedTime('gps', 'sync')
        });
      }
    } catch (error) {
      console.error('Failed to sync pending GPS data:', error);
    }
  }

  private getGPSPriority(gpsData: unknown): 'critical' | 'high' | 'normal' | 'low' {
    // Priority based on GPS data type and urgency
    if (gpsData.type === 'emergency_alert' || gpsData.priority === 'emergency') {
      return 'critical';
    }
    
    if (gpsData.type === 'geofence_alert' || gpsData.type === 'route_deviation') {
      return 'high';
    }
    
    if (gpsData.type === 'route_start' || gpsData.type === 'route_complete') {
      return 'high';
    }
    
    // Check data age - newer data gets higher priority
    if (gpsData.timestamp) {
      const ageInMinutes = (Date.now() - new Date(gpsData.timestamp).getTime()) / (1000 * 60);
      if (ageInMinutes < 5) return 'high';
      if (ageInMinutes < 30) return 'normal';
    }
    
    return 'low';
  }

  // Signature System Integration

  private async setupSignatureIntegration(): Promise<void> {
    // Listen to signature events and queue sync operations
    this.signatureManager.on('signature_captured', (data: unknown) => {
      this.queueSignatureSync('capture', data.signature, 'high');
    });

    this.signatureManager.on('signature_validated', (data: unknown) => {
      this.queueSignatureSync('validate', data.signature, 'normal');
    });

    this.signatureManager.on('form_created', (data: unknown) => {
      this.queueSignatureSync('form_create', data.form, 'low');
    });

    this.signatureManager.on('form_updated', (data: unknown) => {
      this.queueSignatureSync('form_update', data.form, 'normal');
    });

    this.signatureManager.on('form_submitted', (data: unknown) => {
      this.queueSignatureSync('form_submit', data.submission, 'normal');
    });

    this.signatureManager.on('signature_deleted', (data: unknown) => {
      this.queueSignatureSync('signature_delete', { signatureId: data.signatureId }, 'low');
    });

    this.signatureManager.on('form_deleted', (data: unknown) => {
      this.queueSignatureSync('form_delete', { formId: data.formId }, 'low');
    });

    this.signatureManager.on('signature_quality_analyzed', (data: unknown) => {
      this.queueSignatureSync('quality_analysis', data.analysis, 'low');
    });

    this.signatureManager.on('biometric_validation_completed', (data: unknown) => {
      this.queueSignatureSync('biometric_validation', data.validation, 'normal');
    });

    this.signatureManager.on('witness_signature_required', (data: unknown) => {
      this.queueSignatureSync('witness_required', data, 'high');
    });

    this.signatureManager.on('legal_compliance_check', (data: unknown) => {
      this.queueSignatureSync('compliance_check', data, 'high');
    });

    this.signatureManager.on('sync_required', (data: unknown) => {
      this.queueSignatureSync('sync_required', data, 'high');
    });

    // Set up periodic sync for signatures and forms
    const signatureTimer = setInterval(async () => {
      await this.syncPendingSignatures();
    }, this.config.syncInterval * 2); // Less frequent for signatures

    this.integrationTimers.set('signatures', signatureTimer);
  }

  private async queueSignatureSync(
    subType: string, data: unknown,
    priority: 'critical' | 'high' | 'normal' | 'low'
  ): Promise<void> {
    await this.backgroundSync.queueOperation({
      type: 'signature',
      subType,
      priority,
      data,
      maxRetries: this.config.retryConfig.maxRetries,
      organizationId: data.organizationId || 'default',
      syncStrategy: priority === 'critical' ? 'immediate' : 'background',
      estimatedTime: this.getEstimatedTime('signature', subType)
    });
  }

  private async syncPendingSignatures(): Promise<void> {
    try {
      // Get pending signatures from signature manager
      const pendingSignatures = await this.signatureManager.getPendingSyncSignatures();
      const pendingSubmissions = await this.signatureManager.getPendingSyncSubmissions();

      // Sync signatures
      for (const signature of pendingSignatures) {
        await this.backgroundSync.queueOperation({
          type: 'signature',
          subType: 'sync',
          priority: this.getSignaturePriority(signature),
          data: signature,
          maxRetries: this.config.retryConfig.maxRetries,
          organizationId: signature.organizationId,
          syncStrategy: 'background',
          estimatedTime: this.getEstimatedTime('signature', 'sync')
        });
      }

      // Sync form submissions
      for (const submission of pendingSubmissions) {
        await this.backgroundSync.queueOperation({
          type: 'signature',
          subType: 'submission_sync',
          priority: this.getSubmissionPriority(submission),
          data: submission,
          maxRetries: this.config.retryConfig.maxRetries,
          organizationId: submission.organizationId,
          syncStrategy: 'background',
          estimatedTime: this.getEstimatedTime('signature', 'submission_sync')
        });
      }
    } catch (error) {
      console.error('Failed to sync pending signatures:', error);
    }
  }

  private getSignaturePriority(signature: unknown): 'critical' | 'high' | 'normal' | 'low' {
    // Priority based on signature purpose and validation status
    if (signature.metadata?.purpose === 'authorization' || signature.metadata?.purpose === 'contract') {
      return 'critical';
    }
    
    if (signature.metadata?.requiresWitness || signature.validation?.isValid === false) {
      return 'high';
    }
    
    if (signature.status === 'validated' && signature.quality?.complexity === 'high') {
      return 'high';
    }
    
    // Check signature age - newer signatures get higher priority
    if (signature.timestamp) {
      const ageInMinutes = (Date.now() - new Date(signature.timestamp).getTime()) / (1000 * 60);
      if (ageInMinutes < 15) return 'high';
      if (ageInMinutes < 60) return 'normal';
    }
    
    return 'low';
  }

  private getSubmissionPriority(submission: unknown): 'critical' | 'high' | 'normal' | 'low' {
    // Priority based on submission status and form type
    if (submission.status === 'processing' || submission.workflow?.approvals?.length > 0) {
      return 'high';
    }
    
    if (submission.signatures?.some((sig: unknown) => sig.metadata?.purpose === 'authorization')) {
      return 'critical';
    }
    
    if (submission.status === 'submitted' && submission.signatures?.length > 0) {
      return 'high';
    }
    
    // Check submission age
    if (submission.submittedAt) {
      const ageInMinutes = (Date.now() - new Date(submission.submittedAt).getTime()) / (1000 * 60);
      if (ageInMinutes < 30) return 'high';
      if (ageInMinutes < 120) return 'normal';
    }
    
    return 'low';
  }

  // Communication System Integration

  private async setupCommunicationIntegration(): Promise<void> {
    // Listen to communication events and queue sync operations
    this.communicationManager.on('message_sent', (data: unknown) => {
      this.queueCommunicationSync('message', data.message, 'normal');
    });

    this.communicationManager.on('call_initiated', (data: unknown) => {
      this.queueCommunicationSync('call_start', data.call, 'high');
    });

    this.communicationManager.on('call_ended', (data: unknown) => {
      this.queueCommunicationSync('call_end', data.call, 'normal');
    });

    this.communicationManager.on('video_call_started', (data: unknown) => {
      this.queueCommunicationSync('video_start', data.call, 'high');
    });

    this.communicationManager.on('emergency_call', (data: unknown) => {
      this.queueCommunicationSync('emergency_call', data.call, 'critical');
    });

    this.communicationManager.on('message_received', (data: unknown) => {
      this.queueCommunicationSync('message_received', data.message, 'normal');
    });

    this.communicationManager.on('notification_sent', (data: unknown) => {
      this.queueCommunicationSync('notification', data.notification, 'low');
    });

    // Set up periodic sync for communication data
    const commTimer = setInterval(async () => {
      await this.syncPendingCommunications();
    }, this.config.syncInterval);

    this.integrationTimers.set('communications', commTimer);
  }

  private async queueCommunicationSync(
    subType: string, data: unknown,
    priority: 'critical' | 'high' | 'normal' | 'low'
  ): Promise<void> {
    await this.backgroundSync.queueOperation({
      type: 'communication',
      subType,
      priority,
      data,
      maxRetries: this.config.retryConfig.maxRetries,
      organizationId: data.organizationId || 'default',
      syncStrategy: priority === 'critical' ? 'immediate' : 'background',
      estimatedTime: this.getEstimatedTime('communication', subType)
    });
  }

  private async syncPendingCommunications(): Promise<void> {
    try {
      const pendingComms = await this.communicationManager.getPendingSyncCommunications();

      for (const comm of pendingComms) {
        await this.backgroundSync.queueOperation({
          type: 'communication',
          subType: 'sync',
          priority: comm.type === 'emergency' ? 'critical' : 'normal',
          data: comm,
          maxRetries: this.config.retryConfig.maxRetries,
          organizationId: comm.organizationId,
          syncStrategy: 'background',
          estimatedTime: this.getEstimatedTime('communication', 'sync')
        });
      }
    } catch (error) {
      console.error('Failed to sync pending communications:', error);
    }
  }

  // Analytics System Integration

  private async setupAnalyticsIntegration(): Promise<void> {
    const analyticsTimer = setInterval(async () => {
      await this.syncAnalyticsEvents();
    }, this.config.syncInterval * 4); // Least frequent for analytics

    this.integrationTimers.set('analytics', analyticsTimer);
  }

  private async syncAnalyticsEvents(): Promise<void> {
    try {
      const analyticsEvents = await this.getPendingAnalyticsEvents();

      // Batch analytics events for efficiency
      if (analyticsEvents.length > 0) {
        const batches = this.chunkArray(analyticsEvents, this.config.batchSize);

        for (const batch of batches) {
          await this.backgroundSync.queueOperation({
            type: 'analytics',
            subType: 'event_batch',
            priority: 'low',
            data: { events: batch },
            maxRetries: 3,
            organizationId: batch[0]?.organizationId || 'default',
            syncStrategy: 'background',
            estimatedTime: this.getEstimatedTime('analytics', 'batch')
          });
        }
      }
    } catch (error) {
      console.error('Failed to sync analytics events:', error);
    }
  }

  // Manual sync triggers

  async syncAllPendingData(organizationId?: string): Promise<void> {
    const operations = [
      this.syncPendingWorkOrders(),
      this.syncPendingAppointments(),
      this.syncPendingDocuments(),
      this.syncPendingMedia(),
      this.syncPendingGPS(),
      this.syncPendingSignatures(),
      this.syncPendingCommunications(),
      this.syncAnalyticsEvents()
    ];

    try {
      await Promise.allSettled(operations);
      this.emit('full_sync_completed', { organizationId });
    } catch (_error) {
      this.emit('full_sync_failed', { error, organizationId });
      throw error;
    }
  }

  async forceSyncType(type: string, organizationId?: string): Promise<void> {
    switch (type) {
      case 'inventory':
        // Trigger inventory sync
        const inventoryStats = await this.inventoryManager.getStatistics(organizationId);
        if (inventoryStats.unsynced > 0) {
          await this.queueInventorySync('force_sync', { organizationId }, 'high');
        }
        break;
      
      case 'customers':
        // Trigger customer sync
        const customerStats = await this.customerManager.getStatistics(organizationId);
        if (customerStats.unsynced > 0) {
          await this.queueCustomerSync('force_sync', { organizationId }, 'high');
        }
        break;
      
      case 'payments':
        // Trigger payment sync
        const paymentStats = await this.paymentTokenizer.getStatistics(organizationId);
        if (paymentStats.totalTokens > 0) {
          await this.queuePaymentSync('force_sync', { organizationId }, 'high');
        }
        break;
      
      case 'documents':
        // Trigger document sync
        const pendingDocs = await this.documentManager.getPendingSyncDocuments();
        if (pendingDocs.length > 0) {
          await this.queueDocumentSync('force_sync', { organizationId, count: pendingDocs.length }, 'high');
        }
        break;
      
      case 'work_orders':
        // Trigger work order sync
        const pendingWorkOrders = await this.workOrderManager.getPendingSyncWorkOrders();
        if (pendingWorkOrders.length > 0) {
          await this.queueWorkOrderSync('force_sync', { organizationId, count: pendingWorkOrders.length }, 'high');
        }
        break;
      
      case 'appointments':
        // Trigger appointment sync
        const pendingAppointments = await this.appointmentManager.getPendingSyncAppointments();
        if (pendingAppointments.length > 0) {
          await this.queueAppointmentSync('force_sync', { organizationId, count: pendingAppointments.length }, 'high');
        }
        break;
      
      case 'media':
        // Trigger media sync
        const pendingMedia = await this.mediaManager.getPendingSyncMedia();
        if (pendingMedia.length > 0) {
          await this.queueMediaSync('force_sync', { organizationId, count: pendingMedia.length }, 'high');
        }
        break;
      
      case 'communications':
        // Trigger communication sync
        const pendingComms = await this.communicationManager.getPendingSyncCommunications();
        if (pendingComms.length > 0) {
          await this.queueCommunicationSync('force_sync', { organizationId, count: pendingComms.length }, 'high');
        }
        break;
      
      case 'gps':
        // Trigger GPS sync
        const pendingGPS = await this.gpsManager.getPendingSyncData();
        if (pendingGPS.length > 0) {
          await this.queueGPSSync('force_sync', { organizationId, count: pendingGPS.length }, 'high');
        }
        break;
      
      case 'signatures':
        // Trigger signature sync
        const pendingSignatures = await this.signatureManager.getPendingSyncSignatures();
        const pendingSubmissions = await this.signatureManager.getPendingSyncSubmissions();
        if (pendingSignatures.length > 0 || pendingSubmissions.length > 0) {
          await this.queueSignatureSync('force_sync', { 
            organizationId, 
            signatureCount: pendingSignatures.length,
            submissionCount: pendingSubmissions.length 
          }, 'high');
        }
        break;
      
      default:
        throw new Error('Unknown sync type: ${type}');
    }
  }

  // Helper methods

  private getEstimatedTime(type: string, subType?: string): number {
    const baseTimes = {
      payment: 2000,
      inventory: 1500,
      customer: 1000,
      work_order: 2500,
      appointment: 1200,
      document: 5000,
      media: 8000,
      gps: 1200,
      signature: 2000,
      communication: 1500,
      analytics: 500
    };

    const multipliers = {
      create: 1.5,
      update: 1.0,
      delete: 0.8,
      batch: 2.0,
      force_sync: 3.0,
      upload: 2.5,
      batch_upload: 4.0,
      compress: 1.8,
      thumbnail: 0.5,
      preview: 0.7,
      sync_required: 2.0,
      tracking_start: 1.0,
      tracking_stop: 0.8,
      location_update: 0.3,
      route_create: 1.5,
      route_optimize: 2.0,
      route_start: 1.2,
      geofence_enter: 0.8,
      geofence_exit: 0.8,
      emergency_alert: 0.5
    };

    const baseTime = baseTimes[type as keyof typeof baseTimes] || 1000;
    const multiplier = multipliers[subType as keyof typeof multipliers] || 1.0;

    return Math.round(baseTime * multiplier);
  }

  private getPriority(urgency?: string): 'critical' | 'high' | 'normal' | 'low' {
    switch (urgency?.toLowerCase()) {
      case 'urgent':
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'low':
        return 'low';
      default:
        return 'normal';
    }
  }

  private getAppointmentPriority(appointment: unknown): 'critical' | 'high' | 'normal' | 'low' {
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const hoursUntil = timeDiff / (1000 * 60 * 60);

    // Factor in appointment priority
    if (appointment.priority === 'emergency') return 'critical';
    if (appointment.priority === 'urgent') return 'high';

    // Time-based priority
    if (hoursUntil <= 1) return 'critical';
    if (hoursUntil <= 4) return 'high';
    if (hoursUntil <= 24) return 'normal';
    return 'low';
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (const i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Mock data retrieval methods (replace with actual implementations)

  private async getPendingWorkOrders(): Promise<any[]> {
    // Mock implementation - replace with actual data source
    const stored = localStorage.getItem('pending_work_orders');
    return stored ? JSON.parse(stored) : [];
  }

  private async getPendingAppointments(): Promise<any[]> {
    // Use appointment manager for actual pending appointments
    const pendingAppointments = await this.appointmentManager.getPendingSyncAppointments();
    return pendingAppointments;
  }

  private async getPendingDocuments(): Promise<any[]> {
    // Use document manager for actual pending documents
    const pendingDocs = await this.documentManager.getPendingSyncDocuments();
    return pendingDocs;
  }

  private async getPendingAnalyticsEvents(): Promise<any[]> {
    const stored = localStorage.getItem('pending_analytics');
    return stored ? JSON.parse(stored) : [];
  }

  // Auto-sync management

  private startAutoSync(): void {
    // Main auto-sync already handled by background sync manager
    // Additional coordination can be added here
    console.log('Auto-sync enabled for all integrations');
  }

  public pauseAutoSync(): void {
    this.integrationTimers.forEach((timer) => {
      clearInterval(timer);
    });
    this.emit('auto_sync_paused');
  }

  public resumeAutoSync(): void {
    this.setupWorkOrderIntegration();
    this.setupAppointmentIntegration();
    this.setupDocumentIntegration();
    this.setupMediaIntegration();
    this.setupGPSIntegration();
    this.setupCommunicationIntegration();
    this.setupAnalyticsIntegration();
    this.emit('auto_sync_resumed');
  }

  // Statistics and monitoring

  async getIntegrationStats(): Promise<{
    integrations: string[];
    activeTimers: number;
    lastSyncTimes: Record<string, Date>;
    pendingCounts: Record<string, number>;
  }> {
    const pendingCounts = {
      work_orders: (await this.workOrderManager.getPendingSyncWorkOrders()).length,
      appointments: (await this.appointmentManager.getPendingSyncAppointments()).length,
      documents: (await this.documentManager.getPendingSyncDocuments()).length,
      media: (await this.mediaManager.getPendingSyncMedia()).length,
      gps: (await this.gpsManager.getPendingSyncData()).length,
      communications: (await this.communicationManager.getPendingSyncCommunications()).length,
      analytics: (await this.getPendingAnalyticsEvents()).length
    };

    const lastSyncTimes: Record<string, Date> = {};
    // Mock implementation - would track actual last sync times

    return {
      integrations: ['inventory', 'customers', 'payments', 'work_orders', 'appointments', 'documents', 'media', 'gps', 'communications', 'analytics'],
      activeTimers: this.integrationTimers.size,
      lastSyncTimes,
      pendingCounts
    };
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
    this.integrationTimers.forEach((timer) => {
      clearInterval(timer);
    });
    this.integrationTimers.clear();
    this.eventListeners.clear();
    this.initialized = false;
  }
}

// Factory function
export function createSyncIntegrationManager(config?: Partial<SyncIntegrationConfig>): SyncIntegrationManager {
  return SyncIntegrationManager.getInstance(config);
}

// React hook
export function useSyncIntegration() {
  const manager = SyncIntegrationManager.getInstance();
  
  return {
    // Manual sync triggers
    syncAllPendingData: manager.syncAllPendingData.bind(manager),
    forceSyncType: manager.forceSyncType.bind(manager),
    
    // Specific sync methods
    syncPendingMedia: manager.syncPendingMedia.bind(manager),
    syncPendingGPS: manager.syncPendingGPS.bind(manager),
    syncPendingCommunications: manager.syncPendingCommunications.bind(manager),
    
    // Control
    pauseAutoSync: manager.pauseAutoSync.bind(manager),
    resumeAutoSync: manager.resumeAutoSync.bind(manager),
    
    // Monitoring
    getIntegrationStats: manager.getIntegrationStats.bind(manager),
    
    // Events
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}