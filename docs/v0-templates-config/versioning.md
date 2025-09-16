# Thorbis v0 Template Versioning System

Comprehensive version control, diffing, rollback, and safe default template management for business-critical document generation.

## 🎯 Version Control Strategy

### Template Version Schema
```typescript
interface TemplateVersion {
  version_id: string            // UUID for unique identification
  template_type: 'invoice' | 'estimate' | 'receipt'
  version_number: string        // Semantic version (e.g., "1.2.3")
  
  // Version metadata
  created_at: Date
  created_by: string
  title: string
  description: string
  change_summary: string
  
  // Template content
  template_code: string         // Complete React component code
  template_hash: string         // SHA-256 hash for integrity
  
  // Validation status
  validation_status: 'pending' | 'passed' | 'failed'
  validation_results: ValidationResult[]
  acceptance_checklist_status: ChecklistStatus
  
  // Deployment info
  is_active: boolean
  is_default: boolean
  rollback_safe: boolean
  
  // Dependencies and compatibility
  framework_version: string     // React/Next.js version
  design_system_version: string // Thorbis design tokens version
  api_compatibility: string[]   // Compatible API versions
  
  // Performance metrics
  bundle_size: number
  render_time_ms: number
  accessibility_score: number
  print_fidelity_score: number
}

interface VersionHistory {
  template_type: string
  versions: TemplateVersion[]
  current_default: string       // version_id of current default
  rollback_chain: string[]      // Safe rollback order
  last_updated: Date
}
```

### Version Numbering Convention
```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes to template structure or data requirements
MINOR: New features, slots, or significant layout improvements
PATCH: Bug fixes, minor styling adjustments, accessibility improvements

Examples:
- 1.0.0: Initial production version
- 1.1.0: Added optional timeline section to estimates
- 1.1.1: Fixed print margin issue in Safari
- 2.0.0: Changed line item data structure (breaking change)
```

## 🔍 Template Diffing System

### Visual Diff Generation
```typescript
class TemplateDiffer {
  async generateDiff(
    oldVersion: string,
    newVersion: string,
    diffType: 'visual' | 'code' | 'data_structure'
  ): Promise<TemplateDiff> {
    
    const oldTemplate = await this.getTemplate(oldVersion)
    const newTemplate = await this.getTemplate(newVersion)
    
    switch (diffType) {
      case 'visual':
        return await this.generateVisualDiff(oldTemplate, newTemplate)
      case 'code':
        return await this.generateCodeDiff(oldTemplate, newTemplate)
      case 'data_structure':
        return await this.generateDataStructureDiff(oldTemplate, newTemplate)
    }
  }
  
  private async generateVisualDiff(
    oldTemplate: TemplateVersion,
    newTemplate: TemplateVersion
  ): Promise<VisualDiff> {
    
    // Render both templates with sample data
    const oldRendered = await this.renderTemplate(oldTemplate, this.getSampleData())
    const newRendered = await this.renderTemplate(newTemplate, this.getSampleData())
    
    // Generate side-by-side comparison
    const visualDiff = await this.compareRenderedOutputs(oldRendered, newRendered)
    
    return {
      diff_type: 'visual',
      old_version: oldTemplate.version_number,
      new_version: newTemplate.version_number,
      changes_detected: visualDiff.changes.length,
      
      layout_changes: visualDiff.layout_changes,
      styling_changes: visualDiff.styling_changes,
      content_changes: visualDiff.content_changes,
      
      side_by_side_preview: visualDiff.comparison_image,
      change_annotations: visualDiff.annotations,
      
      risk_assessment: this.assessChangeRisk(visualDiff),
      impact_summary: this.generateImpactSummary(visualDiff)
    }
  }
  
  private async generateCodeDiff(
    oldTemplate: TemplateVersion,
    newTemplate: TemplateVersion
  ): Promise<CodeDiff> {
    
    const codeDiff = this.computeUnifiedDiff(
      oldTemplate.template_code,
      newTemplate.template_code
    )
    
    return {
      diff_type: 'code',
      unified_diff: codeDiff,
      
      additions: codeDiff.additions,
      deletions: codeDiff.deletions,
      modifications: codeDiff.modifications,
      
      structural_changes: this.analyzeStructuralChanges(codeDiff),
      dependency_changes: this.analyzeDependencyChanges(codeDiff),
      
      breaking_changes: this.identifyBreakingChanges(codeDiff),
      security_implications: this.analyzeSecurityImplications(codeDiff)
    }
  }
}
```

