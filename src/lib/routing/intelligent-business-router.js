/**
 * Intelligent Business Router
 * Handles business switching with smart routing, route validation, and navigation optimization
 */

import { dashboardBusinesses } from '@data/dashboard-businesses';

// Industry route mapping with validation
const INDUSTRY_ROUTES = {
  field_service: {
    base: '/dashboard/business/field-management',
    subRoutes: ['/dashboard/business/field-management', '/dashboard/business/field-management/jobs', '/dashboard/business/field-management/schedule', '/dashboard/business/field-management/technicians']
  },
  restaurant: {
    base: '/dashboard/business/restaurants',
    subRoutes: ['/dashboard/business/restaurants', '/dashboard/business/restaurants/pos', '/dashboard/business/restaurants/menu', '/dashboard/business/restaurants/kitchen', '/dashboard/business/restaurants/delivery', '/dashboard/business/restaurants/customers', '/dashboard/business/restaurants/inventory', '/dashboard/business/restaurants/staff', '/dashboard/business/restaurants/analytics', '/dashboard/business/restaurants/reservations']
  },
  retail: {
    base: '/dashboard/business/retail',
    subRoutes: ['/dashboard/business/retail', '/dashboard/business/retail/pos', '/dashboard/business/retail/inventory', '/dashboard/business/retail/customers']
  },
  healthcare: {
    base: '/dashboard/business/healthcare',
    subRoutes: ['/dashboard/business/healthcare', '/dashboard/business/healthcare/appointments', '/dashboard/business/healthcare/patients']
  },
  automotive: {
    base: '/dashboard/business/automotive',
    subRoutes: ['/dashboard/business/automotive', '/dashboard/business/automotive/service', '/dashboard/business/automotive/parts']
  },
  beauty: {
    base: '/dashboard/business/beauty',
    subRoutes: ['/dashboard/business/beauty', '/dashboard/business/beauty/appointments', '/dashboard/business/beauty/clients']
  },
  legal: {
    base: '/dashboard/business/legal',
    subRoutes: ['/dashboard/business/legal', '/dashboard/business/legal/cases', '/dashboard/business/legal/clients']
  },
  real_estate: {
    base: '/dashboard/business/real-estate',
    subRoutes: ['/dashboard/business/real-estate', '/dashboard/business/real-estate/listings', '/dashboard/business/real-estate/clients']
  },
  education: {
    base: '/dashboard/business/education',
    subRoutes: ['/dashboard/business/education', '/dashboard/business/education/courses', '/dashboard/business/education/students']
  },
  technology: {
    base: '/dashboard/business/technology',
    subRoutes: ['/dashboard/business/technology', '/dashboard/business/technology/projects', '/dashboard/business/technology/clients']
  },
  manufacturing: {
    base: '/dashboard/business/manufacturing',
    subRoutes: ['/dashboard/business/manufacturing', '/dashboard/business/manufacturing/production', '/dashboard/business/manufacturing/inventory']
  },
  consulting: {
    base: '/dashboard/business/consulting',
    subRoutes: ['/dashboard/business/consulting', '/dashboard/business/consulting/projects', '/dashboard/business/consulting/clients']
  }
};

// Fallback route for unknown industries
const FALLBACK_ROUTE = '/dashboard/business/profile';

/**
 * Get the appropriate route for a business industry
 * @param {string} industry - The business industry
 * @param {string} currentPath - Current pathname for smart navigation
 * @returns {string} The route to navigate to
 */
export function getIndustryRoute(industry, currentPath = '') {
  const routeConfig = INDUSTRY_ROUTES[industry];
  
  if (!routeConfig) {
    console.warn(`No route configuration found for industry: ${industry}`);
    return FALLBACK_ROUTE;
  }

  // If we're already on a valid route for this industry, don't redirect
  if (currentPath && routeConfig.subRoutes.some(route => currentPath.startsWith(route))) {
    console.log(`Already on valid route for ${industry}: ${currentPath}`);
    return null; // No navigation needed
  }

  return routeConfig.base;
}

/**
 * Check if a route is valid for a given industry
 * @param {string} route - The route to check
 * @param {string} industry - The business industry
 * @returns {boolean} Whether the route is valid
 */
export function isRouteValidForIndustry(route, industry) {
  const routeConfig = INDUSTRY_ROUTES[industry];
  if (!routeConfig) return false;
  
  return routeConfig.subRoutes.some(validRoute => route.startsWith(validRoute));
}

/**
 * Get all valid routes for an industry
 * @param {string} industry - The business industry
 * @returns {string[]} Array of valid routes
 */
export function getValidRoutesForIndustry(industry) {
  const routeConfig = INDUSTRY_ROUTES[industry];
  return routeConfig ? routeConfig.subRoutes : [];
}

/**
 * Smart business switching with intelligent routing
 * @param {string} businessId - The business ID to switch to
 * @param {string} currentPath - Current pathname
 * @param {Function} setActiveBusinessId - Function to update business ID
 * @param {Function} onNavigate - Optional callback after navigation
 */
export function handleIntelligentBusinessSwitch(businessId, currentPath, setActiveBusinessId, onNavigate) {
  const newBusiness = dashboardBusinesses.find(b => b.id === businessId);
  
  if (!newBusiness) {
    console.warn('Business not found:', businessId);
    return;
  }

  console.log('🔄 Intelligent business switch:', {
    from: currentPath,
    to: newBusiness.name,
    industry: newBusiness.industry,
    businessId
  });

  // Update the business ID in global store
  setActiveBusinessId(businessId);

  // Get the appropriate route
  const targetRoute = getIndustryRoute(newBusiness.industry, currentPath);
  
  if (!targetRoute) {
    console.log('✅ No navigation needed - already on correct route');
    if (onNavigate) onNavigate();
    return;
  }

  // Validate the route exists
  if (!isRouteValidForIndustry(targetRoute, newBusiness.industry)) {
    console.warn(`Invalid route for industry ${newBusiness.industry}: ${targetRoute}`);
    return;
  }

  console.log(`🚀 Navigating to: ${targetRoute}`);
  
  // Navigate with a delay to allow state updates
  setTimeout(() => {
    window.location.href = targetRoute;
    if (onNavigate) onNavigate();
  }, 800);
}

/**
 * Get business by ID with validation
 * @param {string} businessId - The business ID
 * @returns {Object|null} The business object or null if not found
 */
export function getBusinessById(businessId) {
  return dashboardBusinesses.find(b => b.id === businessId) || null;
}

/**
 * Get all businesses for an industry
 * @param {string} industry - The industry to filter by
 * @returns {Array} Array of businesses in that industry
 */
export function getBusinessesByIndustry(industry) {
  return dashboardBusinesses.filter(b => b.industry === industry);
}

/**
 * Validate if a business can access a specific route
 * @param {string} businessId - The business ID
 * @param {string} route - The route to check
 * @returns {boolean} Whether the business can access the route
 */
export function canBusinessAccessRoute(businessId, route) {
  const business = getBusinessById(businessId);
  if (!business) return false;
  
  return isRouteValidForIndustry(route, business.industry);
}

/**
 * Get the current business's industry from the route
 * @param {string} route - The current route
 * @returns {string|null} The industry or null if not found
 */
export function getIndustryFromRoute(route) {
  for (const [industry, config] of Object.entries(INDUSTRY_ROUTES)) {
    if (config.subRoutes.some(validRoute => route.startsWith(validRoute))) {
      return industry;
    }
  }
  return null;
}
