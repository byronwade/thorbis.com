// Simple cache manager implementation
class CacheManager {
  constructor() {
    this.memory = new Map();
  }

  get(key) {
    const item = this.memory.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      this.memory.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttl = 5 * 60 * 1000) {
    this.memory.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  delete(key) {
    this.memory.delete(key);
  }

  clear() {
    this.memory.clear();
  }
}

const cacheManager = new CacheManager();

export { CacheManager };
export default cacheManager;

// Backwards-compatible named helpers (aliases)
export const CacheStrategies = {
  businessSearch: {
    get: (query, location) => cacheManager.get(`search:${query}:${location}`),
    set: (query, location, results) => cacheManager.set(`search:${query}:${location}`, results, 10 * 60 * 1000),
  },
  userData: {
    get: (userId) => cacheManager.get(`user:${userId}`),
    set: (userId, data) => cacheManager.set(`user:${userId}`, data, 30 * 60 * 1000),
  },
  staticData: {
    get: (type) => cacheManager.get(`static:${type}`),
    set: (type, data) => cacheManager.set(`static:${type}`, data, 60 * 60 * 1000),
  },
  apiResponse: {
    get: (url, params = {}) => cacheManager.get(`api:${url}:${JSON.stringify(params)}`),
    set: (url, params = {}, response) => cacheManager.set(`api:${url}:${JSON.stringify(params)}`, { response, timestamp: Date.now() }, 5 * 60 * 1000),
  },
};

export const CacheUtils = {
  getStats: () => ({ size: cacheManager.memory.size }),
  clearAll: () => cacheManager.clear(),
};
