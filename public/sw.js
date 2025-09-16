// Thorbis Business OS Service Worker
// Comprehensive PWA with offline functionality and NextFaster caching for sub-300ms navigation

const CACHE_VERSION = '2025-v1';
const CACHE_NAME = `thorbis-business-os-${CACHE_VERSION}`;
const STATIC_CACHE = `thorbis-static-${CACHE_VERSION}`;
const API_CACHE = `thorbis-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `thorbis-images-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `thorbis-dynamic-${CACHE_VERSION}`;

// Cache expiry times (in milliseconds)
const CACHE_EXPIRY = {
  STATIC: 7 * 24 * 60 * 60 * 1000,    // 7 days
  DYNAMIC: 24 * 60 * 60 * 1000,       // 24 hours
  API: 5 * 60 * 1000,                 // 5 minutes
  IMAGES: 30 * 24 * 60 * 60 * 1000,   // 30 days
};

// Static resources to cache immediately - All Thorbis Business OS apps
const STATIC_RESOURCES = [
  '/',
  '/manifest.json',
  '/offline',
  // Core application routes
  '/dashboards/',
  '/dashboards/settings',
  '/dashboards/profile',
  // Industry-specific applications  
  '/dashboards/home-services',
  '/dashboards/restaurant',
  '/dashboards/auto-services',
  '/dashboards/retail',
  '/dashboards/courses',
  '/dashboards/payroll',
  '/dashboards/investigations',
  '/dashboards/lom',
  // Customer Portal routes
  '/portal',
  '/portal/offline',
  '/portal/hs/',
  '/portal/auto/',
  '/portal/retail/',
  '/portal/restaurant/',
  '/portal/notifications',
  '/portal/account',
  '/portal/support',
  // Essential Next.js static assets
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/framework.js',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/polyfills.js',
];

// API routes to cache with stale-while-revalidate - All business OS APIs
const API_ROUTES = [
  // Core API routes
  '/api/auth',
  '/api/user',
  '/api/settings',
  '/api/notifications',
  // Home Services APIs
  '/api/hs/work-orders',
  '/api/hs/customers',
  '/api/hs/technicians',
  '/api/hs/invoices',
  '/api/hs/estimates',
  '/api/hs/inventory',
  // Restaurant APIs
  '/api/rest/orders',
  '/api/rest/menu',
  '/api/rest/inventory',
  '/api/rest/staff',
  '/api/rest/customers',
  // Auto Services APIs
  '/api/auto/repair-orders',
  '/api/auto/customers',
  '/api/auto/vehicles',
  '/api/auto/parts',
  '/api/auto/technicians',
  // Retail APIs
  '/api/ret/products',
  '/api/ret/inventory',
  '/api/ret/customers',
  '/api/ret/orders',
  '/api/ret/pos',
  // Additional APIs
  '/api/courses',
  '/api/payroll',
  '/api/investigations',
  '/api/lom',
  '/api/analytics',
  '/api/reports',
  // Portal-specific APIs
  '/api/v1/portal',
  '/api/v1/customers',
  '/api/v1/orders',
  '/api/v1/notifications',
  '/api/v1/subscriptions',
  '/api/v1/subscription-plans',
  '/api/v1/payments'
];

// Network-first routes (always try network first)
const NETWORK_FIRST_ROUTES = [
  '/api/auth',
  '/api/user/session',
  '/api/notifications',
  '/api/real-time',
  '/_next/webpack-hmr',
];

// Cache-first routes (serve from cache if available)
const CACHE_FIRST_ROUTES = [
  '/_next/static/',
  '/images/',
  '/icons/',
  '/fonts/',
  '/assets/'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Thorbis Business OS service worker...');
  
  event.waitUntil(
    (async () => {
      try {
        // Open multiple caches in parallel
        const [staticCache] = await Promise.all([
          caches.open(STATIC_CACHE),
          caches.open(API_CACHE),
          caches.open(IMAGE_CACHE),
          caches.open(DYNAMIC_CACHE)
        ]);
        
        // Cache essential static resources
        await staticCache.addAll(STATIC_RESOURCES);
        
        // Force activation of new service worker
        await self.skipWaiting();
        
        console.log('[SW] Static assets cached successfully');
      } catch (error) {
        console.error('[SW] Failed to cache static assets:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Thorbis Business OS service worker...');
  
  event.waitUntil(
    (async () => {
      try {
        // Take control of all clients immediately
        await self.clients.claim();
        
        // Clean up old caches
        const cacheNames = await caches.keys();
        const currentCaches = [CACHE_NAME, STATIC_CACHE, API_CACHE, IMAGE_CACHE, DYNAMIC_CACHE];
        
        const deletePromises = cacheNames.map(async (cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        });
        
        await Promise.all(deletePromises);
        console.log('[SW] Old caches cleaned up');
        
        // Notify all clients that the service worker has been updated
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            message: 'Service worker updated successfully'
          });
        });
        
      } catch (error) {
        console.error('[SW] Failed to activate service worker:', error);
      }
    })()
  );
});

