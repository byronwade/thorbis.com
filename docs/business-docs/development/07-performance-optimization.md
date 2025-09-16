# Performance Optimization Guide

This comprehensive guide covers the NextFaster performance doctrine and advanced optimization techniques for achieving sub-300ms navigation, minimal bundle sizes, and excellent user experience across all Thorbis Business OS applications.

## NextFaster Performance Doctrine

### Core Principles

#### 1. Server-First Architecture
**Principle**: Minimize client-side JavaScript and maximize server-rendered content.

```typescript
// NextFaster server-first pattern
export default async function CustomersPage() {
  // Server-side data fetching
  const customers = await getCustomers()
  
  return (
    <div className="space-y-6">
      {/* Static content rendered on server */}
      <PageHeader title="Customers" />
      
      {/* Server-rendered data */}
      <CustomersTable customers={customers} />
      
      {/* Minimal client-side interactivity */}
      <CreateCustomerButton />
    </div>
  )
}

// Traditional approach (AVOID)
export default function CustomersPageOld() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Client-side data fetching causes loading states
    fetchCustomers().then(setCustomers).finally(() => setLoading(false))
  }, [])
  
  if (loading) return <LoadingSpinner /> // AVOID loading spinners
  
  return <CustomersTable customers={customers} />
}
```

#### 2. Aggressive Prefetching
**Principle**: Preload likely navigation targets to achieve instant perceived navigation.

```typescript
// Intelligent prefetching implementation
interface PrefetchStrategy {
  triggers: ('hover' | 'viewport' | 'idle' | 'immediate')[]
  priority: 'high' | 'medium' | 'low'
  conditions: string[]
}

export class NextFasterPrefetcher {
  private strategies = new Map<string, PrefetchStrategy>()
  
  constructor() {
    this.setupPrefetchStrategies()
    this.initializeObservers()
  }
  
  private setupPrefetchStrategies() {
    // High-priority routes - prefetch immediately
    this.strategies.set('/customers', {
      triggers: ['immediate'],
      priority: 'high',
      conditions: ['user_role:staff', 'feature_flag:customers_enabled']
    })
    
    // Medium-priority routes - prefetch on hover
    this.strategies.set('/work-orders', {
      triggers: ['hover', 'viewport'],
      priority: 'medium',
      conditions: ['user_role:technician']
    })
    
    // Low-priority routes - prefetch during idle
    this.strategies.set('/reports', {
      triggers: ['idle'],
      priority: 'low',
      conditions: ['user_role:manager']
    })
  }
  
  async prefetchRoute(route: string, priority: 'high' | 'medium' | 'low') {
    const strategy = this.strategies.get(route)
    if (!strategy || !this.shouldPrefetch(strategy)) return
    
    // Use browser's idle time for prefetching
    if ('requestIdleCallback' in window && priority !== 'high') {
      requestIdleCallback(() => this.executePrefetch(route))
    } else {
      this.executePrefetch(route)
    }
  }
  
  private async executePrefetch(route: string) {
    try {
      // Prefetch page bundle
      const pageModule = await import(`@/pages${route}`)
      
      // Prefetch critical data
      if (route === '/customers') {
        await this.prefetchCustomerData()
      }
      
      console.log(`✅ Prefetched: ${route}`)
    } catch (error) {
      console.warn(`❌ Failed to prefetch: ${route}`, error)
    }
  }
}
```

#### 3. Stale-While-Revalidate Pattern
**Principle**: Show cached content immediately while fetching fresh data in the background.

```typescript
// SWR implementation for NextFaster
export function useNextFasterData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: SWROptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [isStale, setIsStale] = useState(false)
  
  useEffect(() => {
    // 1. Try to get cached data immediately
    const cachedData = getCachedData<T>(key)
    if (cachedData) {
      setData(cachedData)
      setIsStale(true) // Mark as potentially stale
    }
    
    // 2. Fetch fresh data in background
    fetcher()
      .then(freshData => {
        setData(freshData)
        setIsStale(false)
        setCachedData(key, freshData)
      })
      .catch(error => {
        // Keep showing stale data on error
        if (!cachedData) {
          throw error
        }
      })
  }, [key])
  
  return { 
    data, 
    isStale, 
    isLoading: data === null 
  }
}

// Usage in components
export function CustomersPage() {
  const { data: customers, isStale } = useNextFasterData(
    'customers',
    () => fetchCustomers(),
    { revalidateOnFocus: false }
  )
  
  return (
    <div>
      {/* Show stale data indicator if needed */}
      {isStale && (
        <div className="text-xs text-muted-foreground">
          Updating...
        </div>
      )}
      
      <CustomersTable customers={customers || []} />
    </div>
  )
}
```

