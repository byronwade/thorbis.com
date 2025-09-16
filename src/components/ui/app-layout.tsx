'use client'

import React from 'react'
import { NavigationProvider } from './navigation-provider'
import { AppNavigation } from './app-navigation'
import { MainContent } from './main-content'
import { Toaster } from './toaster'

export interface AppLayoutProps {
  children: React.ReactNode
  industry: 'hs' | 'rest' | 'auto' | 'ret'
}

/**
 * Client-side App Layout for industry apps
 * 
 * This component handles all the client-side features like Navigation Context
 * while being safely importable from server layouts.
 */
export function AppLayout({ children, industry }: AppLayoutProps) {
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
