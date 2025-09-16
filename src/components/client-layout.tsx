'use client'

import React from 'react'
import { NavigationProvider } from './navigation-provider'
import { AppNavigation } from './app-navigation'
import { MainContent } from './main-content'
import { Toaster } from './toaster'

export interface ClientLayoutProps {
  children: React.ReactNode
  industry: 'hs' | 'rest' | 'auto' | 'ret'
}

/**
 * Client-side layout wrapper that can be used in Server Component layouts
 * 
 * This component handles all the client-side features like Navigation Context
 * while allowing the main layout to remain a Server Component.
 */
export function ClientLayout({ children, industry }: ClientLayoutProps) {
  return (
    <NavigationProvider industry={industry} enablePrefetching>
      <div className="flex min-h-screen bg-background">
        <AppNavigation 
          industry={industry} 
          className="fixed left-0 top-0 h-full z-40"
        />
        
        <div className="flex-1 ml-64">
          <MainContent className="p-6">
            {children}
          </MainContent>
        </div>
      </div>
      
      <Toaster />
    </NavigationProvider>
  )
}
