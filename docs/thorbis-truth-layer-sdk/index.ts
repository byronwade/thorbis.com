/**
 * Thorbis Truth Layer SDK
 * 
 * TypeScript SDK for the Thorbis Truth Layer API
 * Generated from OpenAPI 3.1 specification
 */

// ============================================================================
// TYPES AND INTERFACES (Generated from OpenAPI)
// ============================================================================

export type ServiceCode = 'plumbing' | 'electrical' | 'hvac' | 'general_repair' | 'emergency'
export type Industry = 'plumbing' | 'electrical' | 'hvac' | 'general_repair' | 'restaurant' | 'retail'
export type JobType = 'diagnostic' | 'repair' | 'installation' | 'maintenance' | 'emergency'
export type PaymentMethod = 'card' | 'ach' | 'apple_pay' | 'google_pay' | 'paypal'
export type ReferenceType = 'invoice' | 'estimate' | 'deposit' | 'service_fee'
export type Priority = 'low' | 'normal' | 'high' | 'emergency'
export type ContactMethod = 'phone' | 'email' | 'sms'

// Error codes as narrow union types
export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'RATE_LIMIT'
  | 'SCHEMA_MISSING'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'DEPENDENCY_DOWN'
  | 'UNKNOWN'
  | 'INSUFFICIENT_DATA'

