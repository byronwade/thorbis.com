// Authentication Utilities for Supabase Auth
// Enhanced error handling, validation, and auth helpers

import { AuthError, User, Session, WeakPassword } from "@supabase/supabase-js";
import logger from "@lib/utils/logger";

// Auth error types for better error handling
export interface AuthErrorDetails {
	type: "auth_error" | "validation_error" | "network_error" | "rate_limit_error" | "server_error";
	message: string;
	userMessage: string;
	field?: string;
	retryable: boolean;
	retryDelay?: number;
}

// Enhanced error message mapping based on Supabase Auth errors
export const mapAuthError = (error: AuthError | Error): AuthErrorDetails => {
	const message = error.message.toLowerCase();

	// Invalid credentials
	if (message.includes("invalid login credentials") || message.includes("invalid email or password")) {
		return {
			type: "auth_error",
			message: error.message,
			userMessage: "Invalid email or password. Please check your credentials and try again.",
			field: "email",
			retryable: true,
		};
	}

	// Email not confirmed
	if (message.includes("email not confirmed")) {
		return {
			type: "auth_error",
			message: error.message,
			userMessage: "Please confirm your email address before logging in. Check your inbox for a confirmation email.",
			retryable: true,
		};
	}

	// User already exists
	if (message.includes("user already registered") || message.includes("email address is already registered")) {
		return {
			type: "auth_error",
			message: error.message,
			userMessage: "An account with this email already exists. Please sign in instead.",
			field: "email",
			retryable: false,
		};
	}

	// Rate limiting
	if (message.includes("too many requests") || message.includes("rate limit")) {
		return {
			type: "rate_limit_error",
			message: error.message,
			userMessage: "Too many attempts. Please wait a moment before trying again.",
			retryable: true,
			retryDelay: 60000, // 1 minute
		};
	}

	// Weak password
	if (message.includes("password should be at least")) {
		return {
			type: "validation_error",
			message: error.message,
			userMessage: "Password is too weak. Please choose a stronger password with at least 8 characters.",
			field: "password",
			retryable: true,
		};
	}

	// Invalid email format
	if (message.includes("invalid email")) {
		return {
			type: "validation_error",
			message: error.message,
			userMessage: "Please enter a valid email address.",
			field: "email",
			retryable: true,
		};
	}

	// Account locked
	if (message.includes("account locked") || message.includes("temporarily disabled")) {
		return {
			type: "auth_error",
			message: error.message,
			userMessage: "Your account has been temporarily locked due to security reasons. Please contact support.",
			retryable: false,
		};
	}

	// Signup disabled
	if (message.includes("signup is disabled")) {
		return {
			type: "auth_error",
			message: error.message,
			userMessage: "Account creation is temporarily disabled. Please try again later or contact support.",
			retryable: true,
			retryDelay: 300000, // 5 minutes
		};
	}

	// Network errors
	if (message.includes("network") || message.includes("connection") || message.includes("timeout")) {
		return {
			type: "network_error",
			message: error.message,
			userMessage: "Connection error. Please check your internet connection and try again.",
			retryable: true,
			retryDelay: 5000, // 5 seconds
		};
	}

	// Server errors
	if (message.includes("internal server error") || message.includes("service unavailable")) {
		return {
			type: "server_error",
			message: error.message,
			userMessage: "Our servers are experiencing issues. Please try again in a few minutes.",
			retryable: true,
			retryDelay: 30000, // 30 seconds
		};
	}

	// Generic fallback
	return {
		type: "auth_error",
		message: error.message,
		userMessage: "An unexpected error occurred. Please try again.",
		retryable: true,
	};
};

// Password strength validation
export interface PasswordStrength {
	score: number; // 0-4 (weak to very strong)
	feedback: string[];
	isValid: boolean;
	requirements: {
		minLength: boolean;
		hasUppercase: boolean;
		hasLowercase: boolean;
		hasNumbers: boolean;
		hasSpecialChars: boolean;
	};
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
	const requirements = {
		minLength: password.length >= 8,
		hasUppercase: /[A-Z]/.test(password),
		hasLowercase: /[a-z]/.test(password),
		hasNumbers: /\d/.test(password),
		hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
	};

	const feedback: string[] = [];
	let score = 0;

	if (!requirements.minLength) {
		feedback.push("Password must be at least 8 characters long");
	} else {
		score += 1;
	}

	if (!requirements.hasUppercase) {
		feedback.push("Add at least one uppercase letter");
	} else {
		score += 1;
	}

	if (!requirements.hasLowercase) {
		feedback.push("Add at least one lowercase letter");
	} else {
		score += 1;
	}

