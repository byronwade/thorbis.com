# Environment and Deployment Issues

> **Last Updated**: 2025-01-31  
> **Version**: 1.0.0  
> **Status**: Production Ready

This guide provides comprehensive solutions for environment configuration problems, deployment failures, CI/CD issues, and monitoring alerts.

## Quick Navigation
- [Environment Variable Configuration](#1-environment-variable-configuration-problems)
- [Build and Deployment Failures](#2-build-and-deployment-failures)
- [CI/CD Pipeline Issues](#3-cicd-pipeline-issues)
- [Performance Monitoring Alerts](#4-performance-monitoring-alerts)
- [Security Policy Violations](#5-security-policy-violations)

---

## 1. Environment Variable Configuration Problems

### Missing or Incorrect Environment Variables

#### Symptoms
- "Environment variable not defined" errors
- API calls failing with authentication errors
- Features not working in specific environments
- Database connection failures

#### Diagnostic Commands
```bash
# Check all environment variables in development
printenv | grep -E "(NEXT_PUBLIC_|SUPABASE_|STRIPE_|ANTHROPIC_)"

# Verify Next.js can access variables
cd apps/hs
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Test environment variable loading
pnpm build 2>&1 | grep -i "environment"
```

#### Resolution Process

**Step 1: Environment Variable Audit**
```bash
# Create environment variable audit script
# scripts/audit-env-vars.js
const fs = require('fs')
const path = require('path')

const requiredVars = {
  // Database
  'NEXT_PUBLIC_SUPABASE_URL': { required: true, public: true },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': { required: true, public: true },
  'SUPABASE_SERVICE_ROLE_KEY': { required: true, public: false },
  
  // Payment Processing
  'STRIPE_SECRET_KEY': { required: true, public: false },
  'STRIPE_WEBHOOK_SECRET': { required: true, public: false },
  
  // AI Services
  'ANTHROPIC_API_KEY': { required: true, public: false },
  'VOYAGE_API_KEY': { required: false, public: false },
  'V0_API_TOKEN': { required: false, public: false },
  
  // Maps and Location
  'NEXT_PUBLIC_MAPS_API_KEY': { required: false, public: true },
}

function auditEnvironmentVariables() {
  const results = {}
  const missing = []
  const malformed = []
  
  for (const [varName, config] of Object.entries(requiredVars)) {
    const value = process.env[varName]
    
    results[varName] = {
      present: !!value,
      hasValue: value && value.length > 0,
      isPublic: config.public,
      required: config.required
    }
    
    if (config.required && !value) {
      missing.push(varName)
    }
    
    // Check for common malformations
    if (value) {
      if (varName.includes('URL') && !value.startsWith('http')) {
        malformed.push(`${varName}: Should start with http/https`)
      }
      if (varName.includes('KEY') && value.length < 10) {
        malformed.push(`${varName}: Suspiciously short key`)
      }
    }
  }
  
  console.log('Environment Variable Audit Results:')
  console.table(results)
  
  if (missing.length > 0) {
    console.error('\nMissing required variables:', missing)
  }
  
  if (malformed.length > 0) {
    console.warn('\nPotentially malformed variables:', malformed)
  }
  
  return { results, missing, malformed }
}

auditEnvironmentVariables()
```

**Step 2: Fix Environment Configuration**

**Create Environment Templates**:
```bash
# .env.example (root level)
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Authentication
JWT_SECRET=your-jwt-secret-min-32-chars
NEXT_PUBLIC_THORBIS_ORIGIN=https://thorbis.com

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# AI Services
ANTHROPIC_API_KEY=sk-ant-api-key-here
VOYAGE_API_KEY=pa-your-voyage-key-here
V0_API_TOKEN=your-v0-token-here

# Maps and Location Services
NEXT_PUBLIC_MAPS_API_KEY=your-google-maps-api-key

# Development Settings
NODE_ENV=development
```

**Environment Validation Hook**:
```typescript
// packages/shared/src/lib/env-validation.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, 'Invalid Supabase anon key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, 'Invalid service role key'),
  
  // Auth
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  
  // Payments
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key format'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Invalid webhook secret format'),
  
  // AI
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', 'Invalid Anthropic API key'),
  VOYAGE_API_KEY: z.string().startsWith('pa-', 'Invalid Voyage API key').optional(),
  
  // Optional
  NEXT_PUBLIC_MAPS_API_KEY: z.string().optional(),
  V0_API_TOKEN: z.string().optional(),
})

export function validateEnvironment() {
  try {
    const validated = envSchema.parse(process.env)
    console.log('✅ Environment variables validated successfully')
    return validated
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:')
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
    }
    throw new Error('Environment validation failed')
  }
}

// Auto-validate in development
if (process.env.NODE_ENV === 'development') {
  validateEnvironment()
}
```

### Environment-Specific Configuration Issues

#### Symptoms
- Different behavior between development and production
- Features working locally but failing in deployment
- API endpoints returning different responses

#### Resolution Steps

**Step 1: Environment Detection Utility**
```typescript
// packages/shared/src/lib/environment.ts
export const Environment = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Deployment environments
  isVercelProduction: process.env.VERCEL_ENV === 'production',
  isVercelPreview: process.env.VERCEL_ENV === 'preview',
  
  // Feature flags
  enableDebugLogs: process.env.ENABLE_DEBUG_LOGS === 'true',
  enableAnalytics: process.env.NODE_ENV === 'production',
  
  // API endpoints
  get apiUrl() {
    if (this.isProduction) return 'https://api.thorbis.com'
    if (this.isVercelPreview) return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api` : 'http://localhost:3000/api'
    return 'http://localhost:3000/api'
  },
  
  // Database
  get databaseUrl() {
    return process.env.NODE_ENV === 'test' 
      ? process.env.TEST_DATABASE_URL 
      : process.env.NEXT_PUBLIC_SUPABASE_URL
  }
} as const

// Environment-specific configuration
export function getConfig() {
  return {
    api: {
      timeout: Environment.isProduction ? 10000 : 30000,
      retries: Environment.isProduction ? 3 : 1,
      baseUrl: Environment.apiUrl
    },
    logging: {
      level: Environment.isDevelopment ? 'debug' : 'error',
      enableConsole: !Environment.isProduction
    },
    cache: {
      ttl: Environment.isProduction ? 300 : 60, // seconds
      enabled: Environment.isProduction
    }
  }
}
```

**Step 2: Environment-Aware API Configuration**
```typescript
// packages/api-utils/src/api-client.ts
import { getConfig, Environment } from '@thorbis/shared/environment'

export class ApiClient {
  private config = getConfig()
  private baseUrl: string
  
  constructor() {
    this.baseUrl = this.config.api.baseUrl
  }
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getEnvironmentHeaders(),
        ...options.headers,
      },
    }
    
    if (Environment.enableDebugLogs) {
      console.log(`API Request: ${requestOptions.method || 'GET'} ${url}`)
    }
    
    const response = await fetch(url, requestOptions)
    
    if (!response.ok) {
      const error = await this.handleApiError(response)
      throw error
    }
    
    return response.json()
  }
  
  private getEnvironmentHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}
    
    // Add environment identification
    if (Environment.isVercelPreview) {
      headers['X-Environment'] = 'preview'
    } else if (Environment.isProduction) {
      headers['X-Environment'] = 'production'  
    } else {
      headers['X-Environment'] = 'development'
    }
    
    // Add version information
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      headers['X-Commit-SHA'] = process.env.VERCEL_GIT_COMMIT_SHA
    }
    
    return headers
  }
}
```

---

## 2. Build and Deployment Failures

### Next.js Build Failures

#### Symptoms
- Build process hanging or timing out
- Memory errors during build
- Static generation failures
- Missing dependencies in production builds

#### Diagnostic Steps
```bash
# Enable verbose build logging
DEBUG=* pnpm build 2>&1 | tee build.log

