# Thorbis PII Redaction System

Comprehensive Personally Identifiable Information (PII) redaction system for prompts, logs, webhooks, and data exports with GDPR/CCPA compliance.

## 🔒 PII Redaction Architecture

### Redaction Scope & Coverage
```yaml
redaction_coverage:
  ai_prompts:
    - "User prompts to AI agents"
    - "AI response context"
    - "Tool call parameters"
    - "Embedded user data"
    - "Conversation history"
    
  application_logs:
    - "Request/response logs"
    - "Error logs and stack traces"
    - "Audit trail entries"
    - "Performance monitoring"
    - "Debug information"
    
  webhooks:
    - "Webhook payloads"
    - "Webhook headers"
    - "Webhook retry logs"
    - "Webhook failure notifications"
    
  data_exports:
    - "CSV/JSON exports"
    - "Backup files"
    - "Analytics data"
    - "Report generation"
    
  third_party_integrations:
    - "External API calls"
    - "Integration logs"
    - "Error reporting services"
    - "Analytics platforms"

redaction_levels:
  none: "No redaction applied"
  basic: "Common PII patterns (emails, phones, SSNs)"
  standard: "Extended PII + financial data"
  strict: "Maximum redaction including names and addresses"
  paranoid: "Aggressive redaction including business data"
```

