'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getUserProfile, getUserOrganizations } from '@/lib/supabase';
import type { UserProfile, OrganizationWithMembership } from '@/lib/supabase';

// =============================================================================
// AUTH CONTEXT TYPE DEFINITIONS
// =============================================================================

interface AuthContextType {
  // Authentication state
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  organizations: OrganizationWithMembership[];
  
  // Loading states
  loading: boolean;
  profileLoading: boolean;
  organizationsLoading: boolean;
  
  // Actions
  refreshProfile: () => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// AUTH PROVIDER COMPONENT
// =============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationWithMembership[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const refreshProfile = async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    setProfileLoading(true);
    try {
      const userProfile = await getUserProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshOrganizations = async () => {
    if (!user?.id) {
      setOrganizations([]);
      return;
    }

    setOrganizationsLoading(true);
    try {
      const userOrganizations = await getUserOrganizations(user.id);
      setOrganizations(userOrganizations);
    } catch (error) {
      console.error('Error refreshing user organizations:', error);
      setOrganizations([]);
    } finally {
      setOrganizationsLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await Promise.all([refreshProfile(), refreshOrganizations()]);
      } else {
        setProfile(null);
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error refreshing auth state:', error);
      setSession(null);
      setUser(null);
      setProfile(null);
      setOrganizations([]);
    }
  };

  // =============================================================================
  // AUTHENTICATION STATE MANAGEMENT
  // =============================================================================

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Load user profile and organizations in parallel
            await Promise.all([refreshProfile(), refreshOrganizations()]);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setOrganizations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // User signed in or token refreshed
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await Promise.all([refreshProfile(), refreshOrganizations()]);
          }
        } else {
          // User signed out
          setProfile(null);
          setOrganizations([]);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: AuthContextType = {
    // Authentication state
    user,
    session,
    profile,
    organizations,
    
    // Loading states
    loading,
    profileLoading,
    organizationsLoading,
    
    // Actions
    refreshProfile,
    refreshOrganizations,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================================
// CUSTOM HOOK
// =============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

// Hook to check if user is authenticated
export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth();
  return !loading && !!user;
}

// Hook to check if user has specific role in an organization
export function useOrganizationRole(organizationId?: string): {
  role: string | null;
  hasRole: (minRole: string) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
} {
  const { organizations } = useAuth();
  
  const organization = organizationId 
    ? organizations.find(org => org.id === organizationId)
    : organizations[0]; // Default to first organization if no ID provided

  const membership = organization?.membership;
  const role = membership?.role || null;

  const roleHierarchy: Record<string, number> = {
    guest: 1,
    member: 2,
    manager: 3,
    admin: 4,
    owner: 5,
  };

  const hasRole = (minRole: string): boolean => {
    if (!role) return false;
    return (roleHierarchy[role] || 0) >= (roleHierarchy[minRole] || 0);
  };

  return {
    role,
    hasRole,
    isOwner: role === 'owner',
    isAdmin: hasRole('admin'),
    isMember: hasRole('member'),
  };
}

// Hook to get user's accessible organizations by industry
export function useOrganizationsByIndustry(): Record<string, OrganizationWithMembership[]> {
  const { organizations } = useAuth();
  
  return organizations.reduce((acc, org) => {
    if (!acc[org.industry]) {
      acc[org.industry] = [];
    }
    acc[org.industry].push(org);
    return acc;
  }, {} as Record<string, OrganizationWithMembership[]>);
}

// Hook to check if user has any organizations
export function useHasOrganizations(): boolean {
  const { organizations, organizationsLoading } = useAuth();
  return !organizationsLoading && organizations.length > 0;
}