# Performance Optimization Quick Reference

> **NextFaster compliance checklist and optimization strategies for the Thorbis Business OS**
>
> **Core Web Vitals targets**: LCP ≤ 1.8s, CLS ≤ 0.1, FID ≤ 100ms  
> **Bundle budget**: 170KB JavaScript per route

## 🎯 NextFaster Performance Doctrine

The Thorbis Business OS follows the NextFaster performance philosophy:

- **Sub-300ms navigation** with aggressive prefetching
- **170KB JavaScript budget** per route
- **Server-first rendering** minimizing client hydration
- **No loading spinners** using stale-while-revalidate patterns
- **Progressive enhancement** ensuring core functionality without JavaScript

## ✅ Performance Compliance Checklist

### Pre-Development Checklist

- [ ] **Bundle analyzer setup**: `pnpm bundle:analyze` configured
- [ ] **Performance budget enforced**: CI fails if exceeded
- [ ] **Core Web Vitals monitoring**: Real User Monitoring (RUM) active
- [ ] **Prefetch strategy defined**: Link hover prefetching implemented

### Development Checklist

- [ ] **Server Components first**: Use RSC unless client interaction required
- [ ] **Dynamic imports**: Code split heavy components
- [ ] **Image optimization**: Use Next.js Image with proper sizing
- [ ] **Font optimization**: Subset fonts with swap strategy
- [ ] **No blocking resources**: All CSS and JS are non-blocking

### Pre-Deployment Checklist

- [ ] **Bundle analysis passed**: All routes under 170KB budget
- [ ] **Lighthouse audit**: Score ≥ 90 on all metrics
- [ ] **Real device testing**: Tested on mid-range mobile devices
- [ ] **Network throttling**: Tested on slow 3G connections

## 🚀 Quick Performance Wins

### 1. Image Optimization (Instant 20-50% improvement)

```tsx
// ❌ Unoptimized
<img src="/hero-image.jpg" alt="Hero" />

// ✅ Optimized with Next.js Image
import Image from 'next/image'

<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={800}
  height={400}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAhEQACAQIHAQAAAAAAAAAAAAABAgMABAUGIWGRkaGx/9oADAMBAAIRAxEAPwCdABfEUAUAXxFAFAFAFAF/2Q=="
  formats={['avif', 'webp']}
/>
```

### 2. Font Optimization (Instant 10-30% improvement)

```tsx
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

// Font loading in layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
```

### 3. Bundle Splitting (Instant 15-40% improvement)

```tsx
// ❌ Import entire component library
import { Button, Card, Table, Modal, Chart } from '@thorbis/ui'

// ✅ Import only needed components
import { Button } from '@thorbis/ui/components/button'
import { Card } from '@thorbis/ui/components/card'

// Dynamic imports for heavy components
const Chart = dynamic(() => import('@thorbis/ui/components/chart'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
})
```

### 4. Server Component Optimization (Instant 25-60% improvement)

```tsx
// ✅ Server Component - no JavaScript sent to client
async function CustomersList() {
  const customers = await getCustomers()
  
  return (
    <div className="space-y-4">
      {customers.map(customer => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  )
}

// ✅ Client Component only when needed
'use client'

function CustomerCard({ customer }: { customer: Customer }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <Card onClick={() => setExpanded(!expanded)}>
      {/* Interactive content */}
    </Card>
  )
}
```

## 📊 Bundle Analysis and Monitoring

### Setup Bundle Analyzer