# Check memory usage during build
NODE_OPTIONS="--max-old-space-size=8192" pnpm build

# Build individual apps to isolate issues
turbo run build --filter=@thorbis/hs --verbose
```

#### Resolution Process

**Step 1: Build Configuration Optimization**
```typescript
// next.config.ts (optimized for build performance)
const config = {
  // Optimize build performance
  experimental: {
    // Use Turbo for faster builds
    turbo: {
      rules: {
        '*.svg': ['@svgr/webpack', { icon: true }]
      }
    },
    // Reduce build time with optimized package imports
    optimizePackageImports: [
      '@thorbis/ui',
      'lucide-react',
      'date-fns',
      'recharts'
    ],
    // Faster builds with SWC
    swcMinify: true
  },
  
  // Reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Build output optimization
  output: 'standalone',
  
  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
    // Reduce bundle size
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
        'react': 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      }
    }
    
    // Optimize build performance
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          ui: {
            test: /[\\/]packages[\\/]ui[\\/]/,
            name: 'ui',
            priority: 20,
            chunks: 'all',
          }
        }
      }
    }
    
    return config
  }
}

export default config
```

**Step 2: Fix Common Build Issues**

**Static Generation Problems**:
```typescript
// Handle static generation errors
// apps/hs/src/app/work-orders/[id]/page.tsx
export async function generateStaticParams() {
  // Only generate static params for critical routes in production
  if (process.env.NODE_ENV !== 'production') {
    return []
  }
  
  try {
    // Limit static generation to prevent build timeouts
    const workOrders = await getRecentWorkOrders(100)
    return workOrders.map((wo) => ({
      id: wo.id,
    }))
  } catch (error) {
    console.error('Static generation failed:', error)
    // Return empty array to prevent build failure
    return []
  }
}

