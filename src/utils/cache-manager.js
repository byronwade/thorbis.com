// Unified cache manager: re-export canonical implementation to remove duplication
export { CacheManager, MemoryCache, SessionStorageCache, LocalStorageCache } from "@lib/utils/cacheManager";
export { default } from "@lib/utils/cacheManager";
// Backwards-compatible named helpers (aliases)
export const CacheStrategies = {
	// Prefer using higher-level keys; maintain legacy API by delegating to multi-layer cache
	businessSearch: {
		get: (query, location) => require("@lib/utils/cacheManager").default.multiGet(`search:${query}:${location}`),
		set: (query, location, results) => require("@lib/utils/cacheManager").default.multiSet(`search:${query}:${location}`, results, { ttl: 10 * 60 * 1000 }),
	},
	userData: {
		get: (userId) => require("@lib/utils/cacheManager").default.multiGet(`user:${userId}`),
		set: (userId, data) => require("@lib/utils/cacheManager").default.multiSet(`user:${userId}`, data, { ttl: 30 * 60 * 1000, persistent: true }),
	},
	staticData: {
		get: (type) => require("@lib/utils/cacheManager").default.multiGet(`static:${type}`),
		set: (type, data) => require("@lib/utils/cacheManager").default.multiSet(`static:${type}`, data, { ttl: 60 * 60 * 1000, persistent: true }),
	},
	apiResponse: {
		get: (url, params = {}) => require("@lib/utils/cacheManager").default.multiGet(`api:${url}:${JSON.stringify(params)}`),
		set: (url, params = {}, response) => require("@lib/utils/cacheManager").default.multiSet(`api:${url}:${JSON.stringify(params)}`, { response, timestamp: Date.now() }, { ttl: 5 * 60 * 1000 }),
	},
};

export const CacheUtils = {
	getStats: () => require("@lib/utils/cacheManager").default.getAllStats(),
	clearAll: () => require("@lib/utils/cacheManager").default.clearAll(),
};
