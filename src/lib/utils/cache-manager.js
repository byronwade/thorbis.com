/**
 * Advanced Cache Manager
 * High-performance caching system with TTL, LRU eviction, and pattern matching
 * Optimized for React applications with memory-efficient storage
 */

"use client";

/**
 * Memory Cache Implementation with LRU eviction
 */
class MemoryCache {
	constructor(maxSize = 1000, defaultTTL = 5 * 60 * 1000) {
		this.cache = new Map();
		this.accessOrder = new Map(); // Track access order for LRU
		this.maxSize = maxSize;
		this.defaultTTL = defaultTTL;
		this.hitCount = 0;
		this.missCount = 0;
	}

	/**
	 * Get item from cache
	 */
	get(key) {
		const item = this.cache.get(key);

		if (!item) {
			this.missCount++;
			return null;
		}

		// Check if expired
		if (Date.now() > item.expiresAt) {
			this.cache.delete(key);
			this.accessOrder.delete(key);
			this.missCount++;
			return null;
		}

		// Update access order for LRU
		this.accessOrder.set(key, Date.now());
		this.hitCount++;
		return item.value;
	}

	/**
	 * Set item in cache with TTL
	 */
	set(key, value, ttl = null) {
		const actualTTL = ttl || this.defaultTTL;
		const expiresAt = Date.now() + actualTTL;

		// Remove oldest item if cache is full
		if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
			this.evictLRU();
		}

		this.cache.set(key, {
			value,
			expiresAt,
			createdAt: Date.now(),
		});

		this.accessOrder.set(key, Date.now());
		return true;
	}

	/**
	 * Remove item from cache
	 */
	delete(key) {
		this.cache.delete(key);
		this.accessOrder.delete(key);
		return true;
	}

	/**
	 * Check if key exists and is not expired
	 */
	has(key) {
		const item = this.cache.get(key);
		if (!item) return false;

		if (Date.now() > item.expiresAt) {
			this.cache.delete(key);
			this.accessOrder.delete(key);
			return false;
		}

		return true;
	}

	/**
	 * Clear all cache entries
	 */
	clear() {
		this.cache.clear();
		this.accessOrder.clear();
		this.hitCount = 0;
		this.missCount = 0;
	}

	/**
	 * Evict least recently used item
	 */
	evictLRU() {
		if (this.accessOrder.size === 0) return;

		// Find the oldest accessed item
		let oldestKey = null;
		let oldestTime = Date.now();

		for (const [key, time] of this.accessOrder) {
			if (time < oldestTime) {
				oldestTime = time;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.cache.delete(oldestKey);
			this.accessOrder.delete(oldestKey);
		}
	}

	/**
	 * Clean up expired entries
	 */
	cleanup() {
		const now = Date.now();
		const expiredKeys = [];

		for (const [key, item] of this.cache) {
			if (now > item.expiresAt) {
				expiredKeys.push(key);
			}
		}

		expiredKeys.forEach((key) => {
			this.cache.delete(key);
			this.accessOrder.delete(key);
		});

		return expiredKeys.length;
	}

	/**
	 * Invalidate cache entries matching pattern
	 */
	invalidatePattern(pattern) {
		const regex = new RegExp(pattern.replace(/\*/g, ".*"));
		const keysToDelete = [];

		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				keysToDelete.push(key);
			}
		}

		keysToDelete.forEach((key) => {
			this.cache.delete(key);
			this.accessOrder.delete(key);
		});

		return keysToDelete.length;
	}

	/**
	 * Get cache statistics
	 */
	getStats() {
		const totalRequests = this.hitCount + this.missCount;
		const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;

		return {
			size: this.cache.size,
			maxSize: this.maxSize,
			hitCount: this.hitCount,
			missCount: this.missCount,
			hitRate: hitRate.toFixed(2),
			memoryUsage: this.estimateMemoryUsage(),
		};
	}

	/**
	 * Estimate memory usage (approximate)
	 */
	estimateMemoryUsage() {
		let totalSize = 0;

		for (const [key, item] of this.cache) {
			totalSize += key.length * 2; // Assuming UTF-16
			totalSize += JSON.stringify(item.value).length * 2;
			totalSize += 32; // Overhead for object structure
		}

		return {
			bytes: totalSize,
			kb: (totalSize / 1024).toFixed(2),
			mb: (totalSize / (1024 * 1024)).toFixed(2),
		};
	}

	/**
	 * Get all keys matching pattern
	 */
	getKeys(pattern = null) {
		if (!pattern) {
			return Array.from(this.cache.keys());
		}

		const regex = new RegExp(pattern.replace(/\*/g, ".*"));
		return Array.from(this.cache.keys()).filter((key) => regex.test(key));
	}

	/**
	 * Get cache entries with metadata
	 */
	getEntries(includeExpired = false) {
		const entries = [];
		const now = Date.now();

		for (const [key, item] of this.cache) {
			const isExpired = now > item.expiresAt;

			if (!includeExpired && isExpired) {
				continue;
			}

			entries.push({
				key,
				value: item.value,
				createdAt: item.createdAt,
				expiresAt: item.expiresAt,
				isExpired,
				ttl: Math.max(0, item.expiresAt - now),
			});
		}

		return entries;
	}
}

