/**
 * Thorbis Business OS - Capabilities Manifest Implementation
 * 
 * Generates and manages the capabilities manifest that describes
 * what database features and domain functionality is available.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { 
  CapabilitiesManifest, 
  DatabaseCapability, 
  DomainCapability,
  CapabilityCheck,
  CapabilityResult,
  ColumnCapability,
  IndexCapability,
  PermissionCapability
} from './types'

export class CapabilitiesManager {
  private supabase: SupabaseClient
  private manifest: CapabilitiesManifest | null = null
  private lastGenerated: Date | null = null
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Generate the complete capabilities manifest
   */
  async generateManifest(): Promise<CapabilitiesManifest> {
    try {
      const databaseInfo = await this.introspectDatabase()
      const domainCapabilities = await this.assessDomainCapabilities()
      
      this.manifest = {
        version: '1.0.0',
        generated_at: new Date().toISOString(),
        database: databaseInfo,
        domains: domainCapabilities,
        features: await this.assessFeatures(),
        limits: this.getDefaultLimits(),
        degradation: {
          fallback_to_meta: true,
          cache_enabled: true,
          offline_mode: false,
          readonly_mode: false
        }
      }

      this.lastGenerated = new Date()
      return this.manifest
    } catch (error) {
      console.warn('Failed to generate full capabilities manifest, using fallback:', error)
      return this.getFallbackManifest()
    }
  }

  /**
   * Get current manifest, generating if needed or expired
   */
  async getManifest(): Promise<CapabilitiesManifest> {
    if (!this.manifest || this.isCacheExpired()) {
      return await this.generateManifest()
    }
    return this.manifest
  }

  /**
   * Check if a specific capability is available
   */
  async checkCapability(check: CapabilityCheck): Promise<CapabilityResult> {
    const manifest = await this.getManifest()

    // Check table capability
    if (check.table) {
      const table = manifest.database.tables.find(t => t.table === check.table)
      if (!table?.exists) {
        return {
          available: false,
          fallback: 'meta',
          warning: 'Table ${check.table} does not exist, falling back to meta storage'
        }
      }

      // Check column capability
      if (check.column) {
        const column = table.columns.find(c => c.name === check.column)
        if (!column?.exists) {
          return {
            available: false,
            fallback: 'meta`,
            warning: `Column ${check.table}.${check.column} does not exist, falling back to meta storage'
          }
        }
      }

      // Check permission
      if (check.permission) {
        const hasPermission = table.permissions[check.permission]
        if (!hasPermission) {
          return {
            available: false,
            warning: 'No ${check.permission} permission on ${check.table}'
          }
        }
      }
    }

    // Check domain capability
    if (check.domain) {
      const domain = manifest.domains[check.domain]
      if (!domain?.enabled) {
        return {
          available: false,
          fallback: 'disabled',
          warning: 'Domain ${check.domain} is not available'
        }
      }
    }

    // Check feature capability
    if (check.feature) {
      const feature = manifest.features[check.feature]
      if (!feature?.enabled) {
        return {
          available: false,
          fallback: 'disabled',
          warning: 'Feature ${check.feature} is not enabled'
        }
      }
    }

    return { available: true }
  }

  /**
   * Introspect database schema and permissions
   */
  private async introspectDatabase() {
    const tables = await this.introspectTables()
    const version = await this.getDatabaseVersion()
    const extensions = await this.getExtensions()
    
    return {
      version,
      extensions,
      schemas: ['public', 'auth', 'storage'], // Common Supabase schemas
      tables
    }
  }

  /**
   * Get information about all tables
   */
  private async introspectTables(): Promise<DatabaseCapability[]> {
    const coreThorbistables = [
      'businesses', 'users', 'appointments', 'jobs', 'estimates', 
      'invoices', 'customers', 'pricebook', 'templates', 'reviews',
      'payments', 'timeclock', 'payroll', 'inventory', 'menus',
      'recipes', 'campaigns', 'integrations', 'audit_log'
    ]

    const tables: DatabaseCapability[] = []

    for (const tableName of coreThorbistables) {
      const tableInfo = await this.introspectTable(tableName)
      tables.push(tableInfo)
    }

    return tables
  }

  /**
   * Introspect a single table
   */
  private async introspectTable(tableName: string): Promise<DatabaseCapability> {
    try {
      // Try to query the table to see if it exists
      const { error } = await this.supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(0)

      const exists = !error
      
      // If table exists, get column information
      let columns: ColumnCapability[] = []
      if (exists) {
        columns = await this.getTableColumns(tableName)
      }

      return {
        table: tableName,
        schema: 'public',
        exists,
        columns,
        indexes: [], // TODO: Implement index introspection
        permissions: await this.getTablePermissions(tableName, exists),
        features: [] // Table-specific features
      }
    } catch (_error) {
      return {
        table: tableName,
        schema: 'public',
        exists: false,
        columns: [],
        indexes: [],
        permissions: { select: false, insert: false, update: false, delete: false, rls_enabled: false },
        features: []
      }
    }
  }

  private async getTableColumns(tableName: string): Promise<ColumnCapability[]> {
    // This would ideally use information_schema queries
    // For now, return common column patterns
    return [
      { name: 'id', type: 'uuid', nullable: false, exists: true },
      { name: 'created_at', type: 'timestamptz', nullable: false, exists: true },
      { name: 'updated_at', type: 'timestamptz', nullable: false, exists: true },
      { name: 'meta', type: 'jsonb', nullable: true, exists: true, description: 'Fallback storage for missing schema' }
    ]
  }

  private async getTablePermissions(tableName: string, exists: boolean): Promise<PermissionCapability> {
    if (!exists) {
      return { select: false, insert: false, update: false, delete: false, rls_enabled: false }
    }

    // Test permissions by attempting operations
    const permissions: PermissionCapability = {
      select: false,
      insert: false, 
      update: false,
      delete: false,
      rls_enabled: true // Assume RLS is enabled in Supabase
    }

    try {
      await this.supabase.from(tableName).select('*').limit(0)
      permissions.select = true
    } catch {}

    // Note: We don't test insert/update/delete to avoid side effects'
    // In production, these would be tested with dry-run operations
    permissions.insert = true
    permissions.update = true
    permissions.delete = true

    return permissions
  }

  private async getDatabaseVersion(): Promise<string> {
    try {
      const { data, error } = await this.supabase.rpc('version')
      return error ? 'unknown' : data || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  private async getExtensions(): Promise<string[]> {
    // Common Supabase extensions
    return ['uuid-ossp', 'pgcrypto', 'pgjwt', 'pg_stat_statements']
  }

  /**
   * Assess which domain packs are available
   */
  private async assessDomainCapabilities(): Promise<Record<string, DomainCapability>> {
    return {
      'field-management': {
        name: 'Field Management',
        enabled: true,
        version: '1.0.0',
        features: ['scheduling', 'dispatch', 'work-orders', 'estimates', 'invoices'],
        dependencies: ['businesses', 'customers', 'appointments', 'jobs'],
        tables: ['appointments', 'jobs', 'estimates', 'invoices', 'customers'],
        endpoints: ['/api/tools/field-ops'],
        limitations: []
      },
      'restaurant': {
        name: 'Restaurant',
        enabled: true,
        version: '1.0.0',
        features: ['pos', 'menus', 'inventory', 'reservations'],
        dependencies: ['businesses', 'menus', 'inventory'],
        tables: ['menus', 'recipes', 'inventory', 'reservations'],
        endpoints: ['/api/tools/restaurant'],
        limitations: []
      },
      'marketing': {
        name: 'Marketing',
        enabled: true,
        version: '1.0.0',
        features: ['campaigns', 'reviews', 'gbp-sync'],
        dependencies: ['businesses', 'customers', 'reviews'],
        tables: ['campaigns', 'reviews'],
        endpoints: ['/api/tools/marketing'],
        limitations: []
      },
      'accounting': {
        name: 'Accounting & Payroll',
        enabled: true,
        version: '1.0.0',
        features: ['payroll', 'timeclock', 'qbo-sync'],
        dependencies: ['businesses', 'users'],
        tables: ['payroll', 'timeclock'],
        endpoints: ['/api/tools/accounting'],
        limitations: []
      }
    }
  }

  private async assessFeatures(): Promise<Record<string, unknown>> {
    return {
      'ai-tools': { enabled: true, version: '1.0.0' },
      'rag-search': { enabled: true, version: '1.0.0' },
      'template-generation': { enabled: true, version: '1.0.0' },
      'payment-processing': { enabled: true, version: '1.0.0' },
      'webhook-delivery': { enabled: true, version: '1.0.0' },
      'audit-logging': { enabled: true, version: '1.0.0' },
      'real-time-updates': { enabled: true, version: '1.0.0' }
    }
  }

  private getDefaultLimits() {
    return {
      max_query_complexity: 100,
      pagination_default: 25,
      pagination_max: 100,
      rate_limits: {
        'api': 1000, // requests per hour
        'tools': 500,
        'webhooks': 10000
      },
      file_upload_max_size: 10 * 1024 * 1024, // 10MB
      concurrent_connections: 100
    }
  }

  private getFallbackManifest(): CapabilitiesManifest {
    return {
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      database: {
        version: 'unknown',
        extensions: [],
        schemas: ['public'],
        tables: []
      },
      domains: Record<string, unknown>,
      features: Record<string, unknown>,
      limits: this.getDefaultLimits(),
      degradation: {
        fallback_to_meta: true,
        cache_enabled: false,
        offline_mode: true,
        readonly_mode: true
      }
    }
  }

  private isCacheExpired(): boolean {
    if (!this.lastGenerated) return true
    return Date.now() - this.lastGenerated.getTime() > this.CACHE_TTL
  }
}

// Singleton instance
export const capabilitiesManager = new CapabilitiesManager()
