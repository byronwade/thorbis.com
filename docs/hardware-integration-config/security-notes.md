# Thorbis Hardware Integration Security Notes

Comprehensive security guidelines and implementation requirements for Thorbis hardware device integration.

## Core Security Principles

### Zero Trust Hardware Model
- **No inherent device trust**: All devices must prove identity and authorization continuously
- **Ephemeral credentials only**: No long-term secrets stored on devices
- **Least privilege access**: Devices receive minimal required permissions
- **Continuous verification**: Regular re-authentication and health checks
- **Fail-safe defaults**: Security failures result in immediate access revocation

### Defense in Depth Strategy
```
┌─────────────────────────────────────────────────┐
│                 Network Layer                   │ ← TLS 1.3, Certificate Pinning
├─────────────────────────────────────────────────┤
│                 Transport Layer                 │ ← mTLS, Encrypted Channels
├─────────────────────────────────────────────────┤
│                Application Layer                │ ← JWT Tokens, API Authentication
├─────────────────────────────────────────────────┤
│                 Device Layer                    │ ← Hardware TPM, Secure Boot
├─────────────────────────────────────────────────┤
│                 Physical Layer                  │ ← Tamper Detection, Secure Enclosures
└─────────────────────────────────────────────────┘
```

## Ephemeral Token Architecture

### Token Lifecycle Management
```typescript
interface EphemeralTokenStrategy {
  // Token Properties
  token_type: 'device_session' | 'action_specific' | 'pairing_challenge'
  lifetime: TokenLifetime
  rotation_policy: RotationPolicy
  revocation_mechanism: RevocationMechanism
  
  // Security Context
  binding_factors: BindingFactor[]
  usage_constraints: UsageConstraint[]
  audit_requirements: AuditRequirement[]
}

interface TokenLifetime {
  initial_ttl: number                  // Initial time-to-live (seconds)
  max_lifetime: number                 // Maximum possible lifetime
  idle_timeout: number                 // Timeout on inactivity
  renewal_window: number               // Window for token renewal
  grace_period: number                 // Grace period during rotation
}

interface RotationPolicy {
  rotation_strategy: 'time_based' | 'usage_based' | 'event_triggered'
  rotation_interval: number            // Seconds between rotations
  max_usage_count?: number             // Maximum uses before rotation
  trigger_events?: string[]            // Events that trigger rotation
  pre_rotation_warning: number         // Warning time before rotation
}

interface BindingFactor {
  factor_type: 'ip_address' | 'mac_address' | 'device_fingerprint' | 'location'
  value: string
  strict_validation: boolean           // Fail auth if binding changes
  drift_tolerance?: number             // Allowed deviation for numeric values
}
```

### Device Session Tokens (Primary Authentication)
```typescript
class DeviceSessionTokenManager {
  async generateSessionToken(deviceId: string, securityLevel: SecurityLevel): Promise<SessionToken> {
    const tokenConfig = this.getTokenConfig(securityLevel)
    
    // Generate cryptographically secure token
    const tokenPayload: DeviceSessionClaims = {
      // Standard JWT claims
      iss: 'thorbis-hardware-auth',
      sub: deviceId,
      aud: ['thorbis-api', 'thorbis-hardware-service'],
      exp: Math.floor(Date.now() / 1000) + tokenConfig.initial_ttl,
      iat: Math.floor(Date.now() / 1000),
      jti: await this.generateSecureJTI(),
      
      // Hardware-specific claims
      device_type: await this.getDeviceType(deviceId),
      tenant_id: await this.getDeviceTenant(deviceId),
      permissions: await this.getDevicePermissions(deviceId),
      security_level: securityLevel,
      
      // Binding factors
      device_fingerprint: await this.generateDeviceFingerprint(deviceId),
      network_binding: await this.getCurrentNetworkBinding(deviceId),
      pairing_session_id: await this.getCurrentPairingSession(deviceId),
      
      // Usage constraints
      max_operations_per_minute: this.getOperationLimit(securityLevel),
      allowed_endpoints: await this.getAllowedEndpoints(deviceId),
      geo_restriction?: await this.getGeoRestriction(deviceId),
      
      // Token metadata
      token_generation: Date.now(),
      rotation_due: Date.now() + (tokenConfig.rotation_interval * 1000),
      entropy_source: await this.getEntropySource()
    }
    
    // Sign token with ephemeral signing key
    const signingKey = await this.getEphemeralSigningKey()
    const token = await this.signToken(tokenPayload, signingKey)
    
    // Store token metadata (NOT the token itself)
    await this.storeTokenMetadata({
      jti: tokenPayload.jti,
      device_id: deviceId,
      expires_at: tokenPayload.exp,
      security_level: securityLevel,
      binding_hash: await this.hashBindingFactors(tokenPayload)
    })
    
    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: tokenConfig.initial_ttl,
      rotation_in: tokenConfig.rotation_interval,
      permissions: tokenPayload.permissions
    }
  }
  
  private getTokenConfig(securityLevel: SecurityLevel): TokenLifetime {
    const configs = {
      'basic': {
        initial_ttl: 24 * 60 * 60,      // 24 hours
        max_lifetime: 7 * 24 * 60 * 60,  // 7 days
        idle_timeout: 4 * 60 * 60,       // 4 hours
        renewal_window: 2 * 60 * 60,     // 2 hours
        grace_period: 5 * 60,            // 5 minutes
        rotation_interval: 7 * 24 * 60 * 60  // Weekly rotation
      },
      'enhanced': {
        initial_ttl: 8 * 60 * 60,        // 8 hours
        max_lifetime: 24 * 60 * 60,      // 24 hours
        idle_timeout: 2 * 60 * 60,       // 2 hours
        renewal_window: 30 * 60,         // 30 minutes
        grace_period: 2 * 60,            // 2 minutes
        rotation_interval: 24 * 60 * 60  // Daily rotation
      },
      'enterprise': {
        initial_ttl: 2 * 60 * 60,        // 2 hours
        max_lifetime: 8 * 60 * 60,       // 8 hours
        idle_timeout: 30 * 60,           // 30 minutes
        renewal_window: 15 * 60,         // 15 minutes
        grace_period: 60,                // 1 minute
        rotation_interval: 4 * 60 * 60   // 4-hour rotation
      }
    }
    return configs[securityLevel]
  }
}

type SecurityLevel = 'basic' | 'enhanced' | 'enterprise'

interface SessionToken {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  rotation_in: number
  permissions: string[]
}
```