### Performance Targets

#### Core Web Vitals Compliance
```typescript
// Performance targets configuration
export const NEXTFASTER_TARGETS = {
  // Time to Interactive - Maximum time for page to become interactive
  timeToInteractive: 300, // 300ms
  
  // First Contentful Paint - Time to first visible content
  firstContentfulPaint: 1800, // 1.8s
  
  // Largest Contentful Paint - Time to largest content element
  largestContentfulPaint: 1800, // 1.8s
  
  // Cumulative Layout Shift - Visual stability score
  cumulativeLayoutShift: 0.1, // ≤ 0.1
  
  // First Input Delay - Response time to first user interaction
  firstInputDelay: 100, // ≤ 100ms
  
  // Bundle size limits
  javascriptBudget: 170 * 1024, // 170KB
  cssBudget: 50 * 1024, // 50KB
  imageBudget: 500 * 1024, // 500KB per page
  
  // API response targets
  apiResponseTime: 200, // 200ms average
  databaseQueryTime: 50, // 50ms average
} as const
```

#### Performance Monitoring
```typescript
// Real-time performance monitoring
export class NextFasterMonitor {
  private metrics = new Map<string, PerformanceMetric[]>()
  
  constructor() {
    this.initializeWebVitals()
    this.initializeNavigationTiming()
    this.initializeBundleTracking()
  }
  
  private initializeWebVitals() {
    // Monitor Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.recordMetric.bind(this))
      getFID(this.recordMetric.bind(this))
      getFCP(this.recordMetric.bind(this))
      getLCP(this.recordMetric.bind(this))
      getTTFB(this.recordMetric.bind(this))
    })
  }
  
  private recordMetric(metric: Metric) {
    const route = window.location.pathname
    
    if (!this.metrics.has(route)) {
      this.metrics.set(route, [])
    }
    
    this.metrics.get(route)!.push({
      name: metric.name,
      value: metric.value,
      timestamp: Date.now(),
      route
    })
    
    // Check against NextFaster targets
    this.checkPerformanceTarget(metric)
  }
  
  private checkPerformanceTarget(metric: Metric) {
    const targets = {
      CLS: NEXTFASTER_TARGETS.cumulativeLayoutShift,
      FID: NEXTFASTER_TARGETS.firstInputDelay,
      FCP: NEXTFASTER_TARGETS.firstContentfulPaint,
      LCP: NEXTFASTER_TARGETS.largestContentfulPaint,
      TTFB: 800 // Time to First Byte
    }
    
    const target = targets[metric.name as keyof typeof targets]
    
    if (target && metric.value > target) {
      console.warn(`⚠️ Performance target exceeded: ${metric.name}`, {
        value: metric.value,
        target: target,
        route: window.location.pathname
      })
      
      // Send to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        this.reportPerformanceIssue(metric, target)
      }
    }
  }
}
```

## Bundle Optimization

### Code Splitting Strategy

#### Intelligent Route-Based Splitting
```typescript
// next.config.js - Advanced code splitting
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      // Industry-specific splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Framework bundle (React, Next.js)
          framework: {
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            priority: 40,
            enforce: true
          },
          
          // UI library bundle
          ui: {
            chunks: 'all',
            test: /[\\/]packages[\\/]ui[\\/]/,
            name: 'ui',
            priority: 30,
            enforce: true
          },
          
          // Industry-specific bundles
          homeServices: {
            chunks: 'all',
            test: /[\\/]apps[\\/]hs[\\/]/,
            name: 'hs',
            priority: 20
          },
          
          restaurant: {
            chunks: 'all',
            test: /[\\/]apps[\\/]rest[\\/]/,
            name: 'rest',
            priority: 20
          },
          
          // Common vendor bundle
          vendor: {
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            maxSize: NEXTFASTER_TARGETS.javascriptBudget
          }
        }
      }
    }
    
    return config
  }
}
```