// Fetch event - implement advanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip cross-origin requests (except for fonts, images, and CDNs)
  if (url.origin !== location.origin && 
      !request.url.includes('fonts.googleapis.com') &&
      !request.url.includes('fonts.gstatic.com') &&
      !request.url.includes('cdnjs.cloudflare.com') &&
      !request.url.includes('unpkg.com')) {
    return;
  }

  // Determine caching strategy based on request type
  if (shouldUseNetworkFirst(request)) {
    // Network-first for critical data
    event.respondWith(handleNetworkFirst(request));
  } else if (shouldUseCacheFirst(request)) {
    // Cache-first for static assets
    event.respondWith(handleCacheFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    // Stale-while-revalidate for API requests
    event.respondWith(handleStaleWhileRevalidate(request));
  } else if (isImageRequest(request)) {
    // Cache-first with long expiry for images
    event.respondWith(handleImageRequest(request));
  } else if (request.mode === 'navigate') {
    // Network-first for page navigation
    event.respondWith(handleNavigationRequest(request));
  } else {
    // Default to stale-while-revalidate
    event.respondWith(handleStaleWhileRevalidate(request));
  }
});

// =============================================================================
// Advanced Caching Strategy Functions
// =============================================================================

/**
 * Network First Strategy - For critical, real-time data
 */
async function handleNetworkFirst(request) {
  const cacheName = request.url.includes('/api/') ? API_CACHE : DYNAMIC_CACHE;
  const cache = await caches.open(cacheName);
  
  try {
    // Try network first with short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const networkResponse = await fetch(request, {
      signal: controller.signal,
      headers: {
        ...request.headers,
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Cache successful responses with expiry
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      addExpiryMetadata(cache, request.url, getCacheExpiry(request));
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse && !isExpired(cachedResponse, request.url)) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return handleOfflineNavigation(request);
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Content not available offline',
        cached: false 
      }), 
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache First Strategy - For static assets with long expiry
 */
async function handleCacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse && !isExpired(cachedResponse, request.url)) {
    return cachedResponse;
  }
  
  try {
    // Fallback to network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      addExpiryMetadata(cache, request.url, getCacheExpiry(request));
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version even if expired
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy - For regular content
 */
async function handleStaleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  // Return cached version immediately if available
  const cachedResponse = await cache.match(request);
  
  // Start background fetch to update cache
  const fetchPromise = (async () => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        await cache.put(request, responseToCache);
        addExpiryMetadata(cache, request.url, getCacheExpiry(request));
      }
      return networkResponse;
    } catch (error) {
      console.log('[SW] Background fetch failed:', error);
      return cachedResponse;
    }
  })();
  
  // Return cached response or wait for network
  return cachedResponse || fetchPromise;
}

/**
 * Enhanced Image Request Handler - Cache first with long expiry
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  // Try cache first (images should have long expiry)
  const cachedResponse = await cache.match(request);
  if (cachedResponse && !isExpired(cachedResponse, request.url)) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful image responses with long expiry
      const responseToCache = response.clone();
      await cache.put(request, responseToCache);
      addExpiryMetadata(cache, request.url, CACHE_EXPIRY.IMAGES);
    }
    return response;
  } catch (error) {
    // Return cached version even if expired
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline placeholder image
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#1a1a1a"/>
        <circle cx="100" cy="90" r="25" fill="#404040"/>
        <path d="M85 110 L115 110 L105 125 Z" fill="#404040"/>
        <text x="100" y="155" text-anchor="middle" fill="#737373" font-family="Arial, sans-serif" font-size="12">
          Offline
        </text>
      </svg>`,
      { 
        headers: { 
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'max-age=3600'
        } 
      }
    );
  }
}

/**
 * Enhanced Navigation Request Handler - Network first with intelligent fallback
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first for fresh content with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for navigation
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      // Cache successful page responses
      const cache = await caches.open(DYNAMIC_CACHE);
      const responseToCache = response.clone();
      await cache.put(request, responseToCache);
      addExpiryMetadata(cache, request.url, CACHE_EXPIRY.DYNAMIC);
    }
    
    return response;
  } catch (error) {
    return handleOfflineNavigation(request);
  }
}

/**
 * Handle offline navigation with smart fallbacks
 */
