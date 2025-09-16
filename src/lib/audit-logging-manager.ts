// Enterprise-grade audit logging and compliance monitoring system
// Provides comprehensive audit trails, compliance monitoring, and regulatory reporting

import { EventEmitter } from 'events';

export interface AuditEvent {
  id: string;
  organizationId: string;
  userId: string;
  sessionId: string;
  eventType: AuditEventType;
  action: string;
  resource: AuditResource;
  metadata: AuditMetadata;
  outcome: 'success' | 'failure' | 'partial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location: GeolocationData;
  compliance: ComplianceData;
  context: AuditContext;
  risk: RiskAssessment;
  retention: RetentionPolicy;
  encrypted: boolean;
  signature: string; // Digital signature for integrity
}

export type AuditEventType = 
  | 'authentication' | 'authorization' | 'data_access' | 'data_modification'
  | 'configuration_change' | 'user_management' | 'system_access'
  | 'payment_transaction' | 'financial_operation' | 'regulatory_action'
  | 'security_event' | 'privacy_event' | 'compliance_check'
  | 'backup_operation' | 'system_maintenance' | 'api_access'
  | 'document_access' | 'signature_capture' | 'work_order_operation'
  | 'customer_interaction' | 'inventory_movement' | 'reporting_access';

export interface AuditResource {
  type: string; // e.g., 'user', 'customer', 'work_order', 'payment', 'document'
  id: string;
  name?: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  dataElements: DataElement[];
  parentResource?: {
    type: string;
    id: string;
  };
}

export interface DataElement {
  field: string;
  type: 'pii' | 'pci' | 'phi' | 'financial' | 'business' | 'technical';
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  previousValue?: any;
  newValue?: any;
  masked: boolean;
}

export interface AuditMetadata {
  application: string;
  module: string;
  function: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  requestId: string;
  correlationId: string;
  transactionId?: string;
  businessProcess?: string;
  workflowStep?: string;
}

export interface GeolocationData {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timezone: string;
}

export interface ComplianceData {
  frameworks: ComplianceFramework[];
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
  assessments: ComplianceAssessment[];
  certifications: string[];
  auditTrail: boolean;
  dataRetention: number; // days
  anonymization: AnonymizationRule[];
}

export interface ComplianceFramework {
  name: string; // e.g., 'SOX', 'GDPR', 'HIPAA', 'PCI-DSS', 'ISO27001'
  version: string;
  applicable: boolean;
  lastAssessment: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
}

export interface ComplianceRequirement {
  framework: string;
  section: string;
  requirement: string;
  mandatory: boolean;
  evidence: string[];
  lastVerified: string;
  status: 'met' | 'not_met' | 'partial' | 'not_applicable';
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective' | 'compensating';
  automated: boolean;
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  lastExecuted: string;
  effectiveness: 'effective' | 'partially_effective' | 'ineffective' | 'not_tested';
}

export interface ComplianceAssessment {
  id: string;
  framework: string;
  assessor: string;
  startDate: string;
  endDate: string;
  scope: string[];
  findings: AssessmentFinding[];
  recommendations: string[];
  overallRating: 'compliant' | 'materially_compliant' | 'non_compliant';
}

export interface AssessmentFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requirement: string;
  remediation: string;
  dueDate: string;
  responsible: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
}

export interface AnonymizationRule {
  field: string;
  method: 'mask' | 'hash' | 'encrypt' | 'tokenize' | 'remove';
  trigger: 'immediate' | 'retention_expiry' | 'user_request';
  reversible: boolean;
}

export interface AuditContext {
  businessJustification: string;
  approvals: Approval[];
  emergency: boolean;
  automated: boolean;
  delegation: DelegationInfo;
  previousEvents: string[]; // Related audit event IDs
}

export interface Approval {
  approver: string;
  approverRole: string;
  timestamp: string;
  method: 'manual' | 'automated' | 'delegated';
  justification: string;
}

