// REQUIRED: Smart Validation Component
// Provides intelligent, non-intrusive validation for better UX

"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, CheckCircle2, Info, Lightbulb } from "lucide-react";
import { cn } from "@utils";

/**
 * Smart Validation Hook
 * Provides intelligent validation timing and user-friendly feedback
 */
export function useSmartValidation(validationRules = {}) {
	const [validationState, setValidationState] = useState({});
	const [showValidation, setShowValidation] = useState({});
	const [validationTiming, setValidationTiming] = useState({});

	/**
	 * Validate field with smart timing
	 */
	const validateField = useCallback(
		(fieldName, value, immediate = false) => {
			const rules = validationRules[fieldName];
			if (!rules) return;

			const now = Date.now();
			const lastValidation = validationTiming[fieldName] || 0;
			const timeSinceLastValidation = now - lastValidation;

			// Smart timing: validate immediately for errors, debounce for success
			const shouldValidate = immediate || timeSinceLastValidation > (validationState[fieldName]?.hasError ? 500 : 1500);

			if (!shouldValidate) return;

			const result = {
				value,
				isValid: true,
				hasError: false,
				hasWarning: false,
				hasSuccess: false,
				message: "",
				suggestions: [],
				severity: "info",
			};

			// Run validation rules
			for (const rule of rules) {
				try {
					const ruleResult = rule(value);

					if (!ruleResult.isValid) {
						result.isValid = false;
						result.hasError = ruleResult.severity === "error";
						result.hasWarning = ruleResult.severity === "warning";
						result.message = ruleResult.message;
						result.suggestions = ruleResult.suggestions || [];
						result.severity = ruleResult.severity;
						break; // Stop on first error
					}
				} catch (error) {
					console.error(`Validation error for ${fieldName}:`, error);
				}
			}

			// Set success state for valid fields
			if (result.isValid && value && value.length > 0) {
				result.hasSuccess = true;
				result.message = "Looks good!";
			}

			setValidationState((prev) => ({
				...prev,
				[fieldName]: result,
			}));

			setValidationTiming((prev) => ({
				...prev,
				[fieldName]: now,
			}));

			// Smart display timing: show errors immediately, delay success
			setTimeout(
				() => {
					setShowValidation((prev) => ({
						...prev,
						[fieldName]: true,
					}));
				},
				result.hasError ? 0 : 300
			);
		},
		[validationRules, validationState, validationTiming]
	);

	/**
	 * Clear validation for field
	 */
	const clearValidation = useCallback((fieldName) => {
		setValidationState((prev) => {
			const newState = { ...prev };
			delete newState[fieldName];
			return newState;
		});
		setShowValidation((prev) => ({
			...prev,
			[fieldName]: false,
		}));
	}, []);

	/**
	 * Get validation state for field
	 */
	const getValidation = useCallback(
		(fieldName) => {
			const state = validationState[fieldName];
			const show = showValidation[fieldName];

			return {
				...state,
				show: show && state,
				shouldShowMessage: show && state && (state.hasError || state.hasWarning || state.hasSuccess),
			};
		},
		[validationState, showValidation]
	);

	return {
		validateField,
		clearValidation,
		getValidation,
		hasErrors: Object.values(validationState).some((state) => state?.hasError),
		isValid: Object.values(validationState).every((state) => !state || state.isValid),
	};
}

/**
 * Smart Validation Display Component
 */