#### Dynamic Component Loading
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Heavy chart component - load only when needed
const CustomersChart = dynamic(
  () => import('@/components/charts/CustomersChart'),
  {
    loading: () => (
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
    ),
    ssr: false // Chart doesn't need SSR
  }
)

// Heavy data table - load progressively
const CustomersDataTable = dynamic(
  () => import('@/components/tables/CustomersDataTable'),
  {
    loading: () => <DataTableSkeleton />,
    ssr: true // Important data should be SSR'd
  }
)

export default function CustomersPage({ initialCustomers }: Props) {
  const [showChart, setShowChart] = useState(false)
  
  return (
    <div className="space-y-6">
      {/* Always load essential content */}
      <CustomersSummary customers={initialCustomers} />
      
      {/* Progressive loading for data table */}
      <Suspense fallback={<DataTableSkeleton />}>
        <CustomersDataTable customers={initialCustomers} />
      </Suspense>
      
      {/* Conditional loading for heavy components */}
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <CustomersChart />
        </Suspense>
      )}
      
      <Button onClick={() => setShowChart(true)}>
        Show Analytics Chart
      </Button>
    </div>
  )
}
```

### Tree Shaking and Dead Code Elimination

#### Optimized Imports
```typescript
// ❌ BAD - Imports entire library
import * as utils from 'lodash'
import { Button, Input, Select, Dialog } from '@/components/ui'

// ✅ GOOD - Import only what you need
import { debounce } from 'lodash/debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ✅ GOOD - Use barrel exports carefully
export { Button } from './button'
export { Input } from './input'
// Don't export everything - be selective

// Component-specific optimization
export function CustomerForm() {
  // ❌ BAD - Heavy date library import
  // import moment from 'moment'
  
  // ✅ GOOD - Lightweight alternative
  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat('en-US').format(date)
  
  return (
    <form>
      {/* Component content */}
    </form>
  )
}
```

#### Bundle Analysis and Monitoring
```typescript
// Bundle analyzer configuration
// package.json scripts
{
  "analyze": "ANALYZE=true next build",
  "bundle-size": "bundlesize",
  "bundle-watch": "bundlesize --watch"
}

// bundlesize.config.js
module.exports = [
  {
    "path": ".next/static/chunks/pages/_app.js",
    "maxSize": "170KB",
    "compression": "gzip"
  },
  {
    "path": ".next/static/chunks/pages/customers.js",
    "maxSize": "50KB",
    "compression": "gzip"
  },
  {
    "path": ".next/static/chunks/framework.js",
    "maxSize": "100KB",
    "compression": "gzip"
  }
]
```

## Caching Strategy

### Multi-Layer Cache Architecture

#### L1: Memory Cache (React State)
```typescript
// React state with intelligent caching
export function useCustomerCache() {
  const [customers, setCustomers] = useState<Map<string, Customer>>(new Map())
  const [lastFetch, setLastFetch] = useState<number>(0)
  
  const getCachedCustomer = useCallback((id: string): Customer | null => {
    return customers.get(id) || null
  }, [customers])
  
  const setCachedCustomer = useCallback((customer: Customer) => {
    setCustomers(prev => new Map(prev.set(customer.id, customer)))
  }, [])
  
  const isCacheValid = useCallback((maxAge = 5 * 60 * 1000) => {
    return Date.now() - lastFetch < maxAge
  }, [lastFetch])
  
  return {
    customers: Array.from(customers.values()),
    getCachedCustomer,
    setCachedCustomer,
    isCacheValid,
    invalidateCache: () => {
      setCustomers(new Map())
      setLastFetch(0)
    }
  }
}
```

#### L2: Browser Cache (Local/Session Storage)
```typescript
// Browser storage cache with versioning
export class BrowserCache {
  private static readonly VERSION = '1.0'
  private static readonly PREFIX = 'thorbis_cache'
  