export interface DelegationInfo {
  delegator: string;
  delegatee: string;
  scope: string[];
  startDate: string;
  endDate: string;
  reason: string;
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  impact: ImpactAssessment;
  likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  mitigation: string[];
  residualRisk: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskFactor {
  type: 'technical' | 'operational' | 'compliance' | 'reputational' | 'financial';
  description: string;
  weight: number; // 1-10
  mitigation?: string;
}

export interface ImpactAssessment {
  financial: 'low' | 'medium' | 'high' | 'critical';
  operational: 'low' | 'medium' | 'high' | 'critical';
  reputational: 'low' | 'medium' | 'high' | 'critical';
  regulatory: 'low' | 'medium' | 'high' | 'critical';
  customer: 'low' | 'medium' | 'high' | 'critical';
}

export interface RetentionPolicy {
  category: string;
  period: number; // days
  extendedRetention: boolean;
  extendedPeriod?: number; // days
  archiveLocation: string;
  destructionMethod: string;
  legalHold: boolean;
  reviewDate: string;
}

export interface AuditReport {
  id: string;
  title: string;
  type: 'compliance' | 'security' | 'operational' | 'financial' | 'regulatory';
  framework?: string;
  period: {
    start: string;
    end: string;
  };
  scope: string[];
  criteria: ReportCriteria;
  metrics: AuditMetrics;
  findings: ReportFinding[];
  recommendations: string[];
  conclusion: string;
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'under_review' | 'approved' | 'published';
  confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface ReportCriteria {
  eventTypes: AuditEventType[];
  severity: ('low' | 'medium' | 'high' | 'critical')[];
  outcomes: ('success' | 'failure' | 'partial')[];
  users: string[];
  resources: string[];
  timeRange: {
    start: string;
    end: string;
  };
  includeMetadata: boolean;
  anonymize: boolean;
}

export interface AuditMetrics {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsBySeverity: Record<string, number>;
  eventsByOutcome: Record<string, number>;
  uniqueUsers: number;
  uniqueResources: number;
  complianceScore: number; // 0-100
  riskScore: number; // 0-100
  trendsAnalysis: TrendAnalysis[];
  anomalies: AnomalyDetection[];
}

export interface TrendAnalysis {
  metric: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  changePercent: number;
  significance: 'low' | 'medium' | 'high';
}

export interface AnomalyDetection {
  type: 'volume' | 'pattern' | 'user_behavior' | 'system_behavior';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  recommendations: string[];
  relatedEvents: string[];
}

export interface ReportFinding {
  id: string;
  category: 'compliance_gap' | 'security_issue' | 'operational_concern' | 'data_quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string[];
  impact: string;
  recommendation: string;
  responsible: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted';
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: AlertCondition[];
  actions: AlertAction[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number; // minutes between checks
  suppressionRules: SuppressionRule[];
  escalation: EscalationRule[];
  lastTriggered?: string;
  triggerCount: number;
}

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: any;
  timeWindow?: number; // minutes
  threshold?: number;
  aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max';
}

export interface AlertAction {
  type: 'email' | 'sms' | 'webhook' | 'ticket' | 'notification';
  target: string;
  template: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  retries: number;
}

export interface SuppressionRule {
  condition: string;
  duration: number; // minutes
  reason: string;
}

export interface EscalationRule {
  level: number;
  delay: number; // minutes
  actions: AlertAction[];
  condition?: string;
}

export class AuditLoggingManager extends EventEmitter {
  private static instance: AuditLoggingManager | null = null;
  private dbName = 'audit_logging';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private encryptionKey: string;
  private alertRules: Map<string, AlertRule> = new Map();
  private batchBuffer: AuditEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly batchSize = 50;
  private readonly batchInterval = 30000; // 30 seconds

  private constructor() {
    super();
    this.encryptionKey = this.generateEncryptionKey();
    this.initializeDatabase();
    this.setupDefaultAlertRules();
    this.startBatchProcessor();
  }

