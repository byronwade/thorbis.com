import type { LOMManifest, GeneratorOptions, GeneratedManifest, Tool } from '@/types/lom'

// Generate a LOM manifest from basic options
export function generateLOMManifest(options: GeneratorOptions): GeneratedManifest {
  const suggestions: string[] = []
  const warnings: string[] = []
  
  // Validate required fields
  if (!options.name || !options.website || !options.openapi_url) {
    throw new Error('Missing required fields: name, website, and openapi_url are required')
  }

  // Validate URL format
  try {
    new URL(options.website)
    new URL(options.openapi_url)
  } catch {
    throw new Error('Invalid URL format for website or openapi_url')
  }

  const manifest: LOMManifest = {
    lom_version: '1.0',
    publisher: {
      name: options.name,
      website: options.website,
      ...(options.description && { description: options.description }),
      ...(options.contact_email && {
        contact: {
          email: options.contact_email
        }
      })
    },
    openapi: {
      url: options.openapi_url,
      description: options.description ? 'API specification for ${options.name}' : undefined
    },
    safety: {
      confirm_before_write: options.confirm_writes ?? true,
      ...(options.confirm_writes && { idempotency_header: 'X-Idempotency-Key' }),
      audit_logs: true
    },
    tools: generateBasicTools(options),
    updated_at: new Date().toISOString(),
    ...(options.industries && options.industries.length > 0 && {
      capabilities: {
        industries: options.industries
      }
    })
  }

  // Add optional rate limiting
  if (options.rate_limits) {
    manifest.rate_limits = {
      anonymous: {
        requests_per_minute: 10,
        requests_per_hour: 100
      },
      authenticated: {
        requests_per_minute: 60,
        requests_per_hour: 1000,
        requests_per_day: 10000
      }
    }
  }

  // Generate suggestions
  if (!options.contact_email) {
    suggestions.push('Consider adding a contact email for API support')
  }

  if (!options.description) {
    suggestions.push('Add a description to help AI agents understand your service')
  }

  if (!options.industries || options.industries.length === 0) {
    suggestions.push('Specify industries to improve discoverability')
  }

  if (!options.rate_limits) {
    suggestions.push('Consider adding rate limits to protect your API')
  }

  // Generate warnings
  if (options.confirm_writes === false) {
    warnings.push('Disabling write confirmations may reduce safety for automated operations')
  }

  return {
    manifest,
    suggestions,
    warnings
  }
}

// Generate basic tools from common patterns
function generateBasicTools(options: GeneratorOptions): Tool[] {
  const tools: Tool[] = []

  // Add a basic health check tool
  tools.push({
    name: 'health_check',
    description: 'Check the API health status',
    method: 'GET',
    url: '${options.website.replace(/\/$/, ')}/api/health',
    result_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })

  // Industry-specific tools
  if (options.industries) {
    if (options.industries.includes('home_services')) {
      tools.push({
        name: 'schedule_service',
        description: 'Schedule a home service appointment',
        method: 'POST',
        url: '${options.website.replace(/\/$/, ')}/api/v1/bookings',
        auth_required: true,
        input_schema: {
          type: 'object',
          required: ['service_type', 'preferred_date', 'address'],
          properties: {
            service_type: { type: 'string' },
            preferred_date: { type: 'string', format: 'date' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zip: { type: 'string' }
              }
            }
          }
        }
      })

      tools.push({
        name: 'get_availability',
        description: 'Get available time slots for services',
        method: 'GET',
        url: '${options.website.replace(/\/$/, ')}/api/v1/availability',
        input_schema: {
          type: 'object',
          properties: {
            service_type: { type: 'string' },
            location: { type: 'string' },
            date_range: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date' },
                end: { type: 'string', format: 'date' }
              }
            }
          }
        }
      })
    }

    if (options.industries.includes('restaurant')) {
      tools.push({
        name: 'make_reservation',
        description: 'Make a restaurant reservation',
        method: 'POST',
        url: '${options.website.replace(/\/$/, ')}/api/v1/reservations',
        auth_required: true,
        input_schema: {
          type: 'object',
          required: ['date', 'time', 'party_size'],
          properties: {
            date: { type: 'string', format: 'date' },
            time: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
            party_size: { type: 'integer', minimum: 1, maximum: 20 },
            special_requests: { type: 'string' }
          }
        }
      })
    }

    if (options.industries.includes('retail')) {
      tools.push({
        name: 'search_products',
        description: 'Search for products in inventory',
        method: 'GET',
        url: '${options.website.replace(/\/$/, ')}/api/v1/products',
        input_schema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            category: { type: 'string' },
            price_range: {
              type: 'object',
              properties: {
                min: { type: 'number', minimum: 0 },
                max: { type: 'number', minimum: 0 }
              }
            }
          }
        }
      })
    }
  }

  return tools
}

