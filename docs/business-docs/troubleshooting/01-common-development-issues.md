# Common Development Issues Guide

> **Last Updated**: 2025-01-31  
> **Version**: 1.0.0  
> **Status**: Production Ready

This guide provides comprehensive solutions for common development issues encountered when working with the Thorbis Business OS monorepo.

## Quick Reference

### Emergency Development Commands
```bash
# Emergency cleanup (fixes 80% of build issues)
pnpm clean:cache && pnpm install && pnpm build:packages

# Reset development environment
rm -rf node_modules pnpm-lock.yaml .turbo
pnpm install

# Force rebuild all shared packages
turbo run build --filter='./packages/*' --force

# Check system health
pnpm type-check && pnpm lint
```

### Development Environment Requirements
- **Node.js**: ≥20.0.0 (check with `node --version`)
- **pnpm**: ≥9.15.0 (check with `pnpm --version`)
- **TypeScript**: ^5.7.2 (managed via workspaces)
- **Next.js**: 15.5.2 (React 19 compatible)

---

## 1. Build Failures and Dependency Issues

### Module Not Found Errors

#### Symptoms
```bash
Error: Module '@thorbis/ui' not found
Error: Cannot resolve dependency '@thorbis/design'
Module not found: Can't resolve 'react/jsx-dev-runtime'
```

#### Root Cause Analysis
1. **Check package build status**:
   ```bash
   # Verify shared packages are built
   ls -la packages/ui/dist/
   ls -la packages/design/dist/
   ls -la packages/schemas/dist/
   ```

2. **Verify workspace links**:
   ```bash
   # Check if workspace links are intact
   pnpm list --depth=0
   pnpm list @thorbis/ui @thorbis/design @thorbis/schemas
   ```

3. **Check package.json dependencies**:
   ```bash
   # Verify version alignment
   grep -r "@thorbis/" apps/*/package.json
   ```

#### Step-by-Step Resolution

**Step 1: Rebuild Shared Packages**
```bash
# Clean and rebuild in dependency order
pnpm clean:cache
turbo run build --filter=@thorbis/design
turbo run build --filter=@thorbis/schemas  
turbo run build --filter=@thorbis/ui
```

**Step 2: Verify Package Dependencies**
```bash
# Check each app's package.json has correct versions
cd apps/hs  # or any app
pnpm list @thorbis/ui
# Should show: @thorbis/ui@workspace:* -> packages/ui
```

**Step 3: Reset Workspace if Issues Persist**
```bash
# Nuclear option - complete reset
rm -rf node_modules
rm -rf packages/*/node_modules
rm -rf packages/*/dist
rm -rf apps/*/node_modules
rm -rf apps/*/.next
rm pnpm-lock.yaml
pnpm install
pnpm postinstall
```

#### Prevention Strategies
- Always run `pnpm postinstall` after dependency changes
- Use `turbo run build --filter='./packages/*'` before app development
- Monitor package build outputs in CI/CD pipeline
- Maintain consistent versioning across workspaces

### TypeScript Compilation Errors

#### Symptoms
```bash
Type error: Cannot find module '@thorbis/ui/components'
Property 'className' does not exist on type 'ButtonProps'
Type 'string' is not assignable to type 'never'
```

#### Diagnostic Steps
```bash
# Check TypeScript configuration inheritance
pnpm type-check 2>&1 | head -20

# Verify tsconfig.json paths are correct
cd apps/hs
npx tsc --showConfig | jq '.compilerOptions.paths'

# Check for conflicting type definitions
find . -name "*.d.ts" -not -path "./node_modules/*" | head -10
```

#### Resolution Process

**Step 1: Verify TypeScript Configurations**
```bash
# Check root tsconfig.json
cat tsconfig.json

# Verify app-specific tsconfig extends properly
cd apps/hs && grep -A5 '"extends"' tsconfig.json
# Should show: "extends": "../../tsconfig.json"
```

**Step 2: Rebuild Type Definitions**
```bash
# Generate fresh types from packages
turbo run build --filter='./packages/*' --force
pnpm type-check --verbose
```

**Step 3: Check for Version Mismatches**
```bash
# Verify TypeScript versions are aligned
grep '"typescript"' package.json packages/*/package.json apps/*/package.json
# All should use ^5.7.2
```

