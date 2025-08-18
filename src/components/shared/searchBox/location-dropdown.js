"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup } from "@components/ui/dropdown-menu";
import { X, ChevronDown, MapPin, Navigation, Globe, Home, Heart, Clock, Star, Target, Crosshair, Settings } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Loader2 } from "lucide-react";
import { useSearchStore } from "@store/search";
import { useMapStore } from "@store/map";
import { useBusinessStore } from "@store/business";
import { useLocationStore, locationUtils } from "@lib/location/enhanced-location-service";
import { cn } from "@lib/utils";
import { debounce } from "lodash";

const LocationDropdown = ({ className, size = "default" }) => {
	const router = useRouter();
	const inputRef = useRef(null);
	const { setActiveBusinessId } = useBusinessStore();
	
	// Enhanced location store
	const {
		currentLocation,
		isGettingLocation,
		locationError,
		recentLocations,
		favoriteLocations,
		searchSuggestions,
		isLoadingSuggestions,
		getCurrentLocation,
		getLocationSuggestions,
		addToFavorites,
		removeFromFavorites,
		addToRecentLocations
	} = useLocationStore();
	
	// Legacy compatibility with search store
	const { location, setLocation, activeDropdown, setActiveDropdown } = useSearchStore();
	const { centerOn, isMapAvailable } = useMapStore();
	
	// Component state
	const [searchQuery, setSearchQuery] = useState('');

	// Size variants for different contexts
	const sizeVariants = {
		small: {
			button: "h-6 text-xs px-2 rounded-md",
			icon: "w-3 h-3",
			text: "max-w-20 sm:max-w-24",
			dropdown: "w-64",
			input: "text-sm",
			content: "p-3",
		},
		default: {
			button: "h-7 text-sm px-3 rounded-lg",
			icon: "w-4 h-4",
			text: "max-w-24 sm:max-w-32",
			dropdown: "w-72",
			input: "text-sm",
			content: "p-4",
		},
		large: {
			button: "h-10 text-base px-4 rounded-lg",
			icon: "w-5 h-5",
			text: "max-w-28 sm:max-w-36",
			dropdown: "w-80",
			input: "text-base",
			content: "p-5",
		},
	};

	const currentSize = sizeVariants[size];

	useEffect(() => {
		const fetchCoordinatesAndSetLocation = async (locationValue) => {
			try {
				const { lat, lng } = await fetchCoordinatesFromCityAndState(locationValue);
				setLocation({ lat, lng, value: locationValue, city: locationValue, error: false });
				setActiveBusinessId(null);

				// Validate coordinates before centering (only if map is available)
				if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
					if (isMapAvailable()) {
						centerOn(lat, lng);
					}
				} else {
					console.error("Invalid coordinates from fetchCoordinatesFromCityAndState:", { lat, lng });
				}
			} catch (error) {
				console.error("Error fetching coordinates:", error);
				setLocation({ error: true });
			}
		};

		const urlParams = new URLSearchParams(window.location.search);
		const locationParam = urlParams.get("location");
		if (locationParam) {
			fetchCoordinatesAndSetLocation(locationParam);
			console.log("Location param:", locationParam);
		} else {
			setLocation({ error: true });
		}
	}, [fetchCoordinatesFromCityAndState, setLocation, centerOn, setActiveBusinessId]);

	const updateURL = (newParams) => {
		const url = new URL(window.location.href);
		url.searchParams.set("location", newParams.location);
		router.replace(url.toString(), undefined, { shallow: true });
	};

	const handleGetLocationClick = async () => {
		setLocation({ loading: true, error: false });

		try {
			// Check if geolocation is supported
			if (!navigator.geolocation) {
				throw new Error("Geolocation is not supported by this browser");
			}

			// Get current position with high accuracy
			const position = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 15000, // Increased timeout
					maximumAge: 300000, // 5 minutes
				});
			});

			const lat = position.coords.latitude;
			const lng = position.coords.longitude;

			console.log("Got coordinates:", { lat, lng });

			// Validate coordinates
			if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
				try {
					// Reverse geocode to get address
					const result = await fetchCityAndStateFromCoordinates(lat, lng);
					console.log("Reverse geocode result:", result);

					// Handle case where city or state might be undefined
					const city = result?.city || "Unknown";
					const state = result?.state || "Location";
					const locationString = `${city}, ${state}`;

					console.log("Location string:", locationString);
					setLocation({
						lat,
						lng,
						value: locationString,
						city: locationString,
						error: false,
						loading: false,
					});
					setActiveBusinessId(null);
					updateURL({ location: locationString });
					if (isMapAvailable()) {
						centerOn(lat, lng);
					}
				} catch (reverseGeocodeError) {
					console.error("Reverse geocoding failed:", reverseGeocodeError);
					// Still set the location with coordinates, just use a generic location name
					const fallbackLocation = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
					setLocation({
						lat,
						lng,
						value: fallbackLocation,
						city: fallbackLocation,
						error: false,
						loading: false,
					});
					setActiveBusinessId(null);
					updateURL({ location: fallbackLocation });
					if (isMapAvailable()) {
						centerOn(lat, lng);
					}
				}
			} else {
				throw new Error("Invalid coordinates received");
			}
		} catch (error) {
			console.error("Geolocation error:", error);
			console.error("Error details:", {
				name: error.name,
				message: error.message,
				code: error.code,
				stack: error.stack,
			});

			let errorMessage = "Unable to get your location";

			// Handle geolocation API errors
			if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
				errorMessage = "Location access denied. Please enable location services in your browser.";
			} else if (error.code === 2 || error.code === error.POSITION_UNAVAILABLE) {
				errorMessage = "Location unavailable. Please check your internet connection.";
			} else if (error.code === 3 || error.code === error.TIMEOUT) {
				errorMessage = "Location request timed out. Please try again.";
			} else if (error.message) {
				errorMessage = error.message;
			}

			setLocation({
				error: true,
				loading: false,
				errorMessage,
			});
		}
	};

	const debouncedFetchSuggestions = useCallback(() => {
		const debouncedFn = debounce(async (value) => {
			try {
				const suggestions = await fetchAutocompleteSuggestions(value);
				setLocation({ filteredSuggestions: suggestions, error: false });
			} catch (error) {
				setLocation({ filteredSuggestions: [], error: true });
			}
		}, 300);
		return debouncedFn;
	}, [fetchAutocompleteSuggestions, setLocation]);

	const handleInputChange = (event) => {
		const value = event.target.value || "";
		setLocation({ value });
		if (value) {
			debouncedFetchSuggestions()(value);
		} else {
			setLocation({ filteredSuggestions: [] });
		}
	};

	const handleInputKeyDown = async (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			await fetchCoordinatesAndSetLocation(location.value);
		}
	};

	const handleSelectLocation = async (location) => {
		try {
			const details = await fetchPlaceDetails(location.place_id);
			const { lat, lng } = details.geometry.location;

			// Validate coordinates before centering
			if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
				setLocation({ lat, lng, value: location.description, city: location.description, error: false });
				updateURL({ location: location.description });
				if (isMapAvailable()) {
					centerOn(lat, lng);
				}
			} else {
				console.error("Invalid coordinates from place details:", { lat, lng });
				throw new Error("Invalid coordinates from place details");
			}
		} catch (error) {
			setLocation({ error: true });
		}
	};

	const clearLocation = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setLocation({ value: "", city: "", filteredSuggestions: [], lat: null, lng: null, error: true });
		updateURL({ location: "" });
	};

	// Get status color based on location state
	const getStatusColor = () => {
		if (location.error) return "border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground";
		if ((typeof location.city === "string" && location.city) || (typeof location.value === "string" && location.value)) return "border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary";
		return "border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary";
	};

	// Get status icon
	const getStatusIcon = () => {
		if (location.loading) return <Loader2 className={`${currentSize.icon} animate-spin text-primary`} />;
		if ((typeof location.city === "string" && location.city) || (typeof location.value === "string" && location.value)) return <div className="w-2 h-2 rounded-full bg-primary" />;
		return null;
	};

	// Popular locations for quick access
	const popularLocations = [
		{ name: "New York, NY", icon: Home, description: "Manhattan, Brooklyn, Queens" },
		{ name: "Los Angeles, CA", icon: Home, description: "Hollywood, Downtown, Venice" },
		{ name: "Chicago, IL", icon: Home, description: "Downtown, North Side, South Side" },
		{ name: "Miami, FL", icon: Home, description: "South Beach, Downtown, Coral Gables" },
		{ name: "Austin, TX", icon: Home, description: "Downtown, East Austin, West Campus" },
		{ name: "Seattle, WA", icon: Home, description: "Downtown, Capitol Hill, Ballard" },
	];

	return (
		<div className="relative">
			<DropdownMenu
				open={activeDropdown === "location"}
				onOpenChange={(open) => {
					setActiveDropdown(open ? "location" : null);
				}}
			>
				{/* Main Button Container - Modern Design */}
				<div className={`flex items-center ${currentSize.button} transition-all duration-200 bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:text-slate-700 dark:hover:text-slate-300`}>
					{/* Status Icon Section - only show when there's an icon */}
					{getStatusIcon() && <div className="flex items-center justify-center px-2">{getStatusIcon()}</div>}

					{/* Dropdown Trigger Section */}
					<DropdownMenuTrigger asChild>
						<button className={`flex items-center gap-1.5 py-1 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex-1 transition-colors ${getStatusIcon() ? "px-1" : "px-2"}`} type="button" title={location.error ? location.errorMessage || "Click to set your location" : location.city ? `Current location: ${typeof location.city === "string" ? location.city : location.value || "Unknown"}` : "Click here to set your location"}>
							<MapPin className={`${currentSize.icon} text-slate-500 dark:text-slate-400`} />
							<span className={`truncate ${currentSize.text} text-slate-700 dark:text-slate-300 font-medium`}>{typeof location.city === "string" ? location.city : typeof location.value === "string" ? location.value : "Location"}</span>
							<ChevronDown className={`${currentSize.icon} flex-shrink-0 text-slate-400 dark:text-slate-500`} />
						</button>
					</DropdownMenuTrigger>

					{/* Clear Button Section */}
					{(typeof location.city === "string" && location.city) || (typeof location.value === "string" && location.value) ? (
						<button onClick={clearLocation} className="flex items-center justify-center w-6 h-full border-l border-slate-300/60 dark:border-slate-600/60 hover:bg-red-100/80 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 text-slate-400 dark:text-slate-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" title="Clear location" type="button">
							<X className="w-3 h-3" />
						</button>
					) : null}
				</div>

				{/* Dropdown Content */}
				<DropdownMenuContent className={`${currentSize.dropdown} bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[9999]`} side="bottom" align="center" sideOffset={8} avoidCollisions={true} collisionPadding={20}>
					{/* Current Location Button */}
					<DropdownMenuItem asChild>
						<Button onClick={handleGetLocationClick} disabled={location.loading} variant="ghost" className="w-full justify-start gap-3 h-12 hover:bg-accent hover:text-accent-foreground">
							{location.loading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Navigation className="w-5 h-5 text-primary" />}
							<div className="flex flex-col items-start">
								<span className="font-medium">{location.loading ? "Getting your location..." : "Use My Current Location"}</span>
								<span className="text-xs text-muted-foreground">Help us find businesses near you!</span>
							</div>
						</Button>
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					{/* Popular Locations */}
					<div className={`${currentSize.content}`}>
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Globe className="w-4 h-4" />
								Popular Locations
							</label>
							<div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
								{popularLocations.map((loc, idx) => (
									<button key={idx} onClick={() => handleSelectLocation({ place_id: `popular_${idx}`, description: loc.name })} className="w-full text-left p-2 hover:bg-muted rounded-md text-sm transition-colors flex items-center gap-3 group">
										<div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
											<loc.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
										</div>
										<div className="flex flex-col">
											<span className="font-medium">{loc.name}</span>
											<span className="text-xs text-muted-foreground">{loc.description}</span>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>

					<DropdownMenuSeparator />

					{/* Manual Input Section */}
					<div className={`${currentSize.content}`}>
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<MapPin className="w-4 h-4" />
								Or enter a city name:
							</label>
							<Input ref={inputRef} placeholder="e.g., Atlanta, GA" value={location.value || ""} onChange={handleInputChange} onKeyDown={handleInputKeyDown} className={`w-full ${currentSize.input}`} />
						</div>

						{/* Suggestions */}
						{location.filteredSuggestions && location.filteredSuggestions.length > 0 && (
							<div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
								<div className="text-xs font-medium text-muted-foreground mb-2">Suggestions:</div>
								{location.filteredSuggestions.slice(0, 4).map((loc) => (
									<button key={loc.place_id} onClick={() => handleSelectLocation(loc)} className="w-full text-left p-2 hover:bg-muted rounded text-sm transition-colors block">
										{loc.description}
									</button>
								))}
							</div>
						)}

						{/* Error Message */}
						{location.error && location.errorMessage && <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">{location.errorMessage}</div>}
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

const LocationDropdownWithSuspense = ({ size, className }) => (
	<LocationDropdown size={size} className={className} />
);

export default LocationDropdownWithSuspense;
