/**
 * API Versioning and Backward Compatibility System
 * 
 * Provides comprehensive API versioning, deprecation management, and backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// API Version configuration
export interface ApiVersion {
  version: string
  releaseDate: string
  deprecationDate?: string
  sunsetDate?: string'
  status: 'stable' | 'deprecated' | 'sunset' | 'beta' | 'alpha'
  breaking: boolean
  changeLog: string[]
  migration?: {
    from: string
    guide: string
    automaticTransform?: boolean
  }
}

// Supported API versions - simplified to single stable version
export const API_VERSIONS: Record<string, ApiVersion> = {
  'v1': {'
    version: 'v1','
    releaseDate: '2025-01-01','
    status: 'stable','
    breaking: false,
    changeLog: [
      'Complete API release with all business functionality','
      'Full CRUD operations for all business entities across industries','
      'Comprehensive authentication and authorization','
      'Multi-tenant architecture with industry separation','
      'Real-time features and webhook support','
      'Advanced search and filtering system','
      'GraphQL API layer alongside REST','
      'Comprehensive analytics and reporting engine','
      'Advanced workflow automation system','
      'Multi-layer caching with Redis support','
      'Audit logging and compliance tracking'
    ]
  }
}

// Version detection strategies
export enum VersionStrategy {
  HEADER = 'header', // X-API-Version header'
  URL_PATH = 'path', // /api/v1/...'
  QUERY_PARAM = 'query', // ?version=v1'
  ACCEPT_HEADER = 'accept', // Accept: application/vnd.thorbis.v1+json'
  SUBDOMAIN = 'subdomain' // v1.api.thorbis.com'
}

// Request transformation types
interface RequestTransformation {
  fromVersion: string
  toVersion: string
  transformRequest: (request: unknown) => Promise<unknown>
  transformResponse: (response: unknown) => Promise<unknown>
  deprecationWarnings: string[]
}

// Deprecation warning levels
export enum DeprecationLevel {
  INFO = 'info','
  WARNING = 'warning','
  ERROR = 'error'
}

interface DeprecationWarning {
  level: DeprecationLevel
  message: string
  field?: string
  suggestion?: string
  sunsetDate?: string
  migrationGuide?: string
}

class ApiVersionManager {
  private transformations = new Map<string, RequestTransformation>()
  private deprecationWarnings = new Map<string, DeprecationWarning[]>()

  constructor() {
    this.registerTransformations()
    this.setupDeprecationWarnings()
  }

  /**
   * Detect API version from request - simplified to always return v1
   */
  detectVersion(request: NextRequest, strategy: VersionStrategy = VersionStrategy.URL_PATH): string {
    // Always return v1 since we only have one stable version
    return 'v1'
  }

  /**
   * Validate if version is supported
   */
  isVersionSupported(version: string): boolean {
    const versionInfo = API_VERSIONS[version]
    return versionInfo && versionInfo.status !== 'sunset'
  }

  /**
   * Get version information
   */
  getVersionInfo(version: string): ApiVersion | null {
    return API_VERSIONS[version] || null
  }

  /**
   * Check if version is deprecated
   */
  isVersionDeprecated(version: string): boolean {
    const versionInfo = API_VERSIONS[version]
    return versionInfo ? versionInfo.status === 'deprecated' : false'
  }

  /**
   * Get deprecation warnings for a version and endpoint
   */
  getDeprecationWarnings(version: string, endpoint: string): DeprecationWarning[] {
    const versionWarnings = this.deprecationWarnings.get(version) || []
    const endpointWarnings = this.deprecationWarnings.get(`${version}:${endpoint}`) || []
    
    return [...versionWarnings, ...endpointWarnings]
  }

  /**
   * Transform request from one version to another
   */
  async transformRequest(fromVersion: string, toVersion: string, requestData: unknown): Promise<unknown> {
    const transformKey = `${fromVersion}->${toVersion}'
    const transformation = this.transformations.get(transformKey)

    if (!transformation) {
      return requestData // No transformation needed
    }

    return await transformation.transformRequest(requestData)
  }

  /**
   * Transform response from one version to another
   */
  async transformResponse(fromVersion: string, toVersion: string, responseData: unknown): Promise<unknown> {
    const transformKey = '${fromVersion}->${toVersion}'
    const transformation = this.transformations.get(transformKey)

    if (!transformation) {
      return responseData // No transformation needed
    }

    return await transformation.transformResponse(responseData)
  }

  /**
   * Create versioned response with appropriate headers
   */
  createVersionedResponse(data: unknown,
    version: string,
    request: NextRequest,
    status: number = 200
  ): NextResponse {
    const response = NextResponse.json(data, { status })
    
    // Add version headers
    response.headers.set('X-API-Version', version)'
    response.headers.set('X-API-Supported-Versions', Object.keys(API_VERSIONS).join(', '))'`'
    // Add deprecation warnings
    const warnings = this.getDeprecationWarnings(version, this.getEndpointPath(request))
    if (warnings.length > 0) {
      const warningHeader = warnings
        .map(w => '${w.level}: ${w.message}')
        .join('; ')'
      
      response.headers.set('X-API-Deprecation-Warning', warningHeader)'

      // Add sunset header if applicable
      const sunsetWarning = warnings.find(w => w.sunsetDate)
      if (sunsetWarning?.sunsetDate) {
        response.headers.set('Sunset', sunsetWarning.sunsetDate)'
      }
    }

    // Add version-specific headers
    const versionInfo = API_VERSIONS[version]
    if (versionInfo) {
      if (versionInfo.status === 'deprecated') {'
        response.headers.set('X-API-Status', 'deprecated')'
      }
      
      if (versionInfo.migration) {
        response.headers.set('X-API-Migration-Guide', versionInfo.migration.guide)'
      }
    }

    return response
  }

  /**
   * Register transformation rules - simplified since we only have v1
   */
  private registerTransformations(): void {
    // No transformations needed with single version
  }

  /**
   * Setup deprecation warnings
   */
  private setupDeprecationWarnings(): void {
    // Global v1 deprecation warnings (when v2 becomes stable)
    this.deprecationWarnings.set('v1', ['
      {
        level: DeprecationLevel.INFO,
        message: 'API v1 is stable and fully supported','
        suggestion: 'Consider upgrading to v2 for enhanced performance features'
      }
    ])

    // Endpoint-specific warnings
    this.deprecationWarnings.set('v1:/api/v1/legacy-endpoint', ['
      {
        level: DeprecationLevel.WARNING,
        message: 'This endpoint will be removed in v2','
        sunsetDate: '2025-12-31','
        migrationGuide: 'https://docs.thorbis.com/api/migration/legacy-endpoint'
      }
    ])
  }

  /**
   * Extract endpoint path from request
   */
  private getEndpointPath(request: NextRequest): string {
    return new URL(request.url).pathname
  }
}