export function ValidationMessage({ validation, className = "", showSuggestions = true, compact = false }) {
	if (!validation?.show || !validation.shouldShowMessage) {
		return null;
	}

	const { hasError, hasWarning, hasSuccess, message, suggestions, severity } = validation;

	const getIcon = () => {
		if (hasError) return <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
		if (hasWarning) return <Info className="w-4 h-4 text-warning flex-shrink-0" />;
		if (hasSuccess) return <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />;
		return <Info className="w-4 h-4 text-primary flex-shrink-0" />;
	};

	const getTextColor = () => {
		if (hasError) return "text-destructive";
		if (hasWarning) return "text-warning";
		if (hasSuccess) return "text-success";
		return "text-primary";
	};

	return (
		<div className={cn("space-y-2", className)}>
			{/* Main message */}
			<div className="flex items-start space-x-2">
				{getIcon()}
				<p className={cn("text-sm font-medium", getTextColor())}>{message}</p>
			</div>

			{/* Suggestions */}
			{showSuggestions && suggestions && suggestions.length > 0 && !compact && (
				<div className="ml-6 space-y-1">
					{suggestions.map((suggestion, index) => (
						<div key={index} className="flex items-start space-x-2">
							<Lightbulb className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
							<p className="text-xs text-muted-foreground">{suggestion}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

/**
 * Common validation rules
 */
export const validationRules = {
	email: [
		(value) => {
			if (!value) {
				return {
					isValid: false,
					severity: "error",
					message: "Email address is required",
					suggestions: ["Please enter your email address"],
				};
			}

			// Basic format check
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(value)) {
				return {
					isValid: false,
					severity: "error",
					message: "Please enter a valid email address",
					suggestions: ["Make sure your email includes @ and a domain (like .com)", "Example: yourname@email.com"],
				};
			}

			// Advanced checks
			const domain = value.split("@")[1];
			if (domain && domain.includes("..")) {
				return {
					isValid: false,
					severity: "error",
					message: "Email format appears invalid",
					suggestions: ["Check for double dots in your email address"],
				};
			}

			// Common typos
			const commonTypos = {
				"gmial.com": "gmail.com",
				"gmai.com": "gmail.com",
				"yahooo.com": "yahoo.com",
				"hotmial.com": "hotmail.com",
			};

			if (commonTypos[domain]) {
				return {
					isValid: false,
					severity: "warning",
					message: `Did you mean ${value.replace(domain, commonTypos[domain])}?`,
					suggestions: [`Try ${commonTypos[domain]} instead`],
				};
			}

			return { isValid: true };
		},
	],

	password: [
		(value) => {
			if (!value) {
				return {
					isValid: false,
					severity: "error",
					message: "Password is required",
					suggestions: ["Please enter your password"],
				};
			}

			if (value.length < 8) {
				return {
					isValid: false,
					severity: "error",
					message: "Password must be at least 8 characters",
					suggestions: ["Use a combination of letters, numbers, and symbols", "Consider using a passphrase like 'Coffee-Morning-2024!'"],
				};
			}

			// Check for common weak patterns
			const weakPatterns = ["password", "123456", "qwerty", "abc123"];
			const lowerValue = value.toLowerCase();

			if (weakPatterns.some((pattern) => lowerValue.includes(pattern))) {
				return {
					isValid: false,
					severity: "warning",
					message: "This password may be too common",
					suggestions: ["Try adding numbers or symbols", "Use a unique combination of words"],
				};
			}

			return { isValid: true };
		},
	],

	confirmPassword: (originalPassword) => [
		(value) => {
			if (!value) {
				return {
					isValid: false,
					severity: "error",
					message: "Please confirm your password",
				};
			}

			if (value !== originalPassword) {
				return {
					isValid: false,
					severity: "error",
					message: "Passwords don't match",
					suggestions: ["Make sure both passwords are exactly the same"],
				};
			}

			return { isValid: true };
		},
	],

	required: (fieldName) => [
		(value) => {
			if (!value || value.trim().length === 0) {
				return {
					isValid: false,
					severity: "error",
					message: `${fieldName} is required`,
				};
			}
			return { isValid: true };
		},
	],
};

/**
 * Progressive Enhancement Helper
 * Provides graceful degradation for users with disabilities
 */
export function useProgressiveEnhancement() {
	const [isEnhanced, setIsEnhanced] = useState(false);
	const [userPreferences, setUserPreferences] = useState({
		reducedMotion: false,
		highContrast: false,
		largeText: false,
	});

	useEffect(() => {
		// Check for JavaScript support and user preferences
		setIsEnhanced(true);

		// Check media queries for accessibility preferences
		const checkPreferences = () => {
			setUserPreferences({
				reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
				highContrast: window.matchMedia("(prefers-contrast: high)").matches,
				largeText: window.matchMedia("(min-resolution: 120dpi)").matches,
			});
		};

		checkPreferences();

		// Listen for changes
		const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const contrastQuery = window.matchMedia("(prefers-contrast: high)");

		motionQuery.addEventListener("change", checkPreferences);
		contrastQuery.addEventListener("change", checkPreferences);

		return () => {
			motionQuery.removeEventListener("change", checkPreferences);
			contrastQuery.removeEventListener("change", checkPreferences);
		};
	}, []);

	return {
		isEnhanced,
		userPreferences,
		shouldAnimateTransitions: isEnhanced && !userPreferences.reducedMotion,
		shouldUseHighContrast: userPreferences.highContrast,
		shouldUseLargerText: userPreferences.largeText,
	};
}

export default {
	useSmartValidation,
	ValidationMessage,
	validationRules,
	useProgressiveEnhancement,
};
