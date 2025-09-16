# Thorbis RAG Data Hygiene

Comprehensive data cleaning, preprocessing, and quality assurance pipeline ensuring secure, accurate, and reliable information for RAG retrieval.

## 🧹 Data Hygiene Pipeline

### Processing Pipeline Overview
```yaml
hygiene_pipeline:
  stages:
    - source_validation      # Verify data source integrity
    - pii_detection         # Identify sensitive information
    - pii_redaction        # Remove/mask PII according to policy
    - content_normalization # Standardize format and structure
    - quality_assessment   # Evaluate content quality and completeness
    - confidence_scoring   # Calculate reliability metrics
    - source_hashing       # Generate unique content fingerprints
    - age_scoring         # Apply temporal relevance adjustments
    - entity_extraction   # Identify and link business entities
    - final_validation    # Ensure processing quality

processing_config:
  batch_size: 100            # Documents per processing batch
  max_retries: 3            # Failed processing retry attempts
  quality_threshold: 0.7    # Minimum acceptable quality score
  pii_sensitivity: "strict" # PII detection sensitivity level
  hash_algorithm: "SHA-256" # Source content hashing algorithm
```

### Data Hygiene Engine
```typescript
interface HygieneConfig {
  pii_redaction: PIIRedactionConfig
  quality_assessment: QualityConfig
  content_normalization: NormalizationConfig
  scoring_parameters: ScoringConfig
  validation_rules: ValidationRule[]
}

interface ProcessedDocument {
  // Original data
  original_document: RawDocument
  
  // Processed content
  cleaned_content: string
  normalized_content: string
  redacted_content: string
  
  // Quality metrics
  hygiene_score: number
  confidence_score: number
  age_score: number
  quality_flags: QualityFlag[]
  
  // Security
  pii_redactions: PIIRedaction[]
  content_hash: string
  source_hash: string
  
  // Metadata
  processing_version: string
  processed_at: Date
  processing_duration_ms: number
  pipeline_stages_completed: string[]
}

class DataHygieneEngine {
  constructor(
    private config: HygieneConfig,
    private piiRedactor: PIIRedactionService,
    private qualityAnalyzer: ContentQualityAnalyzer,
    private entityExtractor: EntityExtractor,
    private auditLogger: AuditLogger
  ) {}
  
  async processDocument(rawDocument: RawDocument): Promise<ProcessedDocument> {
    const processingId = uuidv4()
    const startTime = Date.now()
    
    try {
      await this.auditLogger.log({
        action: 'document_hygiene_started',
        processing_id: processingId,
        document_id: rawDocument.id,
        tenant_id: rawDocument.tenant_id,
        source_type: rawDocument.source_type
      })
      
      // Stage 1: Source Validation
      await this.validateSourceIntegrity(rawDocument)
      
      // Stage 2: Generate source hash (before any modifications)
      const sourceHash = this.generateSourceHash(rawDocument)
      
      // Stage 3: Content normalization
      const normalizedContent = await this.normalizeContent(rawDocument.content)
      
      // Stage 4: PII Detection and Redaction
      const piiResults = await this.detectAndRedactPII(normalizedContent, rawDocument)
      
      // Stage 5: Quality Assessment
      const qualityResults = await this.assessContentQuality(piiResults.redacted_content)
      
      // Stage 6: Confidence Scoring
      const confidenceScore = await this.calculateConfidenceScore(rawDocument, qualityResults)
      
      // Stage 7: Age Scoring
      const ageScore = this.calculateAgeScore(rawDocument)
      
      // Stage 8: Overall Hygiene Score
      const hygieneScore = this.calculateOverallHygieneScore({
        quality: qualityResults.overall_score,
        confidence: confidenceScore,
        age: ageScore,
        pii_safety: piiResults.safety_score
      })
      
      // Stage 9: Content Hash (after processing)
      const contentHash = this.generateContentHash(piiResults.redacted_content)
      
      const processedDocument: ProcessedDocument = {
        original_document: rawDocument,
        cleaned_content: piiResults.redacted_content,
        normalized_content: normalizedContent,
        redacted_content: piiResults.redacted_content,
        
        hygiene_score: hygieneScore,
        confidence_score: confidenceScore,
        age_score: ageScore,
        quality_flags: qualityResults.flags,
        
        pii_redactions: piiResults.redactions,
        content_hash: contentHash,
        source_hash: sourceHash,
        
        processing_version: '1.0',
        processed_at: new Date(),
        processing_duration_ms: Date.now() - startTime,
        pipeline_stages_completed: [
          'source_validation', 'normalization', 'pii_redaction', 
          'quality_assessment', 'scoring', 'hashing'
        ]
      }
      
      await this.auditLogger.log({
        action: 'document_hygiene_completed',
        processing_id: processingId,
        document_id: rawDocument.id,
        hygiene_score: hygieneScore,
        pii_redactions: piiResults.redactions.length,
        processing_time: Date.now() - startTime
      })
      
      return processedDocument
      
    } catch (error) {
      await this.auditLogger.log({
        action: 'document_hygiene_failed',
        processing_id: processingId,
        document_id: rawDocument.id,
        error: error.message,
        processing_time: Date.now() - startTime
      })
      
      throw error
    }
  }
}
```