export interface ApiError {
  code: ErrorCode
  message: string
  field?: string
  details?: any
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

// Core entity interfaces
export interface Address {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface ContactInfo {
  phone?: string
  email?: string
  website?: string
}

export interface License {
  type: string
  number: string
  expires_at: string
  verified_at?: string
  status: 'valid' | 'expired' | 'suspended' | 'pending_renewal'
}

export interface Insurance {
  type: 'general_liability' | 'workers_compensation' | 'bonding' | 'professional_liability'
  provider: string
  policy_number: string
  expires_at: string
  verified_at?: string
  status: 'valid' | 'expired' | 'canceled' | 'pending_renewal'
}

export interface BusinessVerification {
  badges?: Array<'licensed' | 'insured' | 'bonded' | 'invoice_verified_reviews' | 'background_checked'>
  licenses?: License[]
  insurance?: Insurance[]
}

export interface DayHours {
  open?: string | null
  close?: string | null
  closed: boolean
}

export interface BusinessHours {
  monday?: DayHours
  tuesday?: DayHours
  wednesday?: DayHours
  thursday?: DayHours
  friday?: DayHours
  saturday?: DayHours
  sunday?: DayHours
}

export interface BusinessProfile {
  slug: string
  name: string
  industry: Industry
  description?: string
  address?: Address
  contact?: ContactInfo
  verification?: BusinessVerification
  business_hours: BusinessHours
  service_areas?: string[]
  specialties?: string[]
  last_updated: string
}

// Availability interfaces
export interface AvailableProvider {
  business_slug?: string
  name?: string
  estimated_arrival?: string
  confidence?: number
}

export interface AvailableSlot {
  start_time?: string
  end_time?: string
  providers?: number
}

export interface NowAvailable {
  available: boolean
  earliest_start?: string
  latest_start?: string
  providers?: AvailableProvider[]
  reason?: string
  next_check?: string
}

export interface NextAvailable {
  date?: string
  slots?: AvailableSlot[]
}

export interface AvailabilityMetadata {
  providers_searched?: number
  search_radius_miles?: number
  as_of?: string
}

export interface AvailabilityResponse {
  service_code: string
  zip: string
  requested_when?: string
  duration_minutes?: number
  now_available: NowAvailable
  next_available?: NextAvailable
  metadata?: AvailabilityMetadata
}

// Pricing interfaces
export interface PriceBands {
  p50: number
  p75: number
  p90: number
}

export interface CommonLineItem {
  description?: string
  price_range?: {
    min: number
    max: number
  }
}

export interface PricingMetadata {
  last_updated?: string
  confidence_level?: number
  geographic_coverage?: string
}

export interface DateRange {
  from?: string
  to?: string
}

export interface PriceBandsResponse {
  service_code: string
  job_type?: string
  zip: string
  currency: string
  price_bands: PriceBands
  sample_size: number
  date_range?: DateRange
  common_line_items?: CommonLineItem[]
  factors?: string[]
  metadata?: PricingMetadata
}

// Reviews interfaces
export interface Review {
  id: string
  rating: number
  title?: string
  content?: string
  service_type: string
  completion_date: string
  invoice_verified: boolean
  invoice_hash?: string
  customer_id_masked?: string
  helpful_votes?: number
}

export interface VerificationSummary {
  total_invoice_verified?: number
  total_unverified?: number
  verification_rate?: number
  last_updated?: string
}

export interface Pagination {
  limit?: number
  offset?: number
  has_more?: boolean
}

export interface ReviewsResponse {
  business: string
  total_reviews: number
  average_rating: number
  rating_distribution?: {
    '5'?: number
    '4'?: number
    '3'?: number
    '2'?: number
    '1'?: number
  }
  reviews: Review[]
  pagination?: Pagination
  verification_summary?: VerificationSummary
}

// Booking interfaces
export interface CustomerInfo {
  name: string
  phone: string
  email?: string
  address?: Address
}

export interface JobDetails {
  description?: string
  priority?: Priority
  access_instructions?: string
  estimated_cost_range?: {
    min?: number
    max?: number
  }
}

export interface CustomerPreferences {
  contact_method?: ContactMethod
  reminder_preferences?: Array<'24h_before' | '2h_before' | '30min_before'>
}

export interface CreateBookingHoldRequest {
  business_slug: string
  service_code: string
  job_type?: string
  requested_time: string
  duration_minutes?: number
  customer_info: CustomerInfo
  job_details?: JobDetails
  preferences?: CustomerPreferences
}

export interface BookingDetails {
  business?: string
  service?: string
  scheduled_time?: string
  duration_minutes?: number
  estimated_cost?: string
  technician?: string
}

export interface BookingHoldResponse {
  hold_id: string
  status: 'pending_confirmation' | 'confirmed' | 'expired' | 'canceled'
  expires_at: string
  confirm_url: string
  booking_details?: BookingDetails
  next_steps?: string[]
  idempotency_key?: string
}

// Estimate interfaces
export interface ProjectDetails {
  title: string
  description?: string
  type: 'repair' | 'installation' | 'renovation' | 'maintenance' | 'emergency'
  timeline_days?: number
}

export interface LineItem {
  description: string
  quantity: number
  unit: string
  unit_price: number
  total: number
}

export interface EstimateTotals {
  subtotal: number
  tax_rate?: number
  tax_amount?: number
  discount_amount?: number
  total: number
}

export interface PaymentScheduleItem {
  description?: string
  amount?: number
  due?: 'upon_acceptance' | 'material_delivery' | 'completion' | 'net_30'
}

export interface EstimateTerms {
  payment_schedule?: PaymentScheduleItem[]
  warranty?: string
  estimated_start?: string
  valid_until?: string
}

export interface CreateEstimateDraftRequest {
  business_slug: string
  customer_info: CustomerInfo
  project_details: ProjectDetails
  line_items: LineItem[]
  totals: EstimateTotals
  terms?: EstimateTerms
}

export interface EstimatePreview {
  number?: string
  customer?: string
  project?: string
  total?: number
  valid_until?: string
}

export interface EstimateDraftResponse {
  draft_id: string
  status: 'draft' | 'under_review' | 'sent' | 'accepted' | 'declined'
  confirm_url: string
  estimate_preview?: EstimatePreview
  next_steps?: string[]
  expires_at?: string
}

// Payment interfaces
export interface LateFee {
  enabled?: boolean
  amount?: number
  grace_period_days?: number
}

export interface PaymentLinkOptions {
  allow_partial?: boolean
  send_reminders?: boolean
  auto_reconcile?: boolean
  conversion_to_invoice?: boolean
}

export interface CreatePaymentLinkRequest {
  business_slug: string
  reference_type: ReferenceType
  reference_id: string
  amount: number
  currency?: string
  customer_info: {
    name: string
    email: string
    phone?: string
  }
  description?: string
  payment_methods?: PaymentMethod[]
  due_date?: string
  late_fee?: LateFee
  options?: PaymentLinkOptions
}

export interface PaymentDetails {
  amount?: number
  currency?: string
  description?: string
  due_date?: string
  reference?: string
}

export interface CustomerPaymentPreview {
  payment_url?: string
  methods_available?: string[]
  security_features?: string[]
}

export interface PaymentLinkResponse {
  payment_link_id: string
  status: 'draft' | 'active' | 'paid' | 'expired' | 'canceled'
  confirm_url: string
  payment_details?: PaymentDetails
  customer_preview?: CustomerPaymentPreview
  next_steps?: string[]
  expires_at?: string
}

// ============================================================================
// SDK CONFIGURATION AND OPTIONS
// ============================================================================

export interface SDKConfig {
  baseURL?: string | undefined
  apiKey?: string | undefined
  timeout?: number | undefined
  retries?: number | undefined
  retryDelay?: number | undefined
}

export interface RequestOptions {
  timeout?: number
  retries?: number
  idempotencyKey?: string
  headers?: Record<string, string>
}

export interface GetAvailabilityParams {
  service_code: ServiceCode
  zip: string
  when?: string
  duration_minutes?: number
}

export interface GetPriceBandsParams {
  service_code: ServiceCode
  zip: string
  job_type?: JobType
}

export interface GetReviewsParams {
  business: string
  limit?: number
  offset?: number
  min_rating?: number
  service_type?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Add idempotency key to request options
 */
export function withIdempotencyKey(key?: string): { idempotencyKey: string } {
  return {
    idempotencyKey: key || generateIdempotencyKey()
  }
}

/**
 * Add tenant context (for multi-tenant scenarios)
 */
export function withTenant(tenantId: string): RequestOptions {
  return {
    headers: {
      'X-Tenant-ID': tenantId
    }
  }
}

/**
 * Create retry configuration
 */
export function withRetry(maxRetries: number = 3, baseDelay: number = 1000) {
  return {
    retries: maxRetries,
    retryDelay: baseDelay
  }
}

/**
 * Generate UUID v4 for idempotency keys
 */
function generateIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// MAIN SDK CLASS
// ============================================================================

export class ThorbisTruthLayerSDK {
  private baseURL: string
  private apiKey: string
  private timeout: number
  private defaultRetries: number
  private defaultRetryDelay: number