**scripts/bundle-analysis.js**:
```javascript
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const BUNDLE_SIZE_LIMIT = 170 * 1024 // 170KB in bytes

async function analyzeBundles() {
  const apps = ['hs', 'rest', 'auto', 'ret', 'site']
  const results = []

  for (const app of apps) {
    console.log(`📦 Analyzing bundle for @thorbis/${app}...`)
    
    try {
      // Build the app
      execSync(`pnpm build --filter=@thorbis/${app}`, { stdio: 'inherit' })
      
      // Analyze bundle
      const buildDir = path.join(__dirname, '..', 'apps', app, '.next')
      const analysis = await analyzeBuildDir(buildDir)
      
      results.push({
        app,
        ...analysis,
        withinBudget: analysis.totalSize <= BUNDLE_SIZE_LIMIT
      })
      
    } catch (error) {
      console.error(`❌ Failed to analyze ${app}:`, error.message)
      results.push({
        app,
        error: error.message,
        withinBudget: false
      })
    }
  }

  // Generate report
  console.log('\n📊 Bundle Analysis Report:')
  console.log('=' .repeat(60))
  
  results.forEach(({ app, totalSize, routes, withinBudget, error }) => {
    if (error) {
      console.log(`❌ ${app}: Error - ${error}`)
      return
    }

    const status = withinBudget ? '✅' : '❌'
    const sizeKB = Math.round(totalSize / 1024)
    const budgetKB = Math.round(BUNDLE_SIZE_LIMIT / 1024)
    
    console.log(`${status} ${app}: ${sizeKB}KB / ${budgetKB}KB (${routes} routes)`)
    
    if (!withinBudget) {
      process.exit(1) // Fail CI if over budget
    }
  })
}

async function analyzeBuildDir(buildDir) {
  // Implementation for analyzing .next build directory
  // Returns { totalSize, routes, largestChunks }
  const manifestPath = path.join(buildDir, 'BUILD_ID')
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Build directory not found')
  }
  
  // Analyze static chunks, pages, and app directory
  const staticDir = path.join(buildDir, 'static', 'chunks')
  const appDir = path.join(buildDir, 'server', 'app')
  
  let totalSize = 0
  let routes = 0
  
  if (fs.existsSync(staticDir)) {
    const files = fs.readdirSync(staticDir, { recursive: true })
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(staticDir, file)
        totalSize += fs.statSync(filePath).size
      }
    })
  }
  
  if (fs.existsSync(appDir)) {
    const files = fs.readdirSync(appDir, { recursive: true })
    routes = files.filter(file => file === 'page.js').length
  }
  
  return { totalSize, routes }
}

if (require.main === module) {
  analyzeBundles().catch(console.error)
}

module.exports = { analyzeBundles }
```

### Run Bundle Analysis

```bash
# Analyze all apps
pnpm bundle:analyze

# Enforce budget in CI
pnpm bundle:check  # Fails if over budget

# Analyze specific app
pnpm bundle:analyze --filter=@thorbis/hs
```

### Visual Bundle Analysis

```bash
# Install webpack-bundle-analyzer
pnpm add -D @next/bundle-analyzer

# Enable in next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // Your Next.js config
})

# Generate visual analysis
ANALYZE=true pnpm build
```

## ⚡ Performance Optimization Techniques

### 1. Code Splitting Strategies

```tsx
// Route-level splitting (automatic with App Router)
// apps/hs/src/app/work-orders/page.tsx
export default function WorkOrdersPage() {
  return <WorkOrdersList />
}

// Component-level splitting
const HeavyChart = dynamic(() => import('./heavy-chart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
})

// Conditional splitting
const AdminPanel = dynamic(() => import('./admin-panel'), {
  ssr: false,
})

function Dashboard({ user }: { user: User }) {
  return (
    <div>
      <MainContent />
      {user.role === 'admin' && <AdminPanel />}
    </div>
  )
}

// Library splitting
const ChartLibrary = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  { ssr: false }
)
```

### 2. Image Optimization Patterns

```tsx
// Responsive images with proper sizing
<Image
  src="/dashboard-screenshot.jpg"
  alt="Dashboard overview"
  width={1200}
  height={800}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={false} // Only for above-the-fold images
/>

// Placeholder patterns
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

<Image
  src="/hero.jpg"
  placeholder="blur"
  blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
  width={700}
  height={475}
/>

// Avatar optimization
function Avatar({ src, name, size = 40 }: AvatarProps) {
  return (
    <Image
      src={src || `/api/avatar/${encodeURIComponent(name)}`}
      alt={name}
      width={size}
      height={size}
      className="rounded-full"
      unoptimized={!src} // Skip optimization for generated avatars
    />
  )
}
```