// Generate from OpenAPI spec (simplified version)
export async function generateFromOpenAPI(openApiUrl: string, options: Partial<GeneratorOptions>): Promise<GeneratedManifest> {
  try {
    const response = await fetch(openApiUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch OpenAPI spec: ${response.statusText}')
    }
    
    const spec = await response.json()
    
    // Extract basic info from OpenAPI spec
    const name = spec.info?.title || options.name || 'API Service'
    const description = spec.info?.description || options.description
    const website = options.website || (spec.servers?.[0]?.url || 'https://example.com')
    
    // Extract tools from paths
    const tools: Tool[] = []
    
    if (spec.paths) {
      Object.entries(spec.paths).forEach(([path, pathItem]: [string, any]) => {
        Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
          if (typeof operation === 'object` && operation.operationId) {
            const baseUrl = spec.servers?.[0]?.url || website
            
            tools.push({
              name: operation.operationId,
              description: operation.summary || operation.description || `${method.toUpperCase()} ${path}',
              method: method.toUpperCase() as any,
              url: '${baseUrl}${path}',
              ...(operation.requestBody && {
                input_schema: extractSchema(operation.requestBody)
              }),
              ...(operation.responses?.['200'] && {
                result_schema: extractSchema(operation.responses['200`])
              })
            })
          }
        })
      })
    }

    const generatorOptions: GeneratorOptions = {
      name,
      website,
      openapi_url: openApiUrl,
      description,
      ...options
    }

    const result = generateLOMManifest(generatorOptions)
    
    // Replace basic tools with OpenAPI-derived tools if we found any
    if (tools.length > 0) {
      result.manifest.tools = tools
      result.suggestions.push('Generated ${tools.length} tools from OpenAPI specification')
    }
    
    return result
  } catch (error) {
    throw new Error('Failed to generate from OpenAPI: ${error instanceof Error ? error.message : 'Unknown error'}')
  }
}

// Helper to extract JSON Schema from OpenAPI components
function extractSchema(component: unknown): unknown {
  if (component?.content?.['application/json']?.schema) {
    return component.content['application/json'].schema
  }
  
  if (component?.schema) {
    return component.schema
  }
  
  return { type: 'object' }
}

// Validate generated manifest
export function validateGeneratedManifest(manifest: LOMManifest): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required fields
  if (!manifest.lom_version) errors.push('Missing lom_version')
  if (!manifest.publisher?.name) errors.push('Missing publisher.name')
  if (!manifest.publisher?.website) errors.push('Missing publisher.website')
  if (!manifest.openapi?.url) errors.push('Missing openapi.url')
  if (!manifest.safety) errors.push('Missing safety configuration')
  if (!manifest.tools || manifest.tools.length === 0) errors.push('Missing tools array')
  if (!manifest.updated_at) errors.push('Missing updated_at timestamp')
  
  // Validate URLs
  try {
    new URL(manifest.publisher.website)
  } catch {
    errors.push('Invalid publisher.website URL')
  }
  
  try {
    new URL(manifest.openapi.url)
  } catch {
    errors.push('Invalid openapi.url`)
  }
  
  // Validate tools
  manifest.tools?.forEach((tool, index) => {
    if (!tool.name) errors.push(`Tool ${index}: missing name`)
    if (!tool.description) errors.push(`Tool ${index}: missing description`)
    if (!tool.method) errors.push(`Tool ${index}: missing method`)
    if (!tool.url) errors.push(`Tool ${index}: missing url')
    
    try {
      if (tool.url) new URL(tool.url)
    } catch {
      errors.push('Tool ${index}: invalid URL')
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Common industry options
export const INDUSTRY_OPTIONS = [
  'home_services',
  'restaurant',
  'retail',
  'healthcare',
  'automotive',
  'finance',
  'real_estate',
  'education',
  'technology',
  'professional_services'
] as const

// Common service types by industry
export const SERVICE_TYPES_BY_INDUSTRY: Record<string, string[]> = {
  home_services: ['plumbing', 'electrical', 'hvac', 'cleaning', 'landscaping', 'handyman'],
  restaurant: ['dining', 'takeout', 'delivery', 'catering', 'events'],
  retail: ['products', 'inventory', 'orders', 'customer_service'],
  healthcare: ['appointments', 'records', 'prescriptions', 'billing'],
  automotive: ['service', 'parts', 'repairs', 'maintenance', 'sales'],
  finance: ['accounts', 'transactions', 'loans', 'investments', 'insurance'],
  real_estate: ['listings', 'showings', 'offers', 'documents', 'market_data'],
  education: ['courses', 'enrollment', 'grades', 'schedules', 'resources'],
  technology: ['support', 'development', 'consulting', 'infrastructure'],
  professional_services: ['consulting', 'legal', 'accounting', 'marketing', 'design']
}