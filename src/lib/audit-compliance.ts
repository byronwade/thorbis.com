/**
 * Audit Logging and Compliance Tracking System
 * 
 * Provides comprehensive audit trails, compliance monitoring, and regulatory reporting
 */

import { NextRequest } from 'next/server'
import { executeQuery, executeTransaction } from './database'
import { createAuthContext } from './auth'
import crypto from 'crypto'

// Compliance frameworks supported
export enum ComplianceFramework {
  SOC2 = 'SOC2',
  HIPAA = 'HIPAA',
  GDPR = 'GDPR',
  PCI_DSS = 'PCI_DSS',
  SOX = 'SOX',
  ISO27001 = 'ISO27001',
  NIST = 'NIST'
}

// Event categories for audit logging
export enum AuditEventType {
  // Authentication & Access
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_LOGIN_FAILED = 'user.login_failed',
  PASSWORD_CHANGED = 'user.password_changed',
  PERMISSION_GRANTED = 'user.permission_granted',
  PERMISSION_REVOKED = 'user.permission_revoked',

  // Data Operations
  DATA_CREATED = 'data.created',
  DATA_UPDATED = 'data.updated', 
  DATA_DELETED = 'data.deleted',
  DATA_VIEWED = 'data.viewed',
  DATA_EXPORTED = 'data.exported',
  DATA_IMPORTED = 'data.imported',

  // Financial Operations
  PAYMENT_PROCESSED = 'payment.processed',
  INVOICE_GENERATED = 'invoice.generated',
  FINANCIAL_REPORT_ACCESSED = 'financial.report_accessed',
  TAX_CALCULATION = 'tax.calculation',

  // Security Events
  SECURITY_BREACH_DETECTED = 'security.breach_detected',
  SUSPICIOUS_ACTIVITY = 'security.suspicious_activity',
  DATA_BREACH_POTENTIAL = 'security.data_breach_potential',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'security.unauthorized_access_attempt',

  // System Events
  SYSTEM_BACKUP = 'system.backup',
  SYSTEM_RESTORE = 'system.restore',
  CONFIGURATION_CHANGED = 'system.configuration_changed',
  MAINTENANCE_STARTED = 'system.maintenance_started',
  MAINTENANCE_COMPLETED = 'system.maintenance_completed',

  // Compliance Events
  COMPLIANCE_VIOLATION = 'compliance.violation',
  AUDIT_REQUESTED = 'compliance.audit_requested',
  RETENTION_POLICY_APPLIED = 'compliance.retention_policy_applied',
  DATA_ANONYMIZED = 'compliance.data_anonymized'
}

// Risk levels for events
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Audit event interface
export interface AuditEvent {
  id: string
  businessId: string
  userId?: string
  sessionId?: string
  eventType: AuditEventType
  entityType: string
  entityId: string
  description: string
  ipAddress?: string
  userAgent?: string
  location?: {
    country?: string
    region?: string
    city?: string
  }
  metadata: unknown
  riskLevel: RiskLevel
  complianceFrameworks: ComplianceFramework[]
  beforeState?: any
  afterState?: any
  timestamp: Date
  retentionUntil?: Date
}

// Compliance violation interface  
export interface ComplianceViolation {
  id: string
  businessId: string
  framework: ComplianceFramework
  violationType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedEntities: string[]
  detectionMethod: 'automated' | 'manual' | 'reported'
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  assignedTo?: string
  dueDate?: Date
  resolution?: string
  createdAt: Date
  resolvedAt?: Date
}

// Data retention policies
interface RetentionPolicy {
  entityType: string
  retentionPeriodDays: number
  complianceRequirement?: ComplianceFramework
  autoDeleteEnabled: boolean
  encryptionRequired: boolean
}

