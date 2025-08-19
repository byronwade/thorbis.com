"use client";

import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { Button } from "@components/ui/button";
import { Minus, Plus, MapPin, Search, Target, ExternalLink, RefreshCw } from "lucide-react";
import BusinessInfoPanel from "@components/site/map/business-info-panel";
import FullScreenMapSkeleton from "@components/site/map/full-screen-map-skeleton";
import { useMapStore } from "@store/map";
import { useSearchStore } from "@store/search";
import { useBusinessStore } from "@store/business";
import { Map, ScaleControl } from "react-map-gl";

// Direct imports instead of dynamic imports
import BusinessMarkers from "@components/site/map/business-markers";
import ServiceArea from "@components/site/map/service-area";

// PERFORMANCE OPTIMIZATION: Add validation and fallback for Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Validate Mapbox token on component load
if (typeof window !== "undefined" && !MAPBOX_TOKEN) {
	console.warn("⚠️ Missing Mapbox access token. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file.");
	console.info("Get your token at: https://account.mapbox.com/access-tokens/");
}

// Add debugging for token validation
if (typeof window !== "undefined") {
	console.log("🔍 Mapbox token check:", {
		tokenExists: !!MAPBOX_TOKEN,
		tokenLength: MAPBOX_TOKEN ? MAPBOX_TOKEN.length : 0,
		tokenPrefix: MAPBOX_TOKEN ? MAPBOX_TOKEN.substring(0, 10) + "..." : "none",
		env: process.env.NODE_ENV
	});
}

