# Thorbis Secrets Rotation & Token Management

Comprehensive secrets rotation system with automated token lifecycle management and secure signed action links.

## 🔐 Token Lifecycle Management

### Token Categories & Lifetimes

```yaml
# Authentication Tokens
access_tokens:
  lifetime: "15 minutes"
  refresh_threshold: "5 minutes"  # Refresh when 5min remaining
  issuer: "thorbis-auth"
  algorithm: "RS256"
  
refresh_tokens:
  lifetime: "30 days"
  rotation_on_use: true          # Issue new refresh token on each use
  family_tracking: true          # Track token families for breach detection
  revocation_cascade: true       # Revoke entire family on suspicious activity

api_keys:
  lifetime: "90 days"
  prefix: "tbk_"                 # Thorbis API Key prefix
  entropy_bits: 256
  rotation_warning: "7 days"     # Warn 7 days before expiry
  grace_period: "24 hours"       # Allow old key for 24h after rotation

# System Tokens
service_tokens:
  lifetime: "24 hours"
  auto_rotation: true
  prefix: "tbs_"                 # Thorbis Service prefix
  
webhook_tokens:
  lifetime: "1 hour"
  auto_generation: true
  prefix: "tbw_"                 # Thorbis Webhook prefix

# Temporary Access Tokens
signed_action_links:
  lifetime: "30 minutes"
  single_use: true
  action_scoped: true
  prefix: "tba_"                 # Thorbis Action prefix

password_reset_tokens:
  lifetime: "1 hour"
  single_use: true
  prefix: "tbr_"                 # Thorbis Reset prefix

email_verification_tokens:
  lifetime: "24 hours"
  single_use: true
  prefix: "tbe_"                 # Thorbis Email prefix
```

### Token Structure & Claims

```typescript
interface ThorbisBearerToken {
  // Standard JWT claims
  iss: 'thorbis-auth'            // Issuer
  sub: string                    // Subject (user_id)
  aud: 'thorbis-api'            // Audience
  iat: number                    // Issued at
  exp: number                    // Expires at
  nbf: number                    // Not before
  jti: string                    // JWT ID (for revocation)
  
  // Thorbis-specific claims
  tenant_id: string              // Multi-tenant isolation for multi-tenant support
  role: 'owner' | 'manager' | 'staff' | 'viewer' | 'api_partner'
  permissions: string[]          // Fine-grained permissions
  session_id: string            // Session tracking
  token_type: 'access' | 'refresh' | 'service'
  
  // Security claims
  device_fingerprint?: string    // Device identification
  ip_address?: string           // IP address binding
  mfa_verified: boolean         // MFA status
  last_password_change: number  // Password change timestamp
  
  // Feature flags
  features: string[]            // Enabled features for user
}

interface ThorbisActionToken {
  // Standard claims
  iss: 'thorbis-actions'
  exp: number
  iat: number
  nbf: number
  jti: string
  
  // Action-specific claims
  action: string                // Action identifier (e.g., 'confirm_payment')
  resource_id: string           // Resource being acted upon
  tenant_id: string            // Tenant context
  user_id: string              // User authorized for action
  
  // Security constraints
  ip_allowlist?: string[]       // Restrict to specific IPs
  user_agent_hash?: string      // Bind to specific browser
  single_use: true              // Token can only be used once
  
  // Action parameters
  params: Record<string, any>   // Action-specific parameters
  confirmation_required: boolean // Requires additional confirmation
}
```

## 🔄 Automated Rotation System