  constructor(config: SDKConfig) {
    this.baseURL = config.baseURL || 'https://api.thorbis.com/v1'
    this.apiKey = config.apiKey || ''
    this.timeout = config.timeout || 30000
    this.defaultRetries = config.retries || 3
    this.defaultRetryDelay = config.retryDelay || 1000
  }

  // ========================================================================
  // READ ENDPOINTS
  // ========================================================================

  /**
   * Get business profile and verification status
   */
  async getBusinessBySlug(
    slug: string, 
    options?: RequestOptions
  ): Promise<ApiResponse<BusinessProfile>> {
    return this.request<BusinessProfile>('GET', `/businesses/${slug}`, null, options)
  }

  /**
   * Get real-time availability windows
   */
  async getAvailability(
    params: GetAvailabilityParams,
    options?: RequestOptions
  ): Promise<ApiResponse<AvailabilityResponse>> {
    const queryParams = new URLSearchParams({
      service_code: params.service_code,
      zip: params.zip,
      ...(params.when && { when: params.when }),
      ...(params.duration_minutes && { duration_minutes: params.duration_minutes.toString() })
    })
    
    return this.request<AvailabilityResponse>('GET', `/availability?${queryParams}`, null, options)
  }

  /**
   * Get pricing data with percentiles
   */
  async getPriceBands(
    params: GetPriceBandsParams,
    options?: RequestOptions
  ): Promise<ApiResponse<PriceBandsResponse>> {
    const queryParams = new URLSearchParams({
      service_code: params.service_code,
      zip: params.zip,
      ...(params.job_type && { job_type: params.job_type })
    })
    
    return this.request<PriceBandsResponse>('GET', `/price-bands?${queryParams}`, null, options)
  }

  /**
   * Get invoice-verified reviews
   */
  async getReviews(
    params: GetReviewsParams,
    options?: RequestOptions
  ): Promise<ApiResponse<ReviewsResponse>> {
    const queryParams = new URLSearchParams({
      business: params.business,
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
      ...(params.min_rating && { min_rating: params.min_rating.toString() }),
      ...(params.service_type && { service_type: params.service_type })
    })
    
    return this.request<ReviewsResponse>('GET', `/reviews?${queryParams}`, null, options)
  }

  // ========================================================================
  // ACTION ENDPOINTS (Confirm-Flow Only)
  // ========================================================================

