# Thorbis Data Retention Policy

Comprehensive data retention system with per-table lifecycle management, automated purging, compliance alignment, and data archival strategies.

## 📊 Data Classification & Retention Windows

### Retention Categories
```yaml
retention_categories:
  critical_business_data:
    description: "Core business records required for operations"
    default_retention: "7 years"
    compliance_drivers: ["Tax", "Legal", "Audit"]
    examples: ["invoices", "payments", "contracts", "financial_records"]
    
  operational_data:
    description: "Day-to-day operational information"
    default_retention: "3 years"
    compliance_drivers: ["Business Operations", "Customer Service"]
    examples: ["jobs", "schedules", "estimates", "customer_communications"]
    
  user_generated_content:
    description: "Content created by users"
    default_retention: "5 years or until user deletion"
    compliance_drivers: ["GDPR", "CCPA", "User Rights"]
    examples: ["user_profiles", "preferences", "custom_fields"]
    
  system_logs:
    description: "Application and security logs"
    default_retention: "1 year"
    compliance_drivers: ["Security", "Debugging", "Audit"]
    examples: ["application_logs", "audit_logs", "error_logs"]
    
  temporary_data:
    description: "Short-lived operational data"
    default_retention: "90 days"
    compliance_drivers: ["Performance", "Storage Optimization"]
    examples: ["sessions", "cache_entries", "temporary_files"]
    
  analytics_data:
    description: "Usage and performance analytics"
    default_retention: "2 years"
    compliance_drivers: ["Business Intelligence", "Product Improvement"]
    examples: ["usage_metrics", "performance_data", "feature_usage"]
```

