import { create } from "zustand";

const useMapStore = create((set, get) => ({
	mapRef: null,
	setMapRef: (mapRef) => set({ mapRef }),
	loadingBusinessId: null,
	setLoadingBusinessId: (id) => set({ loadingBusinessId: id }),

	fetchMapRef: () => {
		return get().mapRef;
	},

	isMapAvailable: () => {
		return get().mapRef !== null;
	},

	getMapCenter: () => {
		const map = get().mapRef;
		if (map) {
			const center = map.getCenter();
			return {
				lat: center.lat,
				lng: center.lng,
			};
		}
		return null;
	},

	getMapZoom: () => {
		const map = get().mapRef;
		if (map) {
			return map.getZoom();
		}
		return null;
	},

	getMapBounds: () => {
		const mapRef = get().mapRef;
		if (mapRef) {
			const bounds = mapRef.getBounds();
			return {
				north: bounds.getNorth(),
				south: bounds.getSouth(),
				east: bounds.getEast(),
				west: bounds.getWest(),
			};
		}
		return null;
	},

	centerOn: (latitude, longitude, radius, zoomLevel) => {
		const mapRef = get().mapRef;
		if (!mapRef) {
			// Silently return if map is not available (e.g., in list-only mode)
			return;
		}

		// Validate input parameters
		if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
			console.error("Invalid coordinates provided to centerOn:", { latitude, longitude });
			return;
		}

		// Validate coordinate ranges
		if (latitude < -90 || latitude > 90) {
			console.error("Invalid latitude (must be between -90 and 90):", latitude);
			return;
		}

		if (longitude < -180 || longitude > 180) {
			console.error("Invalid longitude (must be between -180 and 180):", longitude);
			return;
		}

		const map = mapRef;
		const defaultZoom = 10;

		// Use provided zoom level, or calculate from radius, or use default
		let zoom;
		if (zoomLevel !== undefined && !isNaN(zoomLevel)) {
			zoom = Math.max(1, Math.min(20, zoomLevel)); // Clamp between 1-20
		} else if (radius && !isNaN(radius)) {
			zoom = Math.max(8, 14 - Math.log2(radius) + 0.5);
			zoom = Math.max(1, Math.min(20, zoom)); // Clamp between 1-20
		} else {
			zoom = defaultZoom;
		}

		try {
			// Google Maps uses panTo and setZoom methods
			const newCenter = { lat: latitude, lng: longitude };
			
			// Validate the final center coordinates
			if (isNaN(newCenter.lat) || isNaN(newCenter.lng)) {
				console.error("Calculated center coordinates are invalid:", newCenter);
				return;
			}

			// Use Google Maps methods
			map.panTo(newCenter);
			map.setZoom(zoom);
		} catch (error) {
			console.error("Error during map centerOn:", error);
		}
	},
}));

export default useMapStore;
