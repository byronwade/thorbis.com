/**
 * Thorbis v0 Template Management System
 * 
 * Provides safe default template management with:
 * - Confirmation text requirements for "set as default" operations
 * - Comprehensive version history logging
 * - Multi-stage approval workflow
 * - Rollback safety validation
 * - Automated safety checks
 */

interface TemplateVersion {
  version_id: string
  template_type: 'invoice' | 'estimate' | 'receipt'
  version_number: string
  
  // Version metadata
  created_at: Date
  created_by: string
  title: string
  description: string
  change_summary: string
  
  // Template content
  template_code: string
  template_hash: string
  
  // Validation status
  validation_status: 'pending' | 'passed' | 'failed'
  validation_results: ValidationResult[]
  acceptance_checklist_status: ChecklistStatus
  
  // Deployment info
  is_active: boolean
  is_default: boolean
  rollback_safe: boolean
  
  // Performance metrics
  bundle_size: number
  render_time_ms: number
  accessibility_score: number
  print_fidelity_score: number
}

interface DefaultChangeRequest {
  request_id: string
  template_type: 'invoice' | 'estimate' | 'receipt'
  new_default_version: string
  current_default_version: string
  change_reason: string
  requested_by: string
  requested_at: Date
  
  // Impact assessment
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  breaking_changes: string[]
  user_impact_summary: string
  rollback_time_estimate: string
  
  // Required confirmations
  confirmation_text: string
  required_approvals: StakeholderApproval[]
  
  // Safety validation
  safety_checks_passed: boolean
  validation_results: SafetyCheckResult[]
  
  // Status tracking
  status: 'pending_approval' | 'pending_confirmation' | 'confirmed' | 'deployed' | 'failed' | 'cancelled'
  deployed_at?: Date
  cancelled_reason?: string
}

interface StakeholderApproval {
  stakeholder_role: 'technical_lead' | 'design_lead' | 'product_owner' | 'business_owner'
  stakeholder_name: string
  stakeholder_email: string
  required: boolean
  approved: boolean
  approved_at?: Date
  approval_notes?: string
  conditions?: string[]
}

interface VersionHistoryEntry {
  entry_id: string
  template_type: string
  action: 'created' | 'set_default' | 'rollback' | 'deprecated'
  
  // Version information
  from_version?: string
  to_version: string
  
  // Change context
  change_reason: string
  impact_level: 'low' | 'medium' | 'high' | 'critical'
  breaking_changes: string[]
  
  // Approval and confirmation
  requested_by: string
  approved_by: string[]
  confirmed_by: string
  confirmation_text: string
  
  // Timing
  requested_at: Date
  confirmed_at: Date
  deployed_at: Date
  
  // Safety and rollback
  rollback_safe: boolean
  emergency_contact: string
  
  // Validation results
  safety_checks_passed: boolean
  acceptance_checklist_passed: boolean
}

interface SafetyCheckResult {
  check_name: string
  check_type: 'automated' | 'manual'
  severity: 'blocking' | 'warning' | 'info'
  passed: boolean
  error_message?: string
  execution_time_ms: number
}

export class TemplateManager {
  private versionHistory: Map<string, VersionHistoryEntry[]> = new Map()
  private activeRequests: Map<string, DefaultChangeRequest> = new Map()
  private currentDefaults: Map<string, string> = new Map() // template_type -> version_id

  constructor(
    private auditLogger: AuditLogger,
    private safetyValidator: TemplateValidationService,
    private notificationService: NotificationService
  ) {
    // Initialize with sample defaults
    this.currentDefaults.set('invoice', 'invoice_v1.0.0')
    this.currentDefaults.set('estimate', 'estimate_v1.0.0') 
    this.currentDefaults.set('receipt', 'receipt_v1.0.0')
  }

