# Deployment Guide

This comprehensive guide covers production deployment strategies, infrastructure setup, CI/CD pipelines, and operational best practices for deploying Thorbis Business OS applications at scale.

## Deployment Architecture

### Production Infrastructure Overview

```mermaid
graph TB
    subgraph "Edge Layer"
        CDN[Vercel Edge Network]
        WAF[Web Application Firewall]
    end
    
    subgraph "Application Layer"
        LB[Load Balancer]
        App1[Home Services App]
        App2[Restaurant App]
        App3[Automotive App]
        App4[Retail App]
        Site[Marketing Site]
    end
    
    subgraph "API Gateway"
        Gateway[API Gateway]
        Auth[Auth Service]
        Rate[Rate Limiter]
    end
    
    subgraph "Data Layer"
        DB[(Supabase PostgreSQL)]
        Cache[(Redis Cluster)]
        Storage[File Storage]
        Search[Search Engine]
    end
    
    subgraph "Monitoring"
        Metrics[Metrics Collection]
        Logs[Log Aggregation]
        Alerts[Alert Manager]
    end
    
    CDN --> WAF
    WAF --> LB
    LB --> App1
    LB --> App2
    LB --> App3
    LB --> App4
    LB --> Site
    
    App1 --> Gateway
    App2 --> Gateway
    App3 --> Gateway
    App4 --> Gateway
    
    Gateway --> Auth
    Gateway --> Rate
    Gateway --> DB
    Gateway --> Cache
    
    App1 --> Metrics
    App2 --> Metrics
    Gateway --> Logs
    Metrics --> Alerts
```

### Deployment Environments

#### Environment Hierarchy
```typescript
// Environment configuration structure
export interface DeploymentEnvironment {
  name: 'development' | 'staging' | 'production'
  domain: string
  database: DatabaseConfig
  apis: APIConfig
  cdn: CDNConfig
  monitoring: MonitoringConfig
  security: SecurityConfig
}

export const ENVIRONMENTS: Record<string, DeploymentEnvironment> = {
  development: {
    name: 'development',
    domain: 'localhost:3000',
    database: {
      url: 'http://localhost:54321',
      poolSize: 5,
      ssl: false
    },
    apis: {
      rateLimit: 1000,
      timeout: 30000,
      retries: 3
    },
    cdn: {
      enabled: false,
      cacheTTL: 0
    },
    monitoring: {
      enabled: false,
      logLevel: 'debug'
    },
    security: {
      strictMode: false,
      allowDevTools: true
    }
  },
  
  staging: {
    name: 'staging',
    domain: 'staging.thorbis.com',
    database: {
      url: process.env.STAGING_SUPABASE_URL,
      poolSize: 20,
      ssl: true
    },
    apis: {
      rateLimit: 5000,
      timeout: 10000,
      retries: 2
    },
    cdn: {
      enabled: true,
      cacheTTL: 3600 // 1 hour
    },
    monitoring: {
      enabled: true,
      logLevel: 'info'
    },
    security: {
      strictMode: true,
      allowDevTools: false
    }
  },
  
  production: {
    name: 'production',
    domain: 'thorbis.com',
    database: {
      url: process.env.PRODUCTION_SUPABASE_URL,
      poolSize: 50,
      ssl: true,
      readReplicas: 3
    },
    apis: {
      rateLimit: 10000,
      timeout: 5000,
      retries: 3
    },
    cdn: {
      enabled: true,
      cacheTTL: 86400, // 24 hours
      edgeLocations: ['global']
    },
    monitoring: {
      enabled: true,
      logLevel: 'warn',
      realTimeAlerts: true
    },
    security: {
      strictMode: true,
      allowDevTools: false,
      wafEnabled: true,
      ddosProtection: true
    }
  }
}
```

## Vercel Deployment Configuration

### Project Setup and Configuration

