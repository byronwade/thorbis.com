import { create } from 'zustand'
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  notificationsEnabled: boolean
  language: string
  timezone: string
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'courses' | 'investigations'
}

export interface AppSettings {
  performanceMonitoring: boolean
  errorReporting: boolean
  webVitalsTracking: boolean
  debugMode: boolean
  analyticsEnabled: boolean
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export interface NavigationState {
  currentPath: string
  previousPath: string
  breadcrumbs: Array<{ label: string; href: string }>
  sidebarOpen: boolean
  commandPaletteOpen: boolean
}

export interface LoadingState {
  global: boolean
  operations: Record<string, boolean>
}

export interface ErrorState {
  errors: Array<{
    id: string
    message: string
    timestamp: number
    component?: string
    stack?: string
  }>
  lastError: string | null
}

// =============================================================================
// Main Application Store
// =============================================================================

interface AppStore {
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // App settings
  settings: AppSettings
  
  // UI state
  navigation: NavigationState
  notifications: Notification[]
  loading: LoadingState
  errors: ErrorState
  
  // Actions
  setUser: (user: User | null) => void
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  
  // Navigation actions
  setCurrentPath: (path: string) => void
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href: string }>) => void
  toggleSidebar: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
  clearAllNotifications: () => void
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void
  setOperationLoading: (operation: string, loading: boolean) => void
  
  // Error actions
  addError: (error: { message: string; component?: string; stack?: string }) => void
  clearError: (id: string) => void
  clearAllErrors: () => void
  
  // Utility actions
  reset: () => void
}

const initialState = {
  user: null,
  isAuthenticated: false,
  settings: {
    performanceMonitoring: true,
    errorReporting: true,
    webVitalsTracking: true,
    debugMode: process.env.NODE_ENV === 'development',
    analyticsEnabled: true,
  },
  navigation: {
    currentPath: '/',
    previousPath: '/',
    breadcrumbs: [],
    sidebarOpen: false,
    commandPaletteOpen: false,
  },
  notifications: [],
  loading: {
    global: false,
    operations: Record<string, unknown>,
  },
  errors: {
    errors: [],
    lastError: null,
  },
}

export const useAppStore = create<AppStore>()(
  persist(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,
        
        // User actions
        setUser: (user) => set((state) => {
          state.user = user
          state.isAuthenticated = !!user
        }),
        
        updateUserPreferences: (preferences) => set((state) => {
          if (state.user) {
            state.user.preferences = { ...state.user.preferences, ...preferences }
          }
        }),
        
        updateSettings: (settings) => set((state) => {
          state.settings = { ...state.settings, ...settings }
        }),
        
        // Navigation actions
        setCurrentPath: (path) => set((state) => {
          state.navigation.previousPath = state.navigation.currentPath
          state.navigation.currentPath = path
        }),
        
        setBreadcrumbs: (breadcrumbs) => set((state) => {
          state.navigation.breadcrumbs = breadcrumbs
        }),
        
        toggleSidebar: () => set((state) => {
          state.navigation.sidebarOpen = !state.navigation.sidebarOpen
        }),
        
        openCommandPalette: () => set((state) => {
          state.navigation.commandPaletteOpen = true
        }),
        
        closeCommandPalette: () => set((state) => {
          state.navigation.commandPaletteOpen = false
        }),
        
        // Notification actions
        addNotification: (notification) => set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}',
            timestamp: Date.now(),
            read: false,
          }
          state.notifications.unshift(newNotification)
          
          // Keep only the last 100 notifications
          if (state.notifications.length > 100) {
            state.notifications = state.notifications.slice(0, 100)
          }
        }),
        
        removeNotification: (id) => set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id)
        }),
        
        markNotificationAsRead: (id) => set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (notification) {
            notification.read = true
          }
        }),
        
        clearAllNotifications: () => set((state) => {
          state.notifications = []
        }),
        
        // Loading actions
        setGlobalLoading: (loading) => set((state) => {
          state.loading.global = loading
        }),
        
        setOperationLoading: (operation, loading) => set((state) => {
          if (loading) {
            state.loading.operations[operation] = true
          } else {
            delete state.loading.operations[operation]
          }
        }),
        
        // Error actions
        addError: (error) => set((state) => {
          const newError = {
            ...error,
            id: 'error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}',
            timestamp: Date.now(),
          }
          state.errors.errors.unshift(newError)
          state.errors.lastError = error.message
          
          // Keep only the last 50 errors
          if (state.errors.errors.length > 50) {
            state.errors.errors = state.errors.errors.slice(0, 50)
          }
        }),
        
        clearError: (id) => set((state) => {
          state.errors.errors = state.errors.errors.filter(e => e.id !== id)
        }),
        
        clearAllErrors: () => set((state) => {
          state.errors.errors = []
          state.errors.lastError = null
        }),
        
        // Reset action
        reset: () => set(() => initialState),
      }))
    ),
    {
      name: 'thorbis-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
        navigation: {
          sidebarOpen: state.navigation.sidebarOpen,
        },
      }),
    }
  )
)