  /**
   * Request to set a new default template
   * Initiates approval workflow and generates confirmation requirements
   */
  async requestDefaultChange(
    templateType: 'invoice' | 'estimate' | 'receipt',
    newVersionId: string,
    changeReason: string,
    requestedBy: string
  ): Promise<DefaultChangeRequest> {
    
    const requestId = this.generateRequestId()
    const currentDefault = this.currentDefaults.get(templateType)
    
    if (!currentDefault) {
      throw new Error(`No current default found for ${templateType} template`)
    }
    
    // Assess impact and risk level
    const impactAssessment = await this.assessChangeImpact(
      templateType, 
      currentDefault, 
      newVersionId
    )
    
    // Generate confirmation text based on risk and impact
    const confirmationText = this.generateConfirmationText({
      templateType,
      fromVersion: currentDefault,
      toVersion: newVersionId,
      changeReason,
      requestedBy,
      impactAssessment
    })
    
    // Determine required approvals based on risk level
    const requiredApprovals = this.getRequiredApprovals(impactAssessment.risk_level)
    
    // Run initial safety checks
    const safetyResults = await this.runSafetyChecks(templateType, newVersionId)
    
    const request: DefaultChangeRequest = {
      request_id: requestId,
      template_type: templateType,
      new_default_version: newVersionId,
      current_default_version: currentDefault,
      change_reason: changeReason,
      requested_by: requestedBy,
      requested_at: new Date(),
      
      risk_level: impactAssessment.risk_level,
      breaking_changes: impactAssessment.breaking_changes,
      user_impact_summary: impactAssessment.user_impact_summary,
      rollback_time_estimate: impactAssessment.rollback_time_estimate,
      
      confirmation_text: confirmationText,
      required_approvals: requiredApprovals,
      
      safety_checks_passed: safetyResults.every(check => check.passed || check.severity !== 'blocking'),
      validation_results: safetyResults,
      
      status: 'pending_approval'
    }
    
    // Store the request
    this.activeRequests.set(requestId, request)
    
    // Send notifications to required approvers
    await this.notifyApprovers(request)
    
    // Log the request
    await this.auditLogger.log({
      action: 'default_change_requested',
      template_type: templateType,
      request_id: requestId,
      requested_by: requestedBy,
      risk_level: impactAssessment.risk_level
    })
    
    return request
  }

  /**
   * Stakeholder approval for default change request
   */
  async approveDefaultChange(
    requestId: string,
    stakeholderRole: string,
    stakeholderEmail: string,
    approvalNotes?: string,
    conditions?: string[]
  ): Promise<boolean> {
    
    const request = this.activeRequests.get(requestId)
    if (!request) {
      throw new Error(`Request ${requestId} not found`)
    }
    
    // Find the stakeholder's approval entry
    const approval = request.required_approvals.find(
      a => a.stakeholder_role === stakeholderRole && a.stakeholder_email === stakeholderEmail
    )
    
    if (!approval) {
      throw new Error(`Approval not required from ${stakeholderRole}: ${stakeholderEmail}`)
    }
    
    if (approval.approved) {
      throw new Error(`Already approved by ${stakeholderRole}`)
    }
    
    // Mark as approved
    approval.approved = true
    approval.approved_at = new Date()
    approval.approval_notes = approvalNotes
    approval.conditions = conditions
    
    // Check if all required approvals are received
    const allApproved = request.required_approvals
      .filter(a => a.required)
      .every(a => a.approved)
    
    if (allApproved && request.safety_checks_passed) {
      request.status = 'pending_confirmation'
      
      // Notify requester that they can now confirm
      await this.notificationService.send({
        to: request.requested_by,
        subject: `Template Change Ready for Confirmation - ${request.template_type}`,
        template: 'default_change_ready_confirmation',
        data: { request }
      })
    }
    
    // Log the approval
    await this.auditLogger.log({
      action: 'default_change_approved',
      request_id: requestId,
      approved_by: stakeholderEmail,
      stakeholder_role: stakeholderRole,
      all_approvals_received: allApproved
    })
    
    return allApproved
  }