#### Vercel Configuration File
```json
{
  "version": 2,
  "name": "thorbis-business-os",
  "builds": [
    {
      "src": "apps/site/package.json",
      "use": "@vercel/next",
      "config": {
        "outputDirectory": "apps/site/.next"
      }
    },
    {
      "src": "apps/hs/package.json", 
      "use": "@vercel/next",
      "config": {
        "outputDirectory": "apps/hs/.next"
      }
    },
    {
      "src": "apps/rest/package.json",
      "use": "@vercel/next",
      "config": {
        "outputDirectory": "apps/rest/.next"
      }
    },
    {
      "src": "apps/auto/package.json",
      "use": "@vercel/next",
      "config": {
        "outputDirectory": "apps/auto/.next"
      }
    },
    {
      "src": "apps/ret/package.json",
      "use": "@vercel/next",
      "config": {
        "outputDirectory": "apps/ret/.next"
      }
    }
  ],
  "routes": [
    {
      "src": "/hs/(.*)",
      "dest": "apps/hs/$1"
    },
    {
      "src": "/rest/(.*)", 
      "dest": "apps/rest/$1"
    },
    {
      "src": "/auto/(.*)",
      "dest": "apps/auto/$1"
    },
    {
      "src": "/ret/(.*)",
      "dest": "apps/ret/$1"
    },
    {
      "src": "/(.*)",
      "dest": "apps/site/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_VERCEL_ENV": "@vercel-env"
  },
  "functions": {
    "apps/*/api/**/*.js": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control", 
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Environment Variables Configuration
```bash
# Production Environment Variables (.env.production)
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres

# AI Services
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
VOYAGE_AI_API_KEY=your-voyage-key

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your-live-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-live-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email Services
SENDGRID_API_KEY=your-sendgrid-key
RESEND_API_KEY=your-resend-key

# Security
NEXTAUTH_SECRET=your-nextauth-secret-production
NEXTAUTH_URL=https://thorbis.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
NEW_RELIC_LICENSE_KEY=your-newrelic-key

# Performance
NEXT_PUBLIC_CDN_URL=https://cdn.thorbis.com
REDIS_URL=redis://your-redis-cluster
```

### Deployment Scripts and Automation

#### Deployment Pipeline Script
```bash
#!/bin/bash
# scripts/deploy.sh - Production deployment script

set -e  # Exit on error

echo "🚀 Starting Thorbis Business OS deployment..."

# Environment validation
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN not set"
  exit 1
fi

if [ -z "$ENVIRONMENT" ]; then
  echo "❌ ENVIRONMENT not set (staging|production)"
  exit 1
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# 1. Run tests
echo "Running test suite..."
pnpm test --run
pnpm test:integration
echo "✅ Tests passed"

# 2. Type checking
echo "Checking TypeScript..."
pnpm type-check
echo "✅ Type checking passed"

# 3. Linting
echo "Running linter..."
pnpm lint
echo "✅ Linting passed"

# 4. Security audit
echo "Running security audit..."
pnpm audit --audit-level high
echo "✅ Security audit passed"

# 5. Build verification
echo "Building applications..."
pnpm build
echo "✅ Build successful"

# 6. Performance budget check
echo "Checking performance budgets..."
pnpm bundle-size
echo "✅ Performance budgets met"

# Database migrations (if needed)
if [ -f "database/migrations/pending.sql" ]; then
  echo "🗄️ Running database migrations..."
  pnpm db:migrate
  echo "✅ Database migrations complete"
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel ($ENVIRONMENT)..."

if [ "$ENVIRONMENT" = "production" ]; then
  # Production deployment
  vercel --prod --token $VERCEL_TOKEN --yes
  
  # Update environment variables
  vercel env pull .env.production --token $VERCEL_TOKEN
  
  echo "✅ Production deployment complete"
  
elif [ "$ENVIRONMENT" = "staging" ]; then
  # Staging deployment
  vercel --token $VERCEL_TOKEN --yes
  
  echo "✅ Staging deployment complete"
fi

# Post-deployment verification
echo "🔍 Running post-deployment checks..."

# 1. Health check
echo "Checking application health..."
curl -f https://$DOMAIN/api/health || {
  echo "❌ Health check failed"
  exit 1
}

# 2. Performance test
echo "Running performance verification..."
npx lighthouse --chrome-flags="--headless" https://$DOMAIN --output json --output-path ./lighthouse-report.json
PERFORMANCE_SCORE=$(cat lighthouse-report.json | jq '.categories.performance.score * 100')

if (( $(echo "$PERFORMANCE_SCORE < 90" | bc -l) )); then
  echo "⚠️ Performance score below threshold: $PERFORMANCE_SCORE"
else
  echo "✅ Performance score: $PERFORMANCE_SCORE"
