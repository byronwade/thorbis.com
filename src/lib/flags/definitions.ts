/**
 * Feature Flag Definitions for Business Integrations
 * Using Vercel Flags + Edge Config for SSR-first behavior
 */

import { flag } from '@vercel/flags/next';
import { get } from '@vercel/edge-config';

// Fleet Management Integration Flag
export const fleetManagementFlag = flag<boolean>({
  key: 'fleet-management',
  decide: async () => {
    // 1) Fast path: Edge Config (with error handling)
    try {
      const ec = await get<boolean>('feature:fleet-management');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {
      // Edge Config not configured, continue to fallback
    }

    // 2) Environment fallback
    const env = process.env.NEXT_PUBLIC_FLAG_FLEET_MANAGEMENT;
    if (env === 'true') return true;
    if (env === 'false') return false;

    // 3) Safe default - enabled since fleet management is now integrated
    return true;
  }
});

// Enhanced Field Management Flag
export const enhancedFieldManagementFlag = flag<boolean>({
  key: 'enhanced-field-management',
  decide: async () => {
    // 1) Fast path: Edge Config (with error handling)
    try {
      const ec = await get<boolean>('feature:enhanced-field-management');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {
      // Edge Config not configured, continue to fallback
    }

    // 2) Environment fallback
    const env = process.env.NEXT_PUBLIC_FLAG_ENHANCED_FIELD_MANAGEMENT;
    if (env === 'true') return true;
    if (env === 'false') return false;

    // 3) Safe default - enabled since it's an enhancement
    return true;
  }
});

// Integration Center Redesign Flag
export const integrationCenterFlag = flag<boolean>({
  key: 'integration-center-redesign',
  decide: async () => {
    // 1) Fast path: Edge Config (with error handling)
    try {
      const ec = await get<boolean>('feature:integration-center-redesign');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {
      // Edge Config not configured, continue to fallback
    }

    // 2) Environment fallback
    const env = process.env.NEXT_PUBLIC_FLAG_INTEGRATION_CENTER;
    if (env === 'true') return true;
    if (env === 'false') return false;

    // 3) Safe default - enabled since it's a UI improvement
    return true;
  }
});

// Integration Marketplace Flag
export const integrationMarketplaceFlag = flag<boolean>({
  key: 'integration-marketplace',
  decide: async () => {
    // 1) Fast path: Edge Config (with error handling)
    try {
      const ec = await get<boolean>('feature:integration-marketplace');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {
      // Edge Config not configured, continue to fallback
    }

    // 2) Environment fallback
    const env = process.env.NEXT_PUBLIC_FLAG_INTEGRATION_MARKETPLACE;
    if (env === 'true') return true;
    if (env === 'false') return false;

    // 3) Safe default - enabled for new feature
    return true;
  }
});

// Business Operations Integrations Flag (for the entire suite)
export const businessOpsIntegrationsFlag = flag<boolean>({
  key: 'business-ops-integrations',
  decide: async () => {
    // 1) Fast path: Edge Config (with error handling)
    try {
      const ec = await get<boolean>('feature:business-ops-integrations');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {
      // Edge Config not configured, continue to fallback
    }

    // 2) Environment fallback
    const env = process.env.NEXT_PUBLIC_FLAG_BUSINESS_OPS;
    if (env === 'true') return true;
    if (env === 'false') return false;

    // 3) Safe default
    return true;
  }
});

// Dashboard Core Flag - controls entire dashboard availability
export const dashboardCoreFlag = flag<boolean>({
  key: 'dashboard-core',
  decide: async () => {
    // 1) Fast path: Edge Config (with error handling)
    try {
      const ec = await get<boolean>('feature:dashboard-core');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {
      // Edge Config not configured, continue to fallback
    }

    // 2) Environment fallback
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_CORE;
    if (env === 'true') return true;
    if (env === 'false') return false;

    // 3) Safe default - enabled by default for core functionality
    return true;
  }
});

// Dashboard module flags
export const dashboardAnalyticsFlag = flag<boolean>({
  key: 'dashboard-analytics',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:dashboard-analytics');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_ANALYTICS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const dashboardBillingFlag = flag<boolean>({
  key: 'dashboard-billing',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:dashboard-billing');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_BILLING;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const dashboardMessagingFlag = flag<boolean>({
  key: 'dashboard-messaging',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:dashboard-messaging');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_MESSAGING;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const dashboardIntegrationsFlag = flag<boolean>({
  key: 'dashboard-integrations',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:dashboard-integrations');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_INTEGRATIONS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const dashboardDomainsFlag = flag<boolean>({
  key: 'dashboard-domains',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:dashboard-domains');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_DOMAINS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const dashboardJobsFlag = flag<boolean>({
  key: 'dashboard-jobs',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:dashboard-jobs');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_JOBS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const dashboardReviewsFlag = flag<boolean>({
  key: 'dashboard-reviews',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:dashboard-reviews');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_REVIEWS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const dashboardSupportFlag = flag<boolean>({
  key: 'dashboard-support',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:dashboard-support');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_SUPPORT;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

// Business profile section flags
export const profileCoreFlag = flag<boolean>({
  key: 'profile-core',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:profile-core');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_PROFILE_CORE;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const profilePhotosFlag = flag<boolean>({
  key: 'profile-photos',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:profile-photos');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_PROFILE_PHOTOS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const profileReviewsFlag = flag<boolean>({
  key: 'profile-reviews',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:profile-reviews');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_PROFILE_REVIEWS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const profilePromotionsFlag = flag<boolean>({
  key: 'profile-promotions',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:profile-promotions');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_PROFILE_PROMOTIONS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const profileMenusFlag = flag<boolean>({
  key: 'profile-menus',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:profile-menus');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_PROFILE_MENUS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const profileHoursFlag = flag<boolean>({
  key: 'profile-hours',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:profile-hours');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_PROFILE_HOURS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const profileBookingFlag = flag<boolean>({
  key: 'profile-booking',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:profile-booking');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_PROFILE_BOOKING;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const profileMessagingFlag = flag<boolean>({
  key: 'profile-messaging',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:profile-messaging');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_PROFILE_MESSAGING;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const profileMapFlag = flag<boolean>({
  key: 'profile-map',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:profile-map');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_PROFILE_MAP;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

export const profileCertificationBadgeFlag = flag<boolean>({
  key: 'profile-certification-badge',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:profile-certification-badge');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_PROFILE_CERTIFICATION_BADGE;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true;
  }
});

// Search feature flags
export const smartSearchFlag = flag<boolean>({
  key: 'smart-search',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:smart-search');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_SMART_SEARCH;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true; // Smart search enabled by default
  }
});

export const aiRecommendationsFlag = flag<boolean>({
  key: 'ai-recommendations',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:ai-recommendations');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_AI_RECOMMENDATIONS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true; // AI recommendations enabled by default
  }
});

export const visualSearchFlag = flag<boolean>({
  key: 'visual-search',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:visual-search');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_VISUAL_SEARCH;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return false; // Visual search disabled by default (experimental)
  }
});

export const voiceSearchFlag = flag<boolean>({
  key: 'voice-search',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:voice-search');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_VOICE_SEARCH;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return false; // Voice search disabled by default (experimental)
  }
});

export const contextualFiltersFlag = flag<boolean>({
  key: 'contextual-filters',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:contextual-filters');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_CONTEXTUAL_FILTERS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true; // Contextual filters enabled by default
  }
});

export const realTimeUpdatesFlag = flag<boolean>({
  key: 'realtime-updates',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:realtime-updates');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_REALTIME_UPDATES;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true; // Real-time updates enabled by default
  }
});

// Authentication bypass flag for development/testing
export const authBypassFlag = flag<boolean>({
  key: 'auth-bypass',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:auth-bypass');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_AUTH_BYPASS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return false; // Auth bypass disabled by default for security
  }
});

// Demo flags for dashboards
export const dashboardDemoBusinessFlag = flag<boolean>({
  key: 'dashboard-demo-business',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:dashboard-demo-business');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_DEMO_BUSINESS;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return false; // Demo features disabled by default
  }
});

export const dashboardDemoLocalhubFlag = flag<boolean>({
  key: 'dashboard-demo-localhub',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:dashboard-demo-localhub');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_DEMO_LOCALHUB;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return true; // Enable LocalHub demo data for users without LocalHub
  }
});