## 🔒 PII Detection & Redaction

### Enhanced PII Processing
```typescript
interface PIIRedactionConfig {
  sensitivity_level: 'basic' | 'standard' | 'strict' | 'paranoid'
  preserve_business_context: boolean
  compliance_standards: string[]
  custom_patterns: CustomPIIPattern[]
  redaction_audit_trail: boolean
}

interface PIIRedactionResult {
  redacted_content: string
  redactions: PIIRedaction[]
  safety_score: number
  business_entities_preserved: string[]
  compliance_flags: ComplianceFlag[]
}

class RAGPIIProcessor {
  constructor(
    private baseRedactor: PIIRedactionService,
    private businessEntityRecognizer: BusinessEntityRecognizer
  ) {}
  
  async detectAndRedactPII(content: string, context: DocumentContext): Promise<PIIRedactionResult> {
    // Identify business entities first to preserve them
    const businessEntities = await this.businessEntityRecognizer.identify(content, context)
    
    // Create protected ranges for business entities
    const protectedRanges = businessEntities.map(entity => ({
      start: entity.start_offset,
      end: entity.end_offset,
      type: 'business_entity',
      value: entity.entity_name
    }))
    
    // Perform PII detection with business entity protection
    const piiDetections = await this.baseRedactor.detectPII(content, {
      sensitivity: this.getEffectiveSensitivity(context),
      protected_ranges: protectedRanges,
      preserve_business_context: true
    })
    
    // Apply redactions while preserving business context
    let redactedContent = content
    const appliedRedactions: PIIRedaction[] = []
    
    // Sort detections by position (reverse order to maintain indices)
    const sortedDetections = piiDetections.sort((a, b) => b.start_offset - a.start_offset)
    
    for (const detection of sortedDetections) {
      // Check if this detection overlaps with protected business entities
      const overlapsBusinessEntity = businessEntities.some(entity => 
        this.rangesOverlap(detection, entity)
      )
      
      if (!overlapsBusinessEntity && detection.confidence >= this.getConfidenceThreshold(context)) {
        const originalText = content.substring(detection.start_offset, detection.end_offset)
        const redactionReplacement = this.generateContextualRedaction(detection, context)
        
        redactedContent = redactedContent.substring(0, detection.start_offset) + 
                         redactionReplacement + 
                         redactedContent.substring(detection.end_offset)
        
        appliedRedactions.push({
          pattern_type: detection.pattern_type,
          original_text: originalText,
          replacement: redactionReplacement,
          confidence: detection.confidence,
          start_offset: detection.start_offset,
          end_offset: detection.end_offset,
          compliance_flags: this.getComplianceFlags(detection)
        })
      }
    }
    
    // Calculate safety score
    const safetyScore = this.calculatePIISafetyScore(appliedRedactions, content.length)
    
    return {
      redacted_content: redactedContent,
      redactions: appliedRedactions,
      safety_score: safetyScore,
      business_entities_preserved: businessEntities.map(e => e.entity_name),
      compliance_flags: this.aggregateComplianceFlags(appliedRedactions)
    }
  }
  
  private generateContextualRedaction(detection: PIIDetection, context: DocumentContext): string {
    // Generate contextually appropriate redaction based on document type and business context
    const baseReplacement = this.getBaseReplacement(detection.pattern_type)
    
    if (context.document_type === 'invoice' && detection.pattern_type === 'email_address') {
      return '[CUSTOMER-EMAIL]'
    } else if (context.document_type === 'service_record' && detection.pattern_type === 'phone_number') {
      return '[CUSTOMER-PHONE]'
    } else if (detection.pattern_type === 'credit_card' && context.contains_financial_data) {
      return '[PAYMENT-METHOD]'
    }
    
    return baseReplacement
  }
  
  private calculatePIISafetyScore(redactions: PIIRedaction[], contentLength: number): number {
    if (redactions.length === 0) return 1.0
    
    // Base score starts high for documents with PII properly redacted
    let safetyScore = 0.95
    
    // Reduce score based on number of redactions (more PII = more risk)
    const redactionDensity = redactions.length / (contentLength / 1000) // per 1000 chars
    safetyScore -= Math.min(0.3, redactionDensity * 0.05)
    
    // Adjust based on confidence of redactions
    const avgConfidence = redactions.reduce((sum, r) => sum + r.confidence, 0) / redactions.length
    safetyScore = safetyScore * avgConfidence
    
    // Boost score for high-risk pattern types being properly handled
    const highRiskPatterns = redactions.filter(r => 
      ['social_security', 'credit_card', 'bank_account'].includes(r.pattern_type)
    )
    if (highRiskPatterns.length > 0) {
      safetyScore += 0.1 // Bonus for catching high-risk patterns
    }
    
    return Math.max(0.1, Math.min(1.0, safetyScore))
  }
}
```