### Action-Specific Tokens (Scoped Operations)
```typescript
class ActionTokenManager {
  async generateActionToken(
    deviceId: string,
    action: DeviceAction,
    context: ActionContext
  ): Promise<ActionToken> {
    // Ultra-short lived tokens for specific operations
    const tokenPayload: ActionTokenClaims = {
      iss: 'thorbis-hardware-actions',
      sub: deviceId,
      aud: `thorbis-action-${action.type}`,
      exp: Math.floor(Date.now() / 1000) + this.getActionTTL(action),
      iat: Math.floor(Date.now() / 1000),
      jti: await this.generateSecureJTI(),
      
      // Action-specific claims
      action_type: action.type,
      action_scope: action.scope,
      resource_constraints: action.constraints,
      single_use: true,                  // Token can only be used once
      
      // Context binding
      operation_id: context.operation_id,
      request_timestamp: context.timestamp,
      ip_address: context.ip_address,
      
      // Security constraints
      max_retries: 1,
      allowed_methods: [action.method],
      parameter_hash: await this.hashParameters(action.parameters)
    }
    
    const token = await this.signToken(tokenPayload, await this.getActionSigningKey())
    
    // Store single-use token record
    await this.storeActionTokenRecord({
      jti: tokenPayload.jti,
      device_id: deviceId,
      action_type: action.type,
      used: false,
      expires_at: tokenPayload.exp
    })
    
    return {
      action_token: token,
      expires_in: this.getActionTTL(action),
      single_use: true,
      action_scope: action.scope
    }
  }
  
  private getActionTTL(action: DeviceAction): number {
    // Ultra-short lifetimes for specific actions
    const actionTTLs = {
      'print_receipt': 30,               // 30 seconds
      'cut_paper': 10,                   // 10 seconds
      'kick_drawer': 5,                  // 5 seconds
      'display_order': 60,               // 1 minute
      'scan_barcode': 120,               // 2 minutes
      'process_payment': 300,            // 5 minutes (payment flows need more time)
      'update_display': 30,              // 30 seconds
      'batch_operation': 600             // 10 minutes for batch operations
    }
    return actionTTLs[action.type] || 30 // Default 30 seconds
  }
}

interface DeviceAction {
  type: string
  scope: string[]
  method: string
  constraints: Record<string, any>
  parameters: Record<string, any>
}

interface ActionContext {
  operation_id: string
  timestamp: string
  ip_address: string
  user_agent?: string
}

interface ActionToken {
  action_token: string
  expires_in: number
  single_use: boolean
  action_scope: string[]
}
```

### Pairing Challenge Tokens (Device Onboarding)
```typescript
class PairingTokenManager {
  async generatePairingChallenge(deviceId: string): Promise<PairingChallenge> {
    // Temporary tokens for device pairing process
    const challengePayload = {
      challenge_id: await this.generateSecureJTI(),
      device_id: deviceId,
      challenge_value: await this.generateCryptoRandomChallenge(32),
      created_at: Date.now(),
      expires_at: Date.now() + (5 * 60 * 1000), // 5 minutes
      pairing_window_start: Date.now(),
      pairing_window_end: Date.now() + (5 * 60 * 1000),
      max_attempts: 3,
      attempt_count: 0,
      expected_response_format: 'HMAC-SHA256',
      entropy_requirements: {
        min_bits: 256,
        source_required: 'hardware_rng'
      }
    }
    
    // Store challenge (encrypted at rest)
    await this.storePairingChallenge(challengePayload)
    
    return {
      challenge_id: challengePayload.challenge_id,
      challenge_code: this.formatChallengeForDisplay(challengePayload.challenge_value),
      expires_in: 300, // 5 minutes
      max_attempts: 3,
      response_format: 'six_digit_code'
    }
  }
  
  private formatChallengeForDisplay(challenge: string): string {
    // Convert cryptographic challenge to user-friendly 6-digit code
    const hash = createHash('sha256').update(challenge).digest()
    const code = (hash.readUInt32BE(0) % 900000) + 100000 // 6 digits, no leading zeros
    return code.toString()
  }
}

interface PairingChallenge {
  challenge_id: string
  challenge_code: string
  expires_in: number
  max_attempts: number
  response_format: string
}
```

## Device Sandboxing

