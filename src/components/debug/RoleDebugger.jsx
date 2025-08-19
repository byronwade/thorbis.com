"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Shield, User, CheckCircle, AlertTriangle } from "lucide-react";

/**
 * RoleDebugger component for troubleshooting role and permission issues
 * Only shows in development mode
 */
export default function RoleDebugger() {
	// Only show in development
	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	// Mock role data - in real implementation this would come from auth context
	const debugInfo = {
		user: {
			id: "user_123",
			email: "test@example.com",
			emailVerified: true,
			role: "business_owner",
			roleLevel: 2,
		},
		permissions: ["BUSINESS_MANAGE", "BUSINESS_CREATE", "BUSINESS_UPDATE", "BUSINESS_DELETE"],
		requiredPermissions: ["BUSINESS_MANAGE"],
		minRoleLevel: 2,
		hasAccess: true,
	};

	return (
		<Card className="border-dashed border-warning bg-warning/50 dark:bg-warning/20">
			<CardHeader>
				<div className="flex items-center space-x-2">
					<Shield className="w-5 h-5 text-warning" />
					<CardTitle className="text-lg text-warning dark:text-warning/80">Role Debugger (Development Only)</CardTitle>
				</div>
				<CardDescription className="text-warning dark:text-warning/90">Debug information for role and permission troubleshooting</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* User Info */}
				<div className="space-y-2">
					<h4 className="font-medium text-sm text-warning dark:text-warning/80 flex items-center">
						<User className="w-4 h-4 mr-1" />
						User Information
					</h4>
					<div className="grid grid-cols-2 gap-2 text-xs">
						<div>
							<span className="text-muted-foreground">Email:</span> {debugInfo.user.email}
						</div>
						<div>
							<span className="text-muted-foreground">Role:</span> {debugInfo.user.role}
						</div>
						<div>
							<span className="text-muted-foreground">Role Level:</span> {debugInfo.user.roleLevel}
						</div>
						<div className="flex items-center space-x-1">
							<span className="text-muted-foreground">Email Verified:</span>
							{debugInfo.user.emailVerified ? <CheckCircle className="w-3 h-3 text-success" /> : <AlertTriangle className="w-3 h-3 text-destructive" />}
						</div>
					</div>
				</div>

				{/* Permissions */}
				<div className="space-y-2">
					<h4 className="font-medium text-sm text-warning dark:text-warning/80">Permissions</h4>
					<div className="flex flex-wrap gap-1">
						{debugInfo.permissions.map((permission) => (
							<Badge key={permission} variant="outline" className="text-xs">
								{permission}
							</Badge>
						))}
					</div>
				</div>

				{/* Access Check */}
				<div className="space-y-2">
					<h4 className="font-medium text-sm text-warning dark:text-warning/80">Access Check</h4>
					<div className="text-xs space-y-1">
						<div>
							<span className="text-muted-foreground">Required:</span> {debugInfo.requiredPermissions.join(", ")}
						</div>
						<div>
							<span className="text-muted-foreground">Min Role Level:</span> {debugInfo.minRoleLevel}
						</div>
						<div className="flex items-center space-x-1">
							<span className="text-muted-foreground">Has Access:</span>
							{debugInfo.hasAccess ? (
								<Badge variant="default" className="text-xs">
									✓ Authorized
								</Badge>
							) : (
								<Badge variant="destructive" className="text-xs">
									✗ Denied
								</Badge>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