### Diff Visualization Examples
```bash
# Visual Diff Output
Template: Invoice v1.2.0 → v1.3.0
Changes Detected: 5

Layout Changes:
  ✅ Added: Optional project details section
  ⚠️  Modified: Line items table column widths
  
Styling Changes:
  ✅ Enhanced: Dark mode contrast ratios
  ✅ Fixed: Print margins in Firefox
  
Content Changes:
  ✅ Added: Payment QR code slot
  ⚠️  Modified: Terms and conditions layout

Risk Assessment: LOW
  - No breaking changes to data structure
  - All changes are additive or cosmetic
  - Print compatibility maintained
  
Impact Summary:
  - Business Impact: Minimal - existing invoices unaffected
  - User Impact: Positive - improved readability and payment options
  - Technical Impact: None - backward compatible
```

### Data Structure Diffing
```typescript
interface DataStructureDiff {
  schema_version: string
  breaking_changes: SchemaChange[]
  additive_changes: SchemaChange[]
  deprecated_fields: FieldChange[]
  
  migration_required: boolean
  migration_script?: string
  rollback_compatibility: boolean
}

interface SchemaChange {
  field_path: string
  change_type: 'added' | 'removed' | 'modified' | 'deprecated'
  old_type?: string
  new_type?: string
  impact_level: 'breaking' | 'minor' | 'none'
  migration_notes: string
}
```

## 🔄 Rollback Management

### Safe Rollback Chain
```typescript
class TemplateRollbackManager {
  async generateRollbackChain(templateType: string): Promise<RollbackChain> {
    const versionHistory = await this.getVersionHistory(templateType)
    const safeRollbacks = []
    
    // Build rollback chain based on compatibility
    for (const version of versionHistory.versions.reverse()) {
      if (version.rollback_safe && version.validation_status === 'passed') {
        safeRollbacks.push({
          version_id: version.version_id,
          version_number: version.version_number,
          rollback_risk: this.assessRollbackRisk(version),
          data_compatibility: await this.checkDataCompatibility(version),
          estimated_downtime: this.estimateRollbackTime(version)
        })
      }
    }
    
    return {
      current_version: versionHistory.current_default,
      rollback_options: safeRollbacks,
      emergency_rollback: this.getLastKnownGood(templateType),
      rollback_strategy: this.recommendRollbackStrategy(safeRollbacks)
    }
  }
  
  async performRollback(
    templateType: string,
    targetVersion: string,
    rollbackReason: string,
    confirmedBy: string
  ): Promise<RollbackResult> {
    
    const rollbackId = uuidv4()
    const currentVersion = await this.getCurrentDefault(templateType)
    
    // Pre-rollback validation
    const preValidation = await this.validateRollbackSafety(templateType, targetVersion)
    if (!preValidation.safe) {
      throw new Error(`Rollback blocked: ${preValidation.reason}`)
    }
    
    // Create rollback point
    await this.createRollbackPoint(rollbackId, {
      from_version: currentVersion.version_id,
      to_version: targetVersion,
      reason: rollbackReason,
      initiated_by: confirmedBy,
      timestamp: new Date()
    })
    
    // Perform atomic rollback
    try {
      await this.atomicTemplateSwap(templateType, targetVersion)
      
      // Verify rollback success
      const postValidation = await this.validateTemplateFunction(templateType)
      if (!postValidation.success) {
        await this.emergencyRevert(rollbackId)
        throw new Error(`Rollback verification failed: ${postValidation.error}`)
      }
      
      // Update version history
      await this.updateVersionHistory(templateType, targetVersion, rollbackId)
      
      return {
        rollback_id: rollbackId,
        success: true,
        rolled_back_from: currentVersion.version_number,
        rolled_back_to: targetVersion,
        downtime_seconds: Date.now() - rollbackStart,
        verification_passed: true
      }
      
    } catch (error) {
      await this.emergencyRevert(rollbackId)
      throw error
    }
  }
}
```