/**
 * Session Storage Cache (persists across page reloads)
 */
class SessionStorageCache {
	constructor(prefix = "cache_") {
		this.prefix = prefix;
		this.isAvailable = this.checkAvailability();
	}

	checkAvailability() {
		try {
			if (typeof window === "undefined" || !window.sessionStorage) {
				return false;
			}
			const test = "__cache_test__";
			window.sessionStorage.setItem(test, "test");
			window.sessionStorage.removeItem(test);
			return true;
		} catch {
			return false;
		}
	}

	get(key) {
		if (!this.isAvailable) return null;

		try {
			const item = window.sessionStorage.getItem(this.prefix + key);
			if (!item) return null;

			const parsed = JSON.parse(item);
			if (Date.now() > parsed.expiresAt) {
				this.delete(key);
				return null;
			}

			return parsed.value;
		} catch {
			return null;
		}
	}

	set(key, value, ttl = 30 * 60 * 1000) {
		if (!this.isAvailable) return false;

		try {
			const item = {
				value,
				expiresAt: Date.now() + ttl,
				createdAt: Date.now(),
			};

			window.sessionStorage.setItem(this.prefix + key, JSON.stringify(item));
			return true;
		} catch {
			return false;
		}
	}

	delete(key) {
		if (!this.isAvailable) return false;

		try {
			window.sessionStorage.removeItem(this.prefix + key);
			return true;
		} catch {
			return false;
		}
	}

	clear() {
		if (!this.isAvailable) return false;

		try {
			const keys = Object.keys(window.sessionStorage);
			keys.forEach((key) => {
				if (key.startsWith(this.prefix)) {
					window.sessionStorage.removeItem(key);
				}
			});
			return true;
		} catch {
			return false;
		}
	}
}

/**
 * Local Storage Cache (persists across browser sessions)
 */
class LocalStorageCache {
	constructor(prefix = "cache_persistent_") {
		this.prefix = prefix;
		this.isAvailable = this.checkAvailability();
	}

	checkAvailability() {
		try {
			if (typeof window === "undefined" || !window.localStorage) {
				return false;
			}
			const test = "__cache_test__";
			window.localStorage.setItem(test, "test");
			window.localStorage.removeItem(test);
			return true;
		} catch {
			return false;
		}
	}

	get(key) {
		if (!this.isAvailable) return null;

		try {
			const item = window.localStorage.getItem(this.prefix + key);
			if (!item) return null;

			const parsed = JSON.parse(item);
			if (Date.now() > parsed.expiresAt) {
				this.delete(key);
				return null;
			}

			return parsed.value;
		} catch {
			return null;
		}
	}

	set(key, value, ttl = 24 * 60 * 60 * 1000) {
		if (!this.isAvailable) return false;

		try {
			const item = {
				value,
				expiresAt: Date.now() + ttl,
				createdAt: Date.now(),
			};

			window.localStorage.setItem(this.prefix + key, JSON.stringify(item));
			return true;
		} catch {
			// Storage might be full, try to clean up and retry
			this.cleanup();
			try {
				window.localStorage.setItem(this.prefix + key, JSON.stringify(item));
				return true;
			} catch {
				return false;
			}
		}
	}

	delete(key) {
		if (!this.isAvailable) return false;

		try {
			window.localStorage.removeItem(this.prefix + key);
			return true;
		} catch {
			return false;
		}
	}