**Step 4: Clear TypeScript Cache**
```bash
# Remove TypeScript build info
find . -name "tsconfig.tsbuildinfo" -delete
rm -rf apps/*/.next/types
turbo run type-check --force
```

#### Common TypeScript Fixes

**Missing Module Declarations**:
```typescript
// Add to src/types/modules.d.ts in affected app
declare module '@thorbis/ui/components' {
  export * from '@thorbis/ui'
}
```

**Path Resolution Issues**:
```json
// In app's tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@thorbis/ui": ["../../packages/ui/src"],
      "@thorbis/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
```

### pnpm Workspace Issues

#### Symptoms
```bash
ERR_PNPM_WORKSPACE_PKG_NOT_FOUND
Package "@thorbis/ui" not found in workspace
Peer dependency warnings
```

#### Resolution Steps

**Step 1: Verify Workspace Configuration**
```yaml
# Check pnpm-workspace.yaml
workspaces:
  - 'apps/*'
  - 'packages/*'
```

**Step 2: Fix Package References**
```json
// In app package.json, use workspace protocol
{
  "dependencies": {
    "@thorbis/ui": "workspace:*",
    "@thorbis/design": "workspace:*"
  }
}
```

**Step 3: Resolve Peer Dependencies**
```bash
# Check peer dependency issues
pnpm install --fix-peer-deps

# Or manually install missing peers
pnpm add react@19.1.0 react-dom@19.1.0 -w
```

---

## 2. TypeScript Compilation Errors

### Generic TypeScript Issues

#### Strict Mode Violations

**Symptoms**:
```typescript
Object is possibly 'null' or 'undefined'
Property 'id' does not exist on type 'unknown'
Argument of type 'string | undefined' is not assignable to parameter of type 'string'
```

**Solutions**:
```typescript
// Use optional chaining and nullish coalescing
const userId = user?.id ?? ''
const data = response?.data || []

// Type guards for unknown types
function isValidData(data: unknown): data is { id: string } {
  return typeof data === 'object' && data !== null && 'id' in data
}

// Proper async error handling
try {
  const result = await apiCall()
  return result.data
} catch (error) {
  if (error instanceof Error) {
    throw new AppError(error.message, 'API_ERROR', 500)
  }
  throw new AppError('Unknown error occurred', 'UNKNOWN_ERROR', 500)
}
```

#### Import/Export Issues

**Symptoms**:
```bash
Module '"@thorbis/schemas"' has no exported member 'CustomerSchema'
Cannot find name 'React'
```

**Solutions**:
```typescript
// Use proper import syntax for shared packages
import { CustomerSchema } from '@thorbis/schemas/hs'
import type { Customer } from '@thorbis/schemas/hs'

// Ensure React import in JSX files
import React from 'react'
// or with new JSX transform
import type { FC } from 'react'
```

### Next.js 15 Specific Issues

#### App Router Type Issues

**Symptoms**:
```typescript
Property 'params' does not exist on type 'PageProps'
Type error in async component
```

**Solutions**:
```typescript
// Proper page component typing
interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ params, searchParams }: PageProps) {
  // Async server component
  const data = await fetchData(params.id)
  return <div>{data.title}</div>
}

// Layout component typing
interface LayoutProps {
  children: React.ReactNode
  params: { id: string }
}

export default function Layout({ children, params }: LayoutProps) {
  return <div>{children}</div>
}
```

#### Metadata API Issues

**Solutions**:
```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description'
}

// Dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await fetchData(params.id)
  return {
    title: data.title,
    description: data.description
  }
}
```

---

## 3. Next.js Development Server Problems

### Dev Server Won't Start

#### Symptoms
```bash
Error: Port 3001 is already in use
Cannot resolve module './components'
Error: Failed to load next.config.ts
```

#### Diagnostic Commands
```bash
# Check port usage
lsof -ti:3001 | xargs kill -9  # Kill process on port 3001
netstat -tulpn | grep :3001    # Check what's using the port

# Verify Next.js config syntax
cd apps/hs
npx next info
node -c next.config.ts  # Check syntax
```

#### Resolution Steps

**Step 1: Clear Next.js Cache**
```bash
cd apps/hs
rm -rf .next
rm -rf .next-cache
rm -rf node_modules/.cache
```

**Step 2: Check Configuration Files**
```typescript
// Verify next.config.ts structure
const config = {
  transpilePackages: ['@thorbis/ui', '@thorbis/design', '@thorbis/schemas'],
  experimental: {
    optimizePackageImports: ['@thorbis/ui']
  }
}

export default config
```