  static getInstance(): AuditLoggingManager {
    if (!AuditLoggingManager.instance) {
      AuditLoggingManager.instance = new AuditLoggingManager();
    }
    return AuditLoggingManager.instance;
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open audit database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Audit events store
        if (!db.objectStoreNames.contains('audit_events')) {
          const eventsStore = db.createObjectStore('audit_events', { keyPath: 'id' });
          eventsStore.createIndex('organizationId', 'organizationId', { unique: false });
          eventsStore.createIndex('userId', 'userId', { unique: false });
          eventsStore.createIndex('eventType', 'eventType', { unique: false });
          eventsStore.createIndex('severity', 'severity', { unique: false });
          eventsStore.createIndex('outcome', 'outcome', { unique: false });
          eventsStore.createIndex('timestamp', 'timestamp', { unique: false });
          eventsStore.createIndex('resource_type', 'resource.type', { unique: false });
          eventsStore.createIndex('compliance_framework', 'compliance.frameworks', { unique: false, multiEntry: true });
        }

        // Compliance assessments store
        if (!db.objectStoreNames.contains('compliance_assessments')) {
          const assessmentsStore = db.createObjectStore('compliance_assessments', { keyPath: 'id' });
          assessmentsStore.createIndex('framework', 'framework', { unique: false });
          assessmentsStore.createIndex('assessor', 'assessor', { unique: false });
          assessmentsStore.createIndex('overallRating', 'overallRating', { unique: false });
          assessmentsStore.createIndex('endDate', 'endDate', { unique: false });
        }

        // Audit reports store
        if (!db.objectStoreNames.contains('audit_reports')) {
          const reportsStore = db.createObjectStore('audit_reports', { keyPath: 'id' });
          reportsStore.createIndex('type', 'type', { unique: false });
          reportsStore.createIndex('framework', 'framework', { unique: false });
          reportsStore.createIndex('status', 'status', { unique: false });
          reportsStore.createIndex('createdAt', 'createdAt', { unique: false });
          reportsStore.createIndex('confidentiality', 'confidentiality', { unique: false });
        }

        // Alert rules store
        if (!db.objectStoreNames.contains('alert_rules')) {
          const rulesStore = db.createObjectStore('alert_rules', { keyPath: 'id' });
          rulesStore.createIndex('enabled', 'enabled', { unique: false });
          rulesStore.createIndex('severity', 'severity', { unique: false });
        }

        // Risk assessments store
        if (!db.objectStoreNames.contains('risk_assessments')) {
          const riskStore = db.createObjectStore('risk_assessments', { keyPath: 'id' });
          riskStore.createIndex('level', 'level', { unique: false });
          riskStore.createIndex('residualRisk', 'residualRisk', { unique: false });
        }

        // Retention policies store
        if (!db.objectStoreNames.contains('retention_policies')) {
          const retentionStore = db.createObjectStore('retention_policies', { keyPath: 'category' });
          retentionStore.createIndex('period', 'period', { unique: false });
        }
      };
    });
  }

  private generateEncryptionKey(): string {
    // In production, this would use proper key management
    return crypto.getRandomValues(new Uint8Array(32)).join(');
  }

  // Audit event logging

  async logEvent(eventData: Omit<AuditEvent, 'id' | 'timestamp' | 'signature' | 'encrypted'>): Promise<string> {
    try {
      const eventId = 'audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
      
      const auditEvent: AuditEvent = {
        ...eventData,
        id: eventId,
        timestamp: new Date().toISOString(),
        encrypted: this.shouldEncrypt(eventData),
        signature: await this.generateSignature(eventData)
      };

      // Add to batch buffer
      this.batchBuffer.push(auditEvent);

      // Process immediately for critical events
      if (auditEvent.severity === 'critical') {
        await this.processBatch();
      }

      // Check alert rules
      await this.checkAlertRules(auditEvent);

      this.emit('audit_event_logged', { eventId, eventType: auditEvent.eventType });

      return eventId;
    } catch (error) {
      console.error('Failed to log audit event:', error);
      throw new Error('Audit logging failed');
    }
  }

  private shouldEncrypt(eventData: Omit<AuditEvent, 'id' | 'timestamp' | 'signature' | 'encrypted'>): boolean {
    // Encrypt if contains sensitive data
    const sensitiveDataTypes = ['pii', 'pci', 'phi', 'financial'];
    return eventData.resource.dataElements.some(element => 
      sensitiveDataTypes.includes(element.type)
    );
  }

  private async generateSignature(eventData: unknown): Promise<string> {
    // Generate digital signature for integrity verification
    const dataString = JSON.stringify(eventData);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString + this.encryptionKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join(');
  }

  private async processBatch(): Promise<void> {
    if (this.batchBuffer.length === 0) return;

    const eventsToProcess = [...this.batchBuffer];
    this.batchBuffer = [];

    try {
      await this.storeAuditEvents(eventsToProcess);
      this.emit('batch_processed', { count: eventsToProcess.length });
    } catch (error) {
      console.error('Failed to process audit batch:', error);
      // Re-add events to buffer for retry
      this.batchBuffer.unshift(...eventsToProcess);
    }
  }

  private startBatchProcessor(): void {
    this.batchTimer = setInterval(async () => {
      if (this.batchBuffer.length >= this.batchSize) {
        await this.processBatch();
      }
    }, this.batchInterval);
  }

  private async storeAuditEvents(events: AuditEvent[]): Promise<void> {
    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit_events'], 'readwrite');
      const store = transaction.objectStore('audit_events');

      const completed = 0;
      const total = events.length;

      events.forEach(event => {
        const request = store.put(event);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };
        request.onerror = () => {
          reject(new Error('Failed to store audit event'));
        };
      });
    });
  }

  // Alert management

  private setupDefaultAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'failed_auth_attempts',
        name: 'Failed Authentication Attempts',
        description: 'Alert on multiple failed authentication attempts',
        enabled: true,
        conditions: [{
          field: 'eventType',
          operator: 'equals',
          value: 'authentication',
          timeWindow: 15,
          threshold: 5,
          aggregation: 'count'
        }, {
          field: 'outcome',
          operator: 'equals',
          value: 'failure'
        }],
        actions: [{
          type: 'email',
          target: 'security@company.com',
          template: 'security_alert',
          priority: 'high',
          retries: 3
        }],
        severity: 'high',
        frequency: 5,
        suppressionRules: [],
        escalation: [],
        triggerCount: 0
      },
      {
        id: 'privileged_access',
        name: 'Privileged Access Usage',
        description: 'Monitor privileged user actions',
        enabled: true,
        conditions: [{
          field: 'metadata.function',
          operator: 'contains',
          value: 'admin'
        }],
        actions: [{
          type: 'notification',
          target: 'compliance_team',
          template: 'privileged_access',
          priority: 'medium',
          retries: 2
        }],
        severity: 'medium',
        frequency: 1,
        suppressionRules: [],
        escalation: [],
        triggerCount: 0
      },
      {
        id: 'data_modification',
        name: 'Sensitive Data Modification',
        description: 'Alert on modification of sensitive data',
        enabled: true,
        conditions: [{
          field: 'eventType',
          operator: 'equals',
          value: 'data_modification'
        }, {
          field: 'resource.classification',
          operator: 'equals',
          value: 'restricted'
        }],
        actions: [{
          type: 'email',
          target: 'dpo@company.com',
          template: 'data_modification',
          priority: 'high',
          retries: 3
        }],
        severity: 'high',
        frequency: 1,
        suppressionRules: [],
        escalation: [{
          level: 1,
          delay: 30,
          actions: [{
            type: 'sms',
            target: '+1234567890',
            template: 'urgent_data_alert',
            priority: 'urgent',
            retries: 2
          }]
        }],
        triggerCount: 0
      }
    ];

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }

  private async checkAlertRules(event: AuditEvent): Promise<void> {
    for (const [ruleId, rule] of this.alertRules) {
      if (!rule.enabled) continue;

      try {
        const shouldTrigger = await this.evaluateAlertConditions(rule, event);
        if (shouldTrigger) {
          await this.triggerAlert(rule, event);
        }
      } catch (error) {
        console.error('Failed to evaluate alert rule ${ruleId}:', error);
      }
    }
  }

  private async evaluateAlertConditions(rule: AlertRule, event: AuditEvent): Promise<boolean> {
    for (const condition of rule.conditions) {
      const fieldValue = this.getNestedProperty(event, condition.field);
      
      if (!this.evaluateCondition(fieldValue, condition)) {
        return false;
      }

      // Time-based aggregation check
      if (condition.timeWindow && condition.threshold && condition.aggregation) {
        const count = await this.getEventCount(condition, condition.timeWindow);
        if (count < condition.threshold) {
          return false;
        }
      }
    }

    return true;
  }

  private evaluateCondition(value: unknown, condition: AlertCondition): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'regex':
        return new RegExp(String(condition.value)).test(String(value));
      default:
        return false;
    }
  }

  private getNestedProperty(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async getEventCount(condition: AlertCondition, timeWindow: number): Promise<number> {
    // Get events matching condition within time window
    const events = await this.queryEvents({
      eventTypes: [],
      severity: [],
      outcomes: [],
      users: [],
      resources: [],
      timeRange: {
        start: new Date(Date.now() - timeWindow * 60000).toISOString(),
        end: new Date().toISOString()
      },
      includeMetadata: false,
      anonymize: false
    });

    return events.filter(event => {
      const fieldValue = this.getNestedProperty(event, condition.field);
      return this.evaluateCondition(fieldValue, condition);
    }).length;
  }

  private async triggerAlert(rule: AlertRule, event: AuditEvent): Promise<void> {
    try {
      // Execute alert actions
      for (const action of rule.actions) {
        await this.executeAlertAction(action, rule, event);
      }

      // Update rule trigger count
      rule.triggerCount++;
      rule.lastTriggered = new Date().toISOString();

      this.emit('alert_triggered`, { ruleId: rule.id, eventId: event.id });
    } catch (error) {
      console.error(`Failed to trigger alert for rule ${rule.id}:', error);
    }
  }

  private async executeAlertAction(action: AlertAction, rule: AlertRule, event: AuditEvent): Promise<void> {
    // Mock implementation - would integrate with actual notification systems
    console.log('Executing ${action.type} alert:', {
      rule: rule.name,
      target: action.target,
      priority: action.priority,
      event: event.id
    });

    this.emit('alert_action_executed', {
      action: action.type,
      target: action.target,
      ruleId: rule.id,
      eventId: event.id
    });
  }

  // Compliance management

  async performComplianceAssessment(assessment: Omit<ComplianceAssessment, 'id'>): Promise<string> {
    try {
      const assessmentId = 'assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
      
      const complianceAssessment: ComplianceAssessment = {
        ...assessment,
        id: assessmentId
      };

      await this.storeComplianceAssessment(complianceAssessment);

      this.emit('compliance_assessment_completed', { assessmentId });

      return assessmentId;
    } catch (error) {
      console.error('Failed to perform compliance assessment:', error);
      throw new Error('Compliance assessment failed');
    }
  }

  private async storeComplianceAssessment(assessment: ComplianceAssessment): Promise<void> {
    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['compliance_assessments'], 'readwrite');
      const store = transaction.objectStore('compliance_assessments');
      const request = store.put(assessment);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store compliance assessment`));
    });
  }

  async generateComplianceReport(criteria: ReportCriteria): Promise<string> {
    try {
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
      
      // Query events based on criteria
      const events = await this.queryEvents(criteria);
      
      // Generate metrics
      const metrics = this.calculateAuditMetrics(events);
      
      // Identify findings
      const findings = await this.identifyComplianceFindings(events, criteria);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(findings, metrics);

      const report: AuditReport = {
        id: reportId,
        title: 'Compliance Report - ${criteria.timeRange.start} to ${criteria.timeRange.end}',
        type: 'compliance',
        framework: criteria.eventTypes.includes('compliance_check') ? 'Multiple' : undefined,
        period: criteria.timeRange,
        scope: criteria.resources,
        criteria,
        metrics,
        findings,
        recommendations,
        conclusion: this.generateConclusion(metrics, findings),
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        status: 'draft',
        confidentiality: 'confidential'
      };

      await this.storeAuditReport(report);

      this.emit('compliance_report_generated', { reportId });

      return reportId;
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw new Error('Compliance report generation failed');
    }
  }

  private async queryEvents(criteria: ReportCriteria): Promise<AuditEvent[]> {
    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit_events'], 'readonly');
      const store = transaction.objectStore('audit_events');
      const request = store.getAll();

      request.onsuccess = () => {
        const allEvents = request.result;
        const filteredEvents = allEvents.filter(event => {
          // Apply filters
          if (criteria.eventTypes.length > 0 && !criteria.eventTypes.includes(event.eventType)) {
            return false;
          }
          
          if (criteria.severity.length > 0 && !criteria.severity.includes(event.severity)) {
            return false;
          }
          
          if (criteria.outcomes.length > 0 && !criteria.outcomes.includes(event.outcome)) {
            return false;
          }
          
          if (criteria.users.length > 0 && !criteria.users.includes(event.userId)) {
            return false;
          }
          
          if (criteria.resources.length > 0 && !criteria.resources.includes(event.resource.type)) {
            return false;
          }
          
          // Time range filter
          const eventTime = new Date(event.timestamp);
          const startTime = new Date(criteria.timeRange.start);
          const endTime = new Date(criteria.timeRange.end);
          
          if (eventTime < startTime || eventTime > endTime) {
            return false;
          }
          
          return true;
        });

        resolve(filteredEvents);
      };

      request.onerror = () => reject(new Error('Failed to query audit events'));
    });
  }

  private calculateAuditMetrics(events: AuditEvent[]): AuditMetrics {
    const eventsByType = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<AuditEventType, number>);

    const eventsBySeverity = events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByOutcome = events.reduce((acc, event) => {
      acc[event.outcome] = (acc[event.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueUsers = new Set(events.map(e => e.userId)).size;
    const uniqueResources = new Set(events.map(e => e.resource.id)).size;

    // Calculate compliance score (simplified)
    const successfulEvents = events.filter(e => e.outcome === 'success').length;
    const complianceScore = events.length > 0 ? (successfulEvents / events.length) * 100 : 100;

    // Calculate risk score (simplified)
    const criticalEvents = events.filter(e => e.severity === 'critical').length;
    const highEvents = events.filter(e => e.severity === 'high').length;
    const riskScore = Math.min(100, (criticalEvents * 10 + highEvents * 5) / Math.max(events.length, 1) * 100);

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      eventsByOutcome,
      uniqueUsers,
      uniqueResources,
      complianceScore: Math.round(complianceScore),
      riskScore: Math.round(riskScore),
      trendsAnalysis: [], // Would implement trend analysis
      anomalies: [] // Would implement anomaly detection
    };
  }

  private async identifyComplianceFindings(events: AuditEvent[], criteria: ReportCriteria): Promise<ReportFinding[]> {
    const findings: ReportFinding[] = [];

    // Check for high-risk events
    const criticalEvents = events.filter(e => e.severity === 'critical');
    if (criticalEvents.length > 0) {
      findings.push({
        id: 'finding_critical_${Date.now()}',
        category: 'security_issue',
        severity: 'high',
        title: 'Critical Security Events Detected',
        description: '${criticalEvents.length} critical security events were identified during the reporting period.',
        evidence: criticalEvents.map(e => e.id),
        impact: 'High risk to organizational security and compliance posture',
        recommendation: 'Immediate investigation and remediation of critical security events required',
        responsible: 'Security Team',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open'
      });
    }

    // Check for failed authentication patterns
    const failedAuth = events.filter(e => e.eventType === 'authentication' && e.outcome === 'failure');
    if (failedAuth.length > 10) {
      findings.push({
        id: 'finding_auth_${Date.now()}',
        category: 'security_issue',
        severity: 'medium',
        title: 'Elevated Authentication Failures',
        description: '${failedAuth.length} failed authentication attempts detected.',
        evidence: failedAuth.slice(0, 10).map(e => e.id),
        impact: 'Potential security threat from brute force or credential compromise',
        recommendation: 'Review authentication logs and implement additional security measures',
        responsible: 'IT Security',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open'
      });
    }

    return findings;
  }

  private generateRecommendations(findings: ReportFinding[], metrics: AuditMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.riskScore > 70) {
      recommendations.push('Implement enhanced security monitoring and alerting');
      recommendations.push('Conduct immediate security assessment and remediation');
    }

    if (metrics.complianceScore < 90) {
      recommendations.push('Review and strengthen compliance controls');
      recommendations.push('Provide additional compliance training to staff');
    }

    if (findings.some(f => f.severity === 'critical')) {
      recommendations.push('Establish incident response procedures for critical events');
      recommendations.push('Implement automated threat detection and response`);
    }

    return recommendations;
  }

  private generateConclusion(metrics: AuditMetrics, findings: ReportFinding[]): string {
    const conclusion = `During the reporting period, ${metrics.totalEvents} audit events were recorded. ';
    
    conclusion += 'The overall compliance score is ${metrics.complianceScore}% and risk score is ${metrics.riskScore}%. ';
    
    if (findings.length > 0) {
      const criticalFindings = findings.filter(f => f.severity === 'critical').length;
      const highFindings = findings.filter(f => f.severity === 'high').length;
      
      conclusion += '${findings.length} findings were identified, including ${criticalFindings} critical and ${highFindings} high severity issues. ';
      conclusion += 'Immediate attention and remediation is recommended for high-severity findings.';
    } else {
      conclusion += 'No significant compliance issues were identified during this period.';
    }

    return conclusion;
  }

  private async storeAuditReport(report: AuditReport): Promise<void> {
    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit_reports'], 'readwrite');
      const store = transaction.objectStore('audit_reports');
      const request = store.put(report);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store audit report'));
    });
  }

  // Data retrieval and management

  async getAuditEvents(organizationId: string, filters?: {
    eventType?: AuditEventType;
    severity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditEvent[]> {
    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit_events'], 'readonly');
      const store = transaction.objectStore('audit_events');
      const index = store.index('organizationId');
      const request = index.getAll(organizationId);

      request.onsuccess = () => {
        let events = request.result;

        // Apply filters
        if (filters?.eventType) {
          events = events.filter(e => e.eventType === filters.eventType);
        }
        
        if (filters?.severity) {
          events = events.filter(e => e.severity === filters.severity);
        }
        
        if (filters?.startDate) {
          events = events.filter(e => e.timestamp >= filters.startDate!);
        }
        
        if (filters?.endDate) {
          events = events.filter(e => e.timestamp <= filters.endDate!);
        }

        // Sort by timestamp (newest first)
        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Apply limit
        if (filters?.limit) {
          events = events.slice(0, filters.limit);
        }

        resolve(events);
      };

      request.onerror = () => reject(new Error('Failed to get audit events'));
    });
  }

  async getComplianceAssessments(framework?: string): Promise<ComplianceAssessment[]> {
    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['compliance_assessments'], 'readonly');
      const store = transaction.objectStore('compliance_assessments');
      
      let request: IDBRequest;
      if (framework) {
        const index = store.index('framework');
        request = index.getAll(framework);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get compliance assessments'));
    });
  }

  async getAuditReports(type?: string): Promise<AuditReport[]> {
    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit_reports'], 'readonly');
      const store = transaction.objectStore('audit_reports');
      
      let request: IDBRequest;
      if (type) {
        const index = store.index('type');
        request = index.getAll(type);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const reports = request.result;
        reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(reports);
      };
      request.onerror = () => reject(new Error('Failed to get audit reports'));
    });
  }

  // Statistics and monitoring

  async getAuditStatistics(organizationId?: string): Promise<{
    totalEvents: number;
    eventsByType: Record<AuditEventType, number>;
    eventsBySeverity: Record<string, number>;
    recentCriticalEvents: number;
    complianceScore: number;
    riskScore: number;
    activeAlerts: number;
    pendingFindings: number;
  }> {
    const events = organizationId 
      ? await this.getAuditEvents(organizationId)
      : await this.getAllAuditEvents();

    const recentEvents = events.filter(e => 
      new Date(e.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    const recentCriticalEvents = recentEvents.filter(e => e.severity === 'critical').length;

    const eventsByType = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<AuditEventType, number>);

    const eventsBySeverity = events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate scores (simplified)
    const successfulEvents = events.filter(e => e.outcome === 'success').length;
    const complianceScore = events.length > 0 ? Math.round((successfulEvents / events.length) * 100) : 100;

    const criticalEvents = events.filter(e => e.severity === 'critical').length;
    const highEvents = events.filter(e => e.severity === 'high').length;
    const riskScore = Math.min(100, Math.round((criticalEvents * 10 + highEvents * 5) / Math.max(events.length, 1) * 100));

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      recentCriticalEvents,
      complianceScore,
      riskScore,
      activeAlerts: Array.from(this.alertRules.values()).filter(r => r.enabled).length,
      pendingFindings: 0 // Would get from findings database
    };
  }

  private async getAllAuditEvents(): Promise<AuditEvent[]> {
    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit_events'], 'readonly');
      const store = transaction.objectStore('audit_events');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get all audit events'));
    });
  }

  // Cleanup and maintenance

  async applyRetentionPolicies(): Promise<number> {
    try {
      const events = await this.getAllAuditEvents();
      const deletedCount = 0;

      for (const event of events) {
        const retentionPeriod = event.retention.period;
        const eventDate = new Date(event.timestamp);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);

        if (eventDate < cutoffDate && !event.retention.legalHold) {
          await this.deleteAuditEvent(event.id);
          deletedCount++;
        }
      }

      this.emit('retention_policy_applied', { deletedCount });
      return deletedCount;
    } catch (error) {
      console.error('Failed to apply retention policies:', error);
      throw new Error('Retention policy application failed');
    }
  }

  private async deleteAuditEvent(eventId: string): Promise<void> {
    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit_events'], 'readwrite');
      const store = transaction.objectStore('audit_events');
      const request = store.delete(eventId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete audit event'));
    });
  }

  // Cleanup

  public destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    
    // Process any remaining events
    if (this.batchBuffer.length > 0) {
      this.processBatch();
    }

    this.removeAllListeners();
  }
}

// React hook for audit logging
export function useAuditLogging() {
  const manager = AuditLoggingManager.getInstance();

  return {
    logEvent: manager.logEvent.bind(manager),
    performComplianceAssessment: manager.performComplianceAssessment.bind(manager),
    generateComplianceReport: manager.generateComplianceReport.bind(manager),
    getAuditEvents: manager.getAuditEvents.bind(manager),
    getComplianceAssessments: manager.getComplianceAssessments.bind(manager),
    getAuditReports: manager.getAuditReports.bind(manager),
    getAuditStatistics: manager.getAuditStatistics.bind(manager),
    applyRetentionPolicies: manager.applyRetentionPolicies.bind(manager),
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}

// Factory function
export function createAuditLoggingManager(): AuditLoggingManager {
  return AuditLoggingManager.getInstance();
}