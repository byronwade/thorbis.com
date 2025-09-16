/**
 * Document Management GraphQL Types
 * 
 * Comprehensive document management system including templates, generated documents,
 * PDF generation, versioning, digital signatures, and collaboration features
 */

export const documentManagementTypeDefs = `
  # Document Management Core Types
  type Document implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Document Identity
    name: String!
    title: String!
    description: String
    filename: String!
    originalFilename: String!
    
    # Document Classification
    documentType: DocumentType!
    category: DocumentCategory!
    industry: Industry
    tags: [String!]!
    
    # File Properties
    fileUrl: String!
    fileSize: Int!
    mimeType: String!
    fileExtension: String!
    checksum: String!
    
    # Document Status and Lifecycle
    status: DocumentStatus!
    version: String!
    isLatestVersion: Boolean!
    visibility: DocumentVisibility!
    accessLevel: AccessLevel!
    
    # Content and Structure
    content: String
    extractedText: String
    metadata: JSON
    customFields: JSON
    
    # Relationships
    template: DocumentTemplate
    templateId: ID
    parent: Document
    parentId: ID
    versions: DocumentVersionConnection!
    signatures: DigitalSignatureConnection!
    collaborators: DocumentCollaboratorConnection!
    comments: DocumentCommentConnection!
    attachments: DocumentAttachmentConnection!
    
    # Security and Permissions
    encryptionEnabled: Boolean!
    passwordProtected: Boolean!
    expirationDate: DateTime
    downloadable: Boolean!
    printable: Boolean!
    watermarkEnabled: Boolean!
    
    # Analytics and Tracking
    viewCount: Int!
    downloadCount: Int!
    shareCount: Int!
    lastViewedAt: DateTime
    lastDownloadedAt: DateTime
    
    # Document Processing
    processingStatus: ProcessingStatus!
    ocrEnabled: Boolean!
    thumbnailUrl: String
    previewUrl: String
    
    # Audit and Compliance
    retentionPolicy: RetentionPolicy
    complianceFlags: [String!]!
    auditTrail: [AuditEntry!]!
    
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: User!
    updatedBy: User!
  }

  type DocumentConnection {
    edges: [DocumentEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
    facets: [DocumentFacet!]
  }

  type DocumentEdge {
    cursor: String!
    node: Document!
  }

  type DocumentFacet {
    field: String!
    values: [DocumentFacetValue!]!
  }

  type DocumentFacetValue {
    value: String!
    count: Int!
  }

  # Document Template System
  type DocumentTemplate implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Template Identity
    name: String!
    title: String!
    description: String
    category: TemplateCategory!
    industry: Industry
    
    # Template Structure
    templateType: TemplateType!
    format: TemplateFormat!
    layout: TemplateLayout!
    sections: [TemplateSection!]!
    fields: [TemplateField!]!
    
    # Template Content
    htmlContent: String
    cssStyles: String
    headerContent: String
    footerContent: String
    watermark: String
    
    # Template Configuration
    status: TemplateStatus!
    version: String!
    isDefault: Boolean!
    isPublic: Boolean!
    
    # Usage and Analytics
    usageCount: Int!
    lastUsedAt: DateTime
    documents: DocumentConnection!
    
    # Customization
    allowCustomization: Boolean!
    customizationOptions: JSON
    variables: [TemplateVariable!]!
    
    # Validation and Rules
    validationRules: [ValidationRule!]!
    requiredFields: [String!]!
    conditionalLogic: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: User!
  }

  type DocumentTemplateConnection {
    edges: [DocumentTemplateEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type DocumentTemplateEdge {
    cursor: String!
    node: DocumentTemplate!
  }

  # Template Components
  type TemplateSection {
    id: ID!
    name: String!
    title: String!
    order: Int!
    type: SectionType!
    content: String
    required: Boolean!
    repeatable: Boolean!
    conditionalDisplay: JSON
    styling: JSON
  }

  type TemplateField {
    id: ID!
    name: String!
    label: String!
    type: FieldType!
    required: Boolean!
    defaultValue: String
    placeholder: String
    validation: FieldValidation
    options: [String!]
    conditionalLogic: JSON
    formatting: JSON
  }

  type TemplateVariable {
    name: String!
    type: VariableType!
    description: String
    defaultValue: String
    required: Boolean!
    scope: VariableScope!
  }

  type ValidationRule {
    field: String!
    rule: ValidationRuleType!
    value: String
    message: String!
    severity: ValidationSeverity!
  }

  type FieldValidation {
    required: Boolean!
    minLength: Int
    maxLength: Int
    pattern: String
    customValidator: String
  }

  # Document Versioning
  type DocumentVersion implements Node & Timestamped {
    id: ID!
    documentId: ID!
    version: String!
    versionNumber: Int!
    
    # Version Properties
    changeType: ChangeType!
    changeDescription: String
    changelog: [ChangelogEntry!]!
    
    # File Properties
    fileUrl: String!
    fileSize: Int!
    checksum: String!
    
    # Version Status
    status: VersionStatus!
    isCurrent: Boolean!
    isArchived: Boolean!
    
    # Comparison and Diff
    parentVersion: DocumentVersion
    differenceReport: JSON
    
    createdAt: DateTime!
    createdBy: User!
  }

  type DocumentVersionConnection {
    edges: [DocumentVersionEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type DocumentVersionEdge {
    cursor: String!
    node: DocumentVersion!
  }

  type ChangelogEntry {
    field: String!
    oldValue: String
    newValue: String
    changeType: ChangeType!
    timestamp: DateTime!
  }

  # Digital Signatures
  type DigitalSignature implements Node & Timestamped {
    id: ID!
    documentId: ID!
    
    # Signature Identity
    signerId: ID!
    signer: User!
    signerEmail: String!
    signerName: String!
    
    # Signature Properties
    signatureType: SignatureType!
    signatureMethod: SignatureMethod!
    signatureData: String!
    certificate: SignatureCertificate
    
    # Signature Status
    status: SignatureStatus!
    signedAt: DateTime
    verificationStatus: VerificationStatus!
    
    # Signature Position and Appearance
    pageNumber: Int
    positionX: Float
    positionY: Float
    width: Float
    height: Float
    appearance: SignatureAppearance
    
    # Legal and Compliance
    legallyBinding: Boolean!
    complianceLevel: ComplianceLevel!
    auditTrail: [SignatureAuditEntry!]!
    
    # Verification and Security
    timestampToken: String
    hashAlgorithm: String!
    encryptionLevel: EncryptionLevel!
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type DigitalSignatureConnection {
    edges: [DigitalSignatureEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type DigitalSignatureEdge {
    cursor: String!
    node: DigitalSignature!
  }

  type SignatureCertificate {
    serialNumber: String!
    issuer: String!
    subject: String!
    validFrom: DateTime!
    validTo: DateTime!
    fingerprint: String!
    algorithm: String!
  }

  type SignatureAppearance {
    showName: Boolean!
    showDate: Boolean!
    showReason: Boolean!
    showLocation: Boolean!
    showSignatureImage: Boolean!
    customText: String
    fontFamily: String
    fontSize: Int
    color: String
  }

  type SignatureAuditEntry {
    action: SignatureAction!
    timestamp: DateTime!
    ipAddress: String
    userAgent: String
    details: JSON
  }

  # Document Collaboration
  type DocumentCollaborator implements Node & Timestamped {
    id: ID!
    documentId: ID!
    userId: ID!
    user: User!
    
    # Collaboration Properties
    role: CollaboratorRole!
    permissions: [DocumentPermission!]!
    accessType: AccessType!
    
    # Status and Activity
    status: CollaboratorStatus!
    lastActivity: DateTime
    invitedAt: DateTime
    joinedAt: DateTime
    
    # Collaboration Features
    canEdit: Boolean!
    canComment: Boolean!
    canShare: Boolean!
    canDelete: Boolean!
    canManageVersions: Boolean!
    
    # Notification Preferences
    notifyOnChanges: Boolean!
    notifyOnComments: Boolean!
    notifyOnShares: Boolean!
    
    createdAt: DateTime!
    updatedAt: DateTime!
    invitedBy: User!
  }

  type DocumentCollaboratorConnection {
    edges: [DocumentCollaboratorEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type DocumentCollaboratorEdge {
    cursor: String!
    node: DocumentCollaborator!
  }

  # Document Comments and Annotations
  type DocumentComment implements Node & Timestamped {
    id: ID!
    documentId: ID!
    
    # Comment Content
    content: String!
    commentType: CommentType!
    
    # Comment Position (for annotations)
    pageNumber: Int
    positionX: Float
    positionY: Float
    selectionText: String
    
    # Comment Thread
    parentId: ID
    parent: DocumentComment
    replies: DocumentCommentConnection!
    threadId: String!
    
    # Comment Status
    status: CommentStatus!
    resolved: Boolean!
    resolvedAt: DateTime
    resolvedBy: User
    
    # Comment Properties
    priority: CommentPriority!
    category: CommentCategory
    tags: [String!]!
    
    # Mentions and Notifications
    mentions: [User!]!
    attachments: [CommentAttachment!]!
    
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: User!
    updatedBy: User
  }

  type DocumentCommentConnection {
    edges: [DocumentCommentEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type DocumentCommentEdge {
    cursor: String!
    node: DocumentComment!
  }

  type CommentAttachment {
    id: ID!
    filename: String!
    fileUrl: String!
    fileSize: Int!
    mimeType: String!
  }

  # Document Attachments
  type DocumentAttachment implements Node & Timestamped {
    id: ID!
    documentId: ID!
    
    # Attachment Properties
    filename: String!
    originalFilename: String!
    fileUrl: String!
    fileSize: Int!
    mimeType: String!
    fileExtension: String!
    
    # Attachment Classification
    attachmentType: AttachmentType!
    category: AttachmentCategory
    description: String
    
    # Attachment Status
    status: AttachmentStatus!
    processed: Boolean!
    thumbnailUrl: String
    
    # Security
    encryptionEnabled: Boolean!
    accessLevel: AccessLevel!
    
    createdAt: DateTime!
    updatedAt: DateTime!
    uploadedBy: User!
  }

  type DocumentAttachmentConnection {
    edges: [DocumentAttachmentEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type DocumentAttachmentEdge {
    cursor: String!
    node: DocumentAttachment!
  }

  # PDF Generation
  type PDFGenerationJob implements Node & Timestamped {
    id: ID!
    businessId: ID!
    
    # Job Properties
    templateId: ID
    template: DocumentTemplate
    documentId: ID
    document: Document
    
    # Generation Parameters
    parameters: JSON!
    format: PDFFormat!
    pageSize: PageSize!
    orientation: PageOrientation!
    quality: PDFQuality!
    
    # Job Status
    status: JobStatus!
    progress: Float!
    estimatedCompletion: DateTime
    
    # Output Properties
    outputUrl: String
    fileSize: Int
    pageCount: Int
    
    # Error Handling
    error: String
    retryCount: Int!
    maxRetries: Int!
    
    # Processing Details
    startedAt: DateTime
    completedAt: DateTime
    processingTime: Int
    
    createdAt: DateTime!
    updatedAt: DateTime!
    requestedBy: User!
  }

  type PDFGenerationJobConnection {
    edges: [PDFGenerationJobEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PDFGenerationJobEdge {
    cursor: String!
    node: PDFGenerationJob!
  }

  # Audit and Retention
  type RetentionPolicy implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Policy Properties
    name: String!
    description: String
    policyType: RetentionPolicyType!
    
    # Retention Rules
    retentionPeriod: Int!
    retentionUnit: TimeUnit!
    autoDelete: Boolean!
    archiveBeforeDelete: Boolean!
    
    # Policy Scope
    documentTypes: [DocumentType!]!
    categories: [DocumentCategory!]!
    industries: [Industry!]
    tags: [String!]
    
    # Policy Status
    status: PolicyStatus!
    enforcementLevel: EnforcementLevel!
    
    # Compliance and Legal
    legalHold: Boolean!
    complianceFrameworks: [String!]!
    
    # Policy Application
    appliedDocuments: Int!
    nextReviewDate: DateTime
    
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: User!
  }

  type AuditEntry {
    id: ID!
    action: AuditAction!
    timestamp: DateTime!
    userId: ID
    user: User
    ipAddress: String
    userAgent: String
    details: JSON
    beforeState: JSON
    afterState: JSON
  }

  # Enums
  enum DocumentType {
    CONTRACT
    INVOICE
    PROPOSAL
    REPORT
    CERTIFICATE
    LICENSE
    AGREEMENT
    POLICY
    PROCEDURE
    MANUAL
    GUIDE
    PRESENTATION
    SPREADSHEET
    IMAGE
    VIDEO
    AUDIO
    OTHER
  }

  enum DocumentCategory {
    FINANCIAL
    LEGAL
    OPERATIONAL
    HR
    MARKETING
    TECHNICAL
    COMPLIANCE
    CUSTOMER
    VENDOR
    INTERNAL
    PUBLIC
    CONFIDENTIAL
  }

  enum DocumentStatus {
    DRAFT
    REVIEW
    APPROVED
    PUBLISHED
    ARCHIVED
    EXPIRED
    DELETED
  }

  enum DocumentVisibility {
    PRIVATE
    INTERNAL
    PUBLIC
    RESTRICTED
  }

  enum ProcessingStatus {
    PENDING
    PROCESSING
    COMPLETED
    FAILED
    CANCELLED
  }

  enum TemplateType {
    INVOICE
    CONTRACT
    PROPOSAL
    REPORT
    CERTIFICATE
    LETTER
    FORM
    CUSTOM
  }

  enum TemplateFormat {
    HTML
    PDF
    DOCX
    XLSX
    PPTX
    ODT
    RTF
  }

  enum TemplateLayout {
    PORTRAIT
    LANDSCAPE
    CUSTOM
  }

  enum TemplateCategory {
    BUSINESS
    LEGAL
    FINANCIAL
    MARKETING
    OPERATIONAL
    PERSONAL
  }

  enum TemplateStatus {
    DRAFT
    ACTIVE
    INACTIVE
    ARCHIVED
  }

  enum SectionType {
    HEADER
    FOOTER
    CONTENT
    TABLE
    LIST
    IMAGE
    SIGNATURE
    CUSTOM
  }

  enum FieldType {
    TEXT
    NUMBER
    EMAIL
    PHONE
    DATE
    DATETIME
    BOOLEAN
    SELECT
    MULTISELECT
    TEXTAREA
    FILE
    IMAGE
    SIGNATURE
    CALCULATION
  }

  enum VariableType {
    STRING
    NUMBER
    DATE
    BOOLEAN
    ARRAY
    OBJECT
  }

  enum VariableScope {
    GLOBAL
    TEMPLATE
    DOCUMENT
    SESSION
  }

  enum ValidationRuleType {
    REQUIRED
    MIN_LENGTH
    MAX_LENGTH
    PATTERN
    EMAIL
    PHONE
    DATE
    NUMBER
    CUSTOM
  }

  enum ValidationSeverity {
    ERROR
    WARNING
    INFO
  }

  enum ChangeType {
    CREATED
    UPDATED
    DELETED
    RESTORED
    MERGED
    BRANCHED
  }

  enum VersionStatus {
    DRAFT
    ACTIVE
    ARCHIVED
    DELETED
  }

  enum SignatureType {
    ELECTRONIC
    DIGITAL
    HANDWRITTEN
    BIOMETRIC
  }

  enum SignatureMethod {
    CLICK_TO_SIGN
    DRAW
    TYPE
    UPLOAD
    CERTIFICATE
    SMS
    EMAIL
  }

  enum SignatureStatus {
    PENDING
    SIGNED
    DECLINED
    EXPIRED
    CANCELLED
  }

  enum VerificationStatus {
    VERIFIED
    UNVERIFIED
    INVALID
    EXPIRED
  }

  enum ComplianceLevel {
    BASIC
    STANDARD
    ADVANCED
    REGULATORY
  }

  enum EncryptionLevel {
    NONE
    STANDARD
    ADVANCED
    MILITARY
  }

  enum SignatureAction {
    REQUESTED
    SIGNED
    DECLINED
    VERIFIED
    INVALIDATED
  }

  enum CollaboratorRole {
    VIEWER
    COMMENTER
    EDITOR
    ADMIN
    OWNER
  }

  enum DocumentPermission {
    VIEW
    EDIT
    COMMENT
    SHARE
    DELETE
    MANAGE_VERSIONS
    MANAGE_PERMISSIONS
    SIGN
    APPROVE
  }

  enum AccessType {
    DIRECT
    SHARED
    PUBLIC
    INHERITED
  }

  enum CollaboratorStatus {
    INVITED
    ACTIVE
    INACTIVE
    REMOVED
  }

  enum CommentType {
    GENERAL
    ANNOTATION
    REVIEW
    APPROVAL
    QUESTION
    SUGGESTION
  }

  enum CommentStatus {
    OPEN
    RESOLVED
    ARCHIVED
    DELETED
  }

  enum CommentPriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum CommentCategory {
    GRAMMAR
    CONTENT
    STRUCTURE
    LEGAL
    FORMATTING
    OTHER
  }

  enum AttachmentType {
    REFERENCE
    SUPPORT
    EVIDENCE
    BACKUP
    RELATED
  }

  enum AttachmentCategory {
    DOCUMENT
    IMAGE
    VIDEO
    AUDIO
    DATA
    OTHER
  }

  enum AttachmentStatus {
    UPLOADED
    PROCESSING
    READY
    ERROR
  }

  enum PDFFormat {
    PDF_A1
    PDF_A2
    PDF_A3
    PDF_X1
    PDF_X4
    STANDARD
  }

  enum PageSize {
    A4
    A3
    A5
    LETTER
    LEGAL
    TABLOID
    CUSTOM
  }

  enum PageOrientation {
    PORTRAIT
    LANDSCAPE
  }

  enum PDFQuality {
    LOW
    MEDIUM
    HIGH
    PRINT
    ARCHIVE
  }

  enum JobStatus {
    QUEUED
    RUNNING
    COMPLETED
    FAILED
    CANCELLED
  }

  enum RetentionPolicyType {
    TIME_BASED
    EVENT_BASED
    LEGAL_HOLD
    CUSTOM
  }

  enum TimeUnit {
    DAYS
    WEEKS
    MONTHS
    YEARS
  }

  enum PolicyStatus {
    ACTIVE
    INACTIVE
    DRAFT
    ARCHIVED
  }

  enum EnforcementLevel {
    ADVISORY
    MANDATORY
    STRICT
  }

  enum AuditAction {
    CREATED
    VIEWED
    UPDATED
    DELETED
    SHARED
    DOWNLOADED
    SIGNED
    APPROVED
    REJECTED
    ARCHIVED
    RESTORED
    EXPORTED
  }

  # Input Types
  input DocumentInput {
    name: String!
    title: String!
    description: String
    documentType: DocumentType!
    category: DocumentCategory!
    industry: Industry
    tags: [String!]
    templateId: ID
    content: String
    metadata: JSON
    customFields: JSON
    status: DocumentStatus
    visibility: DocumentVisibility
    accessLevel: AccessLevel
    encryptionEnabled: Boolean
    passwordProtected: Boolean
    expirationDate: DateTime
    downloadable: Boolean
    printable: Boolean
    watermarkEnabled: Boolean
    ocrEnabled: Boolean
  }

  input DocumentTemplateInput {
    name: String!
    title: String!
    description: String
    category: TemplateCategory!
    industry: Industry
    templateType: TemplateType!
    format: TemplateFormat!
    layout: TemplateLayout!
    htmlContent: String
    cssStyles: String
    headerContent: String
    footerContent: String
    watermark: String
    status: TemplateStatus
    isDefault: Boolean
    isPublic: Boolean
    allowCustomization: Boolean
    customizationOptions: JSON
    sections: [TemplateSectionInput!]
    fields: [TemplateFieldInput!]
    variables: [TemplateVariableInput!]
    validationRules: [ValidationRuleInput!]
    requiredFields: [String!]
    conditionalLogic: JSON
  }

  input TemplateSectionInput {
    name: String!
    title: String!
    order: Int!
    type: SectionType!
    content: String
    required: Boolean
    repeatable: Boolean
    conditionalDisplay: JSON
    styling: JSON
  }

  input TemplateFieldInput {
    name: String!
    label: String!
    type: FieldType!
    required: Boolean
    defaultValue: String
    placeholder: String
    validation: FieldValidationInput
    options: [String!]
    conditionalLogic: JSON
    formatting: JSON
  }

  input FieldValidationInput {
    required: Boolean
    minLength: Int
    maxLength: Int
    pattern: String
    customValidator: String
  }

  input TemplateVariableInput {
    name: String!
    type: VariableType!
    description: String
    defaultValue: String
    required: Boolean
    scope: VariableScope!
  }

  input ValidationRuleInput {
    field: String!
    rule: ValidationRuleType!
    value: String
    message: String!
    severity: ValidationSeverity!
  }

  input DigitalSignatureInput {
    signerId: ID!
    signerEmail: String!
    signerName: String!
    signatureType: SignatureType!
    signatureMethod: SignatureMethod!
    pageNumber: Int
    positionX: Float
    positionY: Float
    width: Float
    height: Float
    appearance: SignatureAppearanceInput
    legallyBinding: Boolean
    complianceLevel: ComplianceLevel
  }

  input SignatureAppearanceInput {
    showName: Boolean
    showDate: Boolean
    showReason: Boolean
    showLocation: Boolean
    showSignatureImage: Boolean
    customText: String
    fontFamily: String
    fontSize: Int
    color: String
  }

  input DocumentCollaboratorInput {
    userId: ID!
    role: CollaboratorRole!
    permissions: [DocumentPermission!]
    accessType: AccessType!
    canEdit: Boolean
    canComment: Boolean
    canShare: Boolean
    canDelete: Boolean
    canManageVersions: Boolean
    notifyOnChanges: Boolean
    notifyOnComments: Boolean
    notifyOnShares: Boolean
  }

  input DocumentCommentInput {
    content: String!
    commentType: CommentType!
    pageNumber: Int
    positionX: Float
    positionY: Float
    selectionText: String
    parentId: ID
    priority: CommentPriority
    category: CommentCategory
    tags: [String!]
    mentions: [ID!]
  }

  input PDFGenerationInput {
    templateId: ID
    documentId: ID
    parameters: JSON!
    format: PDFFormat
    pageSize: PageSize
    orientation: PageOrientation
    quality: PDFQuality
  }

  input RetentionPolicyInput {
    name: String!
    description: String
    policyType: RetentionPolicyType!
    retentionPeriod: Int!
    retentionUnit: TimeUnit!
    autoDelete: Boolean
    archiveBeforeDelete: Boolean
    documentTypes: [DocumentType!]
    categories: [DocumentCategory!]
    industries: [Industry!]
    tags: [String!]
    status: PolicyStatus
    enforcementLevel: EnforcementLevel
    legalHold: Boolean
    complianceFrameworks: [String!]
  }

  input DateRangeInput {
    from: DateTime
    to: DateTime
  }

  # Response Types
  type DocumentGenerationResult {
    success: Boolean!
    documentId: ID
    document: Document
    jobId: ID
    job: PDFGenerationJob
    errors: [String!]
  }

  type SignatureRequestResult {
    success: Boolean!
    signatureId: ID
    signature: DigitalSignature
    requestUrl: String
    expirationDate: DateTime
    errors: [String!]
  }

  type DocumentSyncResult {
    success: Boolean!
    documentsProcessed: Int!
    documentsSynced: Int!
    documentsSkipped: Int!
    errors: [String!]
    lastSyncAt: DateTime!
  }
`