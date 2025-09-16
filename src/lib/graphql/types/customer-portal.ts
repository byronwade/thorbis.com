/**
 * GraphQL Types for Customer Portal Services
 * Comprehensive customer portal system with document management, messaging,
 * support requests, portal access, tenant isolation, and customer self-service
 */

export const customerPortalTypeDefs = `
  # Customer Portal Core Types
  type CustomerPortal implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Portal Identity
    name: String!
    title: String!
    description: String!
    
    # Portal Configuration
    portalType: PortalType!
    industry: Industry
    customDomain: String
    subdomainPrefix: String!
    
    # Branding and Customization
    branding: PortalBranding!
    theme: PortalTheme!
    customCss: String
    logoUrl: String
    faviconUrl: String
    
    # Access and Security
    accessLevel: PortalAccessLevel!
    authenticationRequired: Boolean!
    ssoEnabled: Boolean!
    mfaRequired: Boolean!
    ipWhitelist: [String!]!
    allowedCountries: [String!]!
    
    # Features Configuration
    features: PortalFeatures!
    modules: [PortalModule!]!
    customizations: JSON
    
    # Customer Access
    customers: [PortalCustomer!]!
    customerGroups: [CustomerGroup!]!
    accessRules: [AccessRule!]!
    
    # Content and Documents
    pages: [PortalPage!]!
    documents: [CustomerDocument!]!
    downloadCenter: DownloadCenter
    knowledgeBase: KnowledgeBase
    
    # Communication
    messaging: PortalMessaging!
    notifications: PortalNotifications!
    announcements: [Announcement!]!
    
    # Support and Ticketing
    supportEnabled: Boolean!
    ticketing: SupportTicketing!
    chatEnabled: Boolean!
    
    # Analytics and Tracking
    analytics: PortalAnalytics!
    sessionTracking: Boolean!
    usageStats: PortalUsageStats!
    
    # Status and Maintenance
    status: PortalStatus!
    maintenanceMode: Boolean!
    lastBackup: DateTime
    
    # SEO and Marketing
    seoSettings: PortalSEO!
    marketingTracking: JSON
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PortalConnection {
    edges: [PortalEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PortalEdge {
    cursor: String!
    node: CustomerPortal!
  }

  enum PortalType {
    CUSTOMER_SELF_SERVICE
    CLIENT_PORTAL
    PARTNER_PORTAL
    VENDOR_PORTAL
    INVESTOR_PORTAL
    EMPLOYEE_PORTAL
    COMMUNITY_PORTAL
    SUPPORT_CENTER
    DOCUMENTATION_HUB
    KNOWLEDGE_BASE
    CUSTOM
  }

  enum PortalAccessLevel {
    PUBLIC
    RESTRICTED
    PRIVATE
    INVITE_ONLY
    MEMBERSHIP_REQUIRED
    SUBSCRIPTION_REQUIRED
  }

  enum PortalStatus {
    ACTIVE
    INACTIVE
    MAINTENANCE
    SUSPENDED
    ARCHIVED
  }

  # Customer Portal Users
  type PortalCustomer implements Node & Timestamped {
    id: ID!
    businessId: ID!
    portalId: ID!
    
    # Customer Identity
    customerType: CustomerType!
    customerId: ID # Link to main customer record
    firstName: String!
    lastName: String!
    fullName: String!
    email: String!
    phone: String
    company: String
    
    # Portal Access
    username: String!
    lastLogin: DateTime
    loginCount: Int!
    sessionCount: Int!
    
    # Account Status
    status: CustomerStatus!
    emailVerified: Boolean!
    phoneVerified: Boolean!
    accountLocked: Boolean!
    lockReason: String
    
    # Profile and Preferences
    avatar: String
    timezone: String!
    locale: String!
    preferences: CustomerPreferences!
    
    # Access Control
    groups: [CustomerGroup!]!
    roles: [CustomerRole!]!
    permissions: [String!]!
    accessLevel: CustomerAccessLevel!
    
    # Communication Settings
    communicationPreferences: CommunicationPreferences!
    notificationSettings: NotificationSettings!
    
    # Activity and Engagement
    lastActivity: DateTime
    viewHistory: [PageView!]!
    downloadHistory: [DocumentDownload!]!
    messageHistory: [CustomerMessage!]!
    
    # Support and Tickets
    supportTickets: [SupportTicket!]!
    feedbackSubmissions: [CustomerFeedback!]!
    
    # Analytics
    engagementScore: Float!
    satisfactionScore: Float
    usageMetrics: CustomerUsageMetrics!
    
    # Metadata
    customFields: JSON
    tags: [String!]!
    notes: String
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CustomerConnection {
    edges: [CustomerEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type CustomerEdge {
    cursor: String!
    node: PortalCustomer!
  }

  enum CustomerType {
    INDIVIDUAL
    BUSINESS
    ENTERPRISE
    PARTNER
    VENDOR
    AFFILIATE
    VIP
  }

  enum CustomerStatus {
    ACTIVE
    INACTIVE
    PENDING_VERIFICATION
    SUSPENDED
    ARCHIVED
  }

  enum CustomerAccessLevel {
    BASIC
    STANDARD
    PREMIUM
    VIP
    ADMIN
    LIMITED
  }

  # Customer Documents
  type CustomerDocument implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    portalId: ID!
    
    # Document Identity
    title: String!
    description: String!
    filename: String!
    originalFilename: String!
    
    # Document Properties
    documentType: DocumentType!
    category: String!
    subcategory: String
    fileSize: Int!
    mimeType: String!
    extension: String!
    
    # Content and Storage
    fileUrl: String!
    downloadUrl: String!
    thumbnailUrl: String
    previewUrl: String
    storageProvider: StorageProvider!
    storagePath: String!
    
    # Access Control
    visibility: DocumentVisibility!
    accessLevel: DocumentAccessLevel!
    customerGroups: [CustomerGroup!]!
    specificCustomers: [PortalCustomer!]!
    passwordProtected: Boolean!
    expirationDate: DateTime
    
    # Document Metadata
    version: String!
    versionHistory: [DocumentVersion!]!
    checksum: String!
    encrypted: Boolean!
    digitalSignature: String
    
    # Tracking and Analytics
    downloadCount: Int!
    viewCount: Int!
    lastAccessed: DateTime
    downloadHistory: [DocumentDownload!]!
    
    # Organization
    folder: DocumentFolder
    folderId: ID
    parentDocument: CustomerDocument
    childDocuments: [CustomerDocument!]!
    relatedDocuments: [CustomerDocument!]!
    
    # Content Processing
    textContent: String # Extracted text for search
    ocrProcessed: Boolean!
    indexedForSearch: Boolean!
    searchKeywords: [String!]!
    
    # Status and Workflow
    status: DocumentStatus!
    publishedAt: DateTime
    archivedAt: DateTime
    approvalRequired: Boolean!
    approvedBy: String
    approvedAt: DateTime
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type DocumentConnection {
    edges: [DocumentEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type DocumentEdge {
    cursor: String!
    node: CustomerDocument!
  }

  enum DocumentType {
    INVOICE
    RECEIPT
    CONTRACT
    AGREEMENT
    STATEMENT
    REPORT
    MANUAL
    GUIDE
    POLICY
    CERTIFICATE
    WARRANTY
    SPECIFICATION
    PROPOSAL
    PRESENTATION
    FORM
    TEMPLATE
    IMAGE
    VIDEO
    AUDIO
    ARCHIVE
    OTHER
  }

  enum DocumentVisibility {
    PUBLIC
    CUSTOMERS_ONLY
    GROUP_SPECIFIC
    CUSTOMER_SPECIFIC
    PRIVATE
  }

  enum DocumentAccessLevel {
    VIEW_ONLY
    DOWNLOAD_ALLOWED
    PRINT_ALLOWED
    FULL_ACCESS
  }

  enum DocumentStatus {
    DRAFT
    PENDING_APPROVAL
    PUBLISHED
    ARCHIVED
    EXPIRED
    DELETED
  }

  enum StorageProvider {
    LOCAL
    AWS_S3
    GOOGLE_CLOUD
    AZURE_BLOB
    CLOUDFLARE_R2
    CUSTOM
  }

  # Customer Messages and Communication
  type CustomerMessage implements Node & Timestamped {
    id: ID!
    businessId: ID!
    portalId: ID!
    
    # Message Identity
    subject: String!
    messageType: MessageType!
    conversationId: ID
    threadId: ID
    
    # Participants
    sender: MessageParticipant!
    recipients: [MessageParticipant!]!
    cc: [MessageParticipant!]!
    bcc: [MessageParticipant!]!
    
    # Message Content
    content: String!
    contentType: MessageContentType!
    htmlContent: String
    plainTextContent: String!
    
    # Attachments
    attachments: [MessageAttachment!]!
    inlineAttachments: [MessageAttachment!]!
    
    # Status and Tracking
    status: MessageStatus!
    priority: MessagePriority!
    readReceipts: [ReadReceipt!]!
    deliveryStatus: DeliveryStatus!
    
    # Threading and References
    replyTo: CustomerMessage
    parentMessage: CustomerMessage
    childMessages: [CustomerMessage!]!
    
    # Security and Compliance
    encrypted: Boolean!
    requiresSecureReading: Boolean!
    retentionPeriod: Int # days
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type MessageConnection {
    edges: [MessageEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type MessageEdge {
    cursor: String!
    node: CustomerMessage!
  }

  enum MessageType {
    EMAIL
    INTERNAL_MESSAGE
    ANNOUNCEMENT
    NOTIFICATION
    AUTO_GENERATED
    SYSTEM_MESSAGE
    SUPPORT_TICKET
    CHAT_MESSAGE
  }

  enum MessageContentType {
    PLAIN_TEXT
    HTML
    RICH_TEXT
    MARKDOWN
  }

  enum MessageStatus {
    DRAFT
    SENT
    DELIVERED
    READ
    REPLIED
    ARCHIVED
    DELETED
  }

  enum MessagePriority {
    LOW
    NORMAL
    HIGH
    URGENT
    CRITICAL
  }

  enum DeliveryStatus {
    PENDING
    DELIVERED
    FAILED
    BOUNCED
    SPAM
    BLOCKED
  }

  # Support Tickets and Customer Requests
  type SupportTicket implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    portalId: ID!
    
    # Ticket Identity
    ticketNumber: String!
    title: String!
    description: String!
    
    # Ticket Classification
    ticketType: TicketType!
    category: String!
    subcategory: String
    priority: TicketPriority!
    severity: TicketSeverity!
    
    # Customer Information
    customer: PortalCustomer!
    customerId: ID!
    contactMethod: ContactMethod!
    
    # Assignment and Routing
    assignedTo: String # User ID
    assignedTeam: String
    department: String
    escalationLevel: Int!
    
    # Status and Lifecycle
    status: TicketStatus!
    resolution: TicketResolution
    resolutionNotes: String
    
    # Communication
    messages: [TicketMessage!]!
    internalNotes: [InternalNote!]!
    publicComments: [PublicComment!]!
    
    # Timing and SLA
    responseTime: Int # minutes
    resolutionTime: Int # minutes
    slaStatus: SLAStatus!
    dueDate: DateTime
    firstResponseAt: DateTime
    resolvedAt: DateTime
    closedAt: DateTime
    
    # Attachments and References
    attachments: [TicketAttachment!]!
    relatedTickets: [SupportTicket!]!
    knowledgeBaseArticles: [KnowledgeBaseArticle!]!
    
    # Customer Satisfaction
    satisfactionRating: Int # 1-5
    satisfactionFeedback: String
    feedbackSubmittedAt: DateTime
    
    # Analytics and Metrics
    viewCount: Int!
    updateCount: Int!
    escalationCount: Int!
    reopenCount: Int!
    
    # Automation
    autoResponded: Boolean!
    autoAssigned: Boolean!
    triggeredWorkflows: [String!]!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type TicketConnection {
    edges: [TicketEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type TicketEdge {
    cursor: String!
    node: SupportTicket!
  }

  enum TicketType {
    GENERAL_INQUIRY
    TECHNICAL_SUPPORT
    BILLING_QUESTION
    FEATURE_REQUEST
    BUG_REPORT
    COMPLAINT
    COMPLIMENT
    ACCOUNT_ISSUE
    ACCESS_REQUEST
    REFUND_REQUEST
    PRODUCT_QUESTION
    SERVICE_REQUEST
  }

  enum TicketPriority {
    LOW
    NORMAL
    HIGH
    URGENT
    CRITICAL
  }

  enum TicketSeverity {
    MINOR
    MODERATE
    MAJOR
    CRITICAL
    BLOCKER
  }

  enum TicketStatus {
    NEW
    OPEN
    IN_PROGRESS
    WAITING_FOR_CUSTOMER
    WAITING_FOR_APPROVAL
    ESCALATED
    RESOLVED
    CLOSED
    CANCELLED
    REOPENED
  }

  enum TicketResolution {
    RESOLVED
    FIXED
    DUPLICATE
    WONT_FIX
    NOT_REPRODUCIBLE
    BY_DESIGN
    CUSTOMER_ERROR
    CANCELLED_BY_CUSTOMER
  }

  enum SLAStatus {
    WITHIN_SLA
    APPROACHING_BREACH
    BREACHED
    CRITICAL_BREACH
  }

  enum ContactMethod {
    PORTAL
    EMAIL
    PHONE
    CHAT
    SOCIAL_MEDIA
    WALK_IN
  }

  # Portal Features and Configuration
  type PortalFeatures {
    # Core Features
    documentCenter: Boolean!
    messaging: Boolean!
    supportTickets: Boolean!
    knowledgeBase: Boolean!
    announcements: Boolean!
    
    # Advanced Features
    liveChat: Boolean!
    videoCall: Boolean!
    screenSharing: Boolean!
    fileUpload: Boolean!
    signatures: Boolean!
    
    # Self-Service Features
    accountManagement: Boolean!
    billingAccess: Boolean!
    orderHistory: Boolean!
    serviceRequests: Boolean!
    appointmentBooking: Boolean!
    
    # Communication Features
    emailNotifications: Boolean!
    smsNotifications: Boolean!
    pushNotifications: Boolean!
    inAppMessaging: Boolean!
    
    # Analytics and Reporting
    usageAnalytics: Boolean!
    customReports: Boolean!
    dataExport: Boolean!
    activityLogs: Boolean!
    
    # Integration Features
    ssoIntegration: Boolean!
    apiAccess: Boolean!
    webhooks: Boolean!
    thirdPartyIntegrations: Boolean!
  }

  type PortalModule {
    id: ID!
    name: String!
    displayName: String!
    enabled: Boolean!
    configuration: JSON
    permissions: [String!]!
    dependencies: [String!]!
    version: String!
  }

  type PortalBranding {
    companyName: String!
    logoUrl: String
    faviconUrl: String
    primaryColor: String!
    secondaryColor: String!
    accentColor: String!
    backgroundColor: String!
    textColor: String!
    linkColor: String!
    headerColor: String!
    footerColor: String!
    customFonts: [String!]!
    customCss: String
  }

  type PortalTheme {
    name: String!
    mode: ThemeMode!
    layout: ThemeLayout!
    navigation: NavigationStyle!
    colorScheme: ColorScheme!
    typography: TypographySettings!
    spacing: SpacingSettings!
    borderRadius: BorderRadiusSettings!
    shadows: Boolean!
    animations: Boolean!
  }

  enum ThemeMode {
    LIGHT
    DARK
    AUTO
    CUSTOM
  }

  enum ThemeLayout {
    SIDEBAR
    TOPBAR
    HYBRID
    MINIMAL
    MAGAZINE
    DASHBOARD
  }

  enum NavigationStyle {
    HORIZONTAL
    VERTICAL
    MEGA_MENU
    BREADCRUMB
    TABS
    ACCORDION
  }

  # Support Types
  type CustomerGroup implements Node {
    id: ID!
    name: String!
    description: String!
    permissions: [String!]!
    accessLevel: CustomerAccessLevel!
    customers: [PortalCustomer!]!
    memberCount: Int!
    createdAt: DateTime!
  }

  type CustomerRole {
    id: ID!
    name: String!
    displayName: String!
    permissions: [String!]!
    isSystemRole: Boolean!
  }

  type AccessRule {
    id: ID!
    name: String!
    condition: String!
    action: AccessAction!
    priority: Int!
    enabled: Boolean!
  }

  enum AccessAction {
    ALLOW
    DENY
    REQUIRE_MFA
    LOG_ONLY
    REDIRECT
  }

  type DocumentFolder implements Node {
    id: ID!
    name: String!
    path: String!
    parentFolder: DocumentFolder
    childFolders: [DocumentFolder!]!
    documents: [CustomerDocument!]!
    permissions: [String!]!
  }

  type DocumentVersion {
    version: String!
    filename: String!
    fileSize: Int!
    checksum: String!
    createdAt: DateTime!
    createdBy: String!
    notes: String
  }

  type DocumentDownload {
    id: ID!
    document: CustomerDocument!
    customer: PortalCustomer!
    ipAddress: String!
    userAgent: String!
    downloadedAt: DateTime!
  }

  type MessageParticipant {
    id: ID!
    participantType: ParticipantType!
    email: String!
    name: String!
    isCustomer: Boolean!
  }

  enum ParticipantType {
    CUSTOMER
    SUPPORT_AGENT
    SYSTEM
    MANAGER
    ADMIN
  }

  type MessageAttachment {
    id: ID!
    filename: String!
    originalFilename: String!
    fileSize: Int!
    mimeType: String!
    fileUrl: String!
    isInline: Boolean!
  }

  type ReadReceipt {
    recipient: MessageParticipant!
    readAt: DateTime!
    ipAddress: String!
  }

  # Input Types
  input CustomerPortalInput {
    name: String!
    title: String!
    description: String!
    portalType: PortalType!
    industry: Industry
    subdomainPrefix: String!
    accessLevel: PortalAccessLevel!
    authenticationRequired: Boolean
    ssoEnabled: Boolean
    mfaRequired: Boolean
    branding: PortalBrandingInput
    theme: PortalThemeInput
    features: PortalFeaturesInput
    supportEnabled: Boolean
    tags: [String!]
    customFields: JSON
  }

  input PortalBrandingInput {
    companyName: String!
    logoUrl: String
    faviconUrl: String
    primaryColor: String!
    secondaryColor: String!
    accentColor: String!
    backgroundColor: String!
    textColor: String!
    linkColor: String!
    customFonts: [String!]
    customCss: String
  }

  input PortalThemeInput {
    name: String!
    mode: ThemeMode!
    layout: ThemeLayout!
    navigation: NavigationStyle!
    shadows: Boolean
    animations: Boolean
  }

  input PortalFeaturesInput {
    documentCenter: Boolean!
    messaging: Boolean!
    supportTickets: Boolean!
    knowledgeBase: Boolean!
    announcements: Boolean!
    liveChat: Boolean
    accountManagement: Boolean
    billingAccess: Boolean
    ssoIntegration: Boolean
    apiAccess: Boolean
  }

  input PortalCustomerInput {
    customerType: CustomerType!
    customerId: ID
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    company: String
    username: String!
    timezone: String
    locale: String
    groupIds: [ID!]
    accessLevel: CustomerAccessLevel
    customFields: JSON
    tags: [String!]
  }

  input CustomerDocumentInput {
    title: String!
    description: String!
    filename: String!
    documentType: DocumentType!
    category: String!
    subcategory: String
    fileSize: Int!
    mimeType: String!
    fileUrl: String!
    visibility: DocumentVisibility!
    accessLevel: DocumentAccessLevel!
    customerGroupIds: [ID!]
    specificCustomerIds: [ID!]
    passwordProtected: Boolean
    expirationDate: DateTime
    folderId: ID
    tags: [String!]
    customFields: JSON
  }

  input CustomerMessageInput {
    subject: String!
    messageType: MessageType!
    recipientIds: [ID!]!
    ccIds: [ID!]
    content: String!
    contentType: MessageContentType!
    priority: MessagePriority
    replyToId: ID
    attachments: [MessageAttachmentInput!]
    tags: [String!]
  }

  input MessageAttachmentInput {
    filename: String!
    fileSize: Int!
    mimeType: String!
    fileUrl: String!
    isInline: Boolean
  }

  input SupportTicketInput {
    title: String!
    description: String!
    ticketType: TicketType!
    category: String!
    subcategory: String
    priority: TicketPriority
    severity: TicketSeverity
    contactMethod: ContactMethod!
    attachments: [TicketAttachmentInput!]
    tags: [String!]
    customFields: JSON
  }

  input TicketAttachmentInput {
    filename: String!
    fileSize: Int!
    mimeType: String!
    fileUrl: String!
    description: String
  }

  # Query Extensions for Customer Portal
  extend type Query {
    # Customer Portals
    customerPortal(id: ID!): CustomerPortal
    customerPortals(
      portalType: PortalType
      industry: Industry
      status: PortalStatus
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): PortalConnection!

    # Portal Customers
    portalCustomer(id: ID!): PortalCustomer
    portalCustomers(
      portalId: ID!
      customerType: CustomerType
      status: CustomerStatus
      groupId: ID
      accessLevel: CustomerAccessLevel
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): CustomerConnection!

    # Customer Documents
    customerDocument(id: ID!): CustomerDocument
    customerDocuments(
      portalId: ID!
      customerId: ID
      documentType: DocumentType
      category: String
      visibility: DocumentVisibility
      status: DocumentStatus
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): DocumentConnection!

    # Customer Messages
    customerMessage(id: ID!): CustomerMessage
    customerMessages(
      portalId: ID!
      customerId: ID
      conversationId: ID
      messageType: MessageType
      status: MessageStatus
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): MessageConnection!

    # Support Tickets
    supportTicket(id: ID!): SupportTicket
    supportTickets(
      portalId: ID!
      customerId: ID
      assignedTo: ID
      ticketType: TicketType
      priority: TicketPriority
      status: TicketStatus
      slaStatus: SLAStatus
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): TicketConnection!

    # Portal Analytics
    portalAnalytics(
      portalId: ID!
      timeframe: AnalyticsTimeframe
      startDate: DateTime
      endDate: DateTime
    ): PortalAnalytics!

    # Customer Groups
    customerGroups(portalId: ID!): [CustomerGroup!]!

    # Document Folders
    documentFolders(
      portalId: ID!
      parentFolderId: ID
    ): [DocumentFolder!]!
  }

  # Mutation Extensions for Customer Portal
  extend type Mutation {
    # Portal Management
    createCustomerPortal(input: CustomerPortalInput!): CustomerPortal!
    updateCustomerPortal(id: ID!, input: CustomerPortalInput!): CustomerPortal!
    deleteCustomerPortal(id: ID!): Boolean!
    togglePortalMaintenanceMode(id: ID!, enabled: Boolean!): CustomerPortal!

    # Customer Management
    createPortalCustomer(portalId: ID!, input: PortalCustomerInput!): PortalCustomer!
    updatePortalCustomer(id: ID!, input: PortalCustomerInput!): PortalCustomer!
    deletePortalCustomer(id: ID!): Boolean!
    invitePortalCustomer(portalId: ID!, email: String!, groups: [ID!]): PortalCustomer!
    resetCustomerPassword(customerId: ID!): Boolean!
    lockCustomerAccount(customerId: ID!, reason: String!): PortalCustomer!
    unlockCustomerAccount(customerId: ID!): PortalCustomer!

    # Document Management
    createCustomerDocument(portalId: ID!, input: CustomerDocumentInput!): CustomerDocument!
    updateCustomerDocument(id: ID!, input: CustomerDocumentInput!): CustomerDocument!
    deleteCustomerDocument(id: ID!): Boolean!
    publishDocument(id: ID!): CustomerDocument!
    archiveDocument(id: ID!): CustomerDocument!
    copyDocumentToCustomers(documentId: ID!, customerIds: [ID!]!): Boolean!

    # Folder Management
    createDocumentFolder(portalId: ID!, name: String!, parentFolderId: ID): DocumentFolder!
    updateDocumentFolder(id: ID!, name: String!): DocumentFolder!
    deleteDocumentFolder(id: ID!): Boolean!
    moveDocumentToFolder(documentId: ID!, folderId: ID): CustomerDocument!

    # Messaging
    sendCustomerMessage(portalId: ID!, input: CustomerMessageInput!): CustomerMessage!
    replyToMessage(messageId: ID!, content: String!, attachments: [MessageAttachmentInput!]): CustomerMessage!
    markMessageAsRead(messageId: ID!): CustomerMessage!
    archiveMessage(messageId: ID!): CustomerMessage!
    deleteMessage(messageId: ID!): Boolean!

    # Support Tickets
    createSupportTicket(portalId: ID!, input: SupportTicketInput!): SupportTicket!
    updateSupportTicket(id: ID!, input: SupportTicketInput!): SupportTicket!
    assignTicket(ticketId: ID!, assigneeId: ID!): SupportTicket!
    updateTicketStatus(ticketId: ID!, status: TicketStatus!, notes: String): SupportTicket!
    resolveTicket(ticketId: ID!, resolution: TicketResolution!, notes: String!): SupportTicket!
    reopenTicket(ticketId: ID!, reason: String!): SupportTicket!
    closeTicket(ticketId: ID!): SupportTicket!
    escalateTicket(ticketId: ID!, level: Int!, reason: String!): SupportTicket!
    addTicketComment(ticketId: ID!, content: String!, isPublic: Boolean!): TicketMessage!

    # Customer Groups
    createCustomerGroup(portalId: ID!, name: String!, permissions: [String!]!): CustomerGroup!
    updateCustomerGroup(id: ID!, name: String!, permissions: [String!]!): CustomerGroup!
    deleteCustomerGroup(id: ID!): Boolean!
    addCustomerToGroup(customerId: ID!, groupId: ID!): Boolean!
    removeCustomerFromGroup(customerId: ID!, groupId: ID!): Boolean!

    # Portal Analytics
    recordPortalActivity(portalId: ID!, customerId: ID!, activity: String!, metadata: JSON): Boolean!
    trackDocumentView(documentId: ID!, customerId: ID!): Boolean!
    trackDocumentDownload(documentId: ID!, customerId: ID!): DocumentDownload!

    # Bulk Operations
    bulkUpdateCustomerStatus(customerIds: [ID!]!, status: CustomerStatus!): Boolean!
    bulkAssignCustomersToGroup(customerIds: [ID!]!, groupId: ID!): Boolean!
    bulkSendMessage(portalId: ID!, customerIds: [ID!]!, subject: String!, content: String!): Boolean!
  }

  # Subscription Extensions for Customer Portal
  extend type Subscription {
    # Real-time Portal Updates
    portalCustomerActivity(portalId: ID!): PortalActivity!
    customerStatusChanged(customerId: ID!): PortalCustomer!
    
    # Document Updates
    documentUploaded(portalId: ID!): CustomerDocument!
    documentDownloaded(portalId: ID!): DocumentDownload!
    
    # Messaging Updates
    newCustomerMessage(customerId: ID!): CustomerMessage!
    messageStatusChanged(messageId: ID!): CustomerMessage!
    
    # Support Ticket Updates
    ticketCreated(portalId: ID!): SupportTicket!
    ticketStatusChanged(ticketId: ID!): SupportTicket!
    ticketAssigned(assigneeId: ID!): SupportTicket!
    newTicketMessage(ticketId: ID!): TicketMessage!
    
    # Portal System Events
    portalMaintenanceScheduled(portalId: ID!): PortalMaintenanceNotice!
    portalSystemAlert(portalId: ID!): PortalSystemAlert!
  }

  # Additional Types for Subscriptions
  type PortalActivity {
    id: ID!
    portalId: ID!
    customerId: ID!
    customer: PortalCustomer!
    activityType: String!
    description: String!
    metadata: JSON
    timestamp: DateTime!
  }

  type PortalMaintenanceNotice {
    id: ID!
    portalId: ID!
    title: String!
    message: String!
    startTime: DateTime!
    endTime: DateTime!
    affectedServices: [String!]!
    severity: MaintenanceSeverity!
  }

  enum MaintenanceSeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  type PortalSystemAlert {
    id: ID!
    portalId: ID!
    alertType: String!
    severity: AlertSeverity!
    title: String!
    message: String!
    timestamp: DateTime!
    resolved: Boolean!
  }

  # Complex Supporting Types
  type PortalAnalytics {
    totalCustomers: Int!
    activeCustomers: Int!
    newCustomersToday: Int!
    documentsViewed: Int!
    documentsDownloaded: Int!
    messagesExchanged: Int!
    ticketsCreated: Int!
    ticketsResolved: Int!
    averageResponseTime: Float!
    customerSatisfactionScore: Float!
    portalUsageStats: PortalUsageStats!
    topDocuments: [DocumentUsageStats!]!
    customerEngagement: CustomerEngagementStats!
  }

  type PortalUsageStats {
    dailyActiveUsers: Int!
    weeklyActiveUsers: Int!
    monthlyActiveUsers: Int!
    averageSessionDuration: Float!
    pageViews: Int!
    uniqueVisitors: Int!
    bounceRate: Float!
    conversionRate: Float!
  }

  type DocumentUsageStats {
    document: CustomerDocument!
    viewCount: Int!
    downloadCount: Int!
    uniqueViewers: Int!
    averageViewDuration: Float!
  }

  type CustomerEngagementStats {
    highlyEngaged: Int!
    moderatelyEngaged: Int!
    lowEngagement: Int!
    churnRisk: Int!
    averageEngagementScore: Float!
  }

  type CustomerUsageMetrics {
    loginFrequency: Float!
    sessionDuration: Float!
    pagesViewed: Int!
    documentsAccessed: Int!
    messagesExchanged: Int!
    ticketsSubmitted: Int!
    lastActivityDate: DateTime!
  }

  type CustomerPreferences {
    language: String!
    timezone: String!
    dateFormat: String!
    timeFormat: String!
    theme: ThemeMode!
    notifications: NotificationSettings!
    privacy: PrivacySettings!
  }

  type CommunicationPreferences {
    emailEnabled: Boolean!
    smsEnabled: Boolean!
    pushEnabled: Boolean!
    marketingEmails: Boolean!
    productUpdates: Boolean!
    securityAlerts: Boolean!
    supportTicketUpdates: Boolean!
    preferredLanguage: String!
  }

  type NotificationSettings {
    newDocuments: Boolean!
    systemMaintenance: Boolean!
    accountUpdates: Boolean!
    supportTicketUpdates: Boolean!
    messageReplies: Boolean!
    promotionalContent: Boolean!
    weeklyDigest: Boolean!
    realTimeAlerts: Boolean!
  }

  type PrivacySettings {
    profileVisibility: ProfileVisibility!
    activityTracking: Boolean!
    analyticsOptOut: Boolean!
    thirdPartySharing: Boolean!
    dataRetention: DataRetentionPreference!
  }

  enum ProfileVisibility {
    PUBLIC
    PRIVATE
    LIMITED
  }

  enum DataRetentionPreference {
    STANDARD
    EXTENDED
    MINIMAL
    CUSTOM
  }

  type PortalMessaging {
    enabled: Boolean!
    features: MessagingFeatures!
    limits: MessagingLimits!
    templates: [MessageTemplate!]!
  }

  type MessagingFeatures {
    richText: Boolean!
    attachments: Boolean!
    encryption: Boolean!
    readReceipts: Boolean!
    threading: Boolean!
    autoResponders: Boolean!
  }

  type MessagingLimits {
    maxAttachmentSize: Int!
    maxRecipientsPerMessage: Int!
    dailyMessageLimit: Int!
    rateLimitPerMinute: Int!
  }

  type MessageTemplate {
    id: ID!
    name: String!
    subject: String!
    content: String!
    variables: [String!]!
    category: String!
  }

  type PortalNotifications {
    enabled: Boolean!
    channels: [NotificationChannel!]!
    templates: [NotificationTemplate!]!
    deliverySettings: NotificationDeliverySettings!
  }

  type NotificationChannel {
    type: NotificationChannelType!
    enabled: Boolean!
    configuration: JSON
  }

  enum NotificationChannelType {
    EMAIL
    SMS
    PUSH
    IN_APP
    WEBHOOK
  }

  type NotificationTemplate {
    id: ID!
    name: String!
    channel: NotificationChannelType!
    template: String!
    variables: [String!]!
  }

  type NotificationDeliverySettings {
    retryAttempts: Int!
    retryDelay: Int!
    batchSize: Int!
    throttleRate: Int!
  }

  type SupportTicketing {
    enabled: Boolean!
    features: TicketingFeatures!
    slaSettings: SLASettings!
    autoAssignment: AutoAssignmentSettings!
    workflows: [TicketWorkflow!]!
  }

  type TicketingFeatures {
    fileAttachments: Boolean!
    internalNotes: Boolean!
    customFields: Boolean!
    timeTracking: Boolean!
    satisfaction: Boolean!
    escalation: Boolean!
    automation: Boolean!
    knowledgeBaseSuggestions: Boolean!
  }

  type SLASettings {
    enabled: Boolean!
    responseTime: Int! # minutes
    resolutionTime: Int! # minutes
    businessHours: BusinessHours!
    holidays: [Holiday!]!
    escalationRules: [EscalationRule!]!
  }

  type BusinessHours {
    timezone: String!
    monday: DaySchedule!
    tuesday: DaySchedule!
    wednesday: DaySchedule!
    thursday: DaySchedule!
    friday: DaySchedule!
    saturday: DaySchedule
    sunday: DaySchedule
  }

  type DaySchedule {
    enabled: Boolean!
    startTime: String!
    endTime: String!
    breaks: [TimeBreak!]!
  }

  type TimeBreak {
    startTime: String!
    endTime: String!
    description: String!
  }

  type Holiday {
    name: String!
    date: DateTime!
    recurring: Boolean!
  }

  type EscalationRule {
    id: ID!
    name: String!
    condition: String!
    delay: Int! # minutes
    action: EscalationAction!
    enabled: Boolean!
  }

  enum EscalationAction {
    REASSIGN
    NOTIFY_MANAGER
    INCREASE_PRIORITY
    ADD_WATCHERS
    TRIGGER_WORKFLOW
  }

  type AutoAssignmentSettings {
    enabled: Boolean!
    rules: [AssignmentRule!]!
    loadBalancing: LoadBalancingStrategy!
    workingHoursOnly: Boolean!
  }

  type AssignmentRule {
    id: ID!
    name: String!
    condition: String!
    assignTo: String!
    weight: Int!
    enabled: Boolean!
  }

  enum LoadBalancingStrategy {
    ROUND_ROBIN
    LEAST_LOADED
    SKILL_BASED
    RANDOM
    PRIORITY_BASED
  }

  type TicketWorkflow {
    id: ID!
    name: String!
    trigger: WorkflowTrigger!
    conditions: [WorkflowCondition!]!
    actions: [WorkflowAction!]!
    enabled: Boolean!
  }

  type WorkflowTrigger {
    event: TicketEvent!
    conditions: [String!]!
  }

  enum TicketEvent {
    CREATED
    UPDATED
    ASSIGNED
    STATUS_CHANGED
    PRIORITY_CHANGED
    COMMENT_ADDED
    RESOLVED
    CLOSED
    REOPENED
  }

  type WorkflowCondition {
    field: String!
    operator: ConditionOperator!
    value: String!
  }

  enum ConditionOperator {
    EQUALS
    NOT_EQUALS
    CONTAINS
    NOT_CONTAINS
    GREATER_THAN
    LESS_THAN
    IN
    NOT_IN
  }

  type WorkflowAction {
    type: ActionType!
    configuration: JSON
    delay: Int
  }

  enum ActionType {
    SET_STATUS
    SET_PRIORITY
    ASSIGN_TO
    ADD_COMMENT
    SEND_EMAIL
    CREATE_TASK
    TRIGGER_WEBHOOK
    ADD_TAG
  }

  type Announcement {
    id: ID!
    title: String!
    content: String!
    announcementType: AnnouncementType!
    priority: AnnouncementPriority!
    targetAudience: [String!]!
    publishedAt: DateTime!
    expiresAt: DateTime
    viewed: Boolean!
    dismissed: Boolean!
  }

  enum AnnouncementType {
    GENERAL
    MAINTENANCE
    FEATURE_UPDATE
    SECURITY
    PROMOTION
    POLICY_CHANGE
  }

  enum AnnouncementPriority {
    LOW
    NORMAL
    HIGH
    URGENT
  }

  type DownloadCenter {
    id: ID!
    name: String!
    description: String!
    categories: [DownloadCategory!]!
    totalDownloads: Int!
    popularDownloads: [CustomerDocument!]!
  }

  type DownloadCategory {
    id: ID!
    name: String!
    description: String!
    documents: [CustomerDocument!]!
    documentCount: Int!
  }

  type KnowledgeBase {
    id: ID!
    name: String!
    description: String!
    articles: [KnowledgeBaseArticle!]!
    categories: [KnowledgeBaseCategory!]!
    searchEnabled: Boolean!
    ratingsEnabled: Boolean!
  }

  type KnowledgeBaseArticle {
    id: ID!
    title: String!
    content: String!
    summary: String!
    category: KnowledgeBaseCategory!
    tags: [String!]!
    views: Int!
    helpful: Int!
    notHelpful: Int!
    rating: Float!
    publishedAt: DateTime!
    updatedAt: DateTime!
  }

  type KnowledgeBaseCategory {
    id: ID!
    name: String!
    description: String!
    articles: [KnowledgeBaseArticle!]!
    articleCount: Int!
    parentCategory: KnowledgeBaseCategory
    subCategories: [KnowledgeBaseCategory!]!
  }

  type PortalSEO {
    title: String!
    description: String!
    keywords: [String!]!
    ogTitle: String
    ogDescription: String
    ogImage: String
    twitterCard: TwitterCardType!
    robotsIndex: Boolean!
    robotsFollow: Boolean!
  }

  enum TwitterCardType {
    SUMMARY
    SUMMARY_LARGE_IMAGE
    APP
    PLAYER
  }

  type PageView {
    id: ID!
    page: String!
    title: String!
    duration: Int!
    referrer: String
    timestamp: DateTime!
  }

  type CustomerFeedback {
    id: ID!
    type: FeedbackType!
    rating: Int!
    subject: String!
    message: String!
    category: String!
    status: FeedbackStatus!
    response: String
    respondedAt: DateTime
    createdAt: DateTime!
  }

  enum FeedbackType {
    GENERAL
    BUG_REPORT
    FEATURE_REQUEST
    COMPLAINT
    COMPLIMENT
    SUGGESTION
  }

  enum FeedbackStatus {
    NEW
    REVIEWED
    IN_PROGRESS
    RESOLVED
    DISMISSED
  }

  # Additional Supporting Types
  type TicketMessage {
    id: ID!
    content: String!
    messageType: TicketMessageType!
    isPublic: Boolean!
    author: MessageAuthor!
    attachments: [TicketAttachment!]!
    createdAt: DateTime!
  }

  enum TicketMessageType {
    COMMENT
    INTERNAL_NOTE
    STATUS_CHANGE
    ASSIGNMENT_CHANGE
    ESCALATION
    RESOLUTION
  }

  type MessageAuthor {
    id: ID!
    name: String!
    email: String!
    type: AuthorType!
  }

  enum AuthorType {
    CUSTOMER
    AGENT
    SYSTEM
    MANAGER
    ADMIN
  }

  type TicketAttachment {
    id: ID!
    filename: String!
    originalFilename: String!
    fileSize: Int!
    mimeType: String!
    downloadUrl: String!
    uploadedBy: String!
    uploadedAt: DateTime!
  }

  type InternalNote {
    id: ID!
    content: String!
    author: MessageAuthor!
    visibility: NoteVisibility!
    createdAt: DateTime!
  }

  enum NoteVisibility {
    INTERNAL_ONLY
    SUPERVISORS_ONLY
    ALL_AGENTS
  }

  type PublicComment {
    id: ID!
    content: String!
    author: MessageAuthor!
    attachments: [TicketAttachment!]!
    createdAt: DateTime!
  }

  # Color and Spacing Types
  type ColorScheme {
    primary: String!
    secondary: String!
    accent: String!
    background: String!
    surface: String!
    text: String!
    textSecondary: String!
    border: String!
    error: String!
    warning: String!
    success: String!
    info: String!
  }

  type TypographySettings {
    fontFamily: String!
    headingFont: String
    fontSize: FontSizeScale!
    lineHeight: LineHeightScale!
    fontWeight: FontWeightScale!
  }

  type FontSizeScale {
    xs: String!
    sm: String!
    base: String!
    lg: String!
    xl: String!
    xxl: String!
    xxxl: String!
  }

  type LineHeightScale {
    tight: String!
    normal: String!
    relaxed: String!
    loose: String!
  }

  type FontWeightScale {
    light: String!
    normal: String!
    medium: String!
    semibold: String!
    bold: String!
  }

  type SpacingSettings {
    unit: Int!
    scale: SpacingScale!
  }

  type SpacingScale {
    xs: String!
    sm: String!
    md: String!
    lg: String!
    xl: String!
    xxl: String!
  }

  type BorderRadiusSettings {
    none: String!
    sm: String!
    md: String!
    lg: String!
    full: String!
  }

  type PortalPage {
    id: ID!
    title: String!
    slug: String!
    content: String!
    pageType: PageType!
    visibility: PageVisibility!
    published: Boolean!
    order: Int!
    parentPage: PortalPage
    childPages: [PortalPage!]!
    seoSettings: PageSEO!
    customFields: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum PageType {
    HOME
    ABOUT
    CONTACT
    SUPPORT
    TERMS
    PRIVACY
    FAQ
    DOCUMENTATION
    CUSTOM
  }

  enum PageVisibility {
    PUBLIC
    CUSTOMERS_ONLY
    SPECIFIC_GROUPS
    PRIVATE
  }

  type PageSEO {
    title: String
    description: String
    keywords: [String!]!
    noIndex: Boolean!
    noFollow: Boolean!
    canonicalUrl: String
  }
`