### Per-Table Retention Configuration
```typescript
interface RetentionPolicy {
  table_name: string
  category: RetentionCategory
  retention_period_days: number
  soft_delete_period_days?: number    // Grace period before hard delete
  archive_before_delete: boolean
  archive_storage: 'cold' | 'glacier'
  compliance_requirements: string[]
  purge_conditions: PurgeCondition[]
  exceptions: RetentionException[]
}

interface PurgeCondition {
  column: string
  condition: 'older_than' | 'equals' | 'not_accessed_since' | 'user_deleted'
  value: string | number | Date
  logical_operator?: 'AND' | 'OR'
}

interface RetentionException {
  condition: string
  extended_retention_days: number
  reason: string
}

// Comprehensive per-table retention policies
const TABLE_RETENTION_POLICIES: RetentionPolicy[] = [
  // Business Core Data (7+ years)
  {
    table_name: 'invoices',
    category: 'critical_business_data',
    retention_period_days: 2555, // 7 years
    soft_delete_period_days: 30,
    archive_before_delete: true,
    archive_storage: 'cold',
    compliance_requirements: ['SOX', 'Tax Law', 'GAAP'],
    purge_conditions: [
      {
        column: 'created_at',
        condition: 'older_than',
        value: 2555 // days
      }
    ],
    exceptions: [
      {
        condition: 'status = "disputed" OR audit_flag = true',
        extended_retention_days: 3650, // 10 years for disputed/audited invoices
        reason: 'Legal and audit requirements'
      }
    ]
  },
  
  {
    table_name: 'payments',
    category: 'critical_business_data',
    retention_period_days: 2555, // 7 years
    soft_delete_period_days: 90, // Longer grace period for financial data
    archive_before_delete: true,
    archive_storage: 'cold',
    compliance_requirements: ['PCI-DSS', 'SOX', 'Tax Law'],
    purge_conditions: [
      {
        column: 'processed_at',
        condition: 'older_than',
        value: 2555
      }
    ],
    exceptions: [
      {
        condition: 'amount > 10000 OR payment_method = "wire_transfer"',
        extended_retention_days: 3650, // 10 years for large transactions
        reason: 'Anti-money laundering requirements'
      }
    ]
  },
  
  {
    table_name: 'contracts',
    category: 'critical_business_data', 
    retention_period_days: 3650, // 10 years (longer for legal documents)
    soft_delete_period_days: 90,
    archive_before_delete: true,
    archive_storage: 'cold',
    compliance_requirements: ['Legal', 'Contract Law'],
    purge_conditions: [
      {
        column: 'signed_at',
        condition: 'older_than',
        value: 3650
      },
      {
        column: 'terminated_at',
        condition: 'older_than',
        value: 2555, // 7 years after termination
        logical_operator: 'OR'
      }
    ],
    exceptions: []
  },
  
  // Operational Data (3 years)
  {
    table_name: 'jobs',
    category: 'operational_data',
    retention_period_days: 1095, // 3 years
    soft_delete_period_days: 30,
    archive_before_delete: true,
    archive_storage: 'cold',
    compliance_requirements: ['Business Operations'],
    purge_conditions: [
      {
        column: 'completed_at',
        condition: 'older_than',
        value: 1095
      }
    ],
    exceptions: [
      {
        condition: 'status = "warranty_active" OR has_recurring_schedule = true',
        extended_retention_days: 1825, // 5 years for warranty/recurring
        reason: 'Ongoing service obligations'
      }
    ]
  },
  
  {
    table_name: 'estimates',
    category: 'operational_data',
    retention_period_days: 1095, // 3 years
    soft_delete_period_days: 30,
    archive_before_delete: true,
    archive_storage: 'cold',
    compliance_requirements: ['Business Operations'],
    purge_conditions: [
      {
        column: 'created_at',
        condition: 'older_than',
        value: 1095
      }
    ],
    exceptions: [
      {
        condition: 'status = "converted_to_invoice"',
        extended_retention_days: 2555, // Match invoice retention if converted
        reason: 'Maintain invoice audit trail'
      }
    ]
  },
  
  {
    table_name: 'schedules',
    category: 'operational_data',
    retention_period_days: 1095, // 3 years
    soft_delete_period_days: 7, // Short grace period for schedule data
    archive_before_delete: false, // Don't archive schedule data
    archive_storage: 'cold',
    compliance_requirements: ['Business Operations'],
    purge_conditions: [
      {
        column: 'scheduled_date',
        condition: 'older_than',
        value: 1095
      }
    ],
    exceptions: []
  },
  
  // User Data (Variable, GDPR/CCPA compliant)
  {
    table_name: 'users',
    category: 'user_generated_content',
    retention_period_days: 1825, // 5 years or until user requests deletion
    soft_delete_period_days: 30,
    archive_before_delete: true,
    archive_storage: 'cold',
    compliance_requirements: ['GDPR', 'CCPA'],
    purge_conditions: [
      {
        column: 'last_login_at',
        condition: 'older_than',
        value: 1825
      },
      {
        column: 'deletion_requested_at',
        condition: 'older_than',
        value: 30, // 30 days after deletion request
        logical_operator: 'OR'
      }
    ],
    exceptions: [
      {
        condition: 'has_active_contracts = true OR outstanding_payments > 0',
        extended_retention_days: 2555, // Keep until business obligations resolved
        reason: 'Outstanding business obligations'
      }
    ]
  },
  
  {
    table_name: 'customers',
    category: 'user_generated_content',
    retention_period_days: 2555, // 7 years (business relationship records)
    soft_delete_period_days: 90,
    archive_before_delete: true,
    archive_storage: 'cold',
    compliance_requirements: ['GDPR', 'CCPA', 'Business Operations'],
    purge_conditions: [
      {
        column: 'last_interaction_at',
        condition: 'older_than',
        value: 2555
      }
    ],
    exceptions: []
  },
  
  // System Logs (1 year)
  {
    table_name: 'audit_logs',
    category: 'system_logs',
    retention_period_days: 365, // 1 year
    soft_delete_period_days: 0, // No soft delete for logs
    archive_before_delete: true,
    archive_storage: 'glacier', // Cheapest storage for archived logs
    compliance_requirements: ['Security', 'Audit'],
    purge_conditions: [
      {
        column: 'created_at',
        condition: 'older_than',
        value: 365
      }
    ],
    exceptions: [
      {
        condition: 'severity = "critical" OR action LIKE "%security%"',
        extended_retention_days: 1095, // 3 years for security events
        reason: 'Security incident investigation'
      }
    ]
  },
  
  {
    table_name: 'application_logs',
    category: 'system_logs',
    retention_period_days: 365, // 1 year
    soft_delete_period_days: 0,
    archive_before_delete: true,
    archive_storage: 'glacier',
    compliance_requirements: ['Debugging', 'Performance'],
    purge_conditions: [
      {
        column: 'timestamp',
        condition: 'older_than',
        value: 365
      }
    ],
    exceptions: [
      {
        condition: 'level = "error" OR level = "fatal"',
        extended_retention_days: 730, // 2 years for error logs
        reason: 'Extended debugging and analysis'
      }
    ]
  },
  
  {
    table_name: 'security_events',
    category: 'system_logs',
    retention_period_days: 1095, // 3 years for security events
    soft_delete_period_days: 0,
    archive_before_delete: true,
    archive_storage: 'cold',
    compliance_requirements: ['Security', 'Incident Response'],
    purge_conditions: [
      {
        column: 'occurred_at',
        condition: 'older_than',
        value: 1095
      }
    ],
    exceptions: [
      {
        condition: 'severity = "critical" OR incident_id IS NOT NULL',
        extended_retention_days: 2190, // 6 years for critical incidents
        reason: 'Long-term security analysis'
      }
    ]
  },
  
  // Temporary Data (90 days)
  {
    table_name: 'sessions',
    category: 'temporary_data',
    retention_period_days: 90,
    soft_delete_period_days: 0,
    archive_before_delete: false,
    archive_storage: 'cold',
    compliance_requirements: [],
    purge_conditions: [
      {
        column: 'expires_at',
        condition: 'older_than',
        value: 0 // Immediately after expiration
      },
      {
        column: 'last_accessed_at',
        condition: 'older_than',
        value: 90,
        logical_operator: 'OR'
      }
    ],
    exceptions: []
  },
  
  {
    table_name: 'rate_limit_entries',
    category: 'temporary_data',
    retention_period_days: 7,
    soft_delete_period_days: 0,
    archive_before_delete: false,
    archive_storage: 'cold',
    compliance_requirements: [],
    purge_conditions: [
      {
        column: 'created_at',
        condition: 'older_than',
        value: 7
      }
    ],
    exceptions: []
  },
  
  {
    table_name: 'temporary_uploads',
    category: 'temporary_data',
    retention_period_days: 30,
    soft_delete_period_days: 0,
    archive_before_delete: false,
    archive_storage: 'cold',
    compliance_requirements: [],
    purge_conditions: [
      {
        column: 'created_at',
        condition: 'older_than',
        value: 30
      },
      {
        column: 'processed',
        condition: 'equals',
        value: true,
        logical_operator: 'AND'
      }
    ],
    exceptions: []
  },
  
  // Analytics Data (2 years)
  {
    table_name: 'usage_analytics',
    category: 'analytics_data',
    retention_period_days: 730, // 2 years
    soft_delete_period_days: 0,
    archive_before_delete: true,
    archive_storage: 'cold',
    compliance_requirements: ['Business Intelligence'],
    purge_conditions: [
      {
        column: 'recorded_at',
        condition: 'older_than',
        value: 730
      }
    ],
    exceptions: [
      {
        condition: 'event_type = "conversion" OR revenue_impact > 1000',
        extended_retention_days: 1825, // 5 years for high-value events
        reason: 'Long-term business analysis'
      }
    ]
  },
  
  {
    table_name: 'feature_usage_metrics',
    category: 'analytics_data',
    retention_period_days: 730, // 2 years
    soft_delete_period_days: 0,
    archive_before_delete: false, // Aggregated data, no need to archive
    archive_storage: 'cold',
    compliance_requirements: ['Product Analytics'],
    purge_conditions: [
      {
        column: 'date',
        condition: 'older_than',
        value: 730
      }
    ],
    exceptions: []
  }
]
```

