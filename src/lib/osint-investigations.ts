/**
 * OSINT Investigations Service
 * 
 * Open Source Intelligence gathering, analysis, and investigation management
 * Defensive security-focused intelligence operations
 */

export interface Investigation {
  id: string
  businessId: string
  locationId?: string
  title: string
  description: string
  type: InvestigationType
  priority: InvestigationPriority
  status: InvestigationStatus
  assignedTo?: string[]
  requestedBy: string
  
  // Investigation details
  targetEntity?: {
    type: 'person' | 'company' | 'domain' | 'ip' | 'email' | 'phone' | 'asset'
    value: string
    metadata?: Record<string, unknown>
  }
  
  // Data sources and methods
  dataSources: DataSourceType[]
  methods: InvestigationMethod[]
  
  // Results and findings
  findings: InvestigationFinding[]
  riskScore: number // 0-100
  threatLevel: ThreatLevel
  confidence: number // 0-1
  
  // Timeline
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  dueDate?: Date
  estimatedDuration?: string
  
  // Compliance and documentation
  documentation: {
    legalBasis: string
    dataRetentionPolicy: string
    accessLog: AccessLogEntry[]
    reportGenerated?: boolean
    reportUrl?: string
  }
  
  // Collaboration
  watchers?: string[]
  tags?: string[]
  relatedInvestigations?: string[]
  
  updatedAt: Date
  updatedBy: string
}

export interface InvestigationFinding {
  id: string
  investigationId: string
  type: FindingType
  severity: FindingSeverity
  title: string
  description: string
  
  // Evidence and sources
  evidence: Evidence[]
  sources: IntelligenceSource[]
  verificationStatus: 'verified' | 'unverified' | 'disputed' | 'false_positive'
  
  // Threat assessment
  indicators: ThreatIndicator[]
  riskFactors: RiskFactor[]
  recommendations: InvestigationRecommendation[]
  
  // Metadata
  discoveredAt: Date
  discoveredBy: string
  lastVerified?: Date
  confidence: number
  
  // Analysis
  analyticalNotes?: string
  tags?: string[]
  attachments?: AttachmentReference[]
}

export interface Evidence {
  id: string
  type: EvidenceType
  source: string
  content: any // Could be text, image, document, etc.
  metadata: {
    timestamp?: Date
    location?: GeolocationData
    hash?: string
    fileSize?: number
    contentType?: string
  }
  chainOfCustody: ChainOfCustodyEntry[]
  verified: boolean
  confidenceScore: number
}

export interface IntelligenceSource {
  id: string
  name: string
  type: SourceType
  reliability: SourceReliability
  accessLevel: 'public' | 'restricted' | 'classified'
  lastAccessed?: Date
  apiEndpoint?: string
  cost?: number
  rateLimit?: {
    requests: number
    period: string
  }
}

export interface ThreatIndicator {
  id: string
  type: IOCType
  value: string
  description: string
  severity: ThreatSeverity
  confidence: number
  firstSeen: Date
  lastSeen: Date
  sources: string[]
  mitigations?: string[]
}

export interface RiskAssessment {
  id: string
  investigationId: string
  overallRisk: number // 0-100
  riskFactors: RiskFactor[]
  mitigationStrategies: MitigationStrategy[]
  businessImpact: BusinessImpactAssessment
  recommendations: SecurityRecommendation[]
  assessedBy: string
  assessedAt: Date
  nextReviewDate: Date
}

export interface BackgroundCheck {
  id: string
  subjectType: 'individual' | 'entity'
  subjectIdentifier: string
  checkType: BackgroundCheckType
  scope: BackgroundCheckScope
  findings: BackgroundFinding[]
  clearanceLevel?: 'basic' | 'standard' | 'enhanced' | 'comprehensive'
  completedBy: string
  completedAt: Date
  expiresAt?: Date
}

export interface ComplianceCheck {
  id: string
  entityId: string
  entityType: string
  checks: {
    sanctionsList: SanctionCheckResult
    pepCheck: PEPCheckResult
    adverseMedia: AdverseMediaResult
    corporateStructure?: CorporateStructureResult
    financialAnalysis?: FinancialAnalysisResult
  }
  overallStatus: 'clear' | 'flagged' | 'high_risk' | 'prohibited'
  lastUpdated: Date
  nextReview: Date
}

