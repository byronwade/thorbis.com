/**
 * GraphQL Types for Security & Compliance Services
 * Comprehensive security incident management, policy enforcement, compliance reporting,
 * 2FA/MFA, SSO integration, encryption management, audit logging, and retention policies
 */

export const securityComplianceTypeDefs = `
  # Security Incident Management Core Types
  type SecurityIncident implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Incident Identity
    incidentNumber: String!
    title: String!
    description: String!
    
    # Incident Classification
    incidentType: SecurityIncidentType!
    severity: SecuritySeverity!
    priority: SecurityPriority!
    category: String!
    subcategory: String
    
    # Incident Details
    detectedAt: DateTime!
    reportedAt: DateTime
    occurredAt: DateTime
    source: IncidentSource!
    affectedSystems: [String!]!
    affectedUsers: [SecurityUser!]!
    
    # Status and Assignment
    status: IncidentStatus!
    assignedTo: SecurityUser
    assignedToId: ID
    escalatedTo: SecurityUser
    escalatedToId: ID
    
    # Impact Assessment
    impactLevel: ImpactLevel!
    confidentialityImpact: ImpactLevel!
    integrityImpact: ImpactLevel!
    availabilityImpact: ImpactLevel!
    businessImpact: String
    
    # Response and Resolution
    responseTeam: [SecurityUser!]!
    containmentActions: [ContainmentAction!]!
    mitigationActions: [MitigationAction!]!
    recoveryActions: [RecoveryAction!]!
    
    # Timeline and Metrics
    responseTime: Int
    containmentTime: Int
    recoveryTime: Int
    totalResolutionTime: Int
    
    # Investigation
    rootCause: String
    contributingFactors: [String!]!
    evidenceCollected: [SecurityEvidence!]!
    forensicAnalysis: ForensicAnalysis
    
    # Compliance and Reporting
    complianceRequirements: [ComplianceRequirement!]!
    regulatoryNotifications: [RegulatoryNotification!]!
    
    # Documentation
    timeline: [IncidentTimelineEvent!]!
    communications: [IncidentCommunication!]!
    reports: [IncidentReport!]!
    
    # Lessons Learned
    lessonsLearned: String
    preventiveActions: [PreventiveAction!]!
    
    # Resolution
    resolvedAt: DateTime
    closedAt: DateTime
    closureReason: String
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type SecurityIncidentConnection {
    edges: [SecurityIncidentEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type SecurityIncidentEdge {
    cursor: String!
    node: SecurityIncident!
  }

  enum SecurityIncidentType {
    MALWARE
    PHISHING
    DATA_BREACH
    UNAUTHORIZED_ACCESS
    DENIAL_OF_SERVICE
    INSIDER_THREAT
    SOCIAL_ENGINEERING
    PHYSICAL_SECURITY
    SYSTEM_COMPROMISE
    NETWORK_INTRUSION
    DATA_LOSS
    POLICY_VIOLATION
    VULNERABILITY_EXPLOIT
    FRAUD
    RANSOMWARE
    CRYPTOJACKING
    SUPPLY_CHAIN
    THIRD_PARTY_BREACH
    HUMAN_ERROR
    SYSTEM_FAILURE
  }

  enum SecuritySeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
    CATASTROPHIC
  }

  enum SecurityPriority {
    LOW
    NORMAL
    HIGH
    URGENT
    EMERGENCY
  }

  enum IncidentSource {
    AUTOMATED_DETECTION
    USER_REPORT
    SECURITY_TEAM
    THIRD_PARTY_ALERT
    AUDIT_FINDING
    MONITORING_SYSTEM
    THREAT_INTELLIGENCE
    EXTERNAL_NOTIFICATION
    COMPLIANCE_CHECK
    VULNERABILITY_SCAN
  }

  enum IncidentStatus {
    NEW
    TRIAGED
    ASSIGNED
    INVESTIGATING
    CONTAINED
    MITIGATING
    RECOVERING
    RESOLVED
    CLOSED
    FALSE_POSITIVE
  }

  enum ImpactLevel {
    NONE
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  # Security Policy Management
  type SecurityPolicy implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Policy Identity
    policyNumber: String!
    title: String!
    description: String!
    
    # Policy Classification
    policyType: SecurityPolicyType!
    category: String!
    subcategory: String
    framework: ComplianceFramework
    
    # Policy Content
    purpose: String!
    scope: String!
    policyStatement: String!
    procedures: [PolicyProcedure!]!
    controls: [SecurityControl!]!
    
    # Governance
    owner: SecurityUser!
    ownerId: ID!
    approver: SecurityUser!
    approverId: ID!
    reviewers: [SecurityUser!]!
    
    # Lifecycle
    version: String!
    status: PolicyStatus!
    effectiveDate: DateTime!
    expirationDate: DateTime
    lastReviewDate: DateTime
    nextReviewDate: DateTime!
    
    # Implementation
    applicableSystems: [String!]!
    applicableRoles: [String!]!
    exemptions: [PolicyExemption!]!
    
    # Compliance Mapping
    complianceRequirements: [ComplianceRequirement!]!
    controls: [SecurityControl!]!
    metrics: [PolicyMetric!]!
    
    # Training and Awareness
    trainingRequired: Boolean!
    acknowledgmentRequired: Boolean!
    acknowledgments: [PolicyAcknowledgment!]!
    
    # Monitoring and Enforcement
    violations: [PolicyViolation!]!
    exceptions: [PolicyException!]!
    
    # Document Management
    documents: [String!]!
    relatedPolicies: [SecurityPolicy!]!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum SecurityPolicyType {
    INFORMATION_SECURITY
    ACCESS_CONTROL
    DATA_PROTECTION
    INCIDENT_RESPONSE
    BUSINESS_CONTINUITY
    RISK_MANAGEMENT
    ACCEPTABLE_USE
    REMOTE_WORK
    BYOD
    CLOUD_SECURITY
    THIRD_PARTY_RISK
    PHYSICAL_SECURITY
    CHANGE_MANAGEMENT
    ASSET_MANAGEMENT
    VULNERABILITY_MANAGEMENT
    ENCRYPTION
    BACKUP_RECOVERY
    MONITORING_LOGGING
    TRAINING_AWARENESS
    COMPLIANCE
  }

  enum PolicyStatus {
    DRAFT
    REVIEW
    APPROVED
    ACTIVE
    RETIRED
    SUPERSEDED
  }

  enum ComplianceFramework {
    ISO_27001
    SOC2
    GDPR
    HIPAA
    PCI_DSS
    NIST_CSF
    COBIT
    ITIL
    SOX
    FISMA
    FERPA
    CCPA
    PIPEDA
    CMMC
    FedRAMP
    CSA_CCM
    CIS_CONTROLS
    OWASP
    CUSTOM
  }

  # Two-Factor Authentication Management
  type TwoFactorAuth implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    userId: ID!
    user: SecurityUser!
    
    # 2FA Configuration
    isEnabled: Boolean!
    method: TwoFactorMethod!
    backupMethod: TwoFactorMethod
    
    # TOTP Configuration
    totpSecret: String # Encrypted
    totpQRCode: String
    backupCodes: [String!]! # Encrypted
    usedBackupCodes: [String!]!
    
    # SMS Configuration
    phoneNumber: String # Encrypted
    phoneVerified: Boolean!
    
    # Email Configuration
    emailAddress: String
    emailVerified: Boolean!
    
    # Hardware Token Configuration
    tokenSerial: String
    tokenType: String
    
    # Biometric Configuration
    biometricType: BiometricType
    biometricData: String # Encrypted hash
    
    # Status and Verification
    verificationAttempts: Int!
    lastSuccessfulVerification: DateTime
    lastFailedVerification: DateTime
    isLocked: Boolean!
    lockoutUntil: DateTime
    
    # Recovery and Backup
    recoveryEmail: String
    recoveryPhone: String
    emergencyContacts: [String!]!
    
    # Audit Trail
    setupDate: DateTime!
    lastUsed: DateTime
    verificationHistory: [VerificationAttempt!]!
    
    # Configuration
    requireForLogin: Boolean!
    requireForSensitiveOperations: Boolean!
    sessionTimeout: Int
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum TwoFactorMethod {
    TOTP
    SMS
    EMAIL
    HARDWARE_TOKEN
    BIOMETRIC
    PUSH_NOTIFICATION
    VOICE_CALL
    BACKUP_CODES
  }

  enum BiometricType {
    FINGERPRINT
    FACE_RECOGNITION
    VOICE_RECOGNITION
    IRIS_SCAN
    PALM_SCAN
  }

  # Single Sign-On Configuration
  type SSOConfiguration implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # SSO Identity
    name: String!
    description: String!
    
    # Provider Configuration
    provider: SSOProvider!
    providerType: SSOProviderType!
    
    # SAML Configuration
    samlEntityId: String
    samlMetadataUrl: String
    samlCertificate: String
    samlSigningKey: String # Encrypted
    
    # OIDC Configuration
    oidcClientId: String
    oidcClientSecret: String # Encrypted
    oidcIssuerUrl: String
    oidcJwksUri: String
    
    # LDAP Configuration
    ldapUrl: String
    ldapBindDN: String
    ldapBindPassword: String # Encrypted
    ldapUserSearchBase: String
    ldapGroupSearchBase: String
    
    # OAuth Configuration
    oauthClientId: String
    oauthClientSecret: String # Encrypted
    oauthAuthorizationUrl: String
    oauthTokenUrl: String
    oauthScope: [String!]!
    
    # Attribute Mapping
    attributeMapping: AttributeMapping!
    
    # Security Settings
    enforceSSL: Boolean!
    validateCertificates: Boolean!
    sessionTimeout: Int
    maxConcurrentSessions: Int
    
    # User Provisioning
    autoProvisionUsers: Boolean!
    autoUpdateUserInfo: Boolean!
    defaultRoles: [String!]!
    groupMapping: [GroupMapping!]!
    
    # Status and Monitoring
    isEnabled: Boolean!
    status: SSOStatus!
    lastSync: DateTime
    syncErrors: [SSOError!]!
    
    # Usage Statistics
    loginAttempts: Int!
    successfulLogins: Int!
    failedLogins: Int!
    lastUsed: DateTime
    
    # Audit Trail
    configurationHistory: [SSOConfigurationChange!]!
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum SSOProvider {
    ACTIVE_DIRECTORY
    AZURE_AD
    OKTA
    GOOGLE_WORKSPACE
    AWS_SSO
    ONELOGIN
    PING_IDENTITY
    ADFS
    KEYCLOAK
    CUSTOM_SAML
    CUSTOM_OIDC
    LDAP
    CUSTOM_OAUTH
  }

  enum SSOProviderType {
    SAML
    OIDC
    OAUTH
    LDAP
    CUSTOM
  }

  enum SSOStatus {
    ACTIVE
    INACTIVE
    ERROR
    SYNCING
    MAINTENANCE
  }

  # Encryption Management
  type EncryptionKey implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Key Identity
    keyName: String!
    keyAlias: String
    description: String!
    
    # Key Properties
    keyType: EncryptionKeyType!
    keySize: Int!
    algorithm: EncryptionAlgorithm!
    keyUsage: [KeyUsage!]!
    
    # Key Lifecycle
    status: KeyStatus!
    generationDate: DateTime!
    activationDate: DateTime!
    expirationDate: DateTime
    retirementDate: DateTime
    destructionDate: DateTime
    
    # Key Storage
    storageLocation: KeyStorageType!
    hsmPartition: String
    keyVaultName: String
    
    # Access Control
    owner: SecurityUser!
    ownerId: ID!
    accessPolicies: [KeyAccessPolicy!]!
    authorizedUsers: [SecurityUser!]!
    
    # Key Operations
    canEncrypt: Boolean!
    canDecrypt: Boolean!
    canSign: Boolean!
    canVerify: Boolean!
    canWrap: Boolean!
    canUnwrap: Boolean!
    
    # Key Rotation
    rotationPolicy: KeyRotationPolicy
    lastRotationDate: DateTime
    nextRotationDate: DateTime
    rotationHistory: [KeyRotationEvent!]!
    
    # Usage Tracking
    usageCount: Int!
    lastUsed: DateTime
    usageLog: [KeyUsageEvent!]!
    
    # Compliance
    complianceRequirements: [ComplianceRequirement!]!
    auditTrail: [KeyAuditEvent!]!
    
    # Backup and Recovery
    backupStatus: BackupStatus!
    recoveryKeys: [String!]!
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum EncryptionKeyType {
    SYMMETRIC
    ASYMMETRIC_PRIVATE
    ASYMMETRIC_PUBLIC
    MASTER_KEY
    DATA_ENCRYPTION_KEY
    KEY_ENCRYPTION_KEY
  }

  enum EncryptionAlgorithm {
    AES_128
    AES_192
    AES_256
    RSA_2048
    RSA_3072
    RSA_4096
    ECDSA_P256
    ECDSA_P384
    ECDSA_P521
    ED25519
    CHACHA20_POLY1305
  }

  enum KeyUsage {
    ENCRYPT
    DECRYPT
    SIGN
    VERIFY
    WRAP_KEY
    UNWRAP_KEY
    DERIVE_KEY
    GENERATE_MAC
    VERIFY_MAC
  }

  enum KeyStatus {
    PENDING_GENERATION
    ACTIVE
    SUSPENDED
    COMPROMISED
    RETIRED
    DESTROYED
  }

  enum KeyStorageType {
    SOFTWARE
    HSM
    CLOUD_HSM
    KEY_VAULT
    SECURE_ENCLAVE
  }

  enum BackupStatus {
    BACKED_UP
    PENDING_BACKUP
    BACKUP_FAILED
    NOT_BACKED_UP
  }

  # Audit Logging
  type AuditLog implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Event Identity
    eventId: String!
    eventType: AuditEventType!
    eventCategory: AuditEventCategory!
    
    # Event Details
    timestamp: DateTime!
    source: AuditSource!
    sourceIP: String
    userAgent: String
    sessionId: String
    
    # Actor Information
    actorId: ID
    actor: SecurityUser
    actorType: ActorType!
    actorName: String!
    
    # Target Information
    targetId: ID
    targetType: String!
    targetName: String
    
    # Action Details
    action: String!
    actionResult: ActionResult!
    description: String!
    
    # Data Changes
    beforeValue: JSON
    afterValue: JSON
    changedFields: [String!]!
    
    # Request/Response
    requestData: JSON
    responseData: JSON
    statusCode: Int
    
    # Risk Assessment
    riskLevel: RiskLevel!
    anomalyScore: Float
    
    # Geographic and Device Info
    geolocation: Geolocation
    deviceInfo: DeviceInfo
    
    # Compliance and Retention
    complianceRequirements: [ComplianceRequirement!]!
    retentionPolicy: RetentionPolicy!
    
    # Correlation
    correlationId: String
    relatedEvents: [AuditLog!]!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
  }

  enum AuditEventType {
    AUTHENTICATION
    AUTHORIZATION
    DATA_ACCESS
    DATA_MODIFICATION
    SYSTEM_ACCESS
    CONFIGURATION_CHANGE
    POLICY_VIOLATION
    SECURITY_EVENT
    COMPLIANCE_EVENT
    ADMINISTRATIVE_ACTION
  }

  enum AuditEventCategory {
    LOGIN_LOGOUT
    PASSWORD_CHANGE
    PERMISSION_CHANGE
    FILE_ACCESS
    DATABASE_OPERATION
    API_CALL
    SYSTEM_COMMAND
    NETWORK_ACCESS
    EMAIL_SEND
    REPORT_GENERATION
  }

  enum AuditSource {
    WEB_APPLICATION
    MOBILE_APP
    API
    SYSTEM_SERVICE
    DATABASE
    NETWORK_DEVICE
    SECURITY_TOOL
    MANUAL_ENTRY
    BATCH_PROCESS
    THIRD_PARTY_INTEGRATION
  }

  enum ActorType {
    USER
    SERVICE_ACCOUNT
    SYSTEM
    API_KEY
    ANONYMOUS
    BATCH_JOB
    SCHEDULED_TASK
  }

  enum ActionResult {
    SUCCESS
    FAILURE
    PARTIAL_SUCCESS
    DENIED
    ERROR
    TIMEOUT
    CANCELLED
  }

  enum RiskLevel {
    VERY_LOW
    LOW
    MEDIUM
    HIGH
    VERY_HIGH
    CRITICAL
  }

  # Compliance Reporting
  type ComplianceReport implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Report Identity
    reportNumber: String!
    title: String!
    reportType: ComplianceReportType!
    
    # Compliance Framework
    framework: ComplianceFramework!
    version: String
    scope: String!
    
    # Report Period
    reportingPeriod: ReportingPeriod!
    startDate: DateTime!
    endDate: DateTime!
    
    # Status and Lifecycle
    status: ComplianceReportStatus!
    generatedDate: DateTime
    submittedDate: DateTime
    approvedDate: DateTime
    publishedDate: DateTime
    
    # Ownership and Review
    preparedBy: SecurityUser!
    preparedById: ID!
    reviewedBy: SecurityUser
    reviewedById: ID
    approvedBy: SecurityUser
    approvedById: ID
    
    # Report Content
    executiveSummary: String!
    findings: [ComplianceFinding!]!
    recommendations: [ComplianceRecommendation!]!
    riskAssessment: ComplianceRiskAssessment!
    
    # Controls Assessment
    controlsAssessed: Int!
    controlsCompliant: Int!
    controlsNonCompliant: Int!
    controlsNotApplicable: Int!
    
    # Metrics and KPIs
    complianceScore: Float!
    metrics: [ComplianceMetric!]!
    trends: [ComplianceTrend!]!
    
    # Evidence and Documentation
    evidence: [ComplianceEvidence!]!
    supportingDocuments: [String!]!
    
    # Distribution
    distributionList: [String!]!
    confidentialityLevel: ConfidentialityLevel!
    
    # Follow-up Actions
    actionItems: [ComplianceActionItem!]!
    remediation: [RemediationPlan!]!
    
    # External Requirements
    regulatorySubmission: Boolean!
    submissionDeadline: DateTime
    certificationRequired: Boolean!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ComplianceReportType {
    INTERNAL_ASSESSMENT
    EXTERNAL_AUDIT
    REGULATORY_SUBMISSION
    CERTIFICATION_REPORT
    RISK_ASSESSMENT
    GAP_ANALYSIS
    REMEDIATION_REPORT
    CONTINUOUS_MONITORING
    INCIDENT_REPORT
    ANNUAL_REVIEW
  }

  enum ReportingPeriod {
    MONTHLY
    QUARTERLY
    SEMI_ANNUALLY
    ANNUALLY
    AD_HOC
    CONTINUOUS
  }

  enum ComplianceReportStatus {
    DRAFT
    IN_REVIEW
    APPROVED
    SUBMITTED
    PUBLISHED
    ARCHIVED
  }

  # Supporting Types
  type SecurityUser implements Node {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
    email: String!
    title: String
    department: String
    role: SecurityRole!
    permissions: [String!]!
    clearanceLevel: SecurityClearance
    isActive: Boolean!
    lastLoginAt: DateTime
  }

  enum SecurityRole {
    SECURITY_ANALYST
    SECURITY_ENGINEER
    INCIDENT_RESPONDER
    COMPLIANCE_OFFICER
    SECURITY_MANAGER
    CISO
    AUDITOR
    RISK_ANALYST
    FORENSIC_ANALYST
    SECURITY_ARCHITECT
  }

  enum SecurityClearance {
    PUBLIC
    CONFIDENTIAL
    SECRET
    TOP_SECRET
  }

  type ComplianceRequirement {
    id: ID!
    framework: ComplianceFramework!
    controlId: String!
    title: String!
    description: String!
    category: String!
    isRequired: Boolean!
  }

  type Geolocation {
    latitude: Float
    longitude: Float
    country: String
    region: String
    city: String
    timezone: String
  }

  type DeviceInfo {
    deviceId: String
    deviceType: String
    operatingSystem: String
    browser: String
    ipAddress: String
    macAddress: String
  }

  type RetentionPolicy {
    id: ID!
    name: String!
    retentionPeriod: Int!
    retentionUnit: RetentionUnit!
    autoDelete: Boolean!
  }

  enum RetentionUnit {
    DAYS
    MONTHS
    YEARS
  }

  # Input Types
  input SecurityIncidentInput {
    title: String!
    description: String!
    incidentType: SecurityIncidentType!
    severity: SecuritySeverity
    priority: SecurityPriority
    category: String!
    subcategory: String
    detectedAt: DateTime!
    occurredAt: DateTime
    source: IncidentSource!
    affectedSystems: [String!]
    impactLevel: ImpactLevel
    confidentialityImpact: ImpactLevel
    integrityImpact: ImpactLevel
    availabilityImpact: ImpactLevel
    businessImpact: String
    assignedToId: ID
    tags: [String!]
    customFields: JSON
  }

  input SecurityPolicyInput {
    title: String!
    description: String!
    policyType: SecurityPolicyType!
    category: String!
    framework: ComplianceFramework
    purpose: String!
    scope: String!
    policyStatement: String!
    ownerId: ID!
    approverId: ID!
    effectiveDate: DateTime!
    expirationDate: DateTime
    nextReviewDate: DateTime!
    applicableSystems: [String!]
    applicableRoles: [String!]
    trainingRequired: Boolean
    acknowledgmentRequired: Boolean
    tags: [String!]
    customFields: JSON
  }

  input TwoFactorAuthInput {
    userId: ID!
    method: TwoFactorMethod!
    backupMethod: TwoFactorMethod
    phoneNumber: String
    emailAddress: String
    requireForLogin: Boolean
    requireForSensitiveOperations: Boolean
    sessionTimeout: Int
  }

  input SSOConfigurationInput {
    name: String!
    description: String!
    provider: SSOProvider!
    providerType: SSOProviderType!
    samlEntityId: String
    samlMetadataUrl: String
    oidcClientId: String
    oidcClientSecret: String
    oidcIssuerUrl: String
    ldapUrl: String
    ldapBindDN: String
    ldapBindPassword: String
    oauthClientId: String
    oauthClientSecret: String
    enforceSSL: Boolean
    autoProvisionUsers: Boolean
    autoUpdateUserInfo: Boolean
    defaultRoles: [String!]
    isEnabled: Boolean
  }

  input EncryptionKeyInput {
    keyName: String!
    description: String!
    keyType: EncryptionKeyType!
    keySize: Int!
    algorithm: EncryptionAlgorithm!
    keyUsage: [KeyUsage!]!
    storageLocation: KeyStorageType!
    ownerId: ID!
    expirationDate: DateTime
    canEncrypt: Boolean
    canDecrypt: Boolean
    canSign: Boolean
    canVerify: Boolean
  }

  # Query Extensions for Security & Compliance
  extend type Query {
    # Security Incidents
    securityIncident(id: ID!): SecurityIncident
    securityIncidents(
      status: IncidentStatus
      severity: SecuritySeverity
      incidentType: SecurityIncidentType
      assignedTo: ID
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): SecurityIncidentConnection!
    
    # Security Policies
    securityPolicy(id: ID!): SecurityPolicy
    securityPolicies(
      policyType: SecurityPolicyType
      status: PolicyStatus
      framework: ComplianceFramework
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): [SecurityPolicy!]!
    
    # Two-Factor Authentication
    twoFactorAuth(userId: ID!): TwoFactorAuth
    twoFactorAuthSettings(
      method: TwoFactorMethod
      isEnabled: Boolean
      pagination: PaginationInput
    ): [TwoFactorAuth!]!
    
    # SSO Configuration
    ssoConfiguration(id: ID!): SSOConfiguration
    ssoConfigurations(
      provider: SSOProvider
      status: SSOStatus
      isEnabled: Boolean
      pagination: PaginationInput
    ): [SSOConfiguration!]!
    
    # Encryption Keys
    encryptionKey(id: ID!): EncryptionKey
    encryptionKeys(
      keyType: EncryptionKeyType
      status: KeyStatus
      algorithm: EncryptionAlgorithm
      pagination: PaginationInput
      filters: [FilterInput!]
    ): [EncryptionKey!]!
    
    # Audit Logs
    auditLogs(
      eventType: AuditEventType
      actorId: ID
      targetType: String
      startDate: DateTime
      endDate: DateTime
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): [AuditLog!]!
    
    # Compliance Reports
    complianceReport(id: ID!): ComplianceReport
    complianceReports(
      framework: ComplianceFramework
      reportType: ComplianceReportType
      status: ComplianceReportStatus
      pagination: PaginationInput
      filters: [FilterInput!]
    ): [ComplianceReport!]!
    
    # Security Analytics
    securityMetrics(
      timeframe: AnalyticsTimeframe
      startDate: DateTime
      endDate: DateTime
    ): SecurityMetrics!
    
    complianceMetrics(
      framework: ComplianceFramework
      timeframe: AnalyticsTimeframe
    ): ComplianceMetrics!
  }

  # Mutation Extensions for Security & Compliance
  extend type Mutation {
    # Security Incident Management
    createSecurityIncident(input: SecurityIncidentInput!): SecurityIncident!
    updateSecurityIncident(id: ID!, input: SecurityIncidentInput!): SecurityIncident!
    updateIncidentStatus(id: ID!, status: IncidentStatus!, notes: String): SecurityIncident!
    assignIncident(incidentId: ID!, assigneeId: ID!): SecurityIncident!
    escalateIncident(incidentId: ID!, escalateTo: ID!, reason: String!): SecurityIncident!
    
    # Security Policy Management
    createSecurityPolicy(input: SecurityPolicyInput!): SecurityPolicy!
    updateSecurityPolicy(id: ID!, input: SecurityPolicyInput!): SecurityPolicy!
    approvePolicy(id: ID!, approvalNotes: String): SecurityPolicy!
    retirePolicy(id: ID!, retirementReason: String!): SecurityPolicy!
    
    # Two-Factor Authentication
    setupTwoFactorAuth(input: TwoFactorAuthInput!): TwoFactorAuth!
    enableTwoFactorAuth(userId: ID!): TwoFactorAuth!
    disableTwoFactorAuth(userId: ID!, reason: String!): TwoFactorAuth!
    generateBackupCodes(userId: ID!): [String!]!
    resetTwoFactorAuth(userId: ID!, adminOverride: Boolean!): TwoFactorAuth!
    
    # SSO Configuration
    createSSOConfiguration(input: SSOConfigurationInput!): SSOConfiguration!
    updateSSOConfiguration(id: ID!, input: SSOConfigurationInput!): SSOConfiguration!
    enableSSO(id: ID!): SSOConfiguration!
    disableSSO(id: ID!): SSOConfiguration!
    testSSOConnection(id: ID!): SSOTestResult!
    syncSSOUsers(id: ID!): SSOSyncResult!
    
    # Encryption Key Management
    generateEncryptionKey(input: EncryptionKeyInput!): EncryptionKey!
    rotateEncryptionKey(id: ID!): EncryptionKey!
    retireEncryptionKey(id: ID!, retirementReason: String!): EncryptionKey!
    
    # Compliance Reporting
    generateComplianceReport(
      framework: ComplianceFramework!
      reportType: ComplianceReportType!
      startDate: DateTime!
      endDate: DateTime!
    ): ComplianceReport!
    
    submitComplianceReport(id: ID!, submissionNotes: String): ComplianceReport!
  }

  # Subscription Extensions for Security & Compliance
  extend type Subscription {
    # Real-time Security Events
    securityIncidents(businessId: ID!): SecurityIncident!
    securityAlerts(businessId: ID!, severity: SecuritySeverity): SecurityAlert!
    auditEvents(businessId: ID!, eventType: AuditEventType): AuditLog!
    
    # Compliance Events
    complianceAlerts(businessId: ID!): ComplianceAlert!
    policyViolations(businessId: ID!): PolicyViolation!
    
    # System Security Events
    authenticationEvents(businessId: ID!): AuthenticationEvent!
    systemSecurityEvents(businessId: ID!): SystemSecurityEvent!
  }

  # Analytics Types
  type SecurityMetrics {
    totalIncidents: Int!
    openIncidents: Int!
    criticalIncidents: Int!
    averageResolutionTime: Float!
    incidentsByType: [CategoryValue!]!
    incidentsBySeverity: [CategoryValue!]!
    incidentTrends: [PeriodValue!]!
    complianceScore: Float!
  }

  type ComplianceMetrics {
    overallScore: Float!
    controlsCompliant: Int!
    controlsNonCompliant: Int!
    riskScore: Float!
    complianceByFramework: [FrameworkScore!]!
    trends: [PeriodValue!]!
  }

  type FrameworkScore {
    framework: ComplianceFramework!
    score: Float!
    totalControls: Int!
    compliantControls: Int!
  }

  # Alert Types
  type SecurityAlert {
    id: ID!
    level: AlertLevel!
    message: String!
    incidentId: ID
    timestamp: DateTime!
    source: String!
    data: JSON
  }

  type ComplianceAlert {
    id: ID!
    level: AlertLevel!
    message: String!
    framework: ComplianceFramework!
    controlId: String
    timestamp: DateTime!
    data: JSON
  }

  type AuthenticationEvent {
    id: ID!
    userId: ID!
    eventType: String!
    success: Boolean!
    ipAddress: String
    userAgent: String
    timestamp: DateTime!
  }

  type SystemSecurityEvent {
    id: ID!
    eventType: String!
    severity: SecuritySeverity!
    description: String!
    affectedSystem: String
    timestamp: DateTime!
  }

  type SSOTestResult {
    success: Boolean!
    message: String!
    details: JSON
  }

  type SSOSyncResult {
    success: Boolean!
    usersProcessed: Int!
    usersCreated: Int!
    usersUpdated: Int!
    errors: [String!]!
  }
`