## 🚮 Automated Purge System

### Purge Job Engine
```typescript
interface PurgeJob {
  job_id: string
  table_name: string
  policy: RetentionPolicy
  schedule: string              // Cron expression
  batch_size: number           // Records to process per batch
  max_execution_time: number   // Seconds
  enabled: boolean
  last_run: Date | null
  next_run: Date
  statistics: PurgeStatistics
}

interface PurgeStatistics {
  total_runs: number
  last_run_duration: number
  last_run_records_processed: number
  last_run_records_deleted: number
  last_run_records_archived: number
  total_records_deleted: number
  total_records_archived: number
  average_execution_time: number
}

class DataPurgeEngine {
  constructor(
    private database: DatabaseConnection,
    private archivalService: ArchivalService,
    private auditLogger: AuditLogger,
    private notificationService: NotificationService
  ) {}
  
  // Execute purge job for a specific table
  async executePurgeJob(job: PurgeJob): Promise<PurgeResult> {
    const executionId = uuidv4()
    const startTime = Date.now()
    
    try {
      await this.auditLogger.log({
        action: 'purge_job_started',
        execution_id: executionId,
        table_name: job.table_name,
        policy_retention_days: job.policy.retention_period_days,
        batch_size: job.batch_size
      })
      
      const purgeResult = await this.executePurge(job, executionId)
      
      // Update job statistics
      await this.updateJobStatistics(job.job_id, purgeResult, Date.now() - startTime)
      
      // Send notifications for significant purges
      if (purgeResult.records_deleted > 1000 || purgeResult.records_archived > 1000) {
        await this.notificationService.notify({
          type: 'data_purge_completed',
          table: job.table_name,
          deleted: purgeResult.records_deleted,
          archived: purgeResult.records_archived,
          execution_time: Date.now() - startTime
        })
      }
      
      return purgeResult
      
    } catch (error) {
      await this.auditLogger.log({
        action: 'purge_job_failed',
        execution_id: executionId,
        table_name: job.table_name,
        error: error.message,
        execution_time: Date.now() - startTime
      })
      
      // Alert on purge failures
      await this.notificationService.alert({
        type: 'purge_job_failure',
        table: job.table_name,
        error: error.message,
        severity: 'high'
      })
      
      throw error
    }
  }
  
  private async executePurge(job: PurgeJob, executionId: string): Promise<PurgeResult> {
    const policy = job.policy
    let totalDeleted = 0
    let totalArchived = 0
    let batchCount = 0
    
    // Build purge query based on policy conditions
    const purgeQuery = this.buildPurgeQuery(policy)
    
    while (true) {
      // Get batch of records to purge
      const batch = await this.database.query(`
        ${purgeQuery}
        ORDER BY ${this.getPurgeOrderColumn(policy)}
        LIMIT ${job.batch_size}
      `)
      
      if (batch.rows.length === 0) {
        break // No more records to purge
      }
      
      // Archive records if required
      if (policy.archive_before_delete) {
        const archivedCount = await this.archiveRecords(
          policy.table_name,
          batch.rows,
          policy.archive_storage
        )
        totalArchived += archivedCount
      }
      
      // Delete records (soft delete first if configured)
      let deletedCount = 0
      if (policy.soft_delete_period_days && policy.soft_delete_period_days > 0) {
        deletedCount = await this.softDeleteRecords(policy.table_name, batch.rows)
      } else {
        deletedCount = await this.hardDeleteRecords(policy.table_name, batch.rows)
      }
      
      totalDeleted += deletedCount
      batchCount++
      
      // Log progress periodically
      if (batchCount % 10 === 0) {
        await this.auditLogger.log({
          action: 'purge_progress',
          execution_id: executionId,
          table_name: policy.table_name,
          batches_processed: batchCount,
          records_deleted: totalDeleted,
          records_archived: totalArchived
        })
      }
      
      // Check execution time limit
      const executionTime = (Date.now() - Date.parse(executionId)) / 1000
      if (executionTime > job.max_execution_time) {
        await this.auditLogger.log({
          action: 'purge_time_limit_reached',
          execution_id: executionId,
          table_name: policy.table_name,
          execution_time: executionTime
        })
        break
      }
      
      // Small delay to avoid overwhelming the database
      await this.sleep(100)
    }
    
    return {
      execution_id: executionId,
      records_deleted: totalDeleted,
      records_archived: totalArchived,
      batches_processed: batchCount,
      execution_time: Date.now() - Date.parse(executionId)
    }
  }
  
  private buildPurgeQuery(policy: RetentionPolicy): string {
    const conditions = []
    
    for (const condition of policy.purge_conditions) {
      let conditionSql = ''
      
      switch (condition.condition) {
        case 'older_than':
          if (typeof condition.value === 'number') {
            conditionSql = `${condition.column} < NOW() - INTERVAL '${condition.value} days'`
          }
          break
          
        case 'equals':
          conditionSql = `${condition.column} = '${condition.value}'`
          break
          
        case 'not_accessed_since':
          if (typeof condition.value === 'number') {
            conditionSql = `${condition.column} < NOW() - INTERVAL '${condition.value} days'`
          }
          break
          
        case 'user_deleted':
          conditionSql = `${condition.column} IS NOT NULL`
          break
      }
      
      if (conditionSql) {
        conditions.push(conditionSql)
      }
    }
    
    // Apply exceptions (exclude records that match exception conditions)
    const exceptionConditions = policy.exceptions.map(ex => `NOT (${ex.condition})`).join(' AND ')
    if (exceptionConditions) {
      conditions.push(exceptionConditions)
    }
    
    const whereClause = conditions.length > 0 ? conditions.join(' OR ') : '1=0'
    
    return `
      SELECT * FROM ${policy.table_name} 
      WHERE ${whereClause}
    `
  }
  
  private async archiveRecords(
    tableName: string,
    records: any[],
    storageType: 'cold' | 'glacier'
  ): Promise<number> {
    try {
      const archiveData = {
        table: tableName,
        records: records,
        archived_at: new Date().toISOString(),
        storage_tier: storageType
      }
      
      await this.archivalService.archive(archiveData, storageType)
      
      return records.length
    } catch (error) {
      console.error(`Failed to archive records from ${tableName}:`, error)
      return 0
    }
  }
  
  private async softDeleteRecords(tableName: string, records: any[]): Promise<number> {
    if (records.length === 0) return 0
    
    const ids = records.map(r => r.id).join("','")
    
    const result = await this.database.query(`
      UPDATE ${tableName} 
      SET deleted_at = NOW(), 
          updated_at = NOW()
      WHERE id IN ('${ids}')
        AND deleted_at IS NULL
    `)
    
    return result.rowCount || 0
  }
  
  private async hardDeleteRecords(tableName: string, records: any[]): Promise<number> {
    if (records.length === 0) return 0
    
    const ids = records.map(r => r.id).join("','")
    
    const result = await this.database.query(`
      DELETE FROM ${tableName} 
      WHERE id IN ('${ids}')
    `)
    
    return result.rowCount || 0
  }
}

// Purge job scheduler
class PurgeScheduler {
  private jobs: Map<string, PurgeJob> = new Map()
  
  constructor(private purgeEngine: DataPurgeEngine) {
    this.initializeJobs()
  }
  
  private initializeJobs(): void {
    for (const policy of TABLE_RETENTION_POLICIES) {
      const job: PurgeJob = {
        job_id: uuidv4(),
        table_name: policy.table_name,
        policy: policy,
        schedule: this.generateSchedule(policy),
        batch_size: this.calculateBatchSize(policy),
        max_execution_time: this.calculateMaxExecutionTime(policy),
        enabled: true,
        last_run: null,
        next_run: this.calculateNextRun(this.generateSchedule(policy)),
        statistics: {
          total_runs: 0,
          last_run_duration: 0,
          last_run_records_processed: 0,
          last_run_records_deleted: 0,
          last_run_records_archived: 0,
          total_records_deleted: 0,
          total_records_archived: 0,
          average_execution_time: 0
        }
      }
      
      this.jobs.set(policy.table_name, job)
    }
  }
  
  private generateSchedule(policy: RetentionPolicy): string {
    // Generate appropriate cron schedule based on data volume and retention period
    if (policy.category === 'temporary_data') {
      return '0 */6 * * *' // Every 6 hours for temporary data
    } else if (policy.category === 'system_logs') {
      return '0 2 * * *'   // Daily at 2 AM for logs
    } else if (policy.category === 'analytics_data') {
      return '0 3 * * 0'   // Weekly on Sunday at 3 AM
    } else {
      return '0 4 * * 0'   // Weekly on Sunday at 4 AM for business data
    }
  }
  
  private calculateBatchSize(policy: RetentionPolicy): number {
    // Adjust batch size based on expected data volume
    switch (policy.category) {
      case 'temporary_data':
        return 1000  // Smaller batches for frequent purges
      case 'system_logs':
        return 5000  // Medium batches for logs
      case 'analytics_data':
        return 2000  // Medium batches for analytics
      default:
        return 500   // Conservative batches for business data
    }
  }
  
  private calculateMaxExecutionTime(policy: RetentionPolicy): number {
    // Set execution time limits based on criticality
    switch (policy.category) {
      case 'temporary_data':
        return 1800  // 30 minutes
      case 'system_logs':
        return 3600  // 1 hour
      default:
        return 7200  // 2 hours for business data
    }
  }
}
```

