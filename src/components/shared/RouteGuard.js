"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useBusinessStore } from '@store/business';
import { canBusinessAccessRoute, getIndustryFromRoute } from '@lib/routing/intelligent-business-router';
import { dashboardBusinesses } from '@data/dashboard-businesses';

/**
 * Route Guard Component
 * Prevents businesses from accessing routes they shouldn't have access to
 * Automatically redirects to appropriate routes when business context changes
 */
export default function RouteGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeBusinessId } = useBusinessStore();

  useEffect(() => {
    // Skip if no business is selected or we're not on a business route
    if (!activeBusinessId || !pathname.startsWith('/dashboard/business/')) {
      return;
    }

    const currentBusiness = dashboardBusinesses.find(b => b.id === activeBusinessId);
    if (!currentBusiness) {
      console.warn('RouteGuard: Business not found for ID:', activeBusinessId);
      return;
    }

    // Check if current route is valid for the business
    const canAccess = canBusinessAccessRoute(activeBusinessId, pathname);
    
    if (!canAccess) {
      console.warn(`RouteGuard: Business "${currentBusiness.name}" cannot access route: ${pathname}`);
      
      // Get the industry from the current route
      const routeIndustry = getIndustryFromRoute(pathname);
      
      if (routeIndustry && routeIndustry !== currentBusiness.industry) {
        console.log(`RouteGuard: Redirecting from ${routeIndustry} route to ${currentBusiness.industry} route`);
        
        // Redirect to the appropriate route for the current business
        const targetRoute = getIndustryRoute(currentBusiness.industry);
        if (targetRoute && targetRoute !== pathname) {
          router.push(targetRoute);
        }
      }
    }
  }, [activeBusinessId, pathname, router]);

  return children;
}

/**
 * Get the appropriate route for a business industry
 * @param {string} industry - The business industry
 * @returns {string} The route to navigate to
 */
function getIndustryRoute(industry) {
  const routeConfig = {
    field_service: '/dashboard/business/field-management',
    restaurant: '/dashboard/business/restaurants',
    retail: '/dashboard/business/retail',
    healthcare: '/dashboard/business/healthcare',
    automotive: '/dashboard/business/automotive',
    beauty: '/dashboard/business/beauty',
    legal: '/dashboard/business/legal',
    real_estate: '/dashboard/business/real-estate',
    education: '/dashboard/business/education',
    technology: '/dashboard/business/technology',
    manufacturing: '/dashboard/business/manufacturing',
    consulting: '/dashboard/business/consulting'
  };

  return routeConfig[industry] || '/dashboard/business/profile';
}