	clear() {
		if (!this.isAvailable) return false;

		try {
			const keys = Object.keys(window.localStorage);
			keys.forEach((key) => {
				if (key.startsWith(this.prefix)) {
					window.localStorage.removeItem(key);
				}
			});
			return true;
		} catch {
			return false;
		}
	}

	cleanup() {
		if (!this.isAvailable) return 0;

		try {
			const keys = Object.keys(window.localStorage);
			let cleaned = 0;
			const now = Date.now();

			keys.forEach((key) => {
				if (key.startsWith(this.prefix)) {
					try {
						const item = JSON.parse(window.localStorage.getItem(key));
						if (now > item.expiresAt) {
							window.localStorage.removeItem(key);
							cleaned++;
						}
					} catch {
						// Invalid format, remove it
						window.localStorage.removeItem(key);
						cleaned++;
					}
				}
			});

			return cleaned;
		} catch {
			return 0;
		}
	}
}

/**
 * Cache Manager - Unified interface for all cache types
 */
class CacheManager {
	constructor() {
		this.memory = new MemoryCache(1000, 5 * 60 * 1000); // 5 minutes default
		this.session = new SessionStorageCache();
		this.persistent = new LocalStorageCache();

		// Auto cleanup expired entries every 5 minutes
		this.startCleanupInterval();
	}

	startCleanupInterval() {
		if (typeof window !== "undefined") {
			setInterval(
				() => {
					this.memory.cleanup();
					this.session.cleanup?.();
					this.persistent.cleanup();
				},
				5 * 60 * 1000
			); // 5 minutes
		}
	}

	/**
	 * Get from multiple cache layers (memory -> session -> persistent)
	 */
	multiGet(key) {
		// Try memory first (fastest)
		let value = this.memory.get(key);
		if (value !== null) return value;

		// Try session storage
		value = this.session.get(key);
		if (value !== null) {
			// Promote to memory cache
			this.memory.set(key, value);
			return value;
		}

		// Try persistent storage
		value = this.persistent.get(key);
		if (value !== null) {
			// Promote to memory and session cache
			this.memory.set(key, value);
			this.session.set(key, value);
			return value;
		}

		return null;
	}

	/**
	 * Set in multiple cache layers
	 */
	multiSet(key, value, options = {}) {
		const { memory = true, session = false, persistent = false, ttl = 5 * 60 * 1000 } = options;

		if (memory) {
			this.memory.set(key, value, ttl);
		}

		if (session) {
			this.session.set(key, value, ttl);
		}

		if (persistent) {
			this.persistent.set(key, value, ttl);
		}

		return true;
	}

	/**
	 * Delete from all cache layers
	 */
	multiDelete(key) {
		this.memory.delete(key);
		this.session.delete(key);
		this.persistent.delete(key);
		return true;
	}

	/**
	 * Clear all caches
	 */
	clearAll() {
		this.memory.clear();
		this.session.clear();
		this.persistent.clear();
	}

	/**
	 * Get comprehensive cache statistics
	 */
	getAllStats() {
		return {
			memory: this.memory.getStats(),
			session: {
				available: this.session.isAvailable,
				usage: this.session.isAvailable ? this.getStorageUsage("session") : null,
			},
			persistent: {
				available: this.persistent.isAvailable,
				usage: this.persistent.isAvailable ? this.getStorageUsage("local") : null,
			},
		};
	}

	/**
	 * Get storage usage information
	 */
	getStorageUsage(type = "local") {
		try {
			const storage = type === "session" ? window.sessionStorage : window.localStorage;
			let totalSize = 0;

			for (const key in storage) {
				if (storage.hasOwnProperty(key)) {
					totalSize += storage[key].length + key.length;
				}
			}

			return {
				used: totalSize,
				usedKB: (totalSize / 1024).toFixed(2),
				usedMB: (totalSize / (1024 * 1024)).toFixed(2),
			};
		} catch {
			return null;
		}
	}
}

// Create singleton instance
const cacheManager = new CacheManager();

// Export instances and classes
export { CacheManager, MemoryCache, SessionStorageCache, LocalStorageCache };
export default cacheManager;

// Auto-cleanup on page unload
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", () => {
		cacheManager.memory.cleanup();
	});
}
