"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@context/auth-context";
import logger from "@lib/utils/logger";
import { PageLoadingState } from "@components/ui/loading-state";

/**
 * Auto Role Sync Component
 * Automatically syncs user roles when component mounts
 * Useful for dashboard pages where users need proper role assignment
 */
export default function AutoRoleSync({ children, fallback = null }) {
	const { user, isAuthenticated, userRoles } = useAuth();
	const [syncAttempted, setSyncAttempted] = useState(false);
	const [syncing, setSyncing] = useState(false);

	useEffect(() => {
		const syncRoles = async () => {
			if (!isAuthenticated || !user || syncAttempted) {
				return;
			}

			// Check if user has no roles or is missing business_owner role
			const needsSync = userRoles.length === 0;
			
			if (!needsSync) {
				setSyncAttempted(true);
				return;
			}

			logger.info("Auto-syncing user roles...");
			setSyncing(true);
			setSyncAttempted(true);

			try {
				const response = await fetch("/api/auth/sync-roles", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (response.ok) {
					const result = await response.json();
					logger.info("Role sync completed:", result);
					
					// Force a page refresh to pick up the new roles
					if (result.roleUpdated) {
						logger.info("Roles updated, refreshing page...");
						setTimeout(() => {
							window.location.reload();
						}, 1000);
					}
				} else {
					const error = await response.json();
					logger.error("Role sync failed:", error);
				}
			} catch (error) {
				logger.error("Role sync error:", error);
			} finally {
				setSyncing(false);
			}
		};

		syncRoles();
	}, [isAuthenticated, user, userRoles, syncAttempted]);

	// Show loading state while syncing
	if (syncing) {
		return (
			<PageLoadingState
				title="Setting up your account..."
				subtitle="Please wait while we configure your permissions."
			/>
		);
	}

	// Show fallback if user still has no roles after sync attempt
	if (syncAttempted && userRoles.length === 0 && fallback) {
		return fallback;
	}

	// Render children normally
	return children;
}
