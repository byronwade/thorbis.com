"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@context/auth-context";
import { RoleManager } from "@lib/auth/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Lock, AlertTriangle, ArrowLeft } from "lucide-react";
import logger from "@lib/utils/logger";

/**
 * Higher-order component for route protection with role-based access control
 * Provides comprehensive authentication and authorization checking
 */
export function ProtectedRoute({ children, requiredPermissions = [], requiredRoles = [], fallbackPermissions = [], redirectTo = "/login", loadingComponent = null, unauthorizedComponent = null, allowUnauthenticated = false, requireEmailVerification = false, requirePhoneVerification = false, minRoleLevel = 0 }) {
	const { user, isAuthenticated, loading: authLoading, initialized, userRoles } = useAuth();
	const router = useRouter();
	const [authState, setAuthState] = useState("checking");

	useEffect(() => {
		const checkAccess = async () => {
			try {
				// Wait until auth is initialized to avoid redirect loops
				if (!initialized) {
					setAuthState("loading");
					return;
				}

				// Check authentication
				if (!allowUnauthenticated && !isAuthenticated) {
					logger.security({
						action: "unauthorized_access_attempt",
						route: window.location.pathname,
						reason: "not_authenticated",
						timestamp: Date.now(),
					});

					setAuthState("redirecting");
					const currentUrl = window.location.pathname + window.location.search;
					router.push(`${redirectTo}?redirectTo=${encodeURIComponent(currentUrl)}`);
					return;
				}

				// If authentication not required and user not logged in, allow access
				if (allowUnauthenticated && !isAuthenticated) {
					setAuthState("authorized");
					return;
				}

				// User is authenticated, perform additional checks
				if (isAuthenticated && user) {
					// Check email verification if required - use correct Supabase field
					if (requireEmailVerification && !user.email_confirmed_at) {
						logger.security({
							action: "unverified_email_access_attempt",
							userId: user.id,
							route: window.location.pathname,
							emailConfirmedAt: user.email_confirmed_at,
							timestamp: Date.now(),
						});

						setAuthState("redirecting");
						router.push(`/verify-email?redirect=${encodeURIComponent(window.location.pathname)}`);
						return;
					}

					// Check phone verification if required
					if (requirePhoneVerification && !user.phone_confirmed_at) {
						logger.security({
							action: "unverified_phone_access_attempt",
							userId: user.id,
							route: window.location.pathname,
							timestamp: Date.now(),
						});

						setAuthState("redirecting");
						router.push(`/verify-phone?redirect=${encodeURIComponent(window.location.pathname)}`);
						return;
					}

					// Use userRoles from context instead of user.roles
					const currentUserRoles = userRoles || [];

					// Check minimum role level
					if (minRoleLevel > 0) {
						const userLevel = RoleManager.getHighestRoleLevel(currentUserRoles);
						if (userLevel < minRoleLevel) {
							logger.security({
								action: "insufficient_role_level",
								userId: user.id,
								userLevel,
								requiredLevel: minRoleLevel,
								route: window.location.pathname,
								timestamp: Date.now(),
							});

							setAuthState("unauthorized");
							return;
						}
					}

					// Check required roles
					if (requiredRoles.length > 0) {
						const hasRequiredRole = RoleManager.hasAnyRole(currentUserRoles, requiredRoles);
						if (!hasRequiredRole) {
							logger.security({
								action: "insufficient_role",
								userId: user.id,
								userRoles: currentUserRoles,
								requiredRoles,
								route: window.location.pathname,
								timestamp: Date.now(),
							});

							setAuthState("unauthorized");
							return;
						}
					}

					// Check required permissions
					if (requiredPermissions.length > 0) {
						const hasPermission = RoleManager.hasAnyPermission(currentUserRoles, requiredPermissions);
						const hasFallbackPermission = fallbackPermissions.length > 0 ? RoleManager.hasAnyPermission(currentUserRoles, fallbackPermissions) : false;

						if (!hasPermission && !hasFallbackPermission) {
							logger.security({
								action: "insufficient_permissions",
								userId: user.id,
								userRoles: currentUserRoles,
								requiredPermissions,
								fallbackPermissions,
								route: window.location.pathname,
								timestamp: Date.now(),
							});

							setAuthState("unauthorized");
							return;
						}
					}

					// All checks passed
					logger.info("Protected route access granted", {
						userId: user.id,
						route: window.location.pathname,
						userRoles,
						requiredPermissions,
						requiredRoles,
					});

					setAuthState("authorized");
				}
			} catch (error) {
				logger.error("Protected route check failed:", error);
				setAuthState("error");
			}
		};

		checkAccess();
	}, [initialized, authLoading, isAuthenticated, user, requiredPermissions, requiredRoles, fallbackPermissions, redirectTo, allowUnauthenticated, requireEmailVerification, requirePhoneVerification, minRoleLevel, router]);

	// No loading states - handle auth in background
	// Skip loading and redirecting states for immediate rendering

	// Show unauthorized state
	if (authState === "unauthorized") {
		if (unauthorizedComponent) {
			return unauthorizedComponent;
		}

		return <UnauthorizedAccess requiredPermissions={requiredPermissions} requiredRoles={requiredRoles} />;
	}

	// Show error state
	if (authState === "error") {
		return <AccessError />;
	}

	// User is authorized, render children
	return children;
}

/**
 * Permission-based component protection
 */
