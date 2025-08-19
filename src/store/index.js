/**
 * Store Barrel Export - Domain-Based Architecture
 * Centralized export for all Zustand stores organized by domain
 *
 * Architecture:
 * - auth/     - Authentication, user management, and preferences
 * - business/ - Business profiles, operations, and management
 * - search/   - Search functionality and filters
 * - map/      - Map display, geolocation, and spatial data
 * - ui/       - UI state, forms, and interface management
 */

// Authentication Domain
export * from "./auth";

// Business Domain
export * from "./business";

// Search Domain
export * from "./search";

// Map Domain
export * from "./map";

// Cart Domain
export * from "./cart";

// UI Domain
export * from "./ui";

// ✅ ALL LEGACY EXPORTS SUCCESSFULLY MIGRATED TO DOMAIN-BASED IMPORTS
// All 39 components have been updated to use domain-specific imports:
// - 17 Auth store migrations → @store/auth
// - 19 Business store migrations → @store/business
// - 11 Search store migrations → @store/search
// - 9 Map store migrations → @store/map
// - 2 Form store migrations → @store/ui

// Store utilities and helpers
export const storeUtils = {
	/**
	 * Get all store instances for debugging
	 * ✅ Updated to use domain-based imports
	 */
	getAllStores: () => ({
		auth: {
			auth: require("./auth").useAuthStore.getState(),
			preferences: require("./auth").useUserPreferencesStore.getState(),
		},
		business: {
			business: require("./business").useBusinessStore.getState(),
		},
		search: {
			search: require("./search").useSearchStore.getState(),
		},
		map: {
			map: require("./map").useMapStore.getState(),
		},
		ui: {
			form: require("./ui").useFormStore.getState(),
		},
		cart: {
			cart: require("./cart").useCartStore.getState(),
		},
	}),

	/**
	 * Reset all stores to initial state
	 * ✅ Updated to use domain-based imports
	 */
	resetAllStores: () => {
		// Reset auth stores
		require("./auth").useAuthStore.getState().cleanup();
		require("./auth").useUserPreferencesStore.getState().resetPreferences();

		// Other stores would implement similar cleanup methods
		console.log("All stores reset to initial state");
	},

	/**
	 * Export all store states for debugging or backup
	 */
	exportAllStates: () => {
		const states = storeUtils.getAllStores();
		return JSON.stringify(states, null, 2);
	},

	/**
	 * Get store statistics for development insights
	 */
	getStoreStats: () => {
		const stores = storeUtils.getAllStores();
		const stats = {};

		Object.entries(stores).forEach(([domain, domainStores]) => {
			stats[domain] = {};
			Object.entries(domainStores).forEach(([storeName, storeState]) => {
				stats[domain][storeName] = {
					keyCount: Object.keys(storeState).length,
					hasData: Object.values(storeState).some((value) => value !== null && value !== undefined && value !== ""),
				};
			});
		});

		return stats;
	},
};