### 3. Data Fetching Optimization

```tsx
// Server Component with parallel data fetching
async function DashboardPage() {
  const [customers, orders, revenue] = await Promise.all([
    getCustomers(),
    getRecentOrders(),
    getRevenueData(),
  ])

  return (
    <div className="space-y-6">
      <RevenueChart data={revenue} />
      <Suspense fallback={<TableSkeleton />}>
        <OrdersTable orders={orders} />
      </Suspense>
      <CustomersList customers={customers} />
    </div>
  )
}

// Client Component with SWR optimization
'use client'

import useSWR from 'swr'

function LiveMetrics() {
  const { data: metrics } = useSWR(
    '/api/metrics',
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds
    }
  )

  return <MetricsDisplay metrics={metrics} />
}

// Optimistic updates
function useOptimisticUpdate<T>(
  key: string,
  updateFn: (data: T) => Promise<T>
) {
  const { data, mutate } = useSWR<T>(key)

  const optimisticUpdate = async (updatedData: T) => {
    // Optimistically update the UI
    mutate(updatedData, false)

    try {
      // Perform the actual update
      const result = await updateFn(updatedData)
      
      // Revalidate with the real result
      mutate(result, true)
      
      return result
    } catch (error) {
      // Revert on error
      mutate()
      throw error
    }
  }

  return { data, optimisticUpdate }
}
```

### 4. CSS and Styling Optimization

```tsx
// Tailwind CSS optimization
// tailwind.config.ts
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Only include used design tokens
      colors: {
        primary: '#1C8BFF',
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          // ... only used shades
        },
      },
    },
  },
  plugins: [
    // Only include used plugins
    require('@tailwindcss/forms'),
  ],
}

// CSS-in-JS optimization (avoid if possible)
import { styled } from '@thorbis/design'

// ❌ Runtime styled components (adds JS overhead)
const StyledButton = styled.button`
  background: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing[4]};
`

// ✅ Static Tailwind classes
<button className="bg-primary px-4 py-2 rounded-md hover:bg-primary/90">
  Submit
</button>

// Critical CSS inlining for above-the-fold content
// next.config.ts
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
}
```

### 5. JavaScript Optimization

```tsx
// Tree shaking optimization
// ❌ Imports entire library
import * as _ from 'lodash'

// ✅ Import specific functions
import { debounce, throttle } from 'lodash-es'

// Or better, use native alternatives
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(null, args), delay)
  }
}

// Memoization for expensive operations
import { memo, useMemo, useCallback } from 'react'

const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
  onUpdate,
}: {
  data: ComplexData[]
  onUpdate: (id: string, changes: Partial<ComplexData>) => void
}) {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computedValue: expensiveCalculation(item),
    }))
  }, [data])

  const handleUpdate = useCallback((id: string, changes: Partial<ComplexData>) => {
    onUpdate(id, changes)
  }, [onUpdate])

  return (
    <div>
      {processedData.map(item => (
        <Item
          key={item.id}
          data={item}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  )
})

// Virtualization for large lists
import { FixedSizeList as List } from 'react-window'

function LargeCustomerList({ customers }: { customers: Customer[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <CustomerRow customer={customers[index]} />
    </div>
  )

  return (
    <List
      height={600}
      itemCount={customers.length}
      itemSize={80}
      overscanCount={5}
    >
      {Row}
    </List>
  )
}
```

## 🔍 Performance Monitoring

### Core Web Vitals Tracking

**src/lib/web-vitals.ts**:
```tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  const body = JSON.stringify(metric)
  
  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body)
  } else {
    fetch('/api/analytics', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    })
  }
}

export function reportWebVitals() {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}

// Custom metrics
export function measureCustomMetric(name: string, value: number) {
  sendToAnalytics({
    name,
    value,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  })
}
```