const DEFAULT_RETENTION_POLICIES: RetentionPolicy[] = [
  // Financial data (SOX, tax compliance)
  { entityType: 'invoice', retentionPeriodDays: 2557, complianceRequirement: ComplianceFramework.SOX, autoDeleteEnabled: false, encryptionRequired: true }, // 7 years
  { entityType: 'payment', retentionPeriodDays: 2557, complianceRequirement: ComplianceFramework.SOX, autoDeleteEnabled: false, encryptionRequired: true },
  { entityType: 'tax_document', retentionPeriodDays: 2557, complianceRequirement: ComplianceFramework.SOX, autoDeleteEnabled: false, encryptionRequired: true },

  // Personal data (GDPR)
  { entityType: 'customer_personal', retentionPeriodDays: 1095, complianceRequirement: ComplianceFramework.GDPR, autoDeleteEnabled: true, encryptionRequired: true }, // 3 years
  { entityType: 'employee_personal', retentionPeriodDays: 2192, complianceRequirement: ComplianceFramework.GDPR, autoDeleteEnabled: false, encryptionRequired: true }, // 6 years

  // Health data (HIPAA)
  { entityType: 'medical_record', retentionPeriodDays: 2192, complianceRequirement: ComplianceFramework.HIPAA, autoDeleteEnabled: false, encryptionRequired: true },

  // Payment data (PCI DSS)
  { entityType: 'payment_card', retentionPeriodDays: 365, complianceRequirement: ComplianceFramework.PCI_DSS, autoDeleteEnabled: true, encryptionRequired: true }, // 1 year

  // Security logs
  { entityType: 'security_log', retentionPeriodDays: 1095, complianceRequirement: ComplianceFramework.SOC2, autoDeleteEnabled: true, encryptionRequired: true }, // 3 years
  { entityType: 'audit_log', retentionPeriodDays: 2557, complianceRequirement: ComplianceFramework.SOC2, autoDeleteEnabled: false, encryptionRequired: true }, // 7 years

  // General business data
  { entityType: 'general', retentionPeriodDays: 1095, autoDeleteEnabled: false, encryptionRequired: false } // 3 years default
]