export default async function WorkOrderPage({
  params,
}: {
  params: { id: string }
}) {
  // Handle missing data gracefully
  const workOrder = await getWorkOrder(params.id).catch(() => null)
  
  if (!workOrder) {
    notFound()
  }
  
  return <WorkOrderDetails workOrder={workOrder} />
}
```

**Memory Issues During Build**:
```json
// package.json - Add build optimization scripts
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=8192' next build",
    "build:analyze": "ANALYZE=true pnpm build",
    "build:profile": "NODE_OPTIONS='--inspect --max-old-space-size=8192' next build"
  }
}
```

### Deployment Platform Issues

#### Vercel Deployment Problems

**Symptoms**:
- Build succeeding locally but failing on Vercel
- Function timeout errors
- Environment variables not loading
- Edge runtime issues

**Resolution Steps**:

**Step 1: Vercel Configuration**
```json
// vercel.json
{
  "buildCommand": "turbo run build --filter=$VERCEL_GIT_COMMIT_REF",
  "outputDirectory": "apps/$VERCEL_GIT_COMMIT_REF/.next",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": null,
  "functions": {
    "apps/*/src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "github": {
    "silent": true
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**Step 2: Edge Runtime Compatibility**
```typescript
// For API routes that need Edge Runtime
export const runtime = 'edge'

// Ensure Edge Runtime compatibility
export async function GET(request: Request) {
  // Use Web APIs instead of Node.js APIs
  const url = new URL(request.url)
  const searchParams = url.searchParams
  
  // Use fetch instead of http module
  const response = await fetch('https://api.external.com/data')
  const data = await response.json()
  
  return Response.json({ data })
}
```

### Database Migration Failures

#### Symptoms
- Migration scripts failing during deployment
- Schema version mismatches
- Foreign key constraint errors
- Missing tables or columns

#### Resolution Process

**Step 1: Safe Migration Strategy**
```sql
-- migrations/001_safe_schema_changes.sql
BEGIN;

-- Always add columns with defaults for backwards compatibility
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1;

-- Add indexes concurrently to avoid locking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_priority 
ON work_orders(priority_level) 
WHERE deleted_at IS NULL;

-- Add constraints after data migration
ALTER TABLE work_orders 
ADD CONSTRAINT chk_priority_level 
CHECK (priority_level BETWEEN 1 AND 5);

COMMIT;
```

**Step 2: Migration Rollback Strategy**
```sql
-- migrations/001_safe_schema_changes_rollback.sql
BEGIN;

-- Remove constraint first
ALTER TABLE work_orders 
DROP CONSTRAINT IF EXISTS chk_priority_level;

-- Drop index
DROP INDEX CONCURRENTLY IF EXISTS idx_work_orders_priority;

-- Remove column (be careful - this loses data)
-- ALTER TABLE work_orders DROP COLUMN IF EXISTS priority_level;

COMMIT;
```

**Step 3: Migration Validation Script**
```typescript
// scripts/validate-migration.ts
import { supabase } from '@thorbis/database'

async function validateMigration() {
  try {
    // Check table structure
    const { data: columns } = await supabase
      .rpc('get_table_columns', { table_name: 'work_orders' })
    
    const requiredColumns = [
      'id', 'customer_id', 'status', 'priority_level',
      'created_at', 'updated_at', 'deleted_at'
    ]
    
    const missingColumns = requiredColumns.filter(
      col => !columns?.find(c => c.column_name === col)
    )
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing columns: ${missingColumns.join(', ')}`)
    }
    
    // Test data integrity
    const { count, error } = await supabase
      .from('work_orders')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    
    console.log(`✅ Migration validated successfully. ${count} work orders found.`)
    
  } catch (error) {
    console.error('❌ Migration validation failed:', error)
    process.exit(1)
  }
}