export const dashboardDemoAdminFlag = flag<boolean>({
  key: 'dashboard-demo-admin',
  decide: async () => {
    try {
      const ec = await get<boolean>('feature:dashboard-demo-admin');
      if (typeof ec === 'boolean') return ec;
    } catch (error) {}
    
    const env = process.env.NEXT_PUBLIC_FLAG_DASHBOARD_DEMO_ADMIN;
    if (env === 'true') return true;
    if (env === 'false') return false;
    
    return false; // Demo features disabled by default
  }
});

// Flag documentation for development page
export const flagDocs = [
  { key: 'authBypass', description: 'Authentication Bypass for Development/Testing' },
  { key: 'fleetManagement', description: 'Fleet Management Integration' },
  { key: 'enhancedFieldManagement', description: 'Enhanced Field Management Features' },
  { key: 'integrationCenter', description: 'Integration Center Redesign' },
  { key: 'integrationMarketplace', description: 'Integration Marketplace' },
  { key: 'businessOpsIntegrations', description: 'Business Operations Integrations Suite' },
  
  // Search flags
  { key: 'smartSearch', description: 'Smart Search with AI-powered results' },
  { key: 'aiRecommendations', description: 'AI-powered search recommendations' },
  { key: 'visualSearch', description: 'Visual Search capabilities' },
  { key: 'voiceSearch', description: 'Voice Search functionality' },
  { key: 'contextualFilters', description: 'Contextual search filters' },
  { key: 'realTimeUpdates', description: 'Real-time search result updates' },
  
  // Dashboard flags
  { key: 'dashboardCore', description: 'Dashboard Core Functionality' },
  { key: 'dashboardAnalytics', description: 'Dashboard Analytics Module' },
  { key: 'dashboardBilling', description: 'Dashboard Billing Module' },
  { key: 'dashboardMessaging', description: 'Dashboard Messaging Module' },
  { key: 'dashboardIntegrations', description: 'Dashboard Integrations Module' },
  { key: 'dashboardDomains', description: 'Dashboard Domains Module' },
  { key: 'dashboardJobs', description: 'Dashboard Jobs Module' },
  { key: 'dashboardReviews', description: 'Dashboard Reviews Module' },
  { key: 'dashboardSupport', description: 'Dashboard Support Module' },
  
  // Profile flags
  { key: 'profileCore', description: 'Profile Core Features' },
  { key: 'profilePhotos', description: 'Profile Photos Management' },
  { key: 'profileReviews', description: 'Profile Reviews Display' },
  { key: 'profilePromotions', description: 'Profile Promotions Feature' },
  { key: 'profileMenus', description: 'Profile Menus Feature' },
  { key: 'profileHours', description: 'Profile Hours Feature' },
  { key: 'profileBooking', description: 'Profile Booking Feature' },
  { key: 'profileMessaging', description: 'Profile Messaging Feature' },
  { key: 'profileMap', description: 'Profile Map Integration' },
  { key: 'profileCertificationBadge', description: 'Profile Certification Badge' },
  
  // Demo flags
  { key: 'dashboardDemoBusiness', description: 'Business Dashboard Demo' },
  { key: 'dashboardDemoLocalhub', description: 'LocalHub Dashboard Demo' },
  { key: 'dashboardDemoAdmin', description: 'Admin Dashboard Demo' }
];

