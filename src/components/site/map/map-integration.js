"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { MapPin, Navigation, Crosshair, Search, Loader2, AlertCircle, CheckCircle, X, RefreshCw, Settings, Globe } from "lucide-react";
import { withErrorHandling, showErrorToast, showSuccessToast } from "@utils/error-handler";
import { useMapStore } from "@store/map";
import { useBusinessStore } from "@store/business";

const MapIntegration = ({ onLocationChange, onBoundsChange, onBusinessesUpdate, className = "" }) => {
	const [userLocation, setUserLocation] = useState(null);
	const [searchLocation, setSearchLocation] = useState("");
	const [isGettingLocation, setIsGettingLocation] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [locationError, setLocationError] = useState(null);
	const [searchSuggestions, setSearchSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [mapBounds, setMapBounds] = useState(null);
	const [zoomLevel, setZoomLevel] = useState(12);

	const searchTimeoutRef = useRef(null);
	const { centerOn, getMapBounds, getMapZoom, setMapCenter, setMapZoom } = useMapStore();

	const { fetchBusinesses, setFilteredBusinesses, allBusinesses } = useBusinessStore();

	// Get user's current location
	const getUserLocation = useCallback(
		withErrorHandling(async () => {
			if (!navigator.geolocation) {
				throw new Error("Geolocation is not supported by this browser");
			}

			setIsGettingLocation(true);
			setLocationError(null);

			return new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const { latitude, longitude } = position.coords;
						const location = { lat: latitude, lng: longitude };

						setUserLocation(location);
						setMapCenter(location);
						setMapZoom(14);

						if (onLocationChange) {
							onLocationChange(location);
						}

						showSuccessToast("Location detected successfully");
						resolve(location);
					},
					(error) => {
						let errorMessage = "Failed to get your location";

						switch (error.code) {
							case error.PERMISSION_DENIED:
								errorMessage = "Location access denied. Please enable location services.";
								break;
							case error.POSITION_UNAVAILABLE:
								errorMessage = "Location information is unavailable.";
								break;
							case error.TIMEOUT:
								errorMessage = "Location request timed out.";
								break;
							default:
								errorMessage = "An unknown error occurred while getting location.";
						}

						setLocationError(errorMessage);
						reject(new Error(errorMessage));
					},
					{
						enableHighAccuracy: true,
						timeout: 10000,
						maximumAge: 60000,
					}
				);
			});
		}, "MapIntegration"),
		[setMapCenter, setMapZoom, onLocationChange, setIsGettingLocation, setLocationError]
	);

	// Geocode address to coordinates
	const geocodeAddress = useCallback(
		withErrorHandling(async (address) => {
			if (!address.trim()) {
				throw new Error("Please enter a valid address");
			}

			setIsSearching(true);
			setLocationError(null);

			try {
				const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);

				if (!response.ok) {
					throw new Error("Failed to geocode address");
				}

				const data = await response.json();

				if (data.results && data.results.length > 0) {
					const location = data.results[0].geometry.location;

					setUserLocation(location);
					setMapCenter(location);
					setMapZoom(14);

					if (onLocationChange) {
						onLocationChange(location);
					}

					showSuccessToast("Location found successfully");
					return location;
				} else {
					throw new Error("No results found for this address");
				}
			} catch (error) {
				setLocationError(error.message);
				throw error;
			} finally {
				setIsSearching(false);
			}
		}, "MapIntegration"),
		[setMapCenter, setMapZoom, onLocationChange, setIsSearching, setLocationError, setUserLocation]
	);

	// Reverse geocode coordinates to address
	const reverseGeocode = useCallback(
		withErrorHandling(async (lat, lng) => {
			try {
				const response = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);

				if (!response.ok) {
					throw new Error("Failed to reverse geocode coordinates");
				}

				const data = await response.json();

				if (data.results && data.results.length > 0) {
					return data.results[0].formatted_address;
				} else {
					throw new Error("No address found for these coordinates");
				}
			} catch (error) {
				console.error("Reverse geocoding error:", error);
				return null;
			}
		}, "MapIntegration"),
		[]
	);

	// Search for location suggestions
	const searchLocationSuggestions = useCallback(
		withErrorHandling(async (query) => {
			if (!query.trim() || query.length < 3) {
				setSearchSuggestions([]);
				setShowSuggestions(false);
				return;
			}

			// Debounce the search
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}

			searchTimeoutRef.current = setTimeout(async () => {
				try {
					// Mock suggestions - in real app, this would call a geocoding API
					const mockSuggestions = [`${query}, New York, NY`, `${query}, Los Angeles, CA`, `${query}, Chicago, IL`, `${query}, Houston, TX`, `${query}, Phoenix, AZ`];

					setSearchSuggestions(mockSuggestions);
					setShowSuggestions(true);
				} catch (error) {
					console.error("Search suggestions error:", error);
					setSearchSuggestions([]);
				}
			}, 300);
		}, "MapIntegration"),
		[setSearchSuggestions, setShowSuggestions]
	);

	// Handle location search
	const handleLocationSearch = useCallback(async () => {
		if (!searchLocation.trim()) return;

		try {
			await geocodeAddress(searchLocation);
			setSearchLocation("");
			setShowSuggestions(false);
		} catch (error) {
			showErrorToast(error, "Location Search Error");
		}
	}, [searchLocation, geocodeAddress]);

	// Handle suggestion selection
	const handleSuggestionSelect = useCallback(
		async (suggestion) => {
			setSearchLocation(suggestion);
			setShowSuggestions(false);
			await geocodeAddress(suggestion);
		},
		[geocodeAddress]
	);

	// Update map bounds and fetch businesses
	const updateMapBounds = useCallback(
		withErrorHandling(async () => {
			try {
				const bounds = await getMapBounds();
				const zoom = await getMapZoom();

				if (bounds && zoom) {
					setMapBounds(bounds);
					setZoomLevel(zoom);

					if (onBoundsChange) {
						onBoundsChange(bounds, zoom);
					}

					// Fetch businesses in the current bounds
					const businesses = await fetchBusinesses("", "", bounds, zoom);

					if (onBusinessesUpdate) {
						onBusinessesUpdate(businesses);
					}
				}
			} catch (error) {
				console.error("Failed to update map bounds:", error);
			}
		}, "MapIntegration"),
		[getMapBounds, getMapZoom, onBoundsChange, fetchBusinesses, onBusinessesUpdate, setMapBounds, setZoomLevel]
	);

	// Center map on specific location
	const centerOnLocation = useCallback(
		async (location) => {
			try {
				await centerOn(location.lat, location.lng);
				setUserLocation(location);

				if (onLocationChange) {
					onLocationChange(location);
				}

				// Update bounds after centering
				setTimeout(updateMapBounds, 500);
			} catch (error) {
				showErrorToast(error, "Map Navigation Error");
			}
		},
		[centerOn, onLocationChange, updateMapBounds]
	);

	// Handle input change
	const handleSearchInputChange = useCallback(
		(e) => {
			const value = e.target.value;
			setSearchLocation(value);
			searchLocationSuggestions(value);
		},
		[searchLocationSuggestions]
	);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleLocationSearch();
			} else if (e.key === "Escape") {
				setShowSuggestions(false);
			}
		},
		[handleLocationSearch]
	);

	// Clear location
	const clearLocation = useCallback(() => {
		setUserLocation(null);
		setSearchLocation("");
		setLocationError(null);
		setShowSuggestions(false);

		if (onLocationChange) {
			onLocationChange(null);
		}
	}, [onLocationChange]);

	// Refresh location
	const refreshLocation = useCallback(async () => {
		try {
			await getUserLocation();
			await updateMapBounds();
		} catch (error) {
			showErrorToast(error, "Location Refresh Error");
		}
	}, [getUserLocation, updateMapBounds]);

	// Initialize with default location if available
	useEffect(() => {
		const initializeLocation = async () => {
			try {
				// Try to get user location on component mount
				await getUserLocation();
			} catch (error) {
				// If geolocation fails, set a default location
				const defaultLocation = { lat: 40.7128, lng: -74.006 }; // New York
				setUserLocation(defaultLocation);
				setMapCenter(defaultLocation);
			}
		};

		initializeLocation();
	}, [getUserLocation, setMapCenter]);

	// Update bounds when map changes
	useEffect(() => {
		const interval = setInterval(updateMapBounds, 2000); // Update every 2 seconds
		return () => clearInterval(interval);
	}, [updateMapBounds]);

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Location Controls */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Globe className="w-5 h-5" />
						Location & Navigation
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Current Location */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<MapPin className="w-4 h-4" />
							Current Location
						</Label>

						{userLocation ? (
							<div className="flex items-center gap-2 p-3 bg-muted rounded-md">
								<CheckCircle className="w-4 h-4 text-success" />
								<span className="text-sm">
									{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
								</span>
								<Button variant="ghost" size="sm" onClick={clearLocation} className="ml-auto">
									<X className="w-4 h-4" />
								</Button>
							</div>
						) : (
							<div className="flex items-center gap-2 p-3 bg-muted rounded-md">
								<AlertCircle className="w-4 h-4 text-warning" />
								<span className="text-sm text-muted-foreground">No location set</span>
							</div>
						)}
					</div>

					{/* Location Search */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<Search className="w-4 h-4" />
							Search Location
						</Label>

						<div className="relative">
							<Input placeholder="Enter address or location..." value={searchLocation} onChange={handleSearchInputChange} onKeyDown={handleKeyDown} className="pr-20" />

							<div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
								{isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
								<Button size="sm" onClick={handleLocationSearch} disabled={!searchLocation.trim() || isSearching}>
									Search
								</Button>
							</div>
						</div>

						{/* Search Suggestions */}
						{showSuggestions && searchSuggestions.length > 0 && (
							<Card className="absolute z-50 w-full mt-1">
								<CardContent className="p-0">
									<div className="max-h-48 overflow-y-auto">
										{searchSuggestions.map((suggestion, index) => (
											<button key={index} onClick={() => handleSuggestionSelect(suggestion)} className="w-full text-left p-2 hover:bg-muted transition-colors text-sm">
												{suggestion}
											</button>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex gap-2">
						<Button onClick={getUserLocation} disabled={isGettingLocation} className="flex-1">
							{isGettingLocation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crosshair className="w-4 h-4 mr-2" />}
							Get My Location
						</Button>

						<Button onClick={refreshLocation} variant="outline" disabled={!userLocation}>
							<RefreshCw className="w-4 h-4" />
						</Button>
					</div>

					{/* Error Display */}
					{locationError && (
						<div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
							<div className="flex items-center gap-2 text-destructive text-sm">
								<AlertCircle className="w-4 h-4" />
								{locationError}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Map Information */}
			{mapBounds && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="w-5 h-5" />
							Map Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label className="text-xs text-muted-foreground">Zoom Level</Label>
								<div className="text-sm font-medium">{zoomLevel}</div>
							</div>
							<div>
								<Label className="text-xs text-muted-foreground">Businesses Found</Label>
								<div className="text-sm font-medium">{allBusinesses.length}</div>
							</div>
						</div>

						<div>
							<Label className="text-xs text-muted-foreground">Map Bounds</Label>
							<div className="text-xs font-mono bg-muted p-2 rounded mt-1">
								{mapBounds.north.toFixed(4)}, {mapBounds.east.toFixed(4)}
								<br />
								{mapBounds.south.toFixed(4)}, {mapBounds.west.toFixed(4)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Navigation className="w-5 h-5" />
						Quick Actions
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-2">
						<Button variant="outline" size="sm" onClick={() => centerOnLocation({ lat: 40.7128, lng: -74.006 })}>
							New York
						</Button>
						<Button variant="outline" size="sm" onClick={() => centerOnLocation({ lat: 34.0522, lng: -118.2437 })}>
							Los Angeles
						</Button>
						<Button variant="outline" size="sm" onClick={() => centerOnLocation({ lat: 41.8781, lng: -87.6298 })}>
							Chicago
						</Button>
						<Button variant="outline" size="sm" onClick={() => centerOnLocation({ lat: 29.7604, lng: -95.3698 })}>
							Houston
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default MapIntegration;