fi

# 3. Smoke tests
echo "Running smoke tests..."
pnpm test:e2e:smoke
echo "✅ Smoke tests passed"

echo "🎉 Deployment completed successfully!"

# Notify team
if [ -n "$SLACK_WEBHOOK" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚀 Thorbis Business OS deployed to '$ENVIRONMENT' successfully"}' \
    $SLACK_WEBHOOK
fi
```

## CI/CD Pipeline Configuration

### GitHub Actions Workflow

#### Complete CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  test:
    name: Test Suite
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Setup test database
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        run: |
          pnpm supabase start
          pnpm db:push
          pnpm db:seed --env=test
      
      - name: Run unit tests
        run: pnpm test --coverage
      
      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:54322/postgres
          REDIS_URL: redis://localhost:6379
        run: pnpm test:integration
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
  
  security:
    name: Security Audit
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run security audit
        run: pnpm audit --audit-level high
      
      - name: Run OWASP ZAP security scan
        uses: zaproxy/action-full-scan@v0.7.0
        with:
          target: 'http://localhost:3000'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
  
  performance:
    name: Performance Testing
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build applications
        run: pnpm build
      
      - name: Check bundle sizes
        run: pnpm bundle-size
      
      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps
      
      - name: Run performance tests
        run: pnpm test:performance
      
      - name: Upload performance reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: performance-reports
          path: performance-reports/
          retention-days: 7
  
  e2e:
    name: End-to-End Testing
    runs-on: ubuntu-latest
    needs: [test, security]
    
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps ${{ matrix.browser }}
      
      - name: Start services
        run: |
          pnpm supabase start
          pnpm db:push
          pnpm db:seed --env=e2e
          pnpm build
          pnpm start &
          sleep 30
      
      - name: Run E2E tests
        run: pnpm test:e2e --project=${{ matrix.browser }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 7
  
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [test, security, performance, e2e]
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: staging
      url: https://staging.thorbis.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build applications
        env:
          NODE_ENV: production
          NEXT_PUBLIC_APP_ENV: staging
        run: pnpm build
      
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: staging.thorbis.com
      
      - name: Run staging smoke tests
        run: |
          sleep 30  # Wait for deployment to propagate
          pnpm test:e2e:smoke --baseURL=https://staging.thorbis.com
  
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: production
      url: https://thorbis.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build applications
        env:
          NODE_ENV: production
          NEXT_PUBLIC_APP_ENV: production
        run: pnpm build
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: |
            thorbis.com
            www.thorbis.com
      
      - name: Run production smoke tests
        run: |
          sleep 30  # Wait for deployment to propagate
          pnpm test:e2e:smoke --baseURL=https://thorbis.com
      
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Database Migrations and Management

### Production Migration Strategy

#### Migration System Architecture
```typescript
// Database migration management system
export interface Migration {
  id: string
  version: string
  description: string
  up: string
  down: string
  checksum: string
  applied_at?: Date
  rolled_back_at?: Date
}

export class MigrationRunner {
  constructor(
    private db: SupabaseClient,
    private environment: 'staging' | 'production'
  ) {}
  
  async runMigrations(migrations: Migration[]): Promise<void> {
    console.log(`🗄️ Running ${migrations.length} migrations on ${this.environment}`)
    
    // Create migrations table if it doesn't exist
    await this.ensureMigrationsTable()
    
    // Get applied migrations
    const appliedMigrations = await this.getAppliedMigrations()
    const appliedVersions = new Set(appliedMigrations.map(m => m.version))
    
    // Filter pending migrations
    const pendingMigrations = migrations.filter(
      migration => !appliedVersions.has(migration.version)
    )
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations')
      return
    }
    
    // Apply migrations in transaction
    for (const migration of pendingMigrations) {
      await this.applyMigration(migration)
    }
    
    console.log(`✅ Applied ${pendingMigrations.length} migrations`)
  }
  
  private async applyMigration(migration: Migration): Promise<void> {
    console.log(`Applying migration ${migration.version}: ${migration.description}`)
    
    const startTime = Date.now()
    
    try {
      // Begin transaction
      await this.db.rpc('begin_migration_transaction')
      
      // Execute migration
      const { error: migrationError } = await this.db.rpc('execute_sql', {
        sql_query: migration.up
      })
      
      if (migrationError) {
        throw new Error(`Migration failed: ${migrationError.message}`)
      }
      
      // Record migration as applied
      const { error: recordError } = await this.db
        .from('schema_migrations')
        .insert({
          version: migration.version,
          description: migration.description,
          checksum: migration.checksum,
          applied_at: new Date().toISOString()
        })
      
      if (recordError) {
        throw new Error(`Failed to record migration: ${recordError.message}`)
      }
      
      // Commit transaction
      await this.db.rpc('commit_migration_transaction')
      
      const duration = Date.now() - startTime
      console.log(`✅ Migration ${migration.version} applied in ${duration}ms`)
      
    } catch (error) {
      // Rollback transaction
      await this.db.rpc('rollback_migration_transaction')
      
      console.error(`❌ Migration ${migration.version} failed:`, error)
      throw error
    }
  }
  
  async rollbackMigration(version: string): Promise<void> {
    console.log(`🔄 Rolling back migration ${version}`)
    
    const migration = await this.getMigrationByVersion(version)
    if (!migration) {
      throw new Error(`Migration ${version} not found`)
    }
    
    try {
      // Execute rollback
      const { error } = await this.db.rpc('execute_sql', {
        sql_query: migration.down
      })
      
      if (error) {
        throw new Error(`Rollback failed: ${error.message}`)
      }
      
      // Update migration record
      await this.db
        .from('schema_migrations')
        .update({ rolled_back_at: new Date().toISOString() })
        .eq('version', version)
      
      console.log(`✅ Migration ${version} rolled back successfully`)
      
    } catch (error) {
      console.error(`❌ Rollback failed:`, error)
      throw error
    }
  }
}
```

#### Production Migration Scripts
```bash
#!/bin/bash
# scripts/migrate-production.sh