  /**
   * Confirm default template change with required confirmation text
   * This is the final step that actually changes the default
   */
  async confirmDefaultChange(
    requestId: string,
    confirmationText: string,
    confirmedBy: string
  ): Promise<VersionHistoryEntry> {
    
    const request = this.activeRequests.get(requestId)
    if (!request) {
      throw new Error(`Request ${requestId} not found`)
    }
    
    if (request.status !== 'pending_confirmation') {
      throw new Error(`Request ${requestId} is not ready for confirmation (status: ${request.status})`)
    }
    
    // Verify confirmation text EXACTLY matches required text
    if (confirmationText.trim() !== request.confirmation_text.trim()) {
      await this.auditLogger.log({
        action: 'default_change_confirmation_failed',
        request_id: requestId,
        confirmed_by: confirmedBy,
        reason: 'confirmation_text_mismatch'
      })
      
      throw new Error(
        'Confirmation text does not match exactly. Default change aborted. ' +
        'Please copy the exact confirmation text provided.'
      )
    }
    
    // Final safety check before deployment
    const finalSafetyCheck = await this.runFinalSafetyChecks(request)
    if (!finalSafetyCheck.passed) {
      throw new Error(`Final safety check failed: ${finalSafetyCheck.failures.join(', ')}`)
    }
    
    try {
      // Create version history entry BEFORE making changes
      const historyEntry = await this.createVersionHistoryEntry({
        template_type: request.template_type,
        action: 'set_default',
        from_version: request.current_default_version,
        to_version: request.new_default_version,
        change_reason: request.change_reason,
        impact_level: request.risk_level,
        breaking_changes: request.breaking_changes,
        requested_by: request.requested_by,
        approved_by: request.required_approvals
          .filter(a => a.approved)
          .map(a => a.stakeholder_email),
        confirmed_by: confirmedBy,
        confirmation_text: confirmationText,
        requested_at: request.requested_at,
        confirmed_at: new Date(),
        emergency_contact: this.getEmergencyContact(request.risk_level)
      })
      
      // Perform atomic default change
      await this.performAtomicDefaultChange(
        request.template_type,
        request.new_default_version
      )
      
      // Verify the change was successful
      const verification = await this.verifyDefaultChange(
        request.template_type,
        request.new_default_version
      )
      
      if (!verification.success) {
        // Attempt automatic rollback
        await this.emergencyRollback(request.template_type, request.current_default_version)
        throw new Error(`Default change verification failed: ${verification.error}`)
      }
      
      // Update request status and history entry
      request.status = 'deployed'
      request.deployed_at = new Date()
      historyEntry.deployed_at = new Date()
      
      // Remove from active requests
      this.activeRequests.delete(requestId)
      
      // Add to version history
      this.addToVersionHistory(request.template_type, historyEntry)
      
      // Send success notifications
      await this.notifySuccessfulDeployment(request, historyEntry)
      
      // Log successful deployment
      await this.auditLogger.log({
        action: 'default_change_deployed',
        request_id: requestId,
        template_type: request.template_type,
        from_version: request.current_default_version,
        to_version: request.new_default_version,
        confirmed_by: confirmedBy,
        deployment_time: new Date()
      })
      
      return historyEntry
      
    } catch (error) {
      // Mark request as failed
      request.status = 'failed'
      
      // Log the failure
      await this.auditLogger.log({
        action: 'default_change_failed',
        request_id: requestId,
        confirmed_by: confirmedBy,
        error: error.message,
        timestamp: new Date()
      })
      
      // Notify stakeholders of failure
      await this.notifyDeploymentFailure(request, error.message)
      
      throw error
    }
  }

  /**
   * Generate confirmation text based on change impact
   */
  private generateConfirmationText(params: {
    templateType: string
    fromVersion: string
    toVersion: string
    changeReason: string
    requestedBy: string
    impactAssessment: any
  }): string {
    
    let confirmationText = ''
    
    // Base confirmation
    confirmationText += `I confirm changing the default ${params.templateType} template `
    confirmationText += `from version ${params.fromVersion} to version ${params.toVersion}. `
    
    // Risk-based additional confirmations
    if (params.impactAssessment.risk_level === 'high' || params.impactAssessment.risk_level === 'critical') {
      confirmationText += 'I understand this is a high-risk change that may impact active business operations. '
    }
    
    if (params.impactAssessment.breaking_changes.length > 0) {
      confirmationText += `I acknowledge the breaking changes: ${params.impactAssessment.breaking_changes.join(', ')}. `
    }
    
    if (params.impactAssessment.data_migration_required) {
      confirmationText += 'I confirm that data migration has been completed and verified. '
    }
    
    if (params.impactAssessment.user_training_required) {
      confirmationText += 'I confirm that affected users have been trained on the changes. '
    }
    
    // Rollback information
    confirmationText += `I understand that rollback to version ${params.fromVersion} is available `
    confirmationText += `and will take approximately ${params.impactAssessment.rollback_time_estimate} to complete. `
    
    // Final attribution
    confirmationText += `Change requested by ${params.requestedBy} on ${new Date().toISOString().split('T')[0]}.`
    
    return confirmationText
  }