### Rollback Safety Validation
```typescript
interface RollbackSafety {
  safe: boolean
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  blocking_issues: string[]
  warnings: string[]
  
  data_compatibility: {
    compatible: boolean
    migration_required: boolean
    data_loss_risk: boolean
  }
  
  feature_impact: {
    removed_features: string[]
    modified_behavior: string[]
    user_impact_level: 'none' | 'minor' | 'major'
  }
  
  technical_requirements: {
    framework_compatible: boolean
    dependency_conflicts: string[]
    performance_impact: string
  }
}

async function validateRollbackSafety(
  currentVersion: string,
  targetVersion: string
): Promise<RollbackSafety> {
  
  const current = await getTemplateVersion(currentVersion)
  const target = await getTemplateVersion(targetVersion)
  
  // Check data compatibility
  const dataCompat = await checkDataCompatibility(current, target)
  
  // Check feature regression
  const featureImpact = await analyzeFeatureRegression(current, target)
  
  // Check technical requirements
  const techRequirements = await checkTechnicalCompatibility(target)
  
  const blockingIssues = []
  const warnings = []
  let riskLevel: RollbackSafety['risk_level'] = 'low'
  
  if (!dataCompat.compatible) {
    blockingIssues.push("Data structure incompatibility detected")
    riskLevel = 'critical'
  }
  
  if (featureImpact.removed_features.length > 0) {
    warnings.push(`Features will be removed: ${featureImpact.removed_features.join(', ')}`)
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
  }
  
  if (!techRequirements.framework_compatible) {
    blockingIssues.push("Framework version incompatibility")
    riskLevel = 'critical'
  }
  
  return {
    safe: blockingIssues.length === 0,
    risk_level: riskLevel,
    blocking_issues: blockingIssues,
    warnings: warnings,
    data_compatibility: dataCompat,
    feature_impact: featureImpact,
    technical_requirements: techRequirements
  }
}
```

## ⚙️ Default Template Management

### Safe Default Setting Process
```typescript
interface DefaultTemplateChangeRequest {
  template_type: 'invoice' | 'estimate' | 'receipt'
  new_default_version: string
  change_reason: string
  requested_by: string
  scheduled_deployment?: Date
  
  // Required confirmations
  confirmation_text_required: string
  stakeholder_approvals: StakeholderApproval[]
  
  // Risk assessment
  impact_assessment: ImpactAssessment
  rollback_plan: RollbackPlan
  testing_results: TestingResults
}

class DefaultTemplateManager {
  async requestDefaultChange(
    request: DefaultTemplateChangeRequest
  ): Promise<DefaultChangeProcess> {
    
    // Validate the request
    const validation = await this.validateDefaultChangeRequest(request)
    if (!validation.valid) {
      throw new Error(`Invalid request: ${validation.errors.join(', ')}`)
    }
    
    // Generate confirmation text based on impact
    const confirmationText = await this.generateConfirmationText(request)
    
    // Create change process
    const processId = uuidv4()
    const changeProcess = {
      process_id: processId,
      request: request,
      confirmation_text: confirmationText,
      
      status: 'pending_confirmation',
      created_at: new Date(),
      
      required_approvals: this.getRequiredApprovals(request.impact_assessment),
      current_approvals: [],
      
      safety_checks: await this.generateSafetyChecks(request),
      deployment_plan: await this.createDeploymentPlan(request)
    }
    
    await this.saveChangeProcess(changeProcess)
    await this.notifyStakeholders(changeProcess)
    
    return changeProcess
  }
  
  async confirmDefaultChange(
    processId: string,
    confirmationText: string,
    confirmedBy: string
  ): Promise<DefaultChangeResult> {
    
    const process = await this.getChangeProcess(processId)
    
    // Verify confirmation text exactly
    if (confirmationText !== process.confirmation_text) {
      throw new Error("Confirmation text does not match. Default change aborted.")
    }
    
    // Check all approvals received
    if (!this.allApprovalsReceived(process)) {
      throw new Error("Not all required approvals received")
    }
    
    // Perform final safety checks
    const finalSafetyCheck = await this.runFinalSafetyChecks(process)
    if (!finalSafetyCheck.passed) {
      throw new Error(`Safety check failed: ${finalSafetyCheck.failures.join(', ')}`)
    }
    
    // Create version history entry BEFORE making changes
    const historyEntry = await this.createVersionHistoryEntry({
      process_id: processId,
      action: 'set_default',
      from_version: await this.getCurrentDefault(process.request.template_type),
      to_version: process.request.new_default_version,
      confirmed_by: confirmedBy,
      confirmation_text: confirmationText,
      timestamp: new Date()
    })
    
    try {
      // Perform atomic default change
      await this.atomicDefaultChange(
        process.request.template_type,
        process.request.new_default_version
      )
      
      // Verify new default is working
      const verification = await this.verifyNewDefault(process.request.template_type)
      if (!verification.success) {
        await this.revertDefaultChange(historyEntry.entry_id)
        throw new Error(`Default verification failed: ${verification.error}`)
      }
      
      // Update process status
      await this.updateProcessStatus(processId, 'completed')
      
      return {
        success: true,
        process_id: processId,
        history_entry_id: historyEntry.entry_id,
        new_default: process.request.new_default_version,
        previous_default: historyEntry.from_version,
        completion_time: new Date()
      }
      
    } catch (error) {
      await this.updateProcessStatus(processId, 'failed')
      await this.notifyFailure(processId, error.message)
      throw error
    }
  }
}
```