set -e

echo "🗄️ Starting production database migration..."

# Safety checks
if [ "$NODE_ENV" != "production" ]; then
  echo "❌ This script can only be run in production environment"
  exit 1
fi

if [ -z "$PRODUCTION_DATABASE_URL" ]; then
  echo "❌ PRODUCTION_DATABASE_URL not set"
  exit 1
fi

# Create database backup before migration
echo "📦 Creating database backup..."
BACKUP_NAME="pre-migration-$(date +%Y%m%d_%H%M%S)"
pg_dump $PRODUCTION_DATABASE_URL > "backups/${BACKUP_NAME}.sql"
echo "✅ Backup created: ${BACKUP_NAME}.sql"

# Verify migration checksums
echo "🔍 Verifying migration checksums..."
node scripts/verify-migrations.js
echo "✅ Migration checksums verified"

# Show pending migrations
echo "📋 Pending migrations:"
node scripts/list-pending-migrations.js

# Confirmation prompt
read -p "⚠️ Are you sure you want to apply these migrations to PRODUCTION? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "❌ Migration cancelled"
  exit 1
fi

# Apply migrations with monitoring
echo "🚀 Applying migrations with monitoring..."
node scripts/run-migrations.js --environment=production --monitor=true

# Verify migration success
echo "🔍 Verifying migration results..."
node scripts/verify-schema.js --environment=production

# Run smoke tests
echo "🧪 Running post-migration smoke tests..."
npm run test:smoke:production

echo "✅ Production migration completed successfully!"