## 📦 Data Archival System

### Multi-Tier Archival Strategy
```typescript
interface ArchivalTier {
  name: string
  storage_class: 'hot' | 'warm' | 'cold' | 'glacier'
  cost_per_gb_month: number
  retrieval_time: string
  minimum_storage_duration_days: number
  use_cases: string[]
}

const ARCHIVAL_TIERS: ArchivalTier[] = [
  {
    name: 'hot_storage',
    storage_class: 'hot',
    cost_per_gb_month: 0.023,
    retrieval_time: 'immediate',
    minimum_storage_duration_days: 0,
    use_cases: ['active_data', 'frequent_access']
  },
  {
    name: 'warm_storage', 
    storage_class: 'warm',
    cost_per_gb_month: 0.0125,
    retrieval_time: 'within minutes',
    minimum_storage_duration_days: 30,
    use_cases: ['infrequent_access', 'backup_data']
  },
  {
    name: 'cold_storage',
    storage_class: 'cold',
    cost_per_gb_month: 0.004,
    retrieval_time: '1-5 hours',
    minimum_storage_duration_days: 90,
    use_cases: ['archival', 'compliance', 'long_term_retention']
  },
  {
    name: 'glacier_storage',
    storage_class: 'glacier',
    cost_per_gb_month: 0.001,
    retrieval_time: '3-12 hours',
    minimum_storage_duration_days: 365,
    use_cases: ['deep_archival', 'disaster_recovery', 'legal_hold']
  }
]

class ArchivalService {
  constructor(
    private s3Client: S3Client,
    private compressionService: CompressionService,
    private encryptionService: EncryptionService,
    private auditLogger: AuditLogger
  ) {}
  
  async archive(data: ArchiveData, storageClass: 'cold' | 'glacier'): Promise<ArchiveResult> {
    const archiveId = uuidv4()
    
    try {
      // Compress data for storage efficiency
      const compressedData = await this.compressionService.compress(JSON.stringify(data))
      
      // Encrypt compressed data
      const encryptedData = await this.encryptionService.encrypt(compressedData)
      
      // Generate archive key
      const archiveKey = this.generateArchiveKey(data.table, archiveId)
      
      // Upload to appropriate storage tier
      const uploadResult = await this.s3Client.putObject({
        Bucket: process.env.ARCHIVE_BUCKET,
        Key: archiveKey,
        Body: encryptedData,
        StorageClass: storageClass.toUpperCase(),
        Metadata: {
          table_name: data.table,
          record_count: String(data.records.length),
          archived_at: data.archived_at,
          compression: 'gzip',
          encryption: 'aes-256-gcm'
        },
        ServerSideEncryption: 'AES256'
      })
      
      // Store archive metadata in database
      await this.storeArchiveMetadata({
        archive_id: archiveId,
        table_name: data.table,
        record_count: data.records.length,
        storage_class: storageClass,
        storage_key: archiveKey,
        storage_size: encryptedData.length,
        archived_at: new Date(data.archived_at),
        etag: uploadResult.ETag
      })
      
      await this.auditLogger.log({
        action: 'data_archived',
        archive_id: archiveId,
        table_name: data.table,
        record_count: data.records.length,
        storage_class: storageClass,
        compressed_size: encryptedData.length,
        original_size: JSON.stringify(data).length
      })
      
      return {
        archive_id: archiveId,
        storage_key: archiveKey,
        record_count: data.records.length,
        compressed_size: encryptedData.length,
        storage_class: storageClass
      }
      
    } catch (error) {
      await this.auditLogger.log({
        action: 'data_archive_failed',
        archive_id: archiveId,
        table_name: data.table,
        error: error.message
      })
      
      throw error
    }
  }
  
  async retrieve(archiveId: string): Promise<any[]> {
    const metadata = await this.getArchiveMetadata(archiveId)
    if (!metadata) {
      throw new Error(`Archive not found: ${archiveId}`)
    }
    
    // For glacier storage, initiate restore if needed
    if (metadata.storage_class === 'glacier') {
      const restoreStatus = await this.checkRestoreStatus(metadata.storage_key)
      if (!restoreStatus.restored) {
        if (!restoreStatus.restore_in_progress) {
          await this.initiateRestore(metadata.storage_key)
        }
        throw new Error('Archive is in Glacier storage and restore is in progress')
      }
    }
    
    // Retrieve encrypted data
    const object = await this.s3Client.getObject({
      Bucket: process.env.ARCHIVE_BUCKET,
      Key: metadata.storage_key
    })
    
    const encryptedData = await object.Body?.transformToByteArray()
    if (!encryptedData) {
      throw new Error('Failed to retrieve archive data')
    }
    
    // Decrypt and decompress
    const compressedData = await this.encryptionService.decrypt(Buffer.from(encryptedData))
    const jsonData = await this.compressionService.decompress(compressedData)
    const archiveData = JSON.parse(jsonData.toString())
    
    await this.auditLogger.log({
      action: 'data_retrieved_from_archive',
      archive_id: archiveId,
      table_name: metadata.table_name,
      record_count: metadata.record_count
    })
    
    return archiveData.records
  }
  
  private generateArchiveKey(tableName: string, archiveId: string): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `archives/${tableName}/${year}/${month}/${day}/${archiveId}.gz.enc`
  }
  
  private async initiateRestore(storageKey: string): Promise<void> {
    await this.s3Client.restoreObject({
      Bucket: process.env.ARCHIVE_BUCKET,
      Key: storageKey,
      RestoreRequest: {
        Days: 7, // Keep restored data available for 7 days
        GlacierJobParameters: {
          Tier: 'Standard' // Standard retrieval (3-5 hours)
        }
      }
    })
  }
}
```