### Containerized Execution Environment
```typescript
interface DeviceSandbox {
  // Sandbox Configuration
  sandbox_id: string
  device_id: string
  sandbox_type: 'docker' | 'systemd' | 'chroot' | 'vm'
  
  // Resource Limits
  resource_limits: ResourceLimits
  
  // Network Isolation
  network_policy: NetworkPolicy
  
  // File System Restrictions
  filesystem_policy: FilesystemPolicy
  
  // Process Isolation
  process_policy: ProcessPolicy
  
  // Security Controls
  security_controls: SecurityControl[]
}

interface ResourceLimits {
  max_memory_mb: number                // Maximum memory allocation
  max_cpu_percent: number              // Maximum CPU usage
  max_disk_mb: number                  // Maximum disk usage
  max_network_bps: number              // Maximum network bandwidth
  max_file_descriptors: number         // Maximum open files
  max_processes: number                // Maximum child processes
  execution_timeout_sec: number        // Maximum execution time
}

interface NetworkPolicy {
  allowed_outbound_hosts: string[]     // Whitelist of allowed destinations
  allowed_inbound_ports: number[]      // Allowed listening ports
  blocked_protocols: string[]          // Blocked network protocols
  dns_resolution: 'restricted' | 'none' // DNS access level
  firewall_rules: FirewallRule[]       // Custom firewall rules
}

interface FilesystemPolicy {
  read_only_paths: string[]            // Paths with read-only access
  no_access_paths: string[]            // Completely blocked paths
  temp_directory: string               // Sandbox temp directory
  max_file_size_mb: number             // Maximum individual file size
  allowed_file_types: string[]         // Allowed file extensions
  encryption_required: boolean         // Require encryption for sensitive files
}

class HardwareDeviceSandbox {
  async createDeviceSandbox(deviceId: string, deviceType: HardwareDeviceType): Promise<DeviceSandbox> {
    const sandboxConfig = this.getSandboxConfig(deviceType)
    
    // Create isolated container/environment
    const sandboxId = await this.createIsolatedEnvironment({
      base_image: sandboxConfig.base_image,
      resource_limits: sandboxConfig.resource_limits,
      network_policy: sandboxConfig.network_policy,
      filesystem_policy: sandboxConfig.filesystem_policy,
      security_controls: sandboxConfig.security_controls
    })
    
    // Install device-specific runtime and drivers
    await this.installDeviceRuntime(sandboxId, deviceType)
    
    // Configure device-specific restrictions
    await this.applyDeviceRestrictions(sandboxId, deviceId, sandboxConfig)
    
    // Start monitoring and logging
    await this.startSandboxMonitoring(sandboxId, deviceId)
    
    return {
      sandbox_id: sandboxId,
      device_id: deviceId,
      sandbox_type: 'docker',
      ...sandboxConfig
    }
  }
  
  private getSandboxConfig(deviceType: HardwareDeviceType): SandboxConfiguration {
    const baseConfig = {
      base_image: 'thorbis/hardware-runtime:alpine',
      resource_limits: {
        max_memory_mb: 128,
        max_cpu_percent: 25,
        max_disk_mb: 256,
        max_network_bps: 1024 * 1024, // 1 Mbps
        max_file_descriptors: 256,
        max_processes: 10,
        execution_timeout_sec: 30
      },
      network_policy: {
        allowed_outbound_hosts: [
          'api.thorbis.com',
          'hardware-api.thorbis.com',
          'telemetry.thorbis.com'
        ],
        allowed_inbound_ports: [],
        blocked_protocols: ['ftp', 'telnet', 'ssh'],
        dns_resolution: 'restricted'
      },
      filesystem_policy: {
        read_only_paths: ['/usr', '/lib', '/bin', '/sbin'],
        no_access_paths: ['/proc/kcore', '/dev/mem', '/dev/kmem'],
        temp_directory: '/tmp/device_sandbox',
        max_file_size_mb: 10,
        allowed_file_types: ['.log', '.tmp', '.dat'],
        encryption_required: true
      }
    }
    
    // Device-specific configurations
    const deviceConfigs = {
      'thermal_printer': {
        ...baseConfig,
        resource_limits: {
          ...baseConfig.resource_limits,
          max_memory_mb: 64, // Minimal resources for printers
          max_cpu_percent: 15
        },
        allowed_operations: ['print', 'cut', 'status', 'self_test'],
        hardware_access: ['usb', 'serial', 'parallel']
      },
      'kds_display': {
        ...baseConfig,
        resource_limits: {
          ...baseConfig.resource_limits,
          max_memory_mb: 256, // More memory for display operations
          max_cpu_percent: 40
        },
        allowed_operations: ['display', 'touch', 'audio', 'status'],
        hardware_access: ['usb', 'hdmi', 'touchscreen']
      },
      'barcode_scanner': {
        ...baseConfig,
        resource_limits: {
          ...baseConfig.resource_limits,
          max_memory_mb: 96,
          max_cpu_percent: 20
        },
        allowed_operations: ['scan', 'decode', 'status', 'batch_upload'],
        hardware_access: ['usb', 'bluetooth', 'camera']
      },
      'payment_terminal': {
        ...baseConfig,
        resource_limits: {
          ...baseConfig.resource_limits,
          max_memory_mb: 512, // More resources for payment processing
          max_cpu_percent: 60,
          execution_timeout_sec: 120 // Longer timeout for payments
        },
        security_controls: [
          ...baseConfig.security_controls,
          'pci_compliance',
          'hardware_encryption',
          'tamper_detection'
        ],
        allowed_operations: ['process_payment', 'capture_pin', 'print_receipt'],
        hardware_access: ['usb', 'encrypted_keypad', 'card_reader']
      }
    }
    
    return deviceConfigs[deviceType] || baseConfig
  }
  
  async monitorSandboxSecurity(sandboxId: string): Promise<void> {
    // Continuous security monitoring
    setInterval(async () => {
      const metrics = await this.collectSandboxMetrics(sandboxId)
      
      // Check for suspicious activity
      const suspiciousActivities = [
        metrics.cpu_usage > 90,          // High CPU usage
        metrics.memory_usage > 90,       // High memory usage
        metrics.network_connections > 10, // Too many connections
        metrics.file_operations > 1000,  // High file I/O
        metrics.process_count > 15       // Process proliferation
      ]
      
      if (suspiciousActivities.some(suspicious => suspicious)) {
        await this.handleSandboxSecurityEvent(sandboxId, metrics)
      }
    }, 10000) // Check every 10 seconds
  }
  
  private async handleSandboxSecurityEvent(sandboxId: string, metrics: SandboxMetrics): Promise<void> {
    // Immediate response to security events
    const deviceId = await this.getDeviceIdBySandbox(sandboxId)
    
    // Log security event
    await this.auditLogger.logSecurityEvent({
      event_type: 'sandbox_security_anomaly',
      device_id: deviceId,
      sandbox_id: sandboxId,
      metrics: metrics,
      timestamp: new Date().toISOString(),
      severity: 'high'
    })
    
    // Take protective action
    if (metrics.cpu_usage > 95 || metrics.memory_usage > 95) {
      // Immediate sandbox termination for resource exhaustion
      await this.terminateSandbox(sandboxId, 'resource_exhaustion')
      await this.quarantineDevice(deviceId, 'sandbox_security_violation')
    } else {
      // Throttle resources for less severe events
      await this.throttleSandboxResources(sandboxId)
    }
  }
}

interface SandboxConfiguration {
  base_image: string
  resource_limits: ResourceLimits
  network_policy: NetworkPolicy
  filesystem_policy: FilesystemPolicy
  security_controls?: string[]
  allowed_operations?: string[]
  hardware_access?: string[]
}
```

