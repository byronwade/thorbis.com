# Thorbis Audit Export Specification

Comprehensive specification for exporting audit logs with cryptographic integrity verification and tamper-proof event hashing.

## 📋 Overview

The Thorbis Audit Export system provides secure, verifiable CSV/JSON export of audit logs with cryptographic signatures to ensure data integrity and non-repudiation.

### Security Guarantees
- **Integrity**: Event hashes prevent data tampering
- **Authenticity**: Digital signatures verify export source
- **Non-repudiation**: Cryptographic proof of data origin
- **Completeness**: Chain verification ensures no missing events
- **Confidentiality**: Encrypted exports for sensitive data

## 🔐 Cryptographic Architecture

### Event Hash Generation

Each audit event includes a SHA-256 hash that covers all event data plus the previous event hash, creating an immutable chain:

```typescript
interface AuditEvent {
  id: string                    // UUID v4
  timestamp: string            // ISO 8601 UTC
  tenant_id: string           // Business identifier
  user_id: string            // Acting user
  action: AuditAction        // Operation performed
  resource_type: string      // Entity affected
  resource_id: string       // Specific entity ID
  before_state?: object     // Previous state (if applicable)
  after_state?: object      // New state (if applicable)
  metadata: {
    ip_address: string
    user_agent: string
    session_id: string
    api_endpoint?: string
    request_id?: string
    idempotency_key?: string
  }
  content_hash: string      // SHA-256 of event data
  chain_hash: string        // SHA-256 including previous event
  signature: string         // HMAC-SHA256 signature
}
```

### Hash Calculation Algorithm

```typescript
// Content hash: hash of the event data itself
function calculateContentHash(event: Omit<AuditEvent, 'content_hash' | 'chain_hash' | 'signature'>): string {
  const canonical = JSON.stringify(event, Object.keys(event).sort())
  return sha256(canonical)
}

// Chain hash: includes previous event's chain hash
function calculateChainHash(contentHash: string, previousChainHash: string = ''): string {
  return sha256(`${previousChainHash}:${contentHash}`)
}

// Event signature: HMAC with secret key
function signEvent(chainHash: string, secretKey: string): string {
  return hmacSha256(chainHash, secretKey)
}

// Complete event processing
async function processAuditEvent(eventData: Partial<AuditEvent>): Promise<AuditEvent> {
  const previousEvent = await getLastAuditEvent(eventData.tenant_id)
  
  const event: Omit<AuditEvent, 'content_hash' | 'chain_hash' | 'signature'> = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...eventData
  }
  
  const contentHash = calculateContentHash(event)
  const chainHash = calculateChainHash(contentHash, previousEvent?.chain_hash)
  const signature = signEvent(chainHash, process.env.AUDIT_SIGNING_KEY!)
  
  return {
    ...event,
    content_hash: contentHash,
    chain_hash: chainHash,
    signature: signature
  }
}
```

## 📊 Export Formats

### CSV Format

**File Structure**: `thorbis-audit-{tenant_id}-{start_date}-{end_date}.csv`

```csv
id,timestamp,tenant_id,user_id,action,resource_type,resource_id,before_state_hash,after_state_hash,metadata_json,content_hash,chain_hash,signature
550e8400-e29b-41d4-a716-446655440000,2024-02-15T10:30:00.000Z,biz_123,user_456,create,customer,cust_789,null,a8b9c7d2e1f4,"{""ip_address"":""192.168.1.1""}",7f8e9d3c2b1a,6e5d4c3b2a19,9f8e7d6c5b4a3210
```

**CSV Export Configuration**:
```typescript
interface CSVExportConfig {
  delimiter: ',' | ';' | '\t'           // Field separator
  quote_char: '"' | "'"                 // Text qualifier
  escape_char: '\\' | '"'               // Escape character
  line_terminator: '\r\n' | '\n'       // Line ending
  header_row: boolean                   // Include column headers
  null_value: 'null' | '' | 'NULL'     // Null representation
  date_format: 'iso8601' | 'unix'      // Timestamp format
  json_encoding: 'escaped' | 'base64'  // Complex field encoding
  include_metadata: boolean             // Include full metadata
  hash_chain: boolean                   // Include chain verification
}
```

### JSON Format

**File Structure**: `thorbis-audit-{tenant_id}-{start_date}-{end_date}.json`

