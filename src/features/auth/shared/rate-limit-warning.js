// REQUIRED: Rate Limiting Warning Component
// Displays security warnings for failed login attempts

"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { Shield, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@utils";

/**
 * Rate Limit Warning Component
 * Shows progressive warnings based on failed login attempts
 */
export function RateLimitWarning({
	attempts = 0,
	onReset,
	className = "",
	lockoutDuration = 15 * 60 * 1000, // 15 minutes default
}) {
	const [timeRemaining, setTimeRemaining] = useState(lockoutDuration);
	const [canReset, setCanReset] = useState(false);

	useEffect(() => {
		if (attempts >= 5) {
			const interval = setInterval(() => {
				setTimeRemaining((prev) => {
					if (prev <= 1000) {
						setCanReset(true);
						clearInterval(interval);
						return 0;
					}
					return prev - 1000;
				});
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [attempts]);

	const formatTime = (ms) => {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	const getWarningConfig = () => {
		if (attempts >= 5) {
			return {
				variant: "destructive",
				icon: <Shield className="h-4 w-4" />,
				title: "Account Temporarily Locked",
				description: `Too many failed attempts. Account is locked for security. ${canReset ? "You can now try again." : `Try again in ${formatTime(timeRemaining)}.`}`,
				action: canReset ? "Try Again" : null,
			};
		} else if (attempts >= 3) {
			return {
				variant: "destructive",
				icon: <AlertTriangle className="h-4 w-4" />,
				title: "Security Alert",
				description: `${attempts} failed attempts detected. Enhanced security measures are now active. ${5 - attempts} attempts remaining before lockout.`,
				action: null,
			};
		} else if (attempts >= 1) {
			return {
				variant: "default",
				icon: <Clock className="h-4 w-4" />,
				title: "Login Attempt Warning",
				description: `${attempts} failed attempt${attempts > 1 ? "s" : ""} detected. Please verify your credentials.`,
				action: null,
			};
		}
		return null;
	};

	const config = getWarningConfig();
	if (!config) return null;

	return (
		<Alert variant={config.variant} className={cn("", className)}>
			<div className="flex items-start space-x-3">
				{config.icon}
				<div className="flex-1 space-y-1">
					<h4 className="text-sm font-semibold">{config.title}</h4>
					<AlertDescription className="text-sm">{config.description}</AlertDescription>

					{/* Progress indicator for lockout */}
					{attempts >= 5 && !canReset && (
						<div className="mt-3">
							<div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
								<span>Lockout expires in:</span>
								<span className="font-mono">{formatTime(timeRemaining)}</span>
							</div>
							<div className="w-full bg-muted rounded-full h-1">
								<div
									className="bg-destructive h-1 rounded-full transition-all duration-1000"
									style={{
										width: `${((lockoutDuration - timeRemaining) / lockoutDuration) * 100}%`,
									}}
								/>
							</div>
						</div>
					)}

					{/* Security tips */}
					{attempts >= 3 && (
						<div className="mt-3 p-2 bg-background/50 rounded border">
							<p className="text-xs font-medium text-muted-foreground mb-1">Security Tips:</p>
							<ul className="text-xs text-muted-foreground space-y-0.5">
								<li>• Ensure you're using the correct email address</li>
								<li>• Check if Caps Lock is on</li>
								<li>• Try resetting your password if you're unsure</li>
								<li>• Contact support if you believe this is an error</li>
							</ul>
						</div>
					)}

					{/* Action button */}
					{config.action && canReset && (
						<div className="mt-3">
							<Button variant="outline" size="sm" onClick={onReset} className="text-xs">
								<RefreshCw className="w-3 h-3 mr-1" />
								{config.action}
							</Button>
						</div>
					)}
				</div>
			</div>
		</Alert>
	);
}

/**
 * Simple Rate Limit Badge
 * Compact indicator for attempt count
 */
export function RateLimitBadge({ attempts = 0, maxAttempts = 5, className = "" }) {
	if (attempts === 0) return null;

	const isWarning = attempts >= maxAttempts * 0.6; // 60% threshold
	const isDanger = attempts >= maxAttempts * 0.8; // 80% threshold

	return (
		<div className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", isDanger ? "bg-destructive/10 text-destructive" : isWarning ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary", className)}>
			<AlertTriangle className="w-3 h-3 mr-1" />
			{attempts}/{maxAttempts} attempts
		</div>
	);
}

/**
 * Account Security Status
 * Shows overall account security status
 */
export function AccountSecurityStatus({ recentFailedAttempts = 0, lastSuccessfulLogin, deviceTrusted = false, mfaEnabled = false, className = "" }) {
	const getSecurityLevel = () => {
		let score = 0;
		if (deviceTrusted) score += 25;
		if (mfaEnabled) score += 35;
		if (recentFailedAttempts === 0) score += 25;
		if (lastSuccessfulLogin && Date.now() - new Date(lastSuccessfulLogin).getTime() < 24 * 60 * 60 * 1000) {
			score += 15; // Recent activity is good
		}

		if (score >= 75) return { level: "high", color: "green", text: "Secure" };
		if (score >= 50) return { level: "medium", color: "yellow", text: "Good" };
		return { level: "low", color: "red", text: "At Risk" };
	};

	const security = getSecurityLevel();

	return (
		<div className={cn("flex items-center space-x-2 text-sm", className)}>
			<Shield className={cn("w-4 h-4", security.color === "green" ? "text-success" : security.color === "yellow" ? "text-warning" : "text-destructive")} />
			<span className="text-muted-foreground">Security:</span>
			<span className={cn("font-medium", security.color === "green" ? "text-success" : security.color === "yellow" ? "text-warning" : "text-destructive")}>{security.text}</span>
		</div>
	);
}

export default RateLimitWarning;
