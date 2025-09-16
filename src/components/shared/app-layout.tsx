'use client'

/**
 * App Layout Component
 * 
 * Updated to use the UnifiedNavigation component that consolidates all navigation
 * patterns across the Thorbis Business OS platform. This follows the REUSE FIRST, 
 * CREATE LAST principle by using a single, configurable navigation system instead
 * of individual navigation components for each app.
 * 
 * Features:
 * - Uses UnifiedNavigation for consistent navigation across all industry apps
 * - Supports overlay-free responsive design
 * - Includes proper dark-first Odixe design system styling
 * - Integrates with NavigationProvider for prefetching and state management
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavigationProvider } from './navigation-provider'
import { UnifiedNavigation } from './unified-navigation'
import { MainContent } from './main-content'
import { Toaster } from './toaster'
import type { Industry } from '../configs/navigation-configs'

export interface AppLayoutProps {
  children: React.ReactNode
  industry: Industry
  layout?: 'sidebar' | 'header' | 'sidebar-with-header'
  user?: {
    name: string
    email: string
    role?: string
    avatar?: string
  }
}

/**
 * Client-side App Layout for industry apps
 * 
 * This component handles all the client-side features like Navigation Context
 * while being safely importable from server layouts.
 * 
 * Now uses the UnifiedNavigation component to provide consistent navigation
 * across all industry verticals without code duplication.
 */
export function AppLayout({ 
  children, 
  industry, 
  layout = 'sidebar',
  user = {
    name: 'Demo User',
    email: 'demo@thorbis.com',
    role: 'Administrator'
  }
}: AppLayoutProps) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleSearch = (query: string) => {
    console.log('Search query:', query)
    // TODO: Implement search functionality
  }

  const handleNotificationClick = () => {
    console.log('Notifications clicked')
    // TODO: Implement notification system
  }

  const handleUserMenuAction = (action: 'profile' | 'settings' | 'logout') => {
    console.log('User menu action:', action)
    switch (action) {
      case 'profile':
        // TODO: Navigate to profile page
        console.log('Navigating to profile')
        break
      case 'settings':
        router.push('/dashboards/settings')
        break
      case 'logout':
        // TODO: Implement logout functionality
        console.log('Logging out')
        break
    }
  }

  return (
    <NavigationProvider industry={industry} enablePrefetching>
      <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Unified Navigation */}
        <UnifiedNavigation
          industry={industry}
          layout={layout}
          collapsed={sidebarCollapsed}
          user={user}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSearch={handleSearch}
          onNotificationClick={handleNotificationClick}
          onUserMenuAction={handleUserMenuAction}
          notificationCount={3}
          className="fixed left-0 top-0 h-full z-40"
        />
        
        {/* Main Content Area */}
        <div className={'flex-1 transition-all duration-200 ${
          layout === 'sidebar' 
            ? sidebarCollapsed 
              ? 'ml-16' 
              : 'ml-64'
            : '
              }'}>'
          <MainContent className="p-6">
            {children}
          </MainContent>
        </div>
      </div>
      
      <Toaster />
    </NavigationProvider>
  )
}