// Enums
export enum InvestigationType {
  BACKGROUND_CHECK = 'background_check',
  THREAT_ASSESSMENT = 'threat_assessment',
  COMPLIANCE_INVESTIGATION = 'compliance_investigation',
  FRAUD_INVESTIGATION = 'fraud_investigation',
  SECURITY_INCIDENT = 'security_incident',
  DUE_DILIGENCE = 'due_diligence',
  EMPLOYEE_SCREENING = 'employee_screening',
  VENDOR_ASSESSMENT = 'vendor_assessment',
  CYBER_THREAT_HUNT = 'cyber_threat_hunt',
  COMPETITIVE_INTELLIGENCE = 'competitive_intelligence'
}

export enum InvestigationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent'
}

export enum InvestigationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export enum FindingType {
  SECURITY_VULNERABILITY = 'security_vulnerability',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  THREAT_INDICATOR = 'threat_indicator',
  BACKGROUND_ISSUE = 'background_issue',
  FINANCIAL_IRREGULARITY = 'financial_irregularity',
  REPUTATION_RISK = 'reputation_risk',
  OPERATIONAL_RISK = 'operational_risk'
}

export enum FindingSeverity {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ThreatLevel {
  MINIMAL = 'minimal',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  SEVERE = 'severe',
  CRITICAL = 'critical'
}

export enum DataSourceType {
  PUBLIC_RECORDS = 'public_records',
  SOCIAL_MEDIA = 'social_media',
  NEWS_MEDIA = 'news_media',
  GOVERNMENT_DATABASES = 'government_databases',
  COMMERCIAL_DATABASES = 'commercial_databases',
  THREAT_INTELLIGENCE = 'threat_intelligence',
  CORPORATE_FILINGS = 'corporate_filings',
  COURT_RECORDS = 'court_records',
  DOMAIN_REGISTRATION = 'domain_registration',
  NETWORK_INTELLIGENCE = 'network_intelligence'
}

export enum IOCType {
  IP_ADDRESS = 'ip_address',
  DOMAIN = 'domain',
  EMAIL = 'email',
  PHONE = 'phone',
  HASH = 'hash',
  URL = 'url',
  FILE_PATH = 'file_path',
  REGISTRY_KEY = 'registry_key',
  CERTIFICATE = 'certificate',
  USER_AGENT = 'user_agent'
}

export enum BackgroundCheckType {
  EMPLOYMENT = 'employment',
  TENANT_SCREENING = 'tenant_screening',
  VENDOR_VERIFICATION = 'vendor_verification',
  CUSTOMER_ONBOARDING = 'customer_onboarding',
  BOARD_APPOINTMENT = 'board_appointment',
  SECURITY_CLEARANCE = 'security_clearance'
}

/**
 * OSINT Investigations Service Class
 */
class OSINTInvestigationsService {
  
  /**
   * Create new investigation
   */
  async createInvestigation(
    businessId: string,
    data: Partial<Investigation>
  ): Promise<Investigation> {
    // Mock implementation - replace with actual database operations
    const investigation: Investigation = {
      id: 'inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      title: data.title!,
      description: data.description!,
      type: data.type!,
      priority: data.priority || InvestigationPriority.MEDIUM,
      status: InvestigationStatus.PENDING,
      assignedTo: data.assignedTo,
      requestedBy: data.requestedBy!,
      targetEntity: data.targetEntity,
      dataSources: data.dataSources || [],
      methods: data.methods || [],
      findings: [],
      riskScore: 0,
      threatLevel: ThreatLevel.MINIMAL,
      confidence: 0,
      createdAt: new Date(),
      dueDate: data.dueDate,
      estimatedDuration: data.estimatedDuration,
      documentation: {
        legalBasis: data.documentation?.legalBasis || 'Business necessity',
        dataRetentionPolicy: data.documentation?.dataRetentionPolicy || '90 days',
        accessLog: [],
        reportGenerated: false
      },
      watchers: data.watchers,
      tags: data.tags,
      relatedInvestigations: data.relatedInvestigations,
      updatedAt: new Date(),
      updatedBy: data.requestedBy!
    }
    
    // Log the investigation creation
    await this.logInvestigationActivity(investigation.id, 'created', data.requestedBy!)
    
    return investigation
  }
  
