"use client";
import React from "react";
import { Button } from "./button";
import { cn } from "@utils";

/**
 * LoadingButton component that extends the base Button with proper loading states
 * Ensures consistent alignment and styling for loading indicators
 */
const LoadingButton = React.forwardRef(({
	children,
	loading = false,
	loadingText,
	variant = "default",
	size = "default",
	disabled = false,
	className = "",
	...props
}, ref) => {
	// Determine spinner size based on button size
	const spinnerSizes = {
		xs: "w-3 h-3",
		sm: "w-4 h-4",
		default: "w-4 h-4",
		lg: "w-5 h-5",
		icon: "w-4 h-4"
	};

	const spinnerSize = spinnerSizes[size] || spinnerSizes.default;

	return (
		<Button
			ref={ref}
			variant={variant}
			size={size}
			disabled={loading || disabled}
			className={cn(
				"relative transition-all duration-200",
				loading && "cursor-wait",
				className
			)}
			{...props}
		>
			{loading ? (
				<>
					<div className={cn(
						"border-2 border-current border-r-transparent rounded-full animate-spin",
						spinnerSize
					)} />
					<span className="ml-2">
						{loadingText || "Loading..."}
					</span>
				</>
			) : (
				children
			)}
		</Button>
	);
});

LoadingButton.displayName = "LoadingButton";

/**
 * Specialized loading buttons for common use cases
 */

// Submit button with loading state
const SubmitButton = React.forwardRef(({
	children = "Submit",
	loadingText = "Submitting...",
	loading = false,
	...props
}, ref) => (
	<LoadingButton
		ref={ref}
		type="submit"
		loading={loading}
		loadingText={loadingText}
		{...props}
	>
		{children}
	</LoadingButton>
));

SubmitButton.displayName = "SubmitButton";

// Save button with loading state
const SaveButton = React.forwardRef(({
	children = "Save",
	loadingText = "Saving...",
	loading = false,
	variant = "default",
	...props
}, ref) => (
	<LoadingButton
		ref={ref}
		loading={loading}
		loadingText={loadingText}
		variant={variant}
		{...props}
	>
		{children}
	</LoadingButton>
));

SaveButton.displayName = "SaveButton";

// Search button with loading state
const SearchButton = React.forwardRef(({
	children = "Search",
	loadingText = "Searching...",
	loading = false,
	...props
}, ref) => (
	<LoadingButton
		ref={ref}
		loading={loading}
		loadingText={loadingText}
		{...props}
	>
		{children}
	</LoadingButton>
));

SearchButton.displayName = "SearchButton";

// Action button with loading state (for general actions)
const ActionButton = React.forwardRef(({
	children,
	loadingText = "Processing...",
	loading = false,
	...props
}, ref) => (
	<LoadingButton
		ref={ref}
		loading={loading}
		loadingText={loadingText}
		{...props}
	>
		{children}
	</LoadingButton>
));

ActionButton.displayName = "ActionButton";

export {
	LoadingButton,
	SubmitButton,
	SaveButton,
	SearchButton,
	ActionButton
};