```json
{
  "export_metadata": {
    "tenant_id": "biz_123",
    "export_id": "exp_789",
    "generated_at": "2024-02-15T14:30:00.000Z",
    "generated_by": "user_admin",
    "period": {
      "start": "2024-02-01T00:00:00.000Z",
      "end": "2024-02-15T23:59:59.999Z"
    },
    "filters": {
      "actions": ["create", "update", "delete"],
      "resource_types": ["customer", "invoice"],
      "user_ids": []
    },
    "total_events": 15847,
    "file_hash": "a1b2c3d4e5f6...",
    "signature": "9f8e7d6c5b4a..."
  },
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2024-02-15T10:30:00.000Z",
      "tenant_id": "biz_123",
      "user_id": "user_456",
      "action": "create",
      "resource_type": "customer",
      "resource_id": "cust_789",
      "before_state": null,
      "after_state": {
        "name": "John Doe",
        "email": "john@example.com",
        "status": "active"
      },
      "metadata": {
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "session_id": "sess_123",
        "api_endpoint": "/api/customers",
        "request_id": "req_456"
      },
      "content_hash": "7f8e9d3c2b1a5d4f9e8b7a6c3d2e1f0a",
      "chain_hash": "6e5d4c3b2a195f8e7d6c5b4a3d2e1f09",
      "signature": "9f8e7d6c5b4a32106e5d4c3b2a195f8e"
    }
  ],
  "integrity_verification": {
    "chain_start_hash": "0000000000000000000000000000000000000000000000000000000000000000",
    "chain_end_hash": "6e5d4c3b2a195f8e7d6c5b4a3d2e1f09",
    "event_count": 15847,
    "verification_passed": true
  }
}
```

## 🔒 Export Authentication & Authorization

### API Endpoints

```typescript
// Request audit export
POST /api/audit/exports
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "tenant_id": "biz_123",
  "format": "json" | "csv",
  "period": {
    "start": "2024-02-01T00:00:00.000Z",
    "end": "2024-02-15T23:59:59.999Z"
  },
  "filters": {
    "actions": ["create", "update", "delete"],
    "resource_types": ["customer", "invoice"],
    "user_ids": ["user_123", "user_456"],
    "include_sensitive": false
  },
  "options": {
    "compress": true,
    "encrypt": false,
    "split_size_mb": 100,
    "delivery_method": "download" | "email" | "s3"
  }
}

// Response
{
  "export_id": "exp_789",
  "status": "queued",
  "estimated_completion": "2024-02-15T14:35:00.000Z",
  "download_url": "https://exports.thorbis.com/audit/exp_789",
  "expires_at": "2024-02-22T14:30:00.000Z"
}
```

### Permission Requirements

```yaml
audit_export_permissions:
  tenant_owner:
    - "audit:export:own_tenant"
    - "audit:export:include_sensitive"
    - "audit:export:all_time_periods"
    
  tenant_manager:
    - "audit:export:own_tenant" 
    - "audit:export:exclude_sensitive"
    - "audit:export:last_90_days"
    
  compliance_officer:
    - "audit:export:multiple_tenants"
    - "audit:export:include_sensitive"
    - "audit:export:all_time_periods"
    
  external_auditor:
    - "audit:export:read_only"
    - "audit:export:exclude_pii"
    - "audit:export:specific_period"

required_approvals:
  - tenant_owner_export: null
  - compliance_export: "compliance_manager"
  - external_audit_export: "tenant_owner,compliance_manager"
  - full_history_export: "tenant_owner,cto"
```

## ⚙️ Export Generation Process

### Queue-Based Processing

