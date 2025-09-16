/**
 * GraphQL Types for Investigations Services
 * Comprehensive investigation case management, evidence tracking, timeline analysis, war room collaboration
 * AI analysis, reports, case graphs, video analysis, and digital forensics
 */

export const investigationsTypeDefs = `
  # Investigation Case Management Core Types
  type InvestigationCase implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Case Identity
    caseNumber: String!
    title: String!
    description: String!
    
    # Case Classification
    caseType: CaseType!
    priority: CasePriority!
    severity: CaseSeverity!
    status: CaseStatus!
    category: String!
    subcategory: String
    
    # Case Details
    incidentDate: DateTime
    reportedDate: DateTime!
    discoveredDate: DateTime
    location: String
    jurisdiction: String
    
    # Personnel
    leadInvestigator: InvestigationUser!
    leadInvestigatorId: ID!
    assignedInvestigators: [InvestigationUser!]!
    caseManager: InvestigationUser
    caseManagerId: ID
    
    # Client/Subject Information
    client: InvestigationClient
    clientId: ID
    subjects: [InvestigationSubject!]!
    witnesses: [InvestigationWitness!]!
    
    # Investigation Data
    evidence(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): InvestigationEvidenceConnection!
    
    timeline(
      pagination: PaginationInput
      filters: [FilterInput!]
    ): InvestigationTimelineConnection!
    
    warRooms(
      active: Boolean
      pagination: PaginationInput
    ): WarRoomConnection!
    
    # Analysis & Reports
    aiAnalysis: [InvestigationAIAnalysis!]!
    reports: [InvestigationReport!]!
    caseGraph: InvestigationCaseGraph
    
    # Progress & Metrics
    progressPercentage: Float!
    hoursSpent: Float!
    estimatedHours: Float
    costToDate: Float!
    estimatedCost: Float
    
    # Status Tracking
    milestones: [CaseMilestone!]!
    nextReviewDate: DateTime
    deadlineDate: DateTime
    closedDate: DateTime
    closureReason: String
    
    # Collaboration
    tags: [String!]!
    notes: String
    confidentialityLevel: ConfidentialityLevel!
    accessLevel: AccessLevel!
    
    # Custom Fields & Metadata
    customFields: JSON
    metadata: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type InvestigationCaseConnection {
    edges: [InvestigationCaseEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type InvestigationCaseEdge {
    cursor: String!
    node: InvestigationCase!
  }

  enum CaseType {
    FRAUD_INVESTIGATION
    INTERNAL_INVESTIGATION
    BACKGROUND_CHECK
    SURVEILLANCE
    DIGITAL_FORENSICS
    INSURANCE_CLAIM
    CORPORATE_INVESTIGATION
    PERSONAL_INVESTIGATION
    ASSET_SEARCH
    DUE_DILIGENCE
    MISSING_PERSON
    ACCIDENT_INVESTIGATION
    WORKPLACE_INCIDENT
    INTELLECTUAL_PROPERTY
    COMPLIANCE_AUDIT
    THREAT_ASSESSMENT
    CYBER_SECURITY
    LITIGATION_SUPPORT
  }

  enum CasePriority {
    LOW
    NORMAL
    HIGH
    URGENT
    CRITICAL
  }

  enum CaseSeverity {
    MINOR
    MODERATE
    MAJOR
    CRITICAL
    CATASTROPHIC
  }

  enum CaseStatus {
    INTAKE
    ASSIGNED
    ACTIVE
    PENDING_REVIEW
    PENDING_CLIENT
    ON_HOLD
    SUSPENDED
    COMPLETED
    CLOSED
    ARCHIVED
    CANCELLED
  }

  enum ConfidentialityLevel {
    PUBLIC
    INTERNAL
    CONFIDENTIAL
    RESTRICTED
    TOP_SECRET
  }

  enum AccessLevel {
    VIEWER
    CONTRIBUTOR
    INVESTIGATOR
    LEAD
    MANAGER
    ADMIN
  }

  # Evidence Management
  type InvestigationEvidence implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    caseId: ID!
    case: InvestigationCase!
    
    # Evidence Identity
    evidenceNumber: String!
    title: String!
    description: String!
    
    # Evidence Classification
    evidenceType: EvidenceType!
    category: String!
    subcategory: String
    sourceType: EvidenceSourceType!
    
    # Evidence Details
    collectedDate: DateTime!
    collectedBy: InvestigationUser!
    collectedById: ID!
    location: String
    gpsCoordinates: String
    
    # Digital Evidence
    fileHash: String
    fileSize: Int
    mimeType: String
    originalFilename: String
    
    # Physical Evidence
    serialNumber: String
    weight: Float
    dimensions: String
    condition: EvidenceCondition!
    
    # Chain of Custody
    chainOfCustody: [CustodyRecord!]!
    currentCustodian: InvestigationUser
    currentCustodianId: ID
    
    # Storage & Location
    storageLocation: String
    binNumber: String
    shelfLocation: String
    
    # Analysis & Processing
    analysisRequests: [EvidenceAnalysisRequest!]!
    analysisResults: [EvidenceAnalysisResult!]!
    aiAnalysis: EvidenceAIAnalysis
    
    # Media & Files
    files: [EvidenceFile!]!
    images: [String!]!
    videos: [String!]!
    documents: [String!]!
    
    # Relationships
    relatedEvidence: [InvestigationEvidence!]!
    linkedSubjects: [InvestigationSubject!]!
    
    # Status & Tracking
    status: EvidenceStatus!
    relevanceScore: Float
    integrityVerified: Boolean!
    tags: [String!]!
    notes: String
    
    # Custom Fields
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type InvestigationEvidenceConnection {
    edges: [InvestigationEvidenceEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type InvestigationEvidenceEdge {
    cursor: String!
    node: InvestigationEvidence!
  }

  enum EvidenceType {
    DIGITAL
    PHYSICAL
    DOCUMENTARY
    TESTIMONIAL
    PHOTOGRAPHIC
    VIDEO
    AUDIO
    FORENSIC
    CIRCUMSTANTIAL
    DEMONSTRATIVE
  }

  enum EvidenceSourceType {
    CRIME_SCENE
    WITNESS
    SUSPECT
    VICTIM
    SURVEILLANCE
    DIGITAL_DEVICE
    NETWORK
    DATABASE
    DOCUMENT
    PHYSICAL_SEARCH
    LABORATORY
    EXPERT_ANALYSIS
    PUBLIC_RECORD
    SOCIAL_MEDIA
    THIRD_PARTY
  }

  enum EvidenceCondition {
    EXCELLENT
    GOOD
    FAIR
    POOR
    DAMAGED
    INCOMPLETE
    CORRUPTED
  }

  enum EvidenceStatus {
    COLLECTED
    PROCESSING
    ANALYZED
    VERIFIED
    CATALOGUED
    STORED
    DESTROYED
    RETURNED
    LOST
    COMPROMISED
  }

  # Timeline Management
  type InvestigationTimeline implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    caseId: ID!
    case: InvestigationCase!
    
    # Timeline Event
    eventDate: DateTime!
    eventTime: String
    title: String!
    description: String!
    
    # Event Classification
    eventType: TimelineEventType!
    category: String!
    significance: EventSignificance!
    
    # Event Details
    location: String
    participants: [String!]!
    duration: Int
    
    # Evidence & References
    relatedEvidence: [InvestigationEvidence!]!
    relatedSubjects: [InvestigationSubject!]!
    sources: [String!]!
    verification: EventVerification!
    
    # Analysis
    aiAnalysis: TimelineAIAnalysis
    patterns: [String!]!
    correlations: [String!]!
    
    # Visualization
    timelinePosition: Float!
    color: String
    icon: String
    
    # Metadata
    confidence: Float!
    reliability: Float!
    tags: [String!]!
    notes: String
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type InvestigationTimelineConnection {
    edges: [InvestigationTimelineEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type InvestigationTimelineEdge {
    cursor: String!
    node: InvestigationTimeline!
  }

  enum TimelineEventType {
    INCIDENT
    CONTACT
    TRANSACTION
    COMMUNICATION
    MOVEMENT
    MEETING
    DISCOVERY
    ANALYSIS
    REPORT
    DECISION
    ACTION
    MILESTONE
    DEADLINE
    REVIEW
    UPDATE
  }

  enum EventSignificance {
    TRIVIAL
    MINOR
    MODERATE
    SIGNIFICANT
    CRITICAL
    BREAKTHROUGH
  }

  enum EventVerification {
    UNVERIFIED
    PENDING
    VERIFIED
    DISPUTED
    FALSE
  }

  # War Room Collaboration
  type WarRoom implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    caseId: ID!
    case: InvestigationCase!
    
    # War Room Identity
    name: String!
    description: String!
    purpose: String!
    
    # Session Management
    sessionType: WarRoomSessionType!
    status: WarRoomStatus!
    startTime: DateTime!
    endTime: DateTime
    duration: Int
    
    # Participants
    host: InvestigationUser!
    hostId: ID!
    participants: [WarRoomParticipant!]!
    invitees: [InvestigationUser!]!
    
    # Collaboration Tools
    whiteboards: [Whiteboard!]!
    documents: [WarRoomDocument!]!
    screens: [SharedScreen!]!
    recordings: [WarRoomRecording!]!
    
    # Discussion
    messages: [WarRoomMessage!]!
    decisions: [WarRoomDecision!]!
    actionItems: [ActionItem!]!
    
    # Analysis & Insights
    evidenceReviewed: [InvestigationEvidence!]!
    hypotheses: [InvestigationHypothesis!]!
    breakthroughs: [Breakthrough!]!
    
    # Technical Details
    meetingUrl: String
    recordingEnabled: Boolean!
    transcriptionEnabled: Boolean!
    aiAssistanceEnabled: Boolean!
    
    # Security
    accessCode: String
    encryptionLevel: EncryptionLevel!
    participantLimit: Int
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type WarRoomConnection {
    edges: [WarRoomEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type WarRoomEdge {
    cursor: String!
    node: WarRoom!
  }

  enum WarRoomSessionType {
    PLANNING
    EVIDENCE_REVIEW
    ANALYSIS
    BRAINSTORMING
    STRATEGY
    BRIEFING
    DEBRIEF
    EMERGENCY
    CLIENT_MEETING
    EXPERT_CONSULTATION
  }

  enum WarRoomStatus {
    SCHEDULED
    ACTIVE
    PAUSED
    COMPLETED
    CANCELLED
    RESCHEDULED
  }

  enum EncryptionLevel {
    NONE
    STANDARD
    HIGH
    MILITARY_GRADE
  }

  # AI Analysis & Insights
  type InvestigationAIAnalysis implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    caseId: ID!
    case: InvestigationCase!
    
    # Analysis Details
    analysisType: AIAnalysisType!
    title: String!
    description: String!
    
    # AI Model Information
    modelName: String!
    modelVersion: String!
    confidence: Float!
    
    # Analysis Results
    findings: [AIFinding!]!
    insights: [AIInsight!]!
    recommendations: [AIRecommendation!]!
    patterns: [AIPattern!]!
    anomalies: [AIAnomaly!]!
    
    # Data Sources
    inputSources: [String!]!
    evidenceAnalyzed: [InvestigationEvidence!]!
    dataPoints: Int!
    
    # Performance Metrics
    processingTime: Float!
    accuracy: Float
    reliability: Float
    
    # Results
    summary: String!
    detailedReport: String!
    visualizations: [String!]!
    attachments: [String!]!
    
    # Follow-up
    actionableItems: [String!]!
    followUpRequired: Boolean!
    reviewStatus: AIReviewStatus!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum AIAnalysisType {
    PATTERN_RECOGNITION
    BEHAVIORAL_ANALYSIS
    NETWORK_ANALYSIS
    TIMELINE_ANALYSIS
    TEXT_ANALYSIS
    IMAGE_ANALYSIS
    VIDEO_ANALYSIS
    AUDIO_ANALYSIS
    PREDICTIVE_MODELING
    RISK_ASSESSMENT
    SENTIMENT_ANALYSIS
    ANOMALY_DETECTION
    RELATIONSHIP_MAPPING
    FRAUD_DETECTION
    DATA_CORRELATION
  }

  enum AIReviewStatus {
    PENDING_REVIEW
    UNDER_REVIEW
    APPROVED
    REJECTED
    REQUIRES_REVISION
  }

  # Investigation Reports
  type InvestigationReport implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    caseId: ID!
    case: InvestigationCase!
    
    # Report Identity
    reportNumber: String!
    title: String!
    reportType: ReportType!
    
    # Report Details
    author: InvestigationUser!
    authorId: ID!
    reviewedBy: InvestigationUser
    reviewedById: ID
    approvedBy: InvestigationUser
    approvedById: ID
    
    # Content
    executiveSummary: String!
    methodology: String!
    findings: String!
    conclusions: String!
    recommendations: String!
    appendices: String
    
    # Status & Version
    status: ReportStatus!
    version: String!
    isDraft: Boolean!
    isConfidential: Boolean!
    
    # Distribution
    recipients: [ReportRecipient!]!
    distributionDate: DateTime
    
    # Media & Attachments
    coverImage: String
    attachments: [String!]!
    exhibits: [String!]!
    
    # Metrics
    pageCount: Int
    wordCount: Int
    evidenceCount: Int
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ReportType {
    PRELIMINARY
    INTERIM
    FINAL
    SUPPLEMENTAL
    EXPERT_WITNESS
    COURT_FILING
    CLIENT_BRIEFING
    INTERNAL_MEMO
    EXECUTIVE_SUMMARY
    TECHNICAL_ANALYSIS
    SURVEILLANCE_SUMMARY
    FORENSIC_ANALYSIS
    BACKGROUND_CHECK
    DUE_DILIGENCE
    COMPLIANCE_AUDIT
  }

  enum ReportStatus {
    DRAFT
    UNDER_REVIEW
    REVISION_REQUIRED
    APPROVED
    FINALIZED
    DISTRIBUTED
    ARCHIVED
  }

  # Supporting Types
  type InvestigationUser implements Node {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
    email: String!
    title: String
    department: String
    role: InvestigationRole!
    permissions: [String!]!
    isActive: Boolean!
    lastLoginAt: DateTime
  }

  type InvestigationClient implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    name: String!
    type: ClientType!
    contactPerson: String
    email: String
    phone: String
    address: String
    notes: String
    cases: [InvestigationCase!]!
    totalCases: Int!
    activeCases: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type InvestigationSubject implements Node & Timestamped {
    id: ID!
    firstName: String
    lastName: String
    fullName: String
    aliases: [String!]!
    dateOfBirth: DateTime
    ssn: String
    address: String
    phone: String
    email: String
    occupation: String
    subjectType: SubjectType!
    riskLevel: RiskLevel!
    notes: String
    customFields: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum InvestigationRole {
    INVESTIGATOR
    SENIOR_INVESTIGATOR
    LEAD_INVESTIGATOR
    CASE_MANAGER
    ANALYST
    FORENSIC_EXPERT
    ADMIN
    SUPERVISOR
    DIRECTOR
  }

  enum ClientType {
    INDIVIDUAL
    CORPORATE
    LEGAL_FIRM
    INSURANCE_COMPANY
    GOVERNMENT
    NON_PROFIT
    OTHER
  }

  enum SubjectType {
    PERSON_OF_INTEREST
    SUSPECT
    WITNESS
    VICTIM
    INFORMANT
    EXPERT
    OTHER
  }

  enum RiskLevel {
    NONE
    LOW
    MODERATE
    HIGH
    EXTREME
  }

  # Input Types
  input InvestigationCaseInput {
    title: String!
    description: String!
    caseType: CaseType!
    priority: CasePriority
    severity: CaseSeverity
    category: String!
    subcategory: String
    incidentDate: DateTime
    location: String
    jurisdiction: String
    leadInvestigatorId: ID!
    caseManagerId: ID
    clientId: ID
    estimatedHours: Float
    estimatedCost: Float
    deadlineDate: DateTime
    confidentialityLevel: ConfidentialityLevel
    accessLevel: AccessLevel
    tags: [String!]
    notes: String
    customFields: JSON
  }

  input InvestigationEvidenceInput {
    caseId: ID!
    title: String!
    description: String!
    evidenceType: EvidenceType!
    category: String!
    subcategory: String
    sourceType: EvidenceSourceType!
    collectedDate: DateTime!
    collectedById: ID!
    location: String
    gpsCoordinates: String
    serialNumber: String
    condition: EvidenceCondition
    storageLocation: String
    tags: [String!]
    notes: String
    customFields: JSON
  }

  input WarRoomInput {
    caseId: ID!
    name: String!
    description: String!
    purpose: String!
    sessionType: WarRoomSessionType!
    startTime: DateTime!
    endTime: DateTime
    participantIds: [ID!]!
    recordingEnabled: Boolean
    transcriptionEnabled: Boolean
    aiAssistanceEnabled: Boolean
    participantLimit: Int
    tags: [String!]
    customFields: JSON
  }

  # Query Extensions for Investigations
  extend type Query {
    # Investigation Cases
    investigationCase(id: ID!): InvestigationCase
    investigationCases(
      status: CaseStatus
      caseType: CaseType
      priority: CasePriority
      assignedTo: ID
      clientId: ID
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): InvestigationCaseConnection!
    
    # Evidence Management
    investigationEvidence(id: ID!): InvestigationEvidence
    investigationEvidences(
      caseId: ID
      evidenceType: EvidenceType
      status: EvidenceStatus
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): InvestigationEvidenceConnection!
    
    # Timeline Analysis
    investigationTimeline(id: ID!): InvestigationTimeline
    investigationTimelines(
      caseId: ID!
      eventType: TimelineEventType
      startDate: DateTime
      endDate: DateTime
      pagination: PaginationInput
      filters: [FilterInput!]
    ): InvestigationTimelineConnection!
    
    # War Room Sessions
    warRoom(id: ID!): WarRoom
    warRooms(
      caseId: ID
      status: WarRoomStatus
      hostId: ID
      active: Boolean
      pagination: PaginationInput
      filters: [FilterInput!]
    ): WarRoomConnection!
    
    # Reports
    investigationReport(id: ID!): InvestigationReport
    investigationReports(
      caseId: ID
      reportType: ReportType
      status: ReportStatus
      authorId: ID
      pagination: PaginationInput
      filters: [FilterInput!]
    ): [InvestigationReport!]!
    
    # Search & Analytics
    searchInvestigations(
      query: String!
      filters: [FilterInput!]
      pagination: PaginationInput
    ): InvestigationCaseConnection!
    
    caseStatistics(
      timeframe: AnalyticsTimeframe
      caseType: CaseType
      status: CaseStatus
    ): CaseStatistics!
  }

  # Mutation Extensions for Investigations
  extend type Mutation {
    # Case Management
    createInvestigationCase(input: InvestigationCaseInput!): InvestigationCase!
    updateInvestigationCase(id: ID!, input: InvestigationCaseInput!): InvestigationCase!
    updateCaseStatus(id: ID!, status: CaseStatus!, notes: String): InvestigationCase!
    assignInvestigator(caseId: ID!, investigatorId: ID!): InvestigationCase!
    closeCaseWithReason(id: ID!, reason: String!, finalReport: String): InvestigationCase!
    
    # Evidence Management
    createInvestigationEvidence(input: InvestigationEvidenceInput!): InvestigationEvidence!
    updateInvestigationEvidence(id: ID!, input: InvestigationEvidenceInput!): InvestigationEvidence!
    transferEvidenceCustody(evidenceId: ID!, newCustodianId: ID!, notes: String): InvestigationEvidence!
    
    # War Room Operations
    createWarRoom(input: WarRoomInput!): WarRoom!
    joinWarRoom(id: ID!): WarRoom!
    leaveWarRoom(id: ID!): Boolean!
    startWarRoomSession(id: ID!): WarRoom!
    endWarRoomSession(id: ID!, summary: String): WarRoom!
    
    # AI Analysis
    requestAIAnalysis(caseId: ID!, analysisType: AIAnalysisType!, options: JSON): InvestigationAIAnalysis!
    
    # Report Generation
    generateInvestigationReport(caseId: ID!, reportType: ReportType!, template: String): InvestigationReport!
    approveReport(reportId: ID!, notes: String): InvestigationReport!
  }

  # Subscription Extensions for Investigations
  extend type Subscription {
    # Real-time Case Updates
    caseUpdates(businessId: ID!, caseId: ID): InvestigationCase!
    evidenceUpdates(businessId: ID!, caseId: ID): InvestigationEvidence!
    warRoomUpdates(businessId: ID!, warRoomId: ID!): WarRoom!
    
    # AI Analysis Updates
    aiAnalysisProgress(businessId: ID!, analysisId: ID!): InvestigationAIAnalysis!
    
    # System Alerts
    investigationAlerts(businessId: ID!): InvestigationAlert!
  }

  # Analytics Types
  type CaseStatistics {
    totalCases: Int!
    activeCases: Int!
    closedCases: Int!
    averageResolutionTime: Float!
    casesByType: [CategoryValue!]!
    casesByStatus: [StatusValue!]!
    investigatorWorkload: [InvestigatorWorkload!]!
    monthlyTrends: [PeriodValue!]!
  }

  type InvestigatorWorkload {
    investigator: InvestigationUser!
    activeCases: Int!
    hoursSpent: Float!
    utilization: Float!
  }

  type InvestigationAlert {
    level: AlertLevel!
    message: String!
    caseId: ID
    timestamp: DateTime!
    source: String!
    data: JSON
  }
`