/**
 * User Preferences Store
 * Zustand store for user preferences and settings
 * Extracted from auth store for better separation of concerns
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import logger from "@lib/utils/logger";

export const useUserPreferencesStore = create(
	persist(
		(set, get) => ({
			// Theme preferences
			theme: "system", // "light", "dark", "system"
			darkMode: false,
			
			// Language preferences
			language: "en",
			region: "US",
			
			// Notification preferences
			notifications: {
				email: true,
				push: true,
				sms: false,
				marketing: false,
				reviews: true,
				bookings: true,
				reminders: true,
			},
			
			// UI preferences
			ui: {
				sidebarCollapsed: false,
				mapView: "hybrid", // "satellite", "roadmap", "hybrid", "terrain"
				listDensity: "comfortable", // "compact", "comfortable", "spacious"
				searchRadius: 25, // km
				currency: "USD",
				dateFormat: "MM/DD/YYYY",
				timeFormat: "12h", // "12h", "24h"
			},
			
			// Search preferences
			search: {
				defaultLocation: null,
				saveSearchHistory: true,
				maxHistoryItems: 50,
				autoComplete: true,
				showSuggestions: true,
			},
			
			// Privacy preferences
			privacy: {
				shareLocation: true,
				profileVisibility: "public", // "public", "business", "private"
				showReviews: true,
				showActivity: false,
				allowAnalytics: true,
			},
			
			// Accessibility preferences
			accessibility: {
				reducedMotion: false,
				highContrast: false,
				fontSize: "medium", // "small", "medium", "large", "extra-large"
				screenReader: false,
			},
			
			// Actions
			setTheme: (theme) => {
				set({ theme });
				logger.debug("Theme preference updated:", theme);
			},
			
			setDarkMode: (darkMode) => {
				set({ darkMode });
				logger.debug("Dark mode preference updated:", darkMode);
			},
			
			setLanguage: (language) => {
				set({ language });
				logger.debug("Language preference updated:", language);
			},
			
			updateNotifications: (notifications) => {
				set((state) => ({
					notifications: { ...state.notifications, ...notifications }
				}));
				logger.debug("Notification preferences updated:", notifications);
			},
			
			updateUI: (uiSettings) => {
				set((state) => ({
					ui: { ...state.ui, ...uiSettings }
				}));
				logger.debug("UI preferences updated:", uiSettings);
			},
			
			updateSearch: (searchSettings) => {
				set((state) => ({
					search: { ...state.search, ...searchSettings }
				}));
				logger.debug("Search preferences updated:", searchSettings);
			},
			
			updatePrivacy: (privacySettings) => {
				set((state) => ({
					privacy: { ...state.privacy, ...privacySettings }
				}));
				logger.debug("Privacy preferences updated:", privacySettings);
			},
			
			updateAccessibility: (accessibilitySettings) => {
				set((state) => ({
					accessibility: { ...state.accessibility, ...accessibilitySettings }
				}));
				logger.debug("Accessibility preferences updated:", accessibilitySettings);
			},
			
			// Bulk update preferences
			updatePreferences: (preferences) => {
				set((state) => ({
					...state,
					...preferences
				}));
				logger.debug("Bulk preferences updated");
			},
			
			// Reset to defaults
			resetPreferences: () => {
				set({
					theme: "system",
					darkMode: false,
					language: "en",
					region: "US",
					notifications: {
						email: true,
						push: true,
						sms: false,
						marketing: false,
						reviews: true,
						bookings: true,
						reminders: true,
					},
					ui: {
						sidebarCollapsed: false,
						mapView: "hybrid",
						listDensity: "comfortable",
						searchRadius: 25,
						currency: "USD",
						dateFormat: "MM/DD/YYYY",
						timeFormat: "12h",
					},
					search: {
						defaultLocation: null,
						saveSearchHistory: true,
						maxHistoryItems: 50,
						autoComplete: true,
						showSuggestions: true,
					},
					privacy: {
						shareLocation: true,
						profileVisibility: "public",
						showReviews: true,
						showActivity: false,
						allowAnalytics: true,
					},
					accessibility: {
						reducedMotion: false,
						highContrast: false,
						fontSize: "medium",
						screenReader: false,
					},
				});
				logger.info("Preferences reset to defaults");
			},
			
			// Import/Export preferences
			exportPreferences: () => {
				const state = get();
				const preferences = {
					theme: state.theme,
					language: state.language,
					notifications: state.notifications,
					ui: state.ui,
					search: state.search,
					privacy: state.privacy,
					accessibility: state.accessibility,
					exportedAt: new Date().toISOString(),
				};
				return JSON.stringify(preferences, null, 2);
			},
			
			importPreferences: (preferencesJson) => {
				try {
					const preferences = JSON.parse(preferencesJson);
					
					// Validate preferences structure
					if (typeof preferences !== "object") {
						throw new Error("Invalid preferences format");
					}
					
					// Apply preferences
					set((state) => ({
						...state,
						...preferences,
					}));
					
					logger.info("Preferences imported successfully");
					return { success: true };
				} catch (error) {
					logger.error("Failed to import preferences:", error);
					return { success: false, error: error.message };
				}
			},
			
			// Computed getters
			isDarkMode: () => {
				const state = get();
				if (state.theme === "system") {
					return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
				}
				return state.theme === "dark";
			},
			
			getEffectiveTheme: () => {
				const state = get();
				if (state.theme === "system") {
					return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
				}
				return state.theme;
			},
			
			shouldReduceMotion: () => {
				const state = get();
				return state.accessibility.reducedMotion || 
					   (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
			},
			
			getMapSettings: () => {
				const state = get();
				return {
					mapType: state.ui.mapView,
					searchRadius: state.ui.searchRadius,
					defaultLocation: state.search.defaultLocation,
				};
			},
		}),
		{
			name: "user-preferences-storage",
			partialize: (state) => ({
				theme: state.theme,
				language: state.language,
				notifications: state.notifications,
				ui: state.ui,
				search: state.search,
				privacy: state.privacy,
				accessibility: state.accessibility,
			}),
		}
	)
);

export default useUserPreferencesStore;