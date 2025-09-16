'use client'

import React, { useEffect, useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { SharedFeatureSidebar } from './shared-feature-sidebar'
import { BusinessInterface } from './business-interface'

import { RouteContext } from '@/lib/route-detection'
import { NavigationState } from '@/lib/navigation-config-loader'

export interface SharedAppWrapperProps {
  children: React.ReactNode
  routeContext: RouteContext
  navigationState: NavigationState | null
  isNavigating?: boolean
}

interface SecurityContext {
  businessId: string | null
  userId: string | null
  role: string | null
  permissions: string[]
}

interface PWAStatus {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  syncStatus: 'idle' | 'syncing' | 'error'
}

interface HardwareStatus {
  printerConnected: boolean
  scannerConnected: boolean
  sessionId: string | null
}

export function SharedAppWrapper({ children, routeContext, navigationState, isNavigating = false }: SharedAppWrapperProps) {
  const industry = routeContext.industry
  const appName = navigationState?.config.appName || routeContext.appName
  const showInstallBanner = routeContext.isVertical && !routeContext.isAdmin
  
  // Get sidebar configuration from navigation state
  const sidebarConfig = navigationState?.config?.sidebar
  
  const [securityContext, setSecurityContext] = useState<SecurityContext>({
    businessId: null,
    userId: null,
    role: null,
    permissions: []
  })
  
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true, // Always start with true to avoid hydration mismatch
    syncStatus: 'idle'
  })
  
  const [isClient, setIsClient] = useState(false)
  
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus>({
    printerConnected: false,
    scannerConnected: false,
    sessionId: null
  })

  // PWA Installation and Service Worker Management
  useEffect(() => {
    setIsClient(true)
    
    // Update online status after hydration
    if (typeof navigator !== 'undefined') {
      setPwaStatus(prev => ({ ...prev, isOnline: navigator.onLine }))
    }

    // Register service worker for PWA features
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          // Log to structured logging service instead of console
          logServiceWorkerEvent('service_worker_registered', { scope: registration.scope });
        })
        .catch((error) => {
          // Log to structured logging service instead of console
          logServiceWorkerEvent('service_worker_registration_failed', { error: error.message });
        });
    }
    
    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      ;(window as any).deferredPrompt = e
      setPwaStatus(prev => ({ ...prev, isInstallable: true }))
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setPwaStatus(prev => ({ ...prev, isInstalled: true }))
      }

      // Online/offline status
      const handleOnline = () => setPwaStatus(prev => ({ ...prev, isOnline: true }))
      const handleOffline = () => setPwaStatus(prev => ({ ...prev, isOnline: false }))
      
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  // Security Context Management
  useEffect(() => {
    // Initialize security context from JWT token
    const initializeSecurityContext = async () => {
      try {
        const token = localStorage.getItem('thorbis_auth_token')
        if (token) {
          // Validate token and extract claims
          const response = await fetch('/api/v1/auth/user', {
            headers: { Authorization: 'Bearer ${token}' }
          })
          
          if (response.ok) {
            const claims = await response.json()
            setSecurityContext({
              businessId: claims.business_id,
              userId: claims.sub,
              role: claims.role,
              permissions: claims.permissions || []
            })
          }
        }
      } catch (error) {
        // Log to structured logging service instead of console
        logSecurityEvent('security_context_init_failed', { error: error.message })
        // Clear invalid token
        localStorage.removeItem('thorbis_auth_token')
      }
    }

    initializeSecurityContext()
  }, [])

  // Hardware Integration Management
  useEffect(() => {
    // Initialize hardware connections
    const initializeHardware = async () => {
      try {
        // Check for available hardware
        const hardwareResponse = await fetch('/api/v1/hardware/status')
        if (hardwareResponse.ok) {
          const hardware = await hardwareResponse.json()
          setHardwareStatus({
            printerConnected: hardware.printer?.connected || false,
            scannerConnected: hardware.scanner?.connected || false,
            sessionId: hardware.session_id
          })
        }
      } catch (error) {
        // Log to structured logging service instead of console
        logHardwareEvent('hardware_init_failed', { error: error.message })
      }
    }

    if (securityContext.businessId) {
      initializeHardware()
    }
  }, [securityContext.businessId])

  // Background Sync Management
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof window !== 'undefined' && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        // Register background sync events
        ;(registration as any).sync.register('data-sync')
      })
    }
  }, [securityContext.businessId])

  // AI Safety Monitoring
  useEffect(() => {
    // Monitor for suspicious activity patterns
    const monitorActivity = () => {
      // Track user interactions for safety analysis
      const activities = JSON.parse(localStorage.getItem('user_activities') || '[]')
      
      // AI Safety: Report unusual patterns
      if (activities.length > 100) {
        fetch('/api/security/activity-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: securityContext.businessId,
            user_id: securityContext.userId,
            activity_summary: activities.slice(-10) // Last 10 activities
          })
        }).catch(error => logSecurityEvent('activity_report_failed', { error: error.message }))
        
        // Keep only recent activities
        localStorage.setItem('user_activities', JSON.stringify(activities.slice(-50)))
      }
    }

    const interval = setInterval(monitorActivity, 5 * 60 * 1000) // Every 5 minutes
    return () => clearInterval(interval)
  }, [securityContext])

  // Get real user data from authentication system
  const [user, setUser] = useState<{
    email: string;
    id: string;
    type: string;
    name?: string;
    avatar?: string;
    full_name?: string;
    username?: string;
  } | null>(null)

  // Load user data from authentication system using proper Supabase patterns
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get the Supabase client and use auth.getUser() for trusted server-side data
        const { createSupabaseClient } = await import('@/lib/supabase')
        const supabase = createSupabaseClient()
        
        // Use getUser() for server-validated user data (not getSession())
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          // Log to structured logging service instead of console
          logAuthEvent('supabase_auth_error', { error: error.message })
          throw error
        }
        
        if (user) {
          // Use user metadata for basic profile info (documented pattern)
          const displayName = user.user_metadata?.full_name || 
                             user.user_metadata?.name || 
                             user.email?.split('@')[0] || 'User'
          
          // Try to fetch extended profile data from profiles table if it exists
          let profileData = null
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, full_name, avatar_url, website')
              .eq('id', user.id)
              .single()
            
            profileData = profile
          } catch (_error) {
            // Profiles table doesn't exist or no profile data - use metadata only
            // Log to structured logging service instead of console
            logAuthEvent('profile_data_not_found', { userId: user.id })
          }
          
          // Set user data combining auth user and profile data
          setUser({
            email: user.email || ',
            id: user.id,
            type: 'business',
            name: profileData?.full_name || displayName,
            avatar: profileData?.avatar_url || user.user_metadata?.avatar_url,
            full_name: profileData?.full_name || user.user_metadata?.full_name,
            username: profileData?.username || user.user_metadata?.username || user.email?.split('@')[0]
          })
          
        } else {
          // Fallback to mock auth for development
          // Log to structured logging service instead of console
          logAuthEvent('no_supabase_user_found', {})
          const { mockAuth } = await import('@/lib/mock-auth')
          const { data } = await mockAuth.getUser()
          
          if (data.user) {
            setUser({
              email: data.user.email,
              id: data.user.id,
              type: 'business', 
              name: '${data.user.first_name || ''} ${data.user.last_name || ''}'.trim() || data.user.email.split('@')[0],
              full_name: '${data.user.first_name || ''} ${data.user.last_name || ''}'.trim(),
              username: data.user.email.split('@')[0]
            })
          } else {
            throw new Error('No authenticated user found')
          }
        }
      } catch (error) {
        // Log to structured logging service instead of console
        logAuthEvent('user_data_load_failed', { error: error.message })
        // Set fallback guest user data
        setUser({
          email: 'guest@thorbis.com',
          id: 'guest-user',
          type: 'business',
          name: 'Guest User'
        })
      }
    }

    loadUserData()
  }, [])

  return (
    <div className="h-screen bg-background text-foreground relative dashboard-content" data-page-transition>
      {/* Navigation Progress Indicator */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-blue-500 animate-pulse" style={{ 
            animation: 'navigationProgress 0.3s ease-out' 
          }} />
        </div>
      )}
      
      {/* PWA Status Indicator - Only show after client hydration */}
      {isClient && !pwaStatus.isOnline && (
        <div className="bg-orange-600 text-white px-4 py-2 text-sm text-center fixed top-0 left-0 right-0 z-40">
          Working offline - Changes will sync when connection is restored
        </div>
      )}
      
      {/* Security Context Provider */}
      <div data-security-context={JSON.stringify(securityContext)} style={{ display: 'none' }} />
      
      {/* Hardware Status Provider */}
      <div data-hardware-status={JSON.stringify(hardwareStatus)} style={{ display: 'none' }} />
      
      
      {/* Main App Content */}
      <SidebarProvider 
        key={industry} 
        defaultOpen={sidebarConfig?.defaultOpen ?? false}
      >
        {/* Use SharedFeatureSidebar for all routes */}
        <SharedFeatureSidebar user={user} />
        <SidebarInset className="h-full">
          {user ? (
            <BusinessInterface 
              user={user} 
              currentIndustry={industry}
              appName={appName}
            >
              {children}
            </BusinessInterface>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center space-x-3 text-neutral-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span>Loading user profile...</span>
              </div>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
      
      {/* Enhanced Toast System */}
      <Toaster />
      
      {/* Performance Monitoring */}
      <PerformanceMonitor />
      
      {/* Security Event Logger */}
      <SecurityEventLogger securityContext={securityContext} />
    </div>
  )
}