### PII Classification & Detection
```typescript
interface PIIPattern {
  name: string
  category: PIICategory
  description: string
  pattern: RegExp
  redaction_replacement: string
  confidence_level: 'low' | 'medium' | 'high'
  enabled: boolean
  compliance_tags: string[]  // GDPR, CCPA, HIPAA, etc.
}

enum PIICategory {
  PERSONAL_IDENTIFIERS = 'personal_identifiers',
  CONTACT_INFORMATION = 'contact_information',
  FINANCIAL_DATA = 'financial_data',
  HEALTH_DATA = 'health_data',
  BIOMETRIC_DATA = 'biometric_data',
  LOCATION_DATA = 'location_data',
  BEHAVIORAL_DATA = 'behavioral_data',
  PROFESSIONAL_DATA = 'professional_data'
}

// Comprehensive PII Detection Patterns
const PII_PATTERNS: PIIPattern[] = [
  // Personal Identifiers
  {
    name: 'social_security_number',
    category: PIICategory.PERSONAL_IDENTIFIERS,
    description: 'US Social Security Numbers',
    pattern: /\b(?!000|666|9\d{2})\d{3}-?(?!00)\d{2}-?(?!0000)\d{4}\b/g,
    redaction_replacement: '[SSN-REDACTED]',
    confidence_level: 'high',
    enabled: true,
    compliance_tags: ['GDPR', 'CCPA']
  },
  
  {
    name: 'tax_identification_number',
    category: PIICategory.PERSONAL_IDENTIFIERS,
    description: 'Tax ID Numbers (TIN, EIN)',
    pattern: /\b\d{2}-?\d{7}\b/g,
    redaction_replacement: '[TIN-REDACTED]',
    confidence_level: 'high',
    enabled: true,
    compliance_tags: ['GDPR', 'CCPA']
  },
  
  {
    name: 'drivers_license',
    category: PIICategory.PERSONAL_IDENTIFIERS,
    description: 'US Drivers License Numbers',
    pattern: /\b[A-Z]{1,2}\d{6,8}\b/g,
    redaction_replacement: '[DL-REDACTED]',
    confidence_level: 'medium',
    enabled: true,
    compliance_tags: ['GDPR', 'CCPA']
  },
  
  // Contact Information
  {
    name: 'email_address',
    category: PIICategory.CONTACT_INFORMATION,
    description: 'Email addresses',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    redaction_replacement: '[EMAIL-REDACTED]',
    confidence_level: 'high',
    enabled: true,
    compliance_tags: ['GDPR', 'CCPA']
  },
  
  {
    name: 'phone_number',
    category: PIICategory.CONTACT_INFORMATION,
    description: 'Phone numbers (US format)',
    pattern: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    redaction_replacement: '[PHONE-REDACTED]',
    confidence_level: 'high',
    enabled: true,
    compliance_tags: ['GDPR', 'CCPA']
  },
  
  {
    name: 'postal_address',
    category: PIICategory.CONTACT_INFORMATION,
    description: 'Street addresses',
    pattern: /\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi,
    redaction_replacement: '[ADDRESS-REDACTED]',
    confidence_level: 'medium',
    enabled: true,
    compliance_tags: ['GDPR', 'CCPA']
  },
  
  // Financial Data
  {
    name: 'credit_card_number',
    category: PIICategory.FINANCIAL_DATA,
    description: 'Credit card numbers',
    pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    redaction_replacement: '[CC-REDACTED]',
    confidence_level: 'high',
    enabled: true,
    compliance_tags: ['PCI-DSS', 'GDPR', 'CCPA']
  },
  
  {
    name: 'bank_account_number',
    category: PIICategory.FINANCIAL_DATA,
    description: 'Bank account numbers',
    pattern: /\b\d{8,17}\b(?=.*(?:account|routing|aba))/gi,
    redaction_replacement: '[ACCOUNT-REDACTED]',
    confidence_level: 'high',
    enabled: true,
    compliance_tags: ['PCI-DSS', 'GDPR', 'CCPA']
  },
  
  {
    name: 'routing_number',
    category: PIICategory.FINANCIAL_DATA,
    description: 'Bank routing numbers',
    pattern: /\b0[0-9]{8}\b|\b1[0-2][0-9]{7}\b|\b2[01][0-9]{7}\b|\b30[0-2][0-9]{6}\b|\b31[0-8][0-9]{6}\b|\b32[0-5][0-9]{6}\b/g,
    redaction_replacement: '[ROUTING-REDACTED]',
    confidence_level: 'high',
    enabled: true,
    compliance_tags: ['PCI-DSS', 'GDPR', 'CCPA']
  },
  
  // Location Data
  {
    name: 'coordinates',
    category: PIICategory.LOCATION_DATA,
    description: 'GPS coordinates',
    pattern: /\b-?(?:[0-8]?[0-9]|90)\.?[0-9]{0,6}[°]?,?\s*-?(?:1[0-7][0-9]|180|[0-9]{1,2})\.?[0-9]{0,6}[°]?\b/g,
    redaction_replacement: '[COORDINATES-REDACTED]',
    confidence_level: 'high',
    enabled: true,
    compliance_tags: ['GDPR', 'CCPA']
  },
  
  {
    name: 'ip_address',
    category: PIICategory.LOCATION_DATA,
    description: 'IP addresses',
    pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\b/g,
    redaction_replacement: '[IP-REDACTED]',
    confidence_level: 'high',
    enabled: true,
    compliance_tags: ['GDPR', 'CCPA']
  },
  
  // Personal Names (context-aware)
  {
    name: 'person_name',
    category: PIICategory.PERSONAL_IDENTIFIERS,
    description: 'Person names (first and last)',
    pattern: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
    redaction_replacement: '[NAME-REDACTED]',
    confidence_level: 'low', // High false positive rate
    enabled: false, // Disabled by default
    compliance_tags: ['GDPR', 'CCPA']
  },
  
  // API Keys and Tokens
  {
    name: 'api_key',
    category: PIICategory.PROFESSIONAL_DATA,
    description: 'API keys and tokens',
    pattern: /\b(?:api[_-]?key|token|secret)["\s:=]+[A-Za-z0-9+/]{20,}\b/gi,
    redaction_replacement: '[API-KEY-REDACTED]',
    confidence_level: 'high',
    enabled: true,
    compliance_tags: ['SECURITY']
  }
]
```

## 🧠 AI Prompt Redaction System

