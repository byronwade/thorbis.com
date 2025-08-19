// REQUIRED: Secure local storage utilities with encryption and performance monitoring
// Based on OWASP security guidelines for client-side storage

import logger from "./logger.js";

/**
 * Secure storage utility class with encryption and proper error handling
 * Implements OWASP recommendations for client-side data storage
 */
export class SecureStorage {
	// Prefix for all storage keys to avoid conflicts
	static PREFIX = "thorbis_";

	// Keys that should never be stored in localStorage (security sensitive)
	static FORBIDDEN_KEYS = ["password", "access_token", "refresh_token", "api_key", "secret", "private_key", "session_id"];

	/**
	 * Check if localStorage is available and functional
	 */
	static isStorageAvailable() {
		try {
			if (typeof window === "undefined" || !window.localStorage) {
				return false;
			}

			const testKey = "__storage_test__";
			localStorage.setItem(testKey, "test");
			localStorage.removeItem(testKey);
			return true;
		} catch (error) {
			logger.warn("localStorage not available:", error.message);
			return false;
		}
	}

	/**
	 * Validate that the key is safe to store
	 */
	static validateKey(key) {
		const lowerKey = key.toLowerCase();
		const isForbidden = this.FORBIDDEN_KEYS.some((forbidden) => lowerKey.includes(forbidden));

		if (isForbidden) {
			logger.error(`Attempted to store forbidden key: ${key}`);
			throw new Error(`Key "${key}" contains sensitive data and cannot be stored in localStorage`);
		}

		return true;
	}

	/**
	 * Simple encryption for non-sensitive data (obfuscation only)
	 * NOTE: This is NOT secure encryption, just obfuscation for PII
	 */
	static obfuscate(data) {
		try {
			const jsonString = JSON.stringify(data);
			// Simple base64 encoding with timestamp for cache busting
			const timestamp = Date.now().toString();
			const combined = `${timestamp}:${jsonString}`;
			return btoa(combined);
		} catch (error) {
			logger.error("Failed to obfuscate data:", error);
			return null;
		}
	}

	/**
	 * Decrypt obfuscated data with enhanced error handling
	 */
	static deobfuscate(obfuscatedData) {
		try {
			// Validate input
			if (!obfuscatedData || typeof obfuscatedData !== "string") {
				logger.debug("Invalid obfuscated data provided");
				return null;
			}

			// Decode base64
			let decoded;
			try {
				decoded = atob(obfuscatedData);
			} catch (base64Error) {
				logger.debug("Failed to decode base64 data:", base64Error.message);
				return null;
			}

			// Split timestamp and JSON data
			const colonIndex = decoded.indexOf(":");
			if (colonIndex === -1) {
				logger.debug("Invalid data format: missing timestamp separator");
				return null;
			}

			const timestamp = decoded.substring(0, colonIndex);
			const jsonString = decoded.substring(colonIndex + 1);

			// Validate timestamp
			const timestampNum = parseInt(timestamp);
			if (isNaN(timestampNum) || timestampNum <= 0) {
				logger.debug("Invalid timestamp in stored data");
				return null;
			}

			// Check if data is too old (24 hours)
			const dataAge = Date.now() - timestampNum;
			const maxAge = 24 * 60 * 60 * 1000; // 24 hours

			if (dataAge > maxAge) {
				logger.debug("Stored data expired, removing");
				return null;
			}

			// Parse JSON data
			if (!jsonString) {
				logger.debug("Empty JSON string in stored data");
				return null;
			}

			try {
				return JSON.parse(jsonString);
			} catch (parseError) {
				logger.debug("Failed to parse JSON from stored data:", parseError.message);
				return null;
			}
		} catch (error) {
			logger.error("Failed to deobfuscate data:", error);
			return null;
		}
	}