  /**
   * Get investigations with filtering
   */
  async getInvestigations(
    businessId: string,
    filters: {
      status?: InvestigationStatus[]
      type?: InvestigationType[]
      priority?: InvestigationPriority[]
      assignedTo?: string
      requestedBy?: string
      threatLevel?: ThreatLevel[]
      dateFrom?: Date
      dateTo?: Date
      searchTerm?: string
      limit?: number
      offset?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }
  ): Promise<{
    investigations: Investigation[]
    totalCount: number
    pagination: {
      page: number
      limit: number
      totalPages: number
    }
    summary: {
      statusCounts: Record<string, number>
      priorityCounts: Record<string, number>
      averageRiskScore: number
    }
  }> {
    // Mock implementation
    const mockInvestigations: Investigation[] = []
    
    return {
      investigations: mockInvestigations,
      totalCount: 0,
      pagination: {
        page: Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1,
        limit: filters.limit || 20,
        totalPages: 0
      },
      summary: {
        statusCounts: Record<string, unknown>,
        priorityCounts: Record<string, unknown>,
        averageRiskScore: 0
      }
    }
  }
  
  /**
   * Get specific investigation
   */
  async getInvestigation(
    businessId: string,
    investigationId: string
  ): Promise<Investigation | null> {
    // Mock implementation - replace with actual database query
    return null
  }
  
  /**
   * Update investigation
   */
  async updateInvestigation(
    businessId: string,
    investigationId: string,
    updates: Partial<Investigation>
  ): Promise<Investigation> {
    // Mock implementation
    const investigation = await this.getInvestigation(businessId, investigationId)
    if (!investigation) {
      throw new Error('Investigation not found')
    }
    
    const updatedInvestigation = {
      ...investigation,
      ...updates,
      updatedAt: new Date()
    }
    
    await this.logInvestigationActivity(investigationId, 'updated', updates.updatedBy!)
    
    return updatedInvestigation
  }
  
  /**
   * Start investigation
   */
  async startInvestigation(
    businessId: string,
    investigationId: string,
    startedBy: string
  ): Promise<Investigation> {
    const updates = {
      status: InvestigationStatus.IN_PROGRESS,
      startedAt: new Date(),
      updatedBy: startedBy
    }
    
    await this.logInvestigationActivity(investigationId, 'started', startedBy)
    
    return this.updateInvestigation(businessId, investigationId, updates)
  }
  
  /**
   * Complete investigation
   */
  async completeInvestigation(
    businessId: string,
    investigationId: string,
    completionData: {
      completedBy: string
      finalReport?: string
      recommendations?: string[]
      nextActions?: string[]
    }
  ): Promise<Investigation> {
    const updates = {
      status: InvestigationStatus.COMPLETED,
      completedAt: new Date(),
      updatedBy: completionData.completedBy
    }
    
    await this.logInvestigationActivity(investigationId, 'completed', completionData.completedBy)
    
    return this.updateInvestigation(businessId, investigationId, updates)
  }
  
  /**
   * Add finding to investigation
   */
  async addFinding(
    businessId: string,
    investigationId: string,
    findingData: Partial<InvestigationFinding>
  ): Promise<InvestigationFinding> {
    const finding: InvestigationFinding = {
      id: 'find_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      investigationId,
      type: findingData.type!,
      severity: findingData.severity!,
      title: findingData.title!,
      description: findingData.description!,
      evidence: findingData.evidence || [],
      sources: findingData.sources || [],
      verificationStatus: findingData.verificationStatus || 'unverified',
      indicators: findingData.indicators || [],
      riskFactors: findingData.riskFactors || [],
      recommendations: findingData.recommendations || [],
      discoveredAt: new Date(),
      discoveredBy: findingData.discoveredBy!,
      confidence: findingData.confidence || 0.5,
      analyticalNotes: findingData.analyticalNotes,
      tags: findingData.tags,
      attachments: findingData.attachments
    }
    
    await this.logInvestigationActivity(investigationId, 'finding_added', findingData.discoveredBy!)
    
    return finding
  }
  
