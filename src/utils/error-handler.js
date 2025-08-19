// import { toast } from "@components/ui/use-toast"; // Commented out to avoid circular imports
import logger from "./logger.js";

// Error types for better categorization
export const ErrorTypes = {
	NETWORK: "NETWORK",
	VALIDATION: "VALIDATION",
	AUTHENTICATION: "AUTHENTICATION",
	AUTHORIZATION: "AUTHORIZATION",
	NOT_FOUND: "NOT_FOUND",
	SERVER: "SERVER",
	CLIENT: "CLIENT",
	UNKNOWN: "UNKNOWN",
};

// Error severity levels
export const ErrorSeverity = {
	LOW: "low",
	MEDIUM: "medium",
	HIGH: "high",
	CRITICAL: "critical",
};

// Custom error class for better error handling
export class AppError extends Error {
	constructor(message, type = ErrorTypes.UNKNOWN, severity = ErrorSeverity.MEDIUM, code = null, details = null) {
		super(message);
		this.name = "AppError";
		this.type = type;
		this.severity = severity;
		this.code = code;
		this.details = details;
		this.timestamp = new Date().toISOString();
	}
}

// Error handler for API responses
export const handleApiError = (error, context = "") => {
	let appError;

	if (error instanceof AppError) {
		appError = error;
	} else if (error.response) {
		// Axios error with response
		const { status, data } = error.response;

		switch (status) {
			case 400:
				appError = new AppError(data?.message || "Invalid request", ErrorTypes.VALIDATION, ErrorSeverity.MEDIUM, status);
				break;
			case 401:
				appError = new AppError("Authentication required", ErrorTypes.AUTHENTICATION, ErrorSeverity.HIGH, status);
				break;
			case 403:
				appError = new AppError("Access denied", ErrorTypes.AUTHORIZATION, ErrorSeverity.HIGH, status);
				break;
			case 404:
				appError = new AppError("Resource not found", ErrorTypes.NOT_FOUND, ErrorSeverity.MEDIUM, status);
				break;
			case 500:
				appError = new AppError("Server error occurred", ErrorTypes.SERVER, ErrorSeverity.CRITICAL, status);
				break;
			default:
				appError = new AppError(data?.message || "An error occurred", ErrorTypes.UNKNOWN, ErrorSeverity.MEDIUM, status);
		}
	} else if (error.request) {
		// Network error
		appError = new AppError("Network error - please check your connection", ErrorTypes.NETWORK, ErrorSeverity.HIGH);
	} else {
		// Other errors
		appError = new AppError(error.message || "An unexpected error occurred", ErrorTypes.UNKNOWN, ErrorSeverity.MEDIUM);
	}

	// Log the error
	logger.error(`[${context}] ${appError.message}`, {
		type: appError.type,
		severity: appError.severity,
		code: appError.code,
		details: appError.details,
		timestamp: appError.timestamp,
	});

	return appError;
};

// Toast notification for errors
export const showErrorToast = (error, title = "Error") => {
	const message = error instanceof AppError ? error.message : error.message || "An error occurred";

	toast({
		title,
		description: message,
		variant: "destructive",
		duration: 5000,
	});
};

// Success toast
export const showSuccessToast = (message, title = "Success") => {
	toast({
		title,
		description: message,
		duration: 3000,
	});
};

// Warning toast
export const showWarningToast = (message, title = "Warning") => {
	toast({
		title,
		description: message,
		variant: "default",
		duration: 4000,
	});
};

// Async wrapper for error handling
export const withErrorHandling = (asyncFn, context = "", options = {}) => {
	return async (...args) => {
		try {
			return await asyncFn(...args);
		} catch (error) {
			const appError = handleApiError(error, context);

			// Only show toast if not in silent mode
			if (!options.silent) {
				showErrorToast(appError);
			}

			throw appError;
		}
	};
};

// Validation error handler
export const handleValidationError = (errors, fieldName = "") => {
	const errorMessages = Object.values(errors).flat();
	const message = fieldName ? `${fieldName}: ${errorMessages.join(", ")}` : errorMessages.join(", ");

	const appError = new AppError(message, ErrorTypes.VALIDATION, ErrorSeverity.MEDIUM);

	showErrorToast(appError, "Validation Error");
	return appError;
};

// Retry mechanism for failed requests
export const withRetry = (asyncFn, maxRetries = 3, delay = 1000) => {
	return async (...args) => {
		let lastError;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				return await asyncFn(...args);
			} catch (error) {
				lastError = error;

				if (attempt === maxRetries) {
					throw error;
				}

				// Don't retry on certain error types
				if (error instanceof AppError) {
					if ([ErrorTypes.VALIDATION, ErrorTypes.AUTHENTICATION, ErrorTypes.AUTHORIZATION].includes(error.type)) {
						throw error;
					}
				}

				// Wait before retrying
				await new Promise((resolve) => setTimeout(resolve, delay * attempt));
			}
		}

		throw lastError;
	};
};

// Error boundary helper
export const getErrorBoundaryFallback = (error, resetErrorBoundary) => {
	return {
		hasError: true,
		error,
		resetErrorBoundary,
		errorInfo: {
			componentStack: error.stack || "",
			timestamp: new Date().toISOString(),
		},
	};
};

// Global error handler for unhandled errors
export const setupGlobalErrorHandling = () => {
	if (typeof window !== "undefined") {
		window.addEventListener("error", (event) => {
			const appError = new AppError(event.error?.message || "Unhandled error", ErrorTypes.CLIENT, ErrorSeverity.CRITICAL);

			logger.error("Global error caught:", appError);
			showErrorToast(appError, "System Error");
		});

		window.addEventListener("unhandledrejection", (event) => {
			const appError = new AppError(event.reason?.message || "Unhandled promise rejection", ErrorTypes.CLIENT, ErrorSeverity.CRITICAL);

			logger.error("Unhandled promise rejection:", appError);
			showErrorToast(appError, "System Error");
		});
	}
};