```typescript
interface ExportJob {
  id: string
  tenant_id: string
  requested_by: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  config: ExportConfig
  progress: {
    total_events: number
    processed_events: number
    current_phase: 'querying' | 'hashing' | 'signing' | 'formatting' | 'uploading'
  }
  result?: {
    file_path: string
    file_size_bytes: number
    file_hash: string
    download_url: string
    expires_at: string
  }
  error?: {
    code: string
    message: string
    details: object
  }
}

// Export processing pipeline
async function processExportJob(job: ExportJob): Promise<void> {
  try {
    // Phase 1: Query audit events
    job.progress.current_phase = 'querying'
    const events = await queryAuditEvents(job.config)
    job.progress.total_events = events.length
    
    // Phase 2: Verify hash chain integrity
    job.progress.current_phase = 'hashing'
    const chainVerification = await verifyEventChain(events)
    if (!chainVerification.valid) {
      throw new Error(`Chain verification failed: ${chainVerification.error}`)
    }
    
    // Phase 3: Generate export file
    job.progress.current_phase = 'formatting'
    const exportData = await formatExportData(events, job.config.format)
    
    // Phase 4: Sign export file
    job.progress.current_phase = 'signing'
    const fileHash = sha256(exportData)
    const exportSignature = signExport(fileHash, job.tenant_id)
    
    // Phase 5: Upload to secure storage
    job.progress.current_phase = 'uploading'
    const filePath = await uploadExportFile(exportData, job.id, exportSignature)
    
    // Complete job
    job.status = 'completed'
    job.result = {
      file_path: filePath,
      file_size_bytes: exportData.length,
      file_hash: fileHash,
      download_url: generateDownloadUrl(job.id),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }
    
    await notifyExportComplete(job)
    
  } catch (error) {
    job.status = 'failed'
    job.error = {
      code: error.code || 'EXPORT_ERROR',
      message: error.message,
      details: error.details || {}
    }
    await notifyExportFailed(job)
  }
}
```

### File Signing & Encryption

```typescript
// Export file signature
interface ExportSignature {
  algorithm: 'RSASSA-PSS' | 'ECDSA'
  hash_algorithm: 'SHA-256'
  key_id: string
  signature: string
  timestamp: string
  signer: string
}

// Sign export file
async function signExportFile(fileData: Buffer, signingKey: string): Promise<ExportSignature> {
  const fileHash = sha256(fileData)
  const signature = await sign(fileHash, signingKey)
  
  return {
    algorithm: 'RSASSA-PSS',
    hash_algorithm: 'SHA-256', 
    key_id: await getKeyId(signingKey),
    signature: signature,
    timestamp: new Date().toISOString(),
    signer: 'thorbis-audit-system'
  }
}

// Encrypt export (optional)
interface EncryptionConfig {
  enabled: boolean
  algorithm: 'AES-256-GCM'
  key_derivation: 'PBKDF2' | 'scrypt'
  recipient_public_key?: string
}

async function encryptExportFile(
  fileData: Buffer, 
  config: EncryptionConfig,
  password?: string
): Promise<{encrypted: Buffer, metadata: object}> {
  if (!config.enabled) {
    return { encrypted: fileData, metadata: {} }
  }
  
  const key = password 
    ? await deriveKey(password, config.key_derivation)
    : await generateRandomKey()
    
  const encrypted = await encrypt(fileData, key, config.algorithm)
  
  return {
    encrypted: encrypted.data,
    metadata: {
      algorithm: config.algorithm,
      iv: encrypted.iv,
      auth_tag: encrypted.authTag,
      key_derivation: config.key_derivation,
      salt: encrypted.salt
    }
  }
}
```

## ✅ Integrity Verification

### Chain Verification Process

