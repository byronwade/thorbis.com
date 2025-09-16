'use client'

import React, { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

export interface AppWrapperProps {
  children: React.ReactNode
}

interface SecurityContext {
  departmentId: string | null
  officerId: string | null
  role: string | null
  permissions: string[]
  badgeNumber: string | null
}

interface SystemStatus {
  isOnline: boolean
  lastSync: string | null
  securityLevel: 'standard' | 'enhanced' | 'critical'
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [securityContext, setSecurityContext] = useState<SecurityContext>({
    departmentId: null,
    officerId: null,
    role: null,
    permissions: [],
    badgeNumber: null
  })
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isOnline: navigator.onLine || true,
    lastSync: null,
    securityLevel: 'standard'
  })

  // Security Context Management
  useEffect(() => {
    const initializeSecurityContext = async () => {
      try {
        const token = localStorage.getItem('investigations_auth_token')
        if (token) {
          const response = await fetch('/api/v1/auth/user', {
            headers: { Authorization: 'Bearer ${token}' }
          })
          
          if (response.ok) {
            const claims = await response.json()
            setSecurityContext({
              departmentId: claims.department_id,
              officerId: claims.sub,
              role: claims.role,
              permissions: claims.permissions || [],
              badgeNumber: claims.badge_number
            })
          }
        }
      } catch (error) {
        console.error('Failed to initialize security context:', error)
        localStorage.removeItem('investigations_auth_token')
      }
    }

    initializeSecurityContext()
  }, [])

  // System Status Management
  useEffect(() => {
    const handleOnline = () => setSystemStatus(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setSystemStatus(prev => ({ ...prev, isOnline: false }))
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Security Event Monitoring
  useEffect(() => {
    if (securityContext.officerId) {
      const logSecurityEvent = (event: string) => {
        fetch('/api/security/audit-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            officer_id: securityContext.officerId,
            badge_number: securityContext.badgeNumber,
            event,
            timestamp: new Date().toISOString(),
            path: window.location.pathname
          })
        }).catch(() => {}) // Silent fail
      }

      // Log session start
      logSecurityEvent('session_start')

      // Log page visibility changes for security
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          navigator.sendBeacon('/api/security/session-event', JSON.stringify({
            officer_id: securityContext.officerId,
            event: 'session_pause',
            timestamp: new Date().toISOString()
          }))
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        logSecurityEvent('session_end')
      }
    }
  }, [securityContext.officerId])

  return (
    <div className="min-h-screen bg-neutral-950 relative">
      {/* System Status Indicators */}
      {!systemStatus.isOnline && (
        <div className="bg-red-600 text-white px-4 py-2 text-sm text-center">
          <span className="font-medium">OFFLINE MODE</span> - Evidence sync paused. Secure connection required.
        </div>
      )}
      
      {systemStatus.securityLevel === 'critical' && (
        <div className="bg-yellow-600 text-black px-4 py-2 text-sm text-center font-medium">
          CRITICAL SECURITY MODE - Enhanced monitoring active
        </div>
      )}
      
      {/* Security Context Provider */}
      <div data-security-context={JSON.stringify(securityContext)} style={{ display: 'none' }} />
      
      {/* Main Content */}
      {children}
      
      {/* Toast Notifications */}
      <Toaster 
        theme="dark"
        position="top-right"
        closeButton
        richColors
      />
      
      {/* Security Monitoring */}
      <SecurityMonitor securityContext={securityContext} />
    </div>
  )
}

// Security monitoring component for law enforcement compliance
function SecurityMonitor({ securityContext }: { securityContext: SecurityContext }) {
  useEffect(() => {
    if (!securityContext.officerId) return

    // Monitor suspicious activity patterns
    const monitorActivity = () => {
      const activities = JSON.parse(localStorage.getItem('officer_activities') || '[]')
      
      // Security audit: Report patterns to compliance system
      if (activities.length > 50) {
        fetch('/api/security/activity-audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            officer_id: securityContext.officerId,
            badge_number: securityContext.badgeNumber,
            activity_summary: activities.slice(-10),
            timestamp: new Date().toISOString()
          })
        }).catch(() => {})
        
        // Keep recent activities for compliance
        localStorage.setItem('officer_activities', JSON.stringify(activities.slice(-25)))
      }
    }

    // Monitor every 3 minutes for law enforcement compliance
    const interval = setInterval(monitorActivity, 3 * 60 * 1000)
    return () => clearInterval(interval)
  }, [securityContext])

  return null
}