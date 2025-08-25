"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { useAuth } from "@context/auth-context";
import { RefreshCw, User, Shield, AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { toast } from "sonner";

/**
 * Debug component to check and refresh user roles
 * Supports dark and light mode theming
 * Use this temporarily to debug permission issues
 */
export function RoleDebugger() {
	const { user, userRoles, isAuthenticated, refreshUserRoles } = useAuth();
	const [isSyncing, setIsSyncing] = useState(false);
	const [syncResult, setSyncResult] = useState(null);
	
	// Deduplicate roles to avoid React key warnings
	const uniqueRoles = useMemo(() => [...new Set(userRoles)], [userRoles]);

	const handleRefreshRoles = async () => {
		console.log("Refreshing user roles...");
		try {
			await refreshUserRoles();
			toast.success("Roles refreshed successfully");
		} catch (error) {
			console.error("Error refreshing roles:", error);
			toast.error("Failed to refresh roles");
		}
	};

	const handleSyncRoles = async () => {
		setIsSyncing(true);
		setSyncResult(null);

		try {
			console.log("Syncing user roles with database...");
			
			const response = await fetch("/api/auth/sync-roles", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to sync roles");
			}

			console.log("Role sync result:", result);
			setSyncResult(result);

			if (result.roleUpdated) {
				toast.success(`Role updated to: ${result.currentRole}`);
				// Refresh roles to reflect changes
				await refreshUserRoles();
			} else {
				toast.success("Roles are already up to date");
			}

		} catch (error) {
			console.error("Error syncing roles:", error);
			toast.error(`Failed to sync roles: ${error.message}`);
		} finally {
			setIsSyncing(false);
		}
	};



	return (
		<Card className="mb-4 border-primary/20 dark:border-primary/20 bg-primary/10 dark:bg-primary/10">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-primary dark:text-primary">
					<Shield className="h-5 w-5" />
					Role Debugger
				</CardTitle>
				<CardDescription className="text-primary dark:text-primary">Current user authentication and role status</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<h4 className="font-semibold flex items-center gap-2 mb-2 text-foreground">
							<User className="h-4 w-4" />
							User Info
						</h4>
						<div className="space-y-1 text-sm text-muted-foreground">
							<p>
								<strong className="text-foreground">ID:</strong>
								<span className="font-mono text-xs ml-1">{user?.id}</span>
							</p>
							<p>
								<strong className="text-foreground">Email:</strong>
								<span className="ml-1">{user?.email}</span>
							</p>
							<p className="flex items-center gap-2">
								<strong className="text-foreground">Email Verified:</strong>
								{user?.email_confirmed_at ? (
									<span className="flex items-center gap-1 text-primary dark:text-primary">
										<CheckCircle className="h-3 w-3" />
										Yes
									</span>
								) : (
									<span className="flex items-center gap-1 text-destructive dark:text-destructive">
										<AlertTriangle className="h-3 w-3" />
										No
									</span>
								)}
							</p>
						</div>
					</div>

					<div>
						<h4 className="font-semibold flex items-center gap-2 mb-2 text-foreground">
							<Shield className="h-4 w-4" />
							Current Roles
						</h4>
						<div className="flex flex-wrap gap-1 mb-2">
							{uniqueRoles.map((role, index) => (
								<Badge key={`${role}-${index}`} variant={role === "business_owner" ? "default" : "secondary"} className={role === "business_owner" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
									{role.replace(/_/g, " ")}
								</Badge>
							))}
							{uniqueRoles.length === 0 && (
								<Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/20">
									No roles assigned
								</Badge>
							)}
						</div>
					</div>
				</div>

				<div>
					<h4 className="font-semibold mb-2 text-foreground">Required for Business Dashboard:</h4>
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground">Role: business_owner</span>
							{userRoles.includes("business_owner") ? (
								<Badge variant="default" className="bg-primary text-primary-foreground flex items-center gap-1">
									<CheckCircle className="h-3 w-3" />
									Has Role
								</Badge>
							) : (
								<Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/20 flex items-center gap-1">
									<AlertTriangle className="h-3 w-3" />
									Missing
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground">Permission: business.manage</span>
							{userRoles.includes("business_owner") ? (
								<Badge variant="default" className="bg-primary text-primary-foreground flex items-center gap-1">
									<CheckCircle className="h-3 w-3" />
									Should Have
								</Badge>
							) : (
								<Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/20 flex items-center gap-1">
									<AlertTriangle className="h-3 w-3" />
									Missing
								</Badge>
							)}
						</div>
					</div>
				</div>

				<div className="flex gap-2">
					<Button onClick={handleRefreshRoles} className="flex-1" variant="outline">
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh Roles
					</Button>
					<Button 
						onClick={handleSyncRoles} 
						className="flex-1" 
						variant="default"
						disabled={isSyncing}
					>
						<Settings className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
						{isSyncing ? 'Syncing...' : 'Sync Roles'}
					</Button>
				</div>

				{syncResult && (
									<div className="text-xs text-muted-foreground bg-primary/10 dark:bg-primary/10 p-3 rounded-lg border border-primary/20 dark:border-primary/20">
					<p className="font-semibold text-primary dark:text-primary mb-2">Last Sync Result:</p>
						<div className="space-y-1">
							<p><strong>Current Role:</strong> {syncResult.currentRole}</p>
							<p><strong>Businesses Owned:</strong> {syncResult.businessCount}</p>
							<p><strong>Role Updated:</strong> {syncResult.roleUpdated ? 'Yes' : 'No'}</p>
							<p><strong>Sync Time:</strong> {syncResult.duration}ms</p>
							{syncResult.businesses && syncResult.businesses.length > 0 && (
								<div>
									<strong>Your Businesses:</strong>
									<ul className="ml-2 list-disc list-inside">
										{syncResult.businesses.map((business) => (
											<li key={business.id}>{business.name} ({business.status})</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</div>
				)}

				<div className="text-xs text-muted-foreground bg-muted/50 dark:bg-muted/20 p-3 rounded-lg border border-border">
					<p className="font-semibold text-foreground mb-1">Debug Information:</p>
					<ul className="space-y-1 list-disc list-inside">
						<li>If you own businesses but don't have business_owner role, click <strong>"Sync Roles"</strong></li>
						<li>"Sync Roles" checks database and fixes missing roles automatically</li>
						<li>"Refresh Roles" just reloads current roles from cache</li>
						<li>This component should be removed once debugging is complete</li>
						<li>User ID and roles are cached - refresh may be needed after database changes</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}

export default RoleDebugger;
