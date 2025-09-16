# Home Services Mobile Operations Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Maintained By**: Thorbis Mobile Operations Team  
> **Review Schedule**: Monthly  

## Overview

This comprehensive mobile operations guide covers all aspects of field technician mobile application usage, offline functionality, and mobile-first workflows specifically designed for home services businesses. It ensures technicians can deliver exceptional service while maintaining operational efficiency and data accuracy in the field.

## Mobile-First Architecture

### Field-Optimized Design Principles
```typescript
interface MobileDesignPrinciples {
  performanceFirst: {
    loadTime: 'Sub-2 second app launch with cached data',
    navigation: 'One-tap access to critical functions',
    dataSync: 'Background synchronization with conflict resolution',
    batteryOptimization: 'Minimal battery drain during 8+ hour shifts'
  },

  connectivityResilience: {
    offlineMode: 'Full job execution capability without internet',
    smartSync: 'Intelligent data synchronization when connection restored',
    conflictResolution: 'Automatic resolution of data conflicts',
    cacheStrategy: 'Strategic caching of job data and customer information'
  },

  fieldTechnician: {
    largeTargets: 'Minimum 44px touch targets for tool-wearing hands',
    oneHandedUse: 'Critical functions accessible with one hand',
    outdoorVisibility: 'High contrast design for outdoor visibility',
    simplicityFocus: 'Streamlined workflows for efficiency'
  },

  dataIntegrity: {
    realTimeCapture: 'Immediate capture of photos, signatures, and measurements',
    validationRules: 'Field validation to prevent incomplete data',
    autoBackup: 'Automatic backup of critical data',
    auditTrail: 'Complete audit trail of all field actions'
  }
}
```

### Mobile Application Architecture
```typescript
interface MobileApplicationArchitecture {
  frontendStack: {
    framework: 'React Native with Expo for cross-platform development',
    stateManagement: 'Redux Toolkit with RTK Query for API integration',
    navigation: 'React Navigation 6 with deep linking support',
    styling: 'Styled Components with Odixe design tokens',
    testing: 'Jest and Detox for comprehensive testing'
  },

  backendIntegration: {
    apiConnection: 'RESTful API with WebSocket for real-time updates',
    authentication: 'Supabase Auth with biometric login support',
    dataSync: 'Differential sync with conflict resolution',
    fileUpload: 'Progressive upload with retry logic',
    pushNotifications: 'Firebase Cloud Messaging for job updates'
  },

  deviceCapabilities: {
    camera: 'High-quality photo capture with metadata',
    gps: 'Precise location tracking and route optimization',
    sensors: 'Accelerometer and gyroscope for diagnostic tools',
    storage: 'Encrypted local storage for sensitive data',
    connectivity: 'Automatic network type detection and optimization'
  },

  securityFeatures: {
    deviceLocking: 'Automatic app locking with biometric unlock',
    dataEncryption: 'AES-256 encryption for local data storage',
    certificatePinning: 'SSL certificate pinning for API connections',
    sessionManagement: 'Secure session handling with automatic timeout'
  }
}
```

## Core Mobile Workflows

### Job Management Workflow
```typescript
interface JobManagementWorkflow {
  jobAssignment: {
    notification: {
      delivery: 'Push notification with job summary',
      actions: ['Accept', 'View Details', 'Request Reassignment'],
      urgency: 'Color-coded by priority level',
      sound: 'Distinct notification sounds per job type'
    },
    
    acceptance: {
      oneClickAccept: 'Single tap to accept standard jobs',
      detailsReview: 'Mandatory review for complex or emergency jobs',
      timeEstimation: 'Technician provides arrival time estimate',
      routeOptimization: 'Automatic route calculation and traffic consideration'
    }
  },

  preJobPreparation: {
    jobBriefing: {
      customerInfo: 'Customer contact details and service history',
      propertyDetails: 'Access instructions and safety notes',
      equipmentInfo: 'Equipment specifications and service history',
      partsRequired: 'Estimated parts list and availability check'
    },
    
    routePlanning: {
      gpsNavigation: 'Integrated GPS navigation to job location',
      trafficAlerts: 'Real-time traffic updates and alternative routes',
      parkingInfo: 'Parking availability and restrictions',
      accessNotes: 'Special access instructions and contact information'
    },
    
    preparationChecklist: {
      toolsRequired: 'Job-specific tool checklist',
      safetyEquipment: 'Required PPE and safety equipment',
      partsValidation: 'Verify required parts are available on truck',
      customerConfirmation: 'Automated customer arrival notification'
    }
  },

  onSiteExecution: {
    arrival: {
      autoCheckin: 'GPS-based automatic check-in when arriving at location',
      customerNotification: 'Automatic SMS to customer about technician arrival',
      parkingLogging: 'Log parking location for easy vehicle retrieval',
      initialAssessment: 'Quick site safety assessment and photo capture'
    },
    
    customerInteraction: {
      introduction: 'Digital business card with technician credentials',
      problemDiscussion: 'Structured problem investigation with notes',
      expectationSetting: 'Clear communication about service process',
      accessPermission: 'Digital confirmation of property access'
    },
    
    diagnosticProcess: {
      systematicDiagnosis: 'Step-by-step diagnostic workflows',
      photoDocumentation: 'Before photos with automatic metadata',
      measurementCapture: 'Digital measurement tools with validation',
      equipmentTesting: 'Integrated diagnostic tool readings'
    }
  }
}
```