  static set<T>(key: string, data: T, ttl?: number): void {
    const item = {
      version: this.VERSION,
      data,
      timestamp: Date.now(),
      ttl: ttl || 0
    }
    
    try {
      localStorage.setItem(
        `${this.PREFIX}_${key}`,
        JSON.stringify(item)
      )
    } catch (error) {
      // Fallback to memory cache if storage is full
      console.warn('localStorage full, falling back to memory cache')
      this.memoryCache.set(key, item)
    }
  }
  
  static get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(`${this.PREFIX}_${key}`)
      if (!itemStr) return null
      
      const item = JSON.parse(itemStr)
      
      // Check version compatibility
      if (item.version !== this.VERSION) {
        this.delete(key)
        return null
      }
      
      // Check TTL
      if (item.ttl > 0 && Date.now() - item.timestamp > item.ttl) {
        this.delete(key)
        return null
      }
      
      return item.data
    } catch {
      return null
    }
  }
  
  private static memoryCache = new Map()
}
```

#### L3: Service Worker Cache (Background Sync)
```typescript
// service-worker.js - Intelligent caching
const CACHE_NAME = 'thorbis-nextfaster-v1'
const STATIC_CACHE = 'thorbis-static-v1'
const API_CACHE = 'thorbis-api-v1'

// Cache strategies by resource type
const CACHE_STRATEGIES = {
  static: 'cache-first',    // CSS, JS, images
  api: 'stale-while-revalidate',  // API responses
  pages: 'network-first',   // HTML pages
  offline: 'cache-only'     // Offline fallbacks
}

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // API requests - stale-while-revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
  }
  
  // Static assets - cache-first
  else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request))
  }
  
  // Pages - network-first with offline fallback
  else {
    event.respondWith(handlePageRequest(request))
  }
})

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE)
  
  // Try to get from cache first (stale)
  const cachedResponse = await cache.match(request)
  
  // Fetch fresh data in parallel
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      // Update cache with fresh data
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => {
    // Return cached version on network failure
    return cachedResponse
  })
  
  // Return cached data immediately if available
  return cachedResponse || fetchPromise
}
```

### Database Query Optimization

#### Intelligent Query Caching
```typescript
// Query result caching with invalidation
export class QueryCache {
  private cache = new Map<string, CachedQuery>()
  private invalidationRules = new Map<string, string[]>()
  
  constructor() {
    this.setupInvalidationRules()
  }
  
  private setupInvalidationRules() {
    // Define what queries should be invalidated when data changes
    this.invalidationRules.set('customers:create', [
      'customers:list',
      'customers:count',
      'dashboard:summary'
    ])
    
    this.invalidationRules.set('work-orders:update', [
      'work-orders:list',
      'work-orders:by-customer',
      'dashboard:metrics'
    ])
  }
  
  async executeQuery<T>(
    key: string,
    query: () => Promise<T>,
    ttl = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    const cached = this.cache.get(key)
    
    // Return cached result if valid
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T
    }
    
    // Execute query and cache result
    const data = await query()
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    
    return data
  }
  
  invalidate(mutation: string) {
    const keysToInvalidate = this.invalidationRules.get(mutation) || []
    
    keysToInvalidate.forEach(key => {
      this.cache.delete(key)
    })
    
    // Notify other components of cache invalidation
    this.broadcastInvalidation(keysToInvalidate)
  }
  
  private broadcastInvalidation(keys: string[]) {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('cache-invalidation')
      channel.postMessage({ type: 'invalidate', keys })
    }
  }
}
```

#### Database Connection Optimization
```sql
-- PostgreSQL optimizations for NextFaster
-- Connection pooling configuration
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET random_page_cost = 1.1;

-- Query performance optimization
-- Create indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_customers_business_created 
ON customers (business_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_work_orders_status_scheduled 
ON work_orders (business_id, status, scheduled_at) 
WHERE status IN ('scheduled', 'in_progress');

-- Partial indexes for better performance
CREATE INDEX CONCURRENTLY idx_active_customers 
ON customers (business_id, name) 
WHERE deleted_at IS NULL;

-- Enable query optimization
ALTER SYSTEM SET enable_seqscan = off;
ALTER SYSTEM SET enable_bitmapscan = on;
ALTER SYSTEM SET enable_hashjoin = on;

SELECT pg_reload_conf();
```

## Image and Asset Optimization

### Next.js Image Optimization

#### Advanced Image Component Usage
```typescript
// Optimized image component with NextFaster compliance
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  className?: string
}

