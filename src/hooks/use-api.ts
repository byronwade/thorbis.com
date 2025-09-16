'use client'

import { useEffect, useCallback, useRef } from 'react'
import useSWR, { KeyedMutator } from 'swr'
import useSWRMutation from 'swr/mutation'
import { createSWRKey, swrFetcher, APIResponse, SWRFetcherOptions } from '@/lib/swr-config'
import { useAppStore } from '@/lib/store'
import { webVitalsTracking } from '@/lib/web-vitals-tracking'

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface APIError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface APIParams {
  [key: string]: string | number | boolean | undefined | null;
}

export interface UseAPIOptions extends Omit<SWRFetcherOptions, 'method'> {
  params?: APIParams
  enabled?: boolean
  refreshInterval?: number
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  dedupingInterval?: number
  errorRetryCount?: number
  loadingTimeout?: number
  keepPreviousData?: boolean
  onSuccess?: <T>(data: APIResponse<T>) => void
  onError?: (error: APIError) => void
}

export interface UseAPIResult<T> {
  data: APIResponse<T> | undefined
  error: APIError | null
  isLoading: boolean
  isValidating: boolean
  mutate: KeyedMutator<APIResponse<T>>
  refresh: () => Promise<APIResponse<T> | undefined>
}

export interface UseMutationResult<T, P> {
  trigger: (data: P) => Promise<APIResponse<T>>
  data: APIResponse<T> | undefined
  error: APIError | null
  isMutating: boolean
  reset: () => void
}

// =============================================================================
// Main API Hook
// =============================================================================

export function useAPI<T = unknown>(
  endpoint: string | null,
  options: UseAPIOptions = {}
): UseAPIResult<T> {
  const {
    params,
    enabled = true,
    refreshInterval,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    dedupingInterval = 2000,
    errorRetryCount = 3,
    loadingTimeout = 3000,
    keepPreviousData = false,
    onSuccess,
    onError,
    headers,
    timeout,
    retries,
    signal
  } = options

  const user = useAppStore(state => state.user)
  const { setOperationLoading } = useAppStore(state => ({
    setOperationLoading: state.setOperationLoading
  }))

  // Generate cache key
  const key = endpoint ? createSWRKey(endpoint, params, user?.id) : null

  // Custom fetcher with options
  const fetcher = useCallback((url: string) => {
    return swrFetcher<T>(url, {
      headers,
      timeout,
      retries,
      signal
    })
  }, [headers, timeout, retries, signal])

  // SWR hook
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate
  } = useSWR<APIResponse<T>>(
    enabled && key ? key : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect,
      dedupingInterval,
      errorRetryCount,
      loadingTimeout,
      keepPreviousData,
      onSuccess: (data) => {
        setOperationLoading(key || endpoint || 'api', false)
        onSuccess?.(data)
        
        // Track successful data fetch
        webVitalsTracking.trackCustomMetric('api-fetch-success', 1, {
          endpoint,
          hasParams: !!params,
          dataSize: JSON.stringify(data).length
        })
      },
      onError: (error) => {
        setOperationLoading(key || endpoint || 'api', false)
        onError?.(error)
        
        // Track API error
        webVitalsTracking.trackCustomMetric('api-fetch-error', 1, {
          endpoint,
          error: error.message,
          status: error.status
        })
      }
    }
  )

  // Track loading state in global store
  useEffect(() => {
    if (key) {
      setOperationLoading(key, isLoading || isValidating)
    }
  }, [key, isLoading, isValidating, setOperationLoading])

  // Refresh function
  const refresh = useCallback(async () => {
    return mutate()
  }, [mutate])

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh
  }
}

// =============================================================================
// Specialized Hooks
// =============================================================================

// Hook for paginated data
export function usePaginatedAPI<T = unknown>(
  endpoint: string | null,
  page: number = 1,
  limit: number = 10,
  options: Omit<UseAPIOptions, 'params'> & { params?: APIParams } = {}
) {
  const paginatedParams = {
    page,
    limit,
    ...options.params
  }

  const result = useAPI<T[]>(endpoint, {
    ...options,
    params: paginatedParams
  })

  const hasNextPage = result.data?.meta?.hasNext ?? false
  const hasPreviousPage = result.data?.meta?.hasPrevious ?? false
  const totalItems = result.data?.meta?.total ?? 0
  const totalPages = Math.ceil(totalItems / limit)

  return {
    ...result,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    totalPages,
    currentPage: page,
    pageSize: limit
  }
}