### Hardware Access Control
```typescript
interface HardwareAccessPolicy {
  device_id: string
  allowed_hardware_interfaces: HardwareInterface[]
  access_restrictions: AccessRestriction[]
  audit_requirements: AuditRequirement[]
}

interface HardwareInterface {
  interface_type: 'usb' | 'serial' | 'parallel' | 'bluetooth' | 'wifi' | 'nfc'
  access_level: 'read_only' | 'read_write' | 'admin'
  specific_devices?: string[]          // Specific hardware device IDs
  rate_limits?: RateLimit[]            // Operation rate limiting
}

interface AccessRestriction {
  restriction_type: 'time_based' | 'operation_based' | 'context_based'
  parameters: Record<string, any>
  enforcement_level: 'warn' | 'block' | 'terminate'
}

class HardwareAccessController {
  async validateHardwareAccess(
    deviceId: string,
    hardwareInterface: string,
    operation: string
  ): Promise<AccessDecision> {
    const policy = await this.getHardwareAccessPolicy(deviceId)
    
    // Check if interface is allowed
    const allowedInterface = policy.allowed_hardware_interfaces.find(
      iface => iface.interface_type === hardwareInterface
    )
    
    if (!allowedInterface) {
      return {
        allowed: false,
        reason: 'HARDWARE_INTERFACE_NOT_PERMITTED',
        enforcement_action: 'block'
      }
    }
    
    // Check operation permissions
    const operationAllowed = await this.checkOperationPermission(
      allowedInterface,
      operation
    )
    
    if (!operationAllowed) {
      return {
        allowed: false,
        reason: 'OPERATION_NOT_PERMITTED',
        enforcement_action: 'block'
      }
    }
    
    // Check rate limits
    const rateLimitStatus = await this.checkRateLimit(
      deviceId,
      hardwareInterface,
      operation
    )
    
    if (!rateLimitStatus.allowed) {
      return {
        allowed: false,
        reason: 'RATE_LIMIT_EXCEEDED',
        enforcement_action: 'throttle',
        retry_after: rateLimitStatus.retry_after
      }
    }
    
    // Log access
    await this.auditLogger.logHardwareAccess({
      device_id: deviceId,
      hardware_interface: hardwareInterface,
      operation: operation,
      access_granted: true,
      timestamp: new Date().toISOString()
    })
    
    return {
      allowed: true,
      access_token: await this.generateHardwareAccessToken(
        deviceId,
        hardwareInterface,
        operation
      )
    }
  }
}

interface AccessDecision {
  allowed: boolean
  reason?: string
  enforcement_action?: 'warn' | 'block' | 'terminate' | 'throttle'
  retry_after?: number
  access_token?: string
}
```

## No Secrets at Rest