### Customer Interaction Interface
```typescript
// Mobile Customer Interface Components
export class CustomerInteractionManager {
  private workOrder: WorkOrder;
  private customer: Customer;
  private deviceCapabilities: DeviceCapabilities;

  async initializeCustomerSession(workOrderId: string): Promise<void> {
    this.workOrder = await this.fetchWorkOrder(workOrderId);
    this.customer = await this.fetchCustomerDetails(this.workOrder.customerId);
    
    // Prepare customer-facing interface
    await this.setupCustomerDisplay();
    await this.validateCustomerIdentity();
  }

  async presentProblemAssessment(): Promise<ProblemAssessment> {
    const problemAssessment = {
      customerDescription: await this.captureCustomerDescription(),
      visualInspection: await this.conductVisualInspection(),
      initialDiagnosis: await this.performInitialDiagnosis(),
      customerQuestions: await this.addressCustomerQuestions()
    };

    // Store assessment in work order
    await this.updateWorkOrder({
      problemAssessment,
      assessmentCompletedAt: new Date()
    });

    return problemAssessment;
  }

  async captureCustomerDescription(): Promise<CustomerDescription> {
    const descriptionInterface = new CustomerDescriptionCapture({
      supportedInputs: ['voice', 'text', 'photos'],
      validationRules: ['minimum_length', 'problem_clarity'],
      suggestedQuestions: this.generateSuggestedQuestions()
    });

    const description = await descriptionInterface.collect({
      prompt: 'Please describe the issue you\'re experiencing',
      followUpQuestions: this.getFollowUpQuestions(),
      clarificationSupport: true
    });

    return {
      originalDescription: description.text,
      clarifications: description.clarifications,
      relatedPhotos: description.photos,
      confidenceScore: this.assessDescriptionQuality(description)
    };
  }

  async createEstimate(assessmentData: AssessmentData): Promise<Estimate> {
    const estimateBuilder = new MobileEstimateBuilder({
      partsDatabase: await this.loadPartsDatabase(),
      laborRates: await this.loadLaborRates(),
      businessRules: await this.loadPricingRules()
    });

    const estimate = await estimateBuilder.generate({
      workRequired: assessmentData.workRequired,
      partsNeeded: assessmentData.partsNeeded,
      laborTime: assessmentData.estimatedTime,
      complexity: assessmentData.complexityRating,
      urgency: this.workOrder.priority
    });

    // Present estimate to customer
    const customerApproval = await this.presentEstimateToCustomer(estimate);
    
    if (customerApproval.approved) {
      await this.processEstimateApproval(estimate, customerApproval);
    }

    return estimate;
  }

  async presentEstimateToCustomer(estimate: Estimate): Promise<CustomerApproval> {
    const estimatePresentation = new EstimatePresentation({
      estimate,
      presentationMode: 'tablet_customer_facing',
      interactionLevel: 'high_touch',
      approvalOptions: ['approve', 'modify', 'decline', 'discuss']
    });

    const approval = await estimatePresentation.present({
      explanations: {
        laborBreakdown: true,
        partsBreakdown: true,
        timelineExpectations: true,
        warrantyInformation: true
      },
      
      interactionFeatures: {
        questionSupport: true,
        alternativeOptions: true,
        paymentDiscussion: true,
        schedulingFlexibility: true
      }
    });

    // Log customer interaction for quality assurance
    await this.logCustomerInteraction({
      interactionType: 'estimate_presentation',
      duration: approval.interactionDuration,
      questionsAsked: approval.questionsAsked,
      concerns: approval.concerns,
      outcome: approval.decision
    });

    return approval;
  }

  async collectCustomerSignature(signatureType: SignatureType): Promise<DigitalSignature> {
    const signatureCapture = new DigitalSignatureCapture({
      signatureType,
      legalCompliance: true,
      timestamping: true,
      locationStamping: true
    });

    const signature = await signatureCapture.collect({
      signerName: this.customer.name,
      documentTitle: this.getDocumentTitle(signatureType),
      legalText: await this.getLegalText(signatureType),
      witnessRequired: this.requiresWitness(signatureType)
    });

    // Store signature with full audit trail
    return await this.storeSignature({
      signature: signature.signatureData,
      metadata: {
        signerName: signature.signerName,
        signedAt: signature.timestamp,
        location: signature.gpsLocation,
        deviceInfo: signature.deviceInfo,
        workOrderId: this.workOrder.id
      }
    });
  }

  async processPayment(invoice: Invoice): Promise<PaymentResult> {
    const paymentProcessor = new MobilePaymentProcessor({
      supportedMethods: ['card', 'contactless', 'digital_wallet'],
      securityCompliance: 'PCI_DSS',
      receiptGeneration: true
    });

    const paymentOptions = await paymentProcessor.getAvailableOptions({
      amount: invoice.total,
      currency: 'USD',
      customerPreferences: this.customer.paymentPreferences
    });

    const paymentResult = await paymentProcessor.processPayment({
      invoice,
      paymentMethod: await this.selectPaymentMethod(paymentOptions),
      customerPresent: true,
      locationVerification: true
    });

    if (paymentResult.success) {
      await this.generateReceipt(paymentResult);
      await this.sendReceiptToCustomer(paymentResult);
    }

    return paymentResult;
  }
}
```