**Step 3: Fix Port Conflicts**
```json
// In package.json
{
  "scripts": {
    "dev": "next dev -p 3001"  // Use explicit port
  }
}
```

### Hot Reload Not Working

#### Symptoms
- Changes not reflecting in browser
- Full page refreshes instead of hot reload
- Console errors about HMR connection

#### Resolution Steps

**Step 1: Check File Watching**
```bash
# Increase file watcher limits (Linux/macOS)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Check if files are being watched
cd apps/hs
npx next dev --turbo  # Try with Turbo mode
```

**Step 2: Fix Import Paths**
```typescript
// Use relative imports for local files
import { Header } from '../components/Header'  ✓
import { Header } from '@/components/Header'   ✓
import { Header } from './Header'              ✓

// Avoid deep relative imports
import { Header } from '../../../components/Header'  ✗
```

**Step 3: Check Browser Connection**
```bash
# Check WebSocket connection in browser dev tools
# Should see: Connected to development server
# Look for errors like: WebSocket connection failed
```

### Build vs Development Differences

#### Symptoms
- Works in development but fails in production build
- Different behavior between `pnpm dev` and `pnpm build`
- Missing environment variables in build

#### Resolution Strategies

**Step 1: Environment Variable Audit**
```bash
# Check which variables are available
cd apps/hs
grep -r "process.env" src/

# Verify NEXT_PUBLIC_ prefix for client-side variables
grep "NEXT_PUBLIC_" .env.local
```

**Step 2: Build Mode Testing**
```bash
# Test production build locally
cd apps/hs
pnpm build
pnpm start  # Test built application

# Compare with development
pnpm dev
```

**Step 3: Static/Dynamic Route Issues**
```typescript
// Ensure proper data fetching
export default async function Page({ params }: PageProps) {
  // Static at build time
  const staticData = await fetchStaticData()
  
  // Dynamic at request time (use sparingly)
  const dynamicData = await fetchDynamicData(params.id)
  
  return <PageComponent data={staticData} dynamic={dynamicData} />
}

// Generate static paths for dynamic routes
export async function generateStaticParams() {
  const items = await fetchAllItems()
  return items.map(item => ({ id: item.id }))
}
```

---

## 4. Performance Bottlenecks and Optimization

### Slow Development Server

#### Diagnostic Tools
```bash
# Profile Next.js startup
cd apps/hs
NEXT_PRIVATE_DEBUG_CACHE=1 pnpm dev

# Check bundle analysis
pnpm bundle:analyze

# Monitor memory usage
node --inspect --max-old-space-size=8192 node_modules/.bin/next dev
```

#### Optimization Steps

**Step 1: Optimize Package Imports**
```typescript
// Tree-shakable imports (good)
import { Button } from '@thorbis/ui/components/button'
import { cn } from '@thorbis/ui/lib/utils'

// Avoid barrel imports in development (slow)
import { Button, Card, Input } from '@thorbis/ui'  // Can be slow
```

**Step 2: Configure Next.js Optimization**
```typescript
// next.config.ts
const config = {
  // Transpile shared packages
  transpilePackages: ['@thorbis/ui', '@thorbis/design'],
  
  // Optimize package imports
  experimental: {
    optimizePackageImports: ['@thorbis/ui', 'lucide-react'],
    turbo: {
      rules: {
        '*.svg': ['@svgr/webpack', { icon: true }]
      }
    }
  },
  
  // Enable SWC minification
  swcMinify: true,
  
  // Reduce bundle analysis overhead
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  }
}
```

**Step 3: Memory Optimization**
```bash
# Increase Node.js memory for large monorepos
export NODE_OPTIONS="--max-old-space-size=8192"

# Add to package.json scripts
{
  "dev": "NODE_OPTIONS='--max-old-space-size=8192' next dev -p 3001"
}
```

### Bundle Size Issues

#### Analysis Commands
```bash
# Generate bundle analysis
pnpm bundle:analyze

# Check specific app bundle
cd apps/hs
npx @next/bundle-analyzer build

# Profile webpack build
ANALYZE=true pnpm build
```

#### Optimization Strategies

**Step 1: Code Splitting**
```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false  // Client-side only if needed
})

// Route-based splitting (automatic with App Router)
```