### Ephemeral Key Management
```typescript
class EphemeralKeyManager {
  private keyRotationInterval = 4 * 60 * 60 * 1000 // 4 hours
  private keyMemoryStorage = new Map<string, CryptographicKey>()
  
  async generateEphemeralKey(keyType: KeyType, context: KeyContext): Promise<EphemeralKey> {
    // Generate key using hardware security module or secure random
    const keyMaterial = await this.generateSecureKeyMaterial(keyType.algorithm, keyType.keySize)
    
    const ephemeralKey: EphemeralKey = {
      key_id: await this.generateKeyId(),
      key_type: keyType,
      key_material: keyMaterial,
      created_at: Date.now(),
      expires_at: Date.now() + keyType.lifetime,
      usage_count: 0,
      max_usage: keyType.maxUsage,
      context: context,
      entropy_source: 'hardware_rng'
    }
    
    // Store in memory only (never persist to disk)
    this.keyMemoryStorage.set(ephemeralKey.key_id, ephemeralKey)
    
    // Schedule automatic key rotation
    this.scheduleKeyRotation(ephemeralKey.key_id, keyType.lifetime)
    
    return ephemeralKey
  }
  
  async rotateKey(keyId: string): Promise<EphemeralKey> {
    const oldKey = this.keyMemoryStorage.get(keyId)
    if (!oldKey) {
      throw new Error('Key not found for rotation')
    }
    
    // Generate new key with same parameters
    const newKey = await this.generateEphemeralKey(oldKey.key_type, oldKey.context)
    
    // Provide overlap period for graceful transition
    const overlapPeriod = 5 * 60 * 1000 // 5 minutes
    setTimeout(() => {
      this.securelyDestroyKey(keyId)
    }, overlapPeriod)
    
    return newKey
  }
  
  private scheduleKeyRotation(keyId: string, lifetime: number): void {
    const rotationTime = lifetime - (10 * 60 * 1000) // Rotate 10 minutes before expiry
    
    setTimeout(async () => {
      try {
        await this.rotateKey(keyId)
      } catch (error) {
        console.error(`Key rotation failed for ${keyId}:`, error)
        // Ensure old key is still destroyed on schedule
        this.securelyDestroyKey(keyId)
      }
    }, rotationTime)
  }
  
  private securelyDestroyKey(keyId: string): void {
    const key = this.keyMemoryStorage.get(keyId)
    if (key) {
      // Overwrite key material with random data
      if (key.key_material instanceof Buffer) {
        crypto.randomFillSync(key.key_material)
      }
      
      // Remove from memory
      this.keyMemoryStorage.delete(keyId)
      
      // Force garbage collection hint
      if (global.gc) {
        global.gc()
      }
    }
  }
}

interface EphemeralKey {
  key_id: string
  key_type: KeyType
  key_material: Buffer | string
  created_at: number
  expires_at: number
  usage_count: number
  max_usage: number
  context: KeyContext
  entropy_source: string
}

interface KeyType {
  algorithm: 'AES-256-GCM' | 'RSA-2048' | 'ECDSA-P256' | 'HMAC-SHA256'
  keySize: number
  lifetime: number
  maxUsage: number
  purpose: 'signing' | 'encryption' | 'authentication' | 'key_derivation'
}

interface KeyContext {
  device_id?: string
  operation_type?: string
  security_level: SecurityLevel
  geographic_region?: string
}
```

### Secure Configuration Management
```typescript
class SecureConfigurationManager {
  // Configuration stored in memory with encryption
  private encryptedConfigs = new Map<string, EncryptedConfig>()
  
  async storeDeviceConfiguration(
    deviceId: string,
    config: DeviceConfiguration
  ): Promise<void> {
    // Encrypt configuration using ephemeral key
    const encryptionKey = await this.keyManager.generateEphemeralKey({
      algorithm: 'AES-256-GCM',
      keySize: 256,
      lifetime: 24 * 60 * 60 * 1000, // 24 hours
      maxUsage: 1000,
      purpose: 'encryption'
    }, {
      device_id: deviceId,
      operation_type: 'config_storage',
      security_level: 'enhanced'
    })
    
    const encryptedConfig = await this.encryptConfiguration(config, encryptionKey)
    
    // Store encrypted configuration in memory only
    this.encryptedConfigs.set(deviceId, {
      encrypted_data: encryptedConfig,
      encryption_key_id: encryptionKey.key_id,
      created_at: Date.now(),
      access_count: 0
    })
    
    // Schedule automatic cleanup
    setTimeout(() => {
      this.encryptedConfigs.delete(deviceId)
    }, 24 * 60 * 60 * 1000) // 24 hours
  }
  
  async retrieveDeviceConfiguration(deviceId: string): Promise<DeviceConfiguration | null> {
    const encryptedConfig = this.encryptedConfigs.get(deviceId)
    if (!encryptedConfig) {
      return null
    }
    
    // Decrypt using ephemeral key
    const encryptionKey = await this.keyManager.getKey(encryptedConfig.encryption_key_id)
    if (!encryptionKey) {
      // Key expired or rotated - configuration is no longer accessible
      this.encryptedConfigs.delete(deviceId)
      return null
    }
    
    const config = await this.decryptConfiguration(
      encryptedConfig.encrypted_data,
      encryptionKey
    )
    
    // Track access
    encryptedConfig.access_count++
    
    return config
  }
  
  private async encryptConfiguration(
    config: DeviceConfiguration,
    key: EphemeralKey
  ): Promise<string> {
    const plaintext = JSON.stringify(config)
    const cipher = crypto.createCipher('aes-256-gcm', key.key_material)
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return JSON.stringify({
      encrypted: encrypted,
      auth_tag: authTag.toString('hex'),
      algorithm: 'aes-256-gcm'
    })
  }
}

interface EncryptedConfig {
  encrypted_data: string
  encryption_key_id: string
  created_at: number
  access_count: number
}

interface DeviceConfiguration {
  device_id: string
  device_type: HardwareDeviceType
  connection_settings: ConnectionSettings
  operational_parameters: OperationalParameters
  security_settings: SecuritySettings
}
```