### Prompt Redaction Engine
```typescript
class PromptRedactionService {
  constructor(
    private piiDetector: PIIDetectionService,
    private contextAnalyzer: ContextAnalysisService,
    private auditLogger: AuditLogger
  ) {}
  
  // Redact PII from AI prompts before processing
  async redactPrompt(prompt: string, context: PromptContext): Promise<RedactedPrompt> {
    // Handle AI prompt redaction with tool call parameters
    const redactionLevel = this.determineRedactionLevel(context)
    const detectionResults = await this.piiDetector.detectPII(prompt, redactionLevel)
    
    let redactedText = prompt
    const redactions: PIIRedaction[] = []
    
    // Apply redactions based on detection results
    for (const detection of detectionResults) {
      if (detection.confidence_level === 'high' || 
          (detection.confidence_level === 'medium' && redactionLevel !== 'basic')) {
        
        redactedText = redactedText.replace(detection.pattern, detection.replacement)
        
        redactions.push({
          original_length: detection.match.length,
          replacement: detection.replacement,
          category: detection.category,
          confidence: detection.confidence_level,
          position: detection.position
        })
      }
    }
    
    // Context-aware redaction for business-specific terms
    const contextRedactions = await this.contextAnalyzer.analyzeAndRedact(
      redactedText, 
      context
    )
    
    redactedText = contextRedactions.redacted_text
    redactions.push(...contextRedactions.redactions)
    
    const redactedPrompt: RedactedPrompt = {
      original_prompt: prompt,
      redacted_prompt: redactedText,
      redactions: redactions,
      redaction_level: redactionLevel,
      context: context,
      timestamp: new Date(),
      redaction_id: uuidv4()
    }
    
    // Log redaction for audit
    await this.auditLogger.log({
      action: 'prompt_redacted',
      redaction_id: redactedPrompt.redaction_id,
      tenant_id: context.tenant_id,
      user_id: context.user_id,
      redaction_count: redactions.length,
      redaction_level: redactionLevel,
      prompt_length: prompt.length,
      redacted_length: redactedText.length
    })
    
    return redactedPrompt
  }
  
  // Determine appropriate redaction level based on context
  private determineRedactionLevel(context: PromptContext): RedactionLevel {
    // High-risk contexts require stricter redaction
    if (context.contains_customer_data || 
        context.external_sharing || 
        context.compliance_required) {
      return 'strict'
    }
    
    // AI training or analytics contexts
    if (context.purpose === 'training' || context.purpose === 'analytics') {
      return 'standard'
    }
    
    // Internal operations
    if (context.internal_only && context.authorized_users) {
      return 'basic'
    }
    
    return 'standard'
  }
  
  // Preserve business context while redacting PII
  async preserveBusinessContext(text: string, context: PromptContext): Promise<string> {
    // Business terms that should NOT be redacted
    const businessPreserveList = [
      'invoice', 'estimate', 'job', 'customer', 'payment',
      'schedule', 'appointment', 'service', 'product',
      'contractor', 'technician', 'manager', 'staff'
    ]
    
    // Industry-specific terms
    const industryTerms = await this.getIndustryTerms(context.tenant_id)
    const allPreserveTerms = [...businessPreserveList, ...industryTerms]
    
    // Create protected ranges for business terms
    const protectedRanges: TextRange[] = []
    for (const term of allPreserveTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi')
      let match
      while ((match = regex.exec(text)) !== null) {
        protectedRanges.push({
          start: match.index,
          end: match.index + match[0].length,
          term: match[0]
        })
      }
    }
    
    return text // Return with protected business terms preserved
  }
}

// Context-aware redaction for different business scenarios
class ContextAnalysisService {
  async analyzeAndRedact(text: string, context: PromptContext): Promise<ContextRedactionResult> {
    const redactions: PIIRedaction[] = []
    let redactedText = text
    
    // Invoice/Financial Context
    if (context.document_type === 'invoice' || context.contains_financial_data) {
      const financialRedactions = await this.redactFinancialContext(text)
      redactedText = financialRedactions.redacted_text
      redactions.push(...financialRedactions.redactions)
    }
    
    // Customer Service Context
    if (context.document_type === 'customer_interaction') {
      const customerRedactions = await this.redactCustomerContext(text)
      redactedText = customerRedactions.redacted_text
      redactions.push(...customerRedactions.redactions)
    }
    
    // Employee/HR Context
    if (context.contains_employee_data) {
      const hrRedactions = await this.redactHRContext(text)
      redactedText = hrRedactions.redacted_text
      redactions.push(...hrRedactions.redactions)
    }
    
    return {
      redacted_text: redactedText,
      redactions: redactions
    }
  }
  
  private async redactFinancialContext(text: string): Promise<ContextRedactionResult> {
    // Specific financial data patterns
    const financialPatterns = [
      {
        name: 'dollar_amounts',
        pattern: /\$[\d,]+\.?\d*/g,
        replacement: '[AMOUNT-REDACTED]'
      },
      {
        name: 'invoice_numbers',
        pattern: /(?:invoice|inv|bill)[\s#:]*(\w+)/gi,
        replacement: 'invoice [INV-REDACTED]'
      },
      {
        name: 'account_references',
        pattern: /(?:account|acct)[\s#:]*(\w+)/gi,
        replacement: 'account [ACCT-REDACTED]'
      }
    ]
    
    let redactedText = text
    const redactions: PIIRedaction[] = []
    
    for (const pattern of financialPatterns) {
      const matches = text.match(pattern.pattern)
      if (matches) {
        redactedText = redactedText.replace(pattern.pattern, pattern.replacement)
        redactions.push({
          original_length: matches.join('').length,
          replacement: pattern.replacement,
          category: PIICategory.FINANCIAL_DATA,
          confidence: 'high',
          position: 0 // Simplified for example
        })
      }
    }
    
    return { redacted_text: redactedText, redactions }
  }
}
```

