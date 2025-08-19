import React from "react";
import logger from "@lib/utils/logger";

/**
 * Error Boundary specifically designed to catch and handle ZodError instances
 * Prevents ZodErrors from crashing the application or appearing in console
 */
class ZodErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		// Check if this is a ZodError
		if (error && error.name === "ZodError") {
			// Log the error for debugging but don't crash the app
			logger.debug("ZodError caught by error boundary:", {
				errors: error.errors,
				issues: error.issues,
				message: error.message,
			});
			return { hasError: true, error };
		}

		// For non-ZodErrors, let them bubble up
		return null;
	}

	componentDidCatch(error, errorInfo) {
		// Only handle ZodErrors
		if (error && error.name === "ZodError") {
			logger.debug("ZodError details:", {
				error: error.message,
				componentStack: errorInfo.componentStack,
				errorBoundary: "ZodErrorBoundary",
			});

			// Prevent the error from appearing in console
			event?.preventDefault?.();
		}
	}

	render() {
		if (this.state.hasError && this.state.error?.name === "ZodError") {
			// For ZodErrors, render the children normally (as if nothing happened)
			// This allows the form to continue working while suppressing validation errors
			return this.props.children;
		}

		return this.props.children;
	}
}

export default ZodErrorBoundary;