### Rotation Scheduler
```typescript
class SecretsRotationScheduler {
  private rotationJobs: Map<string, RotationJob> = new Map()
  
  constructor(
    private tokenStore: TokenStore,
    private notificationService: NotificationService,
    private auditLogger: AuditLogger
  ) {}
  
  // Schedule rotation based on token lifetime
  scheduleRotation(tokenType: string, config: TokenConfig): void {
    const warningTime = config.lifetime * 0.8  // Warn at 80% of lifetime
    const rotationTime = config.lifetime * 0.9 // Rotate at 90% of lifetime
    
    // Schedule warning notification
    const warningJob = cron.schedule(this.calculateCronExpression(warningTime), () => {
      this.sendRotationWarning(tokenType, config)
    })
    
    // Schedule automatic rotation
    const rotationJob = cron.schedule(this.calculateCronExpression(rotationTime), () => {
      this.performRotation(tokenType, config)
    })
    
    this.rotationJobs.set(`${tokenType}_warning`, warningJob)
    this.rotationJobs.set(`${tokenType}_rotation`, rotationJob)
  }
  
  // Perform token rotation
  async performRotation(tokenType: string, config: TokenConfig): Promise<void> {
    const rotationId = uuidv4()
    
    try {
      await this.auditLogger.log({
        action: 'token_rotation_started',
        token_type: tokenType,
        rotation_id: rotationId,
        timestamp: new Date().toISOString()
      })
      
      switch (tokenType) {
        case 'api_keys':
          await this.rotateApiKeys(config, rotationId)
          break
        case 'service_tokens':
          await this.rotateServiceTokens(config, rotationId)
          break
        case 'webhook_tokens':
          await this.rotateWebhookTokens(config, rotationId)
          break
        default:
          throw new Error(`Unknown token type: ${tokenType}`)
      }
      
      await this.auditLogger.log({
        action: 'token_rotation_completed',
        token_type: tokenType,
        rotation_id: rotationId,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      await this.auditLogger.log({
        action: 'token_rotation_failed',
        token_type: tokenType,
        rotation_id: rotationId,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      
      // Alert on rotation failure
      await this.notificationService.alertSecurityTeam({
        type: 'token_rotation_failure',
        token_type: tokenType,
        error: error.message,
        severity: 'high'
      })
      
      throw error
    }
  }
  
  // Rotate API keys with grace period
  private async rotateApiKeys(config: TokenConfig, rotationId: string): Promise<void> {
    const activeKeys = await this.tokenStore.getActiveApiKeys()
    
    for (const keyRecord of activeKeys) {
      if (this.shouldRotate(keyRecord, config)) {
        // Generate new API key
        const newKey = await this.generateApiKey(keyRecord.tenant_id, config)
        
        // Set old key to expire after grace period
        await this.tokenStore.scheduleExpiration(
          keyRecord.key_id,
          new Date(Date.now() + config.grace_period)
        )
        
        // Notify tenant of new API key
        await this.notificationService.notifyTenant(keyRecord.tenant_id, {
          type: 'api_key_rotated',
          new_key: newKey,
          old_key_expires: new Date(Date.now() + config.grace_period),
          rotation_id: rotationId
        })
        
        await this.auditLogger.log({
          action: 'api_key_rotated',
          tenant_id: keyRecord.tenant_id,
          old_key_id: keyRecord.key_id,
          new_key_id: newKey.key_id,
          rotation_id: rotationId
        })
      }
    }
  }
  
  // Rotate service tokens immediately (no grace period)
  private async rotateServiceTokens(config: TokenConfig, rotationId: string): Promise<void> {
    const services = await this.getServicesRequiringTokens()
    
    for (const service of services) {
      const newToken = await this.generateServiceToken(service, config)
      
      // Update service configuration with new token
      await this.updateServiceToken(service.name, newToken)
      
      // Revoke old token immediately
      await this.tokenStore.revokeServiceTokens(service.name)
      
      await this.auditLogger.log({
        action: 'service_token_rotated',
        service_name: service.name,
        rotation_id: rotationId
      })
    }
  }
}
```