// =============================================================================
// Specialized Stores
// =============================================================================

// Performance monitoring store
interface PerformanceStore {
  metrics: Record<string, { value: number; timestamp: number }>
  thresholds: Record<string, { good: number; poor: number }>
  
  updateMetric: (name: string, value: number) => void
  setThresholds: (thresholds: Record<string, { good: number; poor: number }>) => void
  getMetricStatus: (name: string, value: number) => 'good' | 'needs-improvement' | 'poor'
  clearMetrics: () => void
}

export const usePerformanceStore = create<PerformanceStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      metrics: Record<string, unknown>,
      thresholds: {
        LCP: { good: 2500, poor: 4000 },
        INP: { good: 200, poor: 500 },
        CLS: { good: 0.1, poor: 0.25 },
        FCP: { good: 1800, poor: 3000 },
        TTFB: { good: 800, poor: 1800 },
      },
      
      updateMetric: (name, value) => set((state) => {
        state.metrics[name] = { value, timestamp: Date.now() }
      }),
      
      setThresholds: (thresholds) => set((state) => {
        state.thresholds = { ...state.thresholds, ...thresholds }
      }),
      
      getMetricStatus: (name, value) => {
        const state = get()
        const threshold = state.thresholds[name]
        if (!threshold) return 'good'
        
        if (value <= threshold.good) return 'good'
        if (value <= threshold.poor) return 'needs-improvement'
        return 'poor'
      },
      
      clearMetrics: () => set((state) => {
        state.metrics = {}
      }),
    }))
  )
)

// Feature flags store
interface FeatureFlagsStore {
  flags: Record<string, boolean>
  
  setFlag: (name: string, enabled: boolean) => void
  isEnabled: (name: string) => boolean
  toggleFlag: (name: string) => void
  loadFlags: (flags: Record<string, boolean>) => void
}