```typescript
// Verify complete event chain
interface ChainVerificationResult {
  valid: boolean
  total_events: number
  verified_events: number
  first_event: {
    id: string
    chain_hash: string
  }
  last_event: {
    id: string  
    chain_hash: string
  }
  broken_links: Array<{
    event_id: string
    expected_hash: string
    actual_hash: string
    position: number
  }>
  missing_events: string[]
  errors: string[]
}

async function verifyEventChain(events: AuditEvent[]): Promise<ChainVerificationResult> {
  const result: ChainVerificationResult = {
    valid: true,
    total_events: events.length,
    verified_events: 0,
    first_event: null,
    last_event: null,
    broken_links: [],
    missing_events: [],
    errors: []
  }
  
  if (events.length === 0) {
    result.errors.push('No events to verify')
    result.valid = false
    return result
  }
  
  // Sort events by timestamp
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  
  result.first_event = {
    id: events[0].id,
    chain_hash: events[0].chain_hash
  }
  
  let previousChainHash = ''
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    
    try {
      // Verify content hash
      const expectedContentHash = calculateContentHash({
        id: event.id,
        timestamp: event.timestamp,
        tenant_id: event.tenant_id,
        user_id: event.user_id,
        action: event.action,
        resource_type: event.resource_type,
        resource_id: event.resource_id,
        before_state: event.before_state,
        after_state: event.after_state,
        metadata: event.metadata
      })
      
      if (expectedContentHash !== event.content_hash) {
        result.broken_links.push({
          event_id: event.id,
          expected_hash: expectedContentHash,
          actual_hash: event.content_hash,
          position: i
        })
        result.valid = false
        continue
      }
      
      // Verify chain hash  
      const expectedChainHash = calculateChainHash(event.content_hash, previousChainHash)
      if (expectedChainHash !== event.chain_hash) {
        result.broken_links.push({
          event_id: event.id,
          expected_hash: expectedChainHash,
          actual_hash: event.chain_hash,
          position: i
        })
        result.valid = false
        continue
      }
      
      // Verify signature
      const expectedSignature = signEvent(event.chain_hash, process.env.AUDIT_SIGNING_KEY!)
      if (expectedSignature !== event.signature) {
        result.errors.push(`Invalid signature for event ${event.id}`)
        result.valid = false
        continue
      }
      
      previousChainHash = event.chain_hash
      result.verified_events++
      
    } catch (error) {
      result.errors.push(`Verification error for event ${event.id}: ${error.message}`)
      result.valid = false
    }
  }
  
  result.last_event = {
    id: events[events.length - 1].id,
    chain_hash: events[events.length - 1].chain_hash
  }
  
  return result
}
```

### File Integrity Verification

```typescript
// Verify downloaded export file
interface FileVerificationResult {
  file_valid: boolean
  signature_valid: boolean
  chain_valid: boolean
  file_hash: string
  expected_hash: string
  signature_verification: {
    algorithm: string
    signer: string
    timestamp: string
    valid: boolean
  }
  chain_verification: ChainVerificationResult
  errors: string[]
}

async function verifyExportFile(
  filePath: string,
  expectedSignature: ExportSignature,
  publicKey: string
): Promise<FileVerificationResult> {
  const result: FileVerificationResult = {
    file_valid: false,
    signature_valid: false,
    chain_valid: false,
    file_hash: '',
    expected_hash: '',
    signature_verification: null,
    chain_verification: null,
    errors: []
  }
  
  try {
    // Read and hash file
    const fileData = await fs.readFile(filePath)
    result.file_hash = sha256(fileData)
    
    // Verify file signature
    result.signature_verification = await verifyFileSignature(
      result.file_hash,
      expectedSignature,
      publicKey
    )
    result.signature_valid = result.signature_verification.valid
    
    // Parse export data
    const exportData = JSON.parse(fileData.toString())
    
    // Verify event chain integrity  
    result.chain_verification = await verifyEventChain(exportData.events)
    result.chain_valid = result.chain_verification.valid
    
    // Overall file validity
    result.file_valid = result.signature_valid && result.chain_valid
    
  } catch (error) {
    result.errors.push(`File verification error: ${error.message}`)
  }
  
  return result
}

// Command-line verification tool
async function verifyCommand(filePath: string, signaturePath: string, publicKeyPath: string) {
  const signature = JSON.parse(await fs.readFile(signaturePath, 'utf8'))
  const publicKey = await fs.readFile(publicKeyPath, 'utf8')
  
  const verification = await verifyExportFile(filePath, signature, publicKey)
  
  console.log('=== Thorbis Audit Export Verification ===')
  console.log(`File: ${filePath}`)
  console.log(`File Hash: ${verification.file_hash}`)
  console.log(`Signature Valid: ${verification.signature_valid ? '✅' : '❌'}`)
  console.log(`Chain Valid: ${verification.chain_valid ? '✅' : '❌'}`)
  console.log(`Overall Valid: ${verification.file_valid ? '✅' : '❌'}`)
  
  if (verification.errors.length > 0) {
    console.log('\n=== Errors ===')
    verification.errors.forEach(error => console.log(`❌ ${error}`))
  }
  
  if (verification.chain_verification) {
    console.log('\n=== Chain Verification ===')
    console.log(`Total Events: ${verification.chain_verification.total_events}`)
    console.log(`Verified Events: ${verification.chain_verification.verified_events}`)
    console.log(`Broken Links: ${verification.chain_verification.broken_links.length}`)
    
    if (verification.chain_verification.broken_links.length > 0) {
      console.log('\n=== Broken Chain Links ===')
      verification.chain_verification.broken_links.forEach(link => {
        console.log(`Event ${link.event_id} at position ${link.position}:`)
        console.log(`  Expected: ${link.expected_hash}`)
        console.log(`  Actual: ${link.actual_hash}`)
      })
    }
  }
  
  process.exit(verification.file_valid ? 0 : 1)
}
```