### Token Generation & Validation
```typescript
class TokenManager {
  constructor(
    private privateKey: string,      // RS256 private key
    private publicKey: string,       // RS256 public key
    private encryptionKey: string,   // AES-256 encryption key
    private redis: RedisClient
  ) {}
  
  // Generate JWT access token
  async generateAccessToken(payload: ThorbisBearerToken): Promise<string> {
    // Add security claims
    const enhancedPayload = {
      ...payload,
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
      iss: 'thorbis-auth',
      aud: 'thorbis-api'
    }
    
    return jwt.sign(enhancedPayload, this.privateKey, {
      algorithm: 'RS256',
      keyid: await this.getCurrentKeyId()
    })
  }
  
  // Generate signed action link
  async generateActionToken(action: string, resourceId: string, userId: string, tenantId: string, params: any = {}): Promise<string> {
    const actionPayload: ThorbisActionToken = {
      iss: 'thorbis-actions',
      exp: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      jti: uuidv4(),
      
      action: action,
      resource_id: resourceId,
      user_id: userId,
      tenant_id: tenantId,
      params: params,
      single_use: true,
      confirmation_required: this.requiresConfirmation(action)
    }
    
    const token = jwt.sign(actionPayload, this.privateKey, {
      algorithm: 'RS256',
      keyid: await this.getCurrentKeyId()
    })
    
    // Store token for single-use tracking
    await this.redis.setex(
      `action_token:${actionPayload.jti}`,
      30 * 60, // 30 minutes
      JSON.stringify({ used: false, created_at: new Date().toISOString() })
    )
    
    return token
  }
  
  // Validate and consume action token
  async validateActionToken(token: string, expectedAction?: string): Promise<ThorbisActionToken> {
    try {
      // Verify JWT signature and structure
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: 'thorbis-actions',
        clockTolerance: 30 // Allow 30 second clock skew
      }) as ThorbisActionToken
      
      // Check if token has been used (single-use)
      const tokenRecord = await this.redis.get(`action_token:${decoded.jti}`)
      if (!tokenRecord) {
        throw new Error('Action token not found or expired')
      }
      
      const record = JSON.parse(tokenRecord)
      if (record.used) {
        throw new Error('Action token has already been used')
      }
      
      // Verify action matches if specified
      if (expectedAction && decoded.action !== expectedAction) {
        throw new Error(`Action mismatch: expected ${expectedAction}, got ${decoded.action}`)
      }
      
      // Mark token as used
      await this.redis.setex(
        `action_token:${decoded.jti}`,
        30 * 60,
        JSON.stringify({ ...record, used: true, used_at: new Date().toISOString() })
      )
      
      return decoded
      
    } catch (error) {
      // Log validation failure
      await this.auditLogger.log({
        action: 'action_token_validation_failed',
        error: error.message,
        token_jti: this.extractJTI(token),
        timestamp: new Date().toISOString()
      })
      
      throw error
    }
  }
  
  // Generate API key with metadata
  async generateApiKey(tenantId: string, config: TokenConfig): Promise<ApiKey> {
    const keyId = uuidv4()
    const keySecret = crypto.randomBytes(32).toString('base64url')
    const keyPrefix = config.prefix || 'tbk_'
    const fullKey = `${keyPrefix}${keyId}_${keySecret}`
    
    // Hash the secret for storage
    const hashedSecret = await bcrypt.hash(keySecret, 12)
    
    const apiKey: ApiKey = {
      key_id: keyId,
      tenant_id: tenantId,
      key_hash: hashedSecret,
      prefix: keyPrefix,
      created_at: new Date(),
      expires_at: new Date(Date.now() + config.lifetime),
      last_used: null,
      usage_count: 0,
      is_active: true,
      permissions: [],
      rate_limit: {
        requests_per_minute: 100,
        requests_per_hour: 1000,
        requests_per_day: 10000
      }
    }
    
    // Store API key metadata
    await this.tokenStore.storeApiKey(apiKey)
    
    // Return full key (only time it's available in plain text)
    return {
      ...apiKey,
      full_key: fullKey
    }
  }
  
  // Validate API key
  async validateApiKey(providedKey: string): Promise<ApiKey | null> {
    try {
      // Parse key structure
      const keyParts = providedKey.split('_')
      if (keyParts.length !== 3) {
        return null
      }
      
      const [prefix, keyId, keySecret] = keyParts
      
      // Retrieve key metadata
      const keyRecord = await this.tokenStore.getApiKey(keyId)
      if (!keyRecord || !keyRecord.is_active) {
        return null
      }
      
      // Check expiration
      if (keyRecord.expires_at < new Date()) {
        await this.tokenStore.deactivateApiKey(keyId)
        return null
      }
      
      // Verify secret
      const isValid = await bcrypt.compare(keySecret, keyRecord.key_hash)
      if (!isValid) {
        return null
      }
      
      // Update usage statistics
      await this.tokenStore.updateApiKeyUsage(keyId)
      
      return keyRecord
      
    } catch (error) {
      console.error('API key validation error:', error)
      return null
    }
  }
}
```