### Confirmation Text Generation
```typescript
function generateConfirmationText(request: DefaultTemplateChangeRequest): string {
  const impact = request.impact_assessment
  const riskLevel = impact.risk_level
  
  let confirmationText = ""
  
  // Base confirmation
  confirmationText += `I confirm changing the default ${request.template_type} template `
  confirmationText += `from version ${impact.current_version} to version ${request.new_default_version}. `
  
  // Risk-based additional confirmations
  if (riskLevel === 'high' || riskLevel === 'critical') {
    confirmationText += "I understand this is a high-risk change that may impact active business operations. "
  }
  
  if (impact.breaking_changes.length > 0) {
    confirmationText += `I acknowledge the breaking changes: ${impact.breaking_changes.join(', ')}. `
  }
  
  if (impact.data_migration_required) {
    confirmationText += "I confirm that data migration has been completed and verified. "
  }
  
  if (impact.user_training_required) {
    confirmationText += "I confirm that affected users have been trained on the changes. "
  }
  
  // Rollback confirmation
  confirmationText += `I understand that rollback to version ${impact.current_version} is available `
  confirmationText += `and will take approximately ${impact.rollback_time_estimate} to complete. `
  
  // Final confirmation
  confirmationText += `Change requested by ${request.requested_by} on ${new Date().toISOString().split('T')[0]}.`
  
  return confirmationText
}
```

### Version History Management
```typescript
interface VersionHistoryEntry {
  entry_id: string
  template_type: string
  action: 'created' | 'set_default' | 'rollback' | 'deprecated'
  
  // Version information
  from_version?: string
  to_version: string
  version_metadata: TemplateVersionMetadata
  
  // Change context
  change_reason: string
  impact_level: 'low' | 'medium' | 'high' | 'critical'
  breaking_changes: string[]
  
  // Approval and confirmation
  requested_by: string
  approved_by: string[]
  confirmed_by: string
  confirmation_text?: string
  
  // Timing
  requested_at: Date
  approved_at?: Date
  deployed_at?: Date
  
  // Safety and rollback
  rollback_safe: boolean
  rollback_to?: string
  emergency_contact: string
  
  // Performance impact
  before_metrics?: PerformanceMetrics
  after_metrics?: PerformanceMetrics
  
  // Validation results
  acceptance_checklist_passed: boolean
  validation_results: ValidationResult[]
  user_acceptance_testing: boolean
}

class VersionHistoryManager {
  async recordVersionChange(entry: VersionHistoryEntry): Promise<string> {
    // Validate entry completeness
    const validation = this.validateHistoryEntry(entry)
    if (!validation.valid) {
      throw new Error(`Invalid history entry: ${validation.errors.join(', ')}`)
    }
    
    // Store with cryptographic integrity
    const entryHash = this.calculateEntryHash(entry)
    const signedEntry = await this.signHistoryEntry(entry, entryHash)
    
    await this.storeHistoryEntry(signedEntry)
    await this.updateVersionChain(entry.template_type, entry)
    
    // Trigger notifications
    await this.notifyVersionChange(entry)
    
    return entry.entry_id
  }
  
  async getVersionHistory(
    templateType: string,
    limit?: number
  ): Promise<VersionHistoryEntry[]> {
    
    const history = await this.queryVersionHistory(templateType, limit)
    
    // Verify integrity of each entry
    for (const entry of history) {
      const integrity = await this.verifyHistoryIntegrity(entry)
      if (!integrity.valid) {
        throw new Error(`History integrity violation detected: ${entry.entry_id}`)
      }
    }
    
    return history
  }
  
  async auditVersionChanges(
    startDate: Date,
    endDate: Date
  ): Promise<VersionAuditReport> {
    
    const changes = await this.queryVersionChanges(startDate, endDate)
    
    return {
      audit_period: { start: startDate, end: endDate },
      total_changes: changes.length,
      
      changes_by_type: this.groupChangesByType(changes),
      changes_by_risk: this.groupChangesByRisk(changes),
      
      failed_changes: changes.filter(c => c.status === 'failed'),
      rollbacks_performed: changes.filter(c => c.action === 'rollback'),
      
      compliance_issues: await this.identifyComplianceIssues(changes),
      recommendations: await this.generateAuditRecommendations(changes)
    }
  }
}
```

