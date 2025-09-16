'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface NavigationContextType {
  currentPath: string
  isLoading: boolean
  navigate: (path: string) => void
  prefetchRoute: (path: string) => void
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  const navigate = (path: string) => {
    setIsLoading(true)
    router.push(path)
  }

  const prefetchRoute = (path: string) => {
    router.prefetch(path)
  }

  // Reset loading state when navigation completes
  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  const value = {
    currentPath: pathname,
    isLoading,
    navigate,
    prefetchRoute
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}