const MapContainer = React.forwardRef((props, ref) => {
	const mapRef = useRef(null);
	const containerRef = useRef(null);
	const [mapStyle, setMapStyle] = useState("mapbox://styles/byronwade/clywtphyo006d01r7ep5s0h8a");
	const [isSearching, setIsSearching] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [viewState, setViewState] = useState({
		latitude: 37.7749,
		longitude: -122.4194,
		zoom: 10,
		bearing: 0,
		pitch: 0,
	});

	const { setMapRef, getMapBounds, getMapZoom } = useMapStore();
	const { searchQuery } = useSearchStore();
	const { fetchInitialBusinesses, fetchFilteredBusinesses, initializeWithSupabaseData, initialLoad, activeBusinessId, setActiveBusinessId, filteredBusinesses, loading } = useBusinessStore();
	const initialFetchDone = useRef(false);

	// Check if business details panel is open
	const isBusinessDetailsOpen = Boolean(activeBusinessId);

	const mapStyles = [
		{ name: "Default", value: "mapbox://styles/byronwade/clywtphyo006d01r7ep5s0h8a" },
		{ name: "Satellite", value: "mapbox://styles/mapbox/satellite-v9" },
		{ name: "Streets", value: "mapbox://styles/mapbox/streets-v12" },
		{ name: "Dark", value: "mapbox://styles/mapbox/dark-v11" },
		{ name: "Light", value: "mapbox://styles/mapbox/light-v11" },
		{ name: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v12" },
	];

	// Optimized map settings for better performance
	const mapSettings = useMemo(
		() => ({
			doubleClickZoom: true,
			scrollZoom: true,
			boxZoom: true,
			dragRotate: true,
			dragPan: true,
			keyboard: true,
			touchZoom: true,
			touchRotate: true,
			// Performance optimizations
			antialias: true,
			preserveDrawingBuffer: false,
			refreshExpiredTiles: true,
			maxTileCacheSize: 50,
			transformRequest: (url, resourceType) => {
				// Optimize tile loading
				if (resourceType === "Tile" && url.startsWith("http")) {
					return {
						url: url,
						headers: { "Cache-Control": "max-age=3600" },
					};
				}
			},
		}),
		[]
	);

	useEffect(() => {
		// Initialize with mock data immediately
		initializeWithSupabaseData();
	}, [initializeWithSupabaseData]);

	useEffect(() => {
		if (mapRef.current) {
			setMapRef(mapRef.current.getMap());
			console.log("Map ref set on load:", mapRef.current.getMap());
		}
	}, [setMapRef]);

	useEffect(() => {
		const handleResize = () => {
			if (mapRef.current) {
				mapRef.current.resize();
			}
		};

		const resizeObserver = new ResizeObserver(handleResize);
		const currentContainer = containerRef.current;

		if (currentContainer) {
			resizeObserver.observe(currentContainer);
		}

		window.addEventListener("resize", handleResize);

		return () => {
			if (currentContainer) {
				resizeObserver.unobserve(currentContainer);
			}
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	// Define event handlers before using them in useCallback dependencies
	const handleMoveStart = useCallback(() => {
		try {
			if (activeBusinessId !== null && mapRef.current) {
				const map = mapRef.current.getMap();
				if (!map || !map.isStyleLoaded()) return;

				const bounds = mapRef.current.getBounds();
				const business = useBusinessStore.getState().filteredBusinesses.find((b) => b.id === activeBusinessId);
				if (business?.coordinates) {
					const { lat, lng } = business.coordinates;
					if (lat >= bounds.getSouth() && lat <= bounds.getNorth() && lng >= bounds.getWest() && lng <= bounds.getEast()) {
						console.log("Active business is within bounds");
					} else {
						setActiveBusinessId(null);
						console.log("Active business set to null on move start");
					}
				}
			}
		} catch (error) {
			console.warn("Move start handler error:", error);
		}
	}, [activeBusinessId, setActiveBusinessId]);

	// Debounced map move handler for better performance
	const handleMapMoveEnd = useCallback(async () => {
		try {
			if (mapRef.current && !loading) {
				const map = mapRef.current.getMap();
				if (!map || !map.isStyleLoaded()) return;

				setIsSearching(true);
				const bounds = await getMapBounds();
				const zoom = await getMapZoom();
				console.log("Map move ended with bounds:", bounds, "and zoom:", zoom);
				if (bounds && !activeBusinessId) {
					console.log("Fetching filtered businesses with bounds:", bounds, "and zoom:", zoom, "and query:", searchQuery);
					await fetchFilteredBusinesses(bounds, zoom, searchQuery);
				}
				setIsSearching(false);
			}
		} catch (error) {
			console.warn("Move end handler error:", error);
			setIsSearching(false);
		}
	}, [getMapBounds, fetchFilteredBusinesses, activeBusinessId, searchQuery, getMapZoom, loading]);

	const handleZoomEnd = useCallback(() => {
		// Trigger search when zoom changes significantly
		handleMapMoveEnd();
	}, [handleMapMoveEnd]);

	const handleMapLoad = useCallback(async () => {
		console.log("🗺️ Map load started");
		if (mapRef.current) {
			const map = mapRef.current.getMap();
			console.log("🗺️ Map instance obtained:", !!map);
			setMapRef(map);

			// Wait for map to be fully loaded
			map.once("styledata", () => {
				console.log("🗺️ Map style loaded");
				map.once("idle", () => {
					console.log("🗺️ Map is idle and ready");
					
					// Add basic event listeners
					map.on("click", (e) => {
						try {
							// Clear active business when clicking empty area
							if (!e.originalEvent.target.closest(".mapboxgl-marker")) {
								setActiveBusinessId(null);
							}
						} catch (error) {
							console.warn("Map click handler error:", error);
						}
					});

					map.on("movestart", handleMoveStart);
					map.on("moveend", handleMapMoveEnd);
					map.on("zoomend", handleZoomEnd);
				});
			});

			return () => {
				try {
					map.off("movestart", handleMoveStart);
					map.off("moveend", handleMapMoveEnd);
					map.off("zoomend", handleZoomEnd);
				} catch (error) {
					console.warn("Error removing map event listeners:", error);
				}
			};
		}
	}, [setMapRef, setActiveBusinessId, handleMoveStart, handleMapMoveEnd, handleZoomEnd]);

	const handleSearchInArea = useCallback(async () => {
		setIsSearching(true);
		await handleMapMoveEnd();
	}, [handleMapMoveEnd]);

	const handleResetView = useCallback(() => {
		setViewState({
			latitude: 37.7749,
			longitude: -122.4194,
			zoom: 10,
			bearing: 0,
			pitch: 0,
		});
	}, []);

	const handleMyLocation = useCallback(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;

					// Validate coordinates before setting
					if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
						console.warn("Invalid geolocation coordinates:", { latitude, longitude });
						return;
					}

					setViewState((prev) => ({
						...prev,
						latitude,
						longitude,
						zoom: 14,
					}));
				},
				(error) => {
					console.error("Error getting location:", error);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 300000, // 5 minutes
				}
			);
		}
	}, []);

	const handleToggle3D = useCallback(() => {
		setViewState((prev) => ({
			...prev,
			pitch: prev.pitch === 0 ? 45 : 0,
		}));
	}, []);

	// Optimized view state change handler with coordinate validation
	const handleViewStateChange = useCallback((evt) => {
		try {
			const { viewState } = evt;

			// Validate coordinates before setting view state
			if (!viewState || isNaN(viewState.latitude) || isNaN(viewState.longitude) || isNaN(viewState.zoom) || viewState.latitude < -90 || viewState.latitude > 90 || viewState.longitude < -180 || viewState.longitude > 180 || viewState.zoom < 0 || viewState.zoom > 24) {
				console.warn("Invalid view state coordinates:", viewState);
				return;
			}

			setViewState(viewState);
		} catch (error) {
			console.warn("View state change error:", error);
		}
	}, []);

	// Show fallback UI when Mapbox token is missing
	if (!MAPBOX_TOKEN) {
		return (
			<div className="map-container relative w-full h-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center" ref={containerRef}>
				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-5 dark:opacity-10">
					<div className="grid grid-cols-8 h-full">
						{Array.from({ length: 64 }).map((_, i) => (
							<div key={i} className="border border-border dark:border-border"></div>
						))}
					</div>
				</div>

				<div className="text-center p-8 max-w-lg relative z-10">
					<div className="mb-6">
						<div className="relative mb-4">
							<MapPin className="w-16 h-16 text-primary mx-auto" />
							<div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
								<span className="text-white text-xs">!</span>
							</div>
						</div>
						<h3 className="text-xl font-semibold text-foreground dark:text-white mb-2">Map Display Unavailable</h3>
						<p className="text-muted-foreground dark:text-muted-foreground text-sm leading-relaxed mb-4">The interactive map requires a Mapbox access token. You can still view businesses in list format.</p>
					</div>

					<div className="bg-white dark:bg-card rounded-lg p-4 mb-6 border border-border dark:border-border">
						<div className="text-sm text-muted-foreground dark:text-muted-foreground space-y-2">
							<p className="font-medium text-left">For developers:</p>
							<code className="block bg-muted dark:bg-muted p-2 rounded text-xs text-left">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here</code>
						</div>
					</div>

					<div className="flex gap-3 justify-center">
						<Button variant="outline" onClick={() => window.open("https://account.mapbox.com/access-tokens/", "_blank")} className="text-sm">
							<ExternalLink className="w-4 h-4 mr-2" />
							Get Token
						</Button>
						<Button onClick={() => window.location.reload()} className="text-sm">
							<RefreshCw className="w-4 h-4 mr-2" />
							Retry
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="map-container relative w-full h-full overflow-hidden" ref={containerRef}>
			<Map
				ref={mapRef}
				{...viewState}
				onMove={handleViewStateChange}
				mapStyle={mapStyle}
				mapboxAccessToken={MAPBOX_TOKEN}
				attributionControl={false}
				onLoad={handleMapLoad}
				interactiveLayerIds={[]}
				cursor="default"
				style={{
					width: "100%",
					height: "100%",
					marginLeft: isBusinessDetailsOpen ? "384px" : "0",
					transition: "margin-left 300ms ease-in-out",
				}}
				{...mapSettings}
				// Basic performance settings
				reuseMaps={true}
				maxZoom={20}
				minZoom={1}
				onError={(error) => {
					console.error("Map error:", error);
				}}
			>
				{/* Built-in Controls */}
				<ScaleControl position="bottom-left" />

				<ServiceArea />
				<BusinessMarkers />
			</Map>

			<BusinessInfoPanel />

			{/* Simple Search Button */}
			<div className="absolute top-4 right-4 z-20">
				<Button onClick={handleSearchInArea} disabled={isSearching} className="bg-primary hover:bg-primary text-white shadow-lg px-4 py-2 text-sm rounded-lg">
					<Search className="w-4 h-4 mr-2" />
					{isSearching ? "Searching..." : "Search this area"}
				</Button>
			</div>

			{/* Simple Map Controls */}
			<div className="absolute bottom-6 right-6 z-10">
				<div className="flex flex-col gap-2">
					{/* Basic Zoom and Location Controls */}
					<div className="bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-neutral-800/50 dark:border-neutral-700/50 p-2">
						<div className="flex gap-1">
							<Button variant="ghost" size="sm" onClick={() => mapRef.current?.zoomIn()} className="h-8 w-8 p-0">
								<Plus className="w-4 h-4" />
							</Button>
							<Button variant="ghost" size="sm" onClick={() => mapRef.current?.zoomOut()} className="h-8 w-8 p-0">
								<Minus className="w-4 h-4" />
							</Button>
							<Button variant="ghost" size="sm" onClick={handleMyLocation} className="h-8 w-8 p-0">
								<Target className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});

MapContainer.displayName = "MapContainer";

export default MapContainer;