**src/app/layout.tsx**:
```tsx
'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/web-vitals'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    reportWebVitals()
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

### Performance API Usage

```tsx
// Measure component render time
function useRenderTime(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const renderTime = performance.now() - startTime
      if (renderTime > 16) { // > 1 frame at 60fps
        console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`)
        
        // Report to analytics if significantly slow
        if (renderTime > 100) {
          measureCustomMetric(`render_time_${componentName}`, renderTime)
        }
      }
    }
  })
}

// Navigation timing
function trackNavigationPerformance() {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
      load: navigation.loadEventEnd - navigation.loadEventStart,
    }
    
    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        measureCustomMetric(`navigation_${name}`, value)
      }
    })
  }
}

// Resource loading monitoring
function trackResourcePerformance() {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resource = entry as PerformanceResourceTiming
        
        // Track slow resources
        if (resource.duration > 1000) { // > 1 second
          measureCustomMetric('slow_resource', resource.duration)
          console.warn(`Slow resource: ${resource.name} took ${resource.duration}ms`)
        }
      }
    })
  })
  
  observer.observe({ entryTypes: ['resource'] })
}
```

## 🛠️ Development Tools and Commands

### Performance Testing Commands

```bash
# Bundle analysis
pnpm bundle:analyze                    # Analyze all apps
pnpm bundle:check                     # Enforce budget (fails CI)

# Lighthouse CI
pnpm add -D @lhci/cli
pnpm lhci autorun                     # Run Lighthouse CI

# Performance testing
pnpm test:perf                        # Custom performance tests
pnpm test:e2e --headed               # Visual performance testing

# Production performance audit
NODE_ENV=production pnpm build
pnpm start
# Then run Lighthouse on localhost
```

### VS Code Performance Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "streetsidesoftware.code-spell-checker",
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright",
    "bundlejs.bundle-size-analyzer"
  ]
}
```

### Chrome DevTools Workflow

1. **Performance Tab**: Record and analyze runtime performance
2. **Network Tab**: Monitor resource loading and sizes
3. **Lighthouse Tab**: Run performance audits
4. **Coverage Tab**: Find unused CSS and JavaScript
5. **Memory Tab**: Check for memory leaks

## 📈 Performance Optimization Priorities

### High Impact (Do First)

1. **Image optimization**: Use Next.js Image component
2. **Bundle splitting**: Dynamic imports for heavy components
3. **Server Components**: Use RSC wherever possible
4. **Font optimization**: Subset and preload fonts
5. **Remove unused dependencies**: Audit and remove unused packages

### Medium Impact (Do Second)

1. **CSS optimization**: Purge unused Tailwind classes
2. **Caching strategy**: Implement proper HTTP caching
3. **Database optimization**: Index queries and use connection pooling
4. **Third-party scripts**: Defer non-critical scripts
5. **Service Worker**: Implement for offline functionality

### Low Impact (Do Last)

1. **Micro-optimizations**: Minor algorithm improvements
2. **Advanced bundling**: Webpack optimization tweaks
3. **Preloading**: Link prefetching for critical resources
4. **Tree shaking**: Fine-tune library imports
5. **Compression**: Optimize asset compression

## 🚨 Performance Anti-Patterns to Avoid

### Client-Side Rendering Overuse

```tsx
// ❌ Unnecessary client component
'use client'

function CustomerList() {
  const [customers] = useState(initialCustomers)
  
  return (
    <div>
      {customers.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  )
}

// ✅ Server component for static content
function CustomerList({ customers }: { customers: Customer[] }) {
  return (
    <div>
      {customers.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  )
}
```

### Large Bundle Imports

```tsx
// ❌ Importing entire libraries
import moment from 'moment'
import * as _ from 'lodash'
import { Button, Input, Card, Modal, Chart, Table } from '@thorbis/ui'

// ✅ Specific imports and alternatives
import { format } from 'date-fns'
import { debounce } from 'lodash-es'
import { Button } from '@thorbis/ui/components/button'
import { Input } from '@thorbis/ui/components/input'
```

### Inefficient Re-renders

```tsx
// ❌ Creating objects in render
function Component({ items }) {
  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          data={item}
          onClick={() => handleClick(item)} // New function each render
          style={{ marginTop: 10 }} // New object each render
        />
      ))}
    </div>
  )
}

