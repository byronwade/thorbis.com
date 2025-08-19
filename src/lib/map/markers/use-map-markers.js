/**
 * useMapMarkers Hook
 * Handles map state management, clustering, and marker optimization
 * Extracted from BusinessMarkers.js for better separation of concerns
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useBusinessStore } from "@store/business";
import { useMapStore } from "@store/map";
import logger from "@lib/utils/logger";

export const useMapMarkers = () => {
	const { filteredBusinesses, activeBusinessId, setActiveBusinessId, setSelectedBusiness } = useBusinessStore();
	const { centerOn, mapRef } = useMapStore();

	// Local state
	const [hoveredBusiness, setHoveredBusiness] = useState(null);
	const [showPopup, setShowPopup] = useState(null);
	const [currentZoom, setCurrentZoom] = useState(10);
	const [mapBounds, setMapBounds] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);

	// Debouncing refs
	const debounceTimeoutRef = useRef(null);
	const lastUpdateRef = useRef(0);

	// Track zoom level and bounds for optimization with debouncing
	useEffect(() => {
		if (mapRef) {
			const updateMapState = () => {
				const now = Date.now();

				// Debounce rapid updates (like during continuous zoom/pan)
				if (debounceTimeoutRef.current) {
					clearTimeout(debounceTimeoutRef.current);
				}

				setIsProcessing(true);

				debounceTimeoutRef.current = setTimeout(() => {
					const zoom = mapRef.getZoom();
					const bounds = mapRef.getBounds();
					setCurrentZoom(zoom);
					setMapBounds(bounds);
					setIsProcessing(false);
					lastUpdateRef.current = now;
				}, 150); // 150ms debounce
			};

			// Immediate update for initial load
			const initialUpdate = () => {
				const zoom = mapRef.getZoom();
				const bounds = mapRef.getBounds();
				setCurrentZoom(zoom);
				setMapBounds(bounds);
			};

			mapRef.on("zoom", updateMapState);
			mapRef.on("move", updateMapState);
			mapRef.on("zoomend", initialUpdate);
			mapRef.on("moveend", initialUpdate);

			// Initial state
			initialUpdate();

			return () => {
				if (debounceTimeoutRef.current) {
					clearTimeout(debounceTimeoutRef.current);
				}
				mapRef.off("zoom", updateMapState);
				mapRef.off("move", updateMapState);
				mapRef.off("zoomend", initialUpdate);
				mapRef.off("moveend", initialUpdate);
			};
		}
	}, [mapRef]);

	// Enhanced viewport-based filtering with aggressive culling
	const visibleBusinesses = useMemo(() => {
		if (!mapBounds || !filteredBusinesses.length) return [];

		// Add buffer around viewport based on zoom level for smoother panning
		const getViewportBuffer = (zoom) => {
			if (zoom < 7) return 0.5; // Large buffer for zoomed out views
			if (zoom < 10) return 0.2; // Medium buffer
			if (zoom < 13) return 0.1; // Small buffer
			return 0.05; // Minimal buffer for close views
		};

		const buffer = getViewportBuffer(currentZoom);
		const south = mapBounds.getSouth() - buffer;
		const north = mapBounds.getNorth() + buffer;
		const west = mapBounds.getWest() - buffer;
		const east = mapBounds.getEast() + buffer;

		// Pre-filter businesses within expanded viewport
		const viewportBusinesses = filteredBusinesses.filter((business) => {
			if (!business.coordinates) return false;

			const { lat, lng } = business.coordinates;
			return lat >= south && lat <= north && lng >= west && lng <= east;
		});

		// For very zoomed out views, apply additional aggressive filtering
		if (currentZoom < 6) {
			return viewportBusinesses.filter((business) => {
				// Always include sponsored businesses
				if (business.isSponsored) return true;

				// Include highly rated businesses with many reviews
				if (business.ratings?.overall >= 4.5 && business.reviewCount >= 50) return true;

				// Include businesses that are currently open and well-rated
				if (business.isOpenNow && business.ratings?.overall >= 4.0) return true;

				// For very sparse areas, include any business with some reviews
				return business.reviewCount >= 10;
			});
		}

		return viewportBusinesses;
	}, [mapBounds, filteredBusinesses, currentZoom]);

	// Clustering algorithm for performance optimization
	const createBusinessClusters = useCallback((businesses, zoom) => {
		if (!businesses.length) return [];

		const processed = new Set();
		const clusters = [];

		// Adjust cluster distance based on zoom level
		const clusterDistance = Math.max(0.01, 0.05 / Math.pow(2, zoom - 8));

		// For large datasets, use grid-based clustering for performance
		if (businesses.length > 1000) {
			const gridSize = clusterDistance;
			const grid = new Map();

			businesses.forEach((business) => {
				if (!business.coordinates) return;

				const gridX = Math.floor(business.coordinates.lat / gridSize);
				const gridY = Math.floor(business.coordinates.lng / gridSize);
				const cellKey = `${gridX}-${gridY}`;

				if (!grid.has(cellKey)) {
					grid.set(cellKey, []);
				}
				grid.get(cellKey).push(business);
			});

			grid.forEach((cellBusinesses) => {
				if (cellBusinesses.length === 1) {
					clusters.push({
						...cellBusinesses[0],
						type: "single",
						renderType: zoom < 10 ? "simple" : "detailed",
					});
				} else {
					const centerLat = cellBusinesses.reduce((sum, b) => sum + b.coordinates.lat, 0) / cellBusinesses.length;
					const centerLng = cellBusinesses.reduce((sum, b) => sum + b.coordinates.lng, 0) / cellBusinesses.length;

					clusters.push({
						id: `grid-cluster-${cellKey}`,
						type: "cluster",
						coordinates: { lat: centerLat, lng: centerLng },
						businesses: cellBusinesses,
						count: cellBusinesses.length,
						renderType: "cluster",
					});
				}
			});

			return clusters;
		}

		// Original clustering algorithm for smaller datasets
		businesses.forEach((business) => {
			if (processed.has(business.id) || !business.coordinates) return;

			const nearby = businesses.filter((other) => {
				if (processed.has(other.id) || !other.coordinates || other.id === business.id) return false;

				const distance = Math.sqrt(Math.pow(business.coordinates.lat - other.coordinates.lat, 2) + Math.pow(business.coordinates.lng - other.coordinates.lng, 2));

				return distance < clusterDistance;
			});

			if (nearby.length > 0) {
				// Create cluster
				const allBusinesses = [business, ...nearby];
				const centerLat = allBusinesses.reduce((sum, b) => sum + b.coordinates.lat, 0) / allBusinesses.length;
				const centerLng = allBusinesses.reduce((sum, b) => sum + b.coordinates.lng, 0) / allBusinesses.length;

				clusters.push({
					id: `cluster-${business.id}`,
					type: "cluster",
					coordinates: { lat: centerLat, lng: centerLng },
					businesses: allBusinesses,
					count: allBusinesses.length,
					renderType: "cluster",
				});

				allBusinesses.forEach((b) => processed.add(b.id));
			} else {
				// Single business
				clusters.push({
					...business,
					type: "single",
					renderType: zoom < 10 ? "simple" : "detailed",
				});
				processed.add(business.id);
			}
		});

		return clusters;
	}, []);

	// Zoom-based clustering and rendering optimization
	const optimizedBusinesses = useMemo(() => {
		if (!visibleBusinesses.length) return [];

		// Much more aggressive zoom level thresholds for performance
		const CLUSTER_ZOOM_THRESHOLD = 14;
		const SIMPLE_MARKER_ZOOM_THRESHOLD = 12;

		// DRASTICALLY reduced marker limits for performance
		const MAX_MARKERS_PER_ZOOM = {
			1: 10,
			3: 15,
			5: 25,
			7: 50,
			9: 100,
			11: 200,
			13: 500,
			15: 1000,
			17: 2000,
		};

		// Determine max markers based on zoom level
		const getMaxMarkers = (zoom) => {
			const thresholds = Object.keys(MAX_MARKERS_PER_ZOOM)
				.map(Number)
				.sort((a, b) => b - a);
			for (const threshold of thresholds) {
				if (zoom >= threshold) {
					return MAX_MARKERS_PER_ZOOM[threshold];
				}
			}
			return MAX_MARKERS_PER_ZOOM[1];
		};

		const maxMarkers = getMaxMarkers(currentZoom);

		// Early exit for very zoomed out views - show only top businesses
		if (currentZoom < 5) {
			const topBusinesses = visibleBusinesses
				.filter((business) => {
					return business.isSponsored || (business.ratings?.overall >= 4.5 && business.reviewCount >= 100);
				})
				.sort((a, b) => {
					if (a.isSponsored && !b.isSponsored) return -1;
					if (!a.isSponsored && b.isSponsored) return 1;

					const scoreA = (a.ratings?.overall || 0) * Math.log(a.reviewCount || 1);
					const scoreB = (b.ratings?.overall || 0) * Math.log(b.reviewCount || 1);
					return scoreB - scoreA;
				})
				.slice(0, maxMarkers);

			return createBusinessClusters(topBusinesses, currentZoom);
		}

		// Apply clustering for appropriate zoom levels
		if (currentZoom < CLUSTER_ZOOM_THRESHOLD) {
			const limitedBusinesses = visibleBusinesses.slice(0, maxMarkers);
			return createBusinessClusters(limitedBusinesses, currentZoom);
		}

		// For close zoom levels, show individual markers but still respect limits
		return visibleBusinesses.slice(0, maxMarkers).map((business) => ({
			...business,
			type: "single",
			renderType: currentZoom >= SIMPLE_MARKER_ZOOM_THRESHOLD ? "detailed" : "simple",
		}));
	}, [visibleBusinesses, currentZoom, createBusinessClusters]);

	// Event handlers
	const handleMarkerClick = useCallback(
		(business) => {
			setActiveBusinessId(business.id);
			setSelectedBusiness(business);

			// Simplified coordinate validation
			const { coordinates, serviceArea } = business;
			if (coordinates && coordinates.lat && coordinates.lng) {
				const radius = serviceArea && serviceArea.type === "radius" ? serviceArea.value : null;
				centerOn(coordinates.lat, coordinates.lng, radius);
			} else {
				logger.error("Invalid business coordinates:", business.name, coordinates);
			}

			setShowPopup(null); // Close popup when selecting business
		},
		[setActiveBusinessId, setSelectedBusiness, centerOn]
	);

	const handleMarkerHover = useCallback((business) => {
		setHoveredBusiness(business.id);
		setShowPopup(business.id);
	}, []);

	const handleMarkerLeave = useCallback(() => {
		setHoveredBusiness(null);
		// Keep popup open for a moment to allow interaction
		setTimeout(() => {
			if (!hoveredBusiness) {
				setShowPopup(null);
			}
		}, 300);
	}, [hoveredBusiness]);

	const handleClusterClick = useCallback(
		(cluster) => {
			if (cluster.coordinates && cluster.coordinates.lat && cluster.coordinates.lng) {
				// Zoom in to show individual businesses
				const zoomLevel = Math.min(currentZoom + 3, 16);
				centerOn(cluster.coordinates.lat, cluster.coordinates.lng, null, zoomLevel);
			} else {
				logger.error("Invalid cluster coordinates:", cluster);
			}
		},
		[centerOn, currentZoom]
	);

	return {
		// Data
		optimizedBusinesses,
		filteredBusinesses,

		// State
		hoveredBusiness,
		showPopup,
		currentZoom,
		mapBounds,
		isProcessing,
		activeBusinessId,

		// Handlers
		handleMarkerClick,
		handleMarkerHover,
		handleMarkerLeave,
		handleClusterClick,

		// Setters
		setShowPopup,
		setHoveredBusiness,
	};
};
