import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import type { ValidationResult, ValidationError } from '@/types/lom'

// JSON Schema for LOM Manifest
export const lomManifestSchema = {
  $id: 'https://lom.thorbis.com/schemas/manifest/v1.0.json',
  title: 'LOM Manifest Schema',
  description: 'Schema for LLM Operations Manifest (LOM) v1.0',
  type: 'object',
  required: ['lom_version', 'publisher', 'openapi', 'safety', 'tools', 'updated_at'],
  properties: {
    lom_version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+$',
      description: 'Version of the LOM schema being used'
    },
    publisher: {
      type: 'object',
      required: ['name', 'website'],
      properties: {
        name: { type: 'string', minLength: 1 },
        website: { type: 'string', format: 'uri' },
        contact: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            support_url: { type: 'string', format: 'uri' }
          }
        },
        description: { type: 'string' },
        logo_url: { type: 'string', format: 'uri' }
      }
    },
    capabilities: {
      type: 'object',
      properties: {
        industries: {
          type: 'array',
          items: { type: 'string' }
        },
        data_domains: {
          type: 'array',
          items: { type: 'string' }
        },
        supported_operations: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    },
    openapi: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string', format: 'uri' },
        version: { type: 'string' },
        description: { type: 'string' }
      }
    },
    auth: {
      type: 'object',
      required: ['type'],
      properties: {
        type: { 
          type: 'string', 
          enum: ['oauth2', 'api_key', 'basic', 'bearer'] 
        },
        authorization_url: { type: 'string', format: 'uri' },
        token_url: { type: 'string', format: 'uri' },
        scopes: { type: 'object' },
        api_key_header: { type: 'string' },
        description: { type: 'string' }
      }
    },
    safety: {
      type: 'object',
      required: ['confirm_before_write'],
      properties: {
        confirm_before_write: { type: 'boolean' },
        idempotency_header: { type: 'string' },
        soft_delete: { type: 'boolean' },
        audit_logs: { type: 'boolean' },
        rate_limiting: { type: 'boolean' },
        data_retention_days: { type: 'integer', minimum: 0 }
      }
    },
    rate_limits: {
      type: 'object',
      properties: {
        anonymous: { $ref: '#/$defs/rateLimitConfig' },
        authenticated: { $ref: '#/$defs/rateLimitConfig' }
      }
    },
    endpoints: {
      type: 'object',
      properties: {
        availability: { type: 'string', format: 'uri' },
        trust: { type: 'string', format: 'uri' },
        price_bands: { type: 'string', format: 'uri' },
        health: { type: 'string', format: 'uri' }
      }
    },
    tools: {
      type: 'array',
      minItems: 1,
      items: { $ref: '#/$defs/tool' }
    },
    webhooks: {
      type: 'array',
      items: { $ref: '#/$defs/webhook' }
    },
    llm_hints: {
      type: 'object',
      properties: {
        mcp_server_url: { type: 'string', format: 'uri' },
        actions_manifest_url: { type: 'string', format: 'uri' },
        gemini_extension_url: { type: 'string', format: 'uri' },
        preferred_model_types: {
          type: 'array',
          items: { type: 'string' }
        },
        context_window_requirements: { type: 'integer', minimum: 1 }
      }
    },
    legal: {
      type: 'object',
      properties: {
        terms_url: { type: 'string', format: 'uri' },
        privacy_url: { type: 'string', format: 'uri' },
        license: { type: 'string' },
        compliance: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    },
    updated_at: { 
      type: 'string', 
      format: 'date-time' 
    }
  },
  $defs: {
    rateLimitConfig: {
      type: 'object',
      properties: {
        requests_per_minute: { type: 'integer', minimum: 1 },
        requests_per_hour: { type: 'integer', minimum: 1 },
        requests_per_day: { type: 'integer', minimum: 1 }
      }
    },
    tool: {
      type: 'object',
      required: ['name', 'description', 'method', 'url'],
      properties: {
        name: { type: 'string', minLength: 1 },
        description: { type: 'string', minLength: 1 },
        method: { 
          type: 'string', 
          enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] 
        },
        url: { type: 'string', format: 'uri' },
        input_schema: { type: 'object' },
        result_schema: { type: 'object' },
        headers: { type: 'object' },
        auth_required: { type: 'boolean' },
        safety_override: { $ref: '#/properties/safety' },
        examples: {
          type: 'array',
          items: { $ref: '#/$defs/toolExample' }
        }
      }
    },
    toolExample: {
      type: 'object',
      required: ['name', 'description', 'input', 'expected_output'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        input: { type: 'object' },
        expected_output: { type: 'object' }
      }
    },
    webhook: {
      type: 'object',
      required: ['name', 'event', 'description', 'payload_schema_url'],
      properties: {
        name: { type: 'string' },
        event: { type: 'string' },
        description: { type: 'string' },
        payload_schema_url: { type: 'string', format: 'uri' },
        delivery_method: { 
          type: 'string', 
          enum: ['http', 'websocket'] 
        }
      }
    }
  }
}