**Step 2: Dependency Optimization**
```typescript
// Use lighter alternatives
import { format } from 'date-fns/format'  // Instead of entire date-fns
import { debounce } from 'lodash/debounce'  // Instead of entire lodash

// Check package sizes
npx bundlephobia <package-name>
```

**Step 3: Asset Optimization**
```typescript
// Optimize images
import Image from 'next/image'

<Image
  src="/images/hero.webp"
  alt="Description"
  width={800}
  height={600}
  priority  // For above-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Runtime Performance Issues

#### Performance Monitoring
```typescript
// Add performance monitoring
import { performance } from 'perf_hooks'

export async function measureAsyncOperation<T>(
  operation: () => Promise<T>,
  label: string
): Promise<T> {
  const start = performance.now()
  try {
    const result = await operation()
    const duration = performance.now() - start
    console.log(`${label} took ${duration.toFixed(2)}ms`)
    return result
  } catch (error) {
    const duration = performance.now() - start
    console.error(`${label} failed after ${duration.toFixed(2)}ms`, error)
    throw error
  }
}
```

#### React Performance Optimization
```typescript
// Memoization for expensive computations
import { useMemo, useCallback, memo } from 'react'

const ExpensiveComponent = memo(({ data }: { data: ComplexData }) => {
  const processedData = useMemo(() => {
    return expensiveCalculation(data)
  }, [data])

  const handleClick = useCallback((id: string) => {
    // Handle click
  }, [])

  return <div>{/* Render processed data */}</div>
})

// Virtual scrolling for large lists
import { VirtualList } from '@thorbis/ui/components'

<VirtualList
  items={largeDataSet}
  renderItem={({ item, index }) => <ItemComponent key={item.id} item={item} />}
  height={400}
  itemHeight={60}
/>
```

---

## 5. Common Error Patterns and Solutions

### API Route Errors

#### Error Handling Pattern
```typescript
// apps/hs/src/app/api/work-orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { handleError } from '@thorbis/error-handling'
import { WorkOrderSchema } from '@thorbis/schemas/hs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validated = WorkOrderSchema.parse(body)
    
    // Business logic
    const workOrder = await createWorkOrder(validated)
    
    return NextResponse.json({ data: workOrder }, { status: 201 })
  } catch (error) {
    const errorResponse = await handleError(error, {
      route: '/api/work-orders',
      method: 'POST',
      userId: request.headers.get('user-id')
    })
    
    return NextResponse.json(
      { error: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode }
    )
  }
}
```

### Database Connection Issues

#### Supabase Connection Debugging
```typescript
// Test database connection
async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1)
    
    if (error) {
      console.error('Database connection failed:', error)
      return false
    }
    
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}

// Check RLS policies
async function validateRLSAccess(userId: string, table: string) {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .limit(1)
  
  if (error) {
    console.error(`RLS access denied for ${table}:`, error.message)
    // Check if user has proper role
    // Verify RLS policies are correctly configured
  }
}
```

### Authentication Flow Issues

#### Debug Authentication State
```typescript
// Check auth state in components
import { useAuth } from '@thorbis/auth'

export function AuthDebugPanel() {
  const { user, session, isLoading } = useAuth()
  
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <details className="fixed bottom-4 right-4 bg-black text-white p-4 rounded">
      <summary>Auth Debug</summary>
      <pre>{JSON.stringify({ 
        userId: user?.id,
        role: user?.role,
        sessionValid: !!session,
        isLoading 
      }, null, 2)}</pre>
    </details>
  )
}
```

---

## 6. Monitoring and Alerting Setup

### Development Monitoring

#### Error Boundary Implementation
```typescript
// apps/hs/src/components/error-boundary.tsx
import React from 'react'
import { createErrorBoundaryHandler } from '@thorbis/error-handling'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export function ErrorBoundary({ children, fallback: Fallback }: Props) {
  const [error, setError] = React.useState<Error | null>(null)
  
  React.useEffect(() => {
    const handler = createErrorBoundaryHandler()
    
    if (error) {
      handler(error, { componentStack: 'ErrorBoundary' })
    }
  }, [error])
  
  if (error && Fallback) {
    return <Fallback error={error} reset={() => setError(null)} />
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h2>Something went wrong</h2>
        <details>
          <summary>Error details</summary>
          <pre className="mt-2 text-sm">{error.stack}</pre>
        </details>
        <button 
          onClick={() => setError(null)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
        >
          Try Again
        </button>
      </div>
    )
  }
  
  return <>{children}</>
}
```

#### Performance Monitoring
```typescript
// Performance monitoring hook
import { useEffect, useRef } from 'react'

