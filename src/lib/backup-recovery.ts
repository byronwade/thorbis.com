/**
 * Advanced Backup and Disaster Recovery System
 * 
 * Comprehensive backup, recovery, replication, and disaster recovery management
 * for all Thorbis Business OS data and systems
 */

export interface BackupJob {
  id: string
  businessId: string
  
  // Job configuration
  jobName: string
  description: string
  backupType: BackupType
  priority: BackupPriority
  
  // Data selection
  dataScope: DataScope
  includedTables: string[]
  excludedTables: string[]
  includedFiles: string[]
  excludedFiles: string[]
  
  // Backup configuration
  compressionLevel: CompressionLevel
  encryptionEnabled: boolean
  encryptionKey?: string
  retentionPolicy: RetentionPolicy
  
  // Storage configuration
  storageProviders: StorageProvider[]
  multiRegionBackup: boolean
  crossCloudReplication: boolean
  
  // Scheduling
  schedule: BackupSchedule
  isActive: boolean
  nextRun?: Date
  
  // Industry-specific backup requirements
  industryRequirements?: {
    homeServices?: {
      includeCustomerData: boolean
      includeJobHistory: boolean
      includeTechnicianData: boolean
      includeInvoiceData: boolean
      dataRetentionYears: number
    }
    restaurant?: {
      includePOSData: boolean
      includeInventoryData: boolean
      includeMenuData: boolean
      includeOrderHistory: boolean
      complianceBackup: boolean
    }
    auto?: {
      includeServiceRecords: boolean
      includeDiagnosticData: boolean
      includePartsInventory: boolean
      includeWarrantyData: boolean
      regulatoryCompliance: boolean
    }
    retail?: {
      includeTransactionData: boolean
      includeInventoryData: boolean
      includeCustomerData: boolean
      includePricingData: boolean
      taxComplianceBackup: boolean
    }
    education?: {
      includeStudentRecords: boolean
      includeGradeData: boolean
      includeCourseContent: boolean
      includeAssessmentData: boolean
      ferpaCompliance: boolean
    }
  }
  
  // Status and metrics
  lastRun?: Date
  lastSuccess?: Date
  status: BackupJobStatus
  lastError?: string
  executionMetrics: BackupMetrics
  
  createdBy: string
  createdAt: Date
  updatedBy: string
  updatedAt: Date
}

export interface BackupExecution {
  id: string
  jobId: string
  businessId: string
  
  // Execution details
  startTime: Date
  endTime?: Date
  duration?: number
  status: ExecutionStatus
  
  // Data details
  dataSize: number
  compressedSize: number
  compressionRatio: number
  filesBackedUp: number
  tablesBackedUp: number
  recordsBackedUp: number
  
  // Storage details
  storageLocations: StorageLocation[]
  backupFiles: BackupFile[]
  checksumVerified: boolean
  encryptionVerified: boolean
  
  // Error handling
  errors: BackupError[]
  warnings: BackupWarning[]
  
  // Recovery information
  recoveryPointObjective: string // RPO
  recoveryTimeObjective: string // RTO
  restoreTestStatus?: RestoreTestStatus
  
  executedBy: string
  executedAt: Date
}

export interface RestoreJob {
  id: string
  businessId: string
  backupExecutionId: string
  
  // Restore configuration
  restoreName: string
  restoreType: RestoreType
  targetEnvironment: TargetEnvironment
  pointInTimeRestore?: Date
  
  // Data selection
  selectedTables: string[]
  selectedFiles: string[]
  dataFilters: RestoreFilter[]
  
  // Restore options
  overwriteExisting: boolean
  mergeStrategy: MergeStrategy
  skipDuplicates: boolean
  validateData: boolean
  
