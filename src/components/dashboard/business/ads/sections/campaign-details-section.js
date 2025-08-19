/**
 * Campaign Details Section
 * Extracted from ads create/edit pages (678/804 lines)
 * Handles campaign name, type, and location configuration
 * Enterprise-level component with validation and performance optimization
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Alert, AlertDescription } from "@components/ui/alert";
import { HelpCircle, Target, MapPin, Info } from "lucide-react";

// Enhanced Map Placeholder Component
const MapPlaceholder = ({ location, radius, isValid = false }) => (
	<div className="relative bg-muted/30 border border-border rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center">
		<div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-green-50/50 rounded-lg" />
		<div className="relative z-10 text-center space-y-3">
			<div className="bg-primary/10 p-3 rounded-full w-fit mx-auto">
				<MapPin className={`w-6 h-6 ${isValid ? "text-success" : "text-muted-foreground"}`} />
			</div>
			<div>
				<p className="font-medium text-sm">{location || "Select your target location"}</p>
				{location && <p className="text-xs text-muted-foreground">Targeting within {radius}km radius</p>}
			</div>
			{isValid && (
				<div className="flex items-center justify-center gap-2 text-xs text-success">
					<div className="w-2 h-2 bg-success rounded-full" />
					Location configured
				</div>
			)}
		</div>
	</div>
);

export const CampaignDetailsSection = ({
	// Data props
	campaignData,
	errors = {},
	isHydrated = true,

	// Event handlers
	onUpdateField,
	onValidation,

	// Configuration
	showLocationMap = true,
	showHelpText = true,
	className = "",
}) => {
	const { name, type, location, radius } = campaignData;

	// Handle field updates with validation
	const handleFieldUpdate = (field, value) => {
		onUpdateField(field, value);

		// Trigger validation for the field
		if (onValidation) {
			onValidation(field, value);
		}
	};

	// Get character count with color coding
	const getCharacterCountColor = (current, max) => {
		const percentage = (current / max) * 100;
		if (percentage >= 90) return "text-destructive";
		if (percentage >= 75) return "text-warning";
		return "text-muted-foreground";
	};

	return (
		<Card className={`bg-card/90 dark:bg-card/80 shadow-lg border border-border ${className}`}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Target className="w-5 h-5 text-primary" />
					Campaign Details
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Location Map Preview */}
				{showLocationMap && <MapPlaceholder location={location} radius={radius} isValid={!!location?.trim()} />}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Campaign Name */}
					<div>
						<Label htmlFor="campaignName" className="flex items-center gap-2">
							Campaign Name *{showHelpText && <HelpCircle className="w-4 h-4 text-muted-foreground" />}
						</Label>
						<Input id="campaignName" placeholder="e.g., Summer Plumbing Special" value={name} onChange={(e) => handleFieldUpdate("name", e.target.value)} className={errors.name ? "border-red-500 focus:border-red-500" : ""} maxLength={50} {...(!isHydrated && { suppressHydrationWarning: true })} />
						{errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
						<p className={`text-xs mt-1 ${getCharacterCountColor(name?.length || 0, 50)}`}>{name?.length || 0}/50 characters</p>
					</div>

					{/* Ad Type */}
					<div>
						<Label htmlFor="adType" className="flex items-center gap-2">
							Ad Type
							{showHelpText && <Info className="w-4 h-4 text-muted-foreground" />}
						</Label>
						<Select value={type} onValueChange={(value) => handleFieldUpdate("type", value)}>
							<SelectTrigger>
								<SelectValue placeholder="Select ad type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="search">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-primary rounded-full" />
										Search Ads
									</div>
								</SelectItem>
								<SelectItem value="display">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-success rounded-full" />
										Display Ads
									</div>
								</SelectItem>
								<SelectItem value="social">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-purple-500 rounded-full" />
										Social Media
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
						{errors.type && <p className="text-sm text-destructive mt-1">{errors.type}</p>}
					</div>

					{/* Location */}
					<div className="md:col-span-2">
						<Label htmlFor="location" className="flex items-center gap-2">
							Target Location *
							<MapPin className="w-4 h-4 text-muted-foreground" />
						</Label>
						<Input id="location" placeholder="e.g., San Francisco, CA or 94102" value={location} onChange={(e) => handleFieldUpdate("location", e.target.value)} className={errors.location ? "border-red-500 focus:border-red-500" : ""} />
						{errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
						{showHelpText && <p className="text-xs text-muted-foreground mt-1">Enter a city, zip code, or address to target your ads</p>}
					</div>

					{/* Radius */}
					<div>
						<Label htmlFor="radius">Targeting Radius (km)</Label>
						<Select value={radius} onValueChange={(value) => handleFieldUpdate("radius", value)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="5">5 km</SelectItem>
								<SelectItem value="10">10 km</SelectItem>
								<SelectItem value="25">25 km</SelectItem>
								<SelectItem value="50">50 km</SelectItem>
								<SelectItem value="100">100 km</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Validation Summary */}
				{Object.keys(errors).length > 0 && (
					<Alert variant="destructive">
						<AlertDescription>Please fix the errors above before continuing.</AlertDescription>
					</Alert>
				)}
			</CardContent>
		</Card>
	);
};

export default CampaignDetailsSection;