## ⚖️ Compliance & Legal Hold Management

### Legal Hold System
```typescript
interface LegalHold {
  hold_id: string
  matter_name: string
  matter_number: string
  custodians: string[]          // User IDs subject to hold
  date_ranges: DateRange[]      // Time periods covered
  data_types: string[]          // Types of data to preserve
  tables_affected: string[]     // Database tables under hold
  status: 'active' | 'released' | 'expired'
  created_at: Date
  created_by: string
  released_at?: Date
  released_by?: string
  expiry_date?: Date
}

interface DateRange {
  start_date: Date
  end_date?: Date               // Null for ongoing preservation
}

class LegalHoldManager {
  constructor(
    private database: DatabaseConnection,
    private auditLogger: AuditLogger
  ) {}
  
  async createLegalHold(holdRequest: LegalHoldRequest): Promise<LegalHold> {
    const holdId = uuidv4()
    
    const legalHold: LegalHold = {
      hold_id: holdId,
      matter_name: holdRequest.matter_name,
      matter_number: holdRequest.matter_number,
      custodians: holdRequest.custodians,
      date_ranges: holdRequest.date_ranges,
      data_types: holdRequest.data_types,
      tables_affected: this.getAffectedTables(holdRequest.data_types),
      status: 'active',
      created_at: new Date(),
      created_by: holdRequest.created_by,
      expiry_date: holdRequest.expiry_date
    }
    
    // Store legal hold record
    await this.database.query(`
      INSERT INTO legal_holds (
        hold_id, matter_name, matter_number, custodians, 
        date_ranges, data_types, tables_affected, status,
        created_at, created_by, expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      legalHold.hold_id,
      legalHold.matter_name,
      legalHold.matter_number,
      JSON.stringify(legalHold.custodians),
      JSON.stringify(legalHold.date_ranges),
      JSON.stringify(legalHold.data_types),
      JSON.stringify(legalHold.tables_affected),
      legalHold.status,
      legalHold.created_at,
      legalHold.created_by,
      legalHold.expiry_date
    ])
    
    // Apply hold markers to affected records
    await this.applyHoldMarkers(legalHold)
    
    await this.auditLogger.log({
      action: 'legal_hold_created',
      hold_id: holdId,
      matter_name: legalHold.matter_name,
      tables_affected: legalHold.tables_affected,
      custodians: legalHold.custodians.length
    })
    
    return legalHold
  }
  
  private async applyHoldMarkers(hold: LegalHold): Promise<void> {
    for (const tableName of hold.tables_affected) {
      // Add legal_hold_ids column if it doesn't exist
      await this.ensureLegalHoldColumn(tableName)
      
      // Build condition based on custodians and date ranges
      const conditions = this.buildHoldConditions(hold, tableName)
      
      if (conditions) {
        await this.database.query(`
          UPDATE ${tableName}
          SET legal_hold_ids = COALESCE(legal_hold_ids, '[]'::jsonb) || $1
          WHERE ${conditions}
        `, [JSON.stringify([hold.hold_id])])
      }
    }
  }
  
  // Check if record is under legal hold before deletion
  async isUnderLegalHold(tableName: string, recordId: string): Promise<boolean> {
    const result = await this.database.query(`
      SELECT legal_hold_ids 
      FROM ${tableName} 
      WHERE id = $1
    `, [recordId])
    
    if (!result.rows[0] || !result.rows[0].legal_hold_ids) {
      return false
    }
    
    const holdIds = result.rows[0].legal_hold_ids as string[]
    if (holdIds.length === 0) {
      return false
    }
    
    // Check if any of the holds are still active
    const activeHolds = await this.database.query(`
      SELECT COUNT(*) 
      FROM legal_holds 
      WHERE hold_id = ANY($1) 
        AND status = 'active'
    `, [holdIds])
    
    return parseInt(activeHolds.rows[0].count) > 0
  }
}
```

## 📊 Retention Monitoring & Reporting

### Retention Dashboard
```typescript
interface RetentionReport {
  generated_at: Date
  tables: TableRetentionStatus[]
  compliance_status: ComplianceStatus
  storage_metrics: StorageMetrics
  upcoming_purges: UpcomingPurge[]
}