## 🔐 Source Hashing Strategy

### Content Fingerprinting System
```typescript
interface SourceHashingConfig {
  primary_algorithm: 'SHA-256' | 'SHA-3-256' | 'BLAKE3'
  include_metadata: boolean
  normalize_before_hash: boolean
  salt_with_tenant: boolean
  collision_detection: boolean
}

interface ContentHash {
  hash_value: string
  algorithm: string
  generated_at: Date
  
  // Hash components
  content_hash: string
  metadata_hash?: string
  structure_hash?: string
  
  // Collision detection
  collision_risk: number
  similar_documents: string[]
  
  // Validation
  hash_verified: boolean
  verification_timestamp: Date
}

class SourceHashingService {
  constructor(private config: SourceHashingConfig) {}
  
  generateSourceHash(document: RawDocument): string {
    // Normalize content if configured
    let hashableContent = this.config.normalize_before_hash 
      ? this.normalizeForHashing(document.content)
      : document.content
    
    // Include metadata in hash if configured
    if (this.config.include_metadata) {
      const metadataString = this.serializeMetadata(document.metadata)
      hashableContent += `|METADATA:${metadataString}`
    }
    
    // Add tenant salt if configured (for multi-tenant collision avoidance)
    if (this.config.salt_with_tenant) {
      hashableContent = `${document.tenant_id}:${hashableContent}`
    }
    
    // Generate hash using specified algorithm
    return this.generateHash(hashableContent, this.config.primary_algorithm)
  }
  
  generateContentHash(processedContent: string): string {
    return this.generateHash(processedContent, this.config.primary_algorithm)
  }
  
  generateStructuralHash(document: RawDocument): string {
    // Generate hash based on document structure (headings, sections, etc.)
    const structure = this.extractDocumentStructure(document.content)
    const structureString = JSON.stringify(structure)
    return this.generateHash(structureString, this.config.primary_algorithm)
  }
  
  async detectContentDuplication(
    newDocument: RawDocument,
    existingHashes: Map<string, DocumentMetadata>
  ): Promise<DuplicationAnalysis> {
    const newHash = this.generateSourceHash(newDocument)
    const newStructureHash = this.generateStructuralHash(newDocument)
    
    // Check for exact duplicates
    const exactDuplicate = existingHashes.get(newHash)
    if (exactDuplicate) {
      return {
        is_duplicate: true,
        duplicate_type: 'exact',
        duplicate_document_id: exactDuplicate.document_id,
        similarity_score: 1.0
      }
    }
    
    // Check for near-duplicates using structure hash
    const nearDuplicates = Array.from(existingHashes.entries())
      .filter(([hash, metadata]) => {
        const existingStructureHash = this.generateStructuralHash({
          content: metadata.original_content,
          tenant_id: metadata.tenant_id,
          source_type: metadata.source_type
        } as RawDocument)
        return existingStructureHash === newStructureHash
      })
      .map(([hash, metadata]) => ({
        document_id: metadata.document_id,
        similarity_score: this.calculateContentSimilarity(newDocument.content, metadata.original_content)
      }))
      .filter(duplicate => duplicate.similarity_score > 0.8)
    
    if (nearDuplicates.length > 0) {
      const bestMatch = nearDuplicates.reduce((best, current) => 
        current.similarity_score > best.similarity_score ? current : best
      )
      
      return {
        is_duplicate: true,
        duplicate_type: 'near',
        duplicate_document_id: bestMatch.document_id,
        similarity_score: bestMatch.similarity_score,
        near_duplicates: nearDuplicates
      }
    }
    
    return {
      is_duplicate: false,
      duplicate_type: 'none',
      similarity_score: 0.0
    }
  }
  
  private normalizeForHashing(content: string): string {
    return content
      .toLowerCase()                    // Case insensitive
      .replace(/\s+/g, ' ')            // Normalize whitespace
      .replace(/[^\w\s]/g, '')         // Remove punctuation
      .trim()                          // Remove leading/trailing space
  }
  
  private extractDocumentStructure(content: string): DocumentStructure {
    // Extract structural elements for similarity comparison
    const headings = content.match(/^#+\s+(.+)$/gm) || []
    const bulletPoints = content.match(/^[-*]\s+(.+)$/gm) || []
    const numberedLists = content.match(/^\d+\.\s+(.+)$/gm) || []
    
    return {
      heading_count: headings.length,
      heading_hierarchy: headings.map(h => h.match(/^#+/)?.[0].length || 0),
      bullet_point_count: bulletPoints.length,
      numbered_list_count: numberedLists.length,
      paragraph_count: content.split(/\n\s*\n/).length,
      average_paragraph_length: this.calculateAverageParagraphLength(content)
    }
  }
  
  private generateHash(content: string, algorithm: string): string {
    switch (algorithm) {
      case 'SHA-256':
        return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
      case 'SHA-3-256':
        return crypto.createHash('sha3-256').update(content, 'utf8').digest('hex')
      case 'BLAKE3':
        // Note: Would need BLAKE3 library
        return crypto.createHash('sha256').update(content, 'utf8').digest('hex') // Fallback
      default:
        return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
    }
  }
}
```

