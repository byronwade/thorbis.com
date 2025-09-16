/**
 * Thorbis Business OS - Audit System Types
 * 
 * Comprehensive audit logging for all tool calls, data changes,
 * and AI interactions with diffs, idempotency, and context tracking.
 */

export interface AuditEntry {
  id: string
  business_id: string
  user_id?: string
  session_id?: string
  
  // Action details
  action: string
  table_name?: string
  entity_id?: string
  tool_name?: string
  
  // Context
  source: 'ui' | 'api' | 'tool' | 'webhook' | 'cron'
  ip_address?: string
  user_agent?: string
  
  // Data changes
  before_data?: any
  after_data?: any
  diff?: any
  
  // Tool-specific data
  tool_input?: any
  tool_output?: any
  tool_duration_ms?: number
  tool_tokens_used?: number
  
  // Request/Response
  request_id?: string
  idempotency_key?: string
  parent_audit_id?: string // For nested operations
  
  // Status and metadata
  status: 'success' | 'error' | 'warning'
  error_code?: string
  error_message?: string
  warnings?: string[]
  
  // Timestamps
  created_at: string
  completed_at?: string
}

export interface AuditContext {
  business_id: string
  user_id?: string
  session_id?: string
  source: 'ui' | 'api' | 'tool' | 'webhook' | 'cron'
  ip_address?: string
  user_agent?: string
  request_id?: string
  idempotency_key?: string
  parent_audit_id?: string
}

export interface ToolAuditData {
  tool_name: string
  input: any
  output?: any
  duration_ms?: number
  tokens_used?: number
  status: 'running' | 'success' | 'error' | 'warning'
  error?: {
    code: string
    message: string
    stack?: string
  }
  warnings?: string[]
}

export interface DataChangeAuditData {
  table_name: string
  entity_id: string
  action: 'create' | 'update' | 'delete' | 'restore'
  before: any
  after: any
  diff: any
}

export interface AuditQuery {
  business_id?: string
  user_id?: string
  session_id?: string
  action?: string
  tool_name?: string
  table_name?: string
  entity_id?: string
  source?: string
  status?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
  order_by?: string
  order_direction?: 'asc' | 'desc'
}

export interface AuditStats {
  total_entries: number
  success_rate: number
  error_rate: number
  warning_rate: number
  top_actions: Array<{ action: string; count: number }>
  top_tools: Array<{ tool: string; count: number }>
  avg_duration_ms: number
  total_tokens_used: number
  date_range: {
    from: string
    to: string
  }
}

export interface AuditAlert {
  id: string
  business_id: string
  rule_name: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  details: any
  triggered_at: string
  resolved_at?: string
  resolved_by?: string
  notifications_sent: string[]
}

export interface AuditRule {
  id: string
  name: string
  description: string
  enabled: boolean
  conditions: {
    error_rate_threshold?: number // percentage
    duration_threshold_ms?: number
    token_threshold?: number
    suspicious_patterns?: string[]
    required_fields?: string[]
  }
  actions: {
    create_alert: boolean
    send_notification: boolean
    auto_disable_feature?: boolean
    escalate_after_minutes?: number
  }
  notification_channels: string[] // email addresses, webhook URLs, etc.
}