  /**
   * Conduct background check
   */
  async conductBackgroundCheck(
    businessId: string,
    checkData: {
      subjectType: 'individual' | 'entity'
      subjectIdentifier: string
      checkType: BackgroundCheckType
      scope: BackgroundCheckScope
      requestedBy: string
      urgency?: 'standard' | 'expedited'
    }
  ): Promise<BackgroundCheck> {
    // Mock implementation
    const backgroundCheck: BackgroundCheck = {
      id: 'bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      subjectType: checkData.subjectType,
      subjectIdentifier: checkData.subjectIdentifier,
      checkType: checkData.checkType,
      scope: checkData.scope,
      findings: [],
      clearanceLevel: 'basic',
      completedBy: checkData.requestedBy,
      completedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
    
    return backgroundCheck
  }
  
  /**
   * Perform compliance check
   */
  async performComplianceCheck(
    businessId: string,
    entityId: string,
    entityType: string,
    checkTypes: ('sanctions' | 'pep' | 'adverse_media' | 'corporate' | 'financial')[]
  ): Promise<ComplianceCheck> {
    // Mock implementation
    const complianceCheck: ComplianceCheck = {
      id: 'comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      entityId,
      entityType,
      checks: {
        sanctionsList: {
          status: 'clear',
          matches: [],
          lastChecked: new Date()
        },
        pepCheck: {
          status: 'clear',
          matches: [],
          lastChecked: new Date()
        },
        adverseMedia: {
          status: 'clear',
          articles: [],
          sentiment: 'neutral',
          lastChecked: new Date()
        }
      },
      overallStatus: 'clear',
      lastUpdated: new Date(),
      nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
    
    return complianceCheck
  }
  
  /**
   * Generate threat intelligence report
   */
  async generateThreatIntelligence(
    businessId: string,
    parameters: {
      targetType: 'domain' | 'ip' | 'email' | 'organization'
      targetValue: string
      analysisDepth: 'basic' | 'comprehensive' | 'deep'
      includeIOCs?: boolean
      includeMitigation?: boolean
      timeframe?: { start: Date; end: Date }
    }
  ): Promise<{
    report: ThreatIntelligenceReport
    indicators: ThreatIndicator[]
    recommendations: SecurityRecommendation[]
  }> {
    // Mock implementation
    return {
      report: {
        id: 'threat_${Date.now()}',
        targetType: parameters.targetType,
        targetValue: parameters.targetValue,
        analysisDepth: parameters.analysisDepth,
        findings: [],
        riskScore: 25,
        threatLevel: ThreatLevel.LOW,
        generatedAt: new Date(),
        generatedBy: 'ai_system',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      indicators: [],
      recommendations: []
    }
  }
  
  /**
   * Perform OSINT collection
   */
  async performOSINTCollection(
    businessId: string,
    collectionRequest: {
      target: string
      targetType: 'person' | 'company' | 'domain' | 'email'
      sources: DataSourceType[]
      maxResults?: number
      confidenceThreshold?: number
      automated?: boolean
    }
  ): Promise<{
    collectionId: string
    results: OSINTResult[]
    summary: OSINTSummary
    confidence: number
  }> {
    // Mock implementation
    return {
      collectionId: 'osint_${Date.now()}',
      results: [],
      summary: {
        totalSources: 0,
        successfulSources: 0,
        totalResults: 0,
        highConfidenceResults: 0,
        collectionTime: new Date().toISOString(),
        dataPoints: []
      },
      confidence: 0.5
    }
  }
  
  /**
   * Create investigation dashboard data
   */
  async getInvestigationDashboard(
    businessId: string,
    locationId?: string,
    timeframe?: { start: Date; end: Date }
  ): Promise<{
    summary: {
      totalInvestigations: number
      activeInvestigations: number
      completedThisMonth: number
      averageCompletionTime: number
      highRiskInvestigations: number
    }
    statusDistribution: Record<string, number>
    priorityDistribution: Record<string, number>
    typeDistribution: Record<string, number>
    recentInvestigations: Investigation[]
    upcomingDeadlines: Investigation[]
    performanceMetrics: {
      avgResolutionTime: number
      successRate: number
      findingAccuracy: number
      resourceUtilization: number
    }
  }> {
    // Mock implementation
    return {
      summary: {
        totalInvestigations: 0,
        activeInvestigations: 0,
        completedThisMonth: 0,
        averageCompletionTime: 0,
        highRiskInvestigations: 0
      },
      statusDistribution: Record<string, unknown>,
      priorityDistribution: Record<string, unknown>,
      typeDistribution: Record<string, unknown>,
      recentInvestigations: [],
      upcomingDeadlines: [],
      performanceMetrics: {
        avgResolutionTime: 0,
        successRate: 0,
        findingAccuracy: 0,
        resourceUtilization: 0
      }
    }
  }
  
  /**
   * Archive investigation
   */
  async archiveInvestigation(
    businessId: string,
    investigationId: string,
    reason: string,
    archivedBy: string
  ): Promise<Investigation> {
    const updates = {
      status: InvestigationStatus.CLOSED,
      updatedBy: archivedBy
    }
    
    await this.logInvestigationActivity(investigationId, 'archived', archivedBy, reason)
    
    return this.updateInvestigation(businessId, investigationId, updates)
  }
  
  /**
   * Log investigation activity
   */
  private async logInvestigationActivity(
    investigationId: string,
    action: string,
    userId: string,
    details?: string
  ): Promise<void> {
    // Mock implementation - replace with actual audit logging
    console.log('Investigation ${investigationId} - ${action} by ${userId}', details)
  }
}

// Supporting interfaces
interface BackgroundCheckScope {
  criminalHistory?: boolean
  employmentHistory?: boolean
  educationVerification?: boolean
  creditCheck?: boolean
  referenceCheck?: boolean
  identityVerification?: boolean
  sanctionsCheck?: boolean
  mediaCheck?: boolean
}

interface BackgroundFinding {
  type: string
  severity: FindingSeverity
  description: string
  source: string
  verificationStatus: string
  recommendations?: string[]
}

interface SanctionCheckResult {
  status: 'clear' | 'flagged' | 'review_required'
  matches: SanctionMatch[]
  lastChecked: Date
}

interface PEPCheckResult {
  status: 'clear' | 'flagged' | 'review_required'
  matches: PEPMatch[]
  lastChecked: Date
}

interface AdverseMediaResult {
  status: 'clear' | 'flagged' | 'review_required'
  articles: MediaArticle[]
  sentiment: 'positive' | 'neutral' | 'negative'
  lastChecked: Date
}

interface CorporateStructureResult {
  ownership: OwnershipStructure[]
  subsidiaries: CompanyInfo[]
  directors: PersonInfo[]
  financialHealth: FinancialHealthIndicator
}

interface FinancialAnalysisResult {
  creditRating: string
  financialStability: 'stable' | 'concerning' | 'high_risk'
  keyRatios: FinancialRatio[]
  trends: FinancialTrend[]
}

interface ThreatIntelligenceReport {
  id: string
  targetType: string
  targetValue: string
  analysisDepth: string
  findings: unknown[]
  riskScore: number
  threatLevel: ThreatLevel
  generatedAt: Date
  generatedBy: string
  expiresAt: Date
}

interface OSINTResult {
  source: string
  sourceType: DataSourceType
  data: unknown
  confidence: number
  timestamp: Date
  relevanceScore: number
}

interface OSINTSummary {
  totalSources: number
  successfulSources: number
  totalResults: number
  highConfidenceResults: number
  collectionTime: string
  dataPoints: unknown[]
}

interface InvestigationMethod {
  name: string
  description: string
  automated: boolean
  cost?: number
  estimatedTime?: string
}

interface InvestigationRecommendation {
  id: string
  type: string
  priority: InvestigationPriority
  description: string
  actionItems: string[]
  estimatedCost?: number
  timeline?: string
}

interface AttachmentReference {
  id: string
  filename: string
  contentType: string
  size: number
  uploadedBy: string
  uploadedAt: Date
}

interface GeolocationData {
  latitude: number
  longitude: number
  accuracy?: number
  address?: string
}

interface ChainOfCustodyEntry {
  timestamp: Date
  action: string
  performer: string
  details?: string
}

interface AccessLogEntry {
  timestamp: Date
  userId: string
  action: string
  ipAddress?: string
  userAgent?: string
}

interface SecurityRecommendation {
  id: string
  title: string
  description: string
  priority: InvestigationPriority
  category: string
  actionRequired: string[]
  estimatedEffort: string
}

interface MitigationStrategy {
  id: string
  threat: string
  strategy: string
  implementation: string[]
  cost: string
  effectiveness: number
}

interface BusinessImpactAssessment {
  financialImpact: 'low' | 'medium' | 'high'
  reputationalImpact: 'low' | 'medium' | 'high'
  operationalImpact: 'low' | 'medium' | 'high'
  complianceImpact: 'low' | 'medium' | 'high'
  overallImpact: 'low' | 'medium' | 'high'
}

interface RiskFactor {
  id: string
  category: string
  description: string
  impact: number
  likelihood: number
  riskScore: number
  mitigation?: string
}

interface EvidenceType {
  DOCUMENT: 'document'
  IMAGE: 'image'
  VIDEO: 'video'
  AUDIO: 'audio'
  SCREENSHOT: 'screenshot'
  LOG_FILE: 'log_file'
  DATABASE_RECORD: 'database_record'
  EMAIL: 'email'
  SOCIAL_MEDIA_POST: 'social_media_post'
  NETWORK_TRAFFIC: 'network_traffic'
}

interface SourceType {
  HUMAN: 'human'
  TECHNICAL: 'technical'
  OPEN_SOURCE: 'open_source'
  COMMERCIAL: 'commercial'
  GOVERNMENT: 'government'
  CONFIDENTIAL: 'confidential'
}

interface SourceReliability {
  COMPLETELY_RELIABLE: 'A'
  USUALLY_RELIABLE: 'B'
  FAIRLY_RELIABLE: 'C'
  NOT_USUALLY_RELIABLE: 'D'
  UNRELIABLE: 'E'
  RELIABILITY_UNKNOWN: 'F'
}

interface ThreatSeverity {
  INFO: 'info'
  LOW: 'low'
  MEDIUM: 'medium'
  HIGH: 'high'
  CRITICAL: 'critical'
}

// Additional supporting types
interface SanctionMatch {
  name: string
  aliases: string[]
  sanctionType: string
  jurisdiction: string
  dateAdded: Date
  matchScore: number
}

interface PEPMatch {
  name: string
  position: string
  country: string
  category: string
  riskLevel: string
  matchScore: number
}

interface MediaArticle {
  title: string
  source: string
  publishDate: Date
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative'
  relevanceScore: number
  url?: string
}

interface OwnershipStructure {
  ownerName: string
  ownershipPercentage: number
  ownerType: 'individual' | 'corporate'
  jurisdiction: string
}

interface CompanyInfo {
  name: string
  jurisdiction: string
  incorporationDate: Date
  status: string
  businessType: string
}

interface PersonInfo {
  name: string
  position: string
  appointmentDate: Date
  nationality: string
  dateOfBirth?: Date
}

interface FinancialHealthIndicator {
  rating: string
  outlook: 'positive' | 'stable' | 'negative'
  keyMetrics: Record<string, number>
}

interface FinancialRatio {
  name: string
  value: number
  benchmark: number
  trend: 'improving' | 'stable' | 'declining'
}

interface FinancialTrend {
  metric: string
  period: string
  direction: 'up' | 'down' | 'stable'
  significance: 'low' | 'medium' | 'high'
}

// Export singleton instance
export const osintInvestigationsService = new OSINTInvestigationsService()