## Offline Operations

### Offline Functionality Framework
```typescript
interface OfflineOperations {
  dataStrategy: {
    criticalData: {
      scope: 'Current day jobs, customer details, parts catalog',
      syncTrigger: 'Start of shift and every 15 minutes when connected',
      storage: 'Encrypted SQLite database with automatic cleanup',
      capacity: 'Maximum 500MB per device for offline data'
    },
    
    syncPriorities: {
      high: ['Job updates', 'Customer signatures', 'Photos', 'Invoices'],
      medium: ['Time tracking', 'Inventory usage', 'Notes', 'Measurements'],
      low: ['Analytics data', 'Performance metrics', 'Preferences'],
      background: ['Historical data', 'Reports', 'System logs']
    },
    
    conflictResolution: {
      strategy: 'Server wins for customer data, technician wins for job data',
      mergeRules: 'Automatic merge for non-conflicting fields',
      manualReview: 'Flag conflicts requiring human review',
      auditTrail: 'Complete log of all conflict resolutions'
    }
  },

  functionalCapabilities: {
    fullyOffline: [
      'View assigned jobs and customer information',
      'Update job status and add work notes',
      'Capture photos with automatic metadata',
      'Create estimates and collect signatures',
      'Process offline-capable payments',
      'Track time and materials used',
      'Generate invoices and receipts',
      'Navigate using offline maps'
    ],
    
    limitedOffline: [
      'Real-time inventory checks (cached data only)',
      'Credit card processing (stored for later)',
      'Customer communication (queued messages)',
      'GPS routing (basic routing only)',
      'Parts ordering (queued requests)'
    ],
    
    requiresConnection: [
      'New job assignments',
      'Emergency dispatch updates',
      'Real-time customer communication',
      'Credit verification for large jobs',
      'Manager escalation requests'
    ]
  }
}
```