## 📂 Export Storage & Retention

### Secure Storage Configuration

```typescript
interface StorageConfig {
  provider: 'aws-s3' | 'azure-blob' | 'gcp-storage'
  bucket: string
  encryption: {
    at_rest: boolean
    in_transit: boolean
    key_management: 'aws-kms' | 'azure-keyvault' | 'gcp-kms'
  }
  access_control: {
    signed_urls: boolean
    url_expiry_hours: number
    ip_restrictions: string[]
    require_mfa: boolean
  }
  lifecycle: {
    retention_days: number
    archive_after_days: number
    delete_after_days: number
  }
}

const EXPORT_STORAGE_CONFIG: StorageConfig = {
  provider: 'aws-s3',
  bucket: 'thorbis-audit-exports-prod',
  encryption: {
    at_rest: true,
    in_transit: true,
    key_management: 'aws-kms'
  },
  access_control: {
    signed_urls: true,
    url_expiry_hours: 168, // 7 days
    ip_restrictions: [], // Allow from anywhere (signed URLs provide security)
    require_mfa: true
  },
  lifecycle: {
    retention_days: 2555, // 7 years
    archive_after_days: 90,
    delete_after_days: 2555
  }
}
```

### Access Logging

All export access is logged for compliance:

```typescript
interface ExportAccessLog {
  id: string
  export_id: string
  accessed_by: string
  access_type: 'download' | 'view' | 'verify'
  ip_address: string
  user_agent: string
  timestamp: string
  bytes_transferred?: number
  verification_result?: boolean
  access_granted: boolean
  denial_reason?: string
}

// Log export access
async function logExportAccess(
  exportId: string,
  userId: string,
  accessType: string,
  request: Request
): Promise<void> {
  const accessLog: ExportAccessLog = {
    id: uuidv4(),
    export_id: exportId,
    accessed_by: userId,
    access_type: accessType as any,
    ip_address: request.ip,
    user_agent: request.headers['user-agent'],
    timestamp: new Date().toISOString(),
    access_granted: true
  }
  
  await db.export_access_logs.insert(accessLog)
  
  // Also create audit event for the access
  await createAuditEvent({
    action: 'export_accessed',
    resource_type: 'audit_export',
    resource_id: exportId,
    user_id: userId,
    metadata: {
      access_type: accessType,
      ip_address: request.ip,
      user_agent: request.headers['user-agent']
    }
  })
}
```

## 🛠️ Implementation Examples

### Export Request Handler

```typescript
// Express.js route handler
app.post('/api/audit/exports', authenticateToken, async (req, res) => {
  try {
    // Validate permissions
    const hasPermission = await checkPermission(
      req.user.id,
      'audit:export:own_tenant',
      req.body.tenant_id
    )
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to export audit logs for this tenant'
      })
    }
    
    // Validate request
    const exportRequest = validateExportRequest(req.body)
    if (exportRequest.errors.length > 0) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        details: exportRequest.errors
      })
    }
    
    // Check rate limits
    const rateLimitOk = await checkRateLimit(req.user.id, 'audit_export', {
      maxRequests: 5,
      windowMinutes: 60
    })
    
    if (!rateLimitOk) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many export requests. Please wait before requesting another export.'
      })
    }
    
    // Create export job
    const exportJob: ExportJob = {
      id: uuidv4(),
      tenant_id: exportRequest.tenant_id,
      requested_by: req.user.id,
      status: 'queued',
      priority: exportRequest.urgent ? 'high' : 'normal',
      config: exportRequest,
      progress: {
        total_events: 0,
        processed_events: 0,
        current_phase: 'querying'
      }
    }
    
    // Queue for processing
    await queueExportJob(exportJob)
    
    // Return job details
    res.status(202).json({
      export_id: exportJob.id,
      status: 'queued',
      estimated_completion: calculateEstimatedCompletion(exportRequest),
      download_url: `${process.env.API_BASE_URL}/api/audit/exports/${exportJob.id}/download`,
      status_url: `${process.env.API_BASE_URL}/api/audit/exports/${exportJob.id}/status`,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })
    
    // Log the export request
    await createAuditEvent({
      action: 'export_requested',
      resource_type: 'audit_export',
      resource_id: exportJob.id,
      user_id: req.user.id,
      metadata: {
        tenant_id: exportRequest.tenant_id,
        format: exportRequest.format,
        period: exportRequest.period,
        filters: exportRequest.filters
      }
    })
    
  } catch (error) {
    console.error('Export request failed:', error)
    res.status(500).json({
      error: 'EXPORT_REQUEST_FAILED',
      message: 'Failed to create export request'
    })
  }
})
```

