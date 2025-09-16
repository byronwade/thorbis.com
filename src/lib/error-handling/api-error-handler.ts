import {
  DatabaseError,
  ValidationError,
  BusinessRuleError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  DuplicateRecordError,
  TransactionBalanceError
} from './error-types'

// API error response interface
interface ApiErrorResponse {
  message: string
  code: string
  statusCode: number
  details?: any
  timestamp?: string
}

// Transform API errors into proper error instances
export function transformApiError(response: Response, data?: ApiErrorResponse): Error {
  const status = response.status
  const message = data?.message || response.statusText || 'Unknown error'
  const code = data?.code || 'HTTP_${status}'
  
  // Authentication errors
  if (status === 401) {
    return new AuthenticationError(message)
  }
  
  // Authorization errors
  if (status === 403) {
    return new AuthorizationError(message)
  }
  
  // Not found errors
  if (status === 404) {
    const resource = extractResourceFromUrl(response.url)
    return new NotFoundError(resource, data?.details?.identifier)
  }
  
  // Validation errors
  if (status === 400 && code === 'VALIDATION_ERROR') {
    return new ValidationError(message, data?.details?.fields || {})
  }
  
  // Business rule errors
  if (status === 422) {
    if (code === 'ACCOUNTING_TRANSACTION_OUT_OF_BALANCE') {
      return new TransactionBalanceError(
        data?.details?.totalDebits || 0,
        data?.details?.totalCredits || 0
      )
    }
    
    if (code === 'DUPLICATE_RECORD') {
      return new DuplicateRecordError(
        data?.details?.resource || 'Record',
        data?.details?.field || 'field',
        data?.details?.value || 'value'
      )
    }
    
    return new BusinessRuleError(message, code)
  }
  
  // Server errors
  if (status >= 500) {
    if (code.includes('DATABASE') || message.toLowerCase().includes('database')) {
      return new DatabaseError(message)
    }
    
    return new NetworkError(message, status)
  }
  
  // Client errors
  if (status >= 400) {
    return new NetworkError(message, status)
  }
  
  // Default to network error
  return new NetworkError(message, status)
}

// Extract resource name from URL for better error messages
function extractResourceFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const segments = pathname.split('/').filter(Boolean)
    
    // Common patterns: /api/v1/accounts/123 -> 'Account'
    if (segments.length >= 3 && segments[0] === 'api') {
      const resource = segments[2]
      return resource.charAt(0).toUpperCase() + resource.slice(1, -1) // Remove 's' and capitalize
    }
    
    return 'Resource'
  } catch {
    return 'Resource'
  }
}

// Enhanced fetch wrapper with proper error handling
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    // Handle successful responses
    if (response.ok) {
      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T
      }
      
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return await response.text() as T
    }
    
    // Handle error responses
    let errorData: ApiErrorResponse | undefined
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json()
      }
    } catch {
      // Ignore JSON parsing errors for error responses
    }
    
    throw transformApiError(response, errorData)
    
  } catch (error) {
    // Network errors (connection failed, timeout, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network request failed. Please check your connection.')
    }
    
    // Re-throw if already transformed
    if (error instanceof Error && 'code' in error) {
      throw error
    }
    
    // Default network error
    throw new NetworkError('Request failed')
  }
}

// Convenience methods for common HTTP methods
export const api = {
  get: <T = any>(url: string, options?: RequestInit): Promise<T> =>
    apiRequest<T>(url, { ...options, method: 'GET' }),
    
  post: <T = any>(url: string, data?: any, options?: RequestInit): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),
    
  put: <T = any>(url: string, data?: any, options?: RequestInit): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }),
    
  patch: <T = any>(url: string, data?: any, options?: RequestInit): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    }),
    
  delete: <T = any>(url: string, options?: RequestInit): Promise<T> =>
    apiRequest<T>(url, { ...options, method: 'DELETE' })
}

// Retry logic for failed requests
export async function apiRequestWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (const attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest<T>(url, options)
    } catch (_error) {
      lastError = error as Error
      
      // Don't retry certain errors'
      if (
        error instanceof ValidationError ||
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      
      // Don't retry on last attempt'
      if (attempt === maxRetries) {
        break
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
      )
    }
  }
  
  throw lastError!
}

// Batch request handler
export async function apiBatch<T = any>(
  requests: Array<() => Promise<T>>
): Promise<Array<T | Error>> {
  const results = await Promise.allSettled(
    requests.map(request => request())
  )
  
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : result.reason
  )
}

// Request interceptor type
export type RequestInterceptor = (url: string, options: RequestInit) => RequestInit | Promise<RequestInit>

// Response interceptor type
export type ResponseInterceptor<T = any> = (response: T, url: string) => T | Promise<T>

// API client with interceptors
export class ApiClient {
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private baseUrl: string

  constructor(baseUrl: string = ') {
    this.baseUrl = baseUrl
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor<T = any>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor)
  }

  async request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = this.baseUrl + url
    
    // Apply request interceptors
    let finalOptions = options
    for (const interceptor of this.requestInterceptors) {
      finalOptions = await interceptor(fullUrl, finalOptions)
    }
    
    // Make request
    let response = await apiRequest<T>(fullUrl, finalOptions)
    
    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response, fullUrl)
    }
    
    return response
  }

  get<T = any>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  post<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  put<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  patch<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  delete<T = any>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }
}

// Default API client instance
export const defaultApiClient = new ApiClient()

// Add default interceptors
defaultApiClient.addRequestInterceptor((url, options) => {
  // Add authorization header if available
  const token = localStorage.getItem('auth_token')
  if (token) {
    return {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': 'Bearer ${token}'
      }
    }
  }
  return options
})

defaultApiClient.addResponseInterceptor((response, url) => {
  // Log successful requests in development
  if (process.env.NODE_ENV === 'development') {
    console.log('API Success: ${url}', response)
  }
  return response
})