### Offline Data Management
```javascript
// Offline Data Management System
class OfflineDataManager {
  constructor() {
    this.db = null;
    this.syncQueue = [];
    this.connectionStatus = 'unknown';
    this.lastSyncTime = null;
  }

  async initializeOfflineStorage() {
    // Initialize SQLite database for offline storage
    this.db = await SQLite.openDatabase(
      { name: 'thorbis_offline.db', location: 'default' },
      this.onDatabaseOpen.bind(this),
      this.onDatabaseError.bind(this)
    );

    await this.createOfflineTables();
    await this.setupSyncTriggers();
    await this.loadCriticalData();
  }

  async createOfflineTables() {
    const tables = [
      {
        name: 'offline_work_orders',
        schema: `
          CREATE TABLE IF NOT EXISTS offline_work_orders (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            status TEXT NOT NULL,
            scheduled_date TEXT,
            priority_level TEXT,
            service_category TEXT,
            description TEXT,
            customer_name TEXT,
            customer_phone TEXT,
            address TEXT,
            access_instructions TEXT,
            equipment_details TEXT,
            sync_status TEXT DEFAULT 'synced',
            last_modified INTEGER,
            created_offline INTEGER DEFAULT 0
          )
        `
      },
      {
        name: 'offline_customers',
        schema: `
          CREATE TABLE IF NOT EXISTS offline_customers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            service_history TEXT,
            preferences TEXT,
            sync_status TEXT DEFAULT 'synced',
            last_modified INTEGER
          )
        `
      },
      {
        name: 'offline_inventory',
        schema: `
          CREATE TABLE IF NOT EXISTS offline_inventory (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sku TEXT,
            category TEXT,
            unit_price REAL,
            quantity_available INTEGER,
            description TEXT,
            compatibility TEXT,
            last_updated INTEGER
          )
        `
      },
      {
        name: 'offline_photos',
        schema: `
          CREATE TABLE IF NOT EXISTS offline_photos (
            id TEXT PRIMARY KEY,
            work_order_id TEXT,
            file_path TEXT NOT NULL,
            photo_type TEXT,
            timestamp INTEGER,
            gps_latitude REAL,
            gps_longitude REAL,
            sync_status TEXT DEFAULT 'pending',
            file_size INTEGER
          )
        `
      },
      {
        name: 'sync_queue',
        schema: `
          CREATE TABLE IF NOT EXISTS sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            operation TEXT NOT NULL,
            data TEXT,
            priority INTEGER DEFAULT 5,
            attempts INTEGER DEFAULT 0,
            created_at INTEGER,
            last_attempt INTEGER,
            error_message TEXT
          )
        `
      }
    ];

    for (const table of tables) {
      await this.executeQuery(table.schema);
    }

    // Create indexes for performance
    await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_work_orders_status ON offline_work_orders(status)');
    await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_work_orders_date ON offline_work_orders(scheduled_date)');
    await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_photos_work_order ON offline_photos(work_order_id)');
    await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_sync_queue_priority ON sync_queue(priority, created_at)');
  }

  async loadCriticalData() {
    if (!this.isOnline()) {
      console.log('Offline mode: Using cached data');
      return;
    }

    try {
      // Load today's work orders
      const todaysJobs = await this.fetchTodaysJobs();
      await this.storeCriticalJobs(todaysJobs);

      // Load customer information for scheduled jobs
      const customerIds = todaysJobs.map(job => job.customer_id);
      const customers = await this.fetchCustomersById(customerIds);
      await this.storeCriticalCustomers(customers);

      // Load essential inventory items
      const inventory = await this.fetchEssentialInventory();
      await this.storeCriticalInventory(inventory);

      this.lastSyncTime = Date.now();
      console.log('Critical data loaded successfully');

    } catch (error) {
      console.error('Failed to load critical data:', error);
      // Continue with cached data
    }
  }

  async queueForSync(entityType, entityId, operation, data, priority = 5) {
    const queueItem = {
      entity_type: entityType,
      entity_id: entityId,
      operation: operation, // 'create', 'update', 'delete'
      data: JSON.stringify(data),
      priority: priority, // 1 = highest, 10 = lowest
      created_at: Date.now()
    };

    await this.executeQuery(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, data, priority, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [queueItem.entity_type, queueItem.entity_id, queueItem.operation, 
       queueItem.data, queueItem.priority, queueItem.created_at]
    );

    // Attempt immediate sync if online
    if (this.isOnline()) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    if (!this.isOnline()) {
      console.log('Cannot sync: Device is offline');
      return;
    }

    const queueItems = await this.executeQuery(
      'SELECT * FROM sync_queue ORDER BY priority ASC, created_at ASC LIMIT 50'
    );

    for (const item of queueItems) {
      try {
        await this.syncSingleItem(item);
        
        // Remove successfully synced item
        await this.executeQuery('DELETE FROM sync_queue WHERE id = ?', [item.id]);
        
      } catch (error) {
        // Increment attempt counter and log error
        await this.executeQuery(
          'UPDATE sync_queue SET attempts = attempts + 1, last_attempt = ?, error_message = ? WHERE id = ?',
          [Date.now(), error.message, item.id]
        );
        
        // Remove items with too many failed attempts
        if (item.attempts >= 5) {
          console.error(`Removing failed sync item after 5 attempts: ${item.entity_type}:${item.entity_id}`);
          await this.executeQuery('DELETE FROM sync_queue WHERE id = ?', [item.id]);
        }
      }
    }
  }

  async syncSingleItem(queueItem) {
    const data = JSON.parse(queueItem.data);
    const apiEndpoint = this.getApiEndpoint(queueItem.entity_type);
    
    switch (queueItem.operation) {
      case 'create':
        await this.apiCall('POST', apiEndpoint, data);
        break;
      case 'update':
        await this.apiCall('PUT', `${apiEndpoint}/${queueItem.entity_id}`, data);
        break;
      case 'delete':
        await this.apiCall('DELETE', `${apiEndpoint}/${queueItem.entity_id}`);
        break;
      default:
        throw new Error(`Unknown operation: ${queueItem.operation}`);
    }
  }

  async updateWorkOrderOffline(workOrderId, updates) {
    // Update local database immediately
    const currentData = await this.executeQuery(
      'SELECT * FROM offline_work_orders WHERE id = ?',
      [workOrderId]
    );

    if (currentData.length === 0) {
      throw new Error('Work order not found in offline storage');
    }

    const mergedData = { ...currentData[0], ...updates, last_modified: Date.now() };
    
    await this.executeQuery(
      `UPDATE offline_work_orders SET 
       status = ?, description = ?, last_modified = ?, sync_status = 'pending'
       WHERE id = ?`,
      [mergedData.status, mergedData.description, mergedData.last_modified, workOrderId]
    );

    // Queue for sync when connection is restored
    await this.queueForSync('work_orders', workOrderId, 'update', mergedData, 2);

    return mergedData;
  }

  async storePhotoOffline(workOrderId, photoData) {
    const photoId = this.generateUniqueId();
    const timestamp = Date.now();
    
    // Save photo to local storage
    const localPath = await this.savePhotoToLocalStorage(photoData, photoId);
    
    // Store photo metadata in database
    await this.executeQuery(
      `INSERT INTO offline_photos 
       (id, work_order_id, file_path, photo_type, timestamp, gps_latitude, gps_longitude, sync_status, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        photoId, workOrderId, localPath, photoData.type, timestamp,
        photoData.gps?.latitude, photoData.gps?.longitude, 'pending', photoData.fileSize
      ]
    );

    // Queue for sync (high priority for photos)
    await this.queueForSync('photos', photoId, 'create', {
      workOrderId,
      filePath: localPath,
      type: photoData.type,
      timestamp,
      gps: photoData.gps
    }, 1);

    return { photoId, localPath };
  }

  isOnline() {
    return this.connectionStatus === 'online';
  }

  async handleConnectivityChange(isConnected) {
    this.connectionStatus = isConnected ? 'online' : 'offline';
    
    if (isConnected) {
      console.log('Connection restored - processing sync queue');
      await this.processSyncQueue();
      await this.loadCriticalData(); // Refresh critical data
    } else {
      console.log('Connection lost - switching to offline mode');
    }
  }
}
```

## GPS and Route Optimization

### Location-Based Services
```typescript
interface LocationServices {
  gpsTracking: {
    accuracy: 'High accuracy mode for precise job location tracking',
    backgroundTracking: 'Continuous tracking during shift with battery optimization',
    geofencing: 'Automatic check-in/out when entering/leaving job locations',
    mileageTracking: 'Automatic mileage calculation for reimbursement',
    speedMonitoring: 'Safety alerts for excessive speed or harsh driving'
  },

