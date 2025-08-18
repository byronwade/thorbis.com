"use client";

import { useEffect, useRef } from 'react';
import { track } from '@vercel/analytics';
import { logger } from '@utils/logger';

/**
 * Vercel Feature Flag Tracker
 * Ensures feature flags are properly reported to Vercel Web Analytics
 * This component is critical for flags to appear in the Vercel dashboard
 */
export default function VercelFlagTracker() {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current) return;
    hasTracked.current = true;

    const trackFlags = async () => {
      try {
        // Read flags from DOM data attributes
        const flags = {};
        const flagsData = document.body.getAttribute('data-flags');
        
        if (flagsData) {
          const parsedFlags = JSON.parse(flagsData);
          Object.assign(flags, parsedFlags);
        }

        // Also read individual flag attributes as backup
        const flagAttributes = Array.from(document.body.attributes)
          .filter(attr => attr.name.startsWith('data-flag-'))
          .reduce((acc, attr) => {
            const flagName = attr.name
              .replace('data-flag-', '')
              .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            acc[flagName] = attr.value === '1';
            return acc;
          }, {});

        // Merge both sources
        const allFlags = { ...flags, ...flagAttributes };

        // Track with Vercel Analytics - this is the key part!
        await track('feature_flags_loaded', {
          timestamp: Date.now(),
          flags_list: Object.keys(allFlags).join(','), // Convert array to comma-separated string
          enabled_count: Object.values(allFlags).filter(Boolean).length,
          total_count: Object.keys(allFlags).length,
          page: window.location.pathname,
        }, {
          // Pass flags to Vercel Analytics for dashboard tracking
          flags: allFlags
        });

        // Track individual flag states for better analytics
        for (const [flagKey, enabled] of Object.entries(allFlags)) {
          await track('feature_flag_state', {
            flag: flagKey,
            enabled,
            page: window.location.pathname,
            timestamp: Date.now(),
          }, {
            flags: { [flagKey]: enabled }
          });
        }

        logger.debug(`Tracked ${Object.keys(allFlags).length} feature flags with Vercel Analytics`);

        // Store flags in session for client-side access
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('vercel-feature-flags', JSON.stringify(allFlags));
        }

      } catch (error) {
        logger.error('Failed to track feature flags with Vercel Analytics:', error);
      }
    };

    // Track flags after a short delay to ensure DOM is ready
    const timer = setTimeout(trackFlags, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // This component renders nothing - it's purely for analytics
  return null;
}

/**
 * Hook to access feature flags on the client side
 */
export function useFeatureFlags() {
  const flags = useRef({});

  useEffect(() => {
    try {
      // Try to get flags from sessionStorage first (faster)
      const stored = sessionStorage.getItem('vercel-feature-flags');
      if (stored) {
        flags.current = JSON.parse(stored);
        return;
      }

      // Fallback to reading from DOM
      const flagsData = document.body.getAttribute('data-flags');
      if (flagsData) {
        flags.current = JSON.parse(flagsData);
      }
    } catch (error) {
      logger.warn('Failed to load feature flags on client:', error);
    }
  }, []);

  return flags.current;
}

/**
 * Track feature flag usage events
 */
export async function trackFlagUsage(flagKey, featureName, metadata = {}) {
  try {
    const flags = JSON.parse(sessionStorage.getItem('vercel-feature-flags') || '{}');
    const enabled = flags[flagKey];

    await track('feature_flag_usage', {
      flag: flagKey,
      feature: featureName,
      enabled,
      page: window.location.pathname,
      timestamp: Date.now(),
      ...metadata,
    }, {
      flags: { [flagKey]: enabled }
    });

    logger.debug(`Tracked usage of feature flag: ${flagKey} (${featureName})`);
  } catch (error) {
    logger.error(`Failed to track flag usage: ${flagKey}`, error);
  }
}