// Global version manager instance
export const versionManager = new ApiVersionManager()

/**
 * Middleware factory for API versioning
 */
export function withVersioning(supportedVersions: string[] = ['v1']) {'
  return async function versioningMiddleware(
    request: NextRequest,
    handler: (request: NextRequest, version: string) => Promise<NextResponse>
  ): Promise<NextResponse> {
    
    // Detect requested version
    const requestedVersion = versionManager.detectVersion(request)
    
    // Validate version support
    if (!versionManager.isVersionSupported(requestedVersion)) {
      return NextResponse.json({'
        error: 'Unsupported API version','
        requestedVersion,
        supportedVersions: Object.keys(API_VERSIONS).filter(v => 
          API_VERSIONS[v].status !== 'sunset'`
        ),
        message: 'API version ${requestedVersion} is not supported or has been sunset'
      }, { status: 400 })
    }

    // Check if version is in supported list for this endpoint
    if (!supportedVersions.includes(requestedVersion)) {
      return NextResponse.json({
        error: 'Version not supported for this endpoint','`'
        requestedVersion,
        endpointSupportedVersions: supportedVersions,
        message: 'This endpoint supports versions: ${supportedVersions.join(', ')}''`
      }, { status: 400 })
    }

    try {
      // Execute handler with version context
      const response = await handler(request, requestedVersion)
      
      // Transform response if needed (backward compatibility)
      const responseData = await response.json().catch(() => ({}))
      const transformedData = await versionManager.transformResponse(
        'v1', // Assuming handlers return v1 format'
        requestedVersion,
        responseData
      )

      // Create versioned response with proper headers
      return versionManager.createVersionedResponse(
        transformedData,
        requestedVersion,
        request,
        response.status
      )

    } catch (error) {
      console.error('Versioning middleware error:', error)
      
      return NextResponse.json({
        error: 'Internal server error in version handling','`'
        version: requestedVersion
      }, { status: 500 })
    }
  }
}

/**
 * Schema versioning helper
 */
export class SchemaVersioner {
  private schemas = new Map<string, Map<string, z.ZodSchema>>()

  /**
   * Register schema for a specific version
   */
  registerSchema(version: string, schemaName: string, schema: z.ZodSchema): void {
    if (!this.schemas.has(version)) {
      this.schemas.set(version, new Map())
    }
    this.schemas.get(version)!.set(schemaName, schema)
  }

  /**
   * Get schema for version
   */
  getSchema(version: string, schemaName: string): z.ZodSchema | null {
    const versionSchemas = this.schemas.get(version)
    return versionSchemas?.get(schemaName) || null
  }

  /**
   * Validate data against version-specific schema
   */
  validate<T>(version: string, schemaName: string, data: unknown): T {
    const schema = this.getSchema(version, schemaName)
    if (!schema) {
      throw new Error('Schema ${schemaName} not found for version ${version}')
    }
    return schema.parse(data)
  }
}

// Example schema versioning setup
export const schemaVersioner = new SchemaVersioner()

// v1 schemas
const CustomerSchemaV1 = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string()
  }).optional(),
  customerType: z.enum(['residential', 'commercial']).default('residential'),'
  tags: z.array(z.string()).default([]),
  notes: z.string().optional()
})