validateMigration()
```

---

## 3. CI/CD Pipeline Issues

### GitHub Actions Failures

#### Symptoms
- Tests failing in CI but passing locally
- Build timeouts in GitHub Actions
- Inconsistent test results
- Deployment pipeline hanging

#### Diagnostic Steps
```bash
# Run same tests locally with CI environment
CI=true NODE_ENV=test pnpm test

# Check GitHub Actions logs for specific failure points
gh run list --limit 10
gh run view <run-id> --log

# Test Docker build locally
docker build -t thorbis-test .
```

#### Resolution Process

**Step 1: Optimize GitHub Actions Workflow**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.changes.outputs.packages }}
      apps: ${{ steps.changes.outputs.apps }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            packages:
              - 'packages/**'
            apps:
              - 'apps/**'
  
  quality:
    needs: changes
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20]
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      
      - uses: pnpm/action-setup@v2
        with:
          version: 9.15.0
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      
      # Cache node_modules for faster builds
      - uses: actions/cache@v3
        with:
          path: |
            node_modules
            */node_modules
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build packages
        run: turbo run build --filter='./packages/*' --concurrency=2
      
      - name: Type check
        run: turbo run type-check --concurrency=4
      
      - name: Lint
        run: turbo run lint --concurrency=4
      
      - name: Test
        run: turbo run test --concurrency=2
        env:
          CI: true
      
      - name: Build apps
        if: needs.changes.outputs.apps == 'true'
        run: turbo run build --filter='./apps/*' --concurrency=1
        env:
          NODE_OPTIONS: '--max-old-space-size=8192'
  
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm audit --audit-level moderate
      
  deploy-preview:
    needs: [quality, security]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

**Step 2: Fix CI-Specific Issues**

**Test Environment Configuration**:
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // CI-specific optimizations
  maxWorkers: process.env.CI ? 2 : '50%',
  cache: !process.env.CI,
  
  // Handle monorepo paths
  moduleNameMapping: {
    '^@thorbis/(.*)$': '<rootDir>/packages/$1/src',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Coverage thresholds for CI
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

**Step 3: Environment Consistency**
```typescript
// Create CI environment detection
// packages/shared/src/lib/ci-environment.ts
export const CIEnvironment = {
  isCI: process.env.CI === 'true',
  isGitHubActions: process.env.GITHUB_ACTIONS === 'true',
  isVercelBuild: process.env.VERCEL === '1',
  
  // Resource constraints for CI
  getResourceLimits() {
    if (this.isCI) {
      return {
        maxMemory: '4GB',
        maxConcurrency: 2,
        timeout: 300000, // 5 minutes
      }
    }
    return {
      maxMemory: '8GB', 
      maxConcurrency: 4,
      timeout: 600000, // 10 minutes
    }
  }
}
```

### Deployment Pipeline Hangs

#### Symptoms
- Deployments getting stuck at specific steps
- No error messages in logs
- Timeouts without clear cause
- Resources not being released

#### Resolution Steps

**Step 1: Add Pipeline Timeouts and Monitoring**
```yaml
# Add explicit timeouts to all jobs
jobs:
  build:
    timeout-minutes: 30
    steps:
      - name: Install dependencies  
        timeout-minutes: 10
        run: pnpm install
      
      - name: Build applications
        timeout-minutes: 15
        run: turbo run build