# Notify team
if [ -n "$SLACK_WEBHOOK" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🗄️ Production database migration completed successfully"}' \
    $SLACK_WEBHOOK
fi
```

## Monitoring and Observability

### Application Performance Monitoring

#### Real-Time Monitoring Setup
```typescript
// Comprehensive monitoring configuration
export interface MonitoringConfig {
  performance: PerformanceMonitoring
  errors: ErrorTracking
  logs: LogAggregation
  alerts: AlertConfiguration
  dashboards: DashboardConfig
}

export class ProductionMonitoring {
  constructor(private config: MonitoringConfig) {
    this.initializeMonitoring()
  }
  
  private initializeMonitoring() {
    this.setupPerformanceMonitoring()
    this.setupErrorTracking()
    this.setupLogAggregation()
    this.setupAlerts()
  }
  
  private setupPerformanceMonitoring() {
    // Sentry Performance Monitoring
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // Sample 10% of transactions
      profilesSampleRate: 0.1,
      
      beforeSend(event) {
        // Filter out development errors
        if (event.environment === 'development') {
          return null
        }
        
        // Scrub sensitive data
        return sanitizeEvent(event)
      },
      
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection()
      ]
    })
    
    // Custom metrics collection
    this.setupCustomMetrics()
  }
  
  private setupCustomMetrics() {
    // Business metrics
    const businessMetrics = new Map([
      ['customer_registrations', 0],
      ['work_orders_created', 0], 
      ['payments_processed', 0],
      ['api_calls_total', 0]
    ])
    
    // Performance metrics
    const performanceMetrics = new Map([
      ['page_load_time', []],
      ['api_response_time', []],
      ['database_query_time', []],
      ['cache_hit_rate', 0]
    ])
    
    // Collect and report metrics every minute
    setInterval(() => {
      this.reportMetrics({
        business: Object.fromEntries(businessMetrics),
        performance: this.calculatePerformanceStats(performanceMetrics)
      })
    }, 60000)
  }
  
  private setupErrorTracking() {
    // Global error handler
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error)
      Sentry.captureException(error)
      
      // Graceful shutdown
      setTimeout(() => process.exit(1), 1000)
    })
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason)
      Sentry.captureException(reason)
    })
  }
  
  private setupLogAggregation() {
    // Structured logging
    const logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'thorbis-business-os',
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version
      },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log' 
        })
      ]
    })
    
    // Log aggregation to external service
    if (process.env.DATADOG_API_KEY) {
      logger.add(new winston.transports.Http({
        host: 'http-intake.logs.datadoghq.com',
        path: `/v1/input/${process.env.DATADOG_API_KEY}`,
        ssl: true
      }))
    }
  }
  
  private setupAlerts() {
    // Define alert conditions
    const alertConditions = {
      highErrorRate: {
        condition: 'error_rate > 5%',
        duration: '5m',
        severity: 'critical',
        channels: ['slack', 'email', 'pagerduty']
      },
      
      slowResponse: {
        condition: 'avg_response_time > 2s',
        duration: '10m', 
        severity: 'warning',
        channels: ['slack']
      },
      
      highMemoryUsage: {
        condition: 'memory_usage > 80%',
        duration: '15m',
        severity: 'warning',
        channels: ['slack', 'email']
      },
      
      databaseConnectionIssues: {
        condition: 'db_connection_errors > 10',
        duration: '5m',
        severity: 'critical',
        channels: ['slack', 'email', 'pagerduty']
      }
    }
    
    // Register alerts with monitoring service
    this.registerAlerts(alertConditions)
  }
}
```

#### Health Check Implementation
```typescript
// Comprehensive health check system
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Record<string, CheckResult>
  timestamp: string
  version: string
  uptime: number
}

export class HealthChecker {
  private checks = new Map<string, HealthCheck>()
  
  constructor() {
    this.registerHealthChecks()
  }
  
  private registerHealthChecks() {
    // Database connectivity
    this.checks.set('database', {
      name: 'Database Connection',
      check: async () => {
        const start = Date.now()
        try {
          const { error } = await supabase.from('businesses').select('count').limit(1)
          const duration = Date.now() - start
          
          if (error) throw error
          
          return {
            status: 'healthy',
            responseTime: duration,
            message: 'Database connection successful'
          }
        } catch (error) {
          return {
            status: 'unhealthy',
            error: error.message,
            message: 'Database connection failed'
          }
        }
      }
    })
    
    // Redis cache
    this.checks.set('cache', {
      name: 'Redis Cache',
      check: async () => {
        try {
          const redis = new Redis(process.env.REDIS_URL)
          const start = Date.now()
          
          await redis.ping()
          const duration = Date.now() - start
          
          return {
            status: 'healthy',
            responseTime: duration,
            message: 'Cache connection successful'
          }
        } catch (error) {
          return {
            status: 'unhealthy',
            error: error.message,
            message: 'Cache connection failed'
          }
        }
      }
    })
    
    // External API dependencies
    this.checks.set('stripe', {
      name: 'Stripe API',
      check: async () => {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
          const start = Date.now()
          
          await stripe.charges.list({ limit: 1 })
          const duration = Date.now() - start
          
          return {
            status: 'healthy',
            responseTime: duration,
            message: 'Stripe API accessible'
          }
        } catch (error) {
          return {
            status: duration > 5000 ? 'degraded' : 'unhealthy',
            error: error.message,
            message: 'Stripe API issues'
          }
        }
      }
    })
    