## 🔗 Signed Action Links

### Action Link Generation
```typescript
interface ActionLinkConfig {
  action: string
  resource_id: string
  user_id: string
  tenant_id: string
  expires_in_minutes?: number
  requires_confirmation?: boolean
  ip_restrictions?: string[]
  params?: Record<string, any>
}

class ActionLinkService {
  constructor(
    private tokenManager: TokenManager,
    private baseUrl: string
  ) {}
  
  // Generate secure action link
  async generateActionLink(config: ActionLinkConfig): Promise<string> {
    const token = await this.tokenManager.generateActionToken(
      config.action,
      config.resource_id,
      config.user_id,
      config.tenant_id,
      config.params || {}
    )
    
    // Build action URL
    const actionUrl = new URL(`/actions/${config.action}`, this.baseUrl)
    actionUrl.searchParams.set('token', token)
    actionUrl.searchParams.set('resource', config.resource_id)
    
    // Add confirmation parameter if required
    if (config.requires_confirmation) {
      actionUrl.searchParams.set('confirm', 'required')
    }
    
    return actionUrl.toString()
  }
  
  // Execute action from signed link
  async executeAction(token: string, action: string, resourceId: string): Promise<ActionResult> {
    // Validate action token
    const actionToken = await this.tokenManager.validateActionToken(token, action)
    
    // Verify resource ID matches
    if (actionToken.resource_id !== resourceId) {
      throw new Error('Resource ID mismatch')
    }
    
    // Check if confirmation is required
    if (actionToken.confirmation_required) {
      return {
        status: 'confirmation_required',
        confirmation_url: await this.generateConfirmationLink(actionToken),
        action: action,
        resource_id: resourceId
      }
    }
    
    // Execute the action
    return await this.performAction(actionToken)
  }
  
  // Perform the actual action
  private async performAction(actionToken: ThorbisActionToken): Promise<ActionResult> {
    switch (actionToken.action) {
      case 'confirm_payment':
        return await this.confirmPayment(actionToken)
      
      case 'approve_estimate':
        return await this.approveEstimate(actionToken)
      
      case 'cancel_booking':
        return await this.cancelBooking(actionToken)
      
      case 'verify_email':
        return await this.verifyEmail(actionToken)
      
      case 'reset_password':
        return await this.initiatePasswordReset(actionToken)
      
      default:
        throw new Error(`Unknown action: ${actionToken.action}`)
    }
  }
}
```

### Common Action Implementations
```typescript
// Payment confirmation action
async function generatePaymentConfirmationLink(
  paymentId: string,
  userId: string,
  tenantId: string
): Promise<string> {
  return await actionLinkService.generateActionLink({
    action: 'confirm_payment',
    resource_id: paymentId,
    user_id: userId,
    tenant_id: tenantId,
    expires_in_minutes: 60, // 1 hour to confirm payment
    requires_confirmation: true,
    params: {
      payment_method: 'stripe',
      redirect_url: '/invoices'
    }
  })
}

// Estimate approval action
async function generateEstimateApprovalLink(
  estimateId: string,
  customerId: string,
  tenantId: string
): Promise<string> {
  return await actionLinkService.generateActionLink({
    action: 'approve_estimate',
    resource_id: estimateId,
    user_id: customerId,
    tenant_id: tenantId,
    expires_in_minutes: 10080, // 7 days to approve estimate
    requires_confirmation: false,
    params: {
      auto_convert_to_invoice: true,
      send_notification: true
    }
  })
}

// Email verification action
async function generateEmailVerificationLink(
  userId: string,
  email: string,
  tenantId: string
): Promise<string> {
  return await actionLinkService.generateActionLink({
    action: 'verify_email',
    resource_id: userId,
    user_id: userId,
    tenant_id: tenantId,
    expires_in_minutes: 1440, // 24 hours to verify email
    requires_confirmation: false,
    params: {
      email: email,
      redirect_url: '/dashboard'
    }
  })
}
```

## 🔑 Key Management & Rotation