## 📝 Log Scrubbing System

### Structured Log Redaction
```typescript
interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  context: Record<string, any>
  tenant_id?: string
  user_id?: string
  request_id?: string
  stack_trace?: string
}

class LogScrubber {
  constructor(
    private piiDetector: PIIDetectionService,
    private redactionConfig: RedactionConfig
  ) {}
  
  // Scrub PII from log entries before storage
  async scrubLogEntry(logEntry: LogEntry): Promise<ScrubbledLogEntry> {
    const scrubbledEntry = { ...logEntry }
    const redactionMetadata: RedactionMetadata = {
      redacted_fields: [],
      redaction_count: 0,
      redaction_level: this.redactionConfig.log_level
    }
    
    // Scrub message field
    if (logEntry.message) {
      const messageResult = await this.scrubText(logEntry.message)
      scrubbledEntry.message = messageResult.scrubbed_text
      redactionMetadata.redaction_count += messageResult.redaction_count
      if (messageResult.redaction_count > 0) {
        redactionMetadata.redacted_fields.push('message')
      }
    }
    
    // Scrub context object
    if (logEntry.context) {
      const contextResult = await this.scrubObject(logEntry.context)
      scrubbledEntry.context = contextResult.scrubbed_object
      redactionMetadata.redaction_count += contextResult.redaction_count
      redactionMetadata.redacted_fields.push(...contextResult.redacted_fields)
    }
    
    // Scrub stack traces
    if (logEntry.stack_trace) {
      const stackResult = await this.scrubStackTrace(logEntry.stack_trace)
      scrubbledEntry.stack_trace = stackResult.scrubbed_text
      redactionMetadata.redaction_count += stackResult.redaction_count
      if (stackResult.redaction_count > 0) {
        redactionMetadata.redacted_fields.push('stack_trace')
      }
    }
    
    return {
      ...scrubbledEntry,
      _redaction_metadata: redactionMetadata,
      _scrubbed_at: new Date().toISOString()
    }
  }
  
  // Scrub object recursively
  private async scrubObject(obj: any): Promise<ScrubResult> {
    const scrubbed = {}
    const redactedFields = []
    let totalRedactions = 0
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        const result = await this.scrubText(value)
        scrubbed[key] = result.scrubbed_text
        if (result.redaction_count > 0) {
          redactedFields.push(key)
          totalRedactions += result.redaction_count
        }
      } else if (typeof value === 'object' && value !== null) {
        const result = await this.scrubObject(value)
        scrubbed[key] = result.scrubbed_object
        redactedFields.push(...result.redacted_fields.map(f => `${key}.${f}`))
        totalRedactions += result.redaction_count
      } else {
        scrubbed[key] = value
      }
    }
    
    return {
      scrubbed_object: scrubbed,
      redacted_fields: redactedFields,
      redaction_count: totalRedactions
    }
  }
  
  // Scrub stack traces while preserving debugging information
  private async scrubStackTrace(stackTrace: string): Promise<TextScrubResult> {
    // Preserve file paths and line numbers, but scrub any embedded data
    let scrubbed = stackTrace
    let redactionCount = 0
    
    // Scrub potential data in error messages within stack traces
    const errorMessagePattern = /Error:\s*(.+)$/gm
    const matches = stackTrace.match(errorMessagePattern)
    
    if (matches) {
      for (const match of matches) {
        const errorMessage = match.replace('Error: ', '')
        const scrubResult = await this.scrubText(errorMessage)
        if (scrubResult.redaction_count > 0) {
          scrubbed = scrubbed.replace(match, `Error: ${scrubResult.scrubbed_text}`)
          redactionCount += scrubResult.redaction_count
        }
      }
    }
    
    // Scrub potential data in function parameters
    const functionCallPattern = /\s+at\s+\w+\s*\(([^)]+)\)/g
    const funcMatches = stackTrace.match(functionCallPattern)
    
    if (funcMatches) {
      for (const match of funcMatches) {
        const params = match.match(/\(([^)]+)\)/)[1]
        if (params && !params.includes('.js:') && !params.includes('.ts:')) {
          // This might be data rather than file path
          const scrubResult = await this.scrubText(params)
          if (scrubResult.redaction_count > 0) {
            scrubbed = scrubbed.replace(match, match.replace(params, '[PARAMS-REDACTED]'))
            redactionCount += scrubResult.redaction_count
          }
        }
      }
    }
    
    return {
      scrubbed_text: scrubbed,
      redaction_count: redactionCount
    }
  }
  
  private async scrubText(text: string): Promise<TextScrubResult> {
    const detections = await this.piiDetector.detectPII(text, this.redactionConfig.log_level)
    let scrubbed = text
    let redactionCount = 0
    
    for (const detection of detections) {
      if (detection.confidence_level === 'high' || 
          (detection.confidence_level === 'medium' && this.redactionConfig.log_level !== 'basic')) {
        scrubbed = scrubbed.replace(detection.pattern, detection.replacement)
        redactionCount++
      }
    }
    
    return {
      scrubbed_text: scrubbed,
      redaction_count: redactionCount
    }
  }
}
```