    // Memory usage
    this.checks.set('memory', {
      name: 'Memory Usage',
      check: async () => {
        const usage = process.memoryUsage()
        const usedMB = Math.round(usage.rss / 1024 / 1024)
        const maxMB = 512 // Vercel function limit
        const percentUsed = (usedMB / maxMB) * 100
        
        return {
          status: percentUsed > 90 ? 'unhealthy' : 
                 percentUsed > 75 ? 'degraded' : 'healthy',
          memoryUsage: {
            used: usedMB,
            total: maxMB,
            percent: Math.round(percentUsed)
          },
          message: `Memory usage: ${usedMB}MB (${Math.round(percentUsed)}%)`
        }
      }
    })
  }
  
  async runHealthChecks(): Promise<HealthCheckResult> {
    const results = new Map<string, CheckResult>()
    
    // Run all checks in parallel with timeout
    const checkPromises = Array.from(this.checks.entries()).map(
      async ([name, check]) => {
        try {
          const result = await Promise.race([
            check.check(),
            new Promise<CheckResult>((_, reject) => 
              setTimeout(() => reject(new Error('Health check timeout')), 10000)
            )
          ])
          
          results.set(name, result)
        } catch (error) {
          results.set(name, {
            status: 'unhealthy',
            error: error.message,
            message: `Health check failed: ${error.message}`
          })
        }
      }
    )
    
    await Promise.all(checkPromises)
    
    // Determine overall status
    const statuses = Array.from(results.values()).map(r => r.status)
    const overallStatus = statuses.includes('unhealthy') ? 'unhealthy' :
                         statuses.includes('degraded') ? 'degraded' : 'healthy'
    
    return {
      status: overallStatus,
      checks: Object.fromEntries(results),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || 'unknown',
      uptime: process.uptime()
    }
  }
}

// API endpoint for health checks
export async function GET() {
  const healthChecker = new HealthChecker()
  const result = await healthChecker.runHealthChecks()
  
  const status = result.status === 'healthy' ? 200 : 
                result.status === 'degraded' ? 200 : 503
  
  return Response.json(result, { status })
}
```

## Security in Production

### Production Security Configuration

#### Security Headers and Middleware
```typescript
// Production security middleware
export function securityMiddleware() {
  return async function middleware(request: NextRequest) {
    const response = NextResponse.next()
    
    // Security headers for production
    if (process.env.NODE_ENV === 'production') {
      // Strict Transport Security
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      )
      
      // Content Security Policy
      response.headers.set(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
          "frame-ancestors 'none'",
        ].join('; ')
      )
      
      // Additional security headers
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    }
    
    return response
  }
}

// Rate limiting for production
export class ProductionRateLimiter {
  private redis = new Redis(process.env.REDIS_URL)
  