### Key Rotation Schedule
```yaml
rotation_schedule:
  # JWT signing keys
  jwt_signing_keys:
    rotation_interval: "90 days"
    overlap_period: "7 days"      # Both old and new keys valid
    key_algorithm: "RS256"
    key_size: 2048
    
  # Database encryption keys
  database_encryption_keys:
    rotation_interval: "1 year"
    overlap_period: "30 days"
    key_algorithm: "AES-256-GCM"
    
  # API encryption keys  
  api_encryption_keys:
    rotation_interval: "180 days"
    overlap_period: "14 days"
    key_algorithm: "AES-256-GCM"
    
  # Webhook signing keys
  webhook_signing_keys:
    rotation_interval: "30 days"
    overlap_period: "3 days"
    key_algorithm: "HMAC-SHA256"
```

### Key Storage & Access
```typescript
interface KeyManager {
  // Generate new key pair
  generateKeyPair(algorithm: 'RS256' | 'ES256', keySize: number): Promise<KeyPair>
  
  // Store key securely
  storeKey(keyId: string, key: CryptographicKey, metadata: KeyMetadata): Promise<void>
  
  // Retrieve key for use
  getKey(keyId: string): Promise<CryptographicKey | null>
  
  // List active keys
  getActiveKeys(purpose: 'signing' | 'encryption'): Promise<CryptographicKey[]>
  
  // Rotate keys
  rotateKeys(keyType: string): Promise<KeyRotationResult>
  
  // Revoke key
  revokeKey(keyId: string, reason: string): Promise<void>
}

class VaultKeyManager implements KeyManager {
  constructor(
    private vaultClient: VaultClient,
    private auditLogger: AuditLogger
  ) {}
  
  async generateKeyPair(algorithm: 'RS256' | 'ES256', keySize: number): Promise<KeyPair> {
    const keyId = uuidv4()
    
    // Generate key pair using vault
    const keyPair = await this.vaultClient.generateKeyPair({
      key_type: algorithm === 'RS256' ? 'rsa' : 'ecdsa',
      key_bits: keySize,
      key_name: keyId
    })
    
    await this.auditLogger.log({
      action: 'key_pair_generated',
      key_id: keyId,
      algorithm: algorithm,
      key_size: keySize
    })
    
    return {
      key_id: keyId,
      algorithm: algorithm,
      public_key: keyPair.public_key,
      private_key: keyPair.private_key,
      created_at: new Date()
    }
  }
  
  async rotateKeys(keyType: string): Promise<KeyRotationResult> {
    const currentKeys = await this.getActiveKeys('signing')
    const newKeyPair = await this.generateKeyPair('RS256', 2048)
    
    // Activate new key
    await this.storeKey(newKeyPair.key_id, newKeyPair, {
      purpose: 'signing',
      status: 'active',
      predecessor: currentKeys[0]?.key_id
    })
    
    // Schedule old key deactivation
    if (currentKeys.length > 0) {
      await this.scheduleKeyDeactivation(
        currentKeys[0].key_id,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      )
    }
    
    return {
      new_key_id: newKeyPair.key_id,
      old_key_id: currentKeys[0]?.key_id,
      overlap_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  }
}
```

## 📊 Token Analytics & Monitoring

### Token Usage Metrics
```sql
-- Token usage analytics view
CREATE VIEW token_usage_analytics AS
SELECT 
  DATE(created_at) as usage_date,
  token_type,
  COUNT(*) as tokens_issued,
  COUNT(DISTINCT tenant_id) as unique_tenants,
  AVG(EXTRACT(EPOCH FROM (expires_at - created_at))) as avg_lifetime_seconds,
  COUNT(*) FILTER (WHERE revoked_at IS NOT NULL) as revoked_count,
  COUNT(*) FILTER (WHERE expires_at < NOW() AND last_used IS NULL) as unused_expired
FROM token_lifecycle_log
GROUP BY DATE(created_at), token_type
ORDER BY usage_date DESC, token_type;

-- Suspicious token activity
CREATE VIEW suspicious_token_activity AS
SELECT 
  tenant_id,
  user_id,
  COUNT(*) as failed_validations,
  COUNT(DISTINCT ip_address) as unique_ips,
  MIN(created_at) as first_failure,
  MAX(created_at) as last_failure
FROM token_validation_failures
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY tenant_id, user_id
HAVING COUNT(*) > 10 OR COUNT(DISTINCT ip_address) > 3;
```