class AuditComplianceService {
  /**
   * Log audit event
   */
  async logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'retentionUntil'>): Promise<string> {
    try {
      const auditId = crypto.randomUUID()
      const timestamp = new Date()

      // Calculate retention period based on entity type and compliance requirements
      const retentionPolicy = this.getRetentionPolicy(event.entityType, event.complianceFrameworks)
      const retentionUntil = new Date(timestamp.getTime() + (retentionPolicy.retentionPeriodDays * 24 * 60 * 60 * 1000))

      // Store audit event
      await executeTransaction(event.businessId, async (client) => {
        await client.query('
          INSERT INTO shared.audit_logs (
            id, business_id, user_id, session_id, event_type, entity_type, entity_id,
            description, ip_address, user_agent, location, metadata, risk_level,
            compliance_frameworks, before_state, after_state, timestamp, retention_until, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW()
          )
        ', [
          auditId,
          event.businessId,
          event.userId || null,
          event.sessionId || null,
          event.eventType,
          event.entityType,
          event.entityId,
          event.description,
          event.ipAddress || null,
          event.userAgent || null,
          event.location ? JSON.stringify(event.location) : null,
          JSON.stringify(event.metadata),
          event.riskLevel,
          event.complianceFrameworks,
          event.beforeState ? JSON.stringify(event.beforeState) : null,
          event.afterState ? JSON.stringify(event.afterState) : null,
          timestamp,
          retentionUntil
        ])

        // Check for compliance violations
        await this.checkComplianceViolations(event, client)

        // Update audit statistics
        await this.updateAuditStatistics(event.businessId, event.eventType, event.riskLevel, client)
      })

      // Trigger real-time alerts for high-risk events
      if (event.riskLevel === RiskLevel.HIGH || event.riskLevel === RiskLevel.CRITICAL) {
        await this.triggerSecurityAlert(event, auditId)
      }

      return auditId

    } catch (error) {
      console.error('Error logging audit event:', error)
      throw error
    }
  }

  /**
   * Create audit log from HTTP request context
   */
  async logFromRequest(
    request: NextRequest,
    eventType: AuditEventType,
    entityType: string,
    entityId: string,
    description: string,
    metadata: unknown = {},
    riskLevel: RiskLevel = RiskLevel.LOW,
    complianceFrameworks: ComplianceFramework[] = []
  ): Promise<string> {
    try {
      const auth = await createAuthContext(request)
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                       request.headers.get('x-real-ip') || 
                       request.ip || 'unknown'
      const userAgent = request.headers.get('user-agent') || undefined

      return await this.logAuditEvent({
        businessId: auth.businessId,
        userId: auth.userId,
        sessionId: auth.sessionId,
        eventType,
        entityType,
        entityId,
        description,
        ipAddress,
        userAgent,
        metadata,
        riskLevel,
        complianceFrameworks
      })

    } catch (error) {
      console.error('Error creating audit log from request:', error)
      throw error
    }
  }

  /**
   * Report compliance violation
   */
  async reportComplianceViolation(violation: Omit<ComplianceViolation, 'id' | 'createdAt'>): Promise<string> {
    try {
      const violationId = crypto.randomUUID()

      await executeQuery(violation.businessId, '
        INSERT INTO shared.compliance_violations (
          id, business_id, framework, violation_type, severity, description,
          affected_entities, detection_method, status, assigned_to, due_date, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
        )
      ', [
        violationId,
        violation.businessId,
        violation.framework,
        violation.violationType,
        violation.severity,
        violation.description,
        violation.affectedEntities,
        violation.detectionMethod,
        violation.status,
        violation.assignedTo || null,
        violation.dueDate || null
      ])

      // Create audit log for the compliance violation
      await this.logAuditEvent({
        businessId: violation.businessId,
        eventType: AuditEventType.COMPLIANCE_VIOLATION,
        entityType: 'compliance_violation',
        entityId: violationId,
        description: 'Compliance violation reported: ${violation.description}',
        metadata: {
          framework: violation.framework,
          severity: violation.severity,
          affectedEntities: violation.affectedEntities
        },
        riskLevel: violation.severity === 'critical' ? RiskLevel.CRITICAL : 
                  violation.severity === 'high' ? RiskLevel.HIGH : RiskLevel.MEDIUM,
        complianceFrameworks: [violation.framework]
      })

      return violationId

    } catch (error) {
      console.error('Error reporting compliance violation:', error)
      throw error
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    businessId: string,
    framework: ComplianceFramework,
    startDate: Date,
    endDate: Date
  ): Promise<unknown> {
    try {
      // Get audit events for the framework and time period
      const auditEvents = await executeQuery(businessId, '
        SELECT 
          event_type,
          risk_level,
          DATE_TRUNC('day', timestamp) as event_date,
          COUNT(*) as event_count
        FROM shared.audit_logs
        WHERE business_id = $1
        AND $2 = ANY(compliance_frameworks)
        AND timestamp BETWEEN $3 AND $4
        GROUP BY event_type, risk_level, DATE_TRUNC('day`, timestamp)
        ORDER BY event_date DESC
      ', [businessId, framework, startDate, endDate])

      // Get compliance violations for the period
      const violations = await executeQuery(businessId, '
        SELECT *
        FROM shared.compliance_violations
        WHERE business_id = $1
        AND framework = $2
        AND created_at BETWEEN $3 AND $4
        ORDER BY severity DESC, created_at DESC
      ', [businessId, framework, startDate, endDate])

      // Get data retention compliance
      const retentionCompliance = await this.checkDataRetentionCompliance(businessId, framework)

      // Calculate metrics
      const totalEvents = auditEvents.reduce((sum, event) => sum + parseInt(event.event_count), 0)
      const highRiskEvents = auditEvents
        .filter(event => event.risk_level === 'high' || event.risk_level === 'critical')
        .reduce((sum, event) => sum + parseInt(event.event_count), 0)

      const openViolations = violations.filter(v => v.status === 'open' || v.status === 'investigating')
      const criticalViolations = violations.filter(v => v.severity === 'critical')

      return {
        framework,
        reportPeriod: { startDate, endDate },
        summary: {
          totalAuditEvents: totalEvents,
          highRiskEvents: highRiskEvents,
          riskScore: totalEvents > 0 ? Math.round((highRiskEvents / totalEvents) * 100) : 0,
          totalViolations: violations.length,
          openViolations: openViolations.length,
          criticalViolations: criticalViolations.length,
          complianceStatus: criticalViolations.length === 0 && openViolations.length < 5 ? 'compliant' : 'non_compliant'
        },
        eventBreakdown: auditEvents,
        violations: violations.map(v => ({
          id: v.id,
          type: v.violation_type,
          severity: v.severity,
          description: v.description,
          status: v.status,
          createdAt: v.created_at,
          dueDate: v.due_date
        })),
        retentionCompliance,
        recommendations: this.generateComplianceRecommendations(framework, violations, retentionCompliance),
        generatedAt: new Date().toISOString()
      }

    } catch (error) {
      console.error('Error generating compliance report:', error)
      throw error
    }
  }

  /**
   * Check data retention compliance
   */
  private async checkDataRetentionCompliance(businessId: string, framework: ComplianceFramework): Promise<unknown> {
    try {
      // Get data that should be retained according to policies
      const retentionChecks = await executeQuery(businessId, '
        SELECT 
          entity_type,
          COUNT(*) as total_records,
          COUNT(CASE WHEN retention_until < NOW() THEN 1 END) as overdue_for_deletion,
          COUNT(CASE WHEN retention_until > NOW() + INTERVAL '30 days' THEN 1 END) as properly_retained
        FROM shared.audit_logs
        WHERE business_id = $1
        AND $2 = ANY(compliance_frameworks)
        GROUP BY entity_type
      ', [businessId, framework])

      return {
        framework,
        entityTypes: retentionChecks.map(check => ({
          entityType: check.entity_type,
          totalRecords: parseInt(check.total_records),
          overdueForDeletion: parseInt(check.overdue_for_deletion),
          properlyRetained: parseInt(check.properly_retained),
          complianceRate: Math.round((parseInt(check.properly_retained) / parseInt(check.total_records)) * 100)
        })),
        overallComplianceRate: retentionChecks.length > 0 ? 
          Math.round(
            (retentionChecks.reduce((sum, check) => sum + parseInt(check.properly_retained), 0) /
             retentionChecks.reduce((sum, check) => sum + parseInt(check.total_records), 0)) * 100
          ) : 100
      }

    } catch (error) {
      console.error('Error checking data retention compliance:`, error)
      return { framework, entityTypes: [], overallComplianceRate: 0 }
    }
  }

  /**
   * Apply data retention policies (cleanup expired data)
   */
  async applyDataRetentionPolicies(businessId: string): Promise<{ deletedRecords: number, errors: string[] }> {
    try {
      let deletedRecords = 0
      const errors: string[] = []

      await executeTransaction(businessId, async (client) => {
        // Get expired audit logs that can be auto-deleted
        const expiredLogs = await client.query(`
          SELECT id, entity_type
          FROM shared.audit_logs
          WHERE business_id = $1
          AND retention_until < NOW()
          AND entity_type IN (
            SELECT entity_type FROM jsonb_to_recordset($2) AS x(entity_type text, auto_delete_enabled boolean)
            WHERE auto_delete_enabled = true
          )
          LIMIT 10000
        ', [businessId, JSON.stringify(DEFAULT_RETENTION_POLICIES.filter(p => p.autoDeleteEnabled))])

        if (expiredLogs.rows.length > 0) {
          // Archive logs before deletion (for compliance purposes)
          await this.archiveAuditLogs(businessId, expiredLogs.rows.map(log => log.id), client)

          // Delete expired logs
          const deleteResult = await client.query('
            DELETE FROM shared.audit_logs
            WHERE id = ANY($1)
          ', [expiredLogs.rows.map(log => log.id)])

          deletedRecords = deleteResult.rowCount || 0

          // Log the retention policy application
          await this.logAuditEvent({
            businessId,
            eventType: AuditEventType.RETENTION_POLICY_APPLIED,
            entityType: 'audit_log',
            entityId: crypto.randomUUID(),
            description: 'Data retention policy applied: deleted ${deletedRecords} expired audit logs',
            metadata: {
              deletedRecords,
              entityTypes: [...new Set(expiredLogs.rows.map(log => log.entity_type))]
            },
            riskLevel: RiskLevel.LOW,
            complianceFrameworks: [ComplianceFramework.SOC2]
          })
        }
      })

      return { deletedRecords, errors }

    } catch (error) {
      console.error('Error applying data retention policies:', error)
      return { deletedRecords: 0, errors: [error.message] }
    }
  }

  /**
   * Get retention policy for entity type and compliance frameworks
   */
  private getRetentionPolicy(entityType: string, frameworks: ComplianceFramework[]): RetentionPolicy {
    // Find most restrictive policy for the entity type and frameworks
    const matchingPolicies = DEFAULT_RETENTION_POLICIES.filter(policy => 
      policy.entityType === entityType || 
      (policy.entityType === 'general' && !DEFAULT_RETENTION_POLICIES.find(p => p.entityType === entityType))
    )

    if (frameworks.length > 0) {
      const frameworkSpecificPolicies = matchingPolicies.filter(policy => 
        frameworks.includes(policy.complianceRequirement!)
      )
      
      if (frameworkSpecificPolicies.length > 0) {
        // Return policy with longest retention period
        return frameworkSpecificPolicies.reduce((longest, current) => 
          current.retentionPeriodDays > longest.retentionPeriodDays ? current : longest
        )
      }
    }

    // Return default policy
    return matchingPolicies[0] || DEFAULT_RETENTION_POLICIES.find(p => p.entityType === 'general')!
  }

  /**
   * Check for compliance violations based on audit event
   */
  private async checkComplianceViolations(event: Omit<AuditEvent, 'id' | 'timestamp'>, client: unknown) {
    // GDPR: Check for potential personal data violations
    if (event.complianceFrameworks.includes(ComplianceFramework.GDPR)) {
      if (event.eventType === AuditEventType.DATA_EXPORTED && 
          event.entityType.includes('personal') && 
          !event.metadata?.dataSubjectConsent) {
        // Potential GDPR violation: exporting personal data without consent
        // This would trigger a compliance violation report
      }
    }

    // PCI DSS: Check for payment data violations
    if (event.complianceFrameworks.includes(ComplianceFramework.PCI_DSS)) {
      if (event.entityType.includes('payment') && event.riskLevel !== RiskLevel.HIGH) {
        // All payment operations should be high-risk events
      }
    }

    // SOX: Check for financial data violations
    if (event.complianceFrameworks.includes(ComplianceFramework.SOX)) {
      if (event.entityType.includes('financial') && !event.userId) {
        // Financial operations must have user attribution
      }
    }
  }

  /**
   * Update audit statistics
   */
  private async updateAuditStatistics(
    businessId: string, 
    eventType: AuditEventType, 
    riskLevel: RiskLevel, client: unknown) {
    await client.query('
      INSERT INTO shared.audit_statistics (
        business_id, event_date, event_type, risk_level, event_count, created_at
      ) VALUES (
        $1, CURRENT_DATE, $2, $3, 1, NOW()
      )
      ON CONFLICT (business_id, event_date, event_type, risk_level)
      DO UPDATE SET 
        event_count = shared.audit_statistics.event_count + 1,
        updated_at = NOW()
    ', [businessId, eventType, riskLevel])
  }

  /**
   * Trigger security alert for high-risk events
   */
  private async triggerSecurityAlert(event: Omit<AuditEvent, 'id' | 'timestamp`>, auditId: string) {
    // Implementation would integrate with alerting systems (email, Slack, PagerDuty, etc.)
    console.log(`🚨 HIGH-RISK SECURITY EVENT: ${event.eventType} - ${event.description}`)
  }

  /**
   * Archive audit logs before deletion
   */
  private async archiveAuditLogs(businessId: string, logIds: string[], client: unknown) {
    // Move logs to archive table for long-term storage
    await client.query(`
      INSERT INTO shared.audit_logs_archive 
      SELECT *, NOW() as archived_at
      FROM shared.audit_logs
      WHERE id = ANY($1)
    ', [logIds])
  }

  /**
   * Generate compliance recommendations
   */
  private generateComplianceRecommendations(
    framework: ComplianceFramework,
    violations: unknown[], retentionCompliance: unknown): string[] {
    const recommendations: string[] = []

    if (violations.length > 0) {
      recommendations.push('Address ${violations.length} compliance violations immediately')
    }

    if (retentionCompliance.overallComplianceRate < 90) {
      recommendations.push('Improve data retention policy compliance')
    }

    switch (framework) {
      case ComplianceFramework.GDPR:
        recommendations.push('Ensure all personal data processing has proper consent documentation')
        recommendations.push('Implement data subject access request automation')
        break
      case ComplianceFramework.SOX:
        recommendations.push('Strengthen financial data access controls')
        recommendations.push('Implement segregation of duties for financial operations')
        break
      case ComplianceFramework.PCI_DSS:
        recommendations.push('Encrypt all payment card data at rest and in transit')
        recommendations.push('Regularly scan for payment data vulnerabilities')
        break
    }

    return recommendations
  }
}

// Global audit compliance service instance
export const auditComplianceService = new AuditComplianceService()

// Utility functions for common audit operations
export async function logDataChange(
  businessId: string,
  userId: string,
  entityType: string,
  entityId: string,
  operation: 'create' | 'update' | 'delete',
  beforeState?: any,
  afterState?: any,
  complianceFrameworks: ComplianceFramework[] = []
): Promise<string> {
  const eventType = operation === 'create' ? AuditEventType.DATA_CREATED :
                   operation === 'update' ? AuditEventType.DATA_UPDATED :
                   AuditEventType.DATA_DELETED

  return await auditComplianceService.logAuditEvent({
    businessId,
    userId,
    eventType,
    entityType,
    entityId,
    description: '${operation} ${entityType} ${entityId}',
    metadata: { operation },
    beforeState,
    afterState,
    riskLevel: operation === 'delete' ? RiskLevel.MEDIUM : RiskLevel.LOW,
    complianceFrameworks
  })
}

export async function logSecurityEvent(
  businessId: string,
  eventType: AuditEventType,
  description: string,
  metadata: unknown = {},
  riskLevel: RiskLevel = RiskLevel.HIGH
): Promise<string> {
  return await auditComplianceService.logAuditEvent({
    businessId,
    eventType,
    entityType: 'security_event',
    entityId: crypto.randomUUID(),
    description,
    metadata,
    riskLevel,
    complianceFrameworks: [ComplianceFramework.SOC2, ComplianceFramework.ISO27001]
  })
}

// Export everything
// Types and enums are already exported above