export function OptimizedImage({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  className = ""
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton while loading */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ aspectRatio: `${width}/${height}` }}
        />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
        // Performance optimizations
        quality={85} // Good quality vs size balance
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      
      {/* Error fallback */}
      {error && (
        <div className="flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  )
}
```

#### Image Preloading Strategy
```typescript
// Intelligent image preloading
export class ImagePreloader {
  private preloadedImages = new Set<string>()
  private preloadQueue: string[] = []
  private isProcessing = false
  
  preloadImage(src: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    if (this.preloadedImages.has(src)) return
    
    if (priority === 'high') {
      this.preloadQueue.unshift(src)
    } else {
      this.preloadQueue.push(src)
    }
    
    this.processQueue()
  }
  
  private async processQueue() {
    if (this.isProcessing || this.preloadQueue.length === 0) return
    
    this.isProcessing = true
    
    while (this.preloadQueue.length > 0) {
      const src = this.preloadQueue.shift()!
      
      try {
        await this.loadImage(src)
        this.preloadedImages.add(src)
      } catch (error) {
        console.warn(`Failed to preload image: ${src}`)
      }
      
      // Don't overwhelm the browser
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    this.isProcessing = false
  }
  
  private loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }
}

// Usage with customer avatars
export function CustomerList({ customers }: { customers: Customer[] }) {
  const imagePreloader = useMemo(() => new ImagePreloader(), [])
  
  useEffect(() => {
    // Preload customer avatars
    customers.slice(0, 10).forEach(customer => {
      if (customer.avatar) {
        imagePreloader.preloadImage(customer.avatar, 'high')
      }
    })
    
    // Preload remaining avatars with lower priority
    customers.slice(10).forEach(customer => {
      if (customer.avatar) {
        imagePreloader.preloadImage(customer.avatar, 'low')
      }
    })
  }, [customers, imagePreloader])
  
  return (
    <div className="grid gap-4">
      {customers.map(customer => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  )
}
```

### Static Asset Optimization

#### Webpack Asset Optimization
```javascript
// next.config.js - Asset optimization
const nextConfig = {
  images: {
    // Enable image optimization for external domains
    domains: ['images.unsplash.com', 'avatar.githubusercontent.com'],
    
    // Image formats in order of preference
    formats: ['image/avif', 'image/webp'],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // Image sizes for different use cases
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Minimum cache TTL
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Compress static assets
  compress: true,
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize assets in production
    if (!dev && !isServer) {
      // Optimize SVGs
      config.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      })
      
      // Optimize fonts
      config.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/fonts/',
            outputPath: 'static/fonts/',
          },
        },
      })
    }
    
    return config
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

## Database Performance

### Query Optimization

#### Efficient Data Fetching Patterns
```typescript
// Optimized data fetching with proper joins and indexing
export class CustomerService {
  // ❌ N+1 Query Problem (AVOID)
  static async getCustomersWithOrdersOld() {
    const customers = await db.customers.findMany()
    
    const customersWithOrders = await Promise.all(
      customers.map(async customer => {
        const orders = await db.workOrders.findMany({
          where: { customerId: customer.id }
        })
        return { ...customer, orders }
      })
    )
    
    return customersWithOrders
  }
  
  // ✅ Efficient Single Query (GOOD)
  static async getCustomersWithOrders() {
    return await db.customers.findMany({
      include: {
        workOrders: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Only recent orders
        },
        _count: {
          select: {
            workOrders: true // Total count without fetching all
          }
        }
      },
      orderBy: { lastContactAt: 'desc' }
    })
  }
  
  // Pagination with cursor-based approach for large datasets
  static async getPaginatedCustomers(
    cursor?: string,
    limit = 20
  ) {
    return await db.customers.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        // Only select needed fields
        id: true,
        name: true,
        email: true,
        phone: true,
        lastContactAt: true,
        _count: {
          select: { workOrders: true }
        }
      }
    })
  }
}
```