  routeOptimization: {
    multiStopOptimization: 'AI-powered route optimization for daily job schedule',
    trafficIntegration: 'Real-time traffic data and dynamic re-routing',
    fuelEfficiency: 'Route optimization for fuel efficiency and emissions reduction',
    timeWindows: 'Customer appointment time window adherence',
    emergencyRerouting: 'Immediate rerouting for emergency job insertions'
  },

  navigationFeatures: {
    turnByTurn: 'Voice-guided navigation with heads-up display',
    offlineNavigation: 'Offline navigation capability for remote areas',
    landmarkGuidance: 'Local landmark references for complex locations',
    parkingAssistance: 'Parking location suggestions and reminders',
    accessInstructions: 'Integrated property access instructions'
  }
}
```

### Route Management Implementation
```javascript
// Route Management and GPS Optimization
class RouteManager {
  constructor() {
    this.currentRoute = null;
    this.jobLocations = [];
    this.trafficData = null;
    this.optimizationPreferences = {};
  }

  async optimizeDailyRoute(jobs, startLocation, preferences = {}) {
    this.optimizationPreferences = {
      prioritizeTime: preferences.prioritizeTime || false,
      prioritizeFuel: preferences.prioritizeFuel || false,
      respectTimeWindows: preferences.respectTimeWindows || true,
      allowBacktracking: preferences.allowBacktracking || false,
      maxDetourMinutes: preferences.maxDetourMinutes || 15
    };

    // Categorize jobs by priority and time constraints
    const categorizedJobs = this.categorizeJobs(jobs);
    
    // Fetch current traffic data
    this.trafficData = await this.fetchTrafficData();
    
    // Calculate travel times between all job locations
    const travelMatrix = await this.calculateTravelMatrix(
      [startLocation, ...jobs.map(job => job.location)]
    );
    
    // Apply route optimization algorithm
    const optimizedRoute = await this.applyOptimizationAlgorithm(
      categorizedJobs,
      travelMatrix,
      startLocation
    );
    
    // Validate route against business rules
    const validatedRoute = await this.validateRoute(optimizedRoute);
    
    // Generate route summary and recommendations
    const routeSummary = await this.generateRouteSummary(validatedRoute);
    
    return {
      optimizedRoute: validatedRoute,
      summary: routeSummary,
      alternatives: await this.generateAlternativeRoutes(validatedRoute),
      estimatedMetrics: this.calculateRouteMetrics(validatedRoute)
    };
  }