export function ProtectedComponent({ children, permission, fallbackPermissions = [], fallback = null, showFallback = true }) {
	const { user, isAuthenticated, userRoles } = useAuth();

	if (!isAuthenticated || !user) {
		return showFallback ? fallback || <div className="text-muted-foreground text-sm">Sign in required</div> : null;
	}

	const roles = userRoles || [];
	const hasPermission = RoleManager.hasPermission(roles, permission);
	const hasFallbackPermission = fallbackPermissions.length > 0 ? RoleManager.hasAnyPermission(roles, fallbackPermissions) : false;

	if (!hasPermission && !hasFallbackPermission) {
		return showFallback ? fallback || <div className="text-muted-foreground text-sm">Insufficient permissions</div> : null;
	}

	return children;
}

/**
 * Role-based component protection
 */
export function ProtectedByRole({ children, roles, fallback = null, showFallback = true }) {
	const { user, isAuthenticated, userRoles } = useAuth();

	if (!isAuthenticated || !user) {
		return showFallback ? fallback || <div className="text-muted-foreground text-sm">Sign in required</div> : null;
	}

	const currentUserRoles = userRoles || [];
	const hasRole = RoleManager.hasAnyRole(currentUserRoles, roles);

	if (!hasRole) {
		return showFallback ? fallback || <div className="text-muted-foreground text-sm">Access restricted</div> : null;
	}

	return children;
}

/**
 * Conditional rendering based on user level
 */
export function ProtectedByLevel({ children, minLevel, fallback = null, showFallback = true }) {
	const { user, isAuthenticated } = useAuth();

	if (!isAuthenticated || !user) {
		return showFallback ? fallback || <div className="text-muted-foreground text-sm">Sign in required</div> : null;
	}

	const userRoles = user.roles || [];
	const userLevel = RoleManager.getHighestRoleLevel(userRoles);

	if (userLevel < minLevel) {
		return showFallback ? fallback || <div className="text-muted-foreground text-sm">Insufficient access level</div> : null;
	}

	return children;
}

/**
 * Hook for checking permissions within components
 */
export function usePermissions() {
	const { user, isAuthenticated, userRoles } = useAuth();

	const checkPermission = (permission) => {
		if (!isAuthenticated || !user) return false;
		const roles = userRoles || [];
		return RoleManager.hasPermission(roles, permission);
	};

	const checkRole = (role) => {
		if (!isAuthenticated || !user) return false;
		const roles = userRoles || [];
		return RoleManager.hasRole(roles, role);
	};

	const checkAnyPermission = (permissions) => {
		if (!isAuthenticated || !user) return false;
		const roles = userRoles || [];
		return RoleManager.hasAnyPermission(roles, permissions);
	};

	const checkAllPermissions = (permissions) => {
		if (!isAuthenticated || !user) return false;
		const roles = userRoles || [];
		return RoleManager.hasAllPermissions(roles, permissions);
	};

	const getUserLevel = () => {
		if (!isAuthenticated || !user) return 0;
		const roles = userRoles || [];
		return RoleManager.getHighestRoleLevel(roles);
	};

	const getAvailableActions = (resourceType) => {
		if (!isAuthenticated || !user) return [];
		const roles = userRoles || [];
		return RoleManager.getAvailableActions(roles, resourceType);
	};

	return {
		checkPermission,
		checkRole,
		checkAnyPermission,
		checkAllPermissions,
		getUserLevel,
		getAvailableActions,
		userRoles: userRoles || [],
		isAuthenticated,
	};
}

/**
 * Unauthorized access component
 */
function UnauthorizedAccess({ requiredPermissions = [], requiredRoles = [] }) {
	const router = useRouter();

	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="w-16 h-16 bg-destructive/10 dark:bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
						<Lock className="w-8 h-8 text-destructive dark:text-destructive" />
					</div>
					<CardTitle className="text-2xl">Access Denied</CardTitle>
					<CardDescription>You don&apos;t have permission to access this page.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{requiredPermissions.length > 0 && (
						<Alert>
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								<strong>Required permissions:</strong>
								<ul className="mt-2 list-disc list-inside">
									{requiredPermissions.map((permission) => (
										<li key={permission} className="text-sm">
											{permission}
										</li>
									))}
								</ul>
							</AlertDescription>
						</Alert>
					)}

					{requiredRoles.length > 0 && (
						<Alert>
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								<strong>Required roles:</strong>
								<ul className="mt-2 list-disc list-inside">
									{requiredRoles.map((role) => (
										<li key={role} className="text-sm">
											{role}
										</li>
									))}
								</ul>
							</AlertDescription>
						</Alert>
					)}

					<div className="flex gap-2">
						<Button variant="outline" onClick={() => router.back()} className="flex-1">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Go Back
						</Button>
						<Button onClick={() => router.push("/dashboard")} className="flex-1">
							Dashboard
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Access error component
 */
function AccessError() {
	const router = useRouter();

	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="w-16 h-16 bg-warning/10 dark:bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
						<AlertTriangle className="w-8 h-8 text-warning dark:text-warning" />
					</div>
					<CardTitle className="text-2xl">Access Error</CardTitle>
					<CardDescription>Something went wrong while checking your permissions.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">Please try refreshing the page or contact support if the problem persists.</p>

					<div className="flex gap-2">
						<Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
							Refresh Page
						</Button>
						<Button onClick={() => router.push("/dashboard")} className="flex-1">
							Dashboard
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * HOC for wrapping components with protection
 */
export function withProtection(Component, protectionOptions = {}) {
	return function ProtectedComponent(props) {
		return (
			<ProtectedRoute {...protectionOptions}>
				<Component {...props} />
			</ProtectedRoute>
		);
	};
}

export default ProtectedRoute;