## 📊 Confidence & Age Scoring

### Confidence Scoring Framework
```typescript
interface ConfidenceFactors {
  source_reliability: number       // 0-1: How reliable is the source
  content_completeness: number     // 0-1: How complete is the information
  entity_validation: number        // 0-1: How well entities are validated
  cross_reference_score: number    // 0-1: How well cross-referenced
  update_frequency: number         // 0-1: How frequently updated
  user_feedback: number           // 0-1: User ratings/feedback
}

interface AgeFactors {
  document_age_days: number
  last_update_days: number
  content_type_decay_rate: number
  industry_change_rate: number
  seasonal_relevance: number
}

class ConfidenceAgeScorer {
  private readonly CONFIDENCE_WEIGHTS = {
    source_reliability: 0.25,
    content_completeness: 0.20,
    entity_validation: 0.15,
    cross_reference_score: 0.15,
    update_frequency: 0.15,
    user_feedback: 0.10
  }
  
  private readonly AGE_DECAY_RATES = {
    'policy_document': 0.1,      // 10% decay per year (slow)
    'sop': 0.15,                 // 15% decay per year 
    'pricebook': 0.3,           // 30% decay per year (medium)
    'faq': 0.2,                 // 20% decay per year
    'issue_library': 0.1,       // 10% decay per year (knowledge accumulates)
    'business_profile': 0.25     // 25% decay per year
  }
  
  calculateConfidenceScore(document: RawDocument, qualityResults: QualityResults): number {
    const confidence_factors = this.assessConfidenceFactors(document, qualityResults)
    const factors = confidence_factors
    
    let confidenceScore = 0
    for (const [factor, weight] of Object.entries(this.CONFIDENCE_WEIGHTS)) {
      confidenceScore += factors[factor] * weight
    }
    
    // Apply document type modifiers
    const typeModifier = this.getDocumentTypeConfidenceModifier(document.source_type)
    confidenceScore *= typeModifier
    
    // Apply tenant-specific adjustments
    const tenantModifier = this.getTenantConfidenceModifier(document.tenant_id)
    confidenceScore *= tenantModifier
    
    return Math.max(0.1, Math.min(1.0, confidenceScore))
  }
  
  calculateAgeScore(document: RawDocument): number {
    const ageFactors = this.assessAgeFactors(document)
    
    const daysSinceCreation = ageFactors.document_age_days
    const daysSinceUpdate = ageFactors.last_update_days
    
    // Base age decay calculation
    const decayRate = this.AGE_DECAY_RATES[document.source_type] || 0.2
    const yearsSinceUpdate = daysSinceUpdate / 365
    
    // Calculate base age score (exponential decay)
    let ageScore = Math.exp(-decayRate * yearsSinceUpdate)
    
    // Apply content-type specific adjustments
    if (document.source_type === 'issue_library') {
      // Issue libraries get better with time (more solutions)
      const maturityBonus = Math.min(0.2, (daysSinceCreation / 365) * 0.05)
      ageScore += maturityBonus
    }
    
    if (document.source_type === 'pricebook') {
      // Pricing data becomes less reliable quickly
      const pricingPenalty = Math.min(0.5, (daysSinceUpdate / 30) * 0.1) // 10% per month
      ageScore -= pricingPenalty
    }
    
    // Seasonal relevance adjustment
    if (ageFactors.seasonal_relevance < 1.0) {
      ageScore *= ageFactors.seasonal_relevance
    }
    
    return Math.max(0.1, Math.min(1.0, ageScore))
  }
  
  private assessConfidenceFactors(document: RawDocument, qualityResults: QualityResults): ConfidenceFactors {
    // Assess confidence factors for overall document reliability
    return {
      source_reliability: this.assessSourceReliability(document),
      content_completeness: qualityResults.completeness_score,
      entity_validation: this.assessEntityValidation(document),
      cross_reference_score: this.assessCrossReferences(document),
      update_frequency: this.assessUpdateFrequency(document),
      user_feedback: this.getUserFeedbackScore(document.id)
    }
  }
  
  private assessSourceReliability(document: RawDocument): number {
    // Assess reliability based on source characteristics
    let reliability = 0.8 // Base reliability
    
    // Official company documents are more reliable
    if (document.metadata?.is_official_document) {
      reliability += 0.15
    }
    
    // Documents with approval workflow are more reliable
    if (document.metadata?.approval_status === 'approved') {
      reliability += 0.1
    }
    
    // Frequently accessed documents are likely more reliable
    const viewCount = document.metadata?.view_count || 0
    if (viewCount > 100) {
      reliability += 0.05
    }
    
    // Recently reviewed documents are more reliable
    const daysSinceReview = document.metadata?.days_since_last_review || 365
    if (daysSinceReview < 90) {
      reliability += 0.1
    }
    
    return Math.min(1.0, reliability)
  }
  
  private assessEntityValidation(document: RawDocument): number {
    // Score based on how well entities in the document are validated
    let validationScore = 0.5 // Base score
    
    // Check if business entities are verified
    if (document.metadata?.entities_verified) {
      validationScore += 0.3
    }
    
    // Check if pricing information is validated
    if (document.metadata?.pricing_verified && document.source_type === 'pricebook') {
      validationScore += 0.2
    }
    
    // Check if procedures are tested
    if (document.metadata?.procedures_tested && document.source_type === 'sop') {
      validationScore += 0.3
    }
    
    return Math.min(1.0, validationScore)
  }
  
  private assessAgeFactors(document: RawDocument): AgeFactors {
    const now = new Date()
    const createdDate = new Date(document.created_at)
    const updatedDate = new Date(document.updated_at || document.created_at)
    
    const ageInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    const daysSinceUpdate = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
    
    return {
      document_age_days: ageInDays,
      last_update_days: daysSinceUpdate,
      content_type_decay_rate: this.AGE_DECAY_RATES[document.source_type] || 0.2,
      industry_change_rate: this.getIndustryChangeRate(document.metadata?.industry),
      seasonal_relevance: this.calculateSeasonalRelevance(document, now)
    }
  }
  
  private calculateSeasonalRelevance(document: RawDocument, currentDate: Date): number {
    // Some content is more relevant during certain seasons
    if (document.metadata?.seasonal_content) {
      const currentMonth = currentDate.getMonth() + 1
      const seasonalMonths = document.metadata.seasonal_months as number[]
      
      if (seasonalMonths && seasonalMonths.includes(currentMonth)) {
        return 1.0 // Highly relevant
      } else {
        const monthsUntilSeason = this.calculateMonthsUntilSeason(currentMonth, seasonalMonths)
        return Math.max(0.5, 1.0 - (monthsUntilSeason * 0.1)) // Gradually less relevant
      }
    }
    
    return 1.0 // No seasonal adjustment
  }
}
```

