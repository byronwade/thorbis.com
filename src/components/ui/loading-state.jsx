"use client";
import React from "react";
import { cn } from "@utils";

/**
 * Reusable LoadingState component with proper alignment and consistent styling
 * Supports multiple variants and sizes for different use cases
 */
const LoadingState = ({
	size = "default",
	variant = "default",
	children,
	className = "",
	showText = true,
	text = "Loading...",
	center = false,
	...props
}) => {
	// Size configurations
	const sizes = {
		sm: {
			spinner: "w-4 h-4",
			text: "text-sm",
			gap: "gap-2",
			padding: "px-3 py-2"
		},
		default: {
			spinner: "w-5 h-5",
			text: "text-base",
			gap: "gap-3",
			padding: "px-4 py-3"
		},
		lg: {
			spinner: "w-6 h-6",
			text: "text-lg",
			gap: "gap-4",
			padding: "px-6 py-4"
		}
	};

	// Variant configurations
	const variants = {
		default: {
			container: "bg-primary text-primary-foreground",
			spinner: "border-current border-r-transparent"
		},
		secondary: {
			container: "bg-secondary text-secondary-foreground",
			spinner: "border-current border-r-transparent"
		},
		ghost: {
			container: "text-foreground",
			spinner: "border-current border-r-transparent"
		},
		card: {
			container: "bg-card text-card-foreground border border-border",
			spinner: "border-current border-r-transparent"
		}
	};

	const sizeConfig = sizes[size];
	const variantConfig = variants[variant];

	const containerClasses = cn(
		"inline-flex items-center justify-center font-medium rounded-lg shadow-sm",
		sizeConfig.gap,
		sizeConfig.padding,
		variantConfig.container,
		center && "mx-auto",
		className
	);

	const spinnerClasses = cn(
		"border-2 rounded-full animate-spin",
		sizeConfig.spinner,
		variantConfig.spinner
	);

	const textClasses = cn(
		"font-medium",
		sizeConfig.text
	);

	return (
		<div className={containerClasses} {...props}>
			<div className={spinnerClasses} />
			{showText && (
				<span className={textClasses}>
					{children || text}
				</span>
			)}
		</div>
	);
};

/**
 * Page-level loading state component
 */
const PageLoadingState = ({
	title = "Setting up your account...",
	subtitle = "Please wait while we configure your permissions.",
	className = ""
}) => (
	<div className={cn("mx-auto max-w-7xl space-y-8 p-6", className)}>
		<div className="text-center space-y-4">
			<LoadingState size="lg" center>
				{title}
			</LoadingState>
			{subtitle && (
				<p className="text-muted-foreground">{subtitle}</p>
			)}
		</div>
	</div>
);

/**
 * Inline loading state (for buttons, cards, etc.)
 */
const InlineLoadingState = ({
	size = "sm",
	text = "Loading...",
	className = ""
}) => (
	<LoadingState
		size={size}
		variant="ghost"
		text={text}
		className={className}
	/>
);

/**
 * Card loading state
 */
const CardLoadingState = ({
	title = "Loading content...",
	className = ""
}) => (
	<div className={cn("flex items-center justify-center p-8", className)}>
		<LoadingState variant="card" size="default">
			{title}
		</LoadingState>
	</div>
);

/**
 * Overlay loading state
 */
const OverlayLoadingState = ({
	title = "Loading...",
	backdrop = true,
	className = ""
}) => (
	<div className={cn(
		"absolute inset-0 z-50 flex items-center justify-center",
		backdrop && "bg-background/80 backdrop-blur-sm",
		className
	)}>
		<LoadingState size="lg" variant="card">
			{title}
		</LoadingState>
	</div>
);

export {
	LoadingState,
	PageLoadingState,
	InlineLoadingState,
	CardLoadingState,
	OverlayLoadingState
};