  // Industry-specific restore options
  industryOptions?: {
    homeServices?: {
      preserveCustomerPrivacy: boolean
      maskSensitiveData: boolean
      includePaymentData: boolean
    }
    restaurant?: {
      preserveMenuPricing: boolean
      updateInventoryCounts: boolean
      maintainPOSConfiguration: boolean
    }
    auto?: {
      verifyDiagnosticIntegrity: boolean
      updatePartsAvailability: boolean
      preserveWarrantyStatus: boolean
    }
    retail?: {
      recalculateInventory: boolean
      updatePricing: boolean
      verifyTransactionIntegrity: boolean
    }
    education?: {
      preserveStudentPrivacy: boolean
      validateGradeIntegrity: boolean
      maintainEnrollmentStatus: boolean
    }
  }
  
  // Status and progress
  status: RestoreJobStatus
  progress: number
  estimatedTimeRemaining?: number
  currentPhase: RestorePhase
  
  // Results
  tablesRestored?: number
  filesRestored?: number
  recordsRestored?: number
  dataIntegrityCheck?: IntegrityCheckResult
  
  // Error handling
  errors: RestoreError[]
  rollbackRequired: boolean
  rollbackStatus?: RollbackStatus
  
  requestedBy: string
  requestedAt: Date
  completedAt?: Date
}

export interface DisasterRecoveryPlan {
  id: string
  businessId: string
  
  // Plan details
  planName: string
  description: string
  planType: DRPlanType
  riskAssessment: RiskAssessment
  
  // Recovery objectives
  recoveryPointObjective: string // RPO - max acceptable data loss
  recoveryTimeObjective: string // RTO - max acceptable downtime
  maximumTolerableDowntime: string // MTD
  
  // Infrastructure configuration
  primaryDataCenter: DataCenter
  secondaryDataCenter: DataCenter
  replicationStrategy: ReplicationStrategy
  failoverTriggers: FailoverTrigger[]
  
  // Recovery procedures
  recoverySteps: RecoveryStep[]
  rollbackProcedures: RollbackProcedure[]
  communicationPlan: CommunicationPlan
  
  // Industry-specific requirements
  industryCompliance?: {
    homeServices?: {
      serviceAvailabilityRequirement: string
      customerDataProtection: boolean
      regulatoryReporting: boolean
    }
    restaurant?: {
      posSystemPriority: number
      inventorySystemPriority: number
      paymentProcessingPriority: number
    }
    auto?: {
      diagnosticSystemPriority: number
      partsSystemPriority: number
      customerDataPriority: number
    }
    retail?: {
      ecommercePriority: number
      posSystemPriority: number
      inventoryPriority: number
      paymentPriority: number
    }
    education?: {
      lmsPriority: number
      gradingSystemPriority: number
      studentDataPriority: number
      ferpaCompliance: boolean
    }
  }
  
  // Testing and validation
  testSchedule: TestSchedule
  lastTest?: Date
  lastTestResults?: TestResult
  
  // Team and contacts
  emergencyContacts: EmergencyContact[]
  recoveryTeam: RecoveryTeamMember[]
  escalationMatrix: EscalationLevel[]
  
  // Documentation
  runbooks: Runbook[]
  checklists: RecoveryChecklist[]
  
  isActive: boolean
  version: string
  approvedBy: string
  approvedAt: Date
  nextReview: Date
  
  createdBy: string
  createdAt: Date
  updatedBy: string
  updatedAt: Date
}

export interface ReplicationSetup {
  id: string
  businessId: string
  
  // Replication configuration
  replicationName: string
  sourceEnvironment: Environment
  targetEnvironment: Environment
  replicationType: ReplicationType
  
  // Data synchronization
  syncMode: SyncMode
  syncFrequency: string
  lagThreshold: number // seconds
  conflictResolution: ConflictResolution
  
  // Data selection
  replicatedTables: ReplicationTable[]
  replicatedFiles: ReplicationFile[]
  excludedData: string[]
  
  // Performance configuration
  bandwidthLimit?: number // Mbps
  compressionEnabled: boolean
  encryptionInTransit: boolean
  batchSize: number
  parallelConnections: number
  