	if (!requirements.hasNumbers) {
		feedback.push("Add at least one number");
	} else {
		score += 1;
	}

	if (!requirements.hasSpecialChars) {
		feedback.push("Add at least one special character (!@#$%^&* etc.)");
	} else {
		score += 1;
	}

	// Additional checks for very strong passwords
	if (password.length >= 12) score += 0.5;
	if (password.length >= 16) score += 0.5;

	score = Math.min(score, 4); // Cap at 4

	const isValid = Object.values(requirements).every((req) => req);

	return {
		score,
		feedback,
		isValid,
		requirements,
	};
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!email) {
		return { isValid: false, message: "Email is required" };
	}

	if (!emailRegex.test(email)) {
		return { isValid: false, message: "Please enter a valid email address" };
	}

	if (email.length > 254) {
		return { isValid: false, message: "Email address is too long" };
	}

	return { isValid: true };
};

// User role helpers
export type UserRole = "user" | "business_owner" | "admin" | "moderator" | "super_admin";

export const hasRole = (userRoles: string[], requiredRole: UserRole): boolean => {
	return userRoles.includes(requiredRole);
};

export const hasAnyRole = (userRoles: string[], requiredRoles: UserRole[]): boolean => {
	return requiredRoles.some((role) => userRoles.includes(role));
};

export const isBusinessOwner = (userRoles: string[]): boolean => {
	return hasRole(userRoles, "business_owner");
};

export const isAdmin = (userRoles: string[]): boolean => {
	return hasAnyRole(userRoles, ["admin", "super_admin"]);
};

export const isModerator = (userRoles: string[]): boolean => {
	return hasAnyRole(userRoles, ["moderator", "admin", "super_admin"]);
};

// Session helpers
export const isSessionValid = (session: Session | null): boolean => {
	if (!session || !session.access_token) {
		return false;
	}

	const expiresAt = new Date(session.expires_at! * 1000);
	const now = new Date();

	// Consider session invalid if it expires within 5 minutes
	const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
	return expiresAt.getTime() > now.getTime() + bufferTime;
};

export const getSessionTimeRemaining = (session: Session | null): number => {
	if (!session || !session.expires_at) {
		return 0;
	}

	const expiresAt = new Date(session.expires_at * 1000);
	const now = new Date();

	return Math.max(0, expiresAt.getTime() - now.getTime());
};

// Security utilities
export const sanitizeUserData = (user: User) => {
	// Remove sensitive fields that shouldn't be exposed to client
	const sanitized = {
		id: user.id,
		email: user.email,
		email_confirmed_at: user.email_confirmed_at,
		phone: user.phone,
		created_at: user.created_at,
		updated_at: user.updated_at,
		user_metadata: user.user_metadata,
		app_metadata: {
			provider: user.app_metadata?.provider,
			providers: user.app_metadata?.providers,
		},
	};

	return sanitized;
};

// Audit logging for security events
export const logSecurityEvent = (event: { action: string; userId?: string; email?: string; ip?: string; userAgent?: string; metadata?: Record<string, any> }) => {
	logger.security({
		...event,
		timestamp: Date.now(),
		source: "auth_utils",
	});
};

// Rate limiting helpers (client-side)
interface RateLimitState {
	attempts: number;
	lastAttempt: number;
	blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitState>();

export const checkRateLimit = (
	identifier: string,
	maxAttempts: number = 5,
	windowMs: number = 15 * 60 * 1000, // 15 minutes
	blockDurationMs: number = 30 * 60 * 1000 // 30 minutes
): { allowed: boolean; retryAfter?: number } => {
	const now = Date.now();
	const state = rateLimitStore.get(identifier) || { attempts: 0, lastAttempt: 0 };

	// Check if currently blocked
	if (state.blockedUntil && now < state.blockedUntil) {
		return {
			allowed: false,
			retryAfter: state.blockedUntil - now,
		};
	}

	// Reset window if enough time has passed
	if (now - state.lastAttempt > windowMs) {
		state.attempts = 0;
	}

	// Check if exceeded attempts
	if (state.attempts >= maxAttempts) {
		state.blockedUntil = now + blockDurationMs;
		rateLimitStore.set(identifier, state);

		return {
			allowed: false,
			retryAfter: blockDurationMs,
		};
	}

	return { allowed: true };
};

export const recordFailedAttempt = (identifier: string): void => {
	const now = Date.now();
	const state = rateLimitStore.get(identifier) || { attempts: 0, lastAttempt: 0 };

	state.attempts += 1;
	state.lastAttempt = now;

	rateLimitStore.set(identifier, state);
};

export const clearRateLimit = (identifier: string): void => {
	rateLimitStore.delete(identifier);
};