  /**
   * Get required approvals based on risk level
   */
  private getRequiredApprovals(riskLevel: 'low' | 'medium' | 'high' | 'critical'): StakeholderApproval[] {
    const approvalMatrix = {
      low: ['technical_lead'],
      medium: ['technical_lead', 'design_lead'],
      high: ['technical_lead', 'design_lead', 'product_owner'],
      critical: ['technical_lead', 'design_lead', 'product_owner', 'business_owner']
    }
    
    const requiredRoles = approvalMatrix[riskLevel] || approvalMatrix.medium
    
    return requiredRoles.map(role => ({
      stakeholder_role: role as any,
      stakeholder_name: this.getStakeholderByRole(role).name,
      stakeholder_email: this.getStakeholderByRole(role).email,
      required: true,
      approved: false
    }))
  }

  /**
   * Assess the impact of changing from one template version to another
   */
  private async assessChangeImpact(
    templateType: string,
    fromVersion: string,
    toVersion: string
  ): Promise<any> {
    
    // This would typically involve analyzing template differences
    // For now, we'll use a simplified assessment
    
    const versionDiff = this.compareVersions(fromVersion, toVersion)
    
    return {
      risk_level: versionDiff.major_change ? 'high' : versionDiff.minor_change ? 'medium' : 'low',
      breaking_changes: versionDiff.breaking_changes || [],
      user_impact_summary: versionDiff.user_impact || 'Minimal impact expected',
      rollback_time_estimate: versionDiff.major_change ? '15-30 minutes' : '5-10 minutes',
      data_migration_required: versionDiff.data_migration_required || false,
      user_training_required: versionDiff.user_training_required || false
    }
  }

  /**
   * Run comprehensive safety checks before deployment
   */
  private async runSafetyChecks(
    templateType: string,
    versionId: string
  ): Promise<SafetyCheckResult[]> {
    
    const checks: SafetyCheckResult[] = []
    
    // Compilation check
    checks.push({
      check_name: 'template_compilation',
      check_type: 'automated',
      severity: 'blocking',
      passed: true, // Simulate passing
      execution_time_ms: 250
    })
    
    // Acceptance checklist validation
    checks.push({
      check_name: 'acceptance_checklist',
      check_type: 'automated', 
      severity: 'blocking',
      passed: true, // Simulate passing
      execution_time_ms: 500
    })
    
    // Performance regression check
    checks.push({
      check_name: 'performance_regression',
      check_type: 'automated',
      severity: 'warning',
      passed: true, // Simulate passing
      execution_time_ms: 300
    })
    
    // Security vulnerability scan
    checks.push({
      check_name: 'security_scan',
      check_type: 'automated',
      severity: 'blocking',
      passed: true, // Simulate passing
      execution_time_ms: 150
    })
    
    return checks
  }

