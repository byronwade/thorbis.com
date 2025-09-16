/**
 * Thorbis Business OS - Capabilities Manifest Types
 * 
 * The capabilities manifest describes what database features are available
 * and provides graceful degradation when schema is incomplete.
 */

export interface DatabaseCapability {
  table: string
  schema: string
  exists: boolean
  columns: ColumnCapability[]
  indexes: IndexCapability[]
  permissions: PermissionCapability
  features: string[]
}

export interface ColumnCapability {
  name: string
  type: string
  nullable: boolean
  default_value?: any
  exists: boolean
  description?: string
}

export interface IndexCapability {
  name: string
  columns: string[]
  unique: boolean
  exists: boolean
}

export interface PermissionCapability {
  select: boolean
  insert: boolean
  update: boolean
  delete: boolean
  rls_enabled: boolean
}

export interface DomainCapability {
  name: string
  enabled: boolean
  version: string
  features: string[]
  dependencies: string[]
  tables: string[]
  endpoints: string[]
  limitations: string[]
}

export interface CapabilitiesManifest {
  version: string
  generated_at: string
  database: {
    version: string
    extensions: string[]
    schemas: string[]
    tables: DatabaseCapability[]
  }
  domains: {
    [key: string]: DomainCapability
  }
  features: {
    [key: string]: {
      enabled: boolean
      version?: string
      configuration?: Record<string, unknown>
      dependencies?: string[]
      limitations?: string[]
    }
  }
  limits: {
    max_query_complexity: number
    pagination_default: number
    pagination_max: number
    rate_limits: Record<string, number>
    file_upload_max_size: number
    concurrent_connections: number
  }
  degradation: {
    fallback_to_meta: boolean
    cache_enabled: boolean
    offline_mode: boolean
    readonly_mode: boolean
  }
}

export interface CapabilityCheck {
  table?: string
  column?: string
  feature?: string
  domain?: string
  permission?: 'select' | 'insert' | 'update' | 'delete'
}

export interface CapabilityResult {
  available: boolean
  fallback?: 'meta' | 'computed' | 'disabled'
  warning?: string
  limitation?: string
}
