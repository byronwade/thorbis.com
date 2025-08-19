/**
 * Vercel Analytics Feature Flag Integration
 * Ensures feature flags are properly tracked and displayed in Vercel Web Analytics
 */

import { track } from '@vercel/analytics';
import logger from "@lib/utils/logger";

export interface FlagAnalyticsOptions {
  immediate?: boolean;
  userId?: string;
  sessionId?: string;
}

/**
 * Reports feature flag value to Vercel Analytics
 * This is critical for flags to show up in the Vercel dashboard
 */
export async function reportFlagValue(
  flagKey: string, 
  value: boolean, 
  options: FlagAnalyticsOptions = {}
): Promise<void> {
  try {
    // Track the flag usage with Vercel Analytics
    await track('feature_flag_evaluation', {
      flag: flagKey,
      enabled: value,
      timestamp: Date.now(),
      userId: options.userId || 'anonymous',
      sessionId: options.sessionId || generateSessionId(),
    }, { 
      flags: { [flagKey]: value } // This is the key part for Vercel Analytics
    });

    logger.debug(`Feature flag reported to analytics: ${flagKey}=${value}`);
  } catch (error) {
    logger.error(`Failed to report flag to analytics: ${flagKey}`, error);
    // Don't throw - analytics failures shouldn't break the app
  }
}

/**
 * Reports multiple feature flags at once for better performance
 */
export async function reportAllFlags(
  flags: Record<string, boolean>,
  options: FlagAnalyticsOptions = {}
): Promise<void> {
  try {
    // Batch report all flags to Vercel Analytics
    await track('feature_flags_batch', {
      flags,
      timestamp: Date.now(),
      userId: options.userId || 'anonymous',
      sessionId: options.sessionId || generateSessionId(),
    }, {
      flags // Pass all flags to Vercel Analytics for tracking
    });

    logger.debug(`Batch reported ${Object.keys(flags).length} flags to analytics`);
  } catch (error) {
    logger.error('Failed to batch report flags to analytics', error);
  }
}

/**
 * Emits feature flag values to the DOM for Vercel Analytics to detect
 * This is required for flags to appear in the dashboard
 */
export function emitFlagsToDOM(flags: Record<string, boolean>): void {
  if (typeof document === 'undefined') return;

  try {
    // Set data attributes on the body for each flag
    Object.entries(flags).forEach(([key, value]) => {
      const attribute = `data-flag-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      document.body.setAttribute(attribute, value ? '1' : '0');
    });

    // Set a general flag indicating flags are loaded
    document.body.setAttribute('data-flags-loaded', '1');
    
    logger.debug(`Emitted ${Object.keys(flags).length} flags to DOM`);
  } catch (error) {
    logger.error('Failed to emit flags to DOM', error);
  }
}

/**
 * Tracks a flag-gated feature usage event
 */
export async function trackFlaggedFeature(
  featureName: string,
  flagKey: string,
  enabled: boolean,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await track('flagged_feature_used', {
      feature: featureName,
      flag: flagKey,
      enabled,
      ...metadata,
      timestamp: Date.now(),
    }, {
      flags: { [flagKey]: enabled }
    });

    logger.debug(`Tracked flagged feature usage: ${featureName} (${flagKey}=${enabled})`);
  } catch (error) {
    logger.error(`Failed to track flagged feature: ${featureName}`, error);
  }
}

/**
 * Performance monitoring for flag evaluation
 */
export async function trackFlagPerformance(
  operation: string,
  duration: number,
  flagsEvaluated: number
): Promise<void> {
  try {
    await track('flag_performance', {
      operation,
      duration,
      flagsEvaluated,
      timestamp: Date.now(),
    });

    if (duration > 100) {
      logger.warn(`Slow flag evaluation detected: ${operation} took ${duration}ms`);
    }
  } catch (error) {
    logger.error('Failed to track flag performance', error);
  }
}

/**
 * Generate a session ID for analytics tracking
 */
function generateSessionId(): string {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let sessionId = sessionStorage.getItem('vercel-analytics-session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('vercel-analytics-session', sessionId);
    }
    return sessionId;
  }
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Enhanced flag evaluation with analytics integration
 */
export async function evaluateAndTrackFlag(
  flagKey: string,
  evaluator: () => Promise<boolean>,
  options: FlagAnalyticsOptions = {}
): Promise<boolean> {
  const startTime = performance.now();
  
  try {
    const value = await evaluator();
    const duration = performance.now() - startTime;
    
    // Report the flag value to analytics
    await reportFlagValue(flagKey, value, options);
    
    // Track performance if slow
    if (duration > 50) {
      await trackFlagPerformance(`evaluate_${flagKey}`, duration, 1);
    }
    
    return value;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`Flag evaluation failed: ${flagKey}`, error);
    
    // Track the error
    await track('flag_evaluation_error', {
      flag: flagKey,
      error: error.message,
      duration,
      timestamp: Date.now(),
    });
    
    // Return safe default
    return false;
  }
}