  async checkRateLimit(
    identifier: string,
    windowMs: number,
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${identifier}`
    const window = Math.floor(Date.now() / windowMs)
    const windowKey = `${key}:${window}`
    
    const pipeline = this.redis.pipeline()
    pipeline.incr(windowKey)
    pipeline.expire(windowKey, Math.ceil(windowMs / 1000))
    
    const results = await pipeline.exec()
    const requests = results?.[0]?.[1] as number || 0
    
    const remaining = Math.max(0, maxRequests - requests)
    const resetTime = (window + 1) * windowMs
    
    return {
      allowed: requests <= maxRequests,
      remaining,
      resetTime
    }
  }
}
```

### SSL/TLS and Certificate Management

#### Automated Certificate Management
```typescript
// SSL/TLS configuration for production
export const sslConfig = {
  // Vercel automatically handles SSL certificates
  // But we need to ensure proper configuration
  
  // Redirect HTTP to HTTPS in production
  redirects: [
    {
      source: '/:path*',
      has: [
        {
          type: 'header',
          key: 'x-forwarded-proto',
          value: 'http'
        }
      ],
      destination: 'https://thorbis.com/:path*',
      permanent: true
    }
  ],
  
  // HSTS configuration
  headers: [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload'
        }
      ]
    }
  ]
}

// Certificate monitoring
export class CertificateMonitor {
  async checkCertificateExpiry(domain: string): Promise<CertificateStatus> {
    try {
      const response = await fetch(`https://${domain}`, { 
        method: 'HEAD',
        timeout: 10000
      })
      
      // Check certificate from response headers or use external service
      const cert = await this.getCertificateInfo(domain)
      
      const daysUntilExpiry = Math.floor(
        (cert.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      
      return {
        domain,
        isValid: cert.isValid,
        expiryDate: cert.expiryDate,
        daysUntilExpiry,
        issuer: cert.issuer,
        status: daysUntilExpiry < 30 ? 'warning' : 'ok'
      }
    } catch (error) {
      return {
        domain,
        isValid: false,
        error: error.message,
        status: 'error'
      }
    }
  }
  
  async monitorAllDomains(): Promise<void> {
    const domains = [
      'thorbis.com',
      'www.thorbis.com',
      'api.thorbis.com',
      'staging.thorbis.com'
    ]
    
    const results = await Promise.all(
      domains.map(domain => this.checkCertificateExpiry(domain))
    )
    
    // Alert on certificates expiring soon
    const expiringSoon = results.filter(
      result => result.status === 'warning' || result.status === 'error'
    )
    
    if (expiringSoon.length > 0) {
      await this.sendCertificateAlert(expiringSoon)
    }
  }
}
```

## Backup and Recovery

### Automated Backup Strategy

#### Database Backup System
```bash
#!/bin/bash
# scripts/backup-production.sh

set -e

echo "📦 Starting production backup process..."

# Configuration
BACKUP_DIR="/var/backups/thorbis"
S3_BUCKET="thorbis-backups"
RETENTION_DAYS=30
ENCRYPTION_KEY_FILE="/etc/thorbis/backup.key"

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="thorbis_production_${TIMESTAMP}"

# Database backup
echo "🗄️ Creating database backup..."
pg_dump $PRODUCTION_DATABASE_URL | gzip > "${BACKUP_DIR}/${BACKUP_NAME}_db.sql.gz"

# File storage backup (if using local storage)
if [ -d "/var/uploads" ]; then
  echo "📁 Creating file storage backup..."
  tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_files.tar.gz" /var/uploads
fi

# Encrypt backups
echo "🔐 Encrypting backups..."
for file in "${BACKUP_DIR}/${BACKUP_NAME}"*; do
  if [ -f "$file" ]; then
    gpg --cipher-algo AES256 --compress-algo 1 --s2k-mode 3 \
        --s2k-digest-algo SHA512 --s2k-count 65536 \
        --symmetric --output "${file}.gpg" \
        --batch --passphrase-file "$ENCRYPTION_KEY_FILE" "$file"
    
    # Remove unencrypted file
    rm "$file"
  fi
done

# Upload to S3
echo "☁️ Uploading to S3..."
aws s3 cp "${BACKUP_DIR}/" "s3://${S3_BUCKET}/$(date +%Y/%m/%d)/" \
  --recursive --exclude "*" --include "${BACKUP_NAME}*"

# Verify backup integrity
echo "🔍 Verifying backup integrity..."
for backup in "${BACKUP_DIR}/${BACKUP_NAME}"*.gpg; do
  if [ -f "$backup" ]; then
    gpg --batch --passphrase-file "$ENCRYPTION_KEY_FILE" \
        --decrypt "$backup" | head -1 > /dev/null
    
    if [ $? -eq 0 ]; then
      echo "✅ Backup verified: $(basename "$backup")"
    else
      echo "❌ Backup verification failed: $(basename "$backup")"
      exit 1
    fi
  fi
done

# Cleanup old local backups
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "thorbis_production_*" -mtime +3 -delete

# Cleanup old S3 backups
aws s3api list-objects-v2 --bucket $S3_BUCKET \
  --query "Contents[?LastModified<=\`$(date -d "${RETENTION_DAYS} days ago" -Idate)\`].Key" \
  --output text | xargs -I {} aws s3 rm "s3://${S3_BUCKET}/{}"

echo "✅ Backup process completed successfully"

# Log backup completion
logger "Thorbis production backup completed: ${BACKUP_NAME}"