### Memory-Only Secret Storage
```typescript
class MemoryOnlySecretStore {
  private secrets = new Map<string, MemorySecret>()
  private accessLog = new Map<string, AccessLogEntry[]>()
  
  async storeSecret(
    secretId: string,
    secretValue: string | Buffer,
    metadata: SecretMetadata
  ): Promise<void> {
    // Encrypt secret before storing in memory
    const encryptionKey = await this.keyManager.generateEphemeralKey({
      algorithm: 'AES-256-GCM',
      keySize: 256,
      lifetime: metadata.ttl || (60 * 60 * 1000), // Default 1 hour
      maxUsage: metadata.maxAccess || 100,
      purpose: 'encryption'
    }, {
      operation_type: 'secret_storage',
      security_level: 'enterprise'
    })
    
    const encryptedValue = await this.encryptSecret(secretValue, encryptionKey)
    
    const memorySecret: MemorySecret = {
      secret_id: secretId,
      encrypted_value: encryptedValue,
      encryption_key_id: encryptionKey.key_id,
      metadata: metadata,
      created_at: Date.now(),
      access_count: 0,
      last_accessed: null
    }
    
    this.secrets.set(secretId, memorySecret)
    this.accessLog.set(secretId, [])
    
    // Schedule automatic cleanup
    setTimeout(() => {
      this.destroySecret(secretId)
    }, metadata.ttl || (60 * 60 * 1000))
  }
  
  async retrieveSecret(secretId: string, accessor: SecretAccessor): Promise<string | Buffer | null> {
    const secret = this.secrets.get(secretId)
    if (!secret) {
      return null
    }
    
    // Validate access permissions
    if (!await this.validateSecretAccess(secret, accessor)) {
      await this.logUnauthorizedAccess(secretId, accessor)
      return null
    }
    
    // Decrypt secret
    const encryptionKey = await this.keyManager.getKey(secret.encryption_key_id)
    if (!encryptionKey) {
      // Key expired - secret is no longer accessible
      this.destroySecret(secretId)
      return null
    }
    
    const decryptedValue = await this.decryptSecret(secret.encrypted_value, encryptionKey)
    
    // Update access tracking
    secret.access_count++
    secret.last_accessed = Date.now()
    
    // Log access
    await this.logSecretAccess(secretId, accessor, 'success')
    
    // Check if max access limit reached
    if (secret.metadata.maxAccess && secret.access_count >= secret.metadata.maxAccess) {
      this.destroySecret(secretId)
    }
    
    return decryptedValue
  }
  
  private destroySecret(secretId: string): void {
    const secret = this.secrets.get(secretId)
    if (secret) {
      // Overwrite encrypted value with random data
      if (secret.encrypted_value instanceof Buffer) {
        crypto.randomFillSync(secret.encrypted_value)
      }
      
      // Remove from memory
      this.secrets.delete(secretId)
      this.accessLog.delete(secretId)
      
      // Log destruction
      this.auditLogger.log({
        event: 'secret_destroyed',
        secret_id: secretId,
        timestamp: new Date().toISOString()
      })
    }
  }
}

interface MemorySecret {
  secret_id: string
  encrypted_value: string | Buffer
  encryption_key_id: string
  metadata: SecretMetadata
  created_at: number
  access_count: number
  last_accessed: number | null
}

interface SecretMetadata {
  secret_type: 'api_key' | 'certificate' | 'private_key' | 'password' | 'token'
  ttl?: number                         // Time to live in milliseconds
  maxAccess?: number                   // Maximum access count
  allowed_accessors?: string[]         // Authorized accessor IDs
  security_level: SecurityLevel
}

interface SecretAccessor {
  accessor_id: string
  accessor_type: 'device' | 'user' | 'service'
  context: AccessContext
}
```

## Runtime Security Monitoring

