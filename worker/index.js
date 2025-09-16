// Custom Service Worker for Thorbis Business OS
// Handles offline functionality, background sync, and payment processing

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSync } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache and route static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// IndexedDB setup for offline data storage
const DB_NAME = 'thorbis-offline-db';
const DB_VERSION = 1;
const STORES = {
  payments: 'payments',
  customers: 'customers',
  inventory: 'inventory',
  workOrders: 'work-orders',
  analytics: 'analytics',
  documents: 'documents',
  photos: 'photos',
  transactions: 'transactions'
};

let db = null;

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Create object stores for offline data
      Object.values(STORES).forEach(storeName => {
        if (!database.objectStoreNames.contains(storeName)) {
          const store = database.createObjectStore(storeName, { 
            keyPath: 'id',
            autoIncrement: true 
          });
          
          // Add indexes for common queries
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('synced', 'synced');
          store.createIndex('organizationId', 'organizationId');
        }
      });
    };
  });
};

// Background sync for offline operations
const bgSync = new BackgroundSync('thorbis-queue', {
  maxRetentionTime: 24 * 60 // 24 hours
});

// API Routes - Network First with offline fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 60 * 60 * 24 // 24 hours
      })
    ]
  })
);

// Static assets - Cache First
registerRoute(
  ({ request }) => request.destination === 'image' ||
                  request.destination === 'script' ||
                  request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      })
    ]
  })
);

// Dashboard pages - Stale While Revalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/dashboard/'),
  new StaleWhileRevalidate({
    cacheName: 'dashboard-pages',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 2 // 2 hours
      })
    ]
  })
);

// Offline payment processing
const handleOfflinePayment = async (paymentData) => {
  await initDB();
  
  const transaction = db.transaction([STORES.payments], 'readwrite');
  const store = transaction.objectStore(STORES.payments);
  
  const offlinePayment = {
    ...paymentData,
    timestamp: Date.now(),
    synced: false,
    status: 'pending_sync',
    offline: true
  };
  
  await store.add(offlinePayment);
  
  // Add to background sync queue
  await bgSync.registerSync();
  
  return { success: true, offline: true, id: offlinePayment.id };
};

// Offline data storage utilities
const storeOfflineData = async (storeName, data) => {
  await initDB();
  
  const transaction = db.transaction([storeName], 'readwrite');
  const store = transaction.objectStore(storeName);
  
  const offlineData = {
    ...data,
    timestamp: Date.now(),
    synced: false
  };
  
  await store.add(offlineData);
  await bgSync.registerSync();
  
  return offlineData;
};

const getOfflineData = async (storeName, filters = {}) => {
  await initDB();
  
  const transaction = db.transaction([storeName], 'readonly');
  const store = transaction.objectStore(storeName);
  
  const request = store.getAll();
  const data = await new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  
  // Apply filters
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => 
      item[key] === value
    );
  });
};

// Background sync handler
self.addEventListener('sync', async (event) => {
  if (event.tag === 'thorbis-queue') {
    event.waitUntil(syncOfflineData());
  }
});

const syncOfflineData = async () => {
  await initDB();
  
  // Sync all offline data stores
  for (const storeName of Object.values(STORES)) {
    try {
      const unsyncedData = await getOfflineData(storeName, { synced: false });
      
      for (const item of unsyncedData) {
        await syncDataItem(storeName, item);
      }
    } catch (error) {
      console.error(`Failed to sync ${storeName}:`, error);
    }
  }
};

const syncDataItem = async (storeName, item) => {
  try {
    let endpoint = '';
    
    switch (storeName) {
      case STORES.payments:
        endpoint = '/api/v1/payments/sync';
        break;
      case STORES.customers:
        endpoint = '/api/v1/customers/sync';
        break;
      case STORES.inventory:
        endpoint = '/api/v1/inventory/sync';
        break;
      case STORES.workOrders:
        endpoint = '/api/v1/work-orders/sync';
        break;
      case STORES.analytics:
        endpoint = '/api/v1/analytics/sync';
        break;
      default:
        endpoint = `/api/v1/${storeName}/sync`;
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item)
    });
    
    if (response.ok) {
      // Mark as synced
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      item.synced = true;
      item.syncedAt = Date.now();
      
      await store.put(item);
    }
  } catch (error) {
    console.error(`Failed to sync item from ${storeName}:`, error);
  }
};

// Message handling for communication with main thread
self.addEventListener('message', async (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'STORE_OFFLINE_PAYMENT':
      const result = await handleOfflinePayment(data);
      event.ports[0].postMessage(result);
      break;
      
    case 'STORE_OFFLINE_DATA':
      const stored = await storeOfflineData(data.store, data.payload);
      event.ports[0].postMessage(stored);
      break;
      
    case 'GET_OFFLINE_DATA':
      const retrieved = await getOfflineData(data.store, data.filters);
      event.ports[0].postMessage(retrieved);
      break;
      
    case 'FORCE_SYNC':
      await syncOfflineData();
      event.ports[0].postMessage({ success: true });
      break;
      
    case 'CLEAR_CACHE':
      await caches.delete('api-cache');
      await caches.delete('static-assets');
      await caches.delete('dashboard-pages');
      event.ports[0].postMessage({ success: true });
      break;
  }
});

// Handle failed network requests
self.addEventListener('fetch', (event) => {
  // Handle payment requests when offline
  if (event.request.url.includes('/api/v1/payments') && 
      event.request.method === 'POST') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const body = await event.request.text();
        const paymentData = JSON.parse(body);
        
        const result = await handleOfflinePayment(paymentData);
        
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
          status: 202 // Accepted for processing
        });
      })
    );
  }
  
  // Handle other API requests when offline
  if (event.request.url.includes('/api/') && 
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.request.method)) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const url = new URL(event.request.url);
        const storeName = getStoreNameFromPath(url.pathname);
        
        if (storeName) {
          const body = await event.request.text();
          const requestData = JSON.parse(body);
          
          await storeOfflineData(storeName, {
            method: event.request.method,
            url: event.request.url,
            data: requestData
          });
          
          return new Response(JSON.stringify({ 
            success: true, 
            offline: true,
            message: 'Data stored offline and will sync when connection is restored'
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 202
          });
        }
        
        return new Response(JSON.stringify({ 
          error: 'Network unavailable',
          offline: true 
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        });
      })
    );
  }
});

const getStoreNameFromPath = (pathname) => {
  if (pathname.includes('/customers')) return STORES.customers;
  if (pathname.includes('/inventory')) return STORES.inventory;
  if (pathname.includes('/work-orders')) return STORES.workOrders;
  if (pathname.includes('/analytics')) return STORES.analytics;
  if (pathname.includes('/documents')) return STORES.documents;
  return null;
};

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Thorbis',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Thorbis Business OS', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Initialize service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    initDB().then(() => {
      console.log('Thorbis Service Worker installed with offline capabilities');
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      console.log('Thorbis Service Worker activated');
    })
  );
});