## 🔗 Webhook Sanitization

### Webhook Payload Redaction
```typescript
class WebhookSanitizer {
  constructor(
    private piiDetector: PIIDetectionService,
    private redactionConfig: RedactionConfig
  ) {}
  
  // Sanitize outgoing webhook payloads
  async sanitizeWebhookPayload(
    webhook: WebhookDefinition, 
    payload: any, 
    context: WebhookContext
  ): Promise<SanitizedWebhook> {
    // Handle webhook_headers and webhook payload sanitization
    const sanitizationLevel = this.determineSanitizationLevel(webhook, context)
    
    const sanitizedPayload = await this.sanitizeObject(payload, sanitizationLevel)
    
    // Sanitize headers
    const sanitizedHeaders = await this.sanitizeHeaders(webhook.headers || {})
    
    return {
      original_webhook: webhook,
      sanitized_payload: sanitizedPayload.sanitized_object,
      sanitized_headers: sanitizedHeaders,
      sanitization_metadata: {
        level: sanitizationLevel,
        redaction_count: sanitizedPayload.redaction_count,
        redacted_fields: sanitizedPayload.redacted_fields,
        sanitized_at: new Date().toISOString()
      }
    }
  }
  
  // Sanitize webhook failure logs and retry information
  async sanitizeWebhookLogs(webhookLog: WebhookLogEntry): Promise<SanitizedWebhookLog> {
    const sanitized: SanitizedWebhookLog = { ...webhookLog }
    
    // Sanitize request payload
    if (webhookLog.request_payload) {
      const payloadResult = await this.sanitizeObject(webhookLog.request_payload, 'standard')
      sanitized.request_payload = payloadResult.sanitized_object
    }
    
    // Sanitize response data
    if (webhookLog.response_body) {
      const responseResult = await this.scrubText(webhookLog.response_body)
      sanitized.response_body = responseResult.scrubbed_text
    }
    
    // Sanitize error messages
    if (webhookLog.error_message) {
      const errorResult = await this.scrubText(webhookLog.error_message)
      sanitized.error_message = errorResult.scrubbed_text
    }
    
    // Redact sensitive headers but preserve debugging info
    sanitized.request_headers = this.sanitizeHeaders(webhookLog.request_headers || {})
    sanitized.response_headers = this.sanitizeHeaders(webhookLog.response_headers || {})
    
    return sanitized
  }
  
  private async sanitizeObject(obj: any, level: RedactionLevel): Promise<SanitizationResult> {
    const sanitized = {}
    const redactedFields = []
    let totalRedactions = 0
    
    for (const [key, value] of Object.entries(obj)) {
      // Check if field should be completely removed
      if (this.shouldRemoveField(key, level)) {
        sanitized[key] = '[FIELD-REMOVED]'
        redactedFields.push(key)
        totalRedactions++
        continue
      }
      
      if (typeof value === 'string') {
        const result = await this.scrubText(value, level)
        sanitized[key] = result.scrubbed_text
        if (result.redaction_count > 0) {
          redactedFields.push(key)
          totalRedactions += result.redaction_count
        }
      } else if (Array.isArray(value)) {
        const arrayResult = await this.sanitizeArray(value, level)
        sanitized[key] = arrayResult.sanitized_array
        if (arrayResult.redaction_count > 0) {
          redactedFields.push(key)
          totalRedactions += arrayResult.redaction_count
        }
      } else if (typeof value === 'object' && value !== null) {
        const objResult = await this.sanitizeObject(value, level)
        sanitized[key] = objResult.sanitized_object
        redactedFields.push(...objResult.redacted_fields.map(f => `${key}.${f}`))
        totalRedactions += objResult.redaction_count
      } else {
        sanitized[key] = value
      }
    }
    
    return {
      sanitized_object: sanitized,
      redacted_fields: redactedFields,
      redaction_count: totalRedactions
    }
  }
  
  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = {}
    const sensitiveHeaders = [
      'authorization', 'cookie', 'x-api-key', 'x-auth-token',
      'x-access-token', 'x-refresh-token', 'x-session-id'
    ]
    
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase()
      
      if (sensitiveHeaders.includes(lowerKey)) {
        // Keep header but redact value
        sanitized[key] = '[HEADER-REDACTED]'
      } else if (lowerKey.includes('token') || lowerKey.includes('secret') || lowerKey.includes('key')) {
        sanitized[key] = '[HEADER-REDACTED]'
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }
  
  private shouldRemoveField(fieldName: string, level: RedactionLevel): boolean {
    const fieldLower = fieldName.toLowerCase()
    
    // Always remove highly sensitive fields
    const alwaysRemove = ['password', 'ssn', 'social_security', 'tax_id', 'drivers_license']
    if (alwaysRemove.some(field => fieldLower.includes(field))) {
      return true
    }
    
    // Remove additional fields based on redaction level
    if (level === 'strict' || level === 'paranoid') {
      const strictRemove = ['phone', 'address', 'email', 'name', 'dob', 'birth_date']
      if (strictRemove.some(field => fieldLower.includes(field))) {
        return true
      }
    }
    
    if (level === 'paranoid') {
      const paranoidRemove = ['id', 'customer', 'client', 'user']
      if (paranoidRemove.some(field => fieldLower.includes(field))) {
        return true
      }
    }
    
    return false
  }
}
```