### Anomaly Detection System
```typescript
class HardwareSecurityMonitor {
  private anomalyDetectors: AnomalyDetector[] = []
  
  async startSecurityMonitoring(deviceId: string): Promise<void> {
    // Initialize anomaly detectors
    this.anomalyDetectors = [
      new NetworkAnomalyDetector(deviceId),
      new BehaviorAnomalyDetector(deviceId),
      new ResourceAnomalyDetector(deviceId),
      new AccessPatternDetector(deviceId),
      new CryptographicAnomalyDetector(deviceId)
    ]
    
    // Start continuous monitoring
    for (const detector of this.anomalyDetectors) {
      detector.startMonitoring()
    }
    
    // Aggregate and analyze results
    setInterval(async () => {
      await this.analyzeSecurityState(deviceId)
    }, 30000) // Every 30 seconds
  }
  
  private async analyzeSecurityState(deviceId: string): Promise<void> {
    const anomalies: SecurityAnomaly[] = []
    
    // Collect anomalies from all detectors
    for (const detector of this.anomalyDetectors) {
      const detectedAnomalies = await detector.getAnomalies()
      anomalies.push(...detectedAnomalies)
    }
    
    // Analyze anomaly patterns
    const severityScore = this.calculateSeverityScore(anomalies)
    const threatLevel = this.assessThreatLevel(anomalies, severityScore)
    
    if (threatLevel >= ThreatLevel.HIGH) {
      await this.handleHighThreatSituation(deviceId, anomalies)
    } else if (threatLevel >= ThreatLevel.MEDIUM) {
      await this.handleMediumThreatSituation(deviceId, anomalies)
    }
    
    // Log security analysis
    await this.auditLogger.logSecurityAnalysis({
      device_id: deviceId,
      anomaly_count: anomalies.length,
      severity_score: severityScore,
      threat_level: threatLevel,
      timestamp: new Date().toISOString()
    })
  }
  
  private async handleHighThreatSituation(
    deviceId: string,
    anomalies: SecurityAnomaly[]
  ): Promise<void> {
    // Immediate defensive actions
    await Promise.all([
      this.quarantineDevice(deviceId, 'high_threat_detected'),
      this.revokeAllDeviceTokens(deviceId),
      this.terminateDeviceSandbox(deviceId),
      this.alertSecurityTeam(deviceId, anomalies),
      this.preserveForensicEvidence(deviceId, anomalies)
    ])
  }
  
  private async quarantineDevice(deviceId: string, reason: string): Promise<void> {
    // Isolate device from network and prevent further operations
    await this.networkController.isolateDevice(deviceId)
    await this.updateDeviceStatus(deviceId, 'quarantined', reason)
    
    // Notify stakeholders
    await this.notificationService.sendSecurityAlert({
      type: 'device_quarantine',
      device_id: deviceId,
      reason: reason,
      severity: 'critical',
      immediate_action_required: true
    })
  }
}

interface SecurityAnomaly {
  anomaly_id: string
  detector_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  evidence: Record<string, any>
  timestamp: number
  confidence_score: number
}

enum ThreatLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

class NetworkAnomalyDetector implements AnomalyDetector {
  async detectAnomalies(): Promise<SecurityAnomaly[]> {
    const anomalies: SecurityAnomaly[] = []
    
    // Check for unusual network patterns
    const networkMetrics = await this.getNetworkMetrics()
    
    // Unusual outbound connections
    if (networkMetrics.outbound_connections > this.baseline.normal_outbound_connections * 3) {
      anomalies.push({
        anomaly_id: generateId(),
        detector_type: 'network',
        severity: 'high',
        description: 'Unusual number of outbound connections detected',
        evidence: {
          current_connections: networkMetrics.outbound_connections,
          baseline: this.baseline.normal_outbound_connections,
          threshold_exceeded: true
        },
        timestamp: Date.now(),
        confidence_score: 0.85
      })
    }
    
    // Connections to suspicious hosts
    const suspiciousConnections = networkMetrics.connections.filter(conn => 
      this.isSuspiciousHost(conn.destination_host)
    )
    
    if (suspiciousConnections.length > 0) {
      anomalies.push({
        anomaly_id: generateId(),
        detector_type: 'network',
        severity: 'critical',
        description: 'Connections to suspicious hosts detected',
        evidence: {
          suspicious_connections: suspiciousConnections,
          threat_intelligence_match: true
        },
        timestamp: Date.now(),
        confidence_score: 0.95
      })
    }
    
    return anomalies
  }
}
```

## Compliance and Audit Requirements

### Security Audit Trail
```typescript
interface SecurityAuditEvent {
  event_id: string
  event_type: SecurityEventType
  device_id: string
  tenant_id: string
  timestamp: string
  
  // Event Details
  event_data: Record<string, any>
  security_context: SecurityContext
  
  // Authentication & Authorization
  authentication_method: string
  authorization_result: 'granted' | 'denied' | 'partial'
  permissions_used: string[]
  
  // Network Context
  source_ip: string
  user_agent?: string
  connection_type: 'ethernet' | 'wifi' | 'bluetooth' | 'cellular'
  
  // Security Metadata
  threat_level: ThreatLevel
  anomaly_score: number
  compliance_flags: string[]
  
  // Digital Signature
  event_hash: string
  signature: string
  signing_key_id: string
}

type SecurityEventType = 
  | 'device_pairing'
  | 'token_generation'
  | 'token_rotation'
  | 'token_revocation'
  | 'hardware_access'
  | 'sandbox_creation'
  | 'sandbox_violation'
  | 'anomaly_detection'
  | 'security_policy_violation'
  | 'encryption_operation'
  | 'key_generation'
  | 'key_destruction'
  | 'configuration_change'
  | 'access_denied'
  | 'quarantine_event'

class SecurityAuditLogger {
  async logSecurityEvent(event: Partial<SecurityAuditEvent>): Promise<void> {
    const fullEvent: SecurityAuditEvent = {
      event_id: generateSecureId(),
      timestamp: new Date().toISOString(),
      threat_level: ThreatLevel.LOW,
      anomaly_score: 0,
      compliance_flags: [],
      ...event
    } as SecurityAuditEvent
    
    // Generate cryptographic hash of event
    fullEvent.event_hash = await this.generateEventHash(fullEvent)
    
    // Sign event with audit signing key
    const auditKey = await this.keyManager.getAuditSigningKey()
    fullEvent.signature = await this.signEvent(fullEvent, auditKey)
    fullEvent.signing_key_id = auditKey.key_id
    
    // Store in tamper-evident audit log
    await this.storeAuditEvent(fullEvent)
    
    // Real-time security monitoring
    if (fullEvent.threat_level >= ThreatLevel.MEDIUM) {
      await this.triggerSecurityAlert(fullEvent)
    }
  }
  
  private async generateEventHash(event: SecurityAuditEvent): Promise<string> {
    const eventData = {
      event_type: event.event_type,
      device_id: event.device_id,
      tenant_id: event.tenant_id,
      timestamp: event.timestamp,
      event_data: event.event_data,
      security_context: event.security_context
    }
    
    const jsonData = JSON.stringify(eventData, Object.keys(eventData).sort())
    return crypto.createHash('sha256').update(jsonData).digest('hex')
  }
  
  async verifyAuditTrail(deviceId: string, timeRange: TimeRange): Promise<AuditVerificationResult> {
    const events = await this.getAuditEvents(deviceId, timeRange)
    const verificationResults: EventVerificationResult[] = []
    
    for (const event of events) {
      const verification = await this.verifyEvent(event)
      verificationResults.push({
        event_id: event.event_id,
        hash_valid: verification.hashValid,
        signature_valid: verification.signatureValid,
        timestamp_valid: verification.timestampValid,
        overall_valid: verification.hashValid && verification.signatureValid && verification.timestampValid
      })
    }
    
    return {
      device_id: deviceId,
      verification_time: new Date().toISOString(),
      events_verified: events.length,
      valid_events: verificationResults.filter(r => r.overall_valid).length,
      integrity_score: verificationResults.filter(r => r.overall_valid).length / events.length,
      verification_results: verificationResults
    }
  }
}

interface AuditVerificationResult {
  device_id: string
  verification_time: string
  events_verified: number
  valid_events: number
  integrity_score: number
  verification_results: EventVerificationResult[]
}
```

