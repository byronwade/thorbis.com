'use client'

import React, { ReactNode, useEffect } from 'react'
import { SWRConfig } from 'swr'
import { swrConfig, clearCache, getCacheStats } from '@/lib/swr-config'
import { useAppStore } from '@/lib/store'

interface SWRProviderProps {
  children: ReactNode
  fallback?: Record<string, unknown>
}

export function SWRProvider({ children, fallback = {} }: SWRProviderProps) {
  const user = useAppStore(state => state.user)
  const isAuthenticated = useAppStore(state => state.isAuthenticated)

  // Enhanced SWR configuration with user context
  const enhancedConfig = {
    ...swrConfig,
    fallback: {
      ...swrConfig.fallback,
      ...fallback
    },
    
    // Add user context to fetcher
    fetcher: (url: string, options: unknown = {}) => {
      return swrConfig.fetcher!(url, {
        ...options,
        headers: {
          ...options.headers,
          ...(user && {
            'X-User-ID': user.id,
            'X-User-Role': user.role,
            'X-User-Industry': user.preferences.industry
          })
        }
      })
    }
  }

  // Clear cache when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearCache(/user:/) // Clear user-specific cache entries
    }
  }, [isAuthenticated])

  // Debug cache in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(async () => {
        const stats = await getCacheStats()
        if (stats.totalKeys > 0) {
          console.log('SWR Cache Stats:', stats)
        }
      }, 30000) // Log every 30 seconds

      return () => clearInterval(interval)
    }
  }, [])

  return (
    <SWRConfig value={enhancedConfig}>
      {children}
    </SWRConfig>
  )
}

export default SWRProvider