  /**
   * Create booking hold with confirmation URL
   */
  async createBookingHold(
    request: CreateBookingHoldRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<BookingHoldResponse>> {
    return this.request<BookingHoldResponse>('POST', '/bookings/hold', request, options)
  }

  /**
   * Create estimate draft with confirmation URL
   */
  async createEstimateDraft(
    request: CreateEstimateDraftRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<EstimateDraftResponse>> {
    return this.request<EstimateDraftResponse>('POST', '/estimates/draft', request, options)
  }

  /**
   * Create payment link with confirmation URL
   */
  async createPaymentLink(
    request: CreatePaymentLinkRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<PaymentLinkResponse>> {
    return this.request<PaymentLinkResponse>('POST', '/payments/link', request, options)
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private async request<T>(
    method: string,
    path: string,
    body: any = null,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${path}`
    const maxRetries = options.retries ?? this.defaultRetries
    const retryDelay = this.defaultRetryDelay

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'thorbis-truth-layer-sdk/1.0.0',
          ...(options.headers || {})
        }

        // Add idempotency key for write operations
        if (body && options.idempotencyKey) {
          headers['Idempotency-Key'] = options.idempotencyKey
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout)

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : null,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          return { data }
        }

        // Handle error responses
        const errorData = await response.json().catch(() => ({}))
        const error: ApiError = {
          code: this.mapStatusToErrorCode(response.status),
          message: errorData.error?.message || response.statusText,
          field: errorData.error?.field,
          details: errorData.error?.details
        }

        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return { error }
        }

        // Retry on server errors (5xx) and network errors
        if (attempt < maxRetries) {
          await sleep(retryDelay * Math.pow(2, attempt)) // Exponential backoff
          continue
        }

        return { error }
      } catch (fetchError) {
        // Handle network errors, timeouts, etc.
        if (attempt < maxRetries) {
          await sleep(retryDelay * Math.pow(2, attempt))
          continue
        }

        const error: ApiError = {
          code: 'UNKNOWN',
          message: fetchError instanceof Error ? fetchError.message : 'Unknown error occurred'
        }

        return { error }
      }
    }

    // This should never be reached, but TypeScript needs it
    return {
      error: {
        code: 'UNKNOWN',
        message: 'Maximum retries exceeded'
      }
    }
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case 400: return 'VALIDATION_ERROR'
      case 401: return 'AUTH_ERROR'
      case 404: return 'NOT_FOUND'
      case 409: return 'CONFLICT'
      case 429: return 'RATE_LIMIT'
      case 503: return 'DEPENDENCY_DOWN'
      default: return 'UNKNOWN'
    }
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Node.js - Check availability and create booking hold
 */
export async function exampleAvailabilityAndBooking() {
  const sdk = new ThorbisTruthLayerSDK({
    apiKey: 'your-api-key-here',
    baseURL: 'https://api.thorbis.com/v1'
  })

  try {
    // Check availability first
    const availabilityResponse = await sdk.getAvailability({
      service_code: 'plumbing',
      zip: '78701',
      when: '2024-02-16T10:00:00Z',
      duration_minutes: 120
    })

    if (availabilityResponse.error) {
      console.error('Failed to check availability:', availabilityResponse.error)
      return
    }

    const availability = availabilityResponse.data!
    console.log('Now available:', availability.now_available.available)

    if (availability.now_available.available) {
      // Create booking hold with idempotency
      const bookingResponse = await sdk.createBookingHold({
        business_slug: 'smith-plumbing-co',
        service_code: 'plumbing',
        job_type: 'repair',
        requested_time: '2024-02-16T10:00:00Z',
        duration_minutes: 120,
        customer_info: {
          name: 'John Smith',
          phone: '+1-512-555-0200',
          email: 'john.smith@email.com',
          address: {
            street: '456 Oak Ave',
            city: 'Austin',
            state: 'TX',
            zip: '78701'
          }
        },
        job_details: {
          description: 'Kitchen sink not draining properly',
          priority: 'normal'
        }
      }, withIdempotencyKey())

      if (bookingResponse.error) {
        console.error('Booking failed:', bookingResponse.error)
        return
      }

      console.log('Booking hold created:', bookingResponse.data!.confirm_url)
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

/**
 * Example 2: Next.js Server Action - Create estimate draft
 */
export async function createEstimateAction(formData: FormData) {
  'use server' // Next.js Server Action

  const sdk = new ThorbisTruthLayerSDK({
    apiKey: process.env.THORBIS_API_KEY!,
    baseURL: process.env.THORBIS_API_URL
  })

  const estimateData: CreateEstimateDraftRequest = {
    business_slug: 'smith-plumbing-co',
    customer_info: {
      name: formData.get('customer_name') as string,
      email: formData.get('customer_email') as string,
      phone: formData.get('customer_phone') as string,
      address: {
        street: formData.get('address_street') as string,
        city: formData.get('address_city') as string,
        state: formData.get('address_state') as string,
        zip: formData.get('address_zip') as string
      }
    },
    project_details: {
      title: formData.get('project_title') as string,
      description: formData.get('project_description') as string,
      type: 'renovation',
      timeline_days: parseInt(formData.get('timeline_days') as string)
    },
    line_items: JSON.parse(formData.get('line_items') as string),
    totals: JSON.parse(formData.get('totals') as string),
    terms: {
      warranty: '1 year parts and labor warranty',
      valid_until: '2024-03-15'
    }
  }

  const response = await sdk.createEstimateDraft(
    estimateData,
    { ...withIdempotencyKey(), ...withRetry(2) }
  )

  if (response.error) {
    throw new Error(`Estimate creation failed: ${response.error.message}`)
  }

  return {
    success: true,
    draftId: response.data!.draft_id,
    confirmUrl: response.data!.confirm_url
  }
}

/**
 * Example 3: Get pricing data with error handling
 */
export async function examplePricingData() {
  const sdk = new ThorbisTruthLayerSDK({
    apiKey: process.env.THORBIS_API_KEY!
  })

  const response = await sdk.getPriceBands({
    service_code: 'plumbing',
    zip: '78701',
    job_type: 'repair'
  }, withRetry(2))

  if (response.error) {
    switch (response.error.code) {
      case 'INSUFFICIENT_DATA':
        console.log('Not enough pricing data available for this area')
        return null
      case 'RATE_LIMIT':
        console.log('Rate limit hit, try again later')
        return null
      default:
        console.error('Pricing request failed:', response.error)
        return null
    }
  }

  const pricing = response.data!
  console.log(`Pricing for ${pricing.service_code} in ${pricing.zip}:`)
  console.log(`- Median (p50): $${pricing.price_bands.p50}`)
  console.log(`- Upper range (p75): $${pricing.price_bands.p75}`)
  console.log(`- Premium (p90): $${pricing.price_bands.p90}`)
  console.log(`Sample size: ${pricing.sample_size} jobs`)

  return pricing
}

/**
 * Example 4: Multi-tenant usage with error boundaries
 */
export async function exampleMultiTenant(tenantId: string) {
  const sdk = new ThorbisTruthLayerSDK({
    apiKey: process.env.THORBIS_API_KEY!
  })

  try {
    // Get business profile with tenant context
    const businessResponse = await sdk.getBusinessBySlug(
      'smith-plumbing-co',
      withTenant(tenantId)
    )

    if (businessResponse.error) {
      if (businessResponse.error.code === 'NOT_FOUND') {
        console.log('Business not found for this tenant')
        return null
      }
      throw new Error(`Business lookup failed: ${businessResponse.error.message}`)
    }

    const business = businessResponse.data!
    console.log(`Found business: ${business.name}`)
    console.log(`Verification badges: ${business.verification?.badges?.join(', ')}`)

    // Get reviews for this business
    const reviewsResponse = await sdk.getReviews({
      business: business.slug,
      limit: 10,
      min_rating: 4
    })

    if (reviewsResponse.data) {
      const reviews = reviewsResponse.data
      console.log(`${reviews.total_reviews} total reviews, avg: ${reviews.average_rating}`)
      console.log(`Verification rate: ${reviews.verification_summary?.verification_rate}`)
    }

    return {
      business,
      reviews: reviewsResponse.data
    }
  } catch (error) {
    console.error('Multi-tenant request failed:', error)
    return null
  }
}

/**
 * Example 5: Webhook-style usage with retry logic
 */
export async function exampleWebhookHandler(webhookData: any) {
  const sdk = new ThorbisTruthLayerSDK({
    apiKey: process.env.THORBIS_API_KEY!,
    retries: 5, // More retries for webhook processing
    retryDelay: 2000
  })

  // Process availability change webhook
  if (webhookData.event_type === 'availability.changed') {
    console.log(`Availability changed for ${webhookData.business_slug}`)
    
    // Refresh availability data
    const response = await sdk.getAvailability({
      service_code: webhookData.data.service_code,
      zip: '78701' // Would come from webhook context
    }, withRetry(5))

    if (response.error) {
      console.error('Failed to refresh availability:', response.error)
      // Could trigger alert or fallback logic
      return false
    }

    console.log('Updated availability:', response.data!.now_available)
    // Update local cache, notify subscribers, etc.
    return true
  }

  // Process booking confirmation webhook
  if (webhookData.event_type === 'booking.confirmed') {
    console.log(`Booking confirmed: ${webhookData.data.booking_id}`)
    
    // Could trigger follow-up actions:
    // - Send confirmation email
    // - Update calendar
    // - Notify technician
    
    return true
  }

  console.log('Unhandled webhook event:', webhookData.event_type)
  return false
}

// Export the main SDK class as default
export default ThorbisTruthLayerSDK
