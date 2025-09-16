'use client'

import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { BusinessSidebar } from './business-sidebar'
import { UnifiedHeader } from './unified-header'
import type { BreadcrumbItem } from './unified-header'

interface UnifiedAppLayoutProps {
  children: React.ReactNode
  industry: 'ai' | 'hs' | 'rest' | 'auto' | 'ret' | 'books' | 'courses' | 'investigations' | 'payroll' | 'banking' | 'lom' | 'marketing'
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  showSearch?: boolean
  showNotifications?: boolean
  showSidebar?: boolean
  user?: {
    email: string
    id: string
    type: string
    name?: string
    avatar?: string
  }
}

export function UnifiedAppLayout({
  children,
  industry,
  title,
  description,
  breadcrumbs,
  actions,
  showSearch = true,
  showNotifications = true,
  showSidebar = true,
  user
}: UnifiedAppLayoutProps) {
  if (!showSidebar) {
    // Layout without sidebar (for landing pages, auth pages, etc.)
    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader
          title={title}
          description={description}
          industry={industry}
          breadcrumbs={breadcrumbs}
          actions={actions}
          showSearch={showSearch}
          showNotifications={showNotifications}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    )
  }

  // Layout with sidebar (for app pages)
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <BusinessSidebar user={user} industry={industry} />
        <SidebarInset>
          <UnifiedHeader
            title={title}
            description={description}
            industry={industry}
            breadcrumbs={breadcrumbs}
            actions={actions}
            showSearch={showSearch}
            showNotifications={showNotifications}
          />
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