### Rotation Health Monitoring
```typescript
class RotationHealthMonitor {
  async checkRotationHealth(): Promise<RotationHealthReport> {
    const report: RotationHealthReport = {
      overall_status: 'healthy',
      checks: [],
      warnings: [],
      errors: []
    }
    
    // Check key age
    const keyAgeCheck = await this.checkKeyAge()
    report.checks.push(keyAgeCheck)
    if (keyAgeCheck.status !== 'pass') {
      report.overall_status = 'warning'
      report.warnings.push(`Keys approaching expiration: ${keyAgeCheck.details}`)
    }
    
    // Check rotation schedule
    const rotationScheduleCheck = await this.checkRotationSchedule()
    report.checks.push(rotationScheduleCheck)
    if (rotationScheduleCheck.status === 'fail') {
      report.overall_status = 'critical'
      report.errors.push(`Rotation schedule issues: ${rotationScheduleCheck.details}`)
    }
    
    // Check token validation failures
    const validationCheck = await this.checkValidationFailures()
    report.checks.push(validationCheck)
    if (validationCheck.failure_rate > 0.05) { // 5% failure rate threshold
      report.overall_status = 'warning'
      report.warnings.push(`High token validation failure rate: ${validationCheck.failure_rate}`)
    }
    
    return report
  }
  
  private async checkKeyAge(): Promise<HealthCheck> {
    const activeKeys = await this.keyManager.getActiveKeys('signing')
    const warningThreshold = 7 * 24 * 60 * 60 * 1000 // 7 days
    
    const expiringKeys = activeKeys.filter(key => {
      const timeToExpiry = key.expires_at.getTime() - Date.now()
      return timeToExpiry <= warningThreshold
    })
    
    return {
      name: 'key_age',
      status: expiringKeys.length > 0 ? 'warning' : 'pass',
      details: `${expiringKeys.length} keys expiring within 7 days`,
      timestamp: new Date()
    }
  }
}
```

## 🚨 Emergency Procedures

### Immediate Token Revocation
```typescript
class EmergencyTokenManager {
  // Revoke all tokens for a tenant (security breach)
  async emergencyTenantRevocation(tenantId: string, reason: string): Promise<void> {
    await this.auditLogger.log({
      action: 'emergency_tenant_revocation',
      tenant_id: tenantId,
      reason: reason,
      timestamp: new Date().toISOString(),
      severity: 'critical'
    })
    
    // Revoke all access tokens
    await this.redis.deletePattern(`access_token:*:${tenantId}`)
    
    // Revoke all refresh tokens
    await this.redis.deletePattern(`refresh_token:*:${tenantId}`)
    
    // Deactivate API keys
    await this.tokenStore.deactivateAllApiKeys(tenantId)
    
    // Revoke all action tokens
    await this.redis.deletePattern(`action_token:*:${tenantId}`)
    
    // Force re-authentication
    await this.sessionStore.invalidateAllSessions(tenantId)
    
    // Notify security team
    await this.notificationService.alertSecurityTeam({
      type: 'emergency_revocation',
      tenant_id: tenantId,
      reason: reason,
      tokens_revoked: await this.getRevocationCount(tenantId)
    })
  }
  
  // Global token revocation (major security incident)
  async emergencyGlobalRevocation(reason: string): Promise<void> {
    await this.auditLogger.log({
      action: 'emergency_global_revocation',
      reason: reason,
      timestamp: new Date().toISOString(),
      severity: 'critical'
    })
    
    // Revoke all JWT tokens by rotating signing key immediately
    await this.keyManager.emergencyKeyRotation()
    
    // Clear all cached tokens
    await this.redis.flushall()
    
    // Deactivate all API keys
    await this.tokenStore.deactivateAllApiKeys()
    
    // Force global re-authentication
    await this.sessionStore.invalidateAllSessions()
    
    // Alert all stakeholders
    await this.notificationService.alertAllStakeholders({
      type: 'global_security_incident',
      reason: reason,
      action_taken: 'global_token_revocation'
    })
  }
}
```

This comprehensive secrets rotation system provides automated token lifecycle management, secure signed action links, and emergency procedures for security incidents.