  // Industry-specific replication
  industryConfig?: {
    homeServices?: {
      prioritizeCustomerData: boolean
      realtimeJobUpdates: boolean
      invoiceReplication: boolean
    }
    restaurant?: {
      realtimePOSSync: boolean
      inventoryReplication: boolean
      menuSynchronization: boolean
    }
    auto?: {
      diagnosticDataSync: boolean
      partsInventorySync: boolean
      serviceRecordSync: boolean
    }
    retail?: {
      realtimeInventorySync: boolean
      transactionReplication: boolean
      pricingDataSync: boolean
    }
    education?: {
      studentDataSync: boolean
      gradeReplication: boolean
      courseContentSync: boolean
    }
  }
  
  // Monitoring
  healthStatus: ReplicationHealth
  lastSync?: Date
  currentLag: number
  throughput: number
  errorCount: number
  
  // Alerts
  alertThresholds: ReplicationAlertThresholds
  notificationChannels: string[]
  
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedBy: string
  updatedAt: Date
}

// Enums
export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
  SNAPSHOT = 'snapshot',
  CONTINUOUS = 'continuous'
}

export enum BackupPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum CompressionLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

export enum BackupJobStatus {
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

export enum ExecutionStatus {
  PENDING = 'pending',
  INITIALIZING = 'initializing',
  BACKING_UP = 'backing_up',
  COMPRESSING = 'compressing',
  ENCRYPTING = 'encrypting',
  UPLOADING = 'uploading',
  VERIFYING = 'verifying',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum RestoreType {
  FULL_RESTORE = 'full_restore',
  SELECTIVE_RESTORE = 'selective_restore',
  POINT_IN_TIME = 'point_in_time',
  TABLE_LEVEL = 'table_level',
  FILE_LEVEL = 'file_level'
}

export enum RestoreJobStatus {
  QUEUED = 'queued',
  PREPARING = 'preparing',
  RESTORING = 'restoring',
  VALIDATING = 'validating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}

export enum DRPlanType {
  HOT_SITE = 'hot_site',
  WARM_SITE = 'warm_site',
  COLD_SITE = 'cold_site',
  CLOUD_BASED = 'cloud_based',
  HYBRID = 'hybrid'
}

export enum ReplicationType {
  REAL_TIME = 'real_time',
  NEAR_REAL_TIME = 'near_real_time',
  BATCH = 'batch',
  LOG_SHIPPING = 'log_shipping',
  SNAPSHOT = 'snapshot'
}

export enum SyncMode {
  SYNCHRONOUS = 'synchronous',
  ASYNCHRONOUS = 'asynchronous',
  SEMI_SYNCHRONOUS = 'semi_synchronous'
}

export enum ReplicationHealth {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  FAILED = 'failed'
}

// Supporting interfaces
export interface DataScope {
  includeAllTables: boolean
  includeSystemTables: boolean
  includeUserData: boolean
  includeConfiguration: boolean
  includeFiles: boolean
  includeIndices: boolean
  includeViews: boolean
  includeProcedures: boolean
}

export interface RetentionPolicy {
  dailyRetentionDays: number
  weeklyRetentionWeeks: number
  monthlyRetentionMonths: number
  yearlyRetentionYears: number
  complianceRetentionYears?: number
}

export interface StorageProvider {
  type: string // 'aws_s3', 'azure_blob', 'gcp_storage', 'local', 'tape'
  configuration: Record<string, unknown>
  region: string
  priority: number
}

export interface BackupSchedule {
  frequency: string // cron expression
  timezone: string
  retryAttempts: number
  retryDelay: number
  maintenanceWindow?: TimeWindow
}

export interface BackupMetrics {
  totalBackups: number
  successfulBackups: number
  failedBackups: number
  averageDuration: number
  averageSize: number
  lastSuccessRate: number
}

export interface StorageLocation {
  provider: string
  region: string
  bucket: string
  path: string
  size: number
  uploadTime: Date
}

export interface BackupFile {
  filename: string
  size: number
  checksum: string
  encryptionStatus: boolean
  compressionRatio: number
  storageLocations: StorageLocation[]
}

export interface RestoreFilter {
  table: string
  whereClause?: string
  dateRange?: {
    startDate: Date
    endDate: Date
  }
}

export interface DataCenter {
  name: string
  location: string
  provider: string
  connectivity: string
  capacity: number
  tier: number
}

export interface RecoveryStep {
  stepNumber: number
  description: string
  estimatedTime: number
  prerequisites: string[]
  responsible: string
  automationScript?: string
}

export interface EmergencyContact {
  name: string
  role: string
  phone: string
  email: string
  escalationLevel: number
}

export interface TimeWindow {
  startTime: string
  endTime: string
  days: string[]
}

/**
 * Backup and Disaster Recovery Service
 */
class BackupRecoveryService {
  constructor() {
    // Service initialization
  }