## 🔍 Quality Assessment Framework

### Content Quality Metrics
```typescript
interface QualityResults {
  overall_score: number
  completeness_score: number
  accuracy_indicators: AccuracyIndicator[]
  consistency_score: number
  flags: QualityFlag[]
  improvement_suggestions: string[]
}

interface QualityFlag {
  flag_type: 'missing_information' | 'inconsistent_data' | 'outdated_reference' | 'format_issue' | 'low_confidence'
  severity: 'low' | 'medium' | 'high'
  description: string
  location?: string
  suggested_fix?: string
}

class ContentQualityAnalyzer {
  async assessContentQuality(content: string, context?: DocumentContext): Promise<QualityResults> {
    const flags: QualityFlag[] = []
    const accuracyIndicators: AccuracyIndicator[] = []
    
    // Assess completeness
    const completenessScore = await this.assessCompleteness(content, context)
    
    // Check for consistency issues
    const consistencyScore = await this.assessConsistency(content)
    
    // Identify quality issues
    const structureFlags = await this.checkStructuralQuality(content)
    const contentFlags = await this.checkContentQuality(content)
    const referenceFlags = await this.checkReferenceQuality(content)
    
    flags.push(...structureFlags, ...contentFlags, ...referenceFlags)
    
    // Calculate overall quality score
    const overallScore = this.calculateOverallQualityScore({
      completeness: completenessScore,
      consistency: consistencyScore,
      flags: flags
    })
    
    return {
      overall_score: overallScore,
      completeness_score: completenessScore,
      accuracy_indicators: accuracyIndicators,
      consistency_score: consistencyScore,
      flags: flags,
      improvement_suggestions: this.generateImprovementSuggestions(flags)
    }
  }
  
  private async assessCompleteness(content: string, context?: DocumentContext): Promise<number> {
    let completenessScore = 0.8 // Base score
    
    // Check for expected sections based on document type
    if (context?.source_type === 'sop') {
      const expectedSections = ['purpose', 'procedure', 'safety', 'quality']
      const foundSections = expectedSections.filter(section => 
        content.toLowerCase().includes(section.toLowerCase())
      )
      completenessScore = foundSections.length / expectedSections.length
    }
    
    // Check content length appropriateness
    if (content.length < 100) {
      completenessScore *= 0.5 // Very short content is likely incomplete
    } else if (content.length > 10000) {
      completenessScore *= 0.9 // Very long content might be overly verbose
    }
    
    // Check for placeholder text or incomplete information
    const incompleteBidirectionals = ['TODO', 'TBD', '[INSERT', '<placeholder']
    const hasPlaceholders = incompleteBidirectionals.some(placeholder => 
      content.toUpperCase().includes(placeholder.toUpperCase())
    )
    
    if (hasPlaceholders) {
      completenessScore *= 0.3
    }
    
    return Math.max(0.1, Math.min(1.0, completenessScore))
  }
  
  private generateImprovementSuggestions(flags: QualityFlag[]): string[] {
    const suggestions: string[] = []
    
    const highSeverityFlags = flags.filter(flag => flag.severity === 'high')
    if (highSeverityFlags.length > 0) {
      suggestions.push('Address high-severity quality issues before indexing')
    }
    
    const missingInfoFlags = flags.filter(flag => flag.flag_type === 'missing_information')
    if (missingInfoFlags.length > 0) {
      suggestions.push('Complete missing information sections')
    }
    
    const inconsistentFlags = flags.filter(flag => flag.flag_type === 'inconsistent_data')
    if (inconsistentFlags.length > 0) {
      suggestions.push('Review and resolve data inconsistencies')
    }
    
    const outdatedFlags = flags.filter(flag => flag.flag_type === 'outdated_reference')
    if (outdatedFlags.length > 0) {
      suggestions.push('Update outdated references and links')
    }
    
    return suggestions
  }
}
```

This comprehensive data hygiene system ensures that all information entering the Thorbis RAG pipeline is properly cleaned, validated, and scored for optimal retrieval performance while maintaining security and compliance standards.