export const useFeatureFlagsStore = create<FeatureFlagsStore>()(
  persist(
    immer((set, get) => ({
      flags: {
        'enhanced-analytics': true,
        'web-vitals-tracking': true,
        'error-monitoring': true,
        'performance-insights': true,
        'ai-recommendations': false,
        'beta-features': false,
      },
      
      setFlag: (name, enabled) => set((state) => {
        state.flags[name] = enabled
      }),
      
      isEnabled: (name) => {
        const state = get()
        return state.flags[name] ?? false
      },
      
      toggleFlag: (name) => set((state) => {
        state.flags[name] = !state.flags[name]
      }),
      
      loadFlags: (flags) => set((state) => {
        state.flags = { ...state.flags, ...flags }
      }),
    })),
    {
      name: 'thorbis-feature-flags',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// =============================================================================
// Store Subscriptions and Effects
// =============================================================================

// Subscribe to user changes to sync with error monitoring
useAppStore.subscribe(
  (state) => state.user,
  (user) => {
    if (typeof window !== 'undefined') {
      // Sync user with error monitoring service
      import('../lib/error-monitoring').then(({ errorMonitoring }) => {
        if (user) {
          errorMonitoring.setUserId(user.id)
        }
      }).catch(console.error)
    }
  }
)

// Subscribe to settings changes
useAppStore.subscribe(
  (state) => state.settings,
  (settings) => {
    if (typeof window !== 'undefined') {
      // Update global settings for monitoring services
      if (settings.performanceMonitoring) {
        import('../lib/web-vitals-tracking').then(({ webVitalsTracking }) => {
          webVitalsTracking.updateConfig({
            enableDebugLogging: settings.debugMode
          })
        }).catch(console.error)
      }
    }
  }
)

// Subscribe to theme changes
useAppStore.subscribe(
  (state) => state.user?.preferences.theme,
  (theme) => {
    if (typeof window !== 'undefined' && theme) {
      const root = window.document.documentElement
      
      if (theme === 'light') {
        root.classList.remove('dark')
      } else if (theme === 'dark') {
        root.classList.add('dark')
      } else {
        // System theme
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (systemDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }
  }
)

// =============================================================================
// Utility Hooks
// =============================================================================

// Hook for managing loading states
export function useLoading() {
  const setGlobalLoading = useAppStore(state => state.setGlobalLoading)
  const setOperationLoading = useAppStore(state => state.setOperationLoading)
  const globalLoading = useAppStore(state => state.loading.global)
  const operations = useAppStore(state => state.loading.operations)
  
  const isLoading = (operation?: string) => {
    if (operation) {
      return operations[operation] ?? false
    }
    return globalLoading
  }
  
  const withLoading = async <T>(
    operation: string,
    callback: () => Promise<T>
  ): Promise<T> => {
    setOperationLoading(operation, true)
    try {
      return await callback()
    } finally {
      setOperationLoading(operation, false)
    }
  }
  
  return {
    isLoading,
    setGlobalLoading,
    setOperationLoading,
    withLoading,
    globalLoading,
    operations: Object.keys(operations),
  }
}

// Hook for notifications
export function useNotifications() {
  const notifications = useAppStore(state => state.notifications)
  const addNotification = useAppStore(state => state.addNotification)
  const removeNotification = useAppStore(state => state.removeNotification)
  const markAsRead = useAppStore(state => state.markNotificationAsRead)
  const clearAll = useAppStore(state => state.clearAllNotifications)
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  const notify = {
    success: (title: string, message: string) => addNotification({ title, message, type: 'success' }),
    error: (title: string, message: string) => addNotification({ title, message, type: 'error' }),
    warning: (title: string, message: string) => addNotification({ title, message, type: 'warning' }),
    info: (title: string, message: string) => addNotification({ title, message, type: 'info' }),
  }
  
  return {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    notify,
  }
}

// Hook for error management
export function useErrors() {
  const errors = useAppStore(state => state.errors.errors)
  const lastError = useAppStore(state => state.errors.lastError)
  const addError = useAppStore(state => state.addError)
  const clearError = useAppStore(state => state.clearError)
  const clearAllErrors = useAppStore(state => state.clearAllErrors)
  
  return {
    errors,
    lastError,
    addError,
    clearError,
    clearAllErrors,
    hasErrors: errors.length > 0,
  }
}

// Hook for feature flags
export function useFeatureFlag(flagName: string) {
  const isEnabled = useFeatureFlagsStore(state => state.isEnabled(flagName))
  const setFlag = useFeatureFlagsStore(state => state.setFlag)
  const toggleFlag = useFeatureFlagsStore(state => state.toggleFlag)
  
  return {
    isEnabled,
    enable: () => setFlag(flagName, true),
    disable: () => setFlag(flagName, false),
    toggle: () => toggleFlag(flagName),
  }
}

export default useAppStore