#### Database Indexing Strategy
```sql
-- Performance indexes for NextFaster compliance
-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_customers_business_search 
ON customers USING GIN (
  business_id, 
  to_tsvector('english', name || ' ' || email)
);

-- Covering indexes to avoid table lookups
CREATE INDEX CONCURRENTLY idx_work_orders_summary 
ON work_orders (business_id, status, scheduled_at) 
INCLUDE (customer_id, service_type, priority);

-- Partial indexes for filtered queries
CREATE INDEX CONCURRENTLY idx_active_work_orders 
ON work_orders (business_id, scheduled_at)
WHERE status IN ('scheduled', 'in_progress')
  AND deleted_at IS NULL;

-- Expression indexes for computed queries
CREATE INDEX CONCURRENTLY idx_customers_full_name 
ON customers (business_id, (first_name || ' ' || last_name));

-- Analyze index usage and performance
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE idx_scan > 0
ORDER BY idx_scan DESC;

-- Monitor slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  stddev_time,
  min_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100 -- Queries taking more than 100ms
ORDER BY mean_time DESC
LIMIT 20;
```

### Connection Pool Optimization

#### Supabase Connection Configuration
```typescript
// Optimized database connection for NextFaster
import { createClient } from '@supabase/supabase-js'

export const createOptimizedSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: 'public'
      },
      
      // Connection pooling configuration
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false // Avoid unnecessary URL parsing
      },
      
      // Real-time configuration
      realtime: {
        params: {
          eventsPerSecond: 10 // Limit real-time events
        }
      },
      
      // Global fetch configuration
      global: {
        fetch: (url, options = {}) => {
          // Add request timeout for NextFaster compliance
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout
          
          return fetch(url, {
            ...options,
            signal: controller.signal
          }).finally(() => clearTimeout(timeoutId))
        }
      }
    }
  )
}

// Connection pool management
class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool
  private connections = new Map<string, any>()
  private maxConnections = 20
  private activeConnections = 0
  
  static getInstance(): DatabaseConnectionPool {
    if (!this.instance) {
      this.instance = new DatabaseConnectionPool()
    }
    return this.instance
  }
  
  async getConnection(tenantId: string) {
    const key = `tenant_${tenantId}`
    
    if (this.connections.has(key)) {
      return this.connections.get(key)
    }
    
    if (this.activeConnections >= this.maxConnections) {
      throw new Error('Connection pool exhausted')
    }
    
    const connection = createOptimizedSupabaseClient()
    this.connections.set(key, connection)
    this.activeConnections++
    
    return connection
  }
  
  releaseConnection(tenantId: string) {
    const key = `tenant_${tenantId}`
    
    if (this.connections.has(key)) {
      // In a real implementation, you'd properly close the connection
      this.connections.delete(key)
      this.activeConnections--
    }
  }
}
```

## Performance Monitoring and Analysis

### Real-Time Performance Tracking

#### Custom Performance API
```typescript
// Performance monitoring service
export class PerformanceTracker {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []
  
  constructor() {
    this.initializeObservers()
    this.startMetricsCollection()
  }
  
  private initializeObservers() {
    // Web Vitals observer
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.recordMetric({
            name: entry.entryType,
            value: entry.startTime,
            timestamp: Date.now(),
            route: window.location.pathname,
            details: entry
          })
        }
      })
      
      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
      this.observers.push(observer)
    }
    
    // Resource timing observer
    const resourceObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          this.recordResourceMetric(entry as PerformanceResourceTiming)
        }
      }
    })
    
    resourceObserver.observe({ entryTypes: ['resource'] })
    this.observers.push(resourceObserver)
  }
  
  private recordResourceMetric(entry: PerformanceResourceTiming) {
    const size = entry.transferSize || entry.encodedBodySize
    const duration = entry.responseEnd - entry.requestStart
    
    // Check against NextFaster budgets
    if (entry.name.includes('.js') && size > NEXTFASTER_TARGETS.javascriptBudget) {
      this.reportBudgetViolation('JavaScript', size, NEXTFASTER_TARGETS.javascriptBudget)
    }
    
    if (entry.name.includes('.css') && size > NEXTFASTER_TARGETS.cssBudget) {
      this.reportBudgetViolation('CSS', size, NEXTFASTER_TARGETS.cssBudget)
    }
    
    this.recordMetric({
      name: 'resource-timing',
      value: duration,
      timestamp: Date.now(),
      route: window.location.pathname,
      details: {
        url: entry.name,
        size,
        duration,
        type: entry.initiatorType
      }
    })
  }
  
  // Custom timing measurements
  startMeasure(name: string) {
    performance.mark(`${name}-start`)
  }
  
  endMeasure(name: string) {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measure = performance.getEntriesByName(name, 'measure')[0]
    this.recordMetric({
      name: `custom-${name}`,
      value: measure.duration,
      timestamp: Date.now(),
      route: window.location.pathname
    })
  }
  
  private reportBudgetViolation(
    type: string, 
    actual: number, 
    budget: number
  ) {
    console.warn(`🚨 ${type} budget exceeded:`, {
      actual: `${Math.round(actual / 1024)}KB`,
      budget: `${Math.round(budget / 1024)}KB`,
      excess: `${Math.round((actual - budget) / 1024)}KB`,
      route: window.location.pathname
    })
    
    // Report to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring({
        type: 'budget-violation',
        category: type,
        actual,
        budget,
        route: window.location.pathname,
        timestamp: Date.now()
      })
    }
  }
}

// Usage in application
export function usePerformanceTracking() {
  const tracker = useMemo(() => new PerformanceTracker(), [])
  
  const measureAsync = useCallback(async <T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    tracker.startMeasure(name)
    try {
      const result = await fn()
      return result
    } finally {
      tracker.endMeasure(name)
    }
  }, [tracker])
  
  return { measureAsync }
}
```

