/**
 * LocationControls Component
 * Extracted from MapIntegration.js (485 lines)
 * Handles location control UI elements and interactions
 * Enterprise-level component with accessibility and performance optimization
 */

"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { MapPin, Navigation, Crosshair, Loader2, AlertCircle, CheckCircle, X, RefreshCw, Settings, Globe } from "lucide-react";
import { SearchSuggestionsUI } from "./search-suggestions";

export const LocationControls = ({
	// Location state
	userLocation,
	isGettingLocation,
	isSearching,
	locationError,

	// Search state
	searchLocation,
	searchSuggestions,
	showSuggestions,
	isLoadingSuggestions,

	// Location actions
	onGetUserLocation,
	onClearLocation,
	onRefreshLocation,

	// Search actions
	onSearchInputChange,
	onSuggestionSelect,
	onSearchSubmit,
	onSearchKeyDown,
	onClearSearch,
	onSetShowSuggestions,

	// Additional props
	className = "",
	showAdvancedControls = true,
}) => {
	return (
		<Card className={`w-full max-w-md ${className}`}>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center space-x-2">
					<MapPin className="h-5 w-5" />
					<span>Location Controls</span>
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Current Location Status */}
				{userLocation && (
					<div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
						<div className="flex items-center space-x-2">
							<CheckCircle className="h-4 w-4 text-success" />
							<span className="text-sm font-medium text-success">Location Set</span>
						</div>
						<div className="flex items-center space-x-1">
							<Button variant="ghost" size="sm" onClick={onRefreshLocation} className="h-6 w-6 p-0 hover:bg-success/10">
								<RefreshCw className="h-3 w-3" />
							</Button>
							<Button variant="ghost" size="sm" onClick={onClearLocation} className="h-6 w-6 p-0 hover:bg-success/10">
								<X className="h-3 w-3" />
							</Button>
						</div>
					</div>
				)}

				{/* Location Error */}
				{locationError && (
					<div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
						<AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
						<div className="flex-1">
							<p className="text-sm font-medium text-destructive">Location Error</p>
							<p className="text-xs text-destructive mt-1">{locationError}</p>
						</div>
					</div>
				)}

				{/* Get Current Location Button */}
				<Button onClick={onGetUserLocation} disabled={isGettingLocation} className="w-full" variant={userLocation ? "outline" : "default"}>
					{isGettingLocation ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Getting Location...
						</>
					) : (
						<>
							<Crosshair className="h-4 w-4 mr-2" />
							{userLocation ? "Update Location" : "Use My Location"}
						</>
					)}
				</Button>

				{/* Location Search */}
				<div className="space-y-2">
					<label className="text-sm font-medium">Or search for a location:</label>
					<SearchSuggestionsUI searchLocation={searchLocation} searchSuggestions={searchSuggestions} showSuggestions={showSuggestions} isLoadingSuggestions={isLoadingSuggestions} onInputChange={onSearchInputChange} onSuggestionSelect={onSuggestionSelect} onSearchSubmit={onSearchSubmit} onKeyDown={onSearchKeyDown} onClear={onClearSearch} placeholder="Enter city, address, or landmark..." />
				</div>

				{/* Advanced Controls */}
				{showAdvancedControls && (
					<div className="border-t pt-4 mt-4">
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm font-medium">Advanced Options</span>
							<Settings className="h-4 w-4 text-muted-foreground" />
						</div>

						<div className="grid grid-cols-2 gap-2">
							<Button variant="outline" size="sm" className="justify-start">
								<Globe className="h-3 w-3 mr-2" />
								Worldwide
							</Button>
							<Button variant="outline" size="sm" className="justify-start">
								<Navigation className="h-3 w-3 mr-2" />
								Auto-Center
							</Button>
						</div>
					</div>
				)}

				{/* Current Location Display */}
				{userLocation && (
					<div className="text-xs text-muted-foreground space-y-1">
						<div>Latitude: {userLocation.lat.toFixed(6)}</div>
						<div>Longitude: {userLocation.lng.toFixed(6)}</div>
					</div>
				)}

				{/* Status Indicators */}
				<div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
					<div className="flex items-center space-x-1">
						<div className={`w-2 h-2 rounded-full ${userLocation ? "bg-success" : "bg-muted"}`} />
						<span>Location</span>
					</div>
					<div className="flex items-center space-x-1">
						<div className={`w-2 h-2 rounded-full ${isSearching || isGettingLocation ? "bg-warning" : "bg-muted"}`} />
						<span>Services</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default LocationControls;