// ✅ Stable references
const itemStyle = { marginTop: 10 }

function Component({ items }) {
  const handleItemClick = useCallback((item) => {
    handleClick(item)
  }, [])

  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          data={item}
          onClick={handleItemClick}
          style={itemStyle}
        />
      ))}
    </div>
  )
}
```

## 📊 Performance Metrics Dashboard

Create a performance dashboard to track metrics over time:

**apps/hs/src/app/admin/performance/page.tsx**:
```tsx
import { Card } from '@thorbis/ui/components/card'
import { MetricCard } from '@thorbis/ui/components/metric-card'
import { PerformanceChart } from '@/components/admin/performance-chart'

export default async function PerformancePage() {
  const metrics = await getPerformanceMetrics()
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Performance Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="LCP (Largest Contentful Paint)"
          value={`${metrics.lcp}ms`}
          change={{
            value: `${metrics.lcpChange}%`,
            type: metrics.lcpChange < 0 ? 'decrease' : 'increase',
            period: 'vs last week'
          }}
        />
        
        <MetricCard
          title="FID (First Input Delay)"
          value={`${metrics.fid}ms`}
          change={{
            value: `${metrics.fidChange}%`,
            type: metrics.fidChange < 0 ? 'decrease' : 'increase',
            period: 'vs last week'
          }}
        />
        
        <MetricCard
          title="CLS (Cumulative Layout Shift)"
          value={metrics.cls.toFixed(3)}
          change={{
            value: `${metrics.clsChange}%`,
            type: metrics.clsChange < 0 ? 'decrease' : 'increase',
            period: 'vs last week'
          }}
        />
        
        <MetricCard
          title="Bundle Size"
          value={`${Math.round(metrics.bundleSize / 1024)}KB`}
          change={{
            value: `${metrics.bundleSizeChange}%`,
            type: metrics.bundleSizeChange < 0 ? 'decrease' : 'increase',
            period: 'vs last deploy'
          }}
        />
      </div>
      
      <Card>
        <PerformanceChart data={metrics.timeSeries} />
      </Card>
    </div>
  )
}
```

## 🎯 Industry-Specific Optimizations

### Home Services App

```tsx
// Optimize technician dispatch maps
const MapComponent = dynamic(
  () => import('@/components/dispatch-map'),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
)

// Lazy load work order forms
const WorkOrderForm = dynamic(
  () => import('@/components/work-order-form'),
  { ssr: false }
)
```

### Restaurant App

```tsx
// Optimize POS interface for speed
const POSInterface = memo(function POSInterface({ menu, cart, onUpdate }) {
  const handleItemAdd = useCallback((item) => {
    onUpdate({ type: 'ADD_ITEM', item })
  }, [onUpdate])

  return (
    <div className="grid grid-cols-4 gap-2">
      {menu.map(item => (
        <POSItem
          key={item.id}
          item={item}
          onAdd={handleItemAdd}
        />
      ))}
    </div>
  )
})
```

### Auto Services App

```tsx
// Optimize parts lookup with search debouncing
function usePartsSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Part[]>([])
  
  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (searchQuery.length > 2) {
        const parts = await searchParts(searchQuery)
        setResults(parts)
      }
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  return { query, setQuery, results }
}
```

## 📚 Additional Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Next.js Performance Best Practices](https://nextjs.org/docs/basic-features/built-in-css-support)
- [Chrome DevTools Performance Guide](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance)
- [Bundle Analysis Tools](https://bundlejs.com/)

---

*This guide provides comprehensive performance optimization strategies for the Thorbis Business OS. Regular performance audits and monitoring are essential for maintaining optimal user experience.*