'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from './auth-provider';
import { getOrganizationBySlug, logAuditEvent } from '@/lib/supabase';
import type { Organization, OrganizationMembership } from '@/lib/supabase';

// =============================================================================
// BUSINESS CONTEXT TYPE DEFINITIONS
// =============================================================================

interface BusinessContextType {
  // Current business state
  currentOrganization: Organization | null;
  currentMembership: OrganizationMembership | null;
  
  // Loading states
  loading: boolean;
  switching: boolean;
  
  // Actions
  switchOrganization: (organizationId: string) => Promise<void>;
  switchOrganizationBySlug: (slug: string) => Promise<void>;
  refreshCurrentOrganization: () => Promise<void>;
  
  // Helpers
  getOrganizationUrl: (organizationId?: string, path?: string) => string;
  isCurrentOrganization: (organizationId: string) => boolean;
  getCurrentIndustryPath: () => string;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

// =============================================================================
// BUSINESS PROVIDER COMPONENT
// =============================================================================

interface BusinessProviderProps {
  children: React.ReactNode;
}

export function BusinessProvider({ children }: BusinessProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, organizations, loading: authLoading } = useAuth();

  // Business state
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentMembership, setCurrentMembership] = useState<OrganizationMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getIndustryFromPath = (path: string): string | null => {
    const industryMatch = path.match(/^\/(hs|rest|auto|ret|edu|payroll|ai)\//);
    return industryMatch ? industryMatch[1] : null;
  };

  const getOrganizationUrl = (organizationId?: string, path?: string): string => {
    if (!organizationId && !currentOrganization) return '/';
    
    const targetOrg = organizationId 
      ? organizations.find(org => org.id === organizationId)
      : currentOrganization;
      
    if (!targetOrg) return '/';

    const basePath = `/${targetOrg.industry}`;
    return path ? `${basePath}${path}' : basePath;
  };

  const isCurrentOrganization = (organizationId: string): boolean => {
    return currentOrganization?.id === organizationId;
  };

  const getCurrentIndustryPath = (): string => {
    return currentOrganization ? '/${currentOrganization.industry}' : '/';
  };

  // =============================================================================
  // ORGANIZATION SWITCHING LOGIC
  // =============================================================================

  const switchOrganization = async (organizationId: string): Promise<void> => {
    if (!user || switching) return;
    
    setSwitching(true);
    
    try {
      // Find the organization in user's accessible organizations
      const targetOrganization = organizations.find(org => org.id === organizationId);
      
      if (!targetOrganization) {
        throw new Error('Organization not found or not accessible');
      }

      // Update current organization state
      setCurrentOrganization(targetOrganization);
      setCurrentMembership(targetOrganization.membership || null);

      // Store in localStorage for persistence
      localStorage.setItem('currentOrganizationId', organizationId);

      // Log organization switch
      try {
        await logAuditEvent({
          organization_id: organizationId,
          user_id: user.id,
          action: 'user.organization_switched',
          resource_type: 'organization',
          resource_id: organizationId,
          metadata: {
            organization_name: targetOrganization.name,
            organization_industry: targetOrganization.industry,
            from_path: pathname,
          },
        });
      } catch (auditError) {
        console.error('Failed to log organization switch:', auditError);
      }

      // Navigate to the organization's industry path if we're not already there
      const currentIndustry = getIndustryFromPath(pathname);
      if (currentIndustry !== targetOrganization.industry) {
        router.push('/${targetOrganization.industry}');
      }
    } catch (error) {
      console.error('Error switching organization:', error);
      throw error;
    } finally {
      setSwitching(false);
    }
  };

  const switchOrganizationBySlug = async (slug: string): Promise<void> => {
    if (!user || switching) return;
    
    setSwitching(true);
    
    try {
      // Try to find in user's organizations first
      const userOrganization = organizations.find(org => org.slug === slug);
      
      if (userOrganization) {
        await switchOrganization(userOrganization.id);
        return;
      }

      // If not found in user's organizations, fetch from database
      const organization = await getOrganizationBySlug(slug);
      
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Check if user has access (this would typically redirect to join/request access page)
      throw new Error('You do not have access to this organization');
    } catch (error) {
      console.error('Error switching organization by slug:', error);
      throw error;
    } finally {
      setSwitching(false);
    }
  };

  const refreshCurrentOrganization = async (): Promise<void> => {
    if (!currentOrganization || !user) return;

    try {
      const updatedOrg = await getOrganizationBySlug(currentOrganization.slug);
      if (updatedOrg) {
        setCurrentOrganization(updatedOrg);
      }
    } catch (error) {
      console.error('Error refreshing current organization:', error);
    }
  };

  // =============================================================================
  // ORGANIZATION INITIALIZATION
  // =============================================================================

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    const initializeOrganization = async () => {
      try {
        // Check URL parameters first
        const fromParam = searchParams.get('from');
        if (fromParam) {
          const orgByIndustry = organizations.find(org => org.industry === fromParam);
          if (orgByIndustry) {
            setCurrentOrganization(orgByIndustry);
            setCurrentMembership(orgByIndustry.membership || null);
            setLoading(false);
            return;
          }
        }

        // Check current path for industry
        const industryFromPath = getIndustryFromPath(pathname);
        if (industryFromPath) {
          const orgByIndustry = organizations.find(org => org.industry === industryFromPath);
          if (orgByIndustry) {
            setCurrentOrganization(orgByIndustry);
            setCurrentMembership(orgByIndustry.membership || null);
            setLoading(false);
            return;
          }
        }

        // Check localStorage for previously selected organization
        const storedOrgId = localStorage.getItem('currentOrganizationId');
        if (storedOrgId) {
          const storedOrg = organizations.find(org => org.id === storedOrgId);
          if (storedOrg) {
            setCurrentOrganization(storedOrg);
            setCurrentMembership(storedOrg.membership || null);
            setLoading(false);
            return;
          }
        }

        // Default to first organization if available
        if (organizations.length > 0) {
          const defaultOrg = organizations[0];
          setCurrentOrganization(defaultOrg);
          setCurrentMembership(defaultOrg.membership || null);
          localStorage.setItem('currentOrganizationId', defaultOrg.id);
        } else {
          setCurrentOrganization(null);
          setCurrentMembership(null);
        }
      } catch (error) {
        console.error('Error initializing organization:', error);
        setCurrentOrganization(null);
        setCurrentMembership(null);
      } finally {
        setLoading(false);
      }
    };

    initializeOrganization();
  }, [authLoading, user, organizations, pathname, searchParams]);

  // Clear organization state when user signs out
  useEffect(() => {
    if (!user) {
      setCurrentOrganization(null);
      setCurrentMembership(null);
      localStorage.removeItem('currentOrganizationId');
    }
  }, [user]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: BusinessContextType = {
    // Current business state
    currentOrganization,
    currentMembership,
    
    // Loading states
    loading,
    switching,
    
    // Actions
    switchOrganization,
    switchOrganizationBySlug,
    refreshCurrentOrganization,
    
    // Helpers
    getOrganizationUrl,
    isCurrentOrganization,
    getCurrentIndustryPath,
  };

  return (
    <BusinessContext.Provider value={contextValue}>
      {children}
    </BusinessContext.Provider>
  );
}

// =============================================================================
// CUSTOM HOOK
// =============================================================================

export function useBusiness(): BusinessContextType {
  const context = useContext(BusinessContext);
  
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  
  return context;
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

// Hook to check if user has a current organization
export function useHasCurrentOrganization(): boolean {
  const { currentOrganization, loading } = useBusiness();
  return !loading && !!currentOrganization;
}

// Hook to get current organization's industry
export function useCurrentIndustry(): string | null {
  const { currentOrganization } = useBusiness();
  return currentOrganization?.industry || null;
}

// Hook to check if current organization matches specific industry
export function useIsIndustry(industry: string): boolean {
  const { currentOrganization } = useBusiness();
  return currentOrganization?.industry === industry;
}

// Hook to get organization-specific settings
export function useOrganizationSettings(): Record<string, unknown> {
  const { currentOrganization } = useBusiness();
  return currentOrganization?.settings || {};
}

// Hook to check organization subscription status
export function useSubscriptionStatus(): {
  tier: string;
  status: string;
  isActive: boolean;
  isPro: boolean;
  isEnterprise: boolean;
} {
  const { currentOrganization } = useBusiness();
  
  const tier = currentOrganization?.subscription_tier || 'basic';
  const status = currentOrganization?.subscription_status || 'active';
  
  return {
    tier,
    status,
    isActive: status === 'active',
    isPro: tier === 'pro',
    isEnterprise: tier === 'enterprise',
  };
}