## 🔒 Safety Mechanisms

### Multi-Stage Approval Process
```typescript
interface ApprovalWorkflow {
  template_type: string
  change_risk_level: 'low' | 'medium' | 'high' | 'critical'
  
  required_approvals: {
    low: ['technical_lead']
    medium: ['technical_lead', 'design_lead']  
    high: ['technical_lead', 'design_lead', 'product_owner']
    critical: ['technical_lead', 'design_lead', 'product_owner', 'business_owner']
  }
  
  approval_sequence: boolean  // Must be approved in order
  timeout_hours: number       // Approval expires after timeout
  emergency_bypass: boolean   // Can be bypassed in emergencies
}

interface StakeholderApproval {
  stakeholder_role: string
  stakeholder_name: string
  approved: boolean
  approval_timestamp?: Date
  approval_notes?: string
  conditions?: string[]
}
```

### Automated Safety Checks
```typescript
interface SafetyCheck {
  check_name: string
  check_type: 'automated' | 'manual'
  severity: 'blocking' | 'warning' | 'info'
  
  passed: boolean
  error_message?: string
  
  execution_time_ms: number
  check_data?: any
}

async function runComprehensiveSafetyChecks(
  templateType: string,
  newVersion: string
): Promise<SafetyCheck[]> {
  
  const checks: SafetyCheck[] = []
  
  // Compilation check
  checks.push(await this.runCompilationCheck(newVersion))
  
  // Acceptance checklist validation
  checks.push(await this.runAcceptanceChecklistValidation(newVersion))
  
  // Performance regression check
  checks.push(await this.runPerformanceRegressionCheck(templateType, newVersion))
  
  // Accessibility compliance check
  checks.push(await this.runAccessibilityCheck(newVersion))
  
  // Print fidelity check
  checks.push(await this.runPrintFidelityCheck(newVersion))
  
  // Cross-browser compatibility check  
  checks.push(await this.runCrossBrowserCheck(newVersion))
  
  // Security vulnerability check
  checks.push(await this.runSecurityCheck(newVersion))
  
  // Data structure compatibility check
  checks.push(await this.runDataCompatibilityCheck(templateType, newVersion))
  
  return checks
}
```

### Emergency Procedures
```typescript
interface EmergencyRollbackProcedure {
  trigger_conditions: [
    'critical_production_failure',
    'data_loss_incident', 
    'security_vulnerability_discovery',
    'compliance_violation'
  ]
  
  emergency_contacts: EmergencyContact[]
  
  automatic_rollback_enabled: boolean
  automatic_rollback_conditions: string[]
  
  manual_override_process: {
    authorization_required: string[]  // ['cto', 'head_of_engineering']
    confirmation_phrase: string
    max_override_window_hours: number
  }
  
  communication_plan: {
    internal_notifications: string[]
    customer_notifications: boolean
    status_page_update: boolean
  }
}

async function executeEmergencyRollback(
  templateType: string,
  reason: string,
  authorizedBy: string
): Promise<EmergencyRollbackResult> {
  
  const emergencyId = uuidv4()
  const lastKnownGood = await this.getLastKnownGoodVersion(templateType)
  
  // Log emergency event
  await this.logEmergencyEvent({
    emergency_id: emergencyId,
    template_type: templateType,
    trigger_reason: reason,
    authorized_by: authorizedBy,
    target_version: lastKnownGood.version_id
  })
  
  // Immediate rollback without normal safety checks
  try {
    await this.immediateRollback(templateType, lastKnownGood.version_id)
    
    // Verify emergency rollback success
    const verification = await this.quickVerification(templateType)
    
    // Notify all stakeholders
    await this.sendEmergencyNotifications(emergencyId, templateType, reason)
    
    return {
      success: true,
      emergency_id: emergencyId,
      rollback_completed_at: new Date(),
      restored_version: lastKnownGood.version_number,
      verification_passed: verification.success
    }
    
  } catch (error) {
    await this.escalateEmergencyFailure(emergencyId, error)
    throw error
  }
}
```

This comprehensive versioning system ensures safe, controlled, and auditable management of v0-generated templates with robust rollback capabilities and multi-layered safety mechanisms to protect business-critical document generation.