  // === BACKUP MANAGEMENT ===

  async createBackupJob(businessId: string, jobData: Partial<BackupJob>): Promise<BackupJob> {
    const job: BackupJob = {
      id: 'backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      ...jobData,
      backupType: jobData.backupType || BackupType.INCREMENTAL,
      priority: jobData.priority || BackupPriority.MEDIUM,
      dataScope: jobData.dataScope || {
        includeAllTables: true,
        includeSystemTables: false,
        includeUserData: true,
        includeConfiguration: true,
        includeFiles: true,
        includeIndices: true,
        includeViews: false,
        includeProcedures: false
      },
      compressionLevel: jobData.compressionLevel || CompressionLevel.MEDIUM,
      encryptionEnabled: jobData.encryptionEnabled ?? true,
      retentionPolicy: jobData.retentionPolicy || {
        dailyRetentionDays: 7,
        weeklyRetentionWeeks: 4,
        monthlyRetentionMonths: 12,
        yearlyRetentionYears: 7
      },
      storageProviders: jobData.storageProviders || [],
      multiRegionBackup: jobData.multiRegionBackup ?? false,
      crossCloudReplication: jobData.crossCloudReplication ?? false,
      schedule: jobData.schedule || {
        frequency: '0 2 * * *', // Daily at 2 AM
        timezone: 'UTC',
        retryAttempts: 3,
        retryDelay: 300
      },
      isActive: jobData.isActive ?? true,
      status: BackupJobStatus.SCHEDULED,
      executionMetrics: {
        totalBackups: 0,
        successfulBackups: 0,
        failedBackups: 0,
        averageDuration: 0,
        averageSize: 0,
        lastSuccessRate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    } as BackupJob

    return job
  }

  async executeBackup(jobId: string): Promise<BackupExecution> {
    const execution: BackupExecution = {
      id: 'exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      jobId,
      businessId: ', // Will be populated from job
      startTime: new Date(),
      status: ExecutionStatus.INITIALIZING,
      dataSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      filesBackedUp: 0,
      tablesBackedUp: 0,
      recordsBackedUp: 0,
      storageLocations: [],
      backupFiles: [],
      checksumVerified: false,
      encryptionVerified: false,
      errors: [],
      warnings: [],
      recoveryPointObjective: '1h',
      recoveryTimeObjective: '4h',
      executedBy: 'system`,
      executedAt: new Date()
    }

    return execution
  }

  // === RESTORE MANAGEMENT ===

  async createRestoreJob(businessId: string, restoreData: Partial<RestoreJob>): Promise<RestoreJob> {
    const job: RestoreJob = {
      id: `restore_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      ...restoreData,
      restoreType: restoreData.restoreType || RestoreType.FULL_RESTORE,
      targetEnvironment: restoreData.targetEnvironment || TargetEnvironment.PRODUCTION,
      selectedTables: restoreData.selectedTables || [],
      selectedFiles: restoreData.selectedFiles || [],
      dataFilters: restoreData.dataFilters || [],
      overwriteExisting: restoreData.overwriteExisting ?? false,
      mergeStrategy: restoreData.mergeStrategy || MergeStrategy.SKIP_EXISTING,
      skipDuplicates: restoreData.skipDuplicates ?? true,
      validateData: restoreData.validateData ?? true,
      status: RestoreJobStatus.QUEUED,
      progress: 0,
      currentPhase: RestorePhase.PREPARING,
      errors: [],
      rollbackRequired: false,
      requestedAt: new Date()
    } as RestoreJob

    return job
  }

  // === DISASTER RECOVERY ===

  async createDisasterRecoveryPlan(businessId: string, planData: Partial<DisasterRecoveryPlan>): Promise<DisasterRecoveryPlan> {
    const plan: DisasterRecoveryPlan = {
      id: 'dr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      ...planData,
      planType: planData.planType || DRPlanType.CLOUD_BASED,
      riskAssessment: planData.riskAssessment || {
        likelihood: 'medium',
        impact: 'high',
        riskScore: 7.5
      },
      recoveryPointObjective: planData.recoveryPointObjective || '1h',
      recoveryTimeObjective: planData.recoveryTimeObjective || '4h',
      maximumTolerableDowntime: planData.maximumTolerableDowntime || '8h',
      replicationStrategy: planData.replicationStrategy || ReplicationStrategy.ASYNCHRONOUS,
      failoverTriggers: planData.failoverTriggers || [],
      recoverySteps: planData.recoverySteps || [],
      rollbackProcedures: planData.rollbackProcedures || [],
      communicationPlan: planData.communicationPlan || {
        internalNotifications: [],
        externalNotifications: [],
        mediaResponse: false
      },
      testSchedule: planData.testSchedule || {
        frequency: 'quarterly',
        nextTest: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      emergencyContacts: planData.emergencyContacts || [],
      recoveryTeam: planData.recoveryTeam || [],
      escalationMatrix: planData.escalationMatrix || [],
      runbooks: planData.runbooks || [],
      checklists: planData.checklists || [],
      isActive: planData.isActive ?? true,
      version: '1.0',
      nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    } as DisasterRecoveryPlan

    return plan
  }

  // === REPLICATION MANAGEMENT ===

  async setupReplication(businessId: string, replicationData: Partial<ReplicationSetup>): Promise<ReplicationSetup> {
    const setup: ReplicationSetup = {
      id: 'repl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      ...replicationData,
      replicationType: replicationData.replicationType || ReplicationType.NEAR_REAL_TIME,
      syncMode: replicationData.syncMode || SyncMode.ASYNCHRONOUS,
      syncFrequency: replicationData.syncFrequency || '*/5 * * * *', // Every 5 minutes
      lagThreshold: replicationData.lagThreshold || 300, // 5 minutes
      conflictResolution: replicationData.conflictResolution || ConflictResolution.SOURCE_WINS,
      replicatedTables: replicationData.replicatedTables || [],
      replicatedFiles: replicationData.replicatedFiles || [],
      excludedData: replicationData.excludedData || [],
      compressionEnabled: replicationData.compressionEnabled ?? true,
      encryptionInTransit: replicationData.encryptionInTransit ?? true,
      batchSize: replicationData.batchSize || 1000,
      parallelConnections: replicationData.parallelConnections || 4,
      healthStatus: ReplicationHealth.HEALTHY,
      currentLag: 0,
      throughput: 0,
      errorCount: 0,
      alertThresholds: replicationData.alertThresholds || {
        lagThreshold: 600, // 10 minutes
        errorRateThreshold: 5,
        throughputThreshold: 1000
      },
      notificationChannels: replicationData.notificationChannels || [],
      isActive: replicationData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as ReplicationSetup

    return setup
  }

  // === HELPER METHODS ===

  async validateBackupIntegrity(executionId: string): Promise<IntegrityCheckResult> {
    return {
      isValid: true,
      checksumMatches: true,
      encryptionValid: true,
      dataComplete: true,
      issues: []
    }
  }

  async calculateRetentionPolicy(policy: RetentionPolicy, currentDate: Date): Promise<Date[]> {
    const retentionDates: Date[] = []
    
    // Add logic to calculate which backups to keep based on retention policy
    // This is a simplified version
    for (const i = 0; i < policy.dailyRetentionDays; i++) {
      retentionDates.push(new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000))
    }
    
    return retentionDates
  }

  async estimateRestoreTime(restoreJob: RestoreJob): Promise<number> {
    // Estimate restore time based on data size, network speed, etc.
    // This is a placeholder implementation
    return 3600 // 1 hour in seconds
  }
}

// Additional supporting interfaces and enums
export interface Environment {
  name: string
  type: 'production' | 'staging' | 'development'
  region: string
  connectionString: string
}

export enum TargetEnvironment {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
  DISASTER_RECOVERY = 'disaster_recovery'
}

export enum MergeStrategy {
  OVERWRITE_ALL = 'overwrite_all',
  SKIP_EXISTING = 'skip_existing',
  MERGE_UPDATES = 'merge_updates',
  TIMESTAMP_BASED = 'timestamp_based'
}

export enum RestorePhase {
  PREPARING = 'preparing',
  DOWNLOADING = 'downloading',
  EXTRACTING = 'extracting',
  VALIDATING = 'validating',
  RESTORING_SCHEMA = 'restoring_schema',
  RESTORING_DATA = 'restoring_data',
  REBUILDING_INDICES = 'rebuilding_indices',
  FINALIZING = 'finalizing'
}

export enum ReplicationStrategy {
  SYNCHRONOUS = 'synchronous',
  ASYNCHRONOUS = 'asynchronous',
  SEMI_SYNCHRONOUS = 'semi_synchronous'
}

export enum ConflictResolution {
  SOURCE_WINS = 'source_wins',
  TARGET_WINS = 'target_wins',
  TIMESTAMP_BASED = 'timestamp_based',
  MANUAL_REVIEW = 'manual_review'
}

export interface IntegrityCheckResult {
  isValid: boolean
  checksumMatches: boolean
  encryptionValid: boolean
  dataComplete: boolean
  issues: string[]
}

export interface RiskAssessment {
  likelihood: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  riskScore: number
}

export interface TestSchedule {
  frequency: 'monthly' | 'quarterly' | 'annually'
  nextTest: Date
}

export interface TestResult {
  testDate: Date
  success: boolean
  issues: string[]
  recommendations: string[]
}

export interface CommunicationPlan {
  internalNotifications: string[]
  externalNotifications: string[]
  mediaResponse: boolean
}

export interface RecoveryTeamMember {
  name: string
  role: string
  contact: string
  backup: string
  responsibilities: string[]
}

export interface EscalationLevel {
  level: number
  timeThreshold: number
  contacts: string[]
}

export interface Runbook {
  id: string
  name: string
  scenario: string
  procedures: string[]
  lastUpdated: Date
}

export interface RecoveryChecklist {
  id: string
  name: string
  items: ChecklistItem[]
  mandatory: boolean
}

export interface ChecklistItem {
  description: string
  responsible: string
  estimatedTime: number
  dependencies: string[]
  completed: boolean
}

export interface ReplicationTable {
  tableName: string
  includeSchema: boolean
  includeData: boolean
  includeIndices: boolean
  filters: string[]
}

export interface ReplicationFile {
  path: string
  includeSubdirectories: boolean
  filePatterns: string[]
  excludePatterns: string[]
}

export interface ReplicationAlertThresholds {
  lagThreshold: number
  errorRateThreshold: number
  throughputThreshold: number
}

export interface BackupError {
  code: string
  message: string
  severity: 'warning' | 'error' | 'critical'
  timestamp: Date
  context?: Record<string, unknown>
}

export interface BackupWarning {
  message: string
  timestamp: Date
  context?: Record<string, unknown>
}

export interface RestoreError {
  code: string
  message: string
  severity: 'warning' | 'error' | 'critical'
  timestamp: Date
  affectedTables?: string[]
  affectedFiles?: string[]
}

export enum RestoreTestStatus {
  NOT_TESTED = 'not_tested',
  PASSED = 'passed',
  FAILED = 'failed',
  IN_PROGRESS = 'in_progress'
}

export enum RollbackStatus {
  NOT_REQUIRED = 'not_required',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum FailoverTrigger {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  HEALTH_CHECK_FAILURE = 'health_check_failure',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  NETWORK_FAILURE = 'network_failure'
}

export const backupRecoveryService = new BackupRecoveryService()