interface TableRetentionStatus {
  table_name: string
  total_records: number
  eligible_for_purge: number
  under_legal_hold: number
  archived_records: number
  last_purge_date: Date | null
  next_purge_date: Date
  compliance_status: 'compliant' | 'warning' | 'violation'
}

interface StorageMetrics {
  total_storage_gb: number
  hot_storage_gb: number
  warm_storage_gb: number
  cold_storage_gb: number
  glacier_storage_gb: number
  monthly_storage_cost: number
  projected_savings_after_purge: number
}

class RetentionMonitoringService {
  async generateRetentionReport(): Promise<RetentionReport> {
    const report: RetentionReport = {
      generated_at: new Date(),
      tables: await this.analyzeTableRetention(),
      compliance_status: await this.checkComplianceStatus(),
      storage_metrics: await this.calculateStorageMetrics(),
      upcoming_purges: await this.getUpcomingPurges()
    }
    
    return report
  }
  
  private async analyzeTableRetention(): Promise<TableRetentionStatus[]> {
    const tableStatuses: TableRetentionStatus[] = []
    
    for (const policy of TABLE_RETENTION_POLICIES) {
      const purgeQuery = this.buildPurgeQuery(policy)
      
      // Count total records
      const totalResult = await this.database.query(`
        SELECT COUNT(*) as total FROM ${policy.table_name}
      `)
      
      // Count eligible for purge
      const purgeResult = await this.database.query(`
        SELECT COUNT(*) as eligible 
        FROM (${purgeQuery}) as purgeable
      `)
      
      // Count under legal hold
      const holdResult = await this.database.query(`
        SELECT COUNT(*) as on_hold
        FROM ${policy.table_name}
        WHERE legal_hold_ids IS NOT NULL 
          AND jsonb_array_length(legal_hold_ids) > 0
      `)
      
      // Get last purge date
      const lastPurgeResult = await this.database.query(`
        SELECT MAX(completed_at) as last_purge
        FROM purge_job_history
        WHERE table_name = $1 AND status = 'completed'
      `, [policy.table_name])
      
      tableStatuses.push({
        table_name: policy.table_name,
        total_records: parseInt(totalResult.rows[0].total),
        eligible_for_purge: parseInt(purgeResult.rows[0].eligible),
        under_legal_hold: parseInt(holdResult.rows[0].on_hold),
        archived_records: await this.getArchivedRecordCount(policy.table_name),
        last_purge_date: lastPurgeResult.rows[0].last_purge,
        next_purge_date: await this.getNextPurgeDate(policy.table_name),
        compliance_status: await this.evaluateTableCompliance(policy)
      })
    }
    
    return tableStatuses
  }
  
  private async evaluateTableCompliance(policy: RetentionPolicy): Promise<'compliant' | 'warning' | 'violation'> {
    const purgeQuery = this.buildPurgeQuery(policy)
    
    // Check for records significantly over retention period
    const overdueResult = await this.database.query(`
      SELECT COUNT(*) as overdue
      FROM (${purgeQuery.replace(
        String(policy.retention_period_days),
        String(policy.retention_period_days + 90) // 90 days grace period
      )}) as overdue_records
    `)
    
    const overdueCount = parseInt(overdueResult.rows[0].overdue)
    
    if (overdueCount > 1000) {
      return 'violation' // Too many overdue records
    } else if (overdueCount > 100) {
      return 'warning'  // Some overdue records
    } else {
      return 'compliant'
    }
  }
}
```

This comprehensive data retention system provides automated lifecycle management with per-table policies, compliance alignment, legal hold support, and detailed monitoring and reporting capabilities.
