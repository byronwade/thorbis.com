// LOM Manifest Types
export interface LOMManifest {
  lom_version: string
  publisher: Publisher
  capabilities?: Capabilities
  openapi: OpenAPIReference
  auth?: Authentication
  safety: Safety
  rate_limits?: RateLimits
  endpoints?: Endpoints
  tools: Tool[]
  webhooks?: Webhook[]
  llm_hints?: LLMHints
  legal?: Legal
  updated_at: string
}

export interface Publisher {
  name: string
  website: string
  contact?: {
    email?: string
    phone?: string
    support_url?: string
  }
  description?: string
  logo_url?: string
}

export interface Capabilities {
  industries?: string[]
  data_domains?: string[]
  supported_operations?: string[]
}

export interface OpenAPIReference {
  url: string
  version?: string
  description?: string
}

export interface Authentication {
  type: 'oauth2' | 'api_key' | 'basic' | 'bearer'
  authorization_url?: string
  token_url?: string
  scopes?: Record<string, string>
  api_key_header?: string
  description?: string
}

export interface Safety {
  confirm_before_write: boolean
  idempotency_header?: string
  soft_delete?: boolean
  audit_logs?: boolean
  rate_limiting?: boolean
  data_retention_days?: number
}

export interface RateLimits {
  anonymous?: {
    requests_per_minute?: number
    requests_per_hour?: number
    requests_per_day?: number
  }
  authenticated?: {
    requests_per_minute?: number
    requests_per_hour?: number
    requests_per_day?: number
  }
}

export interface Endpoints {
  availability?: string
  trust?: string
  price_bands?: string
  health?: string
}

export interface Tool {
  name: string
  description: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  input_schema?: Record<string, unknown>
  result_schema?: Record<string, unknown>
  headers?: Record<string, string>
  auth_required?: boolean
  safety_override?: Partial<Safety>
  examples?: ToolExample[]
}

export interface ToolExample {
  name: string
  description: string
  input: Record<string, unknown>
  expected_output: Record<string, unknown>
}

export interface Webhook {
  name: string
  event: string
  description: string
  payload_schema_url: string
  delivery_method?: 'http' | 'websocket'
}

export interface LLMHints {
  mcp_server_url?: string
  actions_manifest_url?: string
  gemini_extension_url?: string
  preferred_model_types?: string[]
  context_window_requirements?: number
}

export interface Legal {
  terms_url?: string
  privacy_url?: string
  license?: string
  compliance?: string[]
}

// Trust Capsule Types
export interface TrustCapsule {
  window_days: number
  sample_size: number
  on_time_rate?: number
  first_time_fix_rate?: number
  callback_rate?: number
  verified_volume?: number
  license_valid?: boolean
  insurance_valid?: boolean
  next_slots?: AvailabilitySlot[]
  hold_endpoint?: string
  confirm_url_template?: string
  updated_at: string
  verification_url?: string
}

export interface AvailabilitySlot {
  start: string
  end: string
  service_type?: string
  location?: string
}

// Validation Types
export interface ValidationError {
  path: string
  message: string
  value?: any
  suggestion?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings?: ValidationError[]
}

// Generator Types
export interface GeneratorOptions {
  name: string
  website: string
  description?: string
  openapi_url: string
  contact_email?: string
  industries?: string[]
  confirm_writes?: boolean
  rate_limits?: boolean
}

export interface GeneratedManifest {
  manifest: LOMManifest
  suggestions: string[]
  warnings: string[]
}