### Performance Budgets and Alerts

#### Automated Performance Testing
```typescript
// Performance testing in CI/CD
import { test, expect } from '@playwright/test'

test.describe('NextFaster Performance Tests', () => {
  test('should meet performance budgets on customer page', async ({ page }) => {
    // Navigate to page
    await page.goto('/customers')
    
    // Measure Core Web Vitals
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const metrics = {}
          
          entries.forEach(entry => {
            metrics[entry.name] = entry.value
          })
          
          resolve(metrics)
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000)
      })
    })
    
    // Check LCP budget
    if (performanceMetrics['largest-contentful-paint']) {
      expect(performanceMetrics['largest-contentful-paint']).toBeLessThan(
        NEXTFASTER_TARGETS.largestContentfulPaint
      )
    }
    
    // Check bundle size
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      return resources
        .filter(r => r.name.includes('.js'))
        .reduce((total, resource) => total + (resource.transferSize || 0), 0)
    })
    
    expect(resourceSizes).toBeLessThan(NEXTFASTER_TARGETS.javascriptBudget)
  })
  
  test('should handle concurrent users without performance degradation', async ({ 
    browser 
  }) => {
    // Simulate multiple concurrent users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ])
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    )
    
    // Measure performance under load
    const startTime = Date.now()
    
    await Promise.all(
      pages.map(page => page.goto('/customers'))
    )
    
    const loadTime = Date.now() - startTime
    
    // All pages should load within acceptable time even under load
    expect(loadTime).toBeLessThan(2000) // 2 seconds for 5 concurrent users
    
    // Cleanup
    await Promise.all(contexts.map(context => context.close()))
  })
})
```

## Next Steps

After implementing performance optimization:

1. **[Deployment Guide](./08-deployment-guide.md)**: Learn production deployment strategies and optimization
2. **Performance Monitoring**: Set up continuous performance monitoring and alerts
3. **Advanced Optimization**: Implement service workers, edge computing, and CDN strategies
4. **Load Testing**: Conduct comprehensive performance testing under various load conditions

## Performance Resources

### Tools and Services
- **Bundle Analyzers**: webpack-bundle-analyzer, Next.js Bundle Analyzer
- **Performance Testing**: Lighthouse CI, WebPageTest, Artillery
- **Monitoring**: New Relic, DataDog, Sentry Performance
- **CDN Services**: Vercel Edge Network, Cloudflare, AWS CloudFront

### Optimization References
- **NextFaster Doctrine**: Internal performance standards and guidelines
- **Core Web Vitals**: Google's performance metrics and optimization guide
- **React Performance**: Advanced React optimization techniques
- **Database Optimization**: PostgreSQL performance tuning guide

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Testing Strategy](./06-testing-strategy.md) | Next: [Deployment Guide](./08-deployment-guide.md)*