  categorizeJobs(jobs) {
    return {
      emergency: jobs.filter(job => job.priority === 'emergency'),
      timeConstrained: jobs.filter(job => 
        job.timeWindow && 
        job.timeWindow.end - job.timeWindow.start < 120 // Less than 2 hours
      ),
      flexible: jobs.filter(job => 
        !job.priority === 'emergency' && 
        (!job.timeWindow || job.timeWindow.end - job.timeWindow.start >= 120)
      ),
      maintenance: jobs.filter(job => job.type === 'maintenance')
    };
  }

  async calculateTravelMatrix(locations) {
    const matrix = {};
    
    for (let i = 0; i < locations.length; i++) {
      matrix[i] = {};
      for (let j = 0; j < locations.length; j++) {
        if (i === j) {
          matrix[i][j] = { duration: 0, distance: 0 };
        } else {
          matrix[i][j] = await this.calculateTravelTime(locations[i], locations[j]);
        }
      }
    }
    
    return matrix;
  }

  async calculateTravelTime(origin, destination) {
    try {
      const result = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&departure_time=now&traffic_model=best_guess&key=${GOOGLE_MAPS_API_KEY}`);
      
      const data = await result.json();
      
      if (data.rows[0]?.elements[0]?.status === 'OK') {
        return {
          duration: data.rows[0].elements[0].duration_in_traffic.value,
          distance: data.rows[0].elements[0].distance.value,
          traffic_factor: data.rows[0].elements[0].duration_in_traffic.value / data.rows[0].elements[0].duration.value
        };
      }
    } catch (error) {
      console.error('Travel time calculation failed:', error);
    }
    
    // Fallback to straight-line distance estimation
    return this.calculateStraightLineDistance(origin, destination);
  }

  async applyOptimizationAlgorithm(categorizedJobs, travelMatrix, startLocation) {
    // Implement a modified Traveling Salesman Problem solution
    // with constraints for time windows and job priorities
    
    const allJobs = [
      ...categorizedJobs.emergency,
      ...categorizedJobs.timeConstrained,
      ...categorizedJobs.flexible,
      ...categorizedJobs.maintenance
    ];
    
    // Start with emergency jobs in chronological order
    let optimizedRoute = [...categorizedJobs.emergency.sort((a, b) => 
      new Date(a.scheduledTime) - new Date(b.scheduledTime)
    )];
    
    // Insert time-constrained jobs in optimal positions
    for (const job of categorizedJobs.timeConstrained) {
      const bestPosition = await this.findBestInsertionPoint(
        optimizedRoute, job, travelMatrix
      );
      optimizedRoute.splice(bestPosition, 0, job);
    }
    
    // Optimize remaining flexible jobs using nearest neighbor with 2-opt improvement
    const remainingJobs = [...categorizedJobs.flexible, ...categorizedJobs.maintenance];
    const flexibleRoute = await this.optimizeFlexibleJobs(remainingJobs, travelMatrix);
    
    // Merge routes optimally
    const finalRoute = await this.mergeRoutes(optimizedRoute, flexibleRoute, travelMatrix);
    
    return finalRoute;
  }

  async findBestInsertionPoint(existingRoute, newJob, travelMatrix) {
    let bestPosition = 0;
    let bestCost = Infinity;
    
    for (let i = 0; i <= existingRoute.length; i++) {
      const insertionCost = this.calculateInsertionCost(
        existingRoute, newJob, i, travelMatrix
      );
      
      const timeWindowValid = this.validateTimeWindow(
        existingRoute, newJob, i
      );
      
      if (insertionCost < bestCost && timeWindowValid) {
        bestCost = insertionCost;
        bestPosition = i;
      }
    }
    
    return bestPosition;
  }

  calculateInsertionCost(route, newJob, position, travelMatrix) {
    if (route.length === 0) return 0;
    
    const prevJobIndex = position > 0 ? position - 1 : null;
    const nextJobIndex = position < route.length ? position : null;
    
    let additionalCost = 0;
    
    if (prevJobIndex !== null) {
      // Cost from previous job to new job
      additionalCost += travelMatrix[prevJobIndex][route.length].duration;
    }
    
    if (nextJobIndex !== null) {
      // Cost from new job to next job
      additionalCost += travelMatrix[route.length][nextJobIndex].duration;
      
      if (prevJobIndex !== null) {
        // Subtract the original cost from previous to next job
        additionalCost -= travelMatrix[prevJobIndex][nextJobIndex].duration;
      }
    }
    
    return additionalCost;
  }

  validateTimeWindow(route, newJob, insertionPosition) {
    if (!newJob.timeWindow) return true;
    
    // Calculate arrival time at new job position
    let currentTime = new Date();
    
    for (let i = 0; i < insertionPosition; i++) {
      const job = route[i];
      currentTime = new Date(currentTime.getTime() + job.estimatedDuration * 60000);
      
      if (i < insertionPosition - 1) {
        // Add travel time to next job
        const travelTime = this.getTravelTime(job.location, route[i + 1].location);
        currentTime = new Date(currentTime.getTime() + travelTime * 1000);
      }
    }
    
    // Check if we can arrive within the time window
    return currentTime <= new Date(newJob.timeWindow.end);
  }

  async generateRouteSummary(route) {
    const totalDistance = this.calculateTotalDistance(route);
    const totalTime = this.calculateTotalTime(route);
    const fuelEstimate = this.calculateFuelConsumption(totalDistance);
    
    return {
      totalJobs: route.length,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalDriveTime: Math.round(totalTime / 60),
      estimatedFuelCost: Math.round(fuelEstimate * 100) / 100,
      firstJobTime: route.length > 0 ? route[0].scheduledTime : null,
      lastJobTime: route.length > 0 ? route[route.length - 1].scheduledTime : null,
      routeEfficiency: this.calculateRouteEfficiency(route),
      riskFactors: this.identifyRiskFactors(route)
    };
  }

  startGPSTracking() {
    if (navigator.geolocation) {
      this.gpsWatchId = navigator.geolocation.watchPosition(
        this.handleLocationUpdate.bind(this),
        this.handleLocationError.bind(this),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    }
  }

  handleLocationUpdate(position) {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      speed: position.coords.speed,
      heading: position.coords.heading
    };
    
    // Update current location
    this.currentLocation = location;
    
    // Check for geofence entries/exits
    this.checkGeofences(location);
    
    // Update mileage tracking
    this.updateMileageTracking(location);
    
    // Check for route deviations
    this.checkRouteDeviation(location);
    
    // Store location for offline sync
    this.storeLocationForSync(location);
  }

  checkGeofences(location) {
    for (const job of this.jobLocations) {
      const distance = this.calculateDistance(location, job.location);
      
      if (distance <= job.geofenceRadius && !job.checkedIn) {
        this.handleGeofenceEntry(job, location);
      } else if (distance > job.geofenceRadius && job.checkedIn) {
        this.handleGeofenceExit(job, location);
      }
    }
  }

  async handleGeofenceEntry(job, location) {
    job.checkedIn = true;
    job.arrivalTime = new Date();
    
    // Automatic check-in
    await this.checkInToJob(job.id, {
      location: location,
      arrivalTime: job.arrivalTime,
      method: 'geofence_automatic'
    });
    
    // Notify customer of arrival
    await this.notifyCustomerArrival(job);
    
    // Show job briefing
    this.showJobBriefing(job);
  }
}
```

## Photo and Documentation Management

### Field Documentation System
```typescript
interface FieldDocumentationSystem {
  photoCapture: {
    requirements: {
      beforePhotos: 'Minimum 2 photos before starting work',
      progressPhotos: 'Photos during complex installations or repairs',
      afterPhotos: 'Comprehensive after photos showing completed work',
      issuePhotos: 'Detailed photos of problems or defects found'
    },
    
    metadata: {
      gpsCoordinates: 'Automatic GPS coordinates embedded in photo metadata',
      timestamp: 'Accurate timestamp with timezone information',
      deviceInfo: 'Device model and app version for quality tracking',
      workOrderReference: 'Automatic work order ID watermarking'
    },
    
    qualityStandards: {
      resolution: 'Minimum 1920x1080 resolution for detail clarity',
      lighting: 'Automatic flash for dark areas, HDR for bright conditions',
      focus: 'Tap-to-focus with focus confirmation',
      composition: 'Overlay guides for consistent photo composition'
    }
  },

  signatureCapture: {
    legalRequirements: {
      witnessing: 'Digital witness capability for high-value jobs',
      timestamps: 'Cryptographic timestamps for legal validity',
      biometricBinding: 'Optional biometric validation',
      documentIntegrity: 'Digital signature prevents document tampering'
    },
    
    workflowIntegration: {
      workAuthorization: 'Customer signature before beginning work',
      changeApproval: 'Additional signatures for scope changes',
      completion: 'Final signature confirming work completion',
      satisfaction: 'Optional satisfaction confirmation signature'
    }
  },

  measurementTools: {
    digitalMeasurement: {
      arMeasurement: 'Augmented reality measurement tools',
      photoMeasurement: 'Calibrated measurement overlays on photos',
      voiceMeasurement: 'Voice-activated measurement entry',
      validationTools: 'Cross-validation with multiple measurement methods'
    },
    
    equipmentIntegration: {
      bluetoothTools: 'Integration with Bluetooth measurement devices',
      diagnosticEquipment: 'Direct import from HVAC diagnostic tools',
      multimeters: 'Electrical measurement device integration',
      pressureGauges: 'Plumbing pressure measurement import'
    }
  }
}
```

## Performance Optimization

### Mobile Performance Standards
```typescript
interface MobilePerformanceStandards {
  appPerformance: {
    launchTime: 'Cold start under 2 seconds, warm start under 1 second',
    navigationSpeed: 'Screen transitions under 300ms',
    syncPerformance: 'Background sync without UI blocking',
    memoryUsage: 'Maximum 150MB RAM usage during normal operation',
    storageOptimization: 'Automatic cleanup of old cached data'
  },

  networkOptimization: {
    dataCompression: 'Automatic image compression before upload',
    adaptiveSync: 'Sync frequency based on connection quality',
    offlineFallback: 'Graceful degradation when connection lost',
    bandwidthAware: 'Different sync strategies for WiFi vs cellular',
    cachingStrategy: 'Intelligent caching of frequently accessed data'
  },

  batteryOptimization: {
    gpsOptimization: 'Intelligent GPS usage to minimize battery drain',
    screenBrightness: 'Adaptive brightness for outdoor visibility',
    backgroundTasks: 'Minimal background processing',
    sleepMode: 'Automatic sleep mode during inactivity',
    chargingOptimization: 'Enhanced features when device is charging'
  }
}
```

This comprehensive mobile operations guide ensures field technicians have access to all necessary tools and workflows for efficient service delivery while maintaining data integrity and operational excellence in any connectivity environment.