async function handleOfflineNavigation(request) {
  // Try to find cached version of the specific page
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Try to find a cached version of the main page for the route
  const url = new URL(request.url);
  const basePath = url.pathname.split('/').slice(0, -1).join('/') || '/';
  const basePageResponse = await cache.match(basePath);
  
  if (basePageResponse) {
    return basePageResponse;
  }
  
  // Try dedicated offline page
  const offlineResponse = await cache.match('/offline');
  if (offlineResponse) {
    return offlineResponse;
  }
  
  // Return inline offline page with Thorbis styling
  return new Response(`
    <!DOCTYPE html>
    <html lang="en" class="dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Thorbis Business OS</title>
      <style>
        body {
          background: #0a0a0a;
          color: #e5e5e5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          text-align: center;
        }
        .offline-container {
          max-width: 400px;
          padding: 2rem;
        }
        .offline-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          opacity: 0.6;
        }
        .offline-title {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1C8BFF;
        }
        .offline-message {
          font-size: 1rem;
          line-height: 1.5;
          margin-bottom: 2rem;
          color: #a3a3a3;
        }
        .retry-button {
          background: #1C8BFF;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .retry-button:hover {
          background: #0f7ae5;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <svg class="offline-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
        </svg>
        <h1 class="offline-title">You're Offline</h1>
        <p class="offline-message">
          Looks like you've lost your internet connection. Don't worry, we'll get you back online as soon as your connection is restored.
        </p>
        <button class="retry-button" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `, { 
    headers: { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    } 
  });
}

// Background sync for failed API requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('[SW] Background sync triggered');
  
  // Get failed requests from IndexedDB and retry them
  // This would integrate with your offline request queue
  try {
    const failedRequests = await getFailedRequestsFromDB();
    
    for (const request of failedRequests) {
      try {
        await fetch(request);
        await removeRequestFromDB(request.id);
        console.log('[SW] Retried request successfully:', request.url);
      } catch (error) {
        console.log('[SW] Retry failed for:', request.url);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    data: data.data,
    actions: data.actions,
    tag: data.tag,
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll().then((clientList) => {
      // Check if the URL is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if not found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Message handling for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(updateCache(event.data.urls));
    return;
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearCache(event.data.cacheNames));
    return;
  }
});

// =============================================================================
// Helper Functions for Enhanced Caching
// =============================================================================

/**
 * Determine if request should use network-first strategy
 */
function shouldUseNetworkFirst(request) {
  return NETWORK_FIRST_ROUTES.some(pattern => request.url.includes(pattern));
}

/**
 * Determine if request should use cache-first strategy
 */
function shouldUseCacheFirst(request) {
  return CACHE_FIRST_ROUTES.some(pattern => request.url.includes(pattern)) || 
         isStaticResource(request);
}

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|avif|svg|ico|bmp|tiff)$/i.test(new URL(request.url).pathname);
}

/**
 * Check if request is for a static resource
 */
function isStaticResource(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.startsWith('/static/') ||
         url.pathname.startsWith('/assets/') ||
         /\.(js|css|woff|woff2|ttf|eot|otf)$/i.test(url.pathname);
}

/**
 * Get appropriate cache expiry time for request
 */
function getCacheExpiry(request) {
  if (request.url.includes('/api/')) return CACHE_EXPIRY.API;
  if (isImageRequest(request)) return CACHE_EXPIRY.IMAGES;
  if (isStaticResource(request)) return CACHE_EXPIRY.STATIC;
  return CACHE_EXPIRY.DYNAMIC;
}

/**
 * Add expiry metadata to cache (simplified approach)
 */
async function addExpiryMetadata(cache, url, expiry) {
  // Store expiry time in a separate cache entry
  const expiryKey = `${url}__expiry`;
  const expiryTime = Date.now() + expiry;
  await cache.put(expiryKey, new Response(JSON.stringify({ expiryTime })));
}

/**
 * Check if cached response is expired
 */
async function isExpired(response, url) {
  // First check cache-control headers
  const cacheControl = response.headers.get('Cache-Control');
  if (cacheControl && cacheControl.includes('no-cache')) {
    return true;
  }
  
  // Check custom expiry metadata
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const expiryKey = `${url}__expiry`;
    const expiryResponse = await cache.match(expiryKey);
    
    if (expiryResponse) {
      const expiryData = await expiryResponse.json();
      return Date.now() > expiryData.expiryTime;
    }
  } catch (error) {
    // If we can't determine expiry, assume not expired
  }
  
  // Fallback: check date header
  const dateHeader = response.headers.get('Date');
  if (dateHeader) {
    const responseDate = new Date(dateHeader);
    const now = new Date();
    const hoursSinceResponse = (now - responseDate) / (1000 * 60 * 60);
    return hoursSinceResponse > 24; // Consider expired after 24 hours
  }
  
  return false;
}

async function updateCache(urls) {
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll(urls);
}

async function clearCache(cacheNames) {
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Placeholder functions for offline request queue
async function getFailedRequestsFromDB() {
  // Implement IndexedDB integration
  return [];
}

async function removeRequestFromDB(requestId) {
  // Implement IndexedDB integration
  return Promise.resolve();
}

console.log('[SW] Service worker loaded');