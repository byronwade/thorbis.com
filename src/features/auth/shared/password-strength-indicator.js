// REQUIRED: Real-time Password Strength Indicator
// Provides visual feedback for password security

"use client";

import { useMemo } from "react";
import { Progress } from "@components/ui/progress";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@utils";

/**
 * Password Strength Assessment Utility
 */
export const PasswordStrength = {
	/**
	 * Assess password strength
	 */
	assess(password) {
		if (!password || password.length === 0) {
			return {
				score: 0,
				level: "none",
				feedback: [],
				requirements: this.getRequirements(password),
			};
		}

		let score = 0;
		const feedback = [];

		// Length check
		if (password.length >= 8) score += 20;
		else feedback.push("Use at least 8 characters");

		if (password.length >= 12) score += 10;
		if (password.length >= 16) score += 10;

		// Character variety
		if (/[a-z]/.test(password)) score += 10;
		else feedback.push("Include lowercase letters");

		if (/[A-Z]/.test(password)) score += 10;
		else feedback.push("Include uppercase letters");

		if (/[0-9]/.test(password)) score += 10;
		else feedback.push("Include numbers");

		if (/[^a-zA-Z0-9]/.test(password)) score += 15;
		else feedback.push("Include special characters (!@#$%^&*)");

		// Pattern checks
		if (!/(012|123|234|345|456|567|678|789|890)/.test(password)) score += 5;
		else feedback.push("Avoid sequential numbers");

		if (!/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) score += 5;
		else feedback.push("Avoid sequential letters");

		if (!/(.)\1{2,}/.test(password)) score += 5;
		else feedback.push("Avoid repeating characters");

		// Common patterns
		const commonPatterns = ["password", "Password", "PASSWORD", "123456", "qwerty", "abc123", "letmein", "welcome", "monkey", "1234567890"];

		if (!commonPatterns.some((pattern) => password.toLowerCase().includes(pattern.toLowerCase()))) {
			score += 10;
		} else {
			feedback.push("Avoid common passwords");
		}

		// Determine level
		let level = "weak";
		if (score >= 80) level = "strong";
		else if (score >= 60) level = "good";
		else if (score >= 40) level = "fair";

		return {
			score: Math.min(score, 100),
			level,
			feedback,
			requirements: this.getRequirements(password),
		};
	},

	/**
	 * Get password requirements with status
	 */
	getRequirements(password) {
		return [
			{
				id: "length",
				text: "At least 8 characters",
				met: password.length >= 8,
			},
			{
				id: "lowercase",
				text: "One lowercase letter",
				met: /[a-z]/.test(password),
			},
			{
				id: "uppercase",
				text: "One uppercase letter",
				met: /[A-Z]/.test(password),
			},
			{
				id: "number",
				text: "One number",
				met: /[0-9]/.test(password),
			},
			{
				id: "special",
				text: "One special character",
				met: /[^a-zA-Z0-9]/.test(password),
			},
		];
	},

	/**
	 * Get color scheme for strength level
	 */
	getColorScheme(level) {
		const schemes = {
					none: { bg: "bg-gray-200", fill: "bg-gray-400", text: "text-gray-600" },
		weak: { bg: "bg-destructive/20", fill: "bg-destructive", text: "text-destructive" },
		fair: { bg: "bg-muted-foreground/20", fill: "bg-muted-foreground", text: "text-muted-foreground" },
		good: { bg: "bg-primary/20", fill: "bg-primary", text: "text-primary" },
		strong: { bg: "bg-primary/20", fill: "bg-primary", text: "text-primary" },
		};
		return schemes[level] || schemes.none;
	},
};

/**
 * Password Strength Indicator Component
 */
export function PasswordStrengthIndicator({ password = "", showRequirements = true, showFeedback = true, className = "", size = "default" }) {
	const assessment = useMemo(() => PasswordStrength.assess(password), [password]);
	const colorScheme = PasswordStrength.getColorScheme(assessment.level);

	if (!password) return null;

	return (
		<div className={cn("space-y-2", className)}>
			{/* Strength bar */}
			<div className="space-y-1">
				<div className="flex items-center justify-between">
					<span className={cn("text-sm font-medium", colorScheme.text, size === "small" ? "text-xs" : "")}>Password Strength: {assessment.level === "none" ? "Too weak" : assessment.level.charAt(0).toUpperCase() + assessment.level.slice(1)}</span>
					<span className={cn("text-xs", colorScheme.text)}>{assessment.score}%</span>
				</div>

				<Progress
					value={assessment.score}
					className={cn("h-2", size === "small" ? "h-1" : "")}
					style={{
						"--progress-background": `rgb(229 231 235)`, // gray-200
						"--progress-foreground":
							assessment.level === "weak"
								? "rgb(239 68 68)" // red-500
								: assessment.level === "fair"
									? "rgb(234 179 8)" // yellow-500
									: assessment.level === "good"
										? "rgb(59 130 246)" // blue-500
										: assessment.level === "strong"
											? "rgb(34 197 94)"
											: "rgb(156 163 175)", // green-500 or gray-400
					}}
				/>
			</div>

			{/* Requirements checklist */}
			{showRequirements && (
				<div className="space-y-1">
					<p className="text-xs font-medium text-muted-foreground">Requirements:</p>
					<div className="grid grid-cols-1 gap-1">
						{assessment.requirements.map((req) => (
							<div key={req.id} className="flex items-center space-x-2">
								{req.met ? <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" /> : <XCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />}
								<span className={cn("text-xs", req.met ? "text-green-700" : "text-gray-600")}>{req.text}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Feedback */}
			{showFeedback && assessment.feedback.length > 0 && (
				<div className="space-y-1">
					<p className="text-xs font-medium text-muted-foreground">Suggestions:</p>
					<div className="space-y-1">
						{assessment.feedback.slice(0, 3).map((item, index) => (
							<div key={index} className="flex items-start space-x-2">
								<AlertCircle className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
								<span className="text-xs text-yellow-700">{item}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * Compact Password Strength Indicator
 */
export function CompactPasswordStrengthIndicator({ password = "", className = "" }) {
	const assessment = useMemo(() => PasswordStrength.assess(password), [password]);
	const colorScheme = PasswordStrength.getColorScheme(assessment.level);

	if (!password) return null;

	return (
		<div className={cn("flex items-center space-x-2", className)}>
			<Progress
				value={assessment.score}
				className="h-1 flex-1"
				style={{
					"--progress-background": `rgb(229 231 235)`,
					"--progress-foreground": assessment.level === "weak" ? "rgb(239 68 68)" : assessment.level === "fair" ? "rgb(234 179 8)" : assessment.level === "good" ? "rgb(59 130 246)" : assessment.level === "strong" ? "rgb(34 197 94)" : "rgb(156 163 175)",
				}}
			/>
			<span className={cn("text-xs font-medium min-w-0", colorScheme.text)}>{assessment.level === "none" ? "Weak" : assessment.level.charAt(0).toUpperCase() + assessment.level.slice(1)}</span>
		</div>
	);
}

export default PasswordStrengthIndicator;
