// Server-side feature flags utility
export interface FeatureFlag {
  key: string
  enabled: boolean
  description?: string
  rolloutPercentage?: number
}

// Server-side feature flags configuration
const SERVER_FLAGS: FeatureFlag[] = [
  {
    key: 'ai-enhanced-search',
    enabled: true,
    description: 'Enable AI-enhanced search functionality',
    rolloutPercentage: 100
  },
  {
    key: 'new-dashboard-layout',
    enabled: false,
    description: 'New dashboard layout experiment',
    rolloutPercentage: 25
  },
  {
    key: 'voice-commands',
    enabled: false,
    description: 'Voice command interface',
    rolloutPercentage: 10
  },
  {
    key: 'pricing-calculator',
    enabled: true,
    description: 'Interactive pricing calculator',
    rolloutPercentage: 100
  },
  {
    key: 'advanced-analytics',
    enabled: false,
    description: 'Advanced analytics dashboard',
    rolloutPercentage: 50
  },
  {
    key: 'landingPages',
    enabled: true,
    description: 'Enable landing pages',
    rolloutPercentage: 100
  }
]

/**
 * Get all server-side feature flags
 */
export function getServerFlags(): FeatureFlag[] {
  return SERVER_FLAGS
}

/**
 * Check if a feature flag is enabled on the server
 */
export function isServerFlagEnabled(flagKey: string): boolean {
  const flag = SERVER_FLAGS.find(f => f.key === flagKey)
  return flag ? flag.enabled : false
}

/**
 * Alias for isServerFlagEnabled for backwards compatibility
 */
export function isEnabled(flagKey: string): boolean {
  return isServerFlagEnabled(flagKey)
}

/**
 * Get a specific server-side feature flag
 */
export function getServerFlag(flagKey: string): FeatureFlag | undefined {
  return SERVER_FLAGS.find(f => f.key === flagKey)
}

/**
 * Server-side feature flag evaluation with user-based rollout
 * In a real implementation, this would consider user ID, tenant, etc.
 */
export function evaluateServerFlag(flagKey: string, userId?: string): boolean {
  const flag = getServerFlag(flagKey)
  if (!flag) return false

  // If flag is disabled, return false
  if (!flag.enabled) return false

  // If no rollout percentage is set, return enabled status
  if (!flag.rolloutPercentage) return flag.enabled

  // If rollout is 100%, return enabled
  if (flag.rolloutPercentage >= 100) return true

  // Simple hash-based rollout for consistent user experience
  // In production, you'd use a proper feature flag service'
  if (userId) {
    const hash = simpleHash(userId + flagKey)
    const userPercentile = hash % 100
    return userPercentile < flag.rolloutPercentage
  }

  // Default fallback
  return flag.rolloutPercentage >= 50
}

/**
 * Simple hash function for consistent user rollouts
 */
function simpleHash(str: string): number {
  let hash = 0
  for (const i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Evaluate all feature flags and return as an object
 */
export function evaluateAllFlags(userId?: string): Record<string, boolean> {
  const result: Record<string, boolean> = {}
  
  SERVER_FLAGS.forEach(flag => {
    result[flag.key] = evaluateServerFlag(flag.key, userId)
  })

  // Legacy flag names for backwards compatibility
  result.newNavigation = result['new-dashboard-layout'] || false
  result.linkedinClone = false
  result.jobsApp = false
  result.affiliates = false
  result.landingPages = result['landingPages'] || true
  result.businessCertification = false
  result.investorRelations = false
  result.aboutUs = false
  
  return result
}

/**
 * Server flags context for SSR components
 */
export function createServerFlagsContext(userId?: string) {
  return {
    flags: SERVER_FLAGS,
    isEnabled: (flagKey: string) => evaluateServerFlag(flagKey, userId),
    getFlag: (flagKey: string) => getServerFlag(flagKey),
    evaluate: (flagKey: string) => evaluateServerFlag(flagKey, userId)
  }
}

// Default export for backwards compatibility
export default {
  getServerFlags,
  isServerFlagEnabled,
  getServerFlag,
  evaluateServerFlag,
  evaluateAllFlags,
  createServerFlagsContext
}