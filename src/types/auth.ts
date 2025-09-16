export interface User {
  id: string
  email: string
  name: string
  badge_number?: string
  department: string
  role: UserRole
  permissions: Permission[]
  active: boolean
  mfa_enabled: boolean
  last_login?: string
  created_at: string
  updated_at: string
  profile: UserProfile
  preferences: UserPreferences
}

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'supervisor'
  | 'detective'
  | 'analyst'
  | 'evidence_custodian'
  | 'forensic_tech'
  | 'district_attorney'
  | 'defense_attorney'
  | 'court_clerk'
  | 'auditor'
  | 'viewer'

export interface UserProfile {
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
  bio?: string
  specializations: string[]
  certifications: string[]
  security_clearance?: 'none' | 'confidential' | 'secret' | 'top_secret'
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system'
  notifications: {
    email: boolean
    in_app: boolean
    mobile: boolean
    case_updates: boolean
    evidence_alerts: boolean
    deadlines: boolean
    system_alerts: boolean
  }
  dashboard: {
    layout: 'grid' | 'list'
    widgets: string[]
    refresh_interval: number
  }
  accessibility: {
    high_contrast: boolean
    large_text: boolean
    screen_reader: boolean
    keyboard_navigation: boolean
  }
}

export type Permission = 
  // Cases
  | 'cases:read'
  | 'cases:write'
  | 'cases:create'
  | 'cases:delete'
  | 'cases:assign'
  | 'cases:close'
  | 'cases:archive'
  
  // Evidence
  | 'evidence:read'
  | 'evidence:write'
  | 'evidence:upload'
  | 'evidence:delete'
  | 'evidence:download'
  | 'evidence:transfer'
  | 'evidence:dispose'
  | 'evidence:chain_of_custody'
  
  // Reports
  | 'reports:read'
  | 'reports:write'
  | 'reports:create'
  | 'reports:delete'
  | 'reports:approve'
  | 'reports:disclose'
  | 'reports:export'
  
  // People
  | 'people:read'
  | 'people:write'
  | 'people:create'
  | 'people:delete'
  | 'people:merge'
  
  // AI Analysis
  | 'ai:read'
  | 'ai:analyze'
  | 'ai:configure'
  | 'ai:audit'
  
  // OSINT
  | 'osint:read'
  | 'osint:search'
  | 'osint:capture'
  | 'osint:configure'
  
  // System
  | 'system:admin'
  | 'system:audit'
  | 'system:configure'
  | 'system:backup'
  | 'system:restore'
  | 'system:monitor'
  
  // Users
  | 'users:read'
  | 'users:write'
  | 'users:create'
  | 'users:delete'
  | 'users:assign_roles'
  | 'users:manage_permissions'
  
  // Compliance
  | 'compliance:read'
  | 'compliance:audit'
  | 'compliance:configure'
  | 'compliance:export'

export interface RoleDefinition {
  role: UserRole
  name: string
  description: string
  permissions: Permission[]
  inherits_from?: UserRole[]
  restrictions?: {
    case_access_level?: 'own' | 'department' | 'all'
    evidence_download_limit?: number
    report_approval_required?: boolean
    ai_analysis_approval_required?: boolean
  }
}

export interface AuthSession {
  user: User
  access_token: string
  refresh_token: string
  expires_at: string
  session_id: string
  ip_address: string
  user_agent: string
  mfa_verified: boolean
  created_at: string
  last_activity: string
}

export interface LoginCredentials {
  email: string
  password: string
  mfa_code?: string
  remember_me?: boolean
}

export interface MFASetup {
  user_id: string
  method: 'totp' | 'sms' | 'email'
  secret?: string
  qr_code?: string
  backup_codes: string[]
  verified: boolean
}

export interface AuditEvent {
  id: string
  user_id: string
  session_id: string
  action: string
  resource_type: string
  resource_id?: string
  ip_address: string
  user_agent: string
  success: boolean
  error_message?: string
  metadata?: Record<string, unknown>
  timestamp: string
}

export interface SecurityPolicy {
  id: string
  name: string
  description: string
  enabled: boolean
  rules: SecurityRule[]
  created_at: string
  updated_at: string
}

export interface SecurityRule {
  type: 'password' | 'session' | 'access' | 'mfa' | 'audit'
  condition: Record<string, unknown>
  action: 'allow' | 'deny' | 'warn' | 'require_approval'
  message?: string
}

export interface AccessRequest {
  id: string
  user_id: string
  resource_type: string
  resource_id: string
  requested_permissions: Permission[]
  justification: string
  status: 'pending' | 'approved' | 'denied' | 'expired'
  requested_at: string
  reviewed_at?: string
  reviewed_by?: string
  expires_at?: string
}

export interface Department {
  id: string
  name: string
  description: string
  parent_id?: string
  head_user_id?: string
  permissions: Permission[]
  case_access_rules: {
    can_access_other_departments: boolean
    requires_approval_for_sensitive: boolean
    auto_assign_new_cases: boolean
  }
  active: boolean
  created_at: string
  updated_at: string
}