export function usePerformanceMonitor(componentName: string) {
  const renderStart = useRef<number>()
  
  // Mark render start
  renderStart.current = performance.now()
  
  useEffect(() => {
    if (renderStart.current) {
      const renderTime = performance.now() - renderStart.current
      
      if (renderTime > 100) {  // Log slow renders
        console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`)
      }
      
      // Send to monitoring service in production
      if (process.env.NODE_ENV === 'production' && renderTime > 500) {
        // analytics.track('slow_render', { componentName, renderTime })
      }
    }
  })
}
```

### Development Health Checks

#### System Health Dashboard
```typescript
// Create development health check endpoint
// apps/hs/src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@thorbis/database'

export async function GET() {
  const checks = await Promise.allSettled([
    // Database check
    supabase.from('health_check').select('*').limit(1),
    
    // External services check
    fetch('https://api.stripe.com/v1/account', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
    }),
    
    // Memory usage check
    Promise.resolve({
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    })
  ])
  
  const results = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      stripe: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      memory: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy'
    },
    details: {
      database: checks[0].status === 'rejected' ? checks[0].reason : null,
      stripe: checks[1].status === 'rejected' ? checks[1].reason : null,
      memory: checks[2].status === 'fulfilled' ? checks[2].value : null
    }
  }
  
  const isHealthy = Object.values(results.checks).every(status => status === 'healthy')
  results.status = isHealthy ? 'healthy' : 'unhealthy'
  
  return NextResponse.json(results, { 
    status: isHealthy ? 200 : 500 
  })
}
```

---

## 7. Prevention Strategies

### Development Best Practices

#### Pre-commit Hooks
```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Type check
pnpm type-check || exit 1

# Lint staged files
npx lint-staged || exit 1

# Test affected packages
pnpm test:unit --passWithNoTests || exit 1
```

#### Continuous Integration Checks
```yaml
# .github/workflows/quality-checks.yml
name: Quality Checks
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm build:packages
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test:unit
      - run: pnpm bundle:check
```

### Code Quality Gates

#### Bundle Size Monitoring
```javascript
// scripts/bundle-analysis.js
const fs = require('fs')
const path = require('path')

const BUNDLE_SIZE_LIMITS = {
  'apps/hs': 500,  // 500KB JS budget
  'apps/rest': 450,
  'apps/auto': 400,
  'apps/ret': 350
}

async function checkBundleSizes() {
  const results = {}
  let hasFailures = false

  for (const [app, limit] of Object.entries(BUNDLE_SIZE_LIMITS)) {
    const buildDir = path.join(app, '.next')
    if (!fs.existsSync(buildDir)) continue

    // Calculate bundle size
    const size = calculateBundleSize(buildDir)
    results[app] = { size, limit, passed: size <= limit }
    
    if (size > limit) {
      console.error(`❌ ${app}: ${size}KB exceeds limit of ${limit}KB`)
      hasFailures = true
    } else {
      console.log(`✅ ${app}: ${size}KB within ${limit}KB limit`)
    }
  }

  if (hasFailures && process.argv.includes('--enforce')) {
    process.exit(1)
  }

  return results
}
```

---

## 8. Getting Help

### Documentation Resources
- **Architecture Guide**: `/docs/business-docs/core/SYSTEM-ARCHITECTURE.md`
- **API Documentation**: `/docs/API-DOCUMENTATION-INDEX.md`
- **Performance Guide**: `/docs/business-docs/development/PERFORMANCE-OPTIMIZATION-GUIDE.md`
- **Security Guide**: `/docs/business-docs/development/SECURITY-IMPLEMENTATION-GUIDE.md`

### Support Escalation
1. **Check existing issues**: Search codebase for similar patterns
2. **Review logs**: Check browser console and server logs
3. **Test isolation**: Reproduce in minimal environment
4. **Document findings**: Create detailed issue report
5. **Seek help**: Contact development team with context

### Community Resources
- **GitHub Issues**: Report bugs and feature requests
- **Development Slack**: Real-time developer support
- **Code Review**: Peer review for complex issues
- **Architecture Discussions**: Design decisions and patterns

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Next: [Application-Specific Troubleshooting](./02-application-specific-troubleshooting.md)*