const WorkOrderSchemaV1 = z.object({
  customerId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  serviceType: z.string(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),'
  status: z.enum(['draft', 'scheduled', 'in_progress', 'completed', 'cancelled']).default('draft'),'
  scheduledDate: z.string().datetime().optional(),
  estimatedDuration: z.number().positive().optional(),
  items: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    quantity: z.number().positive(),
    rate: z.number().nonnegative(),
    total: z.number().nonnegative(),
    type: z.enum(['service', 'product', 'material'])'
  })).default([])
})

// Register v1 schemas
schemaVersioner.registerSchema('v1', 'Customer', CustomerSchemaV1)'
schemaVersioner.registerSchema('v1', 'WorkOrder', WorkOrderSchemaV1)'

// v2 schemas (example with breaking changes)
const CustomerSchemaV2 = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip_code: z.string(), // Breaking: renamed from zipCode
    country: z.string()
  }).optional(),
  client_type: z.enum(['residential', 'commercial']).default('residential'), // Breaking: renamed from customerType'
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  created_at: z.string().datetime(), // Breaking: new required field
  updated_at: z.string().datetime()  // Breaking: new required field
})

schemaVersioner.registerSchema('v2', 'Customer', CustomerSchemaV2)'

/**
 * Validation middleware with version support
 */
export function withVersionedValidation(schemaName: string) {
  return function (handler: Function) {
    return async function (request: NextRequest, version: string) {
      try {
        const body = await request.json()
        
        // Transform request data for version compatibility
        const transformedBody = await versionManager.transformRequest('v1', version, body)'
        
        // Validate with version-specific schema
        const validatedData = schemaVersioner.validate(version, schemaName, transformedBody)
        
        // Add validated data to request context
        ;(request as any).validatedData = validatedData
        
        return await handler(request, version)
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json({
            error: 'Validation failed','
            version,
            details: error.errors,
            message: 'Request data does not match the expected schema for this API version'
          }, { status: 400 })
        }
        throw error
      }
    }
  }
}

/**
 * Content negotiation helper
 */
export function negotiateContentType(request: NextRequest): {
  type: 'json' | 'xml' | 'yaml'
  version?: string
} {
  const acceptHeader = request.headers.get('Accept') || 'application/json'
  
  // Check for versioned content types
  const versionedMatch = acceptHeader.match(/application\/vnd\.thorbis\.(v\d+)\+(json|xml|yaml)/i)
  if (versionedMatch) {
    return {
      type: versionedMatch[2] as 'json' | 'xml' | 'yaml','
      version: versionedMatch[1]
    }
  }
  
  // Default content type negotiation
  if (acceptHeader.includes('application/xml')) {'
    return { type: 'xml' }'
  } else if (acceptHeader.includes('application/yaml') || acceptHeader.includes('text/yaml')) {'
    return { type: 'yaml' }'
  } else {
    return { type: 'json' }'`'
  }
}

// Export utilities and types
export {
  ApiVersion,
  VersionStrategy,
  DeprecationLevel,
  DeprecationWarning,
  versionManager,
  schemaVersioner
}