## 📊 Data Export Redaction

### Export Redaction Pipeline
```typescript
class DataExportRedactor {
  constructor(
    private piiDetector: PIIDetectionService,
    private auditLogger: AuditLogger
  ) {}
  
  // Redact data exports (CSV, JSON, etc.)
  async redactExport(
    exportRequest: ExportRequest, 
    rawData: any[]
  ): Promise<RedactedExport> {
    const redactionLevel = this.determineExportRedactionLevel(exportRequest)
    
    const redactedData = []
    const redactionSummary: ExportRedactionSummary = {
      total_records: rawData.length,
      redacted_records: 0,
      redacted_fields: new Set(),
      total_redactions: 0
    }
    
    for (const record of rawData) {
      const redactedRecord = await this.redactRecord(record, redactionLevel)
      redactedData.push(redactedRecord.record)
      
      if (redactedRecord.redaction_count > 0) {
        redactionSummary.redacted_records++
        redactedRecord.redacted_fields.forEach(field => 
          redactionSummary.redacted_fields.add(field)
        )
        redactionSummary.total_redactions += redactedRecord.redaction_count
      }
    }
    
    const exportMetadata: ExportMetadata = {
      export_id: uuidv4(),
      requested_at: exportRequest.requested_at,
      requested_by: exportRequest.user_id,
      tenant_id: exportRequest.tenant_id,
      redaction_level: redactionLevel,
      redaction_summary: {
        ...redactionSummary,
        redacted_fields: Array.from(redactionSummary.redacted_fields)
      },
      compliance_flags: this.getComplianceFlags(exportRequest)
    }
    
    // Log export with redaction info
    await this.auditLogger.log({
      action: 'data_export_redacted',
      export_id: exportMetadata.export_id,
      tenant_id: exportRequest.tenant_id,
      user_id: exportRequest.user_id,
      table_names: exportRequest.tables,
      redaction_level: redactionLevel,
      total_records: redactionSummary.total_records,
      redacted_records: redactionSummary.redacted_records,
      total_redactions: redactionSummary.total_redactions
    })
    
    return {
      data: redactedData,
      metadata: exportMetadata,
      format: exportRequest.format
    }
  }
  
  private async redactRecord(record: any, level: RedactionLevel): Promise<RecordRedactionResult> {
    const redacted = {}
    const redactedFields = []
    let redactionCount = 0
    
    for (const [field, value] of Object.entries(record)) {
      // Check field-level redaction rules
      const fieldRule = this.getFieldRedactionRule(field)
      
      if (fieldRule && fieldRule.action === 'remove') {
        redacted[field] = '[REMOVED]'
        redactedFields.push(field)
        redactionCount++
      } else if (fieldRule && fieldRule.action === 'hash') {
        redacted[field] = this.hashValue(value)
        redactedFields.push(field)
        redactionCount++
      } else if (typeof value === 'string') {
        const textResult = await this.scrubText(value, level)
        redacted[field] = textResult.scrubbed_text
        if (textResult.redaction_count > 0) {
          redactedFields.push(field)
          redactionCount += textResult.redaction_count
        }
      } else {
        redacted[field] = value
      }
    }
    
    return {
      record: redacted,
      redacted_fields: redactedFields,
      redaction_count: redactionCount
    }
  }
  
  private getFieldRedactionRule(fieldName: string): FieldRedactionRule | null {
    const fieldLower = fieldName.toLowerCase()
    
    // High-sensitivity fields - always remove
    const removeFields = [
      'ssn', 'social_security_number', 'tax_id', 'drivers_license',
      'password', 'password_hash', 'api_key', 'secret_key'
    ]
    
    if (removeFields.some(field => fieldLower.includes(field))) {
      return { action: 'remove', reason: 'high_sensitivity' }
    }
    
    // Hash-able identifiers
    const hashFields = [
      'user_id', 'customer_id', 'external_id', 'session_id'
    ]
    
    if (hashFields.some(field => fieldLower === field)) {
      return { action: 'hash', reason: 'identifier_protection' }
    }
    
    return null
  }
  
  private hashValue(value: any): string {
    return crypto
      .createHash('sha256')
      .update(String(value))
      .digest('hex')
      .substring(0, 16) + '[HASHED]'
  }
}
```