## Emergency Response Procedures

### Security Incident Response
```typescript
class SecurityIncidentResponse {
  async handleSecurityIncident(
    incidentType: SecurityIncidentType,
    deviceId: string,
    evidence: SecurityEvidence
  ): Promise<void> {
    const incident: SecurityIncident = {
      incident_id: generateIncidentId(),
      incident_type: incidentType,
      device_id: deviceId,
      severity: this.assessIncidentSeverity(incidentType, evidence),
      detected_at: Date.now(),
      evidence: evidence,
      status: 'active'
    }
    
    // Immediate containment actions
    await this.containThreat(incident)
    
    // Evidence preservation
    await this.preserveEvidence(incident)
    
    // Stakeholder notification
    await this.notifyStakeholders(incident)
    
    // Begin investigation
    await this.initiateInvestigation(incident)
  }
  
  private async containThreat(incident: SecurityIncident): Promise<void> {
    const containmentActions = {
      'device_compromise': [
        () => this.quarantineDevice(incident.device_id),
        () => this.revokeDeviceCredentials(incident.device_id),
        () => this.isolateNetworkAccess(incident.device_id),
        () => this.terminateSandbox(incident.device_id)
      ],
      'credential_theft': [
        () => this.rotateAllTokens(incident.device_id),
        () => this.invalidateActiveSessions(incident.device_id),
        () => this.requireRepairing(incident.device_id)
      ],
      'sandbox_escape': [
        () => this.terminateAllSandboxes(),
        () => this.updateSandboxPolicies(),
        () => this.auditSystemIntegrity()
      ],
      'anomalous_behavior': [
        () => this.increaseThreatMonitoring(incident.device_id),
        () => this.restrictDeviceOperations(incident.device_id),
        () => this.enhanceLogging(incident.device_id)
      ]
    }
    
    const actions = containmentActions[incident.incident_type] || []
    
    // Execute containment actions in parallel
    await Promise.allSettled(actions.map(action => action()))
  }
  
  private async preserveEvidence(incident: SecurityIncident): Promise<void> {
    const evidencePackage = {
      incident_id: incident.incident_id,
      device_id: incident.device_id,
      preservation_time: new Date().toISOString(),
      
      // System state snapshots
      device_configuration: await this.captureDeviceConfiguration(incident.device_id),
      network_connections: await this.captureNetworkState(incident.device_id),
      process_state: await this.captureProcessState(incident.device_id),
      memory_dumps: await this.captureMemoryDumps(incident.device_id),
      
      // Audit logs
      security_logs: await this.extractSecurityLogs(incident.device_id, {
        start: incident.detected_at - (24 * 60 * 60 * 1000), // 24 hours before
        end: incident.detected_at
      }),
      access_logs: await this.extractAccessLogs(incident.device_id),
      network_logs: await this.extractNetworkLogs(incident.device_id),
      
      // Cryptographic verification
      evidence_hash: '',
      chain_of_custody: [{
        handler: 'security_incident_response_system',
        timestamp: new Date().toISOString(),
        action: 'evidence_preservation'
      }]
    }
    
    // Generate evidence hash
    evidencePackage.evidence_hash = await this.generateEvidenceHash(evidencePackage)
    
    // Store in tamper-evident evidence storage
    await this.storeEvidence(evidencePackage)
  }
}

type SecurityIncidentType = 
  | 'device_compromise'
  | 'credential_theft'
  | 'sandbox_escape'
  | 'anomalous_behavior'
  | 'unauthorized_access'
  | 'data_exfiltration'
  | 'malware_detection'
  | 'policy_violation'

interface SecurityIncident {
  incident_id: string
  incident_type: SecurityIncidentType
  device_id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  detected_at: number
  evidence: SecurityEvidence
  status: 'active' | 'contained' | 'investigating' | 'resolved' | 'false_positive'
}
```

This comprehensive security framework ensures that Thorbis hardware integration maintains the highest security standards while providing seamless functionality across all supported device types and industries. The ephemeral token system, device sandboxing, and no-secrets-at-rest approach creates a robust security posture that can withstand sophisticated attacks while maintaining operational efficiency.