# Notify monitoring system
curl -X POST "${MONITORING_WEBHOOK}" \
  -H "Content-Type: application/json" \
  -d "{\"event\": \"backup_completed\", \"backup\": \"${BACKUP_NAME}\"}"
```

## Disaster Recovery Plan

### Recovery Procedures

#### Complete System Recovery
```bash
#!/bin/bash
# scripts/disaster-recovery.sh

set -e

echo "🚨 Starting disaster recovery process..."

# Validate parameters
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <backup-date> <recovery-level>"
  echo "Recovery levels: database-only, full-restore, partial"
  exit 1
fi

BACKUP_DATE=$1
RECOVERY_LEVEL=$2
S3_BUCKET="thorbis-backups"
RECOVERY_DIR="/tmp/thorbis-recovery"

# Create recovery directory
mkdir -p $RECOVERY_DIR

# Download backups from S3
echo "📥 Downloading backups for date: $BACKUP_DATE"
aws s3 sync "s3://${S3_BUCKET}/${BACKUP_DATE}/" $RECOVERY_DIR

# Decrypt backups
echo "🔐 Decrypting backups..."
for encrypted_file in "${RECOVERY_DIR}"/*.gpg; do
  if [ -f "$encrypted_file" ]; then
    decrypted_file="${encrypted_file%.gpg}"
    gpg --batch --passphrase-file /etc/thorbis/backup.key \
        --decrypt "$encrypted_file" > "$decrypted_file"
    echo "✅ Decrypted: $(basename "$decrypted_file")"
  fi
done

if [ "$RECOVERY_LEVEL" = "database-only" ] || [ "$RECOVERY_LEVEL" = "full-restore" ]; then
  echo "🗄️ Restoring database..."
  
  # Create new database if needed
  createdb thorbis_recovery || true
  
  # Restore from backup
  gunzip < "${RECOVERY_DIR}"/thorbis_production_*_db.sql.gz | \
    psql $RECOVERY_DATABASE_URL
  
  echo "✅ Database restored successfully"
fi

if [ "$RECOVERY_LEVEL" = "full-restore" ]; then
  echo "📁 Restoring file storage..."
  
  # Extract files
  tar -xzf "${RECOVERY_DIR}"/thorbis_production_*_files.tar.gz -C /
  
  echo "✅ File storage restored successfully"
fi

# Verify restoration
echo "🔍 Verifying restoration..."

# Test database connectivity
psql $RECOVERY_DATABASE_URL -c "SELECT COUNT(*) FROM businesses;" > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Database connectivity verified"
else
  echo "❌ Database connectivity failed"
  exit 1
fi

# Test application startup
echo "🚀 Testing application startup..."
NODE_ENV=production npm run build
if [ $? -eq 0 ]; then
  echo "✅ Application build successful"
else
  echo "❌ Application build failed"
  exit 1
fi

# Run smoke tests
echo "🧪 Running smoke tests..."
npm run test:smoke:recovery
if [ $? -eq 0 ]; then
  echo "✅ Smoke tests passed"
else
  echo "❌ Smoke tests failed"
  exit 1
fi

echo "🎉 Disaster recovery completed successfully!"

# Cleanup recovery files
rm -rf $RECOVERY_DIR

# Notify team
if [ -n "$SLACK_WEBHOOK" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 Disaster recovery completed for backup date: $BACKUP_DATE\"}" \
    $SLACK_WEBHOOK
fi
```

## Next Steps

After mastering deployment strategies:

1. **Operations Management**: Learn ongoing operational procedures and maintenance
2. **Advanced Monitoring**: Implement comprehensive observability and alerting
3. **Scaling Strategies**: Plan for horizontal and vertical scaling
4. **Security Hardening**: Advanced security measures and compliance

## Deployment Resources

### Tools and Services
- **Vercel Platform**: Deployment, edge network, and serverless functions
- **GitHub Actions**: CI/CD automation and workflow management
- **Monitoring Tools**: Sentry, DataDog, New Relic for observability
- **Backup Services**: AWS S3, automated backup solutions

### Documentation References
- **Vercel Documentation**: Platform-specific deployment guides
- **Next.js Deployment**: Production optimization and best practices
- **Database Management**: Supabase production deployment guide
- **Security Hardening**: Production security configuration guide

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Performance Optimization](./07-performance-optimization.md) | Next: [Operations Documentation](../operations/README.md)*