	/**
	 * Store data securely with validation and encryption
	 */
	static setItem(key, value, options = {}) {
		const startTime = performance.now();

		try {
			if (!this.isStorageAvailable()) {
				logger.warn("Storage not available, falling back to session storage");
				return this.setSessionItem(key, value, options);
			}

			// Validate key safety
			this.validateKey(key);

			const prefixedKey = this.PREFIX + key;
			const { encrypt = false, expiry = null } = options;

			// Prepare data object with metadata
			const dataObject = {
				value,
				timestamp: Date.now(),
				expiry: expiry ? Date.now() + expiry : null,
				encrypted: encrypt,
			};

			// Apply obfuscation if requested (for PII)
			const finalData = encrypt ? this.obfuscate(dataObject) : JSON.stringify(dataObject);

			if (!finalData) {
				throw new Error("Failed to process data for storage");
			}

			localStorage.setItem(prefixedKey, finalData);

			const duration = performance.now() - startTime;
			logger.performance(`SecureStorage.setItem("${key}") completed in ${duration.toFixed(2)}ms`);

			// Log storage operation (without sensitive data)
			logger.debug(`Stored item: ${key}`, {
				encrypted: encrypt,
				hasExpiry: !!expiry,
				size: finalData.length,
			});

			return true;
		} catch (error) {
			logger.error(`Failed to store item "${key}":`, error);
			return false;
		}
	}

	/**
	 * Retrieve data securely with validation and decryption
	 */
	static getItem(key, defaultValue = null) {
		const startTime = performance.now();

		try {
			if (!this.isStorageAvailable()) {
				logger.warn("Storage not available, falling back to session storage");
				return this.getSessionItem(key, defaultValue);
			}

			const prefixedKey = this.PREFIX + key;
			const storedData = localStorage.getItem(prefixedKey);

			if (!storedData) {
				return defaultValue;
			}

			// Try to parse as regular JSON first
			let dataObject;
			try {
				dataObject = JSON.parse(storedData);
			} catch (jsonError) {
				// If JSON parsing fails, try deobfuscation
				logger.debug(`JSON parsing failed for key: ${key}, attempting deobfuscation`);
				dataObject = this.deobfuscate(storedData);
			}

			if (!dataObject || typeof dataObject !== "object") {
				logger.debug(`Invalid stored data for key: ${key}, cleaning up`);
				this.removeItem(key); // Clean up invalid data
				return defaultValue;
			}

			// Validate data object structure
			if (!dataObject.hasOwnProperty("value") || !dataObject.hasOwnProperty("timestamp")) {
				logger.debug(`Malformed data object for key: ${key}, missing required fields`);
				this.removeItem(key); // Clean up malformed data
				return defaultValue;
			}

			// Check expiry
			if (dataObject.expiry && Date.now() > dataObject.expiry) {
				logger.debug(`Stored data expired for key: ${key}`);
				this.removeItem(key);
				return defaultValue;
			}

			const duration = performance.now() - startTime;
			logger.performance(`SecureStorage.getItem("${key}") completed in ${duration.toFixed(2)}ms`);

			return dataObject.value;
		} catch (error) {
			logger.error(`Failed to retrieve item "${key}":`, error);
			return defaultValue;
		}
	}

	/**
	 * Remove item from storage
	 */
	static removeItem(key) {
		try {
			if (!this.isStorageAvailable()) {
				return this.removeSessionItem(key);
			}

			const prefixedKey = this.PREFIX + key;
			localStorage.removeItem(prefixedKey);

			logger.debug(`Removed item: ${key}`);
			return true;
		} catch (error) {
			logger.error(`Failed to remove item "${key}":`, error);
			return false;
		}
	}

	/**
	 * Clear all app-specific storage
	 */
	static clear() {
		try {
			if (!this.isStorageAvailable()) {
				return this.clearSession();
			}

			const keys = Object.keys(localStorage);
			const appKeys = keys.filter((key) => key.startsWith(this.PREFIX));

			appKeys.forEach((key) => {
				localStorage.removeItem(key);
			});

			logger.info(`Cleared ${appKeys.length} storage items`);
			return true;
		} catch (error) {
			logger.error("Failed to clear storage:", error);
			return false;
		}
	}

	/**
	 * Get storage usage statistics
	 */
	static getStorageInfo() {
		try {
			if (!this.isStorageAvailable()) {
				return { available: false };
			}

			const keys = Object.keys(localStorage);
			const appKeys = keys.filter((key) => key.startsWith(this.PREFIX));

			let totalSize = 0;
			const items = appKeys.map((key) => {
				const value = localStorage.getItem(key);
				const size = value ? value.length : 0;
				totalSize += size;

				return {
					key: key.replace(this.PREFIX, ""),
					size,
				};
			});

			return {
				available: true,
				itemCount: appKeys.length,
				totalSize,
				items,
				quota: this.getStorageQuota(),
			};
		} catch (error) {
			logger.error("Failed to get storage info:", error);
			return { available: false, error: error.message };
		}
	}

