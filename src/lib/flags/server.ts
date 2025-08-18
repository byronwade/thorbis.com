/**
 * Server-side Flag Helpers with React Cache
 * Cached decisions for SSR-first performance
 */

import { cache } from 'react';
import { flags } from './definitions';

type FlagKey = keyof typeof flags;

// Cached flag evaluation to avoid multiple requests per render
export const isEnabled = cache(async (key: FlagKey) => {
  try {
    // Vercel flags have a decide method to evaluate them
    const flagDecision = await flags[key].decide();
    return flagDecision;
  } catch (error) {
    console.warn(`Flag evaluation failed for ${key}:`, error);
    return false; // Safe fallback
  }
});

// Evaluate all flags once for layout-level decisions
export const evaluateAllFlags = cache(async () => {
  const entries = await Promise.all(
    (Object.keys(flags) as FlagKey[]).map(async (k) => {
      try {
        const decision = await flags[k].decide();
        return [k, decision] as const;
      } catch (error) {
        console.warn(`Flag evaluation failed for ${k}:`, error);
        return [k, false] as const; // Safe fallback
      }
    })
  );
  return Object.fromEntries(entries) as Record<FlagKey, boolean>;
});

// Specific helpers for common use cases
export const evaluateBusinessFlags = cache(async () => {
  return {
    fleetManagement: await isEnabled('fleetManagement'),
    enhancedFieldManagement: await isEnabled('enhancedFieldManagement'),
    integrationCenter: await isEnabled('integrationCenter'),
    integrationMarketplace: await isEnabled('integrationMarketplace'),
    businessOpsIntegrations: await isEnabled('businessOpsIntegrations')
  };
});

// Helper for integration visibility
export const shouldShowIntegration = cache(async (integrationKey: string) => {
  const businessFlags = await evaluateBusinessFlags();
  
  switch (integrationKey) {
    case 'fleet_management':
      return businessFlags.fleetManagement && businessFlags.businessOpsIntegrations;
    case 'enhanced_field_management':
      return businessFlags.enhancedFieldManagement && businessFlags.businessOpsIntegrations;
    case 'integration_center':
      return businessFlags.integrationCenter;
    case 'integration_marketplace':
      return businessFlags.integrationMarketplace;
    default:
      return businessFlags.businessOpsIntegrations;
  }
});

// Helper for widget visibility in dashboard
export const getDashboardWidgetFlags = cache(async () => {
  const flags = await evaluateBusinessFlags();
  
  return {
    showFleetWidget: flags.fleetManagement && flags.businessOpsIntegrations,
    showEnhancedFieldWidget: flags.enhancedFieldManagement && flags.businessOpsIntegrations,
    showOriginalFieldWidget: !flags.enhancedFieldManagement && flags.businessOpsIntegrations,
    showIntegrationCenter: flags.integrationCenter,
    showIntegrationMarketplace: flags.integrationMarketplace
  };
});

// Helper for search page flags
export const getSearchFlags = cache(async () => {
  return {
    smartSearch: await isEnabled('smartSearch'),
    aiRecommendations: await isEnabled('aiRecommendations'),
    visualSearch: await isEnabled('visualSearch'),
    voiceSearch: await isEnabled('voiceSearch'),
    contextualFilters: await isEnabled('contextualFilters'),
    realTimeUpdates: await isEnabled('realTimeUpdates')
  };
});

// Helper for authentication flags
export const getAuthFlags = cache(async () => {
  return {
    authBypass: await isEnabled('authBypass')
  };
});