// Performance monitoring component
function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            
            // Record navigation timing
            fetch('/api/metrics/performance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'navigation',
                load_time: navEntry.loadEventEnd - navEntry.fetchStart,
                dom_content_loaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                first_byte: navEntry.responseStart - navEntry.fetchStart
              })
            }).catch(() => {}) // Silent fail
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation'] })
    }
  }, [])
  
  return null
}

// Security event logging component
function SecurityEventLogger({ securityContext }: { securityContext: SecurityContext }) {
  useEffect(() => {
    // Log page views for security analysis
    const logPageView = () => {
      if (securityContext.businessId) {
        fetch('/api/security/page-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: securityContext.businessId,
            user_id: securityContext.userId,
            path: window.location.pathname,
            timestamp: new Date().toISOString()
          })
        }).catch(() => {}) // Silent fail
      }
    }

    logPageView()
    
    // Log page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && securityContext.businessId) {
        // User left the page - log for security analysis
        if (typeof navigator !== 'undefined') {
          navigator.sendBeacon('/api/security/session-event', JSON.stringify({
            business_id: securityContext.businessId,
            user_id: securityContext.userId,
            event: 'page_hidden',
            timestamp: new Date().toISOString()
          }))
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [securityContext])
  
  return null
}

// Structured logging helpers to replace console statements
const logServiceWorkerEvent = (action: string, context: Record<string, unknown>) => {
  fetch('/api/v1/logs/info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: 'shared-app-wrapper',
      category: 'service-worker',
      action,
      context,
      timestamp: new Date().toISOString()
    })
  }).catch(() => {}); // Silent fail for logging
};

const logSecurityEvent = (action: string, context: Record<string, unknown>) => {
  fetch('/api/v1/logs/security', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: 'shared-app-wrapper',
      category: 'security',
      action,
      context,
      timestamp: new Date().toISOString()
    })
  }).catch(() => {}); // Silent fail for logging
};

const logHardwareEvent = (action: string, context: Record<string, unknown>) => {
  fetch('/api/v1/logs/info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: 'shared-app-wrapper',
      category: 'hardware',
      action,
      context,
      timestamp: new Date().toISOString()
    })
  }).catch(() => {}); // Silent fail for logging
};

const logAuthEvent = (action: string, context: Record<string, unknown>) => {
  fetch('/api/v1/logs/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: 'shared-app-wrapper',
      category: 'authentication',
      action,
      context,
      timestamp: new Date().toISOString()
    })
  }).catch(() => {}); // Silent fail for logging
};