// Export all flags
export const flags = {
  authBypass: authBypassFlag,
  fleetManagement: fleetManagementFlag,
  enhancedFieldManagement: enhancedFieldManagementFlag,
  integrationCenter: integrationCenterFlag,
  integrationMarketplace: integrationMarketplaceFlag,
  businessOpsIntegrations: businessOpsIntegrationsFlag,
  
  // Search flags
  smartSearch: smartSearchFlag,
  aiRecommendations: aiRecommendationsFlag,
  visualSearch: visualSearchFlag,
  voiceSearch: voiceSearchFlag,
  contextualFilters: contextualFiltersFlag,
  realTimeUpdates: realTimeUpdatesFlag,
  
  // Dashboard flags
  dashboardCore: dashboardCoreFlag,
  dashboardAnalytics: dashboardAnalyticsFlag,
  dashboardBilling: dashboardBillingFlag,
  dashboardMessaging: dashboardMessagingFlag,
  dashboardIntegrations: dashboardIntegrationsFlag,
  dashboardDomains: dashboardDomainsFlag,
  dashboardJobs: dashboardJobsFlag,
  dashboardReviews: dashboardReviewsFlag,
  dashboardSupport: dashboardSupportFlag,
  
  // Profile flags
  profileCore: profileCoreFlag,
  profilePhotos: profilePhotosFlag,
  profileReviews: profileReviewsFlag,
  profilePromotions: profilePromotionsFlag,
  profileMenus: profileMenusFlag,
  profileHours: profileHoursFlag,
  profileBooking: profileBookingFlag,
  profileMessaging: profileMessagingFlag,
  profileMap: profileMapFlag,
  profileCertificationBadge: profileCertificationBadgeFlag,
  
  // Demo flags
  dashboardDemoBusiness: dashboardDemoBusinessFlag,
  dashboardDemoLocalhub: dashboardDemoLocalhubFlag,
  dashboardDemoAdmin: dashboardDemoAdminFlag
};