	/**
	 * Estimate storage quota (browser-dependent)
	 */
	static async getStorageQuota() {
		try {
			if ("storage" in navigator && "estimate" in navigator.storage) {
				const estimate = await navigator.storage.estimate();
				return {
					quota: estimate.quota,
					usage: estimate.usage,
					available: estimate.quota - estimate.usage,
				};
			}
			return { quota: "unknown", usage: "unknown", available: "unknown" };
		} catch (error) {
			logger.error("Failed to estimate storage quota:", error);
			return { quota: "error", usage: "error", available: "error" };
		}
	}

	// Session storage fallbacks (less persistent but more reliable)
	static setSessionItem(key, value, options = {}) {
		try {
			if (typeof window === "undefined" || !window.sessionStorage) {
				return false;
			}

			this.validateKey(key);
			const prefixedKey = this.PREFIX + key;
			sessionStorage.setItem(prefixedKey, JSON.stringify({ value, timestamp: Date.now() }));
			return true;
		} catch (error) {
			logger.error(`Failed to store session item "${key}":`, error);
			return false;
		}
	}

	static getSessionItem(key, defaultValue = null) {
		try {
			if (typeof window === "undefined" || !window.sessionStorage) {
				return defaultValue;
			}

			const prefixedKey = this.PREFIX + key;
			const storedData = sessionStorage.getItem(prefixedKey);

			if (!storedData) {
				return defaultValue;
			}

			const dataObject = JSON.parse(storedData);
			return dataObject.value;
		} catch (error) {
			logger.error(`Failed to retrieve session item "${key}":`, error);
			return defaultValue;
		}
	}

	static removeSessionItem(key) {
		try {
			if (typeof window === "undefined" || !window.sessionStorage) {
				return false;
			}

			const prefixedKey = this.PREFIX + key;
			sessionStorage.removeItem(prefixedKey);
			return true;
		} catch (error) {
			logger.error(`Failed to remove session item "${key}":`, error);
			return false;
		}
	}

	static clearSession() {
		try {
			if (typeof window === "undefined" || !window.sessionStorage) {
				return false;
			}

			const keys = Object.keys(sessionStorage);
			const appKeys = keys.filter((key) => key.startsWith(this.PREFIX));

			appKeys.forEach((key) => {
				sessionStorage.removeItem(key);
			});

			return true;
		} catch (error) {
			logger.error("Failed to clear session storage:", error);
			return false;
		}
	}
}

/**
 * Convenient wrapper functions for common storage operations
 */

// User preferences (safe to store)
export const UserPreferences = {
	setTheme: (theme) => SecureStorage.setItem("user_theme", theme),
	getTheme: () => SecureStorage.getItem("user_theme", "light"),

	setLanguage: (language) => SecureStorage.setItem("user_language", language),
	getLanguage: () => SecureStorage.getItem("user_language", "en"),

	setLocation: (location) => SecureStorage.setItem("user_location", location, { encrypt: true, expiry: 7 * 24 * 60 * 60 * 1000 }), // 7 days
	getLocation: () => SecureStorage.getItem("user_location"),

	setSearchHistory: (history) => SecureStorage.setItem("search_history", history.slice(0, 10)), // Limit to 10 items
	getSearchHistory: () => SecureStorage.getItem("search_history", []),

	addToSearchHistory: (query) => {
		const history = UserPreferences.getSearchHistory();
		const updated = [query, ...history.filter((item) => item !== query)].slice(0, 10);
		UserPreferences.setSearchHistory(updated);
	},
};

// Application state (safe to store)
export const AppState = {
	setLastRoute: (route) => SecureStorage.setItem("last_route", route),
	getLastRoute: () => SecureStorage.getItem("last_route"),

	setMapPosition: (position) => SecureStorage.setItem("map_position", position, { expiry: 24 * 60 * 60 * 1000 }), // 24 hours
	getMapPosition: () => SecureStorage.getItem("map_position"),

	setOnboardingCompleted: (completed) => SecureStorage.setItem("onboarding_completed", completed),
	getOnboardingCompleted: () => SecureStorage.getItem("onboarding_completed", false),
};

export default SecureStorage;