```

**Step 2: Implement Health Checks**
```typescript
// Add deployment health verification
// scripts/verify-deployment.ts
async function verifyDeployment(url: string) {
  const checks = [
    { name: 'Health endpoint', path: '/api/health' },
    { name: 'Database connection', path: '/api/health/database' },
    { name: 'Static assets', path: '/favicon.ico' }
  ]
  
  for (const check of checks) {
    try {
      const response = await fetch(`${url}${check.path}`, {
        timeout: 10000
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      console.log(`✅ ${check.name}: OK`)
    } catch (error) {
      console.error(`❌ ${check.name}: ${error.message}`)
      process.exit(1)
    }
  }
  
  console.log('🚀 Deployment verification completed successfully')
}

// Run verification
const deploymentUrl = process.argv[2]
if (!deploymentUrl) {
  console.error('Usage: node verify-deployment.js <url>')
  process.exit(1)
}

verifyDeployment(deploymentUrl)
```

---

## 4. Performance Monitoring Alerts

### High Memory Usage Alerts

#### Symptoms
- Memory usage consistently above 80%
- Out of memory errors
- Performance degradation over time
- Garbage collection taking too long

#### Diagnostic Tools
```typescript
// Create memory monitoring utility
// packages/monitoring/src/memory-monitor.ts
export class MemoryMonitor {
  private static instance: MemoryMonitor
  private intervalId: NodeJS.Timeout | null = null
  
  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor()
    }
    return MemoryMonitor.instance
  }
  
  startMonitoring(intervalMs = 60000) {
    this.intervalId = setInterval(() => {
      const usage = process.memoryUsage()
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024)
      const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024)
      const externalMB = Math.round(usage.external / 1024 / 1024)
      
      console.log(`Memory Usage - Heap: ${heapUsedMB}/${heapTotalMB}MB, External: ${externalMB}MB`)
      
      // Alert if memory usage is high
      const usagePercent = (usage.heapUsed / usage.heapTotal) * 100
      if (usagePercent > 80) {
        console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(1)}%`)
        this.triggerMemoryAlert(usage)
      }
    }, intervalMs)
  }
  
  private triggerMemoryAlert(usage: NodeJS.MemoryUsage) {
    // Force garbage collection if available
    if (global.gc) {
      console.log('Forcing garbage collection...')
      global.gc()
    }
    
    // Log memory leak suspects
    this.analyzeMemoryLeaks()
  }
  
  private analyzeMemoryLeaks() {
    // Check for common memory leak patterns
    const suspiciousObjects = {
      timers: process._getActiveHandles().length,
      requests: process._getActiveRequests().length,
    }
    
    console.log('Memory leak analysis:', suspiciousObjects)
  }
  
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  MemoryMonitor.getInstance().startMonitoring()
}
```

#### Resolution Steps

**Step 1: Memory Optimization**
```typescript
// Implement memory-efficient data handling
export class DataManager {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly MAX_CACHE_SIZE = 1000
  private readonly CACHE_TTL = 300000 // 5 minutes
  
  set(key: string, data: any) {
    // Implement LRU eviction
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      data: this.deepClone(data), // Avoid reference leaks
      timestamp: Date.now()
    })
  }
  
  get(key: string) {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  private deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj))
  }
  
  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key)
      }
    }
  }
}
```

**Step 2: Memory Leak Detection**
```typescript
// Add memory leak detection for React components
// packages/monitoring/src/react-memory-monitor.tsx
import { useEffect, useRef } from 'react'

export function useMemoryLeakDetection(componentName: string) {
  const mountTime = useRef(Date.now())
  const cleanupFunctions = useRef<(() => void)[]>([])
  
  useEffect(() => {
    return () => {
      // Cleanup all registered functions
      cleanupFunctions.current.forEach(fn => {
        try {
          fn()
        } catch (error) {
          console.error(`Cleanup error in ${componentName}:`, error)
        }
      })
      
      const lifespan = Date.now() - mountTime.current
      if (lifespan > 300000) { // 5 minutes
        console.warn(`Long-lived component ${componentName}: ${lifespan}ms`)
      }
    }
  }, [componentName])
  
  const registerCleanup = (fn: () => void) => {
    cleanupFunctions.current.push(fn)
  }
  
  return { registerCleanup }
}
```

### Database Performance Alerts

#### Symptoms
- Query response times above acceptable thresholds
- Connection pool exhaustion
- Database CPU usage spikes
- Deadlock errors

#### Resolution Process

**Step 1: Query Performance Monitoring**
```sql
-- Create query performance monitoring view
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  min_exec_time,
  max_exec_time,
  stddev_exec_time
FROM pg_stat_statements 
WHERE mean_exec_time > 100 -- Queries taking more than 100ms on average
ORDER BY mean_exec_time DESC;

-- Monitor active queries
CREATE OR REPLACE FUNCTION monitor_active_queries()
RETURNS TABLE(
  pid int,
  usename name,
  application_name text,
  client_addr inet,
  state text,
  query_start timestamp with time zone,
  query text
)
LANGUAGE sql
AS $$
  SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
  FROM pg_stat_activity 
  WHERE state != 'idle' 
    AND query_start < NOW() - INTERVAL '30 seconds'
  ORDER BY query_start;
$$;
```

**Step 2: Database Connection Optimization**
```typescript
// Implement connection pooling with monitoring
// packages/database/src/connection-pool.ts
export class DatabaseConnectionPool {
  private pool: any[] = []
  private activeConnections = 0
  private readonly maxConnections = 20
  private readonly acquireTimeout = 30000
  
  async getConnection(): Promise<any> {
    const startTime = Date.now()
    
    while (this.activeConnections >= this.maxConnections) {
      if (Date.now() - startTime > this.acquireTimeout) {
        throw new Error('Connection acquisition timeout')
      }
      await this.sleep(100)
    }
    
    this.activeConnections++
    console.log(`Active connections: ${this.activeConnections}/${this.maxConnections}`)
    
    return this.createConnection()
  }
  
  releaseConnection(connection: any) {
    this.activeConnections--
    // Return connection to pool or close
    this.pool.push(connection)
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

---

## 5. Security Policy Violations

### Content Security Policy (CSP) Violations

#### Symptoms
- CSP violation errors in browser console
- Third-party scripts not loading
- Inline styles being blocked
- Form submissions failing

#### Resolution Process

**Step 1: Configure CSP Headers**
```typescript
// next.config.ts - Configure CSP
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co;
  frame-src https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
`

const config = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ]
  },
}
```

**Step 2: CSP Violation Reporting**
```typescript
// Add CSP violation reporting
// apps/*/src/app/api/csp-report/route.ts
export async function POST(request: Request) {
  try {
    const report = await request.json()
    
    console.warn('CSP Violation:', {
      'document-uri': report['csp-report']['document-uri'],
      'violated-directive': report['csp-report']['violated-directive'],
      'blocked-uri': report['csp-report']['blocked-uri'],
      'source-file': report['csp-report']['source-file'],
      'line-number': report['csp-report']['line-number']
    })
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // await sendToMonitoringService(report)
    }
    
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('CSP report processing failed:', error)
    return new Response('Error', { status: 500 })
  }
}
```

### Rate Limiting Violations

#### Symptoms
- Too many requests errors (429)
- API abuse attempts
- Unusual traffic patterns
- Performance degradation under load

#### Resolution Steps

**Step 1: Implement Rate Limiting**
```typescript
// packages/api-utils/src/rate-limiter.ts
import { LRUCache } from 'lru-cache'

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: Request) => string
}

export class RateLimiter {
  private cache: LRUCache<string, number[]>
  private options: RateLimitOptions
  
  constructor(options: RateLimitOptions) {
    this.options = options
    this.cache = new LRUCache<string, number[]>({
      max: 10000,
      ttl: options.windowMs * 2
    })
  }
  
  async check(request: Request): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    const key = this.options.keyGenerator?.(request) ?? 
      this.getClientIP(request)
    
    const now = Date.now()
    const windowStart = now - this.options.windowMs
    
    const requests = this.cache.get(key) ?? []
    const validRequests = requests.filter(time => time > windowStart)
    
    const allowed = validRequests.length < this.options.maxRequests
    
    if (allowed) {
      validRequests.push(now)
      this.cache.set(key, validRequests)
    }
    
    return {
      allowed,
      remaining: Math.max(0, this.options.maxRequests - validRequests.length),
      resetTime: windowStart + this.options.windowMs
    }
  }
  
  private getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    return forwarded?.split(',')[0] ?? 
      request.headers.get('x-real-ip') ?? 
      'unknown'
  }
}

// Usage in API routes
const limiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute
})

export async function middleware(request: Request) {
  const result = await limiter.check(request)
  
  if (!result.allowed) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
      }
    })
  }
  
  // Add rate limit headers
  const response = await handleRequest(request)
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  
  return response
}
```

### Authentication Security Issues

#### Symptoms
- JWT token validation failures
- Session hijacking attempts
- Unauthorized access to protected routes
- Authentication bypass attempts

#### Resolution Process

**Step 1: Secure JWT Implementation**
```typescript
// packages/auth/src/jwt-security.ts
import { SignJWT, jwtVerify } from 'jose'

export class SecureJWTHandler {
  private secret: Uint8Array
  private issuer = 'thorbis.com'
  private audience = 'thorbis-api'
  
  constructor(secretKey: string) {
    this.secret = new TextEncoder().encode(secretKey)
  }
  
  async createToken(payload: any, expiresIn = '1h'): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(expiresIn)
      .sign(this.secret)
  }
  
  async verifyToken(token: string): Promise<any> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        issuer: this.issuer,
        audience: this.audience,
      })
      
      return payload
    } catch (error) {
      if (error.code === 'ERR_JWT_EXPIRED') {
        throw new Error('Token expired')
      }
      throw new Error('Invalid token')
    }
  }
  
  async refreshToken(token: string): Promise<string> {
    const payload = await this.verifyToken(token)
    
    // Remove JWT standard claims
    delete payload.iat
    delete payload.exp
    delete payload.iss
    delete payload.aud
    
    return this.createToken(payload)
  }
}
```

**Step 2: Security Monitoring**
```typescript
// Add security event logging
// packages/monitoring/src/security-monitor.ts
export class SecurityMonitor {
  static logSecurityEvent(event: {
    type: 'auth_failure' | 'rate_limit' | 'csp_violation' | 'suspicious_activity'
    severity: 'low' | 'medium' | 'high' | 'critical'
    details: any
    userAgent?: string
    ip?: string
  }) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event
    }
    
    console.warn('Security Event:', logEntry)
    
    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production' && event.severity === 'critical') {
      // Alert security team immediately
      this.alertSecurityTeam(logEntry)
    }
  }
  
  private static async alertSecurityTeam(event: any) {
    // Implementation for critical security alerts
    console.error('🚨 CRITICAL SECURITY EVENT:', event)
  }
}
```

---

## 6. Prevention and Monitoring

### Automated Environment Testing

```typescript
// scripts/test-environments.ts
async function testAllEnvironments() {
  const environments = [
    { name: 'development', url: 'http://localhost:3000' },
    { name: 'preview', url: process.env.VERCEL_PREVIEW_URL },
    { name: 'production', url: 'https://thorbis.com' }
  ].filter(env => env.url)
  
  for (const env of environments) {
    console.log(`Testing ${env.name} environment...`)
    
    try {
      await testEnvironmentHealth(env.url!)
      console.log(`✅ ${env.name} environment healthy`)
    } catch (error) {
      console.error(`❌ ${env.name} environment failed:`, error.message)
    }
  }
}

async function testEnvironmentHealth(baseUrl: string) {
  const tests = [
    { name: 'API Health', path: '/api/health' },
    { name: 'Database Connection', path: '/api/health/database' },
    { name: 'Authentication', path: '/api/auth/session' },
  ]
  
  for (const test of tests) {
    const response = await fetch(`${baseUrl}${test.path}`)
    if (!response.ok) {
      throw new Error(`${test.name} failed with status ${response.status}`)
    }
  }
}
```

### Deployment Checklist Automation

```bash
#!/bin/bash
# scripts/deployment-checklist.sh

echo "🚀 Running deployment checklist..."

# Environment validation
echo "1. Validating environment variables..."
node scripts/validate-environment.js || exit 1

# Security check
echo "2. Running security audit..."
pnpm audit --audit-level moderate || exit 1

# Build test
echo "3. Testing build process..."
NODE_ENV=production pnpm build || exit 1

# Database migrations
echo "4. Validating database migrations..."
node scripts/validate-migrations.js || exit 1

# Performance test
echo "5. Running performance tests..."
pnpm test:performance || exit 1

echo "✅ All deployment checks passed!"
```

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Application-Specific Troubleshooting](./02-application-specific-troubleshooting.md)*  
*Next: [Debugging Tools and Techniques](./04-debugging-tools-techniques.md)*