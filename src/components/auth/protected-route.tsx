'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

// =============================================================================
// COMPONENT INTERFACES
// =============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requireOrganization?: boolean;
  requireRole?: 'owner' | 'admin' | 'manager' | 'member';
  organizationId?: string;
}

interface AuthGuardProps {
  children: React.ReactNode;
  loading?: boolean;
  fallback?: React.ReactNode;
}

// =============================================================================
// AUTH GUARD COMPONENT
// =============================================================================

function AuthGuard({ children, loading, fallback }: AuthGuardProps) {
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-sm text-neutral-400">Loading...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// =============================================================================
// PROTECTED ROUTE COMPONENT
// =============================================================================

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/auth',
  fallback,
  requireOrganization = false,
  requireRole,
  organizationId,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { 
    user, 
    loading: authLoading, 
    organizations,
    organizationsLoading 
  } = useAuth();

  // Wait for auth to load
  if (authLoading) {
    return (
      <AuthGuard loading={true} fallback={fallback} />
    );
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    router.push(redirectTo);
    return (
      <AuthGuard loading={true} fallback={fallback} />
    );
  }

  // If user is authenticated but we don't require auth, show content
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Wait for organizations to load if required
  if (requireOrganization && organizationsLoading) {
    return (
      <AuthGuard loading={true} fallback={fallback} />
    );
  }

  // Check organization requirement
  if (requireOrganization && organizations.length === 0) {
    router.push('/onboarding/organization');
    return (
      <AuthGuard loading={true} fallback={fallback} />
    );
  }

  // Check role requirement
  if (requireRole && organizationId) {
    const organization = organizations.find(org => org.id === organizationId);
    const membership = organization?.membership;
    
    if (!membership) {
      router.push('/unauthorized');
      return (
        <AuthGuard loading={true} fallback={fallback} />
      );
    }

    // Define role hierarchy
    const roleHierarchy = {
      member: 1,
      manager: 2,
      admin: 3,
      owner: 4,
    };

    const userRoleLevel = roleHierarchy[membership.role] || 0;
    const requiredRoleLevel = roleHierarchy[requireRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      router.push('/unauthorized');
      return (
        <AuthGuard loading={true} fallback={fallback} />
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}

// =============================================================================
// REQUIRE AUTH HOC
// =============================================================================

export function requireAuth<T extends object>(
  Component: React.ComponentType<T>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  const WrappedComponent = (props: T) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = 'requireAuth(${Component.displayName || Component.name})';
  return WrappedComponent;
}

// =============================================================================
// ORGANIZATION GUARD COMPONENT
// =============================================================================

interface OrganizationGuardProps {
  children: React.ReactNode;
  organizationId?: string;
  requireRole?: 'owner' | 'admin' | 'manager' | 'member';
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

export function OrganizationGuard({
  children,
  organizationId,
  requireRole = 'member',
  fallback,
  onUnauthorized,
}: OrganizationGuardProps) {
  const { organizations, organizationsLoading } = useAuth();

  if (organizationsLoading) {
    return (
      <AuthGuard loading={true} fallback={fallback} />
    );
  }

  // If no organization ID specified, check if user has any organizations
  if (!organizationId) {
    if (organizations.length === 0) {
      onUnauthorized?.();
      return (
        fallback || (
          <div className="min-h-screen flex items-center justify-center bg-neutral-950">
            <div className="text-center">
              <p className="text-white mb-2">No organizations found</p>
              <p className="text-sm text-neutral-400">You need to be a member of an organization to access this content.</p>
            </div>
          </div>
        )
      );
    }
    return <>{children}</>;
  }

  // Check specific organization access
  const organization = organizations.find(org => org.id === organizationId);
  const membership = organization?.membership;

  if (!membership) {
    onUnauthorized?.();
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950">
          <div className="text-center">
            <p className="text-white mb-2">Access Denied</p>
            <p className="text-sm text-neutral-400">You don't have access to this organization.</p>
          </div>
        </div>
      )
    );
  }

  // Check role requirement
  const roleHierarchy = {
    member: 1,
    manager: 2,
    admin: 3,
    owner: 4,
  };

  const userRoleLevel = roleHierarchy[membership.role] || 0;
  const requiredRoleLevel = roleHierarchy[requireRole] || 0;

  if (userRoleLevel < requiredRoleLevel) {
    onUnauthorized?.();
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950">
          <div className="text-center">
            <p className="text-white mb-2">Insufficient Permissions</p>
            <p className="text-sm text-neutral-400">
              You need {requireRole} role or higher to access this content.
            </p>
            <p className="text-xs text-neutral-500 mt-2">
              Your current role: {membership.role}
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// =============================================================================
// CONDITIONAL AUTH COMPONENT
// =============================================================================

interface ConditionalAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showWhenAuthenticated?: boolean;
}

export function ConditionalAuth({ 
  children, 
  fallback, 
  showWhenAuthenticated = true 
}: ConditionalAuthProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthGuard loading={true} fallback={fallback} />;
  }

  const shouldShow = showWhenAuthenticated ? !!user : !user;

  if (shouldShow) {
    return <>{children}</>;
  }

  return <>{fallback || null}</>;
}