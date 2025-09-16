// Performance optimization utilities for NextFaster compliance
// Target: Sub-300ms navigation, 170KB JS budget, aggressive caching

// Image optimization configuration
export const imageConfig = {
  // Optimal image formats for different use cases
  formats: {
    hero: ['avif', 'webp', 'jpg'] as const,
    thumbnails: ['avif', 'webp'] as const,
    icons: ['svg', 'webp'] as const,
  },
  
  // Responsive image breakpoints aligned with Tailwind
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  // Quality settings for different image types
  quality: {
    hero: 85,
    thumbnails: 75,
    avatars: 80,
    backgrounds: 70,
  },
}

// Bundle optimization configuration
export const bundleConfig = {
  // Maximum bundle sizes (gzipped)
  budgets: {
    initial: 170 * 1024, // 170KB initial bundle
    route: 50 * 1024,    // 50KB per route
    css: 30 * 1024,      // 30KB CSS
  },

  // Critical CSS patterns
  criticalCss: [
    // Core layout styles
    '.min-h-screen',
    '.bg-background',
    '.text-foreground',
    // Navigation styles
    'nav',
    '.sidebar',
    // Typography
    '.font-sans',
    '.text-',
    // Button styles
    '.btn',
    '.button',
  ],
}

// Cache configuration for different resource types
export const cacheConfig = {
  // Static assets - long-term caching
  static: {
    maxAge: 31536000, // 1 year
    immutable: true,
  },
  
  // API responses - stale-while-revalidate
  api: {
    maxAge: 60,       // 1 minute
    staleWhileRevalidate: 300, // 5 minutes
  },
  
  // Dynamic pages - short cache with revalidation
  pages: {
    maxAge: 60,       // 1 minute
    staleWhileRevalidate: 3600, // 1 hour
  },
}

// Performance thresholds and monitoring
export const performanceConfig = {
  // Core Web Vitals targets (2025 standards)
  vitals: {
    lcp: { target: 2500, poor: 4000 },  // Largest Contentful Paint
    inp: { target: 200, poor: 500 },    // Interaction to Next Paint
    cls: { target: 0.1, poor: 0.25 },   // Cumulative Layout Shift
    fcp: { target: 1800, poor: 3000 },  // First Contentful Paint
    ttfb: { target: 800, poor: 1800 },  // Time to First Byte
  },

  // Monitoring configuration
  monitoring: {
    sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    endpoint: '/api/analytics/performance',
    bufferSize: 20, // Number of metrics to buffer before sending
  },
}

// Resource preloading utilities
export function generatePreloadTags(resources: Array<{ href: string; as: string; type?: string }>) {
  return resources.map(resource => ({
    rel: 'preload',
    href: resource.href,
    as: resource.as,
    ...(resource.type && { type: resource.type }),
  }))
}

// Critical resource prefetching for instant navigation
export function prefetchCriticalResources() {
  if (typeof window === 'undefined') return

  const prefetchTargets = [
    // Core application routes
    '/dashboards',
    '/dashboards/settings',
    // Critical API endpoints
    '/api/user',
    '/api/settings',
  ]

  prefetchTargets.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  })
}

// Dynamic import with retry logic for better reliability
export async function dynamicImportWithRetry<T>(
  importFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await importFn()
  } catch (_error) {
    if (retries <= 0) throw error
    
    await new Promise(resolve => setTimeout(resolve, delay))
    return dynamicImportWithRetry(importFn, retries - 1, delay * 2)
  }
}

// Intersection Observer for lazy loading optimization
export function createLazyLoadObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  }

  return new IntersectionObserver(callback, defaultOptions)
}

// Performance measurement utilities
export class PerformanceMeasurement {
  private marks: Map<string, number> = new Map()

  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark('${name}-start')
      this.marks.set(name, performance.now())
    }
  }

  measure(name: string): number {
    if (typeof performance === 'undefined`) return 0

    const startTime = this.marks.get(name)
    if (!startTime) return 0

    const endTime = performance.now()
    const duration = endTime - startTime

    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start', '${name}-end')

    this.marks.delete(name)
    return duration
  }

  clearMeasurements(): void {
    if (typeof performance !== 'undefined') {
      performance.clearMarks()
      performance.clearMeasures()
    }
    this.marks.clear()
  }
}

// Create a global performance measurement instance
export const perf = new PerformanceMeasurement()