## 🎭 Compliance & Regulatory Support

### Compliance Framework
```typescript
interface ComplianceRule {
  regulation: 'GDPR' | 'CCPA' | 'HIPAA' | 'PCI_DSS' | 'SOX'
  applies_to: PIICategory[]
  redaction_required: boolean
  retention_limit?: number // days
  audit_required: boolean
  user_consent_required: boolean
}

const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    regulation: 'GDPR',
    applies_to: [
      PIICategory.PERSONAL_IDENTIFIERS,
      PIICategory.CONTACT_INFORMATION,
      PIICategory.LOCATION_DATA,
      PIICategory.BIOMETRIC_DATA
    ],
    redaction_required: true,
    retention_limit: 2555, // 7 years max
    audit_required: true,
    user_consent_required: true
  },
  
  {
    regulation: 'PCI_DSS',
    applies_to: [PIICategory.FINANCIAL_DATA],
    redaction_required: true,
    audit_required: true,
    user_consent_required: false
  },
  
  {
    regulation: 'HIPAA',
    applies_to: [PIICategory.HEALTH_DATA],
    redaction_required: true,
    retention_limit: 2190, // 6 years
    audit_required: true,
    user_consent_required: true
  }
]

class ComplianceEngine {
  getApplicableRules(dataTypes: PIICategory[]): ComplianceRule[] {
    return COMPLIANCE_RULES.filter(rule => 
      rule.applies_to.some(category => dataTypes.includes(category))
    )
  }
  
  determineRedactionRequirements(
    dataTypes: PIICategory[], 
    context: ProcessingContext
  ): RedactionRequirements {
    const applicableRules = this.getApplicableRules(dataTypes)
    
    return {
      redaction_required: applicableRules.some(rule => rule.redaction_required),
      audit_required: applicableRules.some(rule => rule.audit_required),
      consent_required: applicableRules.some(rule => rule.user_consent_required),
      min_retention_limit: Math.min(...applicableRules
        .filter(rule => rule.retention_limit)
        .map(rule => rule.retention_limit!)
      ),
      applicable_regulations: applicableRules.map(rule => rule.regulation)
    }
  }
}
```