// JSON Schema for Trust Capsule
export const trustCapsuleSchema = {
  $id: 'https://lom.thorbis.com/schemas/trust-capsule/v1.0.json',
  title: 'Trust Capsule Schema',
  description: 'Schema for Trust Capsule v1.0',
  type: 'object',
  required: ['window_days', 'sample_size', 'updated_at'],
  properties: {
    window_days: { 
      type: 'integer', 
      minimum: 1, 
      maximum: 365,
      description: 'Time window in days for metrics calculation'
    },
    sample_size: { 
      type: 'integer', 
      minimum: 1,
      description: 'Number of transactions used for metrics'
    },
    on_time_rate: { 
      type: 'number', 
      minimum: 0, 
      maximum: 1,
      description: 'Rate of on-time completion (0-1)'
    },
    first_time_fix_rate: { 
      type: 'number', 
      minimum: 0, 
      maximum: 1,
      description: 'Rate of issues resolved on first attempt (0-1)'
    },
    callback_rate: { 
      type: 'number', 
      minimum: 0, 
      maximum: 1,
      description: 'Rate of callbacks required (0-1, lower is better)'
    },
    verified_volume: { 
      type: 'number', 
      minimum: 0,
      description: 'Total verified transaction volume'
    },
    license_valid: { type: 'boolean' },
    insurance_valid: { type: 'boolean' },
    next_slots: {
      type: 'array',
      items: {
        type: 'object',
        required: ['start', 'end'],
        properties: {
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' },
          service_type: { type: 'string' },
          location: { type: 'string' }
        }
      }
    },
    hold_endpoint: { type: 'string', format: 'uri' },
    confirm_url_template: { type: 'string' },
    updated_at: { type: 'string', format: 'date-time' },
    verification_url: { type: 'string', format: 'uri' }
  }
}

// Create validator instance
const ajv = new Ajv({ allErrors: true, verbose: true })
addFormats(ajv)

// Compile schemas
export const validateManifest = ajv.compile(lomManifestSchema)
export const validateTrustCapsule = ajv.compile(trustCapsuleSchema)

// Helper function to format validation errors
export function formatValidationErrors(errors: unknown[]): ValidationError[] {
  return errors.map(error => {
    const path = error.instancePath || error.schemaPath || '
    let message = error.message || 'Unknown validation error'
    
    // Enhance error messages
    if (error.keyword === 'required') {
      message = 'Missing required field: ${error.params?.missingProperty || 'unknown'}'
    } else if (error.keyword === 'format') {
      message = 'Invalid format for ${error.params?.format || 'unknown'}: ${message}'
    } else if (error.keyword === 'enum') {
      message = 'Value must be one of: ${error.params?.allowedValues?.join(', ') || 'unknown options'}'
    }
    
    return {
      path: path.replace(/^\//, ').replace(/\//g, '.') || 'root',
      message,
      value: error.data,
      suggestion: getSuggestionForError(error)
    }
  })
}

// Get suggestion for common validation errors
function getSuggestionForError(error: unknown): string | undefined {
  switch (error.keyword) {
    case 'required':
      return 'Add the required field "${error.params?.missingProperty}"'
    case 'format':
      if (error.params?.format === 'uri') {
        return 'Ensure the URL starts with http:// or https://'
      }
      if (error.params?.format === 'email') {
        return 'Ensure the email address is valid (e.g., user@example.com)'
      }
      if (error.params?.format === 'date-time') {
        return 'Use ISO 8601 format (e.g., 2025-01-01T00:00:00Z)'
      }
      break
    case 'enum':
      return 'Use one of: ${error.params?.allowedValues?.join(', ')}'
    case 'minLength':
      return 'Minimum length is ${error.params?.limit} characters'
    case 'minimum':
      return 'Minimum value is ${error.params?.limit}'
    case 'maximum':
      return 'Maximum value is ${error.params?.limit}'
  }
}

// Validate LOM Manifest with enhanced error handling
export function validateLOMManifest(data: unknown): ValidationResult {
  const isValid = validateManifest(data)
  
  if (isValid) {
    return { valid: true, errors: [] }
  }
  
  const errors = formatValidationErrors(validateManifest.errors || [])
  
  return {
    valid: false,
    errors,
    warnings: getWarnings(data)
  }
}

// Validate Trust Capsule with enhanced error handling
export function validateLOMTrustCapsule(data: unknown): ValidationResult {
  const isValid = validateTrustCapsule(data)
  
  if (isValid) {
    return { valid: true, errors: [] }
  }
  
  const errors = formatValidationErrors(validateTrustCapsule.errors || [])
  
  return {
    valid: false,
    errors,
    warnings: getTrustCapsuleWarnings(data)
  }
}

// Get warnings for manifest (best practices)
function getWarnings(data: unknown): ValidationError[] {
  const warnings: ValidationError[] = []
  
  if (!data.capabilities) {
    warnings.push({
      path: 'capabilities',
      message: 'Consider adding capabilities to help AI agents understand your service offerings'
    })
  }
  
  if (!data.auth) {
    warnings.push({
      path: 'auth',
      message: 'Consider adding authentication details for secure API access'
    })
  }
  
  if (data.tools && data.tools.length > 10) {
    warnings.push({
      path: 'tools',
      message: 'Consider organizing tools into categories or reducing the number for better discoverability'
    })
  }
  
  return warnings
}

// Get warnings for trust capsule
function getTrustCapsuleWarnings(data: unknown): ValidationError[] {
  const warnings: ValidationError[] = []
  
  if (data.window_days && data.window_days < 30) {
    warnings.push({
      path: 'window_days',
      message: 'Consider using at least 30 days for more reliable metrics'
    })
  }
  
  if (data.sample_size && data.sample_size < 10) {
    warnings.push({
      path: 'sample_size',
      message: 'Sample size below 10 may not provide reliable metrics'
    })
  }
  
  return warnings
}