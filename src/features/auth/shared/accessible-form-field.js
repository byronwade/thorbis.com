// REQUIRED: Accessible Form Field Component
// Provides enhanced accessibility for all users including seniors and screen reader users

"use client";

import { forwardRef } from "react";
import { cn } from "@utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

/**
 * Accessible Form Field with enhanced UX for all user types
 */
export const AccessibleFormField = forwardRef(({ label, helperText, errorMessage, successMessage, type = "text", placeholder, className = "", inputClassName = "", labelClassName = "", required = false, disabled = false, showSuccess = false, showHelper = true, size = "default", icon: Icon, rightElement, ...props }, ref) => {
	const fieldId = props.id || `field-${Math.random().toString(36).substr(2, 9)}`;
	const hasError = !!errorMessage;
	const hasSuccess = showSuccess && !hasError;
	const helperId = `${fieldId}-helper`;
	const errorId = `${fieldId}-error`;

	// Size variations for different user needs
	const sizeClasses = {
		small: "h-10 text-sm px-3",
		default: "h-12 text-base px-4",
		large: "h-14 text-lg px-5",
	};

	const labelSizeClasses = {
		small: "text-sm",
		default: "text-base",
		large: "text-lg",
	};

	return (
		<div className={cn("space-y-2", className)}>
			{/* Enhanced Label */}
			{label && (
				<label htmlFor={fieldId} className={cn("block font-medium text-foreground cursor-pointer", labelSizeClasses[size], disabled && "text-muted-foreground cursor-not-allowed", labelClassName)}>
					{label}
					{required && (
						<span className="ml-1 text-destructive" aria-label="required">
							*
						</span>
					)}
				</label>
			)}

			{/* Input Container */}
			<div className="relative">
				{/* Left Icon */}
				{Icon && (
					<div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
						<Icon className={cn("text-muted-foreground", size === "small" ? "w-4 h-4" : size === "large" ? "w-6 h-6" : "w-5 h-5")} />
					</div>
				)}

				{/* Input Field */}
				<input
					ref={ref}
					id={fieldId}
					type={type}
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					className={cn(
						// Base styles
						"w-full border border-input bg-background rounded-lg",
						"focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
						"transition-all duration-200",
						"placeholder:text-muted-foreground/70",

						// Size classes
						sizeClasses[size],

						// Icon padding
						Icon && (size === "small" ? "pl-10" : size === "large" ? "pl-12" : "pl-11"),
						rightElement && (size === "small" ? "pr-10" : size === "large" ? "pr-12" : "pr-11"),

						// State classes
						hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
						hasSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500/20",
						disabled && "bg-muted cursor-not-allowed opacity-60",

						inputClassName
					)}
					aria-describedby={cn(helperText && showHelper && helperId, hasError && errorId)}
					aria-invalid={hasError}
					{...props}
				/>

				{/* Right Element (Success/Error Icons or Custom) */}
				<div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
					{hasSuccess && <CheckCircle2 className={cn("text-success", size === "small" ? "w-4 h-4" : size === "large" ? "w-6 h-6" : "w-5 h-5")} />}
					{hasError && <AlertCircle className={cn("text-destructive", size === "small" ? "w-4 h-4" : size === "large" ? "w-6 h-6" : "w-5 h-5")} />}
					{rightElement}
				</div>
			</div>

			{/* Helper Text */}
			{helperText && showHelper && !hasError && (
				<div id={helperId} className="flex items-start space-x-2">
					<Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
					<p className={cn("text-muted-foreground", size === "small" ? "text-xs" : "text-sm")}>{helperText}</p>
				</div>
			)}

			{/* Success Message */}
			{successMessage && hasSuccess && (
				<div className="flex items-start space-x-2">
					<CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
					<p className={cn("text-success font-medium", size === "small" ? "text-xs" : "text-sm")}>{successMessage}</p>
				</div>
			)}

			{/* Error Message */}
			{errorMessage && (
				<div id={errorId} className="flex items-start space-x-2" role="alert">
					<AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
					<p className={cn("text-destructive font-medium", size === "small" ? "text-xs" : "text-sm")}>{errorMessage}</p>
				</div>
			)}
		</div>
	);
});

AccessibleFormField.displayName = "AccessibleFormField";

/**
 * Accessible Button with enhanced UX
 */
export const AccessibleButton = forwardRef(({ children, variant = "default", size = "default", disabled = false, loading = false, loadingText = "Loading...", className = "", ...props }, ref) => {
	const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

	const variants = {
		default: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20",
		outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-primary/20",
		ghost: "text-primary hover:bg-primary/10 focus:ring-primary/20",
		destructive: "bg-destructive text-white hover:bg-destructive focus:ring-red-500/20",
	};

	const sizes = {
		small: "h-9 px-3 text-sm",
		default: "h-12 px-6 text-base",
		large: "h-14 px-8 text-lg",
	};

	return (
		<button ref={ref} disabled={disabled || loading} className={cn(baseClasses, variants[variant], sizes[size], className)} {...props}>
			{loading ? loadingText : children}
		</button>
	);
});

AccessibleButton.displayName = "AccessibleButton";

/**
 * Smart Form Container with progress indication
 */
export function SmartFormContainer({ children, title, description, currentStep = 1, totalSteps = 1, showProgress = false, className = "" }) {
	return (
		<div className={cn("w-full max-w-lg mx-auto", className)}>
			{/* Header */}
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
				{description && <p className="text-lg text-muted-foreground">{description}</p>}

				{/* Progress Indicator */}
				{showProgress && totalSteps > 1 && (
					<div className="mt-6">
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm text-muted-foreground">
								Step {currentStep} of {totalSteps}
							</span>
							<span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}% complete</span>
						</div>
						<div className="w-full bg-muted rounded-full h-2">
							<div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
						</div>
					</div>
				)}
			</div>

			{children}
		</div>
	);
}

export default AccessibleFormField;
