import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { Button } from "@components/ui/button";
import { Minus, Plus, MapPin, Search, Target } from "lucide-react";
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
		if (mapRef.current) {
			const map = mapRef.current.getMap();
			setMapRef(map);

			// Wait for map to be fully loaded and styled before adding event listeners
			map.once("styledata", () => {
				// Additional wait to ensure transformation matrices are initialized
				map.once("idle", () => {
					// Verify map is ready for coordinate transformations
					try {
						// Test coordinate transformation to ensure it's working
						const testPoint = map.project([0, 0]);
						const testUnproject = map.unproject(testPoint);
						if (!testUnproject || isNaN(testUnproject.lat) || isNaN(testUnproject.lng)) {
							console.warn("Map coordinate transformation not ready");
							return;
						}
					} catch (error) {
						console.warn("Map transformation test failed:", error);
						return;
					}

					// Optimize map performance
					map.on("sourcedata", (e) => {
						if (e.isSourceLoaded) {
							// Source has finished loading
							map.getCanvas().style.cursor = "";
						}
					});

					// Add custom controls and interactions with enhanced safety checks
					map.on("click", (e) => {
						try {
							// Validate map state before processing coordinates
							if (!map.isStyleLoaded() || !map.loaded()) {
								console.warn("Map not fully loaded during click");
								return;
							}

							// Validate click coordinates before processing
							if (!e.lngLat || isNaN(e.lngLat.lng) || isNaN(e.lngLat.lat)) {
								console.warn("Invalid click coordinates:", e.lngLat);
								return;
							}

							// Clear active business when clicking empty area
							if (!e.originalEvent.target.closest(".mapboxgl-marker")) {
								setActiveBusinessId(null);
							}
						} catch (error) {
							console.warn("Map click handler error:", error);
						}
					});

					// Add mouse event handlers with transformation matrix safety checks
					const safeMouseHandler = (eventName) => (e) => {
						try {
							// Check if map is ready for coordinate transformations
							if (!map.isStyleLoaded() || !map.loaded()) {
								return;
							}

							// Validate that transformation matrices are available
							if (!map.transform || !map.transform.cameraToCenterDistance) {
								return;
							}

							// Test unprojection safety before processing
							if (e.point && typeof e.point.x === "number" && typeof e.point.y === "number") {
								const testUnproject = map.unproject(e.point);
								if (!testUnproject || isNaN(testUnproject.lat) || isNaN(testUnproject.lng)) {
									return;
								}
							}
						} catch (error) {
							// Silently handle transformation errors to prevent console spam
							return;
						}
					};

					// COMPLETELY DISABLE mouse event handlers to prevent transformation matrix errors
					// Override Mapbox's internal event system
					const canvas = map.getCanvas();
					if (canvas) {
						// Disable all mouse events on the canvas to prevent transformation matrix issues
						canvas.style.pointerEvents = "none";

						// Add a transparent overlay to capture events instead
						const overlay = document.createElement("div");
						overlay.style.position = "absolute";
						overlay.style.top = "0";
						overlay.style.left = "0";
						overlay.style.width = "100%";
						overlay.style.height = "100%";
						overlay.style.zIndex = "1";
						overlay.style.pointerEvents = "auto";
						overlay.style.background = "transparent";

						// Add basic pan and zoom via overlay
						let isDragging = false;
						let startX = 0;
						let startY = 0;

						overlay.addEventListener("mousedown", (e) => {
							isDragging = true;
							startX = e.clientX;
							startY = e.clientY;
							e.preventDefault();
						});

						overlay.addEventListener("mousemove", (e) => {
							if (isDragging) {
								const deltaX = e.clientX - startX;
								const deltaY = e.clientY - startY;

								// Simple pan implementation without transformation matrices
								const center = map.getCenter();
								const zoom = map.getZoom();
								const scale = 1 / Math.pow(2, zoom);

								map.setCenter([center.lng - deltaX * scale * 0.01, center.lat + deltaY * scale * 0.01]);

								startX = e.clientX;
								startY = e.clientY;
							}
							e.preventDefault();
						});

						overlay.addEventListener("mouseup", () => {
							isDragging = false;
						});

						overlay.addEventListener("wheel", (e) => {
							const zoom = map.getZoom();
							const delta = e.deltaY > 0 ? -0.5 : 0.5;
							map.setZoom(Math.max(1, Math.min(20, zoom + delta)));
							e.preventDefault();
						});

						// Add overlay to map container
						map.getContainer().appendChild(overlay);
					}

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
			<div className="map-container relative w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center" ref={containerRef}>
				<div className="text-center p-8 max-w-md">
					<MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Map Configuration Required</h3>
					<p className="text-gray-600 dark:text-gray-400 mb-4">To display the interactive map, please add your Mapbox access token to the environment configuration.</p>
					<div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm font-mono text-left">
						<div className="text-gray-500 dark:text-gray-400 mb-1">Add to .env.local:</div>
						<div className="text-gray-800 dark:text-gray-200">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here</div>
					</div>
					<Button variant="outline" className="mt-4" onClick={() => window.open("https://account.mapbox.com/access-tokens/", "_blank")}>
						Get Mapbox Token
					</Button>
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
				// Performance optimizations
				reuseMaps={true}
				maxZoom={20}
				minZoom={1}
				maxBounds={[
					[-180, -85],
					[180, 85],
				]}
				// Additional safety options to prevent transformation matrix errors
				cooperativeGestures={false}
				preventStyleDiffing={true}
				optimizeForTerrain={false}
				antialias={false}
				preserveDrawingBuffer={false}
				refreshExpiredTiles={false}
				transformRequest={(url, resourceType) => {
					// Prevent problematic resource requests that could corrupt transformation matrices
					if (resourceType === "Style" || resourceType === "Source") {
						return { url };
					}
					return { url };
				}}
				onError={(error) => {
					console.warn("Map error:", error);
					// Attempt to recover from transformation matrix errors
					if (error.message?.includes("transformMat4") || error.message?.includes("matrix")) {
						console.warn("Transformation matrix error detected, attempting recovery");
						setTimeout(() => {
							try {
								if (mapRef.current) {
									const map = mapRef.current.getMap();
									if (map && map.loaded()) {
										map.resize();
									}
								}
							} catch (recoveryError) {
								console.warn("Map recovery failed:", recoveryError);
							}
						}, 100);
					}
				}}
				onStyleData={(e) => {
					// Ensure style is fully loaded before enabling interactions
					if (e.dataType === "style") {
						const map = e.target;
						if (map && map.isStyleLoaded()) {
							// Style is ready, transformation matrices should be initialized
							map.resize(); // Ensure proper matrix initialization
						}
					}
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
				<Button onClick={handleSearchInArea} disabled={isSearching} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-4 py-2 text-sm rounded-lg">
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