### Download Handler with Integrity Verification

```typescript
// Download endpoint with built-in verification
app.get('/api/audit/exports/:exportId/download', authenticateToken, async (req, res) => {
  try {
    const exportJob = await getExportJob(req.params.exportId)
    
    if (!exportJob) {
      return res.status(404).json({ error: 'EXPORT_NOT_FOUND' })
    }
    
    // Check permissions
    const canAccess = await canAccessExport(req.user.id, exportJob)
    if (!canAccess) {
      await logExportAccess(exportJob.id, req.user.id, 'download', req)
      return res.status(403).json({ error: 'ACCESS_DENIED' })
    }
    
    // Check if export is ready
    if (exportJob.status !== 'completed') {
      return res.status(202).json({
        status: exportJob.status,
        message: 'Export is not ready for download'
      })
    }
    
    // Generate signed download URL
    const downloadUrl = await generateSignedDownloadUrl(
      exportJob.result.file_path,
      3600 // 1 hour expiry
    )
    
    // Log access
    await logExportAccess(exportJob.id, req.user.id, 'download', req)
    
    // Include integrity verification info in headers
    res.setHeader('X-File-Hash', exportJob.result.file_hash)
    res.setHeader('X-Signature', exportJob.result.signature || '')
    res.setHeader('X-Chain-Verification', 'required')
    res.setHeader('Content-Disposition', 
      `attachment; filename="thorbis-audit-${exportJob.tenant_id}-${exportJob.id}.${exportJob.config.format}"`
    )
    
    // Redirect to signed URL or stream file
    if (downloadUrl.startsWith('http')) {
      res.redirect(302, downloadUrl)
    } else {
      // Stream local file
      const fileStream = fs.createReadStream(downloadUrl)
      fileStream.pipe(res)
    }
    
  } catch (error) {
    console.error('Export download failed:', error)
    res.status(500).json({
      error: 'DOWNLOAD_FAILED',
      message: 'Failed to download export file'
    })
  }
})
```

## 📋 Compliance & Audit Trail

### Regulatory Compliance

```typescript
interface ComplianceConfig {
  regulations: {
    gdpr: {
      enabled: boolean
      data_retention_days: number
      pseudonymization: boolean
      right_to_erasure: boolean
    }
    sox: {
      enabled: boolean
      financial_data_retention_years: number
      segregation_of_duties: boolean
      change_management: boolean
    }
    hipaa: {
      enabled: boolean
      phi_encryption: boolean
      access_logging: boolean
      breach_notification: boolean
    }
  }
  export_controls: {
    require_approval: boolean
    approval_workflow: string[]
    maximum_export_period_days: number
    sensitive_data_handling: 'exclude' | 'redact' | 'encrypt'
  }
}

// Compliance-aware export processing
async function processComplianceExport(
  exportRequest: ExportRequest,
  complianceConfig: ComplianceConfig
): Promise<ExportJob> {
  // Apply regulation-specific controls
  if (complianceConfig.regulations.gdpr.enabled) {
    exportRequest = await applyGDPRControls(exportRequest)
  }
  
  if (complianceConfig.regulations.sox.enabled) {
    exportRequest = await applySOXControls(exportRequest)
  }
  
  // Apply sensitive data handling
  if (complianceConfig.export_controls.sensitive_data_handling === 'exclude') {
    exportRequest.filters.exclude_sensitive = true
  } else if (complianceConfig.export_controls.sensitive_data_handling === 'redact') {
    exportRequest.options.redact_pii = true
  }
  
  return processExportJob(exportRequest)
}
```

This comprehensive audit export specification provides enterprise-grade security, integrity verification, and compliance capabilities for the Thorbis Business OS platform.