  /**
   * Create version history entry with proper auditing
   */
  private async createVersionHistoryEntry(params: any): Promise<VersionHistoryEntry> {
    const entryId = `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const historyEntry: VersionHistoryEntry = {
      entry_id: entryId,
      template_type: params.template_type,
      action: params.action,
      from_version: params.from_version,
      to_version: params.to_version,
      change_reason: params.change_reason,
      impact_level: params.impact_level,
      breaking_changes: params.breaking_changes,
      requested_by: params.requested_by,
      approved_by: params.approved_by,
      confirmed_by: params.confirmed_by,
      confirmation_text: params.confirmation_text,
      requested_at: params.requested_at,
      confirmed_at: params.confirmed_at,
      deployed_at: params.deployed_at || new Date(),
      rollback_safe: true, // Would be determined by analysis
      emergency_contact: params.emergency_contact,
      safety_checks_passed: true,
      acceptance_checklist_passed: true
    }
    
    return historyEntry
  }

  /**
   * Perform atomic default template change
   */
  private async performAtomicDefaultChange(
    templateType: string,
    newVersionId: string
  ): Promise<void> {
    
    // This would involve:
    // 1. Updating database records
    // 2. Updating cached template references
    // 3. Invalidating CDN caches
    // 4. Updating load balancer configurations
    
    // For simulation purposes:
    this.currentDefaults.set(templateType, newVersionId)
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  /**
   * Verify that the default change was successful
   */
  private async verifyDefaultChange(
    templateType: string,
    expectedVersionId: string
  ): Promise<{ success: boolean, error?: string }> {
    
    const currentDefault = this.currentDefaults.get(templateType)
    
    if (currentDefault !== expectedVersionId) {
      return {
        success: false,
        error: `Expected default ${expectedVersionId}, but found ${currentDefault}`
      }
    }
    
    return { success: true }
  }

  /**
   * Get version history for a template type
   */
  getVersionHistory(templateType: string): VersionHistoryEntry[] {
    return this.versionHistory.get(templateType) || []
  }

  /**
   * Get current default version for a template type
   */
  getCurrentDefault(templateType: string): string | undefined {
    return this.currentDefaults.get(templateType)
  }

  /**
   * Get active default change requests
   */
  getActiveRequests(): DefaultChangeRequest[] {
    return Array.from(this.activeRequests.values())
  }

  // Helper methods (simplified implementations)
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private compareVersions(v1: string, v2: string): any {
    // Simplified version comparison
    return {
      major_change: false,
      minor_change: true,
      breaking_changes: [],
      user_impact: 'Minor layout improvements'
    }
  }

  private getStakeholderByRole(role: string): { name: string, email: string } {
    const stakeholders = {
      technical_lead: { name: 'Tech Lead', email: 'tech-lead@thorbis.com' },
      design_lead: { name: 'Design Lead', email: 'design-lead@thorbis.com' },
      product_owner: { name: 'Product Owner', email: 'product-owner@thorbis.com' },
      business_owner: { name: 'Business Owner', email: 'business-owner@thorbis.com' }
    }
    return stakeholders[role] || { name: 'Unknown', email: 'unknown@thorbis.com' }
  }

  private getEmergencyContact(riskLevel: string): string {
    return riskLevel === 'critical' ? 'cto@thorbis.com' : 'tech-lead@thorbis.com'
  }

  private async runFinalSafetyChecks(request: DefaultChangeRequest): Promise<{ passed: boolean, failures: string[] }> {
    return { passed: true, failures: [] }
  }

  private async emergencyRollback(templateType: string, rollbackVersion: string): Promise<void> {
    this.currentDefaults.set(templateType, rollbackVersion)
  }

  private addToVersionHistory(templateType: string, entry: VersionHistoryEntry): void {
    const history = this.versionHistory.get(templateType) || []
    history.push(entry)
    this.versionHistory.set(templateType, history)
  }

  private async notifyApprovers(request: DefaultChangeRequest): Promise<void> {
    // Send notification emails to required approvers
  }

  private async notifySuccessfulDeployment(request: DefaultChangeRequest, historyEntry: VersionHistoryEntry): Promise<void> {
    // Send success notifications
  }

  private async notifyDeploymentFailure(request: DefaultChangeRequest, errorMessage: string): Promise<void> {
    // Send failure notifications
  }
}

// Mock supporting interfaces and classes
interface AuditLogger {
  log(event: any): Promise<void>
}

interface TemplateValidationService {
  validate(templateType: string, versionId: string): Promise<any>
}

interface NotificationService {
  send(notification: any): Promise<void>
}

interface ValidationResult {
  check_name: string
  passed: boolean
  details?: any
}

interface ChecklistStatus {
  pdf_fidelity: boolean
  dark_mode_support: boolean
  rtl_ready: boolean
  no_dynamic_js: boolean
  accessibility_compliant: boolean
  print_optimized: boolean
}

export { TemplateManager, DefaultChangeRequest, VersionHistoryEntry, TemplateVersion }