// Hook for infinite loading data
export function useInfiniteAPI<T = unknown>(
  endpoint: string | null,
  limit: number = 10,
  options: Omit<UseAPIOptions, 'params'> & { params?: APIParams } = {}
) {
  const pages = useRef<APIResponse<T[]>[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [allData, setAllData] = useState<T[]>([])

  const result = usePaginatedAPI<T>(
    endpoint,
    currentPage,
    limit,
    options
  )

  const loadMore = useCallback(async () => {
    if (result.hasNextPage && !result.isLoading) {
      setCurrentPage(prev => prev + 1)
    }
  }, [result.hasNextPage, result.isLoading])

  const reset = useCallback(() => {
    pages.current = []
    setCurrentPage(1)
    setAllData([])
  }, [])

  // Update accumulated data when new page loads
  useEffect(() => {
    if (result.data?.data) {
      if (currentPage === 1) {
        // First page, replace all data
        setAllData(result.data.data)
        pages.current = [result.data]
      } else {
        // Additional page, append data
        setAllData(prev => [...prev, ...result.data!.data])
        pages.current = [...pages.current, result.data]
      }
    }
  }, [result.data, currentPage])

  return {
    data: allData,
    error: result.error,
    isLoading: result.isLoading,
    isValidating: result.isValidating,
    hasNextPage: result.hasNextPage,
    totalItems: result.totalItems,
    loadMore,
    reset,
    refresh: result.refresh
  }
}

// Hook for real-time data with polling
export function useRealTimeAPI<T = unknown>(
  endpoint: string | null,
  intervalMs: number = 5000,
  options: UseAPIOptions = {}
) {
  return useAPI<T>(endpoint, {
    ...options,
    refreshInterval: intervalMs,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })
}

// Hook for user-specific data
export function useUserAPI<T = unknown>(
  endpoint: string | null,
  options: UseAPIOptions = {}
) {
  const user = useAppStore(state => state.user)
  const isAuthenticated = useAppStore(state => state.isAuthenticated)

  return useAPI<T>(
    endpoint && isAuthenticated ? endpoint : null,
    {
      ...options,
      enabled: isAuthenticated && (options.enabled ?? true)
    }
  )
}

// =============================================================================
// Mutation Hooks
// =============================================================================

export function useAPIMutation<TData = unknown, TParams = unknown>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options: {
    onSuccess?: (data: APIResponse<TData>, params: TParams) => void
    onError?: (error: APIError, params: TParams) => void
    optimisticUpdate?: (params: TParams) => TData
    relatedKeys?: string[] // Keys to revalidate after mutation
  } = {}
): UseMutationResult<TData, TParams> {
  const { onSuccess, onError, optimisticUpdate, relatedKeys = [] } = options
  const user = useAppStore(state => state.user)
  const { setOperationLoading, addNotification } = useAppStore(state => ({
    setOperationLoading: state.setOperationLoading,
    addNotification: state.addNotification
  }))

  const key = createSWRKey(endpoint, undefined, user?.id)

  // Mutation fetcher
  const mutationFetcher = useCallback(
    async (url: string, { arg }: { arg: TParams }) => {
      return swrFetcher<TData>(url, {
        method,
        body: arg
      })
    },
    [method]
  )

  const {
    trigger,
    data,
    error,
    isMutating,
    reset
  } = useSWRMutation(key, mutationFetcher, {
    onSuccess: (data, key, config) => {
      setOperationLoading('mutation-${endpoint}', false)
      onSuccess?.(data, config.arg)
      
      // Revalidate related keys
      import('swr').then(({ mutate }) => {
        relatedKeys.forEach(relatedKey => {
          mutate(relatedKey)
        })
      })

      // Show success notification
      addNotification({
        title: 'Success',
        message: data.message || 'Operation completed successfully',
        type: 'success'
      })

      // Track successful mutation
      webVitalsTracking.trackCustomMetric('api-mutation-success', 1, {
        endpoint,
        method
      })
    },
    onError: (error, key, config) => {
      setOperationLoading('mutation-${endpoint}', false)
      onError?.(error, config.arg)

      // Show error notification
      addNotification({
        title: 'Error',
        message: error.message || 'Operation failed',
        type: 'error'
      })

      // Track mutation error
      webVitalsTracking.trackCustomMetric('api-mutation-error', 1, {
        endpoint,
        method,
        error: error.message,
        status: error.status
      })
    },
    populateCache: false, // Don't automatically update cache
    revalidate: true // Revalidate after mutation
  })

  // Enhanced trigger with loading state
  const enhancedTrigger = useCallback(
    async (params: TParams) => {
      setOperationLoading('mutation-${endpoint}', true)
      
      try {
        const result = await trigger(params)
        return result
      } catch (_error) {
        throw error
      }
    },
    [trigger, endpoint, setOperationLoading]
  )

  return {
    trigger: enhancedTrigger,
    data,
    error,
    isMutating,
    reset
  }
}

// =============================================================================
// Utility Hooks
// =============================================================================

// Hook for preloading data
export function usePreloadAPI() {
  return useCallback((endpoint: string, params?: APIParams) => {
    const key = createSWRKey(endpoint, params)
    
    import('swr').then(({ mutate }) => {
      mutate(
        key,
        swrFetcher(endpoint, { method: 'GET' }),
        { revalidate: false }
      )
    })
  }, [])
}

// Hook for cache management
export function useCacheManager() {
  return {
    invalidate: useCallback((pattern: string | RegExp) => {
      import('swr').then(({ cache, mutate }) => {
        const keys = Array.from(cache.keys())
        
        keys.forEach(key => {
          if (typeof key === 'string') {
            const shouldInvalidate = typeof pattern === 'string' 
              ? key.includes(pattern)
              : pattern.test(key)
            
            if (shouldInvalidate) {
              mutate(key)
            }
          }
        })
      })
    }, []),
    
    clear: useCallback((pattern?: string | RegExp) => {
      import('swr').then(({ cache }) => {
        if (!pattern) {
          cache.clear()
          return
        }

        const keys = Array.from(cache.keys())
        
        keys.forEach(key => {
          if (typeof key === 'string') {
            const shouldClear = typeof pattern === 'string' 
              ? key.includes(pattern)
              : pattern.test(key)
            
            if (shouldClear) {
              cache.delete(key)
            }
          }
        })
      })
    }, []),
    
    prefetch: useCallback(async (endpoint: string, params?: APIParams) => {
      const key = createSWRKey(endpoint, params)
      
      try {
        const data = await swrFetcher(endpoint, { method: 'GET' })
        
        const { mutate } = await import('swr')
        mutate(key, data, false)
        
        return data
      } catch (error) {
        console.warn('Failed to prefetch data for endpoint: ${endpoint}', error)
        return null
      }
    }, [])
  }
}

// Import useState for infinite API hook
import { useState } from 'react'