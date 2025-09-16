'use client'

import { Sidebar } from './sidebar'
import { RouteGuard } from '../auth/route-guard'
import { SessionExpirationWarning } from '../auth/session-expiration-warning'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-900 text-white">
        <SessionExpirationWarning />
        <Sidebar />
        
        {/* Main content */}
        <main className="lg:pl-64">
          <div className="p-6 pt-16 lg:pt-6">
            {children}
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}