## 🧪 Redaction Testing & Validation

### Redaction Test Suite
```typescript
class RedactionTester {
  private testCases: RedactionTestCase[] = [
    // Email addresses
    {
      name: 'email_basic',
      input: 'Contact john.doe@example.com for more info',
      expected: 'Contact [EMAIL-REDACTED] for more info',
      pii_type: PIICategory.CONTACT_INFORMATION
    },
    
    // Phone numbers
    {
      name: 'phone_us_format',
      input: 'Call us at (555) 123-4567 or 555-123-4567',
      expected: 'Call us at [PHONE-REDACTED] or [PHONE-REDACTED]',
      pii_type: PIICategory.CONTACT_INFORMATION
    },
    
    // SSN
    {
      name: 'ssn_with_dashes',
      input: 'SSN: 123-45-6789',
      expected: 'SSN: [SSN-REDACTED]',
      pii_type: PIICategory.PERSONAL_IDENTIFIERS
    },
    
    // Credit cards
    {
      name: 'credit_card_visa',
      input: 'Card number: 4532 1234 5678 9012',
      expected: 'Card number: [CC-REDACTED]',
      pii_type: PIICategory.FINANCIAL_DATA
    },
    
    // Complex business context
    {
      name: 'invoice_with_pii',
      input: 'Invoice INV-001 for john.doe@company.com amount $1,234.56 payment to account 123456789',
      expected: 'Invoice INV-001 for [EMAIL-REDACTED] amount [AMOUNT-REDACTED] payment to account [ACCOUNT-REDACTED]',
      pii_type: PIICategory.FINANCIAL_DATA
    }
  ]
  
  async runRedactionTests(): Promise<TestResults> {
    const results: TestResult[] = []
    
    for (const testCase of this.testCases) {
      const result = await this.runSingleTest(testCase)
      results.push(result)
    }
    
    return {
      total_tests: this.testCases.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      results: results
    }
  }
  
  private async runSingleTest(testCase: RedactionTestCase): Promise<TestResult> {
    const redactionService = new PromptRedactionService(/* ... */)
    
    const redacted = await redactionService.redactPrompt(testCase.input, {
      tenant_id: 'test',
      user_id: 'test',
      redaction_level: 'standard',
      context_type: 'test'
    })
    
    const passed = redacted.redacted_prompt === testCase.expected
    
    return {
      test_name: testCase.name,
      passed: passed,
      input: testCase.input,
      expected: testCase.expected,
      actual: redacted.redacted_prompt,
      pii_detected: redacted.redactions.length,
      errors: passed ? [] : [`Expected: ${testCase.expected}, Got: ${redacted.redacted_prompt}`]
    }
  }
}
```

This comprehensive PII redaction system provides automated, context-aware redaction for prompts, logs, webhooks, and data exports with full compliance support and testing validation.
